"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Globe2,
  Wifi,
  Server,
  Printer,
  ChevronLeft,
  CreditCard,
  Building2,
  Phone,
  User,
  Loader2,
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
import { formatPrice, toPersianDigits, cn } from "@/shared/lib/utils";
import { paymentApi } from "@/features/payment";
import { useCart } from "@/features/cart";
import { internetApi } from "@/features/internet/api/internet-api";
import type { InternetOrder, InternetOrderStatus } from "@/features/internet/types";

function OrderItemThumbnail({ imageUrl, title }: { imageUrl?: string; title: string }) {
  const [hasError, setHasError] = React.useState(false);
  const isValidUrl = Boolean(
    imageUrl &&
      !imageUrl.includes("cisco-switch") &&
      !imageUrl.startsWith("/assets/") &&
      !hasError
  );

  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center">
      {isValidUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-contain p-1"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <Package className="h-6 w-6 text-neutral-600" />
      )}
    </div>
  );
}

export function OrdersView() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("tab") === "internet" ? "internet" : "products";

  const [orderCategory, setOrderCategory] = React.useState<"products" | "internet">(initialCategory);

  // Products state (from original hook)
  const { orders, counts, isLoaded, cancelOrder } = useDashboardOrders();
  const { addItem, triggerCartBump } = useCart();
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = React.useState<DashboardOrder | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = React.useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = React.useState<string | null>(null);

  // Internet orders state (from real backend API)
  const [internetOrders, setInternetOrders] = React.useState<InternetOrder[]>([]);
  const [loadingInternet, setLoadingInternet] = React.useState(false);
  const [internetTab, setInternetTab] = React.useState<string>("all");
  const [internetSearch, setInternetSearch] = React.useState<string>("");
  const [selectedInternetOrder, setSelectedInternetOrder] = React.useState<InternetOrder | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    setLoadingInternet(true);
    internetApi
      .getMyOrders()
      .then((res) => {
        if (isMounted) setInternetOrders(res || []);
      })
      .catch((err) => {
        console.warn("Could not load user internet orders:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingInternet(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePayOrder = async (order: DashboardOrder) => {
    try {
      setPayingOrderId(order.id);
      const paymentRes = await paymentApi.requestOrderPayment(order.orderNumber || order.id, {
        amount: order.totalAmount,
        orderNumber: order.orderNumber,
      });
      if (paymentRes?.paymentUrl && typeof window !== "undefined") {
        window.location.href = paymentRes.paymentUrl;
        return;
      }
    } catch (e) {
      console.warn("Order payment fallback:", e);
    } finally {
      setPayingOrderId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReorder = (order: DashboardOrder) => {
    order.items.forEach((item) => {
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

  // Filtered physical products orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      if (activeTab === "processing") {
        const isProcessing =
          order.status === "processing" ||
          order.status === "pending_payment" ||
          order.status === "shipped";
        if (!isProcessing) return false;
      }
      if (activeTab === "delivered" && order.status !== "delivered") return false;
      if (activeTab === "cancelled") {
        const isCancelled = order.status === "cancelled" || order.status === "returned";
        if (!isCancelled) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = (order.orderNumber || "").toLowerCase().includes(q);
        const matchTracking = (order.trackingCode || "").toLowerCase().includes(q);
        const matchItem = order.items.some(
          (it) =>
            (it.title && it.title.toLowerCase().includes(q)) ||
            (it.model && it.model.toLowerCase().includes(q))
        );
        if (!matchNumber && !matchTracking && !matchItem) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Filtered internet orders
  const filteredInternetOrders = React.useMemo(() => {
    return internetOrders.filter((order) => {
      if (internetTab === "active" && order.status !== "ACTIVE") return false;
      if (internetTab === "pending" && order.status !== "PENDING") return false;
      if (internetTab === "cancelled" && order.status !== "CANCELLED") return false;

      if (internetSearch.trim()) {
        const q = internetSearch.toLowerCase().trim();
        const matchTrack = (order.trackingCode || "").toLowerCase().includes(q);
        const matchPlan = (order.plan?.title || "").toLowerCase().includes(q);
        const matchCity = (order.city || "").toLowerCase().includes(q);
        const matchAddr = (order.address || "").toLowerCase().includes(q);
        if (!matchTrack && !matchPlan && !matchCity && !matchAddr) return false;
      }

      return true;
    });
  }, [internetOrders, internetTab, internetSearch]);

  // Statistics
  const stats = React.useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => (o.status !== "cancelled" ? sum + o.payableAmount : sum), 0);
    return {
      activeCount: counts.processing,
      deliveredCount: counts.delivered,
      cancelledCount: counts.cancelled,
      allCount: counts.all,
      totalSpent,
    };
  }, [orders, counts]);

  const internetStats = React.useMemo(() => {
    const activeCount = internetOrders.filter((o) => o.status === "ACTIVE").length;
    const pendingCount = internetOrders.filter((o) => o.status === "PENDING").length;
    const totalSpent = internetOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);
    return {
      activeCount,
      pendingCount,
      totalCount: internetOrders.length,
      totalSpent,
    };
  }, [internetOrders]);

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
        title="سفارش‌ها و اشتراک‌های سازمانی"
        description="مشاهده سابقه سفارش‌های تجهیزات شبکه، اشتراک‌های فعال اینترنت و تخصیص IP استاتیک"
        icon={Package}
        badge={`${toPersianDigits(counts.all + internetOrders.length)} سفارش ثبت‌شده`}
        badgeVariant="orange"
      />

      {/* ── Category Switcher ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setOrderCategory("products")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            orderCategory === "products"
              ? "bg-[var(--theme-primary)] text-white shadow-md shadow-[var(--theme-primary)]/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          )}
        >
          <Package className="h-4 w-4" />
          <span>سفارش‌های تجهیزات و سخت‌افزار</span>
          <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full font-mono">
            {toPersianDigits(counts.all)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOrderCategory("internet")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
            orderCategory === "internet"
              ? "bg-sky-500 text-black shadow-md shadow-sky-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          )}
        >
          <Globe2 className="h-4 w-4" />
          <span>سفارش‌ها و اشتراک‌های اینترنت سازمانی</span>
          {internetOrders.length > 0 && (
            <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
              {toPersianDigits(internetOrders.length)}
            </span>
          )}
        </button>
      </div>

      {/* ── RENDER PRODUCTS ORDERS TAB ────────────────────────────── */}
      {orderCategory === "products" && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <DashboardMetricCard
              title="سفارش‌های در حال پردازش و ارسال"
              value={
                <span>
                  {toPersianDigits(counts.processing)}{" "}
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
                  {toPersianDigits(counts.delivered)}{" "}
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

          {/* Filter Bar */}
          <DashboardFilterBar
            tabs={[
              { key: "all", label: "همه سفارش‌ها", count: counts.all },
              { key: "processing", label: "در حال پردازش", count: counts.processing },
              { key: "delivered", label: "تحویل شده", count: counts.delivered },
              { key: "cancelled", label: "لغو شده / مرجوعی", count: counts.cancelled },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchPlaceholder="جستجو با شماره سفارش، کد رهگیری، نام کالا..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Orders List */}
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

                  {/* Card Body */}
                  <div className="p-4 sm:p-6 flex flex-col gap-5 sm:gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800/60"
                        >
                          <OrderItemThumbnail imageUrl={item.imageUrl} title={item.title} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              {toPersianDigits(item.quantity)} عدد • {formatPrice(item.unitPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/60">
                      <div className="flex items-center gap-2">
                        {order.status === "pending_payment" && (
                          <Button
                            size="sm"
                            onClick={() => handlePayOrder(order)}
                            disabled={payingOrderId === order.id}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5"
                          >
                            {payingOrderId === order.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CreditCard className="h-3.5 w-3.5" />
                            )}
                            <span>پرداخت آنلاین</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTrackingOrder(order)}
                          className="text-xs gap-1.5"
                        >
                          <Truck className="h-3.5 w-3.5 text-sky-400" />
                          <span>رهگیری مرسوله</span>
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReorder(order)}
                        className="text-xs text-neutral-400 hover:text-white"
                      >
                        <RotateCcw className="h-3.5 w-3.5 ml-1" />
                        <span>سفارش مجدد اقلام</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── RENDER INTERNET ORDERS TAB ────────────────────────────── */}
      {orderCategory === "internet" && (
        <>
          {/* Internet Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <DashboardMetricCard
              title="اشتراک‌های فعال و متصل"
              value={
                <span>
                  {toPersianDigits(internetStats.activeCount)}{" "}
                  <span className="text-xs font-normal text-neutral-400">خط فعال</span>
                </span>
              }
              subtitle="پوشش فیبر نوری، VDSL و رادیویی"
              icon={Wifi}
              variant="emerald"
            />

            <DashboardMetricCard
              title="در انتظار بررسی و رانژه"
              value={
                <span>
                  {toPersianDigits(internetStats.pendingCount)}{" "}
                  <span className="text-xs font-normal text-neutral-400">سفارش</span>
                </span>
              }
              subtitle="امکان‌سنجی فنی و تخصیص پورت"
              icon={Clock}
              variant="orange"
            />

            <DashboardMetricCard
              title="مجموع ارزش اشتراک‌های اینترنت"
              value={
                <span className="truncate">
                  {formatPrice(internetStats.totalSpent)}
                </span>
              }
              subtitle="ارزش دوره‌های اشتراک و IP استاتیک"
              icon={Globe2}
              variant="sky"
            />
          </div>

          {/* Filter Bar */}
          <DashboardFilterBar
            tabs={[
              { key: "all", label: "همه اشتراک‌ها", count: internetOrders.length },
              { key: "active", label: "فعال و متصل", count: internetStats.activeCount },
              { key: "pending", label: "در حال راه‌اندازی", count: internetStats.pendingCount },
              {
                key: "cancelled",
                label: "لغو شده",
                count: internetOrders.filter((o) => o.status === "CANCELLED").length,
              },
            ]}
            activeTab={internetTab}
            onTabChange={setInternetTab}
            searchPlaceholder="جستجو با کد رهگیری، نام پلن، شهر یا آدرس..."
            searchValue={internetSearch}
            onSearchChange={setInternetSearch}
          />

          {/* Loading */}
          {loadingInternet ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
              <span className="text-xs text-neutral-400">در حال دریافت سابقه اشتراک‌های اینترنت...</span>
            </div>
          ) : filteredInternetOrders.length === 0 ? (
            <DashboardEmptyState
              icon={Globe2}
              title="هیچ اشتراک اینترنتی یافت نشد"
              description={
                internetSearch
                  ? "هیچ اشتراکی با عبارت جستجو شده مطابقت ندارد."
                  : "هنوز اشتراک اینترنت سازمانی یا IP استاتیک در حساب شما ثبت نشده است. می‌توانید پلن متناسب با کسب‌وکار خود را به صورت آنلاین خریداری فرمایید."
              }
              actionLabel="مشاهده پلن‌ها و خرید آنلاین اینترنت"
              actionHref="/internet"
            />
          ) : (
            <div className="flex flex-col gap-5">
              {filteredInternetOrders.map((order) => {
                const isActive = order.status === "ACTIVE";
                const isPending = order.status === "PENDING";
                const isCancelled = order.status === "CANCELLED";

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl border border-neutral-800 bg-[#121216] overflow-hidden shadow-xl hover:border-neutral-700 transition-all text-right"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 bg-neutral-900/60 border-b border-neutral-800">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-neutral-400">کد رهگیری:</span>
                          <span className="text-sm font-mono font-black text-sky-400">
                            {order.trackingCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(order.trackingCode, order.id)}
                            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title="کپی کد رهگیری"
                          >
                            {copiedId === order.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        <span className="text-neutral-700">•</span>

                        <span className="text-xs text-neutral-400 font-mono">
                          ثبت: {toPersianDigits(new Date(order.createdAt).toLocaleDateString("fa-IR"))}
                        </span>

                        <span className="text-neutral-700">•</span>

                        <span
                          className={cn(
                            "text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1",
                            isActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : isPending
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          )}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>فعال و متصل</span>
                            </>
                          ) : isPending ? (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>در انتظار بررسی فنی و رانژه</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>لغو شده</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                        <span className="text-xs text-neutral-400">مبلغ اشتراک:</span>
                        <span className="text-base font-black font-mono text-emerald-400">
                          {formatPrice(order.finalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Plan Specs */}
                        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Wifi className="h-4 w-4 text-sky-400" />
                            <span>{order.plan?.title || "پلن اینترنت سازمانی"}</span>
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono space-y-1">
                            <div>دوره اشتراک: {toPersianDigits(order.serviceDurationMonths)} ماهه</div>
                            {order.plan?.speed && <div>سرعت تخصیصی: {order.plan.speed}</div>}
                          </div>
                        </div>

                        {/* Static IP */}
                        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Server className="h-4 w-4 text-purple-400" />
                            <span>سرویس IP استاتیک اختصاصی</span>
                          </div>
                          <div className="text-[11px]">
                            {order.hasStaticIp ? (
                              <span className="text-emerald-400 font-bold">
                                دارد (یک عدد آدرس IP معتبر تخصیص یافته)
                              </span>
                            ) : (
                              <span className="text-neutral-500">فاقد IP استاتیک</span>
                            )}
                          </div>
                        </div>

                        {/* Installation Location */}
                        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <MapPin className="h-4 w-4 text-emerald-400" />
                            <span>محل نصب و رانژه خط</span>
                          </div>
                          <p className="text-[11px] text-neutral-300 leading-snug truncate">
                            {order.province}، {order.city} - {order.address}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedInternetOrder(order)}
                            className="text-xs gap-1.5 border-neutral-700 hover:bg-neutral-800"
                          >
                            <FileText className="h-3.5 w-3.5 text-sky-400" />
                            <span>مشاهده رسید و فاکتور اشتراک</span>
                          </Button>

                          <Link
                            href="/dashboard/support"
                            className="text-xs px-3 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                          >
                            ثبت تیکت خط
                          </Link>
                        </div>

                        <Link
                          href="/internet"
                          className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                        >
                          <span>تمدید یا خرید پلن جدید</span>
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Internet Order Detail Modal ────────────────────────────── */}
      {selectedInternetOrder && (
        <DashboardModal
          isOpen={Boolean(selectedInternetOrder)}
          onClose={() => setSelectedInternetOrder(null)}
          title="رسید الکترونیک خرید اینترنت سازمانی"
        >
          <div className="space-y-5 text-xs text-right" dir="rtl">
            <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 flex items-center justify-between">
              <div>
                <span className="text-neutral-400 block mb-0.5">کد رهگیری رسمی سفارش:</span>
                <span className="text-lg font-mono font-black text-sky-400">
                  {selectedInternetOrder.trackingCode}
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-bold">
                {selectedInternetOrder.status === "ACTIVE"
                  ? "فعال و متصل"
                  : selectedInternetOrder.status === "PENDING"
                  ? "در انتظار رانژه خط"
                  : "لغو شده"}
              </span>
            </div>

            {/* Specs */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2.5">
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">سرویس:</span>
                <span className="font-bold text-white">
                  {selectedInternetOrder.plan?.title || "پلن اینترنت سازمانی"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">مدت اشتراک:</span>
                <span className="font-bold text-sky-400 font-mono">
                  {toPersianDigits(selectedInternetOrder.serviceDurationMonths)} ماه
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">تخصیص IP استاتیک:</span>
                <span className="font-bold text-purple-300">
                  {selectedInternetOrder.hasStaticIp ? "دارد (تخصیص یافته)" : "ندارد"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">متقاضی:</span>
                <span className="font-medium text-white">{selectedInternetOrder.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">شماره تماس هماهنگی:</span>
                <span className="font-mono text-white" dir="ltr">
                  {selectedInternetOrder.phoneNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-400">نشانی محل نصب:</span>
                <span className="text-neutral-200">
                  {selectedInternetOrder.province}، {selectedInternetOrder.city} - {selectedInternetOrder.address}
                </span>
              </div>
              <div className="flex justify-between py-1 text-sm font-black text-white">
                <span>مبلغ نهایی پرداختی:</span>
                <span className="font-mono text-emerald-400 text-base">
                  {formatPrice(selectedInternetOrder.finalAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                className="text-xs gap-1.5 border-neutral-700"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>چاپ رسید</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setSelectedInternetOrder(null)}
                className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                بستن
              </Button>
            </div>
          </div>
        </DashboardModal>
      )}

      {/* ── Tracking Modal (Products) ──────────────────────────────── */}
      {selectedTrackingOrder && (
        <DashboardModal
          isOpen={Boolean(selectedTrackingOrder)}
          onClose={() => setSelectedTrackingOrder(null)}
          title={`رهگیری سفارش ${selectedTrackingOrder.orderNumber}`}
        >
          <div className="space-y-6 text-right" dir="rtl">
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">وضعیت کنونی:</span>
                <span className="font-bold text-orange-400">{selectedTrackingOrder.statusLabel}</span>
              </div>
              {selectedTrackingOrder.trackingCode && (
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">کد رهگیری پستی / باربری:</span>
                  <span className="font-mono text-white font-bold">{selectedTrackingOrder.trackingCode}</span>
                </div>
              )}
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

      {/* ── Confirm Cancel Dialog ──────────────────────────────────── */}
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
