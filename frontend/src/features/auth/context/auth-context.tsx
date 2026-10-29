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
import { resolveAuthRedirect } from "../types";
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
  getRedirectUrlForRole: (role?: UserRole | string, targetRedirect?: string | null) => string;
  toggleTwoFactor: (enabled: boolean, pin?: string) => Promise<boolean>;
  updateAuthUser: (partial: Partial<AuthUser>) => void;
  refreshUser: () => Promise<AuthUser | null>;
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

  // Rehydrate session from storage and verify with backend on mount
  React.useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const existing = authApi.getSession();
        if (existing) {
          setSession(existing);
          setStatus("authenticated");
        }

        // Validate session with backend /auth/me only when token or cookie exists
        const hasCookie = typeof document !== "undefined" && document.cookie.includes("velox_session_token");
        let remoteUser: AuthUser | null = null;
        if (existing?.accessToken || hasCookie) {
          remoteUser = await authApi.getMe();
        }
        if (!isMounted) return;

        if (remoteUser) {
          const normRole = (remoteUser.role as string || "").toLowerCase();
          const cleanRole: UserRole = (normRole === "partner_b2b" || normRole === "partner")
            ? "partner"
            : (normRole === "super_admin" || normRole === "staff_manager")
            ? "admin"
            : (remoteUser.role || "customer");
          const normalizedRemoteUser: AuthUser = { ...remoteUser, role: cleanRole };

          setSession((prev) => {
            const finalSession: AuthSession = prev
              ? { ...prev, user: normalizedRemoteUser }
              : {
                  accessToken: existing?.accessToken || "",
                  refreshToken: existing?.refreshToken || "",
                  expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
                  user: normalizedRemoteUser,
                };
            authApi.saveSession(finalSession);
            return finalSession;
          });
          setStatus("authenticated");
        } else if (existing && existing.user) {
          // Keep existing session in mock/dev mode
          setSession(existing);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch {
        if (isMounted) {
          const fallback = authApi.getSession();
          if (fallback?.user) {
            setSession(fallback);
            setStatus("authenticated");
          } else {
            setStatus("unauthenticated");
          }
        }
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize auth state across browser tabs when localStorage is updated
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "velox_auth_session") {
        const stored = authApi.getSession();
        if (stored) {
          setSession(stored);
          setStatus("authenticated");
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getRedirectUrlForRole = React.useCallback(
    (role?: UserRole | string, targetRedirect?: string | null): string => {
      const activeRole = role || session?.user.role;
      const isPartnerFlag = Boolean(session?.user?.isPartner);
      return resolveAuthRedirect(activeRole, targetRedirect, isPartnerFlag);
    },
    [session]
  );

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

      const destination = getRedirectUrlForRole(newSession.user.role, targetRedirect);
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

  const updateAuthUser = React.useCallback((partial: Partial<AuthUser>) => {
    setSession((prev) => {
      if (!prev) return null;
      const updatedUser = { ...prev.user, ...partial };
      const updatedSession = { ...prev, user: updatedUser };
      authApi.saveSession(updatedSession);
      return updatedSession;
    });
  }, []);

  const refreshUser = React.useCallback(async (): Promise<AuthUser | null> => {
    try {
      const hasCookie = typeof document !== "undefined" && document.cookie.includes("velox_session_token");
      const existing = authApi.getSession();
      if (!existing?.accessToken && !hasCookie) {
        return null;
      }
      const remoteUser = await authApi.getMe();
      if (remoteUser) {
        const normRole = (remoteUser.role as string || "").toLowerCase();
        const cleanRole: UserRole = (normRole === "partner_b2b" || normRole === "partner")
          ? "partner"
          : (normRole === "super_admin" || normRole === "staff_manager")
          ? "admin"
          : (remoteUser.role || "customer");
        const normalizedRemoteUser: AuthUser = { ...remoteUser, role: cleanRole };

        setSession((prev) => {
          const finalSession: AuthSession = prev
            ? { ...prev, user: normalizedRemoteUser }
            : {
                accessToken: existing?.accessToken || "",
                refreshToken: existing?.refreshToken || "",
                expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
                user: normalizedRemoteUser,
              };
          authApi.saveSession(finalSession);
          return finalSession;
        });
        setStatus("authenticated");
        return normalizedRemoteUser;
      } else if (existing?.user?.phone) {
        const mockRec = MOCK_USER_RECORDS[existing.user.phone];
        if (mockRec) {
          const updatedUser: AuthUser = {
            ...existing.user,
            canBuyInternet: mockRec.user.canBuyInternet,
          };
          const updatedSession: AuthSession = {
            ...existing,
            user: updatedUser,
          };
          setSession(updatedSession);
          authApi.saveSession(updatedSession);
          return updatedUser;
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const user = session?.user || null;
  const isAuthenticated = status === "authenticated" && !!user;
  const isPartnerUserFlag = Boolean(user?.isPartner || (user as any)?.partnerCode);
  const rawUserRole = (user?.role || "").toLowerCase().trim();
  const isAdmin = rawUserRole === "admin" || rawUserRole === "super_admin" || rawUserRole === "staff_manager";
  const isPartner = isPartnerUserFlag || rawUserRole === "partner" || rawUserRole === "partner_b2b";
  const isCustomer = !isAdmin && !isPartner;
  const currentRole = (isPartner ? "partner" : isAdmin ? "admin" : (user?.role || null)) as UserRole | null;

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
    updateAuthUser,
    refreshUser,
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
