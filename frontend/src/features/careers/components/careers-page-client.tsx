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
  Loader2,
} from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { OPEN_POSITIONS, CAREER_PERKS } from "../mock-data/careers-data";
import { JobPosition } from "../types";
import { careersApi } from "../api/careers-api";
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

function formatJobType(type: string): string {
  switch (type) {
    case "FULL_TIME":
      return "تمام وقت";
    case "PART_TIME":
      return "پاره وقت";
    case "CONTRACT":
      return "پروژه‌ای / قراردادی";
    case "HYBRID":
      return "هیبریدی";
    case "REMOTE":
      return "دورکاری";
    default:
      return type || "تمام وقت";
  }
}

export function CareersPageClient() {
  const [positions, setPositions] = React.useState<JobPosition[]>(OPEN_POSITIONS);
  const [isLoadingPositions, setIsLoadingPositions] = React.useState(true);
  const [selectedPositionId, setSelectedPositionId] = React.useState<string>("");
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const hrEmail = "careers@ghoghnoos.academy";
  const hrPhone = "۰۹۱۳۴۷۶۱۰۹۷";

  // Fetch real positions from backend API
  React.useEffect(() => {
    let isMounted = true;
    async function loadPositions() {
      try {
        const response = await careersApi.getPublicPositions();
        if (isMounted && response?.items && response.items.length > 0) {
          setPositions(response.items);
        }
      } catch (err) {
        console.warn("Could not load backend job positions, using fallback:", err);
      } finally {
        if (isMounted) {
          setIsLoadingPositions(false);
        }
      }
    }

    loadPositions();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Filter out standalone general-cooperation from the card grid if needed, or show all
  const cardPositions = positions.filter((p) => p.slug !== "general-application");

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
            {/* Right Side: Text & Actions */}
            <div className="lg:col-span-7 space-y-5 text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400 shadow-inner">
                <Sparkles className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                <span>جذب نیروی متخصص در دپارتمان‌های فنی، فروش و مارکتینگ</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                آینده شغلی خود را در{" "}
                <span className="bg-gradient-to-l from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  ققنوس آکادمی
                </span>{" "}
                رقم بزنید
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-neutral-300 leading-relaxed max-w-xl">
                ما در ققنوس آکادمی به دنبال متخصصان مشتاق، پویا و متعهد در حوزه‌های تجهیزات شبکه سیسکو، میکروتیک، فیبر نوری، فروش سازمانی و توسعه فناوری هستیم. همراه ما تجربه کار در محیطی حرفه‌ای با پروژه‌های ملی را تجربه کنید.
              </p>

              {/* Quick stats badges */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3.5 py-2">
                  <Building2 className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-neutral-300 font-medium">محیط کاری مدرن و استاندارد</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3.5 py-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-neutral-300 font-medium">بیمه تامین اجتماعی و تکمیلی</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3.5 py-2">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs text-neutral-300 font-medium">مسیر رشد و پاداش منظم</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("resume-form-box");
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition-all duration-150 hover:bg-orange-500 active:scale-[0.98] cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>تکمیل و ارسال فرم رزومه</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("open-positions-section");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/80 px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-200 transition-all duration-150 hover:bg-neutral-700 hover:text-white active:scale-[0.98] cursor-pointer"
                >
                  <span>مشاهده موقعیت‌های باز ({positions.length})</span>
                  <ChevronDown className="h-4 w-4" />
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

          {isLoadingPositions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-2xl border border-neutral-800 bg-[#121215]/80 p-6 space-y-4"
                >
                  <div className="h-4 w-28 bg-neutral-800 rounded" />
                  <div className="h-6 w-48 bg-neutral-700 rounded" />
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-neutral-800 rounded" />
                    <div className="h-4 w-24 bg-neutral-800 rounded" />
                  </div>
                  <div className="h-8 w-full bg-neutral-800 rounded" />
                </div>
              ))}
            </div>
          ) : cardPositions.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center space-y-3">
              <Briefcase className="h-10 w-10 text-neutral-600 mx-auto" />
              <h3 className="text-base font-bold text-white">در حال حاضر موقعیت استخدامی مشخصی درج نشده است</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                شما می‌توانید از طریق فرم زیر، رزومه آزاد خود را ارسال نمایید تا در بانک استعدادهای ما ثبت شود.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {cardPositions.map((position) => {
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
                          <span>{formatJobType(position.type)}</span>
                        </div>
                        {position.experience && (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-neutral-500" />
                            <span>{position.experience}</span>
                          </div>
                        )}
                        {position.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                            <span>{position.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Skill Tags */}
                      {position.skills && position.skills.length > 0 && (
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
                      )}
                    </div>

                    {/* Apply action button */}
                    <div className="pt-5 mt-4 border-t border-neutral-800/80 flex items-center justify-between">
                      <span className="text-xs text-neutral-400">
                        {isSelected ? "در حال ارسال برای این موقعیت" : "فرصت همکاری فعال"}
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
          )}
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
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              مشخصات فردی، موقعیت شغلی مدنظر و فایل رزومه خود را تکمیل فرمایید. سیستم بی‌درنگ کد پیگیری اختصاصی برای شما صادر می‌نماید.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Right side: Resume Upload Form (connected to backend) */}
            <div className="lg:col-span-7">
              <ResumeUploadForm
                positions={positions}
                selectedPositionId={selectedPositionId}
                onPositionChange={setSelectedPositionId}
              />
            </div>

            {/* Left side: Perks & Organizational Benefits */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-neutral-800/90 bg-[#111114]/95 p-6 shadow-xl space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="h-4 w-4 text-orange-400" />
                    <span>چرا همکاری با ققنوس آکادمی؟</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    مزایا و ارزش‌هایی که با پیوستن به خانواده ققنوس آکادمی از آن بهره‌مند می‌شوید:
                  </p>
                </div>

                <div className="space-y-4">
                  {CAREER_PERKS.map((perk) => (
                    <div
                      key={perk.id}
                      className="flex items-start gap-3.5 rounded-xl border border-neutral-800/70 bg-neutral-900/60 p-3.5 transition-colors hover:border-neutral-700"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800/90 border border-neutral-700/60">
                        {renderPerkIcon(perk.iconName)}
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-xs sm:text-sm font-bold text-white">{perk.title}</div>
                        <div className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed">
                          {perk.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct HR Contact Card */}
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 space-y-2.5 text-right">
                  <div className="text-xs font-bold text-orange-300">پرسش یا پیگیری جذب استعدادها:</div>
                  <div className="flex flex-col gap-2 text-xs text-neutral-300">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">شماره کارشناس جذب:</span>
                      <a
                        href={`tel:${hrPhone.replace(/[^0-9]/g, "")}`}
                        className="font-mono text-orange-400 hover:underline"
                        dir="ltr"
                      >
                        {hrPhone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">ایمیل منابع انسانی:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-neutral-300 text-[11px]">{hrEmail}</span>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="rounded p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          title="کپی ایمیل"
                        >
                          {copiedEmail ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section: Recruitment Process (5 Steps) ───────────────────────── */}
        <section className="space-y-6 mb-16">
          <div className="border-b border-neutral-800 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>مراحل شفاف پیوستن به تیم</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              مسیر فرآیند استخدام در ققنوس آکادمی
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              از لحظه ارسال فایل رزومه تا روز نخست شروع به کار در کنار ما، گام‌به‌گام در ۵ مرحله استاندارد.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {RECRUITMENT_STEPS.map((step, idx) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-neutral-800/90 bg-[#111114]/80 p-5 space-y-3 transition-all duration-200 hover:border-orange-500/50 hover:bg-[#15151a]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-orange-500/30">
                    {step.step}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-orange-500/40" />
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{step.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section: FAQ Accordion ────────────────────────────────────────── */}
        <section className="space-y-6 mb-8">
          <div className="border-b border-neutral-800 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 mb-1">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>پرسش‌های متداول</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              سوالات پرتکرار پیرامون استخدام
            </h2>
          </div>

          <div className="space-y-3 max-w-4xl">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-neutral-800 bg-[#121215]/80 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-right transition-colors hover:bg-neutral-800/40 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-neutral-100 flex items-center gap-2">
                      <span className="text-orange-400 font-mono text-xs">۰{index + 1}.</span>
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-orange-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/60 bg-neutral-900/30 animate-fade-in">
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
