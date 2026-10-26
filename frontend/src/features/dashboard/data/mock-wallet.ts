import { WalletBalanceInfo, WalletTransaction, BankAccountInfo } from "../types/wallet.types";

export const INITIAL_WALLET_BALANCE: WalletBalanceInfo = {
  cashBalance: 0,
  giftOrCashbackBalance: 0,
  b2bCreditLimit: 0,
  b2bCreditUsed: 0,
  totalUsable: 0,
};

export const INITIAL_BANK_ACCOUNTS: BankAccountInfo[] = [];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [];
