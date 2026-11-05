"use client";

import * as React from "react";
import {
  PartnerApplicationData,
  PartnerApplicantType,
} from "../types/upgrade-partner.types";
import { INITIAL_PARTNER_APPLICATION } from "../data/mock-upgrade-partner";
import { upgradePartnerApi } from "../api/upgrade-partner-api";

export function useDashboardUpgradePartner() {
  const [application, setApplication] = React.useState<PartnerApplicationData | null>(null);
  const [isPartner, setIsPartner] = React.useState<boolean>(false);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchApplication = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await upgradePartnerApi.getMyApplication();
      if (response && response.application) {
        setApplication(response.application);
      } else {
        setApplication(null);
      }
      setIsPartner(Boolean(response?.isPartner));
    } catch (err: any) {
      console.warn("Failed to fetch partner application from backend, fallback state initialized:", err);
      // If error or unauthenticated, application remains null (meaning user can apply)
      setApplication(null);
      setError(err?.message || "خطا در دریافت وضعیت پرونده");
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const submitApplication = async (data: Partial<PartnerApplicationData>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let resultApp: PartnerApplicationData;
      if (data.applicantType === "COMPANY" || data.companyName) {
        const res = await upgradePartnerApi.upgradeRequest(data);
        resultApp = res.application;
      } else {
        resultApp = await upgradePartnerApi.submitApplication(data);
      }
      setApplication(resultApp);
      if (resultApp.status === "APPROVED") {
        setIsPartner(true);
      }
      return resultApp;
    } catch (err: any) {
      const msg = err?.message || "خطا در ارسال پرونده به سرور";
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFile = async (file: File) => {
    return upgradePartnerApi.uploadDocument(file);
  };

  return {
    application,
    isPartner,
    isLoaded,
    isLoading,
    isSubmitting,
    error,
    refresh: fetchApplication,
    submitApplication,
    uploadFile,
  };
}
