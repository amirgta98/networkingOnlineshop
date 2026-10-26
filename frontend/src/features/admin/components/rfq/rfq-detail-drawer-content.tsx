"use client";

import * as React from "react";
import type { AdminRfq } from "../../types/admin-rfq.types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  FileSpreadsheet,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Layers,
  FileCheck2,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Share2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface RfqDetailDrawerContentProps {
  rfq: AdminRfq;
  onIssueQuote: (rfq: AdminRfq) => void;
}

export function RfqDetailDrawerContent({
  rfq,
  onIssueQuote,
}: RfqDetailDrawerContentProps) {
  const totalItemsCount = rfq.items.reduce((acc, item) => acc + item.requestedQty, 0);

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* 1. Header Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-400">
                  {rfq.rfqNumber}
                </span>
                {rfq.urgent && (
                  <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    فوری ({toPersianDigits(rfq.deadlineHours)} ساعت مهلت)
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-black text-white mt-0.5">
                {rfq.projectTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="h-8 gap-1 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">چاپ</span>
            </Button>
          </div>
        </div>

        {/* Client & Company Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-neutral-800 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-sky-400 shrink-0" />
            <span className="text-neutral-400">شرکت / کارفرما:</span>
            <span className="font-bold text-white">{rfq.companyName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-neutral-400">تماس نماینده:</span>
            <span className="font-mono text-white" dir="ltr">
              {rfq.clientPhone}
            </span>
            <span className="text-neutral-400">({rfq.clientName})</span>
          </div>

          {rfq.projectLocation && (
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-neutral-400">محل پروژه:</span>
              <span>{rfq.projectLocation}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Bill of Materials (BOM Table) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-400" />
            <span>لیست تجمیعی تجهیزات درخواستی (BOM)</span>
          </h3>
          <span className="text-[11px] text-neutral-400">
            {toPersianDigits(rfq.items.length)} ردیف کالایی | {toPersianDigits(totalItemsCount)} واحد
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {rfq.items.map((item, idx) => {
            const rowTotal = item.requestedQty * item.unitPrice;

            return (
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
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                      <span>SKU: {item.sku}</span>
                      <span>• برند: {item.brand}</span>
                      <span>• دسته: {item.category}</span>
                    </div>
                    {item.specsSummary && (
                      <span className="text-[10px] text-neutral-500 mt-0.5">
                        {item.specsSummary}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                  <div className="text-right sm:text-left">
                    <span className="text-[11px] text-neutral-400 block">
                      {toPersianDigits(item.requestedQty)} عدد
                      {item.unitPrice > 0 ? ` × ${formatPrice(item.unitPrice)}` : " (استعلامی)"}
                    </span>
                    {item.unitPrice > 0 ? (
                      <span className="font-bold font-mono text-white text-xs">
                        جمع: {formatPrice(rowTotal)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400/90 font-medium">
                        قیمت پایه ثبت نشده
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${
                      item.stockStatus === "available"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : item.stockStatus === "low_stock"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                    }`}
                  >
                    {item.stockStatus === "available"
                      ? "موجود در انبار"
                      : item.stockStatus === "low_stock"
                      ? "کسری موجودی"
                      : "سفارش ویژه"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Valuation & Quotation Actions */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/15 p-4 sm:p-5 flex flex-col gap-4">
        {rfq.finalQuotedAmount && rfq.finalQuotedAmount > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
            <div>
              <span className="text-xs text-neutral-400 block">مبلغ نهایی مصوب پیش‌فاکتور:</span>
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                {formatPrice(rfq.finalQuotedAmount)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {rfq.discountPercent > 0 && (
                <div className="text-right sm:text-left">
                  <span className="text-[11px] text-neutral-400 block">
                    تخفیف پروژه‌ای مصوب:
                  </span>
                  <span className="text-sm font-bold font-mono text-purple-300">
                    {toPersianDigits(rfq.discountPercent)}٪
                  </span>
                </div>
              )}
              <div className="text-right sm:text-left pr-3 border-r border-neutral-800">
                <span className="text-[11px] text-neutral-400 block">وضعیت استعلام:</span>
                <span className="text-xs font-bold text-emerald-400">
                  پیش‌فاکتور صادر گردید
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-white">هنوز قیمت نهایی برای این استعلام تعیین نشده است</span>
              <span className="text-neutral-300 text-[11px] leading-relaxed">
                هیچ قیمت خودکاری اعمال نخواهد شد. لطفاً به عنوان مدیر یا مهندس فروش، روی دکمه زیر کلیک کرده و مبلغ نهایی مدنظر را وارد فرمایید.
              </span>
            </div>
          </div>
        )}

        {rfq.notes && (
          <div className="text-xs text-neutral-300 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 leading-relaxed">
            <span className="font-bold text-amber-400 block mb-1">یادداشت فنی کارفرما:</span>
            {rfq.notes}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Calendar className="h-4 w-4 text-purple-400" />
            <span>مدت اعتبار پیش‌فاکتور: {toPersianDigits(rfq.validityDays)} روز کاری</span>
          </div>

          <Button
            onClick={() => onIssueQuote(rfq)}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold gap-2 shadow-lg shadow-purple-600/25"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>
              {rfq.finalQuotedAmount && rfq.finalQuotedAmount > 0
                ? "ویرایش قیمت نهایی و صدور مجدد"
                : "اعلام قیمت نهایی و صدور پیش‌فاکتور"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
