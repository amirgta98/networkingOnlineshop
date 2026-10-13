"use client";

import * as React from "react";
import {
  Boxes,
  Plus,
  Minus,
  DollarSign,
  AlertTriangle,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { AdminProduct } from "../../types/admin-products.types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { AdminActionModal } from "../shared";

export interface ProductQuickStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AdminProduct | null;
  onConfirm: (
    productId: string,
    newStock: number,
    newPrice: number,
    reason: string,
    operatorNote: string
  ) => Promise<void> | void;
}

export function ProductQuickStockModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}: ProductQuickStockModalProps) {
  const [stockInput, setStockInput] = React.useState<number>(0);
  const [priceInput, setPriceInput] = React.useState<number>(0);
  const [reason, setReason] = React.useState<string>("ورود محموله جدید به انبار");
  const [note, setNote] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Sync inputs whenever modal opens with a new product
  React.useEffect(() => {
    if (product) {
      setStockInput(product.stock);
      setPriceInput(product.price);
      setReason("ورود محموله جدید به انبار");
      setNote("");
      setError(null);
    }
  }, [product, isOpen]);

  if (!product) return null;

  const stockDiff = stockInput - product.stock;
  const isPriceChanged = priceInput !== product.price;

  const handleAdjustStock = (delta: number) => {
    setError(null);
    setStockInput((prev) => Math.max(0, prev + delta));
  };

  const handleSubmit = async () => {
    setError(null);
    if (stockInput < 0) {
      setError("موجودی فیزیکی کالا نمی‌تواند عدد منفی باشد.");
      return;
    }
    if (priceInput <= 0) {
      setError("قیمت فروش واحد باید بزرگتر از صفر تومان باشد.");
      return;
    }
    setIsLoading(true);
    try {
      await onConfirm(product.id, stockInput, priceInput, reason, note);
      onClose();
    } catch {
      setError("خطایی در ذخیره تغییرات رخ داد. لطفاً مجدداً تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="تنظیم سریع موجودی و قیمت"
      description={`بروزرسانی مستقیم تعداد کالا در انبار برای «${product.name}»`}
      variant="primary"
      confirmLabel={isLoading ? "در حال ذخیره‌سازی..." : "ثبت تغییرات انبار"}
      cancelLabel="انصراف"
      onConfirm={handleSubmit}
      isLoading={isLoading}
      maxWidth="md"
    >
      <div className="space-y-4 text-right pt-2" dir="rtl">
        {/* پیام خطا */}
        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* خلاصه کالا */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 space-y-1">
          <div className="text-xs text-neutral-400">شناسه و پارت‌نامبر (SKU):</div>
          <div className="text-xs font-mono font-bold text-orange-400">{product.sku}</div>
          <div className="text-xs font-bold text-white mt-1">{product.name}</div>
        </div>

        {/* فیلد موجودی انبار */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-300 block">
            موجودی فیزیکی جدید انبار (عدد):
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjustStock(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="number"
              min="0"
              value={stockInput}
              onChange={(e) => setStockInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="h-10 flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-center text-lg font-mono font-bold text-white focus:border-orange-500 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => handleAdjustStock(1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* کلیدهای تغییر سریع */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => handleAdjustStock(5)}
              className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 cursor-pointer"
            >
              +۵ عدد
            </button>
            <button
              type="button"
              onClick={() => handleAdjustStock(10)}
              className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 cursor-pointer"
            >
              +۱۰ عدد
            </button>
            <button
              type="button"
              onClick={() => handleAdjustStock(25)}
              className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 cursor-pointer"
            >
              +۲۵ عدد
            </button>
            <button
              type="button"
              onClick={() => handleAdjustStock(-5)}
              className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-rose-400 border border-neutral-700 cursor-pointer"
            >
              -۵ عدد
            </button>
          </div>

          {/* نمایش تغییر */}
          <div className="text-center text-xs pt-1">
            {stockDiff === 0 ? (
              <span className="text-neutral-500">موجودی فعلی: {toPersianDigits(product.stock)} عدد (بدون تغییر)</span>
            ) : stockDiff > 0 ? (
              <span className="text-emerald-400 font-bold">
                +{toPersianDigits(stockDiff)} عدد افزایش موجودی (موجودی قبلی: {toPersianDigits(product.stock)})
              </span>
            ) : (
              <span className="text-rose-400 font-bold">
                {toPersianDigits(stockDiff)} عدد کاهش موجودی (موجودی قبلی: {toPersianDigits(product.stock)})
              </span>
            )}
          </div>
        </div>

        {/* فیلد قیمت واحد */}
        <div className="space-y-1.5 border-t border-neutral-800 pt-3">
          <label className="text-xs font-semibold text-neutral-300 block">
            قیمت فروش واحد (تومان):
          </label>
          <div className="relative">
            <input
              type="number"
              step="100000"
              value={priceInput}
              onChange={(e) => setPriceInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-left font-mono font-bold text-white focus:border-orange-500 focus:outline-none"
              dir="ltr"
            />
            <div className="text-xs text-neutral-400 mt-1 flex justify-between">
              <span>معادل: {formatPrice(priceInput)}</span>
              {isPriceChanged && (
                <span className="text-amber-400 font-medium">قیمت بروزرسانی خواهد شد</span>
              )}
            </div>
          </div>
        </div>

        {/* علت تغییر انبار */}
        <div className="space-y-1.5 border-t border-neutral-800 pt-3">
          <label className="text-xs font-semibold text-neutral-300 block">
            علت و بستر ثبت عملیات انبارداری:
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
          >
            <option value="ورود محموله جدید به انبار">ورود محموله جدید به انبار (تامین بار)</option>
            <option value="انبارگردانی و تطبیق فیزیکی">انبارگردانی و تطبیق فیزیکی دوره‌ای</option>
            <option value="مرجوعی کالا از سوی مشتری">مرجوعی کالا از سوی مشتری / لغو فاکتور</option>
            <option value="کسر بابت خرابی یا صدمه در حمل">کسر بابت خرابی یا ضایعات در انبار</option>
            <option value="اصلاح سیستمی موجودی">اصلاح سیستمی موجودی انبار</option>
          </select>
        </div>

        {/* یادداشت انباردار */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 block">
            توضیحات و شماره بارنامه / حواله (اختیاری):
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثال: حواله ورود ۹۸۴۳ از گمرک پیام"
            className="h-9 w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>
    </AdminActionModal>
  );
}
