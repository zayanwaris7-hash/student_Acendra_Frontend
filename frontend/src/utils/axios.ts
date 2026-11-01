import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/store/useAuthStore";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

export const refreshApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

let refreshPromise: Promise<boolean> | null = null;

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/verify-otp",
  "/auth/resend-otp",
];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;

  return AUTH_ENDPOINTS.some((endpoint) => {
    const normalizedUrl = url.split("?")[0].replace(/\/+$/, "");
    return normalizedUrl.endsWith(endpoint);
  });
}

// Attach the current access token to browser requests.
api.interceptors.request.use(
  (config) => {
    // Zustand's persisted browser state is not available during SSR.
    if (typeof window === "undefined") {
      return config;
    }

    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    } else {
      config.headers.delete("Authorization");
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Refresh expired tokens and retry failed requests.
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    // Only handle unauthorized responses.
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Do not access browser authentication state during SSR.
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    // Never refresh when the authentication endpoint itself fails.
    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    const authStore = useAuthStore.getState();

    // No access token means there is no authenticated request to refresh.
    if (!authStore.accessToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Share one refresh operation across simultaneous 401 responses.
      if (!refreshPromise) {
        refreshPromise = useAuthStore
          .getState()
          .refreshTokens()
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshSucceeded = await refreshPromise;

      if (!refreshSucceeded) {
        return Promise.reject(error);
      }

      // Read the latest token after refresh has completed.
      const newAccessToken = useAuthStore.getState().accessToken;

      if (!newAccessToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      // Retry the original request with the new token.
      originalRequest.headers.set(
        "Authorization",
        `Bearer ${newAccessToken}`,
      );

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();

      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }

      return Promise.reject(refreshError);
    }
  },
);