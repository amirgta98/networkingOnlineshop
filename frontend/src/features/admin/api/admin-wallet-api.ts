import { apiClient } from "@/shared/lib/api-client";

export interface AdminWithdrawalUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isPartner?: boolean;
  role?: string;
}

export interface AdminWithdrawalItem {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED" | "CANCELLED" | string;
  statusLabel: string;
  cardNumber: string;
  shabaNumber: string;
  bankName: string;
  accountHolder: string;
  trackingCode: string;
  payoutReference?: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  user?: AdminWithdrawalUser | null;
}

export interface AdminWithdrawalsResponse {
  items: AdminWithdrawalItem[];
  total: number;
  metrics: {
    pendingCount: number;
    pendingAmount: number;
    completedCount: number;
    completedAmount: number;
  };
}

export interface AdminDepositItem {
  id: string;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  trackingCode: string;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  createdAt: string;
  user?: AdminWithdrawalUser | null;
}

export interface AdminDepositsResponse {
  items: AdminDepositItem[];
  total: number;
  totalAmount: number;
}

export const adminWalletApi = {
  /**
   * Get all withdrawal requests with search and status filtering from backend
   */
  async getAdminWithdrawals(query: {
    status?: string;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<AdminWithdrawalsResponse> {
    try {
      const params = new URLSearchParams();
      if (query.status && query.status !== "all") params.append("status", query.status);
      if (query.search?.trim()) params.append("search", query.search.trim());
      if (query.skip) params.append("skip", String(query.skip));
      if (query.take) params.append("take", String(query.take));

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await apiClient.get<AdminWithdrawalsResponse>(
        `/admin/wallet/withdrawals${queryStr}`,
        { timeout: 8000 }
      );
      if (res && res.items) {
        return res;
      }
    } catch (err) {
      console.warn("adminWalletApi.getAdminWithdrawals API request failed:", err);
    }

    return {
      items: [],
      total: 0,
      metrics: {
        pendingCount: 0,
        pendingAmount: 0,
        completedCount: 0,
        completedAmount: 0,
      },
    };
  },

  /**
   * Get all deposit and charge records from backend
   */
  async getAdminDeposits(query: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<AdminDepositsResponse> {
    try {
      const params = new URLSearchParams();
      if (query.search?.trim()) params.append("search", query.search.trim());
      if (query.skip) params.append("skip", String(query.skip));
      if (query.take) params.append("take", String(query.take));

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const res = await apiClient.get<AdminDepositsResponse>(
        `/admin/wallet/deposits${queryStr}`,
        { timeout: 8000 }
      );
      if (res && res.items) {
        return res;
      }
    } catch (err) {
      console.warn("adminWalletApi.getAdminDeposits API request failed:", err);
    }

    return {
      items: [],
      total: 0,
      totalAmount: 0,
    };
  },

  /**
   * Update withdrawal status (Approve with Satna/Paya code or Reject with reason)
   */
  async updateWithdrawalStatus(
    id: string,
    payload: {
      status: "PROCESSING" | "COMPLETED" | "REJECTED" | "CANCELLED";
      payoutReference?: string;
      rejectionReason?: string;
    }
  ): Promise<AdminWithdrawalItem> {
    return apiClient.patch<AdminWithdrawalItem>(
      `/admin/wallet/withdrawals/${id}/status`,
      payload,
      { timeout: 8000 }
    );
  },
};
