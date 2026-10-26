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
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { apiClient } from "@/shared/lib/api-client";
import type { PartnerWarrantyItem } from "../types/partner.types";

export function PartnerWarrantyView() {
  const [items, setItems] = React.useState<PartnerWarrantyItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showRmaModal, setShowRmaModal] = React.useState(false);

  // Serial Lookup state
  const [serialQuery, setSerialQuery] = React.useState("");
  const [isSearchingSerial, setIsSearchingSerial] = React.useState(false);
  const [serialLookupResult, setSerialLookupResult] = React.useState<any | null>(null);

  // Form state
  const [formSerial, setFormSerial] = React.useState("");
  const [formProduct, setFormProduct] = React.useState("");
  const [formIssue, setFormIssue] = React.useState("");

  const fetchRmaItems = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await apiClient.get<any[]>("/warranty/my", { timeout: 8000 });
      if (Array.isArray(raw)) {
        const mapped: PartnerWarrantyItem[] = raw.map((it) => {
          const createdDate = it.createdAt
            ? new Date(it.createdAt).toLocaleDateString("fa-IR")
            : "نامشخص";

          return {
            id: it.id,
            rmaNumber: `RMA-${it.id.slice(0, 6).toUpperCase()}`,
            productTitle: it.productName || "تجهیزات شبکه ققنوس",
            serialNumber: it.serialNumber,
            brand: it.brand || "Cisco",
            issueDescription: it.notes || "تست در آزمایشگاه ققنوس آکادمی",
            requestDate: createdDate,
            status: "received_lab",
            statusLabel: it.statusLabel || "دریافت در لابراتوار گارانتی — در حال تست سلامت",
            slaHours: 24,
          };
        });
        setItems(mapped);
      }
    } catch (err) {
      console.warn("[PartnerWarrantyView] Failed to fetch RMA items from backend:", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchRmaItems();
  }, [fetchRmaItems]);

  const handleLookupSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialQuery.trim()) return;

    try {
      setIsSearchingSerial(true);
      const res = await apiClient.get<any>(`/warranty/verify/${encodeURIComponent(serialQuery.trim())}`);
      setSerialLookupResult(res);
    } catch (err) {
      console.error("[PartnerWarrantyView] Serial verification failed:", err);
      setSerialLookupResult({
        isAuthentic: false,
        statusLabel: "خطا در ارتباط با سرور استعلام اصالت",
      });
    } finally {
      setIsSearchingSerial(false);
    }
  };

  const handleCreateRma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSerial.trim() || !formProduct.trim()) return;

    try {
      setIsSubmitting(true);
      await apiClient.post("/warranty/rma", {
        serialNumber: formSerial.trim(),
        productName: formProduct.trim(),
        faultDescription: formIssue.trim() || "نقص سخت‌افزاری اعلامی توسط همکار",
        deliveryMethod: "پیک اختصاصی ققنوس",
      });

      setShowRmaModal(false);
      setFormSerial("");
      setFormProduct("");
      setFormIssue("");
      await fetchRmaItems();
    } catch (err) {
      console.error("[PartnerWarrantyView] Failed to submit RMA to backend:", err);
      alert("خطا در ثبت درخواست RMA. لطفاً مجدداً بررسی فرمایید.");
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
          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 text-xs shadow-lg shadow-emerald-600/25 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>ثبت درخواست تعویض درجا (RMA)</span>
        </Button>
      </div>

      {/* SLA Golden Guarantee Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-300 leading-relaxed flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
        <div>
          <strong>ضمانت تعویض درجا ویژه همکاران تجاری (Tier A SLA):</strong> در صورت بروز نقص فنی در تجهیزات شبکه فروخته شده توسط ققنوس آکادمی، قطعه معیوب ظرف حداکثر ۲۴ ساعت کاری با قطعه آکبند جدید تعویض می‌گردد. پیک تحویل و جمع‌آوری رایگان است.
        </div>
      </div>

      {/* Serial Lookup Widget */}
      <form onSubmit={handleLookupSerial} className="rounded-3xl border border-neutral-800 bg-[var(--theme-surface)] p-5 flex flex-col sm:flex-row items-center gap-4">
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
          type="submit"
          disabled={isSearchingSerial}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs w-full sm:w-auto px-5 cursor-pointer"
        >
          {isSearchingSerial ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin ml-1.5" />
              <span>در حال استعلام...</span>
            </>
          ) : (
            <span>استعلام آنی اصالت</span>
          )}
        </Button>
      </form>

      {/* Serial Lookup Result Card */}
      {serialLookupResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex flex-col gap-2 ${
            serialLookupResult.isAuthentic
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/30 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-2">
              {serialLookupResult.isAuthentic ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-400" />
              )}
              <span>{serialLookupResult.statusLabel}</span>
            </span>
            <span className="font-mono text-white">{serialLookupResult.serialNumber}</span>
          </div>
          {serialLookupResult.isAuthentic && (
            <div className="flex flex-wrap gap-4 text-[11px] pt-1 text-neutral-300">
              <span>محصول: <strong className="text-white">{serialLookupResult.productName}</strong></span>
              <span>برند: <strong className="text-white">{serialLookupResult.brand}</strong></span>
              <span>روزهای باقیمانده گارانتی: <strong className="text-emerald-400 font-mono">{toPersianDigits(serialLookupResult.daysRemaining)}</strong> روز</span>
            </div>
          )}
        </div>
      )}

      {/* Warranty / RMA Items List */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <h3 className="font-bold text-white text-base">پرونده‌های فعال تعویض درجا و خدمات RMA</h3>
          <span className="text-xs text-neutral-400">
            تعداد پرونده‌ها: <strong className="text-white font-mono">{toPersianDigits(items.length)}</strong> مورد
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
            <span className="text-xs text-neutral-400">در حال فراخوانی تاریخچه گارانتی از سرور...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-white">هیچ پرونده خدمات یا RMA ثبت نشده است</h4>
            <p className="text-xs text-neutral-400 max-w-sm">
              در صورت بروز هرگونه خرابی یا نقص فنی در قطعات خریداری‌شده، با کلیک بر روی دکمه «ثبت درخواست تعویض درجا (RMA)» پرونده تحویل و تعویض را ثبت فرمایید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white">{it.productTitle}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      سریال: {it.serialNumber} ({it.brand})
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-amber-500/10 text-amber-300 border-amber-500/30">
                    {it.statusLabel}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/80">
                  {it.issueDescription}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
                  <span className="text-neutral-400 text-[11px]">
                    تاریخ ثبت: {toPersianDigits(it.requestDate)}
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    SLA تعویض: {toPersianDigits(it.slaHours)} ساعته
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RMA Request Modal */}
      {showRmaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">ثبت درخواست تعویض درجا (RMA)</h3>
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
                <label className="text-neutral-300 font-semibold">شماره سریال قطعه معیوب (S/N):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: FOC2341901"
                  value={formSerial}
                  onChange={(e) => setFormSerial(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono text-left"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">نام و مدل تجهیزات:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سوییچ سیسکو WS-C2960X-24TD-L"
                  value={formProduct}
                  onChange={(e) => setFormProduct(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">شرح ایراد سخت‌افزاری مشاهده شده:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="شرح کامل عیب، علائم LED، وضعیت پاور و گزارش کنسول..."
                  value={formIssue}
                  onChange={(e) => setFormIssue(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRmaModal(false)}
                  className="cursor-pointer"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-1.5" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <span>ثبت و اعزام پیک جمع‌آوری</span>
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
