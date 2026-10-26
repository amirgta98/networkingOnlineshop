"use client";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  MapPin,
  ExternalLink,
  Download,
  Loader2,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Printer,
  ChevronLeft,
  X,
  Phone,
  Layers,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { partnerOrdersApi } from "../api/partner-orders-api";
import type { PartnerOrder, PartnerOrderItem } from "../types/partner.types";

const ORDER_STATUS_TABS = [
  { id: "all", label: "همه سفارش‌ها" },
  { id: "pending_financial", label: "در انتظار مالی" },
  { id: "processing_warehouse", label: "تخصیص انبار" },
  { id: "shipping", label: "در حال حمل" },
  { id: "delivered", label: "تحویل قطعی" },
  { id: "cancelled", label: "لغو شده" },
];

function OrderItemThumbnail({ imageUrl, title }: { imageUrl?: string; title: string }) {
  const [hasError, setHasError] = React.useState(false);
  const isValidUrl = Boolean(
    imageUrl &&
      !imageUrl.includes("cisco-switch") &&
      !imageUrl.startsWith("/assets/") &&
      !hasError
  );

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center">
      {isValidUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-contain p-1"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <Package className="h-5 w-5 text-neutral-500" />
      )}
    </div>
  );
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case "pending_financial":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "processing_warehouse":
    case "warehouse_allocated":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
    case "shipping":
      return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    case "delivered":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "cancelled":
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    default:
      return "bg-neutral-800 text-neutral-300 border-neutral-700";
  }
}

export function PartnerOrdersView() {
  const [orders, setOrders] = React.useState<PartnerOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<PartnerOrder | null>(null);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const fetchOrders = React.useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);
      setErrorMessage(null);

      const list = await partnerOrdersApi.getPartnerOrders();
      setOrders(list);
    } catch (err: any) {
      console.warn("[PartnerOrdersView] Failed to fetch orders:", err);
      setErrorMessage(
        err?.message || "خطا در دریافت لیست سفارشات از پایگاه داده ققنوس آکادمی. لطفاً مجدداً تلاش نمایید."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered orders based on search query and active tab
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        (order.trackingCode && order.trackingCode.toLowerCase().includes(q)) ||
        order.projectTitle.toLowerCase().includes(q) ||
        (order.companyName && order.companyName.toLowerCase().includes(q)) ||
        (order.waybillNumber && order.waybillNumber.toLowerCase().includes(q)) ||
        (order.items && order.items.some((it) => it.title.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q)));

      const matchTab =
        activeTab === "all"
          ? true
          : activeTab === "pending_financial"
          ? order.status === "pending_financial" || order.status === "processing"
          : activeTab === "processing_warehouse"
          ? order.status === "processing_warehouse" || order.status === "warehouse_allocated"
          : order.status === activeTab;

      return matchSearch && matchTab;
    });
  }, [orders, searchQuery, activeTab]);

  // Tab counts
  const tabCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      pending_financial: 0,
      processing_warehouse: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (o.status === "pending_financial" || o.status === "processing") {
        counts.pending_financial++;
      } else if (o.status === "processing_warehouse" || o.status === "warehouse_allocated") {
        counts.processing_warehouse++;
      } else if (o.status === "shipping") {
        counts.shipping++;
      } else if (o.status === "delivered") {
        counts.delivered++;
      } else if (o.status === "cancelled") {
        counts.cancelled++;
      }
    });
    return counts;
  }, [orders]);

  const totalValueOfFiltered = React.useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.payableAmount || o.totalAmount || 0), 0);
  }, [filteredOrders]);

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">سفارش‌ها و مرسولات شرکتی</h2>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                B2B Live Orders
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              رهگیری سفارش‌های حجیم پروژه‌ای، بارنامه‌های باربری و تخصیص مستقیم تجهیزات شبکه از انبار مرکزی
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchOrders(true)}
            disabled={isLoading || isRefreshing}
            className="h-9 px-3 text-xs bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ml-1.5 ${isRefreshing ? "animate-spin text-sky-400" : ""}`} />
            <span>بروزرسانی وضعیت</span>
          </Button>

          <span className="px-3.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs">
            کل سفارش‌ها: <strong className="font-mono text-white text-sm">{toPersianDigits(orders.length)}</strong> فقره
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void fetchOrders()}
            className="h-7 text-xs border-rose-500/40 text-rose-200 hover:bg-rose-500/20 cursor-pointer"
          >
            تلاش مجدد
          </Button>
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--theme-surface)] p-4 rounded-2xl border border-[var(--theme-border-color)]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {ORDER_STATUS_TABS.map((tab) => {
            const count = tabCounts[tab.id] ?? 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-sky-700 text-white" : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {toPersianDigits(count)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="جستجوی شماره سفارش، عنوان پروژه یا بارنامه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
            <span className="text-xs text-neutral-400">در حال دریافت آخرین سفارش‌های سازمانی از سرور...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">هیچ سفارشی یافت نشد</h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              {searchQuery
                ? "سفارشی منطبق با عبارت جستجو پیدا نشد."
                : "هیچ سفارش سازمانی با وضعیت انتخابی برای حساب شما ثبت نشده است."}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link href="/partner/rfq">
                <Button size="sm" variant="outline" className="text-xs cursor-pointer">
                  ثبت استعلام جدید (RFQ)
                </Button>
              </Link>
              <Link href="/catalog">
                <Button size="sm" className="text-xs bg-sky-600 hover:bg-sky-500 text-white cursor-pointer">
                  مشاهده کاتالوگ تجهیزات
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const badgeClasses = getStatusBadgeClasses(order.status);
            const isRfq =
              order.orderNumber.includes("RFQ") ||
              order.trackingCode?.includes("RFQ") ||
              order.adminNotes?.includes("RFQ");

            return (
              <div
                key={order.id}
                className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all flex flex-col gap-4 ${
                  isRfq
                    ? "border-purple-500/40 bg-gradient-to-br from-purple-950/25 via-[var(--theme-surface)] to-[var(--theme-surface)] hover:border-purple-400 shadow-md shadow-purple-500/5"
                    : "border-sky-500/30 bg-gradient-to-br from-sky-950/20 via-[var(--theme-surface)] to-[var(--theme-surface)] hover:border-sky-400 shadow-md shadow-sky-500/5"
                }`}
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${
                        isRfq
                          ? "bg-purple-500/15 border-purple-500/30 text-purple-300 font-black"
                          : "bg-sky-500/10 border-sky-500/20 text-sky-400 font-bold"
                      }`}
                    >
                      <span className="font-mono text-sm">{order.orderNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.orderNumber)}
                        title="کپی شماره سفارش"
                        className="text-neutral-400 hover:text-white cursor-pointer"
                      >
                        {copiedCode === order.orderNumber ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {isRfq ? (
                      <span className="text-[10px] font-black bg-purple-500/25 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-purple-400" />
                        <span>پروژه استعلامی (RFQ)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-sky-400" />
                        <span>سفارش سازمانی همکار</span>
                      </span>
                    )}

                    <span className="text-xs text-neutral-400 font-mono">
                      تاریخ ثبت: {toPersianDigits(order.date)}
                    </span>

                    <span className="text-xs text-neutral-400">
                      اقلام: <strong className="text-white font-mono">{toPersianDigits(order.itemsCount)}</strong> قلم
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium ${badgeClasses}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                      <span>{order.statusLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
                    {order.items.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 shrink-0 max-w-[240px]"
                      >
                        <OrderItemThumbnail imageUrl={item.imageUrl} title={item.title} />
                        <div className="flex flex-col min-w-0 text-[11px]">
                          <span className="font-medium text-white truncate" title={item.title}>
                            {item.title}
                          </span>
                          <span className="text-neutral-400 font-mono text-[10px]">
                            {toPersianDigits(item.quantity)} عدد × {formatPrice(item.unitPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="flex items-center justify-center px-3 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 shrink-0">
                        +{toPersianDigits(order.items.length - 4)} قلم دیگر
                      </div>
                    )}
                  </div>
                )}

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-neutral-400">عنوان پروژه و تحویل‌گیرنده:</span>
                    <span className="text-white font-bold">{order.projectTitle}</span>
                    {order.siteName && (
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1 truncate" title={order.siteName}>
                        <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
                        <span className="truncate">{order.siteName}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-neutral-400">روش تسویه حساب:</span>
                    <span className="text-neutral-200 font-medium">{order.paymentLabel}</span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                      <span>{order.isPaymentVerified ? "پرداخت و اعتبار تایید شده" : "فاکتور رسمی صادر شد"}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-neutral-400">مبلغ نهایی فاکتور:</span>
                    <span className="text-base font-black font-mono text-emerald-400">
                      {formatPrice(order.payableAmount || order.totalAmount)}
                    </span>
                    {order.waybillNumber && (
                      <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1">
                        <Truck className="h-3 w-3 text-sky-400 shrink-0" />
                        <span>کد باربری: <strong className="text-white">{order.waybillNumber}</strong> ({order.carrierName})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Bottom Action Bar */}
                <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>تحویل تضمین‌شده و گارانتی اصالت تجهیزات سازمانی ققنوس آکادمی</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/partner/invoices`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 ml-1" />
                        <span>صورتحساب</span>
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      className="h-8 text-xs bg-sky-600 hover:bg-sky-500 text-white cursor-pointer flex items-center gap-1"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <span>جزئیات پرونده و مرسوله</span>
                      <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comprehensive Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-sky-500/30 bg-[#0c0d12] p-6 shadow-2xl flex flex-col gap-5 text-right scrollbar-none my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      پرونده سفارش {selectedOrder.orderNumber}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadgeClasses(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.statusLabel}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    تاریخ ثبت: {toPersianDigits(selectedOrder.date)} | کد رهگیری سیستمی: {selectedOrder.trackingCode || selectedOrder.orderNumber}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Delivery Progress Bar */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">وضعیت چرخه تأمین و لجستیک:</span>
                <span className="text-sky-300 font-bold">{selectedOrder.statusLabel}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                {[
                  {
                    step: 1,
                    title: "ثبت سفارش",
                    completed: true,
                  },
                  {
                    step: 2,
                    title: "تایید مالی",
                    completed: selectedOrder.status !== "pending_financial" && selectedOrder.status !== "cancelled",
                  },
                  {
                    step: 3,
                    title: "تخصیص انبار",
                    completed: ["processing_warehouse", "shipping", "delivered"].includes(selectedOrder.status),
                  },
                  {
                    step: 4,
                    title: "تحویل مقصد",
                    completed: selectedOrder.status === "delivered",
                  },
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`h-2.5 w-full rounded-full transition-all ${
                        s.completed ? "bg-sky-500 shadow-[0_0_8px_#0ea5e9]" : "bg-neutral-800"
                      }`}
                    />
                    <span className={s.completed ? "text-sky-300 font-bold" : "text-neutral-500"}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project & Logistics Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1.5">
                <span className="text-neutral-400">طرف حساب و کارفرما:</span>
                <span className="text-white font-bold">{selectedOrder.projectTitle}</span>
                {selectedOrder.shippingAddress?.recipientName && (
                  <span className="text-neutral-300 text-[11px]">
                    تحویل‌گیرنده: {selectedOrder.shippingAddress.recipientName} ({toPersianDigits(selectedOrder.shippingAddress.recipientPhone)})
                  </span>
                )}
                {selectedOrder.siteName && (
                  <span className="text-neutral-400 text-[11px] flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
                    <span>{selectedOrder.siteName}</span>
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1.5">
                <span className="text-neutral-400">اطلاعات حمل و لجستیک:</span>
                <span className="text-neutral-200 font-medium">ناوگان: {selectedOrder.carrierName}</span>
                {selectedOrder.waybillNumber ? (
                  <div className="flex items-center justify-between bg-black/40 px-2.5 py-1.5 rounded-xl border border-neutral-800/80 mt-1">
                    <span className="text-[11px] text-neutral-400">کد رهگیری بارنامه:</span>
                    <div className="flex items-center gap-1.5 font-mono text-sky-400 font-bold">
                      <span>{selectedOrder.waybillNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedOrder.waybillNumber!)}
                        className="text-neutral-400 hover:text-white cursor-pointer"
                      >
                        {copiedCode === selectedOrder.waybillNumber ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-neutral-500 text-[11px]">در صف هماهنگی صدور حواله انبار</span>
                )}
              </div>
            </div>

            {/* Hardware Items List */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-sky-400" />
                <span>اقلام و تجهیزات شبکه سفارش ({toPersianDigits(selectedOrder.items?.length || selectedOrder.itemsCount)} قلم):</span>
              </span>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((it) => (
                    <div
                      key={it.id}
                      className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <OrderItemThumbnail imageUrl={it.imageUrl} title={it.title} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-white font-bold truncate">{it.title}</span>
                          <span className="text-neutral-400 font-mono text-[11px]">{it.sku}</span>
                          {it.warranty && (
                            <span className="text-[10px] text-emerald-400 mt-0.5">{it.warranty}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 text-left">
                        <span className="font-mono font-bold text-white text-xs">
                          {formatPrice(it.totalPrice)}
                        </span>
                        <span className="text-neutral-400 text-[10px] font-mono">
                          {toPersianDigits(it.quantity)} × {formatPrice(it.unitPrice)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
                    جزئیات اقلام از طریق انبار مرکزی در حال تجمیع بار می‌باشد.
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>روش تسویه:</span>
                <span className="text-neutral-200 font-medium">{selectedOrder.paymentLabel}</span>
              </div>

              {Boolean(selectedOrder.discountAmount) && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span>تخفیف همکار تجاری:</span>
                  <span className="text-rose-400 font-mono">-{formatPrice(selectedOrder.discountAmount!)}</span>
                </div>
              )}

              {Boolean(selectedOrder.vatTaxAmount) && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span>مالیات بر ارزش افزوده (۱۰٪):</span>
                  <span className="font-mono text-neutral-300">+{formatPrice(selectedOrder.vatTaxAmount!)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-white font-bold">مبلغ کل فاکتور رسمی:</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {formatPrice(selectedOrder.payableAmount || selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800">
              <Link href="/partner/support">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5 ml-1 text-sky-400" />
                  <span>پشتیبانی و پیگیری بارنامه</span>
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Link href="/partner/invoices">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-sky-500/30 text-sky-300 hover:bg-sky-500/10 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 ml-1" />
                    <span>فاکتور مودیان</span>
                  </Button>
                </Link>

                <Button
                  size="sm"
                  className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
                  onClick={() => setSelectedOrder(null)}
                >
                  بستن پنجره
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
