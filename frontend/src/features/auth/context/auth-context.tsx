"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type {
  AuthChallenge,
  AuthSession,
  AuthStep,
  AuthUser,
  UserRole,
} from "../types";
import { authApi } from "../api/auth-api";
import { MOCK_USER_RECORDS } from "../api/mock-users";

export interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
  step: AuthStep;
  challenge: AuthChallenge | null;
  twoFactorTicket: string | null;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isCustomer: boolean;
  currentRole: UserRole | null;

  // Actions
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  verifyTwoFactor: (pinOrCode: string) => Promise<boolean>;
  resendOtp: () => Promise<boolean>;
  setStep: (step: AuthStep) => void;
  resetFlow: () => void;
  logout: () => Promise<void>;
  loginWithDemoAccount: (phone: string, targetRedirect?: string) => Promise<void>;
  getRedirectUrlForRole: (role?: UserRole) => string;
  toggleTwoFactor: (enabled: boolean, pin?: string) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [status, setStatus] = React.useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [step, setStep] = React.useState<AuthStep>("phone");
  const [challenge, setChallenge] = React.useState<AuthChallenge | null>(null);
  const [twoFactorTicket, setTwoFactorTicket] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Rehydrate session from storage on mount
  React.useEffect(() => {
    try {
      const existing = authApi.getSession();
      if (existing) {
        setSession(existing);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    } catch {
      setStatus("unauthenticated");
    }
  }, []);

  const getRedirectUrlForRole = React.useCallback((role?: UserRole): string => {
    const userRole = role || session?.user.role;
    switch (userRole) {
      case "admin":
        return "/admin";
      case "partner":
        return "/partner";
      case "customer":
      default:
        return "/dashboard";
    }
  }, [session]);

  const resetFlow = React.useCallback(() => {
    setStep("phone");
    setChallenge(null);
    setTwoFactorTicket(null);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * STEP 1: Send 5-digit OTP
   */
  const sendOtp = React.useCallback(async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.sendOtp({ phone });
      setChallenge({
        ticket: res.challengeTicket,
        phone,
        maskedPhone: res.maskedPhone,
        expiresAt: Date.now() + res.expiresInSeconds * 1000,
        hasTwoFactor: res.hasTwoFactor,
        devCode: res.devCode,
      });
      setStep("otp");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ارسال پیامک کد تایید";
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Resend OTP to the current phone
   */
  const resendOtp = React.useCallback(async (): Promise<boolean> => {
    if (!challenge?.phone) return false;
    return sendOtp(challenge.phone);
  }, [challenge, sendOtp]);

  /**
   * STEP 2: Verify 5-digit OTP
   */
  const verifyOtp = React.useCallback(async (code: string): Promise<boolean> => {
    if (!challenge) {
      setError("درخواست نامعتبر است. لطفاً شماره خود را مجدداً وارد نمایید.");
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.verifyOtp({
        challengeTicket: challenge.ticket,
        code,
      });

      if (res.requiresTwoFactor && res.twoFactorTicket) {
        // Transition to STEP 3: 2FA Layer!
        setTwoFactorTicket(res.twoFactorTicket);
        setStep("2fa");
        return true;
      }

      if (res.session) {
        // Direct login completed
        setSession(res.session);
        setStatus("authenticated");
        setStep("success");
        return true;
      }

      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "کد تایید نادرست است";
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [challenge]);

  /**
   * STEP 3: Verify Two-Factor Authentication
   */
  const verifyTwoFactor = React.useCallback(async (pinOrCode: string): Promise<boolean> => {
    if (!twoFactorTicket) {
      setError("جلسه تایید دو مرحله‌ای منقضی شده است.");
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.verifyTwoFactor({
        twoFactorTicket,
        codeOrPassword: pinOrCode,
      });

      if (res.session) {
        setSession(res.session);
        setStatus("authenticated");
        setStep("success");
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "رمز دو مرحله‌ای نادرست است";
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [twoFactorTicket]);

  /**
   * Logout
   */
  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setSession(null);
      setStatus("unauthenticated");
      resetFlow();
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [resetFlow, router]);

  /**
   * Direct switch to a demo account (for developer / reviewer convenience)
   */
  const loginWithDemoAccount = React.useCallback(async (phone: string, targetRedirect?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const record = MOCK_USER_RECORDS[phone];
      if (!record) throw new Error("کاربر یافت نشد");
      const newSession = authApi.switchMockSession(phone);
      setSession(newSession);
      setStatus("authenticated");
      setStep("success");

      const destination = targetRedirect || getRedirectUrlForRole(newSession.user.role);
      router.push(destination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ورود آزمایشی";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [getRedirectUrlForRole, router]);

  /**
   * Toggles 2FA setting in panel
   */
  const toggleTwoFactor = React.useCallback(async (enabled: boolean, pin?: string): Promise<boolean> => {
    if (!session?.user?.phone) return false;
    setIsLoading(true);
    try {
      await authApi.updateUserTwoFactor(session.user.phone, enabled, pin);
      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          user: {
            ...prev.user,
            twoFactorEnabled: enabled,
          },
        };
      });
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const user = session?.user || null;
  const isAuthenticated = status === "authenticated" && !!user;
  const isAdmin = user?.role === "admin";
  const isPartner = user?.role === "partner";
  const isCustomer = user?.role === "customer";
  const currentRole = user?.role || null;

  const value: AuthContextType = {
    user,
    session,
    status,
    step,
    challenge,
    twoFactorTicket,
    error,
    isLoading,
    isAuthenticated,
    isAdmin,
    isPartner,
    isCustomer,
    currentRole,
    sendOtp,
    verifyOtp,
    verifyTwoFactor,
    resendOtp,
    setStep,
    resetFlow,
    logout,
    loginWithDemoAccount,
    getRedirectUrlForRole,
    toggleTwoFactor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
