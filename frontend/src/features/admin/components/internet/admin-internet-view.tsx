"use client";

import * as React from "react";
import Link from "next/link";
import {
  Globe2,
  Server,
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Wifi,
  Search,
  Filter,
  DollarSign,
  Layers,
  ArrowUpDown,
  Star,
  Check,
  AlertTriangle,
  Loader2,
  Save,
  RotateCcw,
  Building2,
  Settings,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn, formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  type FilterTabOption,
  AdminStatsCards,
  type AdminStatItem,
} from "../shared";
import { internetApi } from "@/features/internet/api/internet-api";
import type {
  InternetPlan,
  InternetOrder,
  InternetOrderStatus,
} from "@/features/internet/types";
import { InternetPlanModal } from "./internet-plan-modal";
import { InternetOrderDetailModal } from "./internet-order-detail-modal";

const ORDER_STATUS_TABS: FilterTabOption[] = [
  { id: "ALL", label: "همه سفارش‌ها" },
  { id: "PENDING", label: "در انتظار بررسی", badgeVariant: "orange" },
  { id: "ACTIVE", label: "فعال و تحویل‌شده", badgeVariant: "emerald" },
  { id: "CANCELLED", label: "لغو شده", badgeVariant: "rose" },
];

export function AdminInternetView() {
  const [activeTab, setActiveTab] = React.useState<"plans" | "settings" | "orders">("plans");

  // Plans state
  const [plans, setPlans] = React.useState<InternetPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = React.useState(true);
  const [planSearch, setPlanSearch] = React.useState("");
  const [editingPlan, setEditingPlan] = React.useState<InternetPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false);

  // Delete plan confirmation
  const [planToDelete, setPlanToDelete] = React.useState<InternetPlan | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = React.useState(false);

  // Settings state
  const [settings, setSettings] = React.useState<{
    static_ip_monthly_price: number;
    partner_internet_commission: number;
    partner_static_ip_commission: number;
  }>({
    static_ip_monthly_price: 250000,
    partner_internet_commission: 400000,
    partner_static_ip_commission: 150000,
  });
  const [loadingSettings, setLoadingSettings] = React.useState(false);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [settingsSuccess, setSettingsSuccess] = React.useState(false);

  // Orders state
  const [orders, setOrders] = React.useState<InternetOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);
  const [orderSearch, setOrderSearch] = React.useState("");
  const [orderStatusFilter, setOrderStatusFilter] = React.useState("ALL");
  const [selectedOrder, setSelectedOrder] = React.useState<InternetOrder | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = React.useState(false);

  // Notification message
  const [actionMessage, setActionMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // ─── Data Fetching ───────────────────────────────────────────

  const loadPlans = React.useCallback(async () => {
    try {
      setLoadingPlans(true);
      const data = await internetApi.getAdminPlans();
      setPlans(data);
    } catch (err: any) {
      console.error("Failed to load plans:", err);
      showNotification("خطا در دریافت لیست پلن‌ها", "error");
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const loadSettings = React.useCallback(async () => {
    try {
      setLoadingSettings(true);
      const data = await internetApi.getAdminSettings();
      const newSettings = { ...settings };
      for (const item of data) {
        const val = parseInt(item.value, 10);
        if (!isNaN(val) && item.key in newSettings) {
          (newSettings as any)[item.key] = val;
        }
      }
      setSettings(newSettings);
    } catch (err: any) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const loadOrders = React.useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await internetApi.getAdminOrders({
        status: orderStatusFilter === "ALL" ? undefined : orderStatusFilter,
        search: orderSearch.trim() || undefined,
        limit: 100,
      });
      setOrders(res.orders || []);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      showNotification("خطا در بارگذاری سفارش‌ها", "error");
    } finally {
      setLoadingOrders(false);
    }
  }, [orderStatusFilter, orderSearch]);

  React.useEffect(() => {
    loadPlans();
    loadSettings();
    loadOrders();
  }, [loadPlans, loadSettings, loadOrders]);

  // ─── Plans Operations ─────────────────────────────────────────

  const handleSavePlan = async (planData: Partial<InternetPlan>) => {
    if (editingPlan) {
      const updated = await internetApi.updateAdminPlan(editingPlan.id, planData);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showNotification(`پلن «${updated.title}» با موفقیت ویرایش شد.`);
    } else {
      const created = await internetApi.createAdminPlan(planData);
      setPlans((prev) => [created, ...prev]);
      showNotification(`پلن «${created.title}» با موفقیت ایجاد شد.`);
    }
  };

  const handleTogglePlanActive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await internetApi.toggleAdminPlanActive(id);
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showNotification(
        `پلن «${updated.title}» ${updated.isActive ? "فعال" : "غیرفعال"} شد.`
      );
    } catch (err) {
      showNotification("خطا در تغییر وضعیت پلن", "error");
    }
  };

  const handleToggleFeatured = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await internetApi.toggleAdminPlanFeatured(id);
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showNotification(
        `پلن «${updated.title}» به عنوان ${updated.isFeatured ? "پلن برگزیده ثبت شد" : "پلن عادی تنظیم شد"}.`
      );
    } catch (err) {
      showNotification("خطا در تغییر وضعیت برگزیده", "error");
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    setIsDeletingPlan(true);
    try {
      const res = await internetApi.deleteAdminPlan(planToDelete.id);
      if (res.action === "deactivated") {
        setPlans((prev) =>
          prev.map((p) => (p.id === planToDelete.id ? { ...p, isActive: false } : p))
        );
        showNotification(res.message, "success");
      } else {
        setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
        showNotification(res.message, "success");
      }
      setPlanToDelete(null);
    } catch (err: any) {
      showNotification(err.message || "خطا در حذف پلن", "error");
    } finally {
      setIsDeletingPlan(false);
    }
  };

  // ─── Settings Operations ──────────────────────────────────────

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      await internetApi.updateAdminSettings(settings);
      setSettingsSuccess(true);
      showNotification("تنظیمات و نرخ‌های پایه اینترنت با موفقیت ذخیره شد.");
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      showNotification(err.message || "خطا در ذخیره‌سازی تنظیمات", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // ─── Orders Operations ────────────────────────────────────────

  const handleUpdateOrderStatus = async (orderId: string, status: InternetOrderStatus) => {
    const updated = await internetApi.updateAdminOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updated);
    }
    showNotification(`وضعیت سفارش ${updated.trackingCode} به روز شد.`);
  };

  // ─── Stats ────────────────────────────────────────────────────

  const activePlansCount = plans.filter((p) => p.isActive).length;
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const activeOrdersCount = orders.filter((o) => o.status === "ACTIVE").length;

  const statsItems: AdminStatItem[] = [
    {
      id: "total_plans",
      title: "تعداد کل پلن‌ها",
      value: toPersianDigits(plans.length),
      changeText: `${toPersianDigits(activePlansCount)} پلن فعال در وب‌سایت`,
      changePositive: true,
      icon: Globe2,
      variant: "sky",
    },
    {
      id: "pending_orders",
      title: "سفارش‌های در انتظار تایید",
      value: toPersianDigits(pendingOrdersCount),
      changeText: "نیازمند بررسی فنی کارشناس",
      changePositive: pendingOrdersCount === 0,
      icon: Clock,
      variant: pendingOrdersCount > 0 ? "orange" : "emerald",
    },
    {
      id: "active_orders",
      title: "خطوط فعال تحویل‌شده",
      value: toPersianDigits(activeOrdersCount),
      changeText: "اتصال پایدار سازمانی",
      changePositive: true,
      icon: CheckCircle2,
      variant: "emerald",
    },
    {
      id: "static_ip_rate",
      title: "نرخ مصوب IP استاتیک",
      value: formatPrice(settings.static_ip_monthly_price),
      changeText: "تعرفه ماهانه هر آدرس IP",
      changePositive: true,
      icon: Server,
      variant: "purple",
    },
  ];

  const filteredPlans = plans.filter((p) => {
    if (!planSearch.trim()) return true;
    const q = planSearch.toLowerCase();
    return (
      (p.title || "").toLowerCase().includes(q) ||
      (p.badge || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Notifications Toast */}
      {actionMessage && (
        <div
          className={cn(
            "fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-300",
            actionMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/50 text-rose-200"
          )}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Globe2 className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              مدیریت اینترنت سازمانی و IP استاتیک
            </h1>
          </div>
          <p className="text-xs text-neutral-400">
            تعریف و ویرایش پلن‌ها، تنظیم نرخ خدمات جانبی و IP ثابت، و پایش سفارش‌های خطوط متصل به کارگاه‌ها
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => {
              setEditingPlan(null);
              setIsPlanModalOpen(true);
            }}
            className="bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن پلن جدید</span>
          </Button>

          <Link
            href="/internet"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition-colors"
          >
            <Globe2 className="h-3.5 w-3.5 text-sky-400" />
            <span>مشاهده صفحه خرید</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards items={statsItems} />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        {[
          { id: "plans", label: "پلن‌های اینترنت", icon: Wifi, count: plans.length },
          { id: "settings", label: "تعرفه‌ها و IP استاتیک", icon: Settings },
          {
            id: "orders",
            label: "سفارش‌های ثبت‌شده",
            icon: Package,
            count: orders.length,
            badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} جدید` : undefined,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                isActive
                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-300 font-mono">
                  {toPersianDigits(tab.count)}
                </span>
              )}
              {tab.badge && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: PLANS MANAGEMENT ──────────────────────────────── */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={planSearch}
                onChange={(e) => setPlanSearch(e.target.value)}
                placeholder="جستجو در عنوان، نشان یا توضیحات پلن..."
                className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-500 transition-all"
              />
            </div>
            <span className="text-xs text-neutral-400 font-mono">
              تعداد پلن‌ها: {toPersianDigits(filteredPlans.length)}
            </span>
          </div>

          {/* Plans Table / Cards */}
          {loadingPlans ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
              <span className="text-xs text-neutral-400">در حال بارگذاری پلن‌های اینترنت...</span>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center flex flex-col items-center justify-center gap-3">
              <Wifi className="h-10 w-10 text-neutral-600" />
              <p className="text-sm font-bold text-white">هیچ پلنی یافت نشد.</p>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingPlan(null);
                  setIsPlanModalOpen(true);
                }}
                className="bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold"
              >
                افزودن اولین پلن اینترنت
              </Button>
            </div>
          ) : (
            <div className="rounded-3xl border border-neutral-800 bg-[#121216] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400">
                    <tr>
                      <th className="p-4">پلن و نشان</th>
                      <th className="p-4">قیمت ماهانه</th>
                      <th className="p-4">ترافیک (بین‌الملل / داخلی)</th>
                      <th className="p-4">ترافیک شبانه</th>
                      <th className="p-4">تخفیف دوره‌ای (۳ / ۶ / ۱۲ ماه)</th>
                      <th className="p-4 text-center">برگزیده</th>
                      <th className="p-4 text-center">وضعیت</th>
                      <th className="p-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-neutral-900/40 transition-colors">
                        {/* Title & Badge */}
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{plan.title}</span>
                              {plan.badge && (
                                <span className="text-[10px] bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md font-bold">
                                  {plan.badge}
                                </span>
                              )}
                            </div>
                            {plan.description && (
                              <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-xs">
                                {plan.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                          {formatPrice(plan.monthlyPrice)}
                        </td>

                        {/* Traffic */}
                        <td className="p-4 text-neutral-300 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span>
                              خارجی:{" "}
                              <strong className="text-sky-400">
                                {plan.internationalTraffic === null || plan.internationalTraffic === undefined
                                  ? "نامحدود"
                                  : `${toPersianDigits(plan.internationalTraffic)} GB`}
                              </strong>
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              داخلی:{" "}
                              <strong className="text-emerald-400">
                                {plan.domesticTraffic === null || plan.domesticTraffic === undefined
                                  ? "نامحدود"
                                  : `${toPersianDigits(plan.domesticTraffic)} GB`}
                              </strong>
                            </span>
                          </div>
                        </td>

                        {/* Night Traffic */}
                        <td className="p-4 whitespace-nowrap">
                          {plan.nightTraffic === "FREE_BUSINESS" ? (
                            <span className="text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                              رایگان سازمانی
                            </span>
                          ) : plan.nightTraffic === "HALF_PRICE" ? (
                            <span className="text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                              نیم‌بها
                            </span>
                          ) : (
                            <span className="text-[11px] text-neutral-400">عادی</span>
                          )}
                        </td>

                        {/* Discounts */}
                        <td className="p-4 font-mono text-neutral-300 whitespace-nowrap">
                          <span className="text-neutral-400">۳ ماه:</span>{" "}
                          <strong className="text-sky-300">{toPersianDigits(plan.discountThreeMonths ?? 0)}٪</strong>{" "}
                          | <span className="text-neutral-400">۶ ماه:</span>{" "}
                          <strong className="text-sky-300">{toPersianDigits(plan.discountSixMonths ?? 0)}٪</strong>{" "}
                          | <span className="text-neutral-400">۱۲ ماه:</span>{" "}
                          <strong className="text-emerald-400">{toPersianDigits(plan.discountYearly ?? 0)}٪</strong>
                        </td>

                        {/* Featured Toggle */}
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => handleToggleFeatured(plan.id, e)}
                            className={cn(
                              "p-2 rounded-xl transition-all cursor-pointer",
                              plan.isFeatured
                                ? "text-amber-400 bg-amber-500/15 border border-amber-500/30"
                                : "text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800"
                            )}
                            title={plan.isFeatured ? "پلن برگزیده (کلیک برای غیرفعال‌سازی)" : "تنظیم به عنوان برگزیده"}
                          >
                            <Star className={cn("h-4 w-4", plan.isFeatured && "fill-amber-400")} />
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => handleTogglePlanActive(plan.id, e)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer",
                              plan.isActive
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
                            )}
                          >
                            {plan.isActive ? "فعال" : "غیرفعال"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPlan(plan);
                                setIsPlanModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-400 hover:bg-neutral-800 transition-colors"
                              title="ویرایش پلن"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPlanToDelete(plan)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                              title="حذف پلن"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: SETTINGS & STATIC IP PRICING ─────────────────── */}
      {activeTab === "settings" && (
        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#121216] space-y-6">
            <div className="border-b border-neutral-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-sky-400" />
                <span>تنظیمات تعرفه‌های پایه اینترنت و IP استاتیک</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                این مبالغ به صورت متمرکز در فرم خرید و محاسبات پیش‌فاکتور آنلاین لحاظ می‌شوند.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
              {/* Static IP Price */}
              <div>
                <label className="block font-bold text-white mb-1.5">
                  تعرفه ماهانه هر آدرس IP استاتیک سازمانی (تومان)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={10000}
                    min={0}
                    required
                    value={settings.static_ip_monthly_price}
                    onChange={(e) =>
                      setSettings({ ...settings, static_ip_monthly_price: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white font-mono pl-16 text-sm"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-neutral-500">تومان / ماه</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  در صورت انتخاب گزینه IP استاتیک در فرم سفارش، این مبلغ به‌صورت مستقل از تخفیف‌های دوره اینترنت، ضرب در تعداد ماه‌های اشتراک محاسبه می‌گردد.
                </p>
              </div>

              {/* Partner Commissions Strip */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <h4 className="font-bold text-purple-300 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  <span>پورسانت‌های پایه همکاران سازمانی (B2B Partner)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 mb-1">
                      پورسانت فروش هر خط اینترنت (تومان)
                    </label>
                    <input
                      type="number"
                      step={50000}
                      min={0}
                      value={settings.partner_internet_commission}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          partner_internet_commission: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-purple-500 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1">
                      پورسانت تخصیص IP استاتیک همکار (تومان)
                    </label>
                    <input
                      type="number"
                      step={25000}
                      min={0}
                      value={settings.partner_static_ip_commission}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          partner_static_ip_commission: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-purple-500 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 flex items-center justify-between border-t border-neutral-800">
                {settingsSuccess && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                    <Check className="h-4 w-4" />
                    <span>تغییرات با موفقیت ذخیره شد.</span>
                  </span>
                )}
                {!settingsSuccess && <div />}

                <Button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
                >
                  {savingSettings ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>ذخیره تنظیمات تعرفه‌ها</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 3: ORDERS MANAGEMENT ─────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Status Tabs and Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-2xl overflow-x-auto">
              {ORDER_STATUS_TABS.map((tab) => {
                const isSelected = orderStatusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(tab.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                      isSelected
                        ? "bg-sky-500 text-black shadow-md shadow-sky-500/20"
                        : "text-neutral-400 hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="جستجو با کد رهگیری، نام متقاضی یا شماره تلفن..."
                className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-500 transition-all"
              />
            </div>
          </div>

          {/* Orders Table */}
          {loadingOrders ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
              <span className="text-xs text-neutral-400">در حال دریافت لیست سفارش‌های اینترنت...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 rounded-3xl border border-neutral-800 bg-neutral-900/40 text-center flex flex-col items-center justify-center gap-2">
              <Package className="h-10 w-10 text-neutral-600" />
              <p className="text-sm font-bold text-white">سفارشی در این وضعیت یافت نشد.</p>
              <span className="text-xs text-neutral-500">
                سفارش‌های ثبت‌شده از صفحه /internet در این بخش نمایش داده می‌شوند.
              </span>
            </div>
          ) : (
            <div className="rounded-3xl border border-neutral-800 bg-[#121216] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400">
                    <tr>
                      <th className="p-4">کد رهگیری</th>
                      <th className="p-4">متقاضی / شرکت</th>
                      <th className="p-4">پلن و دوره</th>
                      <th className="p-4">IP استاتیک</th>
                      <th className="p-4">کارگاه همکار</th>
                      <th className="p-4">مبلغ کل (تومان)</th>
                      <th className="p-4 text-center">وضعیت</th>
                      <th className="p-4 text-center">جزئیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {orders.map((order) => {
                      const isPending = order.status === "PENDING";
                      const isActive = order.status === "ACTIVE";
                      const isCancelled = order.status === "CANCELLED";

                      return (
                        <tr key={order.id} className="hover:bg-neutral-900/40 transition-colors">
                          {/* Tracking code */}
                          <td className="p-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                            {order.trackingCode}
                          </td>

                          {/* Customer */}
                          <td className="p-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-white">{order.fullName}</span>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                                <span>{order.companyName || "شخصی"}</span>
                                <span>•</span>
                                <span className="font-mono" dir="ltr">{order.phoneNumber}</span>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-white">
                                {order.plan?.title || "پلن اینترنت"}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-mono">
                                اشتراک {toPersianDigits(order.serviceDurationMonths)} ماهه
                              </span>
                            </div>
                          </td>

                          {/* Static IP */}
                          <td className="p-4 whitespace-nowrap">
                            {order.hasStaticIp ? (
                              <span className="text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                                دارد (+IP)
                              </span>
                            ) : (
                              <span className="text-[11px] text-neutral-500">ندارد</span>
                            )}
                          </td>

                          {/* Partner Workshop */}
                          <td className="p-4 whitespace-nowrap">
                            {order.site ? (
                              <span className="text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-fit">
                                <Building2 className="h-3 w-3" />
                                <span>{order.site.title}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-neutral-500">-</span>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                            {formatPrice(order.finalAmount)}
                          </td>

                          {/* Status */}
                          <td className="p-4 text-center whitespace-nowrap">
                            {isPending && (
                              <span className="text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>در انتظار بررسی</span>
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>فعال و تحویل‌شده</span>
                              </span>
                            )}
                            {isCancelled && (
                              <span className="text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                <span>لغو شده</span>
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="p-4 text-center whitespace-nowrap">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsOrderDetailOpen(true);
                              }}
                              className="text-xs flex items-center gap-1 hover:bg-neutral-800"
                            >
                              <Eye className="h-3.5 w-3.5 text-sky-400" />
                              <span>مشاهده و تغییر وضعیت</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Modals ──────────────────────────────────────────────── */}
      <InternetPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setEditingPlan(null);
        }}
        onSave={handleSavePlan}
        plan={editingPlan}
      />

      <InternetOrderDetailModal
        isOpen={isOrderDetailOpen}
        onClose={() => {
          setIsOrderDetailOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-md p-6 rounded-3xl border border-neutral-800 bg-[#16161a] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold text-white">تایید حذف یا غیرفعال‌سازی پلن</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              آیا از حذف پلن «<strong className="text-white">{planToDelete.title}</strong>» اطمینان دارید؟ در صورتی که سفارشی قبلاً برای این پلن ثبت شده باشد، پلن به جای حذف، به حالت غیرفعال درخواهد آمد.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPlanToDelete(null)}
                disabled={isDeletingPlan}
                className="text-xs"
              >
                انصراف
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleDeletePlan}
                disabled={isDeletingPlan}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                {isDeletingPlan ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>تایید حذف</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
