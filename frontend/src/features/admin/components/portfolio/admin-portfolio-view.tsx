"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  Sparkles,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Layers,
} from "lucide-react";
import { portfolioApi } from "@/features/portfolio/api/portfolio-api";
import type {
  ProjectItem,
  ContentStatus,
  PortfolioCategory,
} from "@/features/portfolio/types";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  type FilterTabOption,
  AdminStatsCards,
  type AdminStatItem,
  AdminActionModal,
} from "../shared";
import { Button } from "@/shared/components/ui/button";
import { cn, toPersianDigits } from "@/shared/lib/utils";

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  PUBLISHED: {
    label: "منتشرشده",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  DRAFT: {
    label: "پیش‌نویس",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  ARCHIVED: {
    label: "آرشیوشده",
    badgeClass: "bg-neutral-800 text-neutral-400 border-neutral-700",
  },
};

export function AdminPortfolioView() {
  const router = useRouter();

  const [projects, setProjects] = React.useState<ProjectItem[]>([]);
  const [categories, setCategories] = React.useState<PortfolioCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeStatus, setActiveStatus] = React.useState<string>("all");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalItems, setTotalItems] = React.useState<number>(0);

  // Modal State for Delete
  const [deleteTarget, setDeleteTarget] = React.useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{
    text: string;
    variant: "success" | "warning" | "info";
  } | null>(null);
  const showToast = (text: string, variant: "success" | "warning" | "info" = "success") => {
    setToastMessage({ text, variant });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadProjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await portfolioApi.getPortfolios({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: activeStatus !== "all" ? activeStatus : undefined,
        category: activeCategory !== "all" ? activeCategory : undefined,
      });
      setProjects(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (err) {
      console.error("Failed to load portfolio projects:", err);
      showToast("خطا در بارگذاری پروژه‌ها از سرور", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, activeStatus, activeCategory]);

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  React.useEffect(() => {
    portfolioApi
      .getCategories()
      .then((cats: any) => {
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const handleToggleStatus = async (project: ProjectItem) => {
    const nextStatus: ContentStatus = project.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await portfolioApi.updateStatus(project.id, nextStatus);
      setProjects((prev) =>
        prev.map((item) => (item.id === project.id ? { ...item, status: nextStatus } : item))
      );
      showToast(
        nextStatus === "PUBLISHED" ? "پروژه با موفقیت منتشر شد" : "پروژه به وضعیت پیش‌نویس تغییر یافت",
        "success"
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showToast("خطا در تغییر وضعیت پروژه", "warning");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await portfolioApi.deletePortfolio(deleteTarget.id);
      setProjects((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      showToast("پروژه با موفقیت حذف گردید", "success");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
      showToast("خطا در حذف پروژه از دیتابیس", "warning");
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const publishedCount = projects.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = projects.filter((p) => p.status === "DRAFT").length;
  const featuredCount = projects.filter((p) => p.isFeatured).length;

  const statsItems: AdminStatItem[] = [
    {
      id: "total",
      title: "کل پروژه‌های ثبت‌شده",
      value: toPersianDigits(totalItems),
      changeText: "سوابق مهندسی ققنوس",
      changePositive: true,
      icon: Briefcase,
      variant: "purple",
    },
    {
      id: "published",
      title: "پروژه‌های منتشر شده",
      value: toPersianDigits(publishedCount),
      changeText: "در بخش نمونه‌کارهای سایت",
      changePositive: true,
      icon: CheckCircle2,
      variant: "emerald",
    },
    {
      id: "drafts",
      title: "پیش‌نویس‌ها",
      value: toPersianDigits(draftCount),
      changeText: "در حال تکمیل مستندات",
      changePositive: false,
      icon: Clock,
      variant: "orange",
    },
    {
      id: "featured",
      title: "پروژه‌های شاخص و برگزیده",
      value: toPersianDigits(featuredCount),
      changeText: "نمایش در صفحه نخست",
      changePositive: true,
      icon: Sparkles,
      variant: "sky",
    },
  ];

  const filterTabs: FilterTabOption[] = [
    { id: "all", label: "همه پروژه‌ها", count: totalItems },
    { id: "PUBLISHED", label: "منتشرشده", count: publishedCount },
    { id: "DRAFT", label: "پیش‌نویس", count: draftCount },
    { id: "ARCHIVED", label: "آرشیوشده" },
  ];

  const columns: AdminColumnDef<ProjectItem>[] = [
    {
      key: "image",
      header: "تصویر شاخص",
      cell: (item) => {
        const imgUrl = item.featuredImage || item.imageUrl;
        return (
          <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 flex-shrink-0">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-600">
                <Briefcase className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "title",
      header: "عنوان و کارفرمای پروژه",
      cell: (item) => (
        <div className="space-y-1 max-w-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white hover:text-amber-400 transition-colors line-clamp-1">
              {item.title}
            </span>
            {item.isFeatured && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                ویژه
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="flex items-center gap-1 text-neutral-300">
              <Building2 className="w-3 h-3 text-neutral-500" />
              {item.client}
            </span>
            <span>•</span>
            <span className="text-neutral-500 font-mono text-[11px]" dir="ltr">
              /{item.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "موقعیت و سال",
      cell: (item) => (
        <div className="text-xs space-y-0.5 text-neutral-400">
          <div className="flex items-center gap-1 text-neutral-300">
            <MapPin className="w-3 h-3 text-amber-500" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-500">
            <Calendar className="w-3 h-3" />
            <span>سال {toPersianDigits(item.year || "۱۴۰۲")}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "دسته‌بندی",
      cell: (item) => (
        <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-amber-400/90 font-medium">
          {item.categoryName || item.category || "دیتاسنتر"}
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت انتشار",
      cell: (item) => {
        const conf = STATUS_LABELS[item.status as string] || STATUS_LABELS.DRAFT;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(item);
            }}
            title="کلیک برای تغییر سریع وضعیت"
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium border transition-transform active:scale-95 inline-flex items-center gap-1.5",
              conf.badgeClass
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {conf.label}
          </button>
        );
      },
    },
    {
      key: "submodules",
      header: "ماژول‌های فنی",
      cell: (item) => {
        const featCount = item.features?.length || item.metrics?.length || 0;
        const challCount = item.challenges?.length || 0;
        const techCount = item.technologies?.length || item.hardwareUsed?.length || 0;
        const achCount = item.achievements?.length || 0;

        return (
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span
              title="شاخص‌های فنی"
              className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800"
            >
              {toPersianDigits(featCount)} شاخص
            </span>
            <span
              title="چالش‌ها و راهکارها"
              className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-amber-400"
            >
              {toPersianDigits(challCount)} چالش
            </span>
            <span
              title="تجهیزات و فناوری‌ها"
              className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-sky-400"
            >
              {toPersianDigits(techCount)} تجهیز
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "عملیات",
      cell: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <a
            href={`/portfolio/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="مشاهده در سایت"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <Link
            href={`/admin/portfolio/${item.id}/edit`}
            title="ویرایش پروژه"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setDeleteTarget(item)}
            title="حذف پروژه"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div
          className={cn(
            "fixed bottom-6 left-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300",
            toastMessage.variant === "success" && "bg-neutral-900 border-emerald-500/50 text-emerald-300",
            toastMessage.variant === "warning" && "bg-neutral-900 border-amber-500/50 text-amber-300",
            toastMessage.variant === "info" && "bg-neutral-900 border-sky-500/50 text-sky-300"
          )}
        >
          {toastMessage.variant === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.variant === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                مدیریت پروژه‌ها و نمونه‌کارهای مهندسی ققنوس
              </h1>
              <p className="text-xs text-neutral-400">
                ثبت و نمایش پروژه‌های دیتاسنتر، سوییچینگ سازمانی، کابل‌کشی ساخت‌یافته و دستاوردهای فنی
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <Button
            onClick={() => loadProjects()}
            variant="outline"
            size="sm"
            className="border-neutral-800 text-neutral-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 ml-1.5" />
            بروزرسانی
          </Button>

          <Link href="/admin/portfolio/create" className="flex-1 sm:flex-initial">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold shadow-lg shadow-amber-500/10">
              <Plus className="w-4 h-4 ml-1.5" />
              ثبت پروژه جدید
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards items={statsItems} />

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-950/30 border border-neutral-800/80 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="جستجو در نام پروژه، کارفرما یا موقعیت..."
              className="w-full pr-9 pl-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-neutral-400 whitespace-nowrap">دسته‌بندی:</span>
            <select
              value={activeCategory}
              onChange={(e) => {
                setActiveCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">همه دسته‌ها</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug || c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800/60">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveStatus(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2",
                activeStatus === tab.id
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-900"
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    activeStatus === tab.id
                      ? "bg-neutral-950/30 text-neutral-950"
                      : "bg-neutral-800 text-neutral-400"
                  )}
                >
                  {toPersianDigits(tab.count)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <AdminDataTable<ProjectItem>
        data={projects}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="هیچ پروژه‌ای با این مشخصات یافت نشد."
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <AdminActionModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="حذف پروژه مهندسی"
          description={`آیا از حذف کامل پروژه «${deleteTarget.title}» اطمینان دارید؟ تمام ویژگی‌ها، چالش‌ها و مشخصات فنی آن حذف خواهند شد.`}
          confirmLabel="بله، پروژه را حذف کن"
          cancelLabel="انصراف"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
