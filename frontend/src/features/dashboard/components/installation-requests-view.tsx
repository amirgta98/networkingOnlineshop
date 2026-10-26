"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wrench,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  UserCheck,
  Building2,
  MapPin,
  PhoneCall,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  Server,
  Network,
  Camera,
  Wifi,
  Cpu,
  Zap,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  FileText,
  DollarSign,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { installationApi } from "@/features/installation/api/installation-api";
import type {
  InstallationAdminItem,
  InstallationServiceCategory,
  InstallationRequestFormData,
} from "@/features/installation/types";
import {
  INSTALLATION_SERVICES,
  PROVINCES_LIST,
  BUILDING_TYPE_LABELS,
} from "@/features/installation/mock-data/installation-data";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardEmptyState,
  DashboardModal,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { cn, toPersianDigits, formatPrice } from "@/shared/lib/utils";

const SERVICE_ICONS: Record<string, React.ElementType> = {
  cabling: Network,
  datacenter: Server,
  cctv: Camera,
  wireless: Wifi,
  switching: Cpu,
  fiber: Zap,
  "ups-power": ShieldCheck,
  other: Wrench,
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  PENDING_REVIEW: {
    label: "در انتظار بررسی فنی",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    dotClass: "bg-amber-400",
  },
  ASSIGNED: {
    label: "تخصیص‌یافته به کارشناس",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/25",
    dotClass: "bg-blue-400",
  },
  SURVEY_SCHEDULED: {
    label: "هماهنگی و بازدید حضوری",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/25",
    dotClass: "bg-purple-400",
  },
  IN_PROGRESS: {
    label: "در حال اجرای عملیات کارگاهی",
    badgeClass: "bg-orange-500/10 text-orange-400 border-orange-500/25",
    dotClass: "bg-orange-400 animate-pulse",
  },
  COMPLETED: {
    label: "تحویل نهایی و دارای گارانتی",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    dotClass: "bg-emerald-400",
  },
  CANCELLED: {
    label: "لغوشده",
    badgeClass: "bg-neutral-800 text-neutral-400 border-neutral-700",
    dotClass: "bg-neutral-500",
  },
};

export function InstallationRequestsView() {
  const { user } = useAuth();

  const [requests, setRequests] = React.useState<InstallationAdminItem[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] =
    React.useState<InstallationAdminItem | null>(null);

  // Copy code feedback
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  // New Request Form State
  const [newService, setNewService] =
    React.useState<InstallationServiceCategory>("cabling");
  const [newFullName, setNewFullName] = React.useState(user?.name || "");
  const [newPhone, setNewPhone] = React.useState(user?.phone || "");
  const [newCompany, setNewCompany] = React.useState("");
  const [newProvince, setNewProvince] = React.useState("تهران");
  const [newCity, setNewCity] = React.useState("تهران");
  const [newAddress, setNewAddress] = React.useState("");
  const [newNodeCount, setNewNodeCount] = React.useState<number>(24);
  const [newApproxArea, setNewApproxArea] = React.useState<number>(120);
  const [newRackCount, setNewRackCount] = React.useState<number>(1);
  const [newCctvCount, setNewCctvCount] = React.useState<number>(0);
  const [newNeedsFluke, setNewNeedsFluke] = React.useState(true);
  const [newNotes, setNewNotes] = React.useState("");
  const [isSubmittingNew, setIsSubmittingNew] = React.useState(false);
  const [newSuccessCode, setNewSuccessCode] = React.useState<string | null>(null);
  const [newFormError, setNewFormError] = React.useState<string | null>(null);

  // Fetch Requests
  const loadRequests = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await installationApi.getUserRequests(user?.phone || undefined);
      setRequests(data);
    } catch (err: any) {
      console.warn("Failed to load user installation requests:", err);
      // Fallback: check admin or public track
      try {
        const adminData = await installationApi.getAdminRequests({ limit: 10 });
        setRequests(adminData.items || []);
      } catch (fallbackErr) {
        setErrorMsg("خطا در بارگذاری لیست درخواست‌های نصب.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const handleNewRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) {
      setNewFormError("نام و نام خانوادگی را وارد نمایید.");
      return;
    }
    if (!newPhone.trim()) {
      setNewFormError("شماره تماس را وارد نمایید.");
      return;
    }

    setIsSubmittingNew(true);
    setNewFormError(null);

    const formData: InstallationRequestFormData = {
      serviceType: newService,
      secondaryServices: [],
      projectScale: "medium",
      buildingType: "office",
      approximateArea: Number(newApproxArea || 0),
      nodeCount: Number(newNodeCount || 0),
      cctvCount: Number(newCctvCount || 0),
      rackCount: Number(newRackCount || 0),
      fiberCoreCount: 0,
      equipmentStatus: "need_purchase_from_netmarket",
      needsFlukeTest: newNeedsFluke,
      needsOnsiteSurvey: true,
      preferredTimeline: "this_week",
      province: newProvince,
      city: newCity,
      address: newAddress,
      fullName: newFullName.trim(),
      companyName: newCompany.trim() || "",
      phoneNumber: newPhone.trim(),
      email: user?.email || undefined,
      notes: newNotes.trim() || "",
      hasAttachment: false,
    };

    try {
      const res = await installationApi.submitRequest(formData);
      setNewSuccessCode(res.trackingCode);
      loadRequests();
    } catch (err: any) {
      console.error("Submission failed:", err);
      setNewFormError(err?.message || "خطا در ثبت درخواست پروژه.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Filtered requests
  const filteredRequests = React.useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.trackingCode.toLowerCase().includes(q) ||
        r.serviceTitle.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        (r.assignedTeamLead && r.assignedTeamLead.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchQuery]);

  // Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (r) => r.status === "PENDING_REVIEW"
  ).length;
  const inProgressCount = requests.filter(
    (r) =>
      r.status === "IN_PROGRESS" ||
      r.status === "ASSIGNED" ||
      r.status === "SURVEY_SCHEDULED"
  ).length;
  const completedCount = requests.filter(
    (r) => r.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <DashboardPageHeader
        title="درخواست‌های نصب و پروژه‌های پسیو شبکه"
        description="پیگیری مراحل ۵‌گانه کارگاهی، زمان‌بندی بازدید، مشخصات ناظر پروژه و صدور گواهی تست فلوک"
        icon={Wrench}
        badge="تضمین ۱۸ ماهه کیفیت"
        badgeVariant="emerald"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/installation#request-form">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-neutral-700 text-neutral-300 hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>صفحه جامع خدمات</span>
              </Button>
            </Link>
            <Button
              onClick={() => {
                setNewSuccessCode(null);
                setNewFormError(null);
                setIsNewModalOpen(true);
              }}
              size="sm"
              className="gap-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>ثبت درخواست جدید پروژه</span>
            </Button>
          </div>
        }
      />

      {/* ── Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DashboardMetricCard
          title="کل پروژه‌ها"
          value={totalCount}
          subtitle="درخواست‌های ثبت‌شده در پرتال"
          icon={Layers}
          variant="purple"
        />
        <DashboardMetricCard
          title="در انتظار بررسی فنی"
          value={pendingCount}
          subtitle="بررسی اولیه توسط ناظر ارشد"
          icon={Clock}
          variant="amber"
        />
        <DashboardMetricCard
          title="در حال اجرا یا بازدید"
          value={inProgressCount}
          subtitle="تیم اجرایی مستقر در محل"
          icon={Wrench}
          variant="orange"
        />
        <DashboardMetricCard
          title="تحویل‌شده و پایان‌یافته"
          value={completedCount}
          subtitle="دارای گواهی فلوک و گارانتی"
          icon={ShieldCheck}
          variant="emerald"
        />
      </div>

      {/* ── Filter & Search Bar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو با کد رهگیری (مثال: NET-INST-9905)، نوع خدمت یا شهر..."
            className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-950 pr-10 pl-4 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400 whitespace-nowrap">
            وضعیت:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-neutral-700 bg-neutral-950 px-3 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="PENDING_REVIEW">در انتظار بررسی</option>
            <option value="ASSIGNED">تخصیص کارشناس</option>
            <option value="SURVEY_SCHEDULED">هماهنگی بازدید</option>
            <option value="IN_PROGRESS">در حال اجرا</option>
            <option value="COMPLETED">تحویل نهایی</option>
          </select>
        </div>
      </div>

      {/* ── Content Area: List or Empty ──────────────────────────────── */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-xs">در حال دریافت پروژه‌ها و درخواست‌های نصب...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <DashboardEmptyState
          title="درخواستی برای نمایش یافت نشد"
          description={
            searchQuery || statusFilter !== "all"
              ? "با فیلترهای انتخاب‌شده نتیجه‌ای یافت نشد. فیلترها را تغییر دهید."
              : "هنوز هیچ درخواست نصبی ثبت نکرده‌اید. با کلیک بر روی دکمه زیر، اولین پروژه خود را به صورت آنلاین ثبت نمایید."
          }
          icon={Wrench}
          actionLabel="ثبت اولین درخواست پروژه نصب"
          onActionClick={() => {
            setNewSuccessCode(null);
            setIsNewModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const ServiceIcon = SERVICE_ICONS[req.serviceType] || Wrench;
            const statusMeta =
              STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING_REVIEW;
            const progress = req.statusPercent ?? 20;

            return (
              <div
                key={req.id}
                className="group relative rounded-2xl border border-neutral-800 bg-[#121216] hover:border-neutral-700 p-5 sm:p-6 transition-all duration-200 space-y-4 shadow-lg hover:shadow-xl"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      <ServiceIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {req.serviceTitle}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        <span className="flex items-center gap-1 font-mono text-neutral-300">
                          <Calendar className="h-3 w-3 text-neutral-500" />
                          {new Intl.DateTimeFormat("fa-IR", {
                            dateStyle: "medium",
                          }).format(new Date(req.createdAt))}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-neutral-500" />
                          {req.province}، {req.city}
                        </span>
                        {req.companyName && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-300">
                              {req.companyName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Code Chip & Status Badge */}
                  <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-lg">
                      <span className="text-[11px] text-neutral-400">کد رهگیری:</span>
                      <span className="font-mono text-xs font-bold text-orange-400" dir="ltr">
                        {req.trackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(req.trackingCode)}
                        title="کپی کد رهگیری"
                        className="mr-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedCode === req.trackingCode ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                        statusMeta.badgeClass
                      )}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", statusMeta.dotClass)}
                      />
                      <span>{statusMeta.label}</span>
                    </span>
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col">
                    <span className="text-[11px] text-neutral-400">تعداد نود شبکه:</span>
                    <span className="font-mono font-bold text-white text-sm mt-0.5">
                      {req.nodeCount > 0 ? `${toPersianDigits(req.nodeCount)} نود` : "مشاوره / نامشخص"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col">
                    <span className="text-[11px] text-neutral-400">تعداد رک / یونیت:</span>
                    <span className="font-mono font-bold text-white text-sm mt-0.5">
                      {req.rackCount > 0 ? `${toPersianDigits(req.rackCount)} رک` : "بدون رک"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col">
                    <span className="text-[11px] text-neutral-400">مساحت تقریبی:</span>
                    <span className="font-mono font-bold text-white text-sm mt-0.5">
                      {req.approximateArea > 0 ? `${toPersianDigits(req.approximateArea)} مترمربع` : "نامشخص"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col">
                    <span className="text-[11px] text-neutral-400">تست فلوک ۱۰۰٪:</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5">
                      {req.needsFlukeTest ? "شامل آنالیز Fluke DSX" : "بدون تست فلوک"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Current Step */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      پیشرفت مراحل پروژه ({toPersianDigits(progress)}٪)
                    </span>
                    <span className="text-orange-400 font-medium">
                      {progress === 100
                        ? "تکمیل ۱۰۰٪ و تحویل سرتیفیکیت"
                        : `مرحله ${toPersianDigits((req.currentStepIndex ?? 0) + 1)} از ۵`}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer Row (Technician & Actions) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800/80 text-xs">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400">
                      <UserCheck className="h-3.5 w-3.5" />
                    </div>
                    <span>
                      مهندس ناظر:{" "}
                      <strong className="text-white font-semibold">
                        {req.assignedTeamLead || "در حال هماهنگی"}
                      </strong>
                    </span>
                    {req.assignedTeamPhone && (
                      <a
                        href={`tel:${req.assignedTeamPhone}`}
                        className="mr-2 inline-flex items-center gap-1 font-mono text-emerald-400 hover:underline"
                        dir="ltr"
                      >
                        <PhoneCall className="h-3 w-3" />
                        <span>{req.assignedTeamPhone}</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(req)}
                      className="text-xs h-8 border-neutral-700 text-neutral-300 hover:text-white"
                    >
                      <FileText className="h-3.5 w-3.5 ml-1" />
                      <span>مشاهده جزئیات و نقشه</span>
                    </Button>

                    <Link
                      href={`/installation?code=${req.trackingCode}#installation-tracker`}
                      target="_blank"
                    >
                      <Button
                        size="sm"
                        className="text-xs h-8 bg-orange-600 hover:bg-orange-500 text-white font-bold gap-1 shadow-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>رهگیری برخط پروژه (Tracker)</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Detail View ───────────────────────────────────────── */}
      {selectedRequest && (
        <DashboardModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`جزئیات پرونده اجرایی ${selectedRequest.trackingCode}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-right" dir="rtl">
            {/* Top metadata banner */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs text-neutral-400 block">خدمت انتخابی:</span>
                <span className="font-bold text-white text-sm">
                  {selectedRequest.serviceTitle}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-neutral-400 block">وضعیت فعلی:</span>
                <span className="text-xs font-bold text-orange-400">
                  {STATUS_CONFIG[selectedRequest.status]?.label || selectedRequest.status}
                </span>
              </div>
            </div>

            {/* Steps Timeline in modal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-orange-400" />
                <span>مراحل ۵‌گانه اجرایی پروژه:</span>
              </h4>
              <div className="space-y-2">
                {(selectedRequest.trackingSteps || []).map((st, idx) => {
                  const isDone = st.status === "completed";
                  const isCurr = st.status === "current";
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-colors",
                        isDone
                          ? "bg-emerald-950/15 border-emerald-500/30 text-emerald-200"
                          : isCurr
                          ? "bg-orange-950/20 border-orange-500/50 text-white ring-1 ring-orange-500/30"
                          : "bg-neutral-900/40 border-neutral-800 text-neutral-400"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : isCurr ? (
                            <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse mt-1" />
                          ) : (
                            <span className="flex h-2 w-2 rounded-full bg-neutral-600 mt-1" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold block text-sm">
                            {idx + 1}. {st.title}
                          </span>
                          <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                            {st.description}
                          </p>
                        </div>
                      </div>
                      {st.date && (
                        <span className="font-mono text-[10px] text-neutral-500 shrink-0">
                          {st.date}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full Spec Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div>
                <span className="text-neutral-400">محل پروژه:</span>
                <span className="font-semibold text-white mr-1 block mt-0.5">
                  {selectedRequest.province}، {selectedRequest.city}
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  {selectedRequest.address}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">کارفرما / شرکت:</span>
                <span className="font-semibold text-white mr-1 block mt-0.5">
                  {selectedRequest.fullName}{" "}
                  {selectedRequest.companyName && `(${selectedRequest.companyName})`}
                </span>
                <span className="font-mono text-neutral-300 block mt-0.5" dir="ltr">
                  {selectedRequest.phoneNumber}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-800">
                <span className="text-neutral-400">زمان برآوردی اتمام:</span>
                <span className="font-semibold text-white mr-1 block mt-0.5">
                  {selectedRequest.estimatedDays || "۱ الی ۳ روز کاری"}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-800">
                <span className="text-neutral-400">مبلغ نهایی پیش‌فاکتور:</span>
                <span className="font-mono font-bold text-emerald-400 mr-1 block mt-0.5">
                  {selectedRequest.finalQuotationAmount
                    ? formatPrice(selectedRequest.finalQuotationAmount)
                    : "در انتظار اتمام بازدید حضوری"}
                </span>
              </div>
            </div>

            {/* Direct Tracker Link */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
                className="text-xs border-neutral-700"
              >
                بستن
              </Button>
              <Link
                href={`/installation?code=${selectedRequest.trackingCode}#installation-tracker`}
                target="_blank"
              >
                <Button
                  size="sm"
                  className="text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>ورود به صفحه رهگیری برخط عمومی</span>
                </Button>
              </Link>
            </div>
          </div>
        </DashboardModal>
      )}

      {/* ── Modal: Create New Request ────────────────────────────────── */}
      {isNewModalOpen && (
        <DashboardModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="ثبت آنلاین درخواست پروژه نصب، کابل‌کشی و زیرساخت شبکه"
          maxWidth="2xl"
        >
          {newSuccessCode ? (
            <div className="py-8 text-center space-y-4" dir="rtl">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-black text-white">
                درخواست پروژه شما با موفقیت ثبت گردید!
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                کد رهگیری اختصاصی برای پروژه شما صادر شد. کارشناس ارشد زیرساخت
                ظرف حداکثر ۲ ساعت کاری جهت هماهنگی بازدید با شما تماس خواهد گرفت.
              </p>
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 max-w-sm mx-auto flex items-center justify-between">
                <span className="text-xs text-neutral-400">کد رهگیری شما:</span>
                <span className="font-mono text-sm font-black text-orange-400" dir="ltr">
                  {newSuccessCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(newSuccessCode)}
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-300"
                >
                  {copiedCode === newSuccessCode ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-xs border-neutral-700"
                >
                  بستن و مشاهده در لیست
                </Button>
                <Link
                  href={`/installation?code=${newSuccessCode}#installation-tracker`}
                  target="_blank"
                >
                  <Button
                    size="sm"
                    className="text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold gap-1.5"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>مشاهده در رهگیر پروژه</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleNewRequestSubmit} className="space-y-4 text-right" dir="rtl">
              {newFormError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{newFormError}</span>
                </div>
              )}

              {/* Service Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  نوع خدمت اصلی مورد نیاز:
                </label>
                <select
                  value={newService}
                  onChange={(e) =>
                    setNewService(e.target.value as InstallationServiceCategory)
                  }
                  className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  {INSTALLATION_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Two columns: FullName & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">نام و نام خانوادگی مسئول هماهنگی *</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    required
                    placeholder="مثال: مهندس حسینی"
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">شماره تماس مستقیم *</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Company & Province */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400">نام شرکت / سازمان (اختیاری)</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="مثال: شرکت داده‌پردازان سپهر"
                    className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">استان</label>
                    <select
                      value={newProvince}
                      onChange={(e) => setNewProvince(e.target.value)}
                      className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                    >
                      {PROVINCES_LIST.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400">شهر</label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="تهران"
                      className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Technical numbers */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">تعداد نود شبکه</label>
                  <input
                    type="number"
                    value={newNodeCount}
                    onChange={(e) => setNewNodeCount(Number(e.target.value))}
                    min={0}
                    className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">مساحت (مترمربع)</label>
                  <input
                    type="number"
                    value={newApproxArea}
                    onChange={(e) => setNewApproxArea(Number(e.target.value))}
                    min={0}
                    className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400">تعداد رک</label>
                  <input
                    type="number"
                    value={newRackCount}
                    onChange={(e) => setNewRackCount(Number(e.target.value))}
                    min={0}
                    className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-2.5 text-xs text-white focus:border-orange-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-400">آدرس محل اجرای پروژه *</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  required
                  placeholder="خیابان، پلاک، طبقه و واحد کارگاه..."
                  className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Checkbox Fluke */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fluke-check"
                  checked={newNeedsFluke}
                  onChange={(e) => setNewNeedsFluke(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-orange-500 focus:ring-0"
                />
                <label
                  htmlFor="fluke-check"
                  className="text-xs text-neutral-300 cursor-pointer select-none"
                >
                  نیازمند تست فلوک ۱۰۰٪ با دستگاه Fluke DSX-8000 و تحویل ریپورت PDF رسمی
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-400">توضیحات و نیازمندی‌های خاص کارگاهی</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="ساعات مجاز ورود تیم فنی، نوع سقف یا کف کاذب و..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewModalOpen(false)}
                  disabled={isSubmittingNew}
                  className="text-xs border-neutral-700"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingNew}
                  size="sm"
                  className="text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold gap-1.5 shadow-lg shadow-orange-600/25 cursor-pointer"
                >
                  {isSubmittingNew ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>ثبت نهایی درخواست و صدور کد رهگیری</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DashboardModal>
      )}
    </div>
  );
}
