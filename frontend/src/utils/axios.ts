
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/store/useAuthStore";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface ApiResponse<T> {
  data: T;
}

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

const refreshApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

function setAccessTokenCookie(token: string) {
  const secure =
    window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie =
    `auth-token=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secure}`;
}

function clearAccessTokenCookie() {
  document.cookie =
    "auth-token=; Path=/; Max-Age=0; SameSite=Lax";
}

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();

  if (!refreshToken) {
    throw new Error("Refresh token is unavailable.");
  }

  const response = await refreshApi.post<
    ApiResponse<AuthTokens> | AuthTokens
  >("/auth/refresh", {
    refreshToken,
  });

  const tokens =
    "data" in response.data
      ? response.data.data
      : response.data;

  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error("Invalid refresh token response.");
  }

  useAuthStore.setState({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    isAuthenticated: true,
  });

  setAccessTokenCookie(tokens.accessToken);

  return tokens.accessToken;
}

// Attach access token to every browser request.
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  return config;
});

// Automatically refresh expired access tokens.
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryConfig
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const excludedEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/verify-otp",
      "/auth/resend-otp",
    ];

    if (
      excludedEndpoints.some((url) =>
        originalRequest.url?.includes(url),
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // All simultaneous 401 requests share one refresh call.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.set(
        "Authorization",
        `Bearer ${newAccessToken}`,
      );

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      clearAccessTokenCookie();

      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }

      return Promise.reject(refreshError);
    }
  },
);
