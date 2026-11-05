"use client";

import * as React from "react";
import {
  Phone,
  PhoneCall,
  Mail,
  Send,
  Globe,
  MapPin,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Users,
  Share2,
  Navigation,
  Sparkles,
  Info,
} from "lucide-react";
import {
  useContactSettings,
  useUpdateContactSettings,
  DEFAULT_CONTACT_SETTINGS,
  type SiteContactSettings,
} from "@/features/contact-settings";

export function AdminContactSettingsView() {
  const { settings, isLoading, isError, refetch } = useContactSettings();
  const updateMutation = useUpdateContactSettings();

  const [formData, setFormData] = React.useState<SiteContactSettings>(settings);
  const [toastMessage, setToastMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync form state when query data arrives
  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleFieldChange = (field: keyof SiteContactSettings, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTestLink = (url?: string) => {
    if (!url) {
      showToast("لطفاً ابتدا مقداری برای این فیلد وارد نمایید.", "error");
      return;
    }
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      window.open(cleanUrl, "_blank", "noopener,noreferrer");
    } else if (cleanUrl.startsWith("tg://") || cleanUrl.startsWith("tel:") || cleanUrl.startsWith("mailto:")) {
      window.open(cleanUrl, "_blank");
    } else if (cleanUrl.startsWith("@")) {
      window.open(`https://t.me/${cleanUrl.replace("@", "")}`, "_blank", "noopener,noreferrer");
    } else {
      window.open(`https://${cleanUrl}`, "_blank", "noopener,noreferrer");
    }
  };

  const handleTestPhone = (phone?: string) => {
    if (!phone) {
      showToast("شماره تلفنی وارد نشده است.", "error");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleTestEmail = (email?: string) => {
    if (!email) {
      showToast("ایمیلی وارد نشده است.", "error");
      return;
    }
    window.location.href = `mailto:${email.trim()}`;
  };

  const handleResetToDefaults = () => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید مقادیر فرم به حالت پیش‌فرض اولیه بازگردانده شوند؟")) {
      setFormData(DEFAULT_CONTACT_SETTINGS);
      showToast("فرم با مقادیر اولیه جایگزین شد. برای اعمال روی سایت دکمه ذخیره تغییرات را بزنید.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync(formData);
      showToast("تنظیمات تماس، شبکه‌های اجتماعی و آدرس سایت با موفقیت ذخیره و در سراسر سایت اعمال شد.");
    } catch (err: unknown) {
      console.error("Save contact settings error:", err);
      showToast(
        err instanceof Error ? err.message : "خطایی در ذخیره‌سازی تنظیمات رخ داد. لطفاً مجدداً تلاش فرمایید.",
        "error",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-neutral-400">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="text-sm">در حال دریافت تنظیمات تماس سایت...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Toast Notification ────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md ${
              toastMessage.type === "success"
                ? "bg-emerald-950/95 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/95 border-red-500/40 text-red-300"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ── Top Header & Actions ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
            <Phone className="h-3.5 w-3.5" />
            <span>تنظیمات ارتباطی و شبکه‌های اجتماعی</span>
            <Sparkles className="h-3 w-3" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            تنظیمات تماس، شبکه‌های اجتماعی و نشانی
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-2xl">
            تمام شماره‌های تماس هدر، فوتر، صفحات درباره ما و واحد جذب از این بخش به صورت یکپارچه مدیریت و بلافاصله بر روی سایت منعکس می‌شوند.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 hover:text-white px-4 py-2.5 text-xs font-semibold text-neutral-300 transition-all cursor-pointer"
            title="بازنشانی به مقادیر اولیه"
          >
            <RotateCcw className="h-4 w-4 text-neutral-400" />
            <span>بازنشانی پیش‌فرض</span>
          </button>

          <button
            type="submit"
            form="contact-settings-form"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-[0.98] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition-all cursor-pointer disabled:opacity-60"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>ذخیره تغییرات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Form ─────────────────────────────────────────────────── */}
      <form id="contact-settings-form" onSubmit={handleSubmit} className="space-y-8">
        {/* ── Card 1: واحد جذب و منابع انسانی ─────────────────────────── */}
        <div className="rounded-3xl border border-neutral-800 bg-[#121217] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  کارت ۱: واحد جذب و منابع انسانی (استخدام)
                </h2>
                <p className="text-xs text-neutral-400">
                  اطلاعات تماس کارشناس جذب و کانال تلگرام که در بخش همکاری با ما و صفحه رزومه‌ها نمایش داده می‌شود.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-400">
              فرصت‌های شغلی
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Field: recruitmentTelegram */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                آیدی تلگرام واحد جذب:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={formData.recruitmentTelegram || ""}
                    onChange={(e) => handleFieldChange("recruitmentTelegram", e.target.value)}
                    placeholder="@ghoghnoos_academy"
                    dir="ltr"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.recruitmentTelegram)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-sky-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست باز کردن تلگرام"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                با یا بدون @ (در مودال دیپ‌لینک اختصاصی به صورت هوشمند باز خواهد شد).
              </p>
            </div>

            {/* Field: recruitmentPhone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                شماره تماس مستقیم کارشناس جذب:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.recruitmentPhone || ""}
                  onChange={(e) => handleFieldChange("recruitmentPhone", e.target.value)}
                  placeholder="09134761097"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestPhone(formData.recruitmentPhone)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست تماس"
                >
                  <PhoneCall className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                شماره موبایل یا خط مستقیم متصل به بخش مصاحبه‌های استخدامی.
              </p>
            </div>

            {/* Field: recruitmentEmail */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                ایمیل اختصاصی ارسال رزومه:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={formData.recruitmentEmail || ""}
                  onChange={(e) => handleFieldChange("recruitmentEmail", e.target.value)}
                  placeholder="careers@ghoghnoos.academy"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestEmail(formData.recruitmentEmail)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست ایمیل"
                >
                  <Mail className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                آدرس ایمیل واحد منابع انسانی برای دریافت مستقیم مدارک کارجویان.
              </p>
            </div>
          </div>
        </div>

        {/* ── Card 2: خطوط تماس و پشتیبانی مرکزی ───────────────────────── */}
        <div className="rounded-3xl border border-neutral-800 bg-[#121217] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  کارت ۲: خطوط تماس و پشتیبانی مرکزی
                </h2>
                <p className="text-xs text-neutral-400">
                  شماره‌های تلفن نوار بالای هدر، ۴ شماره فوتر، سایدبار و صفحه درباره ما.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-400">
              هدر و فوتر سراسری
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* mainPhone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                تلفن اصلی سایت (هدر و فوتر):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.mainPhone || ""}
                  onChange={(e) => handleFieldChange("mainPhone", e.target.value)}
                  placeholder="09134761097"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestPhone(formData.mainPhone)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-orange-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست تماس"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                شماره اصلی در بالای تمام صفحات و فوتر اصلی نمایش می‌یابد.
              </p>
            </div>

            {/* supportPhone1 */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                پشتیبانی و فروش (خط همراه ۲):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.supportPhone1 || ""}
                  onChange={(e) => handleFieldChange("supportPhone1", e.target.value)}
                  placeholder="09224761097"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestPhone(formData.supportPhone1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست تماس"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                خط تماس پیگیری سفارشات و بخش فروش تجهیزات شبکه.
              </p>
            </div>

            {/* supportPhone2 */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                مشاوره فنی و زیرساخت (خط همراه ۳):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.supportPhone2 || ""}
                  onChange={(e) => handleFieldChange("supportPhone2", e.target.value)}
                  placeholder="09354761097"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestPhone(formData.supportPhone2)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست تماس"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                خط مشاوره تخصصی سوییچ، روتر و پروژه‌های پسیو/اکتیو.
              </p>
            </div>

            {/* emergencyPhone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                کشیک شبانه‌روزی و حوادث ۲۴/۷ (خط همراه ۴):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.emergencyPhone || ""}
                  onChange={(e) => handleFieldChange("emergencyPhone", e.target.value)}
                  placeholder="09004761097"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestPhone(formData.emergencyPhone)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست تماس"
                >
                  <Phone className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                شماره اضطراری برای حوادث و قطعی‌های بحرانی سرور و اینترنت.
              </p>
            </div>

            {/* generalEmail */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-200">
                ایمیل رسمی و مکاتبات سازمانی:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={formData.generalEmail || ""}
                  onChange={(e) => handleFieldChange("generalEmail", e.target.value)}
                  placeholder="info@ghoghnoos.academy"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestEmail(formData.generalEmail)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست ایمیل"
                >
                  <Mail className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                ایمیل عمومی برای مناقصات، درخواست‌های اداری و نامه‌نگاری رسمی.
              </p>
            </div>
          </div>
        </div>

        {/* ── Card 3: پیام‌رسان‌ها و سوشال مدیا ────────────────────────── */}
        <div className="rounded-3xl border border-neutral-800 bg-[#121217] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  کارت ۳: پیام‌رسان‌ها و سوشال مدیا
                </h2>
                <p className="text-xs text-neutral-400">
                  لینک‌های شبکه‌های اجتماعی، کانال تلگرام، واتس‌اپ، اینستاگرام، آپارات و یوتیوب.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-400">
              رسانه‌ها و شبکه‌ها
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* whatsappNumber */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                شماره واتساپ پشتیبانی:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.whatsappNumber || ""}
                  onChange={(e) => handleFieldChange("whatsappNumber", e.target.value)}
                  placeholder="09134761097"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    const clean = (formData.whatsappNumber || "").replace(/[^0-9]/g, "");
                    const international = clean.startsWith("0") ? `98${clean.slice(1)}` : clean;
                    handleTestLink(`https://wa.me/${international}`);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-emerald-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست چت واتساپ"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                شماره جهت هدایت کاربر به لینک مستقیم wa.me در صفحه درباره ما.
              </p>
            </div>

            {/* telegramChannelUrl */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                لینک کانال عمومی تلگرام:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.telegramChannelUrl || ""}
                  onChange={(e) => handleFieldChange("telegramChannelUrl", e.target.value)}
                  placeholder="https://t.me/ghoghnoos_academy"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.telegramChannelUrl)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-sky-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست لینک تلگرام"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                کانال اطلاع‌رسانی تخفیف‌ها، مقالات و آموزش‌های شبکه.
              </p>
            </div>

            {/* instagramUrl */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                لینک صفحه اینستاگرام:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.instagramUrl || ""}
                  onChange={(e) => handleFieldChange("instagramUrl", e.target.value)}
                  placeholder="https://instagram.com/ghoghnoos_academy"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.instagramUrl)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-pink-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست لینک اینستاگرام"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                پیج رسمی ققنوس آکادمی جهت ویدیوها و معرفی محصولات.
              </p>
            </div>

            {/* linkedinUrl */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                لینک صفحه لینکدین:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.linkedinUrl || ""}
                  onChange={(e) => handleFieldChange("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/company/ghoghnoos-academy"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.linkedinUrl)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-blue-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست لینک لینکدین"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                پروفایل رسمی شرکتی جهت ارتباط با متخصصین و سازمان‌ها.
              </p>
            </div>

            {/* youtubeUrl */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                لینک کانال یوتیوب:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.youtubeUrl || ""}
                  onChange={(e) => handleFieldChange("youtubeUrl", e.target.value)}
                  placeholder="https://youtube.com/@ghoghnoos_academy"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.youtubeUrl)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-red-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست لینک یوتیوب"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                کانال انتشار دوره‌های آموزشی و تحلیل کانفیگ روترها.
              </p>
            </div>

            {/* aparatUrl */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                لینک کانال رسمی آپارات:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.aparatUrl || ""}
                  onChange={(e) => handleFieldChange("aparatUrl", e.target.value)}
                  placeholder="https://aparat.com/ghoghnoos_academy"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleTestLink(formData.aparatUrl)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-rose-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="تست لینک آپارات"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                کانال آپارات برای دسترسی بدون محدودیت کاربران داخلی.
              </p>
            </div>
          </div>
        </div>

        {/* ── Card 4: نشانی و ناوبری ───────────────────────────────────── */}
        <div className="rounded-3xl border border-neutral-800 bg-[#121217] p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  کارت ۴: نشانی، کد پستی و لینک‌های ناوبری
                </h2>
                <p className="text-xs text-neutral-400">
                  متن رسمی آدرس دفتر مرکزی و دکمه‌های مسیریابی گوگل‌مپ، نشان و بلد در صفحه درباره ما.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
              موقعیت مکانی
            </span>
          </div>

          <div className="space-y-5">
            {/* Address */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-200">
                متن کامل نشانی دفتر مرکزی:
              </label>
              <textarea
                rows={3}
                value={formData.address || ""}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                placeholder="تهران، خیابان ولیعصر، بالاتر از تقاطع میرداماد، مجتمع تجاری و اداری پایتخت، برج شماره ۲، طبقه ۷، واحد ۷۰۴"
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:border-emerald-500 focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            {/* Postal Code & Map URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* postalCode */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-200">
                  کد پستی ۱۰ رقمی:
                </label>
                <input
                  type="text"
                  value={formData.postalCode || ""}
                  onChange={(e) => handleFieldChange("postalCode", e.target.value)}
                  placeholder="1969764321"
                  dir="ltr"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* googleMapsUrl */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-200">
                  لینک گوگل‌مپ (Google Maps):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.googleMapsUrl || ""}
                    onChange={(e) => handleFieldChange("googleMapsUrl", e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    dir="ltr"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestLink(formData.googleMapsUrl)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-sky-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                    title="تست گوگل مپ"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* neshanUrl */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-200">
                  لینک نقشه نشان (Neshan):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.neshanUrl || ""}
                    onChange={(e) => handleFieldChange("neshanUrl", e.target.value)}
                    placeholder="https://neshan.org/maps/@..."
                    dir="ltr"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestLink(formData.neshanUrl)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-blue-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                    title="تست نقشه نشان"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* baladUrl */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-200">
                  لینک نقشه بلد (Balad):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.baladUrl || ""}
                    onChange={(e) => handleFieldChange("baladUrl", e.target.value)}
                    placeholder="https://balad.ir/location?..."
                    dir="ltr"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleTestLink(formData.baladUrl)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-amber-400 hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                    title="تست نقشه بلد"
                  >
                    <Navigation className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Floating/Sticky Save Action Bar ───────────────────── */}
        <div className="sticky bottom-4 z-20 rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Info className="h-4 w-4 text-orange-400 shrink-0" />
            <span>با کلیک روی ذخیره تغییرات، کش تمام کلاینت‌ها بی‌درنگ باطل شده و داده‌های جدید رندر می‌شوند.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetToDefaults}
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              انصراف و پیش‌فرض
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition-all cursor-pointer disabled:opacity-60"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>ذخیره کلیه تنظیمات</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
