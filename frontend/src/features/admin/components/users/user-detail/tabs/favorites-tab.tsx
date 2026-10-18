"use client";

import * as React from "react";
import type { AdminUserFavorite } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  Heart,
  Package,
  AlertCircle,
  RefreshCw,
  Star,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { TabPagination } from "../tab-pagination";

interface FavoritesTabProps {
  userId: string;
}

export function FavoritesTab({ userId }: FavoritesTabProps) {
  const [favorites, setFavorites] = React.useState<AdminUserFavorite[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 6;

  const fetchFavorites = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserFavorites(userId);
      setFavorites(data || []);
    } catch (err: any) {
      console.error("Failed to load user favorites:", err);
      setError("خطا در بارگذاری لیست نشان‌شده‌ها و علاقه‌مندی‌های کاربر.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse h-48"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-neutral-300 font-medium">{error}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchFavorites}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <Heart className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">لیست علاقه‌مندی‌ها خالی است</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          این کاربر تا کنون محصولی را در لیست نشان‌شده‌ها یا کالاهای مورد علاقه خود ثبت نکرده است.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>کالاهای نشان‌شده توسط کاربر: <strong className="text-white font-mono">{toPersianDigits(favorites.length)}</strong> مورد</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites
          .slice((currentPage - 1) * pageSize, currentPage * pageSize)
          .map((fav) => (
          <div
            key={fav.id}
            className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-3">
              {/* Image & Header */}
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700/60 overflow-hidden">
                  {fav.imageUrl ? (
                    <img
                      src={fav.imageUrl}
                      alt={fav.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-7 w-7" />
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2">
                    {fav.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    {fav.brand && <span>{fav.brand}</span>}
                    {fav.sku && <span className="font-mono text-neutral-500">({fav.sku})</span>}
                  </div>
                </div>
              </div>

              {/* Status and Rating */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-mono font-bold text-[11px]">
                    {toPersianDigits(fav.ratingAvg || 5)}
                  </span>
                </div>

                <div>
                  {fav.inStock ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>موجود در انبار</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-medium inline-flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      <span>ناموجود</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400">قیمت محصول:</span>
                <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                  {formatPrice(fav.basePrice)}
                </span>
              </div>

              <a
                href={`/products/${fav.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
                title="مشاهده صفحه کالا"
              >
                <span>مشاهده</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <TabPagination
        currentPage={currentPage}
        totalItems={favorites.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
