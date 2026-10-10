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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { MOCK_PARTNER_TICKETS, MOCK_PARTNER_PROFILE_DATA } from "../data/mock-partner-data";
import type { PartnerTicket } from "../types/partner.types";

export function PartnerSupportView() {
  const [tickets, setTickets] = React.useState<PartnerTicket[]>(MOCK_PARTNER_TICKETS);
  const [showNewTicketModal, setShowNewTicketModal] = React.useState(false);

  // Form state
  const [formSubject, setFormSubject] = React.useState("");
  const [formPriority, setFormPriority] = React.useState<"critical" | "high" | "medium">("critical");
  const [formDept, setFormDept] = React.useState("مهندسی ارشد زیرساخت و CCIE");
  const [formContent, setFormContent] = React.useState("");

  const manager = MOCK_PARTNER_PROFILE_DATA.accountManager;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject) return;

    const newTicket: PartnerTicket = {
      id: `ptkt_${Date.now()}`,
      ticketNumber: `VIP-1403-0${Math.floor(Math.random() * 90) + 10}`,
      subject: formSubject,
      priority: formPriority,
      priorityLabel: formPriority === "critical" ? "بحرانی (پروژه‌ای)" : "اولویت بالا",
      department: formDept,
      lastUpdate: "لحظاتی پیش",
      status: "open",
      statusLabel: "در صف پاسخگویی اکانت منیجر",
      engineerName: manager.name,
    };

    setTickets([newTicket, ...tickets]);
    setShowNewTicketModal(false);
    setFormSubject("");
    setFormContent("");
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
          className="bg-purple-600 hover:bg-purple-500 text-white gap-2 text-xs shadow-lg shadow-purple-600/25"
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
                <span dir="ltr">{manager.phone}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span dir="ltr">موبایل مستقیم: {manager.directMobile}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                <span>{manager.email}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1.5"
            onClick={() => alert(`تماس با ${manager.name} برقرار شد: ${manager.directMobile}`)}
          >
            <Phone className="h-3.5 w-3.5" />
            <span>تماس اضطراری فوری</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-200 hover:text-white text-xs gap-1.5"
            onClick={() => alert("لینک رزرو جلسه آنلاین در گوگل میت برای شما ارسال شد.")}
          >
            <Calendar className="h-3.5 w-3.5 text-purple-400" />
            <span>رزرو جلسه آنلاین</span>
          </Button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">تیکت‌های فنی و مشاوره‌های زیرساخت</h3>
          <span className="text-xs text-neutral-400">
            تعداد تیکت‌ها: <strong className="font-mono text-white">{toPersianDigits(tickets.length)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/40 text-neutral-400">
                <th className="py-3.5 pr-4 font-semibold">شناسه و اولویت</th>
                <th className="py-3.5 px-3 font-semibold">موضوع تیکت مهندسی</th>
                <th className="py-3.5 px-3 font-semibold">دپارتمان رسیدگی</th>
                <th className="py-3.5 px-3 font-semibold">کارشناس مسئول</th>
                <th className="py-3.5 px-3 font-semibold">آخرین به‌روزرسانی</th>
                <th className="py-3.5 px-3 font-semibold">وضعیت</th>
                <th className="py-3.5 pl-4 text-left font-semibold">مشاهده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {tickets.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono font-bold text-white">{tkt.ticketNumber}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border w-fit font-bold ${
                          tkt.priority === "critical"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {tkt.priorityLabel}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-3">
                    <span className="text-neutral-200 font-medium leading-relaxed block max-w-sm">
                      {tkt.subject}
                    </span>
                  </td>

                  <td className="py-4 px-3 text-neutral-300">
                    {tkt.department}
                  </td>

                  <td className="py-4 px-3 text-neutral-200 font-medium">
                    {tkt.engineerName}
                  </td>

                  <td className="py-4 px-3 text-neutral-400">
                    {tkt.lastUpdate}
                  </td>

                  <td className="py-4 px-3">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                        tkt.status === "resolved"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-purple-300 bg-purple-500/10 border-purple-500/20"
                      }`}
                    >
                      {tkt.statusLabel}
                    </span>
                  </td>

                  <td className="py-4 pl-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-sky-400 hover:text-white"
                      onClick={() => alert(`مکاتبات تیکت ${tkt.ticketNumber} باز شد.`)}
                    >
                      مشاهده گفتگو
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-purple-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">ثبت تیکت فنی مهندسی با SLA فوری</h3>
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
                <label className="text-neutral-300 font-semibold">موضوع تیکت یا پروژه:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سوال درباره تست سازگاری ماژول سیسکو با سوئیچ میکروتیک"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">سطح اولویت:</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="critical">بحرانی (پروژه‌ای)</option>
                    <option value="high">اولویت بالا</option>
                    <option value="medium">عادی</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">دپارتمان:</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="مهندسی ارشد زیرساخت و CCIE">مهندسی ارشد CCIE</option>
                    <option value="فروش و صدور پیش‌فاکتور">فروش و پیش‌فاکتور</option>
                    <option value="لجستیک و باربری">لجستیک و باربری</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">شرح درخواست یا سوال فنی:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="توضیحات درباره کانفیگ، توپولوژی، پیام‌های خطا یا پارت‌نامبرهای مورد نیاز..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewTicketModal(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                >
                  ارسال تیکت فوری
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
