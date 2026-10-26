"use client";

import * as React from "react";
import { useAuth } from "@/features/auth";
import { Product } from "@/features/catalog/types";
import {
  AffiliatePublicSettings,
  AffiliatePartnerDto,
  AffiliateProfileResponse,
} from "../types/affiliate.types";
import { affiliateApi, DEFAULT_PUBLIC_SETTINGS } from "../api/affiliate-api";

interface AffiliateContextValue {
  settings: AffiliatePublicSettings;
  isLoadingSettings: boolean;
  isPartner: boolean;
  partnerProfile: AffiliatePartnerDto | null;
  effectiveDiscountPercent: number;
  effectiveStaticIpCommission: number;
  effectiveInternetCommission: number;
  partnerCode: string | null;
  isProductEligibleForAffiliateDiscount: (product: Product | {
    id?: string;
    sku?: string;
    name?: string;
    title?: string;
    category?: string;
    price?: number;
    originalPrice?: number;
    discountPercent?: number;
    tieredPricing?: any[];
  }) => boolean;
  calculateAffiliatePrice: (product: Product | {
    id?: string;
    sku?: string;
    name?: string;
    price?: number;
    originalPrice?: number;
    discountPercent?: number;
    tieredPricing?: any[];
    category?: string;
  }) => {
    isEligible: boolean;
    discountPercent: number;
    discountAmount: number;
    unitPriceAfterDiscount: number;
  };
  refresh: () => Promise<void>;
}

const AffiliateContext = React.createContext<AffiliateContextValue | null>(null);

export function AffiliateProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isPartner: isAuthPartner } = useAuth();
  const [settings, setSettings] = React.useState<AffiliatePublicSettings>(DEFAULT_PUBLIC_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = React.useState<boolean>(true);
  const [profileData, setProfileData] = React.useState<AffiliateProfileResponse | null>(null);

  const fetchPublicSettings = React.useCallback(async () => {
    try {
      const data = await affiliateApi.getPublicSettings();
      setSettings(data);
    } catch (err) {
      console.warn("Error fetching affiliate public settings", err);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  const fetchMyProfile = React.useCallback(async () => {
    if (!isAuthenticated) {
      setProfileData(null);
      return;
    }
    try {
      const prof = await affiliateApi.getMyProfile();
      setProfileData(prof);
    } catch {
      setProfileData(null);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    fetchPublicSettings();
  }, [fetchPublicSettings]);

  React.useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  const isPartner = Boolean(
    (profileData && profileData.isPartner) ||
    isAuthPartner ||
    (user && (user.role === "partner" || (user.role as string) === "partner_b2b"))
  );

  const partnerProfile = profileData?.partner || null;

  const effectiveDiscountPercent = isPartner
    ? (partnerProfile?.customDiscountPercent ??
       profileData?.effectiveDiscountPercent ??
       settings.defaultDiscountPercent ??
       8)
    : 0;

  const effectiveStaticIpCommission =
    partnerProfile?.customStaticIpCommission ??
    profileData?.effectiveStaticIpCommission ??
    settings.defaultStaticIpCommission ??
    150000;

  const effectiveInternetCommission =
    partnerProfile?.customInternetCommission ??
    profileData?.effectiveInternetCommission ??
    settings.defaultInternetCommission ??
    400000;

  const partnerCode = partnerProfile?.partnerCode || null;

  const isProductEligibleForAffiliateDiscount = React.useCallback(
    (product: Product | {
      id?: string;
      sku?: string;
      name?: string;
      title?: string;
      category?: string;
      price?: number;
      originalPrice?: number;
      discountPercent?: number;
      tieredPricing?: any[];
    }): boolean => {
      if (!isPartner) {
        return false;
      }

      if (!settings.isAffiliateSystemEnabled || !settings.isProductDiscountEnabled) {
        return false;
      }

      const sku = (product.sku || "").toUpperCase();
      const name = (product.name || (product as any).title || "").toUpperCase();
      const category = (product.category || "").toLowerCase();

      // Rule 1: Internet & Static IP products NEVER get affiliate discounts (they earn fixed commission)
      const isStaticIp =
        sku.includes("IP-STATIC") ||
        sku.includes("STATIC_IP") ||
        name.includes("IP استاتیک") ||
        name.includes("IP ثابت") ||
        category === "static-ip";

      const isInternet =
        sku.includes("INT-") ||
        sku.includes("FTTH") ||
        sku.includes("INTERNET") ||
        name.includes("اینترنت") ||
        name.includes("پهنای باند") ||
        category === "internet";

      if (isStaticIp || isInternet) {
        return false;
      }

      // Rule 2: Product MUST NOT already have standard sale discounts
      const originalPrice = product.originalPrice ?? 0;
      const price = product.price ?? 0;
      const discountPercent = product.discountPercent ?? 0;

      if ((originalPrice > 0 && originalPrice > price) || discountPercent > 0) {
        return false;
      }

      // Rule 3: Product MUST NOT have tiered stepped pricing
      if (product.tieredPricing && product.tieredPricing.length > 0) {
        return false;
      }

      // Rule 4: Whitelist checks (if configured in settings)
      if (settings.eligibleCategoryIds && settings.eligibleCategoryIds.length > 0) {
        if (!settings.eligibleCategoryIds.includes(category)) {
          return false;
        }
      }

      if (settings.eligibleProductIds && settings.eligibleProductIds.length > 0 && product.id) {
        if (!settings.eligibleProductIds.includes(product.id)) {
          return false;
        }
      }

      return true;
    },
    [isPartner, settings]
  );

  const calculateAffiliatePrice = React.useCallback(
    (product: Product | {
      id?: string;
      sku?: string;
      name?: string;
      price?: number;
      originalPrice?: number;
      discountPercent?: number;
      tieredPricing?: any[];
      category?: string;
    }) => {
      const price = product.price || 0;

      // Affiliate discount applies strictly to users with partner role
      if (!isPartner) {
        return {
          isEligible: false,
          discountPercent: 0,
          discountAmount: 0,
          unitPriceAfterDiscount: price,
        };
      }

      const isEligible = isProductEligibleForAffiliateDiscount(product);

      if (!isEligible) {
        return {
          isEligible: false,
          discountPercent: 0,
          discountAmount: 0,
          unitPriceAfterDiscount: price,
        };
      }

      const discountRate = effectiveDiscountPercent;
      const discountAmount = Math.round(price * (discountRate / 100));
      const unitPriceAfterDiscount = Math.max(0, price - discountAmount);

      return {
        isEligible: true,
        discountPercent: discountRate,
        discountAmount,
        unitPriceAfterDiscount,
      };
    },
    [isPartner, isProductEligibleForAffiliateDiscount, effectiveDiscountPercent]
  );

  const refresh = React.useCallback(async () => {
    await Promise.all([fetchPublicSettings(), fetchMyProfile()]);
  }, [fetchPublicSettings, fetchMyProfile]);

  return (
    <AffiliateContext.Provider
      value={{
        settings,
        isLoadingSettings,
        isPartner,
        partnerProfile,
        effectiveDiscountPercent,
        effectiveStaticIpCommission,
        effectiveInternetCommission,
        partnerCode,
        isProductEligibleForAffiliateDiscount,
        calculateAffiliatePrice,
        refresh,
      }}
    >
      {children}
    </AffiliateContext.Provider>
  );
}

export function useAffiliate(): AffiliateContextValue {
  const context = React.useContext(AffiliateContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      settings: DEFAULT_PUBLIC_SETTINGS,
      isLoadingSettings: false,
      isPartner: false,
      partnerProfile: null,
      effectiveDiscountPercent: 0,
      effectiveStaticIpCommission: 150000,
      effectiveInternetCommission: 400000,
      partnerCode: null,
      isProductEligibleForAffiliateDiscount: () => false,
      calculateAffiliatePrice: (p) => ({
        isEligible: false,
        discountPercent: 0,
        discountAmount: 0,
        unitPriceAfterDiscount: p.price || 0,
      }),
      refresh: async () => {},
    };
  }
  return context;
}
