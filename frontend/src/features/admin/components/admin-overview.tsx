"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import {
  MOCK_ADMIN_METRICS,
  MOCK_ADMIN_ORDERS,
  MOCK_ADMIN_PARTNER_APPLICATIONS,
  MOCK_ADMIN_RFQ_ITEMS,
  MOCK_ADMIN_STOCK_ALERTS,
  MOCK_ADMIN_TELEMETRY,
  MOCK_ADMIN_SECURITY_LOGS,
} from "../data/mock-admin-data";
import {
  ShieldAlert,
  Server,
  Palette,
  Users,
  TrendingUp,
  Activity,
  Layers,
  ArrowLeft,
  FileCheck2,
  Lock,
  Cpu,
  Wifi,
  LayoutDashboard,
  Package,
  FileText,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronLeft,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  Headphones,
  Check,
  X,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function AdminOverview() {
  const { user } = useAuth();
  const router = useRouter();

  // State for simulated interactive actions
  const [orders, setOrders] = React.useState(MOCK_ADMIN_ORDERS);
  const [partners, setPartners] = React.useState(MOCK_ADMIN_PARTNER_APPLICATIONS);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [orderFilter, setOrderFilter] = React.useState<"all" | "b2b" | "pending_financial">("all");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleApproveOrder = (orderId: string, trackingCode: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "processing_warehouse",
              statusLabel: "تایید شد - در حال بسته‌بندی پالت انبار",
            }
          : o
      )
    );
    showToast(`✅ سفارش ${trackingCode} با موفقیت تایید و به انبار مرکزی ارسال شد.`);
  };

  const handleApprovePartner = (partnerId: string, companyName: string) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === partnerId ? { ...p, status: "approved" } : p))
    );
    showToast(`✅ مدارک شرکتی «${companyName}» تایید و سقف اعتباری فعال شد.`);
  };

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "b2b") return order.customerType === "b2b";
    if (orderFilter === "pending_financial") return order.status === "pending_financial";
    return true;
  });

  return (
    <div className="flex flex-col gap-8 text-right" dir="rtl">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ─── ۱. بنر خوش‌آمدگویی و سلامت سیستم (Admin Hero Header) ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-xl font-black ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  پیشخوان مدیریت کل | {user?.name || "عرفان سعیدی"}
                </h1>
                <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  صاحب وبسایت و مدیر ارشد کل (Root)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-mono mt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  وضعیت سرورها: آنلاین (Uptime {MOCK_ADMIN_TELEMETRY.uptimePercent})
                </span>
                <span>• تایید دو مرحله‌ای: فعال و مانیتور شده</span>
                <span>• نشست فعلی: TLS 1.3 / E2EE</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/theme">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white gap-2 shadow-lg shadow-purple-600/20 cursor-pointer">
                <Palette className="h-4 w-4" />
                <span>شخصی‌سازی زنده تم</span>
              </Button>
            </Link>

            <Link href="/partner">
              <Button variant="outline" className="gap-2 border-neutral-700 hover:bg-neutral-800 text-neutral-200 cursor-pointer">
                <Building2 className="h-4 w-4 text-sky-400" />
                <span>پرتال سازمانی B2B</span>
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="gap-2 border-neutral-700 hover:bg-neutral-800 text-neutral-200 cursor-pointer">
                <span>مشاهده سایت</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── ۲. کارت‌های شاخص‌های کلیدی (KPI Metrics Grid) ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Sales */}
        <div className="group rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-xs hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>فروش کل تجهیزات (ماه جاری)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-white mb-1">
            {formatPrice(1850000000)}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span>+۲۳٪ رشد نسبت به ماه گذشته</span>
          </span>
        </div>

        {/* Metric 2: Processing Orders */}
        <div className="group rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-xs hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>سفارشات در صف پردازش انبار</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:scale-105 transition-transform">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-white mb-1">
            {toPersianDigits("19")} سفارش
          </div>
          <span className="text-[11px] text-orange-400 font-medium">
            ۴ سفارش شامل تجهیزات فیبر نوری و سیسکو
          </span>
        </div>

        {/* Metric 3: Active B2B Partners */}
        <div className="group rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-xs hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>شرکت‌ها و همکاران B2B فعال</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-white mb-1">
            {toPersianDigits("142")} شرکت
          </div>
          <span className="text-[11px] text-sky-400 font-medium">
            ۸ تقاضای همکاری جدید در انتظار بررسی
          </span>
        </div>

        {/* Metric 4: Infrastructure & Uptime */}
        <div className="group rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-xs hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>سلامت دیتاسنتر و آپتایم</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-white mb-1">
            ۹۹.۹۸٪
          </div>
          <span className="text-[11px] text-purple-400 font-medium">
            تمامی کلاسترهای سرور فعال هستند
          </span>
        </div>
      </div>

      {/* ─── ۳. بخش صف سفارش‌های نیازمند اقدام فوری ───────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>سفارش‌های در جریان نیازمند پردازش و تعیین وضعیت</span>
                <span className="text-xs bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
                  {toPersianDigits(filteredOrders.length)} مورد
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                تایید مالی حواله‌های بانکی، صدور فاکتور رسمی و ارسال دستور خروج به انبار مرکزی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800 shrink-0">
            <button
              type="button"
              onClick={() => setOrderFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                orderFilter === "all" ? "bg-orange-500 text-black font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              همه ({toPersianDigits(orders.length)})
            </button>
            <button
              type="button"
              onClick={() => setOrderFilter("b2b")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                orderFilter === "b2b" ? "bg-orange-500 text-black font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              سازمانی B2B
            </button>
            <button
              type="button"
              onClick={() => setOrderFilter("pending_financial")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                orderFilter === "pending_financial" ? "bg-orange-500 text-black font-bold" : "text-neutral-400 hover:text-white"
              }`}
            >
              انتظار مالی
            </button>
          </div>
        </div>

        {/* Orders Table / Cards */}
        <div className="flex flex-col gap-3">
          {filteredOrders.map((ord) => {
            const isPendingFinancial = ord.status === "pending_financial";

            return (
              <div
                key={ord.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700 transition-all"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 font-mono text-xs font-black text-white">
                    {ord.trackingCode}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {ord.companyName || ord.customerName}
                      </span>
                      {ord.customerType === "b2b" && (
                        <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 font-semibold">
                          همکار حقوقی B2B
                        </span>
                      )}
                      <span className="text-xs text-neutral-400 font-mono">
                        ({ord.date})
                      </span>
                    </div>

                    <div className="text-xs text-neutral-300 mt-1 truncate">
                      📦 اقلام: <span className="text-neutral-200 font-medium">{ord.itemsSummary}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
                  <div className="flex flex-col text-left lg:text-right">
                    <span className="text-xs text-neutral-400">مبلغ سفارش:</span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      {formatPrice(ord.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-xl border font-medium ${
                        isPendingFinancial
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {ord.statusLabel}
                    </span>

                    {isPendingFinancial ? (
                      <Button
                        size="sm"
                        onClick={() => handleApproveOrder(ord.id, ord.trackingCode)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs cursor-pointer shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>تایید مالی و ارسال به انبار</span>
                      </Button>
                    ) : (
                      <Link href="/admin/orders">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs gap-1 cursor-pointer"
                        >
                          <span>جزئیات مرسوله</span>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <span>نمایش ۴ سفارش اخیر از ۱۹ سفارش فعال</span>
          <Link
            href="/admin/orders"
            className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>مشاهده و مدیریت تمام سفارش‌ها</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── ۴. دو ستونه: متقاضیان همکار سازمانی B2B و استعلام‌های RFQ ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ستون راست: تقاضاهای ارتقا به همکار B2B */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    درخواست‌های بررسی مدارک همکاران B2B
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    اعطای خط اعتباری و خرید چکی
                  </span>
                </div>
              </div>
              <span className="text-[11px] bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">
                {toPersianDigits(partners.length)} متقاضی
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {partners.map((partner) => {
                const isApproved = partner.status === "approved";

                return (
                  <div
                    key={partner.id}
                    className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">
                          {partner.companyName}
                        </span>
                        <span className="text-[11px] text-neutral-400 mt-0.5">
                          مدیرعامل / نماینده: {partner.managerName} | شناسه ملی: {toPersianDigits(partner.nationalCode)}
                        </span>
                      </div>

                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        {partner.submittedAt}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/60 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400 text-[11px]">سقف اعتبار درخواستی:</span>
                        <span className="font-bold font-mono text-sky-400 text-xs">
                          {formatPrice(partner.requestedCreditLimit)}
                        </span>
                      </div>

                      {isApproved ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-semibold">
                          <Check className="h-3 w-3" />
                          تایید شده
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePartner(partner.id, partner.companyName)}
                            className="h-7 px-2.5 bg-sky-600 hover:bg-sky-500 text-white text-[11px] gap-1 cursor-pointer"
                          >
                            <UserCheck className="h-3 w-3" />
                            <span>تایید صلاحیت</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">پرتال احراز هویت شرکت‌ها</span>
            <Link
              href="/admin/partners"
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              <span>مشاهده تمام متقاضیان B2B</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ستون چپ: استعلام‌های باز قیمت پروژه‌ای (RFQ) */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <FileSpreadsheet className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    استعلام‌های قیمت پروژه‌ای (RFQ)
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    لیست تجمیعی تجهیزات پروژه با مهلت پاسخ فوری
                  </span>
                </div>
              </div>
              <span className="text-[11px] bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-semibold">
                {toPersianDigits(MOCK_ADMIN_RFQ_ITEMS.length)} استعلام
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {MOCK_ADMIN_RFQ_ITEMS.map((rfq) => (
                <div
                  key={rfq.id}
                  className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">
                        {rfq.projectTitle}
                      </span>
                      <span className="text-[11px] text-neutral-400 mt-0.5">
                        کارفرما: {rfq.clientName} | {toPersianDigits(rfq.itemsCount)} ردیف کالا
                      </span>
                    </div>

                    {rfq.urgent && (
                      <span className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full shrink-0 font-medium">
                        فوری ({toPersianDigits(rfq.deadlineHours)} ساعت)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 text-[11px]">ارزش برآوردی:</span>
                      <span className="font-bold font-mono text-purple-400 text-xs">
                        {formatPrice(rfq.estimatedValue)}
                      </span>
                    </div>

                    <Link href="/admin/rfq">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 border-purple-500/30 hover:bg-purple-500/10 text-purple-300 text-[11px] gap-1 cursor-pointer"
                      >
                        <span>صدور پیش‌فاکتور</span>
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">مدیریت استعلام‌های پروژه‌ای</span>
            <Link
              href="/admin/rfq"
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>مشاهده و قیمت‌دهی RFQها</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─── ۵. مانیتورینگ زنده زیرساخت دیتاسنتر و تجهیزات ──────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>مانیتورینگ بلادرنگ سرورها و تجهیزات فعال زیرساخت</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  دیتاسنتر پایدار
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                پایش لحظه‌ای سوئیچ‌های هسته، لبه، بار پردازشی سرورها و درگاه‌های برخط
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 shrink-0">
            آپتایم سرور: <span className="text-emerald-400 font-bold">99.98% (Online)</span>
          </div>
        </div>

        {/* Telemetry Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">سوئیچ هسته (Core):</span>
            <span className="text-sm font-bold text-white">۱۲ دستگاه فعال</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">Cisco 3850 (100%)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">سوئیچ لبه (Access):</span>
            <span className="text-sm font-bold text-white">۴۸ دستگاه آنلاین</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 font-mono">PoE+ Switches</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">پهنای باند آپلینک:</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">3.8 / 10 Gbps</span>
            <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">Peak Traffic</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">بار پردازنده (CPU):</span>
            <span className="text-sm font-bold text-white font-mono">18%</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">وضعیت پایدار</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">مصرف حافظه (RAM):</span>
            <span className="text-sm font-bold text-white font-mono">34% (Normal)</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">کش فعال Redis</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">سامانه مودیان و بانک:</span>
            <span className="text-sm font-bold text-emerald-400">متصل و فعال</span>
            <span className="text-[10px] text-neutral-400 block mt-0.5 font-mono">Latency 14ms</span>
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="border-t border-neutral-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-neutral-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              <span>آخرین رویدادها و لاگ‌های امنیتی سیستم:</span>
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">TLS 1.3 Strict Mode</span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            {MOCK_ADMIN_SECURITY_LOGS.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800/80 gap-1.5 sm:gap-4 text-neutral-300"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      log.level === "success"
                        ? "bg-emerald-400"
                        : log.level === "warning"
                        ? "bg-amber-400"
                        : "bg-sky-400"
                    }`}
                  />
                  <span className="text-emerald-400 font-semibold truncate">
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="truncate">{log.actor} — {log.action}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[11px] text-neutral-500">
                  <span>IP: {log.ip}</span>
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── ۶. هشدارهای کسری موجودی انبار و گارانتی طلایی RMA ─────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                هشدارهای کسری موجودی انبار تجهیزات شبکه (سفارش مجدد)
              </h3>
              <span className="text-[11px] text-neutral-400">
                کالاهایی با موجودی کمتر از حد آستانه انبار مرکزی
              </span>
            </div>
          </div>

          <Link
            href="/admin/products"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>مدیریت کامل انبار</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {MOCK_ADMIN_STOCK_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800/80"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                    alert.severity === "critical"
                      ? "bg-red-500/15 text-red-400 border border-red-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  !
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {alert.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    پارت‌نامبر: {alert.sku} | برند: {alert.brand}
                  </span>
                  {alert.incomingShipmentDate && (
                    <span className="text-[10px] text-emerald-400 mt-1">
                      🚚 وضعیت بار جدید: {alert.incomingShipmentDate}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 text-left">
                <span className="text-xs font-mono font-black text-white">
                  موجودی: {toPersianDigits(alert.currentStock)} عدد
                </span>
                <span className="text-[10px] text-neutral-500">
                  حداقل آستانه: {toPersianDigits(alert.minThreshold)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ۷. دایرکتوری دسترسی سریع به ابزارهای مدیریتی (Quick Hub) ── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-emerald-400" />
              <span>دایرکتوری دسترسی سریع به ابزارهای مدیریت کل پلتفرم</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              جهش مستقیم به هر یک از ماژول‌های تخصصی مالی، بازرگانی، مهندسی و تنظیمات
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-orange-500/40 hover:bg-neutral-800/40 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 group-hover:scale-105 transition-transform">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">مدیریت سفارش‌ها</span>
                <span className="text-[10px] text-neutral-400 truncate">رهگیری و حواله‌ها</span>
              </div>
            </div>
            <ChevronLeft className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
          </Link>

          <Link
            href="/admin/rfq"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-purple-500/40 hover:bg-neutral-800/40 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">استعلام‌های RFQ</span>
                <span className="text-[10px] text-neutral-400 truncate">قیمت‌دهی پروژه‌ای</span>
              </div>
            </div>
            <ChevronLeft className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
          </Link>

          <Link
            href="/admin/partners"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-sky-500/40 hover:bg-neutral-800/40 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">همکاران سازمانی</span>
                <span className="text-[10px] text-neutral-400 truncate">خط اعتباری و چک</span>
              </div>
            </div>
            <ChevronLeft className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
          </Link>

          <Link
            href="/admin/theme"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-purple-500/40 hover:bg-neutral-800/40 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform">
                <Palette className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">شخصی‌سازی زنده تم</span>
                <span className="text-[10px] text-neutral-400 truncate">پالت و استایل‌ها</span>
              </div>
            </div>
            <ChevronLeft className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
