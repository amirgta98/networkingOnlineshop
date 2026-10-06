"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { ProductOption, ProductOptionValue } from "@/features/catalog/types";
import { SelectedOptionDetail } from "@/features/cart/types";
import { formatPrice } from "@/shared/lib/utils";

export interface ProductVariantsProps {
  options: ProductOption[];
  selectedOptions: Record<string, SelectedOptionDetail>;
  onSelectOption: (optionId: string, optionName: string, value: ProductOptionValue) => void;
  className?: string;
}

export function ProductVariants({
  options,
  selectedOptions,
  onSelectOption,
  className = "",
}: ProductVariantsProps) {
  if (!options || options.length === 0) return null;

  return (
    <div className={`flex flex-col gap-4 ${className}`} dir="rtl">
      {options.map((option) => {
        const currentSelected = selectedOptions[option.id];

        return (
          <div key={option.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-200">
                {option.name}:
              </span>
              {currentSelected && (
                <span className="text-orange-400 font-medium text-[11px]">
                  {currentSelected.valueLabel}
                </span>
              )}
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label={option.name}
            >
              {option.values.map((val) => {
                const isSelected = currentSelected?.value === val.value;

                return (
                  <button
                    key={val.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelectOption(option.id, option.name, val)}
                    className={`group relative flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                      isSelected
                        ? "border-orange-500 bg-orange-950/30 text-white shadow-md shadow-orange-950/30 ring-1 ring-orange-500/40"
                        : "border-neutral-800 bg-[#141418] text-neutral-300 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {/* Color Swatch if colorHex is present */}
                    {val.colorHex && (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: val.colorHex }}
                      />
                    )}

                    <span>{val.label}</span>

                    {/* Price modifier badge */}
                    {val.priceModifier !== undefined && val.priceModifier !== 0 && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                          isSelected
                            ? "bg-orange-500/30 text-orange-200"
                            : "bg-neutral-800 text-neutral-400 group-hover:text-neutral-300"
                        }`}
                      >
                        {val.priceModifier > 0 ? "+" : ""}
                        {formatPrice(val.priceModifier)}
                      </span>
                    )}

                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
