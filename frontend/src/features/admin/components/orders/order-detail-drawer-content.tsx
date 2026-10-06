"use client";

import * as React from "react";
import {
  Building2,
  User,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Printer,
  ShieldCheck,
  FileText,
  Hash,
  Send,
} from "lucide-react";
import { cn, formatPrice, toPersianDigits } from "@/shared/lib/utils";
import type { AdminOrder } from "../../types/admin-orders.types";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_METHOD_LABELS,
  CARRIER_CONFIG,
} from "../../types/admin-orders.types";

export interface OrderDetailDrawerContentProps {
  order: AdminOrder;
  onApproveFinancial?: (order: AdminOrder) => void;
  onAssignShipping?: (order: AdminOrder) => void;
  onMarkDelivered?: (order: AdminOrder) => void;
  onUpdateNotes?: (orderId: string, notes: string) => void;
  onClose: () => void;
}

export function OrderDetailDrawerContent({
  order,
  onApproveFinancial,
  onAssignShipping,
  onMarkDelivered,
  onUpdateNotes,
  onClose,
}: OrderDetailDrawerContentProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [notesText, setNotesText] = React.useState(order.adminNotes || "");
  const [isNotesSaved, setIsNotesSaved] = React.useState(false);

  const statusMeta = ORDER_STATUS_CONFIG[order.status];
  const carrierMeta = order.carrier ? CARRIER_CONFIG[order.carrier] : null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(order.id, notesText);
      setIsNotesSaved(true);
      setTimeout(() => setIsNotesSaved(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col gap-6 text-right pb-10" dir="rtl">
      {/* ─── ۱. بنر وضعیت و هدر خلاصه پرونده ─── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-gradient-to-br from-neutral-900/90 to-neutral-950 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white tracking-wide">
                  سفارش {order.orderNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(order.orderNumber, "orderNum")}
                  className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="کپی شماره سفارش"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {copiedKey === "orderNum" && (
                  <span className="text-[10px] text-emerald-400 font-medium">کپی شد</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                <span>ثبت: {toPersianDigits(order.createdAt)}</span>
                <span className="text-neutral-700">•</span>
                <span>کد پیگیری: {order.trackingCode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                statusMeta.chipClass
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", statusMeta.dotClass)} />
              {statusMeta.label}
            </span>
          </div>
        </div>

        {/* کارت‌های متریال آمار سریع */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3">
            <span className="text-neutral-500 block mb-1">نوع مشتری</span>
            <span className="font-bold text-neutral-200">
              {order.customerType === "b2b" ? "حقوقی / B2B سازمانی" : "حقیقی / خرد"}
            </span>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3">
            <span className="text-neutral-500 block mb-1">تعداد اقلام</span>
            <span className="font-bold text-neutral-200">
              {toPersianDigits(order.items.length)} ردیف ({toPersianDigits(totalQuantity)} قلم)
            </span>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3">
            <span className="text-neutral-500 block mb-1">وضعیت پرداخت</span>
            <span
              className={cn(
                "font-bold",
                order.isPaymentVerified ? "text-emerald-400" : "text-amber-400"
              )}
            >
              {order.isPaymentVerified ? "تایید و تسویه شده" : "در انتظار استعلام مالی"}
            </span>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3">
            <span className="text-neutral-500 block mb-1">مبلغ نهایی</span>
            <span className="font-bold text-emerald-400 text-sm">
              {formatPrice(order.payableAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── ۲. اطلاعات خریدار و طرف قرارداد ─── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5">
        <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-300 mb-4 pb-2 border-b border-neutral-800">
          <User className="h-4 w-4 text-sky-400" />
          مشخصات خریدار و حساب کاربری
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <User className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-neutral-500 block text-[11px]">نام خریدار / نماینده:</span>
              <span className="font-semibold text-neutral-200">{order.customerName}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-neutral-500 block text-[11px]">شماره تماس همراه:</span>
              <span dir="ltr" className="font-mono font-medium text-neutral-200 inline-block">
                {toPersianDigits(order.phoneNumber)}
              </span>
            </div>
          </div>

          {order.companyName && (
            <div className="flex items-start gap-2.5">
              <Building2 className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-neutral-500 block text-[11px]">نام شرکت / سازمان:</span>
                <span className="font-bold text-sky-300">{order.companyName}</span>
              </div>
            </div>
          )}

          {order.nationalCode && (
            <div className="flex items-start gap-2.5">
              <Hash className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-neutral-500 block text-[11px]">شناسه ملی / کد اقتصادی:</span>
                <span className="font-mono text-neutral-200">
                  {toPersianDigits(order.nationalCode)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── ۳. نشانی و ناوگان ارسال مرسوله ─── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5">
        <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-300 mb-4 pb-2 border-b border-neutral-800">
          <Truck className="h-4 w-4 text-orange-400" />
          اطلاعات تحویل و رهگیری باربری
        </h4>

        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-neutral-200">
                  استان {order.shippingAddress.province}، شهر {order.shippingAddress.city}
                </span>
                <span className="text-neutral-700">•</span>
                <span className="text-neutral-400">
                  کد پستی: {toPersianDigits(order.shippingAddress.postalCode)}
                </span>
              </div>
              <p className="text-neutral-300 leading-relaxed text-xs">
                {order.shippingAddress.fullAddress}
              </p>
              <div className="mt-2 text-[11px] text-neutral-400">
                گیرنده تحویل: <span className="text-neutral-200">{order.shippingAddress.recipientName}</span>{" "}
                (تلفن: {toPersianDigits(order.shippingAddress.recipientPhone)})
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-medium text-neutral-400">
                وضعیت حامل و بارنامه رسمی:
              </span>
              {order.carrierTrackingCode ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  بارنامه تخصیص یافته
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                  در انتظار ثبت کد رهگیری
                </span>
              )}
            </div>

            {order.carrierTrackingCode ? (
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                <div className="space-y-0.5">
                  <div className="font-bold text-neutral-200">
                    {order.carrierName || carrierMeta?.name}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                    <span>بارنامه: {order.carrierTrackingCode}</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(order.carrierTrackingCode || "", "carrierTrack")
                      }
                      className="p-1 hover:text-white transition-colors"
                      title="کپی بارنامه"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {copiedKey === "carrierTrack" && (
                      <span className="text-[10px] text-emerald-400 font-sans">کپی شد</span>
                    )}
                  </div>
                </div>

                {order.carrierTrackingUrl && (
                  <a
                    href={order.carrierTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold transition-colors"
                  >
                    <span>استعلام زنده مرسوله</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-neutral-500 text-xs">
                  هنوز بارنامه تیپاکس یا باربری برای این مرسوله صادر نشده است.
                </span>
                {onAssignShipping && (
                  <button
                    type="button"
                    onClick={() => onAssignShipping(order)}
                    className="px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
                  >
                    تخصیص بارنامه اکنون
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── ۴. اقلام و تجهیزات شبکه (BOM & Serial Numbers) ─── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5">
        <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-300 mb-4 pb-2 border-b border-neutral-800">
          <Package className="h-4 w-4 text-emerald-400" />
          فهرست تجهیزات شبکه و شماره سریال‌های سخت‌افزاری ({toPersianDigits(order.items.length)} ردیف)
        </h4>

        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div
              key={item.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3 transition-colors hover:border-neutral-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-[10px] text-neutral-400 font-bold">
                      {toPersianDigits(idx + 1)}
                    </span>
                    <span className="font-bold text-white text-xs">{item.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                    <span className="font-mono text-neutral-300">{item.model}</span>
                    <span className="text-neutral-700">•</span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-semibold text-neutral-300">
                      برند: {item.brand}
                    </span>
                    <span className="text-neutral-700">•</span>
                    <span className="font-mono text-neutral-400">SKU: {item.sku}</span>
                  </div>
                </div>

                <div className="text-left space-y-0.5">
                  <div className="text-xs font-bold text-emerald-400">
                    {formatPrice(item.totalPrice)}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {toPersianDigits(item.quantity)} عدد × {formatPrice(item.unitPrice)}
                  </div>
                </div>
              </div>

              {/* گارانتی و شماره سریال‌ها */}
              <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{item.warranty}</span>
                </div>

                {item.serialNumbers && item.serialNumbers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-neutral-500 text-[10px]">شماره سریال‌ها:</span>
                    {item.serialNumbers.map((sn) => (
                      <span
                        key={sn}
                        className="px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/80 font-mono text-[10px] text-neutral-200"
                      >
                        {sn}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ۵. صورت‌حساب مالی و سند واریزی ─── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5">
        <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-300 mb-4 pb-2 border-b border-neutral-800">
          <CreditCard className="h-4 w-4 text-purple-400" />
          صورت‌حساب و وضعیت تسویه مالی
        </h4>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-neutral-400">
            <span>جمع اقلام سفارش:</span>
            <span className="font-mono font-medium text-neutral-200">
              {formatPrice(order.totalAmount)}
            </span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between items-center text-rose-400">
              <span>تخفیف همکاری و سازمانی:</span>
              <span className="font-mono font-medium">
                - {formatPrice(order.discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-neutral-400">
            <span>مالیات بر ارزش افزوده (۱۰٪):</span>
            <span className="font-mono font-medium text-neutral-200">
              {formatPrice(order.vatTaxAmount)}
            </span>
          </div>

          <div className="pt-2 border-t border-neutral-800 flex justify-between items-center text-sm font-bold">
            <span className="text-white">مبلغ نهایی قابل پرداخت:</span>
            <span className="text-emerald-400 font-mono text-base">
              {formatPrice(order.payableAmount)}
            </span>
          </div>

          <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">روش پرداخت:</span>
              <span className="font-semibold text-neutral-300">
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </span>
            </div>
            {order.paymentReceiptNumber && (
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">شماره رهگیری سند / فیش:</span>
                <span className="font-mono text-neutral-200">
                  {order.paymentReceiptNumber}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">تایید حسابداری مرکزی:</span>
              <span
                className={cn(
                  "font-bold",
                  order.isPaymentVerified ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {order.isPaymentVerified ? "تایید شده ✓" : "معلق و نیازمند بررسی"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ۶. یادداشت‌های داخلی مدیریت سفارش ─── */}
      <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5">
        <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-300 mb-3">
          <FileText className="h-4 w-4 text-neutral-400" />
          یادداشت‌های داخلی کارشناس سفارش
        </h4>

        <div className="space-y-3">
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={3}
            placeholder="یادداشت یا توضیحات هماهنگی با انبار، باربری یا کارفرما..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">
              {isNotesSaved && (
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  یادداشت با موفقیت ذخیره شد
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={handleSaveNotes}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
            >
              <Send className="h-3 w-3" />
              <span>ذخیره یادداشت</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── ۷. نوار عملیات اصلی در انتهای دراور ─── */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4 sticky bottom-0 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {order.status === "pending_financial" && onApproveFinancial && (
              <button
                type="button"
                onClick={() => onApproveFinancial(order)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>تایید واریز بانکی</span>
              </button>
            )}

            {(order.status === "processing_warehouse" || order.status === "shipping") &&
              onAssignShipping && (
                <button
                  type="button"
                  onClick={() => onAssignShipping(order)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/20 transition-colors"
                >
                  <Truck className="h-4 w-4" />
                  <span>
                    {order.carrierTrackingCode ? "ویرایش بارنامه" : "تخصیص بارنامه و ارسال"}
                  </span>
                </button>
              )}

            {order.status === "shipping" && onMarkDelivered && (
              <button
                type="button"
                onClick={() => onMarkDelivered(order)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>ثبت تحویل موفق</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition-colors"
            >
              <Printer className="h-4 w-4 text-neutral-400" />
              <span>چاپ حواله انبار</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
}
