import { UserLoginFormData } from "@/validator/login-user.validator";

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    tokenType: "Bearer";
    expiresIn: number;
}

export interface RegisterResponse {
    userId: string;
    email: string;
    isEmailVerified: boolean;
    verificationRequired: boolean;
    otpExpiresInSeconds: number;
}

export interface VerifyOtpResponse {
    success: boolean;
    message: string;
}

export interface ResendOtpResponse {
    otpExpiresInSeconds: number;
}

// ==================================================
// PAYLOAD TYPES
// ==================================================

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    username?: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
}

export interface ResendOtpPayload {
    email: string;
}

// ==================================================
// AUTH STORE
// ==================================================

export interface AuthStore {
    accessToken: string | null;
    refreshToken: string | null;

    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    hydrated: boolean;

    setHydrated: (value: boolean) => void;

    register: (
        payload: RegisterPayload
    ) => Promise<RegisterResponse | null>;

    verifyOtp: (
        payload: VerifyOtpPayload
    ) => Promise<boolean>;

    resendOtp: (
        payload: ResendOtpPayload
    ) => Promise<boolean>;

    login: (
        payload: UserLoginFormData
    ) => Promise<boolean>;

    refreshTokens: () => Promise<boolean>;

    logout: () => void;
}
