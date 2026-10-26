"use client";

import * as React from "react";
import type { AdminUserRfq } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  Building2,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  MapPin,
  Flame,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { TabPagination } from "../tab-pagination";

interface RfqTabProps {
  userId: string;
}

export function RfqTab({ userId }: RfqTabProps) {
  const [rfqs, setRfqs] = React.useState<AdminUserRfq[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedRfqId, setExpandedRfqId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 5;

  const fetchRfqs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserRfq(userId);
      setRfqs(data || []);
      if (data && data.length > 0) {
        setExpandedRfqId(data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load user RFQ inquiries:", err);
      setError("خطا در بارگذاری استعلام‌های قیمت کاربر.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchRfqs();
  }, [fetchRfqs]);

  const toggleExpand = (id: string) => {
    setExpandedRfqId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: string, label: string) => {
    const s = status.toLowerCase();
    if (s.includes("quoted") || s.includes("completed") || s.includes("approved")) {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
          {label || "پیش‌فاکتور صادر شده"}
        </span>
      );
    }
    if (s.includes("reviewing") || s.includes("pending") || s.includes("in_progress")) {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold">
          {label || "در حال کارشناسی"}
        </span>
      );
    }
    if (s.includes("expired") || s.includes("reject")) {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 font-semibold">
          {label || "منقضی شده"}
        </span>
      );
    }
    return (
      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 font-semibold">
        {label || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" dir="rtl">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse flex flex-col gap-3"
          >
            <div className="h-6 w-1/3 bg-neutral-800 rounded-lg" />
            <div className="h-12 w-full bg-neutral-800/60 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-neutral-300 font-medium">{error}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchRfqs}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (rfqs.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">هیچ استعلام قیمتی ثبت نشده است</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          این کاربر تا کنون درخواست استعلام قیمت پروژه‌ای یا تجاری (RFQ) ارسال نکرده است.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>مجموع استعلام‌های ثبت‌شده: <strong className="text-white font-mono">{toPersianDigits(rfqs.length)}</strong> مورد</span>
      </div>

      <div className="flex flex-col gap-4">
        {rfqs
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((rfq) => {
          const isExpanded = expandedRfqId === rfq.id;

          return (
            <div
              key={rfq.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden transition-all duration-200 hover:border-neutral-700"
            >
              {/* RFQ Header Card */}
              <div
                onClick={() => toggleExpand(rfq.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-neutral-900/70 hover:bg-neutral-900 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        {rfq.projectTitle || `استعلام ${rfq.rfqNumber}`}
                      </span>

                      {getStatusBadge(rfq.status, rfq.statusLabel)}

                      {rfq.urgent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          <span>فوری ({toPersianDigits(rfq.deadlineHours)} ساعته)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-neutral-500" />
                        شماره: <span className="font-mono text-neutral-200">{rfq.rfqNumber}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-neutral-500" />
                        {rfq.createdAt}
                      </span>
                      {rfq.projectLocation && (
                        <span className="flex items-center gap-1 text-neutral-400">
                          <MapPin className="h-3 w-3 text-neutral-500" />
                          {rfq.projectLocation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-[11px] text-neutral-400">
                      {rfq.finalQuotedAmount ? "مبلغ نهایی پیش‌فاکتور:" : "وضعیت قیمت‌گذاری:"}
                    </span>
                    <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
                      {rfq.finalQuotedAmount && rfq.finalQuotedAmount > 0 ? (
                        formatPrice(rfq.finalQuotedAmount)
                      ) : (
                        <span className="text-xs text-amber-400 font-sans font-medium">
                          در انتظار اعلام قیمت توسط ادمین
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="text-neutral-400 p-1 rounded-lg hover:bg-neutral-800">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Items */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-neutral-800/80 bg-neutral-950/40 flex flex-col gap-4">
                  {/* Meta strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/60">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">اعتبار پیش‌فاکتور:</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block">
                        {toPersianDigits(rfq.validityDays)} روز کاری
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">درصد تخفیف همکاری:</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block">
                        {toPersianDigits(rfq.discountPercent)}٪
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">شماره تماس استعلام‌دهنده:</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block" dir="ltr">
                        {rfq.clientPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">تعداد اقلام مورد نیاز:</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block">
                        {toPersianDigits(rfq.items.length)} ردیف کالایی
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {rfq.notes && (
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
                      <span className="text-neutral-400 block text-[11px] mb-1 font-semibold">یادداشت و ملزومات پروژه:</span>
                      <p>{rfq.notes}</p>
                    </div>
                  )}

                  {/* Items Table */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                        <tr>
                          <th className="py-2.5 px-3">عنوان کالا</th>
                          <th className="py-2.5 px-3">کد کالا (SKU)</th>
                          <th className="py-2.5 px-3">برند</th>
                          <th className="py-2.5 px-3 text-center">تعداد درخواستی</th>
                          <th className="py-2.5 px-3">قیمت واحد پیشنهادی</th>
                          <th className="py-2.5 px-3">وضعیت تامین انبار</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {rfq.items.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-800/20">
                            <td className="py-3 px-3 font-medium text-white max-w-xs">
                              {item.title}
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-300">
                              {item.sku}
                            </td>
                            <td className="py-3 px-3 text-neutral-300">
                              {item.brand || "—"}
                            </td>
                            <td className="py-3 px-3 text-center font-bold font-mono text-white">
                              {toPersianDigits(item.requestedQty)}
                            </td>
                            <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                              {formatPrice(item.unitPrice)}
                            </td>
                            <td className="py-3 px-3 text-[11px] text-neutral-400">
                              {item.stockStatus}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TabPagination
        currentPage={currentPage}
        totalItems={rfqs.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
