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
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { useDashboardWallet } from "../hooks/use-dashboard-wallet";
import { TransactionType, WalletTransaction } from "../types/wallet.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardFilterBar,
  DashboardStatusBadge,
  DashboardEmptyState,
  DashboardModal,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function WalletView() {
  const { balance, transactions, isLoaded, depositFunds, withdrawFunds } = useDashboardWallet();

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = React.useState<boolean>(false);
  const [depositAmount, setDepositAmount] = React.useState<number>(5000000);
  const [selectedGateway, setSelectedGateway] = React.useState<string>("سامان کیش");
  const [isDepositing, setIsDepositing] = React.useState<boolean>(false);

  const [isWithdrawOpen, setIsWithdrawOpen] = React.useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState<number>(1000000);
  const [shebaInput, setShebaInput] = React.useState<string>("IR120170000000109283746501");
  const [accountHolder, setAccountHolder] = React.useState<string>("عرفان رضایی");
  const [isWithdrawing, setIsWithdrawing] = React.useState<boolean>(false);
  const [withdrawError, setWithdrawError] = React.useState<string | null>(null);

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
    await new Promise((r) => setTimeout(r, 600)); // simulated latency
    await depositFunds(depositAmount, selectedGateway);
    setIsDepositing(false);
    setIsDepositOpen(false);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    if (withdrawAmount <= 0) {
      setWithdrawError("مبلغ برداشت باید بیشتر از صفر باشد.");
      return;
    }
    if (withdrawAmount > balance.cashBalance) {
      setWithdrawError("مبلغ درخواستی بیشتر از موجودی نقدی قابل برداشت شماست.");
      return;
    }
    if (!shebaInput.startsWith("IR") || shebaInput.length < 24) {
      setWithdrawError("شماره شبا باید با IR شروع شده و ۲۶ کاراکتر معتبر باشد.");
      return;
    }

    setIsWithdrawing(true);
    await new Promise((r) => setTimeout(r, 600));
    try {
      await withdrawFunds(withdrawAmount, shebaInput);
      setIsWithdrawing(false);
      setIsWithdrawOpen(false);
    } catch (err: any) {
      setWithdrawError(err.message || "خطا در ثبت درخواست تسویه");
      setIsWithdrawing(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Tab filter
      if (activeTab === "deposit" && tx.type !== "deposit") return false;
      if (activeTab === "payment" && tx.type !== "order_payment") return false;
      if (activeTab === "cashback" && tx.type !== "cashback") return false;
      if (activeTab === "withdrawal" && tx.type !== "withdrawal") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTracking = tx.trackingCode.toLowerCase().includes(q);
        const matchTitle = tx.title.toLowerCase().includes(q);
        if (!matchTracking && !matchTitle) return false;
      }

      return true;
    });
  }, [transactions, activeTab, searchQuery]);

  const quickAmounts = [1000000, 2000000, 5000000, 10000000, 20000000];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="کیف پول و مدیریت اعتبارات"
        description="مدیریت موجودی نقد، شارژ آنی از درگاه‌های شتاب، پاداش‌های بازگشت نقدی (Cashback) و تسویه به شماره شبا"
        icon={Wallet}
        badge="تسویه آنی شتاب"
        badgeVariant="emerald"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawOpen(true)}
              className="text-xs gap-1.5 border-neutral-700 text-neutral-200 hover:bg-neutral-800 cursor-pointer"
            >
              <ArrowDownLeft className="h-3.5 w-3.5 text-neutral-400" />
              <span>تسویه به شبا</span>
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

      {/* ── 2. Hero Balance & Credit Card ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-gradient-to-br from-neutral-900 via-[var(--theme-surface)] to-neutral-900 p-5 sm:p-8 shadow-xl text-right">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Main Usable Balance */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">موجودی نقدی و قابل استفاده:</span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                فعال و تایید شده
              </span>
            </div>

            <div className="text-2xl sm:text-4xl font-black font-mono text-[var(--theme-foreground)] break-words tracking-tight">
              {formatPrice(balance.totalUsable)}
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-neutral-400 mt-1 sm:mt-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <span>نقد آزاد: {formatPrice(balance.cashBalance)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-400 shrink-0" />
                <span>پاداش کش‌بک: {formatPrice(balance.giftOrCashbackBalance)}</span>
              </div>
            </div>
          </div>

          {/* Corporate B2B Credit Tier */}
          {balance.b2bCreditLimit && (
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold gap-2">
                <span className="text-neutral-300 flex items-center gap-1.5 shrink-0">
                  <Building className="h-3.5 w-3.5 text-sky-400" />
                  <span>خط اعتباری B2B:</span>
                </span>
                <span className="text-sky-400 font-mono text-left">
                  {formatPrice(balance.b2bCreditLimit)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all"
                  style={{
                    width: `${((balance.b2bCreditUsed || 0) / balance.b2bCreditLimit) * 100}%`,
                  }}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between text-[11px] text-neutral-400 font-mono gap-1 pt-0.5">
                <span>مصرف شده: {formatPrice(balance.b2bCreditUsed || 0)}</span>
                <span className="text-emerald-400">
                  باقی‌مانده: {formatPrice(balance.b2bCreditLimit - (balance.b2bCreditUsed || 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Filter Bar ─────────────────────────────────────────── */}
      <DashboardFilterBar
        tabs={[
          { key: "all", label: "همه تراکنش‌ها", count: transactions.length },
          { key: "deposit", label: "شارژ و واریز" },
          { key: "payment", label: "پرداخت سفارش" },
          { key: "cashback", label: "پاداش و کش‌بک" },
          { key: "withdrawal", label: "تسویه به حساب" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="جستجو با شناسه تراکنش یا عنوان..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── 4. Transactions List ──────────────────────────────────── */}
      {filteredTransactions.length === 0 ? (
        <DashboardEmptyState
          icon={Wallet}
          title="تراکنشی یافت نشد"
          description="تراکنشی با فیلتر انتخابی شما در سابقه حساب موجود نیست."
        />
      ) : (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-xs">
          {/* Mobile Card View (< sm) */}
          <div className="sm:hidden flex flex-col divide-y divide-neutral-800/80">
            {filteredTransactions.map((tx) => {
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
                          {toPersianDigits(tx.createdAt)}
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
            <table className="w-full text-xs text-right divide-y divide-neutral-800 min-w-[500px]">
              <thead className="bg-neutral-900/60 text-neutral-400 font-semibold">
                <tr>
                  <th className="p-4 sm:px-6">نوع و عنوان تراکنش</th>
                  <th className="p-4">تاریخ و ساعت</th>
                  <th className="p-4">شناسه پیگیری</th>
                  <th className="p-4">مبلغ</th>
                  <th className="p-4">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {filteredTransactions.map((tx) => {
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

                      <td className="p-4 font-mono text-neutral-400">
                        {toPersianDigits(tx.createdAt)}
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
              {["سامان کیش (بانک سامان)", "به‌پرداخت ملت", "سداد (بانک ملی)", "زرین‌پال"].map((gw) => (
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

      {/* ── 6. Withdraw To Sheba Modal ─────────────────────────────── */}
      <DashboardModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="درخواست تسویه و برداشت وجه به شبا"
        description="انتقال مانده نقدی کیف پول به شماره شبای ثبت‌شده در سامانه بانکی"
        maxWidth="md"
      >
        <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4 text-right" dir="rtl">
          {withdrawError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{withdrawError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              موجودی نقدی قابل برداشت:
            </label>
            <div className="text-sm font-mono font-bold text-emerald-400">
              {formatPrice(balance.cashBalance)}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              مبلغ درخواستی تسویه (تومان):
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              max={balance.cashBalance}
              min={100000}
              className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-sm font-mono text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              شماره شبا بانکی (۲۴ رقم به همراه IR):
            </label>
            <input
              type="text"
              value={shebaInput}
              onChange={(e) => setShebaInput(e.target.value)}
              placeholder="IR..."
              className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              نام صاحب حساب:
            </label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
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
              className="font-bold"
            >
              ثبت درخواست تسویه
            </Button>
          </div>
        </form>
      </DashboardModal>
    </div>
  );
}
