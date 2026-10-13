"use client";

import * as React from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import type { AdminCategory } from "../../types/admin-categories.types";
import { Button } from "@/shared/components/ui/button";

export interface CategoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: AdminCategory | null;
  onConfirm: (force: boolean) => Promise<void>;
}

export function CategoryDeleteModal({
  isOpen,
  onClose,
  category,
  onConfirm,
}: CategoryDeleteModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [force, setForce] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    setForce(false);
  }, [category, isOpen]);

  if (!isOpen || !category) return null;

  const hasProducts = category.productCount > 0;

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await onConfirm(force);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در حذف دسته‌بندی.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">حذف دسته‌بندی</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{category.shortName}</p>
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

        {error && (
          <div className="p-3 mb-4 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-3 text-xs text-neutral-300 mb-6">
          <p>
            آیا از حذف دسته‌بندی <strong className="text-white">"{category.shortName}"</strong> (با اسلاگ{" "}
            <code className="text-emerald-400 font-mono">{category.slug}</code>) اطمینان دارید؟
          </p>

          {hasProducts && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>توجه: {category.productCount} محصول به این دسته‌بندی متصل هستند!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                با حذف این دسته، پیوند محصولات متصل قطع خواهد شد. برای تایید حذف، گزینه زیر را تیک بزنید.
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={force}
                  onChange={(e) => setForce(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-rose-500 focus:ring-0"
                />
                <span className="text-xs font-semibold text-white">تایید حذف اجباری</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-white/15 bg-white/5 text-neutral-300 hover:text-white text-xs h-10 px-4"
          >
            انصراف
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || (hasProducts && !force)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-5 gap-2 shadow-lg shadow-rose-950/40"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال حذف...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                حذف نهایی
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
