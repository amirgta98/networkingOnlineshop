"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Bell,
  BellOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useDashboardWishlist } from "../hooks/use-dashboard-wishlist";
import { WishlistItem } from "../types/wishlist.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardFilterBar,
  DashboardStatusBadge,
  DashboardEmptyState,
  ConfirmDialog,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function WishlistView() {
  const {
    items,
    isLoaded,
    removeItem,
    toggleNotification,
    moveToCart,
    moveAllAvailableToCart,
    clearAll,
  } = useDashboardWishlist();

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [addedItemIds, setAddedItemIds] = React.useState<Record<string, boolean>>({});
  const [bulkSuccessMsg, setBulkSuccessMsg] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleAddToCart = (item: WishlistItem) => {
    moveToCart(item);
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  const handleMoveAll = () => {
    const movedCount = moveAllAvailableToCart();
    if (movedCount > 0) {
      setBulkSuccessMsg(`${toPersianDigits(movedCount)} قلم کالای موجود با موفقیت به سبد خرید افزوده شد.`);
      setTimeout(() => setBulkSuccessMsg(null), 3500);
    }
  };

  // Filtered items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === "in_stock" && !item.product.inStock) return false;
      if (activeTab === "switches" && item.product.category !== "switches") return false;
      if (activeTab === "routers" && item.product.category !== "routers") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.product.name.toLowerCase().includes(q);
        const matchBrand = item.product.brand?.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand) return false;
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  // Statistics
  const stats = React.useMemo(() => {
    const inStockCount = items.filter((i) => i.product.inStock).length;
    const discountedCount = items.filter((i) => Boolean(i.product.discountPercent && i.product.discountPercent > 0)).length;
    return { inStockCount, discountedCount };
  }, [items]);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="لیست علاقه‌مندی‌ها و پروژه‌ها"
        description="ذخیره تجهیزات شبکه نشان‌شده، رصد هوشمند نوسانات قیمت، اعلان پیامکی شارژ موجودی انبار و افزودن یکپارچه به سبد خرید"
        icon={Heart}
        badge={`${toPersianDigits(items.length)} کالای نشان‌شده`}
        badgeVariant="purple"
        actions={
          items.length > 0 && stats.inStockCount > 0 ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleMoveAll}
              className="text-xs gap-1.5 font-bold cursor-pointer shadow-md shadow-orange-500/15"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>انتقال کالاهای موجود به سبد ({toPersianDigits(stats.inStockCount)})</span>
            </Button>
          ) : undefined
        }
      />

      {bulkSuccessMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{bulkSuccessMsg}</span>
          </div>
          <Link href="/checkout" className="text-emerald-300 font-bold hover:underline">
            مشاهده سبد خرید و تسویه ←
          </Link>
        </div>
      )}

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="اقلام ذخیره‌شده در لیست"
          value={
            <span>
              {toPersianDigits(items.length)}{" "}
              <span className="text-xs font-normal text-neutral-400">کالا</span>
            </span>
          }
          subtitle="محصولات منتخب جهت سفارش در پروژه"
          icon={Heart}
          variant="purple"
        />

        <DashboardMetricCard
          title="موجود در انبار مرکزی ققنوس آکادمی"
          value={
            <span>
              {toPersianDigits(stats.inStockCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">آماده تحویل</span>
            </span>
          }
          subtitle="ارسال فوری ظرف ۲ ساعت در تهران"
          icon={CheckCircle2}
          variant="emerald"
        />

        <DashboardMetricCard
          title="دارای تخفیف ویژه سازمانی"
          value={
            <span>
              {toPersianDigits(stats.discountedCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">پیشنهاد تخفیف‌دار</span>
            </span>
          }
          subtitle="قیمت‌های رقابتی با گارانتی اصلی"
          icon={Tag}
          variant="orange"
        />
      </div>

      {/* ── 3. Filter Bar ─────────────────────────────────────────── */}
      <DashboardFilterBar
        tabs={[
          { key: "all", label: "همه اقلام", count: items.length },
          { key: "in_stock", label: "فقط موجود در انبار", count: stats.inStockCount },
          { key: "switches", label: "سوئیچ‌های شبکه" },
          { key: "routers", label: "روتر و وایرلس" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="جستجو بر اساس نام کالا، برند..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── 4. Wishlist Grid ──────────────────────────────────────── */}
      {filteredItems.length === 0 ? (
        <DashboardEmptyState
          icon={Heart}
          title="لیست علاقه‌مندی‌ها خالی است"
          description={
            searchQuery
              ? "کالایی با این نام در لیست ذخیره نشده است."
              : "هنوز کالایی را نشان نکرده‌اید. می‌توانید هنگام مرور کاتالوگ، تجهیزات مورد نیاز پروژه را با زدن نشان قلب ذخیره نمایید."
          }
          actionLabel="مشاهده کاتالوگ محصولات"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isAdded = Boolean(addedItemIds[item.id]);
            const prod = item.product;

            return (
              <div
                key={item.id}
                className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-xs hover:border-neutral-700/80 transition-all p-5 flex flex-col justify-between gap-4 text-right"
              >
                {/* Top Section */}
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                    <Image
                      src={prod.images[0] || "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80"}
                      alt={prod.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-neutral-400">
                        {prod.brand || "تجهیزات شبکه"}
                      </span>
                      <DashboardStatusBadge
                        label={prod.inStock ? "موجود در انبار" : "ناموجود"}
                        variant={prod.inStock ? "success" : "neutral"}
                        size="sm"
                      />
                    </div>

                    <Link
                      href={`/products/${prod.slug || prod.id}`}
                      className="text-xs sm:text-sm font-bold text-[var(--theme-foreground)] hover:text-orange-400 transition-colors line-clamp-2"
                    >
                      {prod.name}
                    </Link>

                    {item.notes && (
                      <p className="text-[11px] text-neutral-400 bg-neutral-900/60 p-1.5 rounded-lg border border-neutral-800/80 line-clamp-1 mt-1">
                        یادداشت: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Notification Toggles */}
                <div className="p-3 rounded-2xl bg-neutral-950/50 border border-neutral-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center justify-between sm:block">
                    <span className="text-[11px] text-neutral-400 block sm:mb-0.5">قیمت روز:</span>
                    <span className="font-mono font-bold text-sm sm:text-base text-[var(--theme-foreground)]">
                      {formatPrice(prod.price)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/60">
                    {/* Restock Notification Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleNotification(item.id, "notifyOnRestock")}
                      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 sm:py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer border ${
                        item.notifyOnRestock
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-neutral-300"
                      }`}
                      title="اطلاع‌رسانی پیامکی هنگام موجود شدن کالا در انبار"
                    >
                      <Bell className="h-3 w-3 shrink-0" />
                      <span>هشدار موجودی</span>
                    </button>

                    {/* Price Drop Notification Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleNotification(item.id, "notifyOnPriceDrop")}
                      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 sm:py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer border ${
                        item.notifyOnPriceDrop
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-neutral-300"
                      }`}
                      title="اطلاع‌رسانی پیامکی هنگام کاهش قیمت کالا"
                    >
                      <Tag className="h-3 w-3 shrink-0" />
                      <span>هشدار تخفیف</span>
                    </button>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-neutral-800/60">
                  <button
                    type="button"
                    onClick={() => setDeletingId(item.id)}
                    className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer py-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>حذف از نشان‌ها</span>
                  </button>

                  <Button
                    variant={isAdded ? "accent" : "default"}
                    size="sm"
                    disabled={!prod.inStock}
                    onClick={() => handleAddToCart(item)}
                    className="text-xs gap-1.5 font-bold cursor-pointer shadow-sm w-full sm:w-auto"
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>به سبد اضافه شد ✓</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>{prod.inStock ? "افزودن به سبد خرید" : "ناموجود در انبار"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            removeItem(deletingId);
            setDeletingId(null);
          }
        }}
        title="حذف از لیست علاقه‌مندی‌ها"
        message="آیا مایل به حذف این کالا از لیست نشان‌شده‌های خود هستید؟"
        confirmLabel="حذف کالا"
        cancelLabel="انصراف"
        variant="danger"
      />
    </div>
  );
}
