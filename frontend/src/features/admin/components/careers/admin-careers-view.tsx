"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
  AlertTriangle,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn, toPersianDigits } from "@/shared/lib/utils";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  type FilterTabOption,
  AdminStatsCards,
  type AdminStatItem,
} from "../shared";
import { careersApi } from "@/features/careers/api/careers-api";
import type {
  JobPosition,
  JobApplication,
  JobApplicationStatus,
  JobApplicationStats,
} from "@/features/careers/types";
import { JobPositionModal } from "./job-position-modal";
import { JobApplicationDetailModal } from "./job-application-detail-modal";

const APPLICATION_STATUS_TABS: FilterTabOption[] = [
  { id: "ALL", label: "همه درخواست‌ها" },
  { id: "PENDING", label: "در انتظار بررسی", badgeVariant: "orange" },
  { id: "REVIEWED", label: "بررسی اولیه و تماس", badgeVariant: "sky" },
  { id: "ACCEPTED", label: "دعوت به مصاحبه", badgeVariant: "emerald" },
  { id: "REJECTED", label: "عدم پذیرش", badgeVariant: "rose" },
];

const STATUS_BADGES: Record<JobApplicationStatus, { label: string; badgeClass: string }> = {
  PENDING: {
    label: "در انتظار بررسی",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  REVIEWED: {
    label: "بررسی اولیه و تماس",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  ACCEPTED: {
    label: "دعوت به مصاحبه",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  REJECTED: {
    label: "عدم پذیرش",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
};

function formatJobType(type: string): string {
  switch (type) {
    case "FULL_TIME":
      return "تمام وقت";
    case "PART_TIME":
      return "پاره وقت";
    case "CONTRACT":
      return "پروژه‌ای / قراردادی";
    case "HYBRID":
      return "هیبریدی";
    case "REMOTE":
      return "دورکاری";
    default:
      return type || "تمام وقت";
  }
}

export function AdminCareersView() {
  const [activeMainTab, setActiveMainTab] = React.useState<"applications" | "positions">("applications");

  // Data states
  const [positions, setPositions] = React.useState<JobPosition[]>([]);
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [stats, setStats] = React.useState<JobApplicationStats>({
    totalPositions: 0,
    activePositions: 0,
    totalApplications: 0,
    pendingApplications: 0,
    reviewedApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });

  // Loading states
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filters for Applications
  const [appSearch, setAppSearch] = React.useState("");
  const [appStatusTab, setAppStatusTab] = React.useState("ALL");
  const [appPositionFilter, setAppPositionFilter] = React.useState<string>("ALL");
  const [appPage, setAppPage] = React.useState(1);
  const [appTotal, setAppTotal] = React.useState(0);

  // Filters for Positions
  const [posSearch, setPosSearch] = React.useState("");

  // Modals state
  const [selectedApplication, setSelectedApplication] = React.useState<JobApplication | null>(null);
  const [isAppModalOpen, setIsAppModalOpen] = React.useState(false);

  const [positionModalData, setPositionModalData] = React.useState<JobPosition | null>(null);
  const [isPositionModalOpen, setIsPositionModalOpen] = React.useState(false);

  const [deletePositionId, setDeletePositionId] = React.useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = React.useState<string | null>(null);
  const [isDeletingPosition, setIsDeletingPosition] = React.useState(false);

  // Load stats & positions & applications
  const loadData = React.useCallback(async () => {
    try {
      const [statsRes, posRes, appsRes] = await Promise.all([
        careersApi.getAdminStats().catch(() => null),
        careersApi.getAdminPositions({ search: posSearch || undefined }).catch(() => null),
        careersApi.getAdminApplications({
          page: appPage,
          limit: 20,
          search: appSearch || undefined,
          status: appStatusTab !== "ALL" ? appStatusTab : undefined,
          positionId: appPositionFilter !== "ALL" ? appPositionFilter : undefined,
        }).catch(() => null),
      ]);

      if (statsRes) setStats(statsRes);
      if (posRes?.items) setPositions(posRes.items);
      if (appsRes) {
        setApplications(appsRes.items || []);
        setAppTotal(appsRes.total || 0);
      }
    } catch (err) {
      console.error("Failed to load admin careers data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [appPage, appSearch, appStatusTab, appPositionFilter, posSearch]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  // ─── Actions for Positions ──────────────────────────────────────────

  const handleCreatePosition = () => {
    setPositionModalData(null);
    setIsPositionModalOpen(true);
  };

  const handleEditPosition = (pos: JobPosition) => {
    setPositionModalData(pos);
    setIsPositionModalOpen(true);
  };

  const handleSavePosition = async (data: Partial<JobPosition>) => {
    if (positionModalData) {
      await careersApi.updatePosition(positionModalData.id, data);
    } else {
      await careersApi.createPosition(data);
    }
    await loadData();
  };

  const handleTogglePosition = async (id: string, currentActive: boolean) => {
    try {
      // Optimistic update
      setPositions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !currentActive } : p)),
      );
      await careersApi.togglePositionActive(id, !currentActive);
      await loadData();
    } catch (err) {
      console.error("Toggle active error:", err);
      await loadData();
    }
  };

  const handleDeletePosition = async (id: string, force = false) => {
    setIsDeletingPosition(true);
    setDeleteErrorMessage(null);
    try {
      await careersApi.deletePosition(id, force);
      setDeletePositionId(null);
      await loadData();
    } catch (err: any) {
      console.error("Delete position error:", err);
      setDeleteErrorMessage(err?.message || "امکان حذف این موقعیت شغلی وجود ندارد.");
    } finally {
      setIsDeletingPosition(false);
    }
  };

  // ─── Actions for Applications ───────────────────────────────────────

  const handleViewApplication = (app: JobApplication) => {
    setSelectedApplication(app);
    setIsAppModalOpen(true);
  };

  const handleUpdateAppStatus = async (
    id: string,
    status: JobApplicationStatus,
    adminNotes?: string,
  ) => {
    await careersApi.updateApplicationStatus(id, status, adminNotes);
    if (selectedApplication && selectedApplication.id === id) {
      setSelectedApplication((prev) =>
        prev ? { ...prev, status, adminNotes: adminNotes ?? prev.adminNotes } : null,
      );
    }
    await loadData();
  };

  const handleDeleteApplication = async (id: string) => {
    await careersApi.deleteApplication(id);
    setIsAppModalOpen(false);
    setSelectedApplication(null);
    await loadData();
  };

  // ─── Stats Cards Definition ─────────────────────────────────────────

  const statsItems: AdminStatItem[] = [
    {
      id: "total_apps",
      title: "کل درخواست‌های استخدامی",
      value: toPersianDigits(stats.totalApplications),
      subtitle: "رزومه‌های ارسال‌شده توسط متقاضیان",
      icon: FileText,
      variant: "orange",
    },
    {
      id: "pending_apps",
      title: "در انتظار بررسی",
      value: toPersianDigits(stats.pendingApplications),
      subtitle: "نیازمند غربالگری اولیه کارشناس",
      icon: Clock,
      variant: "amber",
      badge: stats.pendingApplications > 0 ? "نیازمند اقدام" : undefined,
    },
    {
      id: "accepted_apps",
      title: "دعوت به مصاحبه / تایید",
      value: toPersianDigits(stats.acceptedApplications),
      subtitle: "متقاضیان منتخب مراحل فنی",
      icon: CheckCircle2,
      variant: "emerald",
    },
    {
      id: "active_positions",
      title: "موقعیت‌های فعال",
      value: `${toPersianDigits(stats.activePositions)} از ${toPersianDigits(stats.totalPositions)}`,
      subtitle: "منتشر شده در صفحه فرصت‌های شغلی",
      icon: Briefcase,
      variant: "sky",
    },
  ];

  // ─── Columns for Applications Table ──────────────────────────────────

  const applicationColumns: AdminColumnDef<JobApplication>[] = [
    {
      key: "fullName",
      header: "متقاضی و تماس",
      cell: (row) => (
        <div className="space-y-1">
          <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
            <span>{row.fullName}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span dir="ltr" className="font-mono text-neutral-300">
              {row.phoneNumber}
            </span>
            <span>•</span>
            <span className="truncate max-w-[150px] font-mono text-neutral-400">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "positionTitle",
      header: "موقعیت درخواستی",
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-xs text-orange-400 block">
            {row.positionTitle || "رزومه عمومی / آزاد"}
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            کد: {row.trackingCode}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "تاریخ ارسال",
      cell: (row) => (
        <span className="text-xs text-neutral-300">
          {new Intl.DateTimeFormat("fa-IR", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(row.createdAt))}
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت بررسی",
      cell: (row) => {
        const badge = STATUS_BADGES[row.status] || STATUS_BADGES.PENDING;
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
              badge.badgeClass,
            )}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      key: "resume",
      header: "رزومه",
      cell: (row) => (
        <a
          href={row.resumeFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 px-2.5 py-1 text-xs text-neutral-200 hover:text-white hover:bg-neutral-700 transition-colors"
          title="دانلود فایل رزومه"
        >
          <Download className="h-3.5 w-3.5 text-orange-400" />
          <span className="hidden sm:inline">دانلود فایل</span>
        </a>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      cell: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewApplication(row)}
            className="text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 h-8 px-2.5"
            title="مشاهده مشخصات کامل و تغییر وضعیت"
          >
            <Eye className="h-3.5 w-3.5 ml-1 text-orange-400" />
            <span>بررسی</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteApplication(row.id)}
            className="text-xs text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 h-8 px-2"
            title="حذف درخواست"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  // ─── Columns for Positions Table ─────────────────────────────────────

  const positionColumns: AdminColumnDef<JobPosition>[] = [
    {
      key: "title",
      header: "عنوان شغلی و دپارتمان",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xs sm:text-sm">{row.title}</span>
            {row.badge && (
              <span className="rounded-full border border-orange-500/30 bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-300">
                {row.badge}
              </span>
            )}
          </div>
          <span className="text-[11px] text-neutral-400 block">{row.department}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "نوع همکاری",
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="text-xs text-neutral-200 block font-medium">
            {formatJobType(row.type)}
          </span>
          <span className="text-[11px] text-neutral-400">{row.location || "تهران"}</span>
        </div>
      ),
    },
    {
      key: "applicationsCount",
      header: "رزومه‌های دریافتی",
      cell: (row) => {
        const count = row._count?.applications || 0;
        return (
          <button
            type="button"
            onClick={() => {
              setAppPositionFilter(row.id);
              setActiveMainTab("applications");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-xs text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition-colors cursor-pointer"
            title="فیلتر و مشاهده درخواست‌های این موقعیت"
          >
            <Users className="h-3.5 w-3.5 text-orange-400" />
            <span className="font-bold font-mono">{toPersianDigits(count)}</span>
            <span className="text-[11px] text-neutral-400">درخواست</span>
          </button>
        );
      },
    },
    {
      key: "isActive",
      header: "وضعیت انتشار در سایت",
      cell: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!row.isActive}
              onChange={() => handleTogglePosition(row.id, !!row.isActive)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
          <span
            className={cn(
              "text-[11px] font-medium",
              row.isActive ? "text-emerald-400" : "text-neutral-500",
            )}
          >
            {row.isActive ? "فعال در سایت" : "غیرفعال"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      cell: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditPosition(row)}
            className="text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 h-8 px-2"
            title="ویرایش موقعیت شغلی"
          >
            <Edit className="h-3.5 w-3.5 ml-1 text-orange-400" />
            <span>ویرایش</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDeletePositionId(row.id);
              setDeleteErrorMessage(null);
            }}
            className="text-xs text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 h-8 px-2"
            title="حذف موقعیت"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
              <Briefcase className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              فرصت‌های شغلی و رزومه‌های متقاضیان
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            مدیریت کامل موقعیت‌های شغلی (ایجاد، ویرایش، حذف، فعال/غیرفعال‌سازی) و بررسی رزومه‌های آنلاین ارسال‌شده در سایت.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs gap-1.5"
          >
            <RotateCcw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            <span>بروزرسانی داده‌ها</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleCreatePosition}
            className="bg-orange-600 hover:bg-orange-500 text-white text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>ایجاد موقعیت شغلی جدید</span>
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────── */}
      <AdminStatsCards items={statsItems} columns={4} />

      {/* ── Main Tab Switcher ───────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-neutral-800">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveMainTab("applications")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer",
              activeMainTab === "applications"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200",
            )}
          >
            <FileText className="h-4 w-4" />
            <span>درخواست‌های استخدامی و رزومه‌ها</span>
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-300">
              {toPersianDigits(stats.totalApplications)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("positions")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer",
              activeMainTab === "positions"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200",
            )}
          >
            <Briefcase className="h-4 w-4" />
            <span>مدیریت موقعیت‌های شغلی</span>
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-300">
              {toPersianDigits(stats.totalPositions)}
            </span>
          </button>
        </div>

        <Link
          href="/careers"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:underline px-3 py-1"
        >
          <span>مشاهده صفحه استخدام در سایت</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── Content View ────────────────────────────────────────────── */}
      {activeMainTab === "applications" ? (
        /* ════ Tab 1: Applications ════ */
        <div className="space-y-4">
          <AdminFilterToolbar
            searchQuery={appSearch}
            onSearchChange={(q) => {
              setAppSearch(q);
              setAppPage(1);
            }}
            searchPlaceholder="جستجو بر اساس نام متقاضی، شماره همراه، ایمیل یا کد رهگیری..."
            statusTabs={APPLICATION_STATUS_TABS}
            activeStatusTab={appStatusTab}
            onStatusTabChange={(tabId) => {
              setAppStatusTab(tabId);
              setAppPage(1);
            }}
            secondaryFilters={
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 shrink-0">فیلتر موقعیت:</span>
                <select
                  value={appPositionFilter}
                  onChange={(e) => {
                    setAppPositionFilter(e.target.value);
                    setAppPage(1);
                  }}
                  className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">همه موقعیت‌ها</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.title}
                    </option>
                  ))}
                </select>
              </div>
            }
          />

          <AdminDataTable
            data={applications}
            columns={applicationColumns}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="هیچ درخواست استخدامی یافت نشد"
            emptySubtitle="هنوز درخواستی با این مشخصات ثبت نشده است یا فیلترها را تغییر دهید."
            onRowClick={(row) => handleViewApplication(row)}
            pageSize={20}
            currentPage={appPage}
            totalItems={appTotal}
            onPageChange={setAppPage}
          />
        </div>
      ) : (
        /* ════ Tab 2: Positions ════ */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="جستجو در عنوان یا دپارتمان موقعیت‌ها..."
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 pl-9 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500 pointer-events-none" />
            </div>

            <Button
              type="button"
              onClick={handleCreatePosition}
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white text-xs gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>افزودن موقعیت شغلی جدید</span>
            </Button>
          </div>

          <AdminDataTable
            data={positions}
            columns={positionColumns}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="هیچ موقعیت شغلی ثبت نشده است"
            emptySubtitle="با کلیک بر روی دکمه افزودن، اولین موقعیت شغلی سازمان را ایجاد فرمایید."
            onRowClick={(row) => handleEditPosition(row)}
          />
        </div>
      )}

      {/* ── Position Create / Edit Modal ────────────────────────────── */}
      <JobPositionModal
        isOpen={isPositionModalOpen}
        onClose={() => setIsPositionModalOpen(false)}
        initialData={positionModalData}
        onSave={handleSavePosition}
      />

      {/* ── Application Detail & Status Modal ───────────────────────── */}
      <JobApplicationDetailModal
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        onUpdateStatus={handleUpdateAppStatus}
        onDelete={handleDeleteApplication}
      />

      {/* ── Delete Position Confirmation Dialog ─────────────────────── */}
      {deletePositionId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          dir="rtl"
        >
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#121215] p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">حذف موقعیت شغلی</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              آیا از حذف این موقعیت شغلی اطمینان دارید؟ در صورت وجود رزومه‌های ثبت‌شده، می‌توانید ابتدا وضعیت آن را به «غیرفعال» تغییر دهید تا در سایت مخفی شود.
            </p>

            {deleteErrorMessage && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 space-y-2">
                <div>{deleteErrorMessage}</div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePosition(deletePositionId, true)}
                  disabled={isDeletingPosition}
                  className="w-full text-xs h-8"
                >
                  {isDeletingPosition ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "تایید حذف اجباری (همراه با رزومه‌های متصل)"
                  )}
                </Button>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeletePositionId(null);
                  setDeleteErrorMessage(null);
                }}
                disabled={isDeletingPosition}
              >
                انصراف
              </Button>
              {!deleteErrorMessage && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePosition(deletePositionId, false)}
                  disabled={isDeletingPosition}
                >
                  {isDeletingPosition ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin ml-1.5" />
                  ) : (
                    "حذف موقعیت"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
