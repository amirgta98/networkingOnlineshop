import { SecuritySettingsState } from "../types/security.types";

export const INITIAL_SECURITY_SETTINGS: SecuritySettingsState = {
  twoFactorEnabled: false,
  hasPasswordSet: false,
  activeSessions: [
    {
      id: "ses-current",
      deviceName: "دستگاه جاری",
      browser: "مرورگر وب",
      os: "سیستم‌عامل کاربر",
      ipAddress: "نشست فعال",
      location: "ایران",
      isCurrent: true,
      lastActive: "هم‌اکنون فعال",
    },
  ],
  loginHistory: [],
};
