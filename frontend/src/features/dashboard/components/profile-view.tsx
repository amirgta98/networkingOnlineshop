"use client";

import * as React from "react";
import {
  User,
  Building,
  CreditCard,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Save,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useDashboardProfile } from "../hooks/use-dashboard-profile";
import {
  DashboardPageHeader,
  DashboardMetricCard,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

export function ProfileView() {
  const { profile, isLoaded, updateProfile, togglePreference } = useDashboardProfile();

  // Local form state
  const [formData, setFormData] = React.useState(profile);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isLoaded) {
      setFormData(profile);
    }
  }, [profile, isLoaded]);

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSuccessToast("اطلاعات حساب کاربری و مشخصات حقوقی با موفقیت به‌روزرسانی و ذخیره شد.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="مشخصات حساب و احراز هویت"
        description="مدیریت اطلاعات هویتی، مشخصات حقوقی شرکت، شماره شبای بانکی جهت بازگشت وجوه و ترجیحات اعلان‌ها"
        icon={User}
        badge="احراز هویت شده ✓"
        badgeVariant="emerald"
      />

      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="وضعیت احراز هویت فردی"
          value="تایید شده"
          subtitle="منطبق با کد ملی و شماره موبایل ثبت شده"
          icon={ShieldCheck}
          variant="emerald"
        />

        <DashboardMetricCard
          title="شماره شبای بانکی"
          value="تایید شده (بانک سامان)"
          subtitle="آماده تسویه آنی مطالبات و کش‌بک"
          icon={CreditCard}
          variant="sky"
        />

        <DashboardMetricCard
          title="سطح حساب کاربری"
          value="حقوقی / سازمانی"
          subtitle="دارای امکان صدور فاکتور رسمی سامانه مودیان"
          icon={Building}
          variant="purple"
        />
      </div>

      {/* ── 3. Main Form ──────────────────────────────────────────── */}
      <form onSubmit={handleSave} className="flex flex-col gap-6 text-right">
        {/* Section 1: Individual Info */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
            <User className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
              ۱. مشخصات هویتی و فردی
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نام و نام خانوادگی:
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                کد ملی (۱۰ رقم):
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.nationalCode}
                onChange={(e) => handleChange("nationalCode", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                شماره تلفن همراه اصلی:
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                پست الکترونیک (ایمیل):
              </label>
              <input
                type="email"
                dir="ltr"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Corporate B2B Info */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
            <Building className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
              ۲. مشخصات حقوقی شرکت (جهت صدور فاکتور رسمی)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نام حقوقی شرکت / سازمان:
              </label>
              <input
                type="text"
                value={formData.companyName || ""}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                کد اقتصادی ۱۲ رقمی:
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.economicCode || ""}
                onChange={(e) => handleChange("economicCode", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                شناسه ملی شرکت (۱۱ رقم):
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.companyNationalId || ""}
                onChange={(e) => handleChange("companyNationalId", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                تلفن ثابت دفتر مرکزی:
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.companyPhone || ""}
                onChange={(e) => handleChange("companyPhone", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              نشانی ثبتی و قانونی شرکت:
            </label>
            <input
              type="text"
              value={formData.companyAddress || ""}
              onChange={(e) => handleChange("companyAddress", e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Section 3: Bank Sheba */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
            <CreditCard className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
              ۳. حساب بانکی و شماره شبا جهت واریز مطالبات
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                شماره شبا (با پیشوند IR):
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.shebaNumber}
                onChange={(e) => handleChange("shebaNumber", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-left focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نام بانک صادرکننده:
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Notification Preferences */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
            <Bell className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
              ۴. تنظیمات اعلان‌ها و پیامک‌های اطلاع‌رسانی
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-start sm:items-center gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences.smsOnOrderUpdates}
                onChange={() => togglePreference("smsOnOrderUpdates")}
                className="h-4 w-4 mt-0.5 sm:mt-0 rounded text-orange-500 shrink-0"
              />
              <span className="text-neutral-300 leading-relaxed">دریافت پیامک مراحل بسته‌بندی و ارسال سفارش</span>
            </label>

            <label className="flex items-start sm:items-center gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences.smsOnInvoiceReady}
                onChange={() => togglePreference("smsOnInvoiceReady")}
                className="h-4 w-4 mt-0.5 sm:mt-0 rounded text-orange-500 shrink-0"
              />
              <span className="text-neutral-300 leading-relaxed">ارسال پیامک صدور فاکتور رسمی سامانه مودیان</span>
            </label>

            <label className="flex items-start sm:items-center gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences.twoFactorLoginNotify}
                onChange={() => togglePreference("twoFactorLoginNotify")}
                className="h-4 w-4 mt-0.5 sm:mt-0 rounded text-orange-500 shrink-0"
              />
              <span className="text-neutral-300 leading-relaxed">ارسال هشدار پیامکی هنگام ورود از دستگاه جدید</span>
            </label>

            <label className="flex items-start sm:items-center gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences.newsletterSubscribed}
                onChange={() => togglePreference("newsletterSubscribed")}
                className="h-4 w-4 mt-0.5 sm:mt-0 rounded text-orange-500 shrink-0"
              />
              <span className="text-neutral-300 leading-relaxed">عضویت در خبرنامه مقالات و تحلیل بازار شبکه</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="default" className="w-full sm:w-auto font-bold gap-2 px-8 shadow-md shadow-orange-500/15 justify-center">
            <Save className="h-4 w-4" />
            <span>ذخیره تغییرات حساب کاربری</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
