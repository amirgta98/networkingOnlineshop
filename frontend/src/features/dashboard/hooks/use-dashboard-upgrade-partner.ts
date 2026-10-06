"use client";

import * as React from "react";
import { PartnerApplicationData } from "../types/upgrade-partner.types";
import { INITIAL_PARTNER_APPLICATION } from "../data/mock-upgrade-partner";

const PARTNER_APP_KEY = "velox_dashboard_partner_app_v1";

export function useDashboardUpgradePartner() {
  const [application, setApplication] = React.useState<PartnerApplicationData>(INITIAL_PARTNER_APPLICATION);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(PARTNER_APP_KEY);
      if (stored) setApplication(JSON.parse(stored));
      else {
        setApplication(INITIAL_PARTNER_APPLICATION);
        localStorage.setItem(PARTNER_APP_KEY, JSON.stringify(INITIAL_PARTNER_APPLICATION));
      }
    } catch {
      setApplication(INITIAL_PARTNER_APPLICATION);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveApplication = (updated: PartnerApplicationData) => {
    setApplication(updated);
    try {
      localStorage.setItem(PARTNER_APP_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save partner application", e);
    }
  };

  const submitApplication = (data: Partial<PartnerApplicationData>) => {
    const updated: PartnerApplicationData = {
      ...application,
      ...data,
      status: "pending_verification",
      statusLabel: "درخواست ثبت شد - در نوبت ارزیابی مالی",
      submittedAt: "هم‌اکنون",
      reviewerNotes: "پرونده تشکیل شد. بررسی حقوقی ظرف ۴۸ ساعت کاری تکمیل خواهد شد.",
    };
    saveApplication(updated);
    return updated;
  };

  return {
    application,
    isLoaded,
    submitApplication,
  };
}
