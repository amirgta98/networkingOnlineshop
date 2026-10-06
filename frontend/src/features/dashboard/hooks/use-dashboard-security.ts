"use client";

import * as React from "react";
import { SecuritySettingsState } from "../types/security.types";
import { INITIAL_SECURITY_SETTINGS } from "../data/mock-security";

const SEC_KEY = "velox_dashboard_security_v1";

export function useDashboardSecurity() {
  const [securityState, setSecurityState] = React.useState<SecuritySettingsState>(INITIAL_SECURITY_SETTINGS);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(SEC_KEY);
      if (stored) setSecurityState(JSON.parse(stored));
      else {
        setSecurityState(INITIAL_SECURITY_SETTINGS);
        localStorage.setItem(SEC_KEY, JSON.stringify(INITIAL_SECURITY_SETTINGS));
      }
    } catch {
      setSecurityState(INITIAL_SECURITY_SETTINGS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveState = (updated: SecuritySettingsState) => {
    setSecurityState(updated);
    try {
      localStorage.setItem(SEC_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save security state", e);
    }
  };

  const updateTwoFactor = (enabled: boolean, pin?: string) => {
    const updated: SecuritySettingsState = {
      ...securityState,
      twoFactorEnabled: enabled,
      twoFactorPin: pin || securityState.twoFactorPin,
    };
    saveState(updated);
  };

  const terminateOtherSessions = () => {
    const updated: SecuritySettingsState = {
      ...securityState,
      activeSessions: securityState.activeSessions.filter((s) => s.isCurrent),
    };
    saveState(updated);
  };

  const terminateSingleSession = (sessionId: string) => {
    const updated: SecuritySettingsState = {
      ...securityState,
      activeSessions: securityState.activeSessions.filter((s) => s.id !== sessionId || s.isCurrent),
    };
    saveState(updated);
  };

  return {
    securityState,
    isLoaded,
    updateTwoFactor,
    terminateOtherSessions,
    terminateSingleSession,
  };
}
