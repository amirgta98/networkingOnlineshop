"use client";

import * as React from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Truck,
  Wrench,
  Download,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { MOCK_PARTNER_WARRANTY_ITEMS } from "../data/mock-partner-data";
import type { PartnerWarrantyItem } from "../types/partner.types";

export function PartnerWarrantyView() {
  const [items, setItems] = React.useState<PartnerWarrantyItem[]>(MOCK_PARTNER_WARRANTY_ITEMS);
  const [showRmaModal, setShowRmaModal] = React.useState(false);
  const [serialQuery, setSerialQuery] = React.useState("");

  // Form state
  const [formSerial, setFormSerial] = React.useState("");
  const [formProduct, setFormProduct] = React.useState("");
  const [formIssue, setFormIssue] = React.useState("");

  const handleCreateRma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSerial || !formProduct) return;

    const newItem: PartnerWarrantyItem = {
      id: `pwar_${Date.now()}`,
      rmaNumber: `RMA-1403-0${Math.floor(Math.random() * 90) + 10}`,
      productTitle: formProduct,
      serialNumber: formSerial,
      brand: "Cisco",
      issueDescription: formIssue || "تست در آزمایشگاه ققنوس آکادمی",
      requestDate: "۱۴۰۳/۰۷/۰۷",
      status: "received_lab",
      statusLabel: "دریافت در لابراتوار گارانتی — در حال تست سلامت",
      slaHours: 24,
    };

    setItems([newItem, ...items]);
    setShowRmaModal(false);
    setFormSerial("");
    setFormProduct("");
    setFormIssue("");
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">گارانتی طلایی و خدمات RMA همکاران</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                تعهد تعویض درجا ۲۴ ساعته ویژه همکاران طلایی، استعلام سریال قطعات و پیک اختصاصی جمع‌آوری قطعه معیوب
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowRmaModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 text-xs shadow-lg shadow-emerald-600/25"
        >
          <RotateCcw className="h-4 w-4" />
          <span>ثبت درخواست تعویض درجا (RMA)</span>
        </Button>
      </div>

      {/* SLA Golden Guarantee Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-300 leading-relaxed flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
        <div>
          <strong>ضمانت تعویض درجا ویژه همکاران تجاری (Tier A SLA):</strong> در صورت بروز نقص فنی در تجهیزات شبکه فروخته شده توسط ققنوس آکادمی، قطعه معیوب بدون اتلاف وقت برای ارسال به خارج، ظرف حداکثر ۲۴ ساعت کاری با قطعه آکبند جدید تعویض می‌گردد. پیک تحویل و جمع‌آوری در تهران و مراکز استان‌ها رایگان است.
        </div>
      </div>

      {/* Serial Lookup Widget */}
      <div className="rounded-3xl border border-neutral-800 bg-[var(--theme-surface)] p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full relative">
          <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="استعلام اصالت سریال نامبر (سیسکو، نگزنس، لگراند، میکروتیک)..."
            value={serialQuery}
            onChange={(e) => setSerialQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
        <Button
          size="sm"
          className="w-full sm:w-auto text-xs bg-neutral-800 hover:bg-neutral-700 text-white"
          onClick={() => alert(`سریال نامبر ${serialQuery || "FCW2219B04M"} دارای گارانتی طلایی تا تاریخ ۱۴۰۴/۰۹/۰۱ است.`)}
        >
          استعلام گارانتی
        </Button>
      </div>

      {/* RMA Items Table */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">پرونده‌های فعال RMA و تعویض درجا</h3>
          <span className="text-xs text-neutral-400">
            تعداد پرونده‌ها: <strong className="font-mono text-white">{toPersianDigits(items.length)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/40 text-neutral-400">
                <th className="py-3.5 pr-4 font-semibold">شماره RMA و تاریخ</th>
                <th className="py-3.5 px-3 font-semibold">تجهیزات و سریال نامبر</th>
                <th className="py-3.5 px-3 font-semibold">شرح ایراد فنی اعلام شده</th>
                <th className="py-3.5 px-3 font-semibold">تعهد زمانی SLA</th>
                <th className="py-3.5 px-3 font-semibold">وضعیت پیگیری</th>
                <th className="py-3.5 pl-4 text-left font-semibold">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {items.map((rma) => (
                <tr key={rma.id} className="hover:bg-neutral-900/30 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {rma.rmaNumber}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400 mt-0.5">
                        {toPersianDigits(rma.requestDate)}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-3">
                    <div className="flex flex-col max-w-xs">
                      <span className="text-white font-medium leading-relaxed">
                        {rma.productTitle}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400 mt-0.5">
                        S/N: {rma.serialNumber} ({rma.brand})
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-3 text-neutral-300 max-w-xs">
                    {rma.issueDescription}
                  </td>

                  <td className="py-4 px-3">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Clock className="h-3 w-3" />
                      <span>{toPersianDigits(rma.slaHours)} ساعته</span>
                    </span>
                  </td>

                  <td className="py-4 px-3">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                        rma.status === "replacement_approved" || rma.status === "shipped_to_client"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 font-bold"
                          : "text-sky-300 bg-sky-500/10 border-sky-500/20"
                      }`}
                    >
                      {rma.statusLabel}
                    </span>
                  </td>

                  <td className="py-4 pl-4 text-left">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] border-neutral-700 text-neutral-300 hover:text-white"
                      onClick={() => alert(`گزارش فنی آزمایشگاه برای پرونده ${rma.rmaNumber} باز شد.`)}
                    >
                      گزارش فنی
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add RMA Modal */}
      {showRmaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">ثبت درخواست تعویض درجا ۲۴ ساعته (RMA)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRmaModal(false)}
                className="text-neutral-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            <form onSubmit={handleCreateRma} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">شماره سریال دستگاه (مندرج پشت بدنه یا جعبه):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: FCW2219B04M"
                  value={formSerial}
                  onChange={(e) => setFormSerial(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">نام و مدل قطعه:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سوییچ سیسکو 2960X-24TD-L"
                  value={formProduct}
                  onChange={(e) => setFormProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">شرح دقیق ایراد فنی مشاهده شده:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="علائم خرابی، افت پکت، رفتار چراغ‌های LED، خطاهای کنسول..."
                  value={formIssue}
                  onChange={(e) => setFormIssue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
                🚀 پیک ویژه ققنوس آکادمی ظرف ۳ ساعت پس از ثبت، برای تحویل قطعه جایگزین و دریافت قطعه معیوب اعزام خواهد شد.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRmaModal(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  ثبت و اعزام پیک تعویض
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
