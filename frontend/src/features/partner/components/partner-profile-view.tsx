"use client";

import * as React from "react";
import {
  Building2,
  FileCheck2,
  CheckCircle2,
  Upload,
  Phone,
  Mail,
  MapPin,
  Landmark,
  ShieldCheck,
  Edit2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { MOCK_PARTNER_PROFILE_DATA } from "../data/mock-partner-data";

export function PartnerProfileView() {
  const p = MOCK_PARTNER_PROFILE_DATA;

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">مشخصات شرکت و مدارک حقوقی ثبتی</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                اطلاعات احراز هویت شرکتی، روزنامه رسمی، کد اقتصادی و اطلاعات حساب بانکی حقوقی
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>احراز هویت حقوقی تایید شده ✓</span>
          </span>
        </div>
      </div>

      {/* Corporate Registration Details */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
        <h3 className="font-bold text-white text-base border-b border-neutral-800 pb-3 flex items-center justify-between">
          <span>مشخصات شناسنامه‌ای و ثبتی شرکت</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-sky-400 hover:text-sky-300 gap-1.5"
            onClick={() => alert("درخواست تغییر مشخصات به واحد امور حقوقی ققنوس آکادمی ارسال شد.")}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>درخواست به‌روزرسانی اطلاعات</span>
          </Button>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">نام کامل ثبتی شرکت:</span>
            <span className="text-white font-bold">{p.companyName}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">نام تجاری / برند:</span>
            <span className="text-neutral-200 font-bold">{p.brandName}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">شناسه ملی حقوقی (۱۱ رقمی):</span>
            <span className="text-white font-mono font-bold tracking-wider">{p.nationalId}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">کد اقتصادی شرکت:</span>
            <span className="text-white font-mono font-bold tracking-wider">{p.economicCode}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">شماره ثبت اداره ثبت شرکت‌ها:</span>
            <span className="text-white font-mono font-bold">{p.registrationNumber}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">سال تاسیس شرکت:</span>
            <span className="text-white font-bold">{p.establishedYear}</span>
          </div>
        </div>

        {/* Address and Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px] flex items-center gap-1">
              <MapPin className="h-3 w-3 text-sky-400" />
              <span>نشانی رسمی و قانونی مندرج در روزنامه رسمی:</span>
            </span>
            <span className="text-neutral-200 leading-relaxed font-medium">{p.officialAddress}</span>
            <span className="text-neutral-400 font-mono mt-1">کد پستی ۱۰ رقمی: {p.postalCode}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px] flex items-center gap-1">
              <Landmark className="h-3 w-3 text-emerald-400" />
              <span>اطلاعات حساب بانکی حقوقی جهت تسویه و عودت وجه:</span>
            </span>
            <span className="text-neutral-200 font-medium">{p.bankName}</span>
            <span className="text-emerald-400 font-mono font-bold mt-1 tracking-wider" dir="ltr">
              {p.officialIban}
            </span>
          </div>
        </div>
      </div>

      {/* Uploaded Legal Documents Status */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">وضعیت اسناد و مدارک حقوقی تایید شده</h3>
          <span className="text-xs text-neutral-400">تاریخ اعتبار مدارک: سال ۱۴۰۳</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {p.legalDocs.map((doc, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{doc.title}</span>
                  <span className="text-[10px] text-neutral-400">تاریخ ثبت: {toPersianDigits(doc.date)}</span>
                </div>
              </div>

              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                تایید شده ✓
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
