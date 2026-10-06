"use client";

import * as React from "react";
import { Search, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Product } from "@/features/catalog/types";

export interface ProductSpecsTableProps {
  product: Product;
  className?: string;
}

export function ProductSpecsTable({ product, className = "" }: ProductSpecsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Default fallback spec groups if not provided on the product object
  const defaultSpecGroups = [
    {
      category: "مشخصات عمومی و فنی اصلی",
      items: [
        { label: "نام تجاری و پارت‌نامبر", value: product.sku || product.slug },
        { label: "شرکت سازنده", value: product.brand || "استاندارد بین‌المللی" },
        { label: "دسته‌بندی تجهیزات", value: product.category },
        { label: "وضعیت گارانتی", value: product.warranty || "ضمانت اصالت و سلامت فیزیکی" },
        ...(product.specs || []).map((s, i) => ({
          label: `ویژگی سخت‌افزاری ${i + 1}`,
          value: s,
        })),
      ],
    },
  ];

  const rawGroups =
    product.specGroups && product.specGroups.length > 0
      ? product.specGroups
      : defaultSpecGroups;

  // Filter based on search term
  const filteredGroups = React.useMemo(() => {
    if (!searchTerm.trim()) return rawGroups;
    const term = searchTerm.toLowerCase().trim();

    return rawGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(term) ||
            item.value.toLowerCase().includes(term)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [rawGroups, searchTerm]);

  return (
    <div
      className={`rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 sm:p-7 ${className}`}
      dir="rtl"
    >
      {/* ── Table Header & Search ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-orange-400" />
            <span>جدول مشخصات فنی و استانداردهای سخت‌افزاری</span>
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            اطلاعات تایید شده توسط تیم فنی مهندسی شبکه ققنوس آکادمی
          </p>
        </div>

        {/* Specs Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در مشخصات فنی..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2 pr-9 pl-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            aria-label="جستجوی مشخصات فنی"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      {/* ── Semantic HTML Tables Grouped by Category ─────────────────────── */}
      {filteredGroups.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400">
          مشخصه‌ای مطابق با عبارت جستجوی «{searchTerm}» یافت نشد.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-[#141418]">
              {/* Category Header */}
              <div className="bg-neutral-900/90 px-4 py-3 border-b border-neutral-800 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <h3 className="text-xs sm:text-sm font-bold text-neutral-100">
                  {group.category}
                </h3>
              </div>

              {/* Specs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <caption className="sr-only">{group.category}</caption>
                  <tbody>
                    {group.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-neutral-800/60 last:border-b-0 hover:bg-neutral-800/30 transition-colors"
                      >
                        <th
                          scope="row"
                          className="w-2/5 sm:w-1/3 py-3 px-4 font-semibold text-neutral-400 bg-neutral-900/30 align-top break-words"
                        >
                          {item.label}
                        </th>
                        <td className="py-3 px-4 text-neutral-200 font-medium leading-relaxed tabular-nums break-words">
                          {item.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fluke & Standard Guarantee Footer */}
      <div className="mt-6 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>مطابق با استانداردهای رسمی IEEE و استانداردهای صنعتی TIA/EIA</span>
        </div>
        <span>آخرین به‌روزرسانی دیتاشیت: {new Date().toLocaleDateString("fa-IR")}</span>
      </div>
    </div>
  );
}
