"use client";

import * as React from "react";
import type { AdminRfq, AdminRfqStatus } from "../../types/admin-rfq.types";
import { MOCK_ADMIN_RFQS } from "../../data/mock-admin-rfq";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  AdminStatsCards,
  AdminDetailDrawer,
  AdminActionModal,
} from "../shared";
import { RfqDetailDrawerContent } from "./rfq-detail-drawer-content";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  FileCheck2,
  Building2,
  Phone,
  Eye,
  Send,
  Calendar,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function AdminRfqView() {
  const [rfqs, setRfqs] = React.useState<AdminRfq[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("velox_admin_rfqs");
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return MOCK_ADMIN_RFQS;
  });

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedRfq, setSelectedRfq] = React.useState<AdminRfq | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [quotingRfq, setQuotingRfq] = React.useState<AdminRfq | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = React.useState<boolean>(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem("velox_admin_rfqs", JSON.stringify(rfqs));
    } catch {
      // ignore
    }
  }, [rfqs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Calculate metrics
  const totalOpenRfqs = rfqs.filter((r) => r.status === "pending_quote").length;
  const urgentRfqs = rfqs.filter((r) => r.urgent && r.status === "pending_quote").length;
  const pipelineValue = rfqs.reduce((acc, r) => acc + r.estimatedValue, 0);
  const convertedCount = rfqs.filter((r) => r.status === "converted").length;

  const statCards = [
    {
      id: "stat-open",
      title: "استعلام‌های باز در صف قیمت‌دهی",
      value: `${toPersianDigits(totalOpenRfqs)} پروژه`,
      subtitle: "در انتظار بررسی مهندسی",
      changeText: "اقدام فوری",
      changePositive: false,
      icon: FileSpreadsheet,
      variant: "purple" as const,
    },
    {
      id: "stat-urgent",
      title: "استعلام‌های با مهلت فوری",
      value: `${toPersianDigits(urgentRfqs)} مورد`,
      subtitle: "مهلت پاسخ کمتر از ۴ ساعت",
      changeText: "اولویت بالا",
      changePositive: false,
      icon: AlertCircle,
      variant: "orange" as const,
    },
    {
      id: "stat-pipeline",
      title: "ارزش تجمیعی پروژه‌های استعلام‌شده",
      value: formatPrice(pipelineValue),
      subtitle: "خط لوله فروش تجهیزات",
      changeText: "+۱۸٪ تقاضای سیسکو",
      changePositive: true,
      icon: TrendingUp,
      variant: "emerald" as const,
    },
    {
      id: "stat-converted",
      title: "تبدیل‌شده به پیش‌فاکتور و سفارش",
      value: `${toPersianDigits(convertedCount)} پروژه`,
      subtitle: "تایید نهایی در ماه جاری",
      changeText: "۷۴٪ نرخ تبدیل",
      changePositive: true,
      icon: CheckCircle2,
      variant: "sky" as const,
    },
  ];

  // Filtered RFQs
  const filteredRfqs = React.useMemo(() => {
    return rfqs.filter((rfq) => {
      // Tab filter
      if (activeTab === "pending_quote" && rfq.status !== "pending_quote") return false;
      if (activeTab === "urgent" && (!rfq.urgent || rfq.status !== "pending_quote")) return false;
      if (activeTab === "quoted" && rfq.status !== "quoted") return false;
      if (activeTab === "converted" && rfq.status !== "converted") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = rfq.projectTitle.toLowerCase().includes(q);
        const matchClient = rfq.clientName.toLowerCase().includes(q);
        const matchCompany = rfq.companyName.toLowerCase().includes(q);
        const matchNumber = rfq.rfqNumber.toLowerCase().includes(q);
        if (!matchTitle && !matchClient && !matchCompany && !matchNumber) return false;
      }

      return true;
    });
  }, [rfqs, activeTab, searchQuery]);

  const handleOpenDetail = (rfq: AdminRfq) => {
    setSelectedRfq(rfq);
    setIsDrawerOpen(true);
  };

  const handleOpenQuoteModal = (rfq: AdminRfq) => {
    setQuotingRfq(rfq);
    setIsQuoteModalOpen(true);
  };

  const handleConfirmIssueQuote = async () => {
    if (!quotingRfq) return;
    setIsSubmittingQuote(true);

    // Simulate API delay
    await new Promise((res) => setTimeout(res, 600));

    const finalAmount =
      quotingRfq.estimatedValue * (1 - quotingRfq.discountPercent / 100);

    setRfqs((prev) =>
      prev.map((r) =>
        r.id === quotingRfq.id
          ? {
              ...r,
              status: "quoted",
              finalQuotedAmount: finalAmount,
              quotationIssuedAt: "امروز - همین لحظه",
            }
          : r
      )
    );

    setIsSubmittingQuote(false);
    setIsQuoteModalOpen(false);
    showToast(
      `✅ پیش‌فاکتور رسمی برای «${quotingRfq.projectTitle}» با موفقیت صادر و به کارفرما ارسال گردید.`
    );
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["شماره RFQ,عنوان پروژه,شرکت,ارزش برآوردی,وضعیت"]
        .concat(
          filteredRfqs.map(
            (r) =>
              `${r.rfqNumber},"${r.projectTitle}","${r.companyName}",${r.estimatedValue},${r.status}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fonix-rfq-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📁 گزارش اکسل استعلام‌ها دانلود گردید.");
  };

  // Table Columns
  const columns: AdminColumnDef<AdminRfq>[] = [
    {
      key: "rfqNumber",
      header: "کد استعلام",
      sortable: true,
      className: "whitespace-nowrap w-36",
      cell: (rfq) => (
        <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 whitespace-nowrap inline-block">
          {rfq.rfqNumber}
        </span>
      ),
    },
    {
      key: "projectTitle",
      header: "عنوان پروژه و نیازمندی",
      className: "min-w-[260px]",
      cell: (rfq) => (
        <div className="flex flex-col min-w-0 text-right space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-xs sm:text-sm">
              {rfq.projectTitle}
            </span>
            {rfq.urgent && (
              <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold shrink-0 whitespace-nowrap">
                فوری ({toPersianDigits(rfq.deadlineHours)}س)
              </span>
            )}
          </div>
          <span className="text-[11px] text-neutral-400">
            {rfq.companyName} — نماینده: {rfq.clientName}
          </span>
        </div>
      ),
    },
    {
      key: "itemsCount",
      header: "اقلام درخواستی",
      hideOnMobile: true,
      className: "whitespace-nowrap w-28",
      cell: (rfq) => (
        <span className="text-xs text-neutral-300 font-medium whitespace-nowrap">
          {toPersianDigits(rfq.items.length)} ردیف کالایی
        </span>
      ),
    },
    {
      key: "estimatedValue",
      header: "ارزش برآوردی",
      sortable: true,
      className: "whitespace-nowrap w-36",
      cell: (rfq) => (
        <div className="flex flex-col text-right whitespace-nowrap">
          <span className="font-mono font-bold text-xs text-purple-300">
            {formatPrice(rfq.estimatedValue)}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            تخفیف: {toPersianDigits(rfq.discountPercent)}٪
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      className: "whitespace-nowrap w-36",
      cell: (rfq) => {
        if (rfq.status === "pending_quote") {
          return (
            <span className="text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-block">
              در انتظار قیمت‌دهی
            </span>
          );
        }
        if (rfq.status === "quoted") {
          return (
            <span className="text-[11px] bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-block">
              پیش‌فاکتور صادر شد
            </span>
          );
        }
        return (
          <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-block">
            تبدیل به سفارش شد
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "عملیات",
      className: "whitespace-nowrap w-36 text-left",
      cell: (rfq) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          {rfq.status === "pending_quote" ? (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenQuoteModal(rfq);
              }}
              className="h-8 px-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1 font-bold shadow-sm whitespace-nowrap"
            >
              <Send className="h-3 w-3" />
              <span>صدور پیش‌فاکتور</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetail(rfq);
              }}
              className="h-8 px-2.5 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs gap-1 whitespace-nowrap"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>مشاهده استعلام</span>
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
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-purple-950 border border-purple-500/40 text-purple-200 text-xs font-semibold shadow-2xl backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 text-2xl font-black ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20">
              <FileSpreadsheet className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  استعلام‌های قیمت پروژه‌ای (RFQ)
                </h1>
                <span className="text-xs text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-semibold">
                  مرکز مهندسی بازرگانی ققنوس آکادمی
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                بررسی لیست تجمیعی قطعات تجهیزات شبکه، کابل‌کشی ساخت‌یافته و دیتاسنتر، تعیین درصد تخفیف‌های تیراژ و صدور مکانیزه پیش‌فاکتور رسمی.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <AdminStatsCards items={statCards} />

      {/* Filter Toolbar */}
      <AdminFilterToolbar
        searchPlaceholder="جستجو در عنوان پروژه، نام شرکت کارفرما یا کد RFQ..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeStatusTab={activeTab}
        onStatusTabChange={setActiveTab}
        statusTabs={[
          { id: "all", label: "همه استعلام‌ها", count: rfqs.length },
          {
            id: "pending_quote",
            label: "در انتظار قیمت‌دهی",
            count: rfqs.filter((r) => r.status === "pending_quote").length,
          },
          {
            id: "urgent",
            label: "فوری (<۴ ساعت)",
            count: rfqs.filter((r) => r.urgent && r.status === "pending_quote").length,
          },
          {
            id: "quoted",
            label: "پیش‌فاکتور صادرشده",
            count: rfqs.filter((r) => r.status === "quoted").length,
          },
          {
            id: "converted",
            label: "تبدیل به سفارش",
            count: rfqs.filter((r) => r.status === "converted").length,
          },
        ]}
        onExport={handleExport}
      />

      {/* Data Table */}
      <AdminDataTable
        data={filteredRfqs}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={handleOpenDetail}
        emptyMessage="هیچ استعلام قیمتی مطابق با فیلترهای انتخابی یافت نشد."
        emptySubtitle="کلمه جستجوی دیگری را وارد کنید یا فیلتر تب‌ها را به «همه استعلام‌ها» بازگردانید."
      />

      {/* Detail Slide-Over Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedRfq ? `بررسی استعلام: ${selectedRfq.projectTitle}` : "جزییات استعلام"}
        subtitle={selectedRfq?.rfqNumber}
        badge={
          selectedRfq?.status === "pending_quote"
            ? "در انتظار قیمت‌دهی"
            : selectedRfq?.status === "quoted"
            ? "پیش‌فاکتور صادر شد"
            : "تبدیل به سفارش"
        }
      >
        {selectedRfq && (
          <RfqDetailDrawerContent
            rfq={selectedRfq}
            onIssueQuote={(rfq) => {
              setIsDrawerOpen(false);
              handleOpenQuoteModal(rfq);
            }}
          />
        )}
      </AdminDetailDrawer>

      {/* Issue Quotation Modal */}
      <AdminActionModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onConfirm={handleConfirmIssueQuote}
        title="تایید و صدور پیش‌فاکتور رسمی پروژه‌ای"
        confirmLabel="تایید و صدور پیش‌فاکتور"
        variant="primary"
        isLoading={isSubmittingQuote}
      >
        {quotingRfq && (
          <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از صدور پیش‌فاکتور رسمی برای پروژه{" "}
              <strong className="text-white">«{quotingRfq.projectTitle}»</strong> مربوط به شرکت{" "}
              <strong className="text-purple-300">{quotingRfq.companyName}</strong> اطمینان دارید؟
            </p>

            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">ارزش کل اقلام درخواستی:</span>
                <span className="font-mono text-white">{formatPrice(quotingRfq.estimatedValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">تخفیف پروژه‌ای مصوب:</span>
                <span className="font-mono text-emerald-400">
                  {toPersianDigits(quotingRfq.discountPercent)}٪ (
                  {formatPrice((quotingRfq.estimatedValue * quotingRfq.discountPercent) / 100)})
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 font-bold">
                <span className="text-white">مبلغ نهایی پیش‌فاکتور:</span>
                <span className="font-mono text-purple-300 text-sm">
                  {formatPrice(
                    quotingRfq.estimatedValue * (1 - quotingRfq.discountPercent / 100)
                  )}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400">
              پس از تایید، پیش‌فاکتور رسمی به صورت الکترونیک با شناسه یکتا ثبت شده و لینک دانلود امن
              از طریق پیامک به شماره <span className="font-mono text-white" dir="ltr">{quotingRfq.clientPhone}</span> ارسال خواهد شد.
            </p>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
