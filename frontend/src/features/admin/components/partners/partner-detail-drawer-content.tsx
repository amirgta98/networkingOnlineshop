"use client";

import * as React from "react";
import type { AdminPartner } from "../../types/admin-partners.types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  Building2,
  FileCheck2,
  CreditCard,
  Phone,
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
  User,
  Wrench,
  ExternalLink,
  HelpCircle,
  Pencil,
  Trash2,
  ZoomIn,
  Eye,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ImageViewerModal } from "@/shared/components/ui";

interface PartnerDetailDrawerContentProps {
  partner: AdminPartner;
  onApprove: (partner: AdminPartner) => void;
  onReject: (partner: AdminPartner) => void;
  onNeedDocs?: (partner: AdminPartner) => void;
  onEdit?: (partner: AdminPartner) => void;
  onDelete?: (partner: AdminPartner) => void;
}

export function PartnerDetailDrawerContent({
  partner,
  onApprove,
  onReject,
  onNeedDocs,
  onEdit,
  onDelete,
}: PartnerDetailDrawerContentProps) {
  const isIndividual = partner.applicantType === "INDIVIDUAL";
  const approvedLimit = partner.approvedCreditLimit || partner.requestedCreditLimit || 0;
  const usedCredit = partner.usedCredit || 0;
  const remainingCredit = Math.max(0, approvedLimit - usedCredit);
  const usedPercent = approvedLimit > 0 ? Math.min(100, Math.round((usedCredit / approvedLimit) * 100)) : 0;

  const isApproved = partner.status === "APPROVED" || partner.status === "approved";
  const isPending = partner.status === "PENDING" || partner.status === "UNDER_REVIEW" || partner.status === "pending_review";
  const isNeedDocs = partner.status === "NEED_DOCS";
  const isRejected = partner.status === "REJECTED" || partner.status === "rejected";
  const [previewImage, setPreviewImage] = React.useState<{ url: string; title: string; fileName?: string } | null>(null);

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* 1. Identity Header */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                isIndividual
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  : "bg-sky-500/15 text-sky-400 border-sky-500/30"
              }`}
            >
              {isIndividual ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">
                  {isIndividual
                    ? `${partner.fullName} ${partner.tradeName ? `(${partner.tradeName})` : ""}`
                    : partner.companyName || partner.fullName}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                    partner.tier === "GOLD" || partner.tier === "tier_gold"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : partner.tier === "SILVER" || partner.tier === "tier_silver"
                      ? "bg-neutral-700/50 text-neutral-200 border-neutral-600"
                      : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                  }`}
                >
                  {partner.tier === "GOLD" || partner.tier === "tier_gold"
                    ? "همکار طلایی"
                    : partner.tier === "SILVER" || partner.tier === "tier_silver"
                    ? "همکار نقره‌ای"
                    : "همکار برنزی"}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                {isIndividual
                  ? `متقاضی حقیقی: ${partner.fullName}`
                  : `مدیرعامل / نماینده: ${partner.ceoOrAgentName || partner.fullName} (${partner.agentPosition || "نماینده قانونی"})`}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] px-2.5 py-1 rounded-xl border font-semibold shrink-0 ${
              isApproved
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : isNeedDocs
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : isRejected
                ? "bg-red-500/10 text-red-400 border-red-500/30"
                : "bg-sky-500/10 text-sky-400 border-sky-500/30"
            }`}
          >
            {isApproved
              ? "عضویت فعال B2B"
              : isNeedDocs
              ? "نیازمند تکمیل مدارک"
              : isRejected
              ? "رد صلاحیت"
              : "در انتظار احراز و ارزیابی"}
          </span>
        </div>

        {/* Dynamic Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-neutral-800 text-xs text-neutral-300">
          {isIndividual ? (
            <>
              <div>
                <span className="text-neutral-400 block text-[11px]">کد ملی ۱۰ رقمی:</span>
                <span className="font-mono text-white font-bold">
                  {partner.nationalCode ? toPersianDigits(partner.nationalCode) : "ثبت نشده"}
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">شماره پروانه / مجوز صنفی:</span>
                <span className="font-mono text-white font-bold">
                  {partner.businessLicenseNumber ? toPersianDigits(partner.businessLicenseNumber) : "فاقد پروانه ثبت شده"}
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">سابقه فعالیت تخصصی:</span>
                <span className="text-white font-bold">
                  {toPersianDigits(partner.experienceYears)} سال
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">کارشناس پرونده:</span>
                <span className="text-sky-400 font-medium">
                  {partner.assignedAccountManager || "هنوز تخصیص نیافته"}
                </span>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-neutral-400 block text-[11px]">شناسه ملی شرکت (۱۱ رقم):</span>
                <span className="font-mono text-white font-bold">
                  {partner.nationalCompanyId ? toPersianDigits(partner.nationalCompanyId) : "ثبت نشده"}
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">کد اقتصادی (۱۲ رقم):</span>
                <span className="font-mono text-white font-bold">
                  {partner.economicCode ? toPersianDigits(partner.economicCode) : "ثبت نشده"}
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">شماره ثبت و نوع شرکت:</span>
                <span className="font-mono text-neutral-200">
                  {partner.registrationNumber ? toPersianDigits(partner.registrationNumber) : "-"} ({partner.companyType || "سهامی خاص"})
                </span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[11px]">کارشناس فروش اختصاصی:</span>
                <span className="text-sky-400 font-medium">
                  {partner.assignedAccountManager || "هنوز تخصیص نیافته"}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-neutral-400">شماره همراه:</span>
            <span className="font-mono text-white" dir="ltr">{partner.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span className="text-neutral-400">تلفن ثابت:</span>
            <span className="font-mono text-white" dir="ltr">{partner.landlinePhone || "ثبت نشده"}</span>
          </div>

          {partner.websiteOrSocial && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span className="text-neutral-400">وب‌سایت / شبکه اجتماعی:</span>
              <a
                href={partner.websiteOrSocial.startsWith("http") ? partner.websiteOrSocial : `https://${partner.websiteOrSocial}`}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline truncate max-w-[200px]"
                dir="ltr"
              >
                {partner.websiteOrSocial}
              </a>
            </div>
          )}

          <div className="flex items-start gap-2 sm:col-span-2">
            <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-neutral-400 shrink-0">نشانی:</span>
            <span className="text-neutral-200">
              {partner.province} - {partner.city}، {partner.address}
              {partner.postalCode ? ` (کد پستی: ${toPersianDigits(partner.postalCode)})` : ""}
            </span>
          </div>
        </div>

        {partner.notes && (
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300">
            <span className="text-neutral-400 font-semibold block mb-1">توضیحات و نیازمندی متقاضی:</span>
            <p>{partner.notes}</p>
          </div>
        )}

        {partner.reviewerNotes && (
          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs text-sky-200">
            <span className="text-sky-400 font-bold block mb-1">یادداشت ارزیابی کارشناس:</span>
            <p>{partner.reviewerNotes}</p>
          </div>
        )}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">برآورد خرید ماهانه متقاضی:</span>
            <span className="font-bold text-white font-mono text-sm">
              {formatPrice(partner.estimatedMonthlyPurchase || 0)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">سقف خط اعتباری درخواستی:</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              {formatPrice(partner.requestedCreditLimit || 0)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-neutral-400">
            <span>اعتبار مصرف‌شده: {formatPrice(usedCredit)} ({toPersianDigits(usedPercent)}٪)</span>
            <span>باقیمانده قابل خرید: {formatPrice(remainingCredit)}</span>
          </div>
          <div className="h-2.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-sky-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Verification Documents */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-400" />
            <span>مدارک و اسناد بارگذاری‌شده</span>
          </h3>
          <span className="text-[11px] text-neutral-400">
            {toPersianDigits(partner.documents?.length || 0)} سند بارگذاری‌شده
          </span>
        </div>

        {(!partner.documents || partner.documents.length === 0) ? (
          <div className="text-center py-6 text-xs text-neutral-500 bg-neutral-950/40 rounded-xl border border-neutral-800/60">
            هیچ سندی توسط متقاضی بارگذاری نشده است.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {partner.documents.map((doc, idx) => {
              const isImage = Boolean(
                (doc.fileUrl && (doc.fileUrl.startsWith("data:image") || doc.fileUrl.startsWith("blob:") || /\.(jpe?g|png|webp|svg)($|\?)/i.test(doc.fileUrl))) ||
                (doc.fileName && /\.(jpe?g|png|webp|svg)$/i.test(doc.fileName))
              );

              return (
                <div
                  key={doc.id || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors text-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {doc.fileUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ url: doc.fileUrl!, title: doc.title, fileName: doc.fileName })}
                        className="relative group shrink-0 overflow-hidden rounded-xl border border-neutral-700 hover:border-sky-400 transition-all cursor-pointer"
                        title="مشاهده سند"
                      >
                        {isImage ? (
                          <>
                            <img
                              src={doc.fileUrl}
                              alt={doc.title}
                              className="h-12 w-12 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="h-4 w-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                            <FileCheck2 className="h-5 w-5" />
                          </div>
                        )}
                      </button>
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-center shrink-0 text-neutral-500">
                        <FileCheck2 className="h-5 w-5" />
                      </div>
                    )}

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm truncate">{doc.title}</span>
                        {isImage ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                            تصویر سند
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold shrink-0">
                            فایل سند
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">
                        {doc.fileName} {doc.fileSize ? `(${doc.fileSize})` : ""} {doc.uploadedAt ? `— ${doc.uploadedAt}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {doc.fileUrl ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ url: doc.fileUrl!, title: doc.title, fileName: doc.fileName })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-[11px] font-semibold text-sky-300 hover:bg-sky-500/20 transition-colors cursor-pointer"
                          title="مشاهده سند در پنجره پیشرفته با امکانات چرخش، بزرگ‌نمایی و فیلتر خوانایی"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>مشاهده</span>
                        </button>

                        <a
                          href={doc.fileUrl}
                          download={doc.fileName || "document"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 text-[11px] font-semibold text-neutral-200 hover:text-white hover:border-neutral-600 transition-colors"
                          title="دانلود فایل روی سیستم"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>دانلود</span>
                        </a>
                      </>
                    ) : (
                      <span className="text-[10px] text-neutral-500">فاقد لینک</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Image Viewer Modal with Zoom, Rotation & Contrast */}
      <ImageViewerModal
        isOpen={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        src={previewImage?.url}
        title={previewImage?.title || "سند همکار"}
        subtitle={`همکار: ${partner.companyName || partner.fullName}`}
        fileName={previewImage?.fileName || "partner-doc.jpg"}
      />

      {/* 4. Action Buttons for Admin */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => onApprove(partner)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-2 shadow-lg shadow-emerald-600/20 h-10"
          >
            <UserCheck className="h-4 w-4" />
            <span>تایید پرونده و تنظیم خط اعتباری</span>
          </Button>

          {onNeedDocs && (
            <Button
              onClick={() => onNeedDocs(partner)}
              variant="outline"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs gap-1.5 h-10"
            >
              <HelpCircle className="h-4 w-4" />
              <span>درخواست مدارک</span>
            </Button>
          )}

          <Button
            onClick={() => onReject(partner)}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs gap-1.5 h-10"
          >
            <Ban className="h-4 w-4" />
            <span>رد پرونده</span>
          </Button>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-1">
            {onEdit && (
              <Button
                onClick={() => onEdit(partner)}
                variant="outline"
                className="flex-1 border-neutral-700 hover:bg-neutral-800 text-neutral-200 text-xs gap-1.5 h-9"
              >
                <Pencil className="h-3.5 w-3.5 text-sky-400" />
                <span>ویرایش اطلاعات متقاضی</span>
              </Button>
            )}

            {onDelete && (
              <Button
                onClick={() => onDelete(partner)}
                variant="outline"
                className="border-neutral-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 text-xs gap-1.5 h-9"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>حذف پرونده</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
