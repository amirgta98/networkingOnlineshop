"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { CartItem as CartItemType } from "../types";
import { useCart } from "../hooks/use-cart";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="flex gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
    >
      {/* Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-2">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
            {product.name}
          </h4>
          <button
            onClick={() => removeItem(item.id)}
            className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            aria-label={`حذف ${product.name} از سبد خرید`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 capitalize">{product.category}</p>

        {/* Selected Variant Options */}
        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(item.selectedOptions).map(([key, opt]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-md bg-neutral-800/80 px-1.5 py-0.5 text-[10px] text-neutral-300 border border-neutral-700/60"
              >
                <span className="text-neutral-500">{opt.optionName}:</span>
                <span className="font-medium text-orange-400">{opt.valueLabel}</span>
              </span>
            ))}
          </div>
        )}

        {/* Quantity Controls & Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-800/50">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="flex h-7 w-7 items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
              aria-label="کاهش تعداد"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {toPersianDigits(quantity)}
            </span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="flex h-7 w-7 items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer"
              aria-label="افزایش تعداد"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="text-sm font-bold text-neutral-900 dark:text-white shrink-0 whitespace-nowrap">
            {formatPrice((item.unitPrice ?? product.price) * quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export const CartItemRow = CartItem;


