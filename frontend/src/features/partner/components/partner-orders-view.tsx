"use client";

import * as React from "react";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  MapPin,
  ExternalLink,
  Download,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { MOCK_PARTNER_ORDERS } from "../data/mock-partner-data";
import type { PartnerOrder } from "../types/partner.types";

export function PartnerOrdersView() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<PartnerOrder | null>(null);

  const filteredOrders = React.useMemo(() => {
    return MOCK_PARTNER_ORDERS.filter((order) => {
      const matchSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTab = activeTab === "all" || order.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [searchQuery, activeTab]);

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">سفارش‌ها و مرسولات شرکتی</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                رهگیری سفارش‌های حجیم پروژه‌ای، بارنامه‌های باربری و تخصیص تجهیزات از انبار مرکزی
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
            مجموع سفارش‌ها: <strong className="font-mono text-white">{toPersianDigits(MOCK_PARTNER_ORDERS.length)}</strong> فقره
          </span>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--theme-surface)] p-4 rounded-2xl border border-[var(--theme-border-color)]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "همه سفارش‌ها" },
            { id: "shipping", label: "در حال حمل باربری" },
            { id: "warehouse_allocated", label: "تخصیص انبار" },
            { id: "delivered", label: "تحویل قطعی" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="جستجوی شماره سفارش یا نام پروژه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-sm hover:border-sky-500/30 transition-all flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono font-bold text-sm text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-xl border border-sky-500/20">
                  {order.orderNumber}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  تاریخ ثبت: {toPersianDigits(order.date)}
                </span>
                <span className="text-xs text-neutral-400">
                  اقلام: <strong className="text-white">{toPersianDigits(order.itemsCount)}</strong> قطعه
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border bg-sky-500/10 text-sky-300 border-sky-500/30 font-medium">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>{order.statusLabel}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="text-neutral-400">عنوان پروژه و تحویل‌گیرنده:</span>
                <span className="text-white font-bold">{order.projectTitle}</span>
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-sky-400 shrink-0" />
                  <span>{order.siteName}</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-neutral-400">روش تسویه حساب:</span>
                <span className="text-neutral-200 font-medium">{order.paymentLabel}</span>
                <span className="text-[11px] text-neutral-400">فاکتور رسمی سامانه مودیان صادر شد</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-neutral-400">مبلغ کل فاکتور (با ارزش افزوده):</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {formatPrice(order.totalAmount)}
                </span>
                {order.waybillNumber && (
                  <span className="text-[11px] text-neutral-400 font-mono">
                    بارنامه: <strong className="text-white">{order.waybillNumber}</strong> ({order.carrier})
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-neutral-400">
                ناوگان حمل اختصاصی ققنوس آکادمی — تحویل با بیمه‌نامه کامل تجهیزات شبکه
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-neutral-700 text-neutral-300 hover:text-white"
                  onClick={() => alert(`دانلود پیش‌فاکتور و حواله خروج انبار برای ${order.orderNumber}`)}
                >
                  <Download className="h-3.5 w-3.5 ml-1.5 text-neutral-400" />
                  <span>حواله انبار</span>
                </Button>

                <Button
                  size="sm"
                  className="h-8 text-xs bg-sky-600 hover:bg-sky-500 text-white"
                  onClick={() => setSelectedOrder(order)}
                >
                  <span>جزئیات مرسوله</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-sky-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  جزئیات مرسوله {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1.5">
                <span className="text-neutral-400">پروژه:</span>
                <span className="text-white font-bold">{selectedOrder.projectTitle}</span>
                <span className="text-neutral-400">مقصد: {selectedOrder.siteName}</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">وضعیت حمل:</span>
                <span className="text-sky-300 font-bold">{selectedOrder.statusLabel}</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">مبلغ کل فاکتور:</span>
                <span className="text-emerald-400 font-black font-mono text-sm">
                  {formatPrice(selectedOrder.totalAmount)}
                </span>
              </div>

              {selectedOrder.waybillNumber && (
                <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-1">
                  <span className="text-neutral-400">شماره بارنامه باربری:</span>
                  <span className="font-mono text-white font-bold">{selectedOrder.waybillNumber}</span>
                  <span className="text-[11px] text-neutral-400">شرکت حمل: {selectedOrder.carrier}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedOrder(null)}
              >
                بستن پنجره
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
