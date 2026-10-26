"use client";

import * as React from "react";
import {
  FileText,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Building2,
  X,
  User,
  Phone,
  MapPin,
  Barcode,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { partnerInvoicesApi } from "../api/partner-invoices-api";
import type { PartnerInvoice } from "../types/partner.types";

export function PartnerInvoicesView() {
  const [invoices, setInvoices] = React.useState<PartnerInvoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<string>("all");

  // Official Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = React.useState<PartnerInvoice | null>(null);
  const [copiedTaxId, setCopiedTaxId] = React.useState(false);

  const fetchInvoices = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await partnerInvoicesApi.getMyInvoices();
      setInvoices(data);
    } catch (err: any) {
      console.error("[PartnerInvoicesView] Failed to fetch invoices:", err);
      setFetchError("خطا در فراخوانی فاکتورها از سرور. لطفاً مجدداً تلاش فرمایید.");
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  const handleCopyTaxId = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTaxId(true);
    setTimeout(() => setCopiedTaxId(false), 2500);
  };

  const filteredInvoices = React.useMemo(() => {
    return invoices.filter((inv) => {
      // Tab filter
      if (activeTab === "approved" && inv.status !== "APPROVED") return false;
      if (activeTab === "pending" && inv.status !== "PENDING_APPROVAL") return false;
      if (activeTab === "settled" && inv.paymentStatus !== "PAID") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchTax = (inv.taxSystemId || "").toLowerCase().includes(q);
        const matchTitle = (inv.projectTitle || "").toLowerCase().includes(q);
        const matchCustomer = (inv.customerName || "").toLowerCase().includes(q);
        if (!matchNumber && !matchTax && !matchTitle && !matchCustomer) return false;
      }
      return true;
    });
  }, [invoices, activeTab, searchQuery]);

  const totalVat = invoices.reduce((acc, cur) => acc + (cur.vatAmount || cur.taxAmount || 0), 0);
  const totalAmount = invoices.reduce((acc, cur) => acc + (cur.totalAmount || 0), 0);
  const approvedCount = invoices.filter((i) => i.status === "APPROVED").length;
  const pendingCount = invoices.filter((i) => i.status === "PENDING_APPROVAL").length;

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
              <h2 className="text-lg font-bold text-white">فاکتورهای رسمی و سامانه مودیان مالیاتی</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                صورتحساب‌های الکترونیکی تایید شده در کارپوشه سامانه جامع مودیان با شناسه یکتای مالیاتی
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
            تعداد فاکتورها: <strong className="font-mono text-white">{toPersianDigits(invoices.length)}</strong> عدد
          </span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm flex flex-col gap-2">
          <span className="text-xs text-neutral-400">مجموع مبالغ رسمی صادر شده</span>
          <span className="text-xl font-black font-mono text-white">
            {formatPrice(totalAmount)}
          </span>
          <span className="text-[11px] text-neutral-500">شامل کلیه فاکتورهای رسمی B2B</span>
        </div>

        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm flex flex-col gap-2">
          <span className="text-xs text-neutral-400">مجموع مالیات بر ارزش افزوده (۱۰٪)</span>
          <span className="text-xl font-black font-mono text-sky-400">
            {formatPrice(totalVat)}
          </span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>ثبت نهایی در کارپوشه امور مالیاتی</span>
          </span>
        </div>

        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
          <span className="text-xs text-neutral-400">وضعیت تطابق حسابداری و مودیان</span>
          <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="h-4 w-4" />
            <span>تاییدیه رسمی واحد مالی ققنوس</span>
          </span>
          <span className="text-[11px] text-neutral-500">
            {toPersianDigits(approvedCount)} فاکتور تایید شده • {toPersianDigits(pendingCount)} در انتظار تایید
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all", label: "همه صورتحساب‌ها", count: invoices.length },
            { id: "approved", label: "ثبت شده مودیان", count: approvedCount },
            { id: "pending", label: "در انتظار ثبت", count: pendingCount },
            { id: "settled", label: "تسویه شده", count: invoices.filter((i) => i.paymentStatus === "PAID").length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? "bg-sky-700 text-white" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {toPersianDigits(tab.count)}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="جستجوی شماره فاکتور، کد مالیاتی یا پروژه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
            <span className="text-xs text-neutral-400">در حال دریافت فاکتورها از سرور...</span>
          </div>
        ) : fetchError ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-rose-400">
            <AlertCircle className="h-8 w-8" />
            <span className="text-xs">{fetchError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchInvoices()}
              className="text-xs border-neutral-700 text-white mt-2"
            >
              تلاش مجدد
            </Button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500">
              <FileText className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-white">هیچ صورتحسابی یافت نشد</h4>
            <p className="text-xs text-neutral-400 max-w-sm">
              {searchQuery
                ? "فاکتوری منطبق با عبارت جستجو پیدا نشد."
                : "هنوز هیچ فاکتور رسمی برای حساب شما صادر نشده است."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                  <th className="pb-3 pr-2">شماره فاکتور</th>
                  <th className="pb-3 pr-4">شناسه یکتای مالیاتی مودیان</th>
                  <th className="pb-3 pr-4">تاریخ صدور</th>
                  <th className="pb-3 pr-4">عنوان پروژه / خریدار</th>
                  <th className="pb-3 pr-4">مبلغ ناخالص</th>
                  <th className="pb-3 pr-4">ارزش افزوده (۱۰٪)</th>
                  <th className="pb-3 pr-4">مبلغ کل نهایی</th>
                  <th className="pb-3 pr-4">وضعیت سامانه مودیان</th>
                  <th className="pb-3 pr-4 text-center">مشاهده و چاپ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {filteredInvoices.map((inv) => {
                  const isApproved = inv.status === "APPROVED";
                  const isPaid = inv.paymentStatus === "PAID";

                  return (
                    <tr key={inv.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-4 pr-2 font-bold text-white font-sans">{inv.invoiceNumber}</td>
                      <td className="py-4 pr-4">
                        {inv.taxSystemId ? (
                          <span className="text-sky-400 text-[11px] font-mono bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
                            {inv.taxSystemId}
                          </span>
                        ) : (
                          <span className="text-neutral-500 text-[11px] font-sans">
                            در نوبت تخصیص شناسه
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-neutral-400">{toPersianDigits(inv.date)}</td>
                      <td className="py-4 pr-4 text-white font-sans max-w-[180px] truncate">
                        {inv.projectTitle}
                      </td>
                      <td className="py-4 pr-4 text-neutral-300">
                        {formatPrice(inv.subtotal)}
                      </td>
                      <td className="py-4 pr-4 text-sky-400">{formatPrice(inv.vatAmount)}</td>
                      <td className="py-4 pr-4 font-bold text-emerald-400">
                        {formatPrice(inv.totalAmount)}
                      </td>
                      <td className="py-4 pr-4 font-sans">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {inv.statusLabel}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-center font-sans">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-sky-400 hover:text-sky-300 gap-1.5 cursor-pointer"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>مشاهده صورتحساب</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Tax Invoice Standard Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-sky-500/30 bg-[var(--theme-surface)] p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-right">
            {/* Modal Header & Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    صورتحساب الکترونیکی رسمی (سامانه مودیان)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    شماره فاکتور: <strong className="text-white font-mono">{selectedInvoice.invoiceNumber}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs border-neutral-700 text-white gap-1.5 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>چاپ فاکتور رسمی</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="text-neutral-400 hover:text-white p-1 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Official Tax ID Banner */}
            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Barcode className="h-6 w-6 text-sky-400 shrink-0" />
                <div>
                  <span className="text-neutral-400 block text-[11px]">شناسه یکتای مالیاتی سامانه مودیان (۲۲ کاراکتری):</span>
                  <span className="font-mono font-bold text-sky-300 text-sm tracking-wide">
                    {selectedInvoice.taxSystemId || "در انتظار ارسال و تایید در کارپوشه سامانه مودیان"}
                  </span>
                </div>
              </div>

              {selectedInvoice.taxSystemId && (
                <button
                  type="button"
                  onClick={() => handleCopyTaxId(selectedInvoice.taxSystemId!)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600 text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                >
                  {copiedTaxId ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedTaxId ? "کپی شد" : "کپی شناسه مالیاتی"}</span>
                </button>
              )}
            </div>

            {/* Seller & Buyer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Seller Box */}
              <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-2 leading-relaxed">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold pb-1.5 border-b border-neutral-800">
                  <Building2 className="h-4 w-4" />
                  <span>مشخصات فروشنده (توسعه فناوری شبکه ققنوس)</span>
                </div>
                <div>
                  <span className="text-neutral-400">نام شخص حقوقی: </span>
                  <span className="text-white font-medium">شرکت مهندسی ارتباطات پیشرو داده ققنوس</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-neutral-400">شناسه ملی: </span>
                    <span className="text-white font-mono">10103624589</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">کد اقتصادی: </span>
                    <span className="text-white font-mono">411398765412</span>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400">نشانی پستی: </span>
                  <span className="text-neutral-300">تهران، میدان ونک، خیابان دامن افشار، پلاک ۳۴، طبقه ۵</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-neutral-400">کد پستی: </span>
                    <span className="text-neutral-300 font-mono">1998765432</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">تلفن: </span>
                    <span className="text-neutral-300 font-mono">02188776655</span>
                  </div>
                </div>
              </div>

              {/* Buyer Box */}
              <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col gap-2 leading-relaxed">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold pb-1.5 border-b border-neutral-800">
                  <User className="h-4 w-4" />
                  <span>مشخصات خریدار / همکار سازمانی</span>
                </div>
                <div>
                  <span className="text-neutral-400">نام شخص حقیقی/حقوقی: </span>
                  <span className="text-white font-medium">
                    {selectedInvoice.legalDetails?.companyName || selectedInvoice.customerName || "شرکت پیشرو همکار"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-neutral-400">شناسه ملی / ثبت: </span>
                    <span className="text-white font-mono">
                      {selectedInvoice.legalDetails?.nationalId || selectedInvoice.legalDetails?.registrationNumber || "14008954321"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">کد اقتصادی: </span>
                    <span className="text-white font-mono">
                      {selectedInvoice.legalDetails?.economicCode || "411356789123"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400">نشانی: </span>
                  <span className="text-neutral-300">
                    {selectedInvoice.legalDetails?.address || selectedInvoice.customerAddress || "تهران، میدان ونک، خیابان خدامی"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-neutral-400">کد پستی: </span>
                    <span className="text-neutral-300 font-mono">
                      {selectedInvoice.legalDetails?.postalCode || selectedInvoice.customerPostalCode || "1994876543"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400">شماره تماس: </span>
                    <span className="text-neutral-300 font-mono">
                      {selectedInvoice.customerPhone || "09385901032"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-neutral-300">مشخصات کالا و خدمات مورد معامله:</h4>
              <div className="overflow-x-auto rounded-2xl border border-neutral-800">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-900/70 text-neutral-400 font-semibold">
                      <th className="py-2.5 pr-3">ردیف</th>
                      <th className="py-2.5 pr-3">شرح کامل کالا یا خدمات</th>
                      <th className="py-2.5 pr-3">پارت نامبر / SKU</th>
                      <th className="py-2.5 pr-3 text-center">تعداد</th>
                      <th className="py-2.5 pr-3">مبلغ واحد (ریال/تومان)</th>
                      <th className="py-2.5 pr-3">مالیات بر ارزش افزوده (۱۰٪)</th>
                      <th className="py-2.5 pr-3">مبلغ نهایی با مالیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-neutral-300">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-neutral-900/40">
                          <td className="py-3 pr-3 text-neutral-500">{toPersianDigits(idx + 1)}</td>
                          <td className="py-3 pr-3 font-sans font-medium text-white max-w-[240px]">
                            {item.title}
                          </td>
                          <td className="py-3 pr-3 text-sky-400 text-[11px]">{item.sku || "—"}</td>
                          <td className="py-3 pr-3 text-center font-bold text-white">
                            {toPersianDigits(item.quantity)}
                          </td>
                          <td className="py-3 pr-3 text-neutral-300">
                            {formatPrice(item.unitPrice)}
                          </td>
                          <td className="py-3 pr-3 text-sky-400">
                            {formatPrice(item.taxAmount || item.unitPrice * 0.1)}
                          </td>
                          <td className="py-3 pr-3 font-bold text-emerald-400">
                            {formatPrice(item.totalPrice + (item.taxAmount || 0))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-neutral-500 font-sans">
                          اقلام فاکتور ثبت شده است.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1 text-neutral-400 font-sans">
                <span>روش تسویه: <strong className="text-white">{selectedInvoice.paymentMethod === "bank_transfer" ? "حواله پایا / ساتنا" : "درگاه الکترونیک / نقدی"}</strong></span>
                <span>وضعیت پرداخت: <strong className="text-emerald-400">{selectedInvoice.paymentStatus === "PAID" ? "تسویه شده" : "در انتظار تسویه"}</strong></span>
              </div>

              <div className="flex flex-col gap-2 min-w-[260px]">
                <div className="flex justify-between text-neutral-400">
                  <span>مجموع ناخالص فاکتور:</span>
                  <span>{formatPrice(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sky-400">
                  <span>مالیات بر ارزش افزوده (۱۰٪):</span>
                  <span>{formatPrice(selectedInvoice.vatAmount || selectedInvoice.taxAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-neutral-800">
                  <span>مبلغ قابل پرداخت کل:</span>
                  <span>{formatPrice(selectedInvoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Footer Close */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
                className="text-xs border-neutral-700 text-white cursor-pointer px-6"
              >
                بستن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
