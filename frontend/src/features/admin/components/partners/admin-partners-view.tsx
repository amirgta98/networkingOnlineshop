"use client";

import * as React from "react";
import type { AdminPartner, AdminPartnerStatus, AdminPartnerTier } from "../../types/admin-partners.types";
import { MOCK_ADMIN_PARTNERS } from "../../data/mock-admin-partners";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  AdminStatsCards,
  AdminDetailDrawer,
  AdminActionModal,
} from "../shared";
import { PartnerDetailDrawerContent } from "./partner-detail-drawer-content";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Eye,
  Award,
  Ban,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function AdminPartnersView() {
  const [partners, setPartners] = React.useState<AdminPartner[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("velox_admin_partners");
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return MOCK_ADMIN_PARTNERS;
  });

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedPartner, setSelectedPartner] = React.useState<AdminPartner | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [approvingPartner, setApprovingPartner] = React.useState<AdminPartner | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = React.useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState<boolean>(false);
  const [rejectingPartner, setRejectingPartner] = React.useState<AdminPartner | null>(null);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem("velox_admin_partners", JSON.stringify(partners));
    } catch {
      // ignore
    }
  }, [partners]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Metrics
  const activePartnersCount = partners.filter((p) => p.status === "approved").length;
  const pendingCount = partners.filter((p) => p.status === "pending_review").length;
  const totalExtendedCredit = partners.reduce(
    (acc, p) => acc + (p.approvedCreditLimit || p.requestedCreditLimit),
    0
  );
  const totalCheques = partners.reduce((acc, p) => acc + p.sayadiChequesCount, 0);

  const statCards = [
    {
      id: "stat-partners",
      title: "شرکت‌ها و همکاران B2B فعال",
      value: `${toPersianDigits(activePartnersCount)} شرکت`,
      subtitle: "شبکه همکاران سازمانی",
      changeText: "+۱۴٪ فصلی",
      changePositive: true,
      icon: Building2,
      variant: "sky" as const,
    },
    {
      id: "stat-pending",
      title: "پرونده‌های در انتظار احراز مدارک",
      value: `${toPersianDigits(pendingCount)} متقاضی`,
      subtitle: "بررسی روزنامه رسمی و چک",
      changeText: "نیازمند اقدام",
      changePositive: false,
      icon: Clock,
      variant: "orange" as const,
    },
    {
      id: "stat-credit",
      title: "مجموع سقف اعتباری تخصیص‌یافته",
      value: formatPrice(totalExtendedCredit),
      subtitle: "تضمین‌شده با چک صیادی بنفش",
      changeText: "اعتبار فعال",
      changePositive: true,
      icon: CreditCard,
      variant: "emerald" as const,
    },
    {
      id: "stat-cheques",
      title: "چک‌های صیادی معتبر در سامانه پیچک",
      value: `${toPersianDigits(totalCheques)} فقره چک`,
      subtitle: "استعلام برخط بانک مرکزی",
      changeText: "سامانه پیچک",
      changePositive: true,
      icon: ShieldCheck,
      variant: "purple" as const,
    },
  ];

  // Filtering
  const filteredPartners = React.useMemo(() => {
    return partners.filter((partner) => {
      // Tab filter
      if (activeTab === "pending" && partner.status !== "pending_review") return false;
      if (activeTab === "approved" && partner.status !== "approved") return false;
      if (activeTab === "gold" && partner.tier !== "tier_gold") return false;
      if (activeTab === "silver" && partner.tier !== "tier_silver") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCompany = partner.companyName.toLowerCase().includes(q);
        const matchManager = partner.managerName.toLowerCase().includes(q);
        const matchNational = partner.nationalCode.toLowerCase().includes(q);
        const matchEconomic = partner.economicCode.toLowerCase().includes(q);
        if (!matchCompany && !matchManager && !matchNational && !matchEconomic) return false;
      }

      return true;
    });
  }, [partners, activeTab, searchQuery]);

  const handleOpenDetail = (partner: AdminPartner) => {
    setSelectedPartner(partner);
    setIsDrawerOpen(true);
  };

  const handleOpenApproveModal = (partner: AdminPartner) => {
    setApprovingPartner(partner);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approvingPartner) return;
    setIsProcessing(true);

    await new Promise((res) => setTimeout(res, 600));

    setPartners((prev) =>
      prev.map((p) =>
        p.id === approvingPartner.id
          ? {
              ...p,
              status: "approved",
              approvedCreditLimit: p.requestedCreditLimit,
              approvedAt: "امروز - همین لحظه",
            }
          : p
      )
    );

    setIsProcessing(false);
    setIsApproveModalOpen(false);
    showToast(
      `✅ مدارک شرکت «${approvingPartner.companyName}» تایید و سقف اعتباری ${formatPrice(approvingPartner.requestedCreditLimit)} فعال گردید.`
    );
  };

  const handleOpenRejectModal = (partner: AdminPartner) => {
    setRejectingPartner(partner);
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectingPartner) return;
    setIsProcessing(true);

    await new Promise((res) => setTimeout(res, 500));

    setPartners((prev) =>
      prev.map((p) =>
        p.id === rejectingPartner.id ? { ...p, status: "rejected" } : p
      )
    );

    setIsProcessing(false);
    setIsRejectModalOpen(false);
    showToast(`❌ درخواست همکاری شرکت «${rejectingPartner.companyName}» رد شد.`);
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["نام شرکت,مدیرعامل,شناسه ملی,کد اقتصادی,سقف اعتبار,اعتبار مصرفی,سطح,وضعیت"]
        .concat(
          filteredPartners.map(
            (p) =>
              `"${p.companyName}","${p.managerName}",${p.nationalCode},${p.economicCode},${p.requestedCreditLimit},${p.usedCredit},${p.tier},${p.status}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fonix-partners-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📁 گزارش شرکت‌های همکار B2B دانلود شد.");
  };

  // Columns
  const columns: AdminColumnDef<AdminPartner>[] = [
    {
      key: "companyName",
      header: "نام شرکت و سازمان",
      className: "min-w-[220px]",
      cell: (partner) => (
        <div className="flex flex-col text-right min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xs sm:text-sm truncate">
              {partner.companyName}
            </span>
            <span
              className={`text-[9px] px-2 py-0.2 rounded-full border font-bold shrink-0 whitespace-nowrap ${
                partner.tier === "tier_gold"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : partner.tier === "tier_silver"
                  ? "bg-neutral-700/50 text-neutral-300 border-neutral-600"
                  : "bg-orange-500/15 text-orange-400 border-orange-500/30"
              }`}
            >
              {partner.tier === "tier_gold" ? "طلایی" : partner.tier === "tier_silver" ? "نقره‌ای" : "برنزی"}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-0.5 truncate">
            نماینده: {partner.managerName} | تلفن: <span dir="ltr">{partner.phone}</span>
          </span>
        </div>
      ),
    },
    {
      key: "nationalCode",
      header: "شناسه ملی و ثبت",
      hideOnMobile: true,
      className: "whitespace-nowrap w-36",
      cell: (partner) => (
        <div className="flex flex-col text-right whitespace-nowrap">
          <span className="font-mono text-xs text-white">
            {toPersianDigits(partner.nationalCode)}
          </span>
          <span className="font-mono text-[10px] text-neutral-400">
            شماره ثبت: {toPersianDigits(partner.registrationNumber)}
          </span>
        </div>
      ),
    },
    {
      key: "creditLimit",
      header: "سقف خط اعتباری",
      sortable: true,
      className: "whitespace-nowrap w-44",
      cell: (partner) => (
        <div className="flex flex-col text-right whitespace-nowrap">
          <span className="font-mono font-bold text-xs text-sky-400">
            {formatPrice(partner.approvedCreditLimit || partner.requestedCreditLimit)}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            مصرفی: {formatPrice(partner.usedCredit)}
          </span>
        </div>
      ),
    },
    {
      key: "cheques",
      header: "چک صیادی (پیچک)",
      hideOnMobile: true,
      className: "whitespace-nowrap w-32",
      cell: (partner) => (
        <span className="text-xs text-neutral-300 font-medium whitespace-nowrap inline-block">
          {toPersianDigits(partner.sayadiChequesCount)} فقره معتبر
        </span>
      ),
    },
    {
      key: "status",
      header: "وضعیت عضویت",
      className: "whitespace-nowrap w-36",
      cell: (partner) => {
        if (partner.status === "approved") {
          return (
            <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-block">
              تایید صلاحیت شده
            </span>
          );
        }
        if (partner.status === "pending_review") {
          return (
            <span className="text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-block">
              در انتظار احراز مدارک
            </span>
          );
        }
        return (
          <span className="text-[11px] bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-block">
            رد صلاحیت
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "عملیات",
      className: "whitespace-nowrap w-28 text-left",
      cell: (partner) => (
        <div className="flex items-center gap-2">
          {partner.status === "pending_review" ? (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenApproveModal(partner);
              }}
              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1 font-bold shadow-sm whitespace-nowrap"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>تایید صلاحیت</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetail(partner);
              }}
              className="h-8 px-2.5 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs gap-1 whitespace-nowrap"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>مشاهده پرونده</span>
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
              <Building2 className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  همکاران سازمانی و B2B
                </h1>
                <span className="text-xs text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-semibold">
                  پرتال احراز هویت شرکتی و خط اعتباری
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                بررسی و صحه‌گذاری روزنامه رسمی، گواهی ارزش افزوده، تخصیص خط اعتباری تا سقف ۵۰۰ میلیون تومان و مانیتورینگ چک‌های صیادی بنفش ثبت‌شده در سامانه پیچک.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <AdminStatsCards items={statCards} />

      {/* Filter Toolbar */}
      <AdminFilterToolbar
        searchPlaceholder="جستجو در نام شرکت، مدیرعامل، شناسه ملی یا کد اقتصادی..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeStatusTab={activeTab}
        onStatusTabChange={setActiveTab}
        statusTabs={[
          { id: "all", label: "همه شرکت‌ها", count: partners.length },
          {
            id: "pending",
            label: "در انتظار احراز مدارک",
            count: partners.filter((p) => p.status === "pending_review").length,
          },
          {
            id: "approved",
            label: "همکاران تاییدشده",
            count: partners.filter((p) => p.status === "approved").length,
          },
          {
            id: "gold",
            label: "سطح طلایی (سقف ۵۰۰م)",
            count: partners.filter((p) => p.tier === "tier_gold").length,
          },
          {
            id: "silver",
            label: "سطح نقره‌ای",
            count: partners.filter((p) => p.tier === "tier_silver").length,
          },
        ]}
        onExport={handleExport}
      />

      {/* Data Table */}
      <AdminDataTable
        data={filteredPartners}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={handleOpenDetail}
        emptyMessage="هیچ شرکت همکاری مطابق با فیلترها یافت نشد."
        emptySubtitle="کلمه جستجوی دیگری را وارد کنید یا فیلتر تب‌ها را به «همه شرکت‌ها» بازگردانید."
      />

      {/* Detail Slide-Over Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedPartner ? `پرونده شرکتی: ${selectedPartner.companyName}` : "جزییات همکار B2B"}
        subtitle={selectedPartner?.nationalCode ? `شناسه ملی: ${selectedPartner.nationalCode}` : undefined}
        badge={
          selectedPartner?.status === "approved"
            ? "همکار رسمی فعال"
            : selectedPartner?.status === "pending_review"
            ? "در انتظار احراز مدارک"
            : "رد صلاحیت"
        }
      >
        {selectedPartner && (
          <PartnerDetailDrawerContent
            partner={selectedPartner}
            onApprove={(partner) => {
              setIsDrawerOpen(false);
              handleOpenApproveModal(partner);
            }}
            onReject={(partner) => {
              setIsDrawerOpen(false);
              handleOpenRejectModal(partner);
            }}
          />
        )}
      </AdminDetailDrawer>

      {/* Approve Modal */}
      <AdminActionModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        title="تایید صلاحیت همکار سازمانی و فعال‌سازی خط اعتباری"
        confirmLabel="تایید مدارک و فعال‌سازی اعتبار"
        variant="success"
        isLoading={isProcessing}
      >
        {approvingPartner && (
          <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از تایید صلاحیت شرکت{" "}
              <strong className="text-white">«{approvingPartner.companyName}»</strong> و فعال‌سازی
              سقف خرید اعتباری اطمینان دارید؟
            </p>

            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">شناسه ملی شرکت:</span>
                <span className="font-mono text-white">{toPersianDigits(approvingPartner.nationalCode)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">مدیرعامل / نماینده:</span>
                <span className="text-white font-medium">{approvingPartner.managerName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 font-bold">
                <span className="text-white">سقف اعتباری تخصیص‌یافته:</span>
                <span className="font-mono text-emerald-400 text-sm">
                  {formatPrice(approvingPartner.requestedCreditLimit)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400">
              با فعال‌سازی این خط اعتباری، این شرکت می‌تواند تا سقف مشخص‌شده به صورت خرید چکی با چک صیادی بنفش در سبد خرید سفارش ثبت کند.
            </p>
          </div>
        )}
      </AdminActionModal>

      {/* Reject Modal */}
      <AdminActionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        title="رد تقاضای عضویت همکار سازمانی"
        confirmLabel="رد قطعی تقاضا"
        variant="danger"
        isLoading={isProcessing}
      >
        {rejectingPartner && (
          <div className="flex flex-col gap-3 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از رد تقاضای عضویت شرکت{" "}
              <strong className="text-white">«{rejectingPartner.companyName}»</strong> اطمینان دارید؟
            </p>
            <p className="text-[11px] text-red-400">
              پرونده این شرکت در وضعیت رد صلاحیت بایگانی شده و اعلان عدم تایید مدارک به همراه توضیحات مربوطه ارسال خواهد شد.
            </p>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
