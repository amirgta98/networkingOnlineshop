"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  FileText,
  UserCheck,
  Loader2,
  Search,
  Building2,
  X,
  Layers,
  Printer,
  ChevronRight,
  ShieldCheck,
  Tag,
  CreditCard,
  Package,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  partnerRfqApi,
  type CreateRfqPayload,
  type CreateRfqItemPayload,
} from "../api/partner-rfq-api";
import type { PartnerRfq, PartnerRfqItem } from "../types/partner.types";

interface BomRow {
  id: string;
  title: string;
  brand: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

export function PartnerRfqView() {
  const [rfqs, setRfqs] = React.useState<PartnerRfq[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState<string | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Modals
  const [showNewRfqModal, setShowNewRfqModal] = React.useState(false);
  const [selectedRfq, setSelectedRfq] = React.useState<PartnerRfq | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Convert RFQ to Order Modal States
  const [rfqToConvert, setRfqToConvert] = React.useState<PartnerRfq | null>(null);
  const [prepaymentPercent, setPrepaymentPercent] = React.useState<number>(30);
  const [paymentMethodChoice, setPaymentMethodChoice] = React.useState<string>("credit_line_b2b");
  const [orderDeliveryNotes, setOrderDeliveryNotes] = React.useState<string>("");
  const [isConvertingToOrder, setIsConvertingToOrder] = React.useState<boolean>(false);
  const [orderSuccessModal, setOrderSuccessModal] = React.useState<{
    orderNumber: string;
    trackingCode: string;
    payableAmount: number;
    projectTitle: string;
  } | null>(null);

  // New RFQ Form State
  const [formProject, setFormProject] = React.useState("");
  const [formUrgency, setFormUrgency] = React.useState<"normal" | "urgent" | "critical">("urgent");
  const [formLocation, setFormLocation] = React.useState("");
  const [formClientName, setFormClientName] = React.useState("");
  const [formClientPhone, setFormClientPhone] = React.useState("");
  const [formNote, setFormNote] = React.useState("");
  const [bomRows, setBomRows] = React.useState<BomRow[]>([
    {
      id: "row-1",
      title: "سوئیچ ۲۴ پورت سیسکو مدل Cisco Catalyst 2960X",
      brand: "Cisco",
      sku: "WS-C2960X-24TD-L",
      quantity: 2,
      unitPrice: 0,
      notes: "با گارانتی طلایی تعویض ققنوس",
    },
    {
      id: "row-2",
      title: "پچ کورد فلوک کت ۶ نگزنس ۵ متری تست فلوک چنل",
      brand: "Nexans",
      sku: "N100.514",
      quantity: 24,
      unitPrice: 0,
      notes: "تست فلوک چنل تایید شده",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const fetchRfqs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await partnerRfqApi.getMyRfqs();
      setRfqs(data);
    } catch (err: any) {
      console.error("[PartnerRfqView] Error loading RFQs:", err);
      setFetchError("خطا در برقراری ارتباط با سرور. لطفاً مجدداً تلاش فرمایید.");
      setRfqs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchRfqs();
  }, [fetchRfqs]);

  // Add BOM Row
  const handleAddBomRow = () => {
    const newId = `row-${Date.now()}`;
    setBomRows((prev) => [
      ...prev,
      {
        id: newId,
        title: "",
        brand: "Cisco",
        sku: "",
        quantity: 1,
        unitPrice: 0,
        notes: "",
      },
    ]);
  };

  // Remove BOM Row
  const handleRemoveBomRow = (id: string) => {
    if (bomRows.length <= 1) {
      showToast("حداقل یک قلم کالا در لیست استعلام الزامی است.");
      return;
    }
    setBomRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Update BOM Row
  const handleUpdateBomRow = (id: string, field: keyof BomRow, value: any) => {
    setBomRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Handle Create RFQ Submit
  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProject.trim()) {
      showToast("عنوان پروژه یا مناقصه الزامی است.");
      return;
    }

    const validRows = bomRows.filter((r) => r.title.trim().length > 0);
    if (validRows.length === 0) {
      showToast("حداقل عنوان یک قلم کالا را در جدول BOM وارد فرمایید.");
      return;
    }

    try {
      setIsSubmitting(true);
      const itemsPayload: CreateRfqItemPayload[] = validRows.map((r) => ({
        title: r.title.trim(),
        brand: r.brand.trim() || undefined,
        sku: r.sku.trim() || undefined,
        quantity: Number(r.quantity) > 0 ? Number(r.quantity) : 1,
        unitPrice: Number(r.unitPrice) >= 0 ? Number(r.unitPrice) : 0,
        notes: r.notes.trim() || undefined,
      }));

      const payload: CreateRfqPayload = {
        projectTitle: formProject.trim(),
        clientName: formClientName.trim() || undefined,
        clientPhone: formClientPhone.trim() || undefined,
        urgency: formUrgency,
        projectLocation: formLocation.trim() || undefined,
        notes: formNote.trim() || undefined,
        items: itemsPayload,
      };

      const created = await partnerRfqApi.createRfq(payload);
      setShowNewRfqModal(false);
      setFormProject("");
      setFormClientName("");
      setFormClientPhone("");
      setFormLocation("");
      setFormNote("");
      setBomRows([
        {
          id: "row-init-1",
          title: "",
          brand: "Cisco",
          sku: "",
          quantity: 1,
          unitPrice: 0,
          notes: "",
        },
      ]);
      await fetchRfqs();
      showToast(`✅ استعلام «${created.rfqNumber}» با موفقیت ثبت و به دپارتمان مهندسی فروش ارسال شد.`);
    } catch (err: any) {
      console.error("[PartnerRfqView] Submit error:", err);
      showToast("❌ خطا در ثبت استعلام. لطفاً ورودی‌ها را بررسی فرمایید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Cancel RFQ
  const handleCancelRfq = async (rfqId: string, rfqNumber: string) => {
    if (!confirm(`آیا از لغو یا حذف استعلام ${rfqNumber} اطمینان دارید؟`)) {
      return;
    }

    try {
      setIsCancelling(rfqId);
      await partnerRfqApi.cancelRfq(rfqId);
      if (selectedRfq?.id === rfqId) {
        setSelectedRfq(null);
      }
      await fetchRfqs();
      showToast(`استعلام ${rfqNumber} با موفقیت لغو گردید.`);
    } catch (err) {
      console.error("[PartnerRfqView] Cancel error:", err);
      showToast("خطا در لغو استعلام. ممکن است این استعلام قبلاً نهایی شده باشد.");
    } finally {
      setIsCancelling(null);
    }
  };

  const handleOpenConvertModal = (rfq: PartnerRfq) => {
    setRfqToConvert(rfq);
    setPrepaymentPercent(30);
    setPaymentMethodChoice("credit_line_b2b");
    setOrderDeliveryNotes(rfq.notes || "");
  };

  const handleConfirmConvertToOrder = async () => {
    if (!rfqToConvert) return;

    try {
      setIsConvertingToOrder(true);
      const res = await partnerRfqApi.convertToOrder(rfqToConvert.id, {
        prepaymentPercent,
        paymentMethod: paymentMethodChoice,
        notes: orderDeliveryNotes.trim() || undefined,
      });

      const createdOrderNumber = res?.orderNumber || `ORD-${rfqToConvert.rfqNumber}`;
      const createdTrackingCode = res?.trackingCode || "TRK-B2B";
      const totalPayable = res?.payableAmount || rfqToConvert.finalQuotedAmount || 0;

      setRfqToConvert(null);
      setSelectedRfq(null);

      // Open Success Confirmation Modal
      setOrderSuccessModal({
        orderNumber: createdOrderNumber,
        trackingCode: createdTrackingCode,
        payableAmount: totalPayable,
        projectTitle: rfqToConvert.projectTitle,
      });

      // Dispatch global events for real-time sync across panels
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("order-created", { detail: res }));
        window.dispatchEvent(new CustomEvent("dashboard-stats-updated"));
      }

      showToast(`✅ سفارش جدید با شماره «${createdOrderNumber}» در سیستم ثبت شد.`);
      await fetchRfqs();
    } catch (err: any) {
      console.error("[PartnerRfqView] Convert to order error:", err);
      showToast("خطا در ثبت و تبدیل استعلام به سفارش در سرور.");
    } finally {
      setIsConvertingToOrder(false);
    }
  };

  // Filtered RFQs
  const filteredRfqs = React.useMemo(() => {
    return rfqs.filter((r) => {
      // Tab filter
      if (activeTab === "pending" && r.status !== "pending_review") return false;
      if (activeTab === "quoted" && r.status !== "quote_issued") return false;
      if (activeTab === "approved" && r.status !== "approved") return false;
      if (activeTab === "expired" && r.status !== "expired" && r.status !== "rejected") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = r.rfqNumber.toLowerCase().includes(q);
        const matchTitle = r.projectTitle.toLowerCase().includes(q);
        const matchNotes = (r.notes || "").toLowerCase().includes(q);
        if (!matchNumber && !matchTitle && !matchNotes) return false;
      }
      return true;
    });
  }, [rfqs, activeTab, searchQuery]);

  // Stats calculation
  const totalCount = rfqs.length;
  const pendingCount = rfqs.filter((r) => r.status === "pending_review").length;
  const quotedCount = rfqs.filter((r) => r.status === "quote_issued").length;
  const totalPipeline = rfqs.reduce((acc, cur) => acc + (cur.totalEstimated || 0), 0);

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 rounded-2xl bg-neutral-900/95 border border-purple-500/40 text-white px-5 py-3 shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">استعلام قیمت پروژه‌ای و مناقصات (RFQ)</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                ارسال لیست تجمیعی اقلام (BOM)، دریافت پیش‌فاکتور با تخفیف ویژه پیمانکاران و تثبیت قیمت
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowNewRfqModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white gap-2 text-xs shadow-lg shadow-purple-600/25 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>ثبت استعلام جدید (BOM)</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm flex flex-col gap-1.5">
          <span className="text-xs text-neutral-400">کل استعلام‌های پروژه‌ای</span>
          <span className="text-xl font-bold font-mono text-white">
            {toPersianDigits(totalCount)} <span className="text-xs font-normal text-neutral-500">مورد</span>
          </span>
          <span className="text-[11px] text-neutral-500">پوشش تمامی مناقصات و پروژه‌ها</span>
        </div>

        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm flex flex-col gap-1.5">
          <span className="text-xs text-neutral-400">در انتظار قیمت‌گذاری</span>
          <span className="text-xl font-bold font-mono text-amber-400">
            {toPersianDigits(pendingCount)} <span className="text-xs font-normal text-neutral-500">پروژه</span>
          </span>
          <span className="text-[11px] text-amber-500/90 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>در صف کارشناسی فروش</span>
          </span>
        </div>

        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm flex flex-col gap-1.5">
          <span className="text-xs text-neutral-400">پیش‌فاکتور صادر شده</span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {toPersianDigits(quotedCount)} <span className="text-xs font-normal text-neutral-500">مورد</span>
          </span>
          <span className="text-[11px] text-emerald-500/90 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>آماده تبدیل به سفارش قطعی</span>
          </span>
        </div>

        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm flex flex-col gap-1.5">
          <span className="text-xs text-neutral-400">ارزش کل خط لوله پروژه‌ها</span>
          <span className="text-xl font-bold font-mono text-purple-400">
            {formatPrice(totalPipeline)}
          </span>
          <span className="text-[11px] text-neutral-500">برآورد اولیه ریالی</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 text-xs text-purple-300 leading-relaxed flex items-start gap-3">
        <Clock className="h-4 w-4 shrink-0 mt-0.5 text-purple-400" />
        <div>
          <strong>فرآیند استعلام قیمت سازمانی:</strong> پیش‌فاکتورهای پروژه‌ای معمولاً ظرف حداکثر ۲ تا ۴ ساعت کاری توسط دپارتمان مهندسی فروش ققنوس بررسی و با اعمال تخفیف‌های ویژه حجم خرید صادر می‌گردند. پس از تایید پیش‌فاکتور، اقلام مستقیماً در انبار رزرو می‌شوند.
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all", label: "همه استعلام‌ها", count: totalCount },
            { id: "pending", label: "در انتظار قیمت‌گذاری", count: pendingCount },
            { id: "quoted", label: "پیش‌فاکتور صادر شده", count: quotedCount },
            { id: "approved", label: "تایید شده", count: rfqs.filter((r) => r.status === "approved").length },
            { id: "expired", label: "منقضی / لغو شده", count: rfqs.filter((r) => r.status === "expired" || r.status === "rejected").length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? "bg-purple-700 text-white" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {toPersianDigits(tab.count)}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="جستجوی شماره RFQ، عنوان یا کالا..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/60"
          />
        </div>
      </div>

      {/* RFQ List Section */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            <span className="text-xs text-neutral-400">در حال فراخوانی استعلام‌ها از دیتابیس سرور...</span>
          </div>
        ) : fetchError ? (
          <div className="rounded-3xl border border-rose-500/30 bg-[var(--theme-surface)] p-12 text-center flex flex-col items-center justify-center gap-3">
            <AlertCircle className="h-8 w-8 text-rose-400" />
            <span className="text-xs text-rose-300 font-medium">{fetchError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchRfqs()}
              className="text-xs border-neutral-700 text-white mt-2 cursor-pointer"
            >
              تلاش مجدد
            </Button>
          </div>
        ) : filteredRfqs.length === 0 ? (
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">هیچ استعلام قیمتی یافت نشد</h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              {searchQuery
                ? "استعلام قیمتی منطبق با عبارت جستجو یافت نشد."
                : "هنوز هیچ استعلام قیمت پروژه‌ای (BOM) برای حساب شما ثبت نشده است."}
            </p>
            <Button
              onClick={() => setShowNewRfqModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white gap-2 text-xs mt-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>ثبت اولین استعلام قیمت (BOM)</span>
            </Button>
          </div>
        ) : (
          filteredRfqs.map((rfq) => {
            const isQuoted = rfq.status === "quote_issued";
            const isApproved = rfq.status === "approved";
            const isExpired = rfq.status === "expired" || rfq.status === "rejected";

            return (
              <div
                key={rfq.id}
                className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-sm hover:border-purple-500/40 transition-all flex flex-col gap-4"
              >
                {/* Header Line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-bold text-sm text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/20">
                      {rfq.rfqNumber}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      تاریخ درخواست: {toPersianDigits(rfq.date)}
                    </span>
                    <span className="text-xs text-neutral-400">
                      تعداد اقلام: <strong className="text-white font-mono">{toPersianDigits(rfq.itemsCount)}</strong> قلم
                    </span>
                    {rfq.urgent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium">
                        فوریت بالا (۲۴ ساعته)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium ${
                        isApproved
                          ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                          : isQuoted
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : isExpired
                          ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isApproved
                            ? "bg-sky-400"
                            : isQuoted
                            ? "bg-emerald-400"
                            : isExpired
                            ? "bg-neutral-500"
                            : "bg-amber-400 animate-pulse"
                        }`}
                      />
                      <span>{rfq.statusLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Card Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-neutral-400">عنوان پروژه یا مناقصه:</span>
                    <span className="text-white font-bold text-sm leading-snug">{rfq.projectTitle}</span>
                    {rfq.projectLocation && (
                      <span className="text-[11px] text-neutral-500 mt-0.5">
                        محل پروژه: {rfq.projectLocation}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-neutral-400">کارشناس تخصصی رسیدگی:</span>
                    <span className="text-neutral-200 font-medium flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-purple-400" />
                      <span>{rfq.assignedEngineer}</span>
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      مهلت اعتبار پیش‌فاکتور: {toPersianDigits(rfq.validityDaysRemaining)} روز
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-neutral-400">
                      {isQuoted ? "مبلغ نهایی پیش‌فاکتور رسمی:" : "وضعیت قیمت‌گذاری:"}
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {rfq.finalQuotedAmount && rfq.finalQuotedAmount > 0
                        ? formatPrice(rfq.finalQuotedAmount)
                        : "در انتظار بررسی و قیمت‌گذاری مهندسی"}
                    </span>
                    {rfq.discountPercent !== undefined && rfq.discountPercent > 0 && rfq.finalQuotedAmount ? (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        شامل {toPersianDigits(rfq.discountPercent)}٪ تخفیف ویژه پیمانکاری
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Items Preview Chips */}
                {rfq.items && rfq.items.length > 0 && (
                  <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex flex-wrap gap-2 text-xs">
                    {rfq.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="px-2.5 py-1 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-neutral-300 text-[11px] flex items-center gap-1.5"
                      >
                        <Tag className="h-3 w-3 text-purple-400" />
                        <span className="max-w-[200px] truncate">{item.title}</span>
                        <span className="text-neutral-500 font-mono">({toPersianDigits(item.requestedQty)} عدد)</span>
                      </span>
                    ))}
                    {rfq.items.length > 3 && (
                      <span className="text-[11px] text-purple-400 self-center">
                        + {toPersianDigits(rfq.items.length - 3)} ردیف دیگر...
                      </span>
                    )}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-neutral-400">
                    شناسه سیستمی: <span className="font-mono text-neutral-500">{rfq.id.slice(0, 8)}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {!isApproved && !isExpired && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isCancelling === rfq.id}
                        onClick={() => handleCancelRfq(rfq.id, rfq.rfqNumber)}
                        className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                      >
                        {isCancelling === rfq.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 ml-1" />
                        )}
                        <span>لغو استعلام</span>
                      </Button>
                    )}

                    {isQuoted && (
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer font-bold gap-1 shadow-md shadow-emerald-600/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenConvertModal(rfq);
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
                        <span>تایید پیش‌پرداخت و ثبت سفارش</span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white cursor-pointer"
                      onClick={() => setSelectedRfq(rfq)}
                    >
                      <FileText className="h-3.5 w-3.5 ml-1.5 text-purple-400" />
                      <span>مشاهده جزئیات BOM و دانلود</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BOM Detail Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-6 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-6 w-6 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>جزئیات استعلام BOM: {selectedRfq.rfqNumber}</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{selectedRfq.projectTitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRfq(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status & Pricing Banner */}
            <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-neutral-400">وضعیت استعلام:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <span>{selectedRfq.statusLabel}</span>
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-neutral-400">مبلغ نهایی پیش‌فاکتور:</span>
                <span className="font-bold font-mono text-sm text-emerald-400">
                  {selectedRfq.finalQuotedAmount && selectedRfq.finalQuotedAmount > 0
                    ? formatPrice(selectedRfq.finalQuotedAmount)
                    : "در انتظار اعلام قیمت توسط کارشناس"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-neutral-400">مهلت اعتبار پیش‌فاکتور:</span>
                <span className="font-mono text-white">
                  {toPersianDigits(selectedRfq.validityDaysRemaining)} روز کاری
                </span>
              </div>
            </div>

            {/* Notes Section if any */}
            {selectedRfq.notes && (
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 leading-relaxed">
                <strong>یادداشت و مشخصات فنی پروژه:</strong> {selectedRfq.notes}
              </div>
            )}

            {/* Items Table */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-neutral-300">لیست تجمیعی اقلام و تجهیزات (BOM):</h4>
              <div className="overflow-x-auto rounded-2xl border border-neutral-800">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-900/70 text-neutral-400 font-semibold">
                      <th className="py-2.5 pr-3">ردیف</th>
                      <th className="py-2.5 pr-3">شرح کامل کالا یا پارت نامبر</th>
                      <th className="py-2.5 pr-3">برند</th>
                      <th className="py-2.5 pr-3">پارت نامبر / SKU</th>
                      <th className="py-2.5 pr-3 text-center">تعداد</th>
                      <th className="py-2.5 pr-3">قیمت واحد (تومان)</th>
                      <th className="py-2.5 pr-3">مبلغ کل (تومان)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono text-neutral-300">
                    {selectedRfq.items && selectedRfq.items.length > 0 ? (
                      selectedRfq.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-neutral-900/40">
                          <td className="py-2.5 pr-3 text-neutral-500">{toPersianDigits(idx + 1)}</td>
                          <td className="py-2.5 pr-3 font-sans font-medium text-white max-w-[220px]">
                            {item.title}
                          </td>
                          <td className="py-2.5 pr-3 text-neutral-400 font-sans">{item.brand || "—"}</td>
                          <td className="py-2.5 pr-3 text-sky-400 text-[11px]">{item.sku || "—"}</td>
                          <td className="py-2.5 pr-3 text-center font-bold text-white">
                            {toPersianDigits(item.requestedQty)}
                          </td>
                          <td className="py-2.5 pr-3 text-neutral-300">
                            {item.unitPrice ? formatPrice(item.unitPrice) : "بررسی مهندسی"}
                          </td>
                          <td className="py-2.5 pr-3 font-bold text-emerald-400">
                            {item.totalPrice ? formatPrice(item.totalPrice) : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-neutral-500 font-sans">
                          اقلام به صورت بسته تجمیعی ثبت گردیده‌اند.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs border-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
              >
                <Printer className="h-4 w-4 ml-1.5" />
                <span>چاپ نسخه پیش‌فاکتور BOM</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRfq(null)}
                  className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  بستن
                </Button>
                {selectedRfq.status === "quote_issued" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer font-bold gap-1 shadow-md shadow-emerald-600/20"
                    onClick={() => handleOpenConvertModal(selectedRfq)}
                  >
                    <CheckCircle2 className="h-4 w-4 ml-1" />
                    <span>تایید پیش‌پرداخت و تبدیل به سفارش قطعی</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New RFQ BOM Creator Modal */}
      {showNewRfqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-purple-500/40 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">ثبت استعلام قیمت پروژه‌ای و مناقصه (BOM)</h3>
                  <p className="text-xs text-neutral-400">اقلام مورد نظر را به همراه تعداد و برند وارد نمایید</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRfqModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfq} className="flex flex-col gap-5 text-xs">
              {/* Project Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-neutral-300 font-semibold">عنوان کامل پروژه یا مناقصه (الزامی):</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: نوسازی سوئیچ‌ها و فیبر نوری دیتاسنتر پالایشگاه تهران"
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">فوریت پاسخ استعلام:</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as any)}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="urgent">فوری (حداکثر ۲ تا ۴ ساعت)</option>
                    <option value="normal">عادی (ظرف ۲۴ ساعت)</option>
                    <option value="critical">بحرانی / مناقصه فوری (۱ ساعت)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">محل اجرای پروژه / شهر:</label>
                  <input
                    type="text"
                    placeholder="مثال: تهران - شهرک غرب"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">نام کارفرما / رابط فنی پروژه:</label>
                  <input
                    type="text"
                    placeholder="مثال: مهندس راد"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">شماره تماس مستقیم ناظر فنی:</label>
                  <input
                    type="text"
                    placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                    value={formClientPhone}
                    onChange={(e) => setFormClientPhone(e.target.value)}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono text-left"
                  />
                </div>
              </div>

              {/* Dynamic BOM Table */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">جدول ردیف اقلام تجهیزات و کالاها (BOM)</h4>
                    <span className="text-[11px] text-neutral-400">
                      پارت نامبر دقیق و تعداد مورد نیاز هر ردیف را مشخص فرمایید:
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddBomRow}
                    className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 ml-1" />
                    <span>افزودن ردیف کالا</span>
                  </Button>
                </div>

                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {bomRows.map((row, index) => (
                    <div
                      key={row.id}
                      className="p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row items-center gap-2.5"
                    >
                      <span className="w-6 text-center text-neutral-500 font-mono font-bold text-xs shrink-0">
                        {toPersianDigits(index + 1)}
                      </span>

                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          required
                          placeholder="نام کامل کالا یا مدل (مثال: Cisco WS-C2960X-24TD-L)..."
                          value={row.title}
                          onChange={(e) => handleUpdateBomRow(row.id, "title", e.target.value)}
                          className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>

                      <div className="w-28 shrink-0">
                        <select
                          value={row.brand}
                          onChange={(e) => handleUpdateBomRow(row.id, "brand", e.target.value)}
                          className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-purple-500 text-xs"
                        >
                          <option value="Cisco">Cisco</option>
                          <option value="MikroTik">MikroTik</option>
                          <option value="Nexans">Nexans</option>
                          <option value="Legrand">Legrand</option>
                          <option value="Schneider">Schneider</option>
                          <option value="HPE">HPE Server</option>
                          <option value="Ubiquiti">Ubiquiti</option>
                          <option value="Other">سایر برندها</option>
                        </select>
                      </div>

                      <div className="w-20 shrink-0">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          title="تعداد"
                          placeholder="تعداد"
                          value={row.quantity}
                          onChange={(e) => handleUpdateBomRow(row.id, "quantity", parseInt(e.target.value) || 1)}
                          className="w-full p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-center focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveBomRow(row.id)}
                        className="text-neutral-500 hover:text-rose-400 p-2 shrink-0 cursor-pointer"
                        title="حذف ردیف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Technical Notes */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-800">
                <label className="text-neutral-300 font-semibold">توضیحات و نیازمندی‌های خاص فنی:</label>
                <textarea
                  rows={2}
                  placeholder="شامل استانداردهای کابل‌کشی، نیاز به گواهی اصالت کالا، تست فلوک، مهلت تحویل درخواستی..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 resize-none text-xs"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewRfqModal(false)}
                  className="cursor-pointer"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white cursor-pointer px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-1.5" />
                      <span>در حال ارسال BOM...</span>
                    </>
                  ) : (
                    <span>ارسال و ثبت نهایی در سامانه</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Prepayment & Convert to Order Modal ─── */}
      {rfqToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-emerald-500/40 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    تایید پیش‌پرداخت و ثبت سفارش قطعی
                  </h3>
                  <p className="text-xs text-neutral-400">
                    استعلام {rfqToConvert.rfqNumber} — {rfqToConvert.projectTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRfqToConvert(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">مبلغ مصوب پیش‌فاکتور:</span>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  {formatPrice(rfqToConvert.finalQuotedAmount || 0)}
                </span>
              </div>
              {Boolean(rfqToConvert.discountPercent && rfqToConvert.discountPercent > 0) && (
                <div className="flex justify-between items-center text-[11px] text-purple-300">
                  <span>تخفیف ویژه همکاری لحاظ‌شده:</span>
                  <span className="font-mono">{toPersianDigits(rfqToConvert.discountPercent || 0)}٪</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                <span className="text-neutral-300 font-semibold">مبلغ پیش‌پرداخت قابل پرداخت:</span>
                <span className="font-mono font-black text-white text-base">
                  {formatPrice(Math.round(((rfqToConvert.finalQuotedAmount || 0) * prepaymentPercent) / 100))}
                </span>
              </div>
            </div>

            {/* Prepayment Percentage Selector */}
            <div className="flex flex-col gap-2 text-xs">
              <label className="text-neutral-300 font-semibold">میزان پیش‌پرداخت پروژه‌ای:</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { percent: 30, label: "۳۰٪ پیش‌پرداخت" },
                  { percent: 50, label: "۵۰٪ پیش‌پرداخت" },
                  { percent: 100, label: "۱۰۰٪ تسویه کامل" },
                ].map((opt) => (
                  <button
                    key={opt.percent}
                    type="button"
                    onClick={() => setPrepaymentPercent(opt.percent)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      prepaymentPercent === opt.percent
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm shadow-emerald-500/20"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      {formatPrice(Math.round(((rfqToConvert.finalQuotedAmount || 0) * opt.percent) / 100))}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-2 text-xs">
              <label className="text-neutral-300 font-semibold">روش پرداخت پیش‌پرداخت:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice("credit_line_b2b")}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-2.5 ${
                    paymentMethodChoice === "credit_line_b2b"
                      ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                  }`}
                >
                  <CreditCard className="h-4 w-4 shrink-0 text-purple-400 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-white text-xs">خط اعتباری B2B / چک صیادی</span>
                    <span className="text-[10px] text-neutral-400">کسر از سقف اعتباری تاییدشده همکار</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice("bank_transfer_satna")}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-2.5 ${
                    paymentMethodChoice === "bank_transfer_satna"
                      ? "bg-sky-500/15 text-sky-300 border-sky-500/40"
                      : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                  }`}
                >
                  <Building2 className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-white text-xs">حواله بانکی ساتنا / فیش پایا</span>
                    <span className="text-[10px] text-neutral-400">واریز به حساب حقوقی ققنوس آکادمی</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Delivery & Project Notes */}
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="text-neutral-300 font-semibold">توضیحات و هماهنگی تحویل پروژه (اختیاری):</label>
              <textarea
                rows={2}
                value={orderDeliveryNotes}
                onChange={(e) => setOrderDeliveryNotes(e.target.value)}
                placeholder="آدرس سایت تحویل، نام نماینده تحویل‌گیرنده در محل پروژه، ساعت مجاز تخلیه بار..."
                className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRfqToConvert(null)}
                className="cursor-pointer"
              >
                انصراف
              </Button>
              <Button
                type="button"
                disabled={isConvertingToOrder}
                onClick={handleConfirmConvertToOrder}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer px-6 font-bold gap-2 shadow-lg shadow-emerald-600/25"
              >
                {isConvertingToOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>در حال ثبت نهایی سفارش...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>تایید پیش‌پرداخت و ثبت سفارش قطعی</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Order Success Confirmation Modal ─── */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/40 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex flex-col items-center text-center gap-2 pt-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-1 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h3 className="text-lg font-black text-white">سفارش جدید شما با موفقیت ثبت گردید!</h3>
              <p className="text-xs text-neutral-300 max-w-xs leading-relaxed">
                پیش‌فاکتور به سفارش قطعی تبدیل شد و پیام سفارش جدید در کارتابل مدیریت و انبار ثبت گردید.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">شماره سفارش اختصاصی:</span>
                <span className="font-mono font-black text-sm text-purple-400 bg-purple-500/15 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                  {orderSuccessModal.orderNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">کد رهگیری سامانه:</span>
                <span className="font-mono text-neutral-300 font-bold">{orderSuccessModal.trackingCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">پروژه:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{orderSuccessModal.projectTitle}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                <span className="text-neutral-400 font-semibold">مبلغ کل سفارش:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {formatPrice(orderSuccessModal.payableAmount)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
              <Link href="/partner/orders" onClick={() => setOrderSuccessModal(null)}>
                <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-sky-600/25">
                  <Package className="h-4 w-4" />
                  <span>مشاهده سفارش در بخش سفارش‌ها</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrderSuccessModal(null)}
                className="w-full text-xs border-neutral-800 text-neutral-400 hover:text-white"
              >
                بستن و ماندن در استعلام‌ها
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
