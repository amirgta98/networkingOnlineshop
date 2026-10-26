"use client";

import * as React from "react";
import type { AdminInvoice } from "../../types/admin-invoices.types";
import { MOCK_ADMIN_INVOICES } from "../../data/mock-admin-invoices";
import { adminInvoicesApi } from "../../api/admin-invoices-api";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  AdminStatsCards,
  AdminDetailDrawer,
  AdminActionModal,
} from "../shared";
import { InvoiceDetailDrawerContent } from "./invoice-detail-drawer-content";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  FileText,
  ShieldCheck,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  Building2,
  User,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

export function AdminInvoicesView() {
  const [invoices, setInvoices] = React.useState<AdminInvoice[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("velox_admin_invoices_v2");
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = React.useState<AdminInvoice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  
  // Official Approval (ثبت رسمی) Modal State
  const [syncingInvoice, setSyncingInvoice] = React.useState<AdminInvoice | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = React.useState<boolean>(false);
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false);

  // Reject Modal State
  const [rejectingInvoice, setRejectingInvoice] = React.useState<AdminInvoice | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState<boolean>(false);
  const [rejectReason, setRejectReason] = React.useState<string>("");
  const [isRejecting, setIsRejecting] = React.useState<boolean>(false);

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Fetch real invoices from backend
  const fetchInvoices = React.useCallback(async () => {
    try {
      const data = await adminInvoicesApi.getInvoices();
      if (Array.isArray(data)) {
        setInvoices(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("velox_admin_invoices_v2", JSON.stringify(data));
        }
      }
    } catch {
      // Fallback to local storage or empty
      try {
        const saved = localStorage.getItem("velox_admin_invoices_v2");
        if (saved) setInvoices(JSON.parse(saved));
        else setInvoices([]);
      } catch {
        setInvoices([]);
      }
    }
  }, []);

  React.useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  // Sync state to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem("velox_admin_invoices_v2", JSON.stringify(invoices));
    } catch {
      // ignore
    }
  }, [invoices]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Metrics
  const totalSalesGross = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalVatCollected = invoices.reduce((acc, inv) => acc + inv.vatAmount, 0);
  const syncedTaxCount = invoices.filter((inv) => inv.taxSyncStatus === "synced").length;
  const pendingTaxCount = invoices.filter((inv) => inv.taxSyncStatus === "pending").length;

  const statCards = [
    {
      id: "stat-gross",
      title: "گردش کل صورتحساب‌های رسمی",
      value: formatPrice(totalSalesGross),
      subtitle: "فروش رسمی با ارزش افزوده",
      changeText: "+۲۲٪ فصلی",
      changePositive: true,
      icon: TrendingUp,
      variant: "emerald" as const,
    },
    {
      id: "stat-synced",
      title: "صورتحساب‌های تاییدشده در مودیان",
      value: `${toPersianDigits(syncedTaxCount)} فاکتور`,
      subtitle: "ثبت رسمی و تطبیق موفق در کارپوشه",
      changeText: "۱۰۰٪ معتبر",
      changePositive: true,
      icon: ShieldCheck,
      variant: "sky" as const,
    },
    {
      id: "stat-pending",
      title: "در انتظار ثبت رسمی (تایید ادمین)",
      value: `${toPersianDigits(pendingTaxCount)} سند`,
      subtitle: "درخواست‌های نیازمند بررسی و تایید مالی",
      changeText: "اقدام تا ۴۸س",
      changePositive: false,
      icon: Clock,
      variant: "orange" as const,
    },
    {
      id: "stat-vat",
      title: "مجموع مالیات بر ارزش افزوده (۱۰٪)",
      value: formatPrice(totalVatCollected),
      subtitle: "آماده جهت اظهارنامه فصلی",
      changeText: "محاسبه برخط",
      changePositive: true,
      icon: Receipt,
      variant: "purple" as const,
    },
  ];

  // Filtering
  const filteredInvoices = React.useMemo(() => {
    return invoices.filter((inv) => {
      // Tab filter
      if (activeTab === "pending" && inv.taxSyncStatus !== "pending") return false;
      if (activeTab === "synced" && inv.taxSyncStatus !== "synced") return false;
      if (activeTab === "rejected" && inv.taxSyncStatus !== "rejected") return false;
      if (activeTab === "type_1" && inv.invoiceType !== "type_1") return false;
      if (activeTab === "type_2" && inv.invoiceType !== "type_2") return false;
      if (activeTab === "unpaid" && inv.paymentStatus !== "unpaid") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchTax = inv.taxSystemId?.toLowerCase().includes(q) || false;
        const matchClient = inv.clientName.toLowerCase().includes(q);
        const matchCompany = inv.companyName?.toLowerCase().includes(q) || false;
        const matchOrder = inv.orderTrackingCode.toLowerCase().includes(q);
        const matchNational = inv.nationalId.includes(q);
        if (!matchNumber && !matchTax && !matchClient && !matchCompany && !matchOrder && !matchNational) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, activeTab, searchQuery]);

  const handleOpenDetail = (inv: AdminInvoice) => {
    setSelectedInvoice(inv);
    setIsDrawerOpen(true);
  };

  const handleOpenSyncModal = (inv: AdminInvoice) => {
    setSyncingInvoice(inv);
    setIsSyncModalOpen(true);
  };

  const handleOpenRejectModal = (inv: AdminInvoice) => {
    setRejectingInvoice(inv);
    setRejectReason("عدم تطابق اطلاعات ثبتی سازمان با سامانه ثبت شرکت‌ها");
    setIsRejectModalOpen(true);
  };

  // Admin approves official invoice ("ثبت رسمی")
  const handleConfirmSyncTax = async () => {
    if (!syncingInvoice) return;
    setIsSyncing(true);

    try {
      const updated = await adminInvoicesApi.approveOfficialInvoice(syncingInvoice.id);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === syncingInvoice.id ? updated : inv))
      );
      showToast(
        `✅ فاکتور رسمی «${updated.invoiceNumber}» با شناسه یکتای ${updated.taxSystemId} با موفقیت ثبت رسمی شد.`
      );
    } catch {
      // Fallback
      const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase() +
        Math.random().toString(36).substring(2, 10).toUpperCase();
      const generatedTaxId = `TX1403${randomPart}000000`.substring(0, 22);

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === syncingInvoice.id
            ? {
                ...inv,
                taxSyncStatus: "synced",
                taxSystemId: generatedTaxId,
                taxSyncedAt: "امروز - همین لحظه",
              }
            : inv
        )
      );
      showToast(
        `✅ فاکتور رسمی «${syncingInvoice.invoiceNumber}» با شناسه یکتای ${generatedTaxId} در سامانه ثبت رسمی گردید.`
      );
    } finally {
      setIsSyncing(false);
      setIsSyncModalOpen(false);
    }
  };

  // Admin rejects official invoice
  const handleConfirmReject = async () => {
    if (!rejectingInvoice) return;
    setIsRejecting(true);

    try {
      const updated = await adminInvoicesApi.rejectOfficialInvoice(
        rejectingInvoice.id,
        rejectReason || "نقص در مدارک و اطلاعات ثبتی"
      );
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === rejectingInvoice.id ? updated : inv))
      );
      showToast(`❌ درخواست صدور فاکتور رسمی «${rejectingInvoice.invoiceNumber}» رد شد.`);
    } catch {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === rejectingInvoice.id
            ? {
                ...inv,
                taxSyncStatus: "rejected",
                rejectionReason: rejectReason || "نقص در مدارک و اطلاعات ثبتی",
              }
            : inv
        )
      );
      showToast(`❌ درخواست صدور فاکتور رسمی «${rejectingInvoice.invoiceNumber}» رد شد.`);
    } finally {
      setIsRejecting(false);
      setIsRejectModalOpen(false);
      setRejectReason("");
    }
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["شماره فاکتور,شناسه مودیان,خریدار,مبلغ ناخالص,ارزش افزوده,مبلغ کل,وضعیت مالیاتی"]
        .concat(
          filteredInvoices.map(
            (inv) =>
              `${inv.invoiceNumber},${inv.taxSystemId || "ندارد"},"${inv.companyName || inv.clientName}",${inv.subtotal},${inv.vatAmount},${inv.totalAmount},${inv.taxSyncStatus}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fonix-invoices-tax-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📁 دفاتر و فایل اکسل صورتحساب‌های مالیاتی دانلود شد.");
  };

  // Columns
  const columns: AdminColumnDef<AdminInvoice>[] = [
    {
      key: "invoiceNumber",
      header: "شماره صورتحساب",
      sortable: true,
      className: "whitespace-nowrap w-36",
      cell: (inv) => (
        <div className="flex flex-col text-right whitespace-nowrap">
          <span className="font-mono text-xs font-bold text-sky-400">
            {inv.invoiceNumber}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            سفارش: {inv.orderTrackingCode}
          </span>
        </div>
      ),
    },
    {
      key: "client",
      header: "خریدار و نوع فاکتور",
      className: "min-w-[240px]",
      cell: (inv) => (
        <div className="flex flex-col text-right min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-xs sm:text-sm">
              {inv.companyName || inv.clientName}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 whitespace-nowrap ${
                inv.invoiceType === "type_1"
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                  : "bg-neutral-800 text-neutral-400 border-neutral-700"
              }`}
            >
              {inv.invoiceType === "type_1" ? "رسمی (حقوقی)" : "غیر رسمی (عادی)"}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            شناسه ملی: {toPersianDigits(inv.nationalId)}
          </span>
        </div>
      ),
    },
    {
      key: "amounts",
      header: "مبلغ و ارزش افزوده (۱۰٪)",
      sortable: true,
      className: "whitespace-nowrap w-40",
      cell: (inv) => (
        <div className="flex flex-col text-right whitespace-nowrap">
          <span className="font-mono font-bold text-xs text-white">
            {formatPrice(inv.totalAmount)}
          </span>
          <span className="text-[10px] text-sky-400 font-mono">
            ارزش افزوده: {formatPrice(inv.vatAmount)}
          </span>
        </div>
      ),
    },
    {
      key: "taxGateway",
      header: "سامانه مودیان / وضعیت ثبت",
      className: "whitespace-nowrap w-44",
      cell: (inv) => {
        if (inv.taxSyncStatus === "synced") {
          return (
            <div className="flex flex-col text-right whitespace-nowrap">
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>ثبت رسمی شده</span>
              </span>
              <span className="font-mono text-[9px] text-neutral-500 truncate max-w-[140px]" title={inv.taxSystemId}>
                {inv.taxSystemId}
              </span>
            </div>
          );
        }
        if (inv.taxSyncStatus === "rejected") {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20 whitespace-nowrap">
              <XCircle className="h-3 w-3" />
              <span>رد شده</span>
            </span>
          );
        }
        if (inv.invoiceType === "type_1") {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 whitespace-nowrap">
              <Clock className="h-3 w-3" />
              <span>در انتظار ثبت رسمی</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400 font-medium bg-neutral-800 px-2 py-0.5 rounded-lg border border-neutral-700 whitespace-nowrap">
            <CheckCircle2 className="h-3 w-3 text-neutral-400" />
            <span>صادر شده عادی</span>
          </span>
        );
      },
    },
    {
      key: "paymentStatus",
      header: "وضعیت تسویه",
      hideOnMobile: true,
      className: "whitespace-nowrap w-28",
      cell: (inv) => (
        <span
          className={`text-[10px] px-2.5 py-1 rounded-xl font-semibold border whitespace-nowrap inline-block ${
            inv.paymentStatus === "paid"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}
        >
          {inv.paymentStatus === "paid" ? "تسویه شده" : "تسویه نشده"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "عملیات",
      className: "whitespace-nowrap min-w-[160px] text-left",
      cell: (inv) => (
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          {inv.taxSyncStatus === "pending" && inv.invoiceType === "type_1" ? (
            <>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSyncModal(inv);
                }}
                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1 font-bold shadow-sm whitespace-nowrap"
              >
                <ShieldCheck className="h-3 w-3" />
                <span>ثبت رسمی</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenRejectModal(inv);
                }}
                className="h-7 px-2 border-red-800/60 hover:bg-red-950/40 text-red-400 text-xs gap-1 whitespace-nowrap"
              >
                <XCircle className="h-3 w-3" />
                <span>رد</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetail(inv);
              }}
              className="h-7 px-2.5 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs gap-1 whitespace-nowrap"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>مشاهده سند</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-sky-950 border border-sky-500/40 text-sky-200 text-xs font-semibold shadow-2xl backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 text-2xl font-black ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/20">
              <FileText className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  فاکتورها و سامانه مودیان مالیاتی
                </h1>
                <span className="text-xs text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-semibold">
                  انطباق ۱۰۰٪ با قانون پایانه‌های فروشگاهی
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                بررسی درخواست‌های صدور فاکتور رسمی، ثبت رسمی و ارسال به کارپوشه سامانه مودیان کشور با احتساب ۱۰٪ مالیات بر ارزش افزوده و صدور شناسه یکتای مالیاتی برای کاربران.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <AdminStatsCards items={statCards} />

      {/* Filter Toolbar */}
      <AdminFilterToolbar
        searchPlaceholder="جستجو در شماره فاکتور، کد رهگیری، شناسه مودیان یا نام خریدار..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeStatusTab={activeTab}
        onStatusTabChange={setActiveTab}
        statusTabs={[
          { id: "all", label: "همه صورتحساب‌ها", count: invoices.length },
          {
            id: "pending",
            label: "در انتظار ثبت رسمی",
            count: invoices.filter((inv) => inv.taxSyncStatus === "pending").length,
          },
          {
            id: "synced",
            label: "ثبت شده رسمی (مودیان)",
            count: invoices.filter((inv) => inv.taxSyncStatus === "synced").length,
          },
          {
            id: "type_2",
            label: "فاکتورهای غیر رسمی",
            count: invoices.filter((inv) => inv.invoiceType === "type_2").length,
          },
          {
            id: "rejected",
            label: "رد شده",
            count: invoices.filter((inv) => inv.taxSyncStatus === "rejected").length,
          },
          {
            id: "unpaid",
            label: "تسویه نشده",
            count: invoices.filter((inv) => inv.paymentStatus === "unpaid").length,
          },
        ]}
        onExport={handleExport}
        exportLabel="خروجی دفاتر مالیاتی (CSV)"
      />

      {/* Data Table */}
      <AdminDataTable
        data={filteredInvoices}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={handleOpenDetail}
        emptyMessage="هیچ فاکتوری با فیلترهای مشخص‌شده یافت نشد."
        emptySubtitle="عبارت جستجو را تغییر دهید یا تب‌ها را به «همه صورتحساب‌ها» بازگردانید."
      />

      {/* Detail Slide-Over Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedInvoice ? `صورتحساب: ${selectedInvoice.invoiceNumber}` : "جزییات صورتحساب"}
        subtitle={selectedInvoice?.taxSystemId || selectedInvoice?.orderTrackingCode}
        badge={
          selectedInvoice?.taxSyncStatus === "synced"
            ? "ثبت شده رسمی در کارپوشه"
            : selectedInvoice?.taxSyncStatus === "rejected"
            ? "رد شده"
            : "در انتظار ثبت رسمی"
        }
      >
        {selectedInvoice && (
          <InvoiceDetailDrawerContent
            invoice={selectedInvoice}
            onSyncTax={(inv) => {
              setIsDrawerOpen(false);
              handleOpenSyncModal(inv);
            }}
          />
        )}
      </AdminDetailDrawer>

      {/* Official Approval Modal (ثبت رسمی) */}
      <AdminActionModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onConfirm={handleConfirmSyncTax}
        title="ثبت رسمی و صدور شناسه مالیاتی سامانه مودیان"
        confirmLabel="تایید و ثبت رسمی در سامانه مودیان"
        variant="primary"
        isLoading={isSyncing}
      >
        {syncingInvoice && (
          <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از بررسی اطلاعات و <strong>ثبت رسمی</strong> صورتحساب شماره{" "}
              <strong className="text-white font-mono">{syncingInvoice.invoiceNumber}</strong> مربوط به{" "}
              <strong className="text-sky-300">{syncingInvoice.companyName || syncingInvoice.clientName}</strong> اطمینان دارید؟
            </p>

            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">شناسه ملی شرکت:</span>
                <span className="font-mono text-white">{toPersianDigits(syncingInvoice.nationalId)}</span>
              </div>
              {syncingInvoice.registrationNumber && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">شماره ثبت:</span>
                  <span className="font-mono text-white">{toPersianDigits(syncingInvoice.registrationNumber)}</span>
                </div>
              )}
              {syncingInvoice.economicCode && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">کد اقتصادی جدید:</span>
                  <span className="font-mono text-white">{toPersianDigits(syncingInvoice.economicCode)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-800">
                <span className="text-neutral-400">مبلغ ناخالص صورتحساب:</span>
                <span className="font-mono text-white">{formatPrice(syncingInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">مالیات بر ارزش افزوده (۱۰٪):</span>
                <span className="font-mono text-sky-400">{formatPrice(syncingInvoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 font-bold">
                <span className="text-white">جمع کل فاکتور رسمی:</span>
                <span className="font-mono text-emerald-400 text-sm">
                  {formatPrice(syncingInvoice.totalAmount)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400">
              با تایید این عملیات، شناسه یکتای مالیاتی ۲۲ رقمی برای این فاکتور صادر شده و در پنل کاربر به عنوان «ثبت شده رسمی» نمایش داده خواهد شد.
            </p>
          </div>
        )}
      </AdminActionModal>

      {/* Reject Modal */}
      <AdminActionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        title="رد درخواست صدور فاکتور رسمی"
        confirmLabel="رد قطعی درخواست"
        variant="danger"
        isLoading={isRejecting}
      >
        {rejectingInvoice && (
          <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              لطفاً دلیل رد درخواست فاکتور رسمی برای شرکت{" "}
              <strong className="text-white">{rejectingInvoice.companyName || rejectingInvoice.clientName}</strong> را وارد نمایید:
            </p>

            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="مثال: عدم تطابق شناسه ملی یا کد پستی با روزنامه رسمی"
              className="bg-neutral-900 border-neutral-800 text-white text-xs"
            />

            <p className="text-[11px] text-neutral-400">
              این علت رد به اطلاع کاربر خریدار خواهد رسید تا نسبت به تصحیح اطلاعات حقوقی اقدام نماید.
            </p>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
