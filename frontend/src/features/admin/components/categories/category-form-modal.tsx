"use client";

import * as React from "react";
import {
  X,
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
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { AdminCategory, CategoryFormData } from "../../types/admin-categories.types";
import { CATEGORY_ICON_PRESETS } from "../../types/admin-categories.types";
import { Button } from "@/shared/components/ui/button";

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

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: AdminCategory | null;
  onSave: (data: CategoryFormData) => Promise<void>;
  existingCategories: AdminCategory[];
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSave,
  existingCategories,
}: CategoryFormModalProps) {
  const isEdit = !!category;

  const [shortName, setShortName] = React.useState("");
  const [longName, setLongName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState("FolderTree");
  const [badge, setBadge] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<number>(1);
  const [isActive, setIsActive] = React.useState(true);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (category) {
      setShortName(category.shortName || "");
      setLongName(category.longName || "");
      setSlug(category.slug || "");
      setDescription(category.description || "");
      setIcon(category.icon || "FolderTree");
      setBadge(category.badge || "");
      setSortOrder(category.sortOrder ?? 1);
      setIsActive(category.isActive ?? true);
    } else {
      setShortName("");
      setLongName("");
      setSlug("");
      setDescription("");
      setIcon("FolderTree");
      setBadge("");
      setSortOrder(existingCategories.length + 1);
      setIsActive(true);
    }
    setError(null);
  }, [category, existingCategories, isOpen]);

  if (!isOpen) return null;

  const handleShortNameChange = (val: string) => {
    setShortName(val);
    if (!isEdit && !slug) {
      // Auto-generate slug suggestion if not manually set
      const autoSlug = val
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(autoSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shortName.trim()) {
      setError("لطفاً عنوان کوتاه دسته‌بندی را وارد نمایید.");
      return;
    }

    const cleanSlug =
      slug.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-") ||
      shortName.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, "-");

    if (!cleanSlug) {
      setError("لطفاً پیوند یکتای (اسلاگ) معتبر مشخص کنید.");
      return;
    }

    // Check slug collision
    const collision = existingCategories.find(
      (c) => c.slug === cleanSlug && c.id !== category?.id
    );
    if (collision) {
      setError(`پیوند یکتای "${cleanSlug}" قبلاً برای دسته‌بندی "${collision.shortName}" استفاده شده است.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        shortName: shortName.trim(),
        longName: longName.trim() || shortName.trim(),
        slug: cleanSlug,
        description: description.trim() || undefined,
        icon,
        badge: badge.trim() || undefined,
        sortOrder: Number(sortOrder) || 1,
        isActive,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره‌سازی دسته‌بندی.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIconComponent = ICON_MAP[icon] || FolderTree;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-xl bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <SelectedIconComponent className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEdit ? `ویرایش دسته‌بندی: ${category.shortName}` : "افزودن دسته‌بندی جدید"}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                تعریف عنوان، پیوند یکتا (Slug)، آیکون اختصاصی و اتصال به کاتالوگ محصولات
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          {/* Row 1: Short Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                عنوان کوتاه دسته <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => handleShortNameChange(e.target.value)}
                placeholder="مثال: سوئیچ‌های شبکه"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                پیوند یکتا (Slug) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="switches"
                dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                required
              />
            </div>
          </div>

          {/* Row 2: Long Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              نام کامل و عنوان نمایشی
            </label>
            <input
              type="text"
              value={longName}
              onChange={(e) => setLongName(e.target.value)}
              placeholder="مثال: سوئیچ‌های مدیریتی و غیرمدیریتی سیسکو و میکروتیک"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              توضیحات و کاربرد دسته‌بندی
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="توضیحاتی پیرامون نوع کالاها و استانداردهای این دسته..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Row 4: Icon Selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              انتخاب نماد و آیکون اختصاصی
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORY_ICON_PRESETS.map((preset) => {
                const IconComponent = ICON_MAP[preset.name] || FolderTree;
                const isSelected = icon === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setIcon(preset.name)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                        : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="truncate text-[11px]">{preset.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Badge, Sort Order & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                نشان ویژه / برچسب
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="مثال: پرفروش، جدید"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                ترتیب نمایش
              </label>
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                وضعیت انتشار
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-neutral-800 border-neutral-700 text-neutral-400"
                }`}
              >
                <span>{isActive ? "فعال در فروشگاه" : "غیرفعال"}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isActive ? "bg-emerald-400" : "bg-neutral-500"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-white/15 bg-white/5 text-neutral-300 hover:text-white text-xs h-10 px-4"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs h-10 px-5 gap-2 shadow-lg shadow-emerald-950/40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? "ذخیره تغییرات" : "ایجاد دسته‌بندی"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
