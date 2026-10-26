"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Search,
  ExternalLink,
  Sparkles,
  FileText,
  TrendingUp,
  Tag,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { articlesApi } from "@/features/articles/api/articles-api";
import type { ArticleItem, ContentStatus, ArticleCategoryInfo } from "@/features/articles/types";
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
import { cn, toPersianDigits, resolveProductImageUrl } from "@/shared/lib/utils";

const STATUS_LABELS: Record<ContentStatus, { label: string; badgeClass: string }> = {
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

export function AdminArticlesView() {
  const router = useRouter();

  const [articles, setArticles] = React.useState<ArticleItem[]>([]);
  const [categories, setCategories] = React.useState<ArticleCategoryInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeStatus, setActiveStatus] = React.useState<string>("all");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalItems, setTotalItems] = React.useState<number>(0);

  // Modal State for Delete
  const [deleteTarget, setDeleteTarget] = React.useState<ArticleItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{ text: string; variant: "success" | "warning" | "info" } | null>(null);
  const showToast = (text: string, variant: "success" | "warning" | "info" = "success") => {
    setToastMessage({ text, variant });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadArticles = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await articlesApi.getArticles({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        status: activeStatus !== "all" ? (activeStatus as ContentStatus) : undefined,
        category: activeCategory !== "all" ? activeCategory : undefined,
      });
      setArticles(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (err) {
      console.error("Failed to load articles:", err);
      showToast("خطا در بارگذاری لیست مقالات از سرور", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, activeStatus, activeCategory]);

  React.useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  React.useEffect(() => {
    articlesApi
      .getCategories()
      .then((cats: any) => {
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const handleToggleStatus = async (article: ArticleItem) => {
    const nextStatus: ContentStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await articlesApi.updateStatus(article.id, nextStatus);
      setArticles((prev) =>
        prev.map((item) => (item.id === article.id ? { ...item, status: nextStatus } : item))
      );
      showToast(
        nextStatus === "PUBLISHED" ? "مقاله با موفقیت منتشر شد" : "مقاله به حالت پیش‌نویس تغییر یافت",
        "success"
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showToast("خطا در تغییر وضعیت مقاله", "warning");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await articlesApi.deleteArticle(deleteTarget.id);
      setArticles((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      showToast("مقاله با موفقیت حذف گردید", "success");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete article:", err);
      showToast("خطا در حذف مقاله از دیتابیس", "warning");
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const publishedCount = articles.filter((a) => a.status === "PUBLISHED").length;
  const draftCount = articles.filter((a) => a.status === "DRAFT").length;
  const totalViews = articles.reduce((sum, a) => sum + (typeof a.views === "number" ? a.views : parseInt(a.views as string, 10) || 0), 0);

  const statsItems: AdminStatItem[] = [
    {
      id: "total",
      title: "کل مقالات تخصصی",
      value: toPersianDigits(totalItems),
      changeText: "بانک دانش فنی آکادمی",
      changePositive: true,
      icon: BookOpen,
      variant: "purple",
    },
    {
      id: "published",
      title: "مقالات منتشر شده",
      value: toPersianDigits(publishedCount),
      changeText: "قابل مشاهده عموم کاربران",
      changePositive: true,
      icon: CheckCircle2,
      variant: "emerald",
    },
    {
      id: "drafts",
      title: "پیش‌نویس‌ها در صف انتشار",
      value: toPersianDigits(draftCount),
      changeText: "در حال بازبینی و ویرایش",
      changePositive: false,
      icon: Clock,
      variant: "orange",
    },
    {
      id: "views",
      title: "مجموع بازدیدها",
      value: toPersianDigits(totalViews),
      changeText: "مطالعه و مراجعات فنی",
      changePositive: true,
      icon: TrendingUp,
      variant: "sky",
    },
  ];

  const filterTabs: FilterTabOption[] = [
    { id: "all", label: "همه مقالات", count: totalItems },
    { id: "PUBLISHED", label: "منتشرشده", count: publishedCount },
    { id: "DRAFT", label: "پیش‌نویس", count: draftCount },
    { id: "ARCHIVED", label: "آرشیوشده" },
  ];

  const columns: AdminColumnDef<ArticleItem>[] = [
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
                <BookOpen className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "title",
      header: "عنوان و مشخصات مقاله",
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
            <span className="text-neutral-500 font-mono text-[11px]" dir="ltr">
              /{item.slug}
            </span>
            <span>•</span>
            <span className="text-amber-400/80">{item.categoryName || item.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: "author",
      header: "نویسنده",
      cell: (item) => (
        <div className="flex items-center gap-2">
          {item.authorAvatar || item.author?.avatarUrl ? (
            <img
              src={item.authorAvatar || item.author?.avatarUrl}
              alt={item.authorName}
              className="w-7 h-7 rounded-full object-cover border border-neutral-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-300">
              {item.authorName ? item.authorName.charAt(0) : "ق"}
            </div>
          )}
          <div className="text-xs">
            <div className="text-neutral-200 font-medium">{item.authorName}</div>
            <div className="text-[10px] text-neutral-500">{item.authorRole || "کارشناس شبکه"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "وضعیت انتشار",
      cell: (item) => {
        const conf = STATUS_LABELS[item.status || "DRAFT"] || STATUS_LABELS.DRAFT;
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
      key: "stats",
      header: "آمار مطالعه",
      cell: (item) => (
        <div className="text-xs space-y-0.5 text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-neutral-500" />
            <span>{toPersianDigits(item.views || 0)} بازدید</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{toPersianDigits(item.readTime || "۵ دقیقه")}</span>
          </div>
        </div>
      ),
    },
    {
      key: "publishedAt",
      header: "تاریخ انتشار",
      cell: (item) => (
        <div className="text-xs text-neutral-400 font-medium">
          {toPersianDigits(item.publishedAt || "امروز")}
        </div>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      cell: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <a
            href={`/articles/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="مشاهده در سایت"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <Link
            href={`/admin/articles/${item.id}/edit`}
            title="ویرایش مقاله"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setDeleteTarget(item)}
            title="حذف مقاله"
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
      {/* Toast Notification */}
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
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                مدیریت مقالات و وبلاگ تخصصی ققنوس
              </h1>
              <p className="text-xs text-neutral-400">
                نگارش، دسته‌بندی، سئو و انتشار مقالات مهندسی شبکه، دیتاسنتر و راهنمای انتخاب تجهیزات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <Button
            onClick={() => loadArticles()}
            variant="outline"
            size="sm"
            className="border-neutral-800 text-neutral-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 ml-1.5" />
            بروزرسانی
          </Button>

          <Link href="/admin/articles/create" className="flex-1 sm:flex-initial">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold shadow-lg shadow-amber-500/10">
              <Plus className="w-4 h-4 ml-1.5" />
              نگارش مقاله جدید
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
              placeholder="جستجو در عنوان یا متن مقاله..."
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
      <AdminDataTable<ArticleItem>
        data={articles}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="هیچ مقاله‌ای با این مشخصات یافت نشد."
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
          title="حذف مقاله از سامانه"
          description={`آیا از حذف کامل مقاله «${deleteTarget.title}» اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`}
          confirmLabel="بله، مقاله را حذف کن"
          cancelLabel="انصراف"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
