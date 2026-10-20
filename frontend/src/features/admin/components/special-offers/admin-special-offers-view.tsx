"use client";

import * as React from "react";
import {
  Flame,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Power,
  RefreshCw,
  ShoppingBag,
  Percent,
  Calendar,
  Layers,
  Tag,
  ExternalLink,
  ChevronLeft,
  Check,
  Play,
  StopCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits, resolveProductImageUrl } from "@/shared/lib/utils";
import { JalaliDateTimePicker } from "@/shared/components/ui/jalali-datetime-picker";
import { formatPersianDateTime } from "@/shared/lib/jalali";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  AdminStatsCards,
  type AdminStatItem,
  AdminDetailDrawer,
  AdminActionModal,
} from "../shared";
import {
  useAdminSpecialOffers,
  useCreateSpecialOffer,
  useUpdateSpecialOffer,
  useUpdateSpecialOfferStatus,
  useDeleteSpecialOffer,
  useDiscountedProducts,
  useStopActiveSpecialOffer,
  useActivateSpecialOffer,
} from "@/features/special-offers/api/use-special-offers";
import type {
  SpecialOfferCampaign,
  SpecialOfferItemInput,
  CampaignStatus,
  DiscountedCatalogProduct,
} from "@/features/special-offers/types";

// Helper function to format date into Persian/Jalali string
function formatPersianDate(isoDate: string | Date): string {
  return formatPersianDateTime(isoDate);
}

interface SelectedItemRow {
  productId: string;
  productName: string;
  sku?: string;
  imageUrl?: string;
  originalPrice: number;
  calculatedPrice: number;
  discountPercent: number;
  stockQuota: number;
  maxPerOrder: number;
}

export function AdminSpecialOffersView() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Data fetching
  const { data: rawCampaigns = [], isLoading, refetch, isFetching } = useAdminSpecialOffers({
    status: activeTab === "all" ? undefined : activeTab,
    search: searchQuery || undefined,
  });

  // Fetch discounted products from catalog (compareAtPrice > basePrice)
  const { data: discountedProducts = [], isLoading: isLoadingDiscounted } = useDiscountedProducts();

  // Mutations
  const createMutation = useCreateSpecialOffer();
  const updateMutation = useUpdateSpecialOffer();
  const statusMutation = useUpdateSpecialOfferStatus();
  const deleteMutation = useDeleteSpecialOffer();
  const stopActiveMutation = useStopActiveSpecialOffer();
  const activateMutation = useActivateSpecialOffer();

  // Find currently active campaign
  const currentActiveCampaign = React.useMemo(() => {
    const now = new Date();
    return (
      rawCampaigns.find(
        (c) =>
          c.status === "ACTIVE" &&
          new Date(c.startDate) <= now &&
          new Date(c.endDate) >= now
      ) || rawCampaigns.find((c) => c.status === "ACTIVE")
    );
  }, [rawCampaigns]);

  // Drawer & Modal States
  const [selectedCampaign, setSelectedCampaign] = React.useState<SpecialOfferCampaign | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = React.useState(false);

  // Delete Modal
  const [deletingCampaign, setDeletingCampaign] = React.useState<SpecialOfferCampaign | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Stop Confirm Modal
  const [isStopConfirmOpen, setIsStopConfirmOpen] = React.useState(false);

  // Form Modal (Create / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = React.useState("");
  const [formTagline, setFormTagline] = React.useState("تخفیف ویژه زیرساخت و شبکه");
  const [formDescription, setFormDescription] = React.useState("");
  const [formStartDate, setFormStartDate] = React.useState("");
  const [formEndDate, setFormEndDate] = React.useState("");
  const [formItems, setFormItems] = React.useState<SelectedItemRow[]>([]);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormTitle("");
    setFormTagline("تخفیف ویژه زیرساخت و شبکه");
    setFormDescription("تخفیف‌های استثنایی و محدود با ضمانت اصالت کالا و تحویل فوری");

    const now = new Date();
    // Default start from now
    setFormStartDate(new Date(now.getTime() - 60000).toISOString());
    const later = new Date(now.getTime() + 4 * 24 * 3600 * 1000);
    setFormEndDate(later.toISOString());

    // Pre-populate with all discounted products by default
    if (discountedProducts.length > 0) {
      setFormItems(
        discountedProducts.map((p) => ({
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          imageUrl: p.images && p.images.length > 0 ? p.images[0] : undefined,
          originalPrice: p.compareAtPrice,
          calculatedPrice: p.basePrice,
          discountPercent: p.discountPercent,
          stockQuota: p.stock || 10,
          maxPerOrder: 5,
        }))
      );
    } else {
      setFormItems([]);
    }

    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (c: SpecialOfferCampaign) => {
    setEditingId(c.id);
    setFormTitle(c.title);
    setFormTagline(c.tagline || "");
    setFormDescription(c.description || "");

    try {
      setFormStartDate(new Date(c.startDate).toISOString());
      setFormEndDate(new Date(c.endDate).toISOString());
    } catch {
      setFormStartDate(new Date().toISOString());
      setFormEndDate(new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString());
    }

    const mappedItems: SelectedItemRow[] = (c.items || []).map((it) => {
      const discProd = discountedProducts.find((p) => p.id === it.productId);
      const originalPrice = it.originalPrice || discProd?.compareAtPrice || it.product?.basePrice || 0;
      const specialPrice = it.specialPrice || discProd?.basePrice || it.product?.basePrice || 0;
      const discountPercent =
        it.discountPercent ||
        (originalPrice > specialPrice
          ? Math.round(((originalPrice - specialPrice) / originalPrice) * 100)
          : 0);

      return {
        productId: it.productId,
        productName: it.product?.name || discProd?.name || `کالای ${it.productId.slice(0, 8)}`,
        sku: it.product?.sku || discProd?.sku,
        imageUrl: it.product?.images?.[0] || discProd?.images?.[0],
        originalPrice,
        calculatedPrice: specialPrice,
        discountPercent,
        stockQuota: it.stockQuota ?? 10,
        maxPerOrder: it.maxPerOrder ?? 5,
      };
    });

    setFormItems(mappedItems);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Auto pre-populate on create if items empty and discounted products become available
  React.useEffect(() => {
    if (isFormModalOpen && !editingId && formItems.length === 0 && discountedProducts.length > 0) {
      setFormItems(
        discountedProducts.map((p) => ({
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          imageUrl: p.images && p.images.length > 0 ? p.images[0] : undefined,
          originalPrice: p.compareAtPrice,
          calculatedPrice: p.basePrice,
          discountPercent: p.discountPercent,
          stockQuota: p.stock || 10,
          maxPerOrder: 5,
        }))
      );
    }
  }, [isFormModalOpen, editingId, discountedProducts, formItems.length]);

  const handleSelectAllDiscounted = () => {
    setFormItems(
      discountedProducts.map((p) => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        imageUrl: p.images && p.images.length > 0 ? p.images[0] : undefined,
        originalPrice: p.compareAtPrice,
        calculatedPrice: p.basePrice,
        discountPercent: p.discountPercent,
        stockQuota: p.stock || 10,
        maxPerOrder: 5,
      }))
    );
  };

  const handleDeselectAllDiscounted = () => {
    setFormItems([]);
  };

  // Toggle selection of a discounted product in form
  const handleToggleProductSelection = (product: DiscountedCatalogProduct) => {
    setFormItems((prev) => {
      const exists = prev.some((it) => it.productId === product.id);
      if (exists) {
        return prev.filter((it) => it.productId !== product.id);
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          imageUrl: product.images?.[0],
          originalPrice: product.compareAtPrice,
          calculatedPrice: product.basePrice,
          discountPercent: product.discountPercent,
          stockQuota: product.stock || 10,
          maxPerOrder: 5,
        },
      ];
    });
  };

  // Update item field (stockQuota / maxPerOrder only)
  const handleUpdateItemQuota = (
    productId: string,
    field: "stockQuota" | "maxPerOrder",
    value: number
  ) => {
    setFormItems((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, [field]: value } : it))
    );
  };

  // Save Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError("لطفاً عنوان فروش ویژه را وارد کنید.");
      return;
    }
    if (!formStartDate || !formEndDate) {
      setFormError("لطفاً تاریخ شروع و پایان فروش ویژه را وارد کنید.");
      return;
    }
    if (new Date(formStartDate) >= new Date(formEndDate)) {
      setFormError("تاریخ شروع باید قبل از تاریخ پایان باشد.");
      return;
    }
    if (formItems.length === 0) {
      setFormError("حداقل یک محصول دارای تخفیف باید برای این فروش ویژه انتخاب شود.");
      return;
    }

    const payload = {
      title: formTitle.trim(),
      tagline: formTagline.trim() || undefined,
      description: formDescription.trim() || undefined,
      startDate: new Date(formStartDate).toISOString(),
      endDate: new Date(formEndDate).toISOString(),
      status: "ACTIVE" as const,
      items: formItems.map((it, idx) => ({
        productId: it.productId,
        discountType: "PERCENTAGE" as const,
        discountValue: it.discountPercent,
        stockQuota: it.stockQuota ? Number(it.stockQuota) : undefined,
        maxPerOrder: it.maxPerOrder ? Number(it.maxPerOrder) : 5,
        sortOrder: idx + 1,
      })),
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsFormModalOpen(false);
      refetch();
    } catch (err: any) {
      setFormError(err.message || "خطا در ذخیره‌سازی اطلاعات فروش ویژه.");
    }
  };

  // Activate Campaign (Automatically deactivates previous active and sets start date to now)
  const handleActivateCampaign = async (campaign: SpecialOfferCampaign) => {
    try {
      await activateMutation.mutateAsync(campaign.id);
      refetch();
    } catch (err) {
      console.error("Error activating campaign:", err);
    }
  };

  // Stop / Deactivate Active Campaign
  const handleStopActiveCampaign = async () => {
    try {
      await stopActiveMutation.mutateAsync();
      setIsStopConfirmOpen(false);
      refetch();
    } catch (err) {
      console.error("Error stopping active campaign:", err);
    }
  };

  // Delete Campaign
  const handleConfirmDelete = async () => {
    if (!deletingCampaign) return;
    try {
      await deleteMutation.mutateAsync(deletingCampaign.id);
      setIsDeleteModalOpen(false);
      setDeletingCampaign(null);
      if (selectedCampaign?.id === deletingCampaign.id) {
        setIsDetailDrawerOpen(false);
        setSelectedCampaign(null);
      }
      refetch();
    } catch (err) {
      console.error("Error deleting campaign:", err);
    }
  };

  // Stats calculation
  const statsItems: AdminStatItem[] = React.useMemo(() => {
    const total = rawCampaigns.length;
    const active = currentActiveCampaign ? 1 : 0;
    const productsOnSale = currentActiveCampaign?.itemsCount || currentActiveCampaign?.items?.length || 0;
    const scheduled = rawCampaigns.filter((c) => c.computedStatus === "SCHEDULED").length;

    return [
      {
        id: "total_campaigns",
        title: "کل جشنواره‌های ویژه",
        value: `${toPersianDigits(total)} جشنواره`,
        subtitle: "تعریف‌شده در سیستم",
        variant: "orange",
        icon: Flame,
      },
      {
        id: "active_campaigns",
        title: "فروش ویژه فعال جاری",
        value: currentActiveCampaign ? "۱ در حال اجرا" : "متوقف / غیرفعال",
        subtitle: currentActiveCampaign ? currentActiveCampaign.title : "هیچ کمپینی فعال نیست",
        variant: currentActiveCampaign ? "emerald" : "amber",
        icon: CheckCircle2,
      },
      {
        id: "products_on_sale",
        title: "کالاهای تخفیف‌دار در حال حراج",
        value: `${toPersianDigits(productsOnSale)} قلم کالا`,
        subtitle: "منتشرشده در صفحه اصلی",
        variant: "sky",
        icon: ShoppingBag,
      },
      {
        id: "discounted_catalog",
        title: "کالاهای دارای تخفیف کاتالوگ",
        value: `${toPersianDigits(discountedProducts.length)} محصول`,
        subtitle: "آماده برای انتخاب در فروش ویژه",
        variant: "purple",
        icon: Percent,
      },
    ];
  }, [rawCampaigns, currentActiveCampaign, discountedProducts]);

  // Status Tabs
  const statusTabs = React.useMemo(() => {
    const counts = {
      all: rawCampaigns.length,
      active: rawCampaigns.filter((c) => c.computedStatus === "ACTIVE").length,
      scheduled: rawCampaigns.filter((c) => c.computedStatus === "SCHEDULED").length,
      expired: rawCampaigns.filter((c) => c.computedStatus === "EXPIRED").length,
      inactive: rawCampaigns.filter((c) => c.status === "INACTIVE").length,
    };

    return [
      { id: "all", label: "همه کمپین‌ها", count: counts.all, badgeVariant: "default" as const },
      { id: "active", label: "فعال در فروشگاه", count: counts.active, badgeVariant: "emerald" as const },
      { id: "scheduled", label: "زمان‌بندی‌شده", count: counts.scheduled, badgeVariant: "sky" as const },
      { id: "expired", label: "پایان‌یافته", count: counts.expired, badgeVariant: "default" as const },
      { id: "inactive", label: "غیرفعال / متوقف‌شده", count: counts.inactive, badgeVariant: "orange" as const },
    ];
  }, [rawCampaigns]);

  // Table Columns (No Priority, No Duplicate Published Column)
  const columns: AdminColumnDef<SpecialOfferCampaign>[] = [
    {
      key: "title",
      header: "عنوان و مشخصات جشنواره",
      cell: (row) => (
        <div className="flex items-center gap-3 text-right">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-950/30 text-orange-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-neutral-100 flex items-center gap-2">
              <span>{row.title}</span>
              {row.id === currentActiveCampaign?.id && (
                <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40 animate-pulse">
                  در حال نمایش
                </span>
              )}
            </div>
            {row.tagline && (
              <p className="text-xs text-neutral-400 line-clamp-1">{row.tagline}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "وضعیت اجرا",
      cell: (row) => {
        const s = row.computedStatus;
        if (s === "ACTIVE") {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              فعال و جاری
            </span>
          );
        }
        if (s === "SCHEDULED") {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/40 px-2.5 py-1 text-xs font-semibold text-sky-400">
              <Clock className="h-3 w-3" />
              زمان‌بندی‌شده
            </span>
          );
        }
        if (s === "EXPIRED") {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800/60 px-2.5 py-1 text-xs font-medium text-neutral-400">
              پایان‌یافته
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-850 px-2.5 py-1 text-xs font-medium text-neutral-400">
            متوقف / غیرفعال
          </span>
        );
      },
    },
    {
      key: "itemsCount",
      header: "تعداد کالاها",
      cell: (row) => (
        <span className="font-semibold text-neutral-200">
          {toPersianDigits(row.itemsCount || row.items?.length || 0)} کالا
        </span>
      ),
    },
    {
      key: "dates",
      header: "بازه اعتبار فروش ویژه",
      hideOnMobile: true,
      cell: (row) => (
        <div className="text-xs text-neutral-300 space-y-0.5 text-right">
          <div>از: {formatPersianDate(row.startDate)}</div>
          <div className="text-neutral-400">تا: {formatPersianDate(row.endDate)}</div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      cell: (row) => {
        const isActive = row.status === "ACTIVE";
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Quick view drawer */}
            <button
              type="button"
              onClick={() => {
                setSelectedCampaign(row);
                setIsDetailDrawerOpen(true);
              }}
              title="مشاهده جزئیات و کالاهای فروش ویژه"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-orange-500/40 hover:text-orange-400 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => handleOpenEditModal(row)}
              title="ویرایش جشنواره"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-sky-500/40 hover:text-sky-400 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>

            {/* One-click Activate / Deactivate */}
            {isActive ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedCampaign(row);
                  setIsStopConfirmOpen(true);
                }}
                title="توقف و غیرفعال‌سازی این فروش ویژه"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-white transition-all shadow-sm"
              >
                <Power className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleActivateCampaign(row)}
                title="فعال‌سازی فوری (جایگزین کمپین قبلی شده و زمان شروع به اکنون تغییر می‌یابد)"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/50 hover:text-white transition-all shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </button>
            )}

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                setDeletingCampaign(row);
                setIsDeleteModalOpen(true);
              }}
              title="حذف"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-red-500/40 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Top Header with Emergency Stop Button ──────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/30 bg-orange-950/40 text-orange-400 shadow-md shadow-orange-950/20">
              <Flame className="h-5 w-5 fill-current" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              مدیریت فروش‌های ویژه و جشنواره‌ها
            </h1>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-400">
            انتخاب کالاها از میان محصولات دارای تخفیف کاتالوگ و نمایش خودکار بر اساس زمان‌بندی
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
          >
            <RefreshCw className={`h-4 w-4 ml-1.5 ${isFetching ? "animate-spin" : ""}`} />
            به‌روزرسانی
          </Button>

          {/* Dedicated Deactivate / Stop Button */}
          {currentActiveCampaign ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setIsStopConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-950/40 flex items-center gap-1.5"
            >
              <StopCircle className="h-4 w-4 ml-1" />
              توقف و غیرفعال‌سازی فروش ویژه
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-neutral-600" />
              هیچ فروش ویژه‌ای در حال اجرا نیست
            </span>
          )}

          {/* Create Button */}
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-lg shadow-orange-950/40"
          >
            <Plus className="h-4 w-4 ml-1.5" />
            فروش ویژه جدید
          </Button>
        </div>
      </div>

      {/* ── Active Campaign Notice Banner ──────────────────────────────────── */}
      {currentActiveCampaign && (
        <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/30 via-neutral-900/60 to-neutral-900/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 shrink-0 rounded-full bg-orange-500 animate-ping" />
            <div>
              <span className="font-bold text-white text-sm">
                جشنواره جاری: {currentActiveCampaign.title}
              </span>
              <span className="text-neutral-400 block sm:inline sm:mr-2">
                (معتبر تا {formatPersianDate(currentActiveCampaign.endDate)})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-orange-400 font-semibold">
              {toPersianDigits(currentActiveCampaign.items?.length || 0)} کالا در حال نمایش در صفحه اصلی
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStopConfirmOpen(true)}
              className="border-red-500/40 bg-red-950/20 text-red-300 hover:bg-red-900/40 text-xs h-8"
            >
              متوقف کردن
            </Button>
          </div>
        </div>
      )}

      {/* ── Stats Grid ────────────────────────────────────────────────────── */}
      <AdminStatsCards items={statsItems} columns={4} />

      {/* ── Filter Toolbar ────────────────────────────────────────────────── */}
      <AdminFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="جستجو در نام جشنواره یا تجهیزات..."
        statusTabs={statusTabs}
        activeStatusTab={activeTab}
        onStatusTabChange={setActiveTab}
      />

      {/* ── Main Data Table ───────────────────────────────────────────────── */}
      <AdminDataTable
        data={rawCampaigns}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="هیچ فروش ویژه‌ای یافت نشد."
        emptySubtitle="می‌توانید با دکمه «فروش ویژه جدید» یک جشنواره جدید بر اساس کالاهای تخفیف‌دار تعریف کنید."
        onRowClick={(row) => {
          setSelectedCampaign(row);
          setIsDetailDrawerOpen(true);
        }}
      />

      {/* ── Detail Drawer ─────────────────────────────────────────────────── */}
      {selectedCampaign && (
        <AdminDetailDrawer
          isOpen={isDetailDrawerOpen}
          onClose={() => {
            setIsDetailDrawerOpen(false);
            setSelectedCampaign(null);
          }}
          title={selectedCampaign.title}
          subtitle={`شناسه: ${selectedCampaign.id}`}
          badge={
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                selectedCampaign.computedStatus === "ACTIVE"
                  ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                  : selectedCampaign.computedStatus === "SCHEDULED"
                  ? "border-sky-500/30 bg-sky-950/40 text-sky-400"
                  : selectedCampaign.computedStatus === "EXPIRED"
                  ? "border-neutral-700 bg-neutral-800 text-neutral-400"
                  : "border-neutral-700 bg-neutral-850 text-neutral-400"
              }`}
            >
              {selectedCampaign.computedStatus === "ACTIVE"
                ? "فعال در فروشگاه"
                : selectedCampaign.computedStatus === "SCHEDULED"
                ? "زمان‌بندی‌شده"
                : selectedCampaign.computedStatus === "EXPIRED"
                ? "پایان‌یافته"
                : "غیرفعال"}
            </span>
          }
          footer={
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setDeletingCampaign(selectedCampaign);
                  setIsDeleteModalOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 ml-1.5" />
                حذف
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  handleOpenEditModal(selectedCampaign);
                }}
                className="border-neutral-800 bg-neutral-900 text-neutral-200"
              >
                <Pencil className="h-4 w-4 ml-1.5" />
                ویرایش اطلاعات
              </Button>
            </div>
          }
        >
          <div className="space-y-6 text-right">
            {/* Tagline & Description */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
              <div className="text-xs text-neutral-400">شعار تبلیغاتی:</div>
              <div className="font-bold text-orange-400 text-sm">
                {selectedCampaign.tagline || "—"}
              </div>
              {selectedCampaign.description && (
                <p className="text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/80 pt-2 mt-2">
                  {selectedCampaign.description}
                </p>
              )}
            </div>

            {/* Time window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 space-y-1">
                <span className="text-neutral-500">زمان شروع:</span>
                <div className="font-bold text-neutral-200">
                  {formatPersianDate(selectedCampaign.startDate)}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 space-y-1">
                <span className="text-neutral-500">زمان پایان:</span>
                <div className="font-bold text-neutral-200">
                  {formatPersianDate(selectedCampaign.endDate)}
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-orange-400" />
                <span>کالاهای مشمول فروش ویژه ({toPersianDigits(selectedCampaign.items?.length || 0)})</span>
              </h4>

              <div className="space-y-2.5">
                {(selectedCampaign.items || []).map((it) => {
                  const p = it.product;
                  const originalPrice = it.originalPrice || Number(p?.basePrice) || 0;
                  const specialPrice = it.specialPrice;
                  const discountPercent =
                    it.discountPercent ||
                    (originalPrice > specialPrice
                      ? Math.round(((originalPrice - specialPrice) / originalPrice) * 100)
                      : 0);

                  return (
                    <div
                      key={it.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-neutral-100">
                            {p?.name || `کالای ${it.productId.slice(0, 8)}`}
                          </div>
                          {p?.brand && (
                            <span className="text-[11px] text-neutral-400">برند: {p.brand}</span>
                          )}
                        </div>

                        <div className="rounded-full bg-red-950/60 border border-red-500/30 px-2 py-0.5 text-xs font-black text-red-400">
                          {toPersianDigits(discountPercent)}٪ تخفیف
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/60">
                        <div className="text-neutral-500">
                          قیمت اصلی: <span className="line-through">{formatPrice(originalPrice)}</span>
                        </div>
                        <div className="font-bold text-orange-400">
                          قیمت ویژه: {formatPrice(specialPrice)}
                        </div>
                      </div>

                      {/* Capacity & Quota Breakdown */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/40">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-neutral-500">
                            سقف حراج: <span className="text-neutral-300 font-semibold">{it.stockQuota ? `${toPersianDigits(it.stockQuota)} عدد` : "نامحدود"}</span>
                          </span>
                          <span className="text-neutral-600">•</span>
                          <span className="text-neutral-500">
                            فروخته‌شده: <span className="text-neutral-300 font-semibold">{toPersianDigits(it.stockSold || 0)}</span>
                          </span>
                        </div>
                        {((it.stockQuota !== null && it.stockQuota !== undefined && (it.stockSold || 0) >= it.stockQuota) || it.stockRemaining <= 0) ? (
                          <span className="rounded-full bg-red-950/80 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold text-red-400">
                            تکمیل ظرفیت (مخفی در سایت)
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            در حال فروش ({toPersianDigits(it.stockRemaining)} باقی‌مانده)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </AdminDetailDrawer>
      )}

      {/* ── Create / Edit Campaign Modal ──────────────────────────────────── */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div
            className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-[#121215] p-5 sm:p-7 shadow-2xl my-8 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span>{editingId ? "ویرایش فروش ویژه" : "ایجاد فروش ویژه جدید"}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  تخفیف کالاها مستقیماً از کاتالوگ فروشگاه خوانده شده و تنها محصولات دارای تخفیف قابل انتخاب هستند.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Basic Info: Title & Tagline & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    عنوان فروش ویژه <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="مثال: فروش ویژه تجهیزات شبکه"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    شعار بالای عنوان (تگ‌لاین)
                  </label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="مثال: تخفیف ویژه زیرساخت و شبکه"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-neutral-300">توضیحات و پیام تبلیغاتی</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="توضیحاتی برای خریداران درباره شرایط گارانتی یا تخفیف ویژه..."
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                {/* Shamsi Dates Section (Start & End) */}
                <div className="sm:col-span-2 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-400" />
                      <span className="text-xs font-bold text-neutral-200">
                        زمان‌بندی و بازه اعتبار کمپین (تقویم هجری شمسی)
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      محاسبه خودکار بر اساس افق تهران
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <JalaliDateTimePicker
                      label="تاریخ و ساعت شروع (شمسی)"
                      required
                      value={formStartDate}
                      onChange={(iso) => setFormStartDate(iso)}
                      helperText="لحظه آغاز تخفیف و نمایش در ویترین فروش ویژه"
                    />

                    <JalaliDateTimePicker
                      label="تاریخ و ساعت پایان (شمسی)"
                      required
                      value={formEndDate}
                      onChange={(iso) => setFormEndDate(iso)}
                      helperText="پایان مهلت فروش ویژه و بازگشت به قیمت اصلی کاتالوگ"
                    />
                  </div>
                </div>
              </div>

              {/* ── Selection of Already Discounted Products ─────────────────────── */}
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-orange-400" />
                      <span>انتخاب از میان محصولات دارای تخفیف کاتالوگ فروشگاه</span>
                    </label>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      محصولاتی که در کاتالوگ دارای قیمت تخفیف‌دار و خط‌خورده هستند، در زیر لیست شده‌اند:
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {discountedProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={formItems.length === discountedProducts.length ? handleDeselectAllDiscounted : handleSelectAllDiscounted}
                        className="text-[11px] text-orange-400 hover:text-orange-300 underline font-medium"
                      >
                        {formItems.length === discountedProducts.length
                          ? "لغو انتخاب همه"
                          : `انتخاب همه (${toPersianDigits(discountedProducts.length)} محصول)`}
                      </button>
                    )}
                    <span className="text-xs text-orange-400 font-bold bg-orange-950/40 border border-orange-500/20 px-2.5 py-1 rounded-lg">
                      {toPersianDigits(formItems.length)} کالا انتخاب شده
                    </span>
                  </div>
                </div>

                {isLoadingDiscounted ? (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center text-xs text-neutral-400 animate-pulse">
                    در حال بارگذاری لیست محصولات تخفیف‌دار از کاتالوگ...
                  </div>
                ) : discountedProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-center text-xs text-neutral-400 space-y-1">
                    <p className="font-semibold text-neutral-300">هیچ محصول دارای تخفیفی در کاتالوگ فروشگاه یافت نشد.</p>
                    <p className="text-neutral-500">
                      برای نمایش در فروش ویژه، ابتدا قیمت خط‌خورده (compareAtPrice) محصولات را در بخش مدیریت کاتالوگ ثبت نمایید.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {discountedProducts.map((p) => {
                      const isSelected = formItems.some((it) => it.productId === p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleProductSelection(p)}
                          className={`cursor-pointer rounded-xl border p-2.5 transition-all flex flex-col justify-between gap-2 ${
                            isSelected
                              ? "border-orange-500 bg-orange-950/30 shadow-md shadow-orange-950/20"
                              : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="font-bold text-xs text-neutral-200 line-clamp-1">
                                {p.name}
                              </div>
                              {p.sku && (
                                <div className="text-[10px] text-neutral-500 font-mono">
                                  {p.sku}
                                </div>
                              )}
                            </div>
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                isSelected
                                  ? "border-orange-500 bg-orange-600 text-white"
                                  : "border-neutral-700 bg-neutral-800 text-transparent"
                              }`}
                            >
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-neutral-800/80">
                            <span className="line-through text-neutral-500 text-[10px]">
                              {formatPrice(p.compareAtPrice)}
                            </span>
                            <span className="font-bold text-emerald-400">
                              {formatPrice(p.basePrice)}
                            </span>
                            <span className="rounded bg-red-950/80 px-1.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
                              {toPersianDigits(p.discountPercent)}٪
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selected Items Quota Configuration */}
                {formItems.length > 0 && (
                  <div className="pt-3 border-t border-neutral-800 space-y-2">
                    <span className="text-xs font-semibold text-neutral-300 block">
                      تنظیم سقف موجودی برای کالاهای انتخاب‌شده:
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {formItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-neutral-200 block truncate">
                              {item.productName}
                            </span>
                            <span className="text-[11px] text-emerald-400 font-medium">
                              قیمت ویژه: {formatPrice(item.calculatedPrice)} (تخفیف {toPersianDigits(item.discountPercent)}٪)
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="text-neutral-500 text-[11px]">سقف حراج:</span>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={item.stockQuota}
                                onChange={(e) =>
                                  handleUpdateItemQuota(
                                    item.productId,
                                    "stockQuota",
                                    Number(e.target.value) || 1
                                  )
                                }
                                className="w-16 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-200 focus:outline-none text-center"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setFormItems((prev) => prev.filter((it) => it.productId !== item.productId))
                              }
                              className="text-neutral-500 hover:text-red-400 p-1"
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormModalOpen(false)}
                  className="border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                >
                  انصراف
                </Button>

                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin ml-1.5" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 ml-1.5" />
                  )}
                  {editingId ? "ذخیره تغییرات" : "ایجاد و انتشار فروش ویژه"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Emergency Stop Confirmation Modal ─────────────────────────────── */}
      <AdminActionModal
        isOpen={isStopConfirmOpen}
        onClose={() => setIsStopConfirmOpen(false)}
        onConfirm={handleStopActiveCampaign}
        title="توقف و غیرفعال‌سازی فروش ویژه"
        description="آیا اطمینان دارید که می‌خواهید فروش ویژه فعال جاری را متوقف کنید؟ پس از توقف، بخش فروش ویژه در صفحه اصلی متوقف و پنهان خواهد شد و تخفیف‌ها غیرفعال می‌شوند."
        confirmLabel="بله، فروش ویژه متوقف شود"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={stopActiveMutation.isPending}
      />

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <AdminActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCampaign(null);
        }}
        onConfirm={handleConfirmDelete}
        title="حذف جشنواره فروش ویژه"
        description={`آیا از حذف دائم جشنواره «${deletingCampaign?.title || ""}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.`}
        confirmLabel="حذف دائم"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
