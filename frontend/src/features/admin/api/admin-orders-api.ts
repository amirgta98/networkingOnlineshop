import { apiClient } from "@/shared/lib/api-client";
import { AdminOrder } from "../types/admin-orders.types";

export interface UpdateOrderStatusDto {
  status: string;
  trackingCode?: string;
  carrier?: string;
  notes?: string;
}

export interface AssignCarrierDto {
  carrier: string;
  trackingCode?: string;
  notes?: string;
}

export const adminOrdersApi = {
  async getOrders(params?: {
    status?: string;
    customerType?: string;
    search?: string;
  }): Promise<AdminOrder[]> {
    return apiClient.get<AdminOrder[]>("/orders", { params });
  },

  async getOrderById(id: string): Promise<AdminOrder> {
    return apiClient.get<AdminOrder>(`/orders/${id}`);
  },

  async updateOrderStatus(
    id: string,
    status?: string,
    trackingCode?: string,
    carrier?: string,
    notes?: string
  ): Promise<AdminOrder> {
    return apiClient.patch<AdminOrder>(`/orders/${id}/status`, {
      ...(status ? { status } : {}),
      trackingCode,
      carrier,
      notes,
    });
  },

  async assignCarrier(
    id: string,
    carrier: string,
    trackingCode?: string,
    notes?: string
  ): Promise<AdminOrder> {
    return apiClient.patch<AdminOrder>(`/orders/${id}/shipping`, {
      carrier,
      trackingCode,
      notes,
    });
  },
};
