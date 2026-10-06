"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  Truck,
  Printer,
  FileDown,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Building2,
  CreditCard,
  Wifi,
} from "lucide-react";
import { useCheckout } from "../hooks/use-checkout";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

export function CheckoutSuccessView() {
  const { placedOrder } = useCheckout();

  if (!placedOrder) {
    return (
      <div className="text-center py-20" dir="rtl">
        <h2 className="text-xl font-bold text-white">سفارشی یافت نشد</h2>
        <Link href="/products" className="text-orange-400 mt-4 inline-block underline">
          مشاهده لیست محصولات
        </Link>
      </div>
    );
  }

  const handlePrintInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      {/* ── 1. Success Hero Banner ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-[#111114] p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-900/50 mb-4"
          >
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </motion.div>

          <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full mb-2">
            سفارش با موفقیت ثبت و تأیید گردید
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            از خرید شما از ققنوس آکادمی سپاسگزاریم!
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed">
            پیش‌فاکتور رسمی و پیامک تأیید ارسال به شماره{" "}
            <span className="text-orange-400 font-bold font-mono">
              {toPersianDigits(placedOrder.shippingAddress.phoneNumber)}
            </span>{" "}
            ارسال گردید و انبار مرکزی در حال بسته‌بندی محموله شماست.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-6 pt-6 border-t border-neutral-800/80 text-right sm:text-center">
            <div className="p-3 rounded-2xl bg-[#161619] border border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">شماره سفارش:</span>
              <span className="text-sm font-black text-white font-mono">
                #{toPersianDigits(placedOrder.orderNumber)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#161619] border border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">کد پیگیری مرسوله:</span>
              <span className="text-xs font-bold text-orange-400 font-mono">
                {placedOrder.trackingCode}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#161619] border border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">وضعیت پرداخت:</span>
              <span className="text-xs font-black text-emerald-400">
                {placedOrder.paymentStatus === "completed"
                  ? "پرداخت موفق شاپرک"
                  : placedOrder.paymentStatus === "credit_approved"
                  ? "تأیید اعتبار سازمانی"
                  : "در انتظار واریز/چک"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#161619] border border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">مبلغ کل فاکتور:</span>
              <span className="text-xs sm:text-sm font-black text-white">
                {formatPrice(placedOrder.financialSummary.payableTotal)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Official Printable Invoice Paper ──────────────────────── */}
      <div
        id="official-invoice"
        className="rounded-3xl border border-neutral-800 bg-[#121215] p-6 sm:p-8 space-y-6 shadow-xl"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                فروشگاه تخصصی تجهیزات شبکه ققنوس آکادمی
              </h3>
              <span className="text-[11px] text-neutral-400">
                پیش‌فاکتور رسمی فروش تجهیزات اکتیو و پسیو
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintInvoice}
              className="gap-1.5 text-xs bg-neutral-900 border-neutral-800 text-neutral-200 hover:text-white"
            >
              <Printer className="h-4 w-4" />
              <span>چاپ فاکتور رسمی</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintInvoice}
              className="gap-1.5 text-xs bg-neutral-900 border-neutral-800 text-neutral-200 hover:text-white"
            >
              <FileDown className="h-4 w-4" />
              <span>دریافت نسخه PDF</span>
            </Button>
          </div>
        </div>

        {/* Buyer & Seller Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Seller */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
            <span className="text-xs font-black text-orange-400 block border-b border-neutral-800 pb-1.5">
              مشخصات فروشنده:
            </span>
            <div className="text-neutral-300 space-y-1">
              <p><strong>فروشنده:</strong> شرکت ارتباطات و تجهیزات شبکه ققنوس آکادمی</p>
              <p><strong>شناسه ملی:</strong> ۱۰۱۰۳۵۶۷۸۹۰ | <strong>کد اقتصادی:</strong> ۴۱۱۵۶۷۸۹۴۳۲۱</p>
              <p><strong>نشانی:</strong> تهران، خیابان ولیعصر، بالاتر از طالقانی، برج پارس</p>
              <p><strong>شماره تماس:</strong> ۰۹۱۳۴۷۶۱۰۹۷</p>
            </div>
          </div>

          {/* Buyer */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
            <span className="text-xs font-black text-orange-400 block border-b border-neutral-800 pb-1.5">
              مشخصات خریدار:
            </span>
            <div className="text-neutral-300 space-y-1">
              <p>
                <strong>خریدار / سازمان:</strong>{" "}
                {placedOrder.invoiceType === "legal" && placedOrder.legalInvoice
                  ? placedOrder.legalInvoice.companyName
                  : placedOrder.shippingAddress.recipientName}
              </p>
              {placedOrder.invoiceType === "legal" && placedOrder.legalInvoice && (
                <p>
                  <strong>شناسه ملی:</strong> {placedOrder.legalInvoice.nationalId} |{" "}
                  <strong>کد اقتصادی:</strong> {placedOrder.legalInvoice.economicCode}
                </p>
              )}
              <p>
                <strong>نشانی تحویل:</strong> {placedOrder.shippingAddress.province}،{" "}
                {placedOrder.shippingAddress.city}، {placedOrder.shippingAddress.address}
              </p>
              <p>
                <strong>کد پستی:</strong> {toPersianDigits(placedOrder.shippingAddress.postalCode)}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/80 text-neutral-400">
                <th className="p-3 font-semibold">ردیف</th>
                <th className="p-3 font-semibold">شرح کالا / قطعه شبکه</th>
                <th className="p-3 font-semibold">تعداد</th>
                <th className="p-3 font-semibold">قیمت واحد</th>
                <th className="p-3 font-semibold text-left">مبلغ کل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {placedOrder.items.map((it, idx) => (
                <tr key={it.id} className="text-neutral-200 hover:bg-neutral-900/40">
                  <td className="p-3 text-neutral-400">{toPersianDigits(idx + 1)}</td>
                  <td className="p-3 font-medium">
                    <div>{it.product.name}</div>
                    {it.product.sku && (
                      <span className="text-[10px] font-mono text-neutral-500">
                        SKU: {it.product.sku}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-bold">{toPersianDigits(it.quantity)}</td>
                  <td className="p-3">{formatPrice(it.unitPrice ?? it.product.price)}</td>
                  <td className="p-3 text-left font-black text-white">
                    {formatPrice((it.unitPrice ?? it.product.price) * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Totals */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-neutral-800 pt-4 text-xs">
          <div className="text-neutral-400 space-y-1">
            <p><strong>شیوه ارسال:</strong> {placedOrder.deliveryMethod.title}</p>
            <p><strong>شیوه پرداخت:</strong> {placedOrder.paymentMethod.title}</p>
          </div>

          <div className="space-y-2 w-full sm:w-72">
            <div className="flex justify-between text-neutral-300">
              <span>جمع کل اقلام:</span>
              <span className="font-semibold">{formatPrice(placedOrder.financialSummary.subtotal)}</span>
            </div>
            {placedOrder.financialSummary.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>تخفیف:</span>
                <span className="font-bold">-{formatPrice(placedOrder.financialSummary.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-300">
              <span>هزینه ارسال و بیمه:</span>
              <span>
                {placedOrder.financialSummary.shippingCost === 0
                  ? "رایگان"
                  : formatPrice(placedOrder.financialSummary.shippingCost)}
              </span>
            </div>
            {placedOrder.financialSummary.vatTax > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>مالیات ارزش افزوده ۱۰٪:</span>
                <span className="font-bold">+{formatPrice(placedOrder.financialSummary.vatTax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-800 pt-2 text-sm font-black text-white">
              <span>مبلغ نهایی پرداخت شده:</span>
              <span className="text-orange-400">
                {formatPrice(placedOrder.financialSummary.payableTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom CTA Actions ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link href="/products" className="w-full sm:w-auto">
          <Button
            type="button"
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold h-11 px-8"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>ادامه خرید از فروشگاه</span>
          </Button>
        </Link>
        <Link href="/" className="w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto text-neutral-300 border-neutral-800 bg-neutral-900 hover:text-white h-11 px-8"
          >
            <span>بازگشت به صفحه اصلی</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
