"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Activity,
  Warehouse,
  Truck,
  Headset,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface PipelineStep {
  id: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  metrics: string;
  equipment: string[];
  sla: string;
  icon: React.ElementType;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "import",
    stepNumber: "۰۱",
    title: "واردات مستقیم و ترخیص قانونی",
    shortDesc: "تامین مستقیم از مبادی رسمی با برگه سبز گمرک",
    fullDesc:
      "تجهیزات بدون دخالت واسطه‌های محلی از دفاتر دبی و اروپا به طور مستقیم خریداری شده و با رعایت استانداردهای قانونی و گمرکی وارد کشور می‌شوند تا ریسک تجهیزات دست‌دوم (Refurbished) یا فیک به صفر برسد.",
    metrics: "۱۰۰٪ کالای پلمپ اورجینال",
    equipment: ["Cisco Systems", "MikroTik", "Legrand", "Nexans"],
    sla: "اعتبارسنجی سریال قبل از سفارش",
    icon: Globe,
  },
  {
    id: "lab",
    stepNumber: "۰۲",
    title: "تست سخت‌افزاری و لابراتوار فلوک",
    shortDesc: "سنجش عملکرد زیر بار واقعی و آزمون فرکانسی",
    fullDesc:
      "در لابراتوار فنی ققنوس آکادمی، هر نمونه کابل شبکه با دستگاه Fluke DSX-8000 تحت تست Channel و Permanent Link قرار می‌گیرد. همچنین سوئیچ‌های سیسکو از نظر سلامت پورت‌ها، فن‌ها، توان پاور و عدم وجود لود غیرعادی مانیتور می‌شوند.",
    metrics: "صدور گزارش رسمی Fluke Test",
    equipment: ["Fluke DSX-8000", "OTDR Fiber Tester", "Smart PDU Load"],
    sla: "تست ۱۰۰٪ تصادفی کابل‌ها و بچ‌های ورودی",
    icon: Activity,
  },
  {
    id: "warehouse",
    stepNumber: "۰۳",
    title: "انبارداری مکانیزه و حفاظت ضد الکتریسیته",
    shortDesc: "انبار ۳۰۰۰ متری با کنترل رطوبت و دما",
    fullDesc:
      "تجهیزات الکترونیکی حساس در محیط استاندارد آنتی‌استاتیک (ESD Protected) با بسته‌بندی مقاوم در برابر ضربات فیزیکی نگهداری می‌شوند. بیش از ۴۵۰۰ ردیف کالا همواره آماده صدور و بارگیری آنی هستند.",
    metrics: "بیش از ۴,۵۰۰ تنوع آماده ارسال",
    equipment: ["سامانه مکانیزه WMS", "کفپوش آنتی‌استاتیک", "پالت‌بندی ایمن"],
    sla: "آماده‌سازی سفارش ظرف کمتر از ۴۵ دقیقه",
    icon: Warehouse,
  },
  {
    id: "logistics",
    stepNumber: "۰۴",
    title: "لجستیک اکسپرس و تحویل سازمانی",
    shortDesc: "ارسال سریع کمتر از ۳ ساعت در تهران و ۲۴ ساعت شهرستان",
    fullDesc:
      "ناوگان حمل اختصاصی ققنوس آکادمی سفارش‌های اورژانسی شبکه را با نهایت سرعت تحویل کارفرمایان می‌دهد. بسته‌های شهرستان با بیمه کامل ارزش بار و بیمه شکستگی حمل می‌شوند.",
    metrics: "۹۹.۴٪ تحویل به موقع (On-Time)",
    equipment: ["پیک اختصاصی تهران", "حمل هوایی اکسپرس", "باربری معتبر ویژه"],
    sla: "تحویل فوری کمتر از ۳ ساعت در تهران",
    icon: Truck,
  },
  {
    id: "support",
    stepNumber: "۰۵",
    title: "امداد فنی ۲۴/۷ و گارانتی طلایی",
    shortDesc: "مشاوره نصب، تست و تعویض بی‌قید و شرط ۱۸ ماهه",
    fullDesc:
      "تیم مهندسی پس از تحویل کالا نیز در کنار شماست. در صورت بروز هرگونه ابهام در کانفیگ، ناسازگاری ماژول‌ها یا نیاز به اعزام کارشناس به محل، پشتیبانی ۲۴ ساعته فعال است.",
    metrics: "۱۸ ماه گارانتی تعویض بی قید و شرط",
    equipment: ["تیم کشیک ۲۴ ساعته", "مهندسان سطح CCIE", "امکان اعزام فوری"],
    sla: "پاسخگویی به موارد اضطراری زیر ۱۵ دقیقه",
    icon: Headset,
  },
];

export function AboutInteractiveArchitecture() {
  const [activeStepId, setActiveStepId] = React.useState<string>("lab");

  const currentStep =
    PIPELINE_STEPS.find((s) => s.id === activeStepId) || PIPELINE_STEPS[1];

  return (
    <section className="py-12 sm:py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1.5 text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400">
              <Zap className="h-3.5 w-3.5" />
              <span>فرایند کنترل کیفیت و زنجیره ارزش</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              چرخه ۵ مرحله‌ای تضمین کیفیت کالا تا تحویل
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md text-right leading-relaxed">
            روی هر مرحله کلیک کنید تا جزئیات لابراتوار تست، انبار مکانیزه و سازوکار تضمین اصالت
            را مشاهده فرمایید.
          </p>
        </div>

        {/* Steps Selector Horizontal Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PIPELINE_STEPS.map((step) => {
            const isSelected = activeStepId === step.id;
            const IconComponent = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepId(step.id)}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 text-right transition-all cursor-pointer active:scale-[0.97] ${
                  isSelected
                    ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30"
                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/80"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                      isSelected
                        ? "bg-orange-500 text-white border-orange-400"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700/60"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-xs font-mono font-bold ${
                      isSelected ? "text-orange-400" : "text-neutral-500"
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                </div>

                <div>
                  <h4
                    className={`text-xs font-bold leading-snug ${
                      isSelected ? "text-white" : "text-neutral-300"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                    {step.shortDesc}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    layoutId="activeStepIndicator"
                    className="absolute -bottom-1.5 inset-x-6 h-1 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Step Detailed View Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-3xl border border-neutral-800 bg-[#121217] p-6 sm:p-8 text-right relative overflow-hidden shadow-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold text-orange-300">
                    گام {currentStep.stepNumber} از چرخه اصالت
                  </span>
                  <span className="text-xs text-neutral-400">
                    تضمین کیفیت مهندسی ققنوس آکادمی
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {currentStep.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                  {currentStep.fullDesc}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-neutral-400">ابزارها و استانداردها:</span>
                  {currentStep.equipment.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-[11px] font-mono text-neutral-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] text-neutral-400">شاخص عملکردی (KPI):</span>
                    <div className="text-sm sm:text-base font-black text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{currentStep.metrics}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-neutral-800">
                    <span className="text-[11px] text-neutral-400">تعهد سطح خدمت (SLA):</span>
                    <div className="text-xs font-semibold text-neutral-200">
                      {currentStep.sla}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-md">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>تاییدیه رسمی بازرسی کیفی</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
