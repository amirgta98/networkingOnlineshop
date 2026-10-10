"use client";

import * as React from "react";
import {
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Building,
  TrendingUp,
  Clock,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { MOCK_PARTNER_CHEQUES } from "../data/mock-partner-data";
import type { PartnerCheque } from "../types/partner.types";

export function PartnerCreditView() {
  const { user } = useAuth();
  const [cheques, setCheques] = React.useState<PartnerCheque[]>(MOCK_PARTNER_CHEQUES);
  const [showAddChequeModal, setShowAddChequeModal] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Form state
  const [formChequeId, setFormChequeId] = React.useState("");
  const [formBank, setFormBank] = React.useState("بانک ملت");
  const [formDueDate, setFormDueDate] = React.useState("۱۴۰۳/۰۸/۳۰");
  const [formAmount, setFormAmount] = React.useState("65000000");

  const creditLimit = user?.creditLimit || 500_000_000;
  const creditBalance = user?.creditBalance || 320_000_000;
  const creditUsed = creditLimit - creditBalance;
  const creditPercent = Math.round((creditUsed / creditLimit) * 100);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCheque = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formChequeId) return;

    const newCheque: PartnerCheque = {
      id: `pchq_${Date.now()}`,
      chequeId: formChequeId,
      serialNumber: `چک صیادی شماره ۰۴/${Math.floor(Math.random() * 9000) + 1000}`,
      bank: formBank,
      branch: "شعبه مرکزی",
      dueDate: formDueDate,
      amount: parseInt(formAmount) || 50_000_000,
      status: "registered",
      statusLabel: "ثبت در سامانه صیاد بانک مرکزی",
      sayadStatus: "verified",
    };

    setCheques([newCheque, ...cheques]);
    setShowAddChequeModal(false);
    setFormChequeId("");
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">خط اعتباری و مدیریت چک‌های صیادی بنفش</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                پایش سقف خرید اعتباری، ثبت چک‌های تضمین و تسویه ۴۵ روزه فاکتورهای سازمانی
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setShowAddChequeModal(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white gap-2 text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت چک صیادی جدید</span>
          </Button>
        </div>
      </div>

      {/* Credit Summary Gauge */}
      <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/30 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-sky-400 font-semibold block mb-1">
              خط اعتباری مصوب شرکت در ققنوس آکادمی
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                {formatPrice(creditLimit)}
              </span>
              <span className="text-xs text-neutral-400">ریالی (با تضمین چک صیادی)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>وضعیت اعتبارسنجی: عالی (A+)</span>
            </span>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-1">اعتبار در دسترس خرید:</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {formatPrice(creditBalance)}
            </span>
            <span className="text-[10px] text-neutral-400 block mt-1">آماده ثبت سفارش جدید بدون پیش‌پرداخت</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-1">اعتبار مصرف‌شده در فاکتورها:</span>
            <span className="text-lg font-black font-mono text-amber-400">
              {formatPrice(creditUsed)}
            </span>
            <span className="text-[10px] text-neutral-400 block mt-1">تعهدات در قالب چک‌های سررسیددار</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-1">دوره بازپرداخت استاندارد:</span>
            <span className="text-lg font-black font-mono text-sky-400">
              ۴۵ روز کاری
            </span>
            <span className="text-[10px] text-neutral-400 block mt-1">از تاریخ خروج تجهیزات از انبار</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>درصد مصرف اعتبار: {toPersianDigits(creditPercent)}٪</span>
            <span>باقیمانده آزاد: {toPersianDigits(100 - creditPercent)}٪</span>
          </div>
          <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-sky-500 to-cyan-400 rounded-full"
              style={{ width: `${creditPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cheques Table */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-sm flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">لیست چک‌های صیادی ثبت‌شده نزد شرکت</h3>
          </div>
          <span className="text-xs text-neutral-400">
            استعلام برخط از سامانه صیاد بانک مرکزی ایران
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400">
                <th className="pb-3 pr-2 font-medium">شناسه ۱۶ رقمی صیادی</th>
                <th className="pb-3 font-medium">مشخصات بانک و شعبه</th>
                <th className="pb-3 font-medium">تاریخ سررسید</th>
                <th className="pb-3 font-medium">مبلغ چک</th>
                <th className="pb-3 font-medium">وضعیت سامانه صیاد</th>
                <th className="pb-3 font-medium">وضعیت وصول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {cheques.map((chq) => (
                <tr key={chq.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-4 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white tracking-wider">
                        {chq.chequeId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(chq.id, chq.chequeId)}
                        className="text-neutral-500 hover:text-white p-1 cursor-pointer"
                        title="کپی شناسه صیادی"
                      >
                        {copiedId === chq.id ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-200">{chq.bank}</span>
                      <span className="text-[11px] text-neutral-400">{chq.branch} — {chq.serialNumber}</span>
                    </div>
                  </td>

                  <td className="py-4 font-mono font-semibold text-neutral-300">
                    {toPersianDigits(chq.dueDate)}
                  </td>

                  <td className="py-4 font-mono font-bold text-white text-sm">
                    {formatPrice(chq.amount)}
                  </td>

                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>تایید پیچک ✓</span>
                    </span>
                  </td>

                  <td className="py-4">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                        chq.status === "cleared"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : chq.status === "due_soon"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : "text-sky-300 bg-sky-500/10 border-sky-500/20"
                      }`}
                    >
                      {chq.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Cheque Modal */}
      {showAddChequeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-sky-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">ثبت چک صیادی بنفش جدید</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddChequeModal(false)}
                className="text-neutral-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            <form onSubmit={handleAddCheque} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">شناسه ۱۶ رقمی صیادی چک:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ۹۸۲۱۴۴۰۲۱۹۸۵۳۳۱۲"
                  maxLength={16}
                  value={formChequeId}
                  onChange={(e) => setFormChequeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono tracking-widest text-center"
                />
                <span className="text-[10px] text-neutral-500">شناسه مندرج در بالای گوشه سمت چپ برگه چک صیادی بنفش</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">بانک صادرکننده:</label>
                <select
                  value={formBank}
                  onChange={(e) => setFormBank(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="بانک ملت">بانک ملت</option>
                  <option value="بانک سامان">بانک سامان</option>
                  <option value="بانک تجارت">بانک تجارت</option>
                  <option value="بانک پاسارگاد">بانک پاسارگاد</option>
                  <option value="بانک ملی">بانک ملی ایران</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">تاریخ سررسید چک:</label>
                <input
                  type="text"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">مبلغ چک (تومان):</label>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddChequeModal(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-500 text-white"
                >
                  استعلام و ثبت چک در سیستم
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
