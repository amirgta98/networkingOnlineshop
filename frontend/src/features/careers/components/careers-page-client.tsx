"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Phone,
  Mail,
  FileText,
  ChevronDown,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Users,
  Award,
  HelpCircle,
  Calendar,
  Layers,
  Home,
  ChevronLeft,
} from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { OPEN_POSITIONS, CAREER_PERKS } from "../mock-data/careers-data";
import { ResumeUploadForm } from "./resume-upload-form";
import { CareerLottiePlayer } from "./career-lottie-player";

// FAQ Items
const FAQ_ITEMS = [
  {
    q: "آیا در صورت نبود عنوان شغلی مرتبط، می‌توانم رزومه آزاد بفرستم؟",
    a: "بله، در فرم ارسال رزومه می‌توانید گزینه «سایر تخصص‌ها / رزومه آزاد» را انتخاب کنید. اطلاعات و فایل شما در پایگاه داده استعدادهای ققنوس آکادمی ذخیره شده و در اولین فرصت جذب مرتبط، با شما ارتباط گرفته خواهد شد.",
  },
  {
    q: "فرایند بررسی و پاسخگویی به رزومه‌ها چه مدت طول می‌کشد؟",
    a: "تیم جذب و منابع انسانی ققنوس آکادمی تمامی فایل‌های دریافتی را حداکثر ظرف ۳ الی ۵ روز کاری بررسی می‌نماید. در صورت تأیید سوابق، برای هماهنگی مصاحبه اولیه تماس تلفنی حاصل می‌گردد.",
  },
  {
    q: "وضعیت بیمه و مزایای رفاهی به چه صورت است؟",
    a: "تمامی همکاران از روز اول شروع به کار تحت پوشش بیمه تامین اجتماعی و بیمه تکمیلی درمان قرار می‌گیرند. همچنین پاداش‌های فصلی، دوره‌های آموزشی تخصصی شبکه و هدایای مناسبتی از مزایای سازمانی است.",
  },
  {
    q: "آیا موقعیت‌های شغلی به صورت دورکاری یا هیبریدی امکان‌پذیر است؟",
    a: "نوع همکاری برای هر موقعیت شغلی در جدول مشخص شده است. برخی ردیف‌ها مانند تولید محتوا و سئو به صورت هیبریدی هستند، در حالی که ردیف‌های آزمایشگاهی و تکنسین شبکه نیازمند حضور در دفتر یا پروژه‌ها می‌باشند.",
  },
];

// 5 Recruitment Workflow Steps
const RECRUITMENT_STEPS = [
  {
    step: "۰۱",
    title: "ارسال رزومه و فرم آنلاین",
    description: "تکمیل مشخصات فردی و بارگذاری فایل رزومه معتبر (PDF یا DOCX) از طریق همین صفحه.",
  },
  {
    step: "۰۲",
    title: "غربالگری اولیه منابع انسانی",
    description: "بررسی انطباق تخصص و پیش‌نیازهای مهارتی ظرف ۳ تا ۵ روز کاری توسط کارشناسان جذب.",
  },
  {
    step: "۰۳",
    title: "مصاحبه تلفنی و ارزیابی عمومی",
    description: "گفتگوی کوتاه تلفنی پیرامون سوابق کاری، انتظارات شغلی و هماهنگی جلسه حضوری.",
  },
  {
    step: "۰۴",
    title: "مصاحبه تخصصی و آزمون مهارتی",
    description: "جلسه فنی با مدیران دپارتمان تخصصی (فنی، فروش یا مارکتینگ) و بررسی عملی تجربیات.",
  },
  {
    step: "۰۵",
    title: "پیشنهاد همکاری و آنبوردینگ",
    description: "ارائه پیشنهاد رسمی شغلی (Job Offer)، عقد قرارداد و آغاز دوره معارفه و همراهی در ققنوس آکادمی.",
  },
];

export function CareersPageClient() {
  const [selectedPositionId, setSelectedPositionId] = React.useState<string>("");
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const hrEmail = "careers@ghoghnoos.academy";
  const hrPhone = "۰۹۱۳۴۷۶۱۰۹۷";

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(hrEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleSelectPosition = (id: string) => {
    setSelectedPositionId(id);
    const formElement = document.getElementById("resume-form-box");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const renderPerkIcon = (iconName: string) => {
    switch (iconName) {
      case "trending-up":
        return <TrendingUp className="h-5 w-5 text-orange-400" />;
      case "shield":
        return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
      case "cpu":
        return <Cpu className="h-5 w-5 text-indigo-400" />;
      case "users":
        return <Users className="h-5 w-5 text-amber-400" />;
      default:
        return <Award className="h-5 w-5 text-orange-400" />;
    }
  };

  return (
    <div className="py-6 sm:py-10 space-y-16" dir="rtl">
      <Container>
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav
          className="mb-6 flex items-center gap-1.5 text-xs text-neutral-400"
          aria-label="مسیر راهنما"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>خانه</span>
          </Link>
          <ChevronLeft className="h-3 w-3 text-neutral-600" />
          <span className="text-orange-400 font-medium flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            <span>همکاری با ققنوس آکادمی و ارسال رزومه</span>
          </span>
        </nav>

        {/* ── Hero Banner with Ambient Glow & Lottie ────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-neutral-800/90 bg-[#111114]/95 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl mb-12">
          {/* Subtle gradient border highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-60"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange-500/10 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Right Side: Headlines and overview */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-semibold text-orange-400 max-w-full">
                <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-led-pulse" />
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate whitespace-nowrap">دعوت به همکاری تخصصی در ققنوس آکادمی</span>
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                همکاری با ققنوس آکادمی و <span className="text-orange-500">ارسال رزومه کاری</span>
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                ققنوس آکادمی، مرجع تخصصی تأمین و اجرای زیرساخت‌های شبکه سازمانی، دیتاسنتر و فناوری اطلاعات، از مهندسان، متخصصان و کارشناسان پرشور دعوت به همراهی می‌نماید. رزومه خود را برای ردیف‌های شغلی باز ارسال نمایید تا مسیر موفقیت حرفه‌ای خود را آغاز کنید.
              </p>

              {/* Quick stats pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5 sm:p-3 text-right">
                  <div className="text-base sm:text-lg font-bold text-orange-400 font-mono whitespace-nowrap">۳ الی ۵ روز</div>
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 truncate">زمان بررسی اولیه رزومه‌ها</div>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5 sm:p-3 text-right">
                  <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono whitespace-nowrap">بیمه از روز ۱</div>
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 truncate">تامین اجتماعی + تکمیلی</div>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5 sm:p-3 text-right">
                  <div className="text-base sm:text-lg font-bold text-indigo-400 font-mono whitespace-nowrap">لابراتوار فنی</div>
                  <div className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 truncate">تجهیزات مدرن سیسکو و شبکه</div>
                </div>
              </div>

              {/* Quick Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3">
                <button
                  onClick={() => {
                    document.getElementById("open-positions-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>مشاهده موقعیت‌های شغلی فعال</span>
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                </button>

                <button
                  onClick={() => {
                    document.getElementById("resume-form-box")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-200 hover:border-neutral-600 hover:text-white transition-all cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-orange-400" />
                  <span>تکمیل سریع فرم ارسال رزومه</span>
                </button>
              </div>
            </div>

            {/* Left Side: Animated High-Tech Lottie Visual */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <CareerLottiePlayer />
            </div>
          </div>
        </div>

        {/* ── Section: Open Job Positions ──────────────────────────────────── */}
        <section id="open-positions-section" className="space-y-6 mb-16 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-1">
                <Layers className="h-3.5 w-3.5" />
                <span>فرصت‌های استخدام فعال</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                موقعیت‌های شغلی فعال در ققنوس آکادمی
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
              با انتخاب هر ردیف شغلی، عنوان آن به طور خودکار در فرم ارسال رزومه پایین صفحه تنظیم می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {OPEN_POSITIONS.map((position) => {
              const isSelected = selectedPositionId === position.id;
              return (
                <div
                  key={position.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                    isSelected
                      ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/30"
                      : "border-neutral-800 bg-[#121215]/90 hover:border-neutral-700 hover:bg-[#15151a]"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header: Title and Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-medium text-orange-400">
                          {position.department}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 group-hover:text-orange-300 transition-colors">
                          {position.title}
                        </h3>
                      </div>
                      {position.badge && (
                        <span className="shrink-0 rounded-full border border-orange-500/30 bg-orange-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-orange-300">
                          {position.badge}
                        </span>
                      )}
                    </div>

                    {/* Meta info pills */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{position.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{position.experience}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{position.location}</span>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="pt-2">
                      <div className="text-[11px] text-neutral-500 mb-1.5">مهارت‌های کلیدی:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {position.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1 text-[11px] font-mono text-neutral-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Apply action button */}
                  <div className="pt-5 mt-4 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      {isSelected ? "در حال ارسال برای این موقعیت" : "نیاز به استخدام سریع"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectPosition(position.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                          : "border border-neutral-700 bg-neutral-800/80 text-neutral-200 hover:border-orange-500 hover:text-white hover:bg-neutral-800"
                      }`}
                    >
                      <span>ارسال رزومه برای این موقعیت</span>
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Section: Resume Upload Form & Perks Split Layout ─────────────── */}
        <section id="resume-form-section" className="space-y-6 mb-16 scroll-mt-24">
          <div className="border-b border-neutral-800 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-1">
              <FileText className="h-3.5 w-3.5" />
              <span>ثبت مستقیم درخواست همکاری</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              فرم آنلاین ثبت و بارگذاری رزومه
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              مشخصات و فایل رزومه خود را در فرم زیر وارد فرمایید. پس از ارسال، کد پیگیری اختصاصی دریافت خواهید کرد.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Column 1 (Form): 7 Cols */}
            <div className="lg:col-span-7">
              <ResumeUploadForm
                selectedPositionId={selectedPositionId}
                onPositionChange={setSelectedPositionId}
              />
            </div>

            {/* Column 2 (Perks & Direct Contacts): 5 Cols */}
            <div className="lg:col-span-5 space-y-6">
              {/* Perks card */}
              <div className="rounded-2xl border border-neutral-800/90 bg-[#111114]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <h3 className="text-base font-bold text-white">مزایای همکاری با ققنوس آکادمی</h3>
                </div>

                <div className="space-y-4">
                  {CAREER_PERKS.map((perk) => (
                    <div key={perk.id} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 mt-0.5">
                        {renderPerkIcon(perk.iconName)}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-200">
                          {perk.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed mt-0.5">
                          {perk.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Alternative Contacts Card */}
              <div className="rounded-2xl border border-neutral-800/90 bg-[#111114]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Send className="h-4 w-4 text-orange-400" />
                  <h3 className="text-base font-bold text-white">مسیرهای ارتباط مستقیم با واحد جذب</h3>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  در صورت بروز هرگونه سوال پیرامون موقعیت‌های شغلی یا بروز مشکل در ارسال فایل، می‌توانید مستقیماً از طریق راه‌های زیر با کارشناسان منابع انسانی در ارتباط باشید:
                </p>

                {/* Email line with copy button */}
                <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-400" />
                    <span className="text-neutral-400">ایمیل واحد جذب:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1.5 font-mono text-neutral-200 hover:text-orange-400 transition-colors cursor-pointer bg-neutral-800/80 px-2 py-1 rounded-lg border border-neutral-700/60"
                      title="کپی آدرس ایمیل"
                    >
                      <span>{hrEmail}</span>
                      {copiedEmail ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-neutral-400" />
                      )}
                    </button>
                    {copiedEmail && (
                      <span className="text-[11px] text-emerald-400 font-sans">کپی شد!</span>
                    )}
                  </div>
                </div>

                {/* Phone contact */}
                <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-indigo-400" />
                    <span className="text-neutral-400">تلفن مستقیم کارشناس HR:</span>
                  </div>
                  <a
                    href="tel:09134761097"
                    dir="ltr"
                    className="font-mono text-neutral-200 hover:text-orange-400 transition-colors"
                  >
                    {hrPhone}
                  </a>
                </div>

                {/* Telegram contact */}
                <a
                  href="https://t.me/ghoghnoos_academy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 text-xs text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/80 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-sky-400" />
                    <span>ارتباط مستقیم در تلگرام</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-neutral-400 group-hover:text-white">
                    <span>@ghoghnoos_academy</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>

                <div className="text-[11px] text-neutral-500 pt-1">
                  ساعت پاسخگویی: شنبه تا چهارشنبه ۹:۰۰ الی ۱۷:۳۰ — پنج‌شنبه‌ها ۹:۰۰ الی ۱۳:۳۰
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section: 5 Recruitment Steps Timeline ─────────────────────────── */}
        <section className="space-y-6 mb-16">
          <div className="border-b border-neutral-800 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>فرآیند جذب شفاف</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              مراحل استخدام در ققنوس آکادمی
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
              از ارسال رزومه تا روز نخست شروع به کار، مسیری منسجم و محترمانه را در کنار هم طی خواهیم کرد.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {RECRUITMENT_STEPS.map((stepItem, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-neutral-800 bg-[#111114]/90 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                      مرحله {stepItem.step}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-neutral-600" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5">
                    {stepItem.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section: FAQ Accordion ────────────────────────────────────────── */}
        <section className="space-y-6 mb-12">
          <div className="border-b border-neutral-800 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-1">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>پاسخ به سوالات پرتکرار</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              سوالات متداول متقاضیان استخدام
            </h2>
          </div>

          <div className="space-y-3 max-w-4xl">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-neutral-800 bg-[#111114]/90 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-right cursor-pointer hover:bg-neutral-900/50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-neutral-200">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-neutral-400 transition-transform duration-200 shrink-0 mr-2 ${
                        isOpen ? "rotate-180 text-orange-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/60 pt-3 animate-fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </Container>
    </div>
  );
}
