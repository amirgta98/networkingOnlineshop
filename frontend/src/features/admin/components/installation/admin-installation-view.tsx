"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
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
  ExternalLink,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  DollarSign,
  AlertTriangle,
  Layers,
} from "lucide-react";
import type {
  InstallationAdminItem,
  InstallationStatus,
  InstallationStats,
} from "@/features/installation/types";
import { installationApi } from "@/features/installation/api/installation-api";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  type FilterTabOption,
  AdminStatsCards,
  type AdminStatItem,
  AdminActionModal,
} from "../shared";
import { InstallationQuickEditModal } from "./installation-quick-edit-modal";
import { Button } from "@/shared/components/ui/button";
import { cn, toPersianDigits, formatPrice } from "@/shared/lib/utils";

const STATUS_BADGES: Record<InstallationStatus, { label: string; badgeClass: string }> = {
  PENDING_REVIEW: {
    label: "در انتظار بررسی",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  ASSIGNED: {
    label: "تخصیص کارشناس",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  SURVEY_SCHEDULED: {
    label: "بازدید حضوری",
    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  IN_PROGRESS: {
    label: "در حال اجرا",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  COMPLETED: {
    label: "تحویل‌شده",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  CANCELLED: {
    label: "لغوشده",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
};

const SERVICE_LABELS: Record<string, string> = {
  cabling: "کابل‌کشی ساختاریافته",
  datacenter: "آرایش رک و دیتاسنتر",
  cctv: "دوربین مداربسته (CCTV)",
  wireless: "شبکه وایرلس و AP",
  switching: "سوئیچینگ و امنیت",
  fiber: "فیوژن فیبر نوری",
  "ups-power": "برق اضطراری و UPS",
  other: "مشاوره و نظارت",
};

export function AdminInstallationView() {
  const router = useRouter();

  const [items, setItems] = React.useState<InstallationAdminItem[]>([]);
  const [stats, setStats] = React.useState<InstallationStats | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeStatus, setActiveStatus] = React.useState<string>("all");
  const [activeService, setActiveService] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalItems, setTotalItems] = React.useState<number>(0);

  // Quick edit modal
  const [quickEditItem, setQuickEditItem] = React.useState<InstallationAdminItem | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = React.useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = React.useState<InstallationAdminItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{
    text: string;
    variant: "success" | "warning" | "info";
  } | null>(null);

  const showToast = (text: string, variant: "success" | "warning" | "info" = "success") => {
    setToastMessage({ text, variant });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        installationApi.getAdminRequests({
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
          status: activeStatus !== "all" ? activeStatus : undefined,
          serviceType: activeService !== "all" ? activeService : undefined,
        }),
        installationApi.getAdminStats(),
      ]);

      setItems(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to load installation requests:", err);
      showToast("خطا در بارگذاری لیست درخواست‌ها از سرور", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, activeStatus, activeService]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Quick Edit Success
  const handleQuickEditSuccess = (updated: InstallationAdminItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    showToast(`وضعیت درخواست ${updated.trackingCode} با موفقیت بروزرسانی شد.`);
    loadData();
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await installationApi.deleteAdminRequest(deleteTarget.id);
      showToast(`درخواست ${deleteTarget.trackingCode} حذف گردید.`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      console.error("Delete failed:", err);
      showToast(err?.message || "خطا در حذف درخواست.", "warning");
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats cards
  const statsCards: AdminStatItem[] = [
    {
      id: "total",
      title: "کل درخواست‌های ثبت‌شده",
      value: stats ? toPersianDigits(stats.total) : "—",
      subtitle: "درخواست‌های پسیو و مهندسی",
      icon: Wrench,
      variant: "orange",
    },
    {
      id: "pending",
      title: "در انتظار بررسی و تخصیص",
      value: stats ? toPersianDigits(stats.pending) : "—",
      subtitle: "نیازمند تماس اولیه و زمان‌بندی",
      icon: Clock,
      variant: "amber",
      badge: "نیاز به اقدام",
    },
    {
      id: "in_progress",
      title: "پروژه‌های در حال اجرا",
      value: stats ? toPersianDigits(stats.inProgress) : "—",
      subtitle: "تیم‌های مستقر در سایت کارفرما",
      icon: Network,
      variant: "sky",
    },
    {
      id: "completed",
      title: "پروژه‌های تحویل‌شده",
      value: stats ? toPersianDigits(stats.completed) : "—",
      subtitle: "دارای تست فلوک و ضمانت ۱۸ ماهه",
      icon: CheckCircle2,
      variant: "emerald",
    },
  ];

  // Filter tabs
  const filterTabs: FilterTabOption[] = [
    { id: "all", label: "همه درخواست‌ها", count: stats?.total },
    { id: "PENDING_REVIEW", label: "در انتظار بررسی", count: stats?.pending },
    { id: "ASSIGNED", label: "تخصیص کارشناس" },
    { id: "IN_PROGRESS", label: "در حال اجرا", count: stats?.inProgress },
    { id: "COMPLETED", label: "تحویل‌شده", count: stats?.completed },
    { id: "CANCELLED", label: "لغوشده", count: stats?.cancelled },
  ];

  // Columns definition
  const columns: AdminColumnDef<InstallationAdminItem>[] = [
    {
      key: "trackingCode",
      header: "کد رهگیری",
      cell: (row) => (
        <div className="flex flex-col gap-1 text-right">
          <Link
            href={`/admin/installation/${row.id}`}
            className="font-mono text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
          >
            <span>{row.trackingCode}</span>
          </Link>
          <span className="text-[10px] text-neutral-400">
            {new Intl.DateTimeFormat("fa-IR", { dateStyle: "short" }).format(
              new Date(row.createdAt)
            )}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "کارفرما و سازمان",
      cell: (row) => (
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xs font-bold text-neutral-200">{row.fullName}</span>
          {row.companyName && (
            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-neutral-400" />
              <span>{row.companyName}</span>
            </span>
          )}
          <span className="text-[11px] text-neutral-400 font-mono" dir="ltr">
            {row.phoneNumber}
          </span>
        </div>
      ),
    },
    {
      key: "service",
      header: "خدمت و مقیاس پروژه",
      cell: (row) => (
        <div className="flex flex-col gap-1 text-right">
          <span className="text-xs font-semibold text-neutral-200">
            {SERVICE_LABELS[row.serviceType] || row.serviceTitle}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400">
            {row.nodeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                {toPersianDigits(row.nodeCount)} نود شبکه
              </span>
            )}
            {row.rackCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                {toPersianDigits(row.rackCount)} رک
              </span>
            )}
            {row.cctvCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                {toPersianDigits(row.cctvCount)} دوربین
              </span>
            )}
            {row.approximateArea > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                {toPersianDigits(row.approximateArea)} متر مربع
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "محل پروژه",
      cell: (row) => (
        <div className="flex flex-col gap-0.5 text-right text-xs text-neutral-300">
          <span className="font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3 text-neutral-400" />
            <span>
              {row.province} — {row.city}
            </span>
          </span>
          <span className="text-[10px] text-neutral-400 line-clamp-1 max-w-[200px]">
            {row.address}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      cell: (row) => {
        const badge = STATUS_BADGES[row.status] || {
          label: row.status,
          badgeClass: "bg-neutral-800 text-neutral-300 border-neutral-700",
        };
        return (
          <div className="flex flex-col gap-1 text-right">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border self-start",
                badge.badgeClass
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              <span>{badge.label}</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
              <div className="w-16 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${row.statusPercent}%` }}
                />
              </div>
              <span>{toPersianDigits(row.statusPercent)}٪</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "assignedTeam",
      header: "سرپرست تیم فنی",
      cell: (row) => (
        <div className="flex flex-col gap-0.5 text-right text-xs">
          <span className="font-semibold text-neutral-200">
            {row.assignedTeamLead || "تخصیص‌نیافته"}
          </span>
          <span className="text-[10px] text-neutral-400">
            {row.assignedTeamRole || "در انتظار تعیین سرپرست"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      className: "text-center w-28",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1">
          {/* Detailed view */}
          <Link
            href={`/admin/installation/${row.id}`}
            title="مشاهده جزئیات کامل و نقشه‌برداری"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {/* Quick edit */}
          <button
            type="button"
            title="ویرایش سریع وضعیت و تیم"
            onClick={() => {
              setQuickEditItem(row);
              setIsQuickEditOpen(true);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          {/* Delete */}
          <button
            type="button"
            title="حذف درخواست"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={cn(
            "fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all animate-in fade-in slide-in-from-bottom-5",
            toastMessage.variant === "success" &&
              "bg-emerald-950/95 border-emerald-500/40 text-emerald-200",
            toastMessage.variant === "warning" &&
              "bg-amber-950/95 border-amber-500/40 text-amber-200",
            toastMessage.variant === "info" && "bg-sky-950/95 border-sky-500/40 text-sky-200"
          )}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <AdminStatsCards items={statsCards} columns={4} />

      {/* Filter Toolbar */}
      <AdminFilterToolbar
        searchPlaceholder="جستجو با کد رهگیری، نام کارفرما، نام شرکت، تلفن یا شهر..."
        searchQuery={searchQuery}
        onSearchChange={(v: string) => {
          setSearchQuery(v);
          setCurrentPage(1);
        }}
        statusTabs={filterTabs}
        activeStatusTab={activeStatus}
        onStatusTabChange={(tabId: string) => {
          setActiveStatus(tabId);
          setCurrentPage(1);
        }}
        secondaryFilters={
          <div className="flex items-center gap-2">
            <select
              value={activeService}
              onChange={(e) => {
                setActiveService(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-xs text-neutral-300 focus:border-orange-500 focus:outline-none"
            >
              <option value="all">همه خدمات مهندسی</option>
              <option value="cabling">کابل‌کشی ساختاریافته</option>
              <option value="datacenter">آرایش رک و دیتاسنتر</option>
              <option value="cctv">دوربین مداربسته (CCTV)</option>
              <option value="wireless">شبکه وایرلس و AP</option>
              <option value="switching">سوئیچینگ و امنیت</option>
              <option value="fiber">فیوژن فیبر نوری</option>
              <option value="ups-power">برق اضطراری و UPS</option>
              <option value="other">سایر خدمات</option>
            </select>
          </div>
        }
        customActionSlot={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              className="h-9 gap-1.5 text-xs text-neutral-300 border-neutral-700 hover:bg-neutral-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>تازه‌سازی</span>
            </Button>
            <Link href="/installation" target="_blank">
              <Button
                size="sm"
                className="h-9 gap-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-black font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ثبت درخواست جدید</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Data Table */}
      <AdminDataTable
        data={items}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="هیچ درخواست نصبی یافت نشد"
        emptySubtitle="فیلترهای انتخابی را تغییر دهید یا عبارت جستجوی دیگری را وارد کنید"
        currentPage={currentPage}
        pageSize={10}
        totalItems={totalItems}
        onPageChange={(p) => setCurrentPage(p)}
      />

      {/* Quick Edit Modal */}
      <InstallationQuickEditModal
        item={quickEditItem}
        isOpen={isQuickEditOpen}
        onClose={() => {
          setIsQuickEditOpen(false);
          setQuickEditItem(null);
        }}
        onSuccess={handleQuickEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      <AdminActionModal
        isOpen={!!deleteTarget}
        title="تأیید حذف درخواست نصب"
        description={`آیا از حذف دائم درخواست «${deleteTarget?.trackingCode}» متعلق به کارفرما «${deleteTarget?.fullName}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
        confirmLabel="بله، حذف کن"
        cancelLabel="انصراف"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
