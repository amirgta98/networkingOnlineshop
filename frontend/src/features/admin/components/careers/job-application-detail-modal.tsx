"use client";

import * as React from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Check,
  Copy,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { JobApplication, JobApplicationStatus } from "@/features/careers/types";

interface JobApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  onUpdateStatus: (
    id: string,
    status: JobApplicationStatus,
    adminNotes?: string,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_OPTIONS: {
  value: JobApplicationStatus;
  label: string;
  badgeClass: string;
}[] = [
  {
    value: "PENDING",
    label: "در انتظار بررسی",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    value: "REVIEWED",
    label: "بررسی اولیه و تماس",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  {
    value: "ACCEPTED",
    label: "دعوت به مصاحبه / پذیرفته شده",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    value: "REJECTED",
    label: "عدم پذیرش / بایگانی",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
];

export function JobApplicationDetailModal({
  isOpen,
  onClose,
  application,
  onUpdateStatus,
  onDelete,
}: JobApplicationDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = React.useState<JobApplicationStatus>("PENDING");
  const [adminNotes, setAdminNotes] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (application) {
      setSelectedStatus(application.status || "PENDING");
      setAdminNotes(application.adminNotes || "");
      setShowDeleteConfirm(false);
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const handleCopy = (text: string, fieldName: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleSaveStatus = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(application.id, selectedStatus, adminNotes);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(application.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = application.createdAt
    ? new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(application.createdAt))
    : "—";

  const currentStatusConfig =
    STATUS_OPTIONS.find((s) => s.value === application.status) || STATUS_OPTIONS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-[#121215] p-6 shadow-2xl space-y-6 text-right">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{application.fullName}</h3>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${currentStatusConfig.badgeClass}`}
                >
                  {currentStatusConfig.label}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                متقاضی موقعیت:{" "}
                <span className="text-orange-400 font-medium">
                  {application.positionTitle || "رزومه عمومی / آزاد"}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contact & Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phone */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-2.5 text-xs">
              <Phone className="h-4 w-4 text-neutral-400" />
              <div>
                <div className="text-[11px] text-neutral-500">شماره تماس:</div>
                <a
                  href={`tel:${application.phoneNumber}`}
                  className="font-mono text-neutral-200 hover:text-orange-400 transition-colors"
                  dir="ltr"
                >
                  {application.phoneNumber}
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(application.phoneNumber, "phone")}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              title="کپی شماره"
            >
              {copiedField === "phone" ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-2.5 text-xs truncate">
              <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
              <div className="truncate">
                <div className="text-[11px] text-neutral-500">آدرس ایمیل:</div>
                <a
                  href={`mailto:${application.email}`}
                  className="font-mono text-neutral-200 hover:text-orange-400 transition-colors truncate block"
                  dir="ltr"
                >
                  {application.email}
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(application.email, "email")}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors shrink-0"
              title="کپی ایمیل"
            >
              {copiedField === "email" ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Tracking Code */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-2.5 text-xs">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <div>
                <div className="text-[11px] text-neutral-500">کد رهگیری:</div>
                <span className="font-mono font-bold text-orange-400">
                  {application.trackingCode}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(application.trackingCode, "code")}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              title="کپی کد رهگیری"
            >
              {copiedField === "code" ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center gap-2.5 text-xs">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <div>
                <div className="text-[11px] text-neutral-500">تاریخ ارسال:</div>
                <span className="text-neutral-200">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Applicant Statement / Message */}
        {application.about && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-1.5">
            <span className="text-xs font-bold text-neutral-300 block">
              پیام و توضیحات متقاضی:
            </span>
            <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {application.about}
            </p>
          </div>
        )}

        {/* Resume Attachment Download Section */}
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                فایل رزومه متقاضی
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {application.resumeFileName || "resume.pdf"}
              </span>
            </div>
          </div>

          <a
            href={application.resumeFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-600/20 hover:bg-orange-500 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>مشاهده / دانلود فایل رزومه</span>
          </a>
        </div>

        {/* Status Update & Admin Notes */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
            <span className="text-xs font-bold text-white">
              مدیریت وضعیت و ثبت یادداشت‌های بررسی
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                تغییر وضعیت درخواست
              </label>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as JobApplicationStatus)
                }
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-100 focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-neutral-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                اقدام سریع
              </label>
              <Button
                type="button"
                onClick={handleSaveStatus}
                disabled={isUpdating}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white text-xs h-[38px]"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <span>ثبت تغییرات وضعیت</span>
                )}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              یادداشت‌های داخلی مدیر (محرمانه)
            </label>
            <textarea
              rows={3}
              placeholder="نتیجه تماس تلفنی، سطح تسلط فنی، حقوق پیشنهادی یا تاریخ مصاحبه..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer & Delete Section */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف این درخواست</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400">آیا از حذف مطمئن هستید؟</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs h-8 px-3"
              >
                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "بله، حذف کن"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs h-8 px-3"
              >
                انصراف
              </Button>
            </div>
          )}

          <Button type="button" variant="outline" onClick={onClose}>
            بستن پنجره
          </Button>
        </div>
      </div>
    </div>
  );
}
