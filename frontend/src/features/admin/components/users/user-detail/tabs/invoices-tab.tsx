"use client";

import * as React from "react";
import type { AdminUserInvoice } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  FileText,
  AlertCircle,
  RefreshCw,
  Building2,
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
  Receipt,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface InvoicesTabProps {
  userId: string;
}

export function InvoicesTab({ userId }: InvoicesTabProps) {
  const [invoices, setInvoices] = React.useState<AdminUserInvoice[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = React.useState<string | null>(null);

  const fetchInvoices = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserInvoices(userId);
      setInvoices(data || []);
      if (data && data.length > 0) {
        setExpandedInvoiceId(data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load user invoices:", err);
      setError("خطا در بارگذاری فاکتورهای صادر شده برای کاربر.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId((prev) => (prev === id ? null : id));
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
          onClick={fetchInvoices}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <Receipt className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">هیچ فاکتوری صادر نشده است</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          تاکنون فاکتور رسمی یا صورتحساب مالیاتی برای این مشتری ثبت یا صادر نشده است.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>مجموع فاکتورهای صادر شده: <strong className="text-white font-mono">{toPersianDigits(invoices.length)}</strong> فاکتور</span>
      </div>

      <div className="flex flex-col gap-4">
        {invoices.map((inv) => {
          const isExpanded = expandedInvoiceId === inv.id;
          const isOfficial = inv.type === "official" || inv.typeLabel.includes("رسمی");
          const isPaid = inv.paymentStatus === "paid" || inv.paymentStatusLabel.includes("پرداخت");

          return (
            <div
              key={inv.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden transition-all duration-200 hover:border-neutral-700"
            >
              {/* Invoice Header Card */}
              <div
                onClick={() => toggleExpand(inv.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-neutral-900/70 hover:bg-neutral-900 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    <Receipt className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        صورتحساب {inv.invoiceNumber}
                      </span>

                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                          isOfficial
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-neutral-800 text-neutral-300 border-neutral-700"
                        }`}
                      >
                        {inv.typeLabel || (isOfficial ? "فاکتور رسمی دارایی" : "فاکتور عادی")}
                      </span>

                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {inv.paymentStatusLabel || (isPaid ? "تسویه‌شده" : "در انتظار تسویه")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-neutral-500" />
                        کد پیگیری: <span className="font-mono text-neutral-200">{inv.trackingCode}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-neutral-500" />
                        {inv.createdAt}
                      </span>
                      {inv.companyName && (
                        <span className="flex items-center gap-1 text-sky-400 font-medium">
                          <Building2 className="h-3 w-3" />
                          {inv.companyName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-[11px] text-neutral-400">مبلغ کل فاکتور:</span>
                    <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
                      {formatPrice(inv.totalAmount)}
                    </span>
                  </div>

                  <div className="text-neutral-400 p-1 rounded-lg hover:bg-neutral-800">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Invoice Items */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-neutral-800/80 bg-neutral-950/40 flex flex-col gap-4">
                  {/* Financial breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/60">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">مبلغ ناخالص (پایه):</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block">
                        {formatPrice(inv.subtotal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">مالیات بر ارزش افزوده (VAT):</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block">
                        {formatPrice(inv.taxAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">تخفیف همکاری:</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block">
                        {formatPrice(inv.discountAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[11px]">هزینه ارسال و بسته‌بندی:</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block">
                        {formatPrice(inv.shippingCost)}
                      </span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                        <tr>
                          <th className="py-2.5 px-3">شرح ردیف فاکتور</th>
                          <th className="py-2.5 px-3 text-center">تعداد</th>
                          <th className="py-2.5 px-3">قیمت واحد</th>
                          <th className="py-2.5 px-3">مالیات ردیف</th>
                          <th className="py-2.5 px-3">مبلغ کل ردیف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {inv.items.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-800/20">
                            <td className="py-3 px-3 font-medium text-white max-w-sm">
                              {item.title}
                            </td>
                            <td className="py-3 px-3 text-center font-bold font-mono text-white">
                              {toPersianDigits(item.quantity)}
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-300">
                              {formatPrice(item.unitPrice)}
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-400">
                              {formatPrice(item.taxAmount)}
                            </td>
                            <td className="py-3 px-3 font-bold font-mono text-emerald-400">
                              {formatPrice(item.totalPrice)}
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
    </div>
  );
}
