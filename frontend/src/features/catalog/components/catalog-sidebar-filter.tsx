"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Network,
  Router,
  Wifi,
  Radio,
  Cable,
  Server,
  Check,
  Search,
  X,
} from "lucide-react";
import { ProductCategory } from "../types";
import { toPersianDigits } from "@/shared/lib/utils";

export interface CatalogSidebarFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  minPrice?: number;
  onMinPriceChange: (val?: number) => void;
  maxPrice?: number;
  onMaxPriceChange: (val?: number) => void;
  inStockOnly: boolean;
  onInStockChange: (val: boolean) => void;
  onSaleOnly: boolean;
  onSaleChange: (val: boolean) => void;
  onReset: () => void;
  activeFiltersCount: number;
  totalProducts?: number;
  className?: string;
}

const CATEGORIES: {
  id: ProductCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "all", label: "همه دسته‌بندی‌ها", icon: Server },
  { id: "switches", label: "سوئیچ‌های شبکه", icon: Network },
  { id: "routers", label: "روتر و فایروال", icon: Router },
  { id: "wireless", label: "اکسس‌پوینت و بی‌سیم", icon: Wifi },
  { id: "fiber", label: "ماژول و فیبر نوری", icon: Radio },
  { id: "cables", label: "کابل شبکه", icon: Cable },
  { id: "passive", label: "پسیو و رک", icon: Server },
];

const BRANDS = [
  { id: "Cisco", label: "سیسکو (Cisco)" },
  { id: "MikroTik", label: "میکروتیک (MikroTik)" },
  { id: "Ubiquiti", label: "یوبیکیوتی (Ubiquiti)" },
  { id: "Nexans", label: "نگزانس (Nexans)" },
  { id: "Legrand", label: "لگراند (Legrand)" },
];

const PRICE_PRESETS = [
  { label: "همه قیمت‌ها", min: undefined, max: undefined },
  { label: "زیر ۵ میلیون", min: undefined, max: 5000000 },
  { label: "۵ تا ۱۵ میلیون", min: 5000000, max: 15000000 },
  { label: "۱۵ تا ۳۵ میلیون", min: 15000000, max: 35000000 },
  { label: "بالای ۳۵ میلیون", min: 35000000, max: undefined },
];

export function CatalogSidebarFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  selectedBrands,
  onToggleBrand,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  inStockOnly,
  onInStockChange,
  onSaleOnly,
  onSaleChange,
  onReset,
  activeFiltersCount,
  totalProducts,
  className = "",
}: CatalogSidebarFilterProps) {
  return (
    <aside
      className={`flex flex-col gap-6 rounded-2xl border border-neutral-800/90 bg-[#111114] p-5 shadow-xl shadow-black/20 ${className}`}
      dir="rtl"
    >
      {/* ── Sidebar Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-orange-400" />
          <h3 className="text-base font-bold text-neutral-100">فیلتر محصولات</h3>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white shadow-xs">
              {toPersianDigits(activeFiltersCount)}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>پاکسازی</span>
          </button>
        )}
      </div>

      {/* ── Quick Search ───────────────────────────────────────────────── */}
      <div className="relative">
        <input
          type="text"
          placeholder="جستجوی مدل یا نام کالا..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2 pr-9 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-orange-500/60 focus:outline-hidden focus:ring-1 focus:ring-orange-500/50 transition-all"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 pointer-events-none" />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            aria-label="پاک کردن جستجو"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Categories Section ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          دسته‌بندی‌ها
        </div>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all text-right cursor-pointer ${
                  isActive
                    ? "bg-orange-950/40 text-orange-400 border border-orange-500/30 font-bold"
                    : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-orange-400" : "text-neutral-500 group-hover:text-neutral-300"
                    }`}
                  />
                  <span>{cat.label}</span>
                </div>
                {isActive && <Check className="h-3.5 w-3.5 text-orange-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Brands Section ─────────────────────────────────────────────── */}
      <div className="space-y-3 border-t border-neutral-800/80 pt-4">
        <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
          برندها
        </div>
        <div className="flex flex-col gap-2">
          {BRANDS.map((brand) => {
            const isChecked = selectedBrands.includes(brand.id);
            return (
              <label
                key={brand.id}
                onClick={() => onToggleBrand(brand.id)}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 hover:bg-neutral-850 cursor-pointer transition-colors"
              >
                <span>{brand.label}</span>
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-md border transition-all ${
                    isChecked
                      ? "border-orange-500 bg-orange-600 text-white"
                      : "border-neutral-700 bg-neutral-900"
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Price Filter Section ───────────────────────────────────────── */}
      <div className="space-y-3 border-t border-neutral-800/80 pt-4">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
          <span>محدوده قیمت (تومان)</span>
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <button
              onClick={() => {
                onMinPriceChange(undefined);
                onMaxPriceChange(undefined);
              }}
              className="text-[11px] text-orange-400 font-normal hover:underline"
            >
              پاک کردن
            </button>
          )}
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset, idx) => {
            const isSelected = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={idx}
                onClick={() => {
                  onMinPriceChange(preset.min);
                  onMaxPriceChange(preset.max);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] transition-all cursor-pointer ${
                  isSelected
                    ? "bg-orange-600 text-white font-bold"
                    : "bg-neutral-850 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Min / Max numeric inputs */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-400">از قیمت (تومان)</label>
            <input
              type="number"
              placeholder="۰"
              value={minPrice ?? ""}
              onChange={(e) =>
                onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1.5 text-xs text-neutral-200 focus:border-orange-500/60 focus:outline-hidden"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-400">تا قیمت (تومان)</label>
            <input
              type="number"
              placeholder="مثال: ۵۰,۰۰۰,۰۰۰"
              value={maxPrice ?? ""}
              onChange={(e) =>
                onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1.5 text-xs text-neutral-200 focus:border-orange-500/60 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* ── Availability & Deals Toggles ───────────────────────────────── */}
      <div className="space-y-2.5 border-t border-neutral-800/80 pt-4">
        {/* In Stock toggle */}
        <div
          onClick={() => onInStockChange(!inStockOnly)}
          className="flex items-center justify-between rounded-xl bg-neutral-900/60 p-3 border border-neutral-800/60 cursor-pointer hover:border-neutral-700 transition-colors"
        >
          <span className="text-xs font-medium text-neutral-300">
            فقط کالاهای موجود
          </span>
          <div
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              inStockOnly ? "bg-orange-600" : "bg-neutral-800"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                inStockOnly ? "-translate-x-4" : "-translate-x-1"
              }`}
            />
          </div>
        </div>

        {/* On Sale toggle */}
        <div
          onClick={() => onSaleChange(!onSaleOnly)}
          className="flex items-center justify-between rounded-xl bg-neutral-900/60 p-3 border border-neutral-800/60 cursor-pointer hover:border-neutral-700 transition-colors"
        >
          <span className="text-xs font-medium text-neutral-300">
            فقط کالاهای تخفیف‌دار
          </span>
          <div
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              onSaleOnly ? "bg-orange-600" : "bg-neutral-800"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                onSaleOnly ? "-translate-x-4" : "-translate-x-1"
              }`}
            />
          </div>
        </div>
      </div>

      {/* ── Summary Indicator ──────────────────────────────────────────── */}
      {totalProducts !== undefined && (
        <div className="border-t border-neutral-800/80 pt-3 text-center text-xs text-neutral-400">
          <span>تعداد کالاهای مطابق: </span>
          <span className="font-bold text-orange-400">{toPersianDigits(totalProducts)} کالا</span>
        </div>
      )}
    </aside>
  );
}
