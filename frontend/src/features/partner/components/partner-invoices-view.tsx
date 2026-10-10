"use client";

import * as React from "react";
import {
  FileText,
  Download,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { MOCK_PARTNER_INVOICES } from "../data/mock-partner-data";
import type { PartnerInvoice } from "../types/partner.types";

export function PartnerInvoicesView() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredInvoices = React.useMemo(() => {
    return MOCK_PARTNER_INVOICES.filter((inv) => {
      return (
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.taxUniqueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  const totalVat = MOCK_PARTNER_INVOICES.reduce((acc, cur) => acc + cur.vatAmount, 0);
  const totalAmount = MOCK_PARTNER_INVOICES.reduce((acc, cur) => acc + cur.totalAmount, 0);

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">فاکتورهای رسمی و سامانه مودیان</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                صورتحساب‌های الکترونیکی منطبق بر کارپوشه سامانه جامع مودیان با شناسه یکتای مالیاتی
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-xs gap-2"
            onClick={() => alert("گزارش فصلی ماده ۱۶۹ مکرر در قالب اکسل دانلود شد.")}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>گزارش فصلی ماده ۱۶۹</span>
          </Button>
        </div>
      </div>

      {/* Tax Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[var(--theme-surface)] p-4 flex flex-col gap-1">
          <span className="text-[11px] text-neutral-400">مجموع خریدهای رسمی دوره:</span>
          <span className="text-lg font-black font-mono text-white">{formatPrice(totalAmount)}</span>
          <span className="text-[10px] text-neutral-400">شامل اصل کالا و ۱۰٪ مالیات بر ارزش افزوده</span>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[var(--theme-surface)] p-4 flex flex-col gap-1">
          <span className="text-[11px] text-neutral-400">مجموع اعتبار مالیاتی (ارزش افزوده ۱۰٪):</span>
          <span className="text-lg font-black font-mono text-emerald-400">{formatPrice(totalVat)}</span>
          <span className="text-[10px] text-neutral-400">قابل کسر از اظهارنامه مالیات بر ارزش افزوده شرکت</span>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[var(--theme-surface)] p-4 flex flex-col gap-1">
          <span className="text-[11px] text-neutral-400">وضعیت ارسال به سامانه مودیان:</span>
          <span className="text-lg font-bold text-sky-400 flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="h-4 w-4" />
            <span>تایید شده برخط ✓</span>
          </span>
          <span className="text-[10px] text-neutral-400">کلیه فاکتورها در کارپوشه شرکت ثبت شده است</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute right-3.5 top-3 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="جستجوی شماره فاکتور، شناسه مالیاتی یا عنوان پروژه..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-4 pr-10 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
        />
      </div>

      {/* Invoices Table */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/40 text-neutral-400">
                <th className="py-3.5 pr-4 font-semibold">شماره فاکتور و تاریخ</th>
                <th className="py-3.5 px-3 font-semibold">شرح پروژه و اقلام</th>
                <th className="py-3.5 px-3 font-semibold">شناسه مالیاتی سامانه مودیان</th>
                <th className="py-3.5 px-3 font-semibold">مبلغ خالص (ریال)</th>
                <th className="py-3.5 px-3 font-semibold">ارزش افزوده (۱۰٪)</th>
                <th className="py-3.5 px-3 font-semibold">مبلغ نهایی فاکتور</th>
                <th className="py-3.5 px-3 font-semibold">وضعیت تسویه</th>
                <th className="py-3.5 pl-4 text-left font-semibold">دانلود و پرینت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-white text-xs">
                        {inv.invoiceNumber}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400 mt-0.5">
                        {toPersianDigits(inv.date)}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-3">
                    <span className="text-neutral-200 font-medium leading-relaxed block max-w-xs">
                      {inv.projectTitle}
                    </span>
                  </td>

                  <td className="py-4 px-3 font-mono text-[11px] text-sky-400">
                    <span className="bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                      {inv.taxUniqueId}
                    </span>
                  </td>

                  <td className="py-4 px-3 font-mono text-neutral-300">
                    {formatPrice(inv.subtotal)}
                  </td>

                  <td className="py-4 px-3 font-mono text-emerald-400 font-medium">
                    {formatPrice(inv.vatAmount)}
                  </td>

                  <td className="py-4 px-3 font-mono font-bold text-white text-sm">
                    {formatPrice(inv.totalAmount)}
                  </td>

                  <td className="py-4 px-3">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                        inv.status === "settled_cheque" || inv.status === "settled_cash"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      }`}
                    >
                      {inv.statusLabel}
                    </span>
                  </td>

                  <td className="py-4 pl-4 text-left">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-[11px] border-neutral-700 text-neutral-200 hover:text-white gap-1"
                        onClick={() => alert(`دانلود PDF رسمی فاکتور ${inv.invoiceNumber}`)}
                      >
                        <Download className="h-3 w-3 text-sky-400" />
                        <span>PDF</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px] text-neutral-400 hover:text-white"
                        onClick={() => window.print()}
                      >
                        <Printer className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
