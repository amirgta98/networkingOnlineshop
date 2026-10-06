import type { AuthSession, AuthUser, TwoFactorMethod, UserRole } from "./auth.types";

/**
 * Step 1: Send OTP to phone number
 */
export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  challengeTicket: string;
  maskedPhone: string;
  hasTwoFactor: boolean;
  expiresInSeconds: number;
  devCode?: string; // 5-digit code in development
}

/**
 * Step 2: Verify 5-digit OTP
 */
export interface VerifyOtpRequest {
  challengeTicket: string;
  code: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  requiresTwoFactor: boolean;
  twoFactorTicket?: string;
  twoFactorType?: TwoFactorMethod;
  session?: AuthSession;
}

/**
 * Step 3: Verify 2FA (PIN / Password / TOTP)
 */
export interface Verify2FARequest {
  twoFactorTicket: string;
  codeOrPassword: string;
}

export interface Verify2FAResponse {
  success: boolean;
  message: string;
  session: AuthSession;
}

/**
 * Session token refresh
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  session: AuthSession;
}
