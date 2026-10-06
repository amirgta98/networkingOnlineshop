"use client";

import * as React from "react";
import {
  MapPin,
  Building,
  User,
  Phone,
  Hash,
  FileText,
  CheckCircle2,
  Plus,
  Compass,
} from "lucide-react";
import { useCheckout } from "../hooks/use-checkout";
import { PROVINCES_AND_CITIES } from "../api/checkout-api";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { ShippingAddress } from "../types";

export function CheckoutShippingStep() {
  const {
    shippingAddress,
    setShippingAddress,
    savedAddresses,
    selectedAddressId,
    selectSavedAddress,
    errors,
  } = useCheckout();

  const [isEditingCustom, setIsEditingCustom] = React.useState<boolean>(
    selectedAddressId === "custom" || savedAddresses.length === 0
  );

  const availableCities = React.useMemo(() => {
    const province = shippingAddress.province || "تهران";
    return PROVINCES_AND_CITIES[province] || PROVINCES_AND_CITIES["تهران"] || [];
  }, [shippingAddress.province]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProv = e.target.value;
    const cities = PROVINCES_AND_CITIES[newProv] || [];
    setShippingAddress((prev) => ({
      ...prev,
      province: newProv,
      city: cities[0] || "",
    }));
  };

  const handleAddNewAddress = () => {
    const emptyAddr: ShippingAddress = {
      id: "custom",
      title: "نشانی جدید",
      recipientName: "",
      phoneNumber: "",
      province: "تهران",
      city: "تهران",
      postalCode: "",
      address: "",
      buildingNumber: "",
      unit: "",
      deliveryNotes: "",
      recipientIsSelf: true,
    };
    selectSavedAddress(emptyAddr);
    setIsEditingCustom(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── 1. Saved Addresses Selection ─────────────────────────────── */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>انتخاب از نشانی‌های ثبت شده</span>
            </h3>
            <button
              type="button"
              onClick={handleAddNewAddress}
              className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>افزودن نشانی جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id && !isEditingCustom;
              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    selectSavedAddress(addr);
                    setIsEditingCustom(false);
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none text-right ${
                    isSelected
                      ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500/30"
                      : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-neutral-400" />
                      {addr.title || "نشانی تحویل"}
                    </span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        انتخاب شده
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-400">انتخاب</span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-3">
                    {addr.province}، {addr.city}، {addr.address}، پلاک {toPersianDigits(addr.buildingNumber)}
                    {addr.unit ? `، واحد ${toPersianDigits(addr.unit)}` : ""}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {addr.recipientName}
                    </span>
                    <span className="flex items-center gap-1 dir-ltr">
                      {toPersianDigits(addr.phoneNumber)}
                      <Phone className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. Address Details Form ──────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="h-4 w-4 text-orange-500" />
            <span>مشخصات دقیق تحویل‌گیرنده و نشانی پستی</span>
          </h3>
          <span className="text-[11px] text-neutral-400">فیلدهای دارای * الزامی هستند</span>
        </div>

        {/* Name and Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              نام و نام خانوادگی تحویل‌گیرنده *
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="مثال: مهندس عرفان رضایی"
                value={shippingAddress.recipientName}
                onChange={(e) =>
                  setShippingAddress((prev) => ({ ...prev, recipientName: e.target.value }))
                }
                error={Boolean(errors.recipientName)}
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 pr-9 text-xs"
              />
              <User className="h-4 w-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.recipientName && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.recipientName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              شماره تلفن همراه (جهت هماهنگی و پیامک بارنامه) *
            </label>
            <div className="relative">
              <Input
                type="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={shippingAddress.phoneNumber}
                onChange={(e) =>
                  setShippingAddress((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                error={Boolean(errors.phoneNumber)}
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 pr-9 text-xs dir-ltr text-right"
              />
              <Phone className="h-4 w-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.phoneNumber && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Province, City, Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              استان مقصد *
            </label>
            <select
              value={shippingAddress.province}
              onChange={handleProvinceChange}
              className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all cursor-pointer"
            >
              {Object.keys(PROVINCES_AND_CITIES).map((prov) => (
                <option key={prov} value={prov} className="bg-neutral-900 text-white">
                  {prov.replace("_", " ")}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.province}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              شهر مقصد *
            </label>
            <select
              value={shippingAddress.city}
              onChange={(e) =>
                setShippingAddress((prev) => ({ ...prev, city: e.target.value }))
              }
              className="flex h-10 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all cursor-pointer"
            >
              {availableCities.map((city) => (
                <option key={city} value={city} className="bg-neutral-900 text-white">
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              کد پستی (۱۰ رقمی بدون خط تیره) *
            </label>
            <div className="relative">
              <Input
                type="text"
                maxLength={10}
                placeholder="مثال: ۱۹۹۸۷۶۵۴۳۲"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress((prev) => ({
                    ...prev,
                    postalCode: e.target.value.replace(/\D/g, ""),
                  }))
                }
                error={Boolean(errors.postalCode)}
                className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 pr-9 text-xs dir-ltr text-right"
              />
              <Hash className="h-4 w-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.postalCode && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.postalCode}</p>
            )}
          </div>
        </div>

        {/* Address text */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            نشانی پستی دقیق (خیابان، کوچه، پلاک، طبقه) *
          </label>
          <div className="relative">
            <textarea
              rows={2}
              placeholder="مثال: خیابان ولیعصر، بالاتر از میدان ونک، خیابان دامن‌افشار، برج پارس..."
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress((prev) => ({ ...prev, address: e.target.value }))
              }
              className={`flex w-full rounded-xl border bg-neutral-900 p-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all ${
                errors.address ? "border-red-500 ring-1 ring-red-500/20" : "border-neutral-800"
              }`}
            />
          </div>
          {errors.address && (
            <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.address}</p>
          )}
        </div>

        {/* Building & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              پلاک / شماره ساختمان *
            </label>
            <Input
              type="text"
              placeholder="مثال: ۳۴"
              value={shippingAddress.buildingNumber}
              onChange={(e) =>
                setShippingAddress((prev) => ({ ...prev, buildingNumber: e.target.value }))
              }
              error={Boolean(errors.buildingNumber)}
              className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs"
            />
            {errors.buildingNumber && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.buildingNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              واحد / طبقه / شماره اتاق سرور (اختیاری)
            </label>
            <Input
              type="text"
              placeholder="مثال: واحد ۱۰ - طبقه ۵ (اتاق رک)"
              value={shippingAddress.unit || ""}
              onChange={(e) =>
                setShippingAddress((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs"
            />
          </div>
        </div>

        {/* Delivery Notes */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-neutral-400" />
            <span>نکات و توضیحات هماهنگی تحویل تجهیزات شبکه (اختیاری)</span>
          </label>
          <Input
            type="text"
            placeholder="مثال: هماهنگی قبل از ارسال با حراست دیتا سنتر یا تحویل تا ساعت ۱۶"
            value={shippingAddress.deliveryNotes || ""}
            onChange={(e) =>
              setShippingAddress((prev) => ({ ...prev, deliveryNotes: e.target.value }))
            }
            className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
