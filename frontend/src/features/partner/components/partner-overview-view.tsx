"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  FileCheck2,
  Package,
  FileSpreadsheet,
  BadgePercent,
  Download,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building2,
  ExternalLink,
  Globe2,
  Wifi,
  Server,
  Zap,
  Radio,
  Network,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  MOCK_PARTNER_ORDERS,
  MOCK_PARTNER_INVOICES,
  MOCK_PARTNER_RFQS,
  MOCK_PARTNER_CHEQUES,
  MOCK_PARTNER_INTERNET_SERVICES,
  MOCK_PARTNER_STATIC_IP_SUBSCRIPTIONS,
} from "../data/mock-partner-data";

export function PartnerOverviewView() {
  const { user } = useAuth();

  const creditLimit = user?.creditLimit || 500_000_000;
  const creditBalance = user?.creditBalance || 320_000_000;
  const creditUsed = creditLimit - creditBalance;
  const creditPercent = Math.round((creditUsed / creditLimit) * 100);

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Financial Credit & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Credit Limit Widget */}
        <div className="md:col-span-2 rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-sky-400" />
                <h2 className="text-base font-bold text-white">
                  وضعیت خط اعتبار خرید سازمانی (چک صیادی و تضامین)
                </h2>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                اعتبار تایید شده ✓
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              سقف اعتبار مصوب برای خرید تجهیزات پسیو و اکتیو به صورت تسویه ۴۵ روزه با ثبت چک صیادی در سامانه پیچک.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">کل سقف اعتبار:</span>
              <span className="text-base font-black font-mono text-white">
                {formatPrice(creditLimit)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">اعتبار در دسترس فعلی:</span>
              <span className="text-base font-black font-mono text-emerald-400">
                {formatPrice(creditBalance)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 block mb-1">میزان استفاده شده:</span>
              <span className="text-base font-black font-mono text-neutral-300">
                {formatPrice(creditUsed)}
              </span>
            </div>
          </div>

          {/* Credit Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>میزان مصرف اعتبار: {toPersianDigits(creditPercent)}٪</span>
              <span>باقیمانده: {toPersianDigits(100 - creditPercent)}٪</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-sky-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${creditPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
            <span className="text-neutral-400">مدت دوره تسویه استاندارد: ۴۵ روز کاری</span>
            <Link
              href="/partner/credit"
              className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors"
            >
              <span>مدیریت چک‌ها و تضامین</span>
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Wholesale Tier Discount Badge */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BadgePercent className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">نرخ تخفیف سازمانی (Tier A)</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              تخفیفات همکاری به صورت خودکار روی تمامی پیش‌فاکتورها و سبد خرید اعمال می‌شود:
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
              <span className="text-neutral-300 font-medium">تجهیزات پسیو (کابل و رک)</span>
              <span className="font-bold font-mono text-emerald-400">۲۲٪ تخفیف</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
              <span className="text-neutral-300 font-medium">سوئیچ و روتر سیسکو</span>
              <span className="font-bold font-mono text-emerald-400">۱۴٪ تخفیف</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
              <span className="text-neutral-300 font-medium">ماژول‌های نوری SFP / SFP+</span>
              <span className="font-bold font-mono text-emerald-400">۱۸٪ تخفیف</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs">
              <span className="text-sky-300 font-medium flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-sky-400" />
                <span>اینترنت سازمانی و IP ثابت</span>
              </span>
              <span className="font-bold font-mono text-emerald-400">تا ۲۵٪ تخفیف</span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span>مالیات بر ارزش افزوده:</span>
            <span className="text-neutral-200 font-bold">۱۰٪ سامانه مودیان</span>
          </div>
        </div>
      </div>

      {/* ─── Two Distinct Enterprise Connectivity Sections: P2P Internet & Dedicated Static IP ─── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">
              خدمات پهنای باند P2P و آی‌پی استاتیک سازمانی
            </h3>
          </div>
          <span className="text-xs text-neutral-400">
            تخصیص آنی با تسویه اعتباری و نرخ مصوب همکاران ققنوس آکادمی
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: P2P Wireless Internet */}
          <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/30 via-neutral-900/90 to-neutral-900 p-6 shadow-lg flex flex-col justify-between gap-5 group hover:border-sky-500/50 transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-600" />
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-inner">
                    <Wifi className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">
                        خرید اینترنت P2P اختصاصی
                      </h4>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
                        فقط لینک متقارن P2P
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      پهنای باند وایرلس رادیویی ۱:۱ متقارن ویژه پروژه‌ها، برج‌ها، انبارها و دفاتر مرکزی
                    </p>
                  </div>
                </div>
              </div>

              {/* P2P Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="text-neutral-300">سرعت ۵۰ الی ۱۰۰۰ مگابیت</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="text-neutral-300">ترافیک ۵۰۰GB تا نامحدود</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-400 shrink-0" />
                  <span className="text-neutral-300">دوره‌های ۱، ۳، ۶ و ۱۲ ماهه</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/20 flex items-center gap-2">
                  <Server className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="text-purple-300 font-medium">امکان ثبت IP استاتیک در سفارش</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-sky-500/5 border border-sky-500/20 flex items-center justify-between text-xs">
                <span className="text-neutral-300">تخفیف ویژه قراردادهای سالانه همکار:</span>
                <span className="font-bold text-emerald-400 font-mono">تا ۲۰٪ تخفیف مازاد</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-neutral-800">
              <Link href="/partner/internet" className="w-full sm:w-auto flex-1">
                <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs gap-2 py-5 shadow-lg shadow-sky-600/25">
                  <Wifi className="h-4 w-4" />
                  <span>ورود به صفحه خرید اینترنت P2P</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-[11px] text-neutral-400">
                امکان‌سنجی رادیویی (LOS) رایگان
              </span>
            </div>
          </div>

          {/* Card 2: Dedicated Static IP */}
          <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-neutral-900/90 to-neutral-900 p-6 shadow-lg flex flex-col justify-between gap-5 group hover:border-purple-500/50 transition-all">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-400 to-indigo-600" />
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-inner">
                    <Server className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">
                        خرید آی‌پی استاتیک اختصاصی
                      </h4>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                        ثبت رسمی RIPE
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      خرید و تخصیص مستقیم IP ثابت برای فایروال، دوربین، ERP و سرور با تنظیم خودکار rDNS
                    </p>
                  </div>
                </div>
              </div>

              {/* Static IP Feature Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="text-neutral-300">۱ ماه، ۳ ماه، ۶ ماه و ۱۲ ماه</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-2">
                  <Server className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="text-neutral-300">۱ عدد IP استاتیک آنلاین</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/20 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-amber-300">تعداد بالاتر: تیکت / تماس</span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-fuchsia-400 shrink-0" />
                  <span className="text-fuchsia-300 font-medium">تنظیم معکوس rDNS و PTR</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between text-xs">
                <span className="text-neutral-300">خرید مستقل بدون وابستگی به اپراتور:</span>
                <span className="font-bold text-purple-300">تحویل آنی در پرتال</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-neutral-800">
              <Link href="/partner/static-ip" className="w-full sm:w-auto flex-1">
                <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-2 py-5 shadow-lg shadow-purple-600/25">
                  <Server className="h-4 w-4" />
                  <span>ورود به صفحه خرید آی‌پی استاتیک</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-[11px] text-neutral-400">
                تسویه اعتباری و فاکتور رسمی
              </span>
            </div>
          </div>
        </div>

        {/* Quick Active Services Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active P2P Links Mini Widget */}
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-bold text-white">لینک‌های فعال P2P سازمانی:</span>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400">
                {toPersianDigits(MOCK_PARTNER_INTERNET_SERVICES.length)} لینک فعال
              </span>
            </div>
            <div className="space-y-2">
              {MOCK_PARTNER_INTERNET_SERVICES.slice(0, 2).map((link) => (
                <div key={link.id} className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white font-medium block">{link.serviceName}</span>
                    <span className="text-[11px] text-neutral-400">{link.siteName}</span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-sky-400 font-bold block">{link.speedLabel}</span>
                    <span className="text-[10px] text-emerald-400">متصل (پایداری ۹۹.۹٪)</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/partner/internet" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center justify-end gap-1 pt-1">
              <span>مدیریت کامل لینک‌های وایرلس</span>
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>

          {/* Active Static IP Subnets Mini Widget */}
          <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-white">بلاک‌ها و آی‌پی‌های ثابت فعال:</span>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400">
                {toPersianDigits(MOCK_PARTNER_STATIC_IP_SUBSCRIPTIONS.length)} ساب‌نت سازمانی
              </span>
            </div>
            <div className="space-y-2">
              {MOCK_PARTNER_STATIC_IP_SUBSCRIPTIONS.slice(0, 2).map((ipSub) => (
                <div key={ipSub.id} className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white font-medium block">{ipSub.packageLabel}</span>
                    <span className="text-[11px] text-neutral-400">{ipSub.assignedSite}</span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-purple-400 font-bold block">{ipSub.subnet}</span>
                    <span className="text-[10px] text-emerald-400">{ipSub.statusLabel}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/partner/static-ip" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-end gap-1 pt-1">
              <span>مدیریت ساب‌نت‌ها و رکوردهای rDNS</span>
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders & Ongoing Shipments */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Package className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">سفارش‌های سازمانی و پروژه‌ای اخیر</h3>
          </div>
          <Link
            href="/partner/orders"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>مشاهده همه سفارش‌ها</span>
            <ArrowLeft className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 pr-2 font-medium">شماره سفارش</th>
                <th className="pb-3 font-medium">پروژه / کارگاه مقصد</th>
                <th className="pb-3 font-medium">تاریخ</th>
                <th className="pb-3 font-medium">مبلغ کل</th>
                <th className="pb-3 font-medium">وضعیت مرسوله</th>
                <th className="pb-3 pl-2 text-left font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {MOCK_PARTNER_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-3.5 pr-2 font-mono font-bold text-white">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 text-neutral-200">
                    <span className="block font-medium">{order.projectTitle}</span>
                    <span className="text-[11px] text-neutral-400">{order.siteName}</span>
                  </td>
                  <td className="py-3.5 text-neutral-400 font-mono">{toPersianDigits(order.date)}</td>
                  <td className="py-3.5 font-mono font-bold text-white">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border bg-sky-500/10 text-sky-300 border-sky-500/20 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                      <span>{order.statusLabel}</span>
                    </span>
                  </td>
                  <td className="py-3.5 pl-2 text-left">
                    <Link href="/partner/orders">
                      <Button variant="ghost" size="sm" className="text-[11px] text-neutral-300 hover:text-white">
                        جزئیات
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Tax Invoices & Project Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Invoices Card */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">فاکتورهای رسمی سامانه مودیان</h3>
            </div>
            <Link
              href="/partner/invoices"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>تمام فاکتورها</span>
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {MOCK_PARTNER_INVOICES.slice(0, 2).map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">({inv.taxUniqueId})</span>
                  </div>
                  <span className="text-neutral-300 text-[11px] truncate">{inv.projectTitle}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-emerald-400">{formatPrice(inv.totalAmount)}</span>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] gap-1 border-neutral-700">
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active RFQ Quotes Card */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">استعلام‌های باز پروژه‌ای (RFQ)</h3>
            </div>
            <Link
              href="/partner/rfq"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>ثبت استعلام جدید</span>
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {MOCK_PARTNER_RFQS.slice(0, 2).map((rfq) => (
              <div key={rfq.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{rfq.rfqNumber}</span>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {toPersianDigits(rfq.validityDaysRemaining)} روز اعتبار
                    </span>
                  </div>
                  <span className="text-neutral-300 text-[11px] truncate">{rfq.projectTitle}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-white">{formatPrice(rfq.totalEstimated)}</span>
                  <Link href="/partner/rfq">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-sky-400">
                      مشاهده
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
