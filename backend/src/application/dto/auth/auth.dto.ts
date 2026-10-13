export interface AuthUserOutputDto {
  id: string;
  phone: string;
  name: string;
  role: string;
  twoFactorEnabled: boolean;
  twoFactorMethod?: string;
  email?: string;
  createdAt: string;
}

export interface AuthSessionOutputDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUserOutputDto;
}

export interface RequestOtpCommand {
  phone: string;
  ipAddress?: string | null;
}

export interface RequestOtpResult {
  success: boolean;
  message: string;
  challengeTicket: string;
  maskedPhone: string;
  hasTwoFactor: boolean;
  expiresInSeconds: number;
  devCode?: string;
}

export interface VerifyOtpCommand {
  challengeTicket: string;
  code: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  requiresTwoFactor: boolean;
  twoFactorTicket?: string;
  twoFactorType?: string;
  session?: AuthSessionOutputDto;
}

export interface VerifyTwoFactorCommand {
  twoFactorTicket: string;
  codeOrPassword: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface VerifyTwoFactorResult {
  success: boolean;
  message: string;
  session: AuthSessionOutputDto;
}
