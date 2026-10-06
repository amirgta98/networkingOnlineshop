"use client";

import * as React from "react";
import { WalletBalanceInfo, WalletTransaction, BankAccountInfo } from "../types/wallet.types";
import {
  INITIAL_WALLET_BALANCE,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_TRANSACTIONS,
} from "../data/mock-wallet";

const BALANCE_KEY = "velox_dashboard_wallet_bal_v1";
const TX_KEY = "velox_dashboard_wallet_tx_v1";
const BANK_KEY = "velox_dashboard_wallet_bank_v1";

export function useDashboardWallet() {
  const [balance, setBalance] = React.useState<WalletBalanceInfo>(INITIAL_WALLET_BALANCE);
  const [transactions, setTransactions] = React.useState<WalletTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = React.useState<BankAccountInfo[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const storedBal = localStorage.getItem(BALANCE_KEY);
      const storedTx = localStorage.getItem(TX_KEY);
      const storedBank = localStorage.getItem(BANK_KEY);

      if (storedBal) setBalance(JSON.parse(storedBal));
      else localStorage.setItem(BALANCE_KEY, JSON.stringify(INITIAL_WALLET_BALANCE));

      if (storedTx) setTransactions(JSON.parse(storedTx));
      else {
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem(TX_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      }

      if (storedBank) setBankAccounts(JSON.parse(storedBank));
      else {
        setBankAccounts(INITIAL_BANK_ACCOUNTS);
        localStorage.setItem(BANK_KEY, JSON.stringify(INITIAL_BANK_ACCOUNTS));
      }
    } catch {
      setBalance(INITIAL_WALLET_BALANCE);
      setTransactions(INITIAL_TRANSACTIONS);
      setBankAccounts(INITIAL_BANK_ACCOUNTS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveState = (
    newBal: WalletBalanceInfo,
    newTx: WalletTransaction[],
    newBank?: BankAccountInfo[]
  ) => {
    setBalance(newBal);
    setTransactions(newTx);
    if (newBank) setBankAccounts(newBank);

    try {
      localStorage.setItem(BALANCE_KEY, JSON.stringify(newBal));
      localStorage.setItem(TX_KEY, JSON.stringify(newTx));
      if (newBank) localStorage.setItem(BANK_KEY, JSON.stringify(newBank));
    } catch (e) {
      console.error("Failed to save wallet data", e);
    }
  };

  const depositFunds = async (amount: number, gatewayName: string) => {
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      trackingCode: `SHP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      amount,
      type: "deposit",
      typeLabel: "شارژ آنلاین کیف پول",
      title: `شارژ آنی از طریق درگاه پرداخت اینترنتی ${gatewayName}`,
      createdAt: "هم‌اکنون",
      status: "successful",
      statusLabel: "موفق",
      gatewayName,
    };

    const newBal: WalletBalanceInfo = {
      ...balance,
      cashBalance: balance.cashBalance + amount,
      totalUsable: balance.totalUsable + amount,
    };

    saveState(newBal, [newTx, ...transactions]);
    return newTx;
  };

  const withdrawFunds = async (amount: number, shebaNumber: string) => {
    if (amount > balance.cashBalance) {
      throw new Error("مبلغ درخواستی بیشتر از موجودی نقدی قابل برداشت است.");
    }

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      trackingCode: `WDR-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: -amount,
      type: "withdrawal",
      typeLabel: "تسویه به حساب بانکی",
      title: `درخواست انتقال وجه به شماره شبا (${shebaNumber.slice(0, 8)}...)`,
      createdAt: "هم‌اکنون",
      status: "pending",
      statusLabel: "در حال بررسی مالی",
    };

    const newBal: WalletBalanceInfo = {
      ...balance,
      cashBalance: balance.cashBalance - amount,
      totalUsable: balance.totalUsable - amount,
    };

    saveState(newBal, [newTx, ...transactions]);
    return newTx;
  };

  return {
    balance,
    transactions,
    bankAccounts,
    isLoaded,
    depositFunds,
    withdrawFunds,
  };
}
