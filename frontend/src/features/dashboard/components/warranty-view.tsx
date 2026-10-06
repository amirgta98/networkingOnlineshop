"use client";

import * as React from "react";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  Truck,
  RotateCcw,
  Sparkles,
  QrCode,
  Plus,
} from "lucide-react";
import { useDashboardWarranty } from "../hooks/use-dashboard-warranty";
import { SerialVerificationResult, RmaRequest } from "../types/warranty.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardFilterBar,
  DashboardStatusBadge,
  DashboardEmptyState,
  DashboardModal,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

export function WarrantyView() {
  const { rmaRequests, isLoaded, verifySerialNumber, submitRma } = useDashboardWarranty();

  // Serial verification state
  const [serialQuery, setSerialQuery] = React.useState("FOC21348821");
  const [verifyResult, setVerifyResult] = React.useState<SerialVerificationResult | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  // RMA Modal State
  const [isRmaModalOpen, setIsRmaModalOpen] = React.useState(false);
  const [rmaSerial, setRmaSerial] = React.useState("");
  const [rmaProduct, setRmaProduct] = React.useState("");
  const [faultDesc, setFaultDesc] = React.useState("");
  const [deliveryMethod, setDeliveryMethod] = React.useState<"courier" | "tipax" | "in_person">("courier");
  const [rmaError, setRmaError] = React.useState<string | null>(null);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!serialQuery.trim()) return;
    setHasSearched(true);
    const result = verifySerialNumber(serialQuery);
    setVerifyResult(result);
  };

  React.useEffect(() => {
    // Initial verification of demo serial
    const result = verifySerialNumber("FOC21348821");
    setVerifyResult(result);
    setHasSearched(true);
  }, []);

  const handleOpenRmaForSerial = (result: SerialVerificationResult) => {
    setRmaSerial(result.serialNumber);
    setRmaProduct(result.productName);
    setFaultDesc("");
    setRmaError(null);
    setIsRmaModalOpen(true);
  };

  const handleRmaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRmaError(null);
    if (!rmaSerial.trim()) {
      setRmaError("شماره سریال قطعه الزامی است.");
      return;
    }
    if (!faultDesc.trim()) {
      setRmaError("لطفاً شرح ایراد یا خرابی سخت‌افزاری را وارد فرمایید.");
      return;
    }

    submitRma({
      serialNumber: rmaSerial,
      productName: rmaProduct || "تجهیزات شبکه",
      faultDescription: faultDesc,
      deliveryMethod,
    });

    setIsRmaModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="استعلام اصالت و گارانتی طلایی (RMA)"
        description="سامانه هوشمند اعتبارسنجی سریال قطعات شبکه، اصالت هولوگرام ولوکس و ثبت آنلاین درخواست تعمیر یا تعویض درجا"
        icon={ShieldCheck}
        badge="گارانتی ۳۶ ماهه تعویض"
        badgeVariant="emerald"
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setRmaSerial("");
              setRmaProduct("");
              setFaultDesc("");
              setIsRmaModalOpen(true);
            }}
            className="text-xs gap-1.5 font-bold cursor-pointer shadow-md shadow-orange-500/15"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ ثبت درخواست خدمات RMA</span>
          </Button>
        }
      />

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="تجهیزات ثبت‌شده تحت پوشش"
          value={
            <span>
              {toPersianDigits("6")}{" "}
              <span className="text-xs font-normal text-neutral-400">دستگاه فعال</span>
            </span>
          }
          subtitle="سوئیچ‌ها، روترها و ماژول‌های نوری"
          icon={ShieldCheck}
          variant="emerald"
        />

        <DashboardMetricCard
          title="درخواست‌های RMA در دست اقدام"
          value={
            <span>
              {toPersianDigits(rmaRequests.length)}{" "}
              <span className="text-xs font-normal text-neutral-400">پرونده فعال</span>
            </span>
          }
          subtitle="در حال تست و عیب‌یابی در لابراتوار فنی"
          icon={Wrench}
          variant="orange"
        />

        <DashboardMetricCard
          title="تضمین خدمات طلایی"
          value="تعویض درجا"
          subtitle="بدون معطلی در صورت تایید نقص سخت‌افزاری"
          icon={RotateCcw}
          variant="sky"
        />
      </div>

      {/* ── 3. Quick Serial Verification Box ───────────────────────── */}
      <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-neutral-900 via-[var(--theme-surface)] to-neutral-900 p-4 sm:p-7 shadow-lg text-right">
        <div className="flex items-center gap-2.5 mb-3">
          <QrCode className="h-5 w-5 text-orange-400 shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-[var(--theme-foreground)]">
            استعلام آنی اصالت و وضعیت گارانتی با بارکد سریال (Serial No)
          </h2>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
          شماره سریال درج‌شده روی جعبه یا برچسب متال هولوگرام دستگاه را وارد کنید:
        </p>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={serialQuery}
              onChange={(e) => setSerialQuery(e.target.value)}
              placeholder="مثال: FOC21348821 یا FOC992104"
              className="w-full h-11 px-4 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-sm font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <Button type="submit" variant="default" className="h-11 px-6 font-bold gap-2 w-full sm:w-auto justify-center">
            <Search className="h-4 w-4" />
            <span>بررسی اصالت و گارانتی</span>
          </Button>
        </form>

        {/* Verification Result Display */}
        {hasSearched && verifyResult && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-bold text-emerald-300 break-words">
                  {verifyResult.productName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  سریال: {verifyResult.serialNumber}
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  هولوگرام: {verifyResult.hologramCode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-emerald-500/20">
              <div className="p-2 sm:p-0 rounded-lg bg-emerald-950/20 sm:bg-transparent">
                <span className="text-[11px] text-neutral-400 block mb-0.5">طرح گارانتی:</span>
                <span className="font-semibold text-neutral-200 leading-snug break-words">{verifyResult.warrantyType}</span>
              </div>
              <div className="p-2 sm:p-0 rounded-lg bg-emerald-950/20 sm:bg-transparent">
                <span className="text-[11px] text-neutral-400 block mb-0.5">اعتبار تا تاریخ:</span>
                <span className="font-mono font-bold text-neutral-200">
                  {toPersianDigits(verifyResult.endDate)}
                </span>
              </div>
              <div className="p-2 sm:p-0 rounded-lg bg-emerald-950/20 sm:bg-transparent">
                <span className="text-[11px] text-neutral-400 block mb-0.5">روزهای باقیمانده:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {toPersianDigits(verifyResult.daysRemaining)} روز
                </span>
              </div>
              <div className="p-2 sm:p-0 rounded-lg bg-emerald-950/20 sm:bg-transparent">
                <span className="text-[11px] text-neutral-400 block mb-0.5">اصالت قطعه:</span>
                <span className="font-bold text-emerald-400">۱۰۰٪ تایید شده اورجینال ✓</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenRmaForSerial(verifyResult)}
                className="w-full sm:w-auto text-xs gap-1 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 justify-center"
              >
                <Wrench className="h-3.5 w-3.5 shrink-0" />
                <span className="break-words">ثبت درخواست سرویس یا تعویض (RMA) برای این کالا</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. RMA Requests List ───────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-neutral-200">
          درخواست‌های فعال خدمات و رهگیری مراحل لابراتوار (RMA Tracking):
        </h3>

        {rmaRequests.map((rma) => (
          <div
            key={rma.id}
            className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-xs p-4 sm:p-6 flex flex-col gap-4 text-right"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[var(--theme-border-color)] pb-3 sm:pb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="text-xs text-neutral-400 font-mono">شناسه RMA:</span>
                <span className="text-sm font-black font-mono text-[var(--theme-foreground)]">
                  {rma.rmaNumber}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  (سریال: {rma.serialNumber})
                </span>
              </div>

              <div>
                <DashboardStatusBadge label={rma.currentStageLabel} variant="warning" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-neutral-200">{rma.productName}</span>
              <p className="text-xs text-neutral-400 leading-relaxed bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                <strong>شرح ایراد:</strong> {rma.faultDescription}
              </p>
            </div>

            {/* Stepper Timeline */}
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {rma.timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex sm:flex-col items-center sm:text-center gap-2 p-2 rounded-xl ${
                      step.isCurrent
                        ? "bg-orange-500/10 border border-orange-500/30 text-orange-400"
                        : step.isCompleted
                        ? "text-emerald-400"
                        : "text-neutral-500 opacity-60"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        step.isCurrent
                          ? "bg-orange-500 text-white animate-pulse"
                          : step.isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {step.isCompleted ? "✓" : toPersianDigits(idx + 1)}
                    </div>
                    <div className="flex flex-col text-right sm:text-center text-xs">
                      <span className="font-bold leading-tight">{step.title}</span>
                      {step.timestamp && (
                        <span className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {toPersianDigits(step.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. RMA Modal ───────────────────────────────────────────── */}
      <DashboardModal
        isOpen={isRmaModalOpen}
        onClose={() => setIsRmaModalOpen(false)}
        title="ثبت درخواست خدمات و بازگشت کالا (RMA)"
        description="پذیرش در مرکز خدمات پس از فروش و لابراتوار فنی تخصصی تجهیزات شبکه ولوکس"
        maxWidth="md"
      >
        <form onSubmit={handleRmaSubmit} className="flex flex-col gap-4 text-right" dir="rtl">
          {rmaError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {rmaError}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              شماره سریال دستگاه:
            </label>
            <input
              type="text"
              value={rmaSerial}
              onChange={(e) => setRmaSerial(e.target.value)}
              placeholder="مثلاً: FOC21348821"
              className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              نام یا مدل دستگاه:
            </label>
            <input
              type="text"
              value={rmaProduct}
              onChange={(e) => setRmaProduct(e.target.value)}
              placeholder="مثلاً: سوئیچ سیسکو 2960X"
              className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              شرح دقیق نقص یا ایراد فنی:
            </label>
            <textarea
              rows={3}
              value={faultDesc}
              onChange={(e) => setFaultDesc(e.target.value)}
              placeholder="توضیح دهید دستگاه چه علائمی دارد (مثلاً سوختن پورت‌ها، ریستارت شدن مداوم)..."
              className="w-full p-2.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              نحوه ارسال قطعه به مرکز سرویس ولوکس:
            </label>
            <select
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value as any)}
              className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="courier">هماهنگی پیک اختصاصی ولوکس در محل شما (تهران)</option>
              <option value="tipax">ارسال با تیپاکس / پست به انبار مرکزی</option>
              <option value="in_person">تحویل حضوری در لابراتوار مرکزی (خیابان ولیعصر)</option>
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRmaModalOpen(false)}
              className="w-full sm:w-auto"
            >
              انصراف
            </Button>
            <Button type="submit" variant="default" size="sm" className="w-full sm:w-auto font-bold justify-center">
              ثبت نهایی درخواست RMA
            </Button>
          </div>
        </form>
      </DashboardModal>
    </div>
  );
}
