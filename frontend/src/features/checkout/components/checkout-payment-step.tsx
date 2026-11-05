"use client";

import * as React from "react";
import {
  CreditCard,
  Wallet,
  Building,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Landmark,
  FileText,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  Loader2,
  ArrowRight,
  ExternalLink,
  UploadCloud,
  FileImage,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useCheckout } from "../hooks/use-checkout";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  paymentApi,
  PaymentConfigResponse,
  PaymentGatewayItem,
  BankAccountItem,
} from "@/features/payment";
import Link from "next/link";

export function CheckoutPaymentStep() {
  const {
    paymentMethodId,
    setPaymentMethodId,
    selectedGatewayId,
    setSelectedGatewayId,
    selectedBankAccountId,
    setSelectedBankAccountId,
    financials,
    receiptFile,
    setReceiptFile,
    receiptUrl,
    setReceiptUrl,
    receiptNumber,
    setReceiptNumber,
    isUploadingReceipt,
    uploadReceiptFile,
    errors,
  } = useCheckout();

  const [config, setConfig] = React.useState<PaymentConfigResponse | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = React.useState(true);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleReceiptFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadReceiptFile(file);
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      try {
        const data = await paymentApi.getPaymentConfig();
        if (isMounted && data) {
          setConfig(data);
          // Auto select default gateway
          if (!selectedGatewayId && data.gateways?.length > 0) {
            const defGw = data.gateways.find((g) => g.isDefault) || data.gateways[0];
            if (defGw) setSelectedGatewayId(defGw.id);
          }
          // Auto select default bank account
          if (!selectedBankAccountId && data.bankAccounts?.length > 0) {
            const defBank = data.bankAccounts.find((b) => b.isDefault) || data.bankAccounts[0];
            if (defBank) setSelectedBankAccountId(defBank.id);
          }
        }
      } catch (err) {
        console.warn("Failed to load payment config in checkout:", err);
      } finally {
        if (isMounted) setIsLoadingConfig(false);
      }
    }
    loadConfig();
    return () => {
      isMounted = false;
    };
  }, [selectedGatewayId, setSelectedGatewayId, selectedBankAccountId, setSelectedBankAccountId]);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const gateways: PaymentGatewayItem[] = config?.gateways?.length
    ? config.gateways
    : [
        {
          id: "zarinpal",
          name: "درگاه پرداخت امن زرین‌پال شاپرک",
          provider: "zarinpal",
          isSandbox: true,
          isDefault: true,
          description: "درگاه شاپرک با پشتیبانی از کلیه کارت‌های عضو شتاب",
        },
      ];

  const bankAccounts: BankAccountItem[] = config?.bankAccounts?.length
    ? config.bankAccounts
    : [
        {
          id: "saman-default",
          bankName: "بانک سامان",
          accountOwner: "شرکت ققنوس عصر داده ورزان",
          cardNumber: "۶۲۱۹-۸۶۱۰-۴۳۲۱-۹۸۷۶",
          shebaNumber: "IR890560000000001234567890",
          accountNumber: "890-560-1234567-1",
          isActive: true,
          isDefault: true,
          displayOrder: 1,
        },
      ];

  const userWalletBalance = config?.userWallet?.totalUsable ?? 0;
  const isWalletSufficient = userWalletBalance >= financials.payableTotal;
  const isSandbox = config?.settings?.isSandboxMode ?? true;

  const isWalletEnabled = config?.settings?.isWalletEnabled !== false;
  const isCardToCardEnabled = config?.settings?.isCardToCardEnabled !== false;
  const isChequeEnabled = config?.settings?.isChequeEnabled !== false;
  const isCorporateCreditEnabled = config?.settings?.isCorporateCreditEnabled !== false;

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── 1. Payment Methods Selection ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-orange-500" />
            <span>انتخاب شیوه تسویه و پرداخت</span>
          </h3>
          <div className="flex items-center gap-2">
            {isSandbox && (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                سندباکس تستی شاپرک
              </span>
            )}
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              رمزنگاری TLS 1.3
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* ── 1.1 ONLINE GATEWAY ── */}
          <div
            onClick={() => setPaymentMethodId("online_gateway")}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none text-right ${
              paymentMethodId === "online_gateway"
                ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500/30"
                : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-2xl shrink-0 transition-colors ${
                    paymentMethodId === "online_gateway"
                      ? "bg-orange-500/20 border border-orange-500/40"
                      : "bg-neutral-900 border border-neutral-800"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-orange-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      درگاه پرداخت آنلاین شاپرک (کارت‌های عضو شتاب)
                    </span>
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                      پیش‌فرض
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-medium">
                    پرداخت سریع و لحظه‌ای با تمامی کارت‌های بانکی عضو شبکه شتاب
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    اتصال به درگاه‌های دارای مجوز رسمی بانک مرکزی با پروتکل رمزنگاری پیشرفته شاپرک
                  </p>
                </div>
              </div>

              {paymentMethodId === "online_gateway" ? (
                <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  انتخاب شده
                </span>
              ) : (
                <span className="shrink-0 text-xs text-neutral-400">انتخاب</span>
              )}
            </div>

            {/* Sub-options for Online Gateways */}
            {paymentMethodId === "online_gateway" && (
              <div className="mt-4 pt-4 border-t border-neutral-800/80 animate-fade-in space-y-3">
                <span className="text-xs font-semibold text-neutral-300 block">
                  درگاه بانکی فعال مورد نظر خود را انتخاب فرمایید:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {gateways.map((gw) => {
                    const isGwSelected = selectedGatewayId === gw.id;
                    return (
                      <button
                        type="button"
                        key={gw.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGatewayId(gw.id);
                        }}
                        className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isGwSelected
                            ? "border-orange-500 bg-orange-950/60 shadow-md ring-1 ring-orange-500/40 text-white"
                            : "border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:text-white hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-black text-orange-400 shrink-0">
                            {gw.name.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold truncate block">{gw.name}</span>
                            <span className="text-[10px] text-neutral-400 block truncate">
                              ارائه‌دهنده: {gw.provider}
                            </span>
                          </div>
                        </div>
                        {isGwSelected && (
                          <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isSandbox && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-950/40 border border-orange-500/30 text-xs text-orange-200">
                    <Sparkles className="h-4 w-4 text-orange-400 shrink-0" />
                    <span className="leading-relaxed">
                      درگاه در حالت سندباکس تستی شاپرک فعال است؛ پس از کلیک بر روی ثبت نهایی سفارش، به صفحه پرداخت امن شبیه‌ساز منتقل شده و بدون کسر وجه واقعی تراکنش تأیید خواهد شد.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 1.2 WALLET PAYMENT ── */}
          {isWalletEnabled && (
            <div
              onClick={() => setPaymentMethodId("wallet")}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none text-right ${
                paymentMethodId === "wallet"
                  ? "border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30"
                  : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-2xl shrink-0 transition-colors ${
                      paymentMethodId === "wallet"
                        ? "bg-emerald-500/20 border border-emerald-500/40"
                        : "bg-neutral-900 border border-neutral-800"
                    }`}
                  >
                    <Wallet className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        پرداخت مستقیم از کیف پول کاربری
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        موجودی: {formatPrice(userWalletBalance)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium">
                      کسر آنی از شارژ و مانده اعتبار کیف پول بدون نیاز به مراجعه به درگاه شاپرک
                    </p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      سفارش بلافاصله پرداخت قطعی شده و به مرحله بسته‌بندی در انبار ارسال می‌شود.
                    </p>
                  </div>
                </div>

                {paymentMethodId === "wallet" ? (
                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    انتخاب شده
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-neutral-400">انتخاب</span>
                )}
              </div>

              {paymentMethodId === "wallet" && (
                <div className="mt-4 pt-4 border-t border-neutral-800/80 animate-fade-in space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div>
                      <span className="text-xs text-neutral-400 block mb-0.5">مبلغ قابل تسویه سفارش:</span>
                      <span className="text-sm font-bold text-white">{formatPrice(financials.payableTotal)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-400 block mb-0.5">موجودی قابل استفاده کیف پول:</span>
                      <span className={`text-sm font-bold ${isWalletSufficient ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatPrice(userWalletBalance)}
                      </span>
                    </div>
                  </div>

                  {isWalletSufficient ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>
                        موجودی کیف پول شما برای تسویه این سفارش کافی است. با کلیک بر روی ثبت نهایی، سفارش در لحظه پرداخت خواهد شد.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                        <span>
                          کسری موجودی: {formatPrice(financials.payableTotal - userWalletBalance)}
                        </span>
                      </div>
                      <Link
                        href="/dashboard/wallet"
                        target="_blank"
                        className="flex items-center gap-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                      >
                        <span>شارژ آنی کیف پول</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── 1.3 BANK TRANSFER / CARD-TO-CARD ── */}
          {isCardToCardEnabled && (
            <div
              onClick={() => setPaymentMethodId("bank_transfer")}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none text-right ${
                paymentMethodId === "bank_transfer"
                  ? "border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-950/30 ring-1 ring-blue-500/30"
                  : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-2xl shrink-0 transition-colors ${
                      paymentMethodId === "bank_transfer"
                        ? "bg-blue-500/20 border border-blue-500/40"
                        : "bg-neutral-900 border border-neutral-800"
                    }`}
                  >
                    <Landmark className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        کارت به کارت و واریز به حساب‌های بانکی شرکت
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium">
                      واریز مستقیم به شماره کارت یا شبا رسمی شرکت ققنوس عصر داده ورزان
                    </p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      مناسب خریدهای با مبالغ بالا، سقف کارت به کارت و حواله‌های ساتنا / پایا
                    </p>
                  </div>
                </div>

                {paymentMethodId === "bank_transfer" ? (
                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    انتخاب شده
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-neutral-400">انتخاب</span>
                )}
              </div>

              {/* Sub-options for Bank Accounts */}
              {paymentMethodId === "bank_transfer" && (
                <div className="mt-4 pt-4 border-t border-neutral-800/80 animate-fade-in space-y-3">
                  <span className="text-xs font-semibold text-neutral-300 block">
                    حساب بانکی مقصد را جهت دریافت مشخصات واریز انتخاب فرمایید:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bankAccounts.map((b) => {
                      const isBankSelected = selectedBankAccountId === b.id;
                      return (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBankAccountId(b.id);
                          }}
                          className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer space-y-2.5 ${
                            isBankSelected
                              ? "border-blue-500 bg-blue-950/40 shadow-sm ring-1 ring-blue-500/40"
                              : "border-neutral-800 bg-neutral-900/80 hover:border-neutral-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Landmark className="h-3.5 w-3.5 text-blue-400" />
                              {b.bankName}
                            </span>
                            {isBankSelected && (
                              <CheckCircle2 className="h-4 w-4 text-blue-400" />
                            )}
                          </div>

                          <div className="text-[11px] text-neutral-400">
                            صاحب حساب: <span className="text-white font-medium">{b.accountOwner}</span>
                          </div>

                          {/* Card Number */}
                          <div className="flex items-center justify-between text-xs bg-neutral-950/70 p-2 rounded-lg border border-neutral-800">
                            <span className="text-neutral-400 text-[10px]">شماره کارت:</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(b.cardNumber.replace(/\s+/g, ""), `card-${b.id}`);
                              }}
                              className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-mono text-[11px]"
                            >
                              <span>{b.cardNumber}</span>
                              {copiedKey === `card-${b.id}` ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>

                          {/* Sheba */}
                          <div className="flex items-center justify-between text-xs bg-neutral-950/70 p-2 rounded-lg border border-neutral-800">
                            <span className="text-neutral-400 text-[10px]">شماره شبا:</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(b.shebaNumber, `sheba-${b.id}`);
                              }}
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-mono text-[10px]"
                            >
                              <span className="dir-ltr">{b.shebaNumber}</span>
                              {copiedKey === `sheba-${b.id}` ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Receipt Upload & Reference Input ── */}
                  <div className="mt-4 pt-4 border-t border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <UploadCloud className="h-4 w-4 text-blue-400" />
                        بارگذاری فیش یا عکس پرداخت کارت به کارت
                        <span className="text-rose-400 font-bold">*</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        فرمت‌های مجاز: JPG, PNG, PDF (حداکثر ۱۰ مگابایت)
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleReceiptFileSelect}
                      className="hidden"
                    />

                    {/* Dropzone / Upload Box */}
                    {receiptUrl ? (
                      <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {receiptUrl.endsWith(".pdf") ? (
                            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <FileText className="h-5 w-5" />
                            </div>
                          ) : (
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-emerald-500/30 bg-neutral-900 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={receiptUrl}
                                alt="پیش‌نمایش فیش"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0 text-right">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              تصویر فیش با موفقیت ضمیمه شد
                            </div>
                            <p className="text-[11px] text-neutral-400 truncate dir-ltr">
                              {receiptFile?.name || receiptUrl.split("/").pop()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium px-2 py-1"
                          >
                            مشاهده
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReceiptUrl(null);
                              setReceiptFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-rose-400 transition-colors"
                            title="حذف و بارگذاری مجدد"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                          errors.receipt
                            ? "border-rose-500/60 bg-rose-950/10 hover:border-rose-500"
                            : "border-neutral-700 bg-neutral-900/60 hover:border-blue-500 hover:bg-neutral-900"
                        }`}
                      >
                        {isUploadingReceipt ? (
                          <div className="flex flex-col items-center justify-center gap-2 py-2">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                            <span className="text-xs text-neutral-300 font-medium">
                              در حال ارسال و بارگذاری فیش واریز...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <UploadCloud className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">
                                کلیک کنید یا عکس فیش واریز کارت به کارت را اینجا بکشید
                              </p>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                عکس رسید عابربانک یا اسکرین‌شات رسید همراه بانک (آپ، تاپ، بلوبانک، سامان، ملت و...)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Receipt Error Alert */}
                    {errors.receipt && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs animate-shake">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errors.receipt}</span>
                      </div>
                    )}

                    {/* Receipt Reference Code */}
                    <div className="space-y-1.5 text-right">
                      <label className="block text-xs font-medium text-neutral-300">
                        شماره پیگیری / کد ارجاع فیش (اختیاری):
                      </label>
                      <input
                        type="text"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        placeholder="مثال: ۴۹۲۱۰۵۹۲ یا شماره ارجاع تراکنش بانکی"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500"
                        dir="ltr"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2 text-[11px] text-blue-300 leading-relaxed text-right">
                      <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        پس از ثبت نهایی سفارش، فیش بانکی مستقیماً در پنل مالی ادمین قرار گرفته و پس از بررسی و تایید آن، سفارش شما بلافاصله تایید و وارد مرحله بسته‌بندی انبار خواهد شد.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 1.4 CORPORATE CREDIT ── */}
          {isCorporateCreditEnabled && (
            <div
              onClick={() => setPaymentMethodId("corporate_credit")}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none text-right ${
                paymentMethodId === "corporate_credit"
                  ? "border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/30"
                  : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-2xl shrink-0 transition-colors ${
                      paymentMethodId === "corporate_credit"
                        ? "bg-purple-500/20 border border-purple-500/40"
                        : "bg-neutral-900 border border-neutral-800"
                    }`}
                  >
                    <Building className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        پرداخت اعتباری سازمانی (ویژه همکاران تجاری B2B)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium">
                      تسویه اعتباری دفتری با سررسید ۳۰، ۶۰ یا ۹۰ روزه
                    </p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      مخصوص شرکت‌ها و پیمانکاران دارای قرارداد فعال تأمین کالا و سقف اعتبار مصوب در ققنوس آکادمی
                    </p>
                  </div>
                </div>

                {paymentMethodId === "corporate_credit" ? (
                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    انتخاب شده
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-neutral-400">انتخاب</span>
                )}
              </div>

              {paymentMethodId === "corporate_credit" && (
                <div className="mt-4 pt-4 border-t border-neutral-800/80 animate-fade-in space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs">
                    <span className="text-neutral-300">سقف اعتبار سازمانی شما:</span>
                    <span className="font-bold text-purple-400">
                      {formatPrice(250000000)} (۲۵۰ میلیون تومان)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    مبلغ سفارش به حساب بدهی دفتری شرکت افزوده شده و فاکتور تجاری رسمی صادر خواهد شد.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── 1.5 SAYAD CHEQUE ── */}
          {isChequeEnabled && (
            <div
              onClick={() => setPaymentMethodId("sayad_cheque")}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none text-right ${
                paymentMethodId === "sayad_cheque"
                  ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30"
                  : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-2xl shrink-0 transition-colors ${
                      paymentMethodId === "sayad_cheque"
                        ? "bg-amber-500/20 border border-amber-500/40"
                        : "bg-neutral-900 border border-neutral-800"
                    }`}
                  >
                    <FileCheck className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        پرداخت با چک صیادی بنفش (خریدهای پروژه‌ای)
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 font-medium">
                      استعلام وضعیت اعتباری صیاد و ثبت در سامانه پیچک بانک مرکزی
                    </p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      ویژه سفارش‌های عمده تجهیزات پسیو و اکتیو زیرساخت شبکه
                    </p>
                  </div>
                </div>

                {paymentMethodId === "sayad_cheque" ? (
                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    انتخاب شده
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-neutral-400">انتخاب</span>
                )}
              </div>

              {paymentMethodId === "sayad_cheque" && (
                <div className="mt-4 pt-4 border-t border-neutral-800/80 animate-fade-in space-y-2">
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      چک صیادی بنفش باید در سامانه صیاد بانک مرکزی به نام <strong>شرکت ققنوس عصر داده ورزان</strong> و با شناسه ملی <strong>۱۰۱۰۳۵۶۷۸۹۰</strong> ثبت و تأیید گردد.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#141417] border border-neutral-800 text-xs text-neutral-300">
        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <span className="font-bold text-white block">
            سیستم مرکزی و یکپارچه پرداخت ققنوس آکادمی
          </span>
          <span className="text-[11px] text-neutral-400">
            تمامی تراکنش‌ها به صورت متمرکز از طریق درگاه‌های شاپرک، کیف پول اعتباری و حساب‌های رسمی تایید شده شرکت پردازش می‌شوند.
          </span>
        </div>
      </div>
    </div>
  );
}
