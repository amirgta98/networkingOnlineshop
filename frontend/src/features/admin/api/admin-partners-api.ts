import { apiClient } from "@/shared/lib/api-client";
import type {
  AdminPartner,
  AdminPartnersResponse,
  AdminPartnerStatus,
  AdminPartnerTier,
} from "../types/admin-partners.types";

export interface AdminPartnersQueryParams {
  status?: string;
  applicantType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdatePartnerStatusPayload {
  status: AdminPartnerStatus;
  tier?: AdminPartnerTier;
  approvedCreditLimit?: number;
  assignedAccountManager?: string;
  reviewerNotes?: string;
}

export const adminPartnersApi = {
  /**
   * دریافت لیست متقاضیان و همکاران سازمانی/حقیقی از بکند
   */
  async getPartners(params?: AdminPartnersQueryParams): Promise<AdminPartnersResponse> {
    return apiClient.get<AdminPartnersResponse>("/admin/partners", {
      params: {
        status: params?.status,
        applicantType: params?.applicantType,
        search: params?.search,
        page: params?.page,
        limit: params?.limit,
      },
    });
  },

  /**
   * دریافت جزئیات یک پرونده با شناسه
   */
  async getPartnerById(id: string): Promise<AdminPartner> {
    return apiClient.get<AdminPartner>(`/admin/partners/${id}`);
  },

  /**
   * به‌روزرسانی وضعیت پرونده، تنظیم رتبه همکار و سقف خط اعتباری
   */
  async updatePartnerStatus(
    id: string,
    payload: UpdatePartnerStatusPayload
  ): Promise<AdminPartner> {
    return apiClient.put<AdminPartner>(`/admin/partners/${id}/status`, payload);
  },

  /**
   * ایجاد پرونده همکار سازمانی جدید توسط ادمین
   */
  async createPartner(payload: Partial<AdminPartner>): Promise<AdminPartner> {
    return apiClient.post<AdminPartner>("/admin/partners", payload);
  },

  /**
   * ویرایش مشخصات کامل پرونده همکار توسط ادمین
   */
  async updatePartner(id: string, payload: Partial<AdminPartner>): Promise<AdminPartner> {
    return apiClient.put<AdminPartner>(`/admin/partners/${id}`, payload);
  },

  /**
   * حذف پرونده همکار توسط ادمین
   */
  async deletePartner(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/partners/${id}`);
  },
};
