"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Save,
  Loader2,
  CheckCircle2,
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
  FileText,
  DollarSign,
  AlertCircle,
  UploadCloud,
  X,
  Clock,
  Layers,
  Sparkles,
  Info,
  Lock,
} from "lucide-react";
import type {
  InstallationServiceCategory,
  InstallationStatus,
  ProjectScale,
  BuildingType,
  EquipmentStatus,
  PreferredTimeline,
  CreateAdminInstallationPayload,
} from "@/features/installation/types";
import {
  INSTALLATION_SERVICES,
  PROVINCES_LIST,
  BUILDING_TYPE_LABELS,
} from "@/features/installation/mock-data/installation-data";
import { installationApi } from "@/features/installation/api/installation-api";
import { Button } from "@/shared/components/ui/button";
import { cn, toPersianDigits, formatPrice } from "@/shared/lib/utils";

const SERVICE_OPTIONS: {
  id: InstallationServiceCategory;
  title: string;
  badge: string;
  icon: React.ElementType;
}[] = [
  {
    id: "cabling",
    title: "کابل‌کشی ساختاریافته و پسیو",
    badge: "استاندارد TIA-568-D",
    icon: Network,
  },
  {
    id: "datacenter",
    title: "آرایش رک و راه‌اندازی دیتاسنتر",
    badge: "استاندارد TIA-942",
    icon: Server,
  },
  {
    id: "cctv",
    title: "دوربین‌های مداربسته (CCTV)",
    badge: "نظارت هوشمند 4K",
    icon: Camera,
  },
  {
    id: "wireless",
    title: "شبکه بی‌سیم و اکسس‌پوینت",
    badge: "سازمانی Wi-Fi 6",
    icon: Wifi,
  },
  {
    id: "switching",
    title: "سوئیچینگ، روتینگ و امنیت",
    badge: "پیکربندی VLAN و Firewall",
    icon: Cpu,
  },
  {
    id: "fiber",
    title: "فیوژن و زیرساخت فیبر نوری",
    badge: "تست OTDR و افت کمینه",
    icon: Zap,
  },
  {
    id: "ups-power",
    title: "برق اضطراری و تابلو UPS",
    badge: "تغذیه پایدار تجهیزات",
    icon: Zap,
  },
  {
    id: "other",
    title: "مشاوره و نظارت کارگاهی",
    badge: "طراحی و ممیزی",
    icon: FileText,
  },
];

const STATUS_OPTIONS: {
  value: InstallationStatus;
  label: string;
  desc: string;
  badgeClass: string;
}[] = [
  {
    value: "PENDING_REVIEW",
    label: "در انتظار بررسی",
    desc: "ثبت اولیه، نیازمند تماس کارشناس با کارفرما",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    value: "ASSIGNED",
    label: "تخصیص کارشناس",
    desc: "سرپرست تعیین شده و در مرحله برنامه‌ریزی",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  {
    value: "SURVEY_SCHEDULED",
    label: "هماهنگی و بازدید حضوری",
    desc: "زمان‌بندی بازدید میدانی و متره‌کشی",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    value: "IN_PROGRESS",
    label: "در حال اجرای عملیات",
    desc: "تیم‌های اجرایی در محل کارفرما مستقر هستند",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    value: "COMPLETED",
    label: "تحویل نهایی و پایان‌یافته",
    desc: "اتمام کامل پروژه، تست فلوک و تحویل ضمانت",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    value: "CANCELLED",
    label: "لغوشده",
    desc: "عدم توافق یا انصراف کارفرما",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
];

const QUICK_TEAMS = [
  {
    lead: "مهندس شریفی",
    role: "سرپرست ارشد پروژه‌های پسیو و فیبر نوری",
    phone: "۰۹۱۳۴۷۶۱۰۹۷",
  },
  {
    lead: "مهندس رضایی",
    role: "کارشناس ارشد زیرساخت دیتاسنتر و اتاق سرور",
    phone: "۰۹۱۲۳۴۵۶۷۸۹",
  },
  {
    lead: "مهندس مرادی",
    role: "تکنسین ارشد سیستم‌های نظارتی و دوربین مداربسته",
    phone: "۰۹۱۸۲۳۴۵۶۷۸",
  },
];

export function AdminInstallationCreateView() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = React.useState<CreateAdminInstallationPayload>({
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
    status: "PENDING_REVIEW",
    assignedTeamLead: "مهندس شریفی",
    assignedTeamRole: "سرپرست ارشد پروژه‌های پسیو و فیبر نوری",
    assignedTeamPhone: "۰۹۱۳۴۷۶۱۰۹۷",
    minEstimatedCost: 2500000,
    maxEstimatedCost: 3500000,
    finalQuotationAmount: undefined,
    adminNotes: "",
    estimatedDays: "۲ الی ۳ روز کاری",
  });

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Recalculate baseline estimates when technical parameters change
  React.useEffect(() => {
    let base = 1500000;
    const n = Number(formData.nodeCount || 0);
    const r = Number(formData.rackCount || 0);
    const c = Number(formData.cctvCount || 0);
    const a = Number(formData.approximateArea || 0);

    if (formData.serviceType === "cabling") {
      base = Math.max(2500000, n * 145000 + (formData.needsFlukeTest ? n * 45000 : 0) + 1200000);
    } else if (formData.serviceType === "datacenter") {
      base = Math.max(5000000, r * 3800000 + 2000000);
    } else if (formData.serviceType === "cctv") {
      base = Math.max(3000000, c * 290000 + 1800000);
    } else if (formData.serviceType === "wireless") {
      base = Math.max(2000000, (n || 4) * 420000 + 1000000);
    } else if (formData.serviceType === "switching") {
      base = Math.max(3000000, (r || 1) * 1650000 + 1500000);
    } else if (formData.serviceType === "fiber") {
      base = Math.max(3500000, (n || 8) * 180000 + 2000000);
    } else {
      base = Math.max(2000000, a * 25000 + 1000000);
    }

    const min = Math.round(base / 100000) * 100000;
    const max = Math.round((base * 1.3) / 100000) * 100000;

    let days = "۱ الی ۲ روز کاری";
    if (n > 60 || r > 2 || a > 500) {
      days = "۴ الی ۷ روز کاری";
    } else if (n > 24 || c > 8) {
      days = "۲ الی ۳ روز کاری";
    }

    setFormData((prev) => ({
      ...prev,
      minEstimatedCost: min,
      maxEstimatedCost: max,
      estimatedDays: days,
    }));
  }, [
    formData.serviceType,
    formData.nodeCount,
    formData.rackCount,
    formData.cctvCount,
    formData.approximateArea,
    formData.needsFlukeTest,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg("حجم فایل انتخابی بیش از ۱۵ مگابایت است.");
        return;
      }
      setUploadedFile(file);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg("حجم فایل انتخابی بیش از ۱۵ مگابایت است.");
        return;
      }
      setUploadedFile(file);
      setErrorMsg(null);
    }
  };

  const handleQuickTeamSelect = (team: typeof QUICK_TEAMS[0]) => {
    setFormData((prev) => ({
      ...prev,
      assignedTeamLead: team.lead,
      assignedTeamRole: team.role,
      assignedTeamPhone: team.phone,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMsg("نام و نام خانوادگی مسئول هماهنگی یا کارفرما الزامی است.");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setErrorMsg("شماره تماس معتبر کارفرما الزامی است.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg("آدرس دقیق محل پروژه الزامی است.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdItem = await installationApi.createAdminRequest(formData, uploadedFile);
      // Auto-redirect to the project detail view
      router.push(`/admin/installation/${createdItem.id}`);
    } catch (err: any) {
      console.error("Failed to create installation request:", err);
      setErrorMsg(err?.message || "خطا در برقراری ارتباط با سرور هنگام ایجاد پروژه.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/installation"
            className="p-2 rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="بازگشت به لیست پروژه‌ها"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[var(--theme-foreground)]">
                ثبت و تعریف پروژه جدید پسیو شبکه
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400">
                فرم ویژه مدیران
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              ثبت مستقیم قرارداد، تعیین وضعیت اولیه، تخصیص سرپرست فنی و برآورد رسمی هزینه‌ها
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/installation">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs text-neutral-300 border-neutral-700 hover:bg-neutral-800"
            >
              <span>انصراف</span>
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="sm"
            className="h-9 gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-black font-bold shadow-md shadow-orange-500/20"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSubmitting ? "در حال ایجاد..." : "ثبت و ایجاد پروژه"}</span>
          </Button>
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Main Two-Column Layout ──────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left / Main Form Column (8 cols) ─────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Client & Contact Info */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--theme-border-color)]">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--theme-foreground)]">
                  ۱. اطلاعات کارفرما و مشخصات سازمانی
                </h2>
                <p className="text-[11px] text-neutral-400">
                  اطلاعات تماس شخص رابط و هویت شرکت کارفرما
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  نام و نام خانوادگی مسئول هماهنگی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="مثال: مهندس احمدی"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  نام شرکت یا سازمان (اختیاری)
                </label>
                <input
                  type="text"
                  value={formData.companyName || ""}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="مثال: هلدینگ فناوری داده‌پرداز"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  شماره تلفن همراه کارفرما <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="09123456789"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 font-mono placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none transition-colors text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  آدرس ایمیل (اختیاری)
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@company.com"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 font-mono placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none transition-colors text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">استان</label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                >
                  {PROVINCES_LIST.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">شهر</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="مثال: تهران"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  نشانی دقیق محل استقرار و کارگاه پروژه <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="آدرس دقیق خیابان، پلاک، طبقه و واحد جهت اعزام کارشناس و تیم نصب..."
                  className="w-full p-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Technical Specifications & Scope */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--theme-border-color)]">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Network className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--theme-foreground)]">
                  ۲. مشخصات فنی، استانداردها و محدوده پروژه
                </h2>
                <p className="text-[11px] text-neutral-400">
                  نوع خدمت، مقیاس زیرساخت، تعداد نودها و ظرفیت تجهیزات
                </p>
              </div>
            </div>

            {/* Primary Service Selection Grid */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2.5">
                خدمت اصلی و محوری پروژه
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {SERVICE_OPTIONS.map((svc) => {
                  const Icon = svc.icon;
                  const isSelected = formData.serviceType === svc.id;
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, serviceType: svc.id })}
                      className={cn(
                        "flex flex-col items-start gap-1.5 p-3 rounded-2xl border text-right transition-all",
                        isSelected
                          ? "bg-orange-500/15 border-orange-500 text-white shadow-sm"
                          : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon
                          className={cn("h-4 w-4", isSelected ? "text-orange-400" : "text-neutral-400")}
                        />
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-neutral-200 line-clamp-1">
                        {svc.title}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">{svc.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scale & Building Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  مقیاس کلی پروژه
                </label>
                <select
                  value={formData.projectScale}
                  onChange={(e) =>
                    setFormData({ ...formData, projectScale: e.target.value as ProjectScale })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                >
                  <option value="small">پروژه کوچک (تا ۱۶ نود / ۱ رک دیواری)</option>
                  <option value="medium">پروژه متوسط (۱۶ الی ۴۸ نود / ۱-۲ رک)</option>
                  <option value="large">پروژه بزرگ (۴۸ الی ۱۲۰ نود / چند طبقه)</option>
                  <option value="enterprise">پروژه سازمانی و دیتاسنتر (بیش از ۱۲۰ نود)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  کاربری ساختمان و محیط اجرا
                </label>
                <select
                  value={formData.buildingType}
                  onChange={(e) =>
                    setFormData({ ...formData, buildingType: e.target.value as BuildingType })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                >
                  {Object.entries(BUILDING_TYPE_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Numerical Scope Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              <div className="p-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-1">
                <span className="text-[11px] text-neutral-400 block font-medium">نودهای شبکه</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={formData.nodeCount}
                    onChange={(e) =>
                      setFormData({ ...formData, nodeCount: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    className="w-full h-8 px-2 rounded-lg border border-neutral-700 bg-neutral-900 text-xs font-mono text-orange-400 text-center font-bold focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400">نود</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-1">
                <span className="text-[11px] text-neutral-400 block font-medium">تعداد رک</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={formData.rackCount}
                    onChange={(e) =>
                      setFormData({ ...formData, rackCount: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    className="w-full h-8 px-2 rounded-lg border border-neutral-700 bg-neutral-900 text-xs font-mono text-orange-400 text-center font-bold focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400">دستگاه</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-1">
                <span className="text-[11px] text-neutral-400 block font-medium">دوربین CCTV</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={formData.cctvCount}
                    onChange={(e) =>
                      setFormData({ ...formData, cctvCount: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    className="w-full h-8 px-2 rounded-lg border border-neutral-700 bg-neutral-900 text-xs font-mono text-orange-400 text-center font-bold focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400">دوربین</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-1">
                <span className="text-[11px] text-neutral-400 block font-medium">کور فیبر نوری</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={formData.fiberCoreCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fiberCoreCount: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full h-8 px-2 rounded-lg border border-neutral-700 bg-neutral-900 text-xs font-mono text-orange-400 text-center font-bold focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400">کور</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-1">
                <span className="text-[11px] text-neutral-400 block font-medium">متراژ تقریبی</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    value={formData.approximateArea}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        approximateArea: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full h-8 px-2 rounded-lg border border-neutral-700 bg-neutral-900 text-xs font-mono text-orange-400 text-center font-bold focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400">مترمربع</span>
                </div>
              </div>
            </div>

            {/* Quality & Checklist Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needsFlukeTest}
                  onChange={(e) => setFormData({ ...formData, needsFlukeTest: e.target.checked })}
                  className="rounded border-neutral-700 bg-neutral-800 text-orange-500 focus:ring-orange-500 h-4 w-4"
                />
                <div className="text-right">
                  <span className="text-xs font-bold text-neutral-200 block">
                    تست فلوک ۱۰۰٪ (Fluke DSX-8000)
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    آنالیز کامل تمام نودها و ارائه سرتیفیکیت کتبی
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needsOnsiteSurvey}
                  onChange={(e) =>
                    setFormData({ ...formData, needsOnsiteSurvey: e.target.checked })
                  }
                  className="rounded border-neutral-700 bg-neutral-800 text-orange-500 focus:ring-orange-500 h-4 w-4"
                />
                <div className="text-right">
                  <span className="text-xs font-bold text-neutral-200 block">
                    نیازمند کارشناسی و بازدید حضوری
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    اعزام کارشناس ارشد جهت نقشه‌برداری میدانی
                  </span>
                </div>
              </label>
            </div>

            {/* Equipment status & timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  وضعیت تأمین تجهیزات
                </label>
                <select
                  value={formData.equipmentStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      equipmentStatus: e.target.value as EquipmentStatus,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                >
                  <option value="need_purchase_from_netmarket">
                    نیاز به تأمین کامل کابل و تجهیزات از فروشگاه
                  </option>
                  <option value="already_purchased">
                    تجهیزات از قبل توسط کارفرما خریداری شده
                  </option>
                  <option value="need_consultation">نیازمند مشاوره فنی و انتخاب متریال</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  زمان‌بندی ترجیحی شروع پروژه
                </label>
                <select
                  value={formData.preferredTimeline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredTimeline: e.target.value as PreferredTimeline,
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                >
                  <option value="urgent">فوری (طی ۲۴ الی ۴۸ ساعت آینده)</option>
                  <option value="this_week">در طول همین هفته</option>
                  <option value="next_two_weeks">طی دو هفته آینده</option>
                  <option value="flexible">منعطف با هماهنگی کارفرما و زمان‌بندی فنی</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: Attachments & Architectural CAD Plans */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--theme-border-color)]">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <UploadCloud className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--theme-foreground)]">
                  ۳. فایل ضمیمه، نقشه اتوکد یا مستندات پروژه
                </h2>
                <p className="text-[11px] text-neutral-400">
                  فایل‌های DWG، پلان ساختمان، فایل اکسل BOM یا دیاگرام شبکه (حداکثر ۱۵ مگابایت)
                </p>
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-orange-500/60 bg-neutral-900/40 hover:bg-neutral-900/70 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".dwg,.dxf,.pdf,.zip,.rar,.png,.jpg,.jpeg,.xlsx,.docx"
              />
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="text-xs text-neutral-300 font-semibold">
                فایل نقشه یا مستند را اینجا بکشید یا برای انتخاب کلیک کنید
              </div>
              <div className="text-[10px] text-neutral-400">
                پشتیبانی از AutoCAD (.dwg, .dxf)، اسناد PDF، تصاویر و آرشیو فشرده ZIP تا سقف ۱۵MB
              </div>
            </div>

            {uploadedFile && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-300 font-mono">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold">{uploadedFile.name}</span>
                  <span className="text-[10px] text-neutral-400">
                    ({(uploadedFile.size / (1024 * 1024)).toFixed(2)} مگابایت)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Card 4: Client Notes & Internal Admin Notes */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--theme-border-color)]">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--theme-foreground)]">
                  ۴. توضیحات کارفرما و یادداشت‌های محرمانه ادمین
                </h2>
                <p className="text-[11px] text-neutral-400">
                  تفکیک توضیحات عمومی از یادداشت‌های مدیریتی داخلی
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  توضیحات و نیازمندی‌های کارفرما (قابل رؤیت در گزارش عمومی)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="نیازمندی‌های خاص کارفرما، ساعات مجاز کارگاه، محدودیت‌های امنیتی ساختمان..."
                  className="w-full p-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>

              <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Lock className="h-3.5 w-3.5" />
                  <span>یادداشت محرمانه داخلی مدیران (Admin Internal Note)</span>
                </div>
                <p className="text-[10px] text-neutral-400">
                  این متن فقط برای مدیران پنل و سرپرستان ارشد فنی قابل مشاهده است و در پرتال کارفرما نمایش داده نمی‌شود.
                </p>
                <textarea
                  rows={3}
                  value={formData.adminNotes || ""}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  placeholder="شروط توافق، تخفیف‌های ویژه، ارزیابی اعتبار مالی، نکات حساس کارگاهی..."
                  className="w-full p-3 rounded-xl border border-amber-500/30 bg-neutral-900/90 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right / Sticky Admin Sidebar (4 cols) ────────────────────── */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Status Selection Card */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border-color)]">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-orange-400" />
                <span>وضعیت اولیه پروژه</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Status</span>
            </div>

            <div className="space-y-2">
              {STATUS_OPTIONS.map((st) => {
                const isSelected = formData.status === st.value;
                return (
                  <label
                    key={st.value}
                    onClick={() => setFormData({ ...formData, status: st.value })}
                    className={cn(
                      "flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all",
                      isSelected
                        ? cn(st.badgeClass, "shadow-sm font-bold")
                        : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                    )}
                  >
                    <input
                      type="radio"
                      name="initialStatus"
                      checked={isSelected}
                      onChange={() => setFormData({ ...formData, status: st.value })}
                      className="mt-1 text-orange-500 focus:ring-orange-500"
                    />
                    <div className="text-right flex-1">
                      <div className="text-xs font-bold leading-tight">{st.label}</div>
                      <div className="text-[10px] text-neutral-400 font-normal mt-0.5">{st.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Technical Supervisor Card */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border-color)]">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-orange-400" />
                <span>سرپرست تیم فنی و اجرایی</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Team Lead</span>
            </div>

            {/* Quick Team Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-neutral-400 block font-semibold">
                تیم‌های آماده استقرار:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEAMS.map((t) => (
                  <button
                    key={t.lead}
                    type="button"
                    onClick={() => handleQuickTeamSelect(t)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors",
                      formData.assignedTeamLead === t.lead
                        ? "bg-orange-500/20 border-orange-500 text-orange-300"
                        : "bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-neutral-200"
                    )}
                  >
                    {t.lead}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  نام و نام خانوادگی سرپرست
                </label>
                <input
                  type="text"
                  value={formData.assignedTeamLead || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTeamLead: e.target.value })
                  }
                  placeholder="مهندس شریفی"
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  سمت یا نقش فنی
                </label>
                <input
                  type="text"
                  value={formData.assignedTeamRole || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTeamRole: e.target.value })
                  }
                  placeholder="سرپرست ارشد پروژه‌های پسیو"
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  تلفن تماس هماهنگی
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.assignedTeamPhone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedTeamPhone: e.target.value })
                  }
                  placeholder="09134761097"
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 font-mono focus:border-orange-500 focus:outline-none text-right"
                />
              </div>
            </div>
          </div>

          {/* Financial Quotation Card */}
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-border-color)]">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span>برآورد مالی و پیش‌فاکتور</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Toman</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    حداقل برآورد اولیه
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {formatPrice(formData.minEstimatedCost || 0)}
                  </span>
                </div>
                <input
                  type="number"
                  step={50000}
                  value={formData.minEstimatedCost || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minEstimatedCost: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 font-mono focus:border-orange-500 focus:outline-none text-right"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-neutral-300">
                    حداکثر برآورد اولیه
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {formatPrice(formData.maxEstimatedCost || 0)}
                  </span>
                </div>
                <input
                  type="number"
                  step={50000}
                  value={formData.maxEstimatedCost || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxEstimatedCost: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 font-mono focus:border-orange-500 focus:outline-none text-right"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-emerald-400">
                    مبلغ قطعی پیش‌فاکتور مصوب (اختیاری)
                  </label>
                  {formData.finalQuotationAmount && (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {formatPrice(formData.finalQuotationAmount)}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step={100000}
                  value={formData.finalQuotationAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalQuotationAmount: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="در صورت توافق، مبلغ نهایی را وارد کنید..."
                  className="w-full h-9 px-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-emerald-200 font-mono placeholder:text-neutral-500 focus:border-emerald-400 focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  مدت زمان تخمینی اجرا
                </label>
                <input
                  type="text"
                  value={formData.estimatedDays || ""}
                  onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                  placeholder="مثال: ۲ الی ۳ روز کاری"
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-900/80 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Box */}
          <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-b from-orange-500/10 via-[var(--theme-surface)] to-[var(--theme-surface)] p-5 shadow-sm space-y-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 gap-2 bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              <span>{isSubmitting ? "در حال ثبت اطلاعات..." : "ثبت و ایجاد پروژه"}</span>
            </Button>

            <Link href="/admin/installation" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-9 text-xs text-neutral-400 border-neutral-700 hover:bg-neutral-800 hover:text-white"
              >
                انصراف و بازگشت به لیست
              </Button>
            </Link>

            <p className="text-[10px] text-neutral-400 text-center leading-relaxed pt-1">
              پس از ثبت موفق، کد رهگیری یکتا صادر شده و مستقیماً به صفحه مدیریت و جزئیات پروژه هدایت خواهید شد.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
