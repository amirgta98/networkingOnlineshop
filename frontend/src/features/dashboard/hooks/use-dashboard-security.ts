"use client";

import * as React from "react";
import { SecuritySettingsState, ActiveSession, LoginLogEntry } from "../types/security.types";
import { INITIAL_SECURITY_SETTINGS } from "../data/mock-security";
import { apiClient } from "@/shared/lib/api-client";

export function useDashboardSecurity() {
  const [securityState, setSecurityState] = React.useState<SecuritySettingsState>(INITIAL_SECURITY_SETTINGS);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const fetchSecurity = React.useCallback(async () => {
    try {
      const [sessRes, logsRes] = await Promise.allSettled([
        apiClient.get<any[]>("/security/sessions", { timeout: 8000 }),
        apiClient.get<any[]>("/security/audit-logs?limit=5", { timeout: 8000 }),
      ]);

      let sessions: ActiveSession[] = [];
      if (sessRes.status === "fulfilled" && Array.isArray(sessRes.value) && sessRes.value.length > 0) {
        sessions = sessRes.value.map((s, idx) => ({
          id: s.id,
          deviceName: s.device || s.adminName || "مرورگر دسکتاپ",
          browser: "Chrome / Web",
          os: "ویندوز",
          ipAddress: s.ip || "127.0.0.1",
          location: "تهران، ایران",
          isCurrent: idx === 0 || !!s.isCurrent,
          lastActive: s.loginAt || "هم‌اکنون",
        }));
      } else {
        sessions = [
          {
            id: "current",
            deviceName: "مرورگر وب جاری",
            browser: "Chrome",
            os: "ویندوز",
            ipAddress: "127.0.0.1",
            location: "تهران، ایران",
            isCurrent: true,
            lastActive: "هم‌اکنون",
          },
        ];
      }

      let history: LoginLogEntry[] = [];
      if (logsRes.status === "fulfilled" && Array.isArray(logsRes.value)) {
        history = logsRes.value.map((l) => ({
          id: l.id,
          timestamp: l.timestamp ? new Date(l.timestamp).toLocaleDateString("fa-IR") : "هم‌اکنون",
          ipAddress: l.ip || "127.0.0.1",
          device: l.action || "ورود به حساب کاربری",
          location: "ایران",
          status: "success",
          statusLabel: "موفق",
        }));
      }

      setSecurityState((prev) => ({
        ...prev,
        activeSessions: sessions,
        loginHistory: history,
      }));
    } catch (err) {
      console.warn("[useDashboardSecurity] Backend fetch failed:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    void fetchSecurity();
  }, [fetchSecurity]);

  const updateTwoFactor = (enabled: boolean, pin?: string) => {
    setSecurityState((prev) => ({
      ...prev,
      twoFactorEnabled: enabled,
      twoFactorPin: pin || prev.twoFactorPin,
    }));
  };

  const terminateOtherSessions = async () => {
    const others = securityState.activeSessions.filter((s) => !s.isCurrent);
    await Promise.allSettled(others.map((s) => apiClient.delete(`/security/sessions/${s.id}`)));
    await fetchSecurity();
  };

  const terminateSingleSession = async (sessionId: string) => {
    try {
      await apiClient.delete(`/security/sessions/${sessionId}`);
    } catch {
      // ignore
    }
    await fetchSecurity();
  };

  return {
    securityState,
    isLoaded,
    updateTwoFactor,
    terminateOtherSessions,
    terminateSingleSession,
  };
}
