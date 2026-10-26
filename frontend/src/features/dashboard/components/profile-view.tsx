"use client";

import * as React from "react";
import {
  User,
  Building,
  CreditCard,
  Bell,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Save,
  Camera,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { useDashboardProfile } from "../hooks/use-dashboard-profile";
import {
  DashboardPageHeader,
  DashboardMetricCard,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { detectBankFromCardNumber } from "./wallet-view";

export function ProfileView() {
  const {
    profile,
    isLoaded,
    isSaving,
    isAvatarUploading,
    error: hookError,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  } = useDashboardProfile();

  // Local form state
  const [formData, setFormData] = React.useState(profile);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isLoaded) {
      setFormData(profile);
    }
  }, [profile, isLoaded]);

  // Clean up avatar preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleTogglePreference = (key: keyof NonNullable<typeof formData.preferences>) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences?.[key],
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessToast(null);

    // Client-side validation
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      setErrorMessage("نام و نام خانوادگی الزامی است و باید حداقل ۲ کاراکتر باشد.");
      return;
    }

    if (formData.nationalCode && formData.nationalCode.trim()) {
      const nc = formData.nationalCode.trim();
      if (!/^[0-9]{10}$/.test(nc)) {
        setErrorMessage("کد ملی باید دقیقاً یک عدد ۱۰ رقمی باشد.");
        return;
      }
    }

    if (formData.email && formData.email.trim()) {
      const email = formData.email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrorMessage("فرمت آدرس پست الکترونیک (ایمیل) نامعتبر است.");
        return;
      }
    }

    if (formData.shebaNumber && formData.shebaNumber.trim()) {
      const sheba = formData.shebaNumber.trim().toUpperCase().replace(/^IR/, "");
      if (!/^[0-9]{24}$/.test(sheba)) {
        setErrorMessage("شماره شبا باید ۲۴ رقم عددی معتبر (با یا بدون پیشوند IR) باشد.");
        return;
      }
    }

    if (formData.cardNumber && formData.cardNumber.trim()) {
      const card = formData.cardNumber.trim().replace(/[\s-]/g, "");
      if (!/^[0-9]{16}$/.test(card)) {
        setErrorMessage("شماره کارت بانکی باید دقیقاً ۱۶ رقم عددی باشد.");
        return;
      }
    }

    if (formData.companyNationalId && formData.companyNationalId.trim()) {
      const cId = formData.companyNationalId.trim();
      if (!/^[0-9]{11}$/.test(cId)) {
        setErrorMessage("شناسه ملی شرکت باید یک عدد ۱۱ رقمی معتبر باشد.");
        return;
      }
    }

    try {
      await updateProfile(formData);
      setSuccessToast("اطلاعات حساب کاربری و مشخصات حقوقی با موفقیت در پایگاه داده ذخیره شد.");
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ذخیره‌سازی مشخصات پروفایل";
      setErrorMessage(msg);
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessToast(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("حجم فایل انتخابی بیشتر از سقف مجاز (۵ مگابایت) است.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("فرمت تصویر باید یکی از فرمت‌های PNG، JPEG یا WebP باشد.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Revoke old preview if any
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreviewUrl(preview);
    setSelectedAvatarFile(file);
  };

  const handleCancelAvatarPreview = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(null);
    setSelectedAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmSaveAvatar = async () => {
    if (!selectedAvatarFile) return;

    setErrorMessage(null);
    setSuccessToast(null);

    try {
      await uploadAvatar(selectedAvatarFile);
      setSuccessToast("تصویر پروفایل شما با موفقیت بارگذاری، بهینه‌سازی و ذخیره شد.");
      setTimeout(() => setSuccessToast(null), 3500);
      handleCancelAvatarPreview();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ارسال تصویر پروفایل به سرور";
      setErrorMessage(msg);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("آیا از حذف تصویر پروفایل خود و بازگشت به پیش‌فرض اطمینان دارید؟")) return;
    setErrorMessage(null);
    setSuccessToast(null);
    try {
      await deleteAvatar();
      handleCancelAvatarPreview();
      setSuccessToast("تصویر پروفایل با موفقیت حذف گردید و به تصویر پیش‌فرض بازگشت.");
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در حذف تصویر پروفایل";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="مشخصات حساب و احراز هویت"
        description="مدیریت تصویر پروفایل، اطلاعات هویتی، مشخصات حقوقی شرکت، شماره شبای بانکی و ترجیحات اعلان‌ها"
        icon={User}
        badge="احراز هویت شده ✓"
        badgeVariant="emerald"
      />

      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {(errorMessage || hookError) && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage || hookError}</span>
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
          value="تایید شده"
          subtitle="آماده تسویه آنی مطالبات و بازگشت وجه"
          icon={CreditCard}
          variant="sky"
        />

        <DashboardMetricCard
          title="سطح حساب کاربری"
          value="حقوقی / سازمانی"
          subtitle="امکان صدور پیش‌فاکتور و فاکتور رسمی مودیان"
          icon={Building}
          variant="purple"
        />
      </div>

      {/* ── 3. Avatar Management Card ────────────────────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative group shrink-0">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden flex items-center justify-center shadow-lg relative">
            {avatarPreviewUrl ? (
              <img
                src={avatarPreviewUrl}
                alt="پیش‌نمایش تصویر پروفایل"
                className="h-full w-full object-cover"
              />
            ) : profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={formData.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl sm:text-4xl font-black text-orange-400">
                {formData.fullName?.slice(0, 1) || "ع"}
              </span>
            )}

            {isAvatarUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-orange-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2.5 text-center sm:text-right">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
                تصویر پروفایل کاربری
              </h3>
              {avatarPreviewUrl && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium animate-pulse">
                  پیش‌نمایش (ذخیره نشده)
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {avatarPreviewUrl
                ? "تصویر انتخابی در کادر بالا نمایش داده شده است. جهت اعمال نهایی دکمه ذخیره و در غیر این صورت انصراف را بزنید."
                : "تصویر بارگذاری شده به طور خودکار به ابعاد مربعی استاندارد ۴۰۰×۴۰۰ پیکسل بهینه‌سازی شده و بدون هیچ‌گونه واترمارک ذخیره می‌گردد."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />

            {avatarPreviewUrl ? (
              <>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={isAvatarUploading}
                  onClick={handleConfirmSaveAvatar}
                  className="text-xs gap-1.5 cursor-pointer font-semibold shadow-md shadow-orange-500/15"
                >
                  {isAvatarUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>ذخیره تصویر پروفایل</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAvatarUploading}
                  onClick={handleCancelAvatarPreview}
                  className="text-xs gap-1.5 cursor-pointer font-semibold border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>انصراف</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAvatarUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs gap-1.5 cursor-pointer font-semibold border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>{profile.avatarUrl ? "تغییر تصویر پروفایل" : "بارگذاری تصویر جدید"}</span>
                </Button>

                {profile.avatarUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isAvatarUploading}
                    onClick={handleDeleteAvatar}
                    className="text-xs gap-1.5 cursor-pointer font-semibold border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>حذف تصویر</span>
                  </Button>
                )}
              </>
            )}
          </div>

          <span className="text-[11px] text-neutral-500">
            حداکثر حجم مجاز: ۵ مگابایت | فرمت‌های معتبر: WebP, PNG, JPEG
          </span>
        </div>
      </div>

      {/* ── 4. Main Profile Form ──────────────────────────────────── */}
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
                disabled
                value={formData.mobileNumber}
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900/60 text-xs font-mono text-neutral-400 text-right cursor-not-allowed"
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

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              درباره من / بیوگرافی تخصصی:
            </label>
            <textarea
              rows={3}
              value={formData.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="تخصص، سمت شغلی، یا گواهینامه‌های شبکه سیسکو..."
              className="w-full p-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
            />
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

        {/* Section 3: Bank Sheba & Card for Settlements */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[var(--theme-border-color)] pb-3">
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
                ۳. اطلاعات حساب بانکی پیش‌فرض جهت تسویه و برداشت از کیف پول
              </h3>
            </div>
            <span className="text-[11px] text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
              تسویه از طریق پایا و ساتنا
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            اطلاعات بانکی ثبت‌شده در این بخش به عنوان حساب مقصد پیش‌فرض در درخواست‌های برداشت از کیف پول استفاده می‌شود و نیازی به ورود مجدد آن در هر درخواست نخواهد بود.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-300">
                  شماره کارت بانکی (۱۶ رقم شتاب):
                </label>
                {formData.cardNumber && (formData.cardNumber || "").replace(/\D/g, "").length >= 6 && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${detectBankFromCardNumber(formData.cardNumber).color}`}>
                    {detectBankFromCardNumber(formData.cardNumber).name}
                  </span>
                )}
              </div>
              <input
                type="text"
                dir="ltr"
                value={formData.cardNumber || ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[\s-]/g, "").slice(0, 16);
                  handleChange("cardNumber", raw);
                }}
                placeholder="مثال: ۶۰۳۷۹۹۱۱..."
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-left tracking-wider focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                شماره شبا (با پیشوند IR و ۲۴ رقم):
              </label>
              <input
                type="text"
                dir="ltr"
                value={formData.shebaNumber || ""}
                onChange={(e) => {
                  let val = e.target.value.toUpperCase().replace(/[\s-]/g, "");
                  if (val && !val.startsWith("IR")) val = "IR" + val.replace(/^IR/i, "");
                  handleChange("shebaNumber", val.slice(0, 26));
                }}
                placeholder="IR..."
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-sky-400 font-bold text-left tracking-wider focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نام بانک صادرکننده:
              </label>
              <input
                type="text"
                value={formData.bankName || ""}
                onChange={(e) => handleChange("bankName", e.target.value)}
                placeholder="مثال: بانک ملی، بانک ملت..."
                className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نام صاحب حساب:
              </label>
              <input
                type="text"
                value={formData.accountHolderName || ""}
                onChange={(e) => handleChange("accountHolderName", e.target.value)}
                placeholder={formData.fullName || "نام و نام خانوادگی صاحب حساب"}
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
                checked={formData.preferences?.smsOnOrderUpdates ?? true}
                onChange={() => handleTogglePreference("smsOnOrderUpdates")}
                className="h-4 w-4 mt-0.5 sm:mt-0 rounded text-orange-500 shrink-0"
              />
              <span className="text-neutral-300 leading-relaxed">دریافت پیامک مراحل بسته‌بندی و ارسال سفارش</span>
            </label>

            <label className="flex items-start sm:items-center gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences?.smsOnInvoiceReady ?? true}
                onChange={() => handleTogglePreference("smsOnInvoiceReady")}
                className="h-4 w-4 mt-0.5 sm:mt-0 rounded text-orange-500 shrink-0"
              />
              <span className="text-neutral-300 leading-relaxed">ارسال پیامک صدور فاکتور رسمی سامانه مودیان</span>
            </label>

            <label className="flex items-start sm:items-center gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences?.twoFactorLoginNotify ?? true}
                onChange={() => handleTogglePreference("twoFactorLoginNotify")}
                className="h-4 w-4 mt-0.5 sm:mt-0 rounded text-orange-500 shrink-0"
              />
              <span className="text-neutral-300 leading-relaxed">ارسال هشدار پیامکی هنگام ورود از دستگاه جدید</span>
            </label>

            <label className="flex items-start sm:items-center gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preferences?.newsletterSubscribed ?? false}
                onChange={() => handleTogglePreference("newsletterSubscribed")}
                className="h-4 w-4 mt-0.5 sm:mt-0 rounded text-orange-500 shrink-0"
              />
              <span className="text-neutral-300 leading-relaxed">عضویت در خبرنامه مقالات و تحلیل بازار شبکه</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="default"
            disabled={isSaving}
            className="w-full sm:w-auto font-bold gap-2 px-8 shadow-md shadow-orange-500/15 justify-center cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? "در حال ذخیره‌سازی..." : "ذخیره تغییرات حساب کاربری"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
