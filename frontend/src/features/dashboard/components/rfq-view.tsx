"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Phone,
  User,
  MapPin,
  Trash2,
  ShoppingCart,
  Building,
} from "lucide-react";
import { useDashboardRfq } from "../hooks/use-dashboard-rfq";
import { DashboardRfq, RfqItem, RfqStatus } from "../types/rfq.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardFilterBar,
  DashboardStatusBadge,
  DashboardEmptyState,
  DashboardModal,
  FileUploadBox,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function RfqView() {
  const { rfqs, isLoaded, submitRfq } = useDashboardRfq();

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // New RFQ Modal State
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [projectTitle, setProjectTitle] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [projectLocation, setProjectLocation] = React.useState("تهران");
  const [urgency, setUrgency] = React.useState<"normal" | "urgent" | "critical">("normal");
  const [attachedFileName, setAttachedFileName] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<
    { productName: string; brand: string; quantity: number; unit: string; notes?: string }[]
  >([
    { productName: "سوئیچ ۲۴ پورت سیسکو 2960X", brand: "Cisco", quantity: 2, unit: "دستگاه" },
  ]);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Quote View Modal State
  const [viewingQuoteRfq, setViewingQuoteRfq] = React.useState<DashboardRfq | null>(null);

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      { productName: "", brand: "Cisco", quantity: 1, unit: "عدد" },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, [field]: val } : it))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!projectTitle.trim()) {
      setFormError("لطفاً عنوان پروژه را مشخص فرمایید.");
      return;
    }
    if (!clientName.trim()) {
      setFormError("لطفاً نام شرکت یا کارفرما را وارد فرمایید.");
      return;
    }
    const validItems = items.filter((it) => it.productName.trim().length > 0);
    if (validItems.length === 0 && !attachedFileName) {
      setFormError("حداقل یک ردیف کالا وارد کنید یا فایل اکسل BOM را بارگذاری فرمایید.");
      return;
    }

    submitRfq({
      projectTitle,
      clientName,
      projectLocation,
      urgency,
      items: validItems,
      attachedFileName: attachedFileName || undefined,
      notes,
    });

    setIsNewModalOpen(false);
  };

  // Filtered RFQs
  const filteredRfqs = React.useMemo(() => {
    return rfqs.filter((r) => {
      if (activeTab === "quote_ready" && r.status !== "quote_ready") return false;
      if (activeTab === "under_review" && r.status !== "under_review") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = r.rfqNumber.toLowerCase().includes(q);
        const matchTitle = r.projectTitle.toLowerCase().includes(q);
        const matchClient = r.clientName.toLowerCase().includes(q);
        if (!matchNum && !matchTitle && !matchClient) return false;
      }
      return true;
    });
  }, [rfqs, activeTab, searchQuery]);

  // Statistics
  const stats = React.useMemo(() => {
    const quoteReadyCount = rfqs.filter((r) => r.status === "quote_ready").length;
    const reviewCount = rfqs.filter((r) => r.status === "under_review").length;
    return { quoteReadyCount, reviewCount };
  }, [rfqs]);

  const statusVariantMap: Record<RfqStatus, "warning" | "success" | "info" | "danger" | "neutral"> = {
    under_review: "warning",
    quote_ready: "success",
    approved: "info",
    rejected: "danger",
    converted_to_order: "neutral",
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="استعلام قیمت سازمانی و پروژه‌ای (RFQ)"
        description="بارگذاری لیست اکسل BOM تجهیزات شبکه، دریافت پیش‌فاکتور رسمی کمتر از ۳ ساعت و اعمال قیمت‌های ویژه پروژه"
        icon={FileSpreadsheet}
        badge="تخفیف ویژه پروژه‌ها"
        badgeVariant="purple"
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            className="text-xs gap-1.5 font-bold cursor-pointer shadow-md shadow-orange-500/15"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ ثبت استعلام جدید</span>
          </Button>
        }
      />

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="پیش‌فاکتورهای رسمی صادر شده"
          value={
            <span>
              {toPersianDigits(stats.quoteReadyCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">پیش‌فاکتور آماده</span>
            </span>
          }
          subtitle="همراه با قیمت رقابتی و تخصیص سهمیه انبار"
          icon={CheckCircle2}
          variant="emerald"
        />

        <DashboardMetricCard
          title="استعلام‌های در حال بررسی فنی"
          value={
            <span>
              {toPersianDigits(stats.reviewCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">مورد در دست اقدام</span>
            </span>
          }
          subtitle="بررسی توسط کارشناسان ارشد زیرساخت B2B"
          icon={Clock}
          variant="amber"
        />

        <DashboardMetricCard
          title="میانگین زمان صدور قیمت"
          value="کمتر از ۳ ساعت"
          subtitle="پاسخگویی سریع برای مناقصات و قراردادها"
          icon={FileText}
          variant="sky"
        />
      </div>

      {/* ── 3. Filter Bar ─────────────────────────────────────────── */}
      <DashboardFilterBar
        tabs={[
          { key: "all", label: "همه استعلام‌ها", count: rfqs.length },
          { key: "quote_ready", label: "پیش‌فاکتور صادر شد", count: stats.quoteReadyCount },
          { key: "under_review", label: "در حال بررسی", count: stats.reviewCount },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="جستجو بر اساس عنوان پروژه، کد استعلام..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── 4. RFQ Cards List ─────────────────────────────────────── */}
      {filteredRfqs.length === 0 ? (
        <DashboardEmptyState
          icon={FileSpreadsheet}
          title="استعلامی یافت نشد"
          description="هنوز استعلام قیمتی ثبت نشده است. می‌توانید فایل اکسل قطعات یا مشخصات اقلام پروژه خود را ثبت فرمایید."
          actionLabel="+ ثبت اولین استعلام پروژه"
          onActionClick={() => setIsNewModalOpen(true)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRfqs.map((rfq) => (
            <div
              key={rfq.id}
              className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-xs hover:border-neutral-700/80 transition-all text-right"
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 bg-neutral-900/40 border-b border-[var(--theme-border-color)]">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs text-neutral-400 font-mono">شناسه استعلام:</span>
                  <span className="text-sm font-black font-mono text-[var(--theme-foreground)]">
                    {rfq.rfqNumber}
                  </span>
                  <span className="text-neutral-700 hidden sm:inline">•</span>
                  <span className="text-xs text-neutral-400 font-mono">
                    ثبت: {toPersianDigits(rfq.createdAt)}
                  </span>
                  <span className="text-neutral-700 hidden sm:inline">•</span>
                  <DashboardStatusBadge
                    label={rfq.statusLabel}
                    variant={statusVariantMap[rfq.status]}
                  />
                  {rfq.urgency === "urgent" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      فوری
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400 break-words">
                  <Building className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                  <span>کارفرما: {rfq.clientName}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-3.5 sm:p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--theme-foreground)] mb-1 leading-snug">
                    {rfq.projectTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    <span className="break-words">محل اجرای پروژه: {rfq.projectLocation}</span>
                  </div>
                </div>

                {rfq.attachedFileName && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 flex-wrap">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>فایل ضمیمه BOM:</span>
                    <span className="font-mono font-bold text-neutral-200 break-all">
                      {rfq.attachedFileName}
                    </span>
                  </div>
                )}

                {/* Items Summary */}
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/40 p-3 sm:p-4">
                  <span className="text-xs font-semibold text-neutral-400 block mb-2">
                    اقلام استعلام شده ({toPersianDigits(rfq.items.length)} ردیف):
                  </span>
                  <div className="flex flex-col divide-y divide-neutral-800/60 text-xs">
                    {rfq.items.map((it) => (
                      <div
                        key={it.id}
                        className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-neutral-200">{it.productName}</span>
                          <span className="font-mono text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                            {it.brand}
                          </span>
                        </div>
                        <span className="font-mono text-neutral-400 text-xs shrink-0">
                          {toPersianDigits(it.quantity)} {it.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quote Highlight if ready */}
                {rfq.quote && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-emerald-300 font-bold block mb-1">
                        پیش‌فاکتور رسمی صادر شد ({rfq.quote.quoteNumber})
                      </span>
                      <span className="text-[11px] text-neutral-400 block leading-relaxed">
                        کارشناس: {rfq.quote.expertName} • تماس: {toPersianDigits(rfq.quote.expertPhone)}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto border-t sm:border-t-0 border-emerald-500/20 pt-3 sm:pt-0">
                      <div className="flex items-center justify-between sm:flex-col sm:items-end">
                        <span className="text-[11px] text-neutral-400">مبلغ نهایی با تخفیف پروژه:</span>
                        <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
                          {formatPrice(rfq.quote.payableTotal)}
                        </span>
                      </div>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setViewingQuoteRfq(rfq)}
                        className="w-full sm:w-auto text-xs font-bold gap-1 cursor-pointer justify-center"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>مشاهده جزییات پیش‌فاکتور</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. New RFQ Modal ───────────────────────────────────────── */}
      <DashboardModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="ثبت استعلام قیمت جدید (BOM Request)"
        description="ارسال لیست تجمیعی تجهیزات جهت دریافت قیمت‌های سازمانی و تخفیف متراژ پروژه"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right" dir="rtl">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                عنوان پروژه:
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="مثلاً: توسعه سوئیچینگ دیتاسنتر نفت"
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نام کارفرما یا شرکت خریدار:
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="نام شرکت یا پیمانکار"
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                محل اجرای پروژه:
              </label>
              <input
                type="text"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                placeholder="استان و شهر محل پروژه"
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                درجه فوریت استعلام:
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="normal">عادی (پاسخ ظرف ۳ ساعت)</option>
                <option value="urgent">فوری (شرکت در مناقصه)</option>
                <option value="critical">بحرانی دیتاسنتر (فوری)</option>
              </select>
            </div>
          </div>

          {/* File Upload Box */}
          <FileUploadBox
            label="بارگذاری فایل اکسل BOM یا PDF نقشه تجهیزات (اختیاری):"
            selectedFileName={attachedFileName}
            onFileSelect={(name) => setAttachedFileName(name)}
            onFileRemove={() => setAttachedFileName(null)}
          />

          {/* Items Rows */}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-200">
                اقلام درخواستی (ورود دستی):
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItemRow}
                className="text-[11px] h-7 gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>+ افزودن ردیف</span>
              </Button>
            </div>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2.5 sm:p-0 rounded-xl bg-neutral-900/60 sm:bg-transparent border border-neutral-800 sm:border-0 flex flex-col sm:flex-row sm:items-center gap-2 text-xs"
                >
                  <input
                    type="text"
                    value={it.productName}
                    onChange={(e) => handleItemChange(idx, "productName", e.target.value)}
                    placeholder="نام کالا و پارت‌نامبر..."
                    className="w-full sm:flex-1 h-9 sm:h-8.5 px-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-500"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={it.brand}
                      onChange={(e) => handleItemChange(idx, "brand", e.target.value)}
                      placeholder="برند"
                      className="flex-1 sm:w-20 h-9 sm:h-8.5 px-2 rounded-lg border border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-500"
                    />
                    <input
                      type="number"
                      value={it.quantity}
                      min={1}
                      onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                      className="w-16 h-9 sm:h-8.5 px-2 rounded-lg border border-neutral-800 bg-neutral-900 font-mono text-white text-center"
                    />
                    <select
                      value={it.unit}
                      onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                      className="flex-1 sm:w-24 h-9 sm:h-8.5 px-1 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-xs cursor-pointer"
                    >
                      <option value="دستگاه">دستگاه</option>
                      <option value="عدد">عدد</option>
                      <option value="حلقه ۳۰۵ متری">حلقه کابل</option>
                      <option value="متر">متر</option>
                    </select>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-neutral-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-neutral-800 shrink-0"
                        title="حذف ردیف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewModalOpen(false)}
              className="w-full sm:w-auto"
            >
              انصراف
            </Button>
            <Button type="submit" variant="default" size="sm" className="w-full sm:w-auto font-bold">
              ارسال استعلام به دپارتمان فنی
            </Button>
          </div>
        </form>
      </DashboardModal>

      {/* ── 6. View Quote Modal ────────────────────────────────────── */}
      {viewingQuoteRfq && viewingQuoteRfq.quote && (
        <DashboardModal
          isOpen={Boolean(viewingQuoteRfq)}
          onClose={() => setViewingQuoteRfq(null)}
          title={`پیش‌فاکتور رسمی ${viewingQuoteRfq.quote.quoteNumber}`}
          description={`پروژه: ${viewingQuoteRfq.projectTitle}`}
          maxWidth="lg"
        >
          <div className="flex flex-col gap-4 text-right text-xs" dir="rtl">
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
              <div>
                <strong>کارشناس صادرکننده:</strong> {viewingQuoteRfq.quote.expertName}
              </div>
              <div>
                <strong>تماس مستقیم:</strong> {toPersianDigits(viewingQuoteRfq.quote.expertPhone)}
              </div>
              <div>
                <strong>اعتبار قیمت‌ها:</strong> {toPersianDigits(viewingQuoteRfq.quote.validUntil)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2">
              <div className="flex justify-between">
                <span>مبلغ پایه تجهیزات:</span>
                <span className="font-mono">{formatPrice(viewingQuoteRfq.quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>تخفیف ویژه تیراژ پروژه:</span>
                <span className="font-mono">- {formatPrice(viewingQuoteRfq.quote.projectDiscount)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>مالیات ارزش افزوده (۱۰٪):</span>
                <span className="font-mono">+ {formatPrice(viewingQuoteRfq.quote.vatTax)}</span>
              </div>
              <div className="flex justify-between text-base font-black border-t border-neutral-700 pt-2 text-white">
                <span>مبلغ نهایی قابل پرداخت:</span>
                <span className="font-mono text-emerald-400">
                  {formatPrice(viewingQuoteRfq.quote.payableTotal)}
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingQuoteRfq(null)}
                className="w-full sm:w-auto"
              >
                بستن
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  alert("پیش‌فاکتور با موفقیت به سبد خرید جهت تسویه منتقل گردید.");
                  setViewingQuoteRfq(null);
                }}
                className="w-full sm:w-auto font-bold gap-1 justify-center"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>تبدیل به سفارش قطعی</span>
              </Button>
            </div>
          </div>
        </DashboardModal>
      )}
    </div>
  );
}
