import { apiClient } from "@/shared/lib/api-client";
import type {
  AffiliateAdminStats,
  AffiliateSettingsDto,
  UpdateAffiliateSettingsPayload,
  AffiliatePartnerDto,
  CreateAffiliatePartnerPayload,
  UpdateAffiliatePartnerPayload,
  AdminAffiliatesQueryParams,
  AffiliateCommissionDto,
  AdminCommissionsQueryParams,
  AffiliateCommissionStatus,
  AffiliatePayoutDto,
  AdminPayoutsQueryParams,
  CreateAffiliatePayoutPayload,
} from "../types/admin-affiliates.types";

export const adminAffiliatesApi = {
  /**
   * دریافت خلاصه آمار سیستم همکاران و پورسانت‌ها (ویجت‌های داشبورد)
   */
  async getStats(): Promise<AffiliateAdminStats> {
    return apiClient.get<AffiliateAdminStats>("/admin/affiliates/stats");
  },

  /**
   * دریافت تنظیمات عمومی و مقادیر پیش‌فرض همکاری
   */
  async getSettings(): Promise<AffiliateSettingsDto> {
    return apiClient.get<AffiliateSettingsDto>("/admin/affiliates/settings");
  },

  /**
   * ذخیره و بروزرسانی قوانین و مقادیر پیش‌فرض عمومی همکاری در فروش
   */
  async updateSettings(dto: UpdateAffiliateSettingsPayload): Promise<AffiliateSettingsDto> {
    return apiClient.put<AffiliateSettingsDto>("/admin/affiliates/settings", dto);
  },

  /**
   * دریافت فهرست همکاران ثبت‌شده با امکان جستجو، فیلتر وضعیت و صفحه‌بندی
   */
  async getPartners(
    params?: AdminAffiliatesQueryParams
  ): Promise<{ items: AffiliatePartnerDto[]; total: number }> {
    const query: Record<string, any> = {};
    if (params?.search) query.search = params.search;
    if (params?.status && params.status !== "ALL") query.status = params.status;
    if (params?.skip !== undefined) query.skip = params.skip;
    if (params?.take !== undefined) query.take = params.take;

    return apiClient.get<{ items: AffiliatePartnerDto[]; total: number }>(
      "/admin/affiliates/partners",
      { params: query }
    );
  },

  /**
   * دریافت مشخصات کامل همکار به همراه نرخ‌های اختصاصی و محاسباتی
   */
  async getPartnerById(id: string): Promise<AffiliatePartnerDto> {
    return apiClient.get<AffiliatePartnerDto>(`/admin/affiliates/partners/${id}`);
  },

  /**
   * ایجاد مستقیم همکار جدید توسط مدیر سیستم
   */
  async createPartner(payload: CreateAffiliatePartnerPayload): Promise<AffiliatePartnerDto> {
    return apiClient.post<AffiliatePartnerDto>("/admin/affiliates/partners", payload);
  },

  /**
   * ویرایش مشخصات، نرخ‌های اختصاصی یا وضعیت همکار
   */
  async updatePartner(
    id: string,
    dto: UpdateAffiliatePartnerPayload
  ): Promise<AffiliatePartnerDto> {
    return apiClient.put<AffiliatePartnerDto>(`/admin/affiliates/partners/${id}`, dto);
  },

  /**
   * بازنشانی مقادیر اختصاصی همکار به حالت پیش‌فرض عمومی سیستم
   */
  async resetPartnerDefaults(id: string): Promise<AffiliatePartnerDto> {
    return apiClient.post<AffiliatePartnerDto>(
      `/admin/affiliates/partners/${id}/reset-defaults`,
      {}
    );
  },

  /**
   * دریافت گزارش تراکنش‌های پورسانت با فیلتر وضعیت، نوع کالا و همکار
   */
  async getCommissions(
    params?: AdminCommissionsQueryParams
  ): Promise<{ items: AffiliateCommissionDto[]; total: number }> {
    const query: Record<string, any> = {};
    if (params?.partnerId) query.partnerId = params.partnerId;
    if (params?.orderId) query.orderId = params.orderId;
    if (params?.status && params.status !== "ALL") query.status = params.status;
    if (params?.productType && params.productType !== "ALL") query.productType = params.productType;
    if (params?.skip !== undefined) query.skip = params.skip;
    if (params?.take !== undefined) query.take = params.take;

    return apiClient.get<{ items: AffiliateCommissionDto[]; total: number }>(
      "/admin/affiliates/commissions",
      { params: query }
    );
  },

  /**
   * بروزرسانی وضعیت یک پورسانت (تایید، آماده تسویه، لغو)
   */
  async updateCommissionStatus(
    id: string,
    status: AffiliateCommissionStatus,
    notes?: string
  ): Promise<AffiliateCommissionDto> {
    return apiClient.patch<AffiliateCommissionDto>(
      `/admin/affiliates/commissions/${id}/status`,
      { status, notes }
    );
  },

  /**
   * دریافت سوابق تسویه‌حساب‌ها و حواله‌های بانکی
   */
  async getPayouts(
    params?: AdminPayoutsQueryParams
  ): Promise<{ items: AffiliatePayoutDto[]; total: number }> {
    const query: Record<string, any> = {};
    if (params?.partnerId) query.partnerId = params.partnerId;
    if (params?.skip !== undefined) query.skip = params.skip;
    if (params?.take !== undefined) query.take = params.take;

    return apiClient.get<{ items: AffiliatePayoutDto[]; total: number }>(
      "/admin/affiliates/payouts",
      { params: query }
    );
  },

  /**
   * ثبت حواله تسویه‌حساب و پرداخت پورسانت جدید به همکار
   */
  async createPayout(dto: CreateAffiliatePayoutPayload): Promise<AffiliatePayoutDto> {
    return apiClient.post<AffiliatePayoutDto>("/admin/affiliates/payouts", dto);
  },
};
