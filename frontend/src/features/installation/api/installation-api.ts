import { apiClient } from "@/shared/lib/api-client";
import type {
  InstallationRequestFormData,
  InstallationSubmissionResult,
  TrackingRecord,
  InstallationAdminItem,
  InstallationStats,
  InstallationQueryOptions,
  PaginatedInstallationResponse,
} from "../types";

export interface AttachmentUploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

export const installationApi = {
  /**
   * Upload an attachment file (floorplan, cad, spec sheet) up to 15MB
   */
  async uploadAttachment(file: File): Promise<AttachmentUploadResult> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<AttachmentUploadResult>("/installation/upload", formData);
  },

  /**
   * Submit an online installation & passive networking request
   */
  async submitRequest(
    data: InstallationRequestFormData,
    file?: File | null
  ): Promise<InstallationSubmissionResult> {
    let attachmentUrl = data.attachmentUrl;
    let attachmentName = data.attachmentName;

    if (file) {
      try {
        const uploadRes = await this.uploadAttachment(file);
        attachmentUrl = uploadRes.url;
        attachmentName = uploadRes.originalName;
      } catch (err) {
        console.warn("File upload failed, proceeding with form submission:", err);
      }
    }

    const payload = {
      ...data,
      hasAttachment: !!attachmentUrl,
      attachmentName,
      attachmentUrl,
    };

    const res = await apiClient.post<InstallationAdminItem>("/installation", payload);

    const now = new Date(res.createdAt || Date.now());
    const formattedDate = new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(now);

    return {
      trackingCode: res.trackingCode,
      submittedAt: formattedDate,
      estimatedDays: res.estimatedDays || "۱ الی ۲ روز کاری",
      estimatedCostRange: {
        min: res.minEstimatedCost,
        max: res.maxEstimatedCost,
      },
      status: (res.status?.toLowerCase() as any) || "pending_review",
      formData: {
        ...data,
        attachmentName: res.attachmentName || undefined,
        attachmentUrl: res.attachmentUrl || undefined,
      },
      assignedTeam: {
        leadName: res.assignedTeamLead || "مهندس شریفی",
        role: res.assignedTeamRole || "سرپرست ارشد پروژه‌های پسیو و فیبر نوری",
        phone: res.assignedTeamPhone || "۰۹۱۳۴۷۶۱۰۹۷ (داخلی ۱۰۴)",
      },
    };
  },

  /**
   * Track request publicly by unique tracking code
   */
  async trackRequest(code: string): Promise<TrackingRecord> {
    const clean = code.trim().toUpperCase();
    return apiClient.get<TrackingRecord>(`/installation/track/${encodeURIComponent(clean)}`);
  },

  /**
   * User: Get user's own installation requests
   */
  async getUserRequests(phone?: string): Promise<InstallationAdminItem[]> {
    const params: Record<string, string> = {};
    if (phone) params.phone = phone;
    return apiClient.get<InstallationAdminItem[]>("/installation/user-requests", { params });
  },

  /**
   * Admin: List all installation requests with filters & pagination
   */
  async getAdminRequests(query: InstallationQueryOptions = {}): Promise<PaginatedInstallationResponse> {
    const params: Record<string, any> = {};
    if (query.page) params.page = query.page;
    if (query.limit) params.limit = query.limit;
    if (query.search) params.search = query.search;
    if (query.status && query.status !== "all") params.status = query.status;
    if (query.serviceType && query.serviceType !== "all") params.serviceType = query.serviceType;
    if (query.province && query.province !== "all") params.province = query.province;

    return apiClient.get<PaginatedInstallationResponse>("/installation/admin", { params });
  },

  /**
   * Admin: Get installation summary statistics & analytics
   */
  async getAdminStats(): Promise<InstallationStats> {
    return apiClient.get<InstallationStats>("/installation/admin/stats");
  },

  /**
   * Admin: Get request detail by ID
   */
  async getAdminRequestById(id: string): Promise<InstallationAdminItem> {
    return apiClient.get<InstallationAdminItem>(`/installation/admin/${id}`);
  },

  /**
   * Admin: Update request specifications, status, assigned technician, notes
   */
  async updateAdminRequest(
    id: string,
    data: Partial<InstallationAdminItem>
  ): Promise<InstallationAdminItem> {
    return apiClient.patch<InstallationAdminItem>(`/installation/admin/${id}`, data);
  },

  /**
   * Admin: Delete request
   */
  async deleteAdminRequest(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(`/installation/admin/${id}`);
  },
};
