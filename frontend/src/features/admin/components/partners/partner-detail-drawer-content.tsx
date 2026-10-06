"use client";

import * as React from "react";
import type { AdminPartner } from "../../types/admin-partners.types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  Building2,
  FileCheck2,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  UserCheck,
  Ban,
  Clock,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface PartnerDetailDrawerContentProps {
  partner: AdminPartner;
  onApprove: (partner: AdminPartner) => void;
  onReject: (partner: AdminPartner) => void;
}

export function PartnerDetailDrawerContent({
  partner,
  onApprove,
  onReject,
}: PartnerDetailDrawerContentProps) {
  const approvedLimit = partner.approvedCreditLimit || partner.requestedCreditLimit;
  const remainingCredit = Math.max(0, approvedLimit - partner.usedCredit);
  const usedPercent = approvedLimit > 0 ? Math.min(100, Math.round((partner.usedCredit / approvedLimit) * 100)) : 0;

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* 1. Company Identity Header */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">
                  {partner.companyName}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                    partner.tier === "tier_gold"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : partner.tier === "tier_silver"
                      ? "bg-neutral-700/50 text-neutral-200 border-neutral-600"
                      : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                  }`}
                >
                  {partner.tier === "tier_gold"
                    ? "همکار طلایی"
                    : partner.tier === "tier_silver"
                    ? "همکار نقره‌ای"
                    : "همکار برنزی"}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                مدیرعامل / نماینده رسمی: {partner.managerName}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] px-2.5 py-1 rounded-xl border font-semibold shrink-0 ${
              partner.status === "approved"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : partner.status === "pending_review"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {partner.status === "approved"
              ? "عضویت فعال B2B"
              : partner.status === "pending_review"
              ? "در انتظار احراز مدارک"
              : "رد صلاحیت"}
          </span>
        </div>

        {/* Legal & Corporate Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-neutral-800 text-xs text-neutral-300">
          <div>
            <span className="text-neutral-400 block text-[11px]">شناسه ملی شرکت:</span>
            <span className="font-mono text-white font-bold">{toPersianDigits(partner.nationalCode)}</span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">کد اقتصادی ۱۲ رقمی:</span>
            <span className="font-mono text-white font-bold">{toPersianDigits(partner.economicCode)}</span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">شماره ثبت رسمی:</span>
            <span className="font-mono text-neutral-300">{toPersianDigits(partner.registrationNumber)}</span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">کارشناس فروش اختصاصی:</span>
            <span className="text-sky-400 font-medium">{partner.assignedAccountManager}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-neutral-400">تلفن:</span>
            <span className="font-mono text-white" dir="ltr">{partner.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span className="text-neutral-400">ایمیل:</span>
            <span className="font-mono text-white" dir="ltr">{partner.email}</span>
          </div>

          <div className="flex items-start gap-2 sm:col-span-2">
            <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-neutral-400 shrink-0">نشانی ثبتی:</span>
            <span className="text-neutral-200">{partner.address}</span>
          </div>
        </div>
      </div>

      {/* 2. Credit Line Management */}
      <div className="rounded-2xl border border-sky-500/30 bg-sky-950/15 p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white">
              وضعیت خط اعتباری و خرید تعهدی
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-sky-300">
            سقف مصوب: {formatPrice(approvedLimit)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>اعتبار مصرف‌شده: {formatPrice(partner.usedCredit)} ({toPersianDigits(usedPercent)}٪)</span>
            <span>باقیمانده قابل خرید: {formatPrice(remainingCredit)}</span>
          </div>
          <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-sky-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-sky-500/20 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-neutral-300">چک‌های صیادی بنفش ثبت‌شده در سامانه پیچک:</span>
          </div>
          <span className="font-bold font-mono text-emerald-400">
            {toPersianDigits(partner.sayadiChequesCount)} فقره چک معتبر
          </span>
        </div>
      </div>

      {/* 3. Corporate Verification Documents */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-400" />
            <span>مدارک و اسناد ثبتی بارگذاری‌شده</span>
          </h3>
          <span className="text-[11px] text-neutral-400">
            {toPersianDigits(partner.documents.length)} سند بارگذاری‌شده
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {partner.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCheck2 className="h-4 w-4 text-sky-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white truncate">{doc.title}</span>
                  <span className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {doc.fileName} ({doc.fileSize}) — {doc.uploadedAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                    doc.status === "verified"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {doc.status === "verified" ? "تایید اصالت" : "در حال استعلام"}
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 border-neutral-700 text-neutral-300 hover:text-white"
                  title="دانلود سند"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action Buttons for Admin */}
      {partner.status === "pending_review" && (
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={() => onApprove(partner)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-2 shadow-lg shadow-emerald-600/20"
          >
            <UserCheck className="h-4 w-4" />
            <span>تایید مدارک و فعال‌سازی خط اعتباری</span>
          </Button>

          <Button
            onClick={() => onReject(partner)}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs gap-1.5"
          >
            <Ban className="h-4 w-4" />
            <span>رد تقاضا</span>
          </Button>
        </div>
      )}
    </div>
  );
}
