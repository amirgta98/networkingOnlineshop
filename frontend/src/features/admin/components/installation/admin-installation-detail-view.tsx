"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Save,
  Loader2,
  CheckCircle2,
  Clock,
  UserCheck,
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
  FileText,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Download,
  Trash2,
  Sparkles,
} from "lucide-react";
import type {
  InstallationAdminItem,
  InstallationStatus,
  TrackingStep,
} from "@/features/installation/types";
import { installationApi } from "@/features/installation/api/installation-api";
import { Button } from "@/shared/components/ui/button";
import { cn, toPersianDigits, formatPrice } from "@/shared/lib/utils";

interface AdminInstallationDetailViewProps {
  id: string;
}

const STATUS_OPTIONS: { value: InstallationStatus; label: string }[] = [
  { value: "PENDING_REVIEW", label: "در انتظار بررسی" },
  { value: "ASSIGNED", label: "تخصیص‌یافته به کارشناس" },
  { value: "SURVEY_SCHEDULED", label: "هماهنگی و بازدید حضوری" },
  { value: "IN_PROGRESS", label: "در حال اجرای عملیات" },
  { value: "COMPLETED", label: "تحویل نهایی و پایان‌یافته" },
  { value: "CANCELLED", label: "لغوشده" },
];

const DEFAULT_TRACKING_STEPS: TrackingStep[] = [
  {
    title: "ثبت آنلاین درخواست و مشاوره اولیه",
    description: "درخواست آنلاین دریافت شد و کد رهگیری یکتا صادر گردید.",
    date: "انجام‌شده",
    status: "completed",
  },
  {
    title: "کارشناسی، هماهنگی و بازدید از محل",
    description: "کارشناس ارشد زیرساخت جهت تأیید فنی و زمان‌بندی بازدید با شما تماس خواهد گرفت.",
    date: "در دست اقدام",
    status: "current",
  },
  {
    title: "صدور پیش‌فاکتور شفاف و زمان‌بندی دقیق",
    description: "متره‌کشی محل پروژه و ارائه چک‌لیست دقیق متریال (BOM) و برآورد زمان اجرا.",
    date: "مرحله بعد",
    status: "upcoming",
  },
  {
    title: "عملیات اجرایی و کابل‌کشی مهندسی",
    description: "استقرار تیم فنی، ترانکینگ، آرایش رک‌ها و کابل‌کشی طبق استانداردهای TIA-568-D.",
    date: "مرحله بعد",
    status: "upcoming",
  },
  {
    title: "تست فلوک ۱۰۰٪ و تحویل گارانتی کتبی",
    description: "آنالیز کامل تمام نودها با Fluke DSX-8000 و تحویل گواهی ۱۸ ماهه.",
    date: "تخمین مرحله نهایی",
    status: "upcoming",
  },
];

export function AdminInstallationDetailView({ id }: AdminInstallationDetailViewProps) {
  const router = useRouter();

  const [item, setItem] = React.useState<InstallationAdminItem | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  // Editable Form Fields
  const [status, setStatus] = React.useState<InstallationStatus>("PENDING_REVIEW");
  const [assignedLead, setAssignedLead] = React.useState("");
  const [assignedRole, setAssignedRole] = React.useState("");
  const [assignedPhone, setAssignedPhone] = React.useState("");
  const [finalQuote, setFinalQuote] = React.useState("");
  const [estimatedDays, setEstimatedDays] = React.useState("");
  const [adminNotes, setAdminNotes] = React.useState("");
  const [steps, setSteps] = React.useState<TrackingStep[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadItem = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await installationApi.getAdminRequestById(id);
      setItem(data);
      setStatus(data.status);
      setAssignedLead(data.assignedTeamLead || "");
      setAssignedRole(data.assignedTeamRole || "");
      setAssignedPhone(data.assignedTeamPhone || "");
      setFinalQuote(data.finalQuotationAmount ? String(data.finalQuotationAmount) : "");
      setEstimatedDays(data.estimatedDays || "");
      setAdminNotes(data.adminNotes || "");
      const hasValidSteps =
        Array.isArray(data.trackingSteps) &&
        data.trackingSteps.length > 0 &&
        typeof data.trackingSteps[0]?.title === "string" &&
        data.trackingSteps[0].title.trim().length > 0;
      setSteps(hasValidSteps ? (data.trackingSteps as TrackingStep[]) : DEFAULT_TRACKING_STEPS);
    } catch (err: any) {
      console.error("Failed to fetch installation detail:", err);
      setErrorMsg(err?.message || "خطا در دریافت اطلاعات درخواست.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const cleanQuote = finalQuote.trim() ? Number(finalQuote.replace(/[^0-9]/g, "")) : undefined;

      const updated = await installationApi.updateAdminRequest(item.id, {
        status,
        assignedTeamLead: assignedLead.trim() || undefined,
        assignedTeamRole: assignedRole.trim() || undefined,
        assignedTeamPhone: assignedPhone.trim() || undefined,
        finalQuotationAmount: cleanQuote,
        estimatedDays: estimatedDays.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
        trackingSteps: steps,
      });

      setItem(updated);
      showToast("تغییرات پروژه با موفقیت در پایگاه داده ذخیره شد.");
    } catch (err: any) {
      console.error("Save failed:", err);
      setErrorMsg(err?.message || "خطا در ذخیره تغییرات.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (newStatus: InstallationStatus) => {
    setStatus(newStatus);
    let targetCompletedCount = 1;
    if (newStatus === "PENDING_REVIEW") targetCompletedCount = 1;
    else if (newStatus === "ASSIGNED") targetCompletedCount = 2;
    else if (newStatus === "SURVEY_SCHEDULED") targetCompletedCount = 3;
    else if (newStatus === "IN_PROGRESS") targetCompletedCount = 4;
    else if (newStatus === "COMPLETED") targetCompletedCount = 5;
    else if (newStatus === "CANCELLED") targetCompletedCount = 0;

    setSteps((prev) => {
      const base = prev && prev.length > 0 ? prev : DEFAULT_TRACKING_STEPS;
      return base.map((st, idx) => {
        if (newStatus === "COMPLETED") return { ...st, status: "completed" };
        if (newStatus === "CANCELLED") return { ...st, status: "upcoming" };
        if (idx < targetCompletedCount - 1) return { ...st, status: "completed" };
        if (idx === targetCompletedCount - 1) return { ...st, status: "current" };
        return { ...st, status: "upcoming" };
      });
    });
  };

  const handleStepStatusChange = (index: number, newStatus: "completed" | "current" | "upcoming") => {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status: newStatus } : s))
    );
  };

  const handleStepDescChange = (index: number, newDesc: string) => {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, description: newDesc } : s))
    );
  };

  const handleStepDateChange = (index: number, newDate: string) => {
    setSteps((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, date: newDate } : s))
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        <p className="text-xs">در حال بارگذاری جزئیات پروژه...</p>
      </div>
    );
  }

  if (errorMsg || !item) {
    return (
      <div className="p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-4" dir="rtl">
        <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-rose-300">{errorMsg || "پروژه یافت نشد."}</h3>
        <Link href="/admin/installation">
          <Button variant="outline" size="sm" className="text-xs">
            بازگشت به لیست پروژه‌ها
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/40 text-emerald-200 text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Bar & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--theme-border-color)]">
        <div className="flex items-center gap-3">
          <Link href="/admin/installation">
            <Button variant="ghost" size="sm" className="h-9 px-2.5 text-neutral-400 hover:text-white">
              <ArrowRight className="h-4 w-4 ml-1" />
              <span className="text-xs">بازگشت</span>
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[var(--theme-foreground)]">
                مدیریت پروژه {item.trackingCode}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400">
                {item.serviceTitle}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              کارفرما: <strong className="text-neutral-200">{item.fullName}</strong>
              {item.companyName && ` (${item.companyName})`}
              {" — "}
              تاریخ ثبت: {new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeStyle: "short" }).format(new Date(item.createdAt))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/installation?code=${item.trackingCode}#installation-tracker`} target="_blank">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs text-neutral-300 border-neutral-700">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>نمای مشتری</span>
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="h-9 gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-black font-bold"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>ذخیره کلیه تغییرات</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 2 Columns (Technical & Workflow) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Progress Stepper */}
          <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--theme-foreground)] flex items-center gap-2">
                <Network className="h-4 w-4 text-orange-400" />
                <span>مراحل اجرایی و فرآیند پروژه (Workflow)</span>
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-400">وضعیت کل:</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as InstallationStatus)}
                  className="h-8 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Steps list */}
            <div className="space-y-3 pt-2">
              {steps.map((st, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    st.status === "completed"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : st.status === "current"
                      ? "border-orange-500/40 bg-orange-500/10"
                      : "border-neutral-800 bg-neutral-900/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          st.status === "completed"
                            ? "bg-emerald-500 text-black"
                            : st.status === "current"
                            ? "bg-orange-500 text-black animate-pulse"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {toPersianDigits(idx + 1)}
                      </span>
                      <span className="text-xs font-bold text-neutral-200">{st.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStepStatusChange(idx, "completed")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          st.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                        }`}
                      >
                        تکمیل‌شده
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepStatusChange(idx, "current")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          st.status === "current"
                            ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                        }`}
                      >
                        در دست اقدام
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStepStatusChange(idx, "upcoming")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          st.status === "upcoming"
                            ? "bg-neutral-700/50 text-neutral-300 border-neutral-600"
                            : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"
                        }`}
                      >
                        آینده
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={st.description || ""}
                        onChange={(e) => handleStepDescChange(idx, e.target.value)}
                        placeholder="توضیحات این مرحله که مشتری در پرتال مشاهده می‌کند..."
                        className="w-full h-8 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 text-xs text-neutral-300 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={st.date || ""}
                        onChange={(e) => handleStepDateChange(idx, e.target.value)}
                        placeholder="زمان/تاریخ (مثال: در دست اقدام)"
                        className="w-full h-8 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 text-xs text-neutral-400 font-mono focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specifications Card */}
          <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[var(--theme-foreground)] flex items-center gap-2">
              <Server className="h-4 w-4 text-orange-400" />
              <span>مشخصات فنی و مقیاس اعلام‌شده</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 block mb-1">نودهای شبکه</span>
                <span className="text-base font-black text-neutral-200">
                  {toPersianDigits(item.nodeCount)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 block mb-1">تعداد دوربین CCTV</span>
                <span className="text-base font-black text-neutral-200">
                  {toPersianDigits(item.cctvCount)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 block mb-1">تعداد رک</span>
                <span className="text-base font-black text-neutral-200">
                  {toPersianDigits(item.rackCount)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 block mb-1">متراژ تقریبی</span>
                <span className="text-base font-black text-neutral-200">
                  {toPersianDigits(item.approximateArea)} م²
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800">
                <span className="text-neutral-400">تست فلوک استاندارد:</span>
                <span className="font-bold text-neutral-200">
                  {item.needsFlukeTest ? "بله (الزامی و دارای گواهی)" : "خیر"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800">
                <span className="text-neutral-400">بازدید و متره‌کشی حضوری:</span>
                <span className="font-bold text-neutral-200">
                  {item.needsOnsiteSurvey ? "درخواست داده شده" : "خیر"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800">
                <span className="text-neutral-400">وضعیت خرید تجهیزات:</span>
                <span className="font-bold text-neutral-200">
                  {item.equipmentStatus === "already_purchased"
                    ? "خریداری شده"
                    : item.equipmentStatus === "need_purchase_from_netmarket"
                    ? "خرید از ققنوس"
                    : "نیاز به مشاوره"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800">
                <span className="text-neutral-400">فوریت زمان‌بندی:</span>
                <span className="font-bold text-neutral-200">
                  {item.preferredTimeline === "urgent"
                    ? "فوری (۲۴ ساعته)"
                    : item.preferredTimeline === "this_week"
                    ? "ظرف همین هفته"
                    : "انعطاف‌پذیر"}
                </span>
              </div>
            </div>

            {/* Notes & Attachments */}
            {item.notes && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-neutral-300 block mb-1">
                  توضیحات و نیازمندی‌های اختصاصی کارفرما:
                </span>
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                  {item.notes}
                </div>
              </div>
            )}

            {item.hasAttachment && item.attachmentUrl && (
              <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-400" />
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">
                      فایل پلان / نقشه ضمیمه کارفرما
                    </span>
                    <span className="text-[10px] text-neutral-400">{item.attachmentName || "سند پروژه"}</span>
                  </div>
                </div>
                <a
                  href={item.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500/25 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>دانلود فایل</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column (Customer, Team, Financials) */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--theme-foreground)] flex items-center gap-2">
              <User className="h-4 w-4 text-orange-400" />
              <span>اطلاعات تماس و نشانی کارفرما</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">نام مخاطب:</span>
                <span className="font-bold text-neutral-200">{item.fullName}</span>
              </div>
              {item.companyName && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">شرکت / سازمان:</span>
                  <span className="font-bold text-neutral-200">{item.companyName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">شماره همراه:</span>
                <a
                  href={`tel:${item.phoneNumber}`}
                  className="font-mono font-bold text-orange-400 hover:underline"
                  dir="ltr"
                >
                  {item.phoneNumber}
                </a>
              </div>
              {item.email && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">ایمیل:</span>
                  <span className="font-mono text-neutral-300">{item.email}</span>
                </div>
              )}
              <div className="pt-2 border-t border-neutral-800">
                <span className="text-neutral-400 block mb-1">استان و شهر:</span>
                <span className="font-semibold text-neutral-200 block">
                  {item.province} — {item.city}
                </span>
                <span className="text-[11px] text-neutral-300 block mt-1 leading-relaxed">
                  {item.address}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Technician & Team Card */}
          <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--theme-foreground)] flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-orange-400" />
              <span>تخصیص سرپرست تیم فنی</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  نام سرپرست تیم:
                </label>
                <input
                  type="text"
                  value={assignedLead}
                  onChange={(e) => setAssignedLead(e.target.value)}
                  placeholder="مثال: مهندس حسینی"
                  className="w-full h-8 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2.5 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  سمت و نقش فنی:
                </label>
                <input
                  type="text"
                  value={assignedRole}
                  onChange={(e) => setAssignedRole(e.target.value)}
                  placeholder="مثال: کارشناس ارشد دیتاسنتر"
                  className="w-full h-8 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2.5 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  تلفن تماس مستقیم سرپرست:
                </label>
                <input
                  type="text"
                  value={assignedPhone}
                  onChange={(e) => setAssignedPhone(e.target.value)}
                  placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full h-8 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2.5 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Financials & Estimated Days */}
          <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--theme-foreground)] flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-400" />
              <span>برآورد مالی و پیش‌فاکتور</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-400">بازه تخمینی اولیه سیستم:</span>
                <span className="font-bold text-neutral-200 block text-xs">
                  {formatPrice(item.minEstimatedCost)} الی {formatPrice(item.maxEstimatedCost)} تومان
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  مبلغ پیش‌فاکتور مصوب (تومان):
                </label>
                <input
                  type="text"
                  value={finalQuote}
                  onChange={(e) => setFinalQuote(e.target.value)}
                  placeholder="مثال: ۴۸۵۰۰۰۰۰"
                  className="w-full h-8 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2.5 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  تخمین مدت زمان اجرا:
                </label>
                <input
                  type="text"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="مثال: ۳ الی ۵ روز کاری"
                  className="w-full h-8 rounded-xl border border-neutral-700 bg-neutral-900/80 px-2.5 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 space-y-3">
            <h3 className="text-sm font-bold text-[var(--theme-foreground)] flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-400" />
              <span>یادداشت‌های داخلی مدیریت</span>
            </h3>

            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="یادداشت‌های فنی، هماهنگی‌های ورود به سایت، اسناد مالی و ..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 p-2.5 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
