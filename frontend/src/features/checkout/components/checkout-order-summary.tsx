"use client";

import * as React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Tag,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Package,
  CheckCircle2,
  X,
  Lock,
  Zap,
} from "lucide-react";
import { useCheckout } from "../hooks/use-checkout";
import { useCart } from "@/features/cart";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function CheckoutOrderSummary() {
  const { items } = useCart();
  const {
    currentStep,
    nextStep,
    prevStep,
    handlePlaceOrder,
    isSubmitting,
    financials,
    couponInput,
    setCouponInput,
    appliedCoupon,
    isApplyingCoupon,
    couponError,
    handleApplyCoupon,
    handleRemoveCoupon,
    invoiceType,
  } = useCheckout();

  const [isItemsExpanded, setIsItemsExpanded] = React.useState<boolean>(false);

  const isLastStep = currentStep === "payment";

  const getStepButtonText = () => {
    switch (currentStep) {
      case "shipping":
        return "ادامه و تعیین نوع فاکتور";
      case "invoice":
        return "ادامه و انتخاب شیوه ارسال";
      case "delivery":
        return "ادامه و انتخاب روش پرداخت";
      case "payment":
        return "پرداخت و ثبت نهایی سفارش";
      default:
        return "ادامه فرایند خرید";
    }
  };

  const handleNextAction = async () => {
    if (isLastStep) {
      await handlePlaceOrder();
    } else {
      nextStep();
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* ── Main Summary Box ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-[#141417] p-5 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-500" />
            <span>خلاصه سفارش ({toPersianDigits(items.reduce((s, i) => s + i.quantity, 0))} کالا)</span>
          </h2>

          <button
            type="button"
            onClick={() => setIsItemsExpanded((prev) => !prev)}
            className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{isItemsExpanded ? "بستن لیست" : "مشاهده اقلام"}</span>
            {isItemsExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* ── Collapsible Mini Items List ── */}
        {isItemsExpanded && (
          <div className="space-y-3 max-h-60 overflow-y-auto border-b border-neutral-800/80 pb-4 animate-fade-in pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900/90 border border-neutral-800/80"
              >
                <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                  <Image
                    src={item.product.images[0] || "/placeholder.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                  <span className="absolute bottom-0 right-0 bg-orange-600/90 text-[9px] font-black text-white px-1 rounded-tl-md">
                    {toPersianDigits(item.quantity)}×
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">
                    {item.product.name}
                  </h4>
                  {item.product.sku && (
                    <span className="text-[10px] font-mono text-neutral-400 block truncate dir-ltr text-right">
                      SKU: {item.product.sku}
                    </span>
                  )}
                  <span className="text-xs font-black text-orange-400 block mt-0.5">
                    {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Coupon Code Box ── */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-neutral-300">
            کد تخفیف / کد معرف همکار
          </label>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">{appliedCoupon.code}</span>
                  <span className="text-[11px] text-emerald-400/80 block">
                    {appliedCoupon.description} (-{formatPrice(appliedCoupon.amount)})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="p-1 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-900/50 transition-colors cursor-pointer"
                title="حذف کد تخفیف"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="مثلاً: NETMARKET یا VIP50"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-xs pr-8 uppercase"
                />
                <Tag className="h-3.5 w-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleApplyCoupon}
                isLoading={isApplyingCoupon}
                className="shrink-0 text-xs font-bold px-3 h-10 bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700"
              >
                اعمال
              </Button>
            </div>
          )}

          {couponError && (
            <p className="text-[11px] text-red-400 font-medium">{couponError}</p>
          )}
        </div>

        {/* ── Financial Breakdown Table ── */}
        <div className="space-y-2.5 text-xs text-neutral-300 border-t border-neutral-800 pt-4">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">قیمت کل کالاها</span>
            <span className="font-semibold text-white shrink-0 whitespace-nowrap">
              {formatPrice(financials.subtotal)}
            </span>
          </div>

          {/* Discount if any */}
          {financials.discountTotal > 0 && (
            <div className="flex justify-between items-center text-emerald-400">
              <span>تخفیف اعمال شده</span>
              <span className="font-bold shrink-0 whitespace-nowrap">
                -{formatPrice(financials.discountTotal)}
              </span>
            </div>
          )}

          {/* Shipping Cost */}
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">هزینه ارسال و بسته‌بندی</span>
            <span>
              {financials.shippingCost === 0 ? (
                <span className="text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[11px] shrink-0 whitespace-nowrap">
                  رایگان
                </span>
              ) : (
                <span className="font-semibold text-white shrink-0 whitespace-nowrap">
                  {formatPrice(financials.shippingCost)}
                </span>
              )}
            </span>
          </div>

          {/* VAT Tax for Legal B2B */}
          {invoiceType === "legal" && (
            <div className="flex justify-between items-center text-amber-400 animate-fade-in">
              <span className="flex items-center gap-1">
                <span>مالیات ارزش افزوده فاکتور رسمی (۱۰٪)</span>
              </span>
              <span className="font-bold shrink-0 whitespace-nowrap">+{formatPrice(financials.vatTax)}</span>
            </div>
          )}

          {/* Final Payable Total */}
          <div className="flex justify-between items-baseline border-t border-neutral-800 pt-3 text-sm font-black text-white">
            <span>مبلغ نهایی قابل پرداخت</span>
            <span className="text-base text-orange-400 font-black shrink-0 whitespace-nowrap">
              {formatPrice(financials.payableTotal)}
            </span>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="space-y-2 pt-2">
          <Button
            type="button"
            className="w-full gap-2 h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-sm shadow-xl shadow-orange-950/50 cursor-pointer"
            size="lg"
            isLoading={isSubmitting}
            onClick={handleNextAction}
          >
            <span>{getStepButtonText()}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>

          {currentStep !== "shipping" && (
            <button
              type="button"
              onClick={prevStep}
              className="w-full py-2 text-center text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              <span>بازگشت به مرحله قبلی</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Security & Warranty Guarantee Badges ─────────────────────── */}
      <div className="rounded-2xl border border-neutral-800/80 bg-[#111114]/80 p-4 space-y-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2.5 text-neutral-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>گارانتی ۲۴ ماهه تعویض رسمی ققنوس آکادمی</span>
        </div>
        <div className="flex items-center gap-2.5 text-neutral-300">
          <Zap className="h-4 w-4 text-amber-400 shrink-0" />
          <span>تست فیزیکی و تایید سلامت ماژول‌های نوری قبل از ارسال</span>
        </div>
        <div className="flex items-center gap-2.5 text-neutral-300">
          <Lock className="h-4 w-4 text-blue-400 shrink-0" />
          <span>اتصال امن به شبکه پرداخت شاپرک با مجوز رسمی</span>
        </div>
      </div>
    </div>
  );
}
