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
} from "lucide-react";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { InstallationServiceCategory } from "../types";

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

export function InstallationCalculator({ onApplyToForm }: InstallationCalculatorProps) {
  const [nodeCount, setNodeCount] = React.useState<number>(24);
  const [cctvCount, setCctvCount] = React.useState<number>(8);
  const [cableMeters, setCableMeters] = React.useState<number>(250);
  const [rackCount, setRackCount] = React.useState<number>(1);
  const [cableType, setCableType] = React.useState<"cat6_utp" | "cat6a_sftp" | "fiber">("cat6a_sftp");
  const [needsFlukeTest, setNeedsFlukeTest] = React.useState<boolean>(true);

  // Live estimate logic based on industry rates in Iran (Tomans)
  const calculation = React.useMemo(() => {
    // Base unit rates (Tomans)
    const baseNodeFee = cableType === "cat6a_sftp" ? 170000 : cableType === "fiber" ? 220000 : 135000;
    const baseCctvFee = 310000;
    const trunkPerMeterFee = 45000;
    const rackMountAndArrangementFee = 3500000;
    const flukeTestPerNode = needsFlukeTest ? 55000 : 0;

    // Total labor / execution cost
    const rawCost =
      nodeCount * (baseNodeFee + flukeTestPerNode) +
      cctvCount * baseCctvFee +
      cableMeters * trunkPerMeterFee +
      rackCount * rackMountAndArrangementFee;

    // Min and Max spread (+- 10%)
    const minCost = Math.round((rawCost * 0.92) / 50000) * 50000;
    const maxCost = Math.round((rawCost * 1.1) / 50000) * 50000;

    // Estimated work days
    const totalWorkUnits = nodeCount * 1 + cctvCount * 1.5 + rackCount * 4 + cableMeters * 0.05;
    let days = 1;
    let technicians = 2;

    if (totalWorkUnits > 180) {
      days = Math.ceil(totalWorkUnits / 80);
      technicians = 4;
    } else if (totalWorkUnits > 90) {
      days = Math.ceil(totalWorkUnits / 50);
      technicians = 3;
    } else if (totalWorkUnits > 35) {
      days = 2;
      technicians = 2;
    } else {
      days = 1;
      technicians = 2;
    }

    return {
      minCost,
      maxCost,
      days,
      technicians,
    };
  }, [nodeCount, cctvCount, cableMeters, rackCount, cableType, needsFlukeTest]);

  const handleApply = () => {
    // Choose primary service category based on inputs
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
          {/* Inputs Section (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-right">
            {/* 1. Node Count Slider */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="node-slider" className="text-xs sm:text-sm font-semibold text-neutral-200 min-w-0">
                  تعداد نودهای شبکه و کیستون RJ45:
                </label>
                <span className="font-mono text-xs sm:text-base font-bold text-orange-400 bg-orange-500/10 px-2 sm:px-2.5 py-0.5 rounded-lg border border-orange-500/20 shrink-0 whitespace-nowrap">
                  {toPersianDigits(nodeCount)} پورت
                </span>
              </div>
              <input
                id="node-slider"
                type="range"
                min={4}
                max={200}
                step={2}
                value={nodeCount}
                onChange={(e) => setNodeCount(Number(e.target.value))}
                className="w-full accent-orange-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>۴ نود (دفتر کوچک)</span>
                <span>۵۰ نود</span>
                <span>۲۰۰ نود (سازمان بزرگ)</span>
              </div>
            </div>

            {/* 2. CCTV Count Slider */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="cctv-slider" className="text-xs sm:text-sm font-semibold text-neutral-200 min-w-0">
                  تعداد دوربین‌های مداربسته IP:
                </label>
                <span className="font-mono text-xs sm:text-base font-bold text-sky-400 bg-sky-500/10 px-2 sm:px-2.5 py-0.5 rounded-lg border border-sky-500/20 shrink-0 whitespace-nowrap">
                  {toPersianDigits(cctvCount)} عدد دوربین
                </span>
              </div>
              <input
                id="cctv-slider"
                type="range"
                min={0}
                max={48}
                step={2}
                value={cctvCount}
                onChange={(e) => setCctvCount(Number(e.target.value))}
                className="w-full accent-sky-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>بدون دوربین</span>
                <span>۱۶ عدد</span>
                <span>۴۸ عدد (کارخانجات)</span>
              </div>
            </div>

            {/* 3. Cable & Trunk Meters */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="cable-slider" className="text-xs sm:text-sm font-semibold text-neutral-200 min-w-0">
                  متراژ تقریبی ترانکینگ و کابل‌کشی:
                </label>
                <span className="font-mono text-xs sm:text-base font-bold text-emerald-400 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 rounded-lg border border-emerald-500/20 shrink-0 whitespace-nowrap">
                  {toPersianDigits(cableMeters)} متر
                </span>
              </div>
              <input
                id="cable-slider"
                type="range"
                min={30}
                max={1500}
                step={20}
                value={cableMeters}
                onChange={(e) => setCableMeters(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>۳۰ متر</span>
                <span>۵۰۰ متر</span>
                <span>۱,۵۰۰ متر</span>
              </div>
            </div>

            {/* 4. Racks Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-neutral-800 bg-neutral-900/50">
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                  تعداد رک‌های نیازمند آرایش و مونتاژ:
                </span>
                <span className="text-[11px] text-neutral-400">
                  شامل پچ‌پنل، نگهدارنده کابل و نظم‌دهی استاندارد
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setRackCount((prev) => Math.max(0, prev - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-95 font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-white min-w-[2rem] text-center">
                  {toPersianDigits(rackCount)}
                </span>
                <button
                  type="button"
                  onClick={() => setRackCount((prev) => Math.min(10, prev + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-95 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 5. Cable Type Selection */}
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                استاندارد کابل مورد نظر:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: "cat6_utp", label: "Cat6 UTP تمام مس", desc: "مناسب ادارات تا ۱Gbps" },
                  { id: "cat6a_sftp", label: "Cat6A SFTP شیلددار", desc: "حداکثر سرعت 10Gbps ضد نویز" },
                  { id: "fiber", label: "فیبر نوری (Fiber)", desc: "فواصل طولانی و دیتاسنتر" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setCableType(type.id as any)}
                    className={`flex flex-col p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      cableType === type.id
                        ? "border-orange-500/80 bg-orange-500/10 text-white shadow-sm"
                        : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-800/60"
                    }`}
                  >
                    <span className="text-xs font-bold text-neutral-100">{type.label}</span>
                    <span className="text-[10px] text-neutral-400 mt-1">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Fluke Test Toggle */}
            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/50 cursor-pointer select-none">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                    تست فلوک ۱۰۰٪ با دستگاه کالیبره Fluke DSX-8000
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    همراه با خروجی کتابچه سرتیفیکیت و ضمانت رسمی عملکرد
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={needsFlukeTest}
                onChange={(e) => setNeedsFlukeTest(e.target.checked)}
                className="h-5 w-5 accent-orange-500 rounded cursor-pointer"
              />
            </label>
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
                  <span>۱۸ ماه ضمانت مکتوب و پشتیبانی فنی ۲۴ ساعته</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>لیبل‌گذاری دوطرفه استاندارد TIA-606</span>
                </div>
                {needsFlukeTest && (
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
