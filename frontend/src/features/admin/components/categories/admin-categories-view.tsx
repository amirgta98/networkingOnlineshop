"use client";

import * as React from "react";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Search,
  Layers,
  Server,
  Wifi,
  Cpu,
  Boxes,
  ShieldCheck,
  Package,
  Network,
  HardDrive,
  Radio,
  Headphones,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import type { AdminCategory, CategoryFormData } from "../../types/admin-categories.types";
import { categoriesApi } from "../../api/categories-api";
import { CategoryFormModal } from "./category-form-modal";
import { CategoryDeleteModal } from "./category-delete-modal";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Layers,
  Server,
  Wifi,
  Cpu,
  Boxes,
  FolderTree,
  ShieldCheck,
  Package,
  Network,
  HardDrive,
  Radio,
  Headphones,
};

export function AdminCategoriesView() {
  const [categories, setCategories] = React.useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"all" | "active" | "inactive">("all");
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);

  // Modals
  const [formCategory, setFormCategory] = React.useState<AdminCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const [deleteCategory, setDeleteCategory] = React.useState<AdminCategory | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{ text: string; variant?: "success" | "error" } | null>(null);

  const showToast = (text: string, variant: "success" | "error" = "success") => {
    setToastMessage({ text, variant });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data);
    } catch {
      showToast("خطا در بارگذاری لیست دسته‌بندی‌ها", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle Save
  const handleSaveCategory = async (formData: CategoryFormData) => {
    if (formCategory) {
      await categoriesApi.updateCategory(formCategory.id, formData);
      showToast(`دسته‌بندی "${formData.shortName}" با موفقیت ویرایش شد.`);
    } else {
      await categoriesApi.createCategory(formData);
      showToast(`دسته‌بندی جدید "${formData.shortName}" با موفقیت ایجاد شد.`);
    }
    await loadCategories();
  };

  // Handle Delete
  const handleDeleteCategory = async (force: boolean) => {
    if (!deleteCategory) return;
    await categoriesApi.deleteCategory(deleteCategory.id, force);
    showToast(`دسته‌بندی "${deleteCategory.shortName}" حذف شد.`);
    await loadCategories();
  };

  // Handle Toggle Active
  const handleToggleActive = async (category: AdminCategory) => {
    try {
      await categoriesApi.updateCategory(category.id, { isActive: !category.isActive });
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, isActive: !c.isActive } : c))
      );
      showToast(`وضعیت دسته "${category.shortName}" تغییر کرد.`);
    } catch {
      showToast("خطا در تغییر وضعیت دسته‌بندی", "error");
    }
  };

  // Copy Slug
  const handleCopySlug = (slug: string) => {
    navigator.clipboard?.writeText(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Filtered
  const filteredCategories = React.useMemo(() => {
    return categories.filter((cat) => {
      if (activeTab === "active" && !cat.isActive) return false;
      if (activeTab === "inactive" && cat.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchTitle = cat.shortName.toLowerCase().includes(q);
        const matchLong = cat.longName.toLowerCase().includes(q);
        const matchSlug = cat.slug.toLowerCase().includes(q);
        const matchDesc = cat.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchLong && !matchSlug && !matchDesc) return false;
      }
      return true;
    });
  }, [categories, activeTab, searchQuery]);

  // Metrics
  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
  const badgedCount = categories.filter((c) => !!c.badge).length;

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 border ${
            toastMessage.variant === "error"
              ? "bg-rose-950/90 text-rose-200 border-rose-500/30 shadow-rose-950/50"
              : "bg-emerald-950/90 text-emerald-200 border-emerald-500/30 shadow-emerald-950/50"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1.5">
            <Link href="/admin" className="hover:text-emerald-400 transition-colors">
              پیشخوان مدیریت
            </Link>
            <span>/</span>
            <span className="text-white font-medium">دسته‌بندی تجهیزات شبکه</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FolderTree className="w-6 h-6" />
            </span>
            مدیریت دسته‌بندی‌های کاتالوگ
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            ساماندهی ساختار درختی کالاها، تنظیم آیکون و نشان‌های بازاریابی و پایش موجودی اقلام هر گروه
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={loadCategories}
            title="بروزرسانی داده‌ها"
            className="border-white/15 bg-white/5 text-neutral-300 hover:text-white text-xs h-10 px-3"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            onClick={() => {
              setFormCategory(null);
              setIsFormOpen(true);
            }}
            className="flex-1 sm:flex-initial bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs h-10 px-4 gap-2 shadow-lg shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            افزودن دسته‌بندی جدید
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400">کل گروه‌ها</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {toPersianDigits(totalCategories)}
            </p>
          </div>
          <span className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <FolderTree className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400">گروه‌های فعال</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {toPersianDigits(activeCount)}
            </p>
          </div>
          <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400">محصولات متصل</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              {toPersianDigits(totalProducts)}
            </p>
          </div>
          <span className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Package className="w-5 h-5" />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400">نشان‌های ویژه</p>
            <p className="text-xl sm:text-2xl font-black text-purple-400 mt-1">
              {toPersianDigits(badgedCount)}
            </p>
          </div>
          <span className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Tag className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/10 p-3 rounded-2xl">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          {[
            { id: "all", label: `همه (${toPersianDigits(totalCategories)})` },
            { id: "active", label: `فعال (${toPersianDigits(activeCount)})` },
            { id: "inactive", label: `غیرفعال (${toPersianDigits(totalCategories - activeCount)})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس عنوان، اسلاگ یا توضیحات..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-neutral-400 font-semibold">
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4">عنوان و آیکون دسته‌بندی</th>
              <th className="py-3.5 px-4">پیوند یکتا (Slug)</th>
              <th className="py-3.5 px-4 text-center">تعداد محصولات</th>
              <th className="py-3.5 px-4 text-center">نشان ویژه</th>
              <th className="py-3.5 px-4 text-center">ترتیب</th>
              <th className="py-3.5 px-4 text-center">وضعیت</th>
              <th className="py-3.5 px-4 text-center w-28">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-neutral-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FolderTree className="w-8 h-8 text-neutral-600" />
                    <span>هیچ دسته‌بندی‌ای با این مشخصات یافت نشد.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat, idx) => {
                const IconComponent = ICON_MAP[cat.icon || "FolderTree"] || FolderTree;
                return (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 px-4 text-center text-neutral-500 font-mono">
                      {toPersianDigits(idx + 1)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-emerald-400 shrink-0 group-hover:border-emerald-500/40 transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </span>
                        <div>
                          <p className="font-bold text-white text-xs">{cat.shortName}</p>
                          {cat.longName && cat.longName !== cat.shortName && (
                            <p className="text-[11px] text-neutral-400 truncate max-w-xs mt-0.5">
                              {cat.longName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-300">
                      <div className="flex items-center gap-1.5" dir="ltr">
                        <span className="text-emerald-400/90">{cat.slug}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySlug(cat.slug)}
                          title="کپی اسلاگ"
                          className="p-1 text-neutral-500 hover:text-white rounded transition-colors"
                        >
                          {copiedSlug === cat.slug ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/products?category=${cat.slug}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-colors font-medium text-[11px]"
                      >
                        <Package className="w-3 h-3 text-emerald-400" />
                        <span>{toPersianDigits(cat.productCount)} کالا</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 mr-0.5" />
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {cat.badge ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[10px] font-bold">
                          {cat.badge}
                        </span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-neutral-300">
                      {toPersianDigits(cat.sortOrder)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          cat.isActive
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-neutral-800 border-neutral-700 text-neutral-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.isActive ? "bg-emerald-400" : "bg-neutral-500"
                          }`}
                        />
                        <span>{cat.isActive ? "فعال" : "غیرفعال"}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setFormCategory(cat);
                            setIsFormOpen(true);
                          }}
                          title="ویرایش دسته‌بندی"
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteCategory(cat);
                            setIsDeleteOpen(true);
                          }}
                          title="حذف دسته‌بندی"
                          className="p-1.5 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-400 bg-white/[0.02] border border-white/10 rounded-2xl">
            هیچ دسته‌بندی‌ای یافت نشد.
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon || "FolderTree"] || FolderTree;
            return (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
                      <IconComponent className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-xs">{cat.shortName}</h3>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5" dir="ltr">
                        {cat.slug}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(cat)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      cat.isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-neutral-800 border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {cat.isActive ? "فعال" : "غیرفعال"}
                  </button>
                </div>

                {cat.description && (
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <Link
                    href={`/admin/products?category=${cat.slug}`}
                    className="flex items-center gap-1.5 text-emerald-400 hover:underline text-[11px]"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>{toPersianDigits(cat.productCount)} محصول متصل</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFormCategory(cat);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 text-neutral-300 hover:text-white bg-white/5 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteCategory(cat);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-rose-400 bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={formCategory}
        onSave={handleSaveCategory}
        existingCategories={categories}
      />

      {/* Delete Modal */}
      <CategoryDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        category={deleteCategory}
        onConfirm={handleDeleteCategory}
      />
    </div>
  );
}
