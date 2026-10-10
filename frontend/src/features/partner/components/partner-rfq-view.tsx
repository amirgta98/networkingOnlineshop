"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  ArrowLeft,
  FileText,
  UserCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { MOCK_PARTNER_RFQS } from "../data/mock-partner-data";
import type { PartnerRfq } from "../types/partner.types";

export function PartnerRfqView() {
  const [rfqs, setRfqs] = React.useState<PartnerRfq[]>(MOCK_PARTNER_RFQS);
  const [showNewRfqModal, setShowNewRfqModal] = React.useState(false);

  // Form state
  const [formProject, setFormProject] = React.useState("");
  const [formItemsCount, setFormItemsCount] = React.useState("10");
  const [formNote, setFormNote] = React.useState("");
  const [formFileSelected, setFormFileSelected] = React.useState(false);

  const handleCreateRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProject) return;

    const newRfq: PartnerRfq = {
      id: `prfq_${Date.now()}`,
      rfqNumber: `RFQ-1403-0${Math.floor(Math.random() * 900) + 100}`,
      projectTitle: formProject,
      date: "۱۴۰۳/۰۷/۰۷",
      totalEstimated: 120_000_000,
      itemsCount: parseInt(formItemsCount) || 5,
      status: "pending_review",
      statusLabel: "در صف بررسی مهندسی فروش",
      validityDaysRemaining: 7,
      assignedEngineer: "مهندس احسان نوری (اکانت منیجر)",
    };

    setRfqs([newRfq, ...rfqs]);
    setShowNewRfqModal(false);
    setFormProject("");
    setFormNote("");
    setFormFileSelected(false);
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">استعلام قیمت پروژه‌ای و مناقصات (RFQ)</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                ارسال لیست تجمیعی اقلام (BOM)، دریافت پیش‌فاکتور با تخفیف ویژه پیمانکاران و تثبیت قیمت
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowNewRfqModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white gap-2 text-xs shadow-lg shadow-purple-600/25"
        >
          <Plus className="h-4 w-4" />
          <span>ثبت استعلام جدید (BOM)</span>
        </Button>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 text-xs text-purple-300 leading-relaxed flex items-start gap-3">
        <Clock className="h-4 w-4 shrink-0 mt-0.5 text-purple-400" />
        <div>
          <strong>فرآیند استعلام قیمت سازمانی:</strong> پیش‌فاکتورهای پروژه‌ای معمولاً ظرف حداکثر ۲ تا ۴ ساعت کاری توسط دپارتمان مهندسی فروش ققنوس آکادمی بررسی و با اعمال تخفیف‌های ویژه حجم خرید صادر می‌گردند. قیمت‌های پیش‌فاکتور تا مهلت اعتبار تعیین‌شده معتبر خواهند بود.
        </div>
      </div>

      {/* RFQ List */}
      <div className="flex flex-col gap-4">
        {rfqs.map((rfq) => (
          <div
            key={rfq.id}
            className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-sm hover:border-purple-500/40 transition-all flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono font-bold text-sm text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20">
                  {rfq.rfqNumber}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  تاریخ درخواست: {toPersianDigits(rfq.date)}
                </span>
                <span className="text-xs text-neutral-400">
                  تعداد ردیف کالا: <strong className="text-white">{toPersianDigits(rfq.itemsCount)}</strong> قلم
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium ${
                    rfq.status === "approved"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : rfq.status === "quote_issued"
                      ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                      : rfq.status === "pending_review"
                      ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  <span>{rfq.statusLabel}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="text-neutral-400">شرح پروژه یا مناقصه:</span>
                <span className="text-white font-bold leading-relaxed">{rfq.projectTitle}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-neutral-400">کارشناس رسیدگی به استعلام:</span>
                <span className="text-neutral-200 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-purple-400" />
                  <span>{rfq.assignedEngineer}</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-neutral-400">مبلغ برآوردی پیش‌فاکتور:</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {formatPrice(rfq.totalEstimated)}
                </span>
                {rfq.validityDaysRemaining > 0 ? (
                  <span className="text-[11px] text-amber-400 font-medium">
                    مهلت اعتبار پیش‌فاکتور: {toPersianDigits(rfq.validityDaysRemaining)} روز کاری
                  </span>
                ) : (
                  <span className="text-[11px] text-red-400">مهلت اعتبار پایان یافته</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-neutral-400">
                پیش‌فاکتور رسمی با مهر الکترونیک و احتساب تخفیف سازمانی صادر گردیده است.
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-neutral-700 text-neutral-300 hover:text-white gap-1.5"
                  onClick={() => alert(`دانلود پیش‌فاکتور رسمی ${rfq.rfqNumber}`)}
                >
                  <Download className="h-3.5 w-3.5 text-purple-400" />
                  <span>دانلود پیش‌فاکتور PDF</span>
                </Button>

                {rfq.status === "quote_issued" || rfq.status === "approved" ? (
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                    onClick={() => alert(`استعلام ${rfq.rfqNumber} به سفارش نهایی تبدیل و به سبد خرید اضافه شد.`)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>تایید و صدور فاکتور نهایی</span>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New RFQ Modal */}
      {showNewRfqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">ثبت استعلام قیمت پروژه‌ای جدید (RFQ)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRfqModal(false)}
                className="text-neutral-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">عنوان پروژه / مناقصه:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تجهیز سوییچینگ اتاق سرور پتروشیمی زاگرس فاز ۳"
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">تعداد تقریبی ردیف اقلام:</label>
                <input
                  type="number"
                  value={formItemsCount}
                  onChange={(e) => setFormItemsCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">پیوست لیست فایل اکسل اقلام (BOM):</label>
                <div
                  onClick={() => setFormFileSelected(true)}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
                    formFileSelected
                      ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-300"
                      : "border-neutral-800 hover:border-purple-500/40 text-neutral-400"
                  }`}
                >
                  <Upload className="h-6 w-6 mx-auto mb-2 opacity-70" />
                  {formFileSelected ? (
                    <span className="font-bold">فایل BOM-Project-Equipment.xlsx پیوست شد ✓</span>
                  ) : (
                    <span>برای بارگذاری فایل اکسل استعلام (Excel / CSV) کلیک کنید</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">توضیحات تکمیلی یا الزامات فنی کارفرما:</label>
                <textarea
                  rows={3}
                  placeholder="نکات مربوط به برندهای مجاز، موعد تحویل و شرایط تضامین..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewRfqModal(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                  ارسال استعلام به واحد فروش
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
