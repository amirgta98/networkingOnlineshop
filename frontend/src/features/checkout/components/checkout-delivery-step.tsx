"use client";

import * as React from "react";
import {
  Truck,
  Zap,
  Package,
  Building2,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useCheckout } from "../hooks/use-checkout";
import { DEFAULT_DELIVERY_METHODS } from "../api/checkout-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

const TIME_SLOTS = [
  { id: "morning", label: "صبح (ساعت ۹:۰۰ الی ۱۳:۰۰)", description: "تحویل قبل از ظهر در ساعات اداری" },
  { id: "afternoon", label: "عصر (ساعت ۱۴:۰۰ الی ۱۸:۰۰)", description: "تحویل مناسب شرکت‌ها و دیتاسنترها" },
  { id: "evening", label: "شب (ساعت ۱۹:۰۰ الی ۲۲:۰۰)", description: "تحویل شیفت عصر و پروژه‌های شبانه" },
];

export function CheckoutDeliveryStep() {
  const {
    deliveryMethodId,
    setDeliveryMethodId,
    deliveryTimeSlot,
    setDeliveryTimeSlot,
    financials,
  } = useCheckout();

  const getMethodIcon = (iconName: string) => {
    switch (iconName) {
      case "zap":
        return <Zap className="h-5 w-5 text-amber-400" />;
      case "truck":
        return <Truck className="h-5 w-5 text-orange-400" />;
      case "package":
        return <Package className="h-5 w-5 text-blue-400" />;
      case "building2":
        return <Building2 className="h-5 w-5 text-emerald-400" />;
      default:
        return <Truck className="h-5 w-5 text-orange-400" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── 1. Delivery Method Cards ──────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-500" />
            <span>انتخاب شیوه ارسال تجهیزات شبکه</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            بسته‌بندی ضدضربه و بیمه حمل
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {DEFAULT_DELIVERY_METHODS.map((method) => {
            const isSelected = deliveryMethodId === method.id;
            const isFree =
              method.cost === 0 ||
              (method.freeThreshold && financials.subtotal >= method.freeThreshold);

            return (
              <div
                key={method.id}
                onClick={() => setDeliveryMethodId(method.id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none text-right flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500/30"
                    : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-2xl shrink-0 transition-colors ${
                      isSelected
                        ? "bg-orange-500/20 border border-orange-500/40"
                        : "bg-neutral-900 border border-neutral-800"
                    }`}
                  >
                    {getMethodIcon(method.iconName)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        {method.title}
                      </span>
                      {method.isExpress && (
                        <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          اکسپرس
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-300 font-medium">
                      {method.subtitle}
                    </p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </div>

                {/* Price and Timing Info */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-neutral-800/80 pt-3 sm:pt-0 shrink-0 gap-1">
                  <div className="text-left sm:text-right">
                    {isFree ? (
                      <span className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-lg inline-block">
                        ارسال رایگان
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-white">
                        {formatPrice(method.cost)}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-400" />
                    <span>{method.estimatedDeliveryTime}</span>
                  </span>

                  {isSelected && (
                    <span className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-orange-400 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      انتخاب شده
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. Delivery Time Slot ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>بازه زمانی مطلوب جهت تحویل مرسوله</span>
          </h3>
          <span className="text-[11px] text-neutral-400">هماهنگی تلفنی قبل از اعزام سفیر</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIME_SLOTS.map((slot) => {
            const isSelected = deliveryTimeSlot === slot.id;
            return (
              <div
                key={slot.id}
                onClick={() => setDeliveryTimeSlot(slot.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none text-right ${
                  isSelected
                    ? "border-orange-500 bg-orange-950/25 shadow-md shadow-orange-950/40 ring-1 ring-orange-500/30"
                    : "border-neutral-800 bg-neutral-900/80 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{slot.label}</span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-orange-400" />}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {slot.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
