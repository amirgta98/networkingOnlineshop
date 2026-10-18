"use client";

import * as React from "react";
import type { AdminUserAddress } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { toPersianDigits } from "@/shared/lib/utils";
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building,
  Navigation,
  FileText,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface AddressesTabProps {
  userId: string;
}

export function AddressesTab({ userId }: AddressesTabProps) {
  const [addresses, setAddresses] = React.useState<AdminUserAddress[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAddresses = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserAddresses(userId);
      setAddresses(data || []);
    } catch (err: any) {
      console.error("Failed to load user addresses:", err);
      setError("خطا در بارگذاری آدرس‌های کاربر. لطفا مجددا تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 animate-pulse flex flex-col gap-3"
          >
            <div className="h-5 w-32 bg-neutral-800 rounded-lg" />
            <div className="h-4 w-full bg-neutral-800/60 rounded-md" />
            <div className="h-4 w-2/3 bg-neutral-800/60 rounded-md" />
            <div className="h-8 w-full bg-neutral-800/40 rounded-lg mt-2" />
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
          onClick={fetchAddresses}
          className="gap-2 border-neutral-700 text-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>تلاش مجدد</span>
        </Button>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 text-center flex flex-col items-center justify-center gap-3" dir="rtl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-400">
          <MapPin className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white">هیچ آدرسی ثبت نشده است</h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          این کاربر تا کنون نشانی یا آدرس تحویل سفارش در حساب کاربری خود ثبت نکرده است.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>مجموع آدرس‌های ثبت‌شده: <strong className="text-white font-mono">{toPersianDigits(addresses.length)}</strong> نشانی</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => {
          const recipientName =
            addr.recipientFullName ||
            [addr.recipientFirstName, addr.recipientLastName].filter(Boolean).join(" ") ||
            "گیرنده اصلی";

          return (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                addr.isDefault
                  ? "border-emerald-500/40 bg-neutral-900/80 shadow-lg shadow-emerald-950/20"
                  : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Header: Title & Default Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-emerald-400 shrink-0" />
                    <h4 className="text-sm font-bold text-white">{addr.title || "آدرس تحویل کالا"}</h4>
                    {addr.tagLabel && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {addr.tagLabel}
                      </span>
                    )}
                  </div>

                  {addr.isDefault && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>پیش‌فرض</span>
                    </span>
                  )}
                </div>

                {/* Province & City & Detailed Address */}
                <div className="text-xs text-neutral-300 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
                    <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                    <span>استان {addr.province}، شهر {addr.city}</span>
                  </div>
                  <p className="font-medium text-white">{addr.detailedAddress}</p>
                </div>

                {/* Plaque & Unit & Postal Code */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-[11px]">
                  <div>
                    <span className="text-neutral-500 block">پلاک:</span>
                    <span className="font-mono text-neutral-200">{toPersianDigits(addr.plaque)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">واحد:</span>
                    <span className="font-mono text-neutral-200">
                      {addr.unit ? toPersianDigits(addr.unit) : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">کد پستی:</span>
                    <span className="font-mono text-neutral-200" dir="ltr">
                      {toPersianDigits(addr.postalCode)}
                    </span>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs text-neutral-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-500 text-[11px]">تحویل‌گیرنده:</span>
                    <span className="font-semibold text-white">{recipientName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400" dir="ltr">
                    <Phone className="h-3 w-3 text-neutral-500" />
                    <span>{addr.recipientMobile}</span>
                  </div>
                </div>

                {/* Delivery Notes if any */}
                {addr.deliveryNotes && (
                  <div className="p-2 rounded-lg bg-neutral-950/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-neutral-500 shrink-0 mt-0.5" />
                    <span>توضیحات ارسال: {addr.deliveryNotes}</span>
                  </div>
                )}
              </div>

              {/* Coordinates link if available */}
              {(addr.latitude && addr.longitude) && (
                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-end">
                  <a
                    href={`https://maps.google.com/?q=${addr.latitude},${addr.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>مشاهده روی نقشه ({toPersianDigits(addr.latitude.toFixed(4))}, {toPersianDigits(addr.longitude.toFixed(4))})</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
