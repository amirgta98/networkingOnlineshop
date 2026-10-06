"use client";

import * as React from "react";
import {
  Building2,
  FileCheck,
  CreditCard,
  Percent,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Send,
} from "lucide-react";
import { useDashboardUpgradePartner } from "../hooks/use-dashboard-upgrade-partner";
import { PartnerApplicationData } from "../types/upgrade-partner.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardStatusBadge,
  FileUploadBox,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function UpgradePartnerView() {
  const { application, isLoaded, submitApplication } = useDashboardUpgradePartner();

  // Form State
  const [companyName, setCompanyName] = React.useState(application.companyName);
  const [companyType, setCompanyType] = React.useState(application.companyType);
  const [nationalId, setNationalId] = React.useState(application.nationalId);
  const [economicCode, setEconomicCode] = React.useState(application.economicCode);
  const [registrationNumber, setRegistrationNumber] = React.useState(application.registrationNumber);
  const [fieldOfActivity, setFieldOfActivity] = React.useState(application.fieldOfActivity);
  const [requestedCreditLine, setRequestedCreditLine] = React.useState(application.requestedCreditLine);
  const [gazetteFile, setGazetteFile] = React.useState<string | null>(application.officialGazetteFileName || null);
  const [taxFile, setTaxFile] = React.useState<string | null>(application.taxClearanceFileName || null);
  const [notes, setNotes] = React.useState(application.notes || "");
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isLoaded) {
      setCompanyName(application.companyName);
      setNationalId(application.nationalId);
      setEconomicCode(application.economicCode);
      setRegistrationNumber(application.registrationNumber);
      setFieldOfActivity(application.fieldOfActivity);
      setRequestedCreditLine(application.requestedCreditLine);
      setGazetteFile(application.officialGazetteFileName || null);
      setTaxFile(application.taxClearanceFileName || null);
    }
  }, [application, isLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication({
      companyName,
      companyType,
      nationalId,
      economicCode,
      registrationNumber,
      fieldOfActivity,
      requestedCreditLine,
      officialGazetteFileName: gazetteFile || undefined,
      taxClearanceFileName: taxFile || undefined,
      notes,
    });
    setToastMsg("درخواست ارتقای سازمانی با موفقیت ثبت شد و به واحد ارزیابی اعتباری ارسال گردید.");
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="درخواست ارتقا به همکار سازمانی (B2B)"
        description="دسترسی به تخفیف‌های عمده همکاری، دریافت خط اعتباری تا ۵۰۰ میلیون تومان، خرید با چک صیادی و فاکتور رسمی سامانه مودیان"
        icon={Building2}
        badge="خط اعتباری ویژه B2B"
        badgeVariant="sky"
      />

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="سقف خط اعتباری اولیه"
          value={formatPrice(500000000)}
          subtitle="تسویه اعتباری با سررسید ۳۰ الی ۹۰ روزه"
          icon={CreditCard}
          variant="sky"
        />

        <DashboardMetricCard
          title="تخفیف‌های پلکانی همکاران"
          value="تا ۲۵٪ تخفیف"
          subtitle="روی کلیه تجهیزات پسیو، کابل، رک و پچ پنل"
          icon={Percent}
          variant="emerald"
        />

        <DashboardMetricCard
          title="تسهیلات چک صیادی"
          value="سامانه پیچک"
          subtitle="امکان تسویه فاکتورها با چک بنفش صیادی"
          icon={FileCheck}
          variant="purple"
        />
      </div>

      {/* ── 3. Four-Step Roadmap ──────────────────────────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs text-right">
        <h3 className="text-sm font-bold text-[var(--theme-foreground)] mb-4">
          مراحل ۴ گانه احراز صلاحیت و فعال‌سازی پنل همکاران سازمانی:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { step: "۱", title: "ثبت مشخصات ثبتی", desc: "کد اقتصادی، شناسه ملی و اطلاعات شرکت", done: true },
            { step: "۲", title: "بارگذاری روزنامه رسمی", desc: "آگهی تاسیس و آخرین تغییرات هیئت مدیره", done: true },
            { step: "۳", title: "اعتبارسنجی بانکی", desc: "استعلام خوش‌حسابی و رتبه اعتباری در بانک مرکزی", active: true },
            { step: "۴", title: "اعطای خط اعتباری", desc: "فعال‌سازی قیمت‌های B2B و امکان خرید چکی" },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border text-xs flex flex-col gap-1.5 ${
                s.active
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-300"
                  : s.done
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-neutral-800 bg-neutral-900/40 text-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs">مرحله {s.step}</span>
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : s.active ? (
                  <Clock className="h-4 w-4 text-sky-400 animate-pulse" />
                ) : null}
              </div>
              <span className="font-bold text-neutral-200">{s.title}</span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Current Application Status Card ────────────────────── */}
      <div className="rounded-3xl border border-sky-500/30 bg-neutral-900/40 p-4 sm:p-6 shadow-xs text-right flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-400 shrink-0" />
            <h3 className="text-sm font-bold text-neutral-200 break-words">
              وضعیت پرونده حقوقی: {application.companyName}
            </h3>
          </div>
          <div>
            <DashboardStatusBadge label={application.statusLabel} variant="info" />
          </div>
        </div>

        {application.reviewerNotes && (
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
            <strong className="text-sky-300">گزارش کارشناس ارزیابی مالی: </strong>
            {application.reviewerNotes}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-2 sm:p-0 rounded-lg bg-neutral-900/50 sm:bg-transparent">
            <span className="text-[11px] text-neutral-400 block mb-0.5">شناسه ملی:</span>
            <span className="font-mono font-bold text-neutral-200">{toPersianDigits(application.nationalId)}</span>
          </div>
          <div className="p-2 sm:p-0 rounded-lg bg-neutral-900/50 sm:bg-transparent">
            <span className="text-[11px] text-neutral-400 block mb-0.5">کد اقتصادی:</span>
            <span className="font-mono font-bold text-neutral-200">{toPersianDigits(application.economicCode)}</span>
          </div>
          <div className="p-2 sm:p-0 rounded-lg bg-neutral-900/50 sm:bg-transparent">
            <span className="text-[11px] text-neutral-400 block mb-0.5">خط اعتباری درخواستی:</span>
            <span className="font-mono font-bold text-emerald-400 break-words">{formatPrice(application.requestedCreditLine)}</span>
          </div>
          <div className="p-2 sm:p-0 rounded-lg bg-neutral-900/50 sm:bg-transparent">
            <span className="text-[11px] text-neutral-400 block mb-0.5">تاریخ ارسال پرونده:</span>
            <span className="font-mono text-neutral-300">{toPersianDigits(application.submittedAt || "۱۴۰۳/۰۸/۲۰")}</span>
          </div>
        </div>
      </div>

      {/* ── 5. Application / Re-submission Form ─────────────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs text-right flex flex-col gap-5">
        <div className="flex items-center gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
          <Building2 className="h-4 w-4 text-orange-400 shrink-0" />
          <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
            تکمیل یا ویرایش مشخصات حقوقی و اسناد شرکت
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نام رسمی شرکت:
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نوع شرکت:
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value as any)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="private_joint_stock">سهامی خاص</option>
                <option value="limited_liability">با مسئولیت محدود</option>
                <option value="cooperative">تعاونی / موسسه</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                شناسه ملی ۱۱ رقمی:
              </label>
              <input
                type="text"
                dir="ltr"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                کد اقتصادی ۱۲ رقمی:
              </label>
              <input
                type="text"
                dir="ltr"
                value={economicCode}
                onChange={(e) => setEconomicCode(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                شماره ثبت شرکت:
              </label>
              <input
                type="text"
                dir="ltr"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                حوزه فعالیت شبکه:
              </label>
              <input
                type="text"
                value={fieldOfActivity}
                onChange={(e) => setFieldOfActivity(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                سقف خط اعتباری پیشنهادی (تومان):
              </label>
              <input
                type="number"
                dir="ltr"
                value={requestedCreditLine}
                onChange={(e) => setRequestedCreditLine(Number(e.target.value))}
                step={50000000}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <FileUploadBox
              label="تصویر روزنامه رسمی آگهی تاسیس یا آخرین تغییرات:"
              selectedFileName={gazetteFile}
              onFileSelect={(name) => setGazetteFile(name)}
              onFileRemove={() => setGazetteFile(null)}
            />

            <FileUploadBox
              label="گواهی ثبت‌نام مالیات بر ارزش افزوده یا مفاصا حساب:"
              selectedFileName={taxFile}
              onFileSelect={(name) => setTaxFile(name)}
              onFileRemove={() => setTaxFile(null)}
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-neutral-800">
            <Button type="submit" variant="default" className="w-full sm:w-auto font-bold gap-2 justify-center">
              <Send className="h-4 w-4" />
              <span>به‌روزرسانی و ارسال مجدد پرونده</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
