import { apiClient } from "@/shared/lib/api-client";

export interface AdminPaymentGateway {
  id: string;
  name: string;
  provider: string;
  merchantId: string;
  terminalId?: string | null;
  apiKey?: string | null;
  isSandbox: boolean;
  isActive: boolean;
  isDefault: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBankAccount {
  id: string;
  bankName: string;
  accountOwner: string;
  cardNumber: string;
  shebaNumber: string;
  accountNumber?: string | null;
  isActive: boolean;
  isDefault: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentSettings {
  global_sandbox_mode: boolean;
  is_wallet_payment_enabled: boolean;
  is_card_to_card_enabled: boolean;
  is_cheque_payment_enabled: boolean;
  is_corporate_credit_enabled: boolean;
  min_wallet_recharge: number;
  max_wallet_recharge: number;
}

export interface AdminPaymentReceiptItem {
  id: string;
  orderId: string;
  orderNumber: string;
  trackingCode: string;
  customerName: string;
  companyName?: string | null;
  phoneNumber: string;
  payableAmount: number;
  paymentMethod: string;
  paymentReceiptUrl?: string | null;
  paymentReceiptNumber?: string | null;
  status: string;
  statusLabel: string;
  statusBadge: string;
  isVerified: boolean;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
  orderType?: 'ORDER' | 'INTERNET_ORDER';
  orderTypeLabel?: string;
  planTitle?: string;
  durationMonths?: number;
}

export const adminPaymentsApi = {
  // ─── Gateways ──────────────────────────────────────────────────
  async getGateways(): Promise<AdminPaymentGateway[]> {
    return apiClient.get<AdminPaymentGateway[]>("/admin/payments/gateways");
  },

  async createGateway(data: Partial<AdminPaymentGateway>): Promise<AdminPaymentGateway> {
    return apiClient.post<AdminPaymentGateway>("/admin/payments/gateways", data);
  },

  async updateGateway(id: string, data: Partial<AdminPaymentGateway>): Promise<AdminPaymentGateway> {
    return apiClient.put<AdminPaymentGateway>(`/admin/payments/gateways/${id}`, data);
  },

  async deleteGateway(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/admin/payments/gateways/${id}`);
  },

  // ─── Bank Accounts ─────────────────────────────────────────────
  async getBankAccounts(): Promise<AdminBankAccount[]> {
    return apiClient.get<AdminBankAccount[]>("/admin/payments/bank-accounts");
  },

  async createBankAccount(data: Partial<AdminBankAccount>): Promise<AdminBankAccount> {
    return apiClient.post<AdminBankAccount>("/admin/payments/bank-accounts", data);
  },

  async updateBankAccount(id: string, data: Partial<AdminBankAccount>): Promise<AdminBankAccount> {
    return apiClient.put<AdminBankAccount>(`/admin/payments/bank-accounts/${id}`, data);
  },

  async deleteBankAccount(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/admin/payments/bank-accounts/${id}`);
  },

  // ─── Settings ──────────────────────────────────────────────────
  async getSettings(): Promise<AdminPaymentSettings> {
    return apiClient.get<AdminPaymentSettings>("/admin/payments/settings");
  },

  async updateSettings(data: Partial<AdminPaymentSettings>): Promise<AdminPaymentSettings> {
    return apiClient.put<AdminPaymentSettings>("/admin/payments/settings", data);
  },

  // ─── Card-to-Card & Bank Receipts ──────────────────────────────
  async getReceipts(): Promise<AdminPaymentReceiptItem[]> {
    return apiClient.get<AdminPaymentReceiptItem[]>("/admin/payments/receipts");
  },

  async approveReceipt(orderId: string, adminNotes?: string): Promise<{ success: boolean; message: string; order: any }> {
    return apiClient.post(`/admin/payments/receipts/${orderId}/approve`, { adminNotes });
  },

  async rejectReceipt(orderId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/admin/payments/receipts/${orderId}/reject`, { reason });
  },
};
