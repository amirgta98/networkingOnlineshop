"use client";

import * as React from "react";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Building2,
  User,
  Eye,
  RotateCcw,
  Check,
  ShieldCheck,
} from "lucide-react";
import { cn, formatPrice, toPersianDigits } from "@/shared/lib/utils";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminCustomerType,
  AdminShippingCarrier,
} from "../../types/admin-orders.types";
import {
  ORDER_STATUS_CONFIG,
  CARRIER_CONFIG,
  PAYMENT_METHOD_LABELS,
} from "../../types/admin-orders.types";
import { INITIAL_ADMIN_ORDERS } from "../../data/mock-admin-orders";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  type FilterTabOption,
  AdminStatsCards,
  type AdminStatItem,
  AdminDetailDrawer,
  AdminActionModal,
} from "../shared";
import { OrderDetailDrawerContent } from "./order-detail-drawer-content";

const LOCAL_STORAGE_KEY = "velox_admin_orders_v1";

export function AdminOrdersView() {
  // ─── ۱. وضعیت اصلی سفارش‌ها با قابلیت ماندگاری در LocalStorage ───
  const [orders, setOrders] = React.useState<AdminOrder[]>(INITIAL_ADMIN_ORDERS);
  const [isClientLoaded, setIsClientLoaded] = React.useState(false);

  // پیام اعلان و توست
  const [toast, setToast] = React.useState<{
    message: string;
    type?: "success" | "info";
  } | null>(null);

  // فیلترها و مرتب‌سازی
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeStatusTab, setActiveStatusTab] = React.useState<AdminOrderStatus>("all");
  const [customerTypeFilter, setCustomerTypeFilter] = React.useState<"all" | AdminCustomerType>("all");
  const [sortColumn, setSortColumn] = React.useState<string>("createdAt");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 6;

  // وضعیت کشوی پرونده سفارش
  const [selectedOrder, setSelectedOrder] = React.useState<AdminOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // مودال تایید مالی
  const [isApproveModalOpen, setIsApproveModalOpen] = React.useState(false);
  const [orderToApprove, setOrderToApprove] = React.useState<AdminOrder | null>(null);
  const [financialApprovalNote, setFinancialApprovalNote] = React.useState("");
  const [isApproveLoading, setIsApproveLoading] = React.useState(false);

  // مودال تخصیص بارنامه و ناوگان
  const [isShippingModalOpen, setIsShippingModalOpen] = React.useState(false);
  const [orderToShip, setOrderToShip] = React.useState<AdminOrder | null>(null);
  const [selectedCarrier, setSelectedCarrier] = React.useState<AdminShippingCarrier>("tipax");
  const [trackingCodeInput, setTrackingCodeInput] = React.useState("");
  const [isCustomTrackingEntered, setIsCustomTrackingEntered] = React.useState(false);
  const [shippingError, setShippingError] = React.useState("");
  const [isShippingLoading, setIsShippingLoading] = React.useState(false);

  // بارگذاری داده از LocalStorage در مرحله Mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setOrders(parsed);
        }
      }
    } catch {
      // استفاده از داده‌های پیش‌فرض در صورت بروز خطا در دسترسی به localStorage
    }
    setIsClientLoaded(true);
  }, []);

  // ذخیره‌سازی تغییرات در LocalStorage
  const updateOrdersState = React.useCallback((newOrders: AdminOrder[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newOrders));
    } catch {
      // نادیده گرفتن خطای حجم
    }
  }, []);

  // نمایش پیام توست
  const showToast = React.useCallback(
    (message: string, type: "success" | "info" = "success") => {
      setToast({ message, type });
      setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, 4000);
    },
    []
  );

  // بازنشانی داده‌ها به نمونه‌های اولیه
  const handleResetData = () => {
    updateOrdersState(INITIAL_ADMIN_ORDERS);
    setSelectedOrder(null);
    setIsDrawerOpen(false);
    showToast("داده‌های سفارش به نمونه‌های اولیه سامانه بازنشانی شدند.", "info");
  };

  // ─── ۲. محاسبه آمار و کارت‌های شاخص (Stats Cards) ───
  const totalOrdersCount = orders.length;
  const pendingFinancialCount = orders.filter((o) => o.status === "pending_financial").length;
  const processingWarehouseCount = orders.filter((o) => o.status === "processing_warehouse").length;
  const shippingCount = orders.filter((o) => o.status === "shipping").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.payableAmount, 0);

  const statsItems: AdminStatItem[] = [
    {
      id: "stat-total",
      title: "کل سفارش‌های ثبت‌شده",
      value: toPersianDigits(totalOrdersCount),
      subtitle: `گردش مالی: ${formatPrice(totalRevenue)}`,
      icon: Package,
      variant: "sky",
    },
    {
      id: "stat-pending",
      title: "در انتظار تایید مالی (ساتنا)",
      value: toPersianDigits(pendingFinancialCount),
      subtitle: pendingFinancialCount > 0 ? "نیازمند استعلام فیش واریزی" : "کلیه تراکنش‌ها تایید شده",
      badge: pendingFinancialCount > 0 ? "اقدام فوری" : undefined,
      icon: Clock,
      variant: "rose",
    },
    {
      id: "stat-warehouse",
      title: "بسته‌بندی و انبار مرکزی",
      value: toPersianDigits(processingWarehouseCount),
      subtitle: "در حال بسته‌بندی و کنترل سریال",
      icon: Package,
      variant: "orange",
    },
    {
      id: "stat-delivered",
      title: "تحویل موفق به کارفرما",
      value: toPersianDigits(deliveredCount),
      subtitle: `${toPersianDigits(shippingCount)} سفارش در ناوگان ارسال فعال`,
      changeText: "۱۰۰٪ اصالت و پوشش گارانتی",
      changePositive: true,
      icon: CheckCircle2,
      variant: "emerald",
    },
  ];

  // ─── ۳. تب‌های فیلتر وضعیت (Status Tabs) ───
  const statusTabs: FilterTabOption[] = [
    {
      id: "all",
      label: "همه سفارش‌ها",
      count: totalOrdersCount,
      badgeVariant: "default",
    },
    {
      id: "pending_financial",
      label: "در انتظار مالی",
      count: pendingFinancialCount,
      badgeVariant: "rose",
    },
    {
      id: "processing_warehouse",
      label: "بسته‌بندی انبار",
      count: processingWarehouseCount,
      badgeVariant: "orange",
    },
    {
      id: "shipping",
      label: "ناوگان ارسال",
      count: shippingCount,
      badgeVariant: "sky",
    },
    {
      id: "delivered",
      label: "تحویل شده",
      count: deliveredCount,
      badgeVariant: "emerald",
    },
    {
      id: "cancelled",
      label: "لغو شده",
      count: orders.filter((o) => o.status === "cancelled").length,
      badgeVariant: "default",
    },
  ];

  // ─── ۴. فیلتر کردن و مرتب‌سازی داده‌ها ───
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      // فیلتر وضعیت تب
      if (activeStatusTab !== "all" && order.status !== activeStatusTab) {
        return false;
      }

      // فیلتر مشتری B2B / خرده
      if (customerTypeFilter !== "all" && order.customerType !== customerTypeFilter) {
        return false;
      }

      // فیلتر جستجو
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchOrderNumber = order.orderNumber.toLowerCase().includes(query);
        const matchCustomer = order.customerName.toLowerCase().includes(query);
        const matchCompany = order.companyName?.toLowerCase().includes(query) || false;
        const matchPhone = order.phoneNumber.includes(query);
        const matchTracking = order.trackingCode.toLowerCase().includes(query);
        const matchCarrierCode = order.carrierTrackingCode?.toLowerCase().includes(query) || false;

        if (
          !matchOrderNumber &&
          !matchCustomer &&
          !matchCompany &&
          !matchPhone &&
          !matchTracking &&
          !matchCarrierCode
        ) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeStatusTab, customerTypeFilter, searchQuery]);

  // مرتب‌سازی
  const sortedOrders = React.useMemo(() => {
    const list = [...filteredOrders];
    list.sort((a, b) => {
      let valA: string | number = a.createdAt;
      let valB: string | number = b.createdAt;

      if (sortColumn === "payableAmount" || sortColumn === "totalAmount") {
        valA = a.payableAmount;
        valB = b.payableAmount;
      } else if (sortColumn === "orderNumber") {
        valA = a.orderNumber;
        valB = b.orderNumber;
      } else if (sortColumn === "customerName") {
        valA = a.customerName;
        valB = b.customerName;
      } else if (sortColumn === "status") {
        valA = a.status;
        valB = b.status;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredOrders, sortColumn, sortDirection]);

  // صفحه‌بندی با مهار محدوده معتبر صفحه
  const effectivePage = Math.min(
    currentPage,
    Math.max(1, Math.ceil(sortedOrders.length / pageSize))
  );

  const paginatedOrders = React.useMemo(() => {
    const startIndex = (effectivePage - 1) * pageSize;
    return sortedOrders.slice(startIndex, startIndex + pageSize);
  }, [sortedOrders, effectivePage, pageSize]);

  // تنظیم مرتب‌سازی
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("desc");
    }
  };

  // ─── ۵. عملیات سریع: تایید مالی حواله بانکی (One-click Bank Transfer Approval) ───
  const handleOpenApproveModal = (order: AdminOrder) => {
    setOrderToApprove(order);
    setFinancialApprovalNote("");
    setIsApproveModalOpen(true);
  };

  const handleConfirmFinancialApproval = async () => {
    if (!orderToApprove) return;
    setIsApproveLoading(true);

    // شبیه‌سازی کوتاه فرایند استعلام سیستمی
    await new Promise((resolve) => setTimeout(resolve, 400));

    const updated = orders.map((o) => {
      if (o.id === orderToApprove.id) {
        return {
          ...o,
          status: "processing_warehouse" as const,
          statusLabel: ORDER_STATUS_CONFIG.processing_warehouse.label,
          isPaymentVerified: true,
          adminNotes: financialApprovalNote.trim()
            ? `${o.adminNotes ? `${o.adminNotes} | ` : ""}تایید مالی: ${financialApprovalNote.trim()}`
            : o.adminNotes,
        };
      }
      return o;
    });

    updateOrdersState(updated);

    // به‌روزرسانی سفارش انتخابی اگر دراور باز است
    if (selectedOrder && selectedOrder.id === orderToApprove.id) {
      setSelectedOrder(
        updated.find((o) => o.id === orderToApprove.id) || null
      );
    }

    setIsApproveLoading(false);
    setIsApproveModalOpen(false);
    showToast(
      `حواله بانکی سفارش ${orderToApprove.orderNumber} با موفقیت تایید و دستور خروج از انبار صادر شد.`,
      "success"
    );
    setOrderToApprove(null);
  };

  // ─── ۶. عملیات سریع: تخصیص بارنامه و ناوگان ارسال (Assign Shipping Tracking) ───
  const handleOpenShippingModal = (order: AdminOrder) => {
    setOrderToShip(order);
    setSelectedCarrier(order.carrier || "tipax");
    setTrackingCodeInput(
      order.carrierTrackingCode ||
        `${CARRIER_CONFIG[order.carrier || "tipax"].trackingPrefix}${Math.floor(
          10000000 + Math.random() * 90000000
        )}`
    );
    setShippingError("");
    setIsShippingModalOpen(true);
  };

  const handleConfirmAssignShipping = async () => {
    if (!orderToShip) return;

    if (!trackingCodeInput.trim()) {
      setShippingError("لطفاً شماره بارنامه را وارد نمایید.");
      return;
    }

    setIsShippingLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const carrierMeta = CARRIER_CONFIG[selectedCarrier];
    const trackingUrl = carrierMeta.getTrackingUrl(trackingCodeInput.trim());

    const updated = orders.map((o) => {
      if (o.id === orderToShip.id) {
        return {
          ...o,
          carrier: selectedCarrier,
          carrierName: carrierMeta.name,
          carrierTrackingCode: trackingCodeInput.trim(),
          carrierTrackingUrl: trackingUrl,
          status: "shipping" as const,
          statusLabel: ORDER_STATUS_CONFIG.shipping.label,
        };
      }
      return o;
    });

    updateOrdersState(updated);

    if (selectedOrder && selectedOrder.id === orderToShip.id) {
      setSelectedOrder(updated.find((o) => o.id === orderToShip.id) || null);
    }

    setIsShippingLoading(false);
    setIsShippingModalOpen(false);
    showToast(
      `کد بارنامه ${trackingCodeInput.trim()} با موفقیت برای سفارش ${orderToShip.orderNumber} ثبت شد.`,
      "success"
    );
    setOrderToShip(null);
  };

  // ─── ۷. عملیات سریع: ثبت تحویل موفق (Mark Delivered) ───
  const handleMarkDelivered = (order: AdminOrder) => {
    const updated = orders.map((o) => {
      if (o.id === order.id) {
        return {
          ...o,
          status: "delivered" as const,
          statusLabel: ORDER_STATUS_CONFIG.delivered.label,
        };
      }
      return o;
    });

    updateOrdersState(updated);

    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(updated.find((o) => o.id === order.id) || null);
    }

    showToast(`سفارش ${order.orderNumber} با موفقیت به عنوان تحویل‌شده ثبت شد.`, "success");
  };

  // ذخیره یادداشت کارشناس
  const handleUpdateNotes = (orderId: string, notes: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, adminNotes: notes };
      }
      return o;
    });
    updateOrdersState(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, adminNotes: notes } : null));
    }
  };

  // باز کردن دراور بررسی کامل
  const handleInspectOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  // خروجی اکسل / CSV
  const handleExport = () => {
    showToast(
      `گزارش ${toPersianDigits(filteredOrders.length)} رکورد سفارش آماده‌سازی و دانلود شد.`,
      "info"
    );
  };

  // ─── ۸. تعریف ستون‌های جدول دسکتاپ (AdminColumnDef) ───
  const columns: AdminColumnDef<AdminOrder>[] = [
    {
      key: "orderNumber",
      header: "شناسه و تاریخ سفارش",
      sortable: true,
      className: "whitespace-nowrap w-44",
      cell: (order) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-black text-white text-xs whitespace-nowrap">
            <span className="font-mono">{order.orderNumber}</span>
            <span className="text-[10px] text-neutral-500 font-mono">({order.trackingCode})</span>
          </div>
          <div className="text-[11px] text-neutral-400 whitespace-nowrap">
            {toPersianDigits(order.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "مشتری و نوع حساب",
      sortable: true,
      className: "min-w-[200px]",
      cell: (order) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-200 text-xs truncate">{order.customerName}</span>
            {order.customerType === "b2b" ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 whitespace-nowrap shrink-0">
                <Building2 className="h-3 w-3" />
                B2B سازمانی
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400 whitespace-nowrap shrink-0">
                <User className="h-3 w-3" />
                شخصی
              </span>
            )}
          </div>
          {order.companyName && (
            <div className="text-[11px] text-neutral-400 truncate max-w-[200px]">
              {order.companyName}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "itemsSummary",
      header: "اقلام و تجهیزات شبکه",
      className: "min-w-[220px]",
      cell: (order) => {
        const brands = Array.from(new Set(order.items.map((i) => i.brand))).join("، ");
        const firstItem = order.items[0]?.title || "";
        return (
          <div className="space-y-1 max-w-[220px]">
            <div className="text-xs text-neutral-300 font-medium truncate" title={firstItem}>
              {firstItem}
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center gap-1 whitespace-nowrap">
              <span>{toPersianDigits(order.items.length)} ردیف تجهیزات</span>
              <span className="text-neutral-700">•</span>
              <span className="text-orange-400/90 font-medium">{brands}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "وضعیت سفارش",
      sortable: true,
      className: "whitespace-nowrap w-36",
      cell: (order) => {
        const meta = ORDER_STATUS_CONFIG[order.status];
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap",
              meta.chipClass
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dotClass)} />
            {meta.label}
          </span>
        );
      },
    },
    {
      key: "payableAmount",
      header: "مبلغ قابل پرداخت و تسویه",
      sortable: true,
      className: "whitespace-nowrap w-44",
      cell: (order) => (
        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-400 whitespace-nowrap">
            {formatPrice(order.payableAmount)}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] whitespace-nowrap">
            <span
              className={cn(
                "font-semibold",
                order.isPaymentVerified ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {order.isPaymentVerified ? "واریز تایید شده" : "معلق"}
            </span>
            <span className="text-neutral-700">•</span>
            <span className="text-neutral-500 truncate max-w-[90px]">
              {PAYMENT_METHOD_LABELS[order.paymentMethod].split("/")[0]}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "carrier",
      header: "ناوگان ارسال و بارنامه",
      className: "whitespace-nowrap w-40",
      cell: (order) => {
        if (!order.carrierTrackingCode) {
          return (
            <span className="text-[11px] text-neutral-500 italic whitespace-nowrap">در انتظار تخصیص بارنامه</span>
          );
        }
        return (
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-neutral-300 truncate">
              {order.carrierName?.split("(")[0] || "ناوگان سراسری"}
            </div>
            <div className="text-[10px] font-mono text-neutral-400 whitespace-nowrap">
              {order.carrierTrackingCode}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "عملیات سریع",
      className: "whitespace-nowrap w-28 text-left",
      cell: (order) => (
        <div
          className="flex items-center justify-end gap-1.5 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          {/* دکمه تایید مالی حواله بانکی برای سفارش‌های معلق */}
          {order.status === "pending_financial" && (
            <button
              type="button"
              onClick={() => handleOpenApproveModal(order)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center gap-1"
              title="تایید حواله ساتنا/پایا"
            >
              <Check className="h-3.5 w-3.5" />
              <span>تایید مالی</span>
            </button>
          )}

          {/* دکمه تخصیص بارنامه */}
          {(order.status === "processing_warehouse" || order.status === "shipping") && (
            <button
              type="button"
              onClick={() => handleOpenShippingModal(order)}
              className="px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-bold transition-colors flex items-center gap-1"
              title="تخصیص بارنامه"
            >
              <Truck className="h-3.5 w-3.5" />
              <span>{order.carrierTrackingCode ? "بارنامه" : "ارسال"}</span>
            </button>
          )}

          {/* دکمه مشاهده پرونده */}
          <button
            type="button"
            onClick={() => handleInspectOrder(order)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="مشاهده پرونده کامل سفارش"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // ─── ۹. رندر کارت مخصوص موبایل (Mobile Card View) ───
  const renderMobileCard = (order: AdminOrder) => {
    const meta = ORDER_STATUS_CONFIG[order.status];
    return (
      <div
        className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 space-y-3 cursor-pointer hover:border-neutral-700 transition-colors"
        onClick={() => handleInspectOrder(order)}
      >
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm">{order.orderNumber}</span>
            <span className="text-[10px] text-neutral-500 font-mono">{order.trackingCode}</span>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
              meta.chipClass
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", meta.dotClass)} />
            {meta.label}
          </span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">مشتری:</span>
            <span className="font-bold text-neutral-200">{order.customerName}</span>
          </div>
          {order.companyName && (
            <div className="flex items-center justify-between text-neutral-400">
              <span>شرکت:</span>
              <span className="text-sky-400 font-medium">{order.companyName}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">مبلغ نهایی:</span>
            <span className="font-bold text-emerald-400 text-sm">
              {formatPrice(order.payableAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">تجهیزات:</span>
            <span className="text-neutral-300">
              {toPersianDigits(order.items.length)} ردیف ({order.items[0]?.title.slice(0, 32)}...)
            </span>
          </div>
          {order.carrierTrackingCode && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">بارنامه:</span>
              <span className="font-mono text-neutral-300">{order.carrierTrackingCode}</span>
            </div>
          )}
        </div>

        {/* دکمه‌های عملیات سریع کارت موبایل */}
        <div
          className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800"
          onClick={(e) => e.stopPropagation()}
        >
          {order.status === "pending_financial" && (
            <button
              type="button"
              onClick={() => handleOpenApproveModal(order)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold"
            >
              تایید مالی
            </button>
          )}

          {(order.status === "processing_warehouse" || order.status === "shipping") && (
            <button
              type="button"
              onClick={() => handleOpenShippingModal(order)}
              className="px-3 py-1.5 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-bold"
            >
              {order.carrierTrackingCode ? "ویرایش بارنامه" : "تخصیص بارنامه"}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleInspectOrder(order)}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-200 text-xs font-medium"
          >
            مشاهده پرونده
          </button>
        </div>
      </div>
    );
  };

  // ─── ۱۰. فیلتر فرعی بخش مشتریان (B2B vs Retail) ───
  const secondaryFiltersNode = (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-[var(--theme-border-color)]">
      <button
        type="button"
        onClick={() => {
          setCustomerTypeFilter("all");
          setCurrentPage(1);
        }}
        className={cn(
          "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
          customerTypeFilter === "all"
            ? "bg-neutral-800 text-white shadow-sm font-bold"
            : "text-neutral-400 hover:text-neutral-200"
        )}
      >
        همه مشتریان
      </button>
      <button
        type="button"
        onClick={() => {
          setCustomerTypeFilter("b2b");
          setCurrentPage(1);
        }}
        className={cn(
          "px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
          customerTypeFilter === "b2b"
            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold"
            : "text-neutral-400 hover:text-neutral-200"
        )}
      >
        <Building2 className="h-3 w-3" />
        <span>سازمانی B2B</span>
      </button>
      <button
        type="button"
        onClick={() => {
          setCustomerTypeFilter("retail");
          setCurrentPage(1);
        }}
        className={cn(
          "px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1",
          customerTypeFilter === "retail"
            ? "bg-neutral-800 text-white font-bold"
            : "text-neutral-400 hover:text-neutral-200"
        )}
      >
        <User className="h-3 w-3" />
        <span>مشتریان خرد</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 text-right" dir="rtl">
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

      {/* ─── هدر ماژول مدیریت سفارش‌ها (Module Header) ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-xl font-black ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  مدیریت سفارش‌ها و ناوگان لجستیک
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  رصد برخط انبار و باربری
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-2xl">
                مدیریت جامع سفارش‌های سازمانی و عادی، تایید فوری حواله‌های بانکی ساتنا/پایا، کنترل شماره سریال‌های سخت‌افزاری سیسکو و نگزنس، و صدور بارنامه‌های تیپاکس و باربری سنگین.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition-colors"
              title="بازنشانی داده‌های آزمایشی به حالت اولیه"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
              <span>بازنشانی داده‌های نمونه</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── کارت‌های آمار و شاخص‌های کلیدی (Stats Cards) ─── */}
      <AdminStatsCards items={statsItems} columns={4} />

      {/* ─── نوار ابزار فیلتر و جستجو (AdminFilterToolbar) ─── */}
      <AdminFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="جستجو در شماره سفارش، نام مشتری، شرکت، تلفن، کد پیگیری یا بارنامه..."
        statusTabs={statusTabs}
        activeStatusTab={activeStatusTab}
        onStatusTabChange={(tabId) => {
          setActiveStatusTab(tabId as AdminOrderStatus);
          setCurrentPage(1);
        }}
        secondaryFilters={secondaryFiltersNode}
        onExport={handleExport}
        exportLabel="خروجی گزارش سفارش‌ها"
      />

      {/* ─── جدول داده‌های سفارش‌ها (AdminDataTable) ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span>
            نمایش{" "}
            <span className="font-bold text-white">
              {toPersianDigits(filteredOrders.length)}
            </span>{" "}
            سفارش مطابق با فیلترها
          </span>
          {customerTypeFilter !== "all" && (
            <span className="text-neutral-500">
              فیلتر مشتری: {customerTypeFilter === "b2b" ? "سازمانی B2B" : "خرد"}
            </span>
          )}
        </div>

        <AdminDataTable<AdminOrder>
          data={paginatedOrders}
          columns={columns}
          keyExtractor={(order) => order.id}
          isLoading={!isClientLoaded}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          pageSize={pageSize}
          currentPage={effectivePage}
          onPageChange={setCurrentPage}
          totalItems={filteredOrders.length}
          onRowClick={(order) => handleInspectOrder(order)}
          mobileCardRenderer={renderMobileCard}
          emptyMessage="هیچ سفارشی مطابق جستجو یا فیلترهای انتخابی یافت نشد."
          emptySubtitle="عبارت جستجو را تغییر دهید یا فیلتر وضعیت و نوع مشتری را به «همه» برگردانید."
        />
      </div>

      {/* ─── کشوی بازرسی پرونده کامل سفارش (AdminDetailDrawer) ─── */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          selectedOrder ? (
            <div className="flex items-center gap-2">
              <span>پرونده کامل سفارش</span>
              <span className="text-orange-400 font-mono font-bold">
                {selectedOrder.orderNumber}
              </span>
            </div>
          ) : (
            "جزئیات سفارش"
          )
        }
        subtitle={
          selectedOrder
            ? `${selectedOrder.customerName}${
                selectedOrder.companyName ? ` (${selectedOrder.companyName})` : ""
              }`
            : undefined
        }
        size="xl"
      >
        {selectedOrder && (
          <OrderDetailDrawerContent
            order={selectedOrder}
            onApproveFinancial={handleOpenApproveModal}
            onAssignShipping={handleOpenShippingModal}
            onMarkDelivered={handleMarkDelivered}
            onUpdateNotes={handleUpdateNotes}
            onClose={() => setIsDrawerOpen(false)}
          />
        )}
      </AdminDetailDrawer>

      {/* ─── مودال تایید حواله بانکی ساتنا/پایا (Bank Transfer Approval Modal) ─── */}
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
        {orderToApprove && (
          <div className="space-y-4 text-xs text-right" dir="rtl">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-neutral-300">
                <span>شماره و شناسه سفارش:</span>
                <span className="font-mono font-bold text-white">
                  {orderToApprove.orderNumber} ({orderToApprove.trackingCode})
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>نام خریدار و طرف حساب:</span>
                <span className="font-semibold text-neutral-200">
                  {orderToApprove.customerName}
                  {orderToApprove.companyName ? ` — ${orderToApprove.companyName}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>مبلغ قابل پرداخت نهایی:</span>
                <span className="text-emerald-400 font-bold text-sm font-mono">
                  {formatPrice(orderToApprove.payableAmount)}
                </span>
              </div>
              {orderToApprove.paymentReceiptNumber && (
                <div className="flex items-center justify-between text-neutral-300 pt-1 border-t border-emerald-500/20">
                  <span>شماره پیگیری فیش بانکی / ساتنا:</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {orderToApprove.paymentReceiptNumber}
                  </span>
                </div>
              )}
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

            <div className="flex items-start gap-2 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                با تایید این عملیات، وضعیت سفارش به «بسته‌بندی و انبار» تغییر یافته، پیامک تایید به خریدار ارسال و حواله خروج انبار جهت سریال‌گذاری تجهیزات چاپ خواهد شد.
              </span>
            </div>
          </div>
        )}
      </AdminActionModal>

      {/* ─── مودال تخصیص بارنامه و کد رهگیری ناوگان (Shipping Modal) ─── */}
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
        {orderToShip && (
          <div className="space-y-4 text-xs text-right" dir="rtl">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
              <div className="flex justify-between text-neutral-400">
                <span>سفارش:</span>
                <span className="font-bold text-white">{orderToShip.orderNumber}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>مقصد تحویل:</span>
                <span className="text-neutral-200">
                  {orderToShip.shippingAddress.province}، {orderToShip.shippingAddress.city}
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
                          `${cfg.trackingPrefix}${Math.floor(
                            10000000 + Math.random() * 90000000
                          )}`
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
              <div className="relative">
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
              </div>
              {shippingError && (
                <p className="text-[11px] text-rose-400 font-medium">{shippingError}</p>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
              <Truck className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
              <span>
                پس از ذخیره، پیامک حاوی لینک پیگیری برخط بارنامه شرکت {CARRIER_CONFIG[selectedCarrier].name} به صورت خودکار برای خریدار ارسال خواهد شد.
              </span>
            </div>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
