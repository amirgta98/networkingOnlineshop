"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Calendar,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  User,
  Phone,
  Building2,
  Hash,
  MapPin,
  CreditCard,
  ShieldCheck,
  FileText,
  Printer,
  RotateCcw,
  Check,
  AlertCircle,
  Eye,
  Layers,
} from "lucide-react";
import { cn, formatPrice, toPersianDigits } from "@/shared/lib/utils";
import type {
  AdminOrder,
  AdminShippingCarrier,
} from "../../types/admin-orders.types";
import {
  ORDER_STATUS_CONFIG,
  CARRIER_CONFIG,
  getPaymentMethodLabel,
  getOrderStatusMeta,
  getCarrierMeta,
} from "../../types/admin-orders.types";
import { adminOrdersApi } from "../../api/admin-orders-api";
import { AdminActionModal } from "../shared";

interface AdminOrderDetailViewProps {
  orderId: string;
}

export function AdminOrderDetailView({ orderId }: AdminOrderDetailViewProps) {
  const router = useRouter();
  const [order, setOrder] = React.useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // پیام توست
  const [toast, setToast] = React.useState<{
    message: string;
    type?: "success" | "info";
  } | null>(null);

  // یادداشت‌های مدیر
  const [notesText, setNotesText] = React.useState<string>("");
  const [isSavingNotes, setIsSavingNotes] = React.useState<boolean>(false);

  // مودال تایید مالی
  const [isApproveModalOpen, setIsApproveModalOpen] = React.useState(false);
  const [financialApprovalNote, setFinancialApprovalNote] = React.useState("");
  const [isApproveLoading, setIsApproveLoading] = React.useState(false);

  // مودال تخصیص بارنامه و ناوگان
  const [isShippingModalOpen, setIsShippingModalOpen] = React.useState(false);
  const [selectedCarrier, setSelectedCarrier] = React.useState<AdminShippingCarrier>("tipax");
  const [trackingCodeInput, setTrackingCodeInput] = React.useState("");
  const [shippingError, setShippingError] = React.useState("");
  const [isShippingLoading, setIsShippingLoading] = React.useState(false);

  const showToast = React.useCallback(
    (message: string, type: "success" | "info" = "success") => {
      setToast({ message, type });
      setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, 4000);
    },
    []
  );

  const fetchOrder = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminOrdersApi.getOrderById(orderId);
      if (data) {
        setOrder(data);
        setNotesText(data.adminNotes || "");
      } else {
        setError("اطلاعات سفارش مورد نظر یافت نشد.");
      }
    } catch (err: unknown) {
      console.error("[AdminOrderDetail] Failed to fetch order:", err);
      setError("خطا در برقراری ارتباط با سرور یا عدم وجود سفارش.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ذخیره یادداشت مدیریت
  const handleSaveNotes = async () => {
    if (!order) return;
    setIsSavingNotes(true);
    try {
      const currentStatus = (order.status || "pending_financial").toUpperCase();
      await adminOrdersApi.updateOrderStatus(order.id, currentStatus, undefined, undefined, notesText);
      setOrder((prev) => (prev ? { ...prev, adminNotes: notesText } : null));
      showToast("یادداشت مدیریت با موفقیت در سرور ذخیره شد.", "success");
    } catch (err) {
      console.error("[AdminOrderDetail] Failed to save notes:", err);
      showToast("خطا در ذخیره یادداشت در سرور", "info");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // عملیات تایید مالی
  const handleOpenApproveModal = () => {
    setFinancialApprovalNote("");
    setIsApproveModalOpen(true);
  };

  const handleConfirmFinancialApproval = async () => {
    if (!order) return;
    setIsApproveLoading(true);

    try {
      const updatedOrder = await adminOrdersApi.updateOrderStatus(
        order.id,
        "PROCESSING_WAREHOUSE",
        undefined,
        undefined,
        financialApprovalNote.trim() || undefined
      );

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              ...updatedOrder,
              status: "processing_warehouse" as const,
              statusLabel: getOrderStatusMeta("processing_warehouse").label,
              isPaymentVerified: true,
            }
          : null
      );

      showToast(`حواله بانکی سفارش ${order.orderNumber} با موفقیت تایید شد.`, "success");
    } catch (err: unknown) {
      console.error("[AdminOrderDetail] API approval failed:", err);
      const msg = err instanceof Error ? err.message : "خطا در تایید مالی سفارش در سرور";
      showToast(msg, "info");
    } finally {
      setIsApproveLoading(false);
      setIsApproveModalOpen(false);
    }
  };

  // عملیات تخصیص بارنامه
  const handleOpenShippingModal = () => {
    if (!order) return;
    const safeCarrier: AdminShippingCarrier =
      order.carrier === "chapar"
        ? "chapar"
        : order.carrier === "freight"
        ? "freight"
        : order.carrier === "express"
        ? "express"
        : "tipax";
    setSelectedCarrier(safeCarrier);
    const carrierCfg = CARRIER_CONFIG[safeCarrier];
    setTrackingCodeInput(
      order.carrierTrackingCode ||
        `${carrierCfg.trackingPrefix}${Math.floor(10000000 + Math.random() * 90000000)}`
    );
    setShippingError("");
    setIsShippingModalOpen(true);
  };

  const handleConfirmAssignShipping = async () => {
    if (!order) return;

    if (!trackingCodeInput.trim()) {
      setShippingError("لطفاً شماره بارنامه را وارد نمایید.");
      return;
    }

    setIsShippingLoading(true);
    const carrierMeta = CARRIER_CONFIG[selectedCarrier] || getCarrierMeta(selectedCarrier);
    const trackingUrl = carrierMeta.getTrackingUrl(trackingCodeInput.trim());

    try {
      const updatedOrder = await adminOrdersApi.assignCarrier(
        order.id,
        selectedCarrier,
        trackingCodeInput.trim()
      );

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              ...updatedOrder,
              carrier: selectedCarrier,
              carrierName: carrierMeta.name,
              carrierTrackingCode: trackingCodeInput.trim(),
              carrierTrackingUrl: trackingUrl,
              status: "shipping" as const,
              statusLabel: getOrderStatusMeta("shipping").label,
            }
          : null
      );

      showToast(`بارنامه ${trackingCodeInput.trim()} با موفقیت ثبت شد.`, "success");
    } catch (err: unknown) {
      console.error("[AdminOrderDetail] Assign shipping failed:", err);
      const msg = err instanceof Error ? err.message : "خطا در ثبت بارنامه در سرور";
      showToast(msg, "info");
    } finally {
      setIsShippingLoading(false);
      setIsShippingModalOpen(false);
    }
  };

  // عملیات ثبت تحویل
  const handleMarkDelivered = async () => {
    if (!order) return;
    try {
      await adminOrdersApi.updateOrderStatus(order.id, "DELIVERED");
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "delivered" as const,
              statusLabel: getOrderStatusMeta("delivered").label,
            }
          : null
      );
      showToast(`سفارش ${order.orderNumber} با موفقیت به عنوان تحویل‌شده ثبت شد.`, "success");
    } catch (err: unknown) {
      console.error("[AdminOrderDetail] Mark delivered failed:", err);
      const msg = err instanceof Error ? err.message : "خطا در ثبت وضعیت تحویل در سرور";
      showToast(msg, "info");
    }
  };

  // وضعیت لودینگ اسکلتون
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto" dir="rtl">
        <div className="h-28 w-full bg-neutral-900/60 rounded-3xl border border-neutral-800 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-24 bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
          <div className="h-24 bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
          <div className="h-24 bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
          <div className="h-24 bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-neutral-900/30 rounded-3xl border border-neutral-800 animate-pulse" />
          <div className="lg:col-span-4 h-96 bg-neutral-900/30 rounded-3xl border border-neutral-800 animate-pulse" />
        </div>
      </div>
    );
  }

  // وضعیت خطا
  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center" dir="rtl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-white">خطا در دریافت پرونده سفارش</h2>
        <p className="text-sm text-neutral-400 max-w-md">{error || "سفارش مورد نظر پیدا نشد."}</p>
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={fetchOrder}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>تلاش مجدد</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به فهرست سفارش‌ها</span>
          </button>
        </div>
      </div>
    );
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const carrierMeta = getCarrierMeta(order.carrier);
  const items = order.items || [];
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // مراحل چرخه عمر سفارش جهت گاه‌شمار
  const lifecycleSteps = [
    {
      id: "registered",
      title: "ثبت و پیش‌فاکتور",
      desc: "سفارش در سامانه ثبت شده",
      completed: true,
      current: false,
    },
    {
      id: "financial",
      title: "تأیید مالی",
      desc: order.isPaymentVerified ? "واریز تایید شده" : "در انتظار استعلام فیش",
      completed: order.status !== "pending_financial" && order.status !== "cancelled",
      current: order.status === "pending_financial",
    },
    {
      id: "warehouse",
      title: "بسته‌بندی انبار",
      desc: "سریال‌گذاری و آماده‌سازی",
      completed: order.status === "shipping" || order.status === "delivered",
      current: order.status === "processing_warehouse",
    },
    {
      id: "carrier",
      title: "ناوگان باربری",
      desc: order.carrierTrackingCode ? "بارنامه تخصیص یافته" : "در انتظار بارنامه",
      completed: order.status === "delivered",
      current: order.status === "shipping",
    },
    {
      id: "delivered",
      title: "تحویل کارفرما",
      desc: "تحویل نهایی تجهیزات",
      completed: order.status === "delivered",
      current: false,
    },
  ];

  return (
    <div className="flex flex-col gap-8 text-right pb-16" dir="rtl">
      {/* ─── پیام توست (Toast Notification) ─── */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="mr-2 text-emerald-400/60 hover:text-emerald-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ─── مسیر ناوبری و دکمه بازگشت (Breadcrumbs) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/admin" className="hover:text-white transition-colors">
            پیشخوان مدیریت
          </Link>
          <span className="text-neutral-600">/</span>
          <Link href="/admin/orders" className="hover:text-white transition-colors">
            مدیریت سفارش‌ها
          </Link>
          <span className="text-neutral-600">/</span>
          <span className="font-bold text-white font-mono">{order.orderNumber}</span>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/orders")}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>بازگشت به فهرست سفارش‌ها</span>
        </button>
      </div>

      {/* ─── هدر جامع پرونده سفارش (Order Header Banner) ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/90 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xl font-black shadow-lg">
              <Package className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  پرونده سفارش {order.orderNumber}
                </h1>
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.orderNumber, "orderNum")}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="کپی شماره سفارش"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {copiedKey === "orderNum" && (
                  <span className="text-[10px] text-emerald-400 font-medium">کپی شد</span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                    statusMeta.chipClass
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full animate-pulse", statusMeta.dotClass)} />
                  {statusMeta.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                  <span>زمان ثبت: {toPersianDigits(order.createdAt)}</span>
                </div>
                <span className="text-neutral-700">•</span>
                <div className="flex items-center gap-1 font-mono">
                  <span>کد رهگیری سامانه:</span>
                  <span className="text-neutral-200 font-bold">{order.trackingCode}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(order.trackingCode, "trackCode")}
                    className="p-1 hover:text-white transition-colors"
                    title="کپی کد رهگیری"
                  >
                    <Copy className="h-3 w-3 text-neutral-500" />
                  </button>
                  {copiedKey === "trackCode" && (
                    <span className="text-[10px] text-emerald-400">کپی شد</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* دکمه‌های عملیات سریع هدر */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {order.status === "pending_financial" && (
              <button
                type="button"
                onClick={handleOpenApproveModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-600/20"
              >
                <Check className="h-4 w-4" />
                <span>تایید مالی حواله بانکی</span>
              </button>
            )}

            {(order.status === "processing_warehouse" || order.status === "shipping") && (
              <button
                type="button"
                onClick={handleOpenShippingModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors shadow-lg shadow-orange-600/20"
              >
                <Truck className="h-4 w-4" />
                <span>{order.carrierTrackingCode ? "ویرایش بارنامه و حامل" : "تخصیص بارنامه"}</span>
              </button>
            )}

            {order.status === "shipping" && (
              <button
                type="button"
                onClick={handleMarkDelivered}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>ثبت تحویل موفق</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition-colors"
              title="چاپ حواله انبار و فاکتور"
            >
              <Printer className="h-4 w-4 text-neutral-400" />
              <span>چاپ سند</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── کارت‌های آمار و شاخص‌های کلیدی پرونده ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="rounded-2xl border border-neutral-800 bg-[var(--theme-surface)] p-4 space-y-1">
          <span className="text-neutral-500 block text-[11px]">طرف قرارداد و نوع مشتری</span>
          <div className="flex items-center gap-1.5 font-bold text-neutral-200 text-sm">
            {order.customerType === "b2b" ? (
              <>
                <Building2 className="h-4 w-4 text-sky-400" />
                <span>حقوقی / B2B سازمانی</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4 text-neutral-400" />
                <span>حقیقی / مشتری خرد</span>
              </>
            )}
          </div>
          {order.companyName && (
            <span className="text-[11px] text-sky-400 truncate block">{order.companyName}</span>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[var(--theme-surface)] p-4 space-y-1">
          <span className="text-neutral-500 block text-[11px]">تعداد اقلام سخت‌افزاری</span>
          <div className="font-bold text-white text-sm">
            {toPersianDigits(items.length)} ردیف کالا
          </div>
          <span className="text-[11px] text-neutral-400 block">
            مجموعاً {toPersianDigits(totalQuantity)} دستگاه / قطعه
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[var(--theme-surface)] p-4 space-y-1">
          <span className="text-neutral-500 block text-[11px]">وضعیت تسویه مالی</span>
          <div
            className={cn(
              "font-bold text-sm",
              order.isPaymentVerified ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {order.isPaymentVerified ? "تایید و تسویه شده ✓" : "معلق و نیازمند بررسی"}
          </div>
          <span className="text-[11px] text-neutral-400 truncate block">
            {getPaymentMethodLabel(order.paymentMethod).split("/")[0]}
          </span>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-[var(--theme-surface)] p-4 space-y-1">
          <span className="text-neutral-500 block text-[11px]">مبلغ نهایی قابل پرداخت</span>
          <div className="font-bold text-emerald-400 text-base font-mono">
            {formatPrice(order.payableAmount)}
          </div>
          <span className="text-[11px] text-neutral-400 block">شامل مالیات و تخفیف‌ها</span>
        </div>
      </div>

      {/* ─── چیدمان دو ستونه اصلی صفحه (Main 2-Column Grid) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ستون اصلی راست (اقلام سفارش، اطلاعات مشتری، نشانی تحویل) - 8 ستون */}
        <div className="lg:col-span-8 space-y-8">
          {/* ۱. فهرست کامل اقلام و تجهیزات سفارش (Items & Equipment Catalog) */}
          <div className="rounded-3xl border border-neutral-800 bg-[var(--theme-surface)] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Layers className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-white">
                  فهرست تجهیزات شبکه و کالاهای سفارش ({toPersianDigits(items.length)} ردیف)
                </h2>
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                مجموع {toPersianDigits(totalQuantity)} قطعه تجهیزات
              </span>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => {
                const itemLink = item.productId
                  ? `/admin/products/${item.productId}/edit`
                  : undefined;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 space-y-4 transition-colors hover:border-neutral-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-xs font-bold text-neutral-300 font-mono">
                            {toPersianDigits(idx + 1)}
                          </span>
                          <h3 className="font-bold text-white text-sm leading-snug">
                            {item.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 pt-1">
                          <span className="px-2 py-0.5 rounded-lg bg-neutral-800 border border-neutral-700/60 text-neutral-200 font-medium">
                            برند: {item.brand}
                          </span>
                          <span className="text-neutral-700">•</span>
                          <span className="font-mono text-neutral-300">مدل: {item.model}</span>
                          <span className="text-neutral-700">•</span>
                          <span className="font-mono text-neutral-400">SKU: {item.sku}</span>
                        </div>
                      </div>

                      <div className="text-left space-y-1 sm:shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                        <div className="text-sm font-bold text-emerald-400 font-mono">
                          {formatPrice(item.totalPrice)}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {toPersianDigits(item.quantity)} عدد × {formatPrice(item.unitPrice)}
                        </div>
                      </div>
                    </div>

                    {/* گارانتی، سریال‌ها و لینک کاتالوگ محصول */}
                    <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-[11px]">{item.warranty}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.serialNumbers && item.serialNumbers.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-neutral-500 text-[10px]">شماره سریال‌ها:</span>
                            {item.serialNumbers.map((sn) => (
                              <span
                                key={sn}
                                className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[10px] text-neutral-200"
                              >
                                {sn}
                              </span>
                            ))}
                          </div>
                        )}

                        {itemLink && (
                          <Link
                            href={itemLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium transition-colors"
                          >
                            <span>مشاهده در انبار</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ۲. مشخصات خریدار و حساب کاربری */}
          <div className="rounded-3xl border border-neutral-800 bg-[var(--theme-surface)] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <User className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-white">مشخصات خریدار و طرف قرارداد</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1">
                <span className="text-neutral-500 text-[11px]">نام و نام خانوادگی خریدار:</span>
                <div className="font-bold text-white text-sm">{order.customerName}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1">
                <span className="text-neutral-500 text-[11px]">شماره تماس همراه:</span>
                <div dir="ltr" className="font-mono font-bold text-neutral-200 text-sm">
                  {toPersianDigits(order.phoneNumber)}
                </div>
              </div>

              {order.companyName && (
                <div className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1">
                  <span className="text-neutral-500 text-[11px]">نام شرکت / سازمان خریدار:</span>
                  <div className="font-bold text-sky-400 text-sm">{order.companyName}</div>
                </div>
              )}

              {order.nationalCode && (
                <div className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-1">
                  <span className="text-neutral-500 text-[11px]">شناسه ملی / کد اقتصادی:</span>
                  <div className="font-mono font-bold text-neutral-200 text-sm">
                    {toPersianDigits(order.nationalCode)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ۳. نشانی و ناوگان ارسال مرسوله */}
          <div className="rounded-3xl border border-neutral-800 bg-[var(--theme-surface)] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Truck className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-white">اطلاعات تحویل و رهگیری باربری</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                <MapPin className="h-5 w-5 text-neutral-400 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      استان {order.shippingAddress?.province || "نامشخص"}، شهر{" "}
                      {order.shippingAddress?.city || "نامشخص"}
                    </span>
                    <span className="text-neutral-700">•</span>
                    <span className="text-neutral-400 font-mono">
                      کد پستی: {toPersianDigits(order.shippingAddress?.postalCode || "نامشخص")}
                    </span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-xs">
                    {order.shippingAddress?.fullAddress || "آدرس ثبت نشده است"}
                  </p>
                  <div className="text-[11px] text-neutral-400 pt-1">
                    تحویل‌گیرنده:{" "}
                    <span className="text-neutral-200 font-bold">
                      {order.shippingAddress?.recipientName || order.customerName}
                    </span>{" "}
                    (تلفن: {toPersianDigits(order.shippingAddress?.recipientPhone || order.phoneNumber)})
                  </div>
                </div>
              </div>

              {/* کارت حامل و بارنامه */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-neutral-400 text-xs font-medium">
                    وضعیت صدور بارنامه رسمی لجستیک:
                  </span>
                  {order.carrierTrackingCode ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      بارنامه صادر و تخصیص یافته
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
                      <Clock className="h-4 w-4" />
                      در انتظار صدور کد رهگیری بارنامه
                    </span>
                  )}
                </div>

                {order.carrierTrackingCode ? (
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-800">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-sm">
                        {order.carrierName || carrierMeta.name}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs">
                        <span>شماره بارنامه: {order.carrierTrackingCode}</span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(order.carrierTrackingCode || "", "carrierTrack")
                          }
                          className="p-1 hover:text-white transition-colors"
                          title="کپی بارنامه"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        {copiedKey === "carrierTrack" && (
                          <span className="text-[10px] text-emerald-400 font-sans">کپی شد</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.carrierTrackingUrl && (
                        <a
                          href={order.carrierTrackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold transition-colors"
                        >
                          <span>استعلام برخط ناوگان</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleOpenShippingModal}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
                      >
                        ویرایش بارنامه
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-800">
                    <span className="text-neutral-500 text-xs">
                      هنوز بارنامه ناوگان تیپاکس یا باربری برای این مرسوله صادر نشده است.
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenShippingModal}
                      className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors"
                    >
                      تخصیص بارنامه اکنون
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ستون کناری چپ (تسویه مالی، گاه‌شمار چرخه سفارش، یادداشت‌ها) - 4 ستون */}
        <div className="lg:col-span-4 space-y-8">
          {/* ۱. صورت‌حساب مالی و تسویه */}
          <div className="rounded-3xl border border-neutral-800 bg-[var(--theme-surface)] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <CreditCard className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-white">صورت‌حساب و وضعیت تسویه</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-neutral-400">
                <span>جمع اقلام سفارش:</span>
                <span className="font-mono font-medium text-neutral-200">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between items-center text-rose-400">
                  <span>تخفیف همکاری و سازمانی:</span>
                  <span className="font-mono font-medium">
                    - {formatPrice(order.discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-neutral-400">
                <span>مالیات بر ارزش افزوده (۱۰٪):</span>
                <span className="font-mono font-medium text-neutral-200">
                  {formatPrice(order.vatTaxAmount)}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-sm font-bold">
                <span className="text-white">مبلغ نهایی قابل پرداخت:</span>
                <span className="text-emerald-400 font-mono text-base font-black">
                  {formatPrice(order.payableAmount)}
                </span>
              </div>

              <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">روش پرداخت:</span>
                  <span className="font-bold text-neutral-200">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>

                {order.paymentReceiptNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">شماره رهگیری سند / فیش:</span>
                    <span className="font-mono text-neutral-200 font-bold">
                      {order.paymentReceiptNumber}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 border-t border-neutral-800/80">
                  <span className="text-neutral-500">تاییدیه حسابداری:</span>
                  <span
                    className={cn(
                      "font-bold",
                      order.isPaymentVerified ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {order.isPaymentVerified ? "تایید شده ✓" : "معلق"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ۲. گاه‌شمار چرخه عمر سفارش (Lifecycle Timeline) */}
          <div className="rounded-3xl border border-neutral-800 bg-[var(--theme-surface)] p-6 space-y-4">
            <h2 className="text-sm font-bold text-white pb-3 border-b border-neutral-800">
              مراحل و گاه‌شمار چرخه سفارش
            </h2>

            <div className="space-y-4 relative before:absolute before:inset-0 before:right-3.5 before:w-0.5 before:bg-neutral-800">
              {lifecycleSteps.map((step) => (
                <div key={step.id} className="relative flex items-start gap-3.5 pr-1">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold z-10 transition-colors",
                      step.completed
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                        : step.current
                        ? "bg-orange-500 text-white ring-4 ring-orange-500/20 animate-pulse"
                        : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                    )}
                  >
                    {step.completed ? <Check className="h-3.5 w-3.5" /> : null}
                  </div>
                  <div className="space-y-0.5 pt-0.5">
                    <div
                      className={cn(
                        "text-xs font-bold",
                        step.completed
                          ? "text-neutral-200"
                          : step.current
                          ? "text-orange-400"
                          : "text-neutral-500"
                      )}
                    >
                      {step.title}
                    </div>
                    <div className="text-[11px] text-neutral-500">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ۳. یادداشت‌های مدیریتی سفارش */}
          <div className="rounded-3xl border border-neutral-800 bg-[var(--theme-surface)] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <FileText className="h-4 w-4 text-neutral-400" />
              <h2 className="text-sm font-bold text-white">یادداشت‌های داخلی و انبار</h2>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="یادداشت‌های فنی، هماهنگی تحویل یا نکات حسابداری..."
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-3 text-xs text-neutral-200 focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isSavingNotes ? "در حال ذخیره..." : "ذخیره یادداشت"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── مودال تایید مالی حواله بانکی (Bank Wire Approval Modal) ─── */}
      <AdminActionModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="تایید واریز حواله بانکی و صدور حواله خروج انبار"
        variant="success"
        confirmLabel={isApproveLoading ? "در حال تایید..." : "تایید واریز و صدور دستور انبار"}
        cancelLabel="انصراف"
        isLoading={isApproveLoading}
        onConfirm={handleConfirmFinancialApproval}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-right" dir="rtl">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between text-neutral-300">
              <span>شماره سفارش:</span>
              <span className="font-mono font-bold text-white">{order.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-300">
              <span>مبلغ قابل پرداخت نهایی:</span>
              <span className="text-emerald-400 font-bold text-sm font-mono">
                {formatPrice(order.payableAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-neutral-300 font-medium">
              توضیحات و تاییدیه کارشناس حسابداری (اختیاری):
            </label>
            <input
              type="text"
              value={financialApprovalNote}
              onChange={(e) => setFinancialApprovalNote(e.target.value)}
              placeholder="مثال: استعلام صورتحساب بانک ملت، تایید حواله ساعت ۱۰:۴۵..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </AdminActionModal>

      {/* ─── مودال تخصیص بارنامه و کد رهگیری مرسوله (Shipping Modal) ─── */}
      <AdminActionModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        title="تخصیص شرکت باربری و ثبت کد رهگیری مرسوله"
        variant="primary"
        confirmLabel={isShippingLoading ? "در حال ثبت..." : "ثبت بارنامه و انتقال به ناوگان ارسال"}
        cancelLabel="انصراف"
        isLoading={isShippingLoading}
        onConfirm={handleConfirmAssignShipping}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-right" dir="rtl">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
            <div className="flex justify-between text-neutral-400">
              <span>سفارش:</span>
              <span className="font-bold text-white">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>مقصد تحویل:</span>
              <span className="text-neutral-200">
                {order.shippingAddress?.province || "نامشخص"}، {order.shippingAddress?.city || "نامشخص"}
              </span>
            </div>
          </div>

          {/* انتخاب ناوگان */}
          <div className="space-y-2">
            <label className="block text-neutral-300 font-bold">
              انتخاب شرکت لجستیک و حامل بار:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(CARRIER_CONFIG) as AdminShippingCarrier[]).map((carrierKey) => {
                const cfg = CARRIER_CONFIG[carrierKey];
                const isSelected = selectedCarrier === carrierKey;
                return (
                  <button
                    key={carrierKey}
                    type="button"
                    onClick={() => {
                      setSelectedCarrier(carrierKey);
                      setTrackingCodeInput(
                        `${cfg.trackingPrefix}${Math.floor(10000000 + Math.random() * 90000000)}`
                      );
                    }}
                    className={cn(
                      "p-3 rounded-xl border text-right transition-all flex flex-col gap-1",
                      isSelected
                        ? "border-orange-500 bg-orange-500/10 text-white"
                        : "border-neutral-800 bg-neutral-900 hover:border-neutral-700 text-neutral-400"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-200">{cfg.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-orange-400" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 leading-tight">
                      {cfg.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ورودی شماره بارنامه */}
          <div className="space-y-1.5">
            <label className="block text-neutral-300 font-bold">
              شماره بارنامه یا کد رهگیری ناوگان:
            </label>
            <input
              type="text"
              value={trackingCodeInput}
              onChange={(e) => {
                setTrackingCodeInput(e.target.value);
                if (shippingError) setShippingError("");
              }}
              placeholder="مثال: TPX-8849102941"
              className={cn(
                "w-full rounded-xl border bg-neutral-900 px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none",
                shippingError
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-neutral-800 focus:border-orange-500"
              )}
              dir="ltr"
            />
            {shippingError && (
              <p className="text-[11px] text-rose-400 font-medium">{shippingError}</p>
            )}
          </div>
        </div>
      </AdminActionModal>
    </div>
  );
}
