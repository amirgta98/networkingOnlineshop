"use client";

import * as React from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
  Globe2,
  Building2,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Copy,
  Check,
  CheckSquare,
  Square,
  Wrench,
  Router as RouterIcon,
  HelpCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import {
  INTERNET_PLANS,
  STATIC_IP_PACKAGES,
  INTERNET_ADDONS,
} from "../mock-data/internet-data";
import {
  InternetOrderFormData,
  BillingCycle,
  InternetOrderResult,
} from "../types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface InternetOrderFormProps {
  selectedPlanId: string;
  selectedStaticIpId: string;
  billingCycle: BillingCycle;
  onPlanChange: (id: string) => void;
  onStaticIpChange: (id: string) => void;
  onBillingCycleChange: (cycle: BillingCycle) => void;
}

export function InternetOrderForm({
  selectedPlanId,
  selectedStaticIpId,
  billingCycle,
  onPlanChange,
  onStaticIpChange,
  onBillingCycleChange,
}: InternetOrderFormProps) {
  const { user } = useAuth();
  const isPartner = user?.role === "partner";

  // Form fields
  const [formData, setFormData] = React.useState<InternetOrderFormData>({
    fullName: user?.name || "",
    companyName: user?.companyName || "",
    nationalCode: user?.nationalId || "",
    phoneNumber: user?.phone || "",
    province: "تهران",
    city: "تهران",
    postalCode: "",
    landlineNumber: "",
    address: "",
    selectedPlanId,
    billingCycle,
    selectedStaticIpId,
    includeModem: false,
    includeInstallationExpert: true,
    needsB2bInvoice: Boolean(user?.role === "partner" || user?.companyName),
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionResult, setSubmissionResult] = React.useState<InternetOrderResult | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Sync external props with form state
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      selectedPlanId,
      billingCycle,
      selectedStaticIpId,
    }));
  }, [selectedPlanId, billingCycle, selectedStaticIpId]);

  // Derived selected items
  const activePlan = INTERNET_PLANS.find((p) => p.id === formData.selectedPlanId) || INTERNET_PLANS[0];
  const activeIp = STATIC_IP_PACKAGES.find((ip) => ip.id === formData.selectedStaticIpId) || null;

  // Billing discount logic
  const cycleDiscountPercent =
    formData.billingCycle === "12_months"
      ? 20
      : formData.billingCycle === "6_months"
      ? 12
      : formData.billingCycle === "3_months"
      ? 5
      : 0;

  const cycleMonths =
    formData.billingCycle === "12_months"
      ? 12
      : formData.billingCycle === "6_months"
      ? 6
      : formData.billingCycle === "3_months"
      ? 3
      : 1;

  // Price calculations
  const monthlyPlanPrice = Math.round((activePlan.basePricePerMonth * (100 - cycleDiscountPercent)) / 100);
  const monthlyIpPrice = activeIp
    ? Math.round(
        (activeIp.pricePerMonth *
          (100 - (formData.billingCycle === "12_months" ? activeIp.discountPercentForYearly : 0))) /
          100
      )
    : 0;

  const totalMonthly = monthlyPlanPrice + monthlyIpPrice;
  const cycleTotal = totalMonthly * cycleMonths;

  // One time fees
  const modemCost = formData.includeModem ? 3850000 : 0;
  const expertCost = formData.includeInstallationExpert ? 450000 : 0;
  const ipSetupCost = activeIp ? activeIp.setupFee : 0;
  const oneTimeTotal = modemCost + expertCost + ipSetupCost;

  const finalPayableTotal = cycleTotal + oneTimeTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!formData.fullName.trim()) {
      setErrorMsg("لطفاً نام و نام خانوادگی مسئول سفارش را وارد کنید.");
      return;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      setErrorMsg("لطفاً شماره تماس معتبر (همراه) وارد فرمایید.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg("لطفاً نشانی دقیق محل نصب یا تحویل سرویس را درج نمایید.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const trackingCode = `NET-ISP-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmissionResult({
        orderTrackingNumber: trackingCode,
        submittedAt: new Date().toLocaleDateString("fa-IR"),
        totalMonthlyPrice: totalMonthly,
        oneTimeSetupTotal: oneTimeTotal,
        estimatedActivationHours: activePlan.type === "ftth" ? 72 : 24,
        orderSummary: {
          planName: activePlan.name,
          billingCycleLabel:
            formData.billingCycle === "12_months"
              ? "یک‌ساله"
              : formData.billingCycle === "6_months"
              ? "شش‌ماهه"
              : formData.billingCycle === "3_months"
              ? "سه‌ماهه"
              : "یک‌ماهه",
          staticIpLabel: activeIp ? activeIp.label : "بدون IP استاتیک",
          modemIncluded: formData.includeModem,
          installationIncluded: formData.includeInstallationExpert,
        },
      });
    }, 1200);
  };

  const copyTracking = () => {
    if (submissionResult) {
      navigator.clipboard.writeText(submissionResult.orderTrackingNumber);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <section id="internet-order-form-box" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-1.5 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-orange-400">
          <FileText className="h-4 w-4" />
          <span>تکمیل و ثبت آنلاین سفارش</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          فرم درخواست خرید اینترنت و تخصیص آی‌پی استاتیک
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          پس از تکمیل فرم، پیش‌فاکتور رسمی صادر شده و کارشناسان پشتیبانی خطوط ظرف کمتر از ۲ ساعت جهت تایید فنی با شما تماس خواهند گرفت.
        </p>
      </div>

      {isPartner && (
        <div className="p-4 rounded-2xl border border-sky-500/30 bg-sky-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
            <span className="text-sky-200">
              شما با حساب <strong>همکار سازمانی (Tier A)</strong> وارد شده‌اید. برای بهره‌مندی از تخفیف‌های طلایی تا ۲۵٪ و تسویه اعتباری ۴۵ روزه، می‌توانید از پرتال همکاران استفاده فرمایید.
            </span>
          </div>
          <Link
            href="/partner/internet"
            className="flex items-center gap-1 font-bold text-sky-400 hover:text-sky-300 transition-colors whitespace-nowrap"
          >
            <span>ورود به پرتال اینترنت همکاران</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {submissionResult ? (
        /* Success Confirmation Box */
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 via-neutral-900 to-neutral-900 p-6 sm:p-10 shadow-2xl text-right">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <CheckCircle2 className="h-8 w-8 shrink-0" />
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                درخواست اشتراک و رزرو IP با موفقیت ثبت شد!
              </h3>
              <p className="text-xs text-neutral-300">
                پیش‌فاکتور برای شما صادر و به کارشناس خطوط مخابراتی ارجاع گردید.
              </p>
            </div>
          </div>

          <div className="my-6 p-4 sm:p-5 rounded-2xl border border-neutral-800 bg-[#121216] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-neutral-400 block mb-1">کد رهگیری رسمی سفارش اینترنت:</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-sky-400 tracking-wider">
                {submissionResult.orderTrackingNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={copyTracking}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedCode ? "کپی شد" : "کپی کد رهگیری"}</span>
            </button>
          </div>

          {/* Summary table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300 border-t border-neutral-800 pt-5">
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">پلن اینترنت انتخابی:</span>
                <span className="font-bold text-white">{submissionResult.orderSummary.planName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">دوره صورتحساب:</span>
                <span className="font-bold text-white">{submissionResult.orderSummary.billingCycleLabel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">سرویس IP استاتیک:</span>
                <span className="font-bold text-sky-400">{submissionResult.orderSummary.staticIpLabel}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">تخمین زمان رانژه و تحویل:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  حداکثر {toPersianDigits(submissionResult.estimatedActivationHours)} ساعت کاری
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">هزینه‌های یک‌باره راه‌اندازی:</span>
                <span className="font-bold text-white font-mono">
                  {formatPrice(submissionResult.oneTimeSetupTotal)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/60">
                <span className="text-neutral-400">هزینه دوره اینترنت و IP:</span>
                <span className="font-bold text-white font-mono">
                  {formatPrice(submissionResult.totalMonthlyPrice)} / ماه
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSubmissionResult(null)}
              className="py-2.5 px-5 rounded-xl bg-[var(--theme-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              ثبت درخواست دیگر
            </button>
            <a
              href="tel:09134761097"
              className="py-2.5 px-5 rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-200 text-xs font-semibold hover:text-white transition-colors"
            >
              تماس مستقیم با واحد فروش پهنای باند
            </a>
          </div>
        </div>
      ) : (
        /* The Order Configuration & Checkout Form */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Right 8 cols: Form Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Subscriber Identity */}
            <div className="rounded-3xl border border-neutral-800/80 bg-[#121216] p-5 sm:p-7 space-y-4 text-right">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-800 text-xs font-bold text-white">
                <User className="h-4 w-4 text-orange-400" />
                <span>۱. مشخصات مشترک و اطلاعات هویتی</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                    نام و نام خانوادگی رابط <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رضا محمدی"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                    نام شرکت / سازمان (در صورت حقوقی بودن)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: داده‌پردازان عصر نوین"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                    شماره تلفن همراه (پیامک فعال‌سازی) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912..."
                    dir="ltr"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none text-right"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                    کد ملی / شناسه ملی شرکت
                  </label>
                  <input
                    type="text"
                    placeholder="جهت ثبت نام رسمی و تخصیص IP"
                    dir="ltr"
                    value={formData.nationalCode}
                    onChange={(e) => setFormData({ ...formData, nationalCode: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none text-right"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Installation Location & Line Info */}
            <div className="rounded-3xl border border-neutral-800/80 bg-[#121216] p-5 sm:p-7 space-y-4 text-right">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-800 text-xs font-bold text-white">
                <MapPin className="h-4 w-4 text-sky-400" />
                <span>۲. نشانی محل نصب و اطلاعات خط رانژه</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-medium">استان</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="تهران">تهران</option>
                    <option value="البرز">البرز</option>
                    <option value="اصفهان">اصفهان</option>
                    <option value="فارس">فارس</option>
                    <option value="خراسان رضوی">خراسان رضوی</option>
                    <option value="آذربایجان شرقی">آذربایجان شرقی</option>
                    <option value="سایر استان‌ها">سایر استان‌ها</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-medium">شهر</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                    شماره خط تلفن ثابت (در صورت وجود)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 09134761097"
                    dir="ltr"
                    value={formData.landlineNumber}
                    onChange={(e) => setFormData({ ...formData, landlineNumber: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none text-right"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1.5 font-medium">
                  نشانی کامل پستی جهت بازدید کارشناس یا تحویل تجهیزات <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="خیابان، پلاک، طبقه و واحد..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Step 3: Equipment & Addons Selection */}
            <div className="rounded-3xl border border-neutral-800/80 bg-[#121216] p-5 sm:p-7 space-y-4 text-right">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-800 text-xs font-bold text-white">
                <Wrench className="h-4 w-4 text-emerald-400" />
                <span>۳. تجهیزات اختیاری و خدمات اعزام کارشناس</span>
              </div>

              <div className="space-y-3">
                {/* Modem check */}
                <label
                  onClick={() => setFormData({ ...formData, includeModem: !formData.includeModem })}
                  className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    formData.includeModem
                      ? "border-sky-500/50 bg-sky-950/20"
                      : "border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-sky-400">
                      {formData.includeModem ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-neutral-500" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        افزودن مودم روتر گیگابیتی اورجینال Wi-Fi 6
                      </span>
                      <span className="text-[11px] text-neutral-400 leading-relaxed block mt-0.5">
                        سازگار ۱۰۰٪ با فیبر نوری و VDSL، بدون نیاز به تهیه جداگانه با ۲ سال گارانتی تعویض.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-sky-400 font-mono shrink-0 whitespace-nowrap">
                    +{formatPrice(3850000)}
                  </span>
                </label>

                {/* Onsite Expert check */}
                <label
                  onClick={() =>
                    setFormData({
                      ...formData,
                      includeInstallationExpert: !formData.includeInstallationExpert,
                    })
                  }
                  className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    formData.includeInstallationExpert
                      ? "border-sky-500/50 bg-sky-950/20"
                      : "border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-sky-400">
                      {formData.includeInstallationExpert ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5 text-neutral-500" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        اعزام کارشناس ارشد جهت نصب حضوری و کانفیگ IP استاتیک
                      </span>
                      <span className="text-[11px] text-neutral-400 leading-relaxed block mt-0.5">
                        تنظیم پورت‌فورواردینگ برای دوربین‌ها، تست سرعت رسمی و تحویل کیفیت روی خط.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono shrink-0 whitespace-nowrap">
                    +{formatPrice(450000)}
                  </span>
                </label>

                {/* Invoice check */}
                <label
                  onClick={() => setFormData({ ...formData, needsB2bInvoice: !formData.needsB2bInvoice })}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/40 cursor-pointer"
                >
                  <div className="text-orange-400">
                    {formData.needsB2bInvoice ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5 text-neutral-500" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-300">
                    نیازمند صدور صورتحساب رسمی الکترونیکی (سامانه مودیان) هستم.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Left 4 cols: Sticky Live Invoice Summary & Submit */}
          <div className="lg:col-span-4 sticky top-20 space-y-4 text-right">
            <div className="rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-[#101014] p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">پیش‌فاکتور زنده سفارش</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">ریال / تومان</span>
              </div>

              <div className="py-4 space-y-3 text-xs">
                {/* Plan title */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-neutral-400 block">سرویس اینترنت:</span>
                    <span className="font-bold text-white text-[11px]">{activePlan.name}</span>
                  </div>
                  <span className="font-bold text-white font-mono shrink-0" dir="rtl">
                    {formatPrice(monthlyPlanPrice)} / ماه
                  </span>
                </div>

                {/* Static IP */}
                <div className="flex justify-between items-start py-2 border-t border-neutral-800/60">
                  <div>
                    <span className="text-neutral-400 block">آی‌پی استاتیک:</span>
                    <span className="font-bold text-sky-400 text-[11px]">
                      {activeIp ? activeIp.label : "بدون IP استاتیک"}
                    </span>
                  </div>
                  <span className="font-bold text-sky-400 font-mono shrink-0" dir="rtl">
                    {activeIp ? `${formatPrice(monthlyIpPrice)} / ماه` : "۰ تومان"}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex justify-between items-center py-2 border-t border-neutral-800/60 text-neutral-400">
                  <span>مدت قرارداد:</span>
                  <span className="font-bold text-white">
                    {formData.billingCycle === "12_months"
                      ? "۱۲ ماهه (۲۰٪ تخفیف)"
                      : formData.billingCycle === "6_months"
                      ? "۶ ماهه"
                      : formData.billingCycle === "3_months"
                      ? "۳ ماهه"
                      : "۱ ماهه"}
                  </span>
                </div>

                {/* One time fees */}
                {oneTimeTotal > 0 && (
                  <div className="py-2 border-t border-neutral-800/60 space-y-1">
                    <span className="text-neutral-400 block text-[11px]">هزینه‌های اولیه (یک‌باره):</span>
                    {formData.includeModem && (
                      <div className="flex justify-between text-[11px] text-neutral-300">
                        <span>مودم روتر:</span>
                        <span className="font-mono">{formatPrice(modemCost)}</span>
                      </div>
                    )}
                    {formData.includeInstallationExpert && (
                      <div className="flex justify-between text-[11px] text-neutral-300">
                        <span>اعزام کارشناس:</span>
                        <span className="font-mono">{formatPrice(expertCost)}</span>
                      </div>
                    )}
                    {ipSetupCost > 0 && (
                      <div className="flex justify-between text-[11px] text-neutral-300">
                        <span>راه‌اندازی ساب‌نت IP:</span>
                        <span className="font-mono">{formatPrice(ipSetupCost)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Total Box */}
              <div className="pt-4 border-t border-neutral-800 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-neutral-300">مجموع قابل پرداخت:</span>
                  <div className="flex items-baseline gap-1" dir="rtl">
                    <span className="text-xl font-black text-sky-400 font-mono">
                      {formatPrice(finalPayableTotal)}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-400 leading-relaxed pt-1">
                  شامل {cycleMonths} ماه آبونمان اینترنت و آی‌پی استاتیک به همراه خدمات جانبی انتخابی.
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mt-3 p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-[var(--theme-primary)]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>در حال ثبت پیش‌فاکتور...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>تایید پیش‌فاکتور و ثبت درخواست</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
