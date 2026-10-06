"use client";

import * as React from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  Building2,
  PhoneCall,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { MOCK_TRACKING_RECORDS } from "../mock-data/installation-data";
import { TrackingRecord } from "../types";
import { toPersianDigits } from "@/shared/lib/utils";

interface InstallationTrackerProps {
  initialCode?: string;
}

export function InstallationTracker({ initialCode = "" }: InstallationTrackerProps) {
  const [trackingInput, setTrackingInput] = React.useState(initialCode);
  const [activeRecord, setActiveRecord] = React.useState<TrackingRecord | null>(() => {
    if (initialCode && MOCK_TRACKING_RECORDS[initialCode]) {
      return MOCK_TRACKING_RECORDS[initialCode];
    }
    return MOCK_TRACKING_RECORDS["NET-INST-4921"];
  });
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  // Sync if initialCode changes externally (e.g. after form submission)
  React.useEffect(() => {
    if (initialCode) {
      setTrackingInput(initialCode);
      if (MOCK_TRACKING_RECORDS[initialCode]) {
        setActiveRecord(MOCK_TRACKING_RECORDS[initialCode]);
        setSearchError(null);
      }
    }
  }, [initialCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    const clean = trackingInput.trim().toUpperCase();
    if (!clean) {
      setSearchError("لطفاً کد رهگیری درخواست خود را وارد کنید.");
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      if (MOCK_TRACKING_RECORDS[clean]) {
        setActiveRecord(MOCK_TRACKING_RECORDS[clean]);
      } else {
        // If it's a validly formatted code, generate a synthetic active record
        if (clean.startsWith("NET-INST-")) {
          setActiveRecord({
            trackingCode: clean,
            clientName: "کاربر گرامی",
            companyName: "سازمان شما",
            serviceTitle: "کابل‌کشی ساختاریافته و تست فلوک شبکه",
            registeredDate: "امروز",
            estimatedCompletion: "ظرف ۳ روز کاری آینده",
            technicianName: "مهندس ناصری (کارشناس ارشد اعزامی)",
            statusPercent: 40,
            currentStepIndex: 1,
            steps: [
              {
                title: "ثبت درخواست در پرتال",
                description: "درخواست با موفقیت ثبت شد و کد رهگیری صادر گردید.",
                date: "امروز - ۱۰:۳۰",
                status: "completed",
              },
              {
                title: "تماس و هماهنگی کارشناس ارشد",
                description: "کارشناس فنی جهت تأیید نیازها با شما تماس خواهد گرفت.",
                date: "در دست اقدام",
                status: "current",
              },
              {
                title: "بازدید حضوری و پیش‌فاکتور نهایی",
                description: "متره‌کشی محل و تعیین لیست دقیق اقلام مصرفی.",
                date: "به زودی",
                status: "upcoming",
              },
              {
                title: "عملیات اجرایی و کابل‌کشی",
                description: "استقرار تیم و ابزارهای استاندارد در محل.",
                date: "مرحله بعدی",
                status: "upcoming",
              },
              {
                title: "تست فلوک و تحویل سرتیفیکیت ۱۸ ماهه",
                description: "تست تمامی نودها و تحویل نقشه نهایی اتوکد.",
                date: "پایان پروژه",
                status: "upcoming",
              },
            ],
          });
        } else {
          setSearchError("کد رهگیری یافت نشد. لطفاً کد را با فرمت NET-INST-XXXX وارد فرمایید.");
        }
      }
    }, 400);
  };

  return (
    <section id="installation-tracker" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-sky-400">
          <Search className="h-4 w-4" />
          <span>رهگیری برخط پروژه‌ها</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          پیگیری لحظه‌ای وضعیت درخواست نصب و اعزام کارشناس
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          با وارد کردن شماره پیگیری درخواست، از وضعیت بررسی فنی، زمان بازدید و پیشرفت کار مطلع شوید.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="rounded-3xl border border-neutral-800 bg-[#121216] p-4 sm:p-6 shadow-xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              dir="ltr"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="مثال: NET-INST-4921"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900/90 py-3 pr-10 pl-4 text-left font-mono text-sm text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/25 transition-all cursor-pointer whitespace-nowrap"
          >
            {isSearching ? "در حال جستجو..." : "بررسی وضعیت"}
          </button>
        </form>

        {/* Quick demo codes hint */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400">
          <span>کدهای نمونه جهت تست:</span>
          {["NET-INST-4921", "NET-INST-7810"].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setTrackingInput(sample);
                setActiveRecord(MOCK_TRACKING_RECORDS[sample]);
                setSearchError(null);
              }}
              className="font-mono text-orange-400 hover:underline cursor-pointer bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800"
              dir="ltr"
            >
              {sample}
            </button>
          ))}
        </div>

        {searchError && (
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-right">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Active Record Details & Pipeline */}
      {activeRecord && (
        <div className="rounded-3xl border border-neutral-800 bg-[#121216] p-5 sm:p-8 shadow-2xl space-y-8 animate-fade-in text-right">
          {/* Top metadata row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">شماره پرونده:</span>
                <span className="font-mono text-sm font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/30" dir="ltr">
                  {activeRecord.trackingCode}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {activeRecord.serviceTitle}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                <span>متقاضی: <strong className="text-neutral-200">{activeRecord.clientName}</strong></span>
                <span>•</span>
                <span>سازمان: <strong className="text-neutral-200">{activeRecord.companyName}</strong></span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1 text-xs">
              <span className="text-neutral-400">پیشرفت کلی پروژه:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-emerald-400">
                  {toPersianDigits(activeRecord.statusPercent)}٪
                </span>
                <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  {activeRecord.statusPercent === 100 ? "تحویل شده" : "در حال پیگیری"}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${activeRecord.statusPercent}%` }}
            />
          </div>

          {/* Pipeline Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {activeRecord.steps.map((st, idx) => {
              const isCompleted = st.status === "completed";
              const isCurrent = st.status === "current";

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-colors ${
                    isCurrent
                      ? "border-orange-500/80 bg-orange-950/20 ring-1 ring-orange-500/40"
                      : isCompleted
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : "border-neutral-800/80 bg-neutral-900/30 opacity-70"
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-500">
                        مرحله {idx + 1}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-neutral-700" />
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white leading-tight">
                      {st.title}
                    </h4>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {st.description}
                    </p>
                  </div>

                  {st.date && (
                    <div className="pt-2 mt-3 border-t border-neutral-800/60 text-[10px] text-neutral-500 font-mono">
                      {st.date}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Technician Contact Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-400">کارشناس ناظر پروژه:</span>
                <span className="font-bold text-white text-sm">
                  {activeRecord.technicianName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-neutral-400">هماهنگی مستقیم یا اعلام تغییرات:</span>
              <a
                href="tel:09134761097"
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-bold transition-colors cursor-pointer"
                dir="ltr"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                <span>۰۲۱ - ۸۸۸۸ ۸۸۸۸</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
