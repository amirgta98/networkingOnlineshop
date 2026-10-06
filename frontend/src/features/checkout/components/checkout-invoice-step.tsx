"use client";

import * as React from "react";
import {
  FileText,
  Building2,
  User,
  ShieldCheck,
  AlertCircle,
  Hash,
  Phone,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useCheckout } from "../hooks/use-checkout";
import { Input } from "@/shared/components/ui/input";
import { toPersianDigits, formatPrice } from "@/shared/lib/utils";

export function CheckoutInvoiceStep() {
  const {
    invoiceType,
    setInvoiceType,
    legalInvoice,
    setLegalInvoice,
    financials,
    errors,
  } = useCheckout();

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── 1. Invoice Type Selector (Personal vs Official B2B) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: Personal standard invoice */}
        <div
          onClick={() => setInvoiceType("personal")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer select-none text-right flex flex-col justify-between ${
            invoiceType === "personal"
              ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500/30"
              : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-2 text-sm font-black text-white">
                <div
                  className={`p-2 rounded-xl ${
                    invoiceType === "personal"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  <User className="h-5 w-5" />
                </div>
                <span>فاکتور عادی (حقیقی / شخصی)</span>
              </span>
              {invoiceType === "personal" && (
                <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0" />
              )}
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              صدور فاکتور خرید استاندارد به نام خریدار حقیقی. مناسب کاربران شخصی، پروژه‌های خرد و مهندسان شبکه آزادکار.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span>مالیات بر ارزش افزوده:</span>
            <span className="font-bold text-emerald-400">بدون مالیات مازاد (۰٪)</span>
          </div>
        </div>

        {/* Option 2: Official Corporate / Tax Invoice */}
        <div
          onClick={() => setInvoiceType("legal")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer select-none text-right flex flex-col justify-between ${
            invoiceType === "legal"
              ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500/30"
              : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center gap-2 text-sm font-black text-white">
                <div
                  className={`p-2 rounded-xl ${
                    invoiceType === "legal"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <span>فاکتور رسمی مالیاتی (حقوقی / سازمانی)</span>
              </span>
              {invoiceType === "legal" && (
                <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0" />
              )}
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              صدور فاکتور معتبر رسمی با شناسه ملی و کد اقتصادی، ثبت مستقیم در سامانه مودیان مالیاتی کشور (ماده ۹ قانون مالیات بر ارزش افزوده).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span>مالیات بر ارزش افزوده قانونی:</span>
            <span className="font-bold text-amber-400">۱۰٪ مالیات رسمی سامانه مودیان</span>
          </div>
        </div>
      </div>

      {/* ── 2. Legal / Corporate Form Fields ────────────────────────────── */}
      {invoiceType === "legal" && (
        <div className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 sm:p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>اطلاعات ثبتی و حقوقی سازمان جهت صدور فاکتور رسمی</span>
            </h3>
            <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              قابل استعلام در سامانه جامع مالیاتی
            </span>
          </div>

          {/* Legal Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              با انتخاب فاکتور حقوقی، مبلغ <strong>{formatPrice(financials.vatTax)}</strong> معادل ۱۰٪ ارزش افزوده به مبلغ کل سفارش افزوده خواهد شد و فاکتور الکترونیک با شناسه یکتای مالیاتی برای شرکت شما صادر می‌گردد.
            </div>
          </div>

          {/* Company Name & Registration Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                نام کامل ثبتی شرکت یا ارگان دولتی *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="مثال: شرکت ارتباطات داده گستر نوین (سهامی خاص)"
                  value={legalInvoice.companyName}
                  onChange={(e) =>
                    setLegalInvoice((prev) => ({ ...prev, companyName: e.target.value }))
                  }
                  error={Boolean(errors.companyName)}
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 pr-9 text-xs"
                />
                <Building2 className="h-4 w-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.companyName && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                شماره ثبت شرکت *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="مثال: ۴۵۶۷۸۹"
                  value={legalInvoice.registrationNumber}
                  onChange={(e) =>
                    setLegalInvoice((prev) => ({ ...prev, registrationNumber: e.target.value }))
                  }
                  error={Boolean(errors.registrationNumber)}
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 pr-9 text-xs dir-ltr text-right"
                />
                <Hash className="h-4 w-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.registrationNumber && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">
                  {errors.registrationNumber}
                </p>
              )}
            </div>
          </div>

          {/* National ID & Economic Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                شناسه ملی شرکت (۱۱ رقم) *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  maxLength={11}
                  placeholder="مثال: ۱۰۱۰۳۵۶۷۸۹۰"
                  value={legalInvoice.nationalId}
                  onChange={(e) =>
                    setLegalInvoice((prev) => ({
                      ...prev,
                      nationalId: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  error={Boolean(errors.nationalId)}
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 pr-9 text-xs dir-ltr text-right"
                />
                <Hash className="h-4 w-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.nationalId && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.nationalId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                کد اقتصادی جدید سازمان (۱۲ یا ۱۴ رقم) *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="مثال: ۴۱۱۵۶۷۸۹۴۳۲۱"
                  value={legalInvoice.economicCode}
                  onChange={(e) =>
                    setLegalInvoice((prev) => ({
                      ...prev,
                      economicCode: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  error={Boolean(errors.economicCode)}
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 pr-9 text-xs dir-ltr text-right"
                />
                <FileText className="h-4 w-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.economicCode && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">
                  {errors.economicCode}
                </p>
              )}
            </div>
          </div>

          {/* Postal code & Landline phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                کد پستی ۱۰ رقمی دفتر مرکزی شرکت *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  maxLength={10}
                  placeholder="مثال: ۱۹۹۸۷۶۵۴۳۲"
                  value={legalInvoice.postalCode}
                  onChange={(e) =>
                    setLegalInvoice((prev) => ({
                      ...prev,
                      postalCode: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  error={Boolean(errors.legalPostalCode)}
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 pr-9 text-xs dir-ltr text-right"
                />
                <Hash className="h-4 w-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.legalPostalCode && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">
                  {errors.legalPostalCode}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                شماره تلفن ثابت شرکت (با پیش‌شماره) *
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="مثال: ۰۲۱۸۸۷۷۶۶۵۵"
                  value={legalInvoice.phoneNumber}
                  onChange={(e) =>
                    setLegalInvoice((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  error={Boolean(errors.legalPhone)}
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 pr-9 text-xs dir-ltr text-right"
                />
                <Phone className="h-4 w-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.legalPhone && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.legalPhone}</p>
              )}
            </div>
          </div>

          {/* Legal Office Address */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              نشانی کامل دفتر مرکزی مطابق روزنامه رسمی *
            </label>
            <Input
              type="text"
              placeholder="مثال: تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج پارس، طبقه ۹، واحد ۹۰۲"
              value={legalInvoice.address}
              onChange={(e) =>
                setLegalInvoice((prev) => ({ ...prev, address: e.target.value }))
              }
              className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
