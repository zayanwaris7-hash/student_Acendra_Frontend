import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { api, refreshApi } from "@/utils/axios";
import { handleError } from "@/errors/handleError";
import { catchStoreErrorHandler } from "@/errors/catchStoreErrorHandler";
import {
  ApiResponse,
  AuthStore,
  AuthTokens,
  RegisterResponse,
  ResendOtpResponse,
  VerifyOtpResponse,
} from "@/types/authTypes";

function setAccessTokenCookie(token: string): void {
  if (typeof document === "undefined") return;

  const secure =
    window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `auth-token=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secure}`;
}

function clearAccessTokenCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = "auth-token=; Path=/; Max-Age=0; SameSite=Lax";
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,

      isAuthenticated: false,
      isLoading: false,
      error: null,
      hydrated: false,

      setHydrated: (value) => {
        set({ hydrated: value });
      },

      // ==========================================
      // REGISTER
      // ==========================================

      register: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<ApiResponse<RegisterResponse>>(
            "/auth/register",
            payload,
          );

          return response.data.data;
        } catch (error: unknown) {
          handleError(error, "Registration Failed");
          catchStoreErrorHandler(set, error);

          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==========================================
      // VERIFY OTP
      // ==========================================

      verifyOtp: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          await api.post<ApiResponse<VerifyOtpResponse>>(
            "/auth/verify-otp",
            payload,
          );

          return true;
        } catch (error: unknown) {
          handleError(error, "OTP Verification Failed");
          catchStoreErrorHandler(set, error);

          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==========================================
      // RESEND OTP
      // ==========================================

      resendOtp: async (payload) => {
        set({ isLoading: true, error: null });

        try {
          await api.post<ApiResponse<ResendOtpResponse>>(
            "/auth/resend-otp",
            payload,
          );

          return true;
        } catch (error: unknown) {
          handleError(error, "Resending OTP Failed");
          catchStoreErrorHandler(set, error);

          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==========================================
      // LOGIN
      // ==========================================

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post<ApiResponse<AuthTokens>>(
            "/auth/login",
            {
              email,
              password,
            },
          );

          const tokens = response.data.data;

          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            error: null,
          });

          setAccessTokenCookie(tokens.accessToken);

          return true;
        } catch (error: unknown) {
          handleError(error, "Login Failed");
          catchStoreErrorHandler(set, error);

          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // ==========================================
      // REFRESH TOKENS
      // ==========================================

      refreshTokens: async () => {
        const currentRefreshToken = get().refreshToken;

        if (!currentRefreshToken) {
          get().logout();
          return false;
        }

        try {
          // Using refreshApi here prevents interceptor recursion
          const response = await refreshApi.post<
            ApiResponse<AuthTokens> | AuthTokens
          >("/auth/refresh", {
            refreshToken: currentRefreshToken,
          });

          const tokens =
            "data" in response.data
              ? response.data.data
              : response.data;

          if (!tokens?.accessToken || !tokens?.refreshToken) {
            throw new Error("Invalid token response");
          }

          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
          });

          setAccessTokenCookie(tokens.accessToken);

          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      // ==========================================
      // LOGOUT
      // ==========================================

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        clearAccessTokenCookie();
      },
    }),

  {
      name: "acendra-auth-storage",
      storage: createJSONStorage(() => 
        typeof window !== "undefined" ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  ),
);