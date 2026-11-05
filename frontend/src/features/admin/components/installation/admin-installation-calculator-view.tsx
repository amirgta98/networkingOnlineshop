"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calculator,
  Sliders,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Save,
  X,
  AlertCircle,
  HelpCircle,
  Clock,
  Users,
  Settings,
  ArrowDownLeft,
  ChevronDown,
  Tag,
  Check,
  Loader2,
  DollarSign,
  Radio,
  ToggleLeft,
  PlusCircle,
  MinusCircle,
  Flame,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn, toPersianDigits, formatPrice } from "@/shared/lib/utils";
import type {
  CalculatorItem,
  CalculatorSettings,
  CalculatorFieldType,
  PricingType,
  StoreProductSearchResult,
  CalculatorOption,
} from "@/features/installation/types";
import { installationApi } from "@/features/installation/api/installation-api";

const SERVICE_CATEGORIES = [
  { id: "cabling", label: "کابل‌کشی و پسیو شبکه" },
  { id: "cctv", label: "دوربین مداربسته (CCTV)" },
  { id: "datacenter", label: "آرایش رک و دیتاسنتر" },
  { id: "wireless", label: "شبکه بی‌سیم و وای‌فای" },
  { id: "fiber", label: "فیبر نوری و فیوژن" },
  { id: "switching", label: "سوئیچینگ و روتینگ" },
  { id: "ups-power", label: "برق و یو‌پی‌اس" },
  { id: "general", label: "عمومی / متفرقه" },
];

const COLOR_OPTIONS = [
  { id: "orange", label: "نارنجی", bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" },
  { id: "sky", label: "آبی آسمانی", bg: "bg-sky-500", text: "text-sky-400", border: "border-sky-500/30" },
  { id: "emerald", label: "سبز زمردی", bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30" },
  { id: "amber", label: "کهربایی / طلایی", bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30" },
  { id: "purple", label: "بنفش سازمانی", bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/30" },
];

export function AdminInstallationCalculatorView() {
  const [items, setItems] = React.useState<CalculatorItem[]>([]);
  const [settings, setSettings] = React.useState<CalculatorSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"list" | "preview">("list");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Partial<CalculatorItem> | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);

  // Status message
  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Live preview interactive values
  const [previewValues, setPreviewValues] = React.useState<Record<string, any>>({});

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await installationApi.getAdminCalculatorConfig();
      setItems(res.items || []);
      setSettings(res.settings || null);

      // Initialize preview values
      const initialVals: Record<string, any> = {};
      (res.items || []).forEach((item) => {
        if (item.fieldType === "CHECKBOX") {
          initialVals[item.id] = item.defaultChecked ?? false;
        } else if (item.fieldType === "OPTIONS") {
          initialVals[item.id] = item.defaultOptionId || item.options?.[0]?.id || "";
        } else {
          initialVals[item.id] = item.defaultValue ?? item.min ?? 0;
        }
      });
      setPreviewValues(initialVals);
    } catch (err: any) {
      console.error("Failed to load calculator config:", err);
      showToast("خطا در بارگذاری تنظیمات محاسبه‌گر", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle reordering
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const orderedIds = newItems.map((i) => i.id);
    setItems(newItems);

    try {
      await installationApi.reorderCalculatorItems(orderedIds);
      showToast("ترتیب نمایش نیازمندی‌ها با موفقیت ذخیره شد.");
    } catch (err: any) {
      showToast("خطا در جابجایی ترتیب نمایش", "error");
      loadData();
    }
  };

  // Toggle active status
  const handleToggleActive = async (item: CalculatorItem) => {
    try {
      const updated = await installationApi.updateCalculatorItem(item.id, {
        isActive: !item.isActive,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      showToast(updated.isActive ? `نیازمندی "${item.title}" فعال شد.` : `نیازمندی "${item.title}" غیرفعال شد.`);
    } catch (err: any) {
      showToast("خطا در تغییر وضعیت نیازمندی", "error");
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string, title: string) => {
    if (!window.confirm(`آیا از حذف نیازمندی "${title}" اطمینان دارید؟`)) return;

    try {
      await installationApi.deleteCalculatorItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast(`نیازمندی "${title}" با موفقیت حذف گردید.`);
    } catch (err: any) {
      showToast("خطا در حذف نیازمندی", "error");
    }
  };

  // Reset to factory defaults
  const handleResetDefaults = async () => {
    try {
      const res = await installationApi.resetCalculatorItems();
      setItems(res.items);
      setSettings(res.settings);
      setIsResetConfirmOpen(false);
      showToast("محاسبه‌گر به مقادیر پیش‌فرض بازنشانی گردید.");
    } catch (err: any) {
      showToast("خطا در بازنشانی محاسبه‌گر", "error");
    }
  };

  // Open modal for new item
  const handleOpenNewModal = () => {
    setEditingItem({
      id: `calc-item-${Date.now()}`,
      title: "",
      description: "",
      fieldType: "SLIDER",
      serviceCategory: "cabling",
      order: items.length + 1,
      isActive: true,
      min: 0,
      max: 100,
      step: 1,
      defaultValue: 10,
      unit: "عدد",
      color: "orange",
      markers: [
        { value: 0, label: "حداقل" },
        { value: 50, label: "متوسط" },
        { value: 100, label: "حداکثر" },
      ],
      pricingType: "MANUAL",
      unitPrice: 150000,
      workHoursPerUnit: 1.0,
      options: [],
      defaultChecked: false,
    });
    setIsEditModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (item: CalculatorItem) => {
    setEditingItem(JSON.parse(JSON.stringify(item)));
    setIsEditModalOpen(true);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.serviceCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate live preview metrics
  const previewCalculation = React.useMemo(() => {
    let rawCost = 0;
    let totalWorkUnits = 0;

    items.forEach((item) => {
      if (!item.isActive) return;

      const val = previewValues[item.id];

      if (item.fieldType === "SLIDER" || item.fieldType === "STEPPER") {
        const qty = Number(val || 0);
        const price = Number(item.effectiveUnitPrice || item.unitPrice || 0);
        rawCost += qty * price;
        totalWorkUnits += qty * (item.workHoursPerUnit || 0);
      } else if (item.fieldType === "OPTIONS") {
        const selectedOpt = item.options?.find((o) => o.id === val);
        if (selectedOpt) {
          const optPrice = Number(selectedOpt.linkedProductPrice || selectedOpt.unitPrice || 0);
          rawCost += optPrice;
        }
      } else if (item.fieldType === "CHECKBOX") {
        if (val) {
          const checkPrice = Number(item.effectiveUnitPrice || item.unitPrice || 0);
          rawCost += checkPrice;
          totalWorkUnits += item.workHoursPerUnit || 0;
        }
      }
    });

    const spreadMin = settings?.spreadMinPercent || 0.92;
    const spreadMax = settings?.spreadMaxPercent || 1.1;
    const roundTo = settings?.roundToNearest || 50000;

    const minCost = Math.max(
      settings?.minProjectCost || 0,
      Math.round((rawCost * spreadMin) / roundTo) * roundTo
    );
    const maxCost = Math.max(
      settings?.minProjectCost || 0,
      Math.round((rawCost * spreadMax) / roundTo) * roundTo
    );

    let days = 1;
    let technicians = settings?.minTechnicians || 2;
    const thresholdLarge = settings?.workUnitsPerDayLarge || 80;
    const thresholdSmall = settings?.workUnitsPerDaySmall || 50;

    if (totalWorkUnits > 180) {
      days = Math.ceil(totalWorkUnits / thresholdLarge);
      technicians = 4;
    } else if (totalWorkUnits > 90) {
      days = Math.ceil(totalWorkUnits / thresholdSmall);
      technicians = 3;
    } else if (totalWorkUnits > 35) {
      days = 2;
      technicians = 2;
    } else {
      days = 1;
      technicians = 2;
    }

    return {
      rawCost,
      minCost,
      maxCost,
      days,
      technicians,
      totalWorkUnits,
    };
  }, [items, previewValues, settings]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Alert */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold transition-all animate-in fade-in slide-in-from-bottom-5",
            toast.type === "success"
              ? "bg-neutral-900 border-emerald-500/40 text-emerald-400"
              : "bg-neutral-900 border-rose-500/40 text-rose-400"
          )}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--theme-surface)] p-5 sm:p-6 rounded-3xl border border-[var(--theme-border-color)]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shrink-0">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[var(--theme-foreground)]">
              شخصی‌سازی نیازمندی‌ها و فرمول محاسبه‌گر آنلاین
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              تعریف فیلدهای ورودی (اسلایدر، شمارنده نامبریک، گزینه‌ای، چک‌باکس)، قیمت‌گذاری واحد و اتصال به کالاهای فروشگاه
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Button
            onClick={handleOpenNewModal}
            className="flex-1 sm:flex-initial h-10 gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/25"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن نیازمندی جدید</span>
          </Button>

          <Button
            onClick={() => setIsSettingsModalOpen(true)}
            variant="outline"
            className="h-10 gap-1.5 border-neutral-700 text-neutral-300 text-xs hover:bg-neutral-800"
          >
            <Settings className="h-4 w-4" />
            <span>ضرایب و فرمول</span>
          </Button>

          <Button
            onClick={() => setIsResetConfirmOpen(true)}
            variant="outline"
            className="h-10 gap-1.5 border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 text-xs"
            title="بازنشانی محاسبه‌گر به حالت پیش‌فرض"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">پیش‌فرض کارخانه</span>
          </Button>

          <Link href="/installation#installation-calculator" target="_blank">
            <Button
              variant="outline"
              className="h-10 gap-1.5 border-neutral-800 text-neutral-400 hover:text-white text-xs"
              title="مشاهده در صفحه اصلی سایت"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400">نیازمندی‌های فعال</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {toPersianDigits(items.filter((i) => i.isActive).length)}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400">متصل به کالاهای فروشگاه</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
              <span>
                {toPersianDigits(
                  items.filter(
                    (i) =>
                      i.pricingType === "STORE_PRODUCT" ||
                      i.options?.some((o) => o.pricingType === "STORE_PRODUCT")
                  ).length
                )}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400">انواع شمارنده‌ها</span>
            <div className="text-xs sm:text-sm font-bold text-neutral-200 mt-1">
              {toPersianDigits(items.filter((i) => i.fieldType === "SLIDER").length)} اسلایدر |{" "}
              {toPersianDigits(items.filter((i) => i.fieldType === "STEPPER").length)} نامبریک
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Sliders className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400">حداقل مبلغ سفارش پروژه</span>
            <div className="text-sm sm:text-base font-black font-mono text-amber-400 mt-1">
              {formatPrice(settings?.minProjectCost || 2000000)}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: List vs Live Simulator */}
      <div className="flex items-center justify-between border-b border-[var(--theme-border-color)] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "list"
                ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>مدیریت نیازمندی‌ها ({toPersianDigits(items.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "preview"
                ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            )}
          >
            <Sparkles className="h-4 w-4" />
            <span>پیش‌نمایش تعاملی و شبیه‌ساز زنده</span>
          </button>
        </div>

        {activeTab === "list" && (
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در عناوین..."
                className="h-8 w-44 sm:w-60 rounded-xl border border-neutral-700 bg-neutral-900/80 pr-9 pl-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2 text-xs text-neutral-300 focus:border-orange-500 focus:outline-none"
            >
              <option value="all">تمام دسته‌بندی‌ها</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: LIST MANAGEMENT */}
      {activeTab === "list" && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="text-xs">در حال بارگذاری نیازمندی‌های محاسبه‌گر...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 space-y-3">
              <Layers className="h-10 w-10 text-neutral-600 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-300">هیچ نیازمندی فعالی یافت نشد</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                شما می‌توانید با کلیک بر روی دکمه «افزودن نیازمندی جدید» فیلدهای اختصاصی خود را تعریف کنید.
              </p>
              <Button onClick={handleOpenNewModal} size="sm" className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs mt-2">
                <Plus className="h-4 w-4 ml-1" />
                <span>افزودن نیازمندی جدید</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => {
                const categoryLabel =
                  SERVICE_CATEGORIES.find((c) => c.id === item.serviceCategory)?.label || item.serviceCategory;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                      item.isActive
                        ? "border-[var(--theme-border-color)] bg-[var(--theme-surface)] hover:border-neutral-700 shadow-sm"
                        : "border-neutral-800/60 bg-neutral-900/30 opacity-70"
                    )}
                  >
                    {/* Left: Reorder & Info */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0}
                          className="h-6 w-6 rounded flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 transition-colors"
                          title="انتقال به بالا"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={index === items.length - 1}
                          className="h-6 w-6 rounded flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 transition-colors"
                          title="انتقال به پایین"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Icon & Details */}
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                            #{item.order}
                          </span>
                          <h4 className="text-sm font-black text-white truncate">{item.title}</h4>
                          <span className="text-[10px] text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-full">
                            {categoryLabel}
                          </span>

                          {/* Field Type Badge */}
                          {item.fieldType === "SLIDER" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                              <Sliders className="h-3 w-3" />
                              <span>اسلایدر خطی ({item.min} تا {item.max} {item.unit})</span>
                            </span>
                          )}
                          {item.fieldType === "STEPPER" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                              <PlusCircle className="h-3 w-3" />
                              <span>نامبریک آپ/داون ({item.unit})</span>
                            </span>
                          )}
                          {item.fieldType === "OPTIONS" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                              <Radio className="h-3 w-3" />
                              <span>انتخاب گزینه‌ای ({toPersianDigits(item.options?.length || 0)} گزینه)</span>
                            </span>
                          )}
                          {item.fieldType === "CHECKBOX" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>چک‌باکس تایید</span>
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-xs text-neutral-400 line-clamp-1">{item.description}</p>
                        )}

                        {/* Pricing details pill */}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {item.pricingType === "STORE_PRODUCT" && item.linkedProductId ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                              <Package className="h-3.5 w-3.5" />
                              <span>کالای فروشگاه: {item.linkedProductName || "کد کالا"}</span>
                              <span className="font-mono text-white">({formatPrice(item.effectiveUnitPrice || 0)})</span>
                            </span>
                          ) : item.fieldType === "OPTIONS" ? (
                            <span className="text-[11px] text-neutral-400">
                              قیمت‌ها بر اساس گزینه انتخابی تعیین می‌شود.
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                              <span>نرخ واحد:</span>
                              <strong className="text-orange-400 font-bold">{formatPrice(item.unitPrice)}</strong>
                              <span className="text-[10px] text-neutral-400">/ {item.unit || "واحد"}</span>
                            </span>
                          )}

                          {item.workHoursPerUnit > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
                              <Clock className="h-3 w-3 text-sky-400" />
                              <span>{item.workHoursPerUnit} ساعت کارکرد برآورد</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
                      {/* Active Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                          item.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                        )}
                      >
                        <span className={cn("h-2 w-2 rounded-full", item.isActive ? "bg-emerald-500" : "bg-neutral-500")} />
                        <span>{item.isActive ? "فعال در سایت" : "غیرفعال"}</span>
                      </button>

                      {/* Edit Button */}
                      <Button
                        onClick={() => handleOpenEditModal(item)}
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs border-neutral-700 text-neutral-200 hover:text-white"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>ویرایش</span>
                      </Button>

                      {/* Delete Button */}
                      <Button
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE LIVE PREVIEW */}
      {activeTab === "preview" && (
        <div className="rounded-3xl border border-neutral-800 bg-[#121216] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400">
                <Sparkles className="h-4 w-4" />
                <span>شبیه‌ساز آنی پرتال عمومی</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                پیش‌نمایش رفتار واقعی محاسبه‌گر با تغییر تنظیمات
              </h3>
            </div>
            <span className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl">
              تعداد فیلدهای فعال در شبیه‌ساز: {toPersianDigits(items.filter((i) => i.isActive).length)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {items
                .filter((i) => i.isActive)
                .map((item) => {
                  const currentValue = previewValues[item.id];

                  // 1. SLIDER
                  if (item.fieldType === "SLIDER") {
                    const min = item.min ?? 0;
                    const max = item.max ?? 100;
                    const step = item.step ?? 1;

                    return (
                      <div key={item.id} className="space-y-2.5 p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs sm:text-sm font-semibold text-neutral-200">
                            {item.title}:
                          </label>
                          <span className="font-mono text-xs sm:text-sm font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/20">
                            {toPersianDigits(currentValue ?? item.defaultValue ?? min)} {item.unit}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={currentValue ?? item.defaultValue ?? min}
                          onChange={(e) =>
                            setPreviewValues((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                          }
                          className="w-full accent-orange-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
                        />
                        {item.markers && item.markers.length > 0 && (
                          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                            {item.markers.map((m, idx) => (
                              <span key={idx}>{m.label}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 2. STEPPER
                  if (item.fieldType === "STEPPER") {
                    const min = item.min ?? 0;
                    const max = item.max ?? 50;
                    const step = item.step ?? 1;
                    const val = currentValue ?? item.defaultValue ?? min;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-semibold text-neutral-200">{item.title}:</span>
                          {item.description && (
                            <span className="text-[11px] text-neutral-400 mt-0.5">{item.description}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewValues((prev) => ({
                                ...prev,
                                [item.id]: Math.max(min, (prev[item.id] ?? val) - step),
                              }))
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-95 font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono text-sm font-bold text-white min-w-[2.5rem] text-center">
                            {toPersianDigits(val)} {item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewValues((prev) => ({
                                ...prev,
                                [item.id]: Math.min(max, (prev[item.id] ?? val) + step),
                              }))
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-95 font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // 3. OPTIONS
                  if (item.fieldType === "OPTIONS") {
                    const selectedOptId = currentValue || item.defaultOptionId || item.options?.[0]?.id;

                    return (
                      <div key={item.id} className="space-y-2.5 p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-200 block">
                          {item.title}:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {(item.options || []).map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                setPreviewValues((prev) => ({ ...prev, [item.id]: opt.id }))
                              }
                              className={cn(
                                "flex flex-col p-3 rounded-xl border text-right transition-all cursor-pointer",
                                selectedOptId === opt.id
                                  ? "border-orange-500/80 bg-orange-500/10 text-white shadow-sm"
                                  : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-800/60"
                              )}
                            >
                              <span className="text-xs font-bold text-neutral-100">{opt.label}</span>
                              {opt.description && (
                                <span className="text-[10px] text-neutral-400 mt-1">{opt.description}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // 4. CHECKBOX
                  if (item.fieldType === "CHECKBOX") {
                    const isChecked = !!currentValue;

                    return (
                      <label
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-semibold text-neutral-200">{item.title}</span>
                            {item.description && (
                              <span className="text-[11px] text-neutral-400 mt-0.5">{item.description}</span>
                            )}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setPreviewValues((prev) => ({ ...prev, [item.id]: e.target.checked }))
                          }
                          className="h-5 w-5 accent-orange-500 rounded cursor-pointer"
                        />
                      </label>
                    );
                  }

                  return null;
                })}
            </div>

            {/* Live Output Card (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#181615] via-[#131215] to-[#0f0e11] p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                  <span className="text-xs font-bold text-neutral-300">خلاصه برآورد اولیه شبیه‌ساز</span>
                  <span className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    LIVE CALCULATION
                  </span>
                </div>

                {/* Price Display */}
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">بازه تخمینی هزینه دستمزد و اجرا:</span>
                  <div className="flex items-baseline gap-2 flex-wrap" dir="rtl">
                    <span className="text-xl sm:text-2xl font-black text-white font-mono">
                      {previewCalculation.minCost.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-xs text-neutral-400">الی</span>
                    <span className="text-xl sm:text-2xl font-black text-orange-400 font-mono">
                      {previewCalculation.maxCost.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-xs font-bold text-neutral-300">تومان</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    مبلغ ناخالص برآورد: {previewCalculation.rawCost.toLocaleString("fa-IR")} تومان
                  </span>
                </div>

                {/* Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                    <Clock className="h-5 w-5 text-sky-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-neutral-400 block">زمان تخمینی:</span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {toPersianDigits(previewCalculation.days)} روز کاری
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2.5">
                    <Users className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-neutral-400 block">تیم فنی:</span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {toPersianDigits(previewCalculation.technicians)} تکنسین
                      </span>
                    </div>
                  </div>
                </div>

                {/* Extra guarantee note */}
                <div className="pt-4 border-t border-neutral-800 text-xs text-neutral-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>ضمانت کتبی {settings?.warrantyMonths || 18} ماهه کارکرد بدون نقص</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>تست تضمینی با دستگاه کالیبره فلوک DSX-8000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: ADD / EDIT REQUIREMENT ITEM ── */}
      {isEditModalOpen && editingItem && (
        <EditRequirementModal
          item={editingItem}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={async (savedItem) => {
            setIsSaving(true);
            try {
              const isNew = !items.some((i) => i.id === savedItem.id);
              if (isNew) {
                const created = await installationApi.createCalculatorItem(savedItem);
                setItems((prev) => [...prev, created]);
                showToast(`نیازمندی "${created.title}" با موفقیت ایجاد گردید.`);
              } else {
                const updated = await installationApi.updateCalculatorItem(savedItem.id!, savedItem);
                setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
                showToast(`نیازمندی "${updated.title}" با موفقیت ویرایش گردید.`);
              }
              setIsEditModalOpen(false);
            } catch (err: any) {
              showToast(err?.message || "خطا در ذخیره نیازمندی", "error");
            } finally {
              setIsSaving(false);
            }
          }}
        />
      )}

      {/* ── MODAL 2: GLOBAL FORMULA & SETTINGS ── */}
      {isSettingsModalOpen && settings && (
        <GlobalSettingsModal
          settings={settings}
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={async (newSettings) => {
            try {
              const updated = await installationApi.updateAdminCalculatorSettings(newSettings);
              setSettings(updated);
              setIsSettingsModalOpen(false);
              showToast("ضرایب و تنظیمات سراسری محاسبه‌گر با موفقیت بروزرسانی شد.");
            } catch (err: any) {
              showToast("خطا در بروزرسانی تنظیمات سراسری", "error");
            }
          }}
        />
      )}

      {/* ── MODAL 3: RESET TO FACTORY CONFIRMATION ── */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#141418] p-6 shadow-2xl text-right space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-white">بازنشانی محاسبه‌گر به حالت اولیه؟</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              با این کار تمامی نیازمندی‌های سفارشی، اتصالات فروشگاه و تغییرات فرمول به حالت پیش‌فرض اولیه (شامل نود شبکه، دوربین، ترانک، رک، کابل و تست فلوک) بازگردانده می‌شوند.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(false)}
                className="border-neutral-700 text-neutral-300 text-xs"
              >
                انصراف
              </Button>
              <Button
                size="sm"
                onClick={handleResetDefaults}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                بله، بازنشانی شود
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Edit / Add Requirement Modal
// ─────────────────────────────────────────────────────────────────────────────

interface EditRequirementModalProps {
  item: Partial<CalculatorItem>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<CalculatorItem>) => Promise<void>;
}

function EditRequirementModal({ item, isOpen, onClose, onSave }: EditRequirementModalProps) {
  const [formData, setFormData] = React.useState<Partial<CalculatorItem>>({ ...item });
  const [activeModalTab, setActiveModalTab] = React.useState<"general" | "type_config" | "pricing">("general");

  // Product search state
  const [searchProductQuery, setSearchProductQuery] = React.useState("");
  const [searchedProducts, setSearchedProducts] = React.useState<StoreProductSearchResult[]>([]);
  const [isSearchingProduct, setIsSearchingProduct] = React.useState(false);
  const [showProductDropdown, setShowProductDropdown] = React.useState(false);

  // New option buffer for OPTIONS type
  const [newOptionLabel, setNewOptionLabel] = React.useState("");
  const [newOptionDesc, setNewOptionDesc] = React.useState("");
  const [newOptionPrice, setNewOptionPrice] = React.useState<number>(0);

  // Search products when query changes
  React.useEffect(() => {
    if (!searchProductQuery.trim()) {
      setSearchedProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingProduct(true);
      try {
        const results = await installationApi.searchStoreProducts(searchProductQuery);
        setSearchedProducts(results);
        setShowProductDropdown(true);
      } catch (err) {
        console.error("Product search failed:", err);
      } finally {
        setIsSearchingProduct(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchProductQuery]);

  const handleSelectProduct = (prod: StoreProductSearchResult) => {
    setFormData((prev) => ({
      ...prev,
      linkedProductId: prod.id,
      linkedProductName: prod.name,
      linkedProductSku: prod.sku,
      linkedProductPrice: prod.basePrice,
      effectiveUnitPrice: prod.basePrice,
      pricingType: "STORE_PRODUCT",
    }));
    setShowProductDropdown(false);
    setSearchProductQuery("");
  };

  const handleUnlinkProduct = () => {
    setFormData((prev) => ({
      ...prev,
      linkedProductId: null,
      linkedProductName: null,
      linkedProductSku: null,
      linkedProductPrice: null,
      pricingType: "MANUAL",
    }));
  };

  // Add an option to OPTIONS list
  const handleAddOption = () => {
    if (!newOptionLabel.trim()) return;
    const newOpt: CalculatorOption = {
      id: `opt-${Date.now()}`,
      label: newOptionLabel.trim(),
      description: newOptionDesc.trim(),
      pricingType: "MANUAL",
      unitPrice: Number(newOptionPrice || 0),
      isDefault: (formData.options || []).length === 0,
    };
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOpt],
      defaultOptionId: prev.defaultOptionId || newOpt.id,
    }));
    setNewOptionLabel("");
    setNewOptionDesc("");
    setNewOptionPrice(0);
  };

  const handleRemoveOption = (optId: string) => {
    setFormData((prev) => ({
      ...prev,
      options: (prev.options || []).filter((o) => o.id !== optId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert("لطفاً عنوان نیازمندی را وارد نمایید.");
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-neutral-800 bg-[#141418] shadow-2xl text-right overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {item.id && !item.id.startsWith("calc-item-") ? "ویرایش نیازمندی محاسبه‌گر" : "تعریف نیازمندی جدید"}
              </h3>
              <p className="text-[11px] text-neutral-400">
                پیکربندی شمارنده، دامنه مجاز، واحد شمارش و اتصال خودکار به قیمت کالای فروشگاه
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center border-b border-neutral-800 px-5 pt-3 gap-2 bg-neutral-900/30">
          <button
            type="button"
            onClick={() => setActiveModalTab("general")}
            className={cn(
              "px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeModalTab === "general"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            )}
          >
            ۱. مشخصات عمومی
          </button>
          <button
            type="button"
            onClick={() => setActiveModalTab("type_config")}
            className={cn(
              "px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeModalTab === "type_config"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            )}
          >
            ۲. نوع شمارنده و ورودی
          </button>
          <button
            type="button"
            onClick={() => setActiveModalTab("pricing")}
            className={cn(
              "px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer",
              activeModalTab === "pricing"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            )}
          >
            ۳. قیمت‌گذاری و اتصال به فروشگاه
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: General Info */}
          {activeModalTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  عنوان نیازمندی: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: تعداد دوربین‌های مداربسته IP یا تعداد اکسس‌پوینت"
                  className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">توضیح کوتاه و نکات راهنما:</label>
                <input
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="مثال: شامل نصب فیزیکی، تنظیم زاویه دید و کابل‌کشی تا سوییچ"
                  className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">دسته‌بندی تخصصی خدمت:</label>
                  <select
                    value={formData.serviceCategory || "cabling"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, serviceCategory: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    ضریب ساعت کارکرد هر واحد (برای زمان‌بندی):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={formData.workHoursPerUnit ?? 1}
                    onChange={(e) => setFormData((prev) => ({ ...prev, workHoursPerUnit: Number(e.target.value) }))}
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    مثلاً ۱ ساعت برای هر نود، ۱.۵ برای دوربین، ۴ ساعت برای هر رک
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <input
                  type="checkbox"
                  id="modal-is-active"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 accent-orange-500 rounded cursor-pointer"
                />
                <label htmlFor="modal-is-active" className="text-xs font-medium text-neutral-200 cursor-pointer">
                  فعال و قابل مشاهده بودن در محاسبه‌گر صفحه نصب
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Counter Type Configuration */}
          {activeModalTab === "type_config" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-neutral-200 mb-2">
                  نوع کنترل و شمارنده ورودی را انتخاب کنید:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "SLIDER", label: "اسلایدر خطی", desc: "نوار لغزنده پروگرس‌بار", icon: Sliders },
                    { id: "STEPPER", label: "نامبریک (+ / -)", desc: "دکمه‌های افزایش و کاهش", icon: PlusCircle },
                    { id: "OPTIONS", label: "انتخاب گزینه‌ای", desc: "کارت‌های رادیویی چندگانه", icon: Radio },
                    { id: "CHECKBOX", label: "چک‌باکس تایید", desc: "سوئیچ بله / خیر", icon: CheckCircle2 },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, fieldType: t.id as any }))}
                      className={cn(
                        "p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 cursor-pointer",
                        formData.fieldType === t.id
                          ? "border-orange-500 bg-orange-500/10 text-white"
                          : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800"
                      )}
                    >
                      <t.icon className={cn("h-5 w-5", formData.fieldType === t.id ? "text-orange-400" : "text-neutral-400")} />
                      <div>
                        <span className="text-xs font-bold block text-neutral-100">{t.label}</span>
                        <span className="text-[10px] text-neutral-400">{t.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Controls for SLIDER and STEPPER */}
              {(formData.fieldType === "SLIDER" || formData.fieldType === "STEPPER") && (
                <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
                  <h4 className="text-xs font-bold text-neutral-200">دامنه و پله‌های شمارش:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">حداقل مقدار (Min):</label>
                      <input
                        type="number"
                        value={formData.min ?? 0}
                        onChange={(e) => setFormData((prev) => ({ ...prev, min: Number(e.target.value) }))}
                        className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">حداکثر مقدار (Max):</label>
                      <input
                        type="number"
                        value={formData.max ?? 100}
                        onChange={(e) => setFormData((prev) => ({ ...prev, max: Number(e.target.value) }))}
                        className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">پله افزایش (Step):</label>
                      <input
                        type="number"
                        value={formData.step ?? 1}
                        onChange={(e) => setFormData((prev) => ({ ...prev, step: Number(e.target.value) }))}
                        className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">مقدار پیش‌فرض (Default):</label>
                      <input
                        type="number"
                        value={Number(formData.defaultValue ?? 0)}
                        onChange={(e) => setFormData((prev) => ({ ...prev, defaultValue: Number(e.target.value) }))}
                        className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">واحد شمارش (Unit):</label>
                      <input
                        type="text"
                        value={formData.unit || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                        placeholder="مثلاً: پورت، عدد، متر، رک، دستگاه"
                        className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white"
                      />
                    </div>
                    {formData.fieldType === "SLIDER" && (
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">تم رنگی اسلایدر:</label>
                        <select
                          value={formData.color || "orange"}
                          onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                          className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white"
                        >
                          {COLOR_OPTIONS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Conditional Controls for OPTIONS */}
              {formData.fieldType === "OPTIONS" && (
                <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
                  <h4 className="text-xs font-bold text-neutral-200">تعریف گزینه‌ها:</h4>
                  {formData.options && formData.options.length > 0 && (
                    <div className="space-y-2">
                      {formData.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-3 rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">{opt.label}</span>
                            {opt.description && <span className="text-[10px] text-neutral-400">{opt.description}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-orange-400 font-bold">{formatPrice(opt.unitPrice)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(opt.id)}
                              className="text-neutral-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Option Box */}
                  <div className="p-3 rounded-xl border border-neutral-800 bg-neutral-950 space-y-2">
                    <span className="text-[11px] font-bold text-neutral-300 block">افزودن گزینه جدید:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newOptionLabel}
                        onChange={(e) => setNewOptionLabel(e.target.value)}
                        placeholder="عنوان گزینه (مثلاً Cat6A SFTP)"
                        className="h-8 rounded-lg border border-neutral-700 bg-neutral-900 px-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={newOptionDesc}
                        onChange={(e) => setNewOptionDesc(e.target.value)}
                        placeholder="توضیح کوتاه (مثلاً ضد نویز)"
                        className="h-8 rounded-lg border border-neutral-700 bg-neutral-900 px-2 text-xs text-white"
                      />
                      <input
                        type="number"
                        value={newOptionPrice || ""}
                        onChange={(e) => setNewOptionPrice(Number(e.target.value))}
                        placeholder="قیمت به تومان (۰ = بدون تغییر)"
                        className="h-8 rounded-lg border border-neutral-700 bg-neutral-900 px-2 text-xs text-white font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddOption}
                      className="h-8 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                    >
                      <Plus className="h-3.5 w-3.5 ml-1" />
                      <span>ثبت این گزینه در لیست</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Conditional Controls for CHECKBOX */}
              {formData.fieldType === "CHECKBOX" && (
                <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="opt-default-checked"
                      checked={!!formData.defaultChecked}
                      onChange={(e) => setFormData((prev) => ({ ...prev, defaultChecked: e.target.checked }))}
                      className="h-4 w-4 accent-orange-500 rounded cursor-pointer"
                    />
                    <label htmlFor="opt-default-checked" className="text-xs text-neutral-200 cursor-pointer">
                      به صورت پیش‌فرض انتخاب‌شده (تیک‌خورده) باشد
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">متن بج یا نشان ویژه (Badge):</label>
                    <input
                      type="text"
                      value={formData.badge || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                      placeholder="مثال: تضمین رسمی فلوک یا استاندارد TIA-606"
                      className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Pricing & Store Product Link */}
          {activeModalTab === "pricing" && (
            <div className="space-y-5">
              {/* Pricing Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-neutral-200 mb-2">روش تعیین قیمت هر واحد:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={cn(
                      "p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between",
                      formData.pricingType !== "STORE_PRODUCT"
                        ? "border-orange-500 bg-orange-500/10 text-white"
                        : "border-neutral-800 bg-neutral-900/50 text-neutral-400"
                    )}
                  >
                    <div>
                      <span className="text-xs font-bold block">قیمت‌گذاری دستی</span>
                      <span className="text-[10px] text-neutral-400">ورود نرخ ثابت به تومان به ازای هر واحد</span>
                    </div>
                    <input
                      type="radio"
                      name="pricing_type_radio"
                      checked={formData.pricingType !== "STORE_PRODUCT"}
                      onChange={() => setFormData((prev) => ({ ...prev, pricingType: "MANUAL" }))}
                      className="accent-orange-500"
                    />
                  </label>

                  <label
                    className={cn(
                      "p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between",
                      formData.pricingType === "STORE_PRODUCT"
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-neutral-800 bg-neutral-900/50 text-neutral-400"
                    )}
                  >
                    <div>
                      <span className="text-xs font-bold block flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-emerald-400" />
                        <span>اتصال به کالای فروشگاه</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">همگام‌سازی خودکار با قیمت زنده فروشگاه</span>
                    </div>
                    <input
                      type="radio"
                      name="pricing_type_radio"
                      checked={formData.pricingType === "STORE_PRODUCT"}
                      onChange={() => setFormData((prev) => ({ ...prev, pricingType: "STORE_PRODUCT" }))}
                      className="accent-emerald-500"
                    />
                  </label>
                </div>
              </div>

              {/* Manual Price Input */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  قیمت هر واحد (به تومان):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.unitPrice ?? 0}
                    onChange={(e) => setFormData((prev) => ({ ...prev, unitPrice: Number(e.target.value) }))}
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 pl-16 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 font-medium">
                    تومان
                  </span>
                </div>
                {formData.pricingType === "STORE_PRODUCT" && (
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    * در صورت عدم دسترسی موقت به قیمت کالا، این مبلغ به عنوان نرخ پشتیبان استفاده خواهد شد.
                  </span>
                )}
              </div>

              {/* Store Product Search and Picker */}
              {formData.pricingType === "STORE_PRODUCT" && (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Package className="h-4 w-4" />
                      <span>کالای مرتبط در انبار یا فروشگاه:</span>
                    </span>
                    {formData.linkedProductId && (
                      <button
                        type="button"
                        onClick={handleUnlinkProduct}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        <span>قطع اتصال محصول</span>
                      </button>
                    )}
                  </div>

                  {formData.linkedProductId ? (
                    <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-neutral-900/90 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{formData.linkedProductName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            SKU: {formData.linkedProductSku || "ثبت‌نشده"}
                          </span>
                        </div>
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-[10px] text-neutral-400 block">قیمت زنده:</span>
                        <span className="text-sm font-black text-emerald-400">
                          {formatPrice(formData.linkedProductPrice || formData.unitPrice || 0)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          value={searchProductQuery}
                          onChange={(e) => setSearchProductQuery(e.target.value)}
                          placeholder="جستجوی نام کالا یا کد SKU (مثلاً سوئیچ سیسکو، کابل Cat6A، NVR...)"
                          className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 pr-9 pl-4 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                        />
                        {isSearchingProduct && (
                          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-emerald-400" />
                        )}
                      </div>

                      {/* Dropdown of search results */}
                      {showProductDropdown && searchedProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl p-1.5 space-y-1">
                          {searchedProducts.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectProduct(p)}
                              className="w-full p-2 rounded-lg hover:bg-neutral-800 flex items-center justify-between text-right text-xs transition-colors cursor-pointer"
                            >
                              <div>
                                <span className="font-bold text-white block">{p.name}</span>
                                <span className="text-[10px] text-neutral-400 font-mono">SKU: {p.sku || "-"}</span>
                              </div>
                              <span className="font-mono text-emerald-400 font-bold shrink-0">
                                {formatPrice(p.basePrice)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-neutral-700 text-neutral-300 text-xs"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>ذخیره تغییرات</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Global Calculator Settings Modal
// ─────────────────────────────────────────────────────────────────────────────

interface GlobalSettingsModalProps {
  settings: CalculatorSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Partial<CalculatorSettings>) => Promise<void>;
}

function GlobalSettingsModal({ settings, isOpen, onClose, onSave }: GlobalSettingsModalProps) {
  const [formData, setFormData] = React.useState<CalculatorSettings>({ ...settings });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-[#141418] shadow-2xl text-right overflow-hidden my-8">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">تنظیمات سراسری و فرمول محاسبه‌گر</h3>
              <p className="text-[11px] text-neutral-400">تعیین حداقل بودجه، بازه خطا، ظرفیت کاری روزانه و گارانتی</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              حداقل مبلغ سفارش پروژه (تومان):
            </label>
            <input
              type="number"
              value={formData.minProjectCost || 0}
              onChange={(e) => setFormData((prev) => ({ ...prev, minProjectCost: Number(e.target.value) }))}
              className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                درصد بازه حداقل (Spread Min):
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.spreadMinPercent ?? 0.92}
                onChange={(e) => setFormData((prev) => ({ ...prev, spreadMinPercent: Number(e.target.value) }))}
                className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">مثلاً 0.92 = ۸٪ زیر میانگین</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                درصد بازه حداکثر (Spread Max):
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.spreadMaxPercent ?? 1.1}
                onChange={(e) => setFormData((prev) => ({ ...prev, spreadMaxPercent: Number(e.target.value) }))}
                className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2.5 text-xs text-white font-mono"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">مثلاً 1.10 = ۱۰٪ بالای میانگین</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                گرد کردن به ضریب (تومان):
              </label>
              <input
                type="number"
                value={formData.roundToNearest ?? 50000}
                onChange={(e) => setFormData((prev) => ({ ...prev, roundToNearest: Number(e.target.value) }))}
                className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                مدت گارانتی خدمات (ماه):
              </label>
              <input
                type="number"
                value={formData.warrantyMonths ?? 18}
                onChange={(e) => setFormData((prev) => ({ ...prev, warrantyMonths: Number(e.target.value) }))}
                className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2.5 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-neutral-700 text-neutral-300 text-xs"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs gap-1.5"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>ذخیره تنظیمات فرمول</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
