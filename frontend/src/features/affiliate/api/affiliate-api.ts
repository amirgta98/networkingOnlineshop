import { apiClient } from "@/shared/lib/api-client";
import type {
  AffiliatePublicSettings,
  AffiliateSettingsDto,
  AffiliatePartnerDto,
  AffiliateCommissionDto,
  AffiliatePayoutDto,
  AffiliateProfileResponse,
  UpdateAffiliateSettingsPayload,
  UpdateAffiliatePartnerPayload,
  CreateAffiliatePayoutPayload,
  EvaluateDiscountItem,
  EvaluateDiscountResponse,
  AffiliateCommissionStatus,
  AffiliatePartnerStatus,
} from "../types/affiliate.types";

export const DEFAULT_PUBLIC_SETTINGS: AffiliatePublicSettings = {
  isAffiliateSystemEnabled: true,
  isProductDiscountEnabled: true,
  defaultDiscountPercent: 8,
  defaultStaticIpCommission: 150000,
  defaultInternetCommission: 400000,
  eligibleProductIds: [],
  eligibleCategoryIds: [],
};

export const affiliateApi = {
  /**
   * Public settings for shop front
   */
  async getPublicSettings(): Promise<AffiliatePublicSettings> {
    try {
      const res = await apiClient.get<AffiliatePublicSettings>("/affiliates/public-settings");
      if (res && typeof res.defaultDiscountPercent === "number") {
        return res;
      }
      return DEFAULT_PUBLIC_SETTINGS;
    } catch (err) {
      console.warn("[AffiliateApi] Failed to fetch public settings, using fallback:", err);
      return DEFAULT_PUBLIC_SETTINGS;
    }
  },

  /**
   * Get logged-in user partner profile & custom rates
   */
  async getMyProfile(): Promise<AffiliateProfileResponse> {
    try {
      const res = await apiClient.get<AffiliateProfileResponse>("/affiliates/my-profile");
      return res;
    } catch (err) {
      return {
        isPartner: false,
        settings: { defaultDiscountPercent: 8 },
      };
    }
  },

  /**
   * Evaluate discounts server-side
   */
  async evaluateDiscount(items: EvaluateDiscountItem[], partnerCode?: string, userId?: string): Promise<EvaluateDiscountResponse> {
    try {
      const res = await apiClient.post<EvaluateDiscountResponse>("/affiliates/evaluate-discount", {
        items,
        partnerCode,
        userId,
      });
      return res;
    } catch (err) {
      console.warn("[AffiliateApi] Server evaluation failed, calculating locally:", err);
      return {
        isPartner: false,
        totalAffiliateDiscount: 0,
        items: items.map((i) => ({
          isEligible: false,
          discountPercent: 0,
          discountAmount: 0,
          unitPriceAfterDiscount: i.price,
          quantity: i.quantity,
          itemDiscountTotal: 0,
        })),
      };
    }
  },

  // ─── Admin Endpoints ──────────────────────────────────────────────────

  async getAdminSettings(): Promise<AffiliateSettingsDto> {
    const res = await apiClient.get<AffiliateSettingsDto>("/admin/affiliates/settings");
    return res;
  },

  async updateAdminSettings(dto: UpdateAffiliateSettingsPayload): Promise<AffiliateSettingsDto> {
    const res = await apiClient.put<AffiliateSettingsDto>("/admin/affiliates/settings", dto);
    return res;
  },

  async getAdminPartners(params?: {
    search?: string;
    status?: AffiliatePartnerStatus | string;
    skip?: number;
    take?: number;
  }): Promise<{ items: AffiliatePartnerDto[]; total: number }> {
    const query: Record<string, any> = {};
    if (params?.search) query.search = params.search;
    if (params?.status && params.status !== "ALL") query.status = params.status;
    if (params?.skip !== undefined) query.skip = params.skip;
    if (params?.take !== undefined) query.take = params.take;

    const res = await apiClient.get<{ items: AffiliatePartnerDto[]; total: number }>(
      "/admin/affiliates/partners",
      { params: query }
    );
    return res;
  },

  async getAdminPartnerById(id: string): Promise<AffiliatePartnerDto> {
    const res = await apiClient.get<AffiliatePartnerDto>(`/admin/affiliates/partners/${id}`);
    return res;
  },

  async updateAdminPartner(id: string, dto: UpdateAffiliatePartnerPayload): Promise<AffiliatePartnerDto> {
    const res = await apiClient.put<AffiliatePartnerDto>(`/admin/affiliates/partners/${id}`, dto);
    return res;
  },

  async resetAdminPartnerDefaults(id: string): Promise<AffiliatePartnerDto> {
    const res = await apiClient.post<AffiliatePartnerDto>(`/admin/affiliates/partners/${id}/reset-defaults`, {});
    return res;
  },

  async getAdminCommissions(params?: {
    partnerId?: string;
    orderId?: string;
    status?: AffiliateCommissionStatus | string;
    productType?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: AffiliateCommissionDto[]; total: number }> {
    const query: Record<string, any> = {};
    if (params?.partnerId) query.partnerId = params.partnerId;
    if (params?.orderId) query.orderId = params.orderId;
    if (params?.status && params.status !== "ALL") query.status = params.status;
    if (params?.productType && params.productType !== "ALL") query.productType = params.productType;
    if (params?.skip !== undefined) query.skip = params.skip;
    if (params?.take !== undefined) query.take = params.take;

    const res = await apiClient.get<{ items: AffiliateCommissionDto[]; total: number }>(
      "/admin/affiliates/commissions",
      { params: query }
    );
    return res;
  },

  async updateCommissionStatus(id: string, status: AffiliateCommissionStatus, notes?: string): Promise<AffiliateCommissionDto> {
    const res = await apiClient.patch<AffiliateCommissionDto>(`/admin/affiliates/commissions/${id}/status`, {
      status,
      notes,
    });
    return res;
  },

  async getAdminPayouts(params?: {
    partnerId?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: AffiliatePayoutDto[]; total: number }> {
    const query: Record<string, any> = {};
    if (params?.partnerId) query.partnerId = params.partnerId;
    if (params?.skip !== undefined) query.skip = params.skip;
    if (params?.take !== undefined) query.take = params.take;

    const res = await apiClient.get<{ items: AffiliatePayoutDto[]; total: number }>(
      "/admin/affiliates/payouts",
      { params: query }
    );
    return res;
  },

  async createAdminPayout(dto: CreateAffiliatePayoutPayload): Promise<AffiliatePayoutDto> {
    const res = await apiClient.post<AffiliatePayoutDto>("/admin/affiliates/payouts", dto);
    return res;
  },
};
