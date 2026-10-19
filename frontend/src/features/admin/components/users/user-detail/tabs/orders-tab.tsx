"use client";

import * as React from "react";
import Link from "next/link";
import type { AdminUserOrder } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  ShoppingBag,
  Package,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Truck,
  CreditCard,
  ShieldCheck,
  Hash,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { TabPagination } from "../tab-pagination";

interface OrdersTabProps {
  userId: string;
}

export function OrdersTab({ userId }: OrdersTabProps) {
  const [orders, setOrders] = React.useState<AdminUserOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 5;

  const fetchOrders = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserOrders(userId);
      setOrders(data || []);
      if (data && data.length > 0) {
        setExpandedOrderId(data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load user orders:", err);
      setError("خطا در بارگذاری سوابق سفارشات کاربر.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: string, label: string) => {
    const s = status.toLowerCase();
    if (s.includes("delivered") || s.includes("completed") || s.includes("paid")) {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
          {label || "تحویل شده"}
        </span>
      );
    }
    if (s.includes("processing") || s.includes("pending") || s.includes("shipped")) {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold">
          {label || "در حال پردازش"}
        </span>
      );
    }
    if (s.includes("cancel") || s.includes("reject")) {
      return (
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-semibold">
          {label || "لغو شده"}
        </span>
      );
    }
    return (
      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 font-semibold">
        {label || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" dir="rtl">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse flex flex-col gap-3"
          >
            <div className="h-6 w-1/3 bg-neutral-800 rounded-lg" />
            <div className="h-12 w-full bg-neutral-800/60 rounded-xl" />
          </div>
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
          onClick={fetchOrders}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">هیچ سفارشی ثبت نشده است</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          این کاربر تا کنون خریدی در فروشگاه به صورت قطعی نهایی نکرده است.
        </p>
      </div>
    );
  }

  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>مجموع سوابق خرید: <strong className="text-white font-mono">{toPersianDigits(orders.length)}</strong> سفارش</span>
      </div>

      <div className="flex flex-col gap-4">
        {paginatedOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden transition-all duration-200 hover:border-neutral-700"
            >
              {/* Order Header Card */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-neutral-900/70 hover:bg-neutral-900 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <ShoppingBag className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        سفارش شماره {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status, order.statusLabel)}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-neutral-500" />
                        کد رهگیری: <span className="font-mono text-neutral-200">{order.trackingCode}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-neutral-500" />
                        {order.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-[11px] text-neutral-400">مبلغ نهایی پرداختی:</span>
                    <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
                      {formatPrice(order.payableAmount)}
                    </span>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-colors"
                    title="مشاهده جزئیات سفارش در سامانه مدیریت سفارش‌ها"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>مدیریت سفارش</span>
                  </Link>

                  <div className="text-neutral-400 p-1 rounded-lg hover:bg-neutral-800">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-neutral-800/80 bg-neutral-950/40 flex flex-col gap-4">
                  {/* Meta Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/60">
                    <div>
                      <span className="text-neutral-500 block text-[11px]">شیوه پرداخت:</span>
                      <span className="font-medium text-neutral-200 flex items-center gap-1 mt-0.5">
                        <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
                        {order.paymentMethod}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">باربری / ارسال:</span>
                      <span className="font-medium text-neutral-200 flex items-center gap-1 mt-0.5">
                        <Truck className="h-3.5 w-3.5 text-neutral-400" />
                        {order.shippingCarrier || "پست پیشتاز اکسپرس"}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">مبلغ کل اقلام:</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-500 block text-[11px]">تخفیف و مالیات:</span>
                      <span className="font-mono text-neutral-200 mt-0.5 block">
                        تخفیف: {formatPrice(order.discountAmount)} | مالیات: {formatPrice(order.vatTaxAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                        <tr>
                          <th className="py-2.5 px-3">عنوان کالا</th>
                          <th className="py-2.5 px-3">کد کالا (SKU)</th>
                          <th className="py-2.5 px-3 text-center">تعداد</th>
                          <th className="py-2.5 px-3">قیمت واحد</th>
                          <th className="py-2.5 px-3">قیمت کل</th>
                          <th className="py-2.5 px-3">گارانتی و سریال</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {order.items.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-800/20">
                            <td className="py-3 px-3 font-medium text-white max-w-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-center">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="h-full w-full object-contain p-0.5"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Package className="h-4 w-4 text-neutral-600" />
                                  )}
                                </div>
                                <span className="leading-snug">{item.title}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-300">
                              {item.sku || "—"}
                            </td>
                            <td className="py-3 px-3 text-center font-bold font-mono text-white">
                              {toPersianDigits(item.quantity)}
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-300">
                              {formatPrice(item.unitPrice)}
                            </td>
                            <td className="py-3 px-3 font-bold font-mono text-emerald-400">
                              {formatPrice(item.totalPrice)}
                            </td>
                            <td className="py-3 px-3 text-[11px]">
                              {item.warranty && (
                                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  <ShieldCheck className="h-3 w-3" />
                                  {item.warranty}
                                </span>
                              )}
                              {item.serialNumbers && item.serialNumbers.length > 0 && (
                                <div className="font-mono text-neutral-400 mt-1">
                                  سریال: {item.serialNumbers.join(", ")}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Link to order details in admin */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800/60 text-xs">
                    <span className="text-neutral-400">
                      ثبت شده در سامانه با شناسه یکتای سفارش: <strong className="font-mono text-emerald-400">{order.id}</strong>
                    </span>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>مشاهده پرونده کامل سفارش در مدیریت سفارش‌ها</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <TabPagination
        currentPage={currentPage}
        totalItems={orders.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
