export type TransactionType =
  | "deposit"
  | "order_payment"
  | "cashback"
  | "withdrawal"
  | "refund";

export type TransactionStatus = "successful" | "pending" | "failed";

export interface WalletTransaction {
  id: string;
  trackingCode: string;
  amount: number; // positive for income, negative for expense
  type: TransactionType;
  typeLabel: string;
  title: string;
  description?: string;
  createdAt: string;
  status: TransactionStatus;
  statusLabel: string;
  referenceId?: string; // Order ID or bank tracking number
  gatewayName?: string;
}

export interface BankAccountInfo {
  shebaNumber: string; // e.g. IR...
  accountHolderName: string;
  bankName: string;
  cardNumber?: string;
  isVerified: boolean;
}

export interface WalletBalanceInfo {
  cashBalance: number; // Toman
  giftOrCashbackBalance: number; // Toman
  b2bCreditLimit?: number; // Toman
  b2bCreditUsed?: number; // Toman
  totalUsable: number; // Toman
}

export interface WalletWithdrawalItem {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED" | "CANCELLED" | string;
  statusLabel: string;
  bankAccountTitle?: string;
  shabaNumber?: string;
  cardNumber?: string;
  accountHolder?: string;
  trackingCode?: string;
  payoutReference?: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface RequestWithdrawalPayload {
  amount: number;
  cardNumber?: string;
  shabaNumber?: string;
  accountHolder?: string;
  bankName?: string;
}

export interface BackendWalletDto {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  currency: string;
  isActive: boolean;
  transactions: any[];
  withdrawals: WalletWithdrawalItem[];
}
