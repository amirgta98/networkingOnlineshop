"use client";

import * as React from "react";
import {
  CreditCard,
  Plus,
  Copy,
  Building,
  FileCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { apiClient } from "@/shared/lib/api-client";
import type { PartnerCheque } from "../types/partner.types";

export function PartnerCreditView() {
  const [cheques, setCheques] = React.useState<PartnerCheque[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showAddChequeModal, setShowAddChequeModal] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Form state
  const [formChequeId, setFormChequeId] = React.useState("");
  const [formBank, setFormBank] = React.useState("بانک ملت");
  const [formDueDate, setFormDueDate] = React.useState("۱۴۰۳/۰۸/۳۰");
  const [formAmount, setFormAmount] = React.useState("65000000");

  const fetchCreditData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const chequesRes = await apiClient.get<any[]>("/credit/cheques", { timeout: 8000 }).catch(() => null);

      if (chequesRes && Array.isArray(chequesRes)) {
        setCheques(
          chequesRes.map((c: any) => ({
            id: c.id,
            chequeId: c.chequeId,
            serialNumber: c.serialNumber || `چک صیادی شماره ${c.chequeId.slice(-4)}`,
            bank: c.bank || "بانک ملت",
            branch: c.branch || "شعبه مرکزی",
            dueDate: c.dueDate || "۱۴۰۳/۰۸/۳۰",
            amount: Number(c.amount || 0),
            status: c.status || "registered",
            statusLabel: c.statusLabel || "ثبت در سامانه صیاد",
            sayadStatus: c.sayadStatus || "verified",
          }))
        );
      } else {
        setCheques([]);
      }
    } catch (err) {
      console.warn("[PartnerCreditView] Failed to fetch credit data from backend:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchCreditData();
  }, [fetchCreditData]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCheque = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formChequeId.trim()) return;

    try {
      setIsSubmitting(true);
      await apiClient.post("/credit/cheques", {
        chequeId: formChequeId.trim(),
        bank: formBank,
        dueDate: formDueDate,
        amount: parseInt(formAmount) || 50_000_000,
      });

      setShowAddChequeModal(false);
      setFormChequeId("");
      await fetchCreditData();
    } catch (err) {
      console.error("[PartnerCreditView] Failed to register cheque:", err);
      alert("خطا در ثبت چک صیادی. لطفاً شناسه ۱۶ رقمی صیاد را بررسی فرمایید.");
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">خط اعتباری و مدیریت چک‌های صیادی بنفش</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                ثبت چک‌های صیادی تضمین و تسویه ۴۵ روزه فاکتورهای سازمانی در سامانه صیاد
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setShowAddChequeModal(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white gap-2 text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت چک صیادی جدید</span>
          </Button>
        </div>
      </div>

      {/* Sayad Cheques List */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">چک‌های صیادی بنفش ثبت‌شده در سامانه</h3>
          </div>
          <span className="text-xs text-neutral-400">
            تعداد: <strong className="text-white font-mono">{toPersianDigits(cheques.length)}</strong> فقره
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            <span className="text-xs text-neutral-400">در حال استعلام چک‌ها از سرور...</span>
          </div>
        ) : cheques.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500">
              <CreditCard className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-white">هیچ چک صیادی ثبت نشده است</h4>
            <p className="text-xs text-neutral-400 max-w-sm">
              برای افزایش یا تخصیص خط اعتباری سازمانی، می‌توانید چک صیادی بنفش جدید خود را با کلیک بر روی دکمه «ثبت چک صیادی جدید» اضافه فرمایید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cheques.map((chq) => (
              <div
                key={chq.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{chq.bank}</span> — <span>{chq.branch}</span>
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {chq.serialNumber}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                    {chq.statusLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-neutral-400 text-[10px]">مبلغ چک:</span>
                    <span className="font-bold font-mono text-emerald-400 text-sm">
                      {formatPrice(chq.amount)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 text-left font-mono">
                    <span className="text-neutral-400 text-[10px]">تاریخ سررسید:</span>
                    <span className="text-white text-xs">{toPersianDigits(chq.dueDate)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] bg-neutral-950/50 p-2 rounded-xl border border-neutral-800 font-mono">
                  <span className="text-neutral-400">شناسه صیاد: {chq.chequeId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(chq.id, chq.chequeId)}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedId === chq.id ? "کپی شد" : "کپی"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
                  placeholder="مثال: ۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶"
                  value={formChequeId}
                  onChange={(e) => setFormChequeId(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono tracking-widest text-left"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">بانک صادرکننده:</label>
                <select
                  value={formBank}
                  onChange={(e) => setFormBank(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="بانک ملت">بانک ملت</option>
                  <option value="بانک ملی ایران">بانک ملی ایران</option>
                  <option value="بانک صادرات ایران">بانک صادرات ایران</option>
                  <option value="بانک تجارت">بانک تجارت</option>
                  <option value="بانک سامان">بانک سامان</option>
                  <option value="بانک پاسارگاد">بانک پاسارگاد</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">مبلغ چک (تومان):</label>
                <input
                  type="number"
                  required
                  placeholder="مبلغ به تومان"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono text-left"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">تاریخ سررسید (شمسی):</label>
                <input
                  type="text"
                  placeholder="مثال: ۱۴۰۳/۰۹/۳۰"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono text-left"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddChequeModal(false)}
                  className="cursor-pointer"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-1.5" />
                      <span>در حال استعلام و ثبت...</span>
                    </>
                  ) : (
                    <span>استعلام صیاد و ثبت نهایی</span>
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
