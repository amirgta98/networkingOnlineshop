import { apiClient } from "@/shared/lib/api-client";
import type {
  InternetPlan,
  InternetSettings,
  CalculateCostParams,
  CostCalculationResult,
  InternetOrder,
} from "../types";

export interface PaginatedAdminOrders {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  orders: InternetOrder[];
}

export const internetApi = {
  // ─── Public ───────────────────────────────────────────────────

  async getPlans(): Promise<InternetPlan[]> {
    return apiClient.get<InternetPlan[]>("/internet/plans");
  },

  async getSettings(): Promise<InternetSettings> {
    return apiClient.get<InternetSettings>("/internet/settings");
  },

  async calculateCost(params: CalculateCostParams): Promise<CostCalculationResult> {
    return apiClient.post<CostCalculationResult>("/internet/calculate", params);
  },

  async createOrder(data: {
    planId: string;
    siteId?: string;
    serviceDurationMonths: number;
    hasStaticIp?: boolean;
    includeModem?: boolean;
    includeInstallation?: boolean;
    fullName: string;
    companyName?: string;
    phoneNumber: string;
    nationalCode?: string;
    province: string;
    city: string;
    address: string;
    landlineNumber?: string;
    notes?: string;
  }): Promise<InternetOrder> {
    return apiClient.post<InternetOrder>("/internet/orders", data);
  },

  async getMyOrders(): Promise<InternetOrder[]> {
    return apiClient.get<InternetOrder[]>("/internet/orders/my");
  },

  async trackOrder(trackingCode: string): Promise<InternetOrder> {
    return apiClient.get<InternetOrder>(`/internet/orders/track/${encodeURIComponent(trackingCode)}`);
  },

  // ─── Admin Endpoints ──────────────────────────────────────────

  async getAdminPlans(): Promise<InternetPlan[]> {
    return apiClient.get<InternetPlan[]>("/admin/internet/plans");
  },

  async getAdminPlan(id: string): Promise<InternetPlan> {
    return apiClient.get<InternetPlan>(`/admin/internet/plans/${id}`);
  },

  async createAdminPlan(plan: Partial<InternetPlan>): Promise<InternetPlan> {
    return apiClient.post<InternetPlan>("/admin/internet/plans", plan);
  },

  async updateAdminPlan(id: string, plan: Partial<InternetPlan>): Promise<InternetPlan> {
    return apiClient.put<InternetPlan>(`/admin/internet/plans/${id}`, plan);
  },

  async deleteAdminPlan(id: string): Promise<{ success: boolean; action: string; message: string }> {
    return apiClient.delete<{ success: boolean; action: string; message: string }>(
      `/admin/internet/plans/${id}`
    );
  },

  async toggleAdminPlanActive(id: string): Promise<InternetPlan> {
    return apiClient.patch<InternetPlan>(`/admin/internet/plans/${id}/toggle`);
  },

  async toggleAdminPlanFeatured(id: string): Promise<InternetPlan> {
    return apiClient.patch<InternetPlan>(`/admin/internet/plans/${id}/featured`);
  },

  async getAdminSettings(): Promise<Array<{ key: string; value: string; updatedAt: string }>> {
    return apiClient.get<Array<{ key: string; value: string; updatedAt: string }>>(
      "/admin/internet/settings"
    );
  },

  async updateAdminSettings(settings: Record<string, string | number>): Promise<any> {
    return apiClient.put<any>("/admin/internet/settings", settings);
  },

  async getAdminOrders(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedAdminOrders> {
    return apiClient.get<PaginatedAdminOrders>("/admin/internet/orders", {
      params: {
        status: params?.status,
        search: params?.search,
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    });
  },

  async getAdminOrder(id: string): Promise<InternetOrder> {
    return apiClient.get<InternetOrder>(`/admin/internet/orders/${id}`);
  },

  async updateAdminOrderStatus(id: string, status: string): Promise<InternetOrder> {
    return apiClient.patch<InternetOrder>(`/admin/internet/orders/${id}/status`, { status });
  },
};
