import type {
  AuthChallenge,
  AuthSession,
  AuthUser,
  SendOtpRequest,
  SendOtpResponse,
  Verify2FARequest,
  Verify2FAResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "../types";
import {
  MOCK_USER_RECORDS,
  isValidIranianMobile,
  maskPhone,
  normalizePhoneNumber,
} from "./mock-users";

const SESSION_STORAGE_KEY = "velox_auth_session";
const COOKIE_NAME = "velox_session_token";
const TWO_FACTOR_STORAGE_KEY = "velox_user_2fa_settings";

export function getStored2FAPreference(phone: string): { enabled?: boolean; pin?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TWO_FACTOR_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[phone] || null;
  } catch {
    return null;
  }
}

export function saveStored2FAPreference(phone: string, enabled: boolean, pin?: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TWO_FACTOR_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[phone] = { enabled, pin: pin || "123456" };
    localStorage.setItem(TWO_FACTOR_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save 2FA preference:", e);
  }
}

// In-memory challenge store for the current session (simulating redis/cache)
interface ActiveChallenge {
  ticket: string;
  phone: string;
  code: string; // 5-digit OTP
  expiresAt: number;
  userRecord?: (typeof MOCK_USER_RECORDS)[string];
}

interface ActiveTwoFactorTicket {
  twoFactorTicket: string;
  phone: string;
  userRecord: (typeof MOCK_USER_RECORDS)[string];
  expiresAt: number;
}

const activeChallenges = new Map<string, ActiveChallenge>();
const activeTwoFactorTickets = new Map<string, ActiveTwoFactorTicket>();

// Simulated artificial delay for realistic UX
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates a mock JWT-like string
 */
function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa("velox_mock_sig_" + Date.now());
  return `${header}.${body}.${signature}`;
}

/**
 * Creates a valid session object for a given user
 */
function buildSession(user: AuthUser): AuthSession {
  const now = Date.now();
  const expiresInMs = 7 * 24 * 60 * 60 * 1000; // 7 days

  return {
    accessToken: createMockJwt({ sub: user.id, role: user.role, iat: now }),
    refreshToken: createMockJwt({ sub: user.id, type: "refresh", iat: now }),
    expiresAt: now + expiresInMs,
    user,
  };
}

/**
 * Sets session cookie (accessible to client and middleware)
 */
function setSessionCookie(token: string) {
  if (typeof document === "undefined") return;
  // Cookie valid for 7 days
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Clears session cookie
 */
function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export const authApi = {
  /**
   * STEP 1: Send OTP to phone
   */
  async sendOtp(req: SendOtpRequest): Promise<SendOtpResponse> {
    await delay(350);

    const normalized = normalizePhoneNumber(req.phone);
    if (!isValidIranianMobile(normalized)) {
      throw new Error("شماره موبایل وارد شده معتبر نیست. لطفاً یک شماره ۱۱ رقمی معتبر با پیش‌شماره ۰۹ وارد کنید.");
    }

    // Check if user is known in mock records or create on the fly as standard customer
    let userRecord = MOCK_USER_RECORDS[normalized];
    if (!userRecord) {
      userRecord = {
        user: {
          id: `usr_b2c_${Date.now().toString(36)}`,
          phone: normalized,
          name: "کاربر جدید ققنوس آکادمی",
          role: "customer",
          twoFactorEnabled: false,
          createdAt: "امروز",
        },
        description: "کاربر عادی ثبت‌نام شده با پیامک",
        badgeLabel: "کاربر عادی جدید",
      };
    }

    // Check if user has explicitly enabled/disabled 2FA in their panel settings
    const storedPref = getStored2FAPreference(normalized);
    const has2FA = storedPref !== null ? !!storedPref.enabled : userRecord.user.twoFactorEnabled;

    // Clone user record with effective 2FA status
    const challengeUserRecord = {
      ...userRecord,
      user: {
        ...userRecord.user,
        twoFactorEnabled: has2FA,
      },
      twoFactorPin: storedPref?.pin || userRecord.twoFactorPin || "123456",
    };

    // Generate 5-digit OTP code (54321 for demo ease, or deterministic for convenience)
    // If it's one of the demo accounts, keep 54321 as an easy default, or random 5-digits
    const code = "54321";
    const ticket = `chg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiresInSeconds = 120; // 2 minutes

    activeChallenges.set(ticket, {
      ticket,
      phone: normalized,
      code,
      expiresAt: Date.now() + expiresInSeconds * 1000,
      userRecord: challengeUserRecord,
    });

    return {
      success: true,
      message: `کد تایید ۵ رقمی به شماره ${maskPhone(normalized)} پیامک شد.`,
      challengeTicket: ticket,
      maskedPhone: maskPhone(normalized),
      hasTwoFactor: has2FA,
      expiresInSeconds,
      devCode: code,
    };
  },

  /**
   * STEP 2: Verify 5-digit OTP
   */
  async verifyOtp(req: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    await delay(400);

    const challenge = activeChallenges.get(req.challengeTicket);
    if (!challenge) {
      throw new Error("درخواست منقضی شده یا نامعتبر است. لطفاً مجدداً شماره خود را وارد کنید.");
    }

    if (Date.now() > challenge.expiresAt) {
      activeChallenges.delete(req.challengeTicket);
      throw new Error("کد تایید ۵ رقمی منقضی شده است. لطفاً کد جدید دریافت کنید.");
    }

    if (req.code.trim() !== challenge.code && req.code.trim() !== "54321") {
      throw new Error("کد تایید ۵ رقمی وارد شده صحیح نیست. (کد تستی: ۵۴۳۲۱)");
    }

    // OTP is valid! Remove used challenge
    activeChallenges.delete(req.challengeTicket);

    const userRecord = challenge.userRecord!;

    // Check if account requires Step 3: Two-Factor Authentication (2FA)
    if (userRecord.user.twoFactorEnabled) {
      const twoFactorTicket = `2fa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      activeTwoFactorTickets.set(twoFactorTicket, {
        twoFactorTicket,
        phone: challenge.phone,
        userRecord,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes validity
      });

      return {
        success: true,
        message: "کد تایید پیامکی تایید شد. لطفاً تایید دو مرحله‌ای را وارد کنید.",
        requiresTwoFactor: true,
        twoFactorTicket,
        twoFactorType: userRecord.user.twoFactorMethod || "pin",
      };
    }

    // Direct Login without 2FA
    const session = buildSession(userRecord.user);
    authApi.saveSession(session);

    return {
      success: true,
      message: `خوش آمدید، ${userRecord.user.name}`,
      requiresTwoFactor: false,
      session,
    };
  },

  /**
   * STEP 3: Verify Two-Factor Authentication (PIN / Password / TOTP)
   */
  async verifyTwoFactor(req: Verify2FARequest): Promise<Verify2FAResponse> {
    await delay(450);

    const record = activeTwoFactorTickets.get(req.twoFactorTicket);
    if (!record) {
      throw new Error("جلسه تایید دو مرحله‌ای منقضی شده است. لطفاً مجدداً وارد شوید.");
    }

    if (Date.now() > record.expiresAt) {
      activeTwoFactorTickets.delete(req.twoFactorTicket);
      throw new Error("زمان تایید دو مرحله‌ای به پایان رسیده است.");
    }

    const expectedPin = record.userRecord.twoFactorPin;
    const provided = req.codeOrPassword.trim();

    // Verification check: accept user's designated PIN or default demo master pin "123456" / "999999"
    const isValid =
      provided === expectedPin ||
      provided === "123456" ||
      provided === "999999" ||
      provided === "admin123";

    if (!isValid) {
      throw new Error(`رمز دوم وارد شده اشتباه است. (رمز تستی: ${expectedPin || "123456"})`);
    }

    // Successfully verified!
    activeTwoFactorTickets.delete(req.twoFactorTicket);

    const session = buildSession(record.userRecord.user);
    authApi.saveSession(session);

    return {
      success: true,
      message: `احراز هویت دومرحله‌ای با موفقیت انجام شد. خوش آمدید، ${record.userRecord.user.name}`,
      session,
    };
  },

  /**
   * Retrieves active session from browser storage
   */
  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;

      const session: AuthSession = JSON.parse(stored);
      // Check if session expired
      if (session.expiresAt && Date.now() > session.expiresAt) {
        authApi.clearSession();
        return null;
      }
      return session;
    } catch {
      authApi.clearSession();
      return null;
    }
  },

  /**
   * Saves session to localStorage and sets cookie
   */
  saveSession(session: AuthSession) {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      setSessionCookie(session.accessToken);
    } catch (e) {
      console.error("Failed to save auth session:", e);
    }
  },

  /**
   * Clears session from localStorage and cookie
   */
  clearSession() {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      clearSessionCookie();
    } catch (e) {
      console.error("Failed to clear auth session:", e);
    }
  },

  /**
   * Updates 2FA status in user's panel/settings
   */
  async updateUserTwoFactor(phone: string, enabled: boolean, pin?: string): Promise<boolean> {
    await delay(200);
    const normalized = normalizePhoneNumber(phone);
    saveStored2FAPreference(normalized, enabled, pin);

    // Also update current active session if matching
    const currentSession = authApi.getSession();
    if (currentSession && normalizePhoneNumber(currentSession.user.phone) === normalized) {
      currentSession.user.twoFactorEnabled = enabled;
      authApi.saveSession(currentSession);
    }
    return true;
  },

  /**
   * Logs out user
   */
  async logout(): Promise<void> {
    await delay(150);
    authApi.clearSession();
  },

  /**
   * Helper for tests & demo switching
   */
  switchMockSession(phone: string): AuthSession {
    const record = MOCK_USER_RECORDS[phone];
    if (!record) {
      throw new Error("کاربر آزمایشی یافت نشد");
    }
    const session = buildSession(record.user);
    authApi.saveSession(session);
    return session;
  },
};
