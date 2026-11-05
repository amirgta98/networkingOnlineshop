"use client";

import * as React from "react";
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Camera,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Info,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useDashboardProfile } from "@/features/dashboard/hooks/use-dashboard-profile";
import { UserProfileData } from "@/features/dashboard/types/profile.types";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

export function AdminProfileView() {
  const { user } = useAuth();
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

  const [formData, setFormData] = React.useState<UserProfileData>(profile);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isSiteManager = user?.role === "site_manager";

  React.useEffect(() => {
    if (isLoaded) {
      setFormData(profile);
    }
  }, [profile, isLoaded]);

  React.useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const handleChange = (field: keyof UserProfileData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("لطفاً یک فایل تصویری معتبر (JPG, PNG, WebP) انتخاب نمایید.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("حداکثر حجم مجاز تصویر پروفایل ۵ مگابایت است.");
      return;
    }

    try {
      const preview = URL.createObjectURL(file);
      setAvatarPreviewUrl(preview);
      const res = await uploadAvatar(file);
      setSuccessMessage("تصویر پروفایل با موفقیت بروزرسانی شد.");
      if (res?.avatarUrl) {
        handleChange("avatarUrl", res.avatarUrl);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "خطا در بارگذاری تصویر پروفایل.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      setAvatarPreviewUrl(null);
      handleChange("avatarUrl", null);
      setSuccessMessage("تصویر پروفایل حذف شد و به حالت پیش‌فرض بازگشت.");
    } catch (err: any) {
      setErrorMessage(err?.message || "خطا در حذف تصویر پروفایل.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const nameToValidate = formData.fullName?.trim() || "";
    if (nameToValidate.length < 2) {
      setErrorMessage("نام و نام خانوادگی الزامی است و باید حداقل ۲ کاراکتر باشد.");
      return;
    }

    if (formData.email && formData.email.trim()) {
      const email = formData.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMessage("فرمت آدرس پست الکترونیک (ایمیل) نامعتبر است.");
        return;
      }
    }

    if (formData.mobileNumber && formData.mobileNumber.trim()) {
      const phone = formData.mobileNumber.trim();
      const phoneRegex = /^09[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        setErrorMessage("شماره تلفن همراه باید با 09 شروع شده و دقیقاً ۱۱ رقم باشد.");
        return;
      }
    }

    if (formData.nationalCode && formData.nationalCode.trim()) {
      const nc = formData.nationalCode.trim();
      if (!/^[0-9]{10}$/.test(nc)) {
        setErrorMessage("کد ملی باید دقیقاً یک عدد ۱۰ رقمی باشد.");
        return;
      }
    }

    try {
      await updateProfile({
        fullName: nameToValidate,
        firstName: formData.firstName?.trim() || "",
        lastName: formData.lastName?.trim() || "",
        nationalCode: formData.nationalCode?.trim() || "",
        bio: formData.bio?.trim() || "",
        mobileNumber: formData.mobileNumber?.trim() || "",
        email: formData.email?.trim() || "",
        avatarUrl: formData.avatarUrl,
      });
      setSuccessMessage("اطلاعات پروفایل مدیریت با موفقیت در پایگاه داده ذخیره شد.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMessage(err?.message || "خطا در ذخیره‌سازی اطلاعات پروفایل.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <span className="text-xs text-neutral-400 font-medium">در حال بارگذاری اطلاعات حساب کاربری...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border-color)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>پیشخوان مدیریت</span>
            <span>/</span>
            <span className="text-emerald-400 font-medium">پروفایل کاربری</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <User className="h-6 w-6 text-emerald-400" />
            <span>پروفایل و مدیریت حساب ادمین</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            مشاهده و ویرایش مشخصات فردی، شماره تلفن همراه و پست الکترونیک حساب مدیریت سامانه.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isSiteManager ? "نقش: سایت‌گردان" : "نقش: مدیر ارشد (SuperAdmin)"}</span>
          </span>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs sm:text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {(errorMessage || hookError) && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs sm:text-sm animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span className="font-semibold">{errorMessage || hookError}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-neutral-900 flex items-center justify-center shadow-lg ring-4 ring-emerald-500/10">
                {avatarPreviewUrl || formData.avatarUrl ? (
                  <img
                    src={avatarPreviewUrl || formData.avatarUrl || ""}
                    alt={formData.fullName || "تصویر پروفایل"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-emerald-400">
                    {formData.fullName?.slice(0, 1) || "م"}
                  </span>
                )}
              </div>

              {/* Avatar action buttons */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarFileSelected}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAvatarUploading}
                aria-label="تغییر تصویر پروفایل"
                className="absolute -bottom-2 -left-2 h-8 w-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105"
                title="تغییر تصویر پروفایل"
              >
                {isAvatarUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>

              {(formData.avatarUrl || avatarPreviewUrl) && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={isAvatarUploading}
                  aria-label="حذف تصویر پروفایل"
                  className="absolute -top-2 -left-2 h-7 w-7 rounded-xl bg-neutral-800 hover:bg-red-600 text-neutral-300 hover:text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
                  title="حذف تصویر پروفایل"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white truncate">
                  {formData.fullName || "مدیر سیستم"}
                </h2>
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              </div>
              <span className="text-xs text-neutral-400 font-mono mt-0.5" dir="ltr">
                {formData.mobileNumber || user?.phone || "شماره ثبت‌نشده"}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  {user?.role === "site_manager"
                    ? "سایت‌گردان"
                    : "مدیر ارشد (SuperAdmin)"}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono" dir="ltr">
                  UID: {user?.id?.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          {/* Security Notice Pill */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 max-w-sm flex items-start gap-3">
            <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-neutral-300 leading-relaxed">
              <strong className="text-white block font-bold mb-0.5">سطح امنیت دسترسی:</strong>
              سطح دسترسی و نقش‌های مدیریتی صرفاً از طریق ماتریس مجوزهای سیستم تعیین می‌شوند و از این بخش قابل تغییر نیستند.
            </div>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Section 1: Personal Information */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 mb-5">
            <User className="h-4.5 w-4.5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">مشخصات هویتی و فردی</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                نام <span className="text-neutral-500 font-normal">(اختیاری)</span>
              </label>
              <input
                type="text"
                value={formData.firstName || ""}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="مثال: امیررضا"
                className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                نام خانوادگی <span className="text-neutral-500 font-normal">(اختیاری)</span>
              </label>
              <input
                type="text"
                value={formData.lastName || ""}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="مثال: رضایی"
                className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                نام کامل / نام نمایشی <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName || ""}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="نام کامل یا نام کاربری در سیستم"
                className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                کد ملی <span className="text-neutral-500 font-normal">(۱۰ رقم)</span>
              </label>
              <input
                type="text"
                maxLength={10}
                value={formData.nationalCode || ""}
                onChange={(e) => handleChange("nationalCode", e.target.value)}
                placeholder="0079823401"
                className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none transition-colors text-right"
                dir="ltr"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                بیوگرافی یا یادداشت مدیریتی
              </label>
              <input
                type="text"
                maxLength={500}
                value={formData.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="توضیح کوتاه درباره مسئولیت‌ها، سوابق یا یادداشت‌های حساب"
                className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 mb-5">
            <Phone className="h-4.5 w-4.5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">اطلاعات ارتباطی و تماس</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                شماره تلفن همراه <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={formData.mobileNumber || ""}
                  onChange={(e) => handleChange("mobileNumber", e.target.value)}
                  placeholder="09123456789"
                  className="w-full h-10 pr-3.5 pl-10 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none transition-colors text-right"
                  dir="ltr"
                />
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500 pointer-events-none" />
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                شماره اصلی جهت ورود به پنل، پیامک‌های رمز یکبارمصرف و هشدارهای امنیتی
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                پست الکترونیک (ایمیل)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="admin@velox.local"
                  className="w-full h-10 pr-3.5 pl-10 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none transition-colors text-right"
                  dir="ltr"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500 pointer-events-none" />
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">
                جهت دریافت مکاتبات سیستمی و گزارش‌های ممیزی
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Info className="h-4 w-4 text-emerald-400" />
            <span>کلیه تغییرات فوراً در نشست جاری و سوابق ممیزی سامانه اعمال خواهند شد.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(profile);
                setErrorMessage(null);
                setSuccessMessage("فرم به مقادیر قبلی بازنشانی شد.");
              }}
              disabled={isSaving}
              className="w-full sm:w-auto rounded-xl"
            >
              <RefreshCw className="h-4 w-4 ml-1.5" />
              <span>بازنشانی</span>
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/25"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 ml-1.5 animate-spin" />
                  <span>در حال ذخیره‌سازی...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-1.5" />
                  <span>ذخیره تغییرات پروفایل</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
