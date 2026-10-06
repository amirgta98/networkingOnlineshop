"use client";

import * as React from "react";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Phone,
  Mail,
  User,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { OPEN_POSITIONS } from "../mock-data/careers-data";
import { SubmissionResult } from "../types";

interface ResumeUploadFormProps {
  selectedPositionId?: string;
  onPositionChange?: (positionId: string) => void;
}

export function ResumeUploadForm({
  selectedPositionId = "",
  onPositionChange,
}: ResumeUploadFormProps) {
  const [fullName, setFullName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [positionId, setPositionId] = React.useState(selectedPositionId);
  const [note, setNote] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  const [isDragging, setIsDragging] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = React.useState<SubmissionResult | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync when parent prop changes
  React.useEffect(() => {
    if (selectedPositionId) {
      setPositionId(selectedPositionId);
    }
  }, [selectedPositionId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    setErrorMsg(null);
    const validExtensions = [".pdf", ".docx", ".doc"];
    const ext = uploadedFile.name.substring(uploadedFile.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMsg("فرمت فایل نامعتبر است. لطفاً فایل رزومه با پسوند PDF یا Word ارسال فرمایید.");
      return;
    }

    // 10 MB limit
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setErrorMsg("حجم فایل انتخابی بیش از حد مجاز (حداکثر ۱۰ مگابایت) است.");
      return;
    }

    setFile(uploadedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMsg("لطفاً نام و نام خانوادگی خود را وارد کنید.");
      return;
    }

    const cleanPhone = phoneNumber.trim().replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("لطفاً یک شماره تماس معتبر (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد فرمایید.");
      return;
    }

    if (!file) {
      setErrorMsg("لطفاً فایل رزومه کاری خود را ضمیمه فرمایید.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate network request with realistic response delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const selectedJob = OPEN_POSITIONS.find((p) => p.id === positionId);
      const randomCode = Math.floor(10000 + Math.random() * 90000);

      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(now);

      setSubmissionResult({
        trackingCode: `NET-HR-${randomCode}`,
        submittedAt: formattedDate,
        fullName: fullName.trim(),
        positionTitle: selectedJob ? selectedJob.title : "رزومه عمومی / آزاد",
      });
    } catch {
      setErrorMsg("خطایی در ارسال رزومه رخ داد. لطفاً مجدداً تلاش فرمایید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setPositionId("");
    setNote("");
    setFile(null);
    setErrorMsg(null);
    setSubmissionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} بایت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} کیلوبایت`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
  };

  return (
    <div
      id="resume-form-box"
      className="relative overflow-hidden rounded-2xl border border-neutral-800/90 bg-[#111114]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md"
    >
      {/* Decorative ambient background */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-orange-500/10 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-[90px]" />

      {submissionResult ? (
        /* ── Success Confirmation Screen ── */
        <div className="relative z-10 flex flex-col items-center text-center py-6 animate-fade-in">
          <div className="relative mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="absolute -inset-1 -z-10 rounded-2xl bg-emerald-500/20 blur-md animate-led-pulse" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            رزومه شما با موفقیت ثبت شد
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            از ابراز تمایل شما به همکاری با ققنوس آکادمی سپاسگزاریم
          </h3>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed mb-6">
            رزومه شما در بانک استعدادهای ما ثبت گردید. کارشناسان منابع انسانی پس از بررسی اولیه سوابق، ظرف ۳ الی ۵ روز کاری با شما تماس خواهند گرفت.
          </p>

          {/* Tracking Ticket Box */}
          <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 mb-6 text-right">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
              <span className="text-xs text-neutral-400">کد پیگیری رزومه:</span>
              <span className="font-mono text-sm font-bold text-orange-400 tracking-wider">
                {submissionResult.trackingCode}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-neutral-400">متقاضی:</span>
              <span className="font-medium text-neutral-200">{submissionResult.fullName}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-neutral-400">موقعیت شغلی:</span>
              <span className="font-medium text-neutral-200">{submissionResult.positionTitle}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-neutral-400">زمان ثبت:</span>
              <span className="font-medium text-neutral-400">{submissionResult.submittedAt}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/80 px-5 py-2.5 text-xs sm:text-sm font-medium text-neutral-200 transition-all duration-150 hover:bg-neutral-700 hover:text-white active:scale-[0.97] cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>ارسال رزومه جدید یا ویرایش اطلاعات</span>
          </button>
        </div>
      ) : (
        /* ── Resume Form ── */
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4 sm:space-y-5" noValidate>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <h3 className="text-lg sm:text-xl font-bold text-white">فرم آنلاین ارسال رزومه کاری</h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              اطلاعات و فایل رزومه خود را تکمیل فرمایید تا در فرآیند استخدامی ققنوس آکادمی قرار گیرد.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Grid row 1: Full name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="careers-full-name" className="block text-xs font-medium text-neutral-300 mb-1.5">
                نام و نام خانوادگی <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="careers-full-name"
                  type="text"
                  required
                  placeholder="مثال: عرفان محمدی"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 pr-9 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-150"
                />
                <User className="absolute right-3 top-3 h-4 w-4 text-neutral-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="careers-phone" className="block text-xs font-medium text-neutral-300 mb-1.5">
                شماره همراه <span className="text-orange-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="careers-phone"
                  type="tel"
                  dir="ltr"
                  required
                  placeholder="09123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 pl-9 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-150 text-left font-mono"
                />
                <Phone className="absolute left-3 top-3 h-4 w-4 text-neutral-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Grid row 2: Email & Desired Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="careers-email" className="block text-xs font-medium text-neutral-300 mb-1.5">
                آدرس ایمیل
              </label>
              <div className="relative">
                <input
                  id="careers-email"
                  type="email"
                  dir="ltr"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 pl-9 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-150 text-left"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="careers-position" className="block text-xs font-medium text-neutral-300 mb-1.5">
                موقعیت شغلی مورد نظر
              </label>
              <div className="relative">
                <select
                  id="careers-position"
                  value={positionId}
                  onChange={(e) => {
                    setPositionId(e.target.value);
                    if (onPositionChange) onPositionChange(e.target.value);
                  }}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 pr-9 text-xs sm:text-sm text-neutral-100 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-150 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#18181b] text-neutral-300">
                    انتخاب از موقعیت‌های باز یا عمومی...
                  </option>
                  {OPEN_POSITIONS.map((pos) => (
                    <option key={pos.id} value={pos.id} className="bg-[#18181b] text-neutral-200">
                      {pos.title} ({pos.type})
                    </option>
                  ))}
                  <option value="general-cooperation" className="bg-[#18181b] text-orange-400">
                    سایر تخصص‌ها / رزومه آزاد
                  </option>
                </select>
                <Briefcase className="absolute right-3 top-3 h-4 w-4 text-neutral-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Drag & Drop File Upload Zone */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              فایل رزومه کاری (PDF یا DOCX) <span className="text-orange-400">*</span>
            </label>

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.2)]"
                    : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/70"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-all duration-200 mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-neutral-200 mb-1">
                  فایل رزومه خود را اینجا بکشید یا برای انتخاب <span className="text-orange-400 underline underline-offset-4">کلیک کنید</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  فرمت‌های مجاز: PDF، Word (حداکثر ۱۰ مگابایت)
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5 animate-fade-in">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs sm:text-sm font-medium text-neutral-200" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  aria-label="حذف فایل رزومه"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Short note or portfolio link */}
          <div>
            <label htmlFor="careers-note" className="block text-xs font-medium text-neutral-300 mb-1.5">
              توضیحات کوتاه یا لینک پورتفولیو / لینکدین (اختیاری)
            </label>
            <textarea
              id="careers-note"
              rows={2}
              placeholder="نکات برجسته تجربیات، لینک پروفایل لینکدین یا گیت‌هاب..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-150 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 hover:bg-orange-500 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال بارگذاری و ثبت رزومه...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>ارسال نهایی رزومه کاری</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
