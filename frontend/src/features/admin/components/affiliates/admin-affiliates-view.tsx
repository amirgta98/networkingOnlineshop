"use client";

import * as React from "react";
import {
  Users2,
  Percent,
  Coins,
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  Phone,
  Save,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  FileText,
  Hash,
  Eye,
  Pencil,
  X,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { cn, formatPrice, toPersianDigits, formatJalaliDate } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  AdminDataView,
  type AdminColumnDef,
  AdminFilterToolbar,
  type FilterTabOption,
  AdminStatsCards,
  type AdminStatItem,
} from "../shared";
import { PartnerDetailDrawer } from "./partner-detail-drawer";
import { NewPayoutModal } from "./new-payout-modal";
import { NewPartnerModal } from "./new-partner-modal";
import type {
  AffiliatePartnerDto,
  AffiliateCommissionDto,
  AffiliatePayoutDto,
  AffiliateSettingsDto,
  AffiliateCommissionStatus,
  AffiliatePartnerStatus,
  UpdateAffiliateSettingsPayload,
  AffiliateAdminStats,
} from "../../types/admin-affiliates.types";
import { adminAffiliatesApi } from "../../api/admin-affiliates-api";

type ActiveTab = "partners" | "commissions" | "settings";

export function AdminAffiliatesView() {
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("partners");

  // Global Backend Stats for Tabs & Counters
  const [stats, setStats] = React.useState<AffiliateAdminStats>({
    partners: { total: 0, active: 0, pending: 0, inactive: 0 },
    commissions: { total: 0, pending: 0, approved: 0, readyForPayment: 0, paid: 0, cancelled: 0 },
  });

  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const loadStats = React.useCallback(async () => {
    try {
      const data = await adminAffiliatesApi.getStats();
      if (data) {
        setStats(data);
      }
    } catch (err: any) {
      console.error("Failed to load affiliate stats", err);
    }
  }, []);

  React.useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ─── Partners Tab State ───────────────────────────────────────────────
  const [partners, setPartners] = React.useState<AffiliatePartnerDto[]>([]);
  const [partnersTotal, setPartnersTotal] = React.useState<number>(0);
  const [isLoadingPartners, setIsLoadingPartners] = React.useState<boolean>(true);
  const [partnerSearchInput, setPartnerSearchInput] = React.useState<string>("");
  const [partnerSearchQuery, setPartnerSearchQuery] = React.useState<string>("");
  const [partnerStatusFilter, setPartnerStatusFilter] = React.useState<string>("ALL");
  const [partnersPage, setPartnersPage] = React.useState<number>(1);
  const [partnersPageSize, setPartnersPageSize] = React.useState<number>(10);

  // Modals & Drawers state
  const [selectedPartnerForDrawer, setSelectedPartnerForDrawer] = React.useState<AffiliatePartnerDto | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [isNewPartnerModalOpen, setIsNewPartnerModalOpen] = React.useState<boolean>(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = React.useState<boolean>(false);
  const [selectedPartnerIdForPayout, setSelectedPartnerIdForPayout] = React.useState<string | undefined>(undefined);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPartnerSearchQuery(partnerSearchInput);
      setPartnersPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [partnerSearchInput]);

  // ─── Commissions Tab State ────────────────────────────────────────────
  const [commissions, setCommissions] = React.useState<AffiliateCommissionDto[]>([]);
  const [commissionsTotal, setCommissionsTotal] = React.useState<number>(0);
  const [isLoadingCommissions, setIsLoadingCommissions] = React.useState<boolean>(false);
  const [commissionStatusFilter, setCommissionStatusFilter] = React.useState<string>("ALL");
  const [commissionProductTypeFilter, setCommissionProductTypeFilter] = React.useState<string>("ALL");
  const [commissionsPage, setCommissionsPage] = React.useState<number>(1);
  const [commissionsPageSize, setCommissionsPageSize] = React.useState<number>(10);

  // ─── Payouts State ────────────────────────────────────────────────────
  const [payouts, setPayouts] = React.useState<AffiliatePayoutDto[]>([]);
  const [payoutsTotal, setPayoutsTotal] = React.useState<number>(0);
  const [isLoadingPayouts, setIsLoadingPayouts] = React.useState<boolean>(false);
  const [payoutsPage, setPayoutsPage] = React.useState<number>(1);
  const [payoutsPageSize, setPayoutsPageSize] = React.useState<number>(10);

  // ─── Global Settings State ────────────────────────────────────────────
  const [settings, setSettings] = React.useState<AffiliateSettingsDto | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = React.useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = React.useState<boolean>(false);
  const [settingsForm, setSettingsForm] = React.useState<{
    defaultDiscountPercent: number;
    defaultStaticIpCommission: number;
    defaultInternetCommission: number;
    isAffiliateSystemEnabled: boolean;
    isProductDiscountEnabled: boolean;
    isStaticIpCommissionEnabled: boolean;
    isInternetCommissionEnabled: boolean;
    eligibleCategoryIds: string[];
    eligibleProductIds: string[];
  }>({
    defaultDiscountPercent: 8,
    defaultStaticIpCommission: 150000,
    defaultInternetCommission: 400000,
    isAffiliateSystemEnabled: true,
    isProductDiscountEnabled: true,
    isStaticIpCommissionEnabled: true,
    isInternetCommissionEnabled: true,
    eligibleCategoryIds: [],
    eligibleProductIds: [],
  });
  const [newCategoryInput, setNewCategoryInput] = React.useState<string>("");
  const [newProductInput, setNewProductInput] = React.useState<string>("");
  const [settingsFeedback, setSettingsFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load Partners with server-side pagination & filter
  const loadPartners = React.useCallback(async () => {
    setIsLoadingPartners(true);
    setFetchError(null);
    try {
      const skip = (partnersPage - 1) * partnersPageSize;
      const res = await adminAffiliatesApi.getPartners({
        search: partnerSearchQuery || undefined,
        status: partnerStatusFilter !== "ALL" ? partnerStatusFilter : undefined,
        skip,
        take: partnersPageSize,
      });
      setPartners(res.items || []);
      setPartnersTotal(res.total || 0);
    } catch (err: any) {
      console.error("Failed to load affiliate partners", err);
      setFetchError(err?.message || "خطا در برقراری ارتباط با وب‌سرویس همکاران");
    } finally {
      setIsLoadingPartners(false);
    }
  }, [partnerSearchQuery, partnerStatusFilter, partnersPage, partnersPageSize]);

  // Load Commissions with server-side pagination
  const loadCommissions = React.useCallback(async () => {
    setIsLoadingCommissions(true);
    try {
      const skip = (commissionsPage - 1) * commissionsPageSize;
      const res = await adminAffiliatesApi.getCommissions({
        status: commissionStatusFilter !== "ALL" ? commissionStatusFilter : undefined,
        productType: commissionProductTypeFilter !== "ALL" ? commissionProductTypeFilter : undefined,
        skip,
        take: commissionsPageSize,
      });
      setCommissions(res.items || []);
      setCommissionsTotal(res.total || 0);
    } catch (err) {
      console.error("Failed to load commissions", err);
    } finally {
      setIsLoadingCommissions(false);
    }
  }, [commissionStatusFilter, commissionProductTypeFilter, commissionsPage, commissionsPageSize]);

  // Load Payouts with server-side pagination
  const loadPayouts = React.useCallback(async () => {
    setIsLoadingPayouts(true);
    try {
      const skip = (payoutsPage - 1) * payoutsPageSize;
      const res = await adminAffiliatesApi.getPayouts({
        skip,
        take: payoutsPageSize,
      });
      setPayouts(res.items || []);
      setPayoutsTotal(res.total || 0);
    } catch (err) {
      console.error("Failed to load payouts", err);
    } finally {
      setIsLoadingPayouts(false);
    }
  }, [payoutsPage, payoutsPageSize]);

  // Load Global Settings
  const loadSettings = React.useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const res = await adminAffiliatesApi.getSettings();
      setSettings(res);
      setSettingsForm({
        defaultDiscountPercent: res.defaultDiscountPercent,
        defaultStaticIpCommission: res.defaultStaticIpCommission,
        defaultInternetCommission: res.defaultInternetCommission,
        isAffiliateSystemEnabled: res.isAffiliateSystemEnabled,
        isProductDiscountEnabled: res.isProductDiscountEnabled,
        isStaticIpCommissionEnabled: res.isStaticIpCommissionEnabled,
        isInternetCommissionEnabled: res.isInternetCommissionEnabled,
        eligibleCategoryIds: res.eligibleCategoryIds || [],
        eligibleProductIds: res.eligibleProductIds || [],
      });
    } catch (err) {
      console.error("Failed to load affiliate settings", err);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  React.useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  React.useEffect(() => {
    if (activeTab === "commissions") {
      loadCommissions();
      loadPayouts();
    } else if (activeTab === "settings") {
      loadSettings();
    }
  }, [activeTab, loadCommissions, loadPayouts, loadSettings]);

  // Save Global Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsFeedback(null);
    try {
      const payload: UpdateAffiliateSettingsPayload = {
        defaultDiscountPercent: Number(settingsForm.defaultDiscountPercent),
        defaultStaticIpCommission: Number(settingsForm.defaultStaticIpCommission),
        defaultInternetCommission: Number(settingsForm.defaultInternetCommission),
        isAffiliateSystemEnabled: settingsForm.isAffiliateSystemEnabled,
        isProductDiscountEnabled: settingsForm.isProductDiscountEnabled,
        isStaticIpCommissionEnabled: settingsForm.isStaticIpCommissionEnabled,
        isInternetCommissionEnabled: settingsForm.isInternetCommissionEnabled,
        eligibleCategoryIds: settingsForm.eligibleCategoryIds,
        eligibleProductIds: settingsForm.eligibleProductIds,
      };

      const updated = await adminAffiliatesApi.updateSettings(payload);
      setSettings(updated);
      setSettingsFeedback({
        type: "success",
        text: "تنظیمات عمومی سیستم همکاری در فروش با موفقیت ذخیره گردید.",
      });
    } catch (err: any) {
      setSettingsFeedback({
        type: "error",
        text: err?.message || "خطا در بروزرسانی تنظیمات عمومی سیستم.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed && !settingsForm.eligibleCategoryIds.includes(trimmed)) {
      setSettingsForm((prev) => ({
        ...prev,
        eligibleCategoryIds: [...prev.eligibleCategoryIds, trimmed],
      }));
      setNewCategoryInput("");
    }
  };

  const handleRemoveCategory = (catId: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      eligibleCategoryIds: prev.eligibleCategoryIds.filter((c) => c !== catId),
    }));
  };

  const handleAddProduct = () => {
    const trimmed = newProductInput.trim();
    if (trimmed && !settingsForm.eligibleProductIds.includes(trimmed)) {
      setSettingsForm((prev) => ({
        ...prev,
        eligibleProductIds: [...prev.eligibleProductIds, trimmed],
      }));
      setNewProductInput("");
    }
  };

  const handleRemoveProduct = (prodId: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      eligibleProductIds: prev.eligibleProductIds.filter((p) => p !== prodId),
    }));
  };

  // Update commission status quick action
  const handleUpdateCommissionStatus = async (
    commId: string,
    newStatus: AffiliateCommissionStatus
  ) => {
    try {
      await adminAffiliatesApi.updateCommissionStatus(commId, newStatus);
      loadCommissions();
      loadPartners();
      loadStats();
    } catch (err) {
      console.error("Failed to update commission status", err);
    }
  };

  // Aggregated metrics for stats strip
  const totalSalesAll = partners.reduce((sum, p) => sum + (p.totalSales || 0), 0);
  const totalCommissionsAll = partners.reduce((sum, p) => sum + (p.totalCommission || 0), 0);
  const totalPaidAll = partners.reduce((sum, p) => sum + (p.paidCommission || 0), 0);
  const totalUnpaidApproved = partners.reduce(
    (sum, p) => sum + Math.max(0, (p.approvedCommission || 0) - (p.paidCommission || 0)),
    0
  );

  const statsItems: AdminStatItem[] = [
    {
      id: "active_partners",
      title: "همکاران فعال",
      value: `${toPersianDigits(stats.partners.active)} همکار`,
      subtitle: `از مجموع ${toPersianDigits(stats.partners.total)} متقاضی`,
      icon: Users2,
      variant: "sky",
    },
    {
      id: "total_sales",
      title: "مجموع فروش ارجاعی",
      value: formatPrice(totalSalesAll),
      subtitle: "حجم کل فاکتورهای همکاران",
      icon: TrendingUp,
      variant: "orange",
    },
    {
      id: "total_commissions",
      title: "پورسانت‌های تولیدشده",
      value: formatPrice(totalCommissionsAll),
      subtitle: "مجموع درآمد محاسبه‌شده همکاران",
      icon: Coins,
      variant: "purple",
    },
    {
      id: "unpaid_commissions",
      title: "پورسانت آماده تسویه",
      value: formatPrice(totalUnpaidApproved),
      subtitle: `تسویه‌شده: ${formatPrice(totalPaidAll)}`,
      icon: CreditCard,
      variant: "emerald",
    },
  ];

  // Status Tabs definition for Partners Filter Toolbar (directly from backend stats)
  const partnerStatusTabs: FilterTabOption[] = [
    { id: "ALL", label: "همه همکاران", count: stats.partners.total },
    {
      id: "ACTIVE",
      label: "همکاران فعال",
      count: stats.partners.active,
      badgeVariant: "emerald",
    },
    {
      id: "PENDING_APPROVAL",
      label: "در انتظار بررسی",
      count: stats.partners.pending,
      badgeVariant: "orange",
    },
    {
      id: "INACTIVE",
      label: "غیرفعال",
      count: stats.partners.inactive,
      badgeVariant: "rose",
    },
  ];

  // Columns for Partners Table
  const partnerColumns: AdminColumnDef<AffiliatePartnerDto>[] = [
    {
      key: "code",
      header: "کد همکار",
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-500/30 px-2 py-0.5 rounded-md">
          {row.partnerCode}
        </span>
      ),
    },
    {
      key: "user",
      header: "مشخصات همکار",
      cell: (row) => (
        <div className="flex flex-col text-right">
          <span className="text-xs font-bold text-white">{row.user?.name || "کاربر سیستم"}</span>
          <span className="text-[11px] text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
            <Phone className="h-3 w-3 text-neutral-500" />
            {toPersianDigits(row.user?.phone || "—")}
          </span>
        </div>
      ),
    },
    {
      key: "discount",
      header: "نرخ تخفیف کالا",
      cell: (row) => (
        <div className="flex flex-col text-right">
          <span className="text-xs font-black text-emerald-400">
            {toPersianDigits(row.effectiveDiscountPercent ?? row.customDiscountPercent ?? 8)}٪
          </span>
          <span className="text-[10px] text-neutral-500">
            {row.customDiscountPercent !== null && row.customDiscountPercent !== undefined
              ? "نرخ اختصاصی"
              : "پیش‌فرض سیستم (۸٪)"}
          </span>
        </div>
      ),
    },
    {
      key: "commissions_rate",
      header: "پورسانت خطوط و IP",
      cell: (row) => (
        <div className="flex flex-col text-right text-[11px]">
          <span className="text-neutral-300">
            IP: {formatPrice(row.effectiveStaticIpCommission ?? 150000)}
          </span>
          <span className="text-neutral-400">
            اینترنت: {formatPrice(row.effectiveInternetCommission ?? 400000)}
          </span>
        </div>
      ),
    },
    {
      key: "sales",
      header: "فروش و سفارشات",
      cell: (row) => (
        <div className="flex flex-col text-right">
          <span className="text-xs font-black text-white">{formatPrice(row.totalSales || 0)}</span>
          <span className="text-[10px] text-neutral-400">{toPersianDigits(row.totalOrders || 0)} سفارش</span>
        </div>
      ),
    },
    {
      key: "commission_stats",
      header: "وضعیت تسویه‌حساب",
      cell: (row) => {
        const remaining = Math.max(0, (row.approvedCommission || 0) - (row.paidCommission || 0));
        return (
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-purple-400">
              کل: {formatPrice(row.totalCommission || 0)}
            </span>
            <span className="text-[10px] text-emerald-400">
              مانده: {formatPrice(remaining)}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "وضعیت",
      cell: (row) => (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1",
            row.status === "ACTIVE"
              ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-400"
              : row.status === "PENDING_APPROVAL"
              ? "bg-amber-950/60 border border-amber-500/40 text-amber-400"
              : "bg-red-950/60 border border-red-500/40 text-red-400"
          )}
        >
          {row.status === "ACTIVE" ? "فعال" : row.status === "PENDING_APPROVAL" ? "در انتظار" : "مسدود"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      cell: (row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPartnerForDrawer(row);
            setIsDrawerOpen(true);
          }}
          className="text-xs h-8 px-2.5 text-neutral-300 border-neutral-700 hover:text-white hover:border-orange-500/50 gap-1.5"
        >
          <Pencil className="h-3.5 w-3.5 text-orange-400" />
          <span>تنظیم نرخ‌ها</span>
        </Button>
      ),
    },
  ];

  // Card view renderer for Partners
  const renderPartnerCard = (item: AffiliatePartnerDto) => {
    const remaining = Math.max(0, (item.approvedCommission || 0) - (item.paidCommission || 0));
    return (
      <div
        key={item.id}
        onClick={() => {
          setSelectedPartnerForDrawer(item);
          setIsDrawerOpen(true);
        }}
        className="rounded-2xl border border-neutral-800 bg-[#141418] p-5 hover:border-orange-500/40 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
              {item.user?.name ? item.user.name.slice(0, 1) : "P"}
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                {item.user?.name || "کاربر سیستم"}
              </span>
              <span className="text-xs text-neutral-400 font-mono flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3 text-neutral-500" />
                {toPersianDigits(item.user?.phone || "—")}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="font-mono text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-500/30 px-2 py-0.5 rounded-md">
              {item.partnerCode}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1",
                item.status === "ACTIVE"
                  ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-400"
                  : item.status === "PENDING_APPROVAL"
                  ? "bg-amber-950/60 border border-amber-500/40 text-amber-400"
                  : "bg-red-950/60 border border-red-500/40 text-red-400"
              )}
            >
              {item.status === "ACTIVE" ? "فعال" : item.status === "PENDING_APPROVAL" ? "در انتظار" : "مسدود"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800/80 text-xs">
          <div className="rounded-xl bg-neutral-900/50 p-2.5">
            <span className="text-[10px] text-neutral-400 block mb-0.5">نرخ تخفیف کالا</span>
            <span className="font-black text-emerald-400 text-xs">
              {toPersianDigits(item.effectiveDiscountPercent ?? item.customDiscountPercent ?? 8)}٪
            </span>
            <span className="text-[9px] text-neutral-500 block">
              {item.customDiscountPercent !== null && item.customDiscountPercent !== undefined
                ? "اختصاصی"
                : "پیش‌فرض"}
            </span>
          </div>

          <div className="rounded-xl bg-neutral-900/50 p-2.5">
            <span className="text-[10px] text-neutral-400 block mb-0.5">پورسانت خط و IP</span>
            <span className="font-mono font-bold text-neutral-300 text-[11px] block truncate">
              IP: {formatPrice(item.effectiveStaticIpCommission ?? 150000)}
            </span>
            <span className="font-mono font-bold text-neutral-400 text-[10px] block truncate">
              نت: {formatPrice(item.effectiveInternetCommission ?? 400000)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
          <div>
            <span className="text-[10px] text-neutral-400 block">مانده آماده تسویه</span>
            <span className="font-black text-emerald-400">{formatPrice(remaining)}</span>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-neutral-400 block">کل سفارش‌ها</span>
            <span className="font-bold text-white font-mono">{toPersianDigits(item.totalOrders || 0)} سفارش</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPartnerForDrawer(item);
            setIsDrawerOpen(true);
          }}
          className="w-full text-xs h-8 border-neutral-800 hover:border-orange-500/50 hover:bg-neutral-900 text-neutral-300 gap-1.5"
        >
          <Pencil className="h-3.5 w-3.5 text-orange-400" />
          <span>مشاهده و ویرایش نرخ‌ها</span>
        </Button>
      </div>
    );
  };

  // Columns for Commissions Table
  const commissionColumns: AdminColumnDef<AffiliateCommissionDto>[] = [
    {
      key: "order",
      header: "شماره سفارش",
      cell: (row) => (
        <div className="flex flex-col text-right font-mono">
          <span className="text-xs font-bold text-white">{row.orderNumber}</span>
          <span className="text-[10px] text-neutral-500 truncate max-w-[120px]">{row.orderId}</span>
        </div>
      ),
    },
    {
      key: "product",
      header: "نوع و عنوان محصول",
      cell: (row) => (
        <div className="flex flex-col text-right">
          <span className="text-xs font-bold text-white line-clamp-1">{row.productTitle}</span>
          <span
            className={cn(
              "text-[10px] font-black px-1.5 py-0.5 rounded-md inline-block w-fit mt-0.5",
              row.productType === "INTERNET"
                ? "bg-sky-950/70 border border-sky-500/30 text-sky-400"
                : "bg-purple-950/70 border border-purple-500/30 text-purple-400"
            )}
          >
            {row.productType === "INTERNET" ? "سرویس اینترنت" : "IP استاتیک"} ({toPersianDigits(row.quantity)} عدد)
          </span>
        </div>
      ),
    },
    {
      key: "amounts",
      header: "نرخ واحد و پورسانت کل",
      cell: (row) => (
        <div className="flex flex-col text-right">
          <span className="text-xs font-black text-emerald-400">{formatPrice(row.totalCommission)}</span>
          <span className="text-[10px] text-neutral-400">
            هر واحد: {formatPrice(row.unitCommission)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "وضعیت پورسانت",
      cell: (row) => {
        const statusMap: Record<
          AffiliateCommissionStatus,
          { label: string; badge: string }
        > = {
          PENDING: { label: "در انتظار", badge: "bg-neutral-800 text-neutral-300" },
          APPROVED: { label: "تاییدشده", badge: "bg-sky-950/80 border border-sky-500/40 text-sky-300" },
          READY_FOR_PAYMENT: { label: "آماده تسویه", badge: "bg-purple-950/80 border border-purple-500/40 text-purple-300" },
          PAID: { label: "پرداخت‌شده", badge: "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300" },
          CANCELLED: { label: "لغوشده", badge: "bg-red-950/80 border border-red-500/40 text-red-400" },
        };
        const cur = statusMap[row.status] || { label: row.status, badge: "bg-neutral-800" };
        return (
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", cur.badge)}>
            {cur.label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "تاریخ ثبت",
      cell: (row) => (
        <span className="text-[11px] text-neutral-400 font-mono">
          {formatJalaliDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "status_actions",
      header: "تغییر وضعیت",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {row.status === "PENDING" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleUpdateCommissionStatus(row.id, "APPROVED")}
              className="text-[10px] h-7 px-2 text-sky-400 border-sky-500/30 hover:bg-sky-950/50"
            >
              تایید
            </Button>
          )}
          {row.status === "APPROVED" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleUpdateCommissionStatus(row.id, "READY_FOR_PAYMENT")}
              className="text-[10px] h-7 px-2 text-purple-400 border-purple-500/30 hover:bg-purple-950/50"
            >
              آماده تسویه
            </Button>
          )}
          {row.status !== "PAID" && row.status !== "CANCELLED" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleUpdateCommissionStatus(row.id, "CANCELLED")}
              className="text-[10px] h-7 px-2 text-red-400 border-red-500/30 hover:bg-red-950/50"
            >
              لغو
            </Button>
          )}
        </div>
      ),
    },
  ];

  const payoutColumns: AdminColumnDef<AffiliatePayoutDto>[] = [
    {
      key: "trackingCode",
      header: "کد پیگیری ساتنا/پایا",
      cell: (pay) => (
        <span className="font-mono font-bold text-orange-400 whitespace-nowrap">
          {pay.trackingCode}
        </span>
      ),
    },
    {
      key: "amount",
      header: "مبلغ پرداختی",
      sortable: true,
      cell: (pay) => (
        <span className="font-black text-emerald-400 whitespace-nowrap font-mono">
          {formatPrice(pay.amount)}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "روش پرداخت",
      cell: (pay) => <span className="whitespace-nowrap">{pay.paymentMethod}</span>,
    },
    {
      key: "paidAt",
      header: "تاریخ پرداخت",
      cell: (pay) => (
        <span className="font-mono text-neutral-400 whitespace-nowrap text-xs">
          {formatJalaliDate(pay.paidAt)}
        </span>
      ),
    },
    {
      key: "description",
      header: "توضیحات",
      cell: (pay) => <span className="text-neutral-400">{pay.description || "—"}</span>,
    },
    {
      key: "status",
      header: "وضعیت",
      cell: () => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 whitespace-nowrap">
          موفق
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8" dir="rtl">
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">مدیریت همکاران فروش و پورسانت‌دهی</h1>
              <p className="text-xs text-neutral-400 mt-1">
                اتصال مستقیم به اندپوینت‌های واقعی بک‌اند: تنظیم نرخ‌ها، نظارت بر تراکنش‌ها و ثبت حواله‌های بانکی
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              loadPartners();
              loadStats();
              if (activeTab === "commissions") {
                loadCommissions();
                loadPayouts();
              } else if (activeTab === "settings") {
                loadSettings();
              }
            }}
            className="text-neutral-300 border-neutral-700 hover:text-white gap-1.5 text-xs h-10"
          >
            <RefreshCw className={cn("h-4 w-4", isLoadingPartners && "animate-spin text-orange-400")} />
            <span>بروزرسانی داده‌ها</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsNewPartnerModalOpen(true)}
            className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold gap-2 text-xs h-10 border border-neutral-700"
          >
            <UserPlus className="h-4 w-4 text-orange-400" />
            <span>ثبت همکار جدید</span>
          </Button>

          <Button
            type="button"
            onClick={() => {
              setSelectedPartnerIdForPayout(undefined);
              setIsPayoutModalOpen(true);
            }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold gap-2 text-xs h-10 shadow-lg shadow-emerald-950/40"
          >
            <CreditCard className="h-4 w-4" />
            <span>ثبت تسویه‌حساب جدید</span>
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 rounded-2xl border border-red-500/40 bg-red-950/30 text-red-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{fetchError}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={loadPartners}
            className="text-xs border-red-500/40 text-red-300 hover:bg-red-950/50"
          >
            تلاش مجدد
          </Button>
        </div>
      )}

      {/* ── Stats Strip ────────────────────────────────────────────────── */}
      <AdminStatsCards items={statsItems} columns={4} />

      {/* ── Main Tab Navigation ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab("partners")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer",
            activeTab === "partners"
              ? "border-orange-500 text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          )}
        >
          <Users2 className="h-4 w-4 text-orange-400" />
          <span>فهرست همکاران ({toPersianDigits(stats.partners.total)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("commissions")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer",
            activeTab === "commissions"
              ? "border-orange-500 text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          )}
        >
          <Coins className="h-4 w-4 text-purple-400" />
          <span>پورسانت‌ها و تسویه‌حساب‌ها ({toPersianDigits(stats.commissions.total)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer",
            activeTab === "settings"
              ? "border-orange-500 text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          )}
        >
          <Settings className="h-4 w-4 text-emerald-400" />
          <span>تنظیمات عمومی همکاری</span>
        </button>
      </div>

      {/* ── TAB 1: Partners List ───────────────────────────────────────── */}
      {activeTab === "partners" && (
        <div className="space-y-4 animate-fade-in">
          <AdminFilterToolbar
            searchQuery={partnerSearchInput}
            onSearchChange={setPartnerSearchInput}
            searchPlaceholder="جستجو بر اساس نام، شماره موبایل یا کد همکار (PRT-...)"
            statusTabs={partnerStatusTabs}
            activeStatusTab={partnerStatusFilter}
            onStatusTabChange={(tabId) => {
              setPartnerStatusFilter(tabId);
              setPartnersPage(1);
            }}
          />

          <AdminDataView
            data={partners}
            columns={partnerColumns}
            keyExtractor={(item) => item.id}
            isLoading={isLoadingPartners}
            onRowClick={(row) => {
              setSelectedPartnerForDrawer(row);
              setIsDrawerOpen(true);
            }}
            defaultViewMode="cards"
            allowedViewModes={["cards", "table"]}
            showViewModeToggle={true}
            storageKey="admin_affiliates_partners_view_mode"
            cardRenderer={renderPartnerCard}
            currentPage={partnersPage}
            pageSize={partnersPageSize}
            totalItems={partnersTotal}
            onPageChange={(page) => setPartnersPage(page)}
            onPageSizeChange={(size) => {
              setPartnersPageSize(size);
              setPartnersPage(1);
            }}
            emptyMessage="هیچ همکاری با این مشخصات یافت نشد"
            emptySubtitle="می‌توانید عبارت جستجو را تغییر دهید یا از دکمه «ثبت همکار جدید» استفاده کنید."
          />
        </div>
      )}

      {/* ── TAB 2: Commissions & Payouts ───────────────────────────────── */}
      {activeTab === "commissions" && (
        <div className="space-y-6 animate-fade-in">
          {/* Commissions Section */}
          <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Coins className="h-4 w-4 text-purple-400" />
                  <span>تراکنش‌های پورسانت خطوط اینترنت و IP استاتیک</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  پورسانت‌های تولیدشده به صورت خطی به ازای هر واحد سفارش ثبت می‌شوند.
                </p>
              </div>

              {/* Status and Type filter pills */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={commissionProductTypeFilter}
                  onChange={(e) => {
                    setCommissionProductTypeFilter(e.target.value);
                    setCommissionsPage(1);
                  }}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">همه انواع محصول</option>
                  <option value="INTERNET">سرویس اینترنت</option>
                  <option value="STATIC_IP">IP استاتیک</option>
                </select>

                <select
                  value={commissionStatusFilter}
                  onChange={(e) => {
                    setCommissionStatusFilter(e.target.value);
                    setCommissionsPage(1);
                  }}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">همه وضعیت‌ها</option>
                  <option value="PENDING">در انتظار</option>
                  <option value="APPROVED">تاییدشده</option>
                  <option value="READY_FOR_PAYMENT">آماده تسویه</option>
                  <option value="PAID">پرداخت‌شده</option>
                  <option value="CANCELLED">لغوشده</option>
                </select>
              </div>
            </div>

            <AdminDataView
              data={commissions}
              columns={commissionColumns}
              keyExtractor={(item) => item.id}
              isLoading={isLoadingCommissions}
              currentPage={commissionsPage}
              pageSize={commissionsPageSize}
              totalItems={commissionsTotal}
              onPageChange={(page) => setCommissionsPage(page)}
              onPageSizeChange={(size) => {
                setCommissionsPageSize(size);
                setCommissionsPage(1);
              }}
              emptyMessage="هیچ پورسانتی در این فیلتر ثبت نشده است"
            />
          </div>

          {/* Payouts History Section */}
          <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <span>سوابق تسویه‌حساب‌ها و حواله‌های بانکی (ساتنا / پایا)</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  گزارش پرداخت‌های قطعی پورسانت به حساب‌های بانکی همکاران
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setSelectedPartnerIdForPayout(undefined);
                  setIsPayoutModalOpen(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ثبت واریزی جدید</span>
              </Button>
            </div>

            <AdminDataView
              data={payouts}
              columns={payoutColumns}
              keyExtractor={(pay) => pay.id}
              isLoading={isLoadingPayouts}
              currentPage={payoutsPage}
              pageSize={payoutsPageSize}
              totalItems={payoutsTotal}
              onPageChange={(page) => setPayoutsPage(page)}
              onPageSizeChange={(size) => {
                setPayoutsPageSize(size);
                setPayoutsPage(1);
              }}
              emptyMessage="هنوز پرداختی ثبت نشده است."
              emptySubtitle="واریزی‌های ثبت‌شده در این بخش نمایش داده می‌شوند."
            />
          </div>
        </div>
      )}

      {/* ── TAB 3: Global Settings ─────────────────────────────────────── */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl animate-fade-in">
          {settingsFeedback && (
            <div
              className={cn(
                "p-3.5 rounded-xl border text-xs flex items-center gap-2",
                settingsFeedback.type === "success"
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/50 border-red-500/40 text-red-300"
              )}
            >
              {settingsFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              )}
              <span>{settingsFeedback.text}</span>
            </div>
          )}

          {/* Master Toggles Card */}
          <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-5 space-y-4">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Settings className="h-4 w-4 text-orange-400" />
              <span>کلیدهای فعال‌سازی عمومی سیستم همکاری</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60">
                <div>
                  <span className="text-xs font-bold text-white block">کل سیستم همکاری در فروش</span>
                  <span className="text-[10px] text-neutral-400">فعال بودن ماژول همکاران و پورسانت‌دهی</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      isAffiliateSystemEnabled: !prev.isAffiliateSystemEnabled,
                    }))
                  }
                  className="cursor-pointer"
                >
                  {settingsForm.isAffiliateSystemEnabled ? (
                    <ToggleRight className="h-7 w-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-neutral-600" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60">
                <div>
                  <span className="text-xs font-bold text-white block">قانون تخفیف محصولات</span>
                  <span className="text-[10px] text-neutral-400">اعمال درصد تخفیف همکاری روی کالاها</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      isProductDiscountEnabled: !prev.isProductDiscountEnabled,
                    }))
                  }
                  className="cursor-pointer"
                >
                  {settingsForm.isProductDiscountEnabled ? (
                    <ToggleRight className="h-7 w-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-neutral-600" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60">
                <div>
                  <span className="text-xs font-bold text-white block">پورسانت IP استاتیک</span>
                  <span className="text-[10px] text-neutral-400">محاسبه پورسانت ثابت به ازای هر واحد IP</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      isStaticIpCommissionEnabled: !prev.isStaticIpCommissionEnabled,
                    }))
                  }
                  className="cursor-pointer"
                >
                  {settingsForm.isStaticIpCommissionEnabled ? (
                    <ToggleRight className="h-7 w-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-neutral-600" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60">
                <div>
                  <span className="text-xs font-bold text-white block">پورسانت سرویس اینترنت</span>
                  <span className="text-[10px] text-neutral-400">محاسبه پورسانت به ازای هر خط سرویس فعال</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      isInternetCommissionEnabled: !prev.isInternetCommissionEnabled,
                    }))
                  }
                  className="cursor-pointer"
                >
                  {settingsForm.isInternetCommissionEnabled ? (
                    <ToggleRight className="h-7 w-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-neutral-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Default Rates Card */}
          <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-5 space-y-4">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-400" />
              <span>مقادیر پیش‌فرض عمومی (برای همکاران بدون نرخ سفارشی)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Discount % */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-bold block">درصد تخفیف پیش‌فرض محصولات</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={settingsForm.defaultDiscountPercent}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        defaultDiscountPercent: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="bg-neutral-900 border-neutral-800 text-white font-black text-sm h-11 pl-12 pr-3"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                    درصد (٪)
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 block">
                  پیش‌فرض اولیه: ۸٪ | فقط روی کالا‌های بدون تخفیف دیگر اعمال می‌شود.
                </span>
              </div>

              {/* Static IP Commission */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-bold block">پورسانت پیش‌فرض هر واحد IP استاتیک</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="10000"
                    min="0"
                    value={settingsForm.defaultStaticIpCommission}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        defaultStaticIpCommission: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="bg-neutral-900 border-neutral-800 text-white font-black text-sm h-11 pl-16 pr-3"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                    تومان
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 block">
                  پیش‌فرض اولیه: ۱۵۰,۰۰۰ تومان | با تعداد واحدها ضرب می‌شود.
                </span>
              </div>

              {/* Internet Commission */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-bold block">پورسانت پیش‌فرض هر خط اینترنت</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="10000"
                    min="0"
                    value={settingsForm.defaultInternetCommission}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({
                        ...prev,
                        defaultInternetCommission: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="bg-neutral-900 border-neutral-800 text-white font-black text-sm h-11 pl-16 pr-3"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                    تومان
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 block">
                  پیش‌فرض اولیه: ۴۰۰,۰۰۰ تومان | به عنوان درآمد همکار منظور می‌گردد.
                </span>
              </div>
            </div>
          </div>

          {/* Whitelist Filters Card */}
          <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Filter className="h-4 w-4 text-orange-400" />
                  <span>فیلترهای لیست سفید (Whitelist) دسته‌بندی‌ها و کالاها</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  در صورت خالی بودن هر دو لیست، تخفیف همکاری روی تمامی سخت‌افزارهای مجاز اعمال می‌شود. در صورت ثبت شناسه، صرفاً موارد ثبت‌شده مشمول تخفیف خواهند بود.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Eligible Categories */}
              <div className="space-y-3">
                <label className="text-xs text-neutral-300 font-bold block">
                  دسته‌بندی‌های مجاز (Category IDs / Slugs)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="مثلاً: switches یا routers"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                    className="bg-neutral-900 border-neutral-800 text-white text-xs h-10"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCategory}
                    className="shrink-0 text-xs font-bold px-3 h-10 bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    افزودن
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 items-center">
                  {settingsForm.eligibleCategoryIds.length === 0 ? (
                    <span className="text-[11px] text-neutral-500 italic">
                      تمامی دسته‌بندی‌ها مجاز هستند (بدون محدودیت دسته‌بندی).
                    </span>
                  ) : (
                    settingsForm.eligibleCategoryIds.map((catId) => (
                      <span
                        key={catId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-orange-950/40 text-orange-400 border border-orange-500/30"
                      >
                        <span>{catId}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(catId)}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Eligible Products */}
              <div className="space-y-3">
                <label className="text-xs text-neutral-300 font-bold block">
                  کالاهای مجاز اختصاصی (Product IDs)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="مثلاً: prod-switch-c2960"
                    value={newProductInput}
                    onChange={(e) => setNewProductInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddProduct();
                      }
                    }}
                    className="bg-neutral-900 border-neutral-800 text-white text-xs h-10"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddProduct}
                    className="shrink-0 text-xs font-bold px-3 h-10 bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    افزودن
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg bg-neutral-900/60 border border-neutral-800/60 items-center">
                  {settingsForm.eligibleProductIds.length === 0 ? (
                    <span className="text-[11px] text-neutral-500 italic">
                      تمامی محصولات سخت‌افزاری مجاز هستند (بدون محدودیت کالا).
                    </span>
                  ) : (
                    settingsForm.eligibleProductIds.map((prodId) => (
                      <span
                        key={prodId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                      >
                        <span>{prodId}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(prodId)}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Business Rules Info Box */}
          <div className="rounded-2xl border border-neutral-800 bg-[#16161c] p-4 text-xs text-neutral-400 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>قوانین اولویت و ضوابط حاکم بر سیستم همکاری</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-neutral-300">
              <li>
                <strong>عدم ترکیب با تخفیف‌های عادی:</strong> چنانچه کالایی دارای قیمت خط‌خورده یا تخفیف ویژه باشد، تخفیف همکاری روی آن اعمال نخواهد شد.
              </li>
              <li>
                <strong>عدم ترکیب با تخفیف‌های پلکانی:</strong> در محصولاتی با جدول قیمت پلکانی، تخفیف همکاری محاسبه نمی‌شود.
              </li>
              <li>
                <strong>سرویس‌های اینترنت و IP استاتیک:</strong> مشمول تخفیف برای خریدار نمی‌شوند، بلکه پورسانت قطعی به عنوان عایدی همکار ثبت می‌گردد.
              </li>
              <li>
                <strong>استقلال تنظیمات اختصاصی:</strong> تغییر مقادیر پیش‌فرض این صفحه، نرخ‌های اختصاصی که از قبل برای همکاران خاص ثبت شده‌اند را تغییر نمی‌دهد.
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="lg"
              isLoading={isSavingSettings}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Save className="h-4 w-4" />
              <span>ذخیره تنظیمات عمومی</span>
            </Button>
          </div>
        </form>
      )}

      {/* ── Modals & Drawers ───────────────────────────────────────────── */}
      <PartnerDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        partner={selectedPartnerForDrawer}
        onPartnerUpdated={(updated) => {
          setSelectedPartnerForDrawer(updated);
          loadPartners();
          loadStats();
        }}
        onInitiatePayout={(partner) => {
          setSelectedPartnerIdForPayout(partner.id);
          setIsPayoutModalOpen(true);
        }}
      />

      <NewPartnerModal
        isOpen={isNewPartnerModalOpen}
        onClose={() => setIsNewPartnerModalOpen(false)}
        onPartnerCreated={() => {
          loadPartners();
          loadStats();
        }}
      />

      <NewPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => {
          setIsPayoutModalOpen(false);
          setSelectedPartnerIdForPayout(undefined);
        }}
        partners={partners}
        selectedPartnerId={selectedPartnerIdForPayout}
        onPayoutCreated={() => {
          loadPartners();
          loadPayouts();
          loadCommissions();
          loadStats();
        }}
      />
    </div>
  );
}
