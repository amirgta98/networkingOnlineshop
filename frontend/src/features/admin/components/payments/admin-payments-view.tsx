"use client";

import * as React from "react";
import {
  CreditCard,
  Building2,
  Settings,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Wallet,
  Briefcase,
  FileCheck2,
  Layers,
  ArrowRightLeft,
  Info,
  X,
  Receipt,
  Eye,
  XCircle,
  FileText,
  Search,
  Clock,
  ZoomIn,
  FileImage,
  ArrowUpRight,
} from "lucide-react";
import {
  adminPaymentsApi,
  AdminPaymentGateway,
  AdminBankAccount,
  AdminPaymentSettings,
  AdminPaymentReceiptItem,
} from "../../api/admin-payments-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function AdminPaymentsView() {
  const [activeTab, setActiveTab] = React.useState<"gateways" | "banks" | "settings" | "receipts">("gateways");

  // Data states
  const [gateways, setGateways] = React.useState<AdminPaymentGateway[]>([]);
  const [bankAccounts, setBankAccounts] = React.useState<AdminBankAccount[]>([]);
  const [settings, setSettings] = React.useState<AdminPaymentSettings>({
    global_sandbox_mode: true,
    is_wallet_payment_enabled: true,
    is_card_to_card_enabled: true,
    is_cheque_payment_enabled: true,
    is_corporate_credit_enabled: true,
    min_wallet_recharge: 10000,
    max_wallet_recharge: 500000000,
  });

  // Receipts state
  const [receipts, setReceipts] = React.useState<AdminPaymentReceiptItem[]>([]);
  const [receiptFilter, setReceiptFilter] = React.useState<"all" | "pending" | "approved">("pending");
  const [receiptSearch, setReceiptSearch] = React.useState("");
  const [selectedReceiptForPreview, setSelectedReceiptForPreview] = React.useState<AdminPaymentReceiptItem | null>(null);
  const [approvingReceiptId, setApprovingReceiptId] = React.useState<string | null>(null);
  const [approvalNote, setApprovalNote] = React.useState("");
  const [rejectingReceipt, setRejectingReceipt] = React.useState<AdminPaymentReceiptItem | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [isGatewayModalOpen, setIsGatewayModalOpen] = React.useState(false);
  const [editingGateway, setEditingGateway] = React.useState<AdminPaymentGateway | null>(null);
  const [gatewayForm, setGatewayForm] = React.useState({
    name: "",
    provider: "zarinpal",
    merchantId: "",
    terminalId: "",
    apiKey: "",
    isSandbox: true,
    isActive: true,
    isDefault: false,
    description: "",
  });

  const [isBankModalOpen, setIsBankModalOpen] = React.useState(false);
  const [editingBank, setEditingBank] = React.useState<AdminBankAccount | null>(null);
  const [bankForm, setBankForm] = React.useState({
    bankName: "",
    accountOwner: "",
    cardNumber: "",
    shebaNumber: "",
    accountNumber: "",
    isActive: true,
    isDefault: false,
    displayOrder: 1,
  });

  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    type: "gateway" | "bank";
    id: string;
    title: string;
  } | null>(null);

  // Load all data
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [gList, bList, sData, rList] = await Promise.all([
        adminPaymentsApi.getGateways(),
        adminPaymentsApi.getBankAccounts(),
        adminPaymentsApi.getSettings(),
        adminPaymentsApi.getReceipts().catch((err) => {
          console.warn("Could not load receipts:", err);
          return [] as AdminPaymentReceiptItem[];
        }),
      ]);
      setGateways(gList || []);
      setBankAccounts(bList || []);
      if (sData) setSettings(sData);
      setReceipts(rList || []);
    } catch (err: any) {
      console.error("Failed to load admin payments data:", err);
      setFeedbackMsg({
        type: "error",
        text: "خطا در دریافت اطلاعات درگاه‌ها و حساب‌های بانکی از سرور.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showNotification = (type: "success" | "error", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // ─── Global Sandbox Mode Switch ────────────────────────────────
  const handleToggleGlobalSandbox = async () => {
    const nextVal = !settings.global_sandbox_mode;
    setIsSaving(true);
    try {
      const updated = await adminPaymentsApi.updateSettings({
        global_sandbox_mode: nextVal,
      });
      setSettings(updated);
      showNotification(
        "success",
        nextVal
          ? "حالت سندباکس تستی فعال شد. پرداخت‌های تستی از شبیه‌ساز امن استفاده خواهند کرد."
          : "حالت محیط زنده (Live Production) فعال شد. پرداخت‌ها مستقیماً به درگاه شاپرک متصل خواهند شد."
      );
    } catch (err: any) {
      showNotification("error", "خطا در به‌روزرسانی تنظیمات سندباکس: " + (err.message || ""));
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Gateway Actions ───────────────────────────────────────────
  const handleOpenGatewayModal = (gw?: AdminPaymentGateway) => {
    if (gw) {
      setEditingGateway(gw);
      setGatewayForm({
        name: gw.name,
        provider: gw.provider,
        merchantId: gw.merchantId,
        terminalId: gw.terminalId || "",
        apiKey: gw.apiKey || "",
        isSandbox: gw.isSandbox,
        isActive: gw.isActive,
        isDefault: gw.isDefault,
        description: gw.description || "",
      });
    } else {
      setEditingGateway(null);
      setGatewayForm({
        name: "",
        provider: "zarinpal",
        merchantId: "",
        terminalId: "",
        apiKey: "",
        isSandbox: settings.global_sandbox_mode,
        isActive: true,
        isDefault: gateways.length === 0,
        description: "",
      });
    }
    setIsGatewayModalOpen(true);
  };

  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayForm.name.trim() || !gatewayForm.merchantId.trim()) {
      showNotification("error", "نام درگاه و شناسه مرچنت (Merchant ID) الزامی است.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingGateway) {
        await adminPaymentsApi.updateGateway(editingGateway.id, gatewayForm);
        showNotification("success", `درگاه پرداخت ${gatewayForm.name} با موفقیت ویرایش شد.`);
      } else {
        await adminPaymentsApi.createGateway(gatewayForm);
        showNotification("success", `درگاه پرداخت جدید ${gatewayForm.name} با موفقیت ایجاد شد.`);
      }
      setIsGatewayModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotification("error", "خطا در ذخیره درگاه: " + (err.message || ""));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleGatewayActive = async (gw: AdminPaymentGateway) => {
    try {
      await adminPaymentsApi.updateGateway(gw.id, { isActive: !gw.isActive });
      fetchData();
      showNotification("success", `وضعیت درگاه ${gw.name} تغییر یافت.`);
    } catch (err: any) {
      showNotification("error", "خطا در تغییر وضعیت درگاه.");
    }
  };

  const handleSetDefaultGateway = async (gw: AdminPaymentGateway) => {
    try {
      await adminPaymentsApi.updateGateway(gw.id, { isDefault: true, isActive: true });
      fetchData();
      showNotification("success", `درگاه ${gw.name} به عنوان درگاه پیش‌فرض سایت انتخاب شد.`);
    } catch (err: any) {
      showNotification("error", "خطا در انتصاب درگاه پیش‌فرض.");
    }
  };

  // ─── Bank Account Actions ──────────────────────────────────────
  const handleOpenBankModal = (bank?: AdminBankAccount) => {
    if (bank) {
      setEditingBank(bank);
      setBankForm({
        bankName: bank.bankName,
        accountOwner: bank.accountOwner,
        cardNumber: bank.cardNumber,
        shebaNumber: bank.shebaNumber,
        accountNumber: bank.accountNumber || "",
        isActive: bank.isActive,
        isDefault: bank.isDefault,
        displayOrder: bank.displayOrder,
      });
    } else {
      setEditingBank(null);
      setBankForm({
        bankName: "",
        accountOwner: "شرکت ققنوس عصر داده ورزان",
        cardNumber: "",
        shebaNumber: "IR",
        accountNumber: "",
        isActive: true,
        isDefault: bankAccounts.length === 0,
        displayOrder: bankAccounts.length + 1,
      });
    }
    setIsBankModalOpen(true);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName.trim() || !bankForm.accountOwner.trim() || !bankForm.cardNumber.trim()) {
      showNotification("error", "نام بانک، نام صاحب حساب و شماره کارت الزامی هستند.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingBank) {
        await adminPaymentsApi.updateBankAccount(editingBank.id, bankForm);
        showNotification("success", `حساب بانکی ${bankForm.bankName} با موفقیت ویرایش شد.`);
      } else {
        await adminPaymentsApi.createBankAccount(bankForm);
        showNotification("success", `حساب بانکی جدید ${bankForm.bankName} با موفقیت ثبت شد.`);
      }
      setIsBankModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotification("error", "خطا در ذخیره حساب بانکی: " + (err.message || ""));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBankActive = async (b: AdminBankAccount) => {
    try {
      await adminPaymentsApi.updateBankAccount(b.id, { isActive: !b.isActive });
      fetchData();
      showNotification("success", `وضعیت حساب ${b.bankName} تغییر یافت.`);
    } catch (err: any) {
      showNotification("error", "خطا در تغییر وضعیت حساب بانکی.");
    }
  };

  const handleSetDefaultBank = async (b: AdminBankAccount) => {
    try {
      await adminPaymentsApi.updateBankAccount(b.id, { isDefault: true, isActive: true });
      fetchData();
      showNotification("success", `حساب ${b.bankName} به عنوان حساب اصلی واریز وجه انتخاب شد.`);
    } catch (err: any) {
      showNotification("error", "خطا در انتصاب حساب پیش‌فرض.");
    }
  };

  // ─── Delete Execution ──────────────────────────────────────────
  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    setIsSaving(true);
    try {
      if (deleteConfirm.type === "gateway") {
        await adminPaymentsApi.deleteGateway(deleteConfirm.id);
        showNotification("success", `درگاه ${deleteConfirm.title} حذف شد.`);
      } else {
        await adminPaymentsApi.deleteBankAccount(deleteConfirm.id);
        showNotification("success", `حساب بانکی ${deleteConfirm.title} حذف شد.`);
      }
      setDeleteConfirm(null);
      fetchData();
    } catch (err: any) {
      showNotification("error", "خطا در حذف: " + (err.message || ""));
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Save Settings ─────────────────────────────────────────────
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await adminPaymentsApi.updateSettings(settings);
      setSettings(updated);
      showNotification("success", "تنظیمات عمومی پرداخت با موفقیت در دیتابیس ثبت شد.");
    } catch (err: any) {
      showNotification("error", "خطا در ذخیره تنظیمات: " + (err.message || ""));
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Receipt Actions & Filters ─────────────────────────────────
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApproveReceipt = async (receipt: AdminPaymentReceiptItem, notes?: string) => {
    setApprovingReceiptId(receipt.orderId);
    try {
      await adminPaymentsApi.approveReceipt(receipt.orderId, notes || approvalNote);
      showNotification(
        "success",
        `فیش واریزی سفارش ${receipt.orderNumber} تایید شد و وضعیت سفارش به «بسته‌بندی و پردازش انبار» ارتقا یافت.`
      );
      setReceipts((prev) =>
        prev.map((r) =>
          r.orderId === receipt.orderId
            ? {
                ...r,
                isVerified: true,
                status: "PROCESSING_WAREHOUSE",
                statusLabel: "در حال پردازش انبار",
                statusBadge: "blue",
                adminNotes: notes || approvalNote || r.adminNotes,
              }
            : r
        )
      );
      if (selectedReceiptForPreview?.orderId === receipt.orderId) {
        setSelectedReceiptForPreview((curr) =>
          curr
            ? {
                ...curr,
                isVerified: true,
                status: "PROCESSING_WAREHOUSE",
                statusLabel: "در حال پردازش انبار",
                statusBadge: "blue",
              }
            : null
        );
      }
      setApprovalNote("");
    } catch (err: any) {
      console.error("Failed to approve receipt:", err);
      showNotification("error", "خطا در تایید فیش: " + (err.message || "خطای نامشخص سرور"));
    } finally {
      setApprovingReceiptId(null);
    }
  };

  const handleOpenRejectModal = (receipt: AdminPaymentReceiptItem) => {
    setRejectingReceipt(receipt);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectingReceipt) return;
    setIsRejecting(true);
    try {
      await adminPaymentsApi.rejectReceipt(rejectingReceipt.orderId, rejectReason);
      showNotification("success", `فیش واریزی سفارش ${rejectingReceipt.orderNumber} با موفقیت رد شد.`);
      setReceipts((prev) =>
        prev.map((r) =>
          r.orderId === rejectingReceipt.orderId
            ? {
                ...r,
                isVerified: false,
                adminNotes: `رد شده: ${rejectReason}`,
              }
            : r
        )
      );
      if (selectedReceiptForPreview?.orderId === rejectingReceipt.orderId) {
        setSelectedReceiptForPreview(null);
      }
      setRejectingReceipt(null);
      setRejectReason("");
    } catch (err: any) {
      console.error("Failed to reject receipt:", err);
      showNotification("error", "خطا در رد فیش: " + (err.message || "خطای سرور"));
    } finally {
      setIsRejecting(false);
    }
  };

  const pendingReceiptsCount = React.useMemo(
    () => receipts.filter((r) => !r.isVerified && (r.status === "PENDING_FINANCIAL" || r.status === "PENDING")).length,
    [receipts]
  );

  const approvedReceiptsCount = React.useMemo(
    () =>
      receipts.filter(
        (r) =>
          r.isVerified ||
          r.status === "PROCESSING_WAREHOUSE" ||
          r.status === "SHIPPING" ||
          r.status === "DELIVERED"
      ).length,
    [receipts]
  );

  const totalReceiptsVolume = React.useMemo(
    () => receipts.reduce((sum, r) => sum + (Number(r.payableAmount) || 0), 0),
    [receipts]
  );

  const pendingReceiptsVolume = React.useMemo(
    () =>
      receipts
        .filter((r) => !r.isVerified && (r.status === "PENDING_FINANCIAL" || r.status === "PENDING"))
        .reduce((sum, r) => sum + (Number(r.payableAmount) || 0), 0),
    [receipts]
  );

  const filteredReceipts = React.useMemo(() => {
    let list = receipts;
    if (receiptFilter === "pending") {
      list = list.filter(
        (r) =>
          !r.isVerified &&
          (r.status === "PENDING_FINANCIAL" || r.status === "PENDING" || r.status.toLowerCase().includes("pending"))
      );
    } else if (receiptFilter === "approved") {
      list = list.filter(
        (r) =>
          r.isVerified ||
          r.status === "PROCESSING_WAREHOUSE" ||
          r.status === "SHIPPING" ||
          r.status === "DELIVERED"
      );
    }

    if (receiptSearch.trim()) {
      const q = receiptSearch.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.orderNumber.toLowerCase().includes(q) ||
          r.trackingCode.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          (r.companyName && r.companyName.toLowerCase().includes(q)) ||
          r.phoneNumber.toLowerCase().includes(q) ||
          (r.paymentReceiptNumber && r.paymentReceiptNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }, [receipts, receiptFilter, receiptSearch]);

  const formatPersianDate = (dateStr?: string | null) => {
    if (!dateStr) return "---";
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-6 h-6 text-orange-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              مدیریت درگاه‌های پرداخت و حساب‌های بانکی
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            پیکربندی درگاه‌های پرداخت شاپرک، شماره شبا و کارت‌های رسمی شرکت، و کنترل محیط سندباکس
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchData()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-orange-400" : ""}`} />
          <span>به‌روزرسانی اطلاعات</span>
        </button>
      </div>

      {/* Global Sandbox Alert / Switch Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          settings.global_sandbox_mode
            ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
            : "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                settings.global_sandbox_mode
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                  : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {settings.global_sandbox_mode ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  وضعیت فعلی سیستم پرداخت:{" "}
                  <span
                    className={
                      settings.global_sandbox_mode ? "text-amber-400" : "text-emerald-400"
                    }
                  >
                    {settings.global_sandbox_mode
                      ? "محیط تستی و شبیه‌ساز سندباکس (Sandbox)"
                      : "محیط عملیاتی و زنده شاپرک (Live Production)"}
                  </span>
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    settings.global_sandbox_mode
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {settings.global_sandbox_mode ? "TEST MODE" : "PRODUCTION"}
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {settings.global_sandbox_mode
                  ? "در حالت تست، خریداران پس از کلیک روی پرداخت، به شبیه‌ساز شاپرک متصل شده و می‌توانند تراکنش‌های موفق و ناموفق را بدون کسر وجه شبیه‌سازی نمایند."
                  : "در حالت زنده، کلیه مبالغ به درگاه رسمی شاپرک ارسال و از حساب واقعی کسر خواهد شد."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleGlobalSandbox}
            disabled={isSaving}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              settings.global_sandbox_mode
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/30"
                : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/30"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>
              {settings.global_sandbox_mode
                ? "انتقال به محیط زنده (Live)"
                : "سوییچ به حالت سندباکس تستی"}
            </span>
          </button>
        </div>
      </div>

      {/* Feedback Notification */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in duration-200 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("gateways")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "gateways"
              ? "border-orange-500 text-orange-400"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>درگاه‌های پرداخت آنلاین شاپرک ({toPersianDigits(gateways.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("banks")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "banks"
              ? "border-orange-500 text-orange-400"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>حساب‌های بانکی و شماره شبا / کارت ({toPersianDigits(bankAccounts.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "settings"
              ? "border-orange-500 text-orange-400"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>تنظیمات روش‌های پرداخت</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("receipts")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 relative ${
            activeTab === "receipts"
              ? "border-orange-500 text-orange-400"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>فیش‌های کارت‌به‌کارت و واریزی</span>
          {pendingReceiptsCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
              {toPersianDigits(pendingReceiptsCount)} نیازمند تایید
            </span>
          ) : (
            <span className="text-[11px] text-neutral-500">
              ({toPersianDigits(receipts.length)})
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB 1: GATEWAYS ────────────────────────────────────────── */}
      {activeTab === "gateways" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              درگاه‌های متصل به سیستم را مدیریت کنید. خریداران در صفحه چک‌اوت به درگاه پیش‌فرض متصل
              می‌شوند.
            </p>
            <button
              type="button"
              onClick={() => handleOpenGatewayModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن درگاه پرداخت جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gateways.map((gw) => (
              <div
                key={gw.id}
                className={`p-5 rounded-2xl border transition-all relative ${
                  gw.isDefault
                    ? "bg-[#18181c] border-orange-500/50 shadow-lg shadow-orange-950/20"
                    : "bg-[#141417] border-neutral-800 hover:border-neutral-700"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-orange-400">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{gw.name}</h3>
                        {gw.isDefault && (
                          <span className="text-[10px] font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
                            درگاه پیش‌فرض
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                        ارائه‌دهنده: {gw.provider.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        gw.isSandbox
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {gw.isSandbox ? "سندباکس" : "محیط زنده"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleGatewayActive(gw)}
                      title={gw.isActive ? "غیرفعال کردن" : "فعال کردن"}
                      className="text-neutral-400 hover:text-white p-1"
                    >
                      {gw.isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-neutral-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">کد مرچنت (Merchant ID):</span>
                    <span className="font-mono text-neutral-200 dir-ltr text-[11px]">
                      {gw.merchantId.slice(0, 8)}...{gw.merchantId.slice(-6)}
                    </span>
                  </div>
                  {gw.terminalId && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">شماره ترمینال:</span>
                      <span className="font-mono text-neutral-200 dir-ltr text-[11px]">
                        {gw.terminalId}
                      </span>
                    </div>
                  )}
                  {gw.description && (
                    <p className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
                      {gw.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                  <div>
                    {!gw.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultGateway(gw)}
                        className="text-orange-400 hover:text-orange-300 text-[11px] font-bold cursor-pointer"
                      >
                        تنظیم به عنوان درگاه پیش‌فرض
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenGatewayModal(gw)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
                      title="ویرایش درگاه"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirm({
                          type: "gateway",
                          id: gw.id,
                          title: gw.name,
                        })
                      }
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                      title="حذف درگاه"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {gateways.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-neutral-800 rounded-3xl space-y-3">
              <CreditCard className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">هیچ درگاه پرداختی تعریف نشده است</h3>
              <p className="text-xs text-neutral-400">
                برای فعال‌سازی پرداخت آنلاین، روی دکمه «افزودن درگاه جدید» کلیک کنید.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: BANK ACCOUNTS ───────────────────────────────────── */}
      {activeTab === "banks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              شماره کارت‌ها و شماره‌های شبا جهت پرداخت‌های کارت به کارت، حواله پایا و ساتنا خریداران.
            </p>
            <button
              type="button"
              onClick={() => handleOpenBankModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن حساب بانکی / شماره کارت</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((b) => (
              <div
                key={b.id}
                className={`p-5 rounded-2xl border transition-all relative ${
                  b.isDefault
                    ? "bg-[#18181c] border-blue-500/50 shadow-lg shadow-blue-950/20"
                    : "bg-[#141417] border-neutral-800 hover:border-neutral-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-blue-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{b.bankName}</h3>
                        {b.isDefault && (
                          <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                            حساب اصلی
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        صاحب حساب: <span className="text-neutral-200 font-bold">{b.accountOwner}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBankActive(b)}
                    title={b.isActive ? "غیرفعال کردن" : "فعال کردن"}
                    className="text-neutral-400 hover:text-white p-1"
                  >
                    {b.isActive ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-neutral-600" />
                    )}
                  </button>
                </div>

                {/* Card and Sheba Display */}
                <div className="space-y-2.5 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">شماره کارت:</span>
                    <span className="font-mono text-sm font-bold text-white tracking-widest dir-ltr">
                      {b.cardNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">شماره شبا:</span>
                    <span className="font-mono text-[11px] text-sky-400 font-bold dir-ltr">
                      {b.shebaNumber}
                    </span>
                  </div>

                  {b.accountNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">شماره حساب:</span>
                      <span className="font-mono text-xs text-neutral-300 dir-ltr">
                        {b.accountNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                  <div>
                    {!b.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultBank(b)}
                        className="text-blue-400 hover:text-blue-300 text-[11px] font-bold cursor-pointer"
                      >
                        تنظیم به عنوان حساب پیش‌فرض
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenBankModal(b)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
                      title="ویرایش حساب"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirm({
                          type: "bank",
                          id: b.id,
                          title: `${b.bankName} - ${b.accountOwner}`,
                        })
                      }
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                      title="حذف حساب"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {bankAccounts.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-neutral-800 rounded-3xl space-y-3">
              <Building2 className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">هیچ حساب بانکی تعریف نشده است</h3>
              <p className="text-xs text-neutral-400">
                جهت فعال‌سازی واریز کارت به کارت، روی «افزودن حساب بانکی» کلیک کنید.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: GENERAL SETTINGS ───────────────────────────────── */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
          <div className="p-6 rounded-2xl bg-[#141417] border border-neutral-800 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Settings className="w-4 h-4 text-orange-400" />
              <span>تنظیمات روش‌های فعال پرداخت در سایت</span>
            </h3>

            {/* Toggle 1: Wallet */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  پرداخت و تسویه از کیف پول کاربری
                </span>
                <p className="text-[11px] text-neutral-400">
                  اجازه خرید سفارش‌ها و پلن‌های اینترنت از طریق مانده اعتبار کیف پول
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    is_wallet_payment_enabled: !prev.is_wallet_payment_enabled,
                  }))
                }
                className="cursor-pointer"
              >
                {settings.is_wallet_payment_enabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Toggle 2: Card to Card */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  کارت به کارت و واریز بانکی (شبا)
                </span>
                <p className="text-[11px] text-neutral-400">
                  نمایش شماره حساب‌ها در چک‌اوت و ثبت سفارش با وضعیت در انتظار واریز
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    is_card_to_card_enabled: !prev.is_card_to_card_enabled,
                  }))
                }
                className="cursor-pointer"
              >
                {settings.is_card_to_card_enabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Toggle 3: Corporate Credit */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  پرداخت اعتباری سازمانی B2B
                </span>
                <p className="text-[11px] text-neutral-400">
                  امکان ثبت سفارش تحت حساب اعتباری برای همکاران تأییدشده
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    is_corporate_credit_enabled: !prev.is_corporate_credit_enabled,
                  }))
                }
                className="cursor-pointer"
              >
                {settings.is_corporate_credit_enabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Toggle 4: Sayad Cheque */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  پرداخت با چک صیادی
                </span>
                <p className="text-[11px] text-neutral-400">
                  دریافت شناسه ۱۶ رقمی صیاد و سررسید برای سفارش‌های پروژه‌ای و اینترنت سالانه
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    is_cheque_payment_enabled: !prev.is_cheque_payment_enabled,
                  }))
                }
                className="cursor-pointer"
              >
                {settings.is_cheque_payment_enabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Wallet Min / Max Amounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1.5 font-bold">
                  حداقل مبلغ شارژ کیف پول (تومان):
                </label>
                <input
                  type="number"
                  value={settings.min_wallet_recharge}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      min_wallet_recharge: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1.5 font-bold">
                  حداکثر مبلغ شارژ در هر تراکنش (تومان):
                </label>
                <input
                  type="number"
                  value={settings.max_wallet_recharge}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      max_wallet_recharge: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/40 cursor-pointer"
          >
            {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات تنظیمات"}
          </button>
        </form>
      )}

      {/* ─── TAB 4: RECEIPTS (فیش‌های کارت‌به‌کارت و واریزی) ────────────────────────── */}
      {activeTab === "receipts" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-400" />
                <span>بررسی و تایید فیش‌های واریزی کارت‌به‌کارت</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                تمام سفارشاتی که روش پرداخت کارت‌به‌کارت یا حواله بانکی را انتخاب کرده‌اند در این بخش قرار می‌گیرند.
                پس از تایید فیش، سفارش بلافاصله به وضعیت «بسته‌بندی و پردازش انبار» ارتقا می‌یابد.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchData()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-bold text-neutral-300 transition-all cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-orange-400" : ""}`} />
              <span>تازه‌سازی فیش‌ها</span>
            </button>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141416] border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center shrink-0">
                <Receipt className="w-6 h-6 text-neutral-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-neutral-400 font-medium">کل فیش‌های ثبت‌شده</p>
                <p className="text-lg font-black text-white mt-0.5">
                  {toPersianDigits(receipts.length)} <span className="text-xs font-normal text-neutral-400">فقره</span>
                </p>
              </div>
            </div>

            <div
              className={`rounded-2xl p-4 flex items-center gap-3 border transition-all ${
                pendingReceiptsCount > 0
                  ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-950/20"
                  : "bg-[#141416] border-neutral-800"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  pendingReceiptsCount > 0
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-neutral-800/80 text-neutral-400 border border-neutral-700/50"
                }`}
              >
                <Clock className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-amber-300 font-bold">در انتظار تایید مالی</p>
                <p className="text-lg font-black text-white mt-0.5">
                  {toPersianDigits(pendingReceiptsCount)} <span className="text-xs font-normal text-neutral-400">سفارش</span>
                </p>
              </div>
            </div>

            <div className="bg-[#141416] border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-neutral-400 font-medium">تایید شده و ارسالی به انبار</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">
                  {toPersianDigits(approvedReceiptsCount)} <span className="text-xs font-normal text-neutral-400">سفارش</span>
                </p>
              </div>
            </div>

            <div className="bg-[#141416] border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-neutral-400 font-medium">مجموع مبالغ در انتظار تایید</p>
                <p className="text-sm font-black text-white mt-0.5 truncate" title={`${formatPrice(pendingReceiptsVolume)}`}>
                  {formatPrice(pendingReceiptsVolume)}
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-[#141416] border border-neutral-800 rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setReceiptFilter("pending")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  receiptFilter === "pending"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-950/40"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>نیازمند بررسی و تایید</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    receiptFilter === "pending" ? "bg-black/30 text-black" : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {toPersianDigits(pendingReceiptsCount)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptFilter("approved")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  receiptFilter === "approved"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تایید شده‌ها</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    receiptFilter === "approved" ? "bg-emerald-800 text-white" : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {toPersianDigits(approvedReceiptsCount)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  receiptFilter === "all"
                    ? "bg-neutral-700 text-white shadow-md"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                }`}
              >
                <span>همه فیش‌ها</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    receiptFilter === "all" ? "bg-neutral-800 text-white" : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {toPersianDigits(receipts.length)}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px] md:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="جستجو در کد سفارش، مشتری، فیش..."
                value={receiptSearch}
                onChange={(e) => setReceiptSearch(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pr-9 pl-8 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
              {receiptSearch && (
                <button
                  type="button"
                  onClick={() => setReceiptSearch("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Receipts Table / List */}
          {filteredReceipts.length === 0 ? (
            <div className="bg-[#141416] border border-neutral-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">هیچ فیش پرداختی در این دسته‌بندی یافت نشد</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                  {receiptSearch
                    ? "عبارت جستجو شده با هیچ‌یک از فیش‌ها یا سفارشات همخوانی ندارد."
                    : receiptFilter === "pending"
                    ? "در حال حاضر هیچ سفارشی در انتظار بررسی و تایید مالی قرار ندارد. تمام فیش‌ها تعیین تکلیف شده‌اند!"
                    : "سفارشی با شرایط انتخابی موجود نیست."}
                </p>
              </div>
              {(receiptSearch || receiptFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setReceiptSearch("");
                    setReceiptFilter("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition-all cursor-pointer"
                >
                  نمایش همه فیش‌ها
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#141416] border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#19191d] text-neutral-400 font-bold border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">سفارش و تاریخ</th>
                      <th className="py-3 px-4">مشتری و اطلاعات تماس</th>
                      <th className="py-3 px-4">مبلغ واریزی</th>
                      <th className="py-3 px-4">کد ارجاع / پیگیری</th>
                      <th className="py-3 px-4 text-center">تصویر / سند فیش</th>
                      <th className="py-3 px-4 text-center">وضعیت سفارش</th>
                      <th className="py-3 px-4 text-center">عملیات مالی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredReceipts.map((r) => {
                      const isPending = !r.isVerified && (r.status === "PENDING_FINANCIAL" || r.status === "PENDING" || r.status.toLowerCase().includes("pending"));
                      const isApproving = approvingReceiptId === r.orderId;
                      const hasReceipt = Boolean(r.paymentReceiptUrl);
                      const isPdf = r.paymentReceiptUrl?.toLowerCase().endsWith(".pdf");

                      return (
                        <tr
                          key={r.id || r.orderId}
                          className={`hover:bg-neutral-800/30 transition-colors ${
                            isPending ? "bg-amber-500/[0.02]" : ""
                          }`}
                        >
                          {/* Order Number & Date */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-bold font-mono text-white">
                                <span>{r.orderNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(r.orderNumber)}
                                  className="text-neutral-500 hover:text-white p-0.5 cursor-pointer"
                                  title="کپی شماره سفارش"
                                >
                                  {copiedCode === r.orderNumber ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                                <span>{formatPersianDate(r.createdAt)}</span>
                              </div>
                              {r.itemsCount > 0 && (
                                <span className="inline-block text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
                                  {toPersianDigits(r.itemsCount)} قلم کالا
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Customer Info */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-neutral-200">{r.customerName || "کاربر ناشناس"}</p>
                              {r.companyName && (
                                <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                                  <Briefcase className="w-3 h-3 text-neutral-500 shrink-0" />
                                  <span>{r.companyName}</span>
                                </p>
                              )}
                              <p className="text-[11px] text-neutral-400 font-mono dir-ltr text-right">
                                {toPersianDigits(r.phoneNumber)}
                              </p>
                            </div>
                          </td>

                          {/* Payable Amount */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="text-sm font-black text-emerald-400 font-mono">
                                {formatPrice(r.payableAmount)}
                              </span>
                              <p className="text-[10px] text-neutral-500">کارت‌به‌کارت / حواله</p>
                            </div>
                          </td>

                          {/* Receipt Reference / Tracking Number */}
                          <td className="py-3.5 px-4">
                            {r.paymentReceiptNumber ? (
                              <div className="flex items-center gap-1.5 font-mono text-neutral-200 bg-neutral-900/80 border border-neutral-800 px-2 py-1 rounded-lg w-fit">
                                <span className="font-bold text-xs">{r.paymentReceiptNumber}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(r.paymentReceiptNumber!)}
                                  className="text-neutral-500 hover:text-white p-0.5 cursor-pointer"
                                  title="کپی کد رهگیری فیش"
                                >
                                  {copiedCode === r.paymentReceiptNumber ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-neutral-500 italic">بدون کد ثبت‌شده</span>
                            )}
                          </td>

                          {/* Receipt Image / Document Thumbnail */}
                          <td className="py-3.5 px-4 text-center">
                            {hasReceipt ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                {isPdf ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReceiptForPreview(r)}
                                    className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col items-center justify-center gap-0.5 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer group"
                                  >
                                    <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-bold">PDF</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReceiptForPreview(r)}
                                    className="relative w-14 h-14 rounded-xl overflow-hidden border border-neutral-700/80 hover:border-orange-500 group transition-all shadow-md cursor-pointer block"
                                    title="کلیک برای بزرگنمایی و تایید"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={r.paymentReceiptUrl!}
                                      alt="فیش پرداخت"
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <ZoomIn className="w-5 h-5 text-white" />
                                    </div>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceiptForPreview(r)}
                                  className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                                >
                                  مشاهده فیش
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center gap-1 text-neutral-500">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <span className="text-[10px] text-amber-400">فیش پیوست نشده</span>
                              </div>
                            )}
                          </td>

                          {/* Order Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {r.isVerified || r.status === "PROCESSING_WAREHOUSE" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>تایید شده / انبار</span>
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                <Clock className="w-3 h-3" />
                                <span>در انتظار تایید مالی</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                                <span>{r.statusLabel || r.status}</span>
                              </span>
                            )}
                          </td>

                          {/* Financial Actions */}
                          <td className="py-3.5 px-4 text-center">
                            {isPending ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleApproveReceipt(r)}
                                  disabled={isApproving}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                                  title="تایید فیش و ارسال به انبار"
                                >
                                  {isApproving ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  <span>تایید و ارسال به انبار</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenRejectModal(r)}
                                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer"
                                  title="رد فیش پرداختی"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceiptForPreview(r)}
                                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                                  <span>جزئیات</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── GATEWAY MODAL ─────────────────────────────────────────── */}
      {isGatewayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#161619] border border-neutral-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-400" />
                <span>{editingGateway ? "ویرایش درگاه پرداخت" : "تعریف درگاه پرداخت جدید"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsGatewayModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGateway} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-bold">
                  عنوان نمایشی درگاه: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: درگاه امن زرین‌پال شاپرک"
                  value={gatewayForm.name}
                  onChange={(e) => setGatewayForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1 font-bold">
                    ارائه‌دهنده (Provider):
                  </label>
                  <select
                    value={gatewayForm.provider}
                    onChange={(e) =>
                      setGatewayForm((prev) => ({ ...prev, provider: e.target.value }))
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="zarinpal">زرین‌پال (ZarinPal)</option>
                    <option value="saman">بانک سامان (Sep)</option>
                    <option value="mellat">به‌پرداخت ملت (Mellat)</option>
                    <option value="sadad">سداد ملی (Sadad)</option>
                    <option value="parsian">تاپ / پارسیان</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1 font-bold">
                    کد مرچنت (Merchant ID): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx"
                    value={gatewayForm.merchantId}
                    onChange={(e) =>
                      setGatewayForm((prev) => ({ ...prev, merchantId: e.target.value.trim() }))
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono dir-ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1 font-bold">
                    شماره ترمینال (اختیاری):
                  </label>
                  <input
                    type="text"
                    placeholder="Terminal ID"
                    value={gatewayForm.terminalId}
                    onChange={(e) =>
                      setGatewayForm((prev) => ({ ...prev, terminalId: e.target.value.trim() }))
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono dir-ltr"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1 font-bold">
                    کلید امنیتی API Key (اختیاری):
                  </label>
                  <input
                    type="password"
                    placeholder="API Secret"
                    value={gatewayForm.apiKey}
                    onChange={(e) =>
                      setGatewayForm((prev) => ({ ...prev, apiKey: e.target.value.trim() }))
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono dir-ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-bold">
                  توضیحات راهنما برای خریدار:
                </label>
                <input
                  type="text"
                  placeholder="پشتیبانی از کلیه کارت‌های بانکی عضو شبکه شتاب با کارمزد صفر"
                  value={gatewayForm.description}
                  onChange={(e) =>
                    setGatewayForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gatewayForm.isSandbox}
                    onChange={(e) =>
                      setGatewayForm((prev) => ({ ...prev, isSandbox: e.target.checked }))
                    }
                    className="rounded border-neutral-700 text-orange-500 focus:ring-0"
                  />
                  <span>فعال‌سازی در حالت آزمایشی سندباکس (Sandbox)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gatewayForm.isActive}
                    onChange={(e) =>
                      setGatewayForm((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="rounded border-neutral-700 text-orange-500 focus:ring-0"
                  />
                  <span>درگاه فعال باشد و در سایت نمایش داده شود</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gatewayForm.isDefault}
                    onChange={(e) =>
                      setGatewayForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                    }
                    className="rounded border-neutral-700 text-orange-500 focus:ring-0"
                  />
                  <span>درگاه به عنوان درگاه پیش‌فرض سایت انتخاب شود</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsGatewayModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                >
                  {isSaving ? "در حال ثبت..." : "ذخیره درگاه"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── BANK ACCOUNT MODAL ────────────────────────────────────── */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#161619] border border-neutral-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{editingBank ? "ویرایش حساب بانکی" : "تعریف حساب بانکی و شماره کارت / شبا"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-300 block mb-1 font-bold">
                    نام بانک: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: بانک سامان"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm((prev) => ({ ...prev, bankName: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 block mb-1 font-bold">
                    نام صاحب حساب: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="شرکت ققنوس عصر داده ورزان"
                    value={bankForm.accountOwner}
                    onChange={(e) =>
                      setBankForm((prev) => ({ ...prev, accountOwner: e.target.value }))
                    }
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-bold">
                  شماره ۱۶ رقمی کارت بانکی: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="۶۲۱۹-۸۶۱۰-xxxx-xxxx"
                  value={bankForm.cardNumber}
                  onChange={(e) => setBankForm((prev) => ({ ...prev, cardNumber: e.target.value }))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-bold">
                  شماره شبا (با IR): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="IR890560000000001234567890"
                  value={bankForm.shebaNumber}
                  onChange={(e) =>
                    setBankForm((prev) => ({ ...prev, shebaNumber: e.target.value.toUpperCase() }))
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 block mb-1 font-bold">
                  شماره حساب بانکی (اختیاری):
                </label>
                <input
                  type="text"
                  placeholder="890-560-1234567-1"
                  value={bankForm.accountNumber}
                  onChange={(e) =>
                    setBankForm((prev) => ({ ...prev, accountNumber: e.target.value }))
                  }
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono dir-ltr"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bankForm.isActive}
                    onChange={(e) =>
                      setBankForm((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="rounded border-neutral-700 text-blue-500 focus:ring-0"
                  />
                  <span>حساب فعال باشد و در صفحه پرداخت نمایش داده شود</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bankForm.isDefault}
                    onChange={(e) =>
                      setBankForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                    }
                    className="rounded border-neutral-700 text-blue-500 focus:ring-0"
                  />
                  <span>حساب اصلی و پیش‌فرض شرکت برای واریزها باشد</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                >
                  {isSaving ? "در حال ثبت..." : "ذخیره حساب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM MODAL ──────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181c] border border-rose-500/40 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">تأیید حذف آیتم</h3>
            <p className="text-xs text-neutral-300">
              آیا از حذف {deleteConfirm.type === "gateway" ? "درگاه پرداخت" : "حساب بانکی"} «
              <span className="font-bold text-rose-400">{deleteConfirm.title}</span>» اطمینان دارید؟
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {isSaving ? "در حال حذف..." : "بله، حذف شود"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RECEIPT LIGHTBOX / VERIFICATION MODAL ────────────────── */}
      {selectedReceiptForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#141417] border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  بررسی فیش پرداختی سفارش {selectedReceiptForPreview.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptForPreview(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left / Top: Receipt Image or Document View */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-orange-400" />
                    <span>تصویر یا سند فیش آپلودشده:</span>
                  </span>
                  {selectedReceiptForPreview.paymentReceiptUrl && (
                    <a
                      href={selectedReceiptForPreview.paymentReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-orange-400 hover:text-orange-300 underline font-medium flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>مشاهده در تب جدید</span>
                    </a>
                  )}
                </div>

                {selectedReceiptForPreview.paymentReceiptUrl ? (
                  selectedReceiptForPreview.paymentReceiptUrl.toLowerCase().endsWith(".pdf") ? (
                    <div className="p-8 bg-neutral-900/90 rounded-2xl border border-neutral-800 text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">فایل سند بانکی (PDF)</p>
                        <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                          {selectedReceiptForPreview.paymentReceiptUrl.split("/").pop()}
                        </p>
                      </div>
                      <a
                        href={selectedReceiptForPreview.paymentReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>باز کردن و مشاهده کامل PDF</span>
                      </a>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 p-2 flex items-center justify-center max-h-[460px] overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedReceiptForPreview.paymentReceiptUrl}
                        alt="فیش پرداخت واریزی"
                        className="max-h-[440px] w-auto max-w-full object-contain rounded-xl"
                      />
                    </div>
                  )
                ) : (
                  <div className="p-8 bg-neutral-900 rounded-2xl border border-neutral-800 text-center space-y-2">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-neutral-300">هیچ فیشی برای این سفارش بارگذاری نشده است.</p>
                  </div>
                )}
              </div>

              {/* Right / Bottom: Order Info & Actions */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-white border-b border-neutral-800 pb-2">
                      اطلاعات سفارش و پرداخت
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-neutral-400 text-[11px] block">شماره سفارش:</span>
                        <span className="font-bold font-mono text-white">
                          {selectedReceiptForPreview.orderNumber}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-400 text-[11px] block">کد پیگیری:</span>
                        <span className="font-bold font-mono text-white">
                          {selectedReceiptForPreview.trackingCode || "---"}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-400 text-[11px] block">نام خریدار:</span>
                        <span className="font-bold text-neutral-200">
                          {selectedReceiptForPreview.customerName}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-400 text-[11px] block">شماره تماس:</span>
                        <span className="font-mono text-neutral-200">
                          {toPersianDigits(selectedReceiptForPreview.phoneNumber)}
                        </span>
                      </div>

                      {selectedReceiptForPreview.companyName && (
                        <div className="col-span-2">
                          <span className="text-neutral-400 text-[11px] block">شرکت / سازمان:</span>
                          <span className="font-bold text-neutral-200">
                            {selectedReceiptForPreview.companyName}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-neutral-400 text-[11px] block">مبلغ فاکتور:</span>
                        <span className="font-black text-emerald-400 font-mono text-sm">
                          {formatPrice(selectedReceiptForPreview.payableAmount)}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-400 text-[11px] block">کد ارجاع فیش:</span>
                        <span className="font-bold font-mono text-amber-300">
                          {selectedReceiptForPreview.paymentReceiptNumber || "بدون کد ثبت‌شده"}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className="text-neutral-400 text-[11px] block">تاریخ ثبت سفارش:</span>
                        <span className="text-neutral-300">
                          {formatPersianDate(selectedReceiptForPreview.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optional Admin Note */}
                  {!selectedReceiptForPreview.isVerified && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-neutral-300 font-bold block">
                        یادداشت مدیر مالی برای تایید یا ارجاع (اختیاری):
                      </label>
                      <textarea
                        rows={2}
                        placeholder="مثال: واریزی به حساب سامان شرکت بررسی و صحت آن تایید شد."
                        value={approvalNote}
                        onChange={(e) => setApprovalNote(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  )}

                  {selectedReceiptForPreview.adminNotes && (
                    <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs space-y-1">
                      <span className="text-[11px] text-neutral-400 font-bold block">یادداشت مالی ثبت‌شده:</span>
                      <p className="text-neutral-200">{selectedReceiptForPreview.adminNotes}</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptForPreview(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    بستن
                  </button>

                  <div className="flex items-center gap-2">
                    {!selectedReceiptForPreview.isVerified ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(selectedReceiptForPreview)}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          <span>رد فیش</span>
                        </button>

                        <button
                          type="button"
                          disabled={approvingReceiptId === selectedReceiptForPreview.orderId}
                          onClick={() => handleApproveReceipt(selectedReceiptForPreview, approvalNote)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {approvingReceiptId === selectedReceiptForPreview.orderId ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>تایید و ارسال سفارش به انبار</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>این سفارش تایید مالی شده و در چرخه پردازش انبار قرار دارد.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── REJECT CONFIRMATION MODAL ────────────────────────────── */}
      {rejectingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181c] border border-rose-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">رد فیش پرداختی سفارش</h3>
                <p className="text-xs text-neutral-400">سفارش {rejectingReceipt.orderNumber}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300">
              با رد این فیش، مشتری باید مجدداً اقدام به بارگذاری فیش معتبر نماید. لطفاً دلیل رد را بنویسید:
            </p>

            <textarea
              rows={3}
              placeholder="مثال: تصویر فیش ناخوانا است یا مبلغ با فاکتور همخوانی ندارد..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/60"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setRejectingReceipt(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isRejecting ? "در حال ثبت رد..." : "تایید رد فیش"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
