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
  isVerified: boolean;
}

export interface WalletBalanceInfo {
  cashBalance: number; // Toman
  giftOrCashbackBalance: number; // Toman
  b2bCreditLimit?: number; // Toman
  b2bCreditUsed?: number; // Toman
  totalUsable: number; // Toman
}
