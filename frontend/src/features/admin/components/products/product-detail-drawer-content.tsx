"use client";

import * as React from "react";
import {
  Package,
  Layers,
  ShieldCheck,
  DollarSign,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Copy,
  Check,
  Building2,
  TrendingUp,
  Cpu,
  Clock,
  Edit3,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import type { AdminProduct } from "../../types/admin-products.types";
import { PRODUCT_CATEGORY_LABELS, PRODUCT_STATUS_CONFIG } from "../../types/admin-products.types";
import { cn, formatPrice, toPersianDigits, resolveProductImageUrl } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

export interface ProductDetailDrawerContentProps {
  product: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onQuickStock: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
  onToggleStatus: (product: AdminProduct) => void;
}

export function ProductDetailDrawerContent({
  product,
  onEdit,
  onQuickStock,
  onDelete,
  onToggleStatus,
}: ProductDetailDrawerContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [copiedSku, setCopiedSku] = React.useState(false);
  const [failedImages, setFailedImages] = React.useState<Record<number, boolean>>({});

  const statusConfig = PRODUCT_STATUS_CONFIG[product.status] || PRODUCT_STATUS_CONFIG.active;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
  const isOutOfStock = product.stock === 0;
  const sellableStock = Math.max(0, product.stock - product.reservedStock);

  // Profit calculation
  const grossProfit = product.price - product.costPrice;
  const profitMargin = product.price > 0 ? Math.round((grossProfit / product.price) * 100) : 0;

  const handleCopySku = async () => {
    let success = false;
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(product.sku);
        success = true;
      }
    } catch {
      // fallback
    }

    if (!success && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = product.sku;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 2000);
    }
  };

  const currentImageSrc = product.images?.[selectedImageIndex] || product.images?.[0];
  const isCurrentImageFailed = failedImages[selectedImageIndex];

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* ─── ۱. گالری تصاویر و سربرگ محصول ──────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/60 p-4 space-y-4">
        {/* تصویر اصلی */}
        <div className="relative aspect-video sm:aspect-2/1 w-full overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          {currentImageSrc && !isCurrentImageFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveProductImageUrl(currentImageSrc)}
              alt={product.name}
              onError={() => setFailedImages((prev) => ({ ...prev, [selectedImageIndex]: true }))}
              className="h-full w-full object-cover transition-all duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-500 gap-2">
              <Package className="h-10 w-10 stroke-1" />
              <span className="text-xs">تصویر در دسترس نیست</span>
            </div>
          )}

          {/* بج‌های روی تصویر */}
          <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 z-10">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-sm",
                statusConfig.badgeClasses
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotColor)} />
              {statusConfig.label}
            </span>
            {product.isSpecialOffer && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 backdrop-blur-md shadow-sm">
                🔥 فروش ویژه
              </span>
            )}
            {product.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-sm">
                ⭐ کالای برگزیده
              </span>
            )}
          </div>
        </div>

        {/* لیست تصاویر بندانگشتی (Thumbnail list) */}
        {product.images && product.images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer",
                  selectedImageIndex === idx
                    ? "border-orange-500 ring-2 ring-orange-500/30 opacity-100"
                    : "border-neutral-800 opacity-60 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveProductImageUrl(img)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* اطلاعات شناسه و پارت نامبر */}
        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/20">
              {PRODUCT_CATEGORY_LABELS[product.category] || product.category}
            </span>
            <span className="text-xs font-semibold text-neutral-300 bg-neutral-800 px-2.5 py-0.5 rounded-md border border-neutral-700">
              برند: {product.brand}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            {product.name}
          </h3>

          {/* پارت‌نامبر / SKU با کپی سریع */}
          <div className="mt-2 flex items-center justify-between bg-neutral-900/90 rounded-xl px-3 py-2 border border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Tag className="h-3.5 w-3.5 text-neutral-500" />
              <span>پارت‌نامبر (SKU):</span>
              <span className="font-mono font-bold text-neutral-200 tracking-wider" dir="ltr">
                {product.sku}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopySku}
              className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              {copiedSku ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>کپی</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* برچسب‌ها و نشان‌ها */}
        {product.badges && product.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {product.badges.map((b, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-neutral-800/80 text-neutral-300 px-2.5 py-0.5 rounded-md border border-neutral-700/60"
              >
                #{b}
              </span>
            ))}
          </div>
        )}

        {product.shortDescription && (
          <p className="text-xs leading-relaxed text-neutral-300 bg-black/20 p-3 rounded-xl border border-white/5">
            {product.shortDescription}
          </p>
        )}
      </div>

      {/* ─── ۲. داشبورد موجودی فیزیکی و انبارداری ────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--theme-border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-orange-400" />
            <h4 className="text-sm font-bold text-white">پایش موجودی فیزیکی و انبارداری</h4>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onQuickStock(product)}
            className="text-xs h-8 px-2.5 border-orange-500/30 text-orange-400 hover:bg-orange-500/10 cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 ml-1" />
            تغییر سریع موجودی
          </Button>
        </div>

        {/* کارت‌های سه‌گانه انبار */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          {/* موجودی کل فیزیکی */}
          <div
            className={cn(
              "rounded-xl p-3 border",
              isOutOfStock
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : isLowStock
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            )}
          >
            <div className="text-[10px] sm:text-xs text-neutral-400 font-medium">موجودی کل انبار</div>
            <div className="text-lg sm:text-2xl font-black mt-1 font-mono">
              {toPersianDigits(product.stock)}
            </div>
            <div className="text-[10px] mt-0.5">عدد فیزیکی</div>
          </div>

          {/* رزرو شده */}
          <div className="rounded-xl p-3 border border-neutral-800 bg-neutral-900/60 text-neutral-300">
            <div className="text-[10px] sm:text-xs text-neutral-400 font-medium">رزرو فاکتورها</div>
            <div className="text-lg sm:text-2xl font-black mt-1 font-mono text-purple-400">
              {toPersianDigits(product.reservedStock)}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">در انتظار ارسال</div>
          </div>

          {/* قابل فروش خالص */}
          <div className="rounded-xl p-3 border border-neutral-800 bg-neutral-900/60 text-neutral-300">
            <div className="text-[10px] sm:text-xs text-neutral-400 font-medium">موجودی آزاد</div>
            <div className="text-lg sm:text-2xl font-black mt-1 font-mono text-sky-400">
              {toPersianDigits(sellableStock)}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">آماده سفارش</div>
          </div>
        </div>

        {/* نوار وضعیت سلامت انبار */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>شاخص آستانه موجودی ایمن:</span>
            <span className="font-semibold text-neutral-200">
              حداقل هشدار: {toPersianDigits(product.minStockAlert)} عدد
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{
                width: `${
                  isOutOfStock
                    ? 0
                    : Math.min(
                        100,
                        Math.max(
                          12,
                          Math.round(
                            (product.stock / Math.max(product.minStockAlert * 3, 10)) * 100
                          )
                        )
                      )
                }%`,
              }}
            />
          </div>

          {isOutOfStock ? (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium pt-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>هشدار: کالای فوق کاملاً ناموجود است و امکان ثبت سفارش آنلاین وجود ندارد.</span>
            </div>
          ) : isLowStock ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium pt-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>
                توجه: موجودی به زیر آستانه ایمن ({toPersianDigits(product.minStockAlert)} عدد) رسیده
                است. سفارش‌گذاری مجدد با تامین‌کننده پیشنهاد می‌شود.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>وضعیت انبار سبز است و موجودی پاسخگوی سفارش‌های سازمانی و تک می‌باشد.</span>
            </div>
          )}
        </div>

        {/* موقعیت قفسه و انبار */}
        <div className="flex items-center justify-between rounded-xl bg-neutral-900/80 px-3 py-2.5 border border-neutral-800 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Building2 className="h-4 w-4 text-sky-400" />
            <span>محل نگهداری فیزیکی:</span>
          </div>
          <span className="font-bold text-white bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-700">
            {product.warehouseLocation || "انبار مرکزی"}
          </span>
        </div>
      </div>

      {/* ─── ۳. قیمت‌گذاری، تخفیف‌ها و حاشیه سود ────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--theme-border-color)] pb-3">
          <DollarSign className="h-4 w-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-white">ساختار قیمت‌گذاری و سودآوری ریالی</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* قیمت فروش */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
            <div className="text-xs text-neutral-400">قیمت فروش به مشتری (تومان)</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                <span className="line-through">{formatPrice(product.originalPrice)}</span>
                <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded font-bold">
                  %{toPersianDigits(product.discountPercent || 0)} تخفیف
                </span>
              </div>
            )}
          </div>

          {/* بهای تمام شده و حاشیه سود */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-1">
            <div className="text-xs text-neutral-400">بهای تمام‌شده انبار / حاشیه سود</div>
            <div className="text-sm font-semibold text-neutral-200 font-mono">
              {formatPrice(product.costPrice)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>
                سود ناخالص: {formatPrice(grossProfit)} ({toPersianDigits(profitMargin)}%)
              </span>
            </div>
          </div>
        </div>

        {/* جدول قیمت‌گذاری پلکانی برای پروژه‌ها و خریدهای تعداد بالا */}
        {product.tieredPricing && product.tieredPricing.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-neutral-300">
              قیمت‌گذاری پلکانی برای سفارش‌های تجمیعی و B2B:
            </div>
            <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 text-xs">
              <table className="w-full text-right">
                <thead className="bg-neutral-900/90 text-neutral-400 text-[11px] border-b border-neutral-800">
                  <tr>
                    <th className="p-2">طرح همکاری</th>
                    <th className="p-2">حداقل تعداد</th>
                    <th className="p-2">درصد تخفیف</th>
                    <th className="p-2">قیمت هر واحد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {product.tieredPricing.map((tier, idx) => {
                    const tierPrice = Math.round(product.price * (1 - tier.discountPercent / 100));
                    return (
                      <tr key={idx} className="hover:bg-neutral-800/30">
                        <td className="p-2 text-white font-medium">{tier.label}</td>
                        <td className="p-2 text-neutral-300 font-mono">
                          {toPersianDigits(tier.minQuantity)} عدد به بالا
                        </td>
                        <td className="p-2 text-emerald-400 font-bold font-mono">
                          %{toPersianDigits(tier.discountPercent)}
                        </td>
                        <td className="p-2 text-white font-mono">{formatPrice(tierPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── ۴. گارانتی، اصالت و خدمات پس از فروش ─────────────────────────── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-[var(--theme-border-color)] pb-3">
          <ShieldCheck className="h-4 w-4 text-sky-400" />
          <h4 className="text-sm font-bold text-white">گارانتی و تضمین خدمات فنی ققنوس</h4>
        </div>

        <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 text-xs leading-relaxed text-sky-200">
          <div className="font-bold mb-1 flex items-center gap-1.5 text-sky-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{product.warranty || "گارانتی رسمی و ضمانت سلامت فیزیکی"}</span>
          </div>
          پوشش گارانتی شامل تعویض قطعه معیوب در صورت وجود ایراد کارخانه‌ای و امکان استعلام سریال‌نامبر در سامانه RMA می‌باشد.
        </div>
      </div>

      {/* ─── ۵. مشخصات فنی سخت‌افزاری ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-[var(--theme-border-color)] pb-3">
          <Cpu className="h-4 w-4 text-purple-400" />
          <h4 className="text-sm font-bold text-white">مشخصات کلیدی و دیاگرام فنی</h4>
        </div>

        {/* لیست مشخصات سریع */}
        {product.specs && product.specs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {product.specs.map((spec, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                <span className="font-mono">{spec}</span>
              </div>
            ))}
          </div>
        )}

        {/* ویژگی‌های داینامیک اختصاصی */}
        {product.features && product.features.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-neutral-300">قابلیت‌ها و ویژگی‌های فنی اختصاصی:</div>
            <div className="grid grid-cols-1 gap-2">
              {product.features.map((feat) => (
                <div
                  key={feat.id}
                  className="flex items-start gap-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-300"
                >
                  {feat.iconUrl ? (
                    <img
                      src={resolveProductImageUrl(feat.iconUrl)}
                      alt={feat.title}
                      className="w-5 h-5 object-contain shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-xs">{feat.title}</div>
                    <div className="text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                      {feat.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* جداول دسته‌بندی مشخصات */}
        {product.specGroups && product.specGroups.length > 0 && (
          <div className="space-y-3 pt-2">
            {product.specGroups.map((group, gIdx) => (
              <div
                key={gIdx}
                className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 space-y-2 text-xs"
              >
                <div className="font-bold text-neutral-300 border-b border-neutral-800 pb-1.5">
                  {group.category}
                </div>
                <div className="divide-y divide-neutral-800/60">
                  {group.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between py-1.5 text-neutral-400 text-xs"
                    >
                      <span>{item.label}</span>
                      <span className="font-semibold text-neutral-200" dir="ltr">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── ۶. لاگ گردش موجودی و تاریخچه ──────────────────────────────────── */}
      {product.inventoryLogs && product.inventoryLogs.length > 0 && (
        <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-[var(--theme-border-color)] pb-3">
            <Clock className="h-4 w-4 text-orange-400" />
            <h4 className="text-sm font-bold text-white">آخرین سوابق ورود و خروج انبار</h4>
          </div>

          <div className="space-y-2 text-xs">
            {product.inventoryLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md font-bold text-[10px]",
                      log.type === "in"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    )}
                  >
                    {log.type === "in" ? "+ ورود" : "- خروج"}
                  </span>
                  <div>
                    <div className="text-neutral-200 font-medium">{log.reason}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">
                      توسط: {log.operator} • تاریخ: {log.date}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-mono font-bold text-white">
                  {toPersianDigits(log.quantity)} عدد
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── ۷. نوار عملیات پایین کشو ──────────────────────────────────────── */}
      <div className="sticky bottom-0 pt-4 bg-[var(--theme-surface)]/95 backdrop-blur-md border-t border-[var(--theme-border-color)] flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => onEdit(product)}
            className="bg-orange-600 hover:bg-orange-500 text-white text-xs h-9 px-4 cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5 ml-1.5" />
            ویرایش کامل مشخصات
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onToggleStatus(product)}
            className="text-xs h-9 px-3 border-neutral-700 hover:bg-neutral-800 cursor-pointer"
          >
            {product.status === "active" ? "تغییر به پیش‌نویس" : "فعال‌سازی در کاتالوگ"}
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => onDelete(product)}
          className="text-xs h-9 px-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5 ml-1" />
          حذف این کالا
        </Button>
      </div>
    </div>
  );
}
