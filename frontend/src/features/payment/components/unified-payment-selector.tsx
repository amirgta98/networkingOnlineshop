"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Wallet,
  Building2,
  FileCheck2,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Info,
  UploadCloud,
  FileImage,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import {
  paymentApi,
  PaymentConfigResponse,
  PaymentGatewayItem,
  BankAccountItem,
} from "../api/payment-api";

export interface UnifiedPaymentSelectorProps {
  amount: number;
  selectedMethod: string;
  onSelectMethod: (method: string, extra?: { gatewayId?: string; bankAccountId?: string; receiptUrl?: string; receiptNumber?: string }) => void;
  selectedGatewayId?: string;
  onSelectGateway?: (id: string) => void;
  selectedBankAccountId?: string;
  onSelectBankAccount?: (id: string) => void;
  targetType?: "ORDER" | "INTERNET_ORDER" | "WALLET" | "INVOICE";
  disabled?: boolean;
  userWalletBalance?: number;
  isPartner?: boolean;
  className?: string;
  receiptUrl?: string;
  onReceiptUrlChange?: (url: string) => void;
  receiptNumber?: string;
  onReceiptNumberChange?: (num: string) => void;
}

export function UnifiedPaymentSelector({
  amount,
  selectedMethod,
  onSelectMethod,
  selectedGatewayId,
  onSelectGateway,
  selectedBankAccountId,
  onSelectBankAccount,
  targetType = "INTERNET_ORDER",
  disabled = false,
  userWalletBalance,
  isPartner = false,
  className = "",
  receiptUrl: propReceiptUrl,
  onReceiptUrlChange,
  receiptNumber: propReceiptNumber,
  onReceiptNumberChange,
}: UnifiedPaymentSelectorProps) {
  const [config, setConfig] = useState<PaymentConfigResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [localReceiptUrl, setLocalReceiptUrl] = useState<string>(propReceiptUrl || "");
  const [localReceiptNumber, setLocalReceiptNumber] = useState<string>(propReceiptNumber || "");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptUploadError, setReceiptUploadError] = useState<string | null>(null);
  const receiptInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (propReceiptUrl !== undefined) setLocalReceiptUrl(propReceiptUrl);
  }, [propReceiptUrl]);

  useEffect(() => {
    if (propReceiptNumber !== undefined) setLocalReceiptNumber(propReceiptNumber);
  }, [propReceiptNumber]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingReceipt(true);
      setReceiptUploadError(null);
      const res = await paymentApi.uploadReceipt(file);
      if (res && res.url) {
        setLocalReceiptUrl(res.url);
        onReceiptUrlChange?.(res.url);
        onSelectMethod(selectedMethod, {
          gatewayId: selectedGatewayId,
          bankAccountId: selectedBankAccountId,
          receiptUrl: res.url,
          receiptNumber: localReceiptNumber,
        });
      }
    } catch (err: any) {
      console.error("Receipt upload error:", err);
      const msg = err?.response?.data?.message || err?.message || "خطا در بارگذاری تصویر فیش";
      setReceiptUploadError(Array.isArray(msg) ? msg.join(" - ") : msg);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const data = await paymentApi.getPaymentConfig();
        if (isMounted) {
          setConfig(data);
          // Auto select default gateway
          if (!selectedGatewayId && data.gateways?.length > 0) {
            const defGateway = data.gateways.find((g) => g.isDefault) || data.gateways[0];
            if (defGateway && onSelectGateway) {
              onSelectGateway(defGateway.id);
            }
          }
          // Auto select default bank account
          if (!selectedBankAccountId && data.bankAccounts?.length > 0) {
            const defBank = data.bankAccounts.find((b) => b.isDefault) || data.bankAccounts[0];
            if (defBank && onSelectBankAccount) {
              onSelectBankAccount(defBank.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load payment config:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Determine current effective wallet balance
  const effectiveWalletBalance =
    userWalletBalance !== undefined
      ? userWalletBalance
      : config?.userWallet?.totalUsable ?? 0;

  const isWalletInsufficient =
    targetType !== "WALLET" && effectiveWalletBalance < amount;

  const settings = config?.settings || {
    isSandboxMode: true,
    isWalletEnabled: true,
    isCardToCardEnabled: true,
    isChequeEnabled: true,
    isCorporateCreditEnabled: true,
    minWalletRecharge: 10000,
    maxWalletRecharge: 500000000,
  };

  const gateways = config?.gateways || [];
  const bankAccounts = config?.bankAccounts || [];
  const selectedBank =
    bankAccounts.find((b) => b.id === selectedBankAccountId) || bankAccounts[0];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          انتخاب شیوه پرداخت
        </h3>
        {settings.isSandboxMode && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3 h-3" />
            محیط تستی سندباکس فعال است
          </span>
        )}
      </div>

      {/* Payment Method Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Online Gateway */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectMethod("online_gateway")}
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-right transition-all relative ${
            selectedMethod === "online_gateway"
              ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              selectedMethod === "online_gateway"
                ? "bg-primary text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                پرداخت اینترنتی شاپرک
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                آنی و مستقیم
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              کلیه کارت‌های عضو شبکه شتاب (زرین‌پال)
            </p>
          </div>
        </button>

        {/* 2. Wallet Settlement (only if target is not charging wallet itself) */}
        {targetType !== "WALLET" && settings.isWalletEnabled && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectMethod("wallet")}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-right transition-all relative ${
              selectedMethod === "wallet"
                ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedMethod === "wallet"
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  تسویه از کیف پول
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isWalletInsufficient
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {effectiveWalletBalance.toLocaleString("fa-IR")} ت
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                کسر مستقیم از مانده موجودی حساب کاربری
              </p>
            </div>
          </button>
        )}

        {/* 3. Card-to-Card / Bank Transfer */}
        {settings.isCardToCardEnabled && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectMethod("card_to_card")}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-right transition-all relative ${
              selectedMethod === "card_to_card" || selectedMethod === "bank_transfer"
                ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedMethod === "card_to_card" || selectedMethod === "bank_transfer"
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  کارت به کارت / حواله شبا
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                  واریز بانکی
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                شماره شبا و حساب رسمی شرکت
              </p>
            </div>
          </button>
        )}

        {/* 4. Corporate Credit (B2B Partners) */}
        {(isPartner || settings.isCorporateCreditEnabled) && targetType !== "WALLET" && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectMethod("corporate_credit")}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-right transition-all relative ${
              selectedMethod === "corporate_credit"
                ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedMethod === "corporate_credit"
                  ? "bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  اعتبار سازمانی B2B
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
                  ویژه همکاران
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                تسویه اعتباری با سررسید دوره‌ای
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Detailed Section based on selection */}

      {/* A. When Online Gateway Selected */}
      {selectedMethod === "online_gateway" && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              درگاه پرداخت انتخابی:
            </span>
            <span className="font-bold text-primary flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {gateways.find((g) => g.id === selectedGatewayId)?.name ||
                "درگاه امن شاپرک زرین‌پال"}
            </span>
          </div>

          {gateways.length > 1 && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              {gateways.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onSelectGateway && onSelectGateway(g.id)}
                  className={`p-2 rounded-lg text-xs font-medium text-right border transition-all ${
                    selectedGatewayId === g.id
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            پس از تایید، به درگاه شاپرک متصل خواهید شد. پس از پرداخت آنلاین، فاکتور و سرویس شما بلافاصله فعال شده و پیامک تایید به شماره شما ارسال می‌شود.
          </div>
        </div>
      )}

      {/* B. When Wallet Selected */}
      {selectedMethod === "wallet" && (
        <div className="space-y-2">
          {isWalletInsufficient ? (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold mb-1">موجودی کیف پول شما کافی نیست!</p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-400">
                    موجودی فعلی:{" "}
                    <span className="font-bold font-mono">
                      {effectiveWalletBalance.toLocaleString("fa-IR")} تومان
                    </span>{" "}
                    | مبلغ قابل پرداخت:{" "}
                    <span className="font-bold font-mono">
                      {amount.toLocaleString("fa-IR")} تومان
                    </span>
                  </p>
                  <p className="text-[11px] mt-1 text-rose-600/90 dark:text-rose-400/90">
                    کسری موجودی:{" "}
                    <span className="font-bold font-mono">
                      {(amount - effectiveWalletBalance).toLocaleString("fa-IR")} تومان
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-rose-500/20">
                <button
                  type="button"
                  onClick={() => onSelectMethod("online_gateway")}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all shadow-sm"
                >
                  پرداخت کل مبلغ از درگاه شاپرک
                </button>
                <a
                  href="/dashboard/wallet"
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-rose-900 text-[11px] font-medium inline-flex items-center gap-1 hover:bg-slate-50 transition-all"
                >
                  شارژ آنلاین کیف پول
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">موجودی کیف پول شما کافی است</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  مانده موجودی پس از کسر:{" "}
                  <span className="font-bold font-mono">
                    {(effectiveWalletBalance - amount).toLocaleString("fa-IR")} تومان
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* C. When Card-to-Card Selected */}
      {(selectedMethod === "card_to_card" || selectedMethod === "bank_transfer") && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              اطلاعات حساب رسمی جهت واریز:
            </span>
            {bankAccounts.length > 1 && (
              <span className="text-[11px] text-slate-500">انتخاب حساب بانکی</span>
            )}
          </div>

          {bankAccounts.length > 1 && (
            <div className="grid grid-cols-2 gap-2">
              {bankAccounts.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBankAccount && onSelectBankAccount(b.id)}
                  className={`p-2 rounded-lg text-xs font-medium text-right border transition-all ${
                    selectedBank?.id === b.id
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {b.bankName}
                </button>
              ))}
            </div>
          )}

          {selectedBank && (
            <div className="space-y-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">بانک و صاحب حساب:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedBank.bankName} - {selectedBank.accountOwner}
                </span>
              </div>

              {selectedBank.cardNumber && (
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">شماره کارت:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white dir-ltr">
                      {selectedBank.cardNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(selectedBank.cardNumber.replace(/[^0-9]/g, ""), "card")
                      }
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                      title="کپی شماره کارت"
                    >
                      {copiedField === "card" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {selectedBank.shebaNumber && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">شماره شبا (IBAN):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] dir-ltr">
                      {selectedBank.shebaNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedBank.shebaNumber, "sheba")}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                      title="کپی شماره شبا"
                    >
                      {copiedField === "sheba" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Receipt Upload Widget */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-blue-500" />
                ارسال فیش یا عکس پرداخت کارت به کارت
                <span className="text-rose-500">*</span>
              </span>
              <span className="text-[10px] text-slate-500">حداکثر ۱۰ مگابایت (JPG, PNG, PDF)</span>
            </div>

            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {localReceiptUrl ? (
              <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 border border-emerald-500/30 shrink-0 flex items-center justify-center">
                    {localReceiptUrl.endsWith(".pdf") ? (
                      <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={localReceiptUrl} alt="فیش" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      فیش با موفقیت ضمیمه شد
                    </p>
                    <a
                      href={localReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 dark:text-blue-400 underline"
                    >
                      مشاهده تصویر فیش
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLocalReceiptUrl("");
                    onReceiptUrlChange?.("");
                    if (receiptInputRef.current) receiptInputRef.current.value = "";
                  }}
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors"
                  title="حذف فیش"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => receiptInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 p-4 rounded-xl text-center cursor-pointer transition-all bg-white dark:bg-slate-800/60"
              >
                {isUploadingReceipt ? (
                  <div className="flex flex-col items-center justify-center gap-1 py-1">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-300">در حال بارگذاری فیش واریزی...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <UploadCloud className="w-5 h-5 text-blue-500" />
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      کلیک برای انتخاب یا آپلود عکس فیش پرداخت
                    </p>
                    <p className="text-[10px] text-slate-500">
                      عکس فیش خودپرداز یا رسید انتقال اینترنتی (همراه بانک، آپ، بلو و...)
                    </p>
                  </div>
                )}
              </div>
            )}

            {receiptUploadError && (
              <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-500/20">
                {receiptUploadError}
              </p>
            )}

            {/* Receipt Number Input */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 block font-medium">
                شماره پیگیری فیش / کد ارجاع (اختیاری):
              </label>
              <input
                type="text"
                value={localReceiptNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalReceiptNumber(val);
                  onReceiptNumberChange?.(val);
                  onSelectMethod(selectedMethod, {
                    gatewayId: selectedGatewayId,
                    bankAccountId: selectedBankAccountId,
                    receiptUrl: localReceiptUrl,
                    receiptNumber: val,
                  });
                }}
                placeholder="مثال: ۴۹۱۸۲۳۰ یا کد پیگیری انتقال وجه"
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                dir="ltr"
              />
            </div>
          </div>

          <div className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20 leading-relaxed">
            فیش واریزی شما مستقیماً برای واحد مالی ارسال شده و پس از تایید توسط ادمین، سفارش شما فعال خواهد شد.
          </div>
        </div>
      )}

      {/* D. When Corporate Credit Selected */}
      {selectedMethod === "corporate_credit" && (
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-300">
            <Briefcase className="w-4 h-4" />
            خرید تحت حساب اعتباری سازمانی همکار
          </div>
          <p className="text-[11px] leading-relaxed text-purple-700 dark:text-purple-300">
            سفارش شما فوراً تایید و وارد چرخه فعال‌سازی می‌شود. مبلغ سفارش به مانده بدهی دوره فاکتور رسمی شرکت شما افزوده خواهد شد و در سررسید توافق‌شده تسویه خواهد شد.
          </p>
        </div>
      )}
    </div>
  );
}
