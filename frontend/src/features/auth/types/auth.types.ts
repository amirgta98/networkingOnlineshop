/**
 * User Roles in the Velox Network Equipment Platform
 * - customer: Standard retail buyer (کاربر عادی)
 * - partner: B2B corporate client / organization (پنل سازمانی یا همکاری)
 * - admin: System superadmin / website owner (ادمین یا صاحب وبسایت)
 */
export type UserRole = "customer" | "partner" | "admin";

export type TwoFactorMethod = "pin" | "totp" | "sms_fallback";

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod;
  email?: string;
  avatarUrl?: string;
  // B2B Partner specific fields
  companyName?: string;
  economicCode?: string;
  nationalId?: string;
  creditLimit?: number; // In Toman
  creditBalance?: number; // Available credit in Toman
  // Admin specific fields
  adminLevel?: "owner" | "superadmin" | "technical";
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in ms
  user: AuthUser;
}

export type AuthStep = "phone" | "otp" | "2fa" | "success";

export interface AuthChallenge {
  ticket: string;
  phone: string;
  maskedPhone: string;
  expiresAt: number;
  hasTwoFactor: boolean;
  twoFactorType?: TwoFactorMethod;
  devCode?: string; // Provided in dev/mock mode for fast testing
}
