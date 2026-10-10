"use client";

import * as React from "react";
import {
  Layers,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { MOCK_WHOLESALE_PRODUCTS } from "../data/mock-partner-data";
import type { WholesaleProduct } from "../types/partner.types";

export function PartnerCatalogView() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedBrand, setSelectedBrand] = React.useState<string>("all");
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});
  const [addedItems, setAddedItems] = React.useState<Record<string, boolean>>({});

  const brands = ["all", "Cisco", "Nexans", "Finisar", "Legrand", "MikroTik"];

  const filteredProducts = React.useMemo(() => {
    return MOCK_WHOLESALE_PRODUCTS.filter((prod) => {
      const matchSearch =
        prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBrand = selectedBrand === "all" || prod.brand === selectedBrand;
      return matchSearch && matchBrand;
    });
  }, [searchQuery, selectedBrand]);

  const handleQtyChange = (id: string, delta: number, min: number) => {
    setQuantities((prev) => {
      const current = prev[id] || min;
      const next = Math.max(min, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (id: string) => {
    setAddedItems((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">کاتالوگ و لیست قیمت عمده همکاران</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                تجهیزات دارای تخفیف همکاری ویژه سطح طلایی (Tier A) بر اساس تیراژ کارتن و بسته
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-xs gap-2"
            onClick={() => alert("فایل اکسل روزانه با تخفیف‌های همکار دانلود شد.")}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>دانلود اکسل روزانه</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-xs gap-2"
            onClick={() => alert("کاتالوگ PDF همکاری آماده دانلود است.")}
          >
            <Download className="h-4 w-4 text-sky-400" />
            <span>کاتالوگ PDF</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--theme-surface)] p-4 rounded-2xl border border-[var(--theme-border-color)]">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="جستجوی پارت نامبر، نام کالا یا مدل سوئیچ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
          />
        </div>

        {/* Brand Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {brands.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedBrand === brand
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              {brand === "all" ? "همه برندها" : brand}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/40 text-neutral-400">
                <th className="py-3.5 pr-4 font-semibold">پارت‌نامبر و شرح تجهیزات</th>
                <th className="py-3.5 px-3 font-semibold">برند / دسته‌بندی</th>
                <th className="py-3.5 px-3 font-semibold">قیمت مصرف‌کننده</th>
                <th className="py-3.5 px-3 font-semibold">قیمت همکاری (Tier A)</th>
                <th className="py-3.5 px-3 font-semibold">تخفیف سازمانی</th>
                <th className="py-3.5 px-3 font-semibold">موجودی انبار</th>
                <th className="py-3.5 pl-4 text-left font-semibold">سفارش عمده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredProducts.map((prod) => {
                const qty = quantities[prod.id] || prod.minOrderQty;
                const isAdded = addedItems[prod.id];
                const totalItemPrice = prod.partnerPrice * qty;

                return (
                  <tr key={prod.id} className="hover:bg-neutral-900/30 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-1 max-w-sm">
                        <span className="font-mono font-bold text-sky-400 text-[11px]">
                          {prod.code}
                        </span>
                        <span className="text-white font-medium leading-relaxed">
                          {prod.title}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          واحد فروش: {prod.unit} (حداقل سفارش: {toPersianDigits(prod.minOrderQty)} {prod.unit})
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-neutral-200">{prod.brand}</span>
                        <span className="text-[11px] text-neutral-400">{prod.category}</span>
                      </div>
                    </td>

                    <td className="py-4 px-3 font-mono text-neutral-400 line-through">
                      {formatPrice(prod.retailPrice)}
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-base text-emerald-400">
                          {formatPrice(prod.partnerPrice)}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          سود خرید: {formatPrice(prod.retailPrice - prod.partnerPrice)}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        ٪{toPersianDigits(prod.discountPercent)} تخفیف
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span className="text-xs text-neutral-300 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span>{toPersianDigits(prod.stockCount)} {prod.unit}</span>
                      </span>
                    </td>

                    <td className="py-4 pl-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {/* Stepper */}
                        <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 p-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(prod.id, 1, prod.minOrderQty)}
                            className="p-1 hover:text-white text-neutral-400 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-xs text-white">
                            {toPersianDigits(qty)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(prod.id, -1, prod.minOrderQty)}
                            className="p-1 hover:text-white text-neutral-400 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Add Button */}
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(prod.id)}
                          className={`text-xs gap-1.5 transition-all ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-sky-600 hover:bg-sky-500 text-white"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>ثبت شد</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5" />
                              <span>سفارش</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
