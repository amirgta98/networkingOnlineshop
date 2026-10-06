"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Copy,
  Check,
  FileText,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  MapPin,
  ShieldCheck,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { useDashboardOrders } from "../hooks/use-dashboard-orders";
import { DashboardOrder, OrderStatus } from "../types/orders.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardFilterBar,
  DashboardStatusBadge,
  DashboardEmptyState,
  DashboardModal,
  ConfirmDialog,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { useCart } from "@/features/cart";

export function OrdersView() {
  const { orders, isLoaded, cancelOrder } = useDashboardOrders();
  const { addItem, triggerCartBump } = useCart();

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Tracking modal state
  const [selectedTrackingOrder, setSelectedTrackingOrder] = React.useState<DashboardOrder | null>(null);

  // Cancel dialog state
  const [cancellingOrderId, setCancellingOrderId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReorder = (order: DashboardOrder) => {
    order.items.forEach((item) => {
      // Mock product representation
      const mockProduct = {
        id: item.productId,
        name: item.title,
        slug: item.productId,
        description: item.title,
        price: item.unitPrice,
        rating: 5,
        reviewCount: 1,
        category: "switches" as const,
        inStock: true,
        featured: false,
        images: [item.imageUrl],
      };
      addItem(mockProduct, item.quantity);
    });
    triggerCartBump();
  };

  // Filtered orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === "processing" && order.status !== "processing") return false;
      if (activeTab === "delivered" && order.status !== "delivered") return false;
      if (activeTab === "cancelled" && order.status !== "cancelled") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = order.orderNumber.toLowerCase().includes(q);
        const matchTracking = order.trackingCode.toLowerCase().includes(q);
        const matchItem = order.items.some((it) => it.title.toLowerCase().includes(q) || it.model.toLowerCase().includes(q));
        if (!matchNumber && !matchTracking && !matchItem) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Statistics
  const stats = React.useMemo(() => {
    const activeCount = orders.filter((o) => o.status === "processing" || o.status === "shipped").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;
    const totalSpent = orders.reduce((sum, o) => (o.status !== "cancelled" ? sum + o.payableAmount : sum), 0);

    return { activeCount, deliveredCount, totalSpent };
  }, [orders]);

  const statusVariantMap: Record<OrderStatus, "warning" | "info" | "success" | "danger" | "neutral"> = {
    pending_payment: "warning",
    processing: "warning",
    shipped: "info",
    delivered: "success",
    cancelled: "danger",
    returned: "neutral",
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="سفارش‌ها و رهگیری مرسولات"
        description="مشاهده سابقه سفارش‌ها، اقلام فنی، پیشرفت مراحل بسته‌بندی در انبار و رهگیری موقعیت باربری"
        icon={Package}
        badge={`${toPersianDigits(orders.length)} سفارش کل`}
        badgeVariant="orange"
      />

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="سفارش‌های در حال پردازش و ارسال"
          value={
            <span>
              {toPersianDigits(stats.activeCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">سفارش فعال</span>
            </span>
          }
          subtitle="انبار مرکزی در حال بسته‌بندی و تست"
          icon={Clock}
          variant="orange"
        />

        <DashboardMetricCard
          title="سفارش‌های تحویل شده"
          value={
            <span>
              {toPersianDigits(stats.deliveredCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">مرسوله</span>
            </span>
          }
          subtitle="تحویل نهایی در محل پروژه یا دفتر"
          icon={CheckCircle2}
          variant="emerald"
        />

        <DashboardMetricCard
          title="مجموع ارزش خریدهای ثبت‌شده"
          value={
            <span className="truncate">
              {formatPrice(stats.totalSpent)}
            </span>
          }
          subtitle="با احتساب کلیه تخفیف‌های پروژه‌ای"
          icon={ShoppingBag}
          variant="sky"
        />
      </div>

      {/* ── 3. Filter Bar ─────────────────────────────────────────── */}
      <DashboardFilterBar
        tabs={[
          { key: "all", label: "همه سفارش‌ها", count: orders.length },
          { key: "processing", label: "در حال پردازش", count: stats.activeCount },
          { key: "delivered", label: "تحویل شده", count: stats.deliveredCount },
          { key: "cancelled", label: "لغو شده / مرجوعی" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="جستجو با شماره سفارش، کد رهگیری، نام کالا..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── 4. Orders List ────────────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <DashboardEmptyState
          icon={Package}
          title="سفارشی یافت نشد"
          description={
            searchQuery
              ? "هیچ سفارشی با عبارت جستجو شده یا فیلتر انتخابی مطابقت ندارد."
              : "هنوز سفارشی در این بخش ثبت نشده است. می‌توانید از بخش کاتالوگ تجهیزات شبکه سفارش جدید ثبت نمایید."
          }
          actionLabel="مشاهده کاتالوگ محصولات"
          actionHref="/products"
        />
      ) : (
        <div className="flex flex-col gap-5">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-xs hover:border-neutral-700/80 transition-all text-right"
            >
              {/* Card Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 bg-neutral-900/40 border-b border-[var(--theme-border-color)]">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-400 font-mono">سفارش:</span>
                    <span className="text-sm font-black font-mono text-[var(--theme-foreground)]">
                      {order.orderNumber}
                    </span>
                  </div>

                  <span className="text-neutral-700">•</span>

                  <span className="text-xs text-neutral-400 font-mono">
                    ثبت: {toPersianDigits(order.createdAt)}
                  </span>

                  <span className="text-neutral-700">•</span>

                  <DashboardStatusBadge
                    label={order.statusLabel}
                    variant={statusVariantMap[order.status]}
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/60">
                  <span className="text-xs text-neutral-400">مبلغ پرداختی:</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {formatPrice(order.payableAmount)}
                  </span>
                </div>
              </div>

              {/* Card Body: Tracking Bar + Items */}
              <div className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
                {/* 5-Stage Stepper Preview */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-neutral-800/80 bg-neutral-950/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                      <Truck className="h-4 w-4 text-orange-400 shrink-0" />
                      <span>شیوه ارسال: {order.courierName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400 font-mono">کد رهگیری:</span>
                      <span className="text-xs font-bold font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                        {order.trackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.trackingCode, order.id)}
                        className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1"
                        title="کپی کد رهگیری"
                      >
                        {copiedId === order.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Step Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-1.5 relative">
                    {order.trackingSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex sm:flex-col items-center sm:text-center gap-2.5 sm:gap-1.5 p-2 rounded-xl transition-colors ${
                          step.isCurrent
                            ? "bg-orange-500/10 border border-orange-500/30"
                            : step.isCompleted
                            ? "text-emerald-400"
                            : "text-neutral-500 opacity-60"
                        }`}
                      >
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            step.isCurrent
                              ? "bg-orange-500 text-white animate-pulse"
                              : step.isCompleted
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-neutral-800 text-neutral-500"
                          }`}
                        >
                          {step.isCompleted ? "✓" : toPersianDigits(idx + 1)}
                        </div>
                        <div className="flex flex-col text-right sm:text-center">
                          <span className="text-[11px] font-bold leading-tight">
                            {step.title}
                          </span>
                          {step.timestamp && (
                            <span className="text-[9px] text-neutral-400 font-mono mt-0.5">
                              {toPersianDigits(step.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items List */}
                <div className="flex flex-col divide-y divide-neutral-800/60">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex flex-col text-right min-w-0">
                          <span className="text-xs font-bold text-neutral-200 hover:text-orange-400 transition-colors leading-snug">
                            {item.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-neutral-400">
                            <span className="font-mono bg-neutral-800 px-1.5 py-0.2 rounded text-[10px]">
                              {item.model}
                            </span>
                            <span>برند: {item.brand}</span>
                            <span className="text-emerald-400 flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              <span>{item.warranty}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-neutral-900">
                        <span className="text-neutral-400 font-mono text-[11px] sm:text-xs">
                          {toPersianDigits(item.quantity)} عدد × {formatPrice(item.unitPrice)}
                        </span>
                        <span className="font-mono font-bold text-neutral-200">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Destination Summary */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800/60 text-xs text-neutral-300">
                  <MapPin className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-neutral-200">
                      مقصد: {order.shippingAddress.title} ({order.shippingAddress.recipientName} - {order.shippingAddress.phoneNumber})
                    </span>
                    <span className="text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                      {order.shippingAddress.fullAddress} • کد پستی: {toPersianDigits(order.shippingAddress.postalCode)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 sm:p-4 sm:px-6 bg-neutral-900/30 border-t border-[var(--theme-border-color)]">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTrackingOrder(order)}
                    className="text-xs gap-1.5 border-neutral-700 text-neutral-200 hover:bg-neutral-800 cursor-pointer flex-1 sm:flex-initial"
                  >
                    <Truck className="h-3.5 w-3.5 text-orange-400" />
                    <span>رهگیری لجستیک و انبار</span>
                  </Button>

                  {order.invoiceId && (
                    <Link href={`/dashboard/invoices?orderId=${order.id}`} className="flex-1 sm:flex-initial">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1.5 text-sky-400 hover:bg-sky-500/10 cursor-pointer w-full sm:w-auto"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>مشاهده فاکتور</span>
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/60">
                  {order.status === "processing" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancellingOrderId(order.id)}
                      className="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer flex-1 sm:flex-initial"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>لغو سفارش</span>
                    </Button>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleReorder(order)}
                    className="text-xs gap-1.5 cursor-pointer font-semibold shadow-sm flex-1 sm:flex-initial"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>خرید مجدد این اقلام</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. Detailed Tracking Logistics Modal ───────────────────── */}
      {selectedTrackingOrder && (
        <DashboardModal
          isOpen={Boolean(selectedTrackingOrder)}
          onClose={() => setSelectedTrackingOrder(null)}
          title={`رهگیری لحظه‌ای سفارش ${selectedTrackingOrder.orderNumber}`}
          description={`ناوگان حمل: ${selectedTrackingOrder.courierName}`}
          maxWidth="lg"
        >
          <div className="flex flex-col gap-5 text-right" dir="rtl">
            <div className="p-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block">شناسه بارنامه و پیگیری:</span>
                <span className="text-base font-bold font-mono text-orange-400">
                  {selectedTrackingOrder.trackingCode}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(selectedTrackingOrder.trackingCode, "modal")}
                className="text-xs gap-1 border-neutral-700 hover:bg-neutral-800"
              >
                {copiedId === "modal" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>کپی کد</span>
              </Button>
            </div>

            {/* Complete Vertical Step Log */}
            <div className="flex flex-col gap-4 border-r-2 border-orange-500/40 pr-4 mr-2">
              {selectedTrackingOrder.trackingSteps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col gap-1">
                  <div
                    className={`absolute -right-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 ${
                      step.isCurrent
                        ? "bg-orange-500 border-white ring-4 ring-orange-500/20"
                        : step.isCompleted
                        ? "bg-emerald-500 border-emerald-300"
                        : "bg-neutral-700 border-neutral-900"
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        step.isCurrent ? "text-orange-400" : step.isCompleted ? "text-neutral-200" : "text-neutral-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.timestamp && (
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {toPersianDigits(step.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTrackingOrder(null)}
                className="text-xs"
              >
                بستن پنجره
              </Button>
            </div>
          </div>
        </DashboardModal>
      )}

      {/* ── 6. Confirm Cancel Dialog ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(cancellingOrderId)}
        onClose={() => setCancellingOrderId(null)}
        onConfirm={() => {
          if (cancellingOrderId) {
            cancelOrder(cancellingOrderId);
            setCancellingOrderId(null);
          }
        }}
        title="لغو سفارش"
        message="آیا از لغو این سفارش اطمینان دارید؟ در صورت تایید، مبلغ پرداختی به صورت آنی به کیف پول کاربری شما بازگردانده می‌شود."
        confirmLabel="بله، لغو شود"
        cancelLabel="انصراف"
        variant="danger"
      />
    </div>
  );
}
