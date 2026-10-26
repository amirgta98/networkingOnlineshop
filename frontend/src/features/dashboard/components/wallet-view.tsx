"use client";

import * as React from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Search,
  Filter,
  Info,
  ExternalLink,
} from "lucide-react";
import { useDashboardWallet } from "../hooks/use-dashboard-wallet";
import { TransactionType, WalletTransaction, WalletWithdrawalItem } from "../types/wallet.types";
import {
  DashboardPageHeader,
  DashboardFilterBar,
  DashboardStatusBadge,
  DashboardEmptyState,
  DashboardModal,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { paymentApi } from "@/features/payment";
import Link from "next/link";
import { profileApi } from "../api/profile-api";
import { UserProfileData } from "../types/profile.types";

export function toEnglishDigits(str?: string): string {
  if (!str) return "";
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export function formatDisplayDate(dateInput?: string | Date): string {
  if (!dateInput) return "هم‌اکنون";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return toPersianDigits(String(dateInput));
  }
  const dateStr = d.toLocaleDateString("fa-IR");
  const timeStr = d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} - ${timeStr}`;
}

export function detectBankFromCardNumber(cardNumber: string): { name: string; color: string } {
  const clean = toEnglishDigits(cardNumber).replace(/[\s-]/g, "").replace(/\D/g, "");
  const prefix = clean.slice(0, 6);

  const bankMap: Record<string, { name: string; color: string }> = {
    "603799": { name: "بانک ملی ایران", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    "589210": { name: "بانک سپه", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    "627648": { name: "بانک توسعه صادرات", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    "627961": { name: "بانک صنعت و معدن", color: "text-neutral-300 bg-neutral-800 border-neutral-700" },
    "603770": { name: "بانک کشاورزی", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    "628023": { name: "بانک مسکن", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    "627760": { name: "پست بانک ایران", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    "502908": { name: "بانک توسعه تعاون", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
    "627412": { name: "بانک اقتصاد نوین", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    "622106": { name: "بانک پارسیان", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    "502229": { name: "بانک پاسارگاد", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    "627488": { name: "بانک کارآفرین", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
    "621986": { name: "بانک سامان", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
    "639346": { name: "بانک سینا", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    "639607": { name: "بانک سرمایه", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    "636214": { name: "بانک آینده", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    "502806": { name: "بانک شهر", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    "502938": { name: "بانک دی", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    "603769": { name: "بانک صادرات ایران", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    "610433": { name: "بانک ملت", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    "627353": { name: "بانک تجارت", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    "589463": { name: "بانک رفاه کارگران", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    "504172": { name: "بانک رسالت", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    "606373": { name: "بانک قرض‌الحسنه مهر ایران", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  };

  return bankMap[prefix] || { name: "شبکه بانکی شتاب", color: "text-neutral-400 bg-neutral-800 border-neutral-700" };
}

export function formatCardNumberSpaces(card: string): string {
  const clean = toEnglishDigits(card).replace(/[\s-]/g, "").replace(/\D/g, "").slice(0, 16);
  const parts = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  return parts.join(" - ");
}

export function formatShebaSpaces(sheba: string): string {
  let clean = toEnglishDigits(sheba).replace(/[\s-]/g, "").toUpperCase();
  if (!clean.startsWith("IR")) {
    clean = "IR" + clean.replace(/^IR/i, "");
  }
  clean = clean.slice(0, 26);
  const parts = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  return parts.join(" ");
}

interface WalletViewProps {
  mode?: "customer" | "partner";
}

export function WalletView({ mode = "customer" }: WalletViewProps) {
  const isPartner = mode === "partner";
  const {
    balance,
    transactions,
    withdrawals,
    isLoaded,
    isSyncing,
    refreshWallet,
    depositFunds,
    withdrawFunds,
  } = useDashboardWallet();

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Deposit modal state
  const [isDepositOpen, setIsDepositOpen] = React.useState<boolean>(false);
  const [depositAmount, setDepositAmount] = React.useState<number>(5000000);
  const [selectedGateway, setSelectedGateway] = React.useState<string>("زرین‌پال (درگاه شاپرک)");
  const [isDepositing, setIsDepositing] = React.useState<boolean>(false);

  // Withdrawal modal state
  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState<number>(isPartner ? 10000000 : 1000000);
  const [isWithdrawing, setIsWithdrawing] = React.useState<boolean>(false);
  const [withdrawError, setWithdrawError] = React.useState<string | null>(null);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = React.useState<string | null>(null);

  // User Profile with pre-registered bank information
  const [userProfile, setUserProfile] = React.useState<UserProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState<boolean>(false);

  const loadUserProfile = React.useCallback(async () => {
    setIsLoadingProfile(true);
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("velox_dashboard_profile_v2");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.shebaNumber) {
            setUserProfile(parsed);
          }
        }
      } catch {}
    }
    try {
      const p = await profileApi.getProfile();
      if (p) {
        setUserProfile(p);
        if (typeof window !== "undefined") {
          localStorage.setItem("velox_dashboard_profile_v2", JSON.stringify(p));
        }
      }
    } catch (err) {
      console.warn("Could not load user profile in wallet:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  React.useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const registeredSheba = userProfile?.shebaNumber?.trim() || "";
  const registeredCard = userProfile?.cardNumber?.trim() || "";
  const registeredBankName = userProfile?.bankName?.trim() || (registeredCard ? detectBankFromCardNumber(registeredCard).name : "بانک مقصد");
  const registeredHolder = userProfile?.accountHolderName?.trim() || userProfile?.fullName?.trim() || "صاحب حساب";
  const hasRegisteredBank = Boolean(registeredSheba && registeredSheba.length >= 26);

  React.useEffect(() => {
    if (isWithdrawOpen) {
      setWithdrawAmount(isPartner ? 10000000 : 1000000);
      setWithdrawError(null);
      setWithdrawSuccessMsg(null);
      loadUserProfile();
    }
  }, [isWithdrawOpen, isPartner, loadUserProfile]);

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    setIsDepositing(true);
    try {
      const paymentRes = await paymentApi.requestWalletCharge(depositAmount);
      if (paymentRes?.paymentUrl && typeof window !== "undefined") {
        window.location.href = paymentRes.paymentUrl;
        return;
      }
      throw new Error("آدرس درگاه پرداخت دریافت نشد.");
    } catch (err: any) {
      console.error("Wallet deposit error:", err);
      // Local fallback for offline/demo
      await depositFunds(depositAmount, selectedGateway);
      setIsDepositOpen(false);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccessMsg(null);

    // Role-based validation
    if (isPartner && withdrawAmount < 10000000) {
      setWithdrawError("حداقل مبلغ قابل برداشت برای همکاران ۱۰,۰۰۰,۰۰۰ تومان (۱۰ میلیون تومان) است.");
      return;
    }
    if (!isPartner && withdrawAmount <= 0) {
      setWithdrawError("مبلغ برداشت باید بیشتر از صفر باشد.");
      return;
    }

    const availableCash = balance.cashBalance || balance.totalUsable;
    if (withdrawAmount > availableCash) {
      setWithdrawError("مبلغ درخواستی بیشتر از موجودی نقدی قابل برداشت شماست.");
      return;
    }

    if (!hasRegisteredBank) {
      setWithdrawError("شماره شبا در پروفایل شما ثبت نشده است. لطفاً ابتدا در صفحه پروفایل شماره شبا و کارت خود را ثبت فرمایید.");
      return;
    }

    setIsWithdrawing(true);
    try {
      await withdrawFunds({
        amount: withdrawAmount,
        cardNumber: registeredCard || undefined,
        shabaNumber: registeredSheba,
        accountHolder: registeredHolder,
        bankName: registeredBankName,
      });

      setWithdrawSuccessMsg("درخواست برداشت شما با موفقیت ثبت شد و به صف حواله پایا واریز گردید.");
      setTimeout(() => {
        setIsWithdrawOpen(false);
        setWithdrawSuccessMsg(null);
      }, 1800);
    } catch (err: any) {
      setWithdrawError(err.message || "خطا در ثبت درخواست تسویه حساب.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Compute Financial Aggregates
  const totalDepositsAmount = React.useMemo(() => {
    return transactions
      .filter((t) => t.type === "deposit" || t.amount > 0)
      .reduce((acc, t) => acc + Math.max(0, t.amount), 0);
  }, [transactions]);

  const totalWithdrawalsAmount = React.useMemo(() => {
    const fromWithdrawals = withdrawals
      .filter((w) => w.status !== "REJECTED" && w.status !== "CANCELLED")
      .reduce((acc, w) => acc + w.amount, 0);

    const fromTx = transactions
      .filter((t) => t.type === "withdrawal")
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return Math.max(fromWithdrawals, fromTx);
  }, [withdrawals, transactions]);

  const pendingWithdrawalAmount = React.useMemo(() => {
    return withdrawals
      .filter((w) => w.status === "PENDING" || w.status === "PROCESSING")
      .reduce((acc, w) => acc + w.amount, 0);
  }, [withdrawals]);

  // Combined unified items list
  type FeedItem =
    | { kind: "withdrawal"; data: WalletWithdrawalItem; sortDate: string }
    | { kind: "transaction"; data: WalletTransaction; sortDate: string };

  const combinedFeed: FeedItem[] = React.useMemo(() => {
    const items: FeedItem[] = [];

    // Add withdrawal records
    withdrawals.forEach((w) => {
      items.push({
        kind: "withdrawal",
        data: w,
        sortDate: w.requestedAt,
      });
    });

    // Add transactions (deduplicating if same tracking code already in withdrawals)
    const wdrTrackingCodes = new Set(withdrawals.map((w) => w.trackingCode));
    transactions.forEach((tx) => {
      if (!wdrTrackingCodes.has(tx.trackingCode)) {
        items.push({
          kind: "transaction",
          data: tx,
          sortDate: tx.createdAt,
        });
      }
    });

    items.sort((a, b) => {
      const timeA = new Date(a.sortDate).getTime() || 0;
      const timeB = new Date(b.sortDate).getTime() || 0;
      return timeB - timeA;
    });

    return items;
  }, [withdrawals, transactions]);

  // Filtered feed
  const filteredFeed = React.useMemo(() => {
    return combinedFeed.filter((item) => {
      // Tab filter
      if (activeTab === "deposit") {
        if (item.kind !== "transaction" || (item.data.type !== "deposit" && item.data.type !== "refund")) return false;
      } else if (activeTab === "withdrawal") {
        if (item.kind === "withdrawal") return true;
        if (item.kind === "transaction" && item.data.type === "withdrawal") return true;
        return false;
      } else if (activeTab === "payment") {
        if (item.kind !== "transaction" || item.data.type !== "order_payment") return false;
      } else if (activeTab === "cashback") {
        if (item.kind !== "transaction" || item.data.type !== "cashback") return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (item.kind === "withdrawal") {
          const w = item.data;
          const matchCode = (w.trackingCode || "").toLowerCase().includes(q);
          const matchCard = (w.cardNumber || "").includes(q);
          const matchSheba = (w.shabaNumber || "").toLowerCase().includes(q);
          const matchBank = (w.bankAccountTitle || "").toLowerCase().includes(q);
          if (!matchCode && !matchCard && !matchSheba && !matchBank) return false;
        } else {
          const tx = item.data;
          const matchTracking = (tx.trackingCode || "").toLowerCase().includes(q);
          const matchTitle = (tx.title || "").toLowerCase().includes(q);
          if (!matchTracking && !matchTitle) return false;
        }
      }

      return true;
    });
  }, [combinedFeed, activeTab, searchQuery]);

  const quickAmounts = [1000000, 2000000, 5000000, 10000000, 20000000];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title={isPartner ? "کیف پول و موجودی نقدی همکار" : "کیف پول و مدیریت اعتبارات"}
        description={
          isPartner
            ? "مدیریت موجودی آزاد، تسویه پورسانت‌های فروش سازمانی به شماره کارت و شبا، واریزی‌های آنلاین و پیگیری واریزهای پایا"
            : "مدیریت موجودی نقد، شارژ آنی از درگاه‌های شتاب، تسویه وجه به شماره کارت و شبا، پاداش‌های بازگشت نقدی (Cashback)"
        }
        icon={Wallet}
        badge={isPartner ? "سطح همکاری تجاری" : "تسویه آنی شتاب"}
        badgeVariant={isPartner ? "sky" : "emerald"}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshWallet()}
              disabled={isSyncing}
              className="text-xs gap-1.5 border-neutral-700 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              title="بروزرسانی وضعیت"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-orange-400" : "text-neutral-400"}`} />
              <span className="hidden sm:inline">بروزرسانی</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWithdrawError(null);
                setWithdrawSuccessMsg(null);
                setIsWithdrawOpen(true);
              }}
              className="text-xs gap-1.5 border-neutral-700 text-neutral-200 hover:bg-neutral-800 cursor-pointer"
            >
              <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
              <span>درخواست برداشت</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setIsDepositOpen(true)}
              className="text-xs gap-1.5 font-bold cursor-pointer shadow-md shadow-orange-500/15"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ شارژ کیف پول</span>
            </Button>
          </div>
        }
      />

      {/* ── 2. Hero Balance & Metrics Cards ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Usable Balance */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-neutral-900 via-[var(--theme-surface)] to-neutral-900 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400 font-medium">موجودی نقدی آزاد</span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                قابل برداشت
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {formatPrice(balance.cashBalance || balance.totalUsable)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-800/80">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>تسویه شتاب و پایا</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setWithdrawError(null);
                setWithdrawSuccessMsg(null);
                setIsWithdrawOpen(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
            >
              <CreditCard className="h-3 w-3" />
              <span>درخواست برداشت</span>
            </button>
          </div>
        </div>

        {/* Total Deposits */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">مجموع واریزی‌ها و شارژ</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {formatPrice(totalDepositsAmount)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            شارژ مستقیم آنلاین و استرداد وجه
          </div>
        </div>

        {/* Total Withdrawals */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">مجموع برداشتی‌ها و تسویه</span>
            <span className="p-1.5 rounded-xl bg-neutral-800 text-neutral-300">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-neutral-200">
            {formatPrice(totalWithdrawalsAmount)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            انتقال یافته به شماره حساب و شبای بانکی
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-[var(--theme-surface)] to-neutral-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400 font-medium">در انتظار بررسی تسویه</span>
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {formatPrice(pendingWithdrawalAmount)}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-2">
            {withdrawals.filter((w) => w.status === "PENDING" || w.status === "PROCESSING").length} درخواست در صف پرداخت پایا
          </div>
        </div>
      </div>

      {/* ── 3. Filter Bar ─────────────────────────────────────────── */}
      <DashboardFilterBar
        tabs={[
          { key: "all", label: "همه تراکنش‌ها", count: combinedFeed.length },
          {
            key: "deposit",
            label: "واریزی‌ها و شارژ آنلاین",
            count: combinedFeed.filter(
              (i) => i.kind === "transaction" && (i.data.type === "deposit" || i.data.type === "refund")
            ).length,
          },
          {
            key: "withdrawal",
            label: "برداشتی‌ها و تسویه وجه",
            count: combinedFeed.filter((i) => i.kind === "withdrawal" || (i.kind === "transaction" && i.data.type === "withdrawal")).length,
          },
          { key: "payment", label: "پرداخت سفارشات" },
          { key: "cashback", label: "پاداش و کش‌بک" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="جستجو با شناسه رهگیری، شماره کارت، شبا یا عنوان..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── 4. Unified Transactions & Withdrawals List ─────────────── */}
      {filteredFeed.length === 0 ? (
        <DashboardEmptyState
          icon={Wallet}
          title="هیچ رکوردی یافت نشد"
          description="تراکنش یا درخواست برداشتی مطابق با فیلتر یا جستجوی انتخابی موجود نیست."
        />
      ) : (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-xs">
          {/* Mobile Card View (< sm) */}
          <div className="sm:hidden flex flex-col divide-y divide-neutral-800/80">
            {filteredFeed.map((item) => {
              if (item.kind === "withdrawal") {
                const w = item.data;
                const bank = detectBankFromCardNumber(w.cardNumber || "");
                const isPending = w.status === "PENDING" || w.status === "PROCESSING";
                const isSuccess = w.status === "COMPLETED";
                const isRejected = w.status === "REJECTED" || w.status === "CANCELLED";

                return (
                  <div key={w.id} className="p-4 flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-neutral-200">
                            درخواست برداشت وجه ({bank.name})
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {formatDisplayDate(w.requestedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-left font-mono font-bold text-sm text-rose-400">
                        -{formatPrice(w.amount)}
                      </div>
                    </div>

                    {/* Bank & Card Details */}
                    <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/60 flex flex-col gap-1 text-[11px] font-mono text-neutral-300">
                      {w.cardNumber && (
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400">شماره کارت:</span>
                          <span className="text-white font-bold">{formatCardNumberSpaces(w.cardNumber)}</span>
                        </div>
                      )}
                      {w.shabaNumber && (
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400">شماره شبا:</span>
                          <span className="text-sky-300">{w.shabaNumber}</span>
                        </div>
                      )}
                      {w.payoutReference && (
                        <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-neutral-800">
                          <span>کد پیگیری پایا:</span>
                          <span>{w.payoutReference}</span>
                        </div>
                      )}
                      {w.rejectionReason && (
                        <div className="text-rose-400 pt-1 border-t border-neutral-800 text-[10px]">
                          علت رد: {w.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-900">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
                        <span>پیگیری: {w.trackingCode || w.id.slice(0, 8)}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(w.trackingCode || w.id, w.id)}
                          className="text-neutral-500 hover:text-white p-1 cursor-pointer"
                        >
                          {copiedId === w.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      <DashboardStatusBadge
                        label={w.statusLabel}
                        variant={isSuccess ? "success" : isRejected ? "danger" : "warning"}
                        size="sm"
                      />
                    </div>
                  </div>
                );
              }

              // Standard transaction
              const tx = item.data;
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                          isPositive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-neutral-200">{tx.title}</span>
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {formatDisplayDate(tx.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono font-bold text-sm">
                      <span className={isPositive ? "text-emerald-400" : "text-neutral-200"}>
                        {isPositive ? "+" : ""}
                        {formatPrice(tx.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-900">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
                      <span>پیگیری: {tx.trackingCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(tx.trackingCode, tx.id)}
                        className="text-neutral-500 hover:text-white p-1 cursor-pointer"
                      >
                        {copiedId === tx.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    <DashboardStatusBadge
                      label={tx.statusLabel}
                      variant={tx.status === "successful" ? "success" : "warning"}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs text-right divide-y divide-neutral-800 min-w-[700px]">
              <thead className="bg-neutral-900/60 text-neutral-400 font-semibold">
                <tr>
                  <th className="p-4 sm:px-6">نوع و عنوان عملیات</th>
                  <th className="p-4">مشخصات کارت / شبا / درگاه</th>
                  <th className="p-4">تاریخ و ساعت</th>
                  <th className="p-4">شناسه پیگیری</th>
                  <th className="p-4">مبلغ</th>
                  <th className="p-4">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {filteredFeed.map((item) => {
                  if (item.kind === "withdrawal") {
                    const w = item.data;
                    const bank = detectBankFromCardNumber(w.cardNumber || "");
                    const isSuccess = w.status === "COMPLETED";
                    const isRejected = w.status === "REJECTED" || w.status === "CANCELLED";

                    return (
                      <tr key={w.id} className="hover:bg-neutral-900/30 transition-colors">
                        <td className="p-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <CreditCard className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-neutral-200">
                                درخواست برداشت و تسویه
                              </span>
                              <span className="text-[11px] text-amber-400">
                                {bank.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-[11px]">
                          <div className="flex flex-col gap-0.5">
                            {w.cardNumber && (
                              <span className="text-white font-semibold">
                                {formatCardNumberSpaces(w.cardNumber)}
                              </span>
                            )}
                            {w.shabaNumber && (
                              <span className="text-neutral-400">{w.shabaNumber}</span>
                            )}
                            {w.payoutReference && (
                              <span className="text-emerald-400 text-[10px]">
                                ارجاع پایا: {w.payoutReference}
                              </span>
                            )}
                            {w.rejectionReason && (
                              <span className="text-rose-400 text-[10px]">
                                علت رد: {w.rejectionReason}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 font-mono text-neutral-400">
                          {formatDisplayDate(w.requestedAt)}
                        </td>

                        <td className="p-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span>{w.trackingCode || w.id.slice(0, 8)}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(w.trackingCode || w.id, w.id)}
                              className="text-neutral-500 hover:text-white cursor-pointer"
                            >
                              {copiedId === w.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-bold text-rose-400">
                          -{formatPrice(w.amount)}
                        </td>

                        <td className="p-4">
                          <DashboardStatusBadge
                            label={w.statusLabel}
                            variant={isSuccess ? "success" : isRejected ? "danger" : "warning"}
                            size="sm"
                          />
                        </td>
                      </tr>
                    );
                  }

                  // Standard Transaction
                  const tx = item.data;
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-neutral-900/30 transition-colors">
                      <td className="p-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                              isPositive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                            }`}
                          >
                            {isPositive ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-200">{tx.title}</span>
                            <span className="text-[11px] text-neutral-400">{tx.typeLabel}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-neutral-400 text-[11px]">
                        {tx.gatewayName || (tx.type === "deposit" ? "درگاه شاپرک" : "کیف پول")}
                      </td>

                      <td className="p-4 font-mono text-neutral-400">
                        {formatDisplayDate(tx.createdAt)}
                      </td>

                      <td className="p-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{tx.trackingCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.trackingCode, tx.id)}
                            className="text-neutral-500 hover:text-white cursor-pointer"
                          >
                            {copiedId === tx.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold">
                        <span className={isPositive ? "text-emerald-400" : "text-neutral-200"}>
                          {isPositive ? "+" : ""}
                          {formatPrice(tx.amount)}
                        </span>
                      </td>

                      <td className="p-4">
                        <DashboardStatusBadge
                          label={tx.statusLabel}
                          variant={tx.status === "successful" ? "success" : "warning"}
                          size="sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. Instant Deposit Modal ───────────────────────────────── */}
      <DashboardModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        title="شارژ آنی موجودی کیف پول"
        description="اتصال به درگاه امن شبکه پرداخت الکترونیک شاپرک و افزایش بلادرنگ اعتبار حساب"
        maxWidth="md"
      >
        <form onSubmit={handleDepositSubmit} className="flex flex-col gap-5 text-right" dir="rtl">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              انتخاب مبالغ پیشنهادی:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className={`p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                    depositAmount === amt
                      ? "border-orange-500 bg-orange-500/15 text-orange-400"
                      : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {formatPrice(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              یا مبلغ دلخواه (تومان):
            </label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              min={100000}
              step={100000}
              className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-sm font-mono text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              انتخاب درگاه پرداخت بانکی:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {["زرین‌پال (درگاه شاپرک)", "سامان کیش (بانک سامان)", "به‌پرداخت ملت", "سداد (بانک ملی)"].map((gw) => (
                <button
                  key={gw}
                  type="button"
                  onClick={() => setSelectedGateway(gw)}
                  className={`p-3 rounded-xl border font-semibold flex items-center justify-between cursor-pointer ${
                    selectedGateway === gw
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <span>{gw}</span>
                  {selectedGateway === gw && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDepositOpen(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              isLoading={isDepositing}
              className="font-bold"
            >
              انتقال به درگاه و افزایش اعتبار
            </Button>
          </div>
        </form>
      </DashboardModal>

      {/* ── 6. Comprehensive Withdrawal Modal (Pre-registered Bank in Profile + Partner Limit + Disclaimer) ── */}
      <DashboardModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="درخواست برداشت و تسویه وجه"
        description={
          isPartner
            ? "تسویه موجودی کیف پول به حساب بانکی از پیش ثبت‌شده همکار (حداقل ۱۰ میلیون تومان)"
            : "تسویه موجودی آزاد کیف پول به حساب بانکی ثبت‌شده در پروفایل شما"
        }
        maxWidth="lg"
      >
        <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4 text-right" dir="rtl">
          {withdrawError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{withdrawError}</span>
            </div>
          )}

          {withdrawSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{withdrawSuccessMsg}</span>
            </div>
          )}

          {/* Balance Preview */}
          <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between">
            <span className="text-xs text-neutral-400">موجودی نقدی قابل برداشت شما:</span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {formatPrice(balance.cashBalance || balance.totalUsable)}
            </span>
          </div>

          {/* Tier and Role Information Notice */}
          {isPartner ? (
            <div className="text-[11px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3.5 py-2 rounded-xl flex items-center justify-between">
              <span>سطح همکاری سازمانی: حداقل مبلغ هر درخواست تسویه ۱۰,۰۰۰,۰۰۰ تومان است.</span>
              <span className="font-mono font-bold">۱۰ میلیون تومان</span>
            </div>
          ) : (
            <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
              کاربر گرامی، شما می‌توانید در هر زمان هر مبلغ دلخواهی از موجودی آزاد خود را برداشت فرمایید.
            </div>
          )}

          {/* Pre-registered Bank Details Verification */}
          {!hasRegisteredBank ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 leading-relaxed text-xs">
                  <span className="font-bold text-amber-300 text-sm">شماره شبا و حساب بانکی در پروفایل شما ثبت نشده است</span>
                  <span className="text-neutral-300">
                    نیازی به ورود مجدد اطلاعات بانکی در هر درخواست نیست؛ اطلاعات حساب باید از پیش در پروفایل شما ثبت شده باشد. لطفاً ابتدا در پروفایل مشخصات حساب بانکی را ثبت فرمایید.
                  </span>
                </div>
              </div>
              <Link
                href={isPartner ? "/partner/profile" : "/dashboard/profile"}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors self-start"
              >
                <span>ورود به پروفایل و ثبت حساب بانکی</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-neutral-200">مشخصات حساب بانکی مقصد (از پیش ثبت‌شده در پروفایل):</span>
                </div>
                <Link
                  href={isPartner ? "/partner/profile" : "/dashboard/profile"}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                >
                  <span>ویرایش در پروفایل</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
                  <span className="text-neutral-400 font-sans">بانک صادرکننده:</span>
                  <span className="text-white font-bold font-sans">{registeredBankName}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
                  <span className="text-neutral-400 font-sans">صاحب حساب:</span>
                  <span className="text-white font-bold font-sans">{registeredHolder}</span>
                </div>
                {registeredCard && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
                    <span className="text-neutral-400 font-sans">شماره کارت:</span>
                    <span className="text-white font-bold tracking-wider">{formatCardNumberSpaces(registeredCard)}</span>
                  </div>
                )}
                <div className={`flex items-center justify-between p-2 rounded-xl bg-neutral-950/70 border border-neutral-800/60 ${!registeredCard ? 'sm:col-span-2' : ''}`}>
                  <span className="text-neutral-400 font-sans">شماره شبا:</span>
                  <span className="text-sky-400 font-bold tracking-wider" dir="ltr">{registeredSheba}</span>
                </div>
              </div>
            </div>
          )}

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                مبلغ درخواستی برداشت (تومان):
              </label>
              <button
                type="button"
                disabled={!hasRegisteredBank}
                onClick={() => setWithdrawAmount(balance.cashBalance || balance.totalUsable)}
                className="text-[11px] text-orange-400 hover:text-orange-300 font-bold cursor-pointer disabled:opacity-50"
              >
                کل موجودی قابل برداشت
              </button>
            </div>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              max={balance.cashBalance || balance.totalUsable}
              min={isPartner ? 10000000 : 10000}
              step={isPartner ? 500000 : 50000}
              disabled={!hasRegisteredBank}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-sm font-mono text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"
            />
            {/* Quick buttons */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(isPartner ? [10000000, 20000000, 50000000] : [500000, 1000000, 2000000]).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  disabled={!hasRegisteredBank}
                  onClick={() => setWithdrawAmount(amt)}
                  className={`p-2 rounded-xl border text-[11px] font-mono transition-all cursor-pointer disabled:opacity-50 ${
                    withdrawAmount === amt
                      ? "border-orange-500 bg-orange-500/15 text-orange-400 font-bold"
                      : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {formatPrice(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* ── CRITICAL MANDATORY DISCLAIMER BOX ─────────────────── */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-bold text-amber-300">هشدار سلب مسئولیت:</span>
              <span className="text-amber-200/90 font-medium">
                اگر شماره کارت یا شبا اشتباه وارد شده بود سایت هیچ مسئولیتی ندارد.
              </span>
              <span className="text-[11px] text-neutral-400">
                تسویه وجه تماماً بر اساس اطلاعات حساب بانکی ثبت‌شده در پروفایل شما انجام می‌شود و مبالغ واریز شده به حساب‌های اشتباه قابل استرداد نخواهند بود.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawOpen(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              isLoading={isWithdrawing}
              disabled={isWithdrawing || !hasRegisteredBank}
              className="font-bold bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50"
            >
              تایید و ثبت درخواست برداشت
            </Button>
          </div>
        </form>
      </DashboardModal>
    </div>
  );
}
