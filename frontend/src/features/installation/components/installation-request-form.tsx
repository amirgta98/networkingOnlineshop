"use client";

import * as React from "react";
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  X,
  Send,
  Loader2,
  Copy,
  Check,
  Building2,
  MapPin,
  Calendar,
  Phone,
  User,
  ShieldCheck,
  Camera,
  Server,
  Network,
  Wifi,
  Cpu,
  Zap,
  Printer,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  InstallationServiceCategory,
  InstallationRequestFormData,
  InstallationSubmissionResult,
  BuildingType,
  ProjectScale,
  EquipmentStatus,
  PreferredTimeline,
} from "../types";
import {
  INSTALLATION_SERVICES,
  PROVINCES_LIST,
  BUILDING_TYPE_LABELS,
} from "../mock-data/installation-data";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface InstallationRequestFormProps {
  initialService?: InstallationServiceCategory;
  calculatorData?: {
    serviceType: InstallationServiceCategory;
    nodeCount: number;
    cctvCount: number;
    approximateArea: number;
    rackCount: number;
    needsFlukeTest: boolean;
  } | null;
  onSubmissionSuccess?: (trackingCode: string) => void;
}

export function InstallationRequestForm({
  initialService = "cabling",
  calculatorData,
  onSubmissionSuccess,
}: InstallationRequestFormProps) {
  // Wizard current step: 1, 2, 3, 4
  const [currentStep, setCurrentStep] = React.useState<number>(1);

  // Form State
  const [formData, setFormData] = React.useState<InstallationRequestFormData>({
    serviceType: initialService,
    secondaryServices: [],
    projectScale: "medium",
    buildingType: "office",
    approximateArea: 150,
    nodeCount: 24,
    cctvCount: 0,
    rackCount: 1,
    fiberCoreCount: 0,
    equipmentStatus: "need_purchase_from_netmarket",
    needsFlukeTest: true,
    needsOnsiteSurvey: true,
    preferredTimeline: "this_week",
    province: "تهران",
    city: "تهران",
    address: "",
    fullName: "",
    companyName: "",
    phoneNumber: "",
    email: "",
    notes: "",
    hasAttachment: false,
    attachmentName: undefined,
  });

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [submissionResult, setSubmissionResult] = React.useState<InstallationSubmissionResult | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync initialService prop
  React.useEffect(() => {
    if (initialService) {
      setFormData((prev) => ({ ...prev, serviceType: initialService }));
    }
  }, [initialService]);

  // Sync calculator data if transferred
  React.useEffect(() => {
    if (calculatorData) {
      setFormData((prev) => ({
        ...prev,
        serviceType: calculatorData.serviceType,
        nodeCount: calculatorData.nodeCount,
        cctvCount: calculatorData.cctvCount,
        approximateArea: calculatorData.approximateArea,
        rackCount: calculatorData.rackCount,
        needsFlukeTest: calculatorData.needsFlukeTest,
      }));
      // Move to step 2 directly to view applied inputs
      setCurrentStep(2);
    }
  }, [calculatorData]);

  // File drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMsg(null);
    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("حجم فایل انتخابی بیش از ۱۵ مگابایت است.");
      return;
    }
    setUploadedFile(file);
    setFormData((prev) => ({
      ...prev,
      hasAttachment: true,
      attachmentName: file.name,
    }));
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData((prev) => ({
      ...prev,
      hasAttachment: false,
      attachmentName: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Toggle secondary service
  const toggleSecondaryService = (svc: InstallationServiceCategory) => {
    setFormData((prev) => {
      const exists = prev.secondaryServices.includes(svc);
      if (exists) {
        return {
          ...prev,
          secondaryServices: prev.secondaryServices.filter((s) => s !== svc),
        };
      } else {
        return {
          ...prev,
          secondaryServices: [...prev.secondaryServices, svc],
        };
      }
    });
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    setErrorMsg(null);

    if (step === 1) {
      if (!formData.serviceType) {
        setErrorMsg("لطفاً خدمت اصلی مورد نظر خود را انتخاب فرمایید.");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (formData.approximateArea <= 0) {
        setErrorMsg("لطفاً متراژ تقریبی محل را مشخص کنید.");
        return false;
      }
      return true;
    }

    if (step === 3) {
      // Step 3 optional attachments and preferences are always valid
      return true;
    }

    if (step === 4) {
      if (!formData.fullName.trim()) {
        setErrorMsg("لطفاً نام و نام خانوادگی مسئول هماهنگی را وارد نمایید.");
        return false;
      }

      const cleanPhone = formData.phoneNumber
        .trim()
        .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());

      if (!cleanPhone || cleanPhone.length < 10) {
        setErrorMsg("لطفاً یک شماره تماس معتبر (مثال: ۰۹۱۲۳۴۵۶۷۸۹) وارد فرمایید.");
        return false;
      }

      if (!formData.address.trim()) {
        setErrorMsg("لطفاً آدرس یا محدوده تقریبی پروژه را وارد فرمایید.");
        return false;
      }

      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      const el = document.getElementById("installation-form-box");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Final submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `NET-INST-${randomDigits}`;

      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(now);

      // Estimated cost range based on node count and service
      const minEstimatedCost = formData.nodeCount * 140000 + formData.cctvCount * 300000 + 1500000;
      const maxEstimatedCost = minEstimatedCost * 1.25;

      const result: InstallationSubmissionResult = {
        trackingCode: generatedCode,
        submittedAt: formattedDate,
        estimatedDays: formData.nodeCount > 50 ? "۳ الی ۵ روز کاری" : "۱ الی ۲ روز کاری",
        estimatedCostRange: {
          min: Math.round(minEstimatedCost / 100000) * 100000,
          max: Math.round(maxEstimatedCost / 100000) * 100000,
        },
        status: "pending_review",
        formData: { ...formData },
        assignedTeam: {
          leadName: "مهندس شریفی",
          role: "سرپرست ارشد پروژه‌های پسیو و فیبر نوری",
          phone: "۰۹۱۳۴۷۶۱۰۹۷ (داخلی ۱۰۴)",
        },
      };

      setSubmissionResult(result);

      if (onSubmissionSuccess) {
        onSubmissionSuccess(generatedCode);
      }
    } catch {
      setErrorMsg("خطایی در ثبت درخواست رخ داد. لطفاً مجدداً تلاش فرمایید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingCode = () => {
    if (submissionResult?.trackingCode && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(submissionResult.trackingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleResetForm = () => {
    setSubmissionResult(null);
    setCurrentStep(1);
    setUploadedFile(null);
    setFormData({
      serviceType: "cabling",
      secondaryServices: [],
      projectScale: "medium",
      buildingType: "office",
      approximateArea: 150,
      nodeCount: 24,
      cctvCount: 0,
      rackCount: 1,
      fiberCoreCount: 0,
      equipmentStatus: "need_purchase_from_netmarket",
      needsFlukeTest: true,
      needsOnsiteSurvey: true,
      preferredTimeline: "this_week",
      province: "تهران",
      city: "تهران",
      address: "",
      fullName: "",
      companyName: "",
      phoneNumber: "",
      email: "",
      notes: "",
      hasAttachment: false,
    });
  };

  return (
    <section id="installation-form-box" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-orange-400">
          <Wrench className="h-4 w-4" />
          <span>فرم رسمی درخواست خدمات</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          ثبت هوشمند مشخصات پروژه و درخواست اعزام کارشناس
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          اطلاعات پروژه خود را در ۴ گام ساده وارد فرمایید؛ کارشناس ناظر ظرف کمتر از ۲ ساعت جهت تایید نهایی تماس خواهد گرفت.
        </p>
      </div>

      {/* Main Container */}
      <div className="rounded-3xl border border-neutral-800 bg-[#121216] p-5 sm:p-8 shadow-2xl">
        {/* SUCCESS VIEW */}
        {submissionResult ? (
          <div className="space-y-8 animate-fade-in text-right">
            {/* Top Success Badge */}
            <div className="flex flex-col items-center justify-center text-center gap-3 p-6 sm:p-8 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                درخواست نصب با موفقیت ثبت شد!
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed">
                پرونده فنی پروژه شما تشکیل شد. مهندس ناظر فنی ققنوس آکادمی ظرف حداکثر ۲ ساعت کاری جهت هماهنگی زمان بازدید حضوری با شماره شما تماس حاصل خواهد نمود.
              </p>

              {/* Tracking Code Highlight */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 p-4 rounded-2xl bg-black/50 border border-neutral-800">
                <span className="text-xs text-neutral-400">کد رهگیری اختصاصی شما:</span>
                <span className="font-mono text-xl sm:text-2xl font-black text-orange-400 tracking-wider" dir="ltr">
                  {submissionResult.trackingCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTrackingCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 text-xs font-bold border border-orange-500/40 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedCode ? "کپی شد" : "کپی کد"}</span>
                </button>
              </div>
            </div>

            {/* Project Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Project Specs */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
                <span className="text-xs font-bold text-neutral-300 border-b border-neutral-800 pb-2 block">
                  خلاصه مشخصات فنی اعلام‌شده:
                </span>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">خدمت اصلی:</span>
                    <span className="font-semibold text-white">
                      {INSTALLATION_SERVICES.find((s) => s.id === submissionResult.formData.serviceType)?.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">نوع ساختمان:</span>
                    <span>{BUILDING_TYPE_LABELS[submissionResult.formData.buildingType]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">تعداد نود / دوربین:</span>
                    <span className="font-mono">
                      {toPersianDigits(submissionResult.formData.nodeCount)} نود / {toPersianDigits(submissionResult.formData.cctvCount)} دوربین
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">تست فلوک DSX-8000:</span>
                    <span className="text-emerald-400 font-bold">
                      {submissionResult.formData.needsFlukeTest ? "دارد (همراه با سرتیفیکیت)" : "بدون تست"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">مدت زمان تخمینی:</span>
                    <span className="text-orange-400 font-bold">{submissionResult.estimatedDays}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Contact & Assigned Engineer */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
                <span className="text-xs font-bold text-neutral-300 border-b border-neutral-800 pb-2 block">
                  اطلاعات متقاضی و ناظر فنی:
                </span>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">نام متقاضی:</span>
                    <span className="font-semibold text-white">{submissionResult.formData.fullName}</span>
                  </div>
                  {submissionResult.formData.companyName && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">سازمان / شرکت:</span>
                      <span>{submissionResult.formData.companyName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-400">شماره تماس:</span>
                    <span className="font-mono" dir="ltr">{submissionResult.formData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">استان و شهر:</span>
                    <span>{submissionResult.formData.province} - {submissionResult.formData.city}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-800">
                    <span className="text-neutral-400">ناظر فنی اختصاصی:</span>
                    <span className="text-sky-400 font-bold">{submissionResult.assignedTeam.leadName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>چاپ / ذخیره PDF تاییدیه</span>
                </button>

                <a
                  href="#installation-tracker"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-bold border border-sky-500/30 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  <span>مشاهده در بخش پیگیری آنلاین</span>
                </a>
              </div>

              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ثبت یک درخواست نصب دیگر
              </button>
            </div>
          </div>
        ) : (
          /* MULTI-STEP WIZARD */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Stepper Header */}
            <div className="grid grid-cols-4 gap-2 border-b border-neutral-800 pb-5">
              {[
                { num: 1, title: "نوع خدمات" },
                { num: 2, title: "مشخصات فنی" },
                { num: 3, title: "زمان‌بندی و فایل" },
                { num: 4, title: "اطلاعات تماس" },
              ].map((st) => {
                const isActive = currentStep === st.num;
                const isPassed = currentStep > st.num;

                return (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => {
                      if (st.num < currentStep) setCurrentStep(st.num);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-right transition-colors ${
                      isActive
                        ? "bg-orange-500/10 text-orange-400 font-bold"
                        : isPassed
                        ? "text-neutral-300 hover:text-white cursor-pointer"
                        : "text-neutral-500 cursor-not-allowed"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isActive
                          ? "bg-orange-500 text-white"
                          : isPassed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {isPassed ? "✓" : toPersianDigits(st.num)}
                    </span>
                    <span className="hidden sm:inline text-xs truncate">{st.title}</span>
                  </button>
                );
              })}
            </div>

            {/* ── STEP 1: SERVICE TYPE ───────────────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in text-right">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-white">
                    گام ۱: انتخاب خدمت اصلی مورد نیاز
                  </h3>
                  <p className="text-xs text-neutral-400">
                    نوع خدمت مورد نظر خود را جهت تخصیص تیم مهندسی مربوطه تعیین نمایید:
                  </p>
                </div>

                {/* Primary Service Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {INSTALLATION_SERVICES.map((svc) => {
                    const isSelected = formData.serviceType === svc.id;
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, serviceType: svc.id }))}
                        className={`p-4 rounded-2xl border text-right flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "border-orange-500 bg-orange-950/20 ring-1 ring-orange-500 text-white shadow-md"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-orange-400 font-mono bg-orange-500/10 px-2 py-0.5 rounded">
                            {svc.badge}
                          </span>
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
                              isSelected
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-neutral-600"
                            }`}
                          >
                            {isSelected && "✓"}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white mb-1">{svc.title}</span>
                        <span className="text-[11px] text-neutral-400 line-clamp-2">{svc.shortDesc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Project Scale */}
                <div className="space-y-2 pt-4 border-t border-neutral-800">
                  <span className="text-xs font-bold text-neutral-200">
                    مقیاس و بزرگی تقریبی پروژه:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "small", label: "کوچک", hint: "زیر ۲۰ نود (دفتر کار)" },
                      { id: "medium", label: "متوسط", hint: "۲۰ تا ۵۰ نود (شرکت ۲ الی ۳ طبقه)" },
                      { id: "large", label: "بزرگ", hint: "۵۰ تا ۲۰۰ نود (ساختمان کامل)" },
                      { id: "enterprise", label: "سازمانی", hint: "+۲۰۰ نود (دیتاسنتر یا کارخانه)" },
                    ].map((sc) => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, projectScale: sc.id as ProjectScale }))}
                        className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                          formData.projectScale === sc.id
                            ? "border-orange-500 bg-orange-500/10 text-white"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-800/50"
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{sc.label}</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5 block">{sc.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: PROJECT SPECS & ENVIRONMENT ────────────────────── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in text-right">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-white">
                    گام ۲: مشخصات محیطی و حجم کار
                  </h3>
                  <p className="text-xs text-neutral-400">
                    مشخصات محل پروژه را جهت برآورد تعداد نیرو و تجهیزات مورد نیاز وارد فرمایید:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Building Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      نوع کاربری ساختمان یا فضا:
                    </label>
                    <select
                      value={formData.buildingType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, buildingType: e.target.value as BuildingType }))}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      {Object.entries(BUILDING_TYPE_LABELS).map(([k, val]) => (
                        <option key={k} value={k} className="bg-neutral-900 text-white">
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Approximate Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      متراژ تقریبی فضا (مترمربع):
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={50000}
                      value={formData.approximateArea}
                      onChange={(e) => setFormData((prev) => ({ ...prev, approximateArea: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Node Count */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      تعداد نودهای شبکه و پریزهای RJ45:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={formData.nodeCount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nodeCount: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* CCTV Count */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      تعداد دوربین‌های مداربسته (در صورت نیاز):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={formData.cctvCount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cctvCount: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Rack Count */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      تعداد رک‌ها جهت چیدمان و آرایش:
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={formData.rackCount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, rackCount: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Equipment Purchase Status */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      وضعیت تأمین تجهیزات و کابل‌ها:
                    </label>
                    <select
                      value={formData.equipmentStatus}
                      onChange={(e) => setFormData((prev) => ({ ...prev, equipmentStatus: e.target.value as EquipmentStatus }))}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="need_purchase_from_netmarket">
                        نیاز به خرید و استعلام قیمت تجهیزات از ققنوس آکادمی دارم
                      </option>
                      <option value="already_purchased">
                        تجهیزات از قبل خریداری شده و فقط درخواست نصب دارم
                      </option>
                      <option value="need_consultation">
                        نیازمند مشاوره فنی کارشناس در جلسه حضوری هستم
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: TIMELINE & ATTACHMENTS ─────────────────────────── */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in text-right">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-white">
                    گام ۳: زمان‌بندی و پیوست نقشه یا فایل
                  </h3>
                  <p className="text-xs text-neutral-400">
                    در صورت داشتن نقشه اتوکد، پلان معماری یا تصاویری از محل، در این بخش بارگذاری کنید:
                  </p>
                </div>

                {/* Timeline Selection */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-200">
                    زمان‌بندی ایده‌آل برای شروع پروژه:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "urgent", label: "فوری (ظرف ۲۴ الی ۴۸ ساعت)", hint: "پروژه‌های اضطراری" },
                      { id: "this_week", label: "طی همین هفته", hint: "استاندارد" },
                      { id: "next_two_weeks", label: "طی دو هفته آینده", hint: "برنامه‌ریزی آتی" },
                      { id: "flexible", label: "شناور و با هماهنگی", hint: "در حال بازسازی" },
                    ].map((tl) => (
                      <button
                        key={tl.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, preferredTimeline: tl.id as PreferredTimeline }))}
                        className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                          formData.preferredTimeline === tl.id
                            ? "border-orange-500 bg-orange-500/10 text-white"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-800/50"
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{tl.label}</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5 block">{tl.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles for Fluke and Onsite Survey */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/40 cursor-pointer select-none">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">تست فلوک ۱۰۰٪ با دستگاه Fluke</span>
                        <span className="text-[10px] text-neutral-400">ارائه سرتیفیکیت و گراف Pass/Fail</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.needsFlukeTest}
                      onChange={(e) => setFormData((prev) => ({ ...prev, needsFlukeTest: e.target.checked }))}
                      className="h-5 w-5 accent-orange-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/40 cursor-pointer select-none">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-5 w-5 text-sky-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">درخواست کارشناسی و بازدید رایگان</span>
                        <span className="text-[10px] text-neutral-400">متره‌کشی دقیق در محل پروژه</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.needsOnsiteSurvey}
                      onChange={(e) => setFormData((prev) => ({ ...prev, needsOnsiteSurvey: e.target.checked }))}
                      className="h-5 w-5 accent-orange-500 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Drag and drop file upload */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-neutral-200">
                    پیوست نقشه اتوکد، پلان یا تصاویر محل (اختیاری):
                  </span>

                  {uploadedFile ? (
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-700 bg-neutral-900/80">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-orange-400" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white" dir="ltr">
                            {uploadedFile.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                        isDragging
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/70"
                      }`}
                    >
                      <UploadCloud className="h-8 w-8 text-neutral-400 mb-2" />
                      <span className="text-xs font-bold text-neutral-200">
                        کلیک کنید یا فایل را به اینجا بکشید
                      </span>
                      <span className="text-[11px] text-neutral-500 mt-1">
                        فرمت‌های مجاز: DWG, PDF, JPG, PNG, ZIP (حداکثر ۱۵ مگابایت)
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".dwg,.pdf,.jpg,.jpeg,.png,.zip"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileSelected(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 4: CONTACT & SUBMISSION ───────────────────────────── */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in text-right">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-white">
                    گام ۴: اطلاعات تماس و آدرس محل پروژه
                  </h3>
                  <p className="text-xs text-neutral-400">
                    اطلاعات مسئول هماهنگی پروژه را جهت تماس ناظر فنی ثبت فرمایید:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      نام و نام خانوادگی مسئول هماهنگی: *
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="مثال: مهندس رضوانی"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 pr-9 pl-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      نام شرکت یا سازمان (اختیاری):
                    </label>
                    <div className="relative">
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                        placeholder="مثال: شرکت داده‌پردازی نوین"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 pr-9 pl-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      شماره تماس مستقیم یا همراه: *
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="09121234567"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 pr-9 pl-3 text-xs text-white font-mono placeholder-neutral-500 focus:border-orange-500 focus:outline-none text-right"
                      />
                    </div>
                  </div>

                  {/* Province */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      استان محل پروژه:
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData((prev) => ({ ...prev, province: e.target.value }))}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      {PROVINCES_LIST.map((p) => (
                        <option key={p} value={p} className="bg-neutral-900 text-white">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      شهر / منطقه:
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="مثال: تهران - منطقه ۲"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      آدرس دقیق یا نشانی تقریبی محل پروژه: *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="مثال: تهران، خیابان ولیعصر، تقاطع مطهری، پلاک ۲۴، واحد ۶"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      توضیحات و نیازمندی‌های خاص (اختیاری):
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="مثلاً: نیاز به اجرای کار در روزهای پنج‌شنبه و جمعه، وجود سقف کاذب، نیاز به داکت‌کشی اضافه..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message banner */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-right animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-5 border-t border-neutral-800">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>مرحله قبل</span>
                </button>
              ) : (
                <span />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                >
                  <span>ادامه به مرحله بعد</span>
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xl shadow-[var(--theme-primary)]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال ثبت و تشکیل پرونده فنی...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>تایید و ثبت نهایی درخواست نصب</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
