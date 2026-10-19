"use client";

import * as React from "react";
import {
  Layers,
  Search,
  Plus,
  Check,
  Trash2,
  ArrowUp,
  ArrowDown,
  Package,
  Boxes,
  Loader2,
} from "lucide-react";
import type { AdminProduct } from "../../types/admin-products.types";
import {
  PRODUCT_CATEGORY_LABELS,
  type AdminProductCategory,
} from "../../types/admin-products.types";
import { productsApi } from "../../api/products-api";
import { Button } from "@/shared/components/ui/button";
import { cn, formatPrice, resolveProductImageUrl, toPersianDigits } from "@/shared/lib/utils";

export interface ProductRelationsManagerProps {
  currentProductId?: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  availableProducts?: AdminProduct[];
}

export function ProductRelationsManager({
  currentProductId,
  selectedIds,
  onChange,
  availableProducts: propProducts,
}: ProductRelationsManagerProps) {
  const [internalProducts, setInternalProducts] = React.useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(
    !propProducts || propProducts.length === 0
  );
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  const products = propProducts && propProducts.length > 0 ? propProducts : internalProducts;

  // Load products if not supplied via props
  React.useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      return;
    }

    let isMounted = true;

    async function fetchProducts() {
      let list: AdminProduct[] = [];
      try {
        const res = await productsApi.getProducts({ limit: 100 });
        if (res && Array.isArray(res.products)) {
          list = res.products;
        }
      } catch {
        // fallback
      }

      if (isMounted) {
        setInternalProducts(list);
        setIsLoading(false);
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [propProducts]);

  // Exclude current product being edited
  const selectablePool = React.useMemo(() => {
    return products.filter((p) => p.id !== currentProductId && p.slug !== currentProductId);
  }, [products, currentProductId]);

  // Selected products mapped in the order of selectedIds
  const selectedProducts = React.useMemo(() => {
    const map = new Map<string, AdminProduct>();
    for (const p of selectablePool) {
      map.set(p.id, p);
      if (p.slug) map.set(p.slug, p);
    }
    return selectedIds
      .map((id) => map.get(id))
      .filter((p): p is AdminProduct => Boolean(p));
  }, [selectedIds, selectablePool]);

  // Filtered pool for selection
  const filteredPool = React.useMemo(() => {
    return selectablePool.filter((p) => {
      // Category filter
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        return matchName || matchSku || matchBrand;
      }
      return true;
    });
  }, [selectablePool, categoryFilter, searchTerm]);

  // Toggle selection
  const handleToggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Move product up in order
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newIds = [...selectedIds];
    const temp = newIds[index];
    newIds[index] = newIds[index - 1];
    newIds[index - 1] = temp;
    onChange(newIds);
  };

  // Move product down in order
  const handleMoveDown = (index: number) => {
    if (index >= selectedIds.length - 1) return;
    const newIds = [...selectedIds];
    const temp = newIds[index];
    newIds[index] = newIds[index + 1];
    newIds[index + 1] = temp;
    onChange(newIds);
  };

  // Remove product from selected
  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((item) => item !== id));
  };

  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Header Description ────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>مدیریت محصولات مرتبط و تجهیزات مکمل</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono">
                {toPersianDigits(selectedIds.length)} مورد انتخاب شده
              </span>
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
              کالاهای مکمل (مانند ماژول‌های SFP سازگار، پچ‌کورد مناسب یا روتر متناظر) را از لیست زیر انتخاب کنید. این محصولات در صفحه جزئیات کالا در بخش «تجهیزات سازگار و محصولات پیشنهادی» با اولویت انتخاب شما نمایش داده خواهند شد.
            </p>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-3 rounded-lg shrink-0"
          >
            پاک کردن همه
          </Button>
        )}
      </div>

      {/* ── SECTION 1: SELECTED RELATED PRODUCTS LIST ──────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>محصولات مرتبط انتخاب‌شده ({toPersianDigits(selectedProducts.length)} کالا)</span>
          </label>
          <span className="text-[11px] text-neutral-400">
            ترتیب نمایش را با دکمه‌های بالا و پایین تنظیم فرمایید
          </span>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="p-8 border border-dashed border-white/10 rounded-2xl bg-[#141417] text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
              <Boxes className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-neutral-300">
              هنوز هیچ محصول مرتبطی برای این کالا تعیین نشده است.
            </p>
            <p className="text-[11px] text-neutral-500">
              از جدول یا لیست زیر، روی دکمه «+ افزودن به مرتبط‌ها» کلیک کنید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedProducts.map((p, idx) => {
              const primaryImg =
                p.images && p.images.length > 0
                  ? resolveProductImageUrl(p.images[0])
                  : "/placeholder.png";

              return (
                <div
                  key={p.id}
                  className="p-3 bg-[#161619] border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 group hover:border-emerald-500/50 transition-all shadow-sm"
                >
                  {/* Thumbnail & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {toPersianDigits(idx + 1)}
                    </div>

                    <div className="w-12 h-12 rounded-lg bg-[#202025] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={primaryImg}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=100&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span className="font-mono text-neutral-300">{p.sku}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Reorder & Remove */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      title="انتقال به بالا"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === selectedProducts.length - 1}
                      title="انتقال به پایین"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id)}
                      title="حذف از محصولات مرتبط"
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 2: CATALOG SEARCH & SELECTION ──────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-400" />
              <span>انتخاب از لیست محصولات فروشگاه</span>
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              از میان کالاهای موجود جستجو کنید و محصولات مرتبط را علامت بزنید.
            </p>
          </div>

          <span className="text-[11px] text-neutral-400 font-mono">
            {toPersianDigits(filteredPool.length)} کالا در دسترس
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام، مدل، SKU یا برند محصول..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pr-10 pl-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              {Object.entries(PRODUCT_CATEGORY_LABELS).map(([catKey, catLabel]) => (
                <option key={catKey} value={catKey}>
                  {catLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Selection Grid */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">در حال بارگذاری لیست محصولات...</span>
          </div>
        ) : filteredPool.length === 0 ? (
          <div className="p-8 border border-white/10 rounded-2xl bg-[#141417] text-center space-y-2">
            <p className="text-xs font-semibold text-neutral-300">
              محصولی با این مشخصات یافت نشد.
            </p>
            <p className="text-[11px] text-neutral-500">
              عبارت جستجو را تغییر دهید یا فیلتر دسته‌بندی را روی «همه» بگذارید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto p-1 rounded-xl">
            {filteredPool.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              const primaryImg =
                p.images && p.images.length > 0
                  ? resolveProductImageUrl(p.images[0])
                  : "/placeholder.png";
              const catLabel =
                PRODUCT_CATEGORY_LABELS[p.category as AdminProductCategory] || p.category;

              return (
                <div
                  key={p.id}
                  onClick={() => handleToggleProduct(p.id)}
                  className={cn(
                    "p-3 rounded-xl border text-right cursor-pointer transition-all flex flex-col justify-between gap-3 group relative select-none",
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm shadow-emerald-950/20"
                      : "bg-[#161619] border-white/10 hover:border-white/20 hover:bg-[#1a1a1e]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-[#202025] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={primaryImg}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=100&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                          {p.sku}
                        </span>
                        <span className="text-[10px] text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded">
                          {catLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs font-black text-white">
                      {formatPrice(p.price)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleProduct(p.id);
                      }}
                      className={cn(
                        "text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all",
                        isSelected
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-white/5 text-neutral-300 hover:bg-emerald-600 hover:text-white"
                      )}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>انتخاب شده</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>افزودن</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
