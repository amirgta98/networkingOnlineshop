import { apiClient } from "@/shared/lib/api-client";
import {
  BackendWalletDto,
  RequestWithdrawalPayload,
  WalletWithdrawalItem,
  WalletTransaction,
} from "../types/wallet.types";

export const walletApi = {
  /**
   * Fetch current user's complete wallet state including balance, transactions, and withdrawals.
   */
  async getMyWallet(): Promise<BackendWalletDto | null> {
    try {
      const data = await apiClient.get<BackendWalletDto>("/wallet/my-wallet", { timeout: 4000 });
      return data;
    } catch (err) {
      console.warn("walletApi.getMyWallet backend call failed, fallback to local state:", err);
      return null;
    }
  },

  /**
   * Submit a new withdrawal request with card number, sheba, and legal disclaimer acknowledgment.
   */
  async requestWithdrawal(payload: RequestWithdrawalPayload): Promise<WalletWithdrawalItem> {
    const data = await apiClient.post<WalletWithdrawalItem>("/wallet/withdraw", payload, {
      timeout: 6000,
    });
    return data;
  },

  /**
   * Get all withdrawal requests for the current user.
   */
  async getMyWithdrawals(): Promise<WalletWithdrawalItem[]> {
    try {
      const data = await apiClient.get<WalletWithdrawalItem[]>("/wallet/withdrawals", {
        timeout: 4000,
      });
      return data || [];
    } catch (err) {
      console.warn("walletApi.getMyWithdrawals failed:", err);
      return [];
    }
  },

  /**
   * Get all deposit transactions for the current user.
   */
  async getMyDeposits(): Promise<WalletTransaction[]> {
    try {
      const data = await apiClient.get<WalletTransaction[]>("/wallet/deposits", { timeout: 4000 });
      return data || [];
    } catch (err) {
      console.warn("walletApi.getMyDeposits failed:", err);
      return [];
    }
  },
};
