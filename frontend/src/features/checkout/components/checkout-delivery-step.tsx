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
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  MapPin,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  Info,
  Plane,
  Bike,
  Box,
} from "lucide-react";
import { useCheckout } from "../hooks/use-checkout";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { getEffectiveMethodDetails, isMethodAvailableForProvince } from "../api/shipping-api";

export function CheckoutDeliveryStep() {
  const {
    shippingAddress,
    deliveryMethodId,
    setDeliveryMethodId,
    deliveryDate,
    setDeliveryDate,
    deliveryDateJalali,
    setDeliveryDateJalali,
    deliveryTimeSlot,
    setDeliveryTimeSlot,
    specialDeliveryNotes,
    setSpecialDeliveryNotes,
    liftRequired,
    setLiftRequired,
    availableDeliveryMethods,
    isLoadingDeliveryMethods,
    deliveryMethodsError,
    availableScheduleDays,
    isLoadingSchedule,
    refreshShippingData,
    financials,
    errors,
  } = useCheckout();

function CarrierIconItem({
  iconName,
  iconUrl,
  title,
}: {
  iconName: string;
  iconUrl?: string | null;
  title?: string;
}) {
  const [imgError, setImgError] = React.useState(false);

  if (iconUrl && !imgError) {
    return (
      <img
        src={iconUrl}
        alt={title || "آیکون شیوه ارسال"}
        className="h-6 w-6 object-contain rounded"
        onError={() => setImgError(true)}
      />
    );
  }
  switch (iconName) {
    case "zap":
      return <Zap className="h-5 w-5 text-amber-400" />;
    case "truck":
      return <Truck className="h-5 w-5 text-orange-400" />;
    case "package":
      return <Package className="h-5 w-5 text-blue-400" />;
    case "building2":
      return <Building2 className="h-5 w-5 text-emerald-400" />;
    case "plane":
      return <Plane className="h-5 w-5 text-sky-400" />;
    case "bike":
      return <Bike className="h-5 w-5 text-teal-400" />;
    case "box":
      return <Box className="h-5 w-5 text-violet-400" />;
    case "clock":
      return <Clock className="h-5 w-5 text-amber-400" />;
    case "shield-check":
      return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
    case "map-pin":
      return <MapPin className="h-5 w-5 text-rose-400" />;
    default:
      return <Truck className="h-5 w-5 text-orange-400" />;
  }
}

  const getSlotIcon = (slotId: string) => {
    switch (slotId) {
      case "morning":
        return <Sun className="h-4 w-4 text-amber-400" />;
      case "afternoon":
        return <Sunset className="h-4 w-4 text-orange-400" />;
      case "evening":
        return <Moon className="h-4 w-4 text-sky-400" />;
      default:
        return <Clock className="h-4 w-4 text-emerald-400" />;
    }
  };

  // Find the selected day from the schedule
  const selectedDay = React.useMemo(() => {
    return availableScheduleDays.find((d) => d.date === deliveryDate) || availableScheduleDays[0];
  }, [availableScheduleDays, deliveryDate]);

  // Available slots for the currently selected day
  const activeSlots = React.useMemo(() => {
    if (selectedDay && selectedDay.slots && selectedDay.slots.length > 0) {
      return selectedDay.slots;
    }
    return [
      { id: "morning", title: "صبح (ساعت ۹:۰۰ الی ۱۳:۰۰)", description: "تحویل قبل از ظهر در ساعات اداری" },
      { id: "afternoon", title: "عصر (ساعت ۱۴:۰۰ الی ۱۸:۰۰)", description: "تحویل مناسب شرکت‌ها و دیتاسنترها" },
      { id: "evening", title: "شب (ساعت ۱۹:۰۰ الی ۲۲:۰۰)", description: "تحویل شیفت عصر و پروژه‌های شبانه" },
    ];
  }, [selectedDay]);

  // Ensure selected slot exists in active slots
  React.useEffect(() => {
    if (activeSlots.length > 0) {
      const match = activeSlots.find((s) => s.id === deliveryTimeSlot);
      if (!match) {
        setDeliveryTimeSlot(activeSlots[0].id);
      }
    }
  }, [activeSlots, deliveryTimeSlot, setDeliveryTimeSlot]);

  const customerProvince = shippingAddress.province || "تهران";

  return (
    <div className="space-y-6" dir="rtl">
      {/* Destination address hint banner */}
      <div className="p-3.5 rounded-2xl border border-neutral-800 bg-[#141417] flex items-center justify-between text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
          <span>
            مقصد ارسال:{" "}
            <strong className="text-white font-bold">
              استان {customerProvince}، شهر {shippingAddress.city || "تهران"}
            </strong>
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 hidden sm:inline-block">
          روش‌های ارسال بر اساس شهر مقصد فیلتر شده‌اند
        </span>
      </div>

      {/* ── 1. Delivery Method Cards ──────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-500" />
            <span>انتخاب شیوه ارسال تجهیزات شبکه</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            بسته‌بندی ضدضربه و بیمه حمل تا سقف ۱۰۰ میلیون تومان
          </span>
        </div>

        {/* Loading State */}
        {isLoadingDeliveryMethods && (
          <div className="space-y-3 animate-pulse">
            <div className="h-24 bg-[#161619] border border-neutral-800 rounded-2xl" />
            <div className="h-24 bg-[#161619] border border-neutral-800 rounded-2xl" />
          </div>
        )}

        {/* Error State */}
        {!isLoadingDeliveryMethods && deliveryMethodsError && (
          <div className="p-4 rounded-2xl border border-red-500/30 bg-red-950/20 flex items-center justify-between gap-3 text-xs text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{deliveryMethodsError}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refreshShippingData()}
              className="text-xs gap-1.5 h-8 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>تلاش مجدد</span>
            </Button>
          </div>
        )}

        {errors.deliveryMethod && (
          <p className="text-xs text-red-400 font-bold bg-red-950/30 border border-red-500/20 p-2.5 rounded-xl">
            {errors.deliveryMethod}
          </p>
        )}

        {/* Methods List */}
        {!isLoadingDeliveryMethods && (
          <div className="grid grid-cols-1 gap-3">
            {availableDeliveryMethods.map((method) => {
              const isSelected = deliveryMethodId === method.id;
              const details = getEffectiveMethodDetails(method, customerProvince);
              const isFree =
                details.isFree ||
                (details.freeThreshold !== null &&
                  details.freeThreshold !== undefined &&
                  financials.subtotal >= details.freeThreshold);

              const isRestricted = !isMethodAvailableForProvince(method, customerProvince);

              const amountToFree =
                details.freeThreshold && !isFree && financials.subtotal < details.freeThreshold
                  ? details.freeThreshold - financials.subtotal
                  : 0;

              return (
                <div
                  key={method.id}
                  onClick={() => {
                    if (!isRestricted) {
                      setDeliveryMethodId(method.id);
                    }
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all text-right flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isRestricted
                      ? "opacity-60 bg-[#121214] border-neutral-900 cursor-not-allowed"
                      : isSelected
                      ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500/30 cursor-pointer"
                      : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e] cursor-pointer"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-2xl shrink-0 transition-colors flex items-center justify-center min-w-[48px] min-h-[48px] ${
                        isSelected
                          ? "bg-orange-500/20 border border-orange-500/40"
                          : "bg-neutral-900 border border-neutral-800"
                      }`}
                    >
                      <CarrierIconItem
                        iconName={method.iconName}
                        iconUrl={method.iconUrl}
                        title={method.title}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {method.title}
                        </span>
                        {method.isExpress && (
                          <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5" />
                            اکسپرس فوری
                          </span>
                        )}
                        {details.isCustomized && (
                          <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                            تعرفه ویژه استان {customerProvince}
                          </span>
                        )}
                        {method.allowedProvinces && method.allowedProvinces.length > 0 && (
                          <span className="text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded-full">
                            فقط {method.allowedProvinces.join(" و ")}
                          </span>
                        )}
                        {(!method.allowedProvinces || method.allowedProvinces.length === 0) && (
                          <span className="text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">
                            سراسر کشور
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-300 font-medium">
                        {method.subtitle}
                      </p>

                      <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xl">
                        {method.description}
                      </p>

                      {/* Threshold alert */}
                      {amountToFree > 0 && (
                        <p className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1 pt-1">
                          <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                          <span>
                            تنها با خرید{" "}
                            <strong className="text-amber-300 font-bold">
                              {formatPrice(amountToFree)}
                            </strong>{" "}
                            دیگر، ارسال این روش برای شما کاملاً رایگان خواهد شد!
                          </span>
                        </p>
                      )}

                      {isRestricted && (
                        <p className="text-[11px] text-red-400 font-bold flex items-center gap-1 pt-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>این روش ارسال در استان {customerProvince} ارائه نمی‌گردد.</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price and Timing Info */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-neutral-800/80 pt-3 sm:pt-0 shrink-0 gap-1.5 min-w-[140px]">
                    <div className="text-left sm:text-right">
                      {isFree ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-xl inline-block shadow-sm">
                            ارسال رایگان
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-black text-white">
                          {formatPrice(details.cost)}
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-orange-400 shrink-0" />
                      <span>{details.estimatedDeliveryTime}</span>
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
        )}
      </div>

      {/* ── 2. Delivery Date Calendar ─────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>انتخاب روز تحویل سفارش تجهیزات شبکه</span>
          </h3>
          <span className="text-[11px] text-neutral-400">روزهای کاری شنبه تا پنج‌شنبه</span>
        </div>

        {errors.deliveryDate && (
          <p className="text-xs text-red-400 font-bold bg-red-950/30 border border-red-500/20 p-2.5 rounded-xl">
            {errors.deliveryDate}
          </p>
        )}

        {isLoadingSchedule && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 animate-pulse">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-20 bg-neutral-900 border border-neutral-800 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoadingSchedule && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {availableScheduleDays.map((day) => {
              const isSelected = deliveryDate === day.date;

              return (
                <div
                  key={day.date}
                  onClick={() => {
                    setDeliveryDate(day.date);
                    setDeliveryDateJalali(day.jalaliDate);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? "border-orange-500 bg-orange-950/30 ring-1 ring-orange-500/40 shadow-md shadow-orange-950/40"
                      : "border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 hover:bg-neutral-900"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">
                      {day.dayName}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-medium block">
                      {day.jalaliDate.replace(day.dayName, "").trim()}
                    </span>
                  </div>

                  <div className="pt-2">
                    {day.isToday ? (
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-block">
                        امروز
                      </span>
                    ) : day.isTomorrow ? (
                      <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full inline-block">
                        فردا
                      </span>
                    ) : isSelected ? (
                      <span className="text-[10px] font-bold text-orange-400">
                        انتخاب شد
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">روز عادی</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 3. Delivery Time Slot ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <h3 className="text-xs sm:text-sm font-bold text-white">
              بازه زمانی تحویل برای{" "}
              <span className="text-orange-400">
                {deliveryDateJalali || (selectedDay ? selectedDay.jalaliDate : "روز انتخابی")}
              </span>
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">هماهنگی تلفنی قبل از اعزام سفیر</span>
        </div>

        {errors.deliveryTimeSlot && (
          <p className="text-xs text-red-400 font-bold bg-red-950/30 border border-red-500/20 p-2.5 rounded-xl">
            {errors.deliveryTimeSlot}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {activeSlots.map((slot) => {
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
                  <div className="flex items-center gap-2">
                    {getSlotIcon(slot.id)}
                    <span className="text-xs font-bold text-white">{slot.title}</span>
                  </div>
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

      {/* ── 4. Value-Added Logistics Services for Heavy & Critical Hardware ─── */}
      <div className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-orange-500" />
            <span>خدمات لجستیک تخصصی تجهیزات سنگین و حساس شبکه</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium">سفارشی‌سازی ناوگان</span>
        </div>

        <div className="space-y-3">
          {/* Heavy Equipment Lift Option */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={liftRequired}
              onChange={(e) => setLiftRequired(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-700 text-orange-500 focus:ring-orange-500/30 bg-neutral-800 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>درخواست ناوگان با بالابر هیدرولیک و نیروی تخلیه طبقاتی</span>
                <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-700">
                  رک‌های ایستاده و UPS
                </span>
              </span>
              <p className="text-[11px] text-neutral-400">
                در صورتی که سفارش شما شامل رک‌های سرور سنگین (24U تا 44U) یا تجهیزات اتاق سرور است، با انتخاب این گزینه خودروی دارای جک و تکنسین اعزام می‌شود.
              </p>
            </div>
          </label>

          {/* Delivery Note Details */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-neutral-400" />
              <span>هماهنگی اختصاصی زمان تحویل با واحد IT یا حراست دیتا سنتر (اختیاری)</span>
            </label>
            <input
              type="text"
              value={specialDeliveryNotes}
              onChange={(e) => setSpecialDeliveryNotes(e.target.value)}
              placeholder="مثال: تحویل قبل از ساعت ۱۲ به مهندس شیفت یا همراه داشتن کارت شناسایی جهت ورود به برج"
              className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
