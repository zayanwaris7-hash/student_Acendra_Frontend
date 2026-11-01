
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/utils/axios";
import { handleError } from "@/errors/handleError";
import { catchStoreErrorHandler } from "@/errors/catchStoreErrorHandler";
import { ApiResponse, AuthStore, AuthTokens, RegisterResponse, ResendOtpResponse, VerifyOtpResponse } from "@/types/authTypes";



function setAccessTokenCookie(token: string): void {
    if (typeof document === "undefined") return;

    document.cookie =
        `auth-token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
}

function clearAccessTokenCookie(): void {
    if (typeof document === "undefined") return;

    document.cookie =
        "auth-token=; Path=/; Max-Age=0; SameSite=Lax";
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
            // POST /auth/register
            // ==========================================

            register: async (payload) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await api.post<
                        ApiResponse<RegisterResponse>
                    >("/auth/register", payload);

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
            // POST /auth/verify-otp
            // ==========================================

            verifyOtp: async (payload) => {
                set({ isLoading: true, error: null });

                try {
                    await api.post<ApiResponse<VerifyOtpResponse>>(
                        "/auth/verify-otp",
                        payload
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
            // POST /auth/resend-otp
            // ==========================================

            resendOtp: async (payload) => {
                set({ isLoading: true, error: null });

                try {
                    await api.post<ApiResponse<ResendOtpResponse>>(
                        "/auth/resend-otp",
                        payload
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
            // POST /auth/login
            // ==========================================

            login: async ({ email, password }) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await api.post<
                        ApiResponse<AuthTokens>
                    >("/auth/login", {
                        email,
                        password,
                    });

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
            // POST /auth/refresh
            // ==========================================

            refreshTokens: async () => {
                const currentRefreshToken = get().refreshToken;

                if (!currentRefreshToken) {
                    get().logout();
                    return false;
                }

                try {
                    const response = await api.post<
                        ApiResponse<AuthTokens>
                    >("/auth/refresh", {
                        refreshToken: currentRefreshToken,
                    });

                    const tokens = response.data.data;

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

            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),

            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);