"use client";

import * as React from "react";
import {
  X,
  FileText,
  User,
  Phone,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Server,
  Wifi,
  DollarSign,
  Wallet,
  Loader2,
  Copy,
  Check,
  CreditCard,
  ExternalLink,
  FileImage,
  ZoomIn,
  Maximize2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ImageViewerModal } from "@/shared/components/ui";
import type { InternetOrder, InternetOrderStatus } from "@/features/internet/types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface InternetOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: InternetOrder | null;
  onUpdateStatus: (orderId: string, status: InternetOrderStatus) => Promise<void>;
}

function getPaymentMethodLabel(method?: string | null) {
  if (!method) return "درگاه آنلاین شاپرک";
  switch (method) {
    case "online_gateway":
      return "درگاه الکترونیک شاپرک";
    case "card_to_card":
      return "کارت به کارت / فیش بانکی";
    case "bank_transfer":
      return "انتقال وجه پایا / ساتنا (شبا)";
    case "wallet":
      return "کیف پول کاربری";
    case "corporate_credit":
      return "اعتبار سازمانی B2B";
    default:
      return method;
  }
}

export function InternetOrderDetailModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
}: InternetOrderDetailModalProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = React.useState(false);

  if (!isOpen || !order) return null;

  const handleStatusChange = async (newStatus: InternetOrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyTracking = () => {
    navigator.clipboard.writeText(order.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig: Record<
    InternetOrderStatus,
    { label: string; badgeClass: string; icon: React.ElementType }
  > = {
    PENDING: {
      label: "در انتظار بررسی و تایید فنی",
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      icon: Clock,
    },
    ACTIVE: {
      label: "فعال و تحویل داده شده",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: "لغو شده",
      badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      icon: XCircle,
    },
  };

  const currentStatus = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-neutral-800 bg-[#141418] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  جزئیات سفارش اینترنت سازمانی
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${currentStatus.badgeClass}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  <span>{currentStatus.label}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                <span>کد رهگیری:</span>
                <span className="font-mono text-white font-bold">{order.trackingCode}</span>
                <button
                  type="button"
                  onClick={copyTracking}
                  className="p-1 hover:text-white transition-colors"
                  title="کپی کد رهگیری"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-right">
          {/* Plan & Service Card */}
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-sky-400" />
                <span className="text-sm font-bold text-white">
                  {order.plan?.title || "پلن اینترنت سازمانی"}
                </span>
              </div>
              <span className="text-xs bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg font-bold font-mono">
                دوره {toPersianDigits(order.serviceDurationMonths)} ماهه
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-400 block">تخصیص IP استاتیک اختصاصی:</span>
                <span className={`font-bold ${order.hasStaticIp ? "text-emerald-400" : "text-neutral-400"}`}>
                  {order.hasStaticIp ? "دارد (تخصیص یافته)" : "ندارد"}
                </span>
              </div>
            </div>
          </div>

          {/* Partner Project / Site Information (if any) */}
          {order.site && (
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Building2 className="h-4 w-4 text-purple-400" />
                <span>متصل به کارگاه اجرایی همکار: {order.site.title}</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">
                {order.site.province}، {order.site.city}، {order.site.detailedAddress}
              </p>
            </div>
          )}

          {/* Customer & Address Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-sky-400" />
              <span>مشخصات متقاضی و محل نصب</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-400 block">نام مسئول / سفارش‌دهنده:</span>
                <span className="font-bold text-white">{order.fullName}</span>
              </div>

              {order.companyName && (
                <div>
                  <span className="text-neutral-400 block">نام شرکت / سازمان:</span>
                  <span className="font-bold text-white">{order.companyName}</span>
                </div>
              )}

              <div>
                <span className="text-neutral-400 block">شماره تلفن همراه:</span>
                <span className="font-bold text-white font-mono" dir="ltr">
                  {order.phoneNumber}
                </span>
              </div>

              {order.nationalCode && (
                <div>
                  <span className="text-neutral-400 block">کد / شناسه ملی:</span>
                  <span className="font-bold text-white font-mono">{order.nationalCode}</span>
                </div>
              )}

              {order.landlineNumber && (
                <div>
                  <span className="text-neutral-400 block">شماره خط تلفن ثابت (رانژه):</span>
                  <span className="font-bold text-white font-mono" dir="ltr">
                    {order.landlineNumber}
                  </span>
                </div>
              )}

              <div className="sm:col-span-2">
                <span className="text-neutral-400 block">نشانی دقیق محل نصب:</span>
                <span className="font-medium text-neutral-200">
                  {order.province}، {order.city} - {order.address}
                </span>
              </div>

              {order.notes && (
                <div className="sm:col-span-2 pt-2 border-t border-neutral-800/80">
                  <span className="text-neutral-400 block">یادداشت و توضیحات تکمیلی:</span>
                  <span className="text-neutral-300 italic">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2.5 text-xs">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pb-2 border-b border-neutral-800">
              <DollarSign className="h-3.5 w-3.5" />
              <span>ریز محاسبات مالی و فاکتور</span>
            </h4>

            <div className="flex justify-between text-neutral-400">
              <span>مبلغ پایه پلن دوره:</span>
              <span className="font-mono text-neutral-200">{formatPrice(order.baseAmount)}</span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>تخفیف دوره اشتراک:</span>
                <span className="font-mono">-{formatPrice(order.discountAmount)}</span>
              </div>
            )}

            {order.staticIpAmount > 0 && (
              <div className="flex justify-between text-sky-400">
                <span>هزینه تخصیص IP استاتیک دوره:</span>
                <span className="font-mono">+{formatPrice(order.staticIpAmount)}</span>
              </div>
            )}

            {order.addonsAmount > 0 && (
              <div className="flex justify-between text-neutral-300">
                <span>هزینه تجهیزات و خدمات نصب:</span>
                <span className="font-mono">+{formatPrice(order.addonsAmount)}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm font-black text-white">
              <span>مبلغ نهایی پرداختی:</span>
              <span className="font-mono text-emerald-400 text-base">{formatPrice(order.finalAmount)}</span>
            </div>

            {order.partnerCommission > 0 && (
              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-purple-300 font-bold bg-purple-950/20 p-2 rounded-xl">
                <span className="flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-purple-400" />
                  <span>پورسانت همکار محاسبه‌شده:</span>
                </span>
                <span className="font-mono text-purple-300 text-sm">{formatPrice(order.partnerCommission)}</span>
              </div>
            )}
          </div>

          {/* Payment & Receipt Verification Section */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                <span>اطلاعات شیوه پرداخت و فیش بانکی</span>
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  order.status === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : order.status === "CANCELLED"
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                {order.status === "ACTIVE"
                  ? "تایید شده مالی ✓"
                  : order.status === "CANCELLED"
                  ? "رد شده / لغو"
                  : "در انتظار بررسی مالی"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-400 block">روش پرداخت انتخابی:</span>
                <span className="font-bold text-white">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </span>
              </div>

              {order.paymentReceiptNumber && (
                <div>
                  <span className="text-neutral-400 block">شماره پیگیری / سند فیش:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {order.paymentReceiptNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Receipt Image / Proof Preview */}
            {order.paymentReceiptUrl ? (
              <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-sky-400">
                  <span className="flex items-center gap-1.5">
                    <FileImage className="h-4 w-4" />
                    <span>تصویر فیش واریزی ارسال‌شده:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsImageViewerOpen(true)}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all cursor-pointer"
                      title="مشاهده با امکانات زوم، چرخش و بهبود خوانایی"
                    >
                      <Maximize2 className="h-3 w-3" />
                      <span>نمایشگر پیشرفته</span>
                    </button>
                    <a
                      href={order.paymentReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-neutral-400 hover:text-white underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>تب جدید</span>
                    </a>
                  </div>
                </div>

                {order.paymentReceiptUrl.endsWith(".pdf") ? (
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <span className="font-mono text-neutral-300 text-xs">سند واریز در قالب PDF</span>
                    <a
                      href={order.paymentReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-lg text-xs font-bold hover:bg-sky-500/30 transition-colors"
                    >
                      دانلود فایل PDF
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsImageViewerOpen(true)}
                    className="relative h-48 w-full overflow-hidden rounded-xl border border-neutral-800 hover:border-sky-500/50 bg-neutral-950 flex items-center justify-center group cursor-zoom-in block text-right"
                    title="کلیک برای باز کردن در نمایشگر پیشرفته با قابلیت زوم، چرخش و افزایش وضوح"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.paymentReceiptUrl}
                      alt="فیش واریزی سفارش اینترنت"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                      <span className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <ZoomIn className="w-4 h-4" />
                        <span>مشاهده با زوم، چرخش و بهبود کیفیت</span>
                      </span>
                    </div>
                  </button>
                )}
              </div>
            ) : (order.paymentMethod === "card_to_card" || order.paymentMethod === "bank_transfer") ? (
              <div className="pt-2 border-t border-neutral-800/80 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                تصویر فیش توسط مشتری پیوست نشده است. تایید مالی بر اساس استعلام صورتحساب بانکی صورت گیرد.
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer Actions: Change Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-semibold">تغییر وضعیت سفارش:</span>
            {order.status !== "ACTIVE" && (
              <Button
                type="button"
                size="sm"
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={isUpdating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>تایید و فعال‌سازی سرویس</span>
              </Button>
            )}

            {order.status !== "CANCELLED" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={isUpdating}
                className="text-rose-400 border-rose-500/30 hover:bg-rose-950/40 text-xs"
              >
                <span>لغو سفارش</span>
              </Button>
            )}

            {order.status !== "PENDING" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange("PENDING")}
                disabled={isUpdating}
                className="text-amber-400 border-amber-500/30 hover:bg-amber-950/40 text-xs"
              >
                <span>بازگشت به انتظار</span>
              </Button>
            )}
          </div>

          <Button type="button" variant="outline" onClick={onClose} className="text-xs">
            بستن
          </Button>
        </div>
      </div>

      {/* Advanced Image Viewer Modal */}
      {order.paymentReceiptUrl && (
        <ImageViewerModal
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          src={order.paymentReceiptUrl}
          title={`فیش واریزی سفارش اینترنت ${order.trackingCode || order.orderNumber}`}
          subtitle={`مشتری: ${order.fullName || order.customerName} - مبلغ: ${formatPrice(order.finalAmount || order.totalPrice || 0)}`}
          fileName={`${order.trackingCode || order.orderNumber || "internet"}-internet-receipt.jpg`}
        />
      )}
    </div>
  );
}
