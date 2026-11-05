"use client";

import * as React from "react";
import {
  Calculator,
  Layers,
  Sparkles,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  TrendingDown,
  Info,
  Package,
  Sliders,
  PlusCircle,
  Radio,
} from "lucide-react";
import { formatPrice, toPersianDigits, cn } from "@/shared/lib/utils";
import type {
  CalculatorItem,
  CalculatorSettings,
  InstallationServiceCategory,
} from "../types";
import { installationApi } from "../api/installation-api";

interface InstallationCalculatorProps {
  onApplyToForm: (data: {
    serviceType: InstallationServiceCategory;
    nodeCount: number;
    cctvCount: number;
    approximateArea: number;
    rackCount: number;
    needsFlukeTest: boolean;
  }) => void;
}

// Initial fallback configuration to ensure zero flicker on first render
const FALLBACK_ITEMS: CalculatorItem[] = [
  {
    id: "nodes",
    title: "تعداد نودهای شبکه و کیستون RJ45",
    description: "شامل کابل‌کشی، پانچ کیستون و فیس‌پلیت",
    fieldType: "SLIDER",
    serviceCategory: "cabling",
    order: 1,
    isActive: true,
    min: 4,
    max: 200,
    step: 2,
    defaultValue: 24,
    unit: "پورت",
    color: "orange",
    markers: [
      { value: 4, label: "۴ نود (دفتر کوچک)" },
      { value: 50, label: "۵۰ نود" },
      { value: 200, label: "۲۰۰ نود (سازمان بزرگ)" },
    ],
    pricingType: "MANUAL",
    unitPrice: 170000,
    workHoursPerUnit: 1.0,
  },
  {
    id: "cctv",
    title: "تعداد دوربین‌های مداربسته IP",
    description: "نصب فیزیکی، تنظیم زاویه دید و اتصال به NVR",
    fieldType: "SLIDER",
    serviceCategory: "cctv",
    order: 2,
    isActive: true,
    min: 0,
    max: 48,
    step: 2,
    defaultValue: 8,
    unit: "عدد دوربین",
    color: "sky",
    markers: [
      { value: 0, label: "بدون دوربین" },
      { value: 16, label: "۱۶ عدد" },
      { value: 48, label: "۴۸ عدد (کارخانجات)" },
    ],
    pricingType: "MANUAL",
    unitPrice: 310000,
    workHoursPerUnit: 1.5,
  },
  {
    id: "cabling_meters",
    title: "متراژ تقریبی ترانکینگ و کابل‌کشی",
    description: "نصب داکت و ترانک دیواری ۵۰×۱۰۵ و عبور کابل‌ها",
    fieldType: "SLIDER",
    serviceCategory: "cabling",
    order: 3,
    isActive: true,
    min: 30,
    max: 1500,
    step: 20,
    defaultValue: 250,
    unit: "متر",
    color: "emerald",
    markers: [
      { value: 30, label: "۳۰ متر" },
      { value: 500, label: "۵۰۰ متر" },
      { value: 1500, label: "۱,۵۰۰ متر" },
    ],
    pricingType: "MANUAL",
    unitPrice: 45000,
    workHoursPerUnit: 0.05,
  },
  {
    id: "rack_units",
    title: "تعداد رک‌های نیازمند آرایش و مونتاژ",
    description: "شامل پچ‌پنل، نگهدارنده کابل و نظم‌دهی استاندارد",
    fieldType: "STEPPER",
    serviceCategory: "datacenter",
    order: 4,
    isActive: true,
    min: 0,
    max: 10,
    step: 1,
    defaultValue: 1,
    unit: "رک",
    pricingType: "MANUAL",
    unitPrice: 3500000,
    workHoursPerUnit: 4.0,
  },
  {
    id: "cable_standard",
    title: "استاندارد کابل مورد نظر",
    description: "تعیین کلاس کابل‌کشی و سطح حفاظت نویز",
    fieldType: "OPTIONS",
    serviceCategory: "cabling",
    order: 5,
    isActive: true,
    defaultOptionId: "cat6a_sftp",
    calculationMode: "ADD_PER_UNIT",
    options: [
      { id: "cat6_utp", label: "Cat6 UTP تمام مس", description: "مناسب ادارات تا ۱Gbps", pricingType: "MANUAL", unitPrice: 135000, isDefault: false },
      { id: "cat6a_sftp", label: "Cat6A SFTP شیلددار", description: "حداکثر سرعت 10Gbps ضد نویز", pricingType: "MANUAL", unitPrice: 170000, isDefault: true },
      { id: "fiber", label: "فیبر نوری (Fiber)", description: "فواصل طولانی و دیتاسنتر", pricingType: "MANUAL", unitPrice: 220000, isDefault: false },
    ],
    pricingType: "MANUAL",
    unitPrice: 0,
    workHoursPerUnit: 0,
  },
  {
    id: "fluke_test",
    title: "تست فلوک ۱۰۰٪ با دستگاه کالیبره Fluke DSX-8000",
    description: "همراه با خروجی کتابچه سرتیفیکیت و ضمانت رسمی عملکرد",
    fieldType: "CHECKBOX",
    serviceCategory: "cabling",
    order: 6,
    isActive: true,
    defaultChecked: true,
    badge: "تست رسمی فلوک",
    pricingType: "MANUAL",
    unitPrice: 55000,
    workHoursPerUnit: 0.1,
  },
];

const FALLBACK_SETTINGS: CalculatorSettings = {
  minProjectCost: 2000000,
  spreadMinPercent: 0.92,
  spreadMaxPercent: 1.1,
  roundToNearest: 50000,
  workUnitsPerDaySmall: 50,
  workUnitsPerDayLarge: 80,
  minTechnicians: 2,
  warrantyMonths: 18,
  consultationPhone: "۰۲۱ - ۸۸۸۸ ۸۸۸۸",
};

export function InstallationCalculator({ onApplyToForm }: InstallationCalculatorProps) {
  const [items, setItems] = React.useState<CalculatorItem[]>(FALLBACK_ITEMS);
  const [settings, setSettings] = React.useState<CalculatorSettings>(FALLBACK_SETTINGS);
  const [formValues, setFormValues] = React.useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    FALLBACK_ITEMS.forEach((item) => {
      if (item.fieldType === "CHECKBOX") {
        initial[item.id] = item.defaultChecked ?? false;
      } else if (item.fieldType === "OPTIONS") {
        initial[item.id] = item.defaultOptionId || item.options?.[0]?.id || "";
      } else {
        initial[item.id] = item.defaultValue ?? item.min ?? 0;
      }
    });
    return initial;
  });

  // Fetch real-time customized configuration from backend
  React.useEffect(() => {
    let isMounted = true;
    installationApi
      .getCalculatorConfig()
      .then((res) => {
        if (!isMounted) return;
        if (res && Array.isArray(res.items) && res.items.length > 0) {
          setItems(res.items);
          if (res.settings) {
            setSettings(res.settings);
          }

          // Merge current values with loaded defaults
          setFormValues((prev) => {
            const next = { ...prev };
            res.items.forEach((item) => {
              if (next[item.id] === undefined) {
                if (item.fieldType === "CHECKBOX") {
                  next[item.id] = item.defaultChecked ?? false;
                } else if (item.fieldType === "OPTIONS") {
                  next[item.id] = item.defaultOptionId || item.options?.[0]?.id || "";
                } else {
                  next[item.id] = item.defaultValue ?? item.min ?? 0;
                }
              }
            });
            return next;
          });
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote calculator config, using default fallback:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Live estimate calculation logic based on dynamic items and live pricing
  const calculation = React.useMemo(() => {
    let rawCost = 0;
    let totalWorkUnits = 0;

    items.forEach((item) => {
      if (!item.isActive) return;

      const val = formValues[item.id];

      if (item.fieldType === "SLIDER" || item.fieldType === "STEPPER") {
        const qty = Number(val ?? item.defaultValue ?? item.min ?? 0);
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

    const spreadMin = settings.spreadMinPercent || 0.92;
    const spreadMax = settings.spreadMaxPercent || 1.1;
    const roundTo = settings.roundToNearest || 50000;
    const minFloor = settings.minProjectCost || 2000000;

    const minCost = Math.max(minFloor, Math.round((rawCost * spreadMin) / roundTo) * roundTo);
    const maxCost = Math.max(minFloor, Math.round((rawCost * spreadMax) / roundTo) * roundTo);

    let days = 1;
    let technicians = settings.minTechnicians || 2;
    const thresholdLarge = settings.workUnitsPerDayLarge || 80;
    const thresholdSmall = settings.workUnitsPerDaySmall || 50;

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
    };
  }, [items, formValues, settings]);

  const handleApply = () => {
    // Extract standard metrics to bridge to request form
    const nodeCount = Number(formValues["nodes"] ?? formValues["node_count"] ?? 24);
    const cctvCount = Number(formValues["cctv"] ?? formValues["cctv_count"] ?? 0);
    const cableMeters = Number(formValues["cabling_meters"] ?? 250);
    const rackCount = Number(formValues["rack_units"] ?? formValues["rack_count"] ?? 1);
    const needsFlukeTest = Boolean(formValues["fluke_test"] ?? true);
    const cableType = formValues["cable_standard"] || "cat6a_sftp";

    let primaryService: InstallationServiceCategory = "cabling";
    if (cctvCount > nodeCount && cctvCount > 0) {
      primaryService = "cctv";
    } else if (rackCount > 1 && nodeCount > 50) {
      primaryService = "datacenter";
    } else if (cableType === "fiber") {
      primaryService = "fiber";
    }

    onApplyToForm({
      serviceType: primaryService,
      nodeCount,
      cctvCount,
      approximateArea: Math.round(cableMeters * 0.8),
      rackCount,
      needsFlukeTest,
    });
  };

  const getColorClasses = (color?: string) => {
    switch (color) {
      case "sky":
        return {
          accent: "accent-sky-500",
          text: "text-sky-400",
          bg: "bg-sky-500/10",
          border: "border-sky-500/20",
        };
      case "emerald":
        return {
          accent: "accent-emerald-500",
          text: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
        };
      case "amber":
        return {
          accent: "accent-amber-500",
          text: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
        };
      case "purple":
        return {
          accent: "accent-purple-500",
          text: "text-purple-400",
          bg: "bg-purple-500/10",
          border: "border-purple-500/20",
        };
      case "orange":
      default:
        return {
          accent: "accent-orange-500",
          text: "text-orange-400",
          bg: "bg-orange-500/10",
          border: "border-orange-500/20",
        };
    }
  };

  const activeItems = items.filter((i) => i.isActive).sort((a, b) => a.order - b.order);

  return (
    <section id="installation-calculator" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Section Header */}
      <div className="flex flex-col gap-2 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-orange-400">
          <Calculator className="h-4 w-4" />
          <span>تخمین آنی و بدون تعهد</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          محاسبه‌گر آنلاین هزینه و زمان‌بندی اجرای پروژه
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          با تغییر مشخصات پروژه خود، بازه دستمزد مهندسی و تعداد روزهای لازم برای پیاده‌سازی را به صورت زنده مشاهده کنید.
        </p>
      </div>

      {/* Main Calculator Grid */}
      <div className="rounded-3xl border border-neutral-800/90 bg-[#121216] p-5 sm:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Dynamic Inputs Section (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-right">
            {activeItems.map((item) => {
              const currentValue = formValues[item.id];
              const colorCls = getColorClasses(item.color);

              // 1. SLIDER FIELD
              if (item.fieldType === "SLIDER") {
                const min = item.min ?? 0;
                const max = item.max ?? 100;
                const step = item.step ?? 1;
                const val = Number(currentValue ?? item.defaultValue ?? min);

                return (
                  <div key={item.id} className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={`calc-${item.id}`} className="text-xs sm:text-sm font-semibold text-neutral-200 min-w-0">
                        {item.title}:
                      </label>
                      <span
                        className={cn(
                          "font-mono text-xs sm:text-base font-bold px-2 sm:px-2.5 py-0.5 rounded-lg border shrink-0 whitespace-nowrap",
                          colorCls.bg,
                          colorCls.text,
                          colorCls.border
                        )}
                      >
                        {toPersianDigits(val)} {item.unit}
                      </span>
                    </div>

                    <input
                      id={`calc-${item.id}`}
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={val}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                      }
                      className={cn("w-full h-2 bg-neutral-800 rounded-lg cursor-pointer", colorCls.accent)}
                    />

                    {item.markers && item.markers.length > 0 && (
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                        {item.markers.map((marker, mIdx) => (
                          <span key={mIdx}>{marker.label}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // 2. STEPPER (+ / -) FIELD
              if (item.fieldType === "STEPPER") {
                const min = item.min ?? 0;
                const max = item.max ?? 50;
                const step = item.step ?? 1;
                const val = Number(currentValue ?? item.defaultValue ?? min);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/50"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                        {item.title}:
                      </span>
                      {item.description && (
                        <span className="text-[11px] text-neutral-400 mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setFormValues((prev) => ({
                            ...prev,
                            [item.id]: Math.max(min, val - step),
                          }))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-95 font-bold cursor-pointer"
                        aria-label="کاهش"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-white min-w-[2.5rem] text-center">
                        {toPersianDigits(val)} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormValues((prev) => ({
                            ...prev,
                            [item.id]: Math.min(max, val + step),
                          }))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-95 font-bold cursor-pointer"
                        aria-label="افزایش"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              }

              // 3. OPTIONS FIELD (Radio Cards)
              if (item.fieldType === "OPTIONS") {
                const selectedOptId = currentValue || item.defaultOptionId || item.options?.[0]?.id;

                return (
                  <div key={item.id} className="flex flex-col gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                      {item.title}:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {(item.options || []).map((opt) => {
                        const isSelected = selectedOptId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              setFormValues((prev) => ({ ...prev, [item.id]: opt.id }))
                            }
                            className={cn(
                              "flex flex-col p-3 rounded-xl border text-right transition-all cursor-pointer",
                              isSelected
                                ? "border-orange-500/80 bg-orange-500/10 text-white shadow-sm"
                                : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-800/60"
                            )}
                          >
                            <span className="text-xs font-bold text-neutral-100">{opt.label}</span>
                            {opt.description && (
                              <span className="text-[10px] text-neutral-400 mt-1">{opt.description}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // 4. CHECKBOX FIELD
              if (item.fieldType === "CHECKBOX") {
                const isChecked = !!currentValue;

                return (
                  <label
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/50 cursor-pointer select-none hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                          {item.title}
                        </span>
                        {item.description && (
                          <span className="text-[11px] text-neutral-400 mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, [item.id]: e.target.checked }))
                      }
                      className="h-5 w-5 accent-orange-500 rounded cursor-pointer"
                    />
                  </label>
                );
              }

              return null;
            })}
          </div>

          {/* Output Estimation Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#181615] via-[#131215] to-[#0f0e11] p-6 shadow-2xl overflow-hidden text-right">
              {/* Top pill */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-5">
                <span className="text-xs font-bold text-neutral-300">خلاصه برآورد اولیه</span>
                <span className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  REAL-TIME ESTIMATE
                </span>
              </div>

              {/* Price Range */}
              <div className="flex flex-col gap-1 mb-6">
                <span className="text-xs text-neutral-400">بازه تخمینی هزینه دستمزد و اجرا:</span>
                <div className="flex items-baseline gap-2 flex-wrap" dir="rtl">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono whitespace-nowrap">
                    {calculation.minCost.toLocaleString("fa-IR")}
                  </span>
                  <span className="text-xs text-neutral-400">الی</span>
                  <span className="text-xl sm:text-2xl font-black text-orange-400 font-mono whitespace-nowrap">
                    {calculation.maxCost.toLocaleString("fa-IR")}
                  </span>
                  <span className="text-xs font-bold text-neutral-300">تومان</span>
                </div>
                <span className="text-[10px] text-neutral-500 mt-1">
                  * مبلغ نهایی پس از بازدید حضوری رایگان کارشناس به صورت قطعی اعلام می‌گردد.
                </span>
              </div>

              {/* Metric badges */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                  <Clock className="h-5 w-5 text-sky-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400">زمان تخمینی اجرا:</span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {toPersianDigits(calculation.days)} روز کاری
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                  <Users className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-400">تیم اعزامی:</span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {toPersianDigits(calculation.technicians)} تکنسین مجرب
                    </span>
                  </div>
                </div>
              </div>

              {/* What's included */}
              <div className="space-y-2 border-t border-neutral-800/80 pt-4 mb-6 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{toPersianDigits(settings.warrantyMonths || 18)} ماه ضمانت مکتوب و پشتیبانی فنی ۲۴ ساعته</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>لیبل‌گذاری دوطرفه استاندارد TIA-606</span>
                </div>
                {formValues["fluke_test"] && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>تحویل ریپورت گرافیکی تست فلوک DSX-8000</span>
                  </div>
                )}
              </div>

              {/* Transfer CTA */}
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xl shadow-[var(--theme-primary)]/25 transition-all cursor-pointer"
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span>انتقال این برآورد به فرم ثبت درخواست</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
