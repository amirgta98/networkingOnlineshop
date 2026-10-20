"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import {
  JALALI_MONTH_NAMES,
  JALALI_SHORT_WEEKDAYS,
  dateToJalali,
  jalaliToDate,
  getDaysInJalaliMonth,
  getFirstDayOfJalaliMonthWeekday,
  formatPersianDateTime,
} from "@/shared/lib/jalali";
import { toPersianDigits } from "@/shared/lib/utils";

export interface JalaliDateTimePickerProps {
  label: string;
  value: string; // ISO string e.g. "2026-10-20T10:00:00.000Z"
  onChange: (isoString: string) => void;
  required?: boolean;
  error?: string | null;
  helperText?: string;
}

export function JalaliDateTimePicker({
  label,
  value,
  onChange,
  required = false,
  error,
  helperText,
}: JalaliDateTimePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Parse current value to Jalali
  const parsedJalali = React.useMemo(() => {
    return dateToJalali(value || new Date());
  }, [value]);

  // Current view year & month inside the modal calendar
  const [viewYear, setViewYear] = React.useState<number>(parsedJalali.year);
  const [viewMonth, setViewMonth] = React.useState<number>(parsedJalali.month);

  // Sync internal view when value changes
  React.useEffect(() => {
    if (value) {
      const j = dateToJalali(value);
      setViewYear(j.year);
      setViewMonth(j.month);
    }
  }, [value]);

  // Today in Jalali
  const todayJalali = React.useMemo(() => dateToJalali(new Date()), []);

  // Available years: current year - 1 to current year + 4
  const yearOptions = React.useMemo(() => {
    const currentY = todayJalali.year;
    const years: number[] = [];
    for (let y = currentY - 1; y <= currentY + 5; y++) {
      years.push(y);
    }
    return years;
  }, [todayJalali.year]);

  // Days in current selected month
  const currentMonthDaysCount = React.useMemo(() => {
    return getDaysInJalaliMonth(parsedJalali.year, parsedJalali.month);
  }, [parsedJalali.year, parsedJalali.month]);

  // Calendar month days and weekday offset
  const calendarDaysInMonth = React.useMemo(() => {
    return getDaysInJalaliMonth(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  const calendarFirstDayWeekdayIndex = React.useMemo(() => {
    return getFirstDayOfJalaliMonthWeekday(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  // Direct segment updates from form
  const handleUpdateSegment = (
    field: "year" | "month" | "day" | "hour" | "minute",
    val: number
  ) => {
    const nextYear = field === "year" ? val : parsedJalali.year;
    const nextMonth = field === "month" ? val : parsedJalali.month;
    const maxDay = getDaysInJalaliMonth(nextYear, nextMonth);
    const nextDay = field === "day" ? Math.min(val, maxDay) : Math.min(parsedJalali.day, maxDay);
    const nextHour = field === "hour" ? val : parsedJalali.hour;
    const nextMinute = field === "minute" ? val : parsedJalali.minute;

    const newDate = jalaliToDate(nextYear, nextMonth, nextDay, nextHour, nextMinute);
    onChange(newDate.toISOString());
  };

  // Month navigation in calendar dialog
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Day selection from calendar dialog
  const handleSelectCalendarDay = (day: number) => {
    const newDate = jalaliToDate(
      viewYear,
      viewMonth,
      day,
      parsedJalali.hour,
      parsedJalali.minute
    );
    onChange(newDate.toISOString());
  };

  // Quick Presets
  const applyPreset = (preset: "now" | "+2d" | "+4d" | "+1w" | "+2w" | "+1m") => {
    const now = new Date();
    let target = new Date();
    if (preset === "now") {
      target = new Date();
    } else if (preset === "+2d") {
      target = new Date(now.getTime() + 2 * 24 * 3600 * 1000);
    } else if (preset === "+4d") {
      target = new Date(now.getTime() + 4 * 24 * 3600 * 1000);
    } else if (preset === "+1w") {
      target = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    } else if (preset === "+2w") {
      target = new Date(now.getTime() + 14 * 24 * 3600 * 1000);
    } else if (preset === "+1m") {
      target = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
    }
    onChange(target.toISOString());
    const j = dateToJalali(target);
    setViewYear(j.year);
    setViewMonth(j.month);
  };

  // Quick time pills
  const applyQuickTime = (hour: number, minute: number) => {
    const newDate = jalaliToDate(
      parsedJalali.year,
      parsedJalali.month,
      parsedJalali.day,
      hour,
      minute
    );
    onChange(newDate.toISOString());
  };

  return (
    <div className="space-y-2 text-right font-sans">
      {/* Header Label and Human-Readable Preview */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5 text-orange-400" />
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        {value && (
          <span className="text-[11px] text-orange-400 font-bold bg-orange-950/40 border border-orange-500/20 px-2 py-0.5 rounded-lg">
            {formatPersianDateTime(value)}
          </span>
        )}
      </div>

      {/* Main Direct Shamsi Control Bar */}
      <div
        className={`rounded-xl border p-2.5 transition-all bg-neutral-900/90 flex flex-wrap items-center justify-between gap-2 ${
          error ? "border-red-500/60" : "border-neutral-800 focus-within:border-orange-500"
        }`}
      >
        {/* Date Segments (Day, Month, Year) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Day */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-neutral-400">روز:</span>
            <select
              value={parsedJalali.day}
              onChange={(e) => handleUpdateSegment("day", Number(e.target.value))}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-100 font-bold focus:border-orange-500 focus:outline-none cursor-pointer font-mono"
            >
              {Array.from({ length: currentMonthDaysCount }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {toPersianDigits(idx + 1)}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-neutral-400">ماه:</span>
            <select
              value={parsedJalali.month}
              onChange={(e) => handleUpdateSegment("month", Number(e.target.value))}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs text-neutral-100 font-bold focus:border-orange-500 focus:outline-none cursor-pointer"
            >
              {JALALI_MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-neutral-400">سال:</span>
            <select
              value={parsedJalali.year}
              onChange={(e) => handleUpdateSegment("year", Number(e.target.value))}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-100 font-bold focus:border-orange-500 focus:outline-none cursor-pointer font-mono"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {toPersianDigits(y)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Segments & Calendar Dialog Trigger */}
        <div className="flex items-center gap-2">
          {/* Time: Hour & Minute */}
          <div className="flex items-center gap-1 bg-neutral-800/80 border border-neutral-700/60 rounded-lg px-2 py-0.5">
            <Clock className="h-3 w-3 text-neutral-400 ml-0.5" />
            <select
              value={parsedJalali.hour}
              onChange={(e) => handleUpdateSegment("hour", Number(e.target.value))}
              className="bg-transparent text-xs text-neutral-200 font-bold focus:outline-none font-mono cursor-pointer"
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={h} className="bg-neutral-900 text-neutral-100">
                  {toPersianDigits(String(h).padStart(2, "0"))}
                </option>
              ))}
            </select>
            <span className="text-neutral-500 font-bold">:</span>
            <select
              value={parsedJalali.minute}
              onChange={(e) => handleUpdateSegment("minute", Number(e.target.value))}
              className="bg-transparent text-xs text-neutral-200 font-bold focus:outline-none font-mono cursor-pointer"
            >
              {Array.from({ length: 60 }).map((_, m) => (
                <option key={m} value={m} className="bg-neutral-900 text-neutral-100">
                  {toPersianDigits(String(m).padStart(2, "0"))}
                </option>
              ))}
            </select>
          </div>

          {/* Graphical Calendar Popover Trigger */}
          <button
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-950/40 px-2.5 py-1 text-xs text-orange-400 font-bold hover:bg-orange-600 hover:text-white transition-colors"
            title="باز کردن تقویم گرافیکی شمسی"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>تقویم شمسی</span>
          </button>
        </div>
      </div>

      {/* Quick Presets Pills right below control bar */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[10px] text-neutral-500 flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5 text-orange-400" /> میانبر:
        </span>
        <button
          type="button"
          onClick={() => applyPreset("now")}
          className="rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-orange-500/40 hover:text-orange-400 transition-colors"
        >
          هم‌اکنون
        </button>
        <button
          type="button"
          onClick={() => applyPreset("+2d")}
          className="rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-orange-500/40 hover:text-orange-400 transition-colors"
        >
          ۲ روز دیگر
        </button>
        <button
          type="button"
          onClick={() => applyPreset("+4d")}
          className="rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-orange-500/40 hover:text-orange-400 transition-colors"
        >
          ۴ روز دیگر
        </button>
        <button
          type="button"
          onClick={() => applyPreset("+1w")}
          className="rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-orange-500/40 hover:text-orange-400 transition-colors"
        >
          ۱ هفته دیگر
        </button>
        <button
          type="button"
          onClick={() => applyPreset("+1m")}
          className="rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-orange-500/40 hover:text-orange-400 transition-colors"
        >
          ۱ ماه دیگر
        </button>
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-neutral-500">{helperText}</p>
      )}
      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {/* Floating Center Modal for Graphical Calendar Grid */}
      {isCalendarOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsCalendarOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-neutral-700 bg-[#141418] p-5 shadow-2xl space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-bold text-white">
                  تقویم و ساعت شمسی: {label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white"
                title="ماه بعد"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(Number(e.target.value))}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-100 font-bold focus:border-orange-500 focus:outline-none cursor-pointer"
                >
                  {JALALI_MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx + 1}>
                      {name} (ماه {toPersianDigits(idx + 1)})
                    </option>
                  ))}
                </select>

                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(Number(e.target.value))}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-100 font-bold focus:border-orange-500 focus:outline-none cursor-pointer font-mono"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {toPersianDigits(y)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white"
                title="ماه قبل"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday Labels (شنبه تا جمعه) */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-neutral-400">
              {JALALI_SHORT_WEEKDAYS.map((w, idx) => (
                <div
                  key={w}
                  className={`py-1 ${idx === 6 ? "text-rose-400" : "text-neutral-400"}`}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: calendarFirstDayWeekdayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-8 w-full" />
              ))}

              {Array.from({ length: calendarDaysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isSelected =
                  parsedJalali.year === viewYear &&
                  parsedJalali.month === viewMonth &&
                  parsedJalali.day === day;

                const isToday =
                  todayJalali.year === viewYear &&
                  todayJalali.month === viewMonth &&
                  todayJalali.day === day;

                const isFriday = (calendarFirstDayWeekdayIndex + idx) % 7 === 6;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectCalendarDay(day)}
                    className={`h-8 w-full rounded-lg text-xs font-medium transition-all flex items-center justify-center font-mono ${
                      isSelected
                        ? "bg-orange-600 text-white font-bold shadow-md shadow-orange-600/30 scale-105"
                        : isToday
                        ? "border border-orange-500/60 text-orange-400 font-bold bg-orange-950/20 hover:bg-neutral-800"
                        : isFriday
                        ? "text-rose-400 hover:bg-neutral-800"
                        : "text-neutral-200 hover:bg-neutral-800"
                    }`}
                  >
                    {toPersianDigits(day)}
                  </button>
                );
              })}
            </div>

            {/* Quick Time Pills */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-400" /> ساعت سریع:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyQuickTime(0, 0)}
                  className="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-[10px] text-neutral-300 hover:text-orange-400 hover:border-orange-500/40"
                >
                  ۰۰:۰۰
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickTime(9, 0)}
                  className="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-[10px] text-neutral-300 hover:text-orange-400 hover:border-orange-500/40"
                >
                  ۰۹:۰۰
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickTime(12, 0)}
                  className="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-[10px] text-neutral-300 hover:text-orange-400 hover:border-orange-500/40"
                >
                  ۱۲:۰۰
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickTime(23, 59)}
                  className="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-[10px] text-neutral-300 hover:text-orange-400 hover:border-orange-500/40"
                >
                  ۲۳:۵۹
                </button>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-orange-400 font-bold truncate max-w-[200px]">
                {formatPersianDateTime(value)}
              </span>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(false)}
                className="flex items-center gap-1 rounded-xl bg-orange-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-500 transition-colors shadow-md shadow-orange-600/30"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>تأیید و بستن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
