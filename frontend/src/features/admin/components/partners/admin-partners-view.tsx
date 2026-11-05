"use client";

import * as React from "react";
import type {
  AdminPartner,
  AdminPartnerStatus,
  AdminPartnerTier,
  AdminApplicantType,
  AdminPartnersStats,
} from "../../types/admin-partners.types";
import { adminPartnersApi } from "../../api/admin-partners-api";
import {
  AdminDataView,
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
  CreditCard,
  CheckCircle2,
  Clock,
  UserCheck,
  Eye,
  Ban,
  User,
  HelpCircle,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  FileCheck2,
  Phone,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function AdminPartnersView() {
  const [partners, setPartners] = React.useState<AdminPartner[]>([]);
  const [stats, setStats] = React.useState<AdminPartnersStats>({
    totalApplications: 0,
    pendingCount: 0,
    approvedCount: 0,
    needDocsCount: 0,
    rejectedCount: 0,
    individualCount: 0,
    companyCount: 0,
    totalApprovedCredit: 0,
  });

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Tabs and Filters
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [applicantTypeFilter, setApplicantTypeFilter] = React.useState<string>("all");
  const [searchQueryInput, setSearchQueryInput] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Pagination (Server-Side)
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalItems, setTotalItems] = React.useState<number>(0);

  // Modals & Drawers
  const [selectedPartner, setSelectedPartner] = React.useState<AdminPartner | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState<boolean>(false);

  // Approve Modal State
  const [approvingPartner, setApprovingPartner] = React.useState<AdminPartner | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = React.useState<boolean>(false);
  const [approveTier, setApproveTier] = React.useState<AdminPartnerTier>("GOLD");
  const [approveCreditLimit, setApproveCreditLimit] = React.useState<number>(100000000);
  const [approveManager, setApproveManager] = React.useState<string>("مهندس رضایی (فروش سازمانی)");
  const [approveNotes, setApproveNotes] = React.useState<string>("");

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState<boolean>(false);
  const [rejectingPartner, setRejectingPartner] = React.useState<AdminPartner | null>(null);
  const [rejectReason, setRejectReason] = React.useState<string>("");

  // Need Docs Modal State
  const [isNeedDocsModalOpen, setIsNeedDocsModalOpen] = React.useState<boolean>(false);
  const [needDocsPartner, setNeedDocsPartner] = React.useState<AdminPartner | null>(null);
  const [needDocsNotes, setNeedDocsNotes] = React.useState<string>("");

  // Create Partner Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState<boolean>(false);
  const [createType, setCreateType] = React.useState<AdminApplicantType>("INDIVIDUAL");
  const [createFullName, setCreateFullName] = React.useState<string>("");
  const [createCompanyName, setCreateCompanyName] = React.useState<string>("");
  const [createTradeName, setCreateTradeName] = React.useState<string>("");
  const [createPhone, setCreatePhone] = React.useState<string>("");
  const [createLandline, setCreateLandline] = React.useState<string>("");
  const [createNationalCode, setCreateNationalCode] = React.useState<string>("");
  const [createNationalCompanyId, setCreateNationalCompanyId] = React.useState<string>("");
  const [createProvince, setCreateProvince] = React.useState<string>("تهران");
  const [createCity, setCreateCity] = React.useState<string>("تهران");
  const [createAddress, setCreateAddress] = React.useState<string>("");
  const [createFieldOfActivity, setCreateFieldOfActivity] = React.useState<string>("پسیو و تجهیزات شبکه");
  const [createExperienceYears, setCreateExperienceYears] = React.useState<number>(3);
  const [createRequestedCredit, setCreateRequestedCredit] = React.useState<number>(50000000);
  const [createApprovedCredit, setCreateApprovedCredit] = React.useState<number>(50000000);
  const [createTier, setCreateTier] = React.useState<AdminPartnerTier>("BRONZE");
  const [createStatus, setCreateStatus] = React.useState<AdminPartnerStatus>("PENDING");
  const [createNotes, setCreateNotes] = React.useState<string>("");

  // Edit Partner Modal State
  const [editingPartner, setEditingPartner] = React.useState<AdminPartner | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [editFullName, setEditFullName] = React.useState<string>("");
  const [editCompanyName, setEditCompanyName] = React.useState<string>("");
  const [editTradeName, setEditTradeName] = React.useState<string>("");
  const [editPhone, setEditPhone] = React.useState<string>("");
  const [editLandline, setEditLandline] = React.useState<string>("");
  const [editNationalCode, setEditNationalCode] = React.useState<string>("");
  const [editNationalCompanyId, setEditNationalCompanyId] = React.useState<string>("");
  const [editProvince, setEditProvince] = React.useState<string>("");
  const [editCity, setEditCity] = React.useState<string>("");
  const [editAddress, setEditAddress] = React.useState<string>("");
  const [editFieldOfActivity, setEditFieldOfActivity] = React.useState<string>("");
  const [editExperienceYears, setEditExperienceYears] = React.useState<number>(1);
  const [editRequestedCredit, setEditRequestedCredit] = React.useState<number>(0);
  const [editApprovedCredit, setEditApprovedCredit] = React.useState<number>(0);
  const [editTier, setEditTier] = React.useState<AdminPartnerTier>("BRONZE");
  const [editStatus, setEditStatus] = React.useState<AdminPartnerStatus>("PENDING");
  const [editManager, setEditManager] = React.useState<string>("");
  const [editNotes, setEditNotes] = React.useState<string>("");

  // Delete Partner Modal State
  const [deletingPartner, setDeletingPartner] = React.useState<AdminPartner | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>(false);

  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchQueryInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQueryInput]);

  // Fetch partners from backend endpoint
  const fetchPartners = React.useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await adminPartnersApi.getPartners({
        status: activeTab !== "all" ? activeTab : undefined,
        applicantType: applicantTypeFilter !== "all" ? applicantTypeFilter : undefined,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        limit: pageSize,
      });

      if (res && res.items) {
        setPartners(res.items);
        setTotalItems(res.total ?? res.items.length);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err: any) {
      console.error("Failed to load admin partners from API:", err);
      setFetchError(err?.message || "خطا در برقراری ارتباط با وب‌سرویس بکند");
      showToast("خطا در بارگذاری پرونده‌ها از سرور");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, applicantTypeFilter, searchQuery, currentPage, pageSize]);

  React.useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Metric Stat Cards
  const statCards = [
    {
      id: "stat-partners",
      title: "همکاران تایید شده و فعال",
      value: `${toPersianDigits(stats.approvedCount)} عضو`,
      subtitle: `${toPersianDigits(stats.companyCount)} شرکت / ${toPersianDigits(stats.individualCount)} نصاب`,
      changeText: "اعضای رسمی",
      changePositive: true,
      icon: Building2,
      variant: "sky" as const,
    },
    {
      id: "stat-pending",
      title: "پرونده‌های نیازمند بررسی",
      value: `${toPersianDigits(stats.pendingCount)} متقاضی`,
      subtitle: "بررسی مدارک هویتی و اعتبارسنجی",
      changeText: "نیازمند اقدام",
      changePositive: false,
      icon: Clock,
      variant: "orange" as const,
    },
    {
      id: "stat-credit",
      title: "مجموع خط اعتباری تخصیص‌یافته",
      value: formatPrice(stats.totalApprovedCredit),
      subtitle: "تضمین‌شده با چک صیادی بنفش یا جواز کسب",
      changeText: "اعتبار فعال",
      changePositive: true,
      icon: CreditCard,
      variant: "emerald" as const,
    },
    {
      id: "stat-need-docs",
      title: "نقص مدرک و درخواست اصلاح",
      value: `${toPersianDigits(stats.needDocsCount)} پرونده`,
      subtitle: "در انتظار بارگذاری مجدد متقاضی",
      changeText: "در انتظار کاربر",
      changePositive: false,
      icon: HelpCircle,
      variant: "purple" as const,
    },
  ];

  // Open drawer and load live fresh details from /admin/partners/:id
  const handleOpenDetail = async (partner: AdminPartner) => {
    setSelectedPartner(partner);
    setIsDrawerOpen(true);
    setIsLoadingDetail(true);
    try {
      const fresh = await adminPartnersApi.getPartnerById(partner.id);
      if (fresh) {
        setSelectedPartner(fresh);
      }
    } catch (err) {
      console.warn("Could not fetch fresh partner detail, using cached:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleOpenApproveModal = (partner: AdminPartner) => {
    setApprovingPartner(partner);
    setApproveTier((partner.tier as AdminPartnerTier) || "GOLD");
    setApproveCreditLimit(partner.requestedCreditLimit || 100000000);
    setApproveManager(partner.assignedAccountManager || "مهندس رضایی (مدیر فروش سازمانی)");
    setApproveNotes(partner.reviewerNotes || "مدارک هویتی و تخصصی استعلام و تایید گردید. خط اعتباری و پنل همکار فعال شد.");
    setIsApproveModalOpen(true);
  };

  const handleOpenRejectModal = (partner: AdminPartner) => {
    setRejectingPartner(partner);
    setRejectReason("عدم تطابق مدارک ارسالی با معیارهای اعتباری و صنفی شرکت.");
    setIsRejectModalOpen(true);
  };

  const handleOpenNeedDocsModal = (partner: AdminPartner) => {
    setNeedDocsPartner(partner);
    setNeedDocsNotes("تصویر مدارک ارسالی تار است / لطفاً گواهی دارای اعتبار بارگذاری نمایید.");
    setIsNeedDocsModalOpen(true);
  };

  const handleOpenEditModal = (partner: AdminPartner) => {
    setEditingPartner(partner);
    setEditFullName(partner.fullName || "");
    setEditCompanyName(partner.companyName || "");
    setEditTradeName(partner.tradeName || "");
    setEditPhone(partner.phone || "");
    setEditLandline(partner.landlinePhone || "");
    setEditNationalCode(partner.nationalCode || "");
    setEditNationalCompanyId(partner.nationalCompanyId || "");
    setEditProvince(partner.province || "تهران");
    setEditCity(partner.city || "تهران");
    setEditAddress(partner.address || "");
    setEditFieldOfActivity(partner.fieldOfActivity || "");
    setEditExperienceYears(partner.experienceYears || 1);
    setEditRequestedCredit(partner.requestedCreditLimit || 0);
    setEditApprovedCredit(partner.approvedCreditLimit || 0);
    setEditTier((partner.tier as AdminPartnerTier) || "BRONZE");
    setEditStatus(partner.status || "PENDING");
    setEditManager(partner.assignedAccountManager || "");
    setEditNotes(partner.notes || "");
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (partner: AdminPartner) => {
    setDeletingPartner(partner);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approvingPartner) return;
    setIsProcessing(true);

    try {
      await adminPartnersApi.updatePartnerStatus(approvingPartner.id, {
        status: "APPROVED",
        tier: approveTier,
        approvedCreditLimit: approveCreditLimit,
        assignedAccountManager: approveManager,
        reviewerNotes: approveNotes,
      });

      setIsApproveModalOpen(false);
      setIsDrawerOpen(false);
      showToast(
        `✅ پرونده «${
          approvingPartner.companyName || approvingPartner.fullName
        }» تایید و سقف اعتباری ${formatPrice(approveCreditLimit)} فعال گردید.`
      );
      await fetchPartners();
    } catch (err: any) {
      showToast(`❌ خطا در تایید پرونده: ${err?.message || "خطای سرور"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPartner) return;
    setIsProcessing(true);

    try {
      await adminPartnersApi.updatePartnerStatus(rejectingPartner.id, {
        status: "REJECTED",
        reviewerNotes: rejectReason,
      });

      setIsRejectModalOpen(false);
      setIsDrawerOpen(false);
      showToast(`پرونده «${rejectingPartner.companyName || rejectingPartner.fullName}» رد صلاحیت گردید.`);
      await fetchPartners();
    } catch (err: any) {
      showToast(`❌ خطا: ${err?.message || "خطای سرور"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmNeedDocs = async () => {
    if (!needDocsPartner) return;
    setIsProcessing(true);

    try {
      await adminPartnersApi.updatePartnerStatus(needDocsPartner.id, {
        status: "NEED_DOCS",
        reviewerNotes: needDocsNotes,
      });

      setIsNeedDocsModalOpen(false);
      setIsDrawerOpen(false);
      showToast(
        `پیام درخواست مدارک تکمیلی برای «${
          needDocsPartner.companyName || needDocsPartner.fullName
        }» ارسال شد.`
      );
      await fetchPartners();
    } catch (err: any) {
      showToast(`❌ خطا: ${err?.message || "خطای سرور"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmCreate = async () => {
    if (!createPhone.trim() || (!createFullName.trim() && !createCompanyName.trim())) {
      showToast("لطفاً نام یا نام شرکت و شماره همراه را وارد کنید.");
      return;
    }

    setIsProcessing(true);
    try {
      await adminPartnersApi.createPartner({
        applicantType: createType,
        fullName: createFullName.trim() || createCompanyName.trim(),
        companyName: createType === "COMPANY" ? createCompanyName.trim() : undefined,
        tradeName: createType === "INDIVIDUAL" ? createTradeName.trim() : undefined,
        phone: createPhone.trim(),
        landlinePhone: createLandline.trim() || undefined,
        nationalCode: createType === "INDIVIDUAL" ? createNationalCode.trim() : undefined,
        nationalCompanyId: createType === "COMPANY" ? createNationalCompanyId.trim() : undefined,
        province: createProvince.trim(),
        city: createCity.trim(),
        address: createAddress.trim() || "ثبت دستی مدیریت",
        fieldOfActivity: createFieldOfActivity.trim(),
        experienceYears: Number(createExperienceYears) || 1,
        requestedCreditLimit: Number(createRequestedCredit) || 0,
        approvedCreditLimit: Number(createApprovedCredit) || 0,
        tier: createTier,
        status: createStatus,
        notes: createNotes.trim() || undefined,
      });

      setIsCreateModalOpen(false);
      // Reset form
      setCreateFullName("");
      setCreateCompanyName("");
      setCreateTradeName("");
      setCreatePhone("");
      setCreateLandline("");
      setCreateNationalCode("");
      setCreateNationalCompanyId("");
      setCreateAddress("");
      setCreateNotes("");
      showToast("✅ پرونده همکار جدید با موفقیت در بکند ثبت گردید.");
      await fetchPartners();
    } catch (err: any) {
      showToast(`❌ خطا در ایجاد پرونده: ${err?.message || "خطای سرور"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmEdit = async () => {
    if (!editingPartner) return;
    setIsProcessing(true);

    try {
      await adminPartnersApi.updatePartner(editingPartner.id, {
        fullName: editFullName.trim(),
        companyName: editingPartner.applicantType === "COMPANY" ? editCompanyName.trim() : undefined,
        tradeName: editingPartner.applicantType === "INDIVIDUAL" ? editTradeName.trim() : undefined,
        phone: editPhone.trim(),
        landlinePhone: editLandline.trim() || undefined,
        nationalCode: editingPartner.applicantType === "INDIVIDUAL" ? editNationalCode.trim() : undefined,
        nationalCompanyId: editingPartner.applicantType === "COMPANY" ? editNationalCompanyId.trim() : undefined,
        province: editProvince.trim(),
        city: editCity.trim(),
        address: editAddress.trim(),
        fieldOfActivity: editFieldOfActivity.trim(),
        experienceYears: Number(editExperienceYears) || 0,
        requestedCreditLimit: Number(editRequestedCredit) || 0,
        approvedCreditLimit: Number(editApprovedCredit) || 0,
        tier: editTier,
        status: editStatus,
        assignedAccountManager: editManager.trim() || undefined,
        notes: editNotes.trim() || undefined,
      });

      setIsEditModalOpen(false);
      setIsDrawerOpen(false);
      showToast(`✅ تغییرات پرونده «${editFullName || editCompanyName}» در بکند ذخیره شد.`);
      await fetchPartners();
    } catch (err: any) {
      showToast(`❌ خطا در ذخیره تغییرات: ${err?.message || "خطای سرور"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPartner) return;
    setIsProcessing(true);

    try {
      await adminPartnersApi.deletePartner(deletingPartner.id);
      setIsDeleteModalOpen(false);
      setIsDrawerOpen(false);
      showToast(`🗑️ پرونده «${deletingPartner.companyName || deletingPartner.fullName}» از دیتابیس حذف گردید.`);
      await fetchPartners();
    } catch (err: any) {
      showToast(`❌ خطا در حذف پرونده: ${err?.message || "خطای سرور"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      ["نوع,نام,شرکت/برند,تلفن,شهر,سقف اعتبار,وضعیت"]
        .concat(
          partners.map(
            (p) =>
              `${p.applicantType === "INDIVIDUAL" ? "حقیقی" : "حقوقی"},${p.fullName},${
                p.companyName || p.tradeName || "-"
              },${p.phone},${p.city},${p.approvedCreditLimit || p.requestedCreditLimit},${p.status}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `partners-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("خروجی اکسل/CSV متقاضیان همکار با موفقیت دانلود شد.");
  };

  // Status Badge Component
  const renderStatusBadge = (status: AdminPartnerStatus) => {
    const s = String(status).toUpperCase();
    if (s === "APPROVED") {
      return (
        <span className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>تایید شده (فعال)</span>
        </span>
      );
    }
    if (s === "NEED_DOCS") {
      return (
        <span className="text-[11px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          <span>نیازمند مدارک</span>
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="text-[11px] bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-flex items-center gap-1">
          <Ban className="h-3 w-3" />
          <span>رد صلاحیت</span>
        </span>
      );
    }
    return (
      <span className="text-[11px] bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-xl font-semibold whitespace-nowrap inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>در انتظار بررسی</span>
      </span>
    );
  };

  // Table Columns
  const columns: AdminColumnDef<AdminPartner>[] = [
    {
      key: "applicant",
      header: "متقاضی / شرکت",
      sortable: true,
      className: "min-w-[220px]",
      cell: (partner) => {
        const isInd = partner.applicantType === "INDIVIDUAL";
        return (
          <div className="flex items-center gap-3 text-right min-w-0">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                isInd
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  : "bg-sky-500/15 text-sky-400 border-sky-500/30"
              }`}
            >
              {isInd ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm truncate">
                  {isInd
                    ? `${partner.fullName} ${partner.tradeName ? `(${partner.tradeName})` : ""}`
                    : partner.companyName || partner.fullName}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full border font-bold shrink-0 whitespace-nowrap ${
                    isInd
                      ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                      : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                  }`}
                >
                  {isInd ? "شخص حقیقی" : "حقوقی / شرکتی"}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 truncate">
                {isInd
                  ? `کد ملی: ${toPersianDigits(partner.nationalCode || "-")}`
                  : `نماینده: ${partner.ceoOrAgentName || partner.fullName}`}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "contact",
      header: "تماس و موقعیت",
      hideOnMobile: true,
      className: "whitespace-nowrap w-40",
      cell: (partner) => (
        <div className="flex flex-col text-right whitespace-nowrap">
          <span className="font-mono text-xs text-white" dir="ltr">
            {partner.phone}
          </span>
          <span className="text-[11px] text-neutral-400">
            {partner.province} - {partner.city}
          </span>
        </div>
      ),
    },
    {
      key: "fieldOfActivity",
      header: "رسته تخصصی",
      hideOnMobile: true,
      className: "min-w-[180px]",
      cell: (partner) => (
        <div className="flex flex-col text-right">
          <span className="text-xs text-neutral-200 truncate max-w-[200px]">
            {partner.fieldOfActivity}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium">
            سابقه: {toPersianDigits(partner.experienceYears)} سال
          </span>
        </div>
      ),
    },
    {
      key: "creditLimit",
      header: "خط اعتباری (تومان)",
      sortable: true,
      className: "whitespace-nowrap w-40",
      cell: (partner) => (
        <div className="flex flex-col text-right whitespace-nowrap">
          <span className="font-mono font-bold text-xs text-emerald-400">
            {formatPrice(partner.approvedCreditLimit || partner.requestedCreditLimit)}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            درخواستی: {formatPrice(partner.requestedCreditLimit)}
          </span>
        </div>
      ),
    },
    {
      key: "documents",
      header: "اسناد و مدارک",
      hideOnMobile: true,
      className: "whitespace-nowrap w-28 text-center",
      cell: (partner) => {
        const docs = Array.isArray(partner.documents)
          ? partner.documents.filter((d: any) => d && typeof d === "object" && !Array.isArray(d))
          : [];
        const hasImages = docs.some((d: any) =>
          /\.(jpe?g|png|webp|svg)($|\?)/i.test(d.fileUrl || d.fileName || "")
        );
        return (
          <div className="flex items-center justify-center gap-1.5">
            {docs.length > 0 ? (
              <span className="text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-lg font-mono inline-flex items-center gap-1.5 font-bold">
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>{toPersianDigits(docs.length)} سند</span>
                {hasImages && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="دارای تصویر مدرک" />
                )}
              </span>
            ) : (
              <span className="text-[11px] text-neutral-500">فاقد سند</span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "وضعیت پرونده",
      className: "whitespace-nowrap w-36",
      cell: (partner) => renderStatusBadge(partner.status),
    },
    {
      key: "actions",
      header: "عملیات",
      className: "whitespace-nowrap w-44 text-left",
      cell: (partner) => {
        const isPending =
          partner.status === "PENDING" ||
          partner.status === "UNDER_REVIEW" ||
          (partner.status as string) === "pending_review";

        return (
          <div className="flex items-center gap-1.5 justify-end">
            {isPending ? (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenApproveModal(partner);
                }}
                className="h-8 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1 font-bold shadow-sm whitespace-nowrap"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>تایید سریع</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDetail(partner);
                }}
                className="h-8 px-2 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs gap-1 whitespace-nowrap"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>بررسی کامل</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(partner);
              }}
              className="h-8 w-8 p-0 text-neutral-400 hover:text-sky-400 hover:bg-neutral-800"
              title="ویرایش مشخصات"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDeleteModal(partner);
              }}
              className="h-8 w-8 p-0 text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
              title="حذف پرونده"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Custom Card Renderer complying with admin-data-views.md Rule #2
  const renderPartnerCard = (partner: AdminPartner) => {
    const isInd = partner.applicantType === "INDIVIDUAL";
    const isPending =
      partner.status === "PENDING" ||
      partner.status === "UNDER_REVIEW" ||
      (partner.status as string) === "pending_review";

    return (
      <div
        key={partner.id}
        onClick={() => handleOpenDetail(partner)}
        className="rounded-2xl border border-neutral-800 bg-[var(--theme-surface)]/80 hover:border-sky-500/40 p-4 sm:p-5 flex flex-col gap-3.5 transition-all shadow-md hover:shadow-lg cursor-pointer text-right group"
      >
        {/* Card Header: Primary Identifier & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                isInd
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  : "bg-sky-500/15 text-sky-400 border-sky-500/30"
              }`}
            >
              {isInd ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm truncate group-hover:text-sky-300 transition-colors">
                  {isInd
                    ? `${partner.fullName} ${partner.tradeName ? `(${partner.tradeName})` : ""}`
                    : partner.companyName || partner.fullName}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full border font-bold shrink-0 whitespace-nowrap ${
                    isInd
                      ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                      : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                  }`}
                >
                  {isInd ? "شخص حقیقی" : "حقوقی"}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 truncate">
                {isInd
                  ? `کد ملی: ${toPersianDigits(partner.nationalCode || "-")}`
                  : `شناسه ملی: ${toPersianDigits(partner.nationalCompanyId || "-")}`}
              </span>
            </div>
          </div>

          <div className="shrink-0">{renderStatusBadge(partner.status)}</div>
        </div>

        {/* Card Body: 2-column RTL Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-neutral-800/80 text-xs">
          <div>
            <span className="text-neutral-400 block text-[11px]">تماس و همراه:</span>
            <span className="font-mono text-white text-xs" dir="ltr">
              {partner.phone}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">موقعیت مکانی:</span>
            <span className="text-neutral-200 text-xs truncate block">
              {partner.province} - {partner.city}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-neutral-400 block text-[11px]">رسته تخصصی و سابقه:</span>
            <span className="text-neutral-300 text-xs truncate block">
              {partner.fieldOfActivity} ({toPersianDigits(partner.experienceYears)} سال)
            </span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">سقف خط اعتباری مصوب:</span>
            <span className="font-mono font-bold text-xs text-emerald-400">
              {formatPrice(partner.approvedCreditLimit || partner.requestedCreditLimit)}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 block text-[11px]">اعتبار درخواستی:</span>
            <span className="font-mono text-neutral-300 text-xs">
              {formatPrice(partner.requestedCreditLimit)}
            </span>
          </div>
        </div>

        {/* Card Footer: Action Footer with flex-nowrap and overflow-x-auto */}
        <div
          className="flex items-center gap-2 pt-3 border-t border-neutral-800/80 overflow-x-auto flex-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          {isPending ? (
            <Button
              size="sm"
              onClick={() => handleOpenApproveModal(partner)}
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 font-bold shadow-sm whitespace-nowrap shrink-0"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>تایید سریع</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenDetail(partner)}
              className="h-8 px-3 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs gap-1.5 whitespace-nowrap shrink-0"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>بررسی کامل</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenEditModal(partner)}
            className="h-8 px-2.5 border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs gap-1 whitespace-nowrap shrink-0"
          >
            <Pencil className="h-3.5 w-3.5 text-sky-400" />
            <span>ویرایش</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenDeleteModal(partner)}
            className="h-8 px-2.5 border-neutral-800 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 text-xs gap-1 whitespace-nowrap shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>حذف</span>
          </Button>
        </div>
      </div>
    );
  };

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
                  مدیریت درخواست‌های ارتقا به همکار (B2B)
                </h1>
                <span className="text-xs text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-semibold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>متصل به اندپوینت‌های واقعی بکند</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                ارزیابی درخواست‌های متقاضیان همکار اعم از اشخاص حقیقی (نصابان، تکنسین‌ها، فروشگاه‌های محلی) و اشخاص حقوقی (شرکت‌های ثبتی IT و دیتاسنتر)، تصویب خط اعتباری و تعیین رتبه همکاری B2B.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold h-9 px-3.5 shadow-md shadow-sky-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>ثبت دستی همکار جدید</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPartners()}
              className="text-xs gap-1.5 border-neutral-700 hover:bg-neutral-800 h-9"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>به‌روزرسانی</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <AdminStatsCards items={statCards} />

      {/* Filter Toolbar */}
      <AdminFilterToolbar
        searchPlaceholder="جستجو در نام متقاضی، نام شرکت، برند، کدملی، شناسه ملی یا شماره همراه..."
        searchQuery={searchQueryInput}
        onSearchChange={setSearchQueryInput}
        activeStatusTab={activeTab}
        onStatusTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        statusTabs={[
          { id: "all", label: "همه پرونده‌ها", count: stats.totalApplications },
          {
            id: "pending",
            label: "در انتظار بررسی",
            count: stats.pendingCount,
            badgeVariant: "orange",
          },
          {
            id: "need_docs",
            label: "نیازمند مدارک",
            count: stats.needDocsCount,
            badgeVariant: "purple",
          },
          {
            id: "approved",
            label: "همکاران تاییدشده",
            count: stats.approvedCount,
            badgeVariant: "emerald",
          },
          {
            id: "rejected",
            label: "رد صلاحیت",
            count: stats.rejectedCount,
            badgeVariant: "rose",
          },
        ]}
        secondaryFilters={
          <div className="flex items-center gap-1.5 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setApplicantTypeFilter("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                applicantTypeFilter === "all"
                  ? "bg-neutral-800 text-white font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              همه انواع ({toPersianDigits(stats.totalApplications)})
            </button>
            <button
              type="button"
              onClick={() => {
                setApplicantTypeFilter("individual");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                applicantTypeFilter === "individual"
                  ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30"
                  : "text-neutral-400 hover:text-purple-300"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>اشخاص حقیقی ({toPersianDigits(stats.individualCount)})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setApplicantTypeFilter("company");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                applicantTypeFilter === "company"
                  ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                  : "text-neutral-400 hover:text-sky-300"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>شرکت‌ها و اشخاص حقوقی ({toPersianDigits(stats.companyCount)})</span>
            </button>
          </div>
        }
        onExport={handleExport}
      />

      {/* Error Retry Notice */}
      {fetchError && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchPartners()}
            className="border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs h-8"
          >
            تلاش مجدد
          </Button>
        </div>
      )}

      {/* Data View with Card-First Priority & Server Pagination */}
      <AdminDataView
        data={partners}
        columns={columns}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        onRowClick={handleOpenDetail}
        defaultViewMode="cards"
        allowedViewModes={["cards", "list", "table"]}
        showViewModeToggle={true}
        storageKey="admin_partners_view_mode_pref"
        cardRenderer={renderPartnerCard}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        emptyMessage="هیچ پرونده همکاری مطابق با معیارهای انتخابی یافت نشد."
        emptySubtitle="کلمه جستجوی دیگری را وارد کنید یا فیلتر وضعیت و نوع متقاضی را تغییر دهید."
      />

      {/* Detail Slide-Over Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          selectedPartner
            ? selectedPartner.applicantType === "INDIVIDUAL"
              ? `پرونده حقیقی: ${selectedPartner.fullName}`
              : `پرونده حقوقی: ${selectedPartner.companyName || selectedPartner.fullName}`
            : "جزییات پرونده همکار"
        }
        subtitle={
          selectedPartner
            ? selectedPartner.applicantType === "INDIVIDUAL"
              ? `کد ملی: ${selectedPartner.nationalCode || "-"}`
              : `شناسه ملی: ${selectedPartner.nationalCompanyId || "-"}`
            : undefined
        }
        badge={
          selectedPartner?.status === "APPROVED" || (selectedPartner?.status as string) === "approved"
            ? "همکار تاییدشده"
            : selectedPartner?.status === "NEED_DOCS"
            ? "نیازمند مدارک"
            : selectedPartner?.status === "REJECTED" || (selectedPartner?.status as string) === "rejected"
            ? "رد صلاحیت"
            : "در انتظار بررسی"
        }
      >
        {isLoadingDetail && (
          <div className="flex items-center justify-center p-8 text-sky-400 text-xs gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>در حال دریافت تازه‌ترین اطلاعات از سرور...</span>
          </div>
        )}

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
            onNeedDocs={(partner) => {
              setIsDrawerOpen(false);
              handleOpenNeedDocsModal(partner);
            }}
            onEdit={(partner) => {
              setIsDrawerOpen(false);
              handleOpenEditModal(partner);
            }}
            onDelete={(partner) => {
              setIsDrawerOpen(false);
              handleOpenDeleteModal(partner);
            }}
          />
        )}
      </AdminDetailDrawer>

      {/* Approve Modal */}
      <AdminActionModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
        title="تایید صلاحیت همکار و فعال‌سازی خط اعتباری B2B"
        confirmLabel="تایید و فعال‌سازی پنل همکار"
        variant="success"
        isLoading={isProcessing}
      >
        {approvingPartner && (
          <div className="flex flex-col gap-4 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از تایید صلاحیت{" "}
              <strong className="text-white">
                «{approvingPartner.companyName || approvingPartner.fullName}»
              </strong>{" "}
              اطمینان دارید؟ با تایید این پرونده، نقش کاربر در سامانه به همکار تجاری B2B ارتقا می‌یابد.
            </p>

            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
              <div>
                <label className="text-neutral-400 block mb-1">تعیین رتبه همکار:</label>
                <select
                  value={approveTier}
                  onChange={(e) => setApproveTier(e.target.value as AdminPartnerTier)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="GOLD">همکار طلایی (بالاترین سقف اعتباری و حداکثر درصد تخفیف)</option>
                  <option value="SILVER">همکار نقره‌ای (تخفیف متوسط و تسویه اعتباری ۴۵ روزه)</option>
                  <option value="BRONZE">همکار برنزی (تخفیف همکار پایه و تسویه ۳۰ روزه)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">سقف خط اعتباری مصوب (تومان):</label>
                <input
                  type="number"
                  step={25000000}
                  dir="ltr"
                  value={approveCreditLimit}
                  onChange={(e) => setApproveCreditLimit(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white text-right focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-emerald-400 mt-1 block font-bold">
                  {formatPrice(approveCreditLimit)}
                </span>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">نام کارشناس فروش اختصاصی:</label>
                <input
                  type="text"
                  value={approveManager}
                  onChange={(e) => setApproveManager(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">یادداشت ارزیابی برای متقاضی:</label>
                <textarea
                  rows={2}
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}
      </AdminActionModal>

      {/* Reject Modal */}
      <AdminActionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        title="رد تقاضای عضویت همکار"
        confirmLabel="ثبت رد تقاضا"
        variant="danger"
        isLoading={isProcessing}
      >
        {rejectingPartner && (
          <div className="flex flex-col gap-3 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از رد پرونده{" "}
              <strong className="text-white">
                «{rejectingPartner.companyName || rejectingPartner.fullName}»
              </strong>{" "}
              اطمینان دارید؟ با رد پرونده، دسترسی‌های B2B احتمالی لغو خواهد شد.
            </p>
            <div>
              <label className="text-neutral-400 block mb-1">دلیل رد پرونده (جهت اطلاع متقاضی):</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-red-500/30 bg-neutral-950 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        )}
      </AdminActionModal>

      {/* Need Docs Modal */}
      <AdminActionModal
        isOpen={isNeedDocsModalOpen}
        onClose={() => setIsNeedDocsModalOpen(false)}
        onConfirm={handleConfirmNeedDocs}
        title="درخواست تکمیل یا اصلاح مدارک متقاضی"
        confirmLabel="ارسال پیام نقص مدرک"
        variant="warning"
        isLoading={isProcessing}
      >
        {needDocsPartner && (
          <div className="flex flex-col gap-3 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              ثبت وضعیت نقص مدارک برای{" "}
              <strong className="text-white">
                «{needDocsPartner.companyName || needDocsPartner.fullName}»
              </strong>:
            </p>
            <div>
              <label className="text-neutral-400 block mb-1">توضیح موارد نیازمند اصلاح یا بارگذاری مجدد:</label>
              <textarea
                rows={3}
                value={needDocsNotes}
                onChange={(e) => setNeedDocsNotes(e.target.value)}
                placeholder="مثال: تصویر کارت ملی یا پروانه کسب واضح نیست، لطفاً تصویر باکیفیت بارگذاری فرمایید..."
                className="w-full p-2.5 rounded-xl border border-amber-500/30 bg-neutral-950 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}
      </AdminActionModal>

      {/* Create Partner Modal */}
      <AdminActionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleConfirmCreate}
        title="ثبت دستی پرونده همکار B2B جدید"
        confirmLabel="ایجاد پرونده در سامانه"
        variant="info"
        isLoading={isProcessing}
      >
        <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right max-h-[70vh] overflow-y-auto pl-1">
          <div>
            <label className="text-neutral-400 block mb-1">نوع شخصیت متقاضی:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCreateType("INDIVIDUAL")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  createType === "INDIVIDUAL"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>شخص حقیقی (نصاب/تکنسین)</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateType("COMPANY")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  createType === "COMPANY"
                    ? "bg-sky-500/20 text-sky-300 border-sky-500/50"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>شخص حقوقی (شرکت ثبتی)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 block mb-1">
                {createType === "INDIVIDUAL" ? "نام و نام خانوادگی:" : "نام نماینده / مدیرعامل:"}
              </label>
              <input
                type="text"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                placeholder="مثال: مهندس احمدی"
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {createType === "COMPANY" ? (
              <div>
                <label className="text-neutral-400 block mb-1">نام رسمی شرکت (ثبتی):</label>
                <input
                  type="text"
                  value={createCompanyName}
                  onChange={(e) => setCreateCompanyName(e.target.value)}
                  placeholder="مثال: داده‌پردازان عصر نوین (سهامی خاص)"
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            ) : (
              <div>
                <label className="text-neutral-400 block mb-1">نام تجاری یا تابلو فروشگاه:</label>
                <input
                  type="text"
                  value={createTradeName}
                  onChange={(e) => setCreateTradeName(e.target.value)}
                  placeholder="مثال: خدمات شبکه ماهان"
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            <div>
              <label className="text-neutral-400 block mb-1">شماره همراه (شناسه ورود):</label>
              <input
                type="text"
                dir="ltr"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                placeholder="09120000000"
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">تلفن ثابت (اختیاری):</label>
              <input
                type="text"
                dir="ltr"
                value={createLandline}
                onChange={(e) => setCreateLandline(e.target.value)}
                placeholder="02188880000"
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">
                {createType === "INDIVIDUAL" ? "کد ملی (۱۰ رقم):" : "شناسه ملی شرکت (۱۱ رقم):"}
              </label>
              <input
                type="text"
                dir="ltr"
                value={createType === "INDIVIDUAL" ? createNationalCode : createNationalCompanyId}
                onChange={(e) =>
                  createType === "INDIVIDUAL"
                    ? setCreateNationalCode(e.target.value)
                    : setCreateNationalCompanyId(e.target.value)
                }
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">استان:</label>
              <input
                type="text"
                value={createProvince}
                onChange={(e) => setCreateProvince(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">شهر:</label>
              <input
                type="text"
                value={createCity}
                onChange={(e) => setCreateCity(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-neutral-400 block mb-1">نشانی پستی دقیق:</label>
              <input
                type="text"
                value={createAddress}
                onChange={(e) => setCreateAddress(e.target.value)}
                placeholder="تهران، خیابان ولیعصر..."
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">رسته تخصصی فعالیت:</label>
              <input
                type="text"
                value={createFieldOfActivity}
                onChange={(e) => setCreateFieldOfActivity(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">سابقه فعالیت (سال):</label>
              <input
                type="number"
                min={0}
                max={50}
                value={createExperienceYears}
                onChange={(e) => setCreateExperienceYears(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">سقف خط اعتباری درخواستی (تومان):</label>
              <input
                type="number"
                step={10000000}
                dir="ltr"
                value={createRequestedCredit}
                onChange={(e) => setCreateRequestedCredit(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white text-right focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">سقف خط اعتباری مصوب اولیه (تومان):</label>
              <input
                type="number"
                step={10000000}
                dir="ltr"
                value={createApprovedCredit}
                onChange={(e) => setCreateApprovedCredit(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white text-right focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">سطح اولیه همکاری:</label>
              <select
                value={createTier}
                onChange={(e) => setCreateTier(e.target.value as AdminPartnerTier)}
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="GOLD">همکار طلایی</option>
                <option value="SILVER">همکار نقره‌ای</option>
                <option value="BRONZE">همکار برنزی</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">وضعیت پرونده:</label>
              <select
                value={createStatus}
                onChange={(e) => setCreateStatus(e.target.value as AdminPartnerStatus)}
                className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="PENDING">در انتظار بررسی</option>
                <option value="APPROVED">تایید شده و فعال</option>
                <option value="NEED_DOCS">نیازمند مدارک</option>
                <option value="REJECTED">رد صلاحیت</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-neutral-400 block mb-1">توضیحات و نیازمندی متقاضی:</label>
              <textarea
                rows={2}
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                placeholder="توضیحات تکمیلی یا شرایط ویژه..."
                className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </AdminActionModal>

      {/* Edit Partner Modal */}
      <AdminActionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleConfirmEdit}
        title="ویرایش مشخصات پرونده همکار B2B"
        confirmLabel="ذخیره تغییرات"
        variant="info"
        isLoading={isProcessing}
      >
        {editingPartner && (
          <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right max-h-[70vh] overflow-y-auto pl-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-400 block mb-1">
                  {editingPartner.applicantType === "INDIVIDUAL" ? "نام و نام خانوادگی:" : "نام نماینده / مدیرعامل:"}
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {editingPartner.applicantType === "COMPANY" ? (
                <div>
                  <label className="text-neutral-400 block mb-1">نام رسمی شرکت (ثبتی):</label>
                  <input
                    type="text"
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-neutral-400 block mb-1">نام تجاری یا تابلو فروشگاه:</label>
                  <input
                    type="text"
                    value={editTradeName}
                    onChange={(e) => setEditTradeName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <div>
                <label className="text-neutral-400 block mb-1">شماره همراه:</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">تلفن ثابت:</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editLandline}
                  onChange={(e) => setEditLandline(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">
                  {editingPartner.applicantType === "INDIVIDUAL" ? "کد ملی:" : "شناسه ملی شرکت:"}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={editingPartner.applicantType === "INDIVIDUAL" ? editNationalCode : editNationalCompanyId}
                  onChange={(e) =>
                    editingPartner.applicantType === "INDIVIDUAL"
                      ? setEditNationalCode(e.target.value)
                      : setEditNationalCompanyId(e.target.value)
                  }
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">استان:</label>
                <input
                  type="text"
                  value={editProvince}
                  onChange={(e) => setEditProvince(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">شهر:</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-400 block mb-1">نشانی پستی دقیق:</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">رسته تخصصی فعالیت:</label>
                <input
                  type="text"
                  value={editFieldOfActivity}
                  onChange={(e) => setEditFieldOfActivity(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">سابقه فعالیت (سال):</label>
                <input
                  type="number"
                  min={0}
                  value={editExperienceYears}
                  onChange={(e) => setEditExperienceYears(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">سقف خط اعتباری مصوب (تومان):</label>
                <input
                  type="number"
                  step={10000000}
                  dir="ltr"
                  value={editApprovedCredit}
                  onChange={(e) => setEditApprovedCredit(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs font-mono text-white text-right focus:outline-none focus:border-sky-500"
                />
                <span className="text-[10px] text-emerald-400 mt-1 block">
                  {formatPrice(editApprovedCredit)}
                </span>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">سطح رتبه همکار:</label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value as AdminPartnerTier)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="GOLD">همکار طلایی</option>
                  <option value="SILVER">همکار نقره‌ای</option>
                  <option value="BRONZE">همکار برنزی</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">وضعیت پرونده:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AdminPartnerStatus)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="PENDING">در انتظار بررسی</option>
                  <option value="APPROVED">تایید شده و فعال</option>
                  <option value="NEED_DOCS">نیازمند مدارک</option>
                  <option value="REJECTED">رد صلاحیت</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">کارشناس اختصاصی پرونده:</label>
                <input
                  type="text"
                  value={editManager}
                  onChange={(e) => setEditManager(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-400 block mb-1">یادداشت ارزیابی کارشناس:</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        )}
      </AdminActionModal>

      {/* Delete Partner Modal */}
      <AdminActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف دائمی پرونده همکار"
        confirmLabel="حذف پرونده"
        variant="danger"
        isLoading={isProcessing}
      >
        {deletingPartner && (
          <div className="flex flex-col gap-3 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از حذف دائمی پرونده{" "}
              <strong className="text-white">
                «{deletingPartner.companyName || deletingPartner.fullName}»
              </strong>{" "}
              اطمینان دارید؟ این عملیات غیرقابل بازگشت است و رکورد متقاضی از دیتابیس حذف خواهد شد.
            </p>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
