"use client";

import * as React from "react";
import {
  X,
  Save,
  Loader2,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  Phone,
  FileText,
  DollarSign,
} from "lucide-react";
import type { InstallationAdminItem, InstallationStatus } from "@/features/installation/types";
import { installationApi } from "@/features/installation/api/installation-api";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits, formatPrice } from "@/shared/lib/utils";

interface InstallationQuickEditModalProps {
  item: InstallationAdminItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: InstallationAdminItem) => void;
}

const STATUS_OPTIONS: { value: InstallationStatus; label: string; desc: string }[] = [
  { value: "PENDING_REVIEW", label: "در انتظار بررسی", desc: "درخواست تازه ثبت‌شده و نیازمند بررسی اولیه" },
  { value: "ASSIGNED", label: "تخصیص‌یافته به کارشناس", desc: "سرپرست فنی پروژه تعیین گردیده است" },
  { value: "SURVEY_SCHEDULED", label: "هماهنگی و بازدید حضوری", desc: "متره‌کشی محل و بررسی مسیرهای کابل‌کشی" },
  { value: "IN_PROGRESS", label: "در حال اجرای عملیات", desc: "تیم پسیو در محل مستقر و در حال کار است" },
  { value: "COMPLETED", label: "تحویل نهایی و پایان‌یافته", desc: "تست فلوک انجام شده و گارانتی تحویل گردید" },
  { value: "CANCELLED", label: "لغوشده", desc: "درخواست توسط کارفرما یا مدیریت لغو شد" },
];

export function InstallationQuickEditModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: InstallationQuickEditModalProps) {
  const [status, setStatus] = React.useState<InstallationStatus>("PENDING_REVIEW");
  const [teamLead, setTeamLead] = React.useState<string>("");
  const [teamRole, setTeamRole] = React.useState<string>("");
  const [teamPhone, setTeamPhone] = React.useState<string>("");
  const [finalQuote, setFinalQuote] = React.useState<string>("");
  const [adminNotes, setAdminNotes] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (item) {
      setStatus(item.status);
      setTeamLead(item.assignedTeamLead || "مهندس شریفی");
      setTeamRole(item.assignedTeamRole || "سرپرست ارشد پروژه‌های پسیو و فیبر نوری");
      setTeamPhone(item.assignedTeamPhone || "۰۹۱۳۴۷۶۱۰۹۷");
      setFinalQuote(item.finalQuotationAmount ? String(item.finalQuotationAmount) : "");
      setAdminNotes(item.adminNotes || "");
      setErrorMsg(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const cleanQuote = finalQuote.trim() ? Number(finalQuote.replace(/[^0-9]/g, "")) : undefined;

      const updated = await installationApi.updateAdminRequest(item.id, {
        status,
        assignedTeamLead: teamLead.trim() || undefined,
        assignedTeamRole: teamRole.trim() || undefined,
        assignedTeamPhone: teamPhone.trim() || undefined,
        finalQuotationAmount: cleanQuote,
        adminNotes: adminNotes.trim() || undefined,
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      console.error("Failed to quick-update installation request:", err);
      setErrorMsg(err?.message || "خطا در بروزرسانی اطلاعات درخواست.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--theme-border-color)]">
          <div>
            <h3 className="text-base font-bold text-[var(--theme-foreground)]">
              ویرایش و مدیریت سریع درخواست
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              کد رهگیری:{" "}
              <span className="font-mono text-orange-400 font-bold">{item.trackingCode}</span>
              {" — "}
              {item.fullName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Status selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              وضعیت اجرای پروژه:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`p-2.5 rounded-xl border text-right transition-all flex flex-col gap-0.5 ${
                    status === opt.value
                      ? "border-orange-500 bg-orange-500/15 text-orange-300"
                      : "border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/60 text-neutral-400"
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-neutral-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Assigned Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                نام سرپرست تیم:
              </label>
              <input
                type="text"
                value={teamLead}
                onChange={(e) => setTeamLead(e.target.value)}
                placeholder="مثال: مهندس شریفی"
                className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                تلفن هماهنگی سرپرست:
              </label>
              <input
                type="text"
                value={teamPhone}
                onChange={(e) => setTeamPhone(e.target.value)}
                placeholder="مثال: ۰۹۱۳۴۷۶۱۰۹۷"
                className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Final quotation amount */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              مبلغ مصوب پیش‌فاکتور (تومان):
            </label>
            <div className="relative">
              <input
                type="text"
                value={finalQuote}
                onChange={(e) => setFinalQuote(e.target.value)}
                placeholder="مثال: ۲۵۰۰۰۰۰۰"
                className="w-full h-9 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
              />
              <span className="absolute left-3 top-2 text-[10px] text-neutral-400">تومان</span>
            </div>
            {item.minEstimatedCost > 0 && (
              <p className="text-[10px] text-neutral-400 mt-1">
                برآورد اولیه سیستم: {formatPrice(item.minEstimatedCost)} الی{" "}
                {formatPrice(item.maxEstimatedCost)} تومان
              </p>
            )}
          </div>

          {/* Admin Internal Notes */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              یادداشت داخلی تیم مدیریت:
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="نکات هماهنگی با کارفرما، مسیر اعزام، فاکتورهای مالی و ..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 p-2.5 text-xs text-neutral-200 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--theme-border-color)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold gap-1.5"
            >
              {isSubmitting ? (
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
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
