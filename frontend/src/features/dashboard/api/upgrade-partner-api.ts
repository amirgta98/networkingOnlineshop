import { apiClient } from "@/shared/lib/api-client";
import type {
  PartnerApplicationData,
  PartnerApplicationResponse,
  PartnerDocumentItem,
} from "../types/upgrade-partner.types";

export interface UploadPartnerDocResponse {
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  originalName?: string;
  size?: number;
}

export const upgradePartnerApi = {
  /**
   * دریافت پرونده ارتقا به همکار کاربر جاری از بکند
   */
  async getMyApplication(): Promise<PartnerApplicationResponse> {
    return apiClient.get<PartnerApplicationResponse>("/partners/my-application");
  },

  /**
   * ارسال یا ویرایش پرونده درخواست ارتقا به همکار
   */
  async submitApplication(
    payload: Partial<PartnerApplicationData>
  ): Promise<PartnerApplicationData> {
    return apiClient.post<PartnerApplicationData>("/partners/apply", payload);
  },

  /**
   * ارسال درخواست رسمی ارتقای همکار سازمانی و ثبت مشخصات حقوقی شرکت در دیتابیس (B2B)
   */
  async upgradeRequest(
    payload: Partial<PartnerApplicationData>
  ): Promise<{ organization: any; application: PartnerApplicationData }> {
    return apiClient.post<{ organization: any; application: PartnerApplicationData }>(
      "/partners/upgrade-request",
      payload
    );
  },

  /**
   * آپلود مدرک یا سند به سرور
   */
  async uploadDocument(file: File): Promise<UploadPartnerDocResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<UploadPartnerDocResponse>("/partners/upload", formData);
  },
};
