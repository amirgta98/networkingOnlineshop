"use client";

import * as React from "react";
import type { AdminInvoice } from "../../types/admin-invoices.types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Printer,
  QrCode,
  ShieldCheck,
  CreditCard,
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface InvoiceDetailDrawerContentProps {
  invoice: AdminInvoice;
  onSyncTax: (invoice: AdminInvoice) => void;
}

export function InvoiceDetailDrawerContent({
  invoice,
  onSyncTax,
}: InvoiceDetailDrawerContentProps) {
  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* 1. Official Header & Tax Gateway Badge */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-sky-400">
                {invoice.invoiceNumber}
              </span>
              <h2 className="text-sm sm:text-base font-black text-white mt-0.5">
                {invoice.companyName || invoice.clientName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="h-8 gap-1.5 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>چاپ فاکتور رسمی</span>
            </Button>
          </div>
        </div>

        {/* Tax System Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-neutral-400">شناسه ۲۲ رقمی سامانه مودیان:</span>
            {invoice.taxSystemId ? (
              <span className="font-mono text-emerald-400 font-bold tracking-wider select-all">
                {invoice.taxSystemId}
              </span>
            ) : (
              <span className="text-amber-400 font-medium">در صف ارسال به کارپوشه مودیان</span>
            )}
          </div>

          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold shrink-0 ${
              invoice.taxSyncStatus === "synced"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            {invoice.taxSyncStatus === "synced"
              ? "تایید شده در کارپوشه دارایی"
              : "در انتظار تایید سامانه"}
          </span>
        </div>

        {/* Client & Enterprise Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-neutral-800 text-xs text-neutral-300">
          <div>
            <span className="text-neutral-400 block text-[11px]">خریدار:</span>
            <span className="font-bold text-white">
              {invoice.companyName ? `${invoice.companyName} (${invoice.clientName})` : invoice.clientName}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">شناسه ملی / کد اقتصادی:</span>
            <span className="font-mono text-white">
              کد ملی: {toPersianDigits(invoice.nationalId)}
              {invoice.economicCode && ` | کد اقتصادی: ${toPersianDigits(invoice.economicCode)}`}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">نوع صورتحساب:</span>
            <span className="font-semibold text-sky-400">
              {invoice.invoiceType === "type_1"
                ? "فاکتور رسمی الکترونیک نوع ۱ (اشخاص حقوقی)"
                : "فاکتور الکترونیک نوع ۲ (مصرف‌کننده نهایی)"}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">تاریخ صدور و سررسید:</span>
            <span className="font-mono text-neutral-300">
              صدور: {invoice.issueDate} | سررسید: {invoice.dueDate}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Official Line Items Table */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span>شرح کالا و خدمات فاکتور رسمی</span>
          <span className="text-[11px] text-neutral-400 font-normal">
            (مطابق فهرست کدهای استاندارد کالا و خدمات سامانه مودیان)
          </span>
        </h3>

        <div className="flex flex-col gap-2.5">
          {invoice.items.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 font-mono text-[11px]">
                  {toPersianDigits(idx + 1)}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white truncate">{item.title}</span>
                  <span className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    شناسه کالا (SKU): {item.sku}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                <div className="text-right sm:text-left">
                  <span className="text-[11px] text-neutral-400 block">
                    {toPersianDigits(item.quantity)} عدد × {formatPrice(item.unitPrice)}
                  </span>
                  <span className="font-bold font-mono text-white text-xs">
                    مبلغ: {formatPrice(item.totalPrice)}
                  </span>
                </div>

                <div className="text-left pr-3 border-r border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">
                    ارزش افزوده ۱۰٪:
                  </span>
                  <span className="font-mono text-xs text-sky-400 font-bold">
                    {formatPrice(item.taxAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tax Calculations & Settlements */}
      <div className="rounded-2xl border border-sky-500/30 bg-sky-950/15 p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-neutral-300">
            <span>مجموع مبلغ ناخالص صورتحساب:</span>
            <span className="font-mono font-bold text-white">{formatPrice(invoice.subtotal)}</span>
          </div>

          <div className="flex justify-between text-neutral-300">
            <span>مالیات بر ارزش افزوده (۱۰٪ مصوب قانون مالیات بر ارزش افزوده):</span>
            <span className="font-mono font-bold text-sky-400">{formatPrice(invoice.vatAmount)}</span>
          </div>

          <div className="flex justify-between pt-2.5 border-t border-sky-500/20 text-sm font-black text-white">
            <span>مبلغ کل قابل پرداخت با احتساب مالیات:</span>
            <span className="font-mono text-emerald-400 text-base">{formatPrice(invoice.totalAmount)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="text-xs text-neutral-300 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 leading-relaxed">
            <span className="font-bold text-neutral-400 block mb-1">توضیحات و مستندات پرداخت:</span>
            {invoice.notes}
          </div>
        )}

        {invoice.taxSyncStatus === "pending" && (
          <div className="pt-2">
            <Button
              onClick={() => onSyncTax(invoice)}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold gap-2 shadow-lg shadow-sky-600/25"
            >
              <Send className="h-4 w-4" />
              <span>ارسال فوری صورتحساب به سامانه جامع مودیان مالیاتی</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
