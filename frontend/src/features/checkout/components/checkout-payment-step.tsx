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
  Copy,
  Check,
} from "lucide-react";
import { useCheckout } from "../hooks/use-checkout";
import { DEFAULT_PAYMENT_METHODS } from "../api/checkout-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function CheckoutPaymentStep() {
  const {
    paymentMethodId,
    setPaymentMethodId,
    selectedGatewayId,
    setSelectedGatewayId,
    financials,
  } = useCheckout();

  const [copiedSheba, setCopiedSheba] = React.useState(false);

  const handleCopySheba = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText("IR890120000000001234567890");
      setCopiedSheba(true);
      setTimeout(() => setCopiedSheba(false), 2000);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "gateway":
        return <CreditCard className="h-5 w-5 text-orange-400" />;
      case "credit":
        return <Wallet className="h-5 w-5 text-emerald-400" />;
      case "bank_transfer":
        return <Landmark className="h-5 w-5 text-blue-400" />;
      case "cheque":
        return <FileCheck className="h-5 w-5 text-purple-400" />;
      default:
        return <CreditCard className="h-5 w-5 text-orange-400" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── 1. Payment Methods Selection ─────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-orange-500" />
            <span>انتخاب شیوه تسویه و پرداخت</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" />
            رمزنگاری TLS 1.3 شاپرک
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {DEFAULT_PAYMENT_METHODS.map((method) => {
            const isSelected = paymentMethodId === method.id;

            return (
              <div
                key={method.id}
                onClick={() => setPaymentMethodId(method.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none text-right ${
                  isSelected
                    ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500/30"
                    : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-2xl shrink-0 transition-colors ${
                        isSelected
                          ? "bg-orange-500/20 border border-orange-500/40"
                          : "bg-neutral-900 border border-neutral-800"
                      }`}
                    >
                      {getMethodIcon(method.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {method.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 font-medium">
                        {method.subtitle}
                      </p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      انتخاب شده
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs text-neutral-400">انتخاب</span>
                  )}
                </div>

                {/* ── Sub-options for Online Gateway (Bank options) ── */}
                {isSelected && method.type === "gateway" && method.gateways && (
                  <div className="mt-4 pt-4 border-t border-neutral-800/80 animate-fade-in space-y-2.5">
                    <span className="text-xs font-semibold text-neutral-300 block">
                      درگاه بانکی مورد نظر خود را انتخاب فرمایید:
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {method.gateways.map((gw) => {
                        const isGwSelected = selectedGatewayId === gw.id;
                        return (
                          <button
                            type="button"
                            key={gw.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGatewayId(gw.id);
                            }}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                              isGwSelected
                                ? "border-orange-500 bg-orange-950/60 shadow-md ring-1 ring-orange-500/40 text-white"
                                : "border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:text-white hover:border-neutral-700"
                            }`}
                          >
                            <div className="h-6 w-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-black text-orange-400">
                              {gw.bankName.slice(0, 1)}
                            </div>
                            <span className="text-xs font-bold">{gw.bankName}</span>
                            <span className="text-[9px] text-neutral-400">
                              {isGwSelected ? "درگاه فعال" : "اتصال مستقیم"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Sub-options for Corporate Credit ── */}
                {isSelected && method.type === "credit" && (
                  <div className="mt-4 pt-4 border-t border-neutral-800/80 animate-fade-in space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs">
                      <span className="text-neutral-300">سقف اعتبار سازمانی شما:</span>
                      <span className="font-bold text-emerald-400">
                        {formatPrice(250000000)} (۲۵۰ میلیون تومان)
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      مبلغ سفارش به حساب بدهی دفتری شرکت افزوده شده و فاکتور تجاری با مهلت تسویه ۶۰ روزه صادر خواهد شد.
                    </p>
                  </div>
                )}

                {/* ── Sub-options for Wire / Sheba Transfer ── */}
                {isSelected && method.type === "bank_transfer" && (
                  <div className="mt-4 pt-4 border-t border-neutral-800/80 animate-fade-in space-y-3">
                    <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">بانک مقصد:</span>
                        <span className="font-bold text-white">بانک ملت - شعبه مرکزی</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400">صاحب حساب:</span>
                        <span className="font-bold text-white">شرکت تجهیزات شبکه ققنوس آکادمی</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t border-neutral-800 pt-2">
                        <span className="text-neutral-400">شماره شبا (IBAN):</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopySheba();
                          }}
                          className="flex items-center gap-1.5 font-mono text-orange-400 hover:text-orange-300 bg-neutral-800 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <span className="dir-ltr text-xs">IR89 0120 0000 0000 1234 5678 90</span>
                          {copiedSheba ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      پس از نهایی‌سازی سفارش، پیش‌فاکتور رسمی صادر شده و می‌توانید فیش واریز ساتنا/پایا را در پنل پیگیری بارگذاری فرمایید.
                    </p>
                  </div>
                )}

                {/* ── Sub-options for Sayad Cheque ── */}
                {isSelected && method.type === "cheque" && (
                  <div className="mt-4 pt-4 border-t border-neutral-800/80 animate-fade-in space-y-2">
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200/90 leading-relaxed">
                      <AlertCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>
                        چک صیادی بنفش باید در سامانه صیاد بانک مرکزی به نام <strong>شرکت تجهیزات شبکه ققنوس آکادمی</strong> و با شناسه ملی <strong>۱۰۱۰۳۵۶۷۸۹۰</strong> ثبت و تأیید گردد.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#141417] border border-neutral-800 text-xs text-neutral-300">
        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <span className="font-bold text-white block">
            تضمین امنیت پرداخت و عودت وجه
          </span>
          <span className="text-[11px] text-neutral-400">
            تمامی تراکنش‌ها تحت نظارت شاپرک بانک مرکزی جمهوری اسلامی ایران انجام شده و در صورت انصراف، وجه طی ۲ ساعت کاری عودت می‌گردد.
          </span>
        </div>
      </div>
    </div>
  );
}
