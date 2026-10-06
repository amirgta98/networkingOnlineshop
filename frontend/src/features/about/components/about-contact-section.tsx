"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Building2,
  Warehouse,
  ShieldCheck,
  AlertCircle,
  Navigation,
  Compass,
} from "lucide-react";
import { CONTACT_CHANNELS, OFFICE_LOCATION } from "../mock-data/about-data";
import { ContactFormData } from "../types";

export function AboutContactSection() {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [trackingNumber, setTrackingNumber] = React.useState("");

  const [formData, setFormData] = React.useState<ContactFormData>({
    fullName: "",
    phone: "",
    email: "",
    organization: "",
    inquiryType: "sales",
    subject: "",
    message: "",
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(OFFICE_LOCATION.fullAddress);
    setCopiedAddress(true);
    setTimeout(() => {
      setCopiedAddress(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.message) return;

    setIsSubmitting(true);

    // Simulate fast enterprise network processing
    setTimeout(() => {
      const generatedCode = `NM-${Math.floor(100000 + Math.random() * 900000)}`;
      setTrackingNumber(generatedCode);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 900);
  };

  const handleResetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      organization: "",
      inquiryType: "sales",
      subject: "",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <section id="contact-section" className="py-12 sm:py-16 scroll-mt-20">
      <div className="space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1.5 text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>پل‌های ارتباطی مستقیم</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              اطلاعات تماس و نشانی دفاتر ققنوس آکادمی
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md text-right leading-relaxed">
            از مشاوره فنی پیش از خرید تا هماهنگی بازدید حضوری و مکاتبات رسمی، همواره مشتاق
            شنیدن صدای شما هستیم.
          </p>
        </div>

        {/* ── 1. Fast Contact Channels Grid ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONTACT_CHANNELS.map((channel) => {
            const isCopied = copiedId === channel.id;

            return (
              <div
                key={channel.id}
                className="group relative rounded-2xl border border-neutral-800/90 bg-neutral-900/40 p-5 text-right hover:border-neutral-700 hover:bg-neutral-900/70 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-neutral-200">
                      {channel.title}
                    </span>
                    {channel.badge && (
                      <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
                        {channel.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                    {channel.subtitle}
                  </p>

                  <div
                    className="font-mono text-sm sm:text-base font-bold text-white tracking-wide"
                    dir="ltr"
                  >
                    {channel.primaryValue}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                  <a
                    href={channel.actionHref}
                    target={channel.type === "messenger" ? "_blank" : undefined}
                    rel={channel.type === "messenger" ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <span>{channel.actionLabel}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(channel.id, channel.primaryValue)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="کپی کردن شماره یا ایمیل"
                    title="کپی در حافظه"
                  >
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 2. Two-Column Layout: Location & Hours vs. Interactive Form ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Office Address, Warehouse, Interactive Map Card (in RTL: col 5) */}
          <div className="lg:col-span-5 space-y-6 text-right">
            {/* Office Address Card */}
            <div className="rounded-3xl border border-neutral-800/90 bg-neutral-900/40 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-400" />
                  <h3 className="text-sm font-bold text-white">دفتر مرکزی و فروشگاه تخصصی</h3>
                </div>
                <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                  پذیرش حضوری فعال
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>{OFFICE_LOCATION.fullAddress}</span>
                </div>
                <div className="text-[11px] text-neutral-400 pr-6">
                  کد پستی ۱۰ رقمی: <span className="font-mono text-neutral-300">{OFFICE_LOCATION.postalCode}</span>
                </div>
              </div>

              {/* Transit & Commute Guide */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-3.5 space-y-2 text-xs">
                <div className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-sky-400" />
                  <span>دسترسی حمل‌ونقل عمومی:</span>
                </div>
                <div className="text-[11px] text-neutral-400 leading-relaxed pr-5 space-y-1">
                  <div>• {OFFICE_LOCATION.metroAccess}</div>
                  <div>• {OFFICE_LOCATION.brtAccess}</div>
                </div>
              </div>

              {/* Central Warehouse info */}
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-neutral-200">
                  <Warehouse className="h-4 w-4 text-amber-400" />
                  <span>انبار مرکزی و هاب لجستیک:</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed pr-5">
                  {OFFICE_LOCATION.centralWarehouse}
                </p>
              </div>

              {/* Working Hours */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-300 font-bold">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span>ساعات کاری و پاسخگویی تلفنی:</span>
                </div>
                <div className="text-[11px] text-neutral-400 space-y-1 pr-5">
                  <div>{OFFICE_LOCATION.workingHoursWeekday}</div>
                  <div>{OFFICE_LOCATION.workingHoursThursday}</div>
                  <div className="text-emerald-400 font-medium">
                    {OFFICE_LOCATION.technicalEmergency}
                  </div>
                </div>
              </div>

              {/* Map & Routing Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <a
                  href={OFFICE_LOCATION.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 hover:text-white transition-all"
                >
                  <Navigation className="h-3.5 w-3.5 text-sky-400" />
                  <span>گوگل مپ</span>
                </a>

                <a
                  href={OFFICE_LOCATION.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 hover:text-white transition-all"
                >
                  <Navigation className="h-3.5 w-3.5 text-sky-300" />
                  <span>مسیریابی با Waze</span>
                </a>

                <a
                  href={OFFICE_LOCATION.baladUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 hover:text-white transition-all"
                >
                  <Navigation className="h-3.5 w-3.5 text-amber-400" />
                  <span>بلد</span>
                </a>

                <a
                  href={OFFICE_LOCATION.neshanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-200 hover:border-neutral-600 hover:text-white transition-all"
                >
                  <Navigation className="h-3.5 w-3.5 text-blue-400" />
                  <span>نشان</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">نشانی کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-neutral-400" />
                      <span>کپی نشانی</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Online Inquiry Form (in RTL: col 7) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-neutral-800/90 bg-[#121217] p-6 sm:p-8 text-right shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    فرم آنلاین استعلام قیمت و مشاوره مهندسی
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    درخواست شما مستقیماً به کارشناس ارشد دپارتمان مربوطه ارجاع داده خواهد شد.
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 text-center space-y-4"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base sm:text-lg font-bold text-white">
                      درخواست شما با موفقیت در سیستم ثبت گردید
                    </h4>
                    <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                      کارشناسان ققنوس آکادمی پس از بررسی مشخصات تجهیزات، حداکثر ظرف کمتر از ۲ ساعت با
                      شماره تماس شما ارتباط برقرار خواهند کرد.
                    </p>
                  </div>

                  <div className="inline-block rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2 text-xs font-mono text-emerald-300">
                    کد پیگیری درخواست:{" "}
                    <span className="font-black text-white">{trackingNumber}</span>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="inline-flex items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
                    >
                      ثبت یک پیام یا استعلام جدید
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Category Selector Chips */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      موضوع استعلام یا درخواست:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "sales", label: "استعلام قیمت و پیش‌فاکتور" },
                        { id: "enterprise", label: "قرارداد سازمانی و B2B" },
                        { id: "technical", label: "مشاوره فنی و انتخاب کالا" },
                        { id: "cabling", label: "خدمات پسیو و تست فلوک" },
                        { id: "partnership", label: "همکاری تجاری و عاملیت" },
                        { id: "general", label: "سایر موضوعات" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              inquiryType: item.id as ContactFormData["inquiryType"],
                            }))
                          }
                          className={`rounded-xl border p-2.5 text-center text-xs font-medium transition-all cursor-pointer ${
                            formData.inquiryType === item.id
                              ? "border-orange-500 bg-orange-500/15 text-orange-300 font-bold shadow-sm"
                              : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2 Inputs in Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">
                        نام و نام خانوادگی <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        placeholder="مثال: مهندس رادمنش"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">
                        شماره تماس همراه <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="0912xxxxxxx"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">
                        نام سازمان / شرکت / ارگان
                      </label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            organization: e.target.value,
                          }))
                        }
                        placeholder="اختیاری (برای فاکتور رسمی)"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300 block">
                        آدرس ایمیل
                      </label>
                      <input
                        type="email"
                        dir="ltr"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="name@company.com"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors text-right"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300">
                        شرح تجهیزات درخواستی یا پیام <span className="text-orange-400">*</span>
                      </label>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {formData.message.length}/1000
                      </span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      maxLength={1000}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      placeholder="لیست قطعات، پارت‌نامبرها (مثال: WS-C2960X-24TD-L یا کابل Cat6 SFTP لگراند) یا شرح نیاز پروژه خود را بنویسید..."
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-3.5 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>اطلاعات تماس شما نزد ققنوس آکادمی کاملاً محفوظ است.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.97] transition-all px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/20 disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                          <span>در حال ثبت...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>ارسال استعلام و دریافت پیش‌فاکتور</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
