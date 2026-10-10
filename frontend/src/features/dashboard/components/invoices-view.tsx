"use client";

import * as React from "react";
import {
  FileText,
  Printer,
  Download,
  Mail,
  CheckCircle2,
  Clock,
  Building2,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { useDashboardInvoices } from "../hooks/use-dashboard-invoices";
import { DashboardInvoice, InvoiceType } from "../types/invoices.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardFilterBar,
  DashboardStatusBadge,
  DashboardEmptyState,
  DashboardModal,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function InvoicesView() {
  const { invoices, isLoaded, markAsPaid } = useDashboardInvoices();

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [printModalInvoice, setPrintModalInvoice] = React.useState<DashboardInvoice | null>(null);
  const [emailSentId, setEmailSentId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendEmail = (invoiceId: string) => {
    setEmailSentId(invoiceId);
    setTimeout(() => setEmailSentId(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered invoices
  const filteredInvoices = React.useMemo(() => {
    return invoices.filter((inv) => {
      // Tab filter
      if (activeTab === "official" && inv.type !== "official_legal") return false;
      if (activeTab === "personal" && inv.type !== "personal_standard") return false;
      if (activeTab === "unpaid" && inv.status !== "unpaid") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchMoaddian = inv.moaddianTaxId?.toLowerCase().includes(q);
        const matchBuyer = inv.buyerInfo.name.toLowerCase().includes(q);
        const matchOrder = inv.orderNumber.toLowerCase().includes(q);
        if (!matchNumber && !matchMoaddian && !matchBuyer && !matchOrder) return false;
      }

      return true;
    });
  }, [invoices, activeTab, searchQuery]);

  // Statistics
  const stats = React.useMemo(() => {
    const officialCount = invoices.filter((inv) => inv.type === "official_legal").length;
    const unpaidCount = invoices.filter((inv) => inv.status === "unpaid").length;
    const totalVat = invoices.reduce((sum, inv) => sum + inv.totalTax, 0);

    return { officialCount, unpaidCount, totalVat };
  }, [invoices]);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="فاکتورها و اسناد مالی رسمی"
        description="مشاهده و چاپ فاکتورهای رسمی مورد تأیید سامانه مودیان، محاسبات ارزش افزوده ۱۰٪ و آرشیو اسناد حسابداری"
        icon={FileText}
        badge="منطبق با سامانه مودیان مالیاتی"
        badgeVariant="emerald"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (invoices.length > 0) setPrintModalInvoice(invoices[0]);
            }}
            className="text-xs gap-1.5 border-neutral-700 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-neutral-400" />
            <span>چاپ آخرین فاکتور</span>
          </Button>
        }
      />

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="فاکتورهای رسمی حقوقی (مودیان)"
          value={
            <span>
              {toPersianDigits(stats.officialCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">فاکتور ثبت شده</span>
            </span>
          }
          subtitle="دارای شناسه مالیاتی ۲۲ رقمی معتبر"
          icon={Building2}
          variant="emerald"
        />

        <DashboardMetricCard
          title="صورتحساب‌های در انتظار پرداخت"
          value={
            <span>
              {toPersianDigits(stats.unpaidCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">مورد معوق</span>
            </span>
          }
          subtitle={stats.unpaidCount === 0 ? "تمام اسناد مالی تسویه شده‌اند" : "نیاز به پرداخت فوری"}
          icon={Clock}
          variant={stats.unpaidCount === 0 ? "emerald" : "amber"}
        />

        <DashboardMetricCard
          title="کل مالیات بر ارزش افزوده (۱۰٪)"
          value={
            <span className="truncate">
              {formatPrice(stats.totalVat)}
            </span>
          }
          subtitle="قابل استناد در گزارش فصلی دارایی"
          icon={Percent}
          variant="sky"
        />
      </div>

      {/* ── 3. Filter Bar ─────────────────────────────────────────── */}
      <DashboardFilterBar
        tabs={[
          { key: "all", label: "همه فاکتورها", count: invoices.length },
          { key: "official", label: "فاکتور رسمی حقوقی (مودیان)", count: stats.officialCount },
          { key: "personal", label: "فاکتور مشتریان حقیقی" },
          { key: "unpaid", label: "در انتظار پرداخت", count: stats.unpaidCount },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="جستجو با شماره فاکتور، شناسه مودیان، نام شرکت..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── 4. Invoices List ──────────────────────────────────────── */}
      {filteredInvoices.length === 0 ? (
        <DashboardEmptyState
          icon={FileText}
          title="فاکتوری یافت نشد"
          description={
            searchQuery
              ? "فاکتوری با مشخصات وارد شده پیدا نشد."
              : "هنوز فاکتور رسمی در این دسته صادر نشده است."
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-xs hover:border-neutral-700/80 transition-all text-right"
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-neutral-900/40 border-b border-[var(--theme-border-color)]">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-400 font-mono">شماره:</span>
                    <span className="text-sm font-black font-mono text-[var(--theme-foreground)]">
                      {inv.invoiceNumber}
                    </span>
                  </div>

                  <span className="text-neutral-700">•</span>

                  <span className="text-xs text-neutral-400 font-mono">
                    {toPersianDigits(inv.createdAt)}
                  </span>

                  <span className="text-neutral-700">•</span>

                  <DashboardStatusBadge
                    label={inv.statusLabel}
                    variant={inv.status === "paid" ? "success" : "warning"}
                  />

                  <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-700">
                    {inv.typeLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-neutral-800/60">
                  <span className="text-xs text-neutral-400">سفارش مربوطه:</span>
                  <span className="text-xs font-mono font-bold text-orange-400">
                    {inv.orderNumber}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
                {/* Moaddian Banner if official */}
                {inv.moaddianTaxId && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                    <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                      <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-emerald-300">
                          ثبت قطعی در سامانه جامع مودیان
                        </span>
                        <span className="text-[11px] text-emerald-400/80 font-mono mt-0.5 break-all">
                          شناسه مالیاتی: {inv.moaddianTaxId}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(inv.moaddianTaxId || "", inv.id)}
                      className="text-xs gap-1 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 shrink-0 w-full sm:w-auto"
                    >
                      {copiedId === inv.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>کپی شناسه مالیاتی</span>
                    </Button>
                  </div>
                )}

                {/* Buyer & Seller Compact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 flex flex-col gap-1">
                    <span className="font-bold text-neutral-300">
                      خریدار: {inv.buyerInfo.name}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      کد اقتصادی / شناسه ملی: {toPersianDigits(inv.buyerInfo.nationalIdOrEconomicCode)}
                    </span>
                    <span className="text-neutral-400 text-[11px] leading-relaxed break-words">
                      نشانی: {inv.buyerInfo.address}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 flex flex-col gap-1">
                    <span className="font-bold text-neutral-300">
                      فروشنده: {inv.sellerInfo.name}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      شناسه ملی: {toPersianDigits(inv.sellerInfo.nationalIdOrEconomicCode)} • ثبت: {toPersianDigits(inv.sellerInfo.registrationNumber || "")}
                    </span>
                    <span className="text-neutral-400 text-[11px] leading-relaxed break-words">
                      مرکز پشتیبانی و مالی: {toPersianDigits(inv.sellerInfo.phone)}
                    </span>
                  </div>
                </div>

                {/* Financial Summary Breakdown */}
                <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-neutral-400 block text-[11px]">مبلغ پایه:</span>
                      <span className="font-mono font-bold text-neutral-200">
                        {formatPrice(inv.subtotal)}
                      </span>
                    </div>

                    {inv.totalDiscount > 0 && (
                      <div>
                        <span className="text-neutral-400 block text-[11px]">تخفیف:</span>
                        <span className="font-mono font-bold text-rose-400">
                          - {formatPrice(inv.totalDiscount)}
                        </span>
                      </div>
                    )}

                    {inv.totalTax > 0 && (
                      <div>
                        <span className="text-neutral-400 block text-[11px]">ارزش افزوده (۱۰٪):</span>
                        <span className="font-mono font-bold text-sky-400">
                          + {formatPrice(inv.totalTax)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-right sm:text-left border-t sm:border-t-0 pt-2.5 sm:pt-0 w-full sm:w-auto flex items-center justify-between sm:block">
                    <span className="text-neutral-400 text-[11px] sm:ml-2">مبلغ نهایی:</span>
                    <span className="text-base font-black font-mono text-emerald-400">
                      {formatPrice(inv.payableTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 sm:px-6 bg-neutral-900/30 border-t border-[var(--theme-border-color)]">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrintModalInvoice(inv)}
                    className="text-xs gap-1.5 border-neutral-700 text-neutral-200 hover:bg-neutral-800 cursor-pointer flex-1 sm:flex-initial"
                  >
                    <Printer className="h-3.5 w-3.5 text-orange-400" />
                    <span>مشاهده و چاپ فاکتور</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendEmail(inv.id)}
                    className="text-xs gap-1.5 text-neutral-400 hover:text-white cursor-pointer flex-1 sm:flex-initial"
                  >
                    <Mail className="h-3.5 w-3.5 text-sky-400" />
                    <span>
                      {emailSentId === inv.id ? "ارسال شد ✓" : "ارسال به ایمیل"}
                    </span>
                  </Button>
                </div>

                <div>
                  {inv.status === "unpaid" ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => markAsPaid(inv.id)}
                      className="text-xs gap-1.5 font-bold cursor-pointer shadow-sm w-full sm:w-auto"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>پرداخت و تسویه آنی</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-neutral-400 font-mono">
                      شیوه تسویه: {inv.paymentMethodTitle}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. Official Standard Printable Invoice Modal ───────────── */}
      {printModalInvoice && (
        <DashboardModal
          isOpen={Boolean(printModalInvoice)}
          onClose={() => setPrintModalInvoice(null)}
          title={`پیش‌نمایش چاپ فاکتور رسمی ${printModalInvoice.invoiceNumber}`}
          description="مطابق با فرم استاندارد ماده ۱۶۹ قانون مالیات‌های مستقیم"
          maxWidth="4xl"
        >
          <div className="flex flex-col gap-5 sm:gap-6 text-right" dir="rtl">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 print:hidden">
              <span className="text-xs text-neutral-300">
                با کلیک بر روی دکمه چاپ، نسخه تمیز بدون کادرهای اضافی آماده پرینت یا ذخیره به صورت PDF خواهد بود.
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={handlePrint}
                className="text-xs gap-1.5 font-bold cursor-pointer shrink-0 w-full sm:w-auto"
              >
                <Printer className="h-4 w-4" />
                <span>پرینت / ذخیره PDF</span>
              </Button>
            </div>

            {/* Standard Official Invoice Sheet (Print Paper) */}
            <div
              id="printable-invoice"
              className="p-3.5 sm:p-8 rounded-2xl bg-white text-black border border-neutral-300 shadow-sm font-sans"
              dir="rtl"
            >
              {/* Header Box */}
              <div className="border border-neutral-800 p-3 sm:p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-300 pb-3 mb-3 gap-2">
                  <div className="text-right">
                    <h2 className="text-base sm:text-lg font-black text-neutral-900">
                      صورتحساب فروش کالا و خدمات
                    </h2>
                    <span className="text-xs text-neutral-700">
                      {printModalInvoice.typeLabel}
                    </span>
                  </div>

                  <div className="text-right sm:text-left text-xs font-mono space-y-1 text-neutral-800">
                    <div>
                      <strong>شماره فاکتور:</strong> {printModalInvoice.invoiceNumber}
                    </div>
                    <div>
                      <strong>تاریخ صدور:</strong> {toPersianDigits(printModalInvoice.createdAt)}
                    </div>
                    {printModalInvoice.moaddianTaxId && (
                      <div className="break-all">
                        <strong>شناسه مودیان:</strong> {printModalInvoice.moaddianTaxId}
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller & Buyer Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-neutral-300 pb-3 mb-3">
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-1 border-b pb-0.5">
                      مشخصات فروشنده:
                    </h4>
                    <p className="font-semibold">{printModalInvoice.sellerInfo.name}</p>
                    <p>شناسه ملی / کد اقتصادی: {toPersianDigits(printModalInvoice.sellerInfo.nationalIdOrEconomicCode)}</p>
                    <p>شماره ثبت: {toPersianDigits(printModalInvoice.sellerInfo.registrationNumber || "")} • تلفن: {toPersianDigits(printModalInvoice.sellerInfo.phone)}</p>
                    <p className="break-words">نشانی: {printModalInvoice.sellerInfo.address}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-900 mb-1 border-b pb-0.5">
                      مشخصات خریدار:
                    </h4>
                    <p className="font-semibold">{printModalInvoice.buyerInfo.name}</p>
                    <p>شناسه ملی / کد اقتصادی: {toPersianDigits(printModalInvoice.buyerInfo.nationalIdOrEconomicCode)}</p>
                    <p>کد پستی: {toPersianDigits(printModalInvoice.buyerInfo.postalCode)} • تماس: {toPersianDigits(printModalInvoice.buyerInfo.phone)}</p>
                    <p className="break-words">نشانی: {printModalInvoice.buyerInfo.address}</p>
                  </div>
                </div>

                {/* Items Table with Horizontal Scroll */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-xs text-right border-collapse min-w-[540px]">
                    <thead>
                      <tr className="bg-neutral-100 border border-neutral-800 text-neutral-900 font-bold">
                        <th className="p-2 border border-neutral-800 text-center w-8">ردیف</th>
                        <th className="p-2 border border-neutral-800">شرح کالا یا خدمات</th>
                        <th className="p-2 border border-neutral-800 text-center w-12">تعداد</th>
                        <th className="p-2 border border-neutral-800 text-center w-12">واحد</th>
                        <th className="p-2 border border-neutral-800 text-left">مبلغ واحد (تومان)</th>
                        <th className="p-2 border border-neutral-800 text-left">تخفیف</th>
                        <th className="p-2 border border-neutral-800 text-left">ارزش افزوده</th>
                        <th className="p-2 border border-neutral-800 text-left">مبلغ کل با مالیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printModalInvoice.items.map((item) => (
                        <tr key={item.id} className="border border-neutral-800">
                          <td className="p-2 border border-neutral-800 text-center font-mono">
                            {toPersianDigits(item.rowNumber)}
                          </td>
                          <td className="p-2 border border-neutral-800">
                            <span className="font-semibold block">{item.description}</span>
                            <span className="text-[10px] text-neutral-600 font-mono">کد کالا: {item.productCode}</span>
                          </td>
                          <td className="p-2 border border-neutral-800 text-center font-mono">
                            {toPersianDigits(item.quantity)}
                          </td>
                          <td className="p-2 border border-neutral-800 text-center">
                            {item.unit}
                          </td>
                          <td className="p-2 border border-neutral-800 text-left font-mono">
                            {item.unitPrice.toLocaleString("fa-IR")}
                          </td>
                          <td className="p-2 border border-neutral-800 text-left font-mono">
                            {item.discount > 0 ? item.discount.toLocaleString("fa-IR") : "۰"}
                          </td>
                          <td className="p-2 border border-neutral-800 text-left font-mono">
                            {item.taxAmount > 0 ? item.taxAmount.toLocaleString("fa-IR") : "۰"}
                          </td>
                          <td className="p-2 border border-neutral-800 text-left font-mono font-bold">
                            {item.totalWithTax.toLocaleString("fa-IR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Box */}
                <div className="flex justify-end text-xs">
                  <div className="w-80 space-y-1.5 border border-neutral-800 p-3 bg-neutral-50">
                    <div className="flex justify-between">
                      <span>جمع ناخالص:</span>
                      <span className="font-mono font-bold">{printModalInvoice.subtotal.toLocaleString("fa-IR")} تومان</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>تخفیف کل:</span>
                      <span className="font-mono">{printModalInvoice.totalDiscount.toLocaleString("fa-IR")} تومان</span>
                    </div>
                    <div className="flex justify-between text-neutral-700">
                      <span>مالیات بر ارزش افزوده (۱۰٪):</span>
                      <span className="font-mono">{printModalInvoice.totalTax.toLocaleString("fa-IR")} تومان</span>
                    </div>
                    <div className="flex justify-between text-sm font-black border-t border-neutral-400 pt-1.5 text-neutral-950">
                      <span>مبلغ قابل پرداخت:</span>
                      <span className="font-mono">{printModalInvoice.payableTotal.toLocaleString("fa-IR")} تومان</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 text-center text-xs mt-8 pt-4 border-t border-neutral-300">
                  <div>
                    <span className="font-bold block mb-8">مهر و امضای فروشنده:</span>
                    <span className="text-neutral-500 text-[10px]">شرکت ارتباطات و زیرساخت شبکه ققنوس آکادمی</span>
                  </div>
                  <div>
                    <span className="font-bold block mb-8">مهر و امضای خریدار / تحویل‌گیرنده:</span>
                    <span className="text-neutral-500 text-[10px]">{printModalInvoice.buyerInfo.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrintModalInvoice(null)}
                className="text-xs"
              >
                بستن پنجره
              </Button>
            </div>
          </div>
        </DashboardModal>
      )}
    </div>
  );
}
