"use client";

import * as React from "react";
import type { AdminUserCart } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  ShoppingCart,
  Package,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface CartTabProps {
  userId: string;
}

export function CartTab({ userId }: CartTabProps) {
  const [cart, setCart] = React.useState<AdminUserCart | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCart = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserCart(userId);
      setCart(data);
    } catch (err: any) {
      console.error("Failed to load user cart:", err);
      setError("خطا در بارگذاری اطلاعات سبد خرید کاربر.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse flex flex-col gap-4" dir="rtl">
        <div className="h-6 w-48 bg-neutral-800 rounded-lg" />
        <div className="h-20 w-full bg-neutral-800/60 rounded-xl" />
        <div className="h-20 w-full bg-neutral-800/60 rounded-xl" />
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
          onClick={fetchCart}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">سبد خرید فعلی کاربر خالی است</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          در حال حاضر هیچ قلم کالایی در سبد خرید معلق یا فعال این کاربر قرار ندارد.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      {/* Summary Card */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">محتویات سبد خرید زنده کاربر</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                {toPersianDigits(cart.totalItems)} قلم کالا
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <span>آخرین به‌روزرسانی سبد: {cart.updatedAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-left sm:text-right" dir="ltr">
          <div className="flex flex-col sm:items-end">
            <span className="text-[11px] text-neutral-400">ارزش کل اقلام سبد:</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {formatPrice(cart.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-neutral-900/90 border-b border-neutral-800 text-neutral-400 font-semibold">
              <tr>
                <th className="py-3 px-4">کالا</th>
                <th className="py-3 px-4">کد کالا (SKU)</th>
                <th className="py-3 px-4 text-center">وضعیت انبار</th>
                <th className="py-3 px-4 text-center">تعداد</th>
                <th className="py-3 px-4">قیمت واحد</th>
                <th className="py-3 px-4">قیمت کل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {cart.items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700/60 overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </div>
                      <span className="font-semibold text-white max-w-xs line-clamp-2">
                        {item.title}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-neutral-300">
                    {item.sku || "—"}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {item.inStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>موجود در انبار</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-medium">
                        <XCircle className="h-3 w-3" />
                        <span>عدم موجودی</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold font-mono text-white">
                    {toPersianDigits(item.quantity)} عدد
                  </td>

                  <td className="py-3.5 px-4 font-mono text-neutral-300">
                    {formatPrice(item.unitPrice)}
                  </td>

                  <td className="py-3.5 px-4 font-bold font-mono text-emerald-400">
                    {formatPrice(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
