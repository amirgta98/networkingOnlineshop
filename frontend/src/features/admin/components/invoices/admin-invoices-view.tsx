"use client";

import * as React from "react";
import type { AdminInvoice, AdminInvoiceTaxStatus } from "../../types/admin-invoices.types";
import { MOCK_ADMIN_INVOICES } from "../../data/mock-admin-invoices";
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
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function AdminInvoicesView() {
  const [invoices, setInvoices] = React.useState<AdminInvoice[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("velox_admin_invoices");
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return MOCK_ADMIN_INVOICES;
  });

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = React.useState<AdminInvoice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [syncingInvoice, setSyncingInvoice] = React.useState<AdminInvoice | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = React.useState<boolean>(false);
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync state to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem("velox_admin_invoices", JSON.stringify(invoices));
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
      subtitle: "تطبیق موفق در کارپوشه مالیاتی",
      changeText: "۱۰۰٪ معتبر",
      changePositive: true,
      icon: ShieldCheck,
      variant: "sky" as const,
    },
    {
      id: "stat-pending",
      title: "در انتظار ارسال به سامانه مودیان",
      value: `${toPersianDigits(pendingTaxCount)} سند`,
      subtitle: "مهلت قانونی ثبت تا ۷ روز کاری",
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
      if (activeTab === "type_1" && inv.invoiceType !== "type_1") return false;
      if (activeTab === "type_2" && inv.invoiceType !== "type_2") return false;
      if (activeTab === "synced" && inv.taxSyncStatus !== "synced") return false;
      if (activeTab === "pending" && inv.taxSyncStatus !== "pending") return false;
      if (activeTab === "unpaid" && inv.paymentStatus !== "unpaid") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchTax = inv.taxSystemId?.toLowerCase().includes(q) || false;
        const matchClient = inv.clientName.toLowerCase().includes(q);
        const matchCompany = inv.companyName?.toLowerCase().includes(q) || false;
        const matchOrder = inv.orderTrackingCode.toLowerCase().includes(q);
        if (!matchNumber && !matchTax && !matchClient && !matchCompany && !matchOrder) return false;
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

  const handleConfirmSyncTax = async () => {
    if (!syncingInvoice) return;
    setIsSyncing(true);

    // Simulate API delay to tax gateway
    await new Promise((res) => setTimeout(res, 800));

    // Generate simulated 22-character unique tax code
    const randomHex = Math.random().toString(36).substring(2, 12).toUpperCase();
    const generatedTaxId = `TX1403${randomHex}98214`.substring(0, 22);

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

    setIsSyncing(false);
    setIsSyncModalOpen(false);
    showToast(
      `✅ فاکتور رسمی «${syncingInvoice.invoiceNumber}» با شناسه یکتای ${generatedTaxId} در سامانه مودیان ثبت گردید.`
    );
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
              {inv.invoiceType === "type_1" ? "نوع ۱ (حقوقی)" : "نوع ۲ (عادی)"}
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
      header: "سامانه مودیان",
      className: "whitespace-nowrap w-44",
      cell: (inv) => {
        if (inv.taxSyncStatus === "synced") {
          return (
            <div className="flex flex-col text-right whitespace-nowrap">
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>ثبت در کارپوشه</span>
              </span>
              <span className="font-mono text-[9px] text-neutral-500 truncate max-w-[140px]" title={inv.taxSystemId}>
                {inv.taxSystemId}
              </span>
            </div>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            <span>در انتظار ارسال</span>
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
      className: "whitespace-nowrap w-32 text-left",
      cell: (inv) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          {inv.taxSyncStatus === "pending" ? (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenSyncModal(inv);
              }}
              className="h-8 px-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1 font-bold shadow-sm whitespace-nowrap"
            >
              <Send className="h-3 w-3" />
              <span>ارسال به مودیان</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetail(inv);
              }}
              className="h-8 px-2.5 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs gap-1 whitespace-nowrap"
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
                صدور و ارسال برخط صورتحساب‌های الکترونیکی نوع ۱ و ۲ به کارپوشه مودیان، محاسبه ۱۰٪ مالیات بر ارزش افزوده و گزارش‌های دفاتر مالیاتی رسمی شرکت تجهیزات شبکه ققنوس آکادمی.
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
            id: "type_1",
            label: "نوع ۱ (حقوقی با کد اقتصادی)",
            count: invoices.filter((inv) => inv.invoiceType === "type_1").length,
          },
          {
            id: "type_2",
            label: "نوع ۲ (مصرف‌کننده نهایی)",
            count: invoices.filter((inv) => inv.invoiceType === "type_2").length,
          },
          {
            id: "synced",
            label: "تاییدشده در کارپوشه مودیان",
            count: invoices.filter((inv) => inv.taxSyncStatus === "synced").length,
          },
          {
            id: "pending",
            label: "در انتظار ارسال",
            count: invoices.filter((inv) => inv.taxSyncStatus === "pending").length,
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
        emptyMessage="هیچ فاکتور رسمی با فیلترهای مشخص‌شده یافت نشد."
        emptySubtitle="عبارت جستجو را تغییر دهید یا تب‌ها را به «همه صورتحساب‌ها» بازگردانید."
      />

      {/* Detail Slide-Over Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedInvoice ? `صورتحساب رسمی: ${selectedInvoice.invoiceNumber}` : "جزییات صورتحساب"}
        subtitle={selectedInvoice?.taxSystemId || selectedInvoice?.orderTrackingCode}
        badge={
          selectedInvoice?.taxSyncStatus === "synced"
            ? "تایید شده در کارپوشه"
            : "در انتظار ارسال"
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

      {/* Tax Sync Action Modal */}
      <AdminActionModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onConfirm={handleConfirmSyncTax}
        title="ارسال صورتحساب به سامانه جامع مودیان مالیاتی"
        confirmLabel="ارسال قطعی به کارپوشه دارایی"
        variant="primary"
        isLoading={isSyncing}
      >
        {syncingInvoice && (
          <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از ارسال صورتحساب شماره{" "}
              <strong className="text-white font-mono">{syncingInvoice.invoiceNumber}</strong> مربوط به{" "}
              <strong className="text-sky-300">{syncingInvoice.companyName || syncingInvoice.clientName}</strong> به کارپوشه امور مالیاتی اطمینان دارید؟
            </p>

            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <div className="flex justify-between">
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
              این عملیات با امضای کلید دیجیتال CSR و شناسه حافظه مالیاتی شرکت ققنوس آکادمی امضا شده و شناسه منحصر‌به‌فرد مالیاتی ۲۲ رقمی برای این فاکتور تولید خواهد شد.
            </p>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
