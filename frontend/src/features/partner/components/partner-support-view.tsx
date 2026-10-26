"use client";

import * as React from "react";
import {
  Headphones,
  Plus,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { supportApi } from "@/features/dashboard/api/support-api";
import type { SupportTicket } from "@/features/dashboard/types/support.types";

export function PartnerSupportView() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = React.useState(false);

  // Form state
  const [formSubject, setFormSubject] = React.useState("");
  const [formPriority, setFormPriority] = React.useState<"CRITICAL" | "HIGH" | "MEDIUM">("CRITICAL");
  const [formContent, setFormContent] = React.useState("");

  const manager = {
    name: "پشتیبانی سازمانی و امور همکاران",
    role: "واحد مهندسی و اکانت منیجر همکاران تجاری",
    phone: "۰۲۱-۸۸۹۹۰۰۱۱ داخلی ۴۰۲",
    directMobile: "۰۹۱۲۱۱۱۰۰۹۹",
    email: "partner@fonix-accademic.ir",
  };

  const fetchTickets = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await supportApi.getMyTickets();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (err) {
      console.warn("[PartnerSupportView] Failed to load tickets from backend:", err);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formContent.trim()) return;

    try {
      setIsSubmitting(true);
      await supportApi.createTicket({
        subject: formSubject.trim(),
        department: "INFRASTRUCTURE",
        priority: formPriority as any,
        initialMessage: formContent.trim(),
      });

      setShowNewTicketModal(false);
      setFormSubject("");
      setFormContent("");
      await fetchTickets();
    } catch (err) {
      console.error("[PartnerSupportView] Failed to create ticket:", err);
      alert("خطا در ثبت تیکت. لطفاً مجدداً بررسی فرمایید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">مدیر حساب اختصاصی و پشتیبانی مهندسی VIP</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                کانال ارتباط مستقیم ۲۴/۷ با اکانت منیجر ققنوس آکادمی و مهندسان دارای گواهینامه بین‌المللی سیسکو
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowNewTicketModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white gap-2 text-xs shadow-lg shadow-purple-600/25 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>ثبت تیکت فنی مهندسی</span>
        </Button>
      </div>

      {/* Dedicated Account Manager Card */}
      <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/30 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 text-xl font-black ring-2 ring-sky-500/30">
            <UserCheck className="h-8 w-8" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{manager.name}</h3>
              <span className="text-[10px] text-sky-300 bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
                اکانت منیجر اختصاصی شما
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">{manager.role}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-sky-400" />
                <span>{manager.phone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                <span>{manager.email}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs border-sky-500/40 text-sky-300 hover:bg-sky-500/10 cursor-pointer"
            onClick={() => alert(`تماس با خط مستقیم: ${manager.directMobile}`)}
          >
            <Phone className="h-3.5 w-3.5 ml-1.5" />
            <span>تماس تلفنی با اکانت منیجر</span>
          </Button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">تیکت‌های فنی و مهندسی زیرساخت</h3>
          </div>
          <span className="text-xs text-neutral-400">
            تعداد: <strong className="text-white font-mono">{toPersianDigits(tickets.length)}</strong> مورد
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            <span className="text-xs text-neutral-400">در حال دریافت تیکت‌های پشتیبانی...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500">
              <Headphones className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-white">هیچ تیکت فعالی وجود ندارد</h4>
            <p className="text-xs text-neutral-400 max-w-sm">
              جهت دریافت مشاوره فنی CCIE، استعلام پیکربندی سوییچ و روتر، یا رفع مغایرت‌های مالی می‌توانید تیکت جدید ارسال نمایید.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((tkt) => (
              <div
                key={tkt.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                      {tkt.ticketNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white">{tkt.subject}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border bg-rose-500/10 text-rose-300 border-rose-500/30">
                      {tkt.priorityLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <span>دپارتمان: <strong className="text-neutral-200">{tkt.departmentLabel}</strong></span>
                    <span>آخرین به‌روزرسانی: <strong className="text-neutral-300 font-mono">{toPersianDigits(tkt.updatedAt || "")}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs border bg-amber-500/10 text-amber-300 border-amber-500/30 font-medium whitespace-nowrap">
                    {tkt.statusLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">ثبت تیکت فنی مهندسی VIP</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="text-neutral-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">موضوع تیکت:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: کانفیگ VLAN و ترانک سوییچ 3850 پروژه مشهد"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">سطح فوریت و اولویت مهندسی:</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="CRITICAL">بحرانی — پروژه در حال توقف (پاسخ آنی)</option>
                  <option value="HIGH">اولویت بالا (حداکثر ۱ ساعت)</option>
                  <option value="MEDIUM">معمولی و پیگیری روزمره</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">شرح کامل پیام یا درخواست فنی:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="جزئیات فنی، توپولوژی شبکه، یا نیاز به مشاوره کارشناسی..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewTicketModal(false)}
                  className="cursor-pointer"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-1.5" />
                      <span>در حال ارسال...</span>
                    </>
                  ) : (
                    <span>ارسال به اکانت منیجر</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
