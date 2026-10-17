"use client";

import * as React from "react";
import {
  Truck,
  Zap,
  Package,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calculator,
  Calendar,
  Layers,
  Search,
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  ChevronLeft,
  Plane,
  Bike,
  Box,
  MapPin,
  Check,
} from "lucide-react";
import { cn, formatPrice, toPersianDigits, areProvincesMatching } from "@/shared/lib/utils";
import {
  DeliveryMethod,
  DeliveryTimeSlotOption,
  ProvinceShippingRule,
} from "@/features/checkout/types";
import { PROVINCES_AND_CITIES, IRAN_PROVINCES } from "@/features/checkout/api/checkout-api";
import { getEffectiveMethodDetails } from "@/features/checkout/api/shipping-api";
import {
  adminShippingApi,
  AdminShippingConfig,
} from "../../api/admin-shipping-api";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  type FilterTabOption,
  AdminStatsCards,
  type AdminStatItem,
  AdminActionModal,
  AdminImageUploader,
} from "../shared";

export const PRESET_CARRIER_ICONS = [
  { name: "truck", label: "کامیونت و ناوگان زمینی", icon: Truck },
  { name: "zap", label: "اکسپرس سریع", icon: Zap },
  { name: "package", label: "باربری سنگین و پالت", icon: Package },
  { name: "building2", label: "تحویل حضوری در انبار", icon: Building2 },
  { name: "plane", label: "ارسال هوایی سریع", icon: Plane },
  { name: "bike", label: "پیک موتوری شهری", icon: Bike },
  { name: "box", label: "پست پیشتاز کشوری", icon: Box },
  { name: "clock", label: "ارسال زمان‌بندی شده", icon: Clock },
  { name: "shield-check", label: "مرسوله بیمه‌شده", icon: ShieldCheck },
  { name: "map-pin", label: "تحویل در نمایندگی", icon: MapPin },
];

export function AdminCarrierIconBadge({
  method,
}: {
  method: {
    iconName: string;
    iconUrl?: string | null;
    title: string;
  };
}) {
  const [hasError, setHasError] = React.useState(false);

  if (method.iconUrl && !hasError) {
    return (
      <img
        src={method.iconUrl}
        alt={method.title}
        className="h-6 w-6 object-contain rounded"
        onError={() => setHasError(true)}
      />
    );
  }
  const match = PRESET_CARRIER_ICONS.find((p) => p.name === method.iconName);
  const IconCmp = match ? match.icon : Truck;
  return <IconCmp className="h-5 w-5 text-orange-400" />;
}

export const renderCarrierIcon = (method: {
  iconName: string;
  iconUrl?: string | null;
  title: string;
}) => {
  return <AdminCarrierIconBadge method={method} />;
};

type ShippingAdminTab = "methods" | "slots" | "schedule" | "simulator";

export function AdminShippingView() {
  const [activeTab, setActiveTab] = React.useState<ShippingAdminTab>("methods");

  // Data states
  const [methods, setMethods] = React.useState<DeliveryMethod[]>([]);
  const [timeSlots, setTimeSlots] = React.useState<DeliveryTimeSlotOption[]>([]);
  const [config, setConfig] = React.useState<AdminShippingConfig>({
    sameDayCutoffHour: 14,
    leadTimeDays: 0,
    workingDays: [0, 1, 2, 3, 4, 5],
    daysInAdvance: 7,
    holidayDates: [],
  });
  const [holidays, setHolidays] = React.useState<string[]>([]);
  const [newHolidayInput, setNewHolidayInput] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Filters & Search for methods
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Modals state
  const [isMethodModalOpen, setIsMethodModalOpen] = React.useState<boolean>(false);
  const [editingMethod, setEditingMethod] = React.useState<DeliveryMethod | null>(null);
  const [isDeletingMethod, setIsDeletingMethod] = React.useState<DeliveryMethod | null>(null);
  const [modalProvinces, setModalProvinces] = React.useState<string[]>([]);
  const [modalIconName, setModalIconName] = React.useState<string>("truck");
  const [modalIconUrl, setModalIconUrl] = React.useState<string | null>(null);
  const [modalIconTab, setModalIconTab] = React.useState<"preset" | "custom">("preset");
  const [modalProvinceRules, setModalProvinceRules] = React.useState<ProvinceShippingRule[]>([]);
  const [newRuleProvince, setNewRuleProvince] = React.useState<string>("تهران");
  const [newRuleCost, setNewRuleCost] = React.useState<string>("");
  const [newRuleDeliveryTime, setNewRuleDeliveryTime] = React.useState<string>("");
  const [newRuleThreshold, setNewRuleThreshold] = React.useState<string>("");
  const [newRuleIsFree, setNewRuleIsFree] = React.useState<boolean>(false);

  // Synchronize modal fields whenever method modal opens or editingMethod changes
  React.useEffect(() => {
    if (isMethodModalOpen) {
      setModalProvinces(editingMethod?.allowedProvinces ? [...editingMethod.allowedProvinces] : []);
      setModalIconName(editingMethod?.iconName || "truck");
      setModalIconUrl(editingMethod?.iconUrl || null);
      setModalIconTab(editingMethod?.iconUrl ? "custom" : "preset");
      setModalProvinceRules(editingMethod?.provinceRules ? [...editingMethod.provinceRules] : []);
      setNewRuleProvince("تهران");
      setNewRuleCost("");
      setNewRuleDeliveryTime("");
      setNewRuleThreshold("");
      setNewRuleIsFree(false);
    }
  }, [isMethodModalOpen, editingMethod]);

  const handleAddProvinceRule = () => {
    const prov = newRuleProvince.trim();
    if (!prov) {
      showToast("لطفاً یک استان انتخاب کنید.", "info");
      return;
    }
    const costNum = newRuleCost !== "" ? parseInt(newRuleCost, 10) : undefined;
    const thresholdNum = newRuleThreshold !== "" ? parseInt(newRuleThreshold, 10) : undefined;
    const deliveryTimeStr = newRuleDeliveryTime.trim() || undefined;

    const newRule: ProvinceShippingRule = {
      province: prov,
      cost: costNum,
      estimatedDeliveryTime: deliveryTimeStr,
      freeThreshold: thresholdNum,
      isFree: newRuleIsFree,
    };

    setModalProvinceRules((prev) => {
      const filtered = prev.filter((r) => !areProvincesMatching(r.province, prov));
      return [...filtered, newRule];
    });

    setNewRuleCost("");
    setNewRuleDeliveryTime("");
    setNewRuleThreshold("");
    setNewRuleIsFree(false);
    showToast(`قانون ویژه برای استان ${prov} تنظیم شد.`);
  };

  const handleRemoveProvinceRule = (prov: string) => {
    setModalProvinceRules((prev) => prev.filter((r) => !areProvincesMatching(r.province, prov)));
    showToast(`قانون استان ${prov} حذف گردید.`);
  };

  const [isSlotModalOpen, setIsSlotModalOpen] = React.useState<boolean>(false);
  const [editingSlot, setEditingSlot] = React.useState<DeliveryTimeSlotOption | null>(null);
  const [isDeletingSlot, setIsDeletingSlot] = React.useState<DeliveryTimeSlotOption | null>(null);

  // Toast state
  const [toast, setToast] = React.useState<{ message: string; type?: "success" | "info" } | null>(null);

  // Simulator state
  const [simProvince, setSimProvince] = React.useState<string>("تهران");
  const [simSubtotal, setSimSubtotal] = React.useState<number>(4500000);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load all data
  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [methodsData, slotsData, configData] = await Promise.all([
        adminShippingApi.getMethods(),
        adminShippingApi.getTimeSlots(),
        adminShippingApi.getConfig(),
      ]);
      setMethods(methodsData);
      setTimeSlots(slotsData);
      setConfig(configData);
      setHolidays(configData.holidayDates || []);
    } catch {
      showToast("خطا در بارگذاری اطلاعات ناوگان ارسال", "info");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handle Method Actions
  const handleToggleMethod = async (method: DeliveryMethod) => {
    try {
      const updated = await adminShippingApi.toggleMethod(method.id);
      setMethods((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      showToast(
        `روش ارسال "${method.title}" ${updated.isActive ? "فعال" : "غیرفعال"} گردید.`
      );
    } catch {
      showToast("خطا در تغییر وضعیت روش ارسال", "info");
    }
  };

  const handleDeleteMethod = async () => {
    if (!isDeletingMethod) return;
    try {
      await adminShippingApi.deleteMethod(isDeletingMethod.id);
      setMethods((prev) => prev.filter((m) => m.id !== isDeletingMethod.id));
      showToast(`روش ارسال "${isDeletingMethod.title}" با موفقیت حذف شد.`);
      setIsDeletingMethod(null);
    } catch {
      showToast("خطا در حذف روش ارسال", "info");
    }
  };

  const handleSaveMethod = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const description = formData.get("description") as string;
    const cost = parseInt(formData.get("cost") as string, 10) || 0;
    const freeThresholdStr = formData.get("freeThreshold") as string;
    const freeThreshold = freeThresholdStr ? parseInt(freeThresholdStr, 10) : null;
    const estimatedDeliveryTime = formData.get("estimatedDeliveryTime") as string;
    const iconName = modalIconName || "truck";
    const iconUrl = modalIconTab === "custom" ? modalIconUrl : null;
    const isExpress = formData.get("isExpress") === "on";
    const allowedProvinces = modalProvinces;

    const payload: Partial<DeliveryMethod> = {
      title,
      subtitle,
      description,
      cost,
      freeThreshold,
      estimatedDeliveryTime,
      iconName,
      iconUrl,
      provinceRules: modalProvinceRules,
      isExpress,
      allowedProvinces,
      isActive: editingMethod ? editingMethod.isActive : true,
    };

    try {
      if (editingMethod) {
        const updated = await adminShippingApi.updateMethod(editingMethod.id, payload);
        setMethods((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        showToast(`شیوه ارسال "${title}" با موفقیت ویرایش گردید.`);
      } else {
        const created = await adminShippingApi.createMethod(payload);
        setMethods((prev) => [...prev, created]);
        showToast(`شیوه ارسال جدید "${title}" با موفقیت ایجاد گردید.`);
      }
      setIsMethodModalOpen(false);
      setEditingMethod(null);
    } catch {
      showToast("خطا در ذخیره روش ارسال", "info");
    }
  };

  // Handle Slot Actions
  const handleSaveSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = formData.get("title") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const description = formData.get("description") as string;
    const maxCapacity = parseInt(formData.get("maxCapacity") as string, 10) || 40;

    const payload: Partial<DeliveryTimeSlotOption> = {
      title,
      startTime,
      endTime,
      description,
      maxCapacity,
      isActive: editingSlot ? editingSlot.isActive : true,
    };

    try {
      if (editingSlot) {
        const updated = await adminShippingApi.updateTimeSlot(editingSlot.id, payload);
        setTimeSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        showToast(`بازه زمانی "${title}" بروزرسانی شد.`);
      } else {
        const created = await adminShippingApi.createTimeSlot(payload);
        setTimeSlots((prev) => [...prev, created]);
        showToast(`بازه زمانی جدید "${title}" ایجاد شد.`);
      }
      setIsSlotModalOpen(false);
      setEditingSlot(null);
    } catch {
      showToast("خطا در ذخیره بازه زمانی", "info");
    }
  };

  const handleDeleteSlot = async () => {
    if (!isDeletingSlot) return;
    try {
      await adminShippingApi.deleteTimeSlot(isDeletingSlot.id);
      setTimeSlots((prev) => prev.filter((s) => s.id !== isDeletingSlot.id));
      showToast(`بازه زمانی "${isDeletingSlot.title}" حذف شد.`);
      setIsDeletingSlot(null);
    } catch {
      showToast("خطا در حذف بازه زمانی", "info");
    }
  };

  const handleAddHoliday = (dateToAdd?: string) => {
    const val = (dateToAdd || newHolidayInput).trim();
    if (!val) return;
    if (holidays.includes(val)) {
      showToast("این تاریخ قبلاً در لیست تعطیلات ثبت شده است.", "info");
      return;
    }
    const updated = [...holidays, val];
    setHolidays(updated);
    setNewHolidayInput("");
    showToast(`تاریخ تعطیلی "${val}" افزوده شد.`);
  };

  const handleRemoveHoliday = (val: string) => {
    setHolidays((prev) => prev.filter((h) => h !== val));
    showToast(`تاریخ تعطیلی "${val}" حذف شد.`);
  };

  // Handle Schedule Config Save
  const handleSaveConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const sameDayCutoffHour = parseInt(formData.get("sameDayCutoffHour") as string, 10) || 14;
    const daysInAdvance = parseInt(formData.get("daysInAdvance") as string, 10) || 7;
    const leadTimeDays = parseInt(formData.get("leadTimeDays") as string, 10) || 0;

    // Working days checkboxes
    const workingDays: number[] = [];
    for (let i = 0; i < 7; i++) {
      if (formData.get(`workingDay_${i}`) === "on") {
        workingDays.push(i);
      }
    }

    try {
      const updated = await adminShippingApi.updateConfig({
        sameDayCutoffHour,
        daysInAdvance,
        leadTimeDays,
        workingDays,
        holidayDates: holidays,
      });
      setConfig(updated);
      setHolidays(updated.holidayDates || []);
      showToast("تنظیمات زمان‌بندی، روزهای کاری و تعطیلات با موفقیت ذخیره گردید.");
    } catch {
      showToast("خطا در ذخیره تنظیمات زمان‌بندی", "info");
    }
  };

  // Filter methods
  const filteredMethods = React.useMemo(() => {
    return methods.filter((m) => {
      // Search
      const matchesSearch =
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.allowedProvinces && m.allowedProvinces.some((p) => p.includes(searchQuery.trim())));

      // Status
      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = Boolean(m.isActive);
      if (statusFilter === "inactive") matchesStatus = !m.isActive;
      if (statusFilter === "express") matchesStatus = Boolean(m.isExpress);

      return matchesSearch && matchesStatus;
    });
  }, [methods, searchQuery, statusFilter]);

  // Stats calculation
  const statsItems: AdminStatItem[] = React.useMemo(() => {
    const activeCount = methods.filter((m) => m.isActive).length;
    const expressCount = methods.filter((m) => m.isExpress).length;
    const avgFreeThreshold =
      methods.reduce((sum, m) => sum + (m.freeThreshold || 0), 0) /
        (methods.filter((m) => m.freeThreshold).length || 1) || 5000000;

    return [
      {
        id: "active_methods",
        title: "شیوه‌های ارسال فعال",
        value: `${toPersianDigits(activeCount)} از ${toPersianDigits(methods.length)}`,
        subtitle: "ناوگان حمل و توزیع",
        variant: "emerald",
        icon: Truck,
      },
      {
        id: "express_methods",
        title: "حامل‌های اکسپرس فوری",
        value: `${toPersianDigits(expressCount)} حامل`,
        subtitle: "تحویل ۲ تا ۴ ساعته",
        variant: "orange",
        icon: Zap,
      },
      {
        id: "cutoff_hour",
        title: "ساعت قطع ثبت ارسال روز جاری",
        value: `${toPersianDigits(config.sameDayCutoffHour)}:۰۰`,
        subtitle: "تحویل در همان روز",
        variant: "sky",
        icon: Clock,
      },
      {
        id: "time_slots",
        title: "بازه‌های زمانی تحویل روزانه",
        value: `${toPersianDigits(timeSlots.filter((s) => s.isActive).length)} شیفت`,
        subtitle: "صبح، عصر و شب",
        variant: "purple",
        icon: Calendar,
      },
    ];
  }, [methods, timeSlots, config]);

  // Methods Table Columns
  const columns: AdminColumnDef<DeliveryMethod>[] = [
    {
      key: "title",
      header: "عنوان شیوه ارسال و حامل",
      cell: (method) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-orange-400 overflow-hidden">
              {renderCarrierIcon(method)}
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white truncate">{method.title}</span>
                {method.isExpress && (
                  <span className="text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                    اکسپرس
                  </span>
                )}
                {method.provinceRules && method.provinceRules.length > 0 && (
                  <span className="text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-full">
                    {toPersianDigits(method.provinceRules.length)} تعرفه استانی
                  </span>
                )}
              </div>
              <span className="text-[11px] text-neutral-400 block truncate max-w-xs">
                {method.subtitle}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "cost",
      header: "هزینه ارسال پایه",
      cell: (method) => (
        <span className="text-xs font-black text-white">
          {method.cost === 0 ? (
            <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
              رایگان
            </span>
          ) : (
            formatPrice(method.cost)
          )}
        </span>
      ),
    },
    {
      key: "freeThreshold",
      header: "سقف ارسال رایگان",
      cell: (method) => (
        <span className="text-xs text-neutral-300 font-medium">
          {method.cost === 0
            ? "همیشه رایگان"
            : method.freeThreshold
            ? `از ${formatPrice(method.freeThreshold)}`
            : "فاقد ارسال رایگان"}
        </span>
      ),
    },
    {
      key: "coverage",
      header: "محدوده پوشش",
      cell: (method) => (
        <div className="space-y-1">
          {method.allowedProvinces && method.allowedProvinces.length > 0 ? (
            <span className="text-[11px] font-semibold text-neutral-300 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded-full inline-block">
              {method.allowedProvinces.join("، ")}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full inline-block">
              سراسر کشور
            </span>
          )}
          {method.provinceRules && method.provinceRules.length > 0 && (
            <div className="text-[10px] text-purple-400 font-medium">
              قوانین ویژه: {method.provinceRules.map((r) => r.province).join("، ")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "deliveryTime",
      header: "مدت تقریبی تحویل",
      cell: (method) => (
        <span className="text-xs text-neutral-400 flex items-center gap-1">
          <Clock className="h-3 w-3 text-orange-400 shrink-0" />
          <span>{method.estimatedDeliveryTime}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      cell: (method) => (
        <button
          type="button"
          onClick={() => handleToggleMethod(method)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors border ${
            method.isActive
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700"
          }`}
        >
          {method.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
          <span>{method.isActive ? "فعال" : "غیرفعال"}</span>
        </button>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      cell: (method) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEditingMethod(method);
              setIsMethodModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="ویرایش روش ارسال"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDeletingMethod(method)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
            title="حذف روش ارسال"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Simulator calculation
  const simulatorResult = React.useMemo(() => {
    const active = methods.filter((m) => m.isActive);
    const applicable = active.filter((m) => {
      if (!m.allowedProvinces || m.allowedProvinces.length === 0) return true;
      return m.allowedProvinces.some(
        (p) =>
          p.trim() === simProvince.trim() ||
          simProvince.includes(p.trim()) ||
          p.trim().includes(simProvince.trim())
      );
    });

    return applicable.map((m) => {
      const details = getEffectiveMethodDetails(m, simProvince);
      const isFree =
        details.effectiveIsFree ||
        (details.effectiveFreeThreshold !== null &&
          details.effectiveFreeThreshold !== undefined &&
          simSubtotal >= details.effectiveFreeThreshold);
      const cost = isFree ? 0 : details.effectiveCost;
      const neededForFree =
        details.effectiveFreeThreshold && !isFree && simSubtotal < details.effectiveFreeThreshold
          ? details.effectiveFreeThreshold - simSubtotal
          : 0;

      return {
        method: m,
        cost,
        isFree,
        neededForFree,
        effectiveDeliveryTime: details.effectiveDeliveryTime,
        isCustomized: details.isCustomized,
      };
    });
  }, [methods, simProvince, simSubtotal]);

  const filterTabs: FilterTabOption[] = [
    { id: "all", label: "همه روش‌ها", count: methods.length },
    {
      id: "active",
      label: "فعال",
      count: methods.filter((m) => m.isActive).length,
      badgeVariant: "emerald",
    },
    {
      id: "express",
      label: "اکسپرس فوری",
      count: methods.filter((m) => m.isExpress).length,
      badgeVariant: "orange",
    },
    {
      id: "inactive",
      label: "غیرفعال",
      count: methods.filter((m) => !m.isActive).length,
      badgeVariant: "default",
    },
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* ── Toast Notification ───────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-neutral-900/95 px-4 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border-color)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <Truck className="h-5 w-5" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-[var(--theme-foreground)]">
              مدیریت روش‌ها و زمان‌بندی ارسال مرسولات
            </h1>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
            تنظیم حامل‌های پستی و ناوگان اختصاصی، سقف‌های ارسال رایگان تجهیزات شبکه، بازه‌های زمانی تحویل و تقویم کاری اعزام سفارش‌ها
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingMethod(null);
              setIsMethodModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/40 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن شیوه ارسال جدید</span>
          </button>
        </div>
      </div>

      {/* ── Stats Cards Grid ─────────────────────────────────────────── */}
      <AdminStatsCards items={statsItems} columns={4} />

      {/* ── Tabs Navigation ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("methods")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "methods"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>شیوه‌های ارسال و حامل‌ها</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
            {toPersianDigits(methods.length)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("slots")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "slots"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>بازه‌های زمانی تحویل (Slots)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300">
            {toPersianDigits(timeSlots.length)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "schedule"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>قوانین، ساعات کاری و تقویم</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "simulator"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>شبیه‌ساز و تست زنده نرخ ارسال</span>
        </button>
      </div>

      {/* ── TAB 1: Methods Table ─────────────────────────────────────── */}
      {activeTab === "methods" && (
        <div className="space-y-4">
          <AdminFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="جستجو در عنوان شیوه ارسال، استان‌ها یا حامل..."
            statusTabs={filterTabs}
            activeStatusTab={statusFilter}
            onStatusTabChange={setStatusFilter}
            exportLabel="خروجی اکسل"
            onExport={() => showToast("لیست روش‌های ارسال به اکسل صادر گردید.")}
          />

          <AdminDataTable<DeliveryMethod>
            data={filteredMethods}
            columns={columns}
            keyExtractor={(m) => m.id}
            isLoading={isLoading}
            emptyMessage="هیچ روش ارسالی با فیلترهای انتخابی یافت نشد."
            emptySubtitle="می‌توانید با کلیک روی دکمه افزودن شیوه ارسال، روش جدیدی ثبت کنید."
          />
        </div>
      )}

      {/* ── TAB 2: Time Slots Manager ─────────────────────────────────── */}
      {activeTab === "slots" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              بازه‌های زمانی تعریف‌شده در مرحله سوم فرآیند خرید (Checkout) برای انتخاب خریدار نمایش داده می‌شوند.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingSlot(null);
                setIsSlotModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>افزودن بازه زمانی جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {timeSlots.map((slot) => {
              const Icon =
                slot.id === "morning"
                  ? Sun
                  : slot.id === "afternoon"
                  ? Sunset
                  : slot.id === "evening"
                  ? Moon
                  : Clock;

              return (
                <div
                  key={slot.id}
                  className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 space-y-3.5 relative flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-orange-400">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-bold text-white">{slot.title}</h4>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          slot.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700"
                        }`}
                      >
                        {slot.isActive ? "فعال" : "غیرفعال"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-300 font-mono dir-ltr justify-end">
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <Clock className="h-3 w-3 text-orange-400" />
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {slot.description}
                    </p>

                    <div className="text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-2">
                      <span>حداکثر ظرفیت سفارش روزانه: </span>
                      <strong className="text-white font-bold">
                        {toPersianDigits(slot.maxCapacity || 40)} سفارش
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-neutral-800/80 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlot(slot);
                        setIsSlotModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors cursor-pointer"
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeletingSlot(slot)}
                      className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 rounded-lg border border-red-500/20 transition-colors cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: Schedule & Rules Config ────────────────────────────── */}
      {activeTab === "schedule" && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 sm:p-6 space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>تنظیمات ساعت قطع پذیرش و بازه رزرو تقویم</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                تعیین دقیق مهلت ثبت سفارش برای تحویل در همان روز، و تعداد روزهای آینده‌ای که مشتری می‌تواند در صفحه Checkout انتخاب کند.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  ساعت قطع پذیرش ارسال روز جاری (۰ الی ۲۳) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="sameDayCutoffHour"
                    min={0}
                    max={23}
                    defaultValue={config.sameDayCutoffHour}
                    className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-500">
                    :۰۰ بعد از ظهر
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  پس از این ساعت، گزینه &quot;امروز&quot; در تقویم خرید غیرفعال می‌شود.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  تعداد روزهای آینده قابل انتخاب در تقویم *
                </label>
                <input
                  type="number"
                  name="daysInAdvance"
                  min={1}
                  max={30}
                  defaultValue={config.daysInAdvance}
                  className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  پیش‌فرض: ۷ روز کاری آینده
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  فاصله زمانی آماده‌سازی در انبار (روز)
                </label>
                <input
                  type="number"
                  name="leadTimeDays"
                  min={0}
                  max={7}
                  defaultValue={config.leadTimeDays}
                  className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  ۰ = ارسال از همان روز / ۱ = تحویل از فردا
                </p>
              </div>
            </div>

            {/* Working days checkboxes */}
            <div className="border-t border-neutral-800 pt-5 space-y-3">
              <label className="block text-xs font-semibold text-white">
                روزهای کاری فعال ناوگان توزیع در هفته
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {[
                  { index: 0, label: "شنبه" },
                  { index: 1, label: "یکشنبه" },
                  { index: 2, label: "دوشنبه" },
                  { index: 3, label: "سه‌شنبه" },
                  { index: 4, label: "چهارشنبه" },
                  { index: 5, label: "پنج‌شنبه" },
                  { index: 6, label: "جمعه (تعطیل رسمی)" },
                ].map((d) => {
                  const defaultChecked = config.workingDays.includes(d.index);

                  return (
                    <label
                      key={d.index}
                      className="flex items-center gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name={`workingDay_${d.index}`}
                        defaultChecked={defaultChecked}
                        className="h-4 w-4 rounded border-neutral-700 text-orange-500 focus:ring-orange-500/30 bg-neutral-800 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-white">{d.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Holidays Management */}
            <div className="border-t border-neutral-800 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span>مدیریت روزهای تعطیل رسمی و مناسبتی (Holidays)</span>
                  </label>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    در روزهای مشخص‌شده به عنوان تعطیل، هیچ سفارشی توزیع نشده و تقویم خرید مشتری به صورت خودکار این روزها را نادیده می‌گیرد.
                  </p>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {toPersianDigits(holidays.length)} روز تعطیل ثبت‌شده
                </span>
              </div>

              {/* Quick Add Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <input
                  type="text"
                  value={newHolidayInput}
                  onChange={(e) => setNewHolidayInput(e.target.value)}
                  placeholder="تاریخ به میلادی (YYYY-MM-DD) مثلاً 2026-10-20 یا شمسی"
                  className="flex h-10 flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dir-ltr text-right"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddHoliday();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddHoliday()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>افزودن تعطیلی</span>
                </button>
              </div>

              {/* Presets suggestions */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-400">
                <span>پیشنهادهای آماده:</span>
                {[
                  { label: "۲۸ مهر (تعطیل رسمی)", date: "2026-10-20" },
                  { label: "۶ آبان (شهادت امام)", date: "2026-10-28" },
                  { label: "شب یلدا", date: "2026-12-21" },
                  { label: "عید نوروز (۱ فروردین)", date: "2027-03-21" },
                ].map((p) => (
                  <button
                    key={p.date}
                    type="button"
                    onClick={() => handleAddHoliday(p.date)}
                    className="px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>+ {p.label}</span>
                  </button>
                ))}
              </div>

              {/* Holiday Tags Chips */}
              <div className="flex flex-wrap gap-2 pt-1 min-h-[40px]">
                {holidays.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic py-1">
                    هنوز تاریخ تعطیلی دستی ثبت نشده است (روزهای جمعه به صورت هفتگی تعطیل پیش‌فرض هستند).
                  </p>
                ) : (
                  holidays.map((h) => (
                    <div
                      key={h}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 text-xs font-medium animate-in fade-in"
                    >
                      <span className="font-mono dir-ltr">{h}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHoliday(h)}
                        className="text-red-400 hover:text-red-200 hover:bg-red-900/50 rounded-full p-0.5 transition-colors cursor-pointer"
                        title="حذف این روز تعطیل"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-4 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-orange-950/40 cursor-pointer"
              >
                ذخیره تنظیمات زمان‌بندی
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── TAB 4: Shipping Rate Simulator ────────────────────────────── */}
      {activeTab === "simulator" && (
        <div className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 sm:p-6 space-y-6">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="h-4 w-4 text-orange-500" />
              <span>شبیه‌ساز و تست زنده نرخ ارسال مرسولات</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              جهت اطمینان از عملکرد صحیح شیوه‌های ارسال و قوانین سقف رایگان برای هر استان، می‌توانید شرایط خرید را شبیه‌سازی کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                استان مقصد خریدار
              </label>
              <select
                value={simProvince}
                onChange={(e) => setSimProvince(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                {Object.keys(PROVINCES_AND_CITIES).map((p) => {
                  const cleanP = p.replace(/_/g, " ");
                  return (
                    <option key={p} value={cleanP}>
                      استان {cleanP}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                مبلغ کل سبد خرید (تومان)
              </label>
              <input
                type="number"
                step={50000}
                value={simSubtotal}
                onChange={(e) => setSimSubtotal(parseInt(e.target.value, 10) || 0)}
                className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                مبلغ شبیه‌سازی: {formatPrice(simSubtotal)}
              </span>
            </div>
          </div>

          {/* Results preview */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-white">
              روش‌های قابل نمایش برای خریدار در استان {simProvince}:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {simulatorResult.map(({ method, cost, isFree, neededForFree, effectiveDeliveryTime, isCustomized }) => (
                <div
                  key={method.id}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/80 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-950 border border-neutral-800 text-orange-400 overflow-hidden">
                        {renderCarrierIcon(method)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{method.title}</span>
                          {isCustomized && (
                            <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded-full">
                              تعرفه ویژه استان {simProvince}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-orange-400" />
                          <span>{effectiveDeliveryTime}</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black">
                      {isFree ? (
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[11px]">
                          ارسال رایگان
                        </span>
                      ) : (
                        formatPrice(cost)
                      )}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400">{method.subtitle}</p>

                  {neededForFree > 0 && (
                    <p className="text-[10px] text-amber-400">
                      فاصله تا ارسال رایگان: {formatPrice(neededForFree)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT METHOD MODAL ───────────────────────────────── */}
      <AdminActionModal
        isOpen={isMethodModalOpen}
        onClose={() => {
          setIsMethodModalOpen(false);
          setEditingMethod(null);
        }}
        title={editingMethod ? "ویرایش شیوه ارسال" : "افزودن شیوه ارسال جدید"}
        maxWidth="xl"
        confirmLabel="ذخیره اطلاعات شیوه ارسال"
        cancelLabel="انصراف"
        onConfirm={() => {
          const form = document.getElementById("shipping-method-form") as HTMLFormElement;
          if (form) form.requestSubmit();
        }}
      >
        <form id="shipping-method-form" onSubmit={handleSaveMethod} className="space-y-4 text-right" dir="rtl">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              عنوان شیوه ارسال *
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={editingMethod?.title || ""}
              placeholder="مثال: پیک اختصاصی تهران"
              className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              زیرعنوان توضیحی *
            </label>
            <input
              type="text"
              name="subtitle"
              required
              defaultValue={editingMethod?.subtitle || ""}
              placeholder="مثال: ارسال سریع با بسته‌بندی ضدضربه"
              className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              توضیحات تکمیلی
            </label>
            <textarea
              name="description"
              rows={2}
              defaultValue={editingMethod?.description || ""}
              placeholder="توضیحات در مورد نحوه تحویل و بیمه..."
              className="flex w-full rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                هزینه ارسال پایه (تومان) *
              </label>
              <input
                type="number"
                name="cost"
                min={0}
                required
                defaultValue={editingMethod?.cost ?? 45000}
                className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                سقف ارسال رایگان (تومان - اختیاری)
              </label>
              <input
                type="number"
                name="freeThreshold"
                min={0}
                defaultValue={editingMethod?.freeThreshold ?? ""}
                placeholder="خالی بگذارید اگر ارسال رایگان ندارد"
                className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              زمان تخمینی تحویل پایه *
            </label>
            <input
              type="text"
              name="estimatedDeliveryTime"
              required
              defaultValue={editingMethod?.estimatedDeliveryTime || "۲۴ الی ۴۸ ساعت کاری"}
              placeholder="مثال: امروز یا ۲۴ ساعت کاری"
              className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          {/* Carrier Icon & Logo Selection */}
          <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <label className="block text-xs font-bold text-white">
                  نشان و لوگوی شرکت حمل‌ونقل (حامل) *
                </label>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  انتخاب یکی از آیکون‌های سیستمی یا آپلود نشان تجاری اختصاصی شرکت باربری (بدون واترمارک)
                </p>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setModalIconTab("preset")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modalIconTab === "preset"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  آیکون‌های آماده ({toPersianDigits(PRESET_CARRIER_ICONS.length)})
                </button>
                <button
                  type="button"
                  onClick={() => setModalIconTab("custom")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modalIconTab === "custom"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  آپلود لوگوی اختصاصی
                </button>
              </div>
            </div>

            {modalIconTab === "preset" ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {PRESET_CARRIER_ICONS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = modalIconName === preset.name && !modalIconUrl;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setModalIconName(preset.name);
                        setModalIconUrl(null);
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center gap-1.5 cursor-pointer relative ${
                        isSelected
                          ? "bg-orange-500/15 border-orange-500 text-white ring-1 ring-orange-500/50"
                          : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 left-1.5 h-4 w-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                      <Icon className={`h-6 w-6 ${isSelected ? "text-orange-400" : "text-neutral-400"}`} />
                      <span className="text-[10px] font-medium leading-tight mt-1 line-clamp-1">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="pt-1">
                <AdminImageUploader
                  value={modalIconUrl || undefined}
                  onChange={(url) => setModalIconUrl(url || null)}
                  onUpload={adminShippingApi.uploadCarrierIcon}
                  label="تصویر لوگوی حامل (بدون واترمارک)"
                  hint="فرمت‌های مجاز: SVG، PNG یا WebP با ابعاد پیشنهادی تا ۲۵۶×۲۵۶ پیکسل و پس‌زمینه شفاف"
                  maxSizeMb={2}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="allowedProvincesSelect" className="block text-xs font-semibold text-neutral-300">
                پوشش جغرافیایی و استان‌های مجاز ارسال *
              </label>
              {modalProvinces.length > 0 && (
                <button
                  type="button"
                  onClick={() => setModalProvinces([])}
                  className="text-[11px] text-orange-400 hover:text-orange-300 font-medium transition-colors cursor-pointer"
                >
                  بازنشانی به تمامی استان‌ها (پوشش سراسری)
                </button>
              )}
            </div>

            {/* Select Dropdown with <option> tags */}
            <div className="relative">
              <select
                id="allowedProvincesSelect"
                value={modalProvinces.length === 0 ? "ALL" : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val === "ALL") {
                    setModalProvinces([]);
                  } else {
                    if (!modalProvinces.includes(val)) {
                      setModalProvinces((prev) => [...prev, val]);
                    }
                  }
                }}
                className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer"
              >
                <option value="ALL">🌍 تمامی استان‌ها (پوشش سراسری کشور)</option>
                <option value="" disabled>────────── انتخاب استان خاص جهت افزودن ──────────</option>
                {IRAN_PROVINCES.map((prov) => {
                  const isSelected = modalProvinces.includes(prov);
                  return (
                    <option key={prov} value={prov} disabled={isSelected}>
                      استان {prov} {isSelected ? "✓ (قبلاً اضافه شده)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Hidden field for standard form submission */}
            <input type="hidden" name="allowedProvinces" value={modalProvinces.join(",")} />

            {/* Visual feedback & chips of allowed provinces */}
            <div className="min-h-[42px] p-2.5 rounded-xl border border-neutral-800/80 bg-neutral-950/70 flex flex-wrap items-center gap-1.5">
              {modalProvinces.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    پوشش سراسری: این روش ارسال برای <strong>تمامی استان‌های کشور</strong> فعال است.
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-[11px] text-neutral-400 font-medium ml-1">
                    استان‌های مجاز ({toPersianDigits(modalProvinces.length)} استان):
                  </span>
                  {modalProvinces.map((prov) => (
                    <span
                      key={prov}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-300 bg-orange-950/50 border border-orange-500/30 px-2.5 py-1 rounded-lg"
                    >
                      <span>استان {prov}</span>
                      <button
                        type="button"
                        onClick={() => setModalProvinces((prev) => prev.filter((p) => p !== prov))}
                        className="text-orange-400 hover:text-white hover:bg-orange-500/30 rounded p-0.5 transition-colors cursor-pointer"
                        title={`حذف استان ${prov}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </>
              )}
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              با انتخاب گزینه <strong>«تمامی استان‌ها (سراسر کشور)»</strong> این شیوه برای همه استان‌ها ارائه می‌شود. با انتخاب استان‌های اختصاصی، تحویل فقط برای مشتریان آن استان‌ها فعال خواهد بود.
            </p>
          </div>

          {/* Province Custom Rules Section */}
          <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
            <div className="border-b border-neutral-800 pb-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  <span>تعرفه و قوانین اختصاصی بر اساس استان</span>
                </h4>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {toPersianDigits(modalProvinceRules.length)} قانون استانی
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                می‌توانید برای هر استان هزینه متفاوتی تعیین کنید، زمان تحویل را تغییر دهید، سقف ارسال رایگان اختصاصی بگذارید، یا ارسال به آن استان را کاملاً رایگان کنید.
              </p>
            </div>

            {/* Input Row for New Rule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  استان مقصد
                </label>
                <select
                  value={newRuleProvince}
                  onChange={(e) => setNewRuleProvince(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                >
                  {IRAN_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      استان {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  هزینه ارسال اختصاصی (تومان)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  disabled={newRuleIsFree}
                  value={newRuleCost}
                  onChange={(e) => setNewRuleCost(e.target.value)}
                  placeholder={newRuleIsFree ? "ارسال رایگان است" : "پیش‌فرض روش"}
                  className="flex h-9 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  زمان تقریبی تحویل این استان
                </label>
                <input
                  type="text"
                  value={newRuleDeliveryTime}
                  onChange={(e) => setNewRuleDeliveryTime(e.target.value)}
                  placeholder="مثال: ۲۴ ساعته یا ۱ روزه"
                  className="flex h-9 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  سقف ارسال رایگان این استان
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  disabled={newRuleIsFree}
                  value={newRuleThreshold}
                  onChange={(e) => setNewRuleThreshold(e.target.value)}
                  placeholder={newRuleIsFree ? "همیشه رایگان" : "تومان"}
                  className="flex h-9 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRuleIsFree}
                  onChange={(e) => setNewRuleIsFree(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 text-orange-500 focus:ring-orange-500/30 bg-neutral-800 cursor-pointer"
                />
                <span className="text-xs font-semibold text-emerald-400">
                  ارسال به استان {newRuleProvince} کاملاً رایگان باشد (Free Shipping)
                </span>
              </label>

              <button
                type="button"
                onClick={handleAddProvinceRule}
                className="inline-flex items-center gap-1.5 px-4 h-8 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ثبت تعرفه استان {newRuleProvince}</span>
              </button>
            </div>

            {/* List of Active Rules */}
            {modalProvinceRules.length > 0 ? (
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-semibold text-neutral-400">
                  قوانین فعال برای این روش ارسال:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {modalProvinceRules.map((rule) => (
                    <div
                      key={rule.province}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">استان {rule.province}</span>
                          {rule.isFree ? (
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                              کاملاً رایگان
                            </span>
                          ) : rule.cost !== undefined ? (
                            <span className="text-[11px] font-bold text-amber-300">
                              {formatPrice(rule.cost)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">هزینه پایه</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                          {rule.estimatedDeliveryTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-orange-400" />
                              <span>{rule.estimatedDeliveryTime}</span>
                            </span>
                          )}
                          {!rule.isFree && rule.freeThreshold != null && (
                            <span>
                              رایگان از: {formatPrice(rule.freeThreshold)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveProvinceRule(rule.province)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/40 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="حذف قانون این استان"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500 italic pt-1">
                هنوز هیچ تعرفه اختصاصی استانی تعریف نشده است (همان هزینه و زمان پایه برای تمام استان‌ها اعمال می‌شود).
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isExpressCheck"
              name="isExpress"
              defaultChecked={editingMethod?.isExpress || false}
              className="h-4 w-4 rounded border-neutral-700 text-orange-500 focus:ring-orange-500/30 bg-neutral-800 cursor-pointer"
            />
            <label htmlFor="isExpressCheck" className="text-xs font-medium text-white cursor-pointer">
              این روش، اکسپرس فوری با اولویت ارسال بالا است
            </label>
          </div>
        </form>
      </AdminActionModal>

      {/* ── CREATE / EDIT TIME SLOT MODAL ────────────────────────────── */}
      <AdminActionModal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setEditingSlot(null);
        }}
        title={editingSlot ? "ویرایش بازه زمانی تحویل" : "افزودن بازه زمانی جدید"}
        maxWidth="md"
        confirmLabel="ذخیره بازه زمانی"
        cancelLabel="انصراف"
        onConfirm={() => {
          const form = document.getElementById("time-slot-form") as HTMLFormElement;
          if (form) form.requestSubmit();
        }}
      >
        <form id="time-slot-form" onSubmit={handleSaveSlot} className="space-y-4 text-right" dir="rtl">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              عنوان بازه زمانی *
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={editingSlot?.title || ""}
              placeholder="مثال: صبح (ساعت ۹:۰۰ الی ۱۳:۰۰)"
              className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                ساعت شروع (HH:mm) *
              </label>
              <input
                type="text"
                name="startTime"
                required
                defaultValue={editingSlot?.startTime || "09:00"}
                placeholder="09:00"
                className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                ساعت پایان (HH:mm) *
              </label>
              <input
                type="text"
                name="endTime"
                required
                defaultValue={editingSlot?.endTime || "13:00"}
                placeholder="13:00"
                className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white dir-ltr text-right"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              توضیحات تکمیلی
            </label>
            <input
              type="text"
              name="description"
              defaultValue={editingSlot?.description || ""}
              placeholder="مثال: تحویل قبل از ظهر در ساعات اداری"
              className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              حداکثر ظرفیت سفارش روزانه
            </label>
            <input
              type="number"
              name="maxCapacity"
              min={1}
              defaultValue={editingSlot?.maxCapacity || 40}
              className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white"
            />
          </div>
        </form>
      </AdminActionModal>

      {/* ── DELETE METHOD CONFIRMATION MODAL ─────────────────────────── */}
      <AdminActionModal
        isOpen={Boolean(isDeletingMethod)}
        onClose={() => setIsDeletingMethod(null)}
        title="تأیید حذف شیوه ارسال"
        description={`آیا از حذف شیوه ارسال "${isDeletingMethod?.title}" اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
        variant="danger"
        confirmLabel="بله، حذف کن"
        cancelLabel="انصراف"
        onConfirm={handleDeleteMethod}
      />

      {/* ── DELETE SLOT CONFIRMATION MODAL ───────────────────────────── */}
      <AdminActionModal
        isOpen={Boolean(isDeletingSlot)}
        onClose={() => setIsDeletingSlot(null)}
        title="تأیید حذف بازه زمانی"
        description={`آیا از حذف بازه زمانی "${isDeletingSlot?.title}" اطمینان دارید؟`}
        variant="danger"
        confirmLabel="بله، حذف کن"
        cancelLabel="انصراف"
        onConfirm={handleDeleteSlot}
      />
    </div>
  );
}
