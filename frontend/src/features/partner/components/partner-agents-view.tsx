"use client";

import * as React from "react";
import {
  Users2,
  Plus,
  ShieldCheck,
  UserCheck,
  Phone,
  CreditCard,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { MOCK_PARTNER_AGENTS } from "../data/mock-partner-data";
import type { PartnerAgent } from "../types/partner.types";

export function PartnerAgentsView() {
  const [agents, setAgents] = React.useState<PartnerAgent[]>(MOCK_PARTNER_AGENTS);
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Form state
  const [formName, setFormName] = React.useState("");
  const [formRole, setFormRole] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formNationalId, setFormNationalId] = React.useState("");
  const [formLimit, setFormLimit] = React.useState("50000000");

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    const newAgent: PartnerAgent = {
      id: `pagent_${Date.now()}`,
      name: formName,
      roleTitle: formRole || "کارشناس تدارکات",
      phone: formPhone,
      nationalId: formNationalId || "۰۰۱۱۴۴۵۵۸۸",
      maxOrderLimit: parseInt(formLimit) || 50_000_000,
      permissions: ["ثبت سفارش با تایید مدیر", "مشاهده کاتالوگ همکار"],
      status: "active",
    };

    setAgents([...agents, newAgent]);
    setShowAddModal(false);
    setFormName("");
    setFormRole("");
    setFormPhone("");
    setFormNationalId("");
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">مدیریت نمایندگان و کارشناسان خرید شرکت</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                تعریف پرسنل تدارکات، کارشناسان شبکه و حسابداری با سقف اختیارات ریالی مجزا جهت ثبت سفارش
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white gap-2 text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>افزودن کارشناس خرید</span>
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm hover:border-sky-500/30 transition-all flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold">
                    {agent.name.slice(0, 1)}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                    <span className="text-[11px] text-neutral-400">{agent.roleTitle}</span>
                  </div>
                </div>

                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  فعال ✓
                </span>
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800 flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>شماره تماس:</span>
                  <span className="font-mono text-neutral-200" dir="ltr">{agent.phone}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>کد ملی:</span>
                  <span className="font-mono text-neutral-200">{toPersianDigits(agent.nationalId)}</span>
                </div>
                <div className="flex justify-between text-neutral-400 pt-1 border-t border-neutral-800">
                  <span>سقف اختیار خرید:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatPrice(agent.maxOrderLimit)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-xs">
                <span className="text-[10px] text-neutral-400 font-medium">مجوزهای دسترسی:</span>
                <div className="flex flex-wrap gap-1">
                  {agent.permissions.map((perm, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-lg text-neutral-300"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-500 text-[10px]">احراز هویت پیامکی فعال</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-neutral-400 hover:text-white"
                onClick={() => alert(`ویرایش دسترسی‌های ${agent.name}`)}
              >
                ویرایش اختیارات
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-sky-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">افزودن کارشناس خرید شرکت</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            <form onSubmit={handleAddAgent} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">نام و نام خانوادگی:</label>
                <input
                  type="text"
                  required
                  placeholder="مهندس علیرضا سلیمانی"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">سمت سازمانی در شرکت:</label>
                <input
                  type="text"
                  required
                  placeholder="کارشناس ارشد تدارکات و خرید"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">شماره موبایل جهت ورود:</label>
                  <input
                    type="text"
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">کد ملی جهت احراز هویت:</label>
                  <input
                    type="text"
                    required
                    placeholder="۰۰۱۲۳۴۵۶۷۸"
                    value={formNationalId}
                    onChange={(e) => setFormNationalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">سقف مجاز ثبت سفارش بدون تایید مدیر (تومان):</label>
                <input
                  type="number"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-500 text-white"
                >
                  ایجاد دسترسی نماینده
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
