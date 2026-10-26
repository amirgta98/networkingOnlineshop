"use client";

import * as React from "react";
import {
  WalletBalanceInfo,
  WalletTransaction,
  TransactionType,
  BankAccountInfo,
  WalletWithdrawalItem,
  RequestWithdrawalPayload,
} from "../types/wallet.types";
import {
  INITIAL_WALLET_BALANCE,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_TRANSACTIONS,
} from "../data/mock-wallet";
import { walletApi } from "../api/wallet-api";

const BALANCE_KEY = "velox_dashboard_wallet_bal_v2";
const TX_KEY = "velox_dashboard_wallet_tx_v2";
const BANK_KEY = "velox_dashboard_wallet_bank_v2";
const WDR_KEY = "velox_dashboard_wallet_wdr_v2";

export function useDashboardWallet() {
  const [balance, setBalance] = React.useState<WalletBalanceInfo>(INITIAL_WALLET_BALANCE);
  const [transactions, setTransactions] = React.useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [withdrawals, setWithdrawals] = React.useState<WalletWithdrawalItem[]>([]);
  const [bankAccounts, setBankAccounts] = React.useState<BankAccountInfo[]>(INITIAL_BANK_ACCOUNTS);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const loadFromBackendOrLocal = React.useCallback(async () => {
    setIsSyncing(true);
    let loadedFromApi = false;

    try {
      const backendData = await walletApi.getMyWallet();
      if (backendData && (backendData.balance !== undefined || backendData.transactions?.length)) {
        const bal: WalletBalanceInfo = {
          cashBalance: backendData.balance || 0,
          giftOrCashbackBalance: 0,
          totalUsable: backendData.balance || 0,
        };
        setBalance(bal);

        // Normalize transactions
        const txList: WalletTransaction[] = (backendData.transactions || []).map((t: any) => {
          const rawType = (t.type || "").toUpperCase();
          const isDeposit = rawType === "DEPOSIT";
          const isRefund = rawType === "REFUND";
          const isWithdrawal = rawType === "WITHDRAWAL";
          const isCashback = rawType === "CASHBACK";
          const txType: TransactionType = isDeposit
            ? "deposit"
            : isRefund
            ? "refund"
            : isWithdrawal
            ? "withdrawal"
            : isCashback
            ? "cashback"
            : "order_payment";

          const txLabel =
            t.typeLabel ||
            (isDeposit
              ? "شارژ آنلاین کیف پول"
              : isRefund
              ? "استرداد وجه تسویه"
              : isWithdrawal
              ? "برداشت و تسویه وجه"
              : isCashback
              ? "پاداش و کش‌بک"
              : "تراکنش");

          return {
            id: t.id,
            trackingCode: t.trackingCode || `TX-${t.id.slice(0, 8)}`,
            amount: Number(t.amount || 0),
            type: txType,
            typeLabel: txLabel,
            title: t.description || txLabel,
            description: t.description,
            createdAt: t.createdAt || new Date().toISOString(),
            status: "successful",
            statusLabel: "موفق",
            referenceId: t.referenceId,
          };
        });
        setTransactions(txList);

        if (backendData.withdrawals) {
          setWithdrawals(backendData.withdrawals);
        }

        try {
          localStorage.setItem(BALANCE_KEY, JSON.stringify(bal));
          localStorage.setItem(TX_KEY, JSON.stringify(txList));
          if (backendData.withdrawals) {
            localStorage.setItem(WDR_KEY, JSON.stringify(backendData.withdrawals));
          }
        } catch {
          // ignore localStorage error
        }

        loadedFromApi = true;
      }
    } catch {
      // Backend unavailable, fallback to localStorage
    }

    if (!loadedFromApi) {
      try {
        const storedBal = localStorage.getItem(BALANCE_KEY);
        const storedTx = localStorage.getItem(TX_KEY);
        const storedBank = localStorage.getItem(BANK_KEY);
        const storedWdr = localStorage.getItem(WDR_KEY);

        if (storedBal) setBalance(JSON.parse(storedBal));
        else setBalance(INITIAL_WALLET_BALANCE);

        if (storedTx) setTransactions(JSON.parse(storedTx));
        else setTransactions(INITIAL_TRANSACTIONS);

        if (storedWdr) setWithdrawals(JSON.parse(storedWdr));
        else setWithdrawals([]);

        if (storedBank) setBankAccounts(JSON.parse(storedBank));
        else setBankAccounts(INITIAL_BANK_ACCOUNTS);
      } catch {
        setBalance(INITIAL_WALLET_BALANCE);
        setTransactions(INITIAL_TRANSACTIONS);
        setWithdrawals([]);
        setBankAccounts(INITIAL_BANK_ACCOUNTS);
      }
    }

    setIsLoaded(true);
    setIsSyncing(false);
  }, []);

  React.useEffect(() => {
    loadFromBackendOrLocal();
  }, [loadFromBackendOrLocal]);

  const saveState = (
    newBal: WalletBalanceInfo,
    newTx: WalletTransaction[],
    newWdr?: WalletWithdrawalItem[],
    newBank?: BankAccountInfo[]
  ) => {
    setBalance(newBal);
    setTransactions(newTx);
    if (newWdr) setWithdrawals(newWdr);
    if (newBank) setBankAccounts(newBank);

    try {
      localStorage.setItem(BALANCE_KEY, JSON.stringify(newBal));
      localStorage.setItem(TX_KEY, JSON.stringify(newTx));
      if (newWdr) localStorage.setItem(WDR_KEY, JSON.stringify(newWdr));
      if (newBank) localStorage.setItem(BANK_KEY, JSON.stringify(newBank));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dashboard-stats-updated"));
      }
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
      createdAt: new Date().toISOString(),
      status: "successful",
      statusLabel: "موفق",
      gatewayName,
    };

    const newBal: WalletBalanceInfo = {
      ...balance,
      cashBalance: balance.cashBalance + amount,
      totalUsable: balance.totalUsable + amount,
    };

    saveState(newBal, [newTx, ...transactions], withdrawals);
    return newTx;
  };

  const withdrawFunds = async (
    payloadOrAmount: RequestWithdrawalPayload | number,
    shebaNumberArg?: string,
    cardNumberArg?: string,
    accountHolderArg?: string,
    bankNameArg?: string,
  ) => {
    let payload: RequestWithdrawalPayload;
    if (typeof payloadOrAmount === "object") {
      payload = payloadOrAmount;
    } else {
      payload = {
        amount: payloadOrAmount,
        shabaNumber: shebaNumberArg || "",
        cardNumber: cardNumberArg || "",
        accountHolder: accountHolderArg,
        bankName: bankNameArg,
      };
    }

    if (payload.amount > balance.cashBalance) {
      throw new Error("مبلغ درخواستی بیشتر از موجودی نقدی قابل برداشت است.");
    }

    let createdWdr: WalletWithdrawalItem | null = null;
    try {
      createdWdr = await walletApi.requestWithdrawal(payload);
    } catch (err: any) {
      console.warn("Backend withdrawal API call threw, proceeding with client record:", err);
      // If error is from validation in backend, rethrow
      if (err?.message && !err.message.includes("fetch") && !err.message.includes("Network")) {
        throw err;
      }
    }

    const cleanCard = (payload.cardNumber || "").replace(/\D/g, "");
    const maskedCard = cleanCard.length >= 16 ? `${cleanCard.slice(0, 4)}-****-****-${cleanCard.slice(12)}` : cleanCard || "حساب پیش‌فرض";
    const trackingCode = createdWdr?.trackingCode || `WDR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newWdrItem: WalletWithdrawalItem = createdWdr || {
      id: `wdr-${Date.now()}`,
      amount: payload.amount,
      status: "PENDING",
      statusLabel: "در انتظار بررسی مالی",
      cardNumber: payload.cardNumber,
      shabaNumber: payload.shabaNumber,
      accountHolder: payload.accountHolder,
      bankAccountTitle: payload.bankName,
      trackingCode,
      requestedAt: new Date().toISOString(),
    };

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      trackingCode,
      amount: -payload.amount,
      type: "withdrawal",
      typeLabel: "تسویه به حساب بانکی",
      title: `درخواست تسویه به حساب بانکی (${(payload.shabaNumber || "").slice(0, 10)}...)`,
      description: `شماره شبا: ${payload.shabaNumber || "ثبت‌شده در پروفایل"}${payload.cardNumber ? ` - کارت: ${payload.cardNumber}` : ""}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      statusLabel: "در حال بررسی مالی",
    };

    const newBal: WalletBalanceInfo = {
      ...balance,
      cashBalance: balance.cashBalance - payload.amount,
      totalUsable: balance.totalUsable - payload.amount,
    };

    const updatedWithdrawals = [newWdrItem, ...withdrawals.filter((w) => w.id !== newWdrItem.id)];
    saveState(newBal, [newTx, ...transactions], updatedWithdrawals);
    return newWdrItem;
  };

  return {
    balance,
    transactions,
    withdrawals,
    bankAccounts,
    isLoaded,
    isSyncing,
    refreshWallet: loadFromBackendOrLocal,
    depositFunds,
    withdrawFunds,
  };
}
