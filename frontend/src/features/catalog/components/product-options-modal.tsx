"use client";

import * as React from "react";
import Image from "next/image";
import { X, ShoppingBag, Plus, Minus, Layers, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, ProductOption } from "../types";
import { SelectedOptionDetail } from "@/features/cart/types";
import { useCart } from "@/features/cart";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export interface ProductOptionsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (options: {
    quantity: number;
    selectedDetails: Record<string, SelectedOptionDetail>;
    unitPrice: number;
  }) => void;
}

export function ProductOptionsModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: ProductOptionsModalProps) {
  const { addItem } = useCart();
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string>>({});
  const [quantity, setQuantity] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Initialize selected values whenever product changes
  React.useEffect(() => {
    if (!product || !product.options) return;

    const initial: Record<string, string> = {};
    for (const opt of product.options) {
      if (opt.values && opt.values.length > 0) {
        initial[opt.id] = opt.defaultSelected ?? opt.values[0].value;
      }
    }
    setSelectedValues(initial);
    setQuantity(1);
    setIsSubmitting(false);
  }, [product, isOpen]);

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!product) return null;

  const options: ProductOption[] = product.options || [];

  // Calculate customized unit price based on selected modifiers
  let totalModifiers = 0;
  const selectedDetails: Record<string, SelectedOptionDetail> = {};

  for (const opt of options) {
    const chosenVal = selectedValues[opt.id];
    const valObj = opt.values.find((v) => v.value === chosenVal);
    if (valObj) {
      if (valObj.priceModifier) {
        totalModifiers += valObj.priceModifier;
      }
      selectedDetails[opt.id] = {
        optionName: opt.name,
        valueLabel: valObj.label,
        value: valObj.value,
        priceModifier: valObj.priceModifier,
      };
    }
  }

  const unitPrice = product.price + totalModifiers;
  const totalPrice = unitPrice * quantity;

  const handleSelectOption = (optionId: string, value: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [optionId]: value,
    }));
  };

  const handleConfirmAddToCart = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // 1. Close modal first
    onClose();

    // 2. Trigger confirmation callback or fallback to direct add
    if (onConfirm) {
      onConfirm({
        quantity,
        selectedDetails,
        unitPrice,
      });
    } else {
      addItem(product, quantity, selectedDetails, unitPrice);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-800 bg-[#111114] text-neutral-100 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="options-modal-title"
          >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-neutral-800/90 p-4 sm:p-5 bg-neutral-900/40">
            <div className="flex items-center gap-3.5">
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                <Image
                  src={product.images[0] || "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80"}
                  alt={product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-medium text-orange-400">
                    <Layers className="h-3 w-3" />
                    انتخاب مشخصات
                  </span>
                  {product.brand && (
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {product.brand}
                    </span>
                  )}
                </div>

                <h3
                  id="options-modal-title"
                  className="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug"
                >
                  {product.name}
                </h3>

                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-neutral-400">قیمت واحد:</span>
                  <span className="font-bold text-orange-400">{formatPrice(unitPrice)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              aria-label="بستن پنجره"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body: Options Selection */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-5">
            {options.map((opt) => {
              const currentVal = selectedValues[opt.id];
              const selectedOptObj = opt.values.find((v) => v.value === currentVal);

              return (
                <div key={opt.id} className="space-y-2.5">
                  {/* Option Label + Selected Preview */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-neutral-200">{opt.name}:</span>
                    {selectedOptObj && (
                      <span className="text-xs font-medium text-orange-400 bg-orange-950/30 px-2 py-0.5 rounded-md border border-orange-500/20">
                        {selectedOptObj.label}
                      </span>
                    )}
                  </div>

                  {/* Option Chips / Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opt.values.map((val) => {
                      const isSelected = currentVal === val.value;

                      return (
                        <button
                          key={val.value}
                          type="button"
                          onClick={() => handleSelectOption(opt.id, val.value)}
                          className={`relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs text-right transition-all cursor-pointer border ${
                            isSelected
                              ? "border-orange-500 bg-orange-500/10 text-orange-300 font-bold shadow-sm shadow-orange-950/30 ring-1 ring-orange-500/40"
                              : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            {/* Optional color dot */}
                            {val.colorHex && (
                              <span
                                className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20 shadow-xs"
                                style={{ backgroundColor: val.colorHex }}
                              />
                            )}

                            <span className="truncate">{val.label}</span>
                          </div>

                          {/* Price Modifier Badge */}
                          {val.priceModifier && val.priceModifier > 0 ? (
                            <span
                              className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? "text-orange-400 bg-orange-500/20"
                                  : "text-neutral-400 bg-neutral-800/80"
                              }`}
                            >
                              +{formatPrice(val.priceModifier)}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
              <span className="text-xs sm:text-sm font-semibold text-neutral-300">
                تعداد سفارش:
              </span>

              <div className="flex items-center rounded-xl border border-neutral-700/80 bg-neutral-900 px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                  aria-label="کاهش تعداد"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-white tabular-nums">
                  {toPersianDigits(quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                  aria-label="افزایش تعداد"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer: Price Summary & Confirm Button */}
          <div className="border-t border-neutral-800 bg-neutral-950/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center justify-between sm:flex-col sm:items-start">
              <span className="text-[11px] text-neutral-400 font-medium">مبلغ کل انتخابی:</span>
              <span className="text-base sm:text-lg font-black text-white">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <Button
              onClick={handleConfirmAddToCart}
              disabled={isSubmitting}
              className="gap-2 rounded-xl py-2.5 px-5 text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-950/30 active:scale-[0.98] transition-all duration-200"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>تأیید و افزودن به سبد</span>
            </Button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
