"use client";

import * as React from "react";
import {
  Building2,
  FileCheck,
  CreditCard,
  Percent,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Send,
  User,
  Wrench,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ExternalLink,
  ChevronLeft,
  X,
  FileDown,
} from "lucide-react";
import { useDashboardUpgradePartner } from "../hooks/use-dashboard-upgrade-partner";
import type {
  PartnerApplicantType,
  PartnerApplicationData,
  PartnerDocumentItem,
} from "../types/upgrade-partner.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardStatusBadge,
  FileUploadBox,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

const FIELD_OF_ACTIVITIES = [
  "پسیو شبکه، کابل‌کشی ساخت‌یافته و ترانکینگ",
  "سوییچینگ، روتینگ و زیرساخت اکتیو (سیسکو، میکروتیک)",
  "دوربین‌های مداربسته، نظارت تصویری و هوشمندسازی",
  "فیبر نوری (فیوژن، مفصل‌بندی و تست فلوک)",
  "تجهیزات رادیویی و لینک‌های وایرلس ماکروویو",
  "فروشگاه قطعات و توزیع تجهیزات شبکه و کامپیوتر",
  "دیتاسنتر، اتاق سرور و تجهیز رک‌های استاندارد",
  "خدمات IT، مجازی‌سازی و نگهداری شبکه سازمان‌ها",
  "سایر زمینه‌های تخصصی شبکه و مخابرات",
];

const PROVINCES = [
  "تهران",
  "اصفهان",
  "خراسان رضوی",
  "فارس",
  "آذربایجان شرقی",
  "خوزستان",
  "مازندران",
  "البرز",
  "گیلان",
  "کرمان",
  "قم",
  "مرکزی",
  "یزد",
  "هرمزگان",
  "کرمانشاه",
  "همدان",
  "سایر استان‌ها",
];

export function UpgradePartnerView() {
  const {
    application,
    isPartner,
    isLoaded,
    isLoading,
    isSubmitting,
    error,
    submitApplication,
    uploadFile,
  } = useDashboardUpgradePartner();

  // Switcher: INDIVIDUAL vs COMPANY
  const [applicantType, setApplicantType] = React.useState<PartnerApplicantType>("INDIVIDUAL");

  // Common Fields
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [landlinePhone, setLandlinePhone] = React.useState("");
  const [province, setProvince] = React.useState("تهران");
  const [city, setCity] = React.useState("تهران");
  const [address, setAddress] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [fieldOfActivity, setFieldOfActivity] = React.useState(FIELD_OF_ACTIVITIES[0]);
  const [experienceYears, setExperienceYears] = React.useState<number>(3);
  const [estimatedMonthlyPurchase, setEstimatedMonthlyPurchase] = React.useState<number>(30000000);
  const [requestedCreditLimit, setRequestedCreditLimit] = React.useState<number>(50000000);
  const [websiteOrSocial, setWebsiteOrSocial] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Individual Fields
  const [nationalCode, setNationalCode] = React.useState("");
  const [tradeName, setTradeName] = React.useState("");
  const [businessLicenseNumber, setBusinessLicenseNumber] = React.useState("");

  // Company Fields
  const [companyName, setCompanyName] = React.useState("");
  const [companyType, setCompanyType] = React.useState("private_joint_stock");
  const [nationalCompanyId, setNationalCompanyId] = React.useState("");
  const [economicCode, setEconomicCode] = React.useState("");
  const [registrationNumber, setRegistrationNumber] = React.useState("");
  const [establishedYear, setEstablishedYear] = React.useState("");
  const [ceoOrAgentName, setCeoOrAgentName] = React.useState("");
  const [agentPosition, setAgentPosition] = React.useState("مدیرعامل");

  // Documents state
  const [documents, setDocuments] = React.useState<PartnerDocumentItem[]>([]);
  const [uploadingDocType, setUploadingDocType] = React.useState<string | null>(null);

  // UI state
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [showEditForm, setShowEditForm] = React.useState<boolean>(false);

  // Populate state when application loads
  React.useEffect(() => {
    if (application) {
      setApplicantType(application.applicantType || "INDIVIDUAL");
      setFullName(application.fullName || "");
      setPhone(application.phone || "");
      setLandlinePhone(application.landlinePhone || "");
      setProvince(application.province || "تهران");
      setCity(application.city || "تهران");
      setAddress(application.address || "");
      setPostalCode(application.postalCode || "");
      setFieldOfActivity(application.fieldOfActivity || FIELD_OF_ACTIVITIES[0]);
      setExperienceYears(application.experienceYears ?? 3);
      setEstimatedMonthlyPurchase(application.estimatedMonthlyPurchase ?? 30000000);
      setRequestedCreditLimit(application.requestedCreditLimit ?? 50000000);
      setWebsiteOrSocial(application.websiteOrSocial || "");
      setNotes(application.notes || "");

      // Individual
      setNationalCode(application.nationalCode || "");
      setTradeName(application.tradeName || "");
      setBusinessLicenseNumber(application.businessLicenseNumber || "");

      // Company
      setCompanyName(application.companyName || "");
      setCompanyType(application.companyType || "private_joint_stock");
      setNationalCompanyId(application.nationalCompanyId || "");
      setEconomicCode(application.economicCode || "");
      setRegistrationNumber(application.registrationNumber || "");
      setEstablishedYear(application.establishedYear || "");
      setCeoOrAgentName(application.ceoOrAgentName || "");
      setAgentPosition(application.agentPosition || "مدیرعامل");

      const rawDocs = application.documents;
      const safeDocs: PartnerDocumentItem[] = Array.isArray(rawDocs)
        ? (rawDocs as any[]).flat().filter((d) => d && typeof d === "object" && !Array.isArray(d) && (d.title || d.fileName || d.fileUrl))
        : [];
      setDocuments(safeDocs);
    }
  }, [application]);

  const handleFileUpload = async (type: string, title: string, file: File) => {
    setUploadingDocType(type);
    setFormError(null);
    try {
      const res = await uploadFile(file);
      const newDoc: PartnerDocumentItem = {
        id: `doc-${Date.now()}`,
        title,
        type,
        fileName: res.fileName,
        fileUrl: res.fileUrl,
        fileSize: res.fileSize || `${((res.size || file.size) / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleDateString("fa-IR"),
      };
      setDocuments((prev) => [
        ...prev.filter((d) => d && typeof d === "object" && !Array.isArray(d) && d.type !== type),
        newDoc,
      ]);
    } catch (err: any) {
      setFormError(err?.message || "خطا در آپلود فایل. لطفاً دوباره تلاش کنید.");
    } finally {
      setUploadingDocType(null);
    }
  };

  const removeDoc = (type: string) => {
    setDocuments((prev) => prev.filter((d) => d && typeof d === "object" && !Array.isArray(d) && d.type !== type));
  };

  const getDoc = (type: string) =>
    documents.find((d) => d && typeof d === "object" && !Array.isArray(d) && d.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!fullName.trim()) {
      setFormError("لطفاً نام و نام خانوادگی را وارد نمایید.");
      return;
    }
    if (!phone.trim()) {
      setFormError("لطفاً شماره تلفن همراه را وارد نمایید.");
      return;
    }
    if (!address.trim()) {
      setFormError("لطفاً آدرس دقیق محل فعالیت را وارد نمایید.");
      return;
    }

    if (applicantType === "INDIVIDUAL") {
      if (!nationalCode.trim()) {
        setFormError("لطفاً کد ملی ۱۰ رقمی را وارد نمایید.");
        return;
      }
      if (nationalCode.trim().length !== 10) {
        setFormError("کد ملی باید دقیقاً ۱۰ رقم باشد.");
        return;
      }
    } else {
      if (!companyName.trim()) {
        setFormError("لطفاً نام رسمی شرکت را وارد نمایید.");
        return;
      }
      if (!nationalCompanyId.trim()) {
        setFormError("لطفاً شناسه ملی ۱۱ رقمی شرکت را وارد نمایید.");
        return;
      }
      if (!economicCode.trim()) {
        setFormError("لطفاً کد اقتصادی ۱۲ رقمی را وارد نمایید.");
        return;
      }
      if (!ceoOrAgentName.trim()) {
        setFormError("لطفاً نام مدیرعامل یا نماینده رسمی را وارد نمایید.");
        return;
      }
    }

    const cleanDocs: PartnerDocumentItem[] = documents
      .filter((d) => d && typeof d === "object" && !Array.isArray(d) && (d.title || d.fileName || d.fileUrl))
      .map((d) => ({
        id: d.id || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: d.title,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        type: d.type,
        fileSize: d.fileSize || "1.0 MB",
        uploadedAt: d.uploadedAt || new Date().toLocaleDateString("fa-IR"),
      }));

    try {
      await submitApplication({
        applicantType,
        fullName,
        phone,
        landlinePhone,        province,
        city,
        address,
        postalCode,
        fieldOfActivity,
        experienceYears,
        estimatedMonthlyPurchase,
        requestedCreditLimit,
        websiteOrSocial,
        notes,
        nationalCode: applicantType === "INDIVIDUAL" ? nationalCode : undefined,
        tradeName: applicantType === "INDIVIDUAL" ? tradeName : undefined,
        businessLicenseNumber: applicantType === "INDIVIDUAL" ? businessLicenseNumber : undefined,
        companyName: applicantType === "COMPANY" ? companyName : undefined,
        companyType: applicantType === "COMPANY" ? companyType : undefined,
        nationalCompanyId: applicantType === "COMPANY" ? nationalCompanyId : undefined,
        economicCode: applicantType === "COMPANY" ? economicCode : undefined,
        registrationNumber: applicantType === "COMPANY" ? registrationNumber : undefined,
        establishedYear: applicantType === "COMPANY" ? establishedYear : undefined,
        ceoOrAgentName: applicantType === "COMPANY" ? ceoOrAgentName : undefined,
        agentPosition: applicantType === "COMPANY" ? agentPosition : undefined,
        officialGazetteFileUrl: getDoc("official_gazette")?.fileUrl,
        officialGazetteFileName: getDoc("official_gazette")?.fileName,
        taxClearanceFileUrl: getDoc("tax_certificate")?.fileUrl,
        taxClearanceFileName: getDoc("tax_certificate")?.fileName,
        documents: cleanDocs,
      });

      setToastMsg("درخواست ارتقا به همکار با موفقیت در سامانه ثبت و در نوبت ارزیابی قرار گرفت.");
      setShowEditForm(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setToastMsg(null), 6000);
    } catch (err: any) {
      setFormError(err?.message || "خطا در ثبت درخواست. لطفاً بررسی و مجدداً تلاش فرمایید.");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success" as const;
      case "NEED_DOCS":
        return "warning" as const;
      case "REJECTED":
        return "danger" as const;
      case "UNDER_REVIEW":
        return "info" as const;
      default:
        return "neutral" as const;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "تایید شده و فعال (همکار رسمی)";
      case "UNDER_REVIEW":
        return "در حال ارزیابی کارشناس و استعلام بانکی";
      case "NEED_DOCS":
        return "نیازمند تکمیل یا اصلاح مدارک";
      case "REJECTED":
        return "عدم احراز شرایط همکاری";
      case "PENDING":
      default:
        return "در انتظار بررسی اولیه کارشناسان";
    }
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="درخواست ارتقا به همکار تجاری (حقیقی و حقوقی)"
        description="دسترسی به تخفیف‌های ویژه همکار، دریافت خط اعتباری تا ۵۰۰ میلیون تومان، تسویه با چک صیادی و فاکتور رسمی سامانه مودیان"
        icon={Building2}
        badge="طرح حمایتی همکاران و نصابان"
        badgeVariant="sky"
      />

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {error && !application && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="سقف اعتبار تجاری B2B"
          value={formatPrice(500000000)}
          subtitle="تسویه اعتباری با سررسید ۳۰ الی ۹۰ روزه"
          icon={CreditCard}
          variant="sky"
        />

        <DashboardMetricCard
          title="تخفیف پلکانی همکار"
          value="تا ۲۵٪ تخفیف"
          subtitle="سوییچ سیسکو، کابل نکسنس، رک و متعلقات"
          icon={Percent}
          variant="emerald"
        />

        <DashboardMetricCard
          title="پشتیبانی از نصابان و شرکت‌ها"
          value="حقیقی و حقوقی"
          subtitle="پذیرش کارت نصابی، پروانه کسب و روزنامه رسمی"
          icon={FileCheck}
          variant="purple"
        />
      </div>

      {/* ── 3. Application Status Card (If exists) ────────────────── */}
      {application && !showEditForm && (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 sm:p-6 shadow-sm flex flex-col gap-4 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--theme-border-color)] pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                  application.status === "APPROVED"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : application.status === "NEED_DOCS"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : application.status === "REJECTED"
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    : "bg-sky-500/15 text-sky-400 border-sky-500/30"
                }`}
              >
                {application.applicantType === "INDIVIDUAL" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {application.applicantType === "INDIVIDUAL"
                      ? `${application.fullName} ${
                          application.tradeName ? `(${application.tradeName})` : ""
                        }`
                      : application.companyName || application.fullName}
                  </h3>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      application.applicantType === "INDIVIDUAL"
                        ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                        : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                    }`}
                  >
                    {application.applicantType === "INDIVIDUAL"
                      ? "شخص حقیقی / نصاب"
                      : "شخص حقوقی / شرکتی"}
                  </span>
                </div>
                <span className="text-xs text-neutral-400 mt-0.5 block">
                  {application.fieldOfActivity} | سابقه: {toPersianDigits(application.experienceYears)} سال
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DashboardStatusBadge
                label={getStatusLabel(application.status)}
                variant={getStatusBadgeVariant(application.status)}
              />
            </div>
          </div>

          {/* If Approved Banner */}
          {application.status === "APPROVED" && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300 block text-sm">
                    عضویت طلایی شما در شبکه همکاران فعال گردید!
                  </span>
                  <span className="text-neutral-300 mt-0.5 block">
                    سقف خط اعتباری مصوب:{" "}
                    <strong className="text-white font-mono">
                      {formatPrice(application.approvedCreditLimit || application.requestedCreditLimit)}
                    </strong>{" "}
                    | رتبه همکار:{" "}
                    <strong className="text-amber-300">
                      {application.tier === "GOLD"
                        ? "همکار طلایی"
                        : application.tier === "SILVER"
                        ? "همکار نقره‌ای"
                        : "همکار برنزی"}
                    </strong>
                  </span>
                </div>
              </div>
              {application.assignedAccountManager && (
                <div className="text-neutral-300 text-[11px] bg-neutral-900/60 px-3 py-1.5 rounded-xl border border-neutral-800">
                  <span>کارشناس اختصاصی: </span>
                  <strong className="text-white">{application.assignedAccountManager}</strong>
                </div>
              )}
            </div>
          )}

          {/* Reviewer Notes if any */}
          {application.reviewerNotes && (
            <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
              <strong className="text-sky-300 block mb-1">پیام و گزارش کارشناس ارزیابی:</strong>
              <p>{application.reviewerNotes}</p>
            </div>
          )}

          {/* Grid Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 block mb-1">
                {application.applicantType === "INDIVIDUAL" ? "کد ملی متقاضی:" : "شناسه ملی شرکت:"}
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {application.nationalCode || application.nationalCompanyId
                  ? toPersianDigits(application.nationalCode || application.nationalCompanyId || "")
                  : "ثبت نشده"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 block mb-1">
                {application.applicantType === "INDIVIDUAL" ? "شماره پروانه / مجوز:" : "کد اقتصادی ۱۲ رقمی:"}
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {application.businessLicenseNumber || application.economicCode
                  ? toPersianDigits(application.businessLicenseNumber || application.economicCode || "")
                  : "ثبت نشده"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 block mb-1">سقف اعتبار درخواستی:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formatPrice(application.requestedCreditLimit)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80">
              <span className="text-[11px] text-neutral-400 block mb-1">شهر و استان محل فعالیت:</span>
              <span className="font-bold text-neutral-200 text-sm">
                {application.province} - {application.city}
              </span>
            </div>
          </div>

          {/* Documents uploaded */}
          {documents.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-neutral-400 block mb-2">
                مدارک و اسناد بارگذاری‌شده ({toPersianDigits(documents.length)} مدرک):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {documents.map((doc, idx) => {
                  const isImage = Boolean(
                    (doc.fileUrl && (doc.fileUrl.startsWith("data:image") || doc.fileUrl.startsWith("blob:") || /\.(jpe?g|png|webp|svg)($|\?)/i.test(doc.fileUrl))) ||
                    (doc.fileName && /\.(jpe?g|png|webp|svg)$/i.test(doc.fileName))
                  );
                  return (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isImage && doc.fileUrl ? (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="relative group shrink-0"
                            title="مشاهده تصویر"
                          >
                            <img
                              src={doc.fileUrl}
                              alt={doc.title}
                              className="h-10 w-10 rounded-xl object-cover border border-neutral-700 group-hover:border-sky-500 transition-colors shadow-xs"
                            />
                          </a>
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-sky-400" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-white font-medium truncate">{doc.title}</span>
                          <span className="text-[10px] text-neutral-400 font-mono truncate">{doc.fileName}</span>
                        </div>
                      </div>

                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-sky-400 hover:bg-neutral-800 transition-colors"
                          title="مشاهده یا دانلود"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action to Edit */}
          <div className="flex justify-end pt-3 border-t border-[var(--theme-border-color)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditForm(true)}
              className="text-xs font-bold gap-2"
            >
              <Briefcase className="h-4 w-4" />
              <span>ویرایش یا ارسال مجدد پرونده</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── 4. Four-Step Roadmap ──────────────────────────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs text-right">
        <h3 className="text-sm font-bold text-[var(--theme-foreground)] mb-4">
          مراحل ۴ گانه احراز صلاحیت و فعال‌سازی پنل همکاران:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              step: "۱",
              title: "انتخاب هویت و ثبت مشخصات",
              desc: "تعیین شخص حقیقی (نصاب/متخصص) یا حقوقی (شرکت ثبتی)",
              done: !!application,
              active: !application,
            },
            {
              step: "۲",
              title: "بارگذاری مدارک هویتی و شغلی",
              desc: "کارت ملی، پروانه کسب یا روزنامه رسمی و گواهی ارزش افزوده",
              done: documents.length > 0,
              active: !!application && documents.length === 0,
            },
            {
              step: "۳",
              title: "ارزیابی و اعتبارسنجی",
              desc: "استعلام خوش‌حسابی، بررسی سوابق و استعلام بانکی",
              done: application?.status === "APPROVED",
              active: application?.status === "PENDING" || application?.status === "UNDER_REVIEW",
            },
            {
              step: "۴",
              title: "اعطای رتبه و خط اعتباری",
              desc: "فعال‌سازی تخفیف همکار، امکان خرید چکی و تسویه اعتباری",
              done: application?.status === "APPROVED",
              active: false,
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border text-xs flex flex-col gap-1.5 transition-all ${
                s.active
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-300"
                  : s.done
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-neutral-800 bg-neutral-900/40 text-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs">مرحله {s.step}</span>
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : s.active ? (
                  <Clock className="h-4 w-4 text-sky-400 animate-pulse" />
                ) : null}
              </div>
              <span className="font-bold text-neutral-200">{s.title}</span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Main Form (Initial submission or Edit mode) ─────────── */}
      {(!application || showEditForm) && (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs text-right flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--theme-border-color)] pb-4">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-orange-400 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-[var(--theme-foreground)]">
                  {application ? "ویرایش و تکمیل پرونده همکاری" : "فرم درخواست عضویت در باشگاه همکاران B2B"}
                </h3>
                <span className="text-xs text-neutral-400">
                  لطفاً با توجه به ساختار فعالیت خود، نوع هویت متقاضی را مشخص فرمایید
                </span>
              </div>
            </div>

            {application && showEditForm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEditForm(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                انصراف و بستن فرم
              </Button>
            )}
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* ── 5.1 Applicant Type Switcher (Radio Cards) ─────────── */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-2.5">
              نوع متقاضی همکاری را انتخاب کنید:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Individual Card */}
              <div
                onClick={() => setApplicantType("INDIVIDUAL")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  applicantType === "INDIVIDUAL"
                    ? "border-orange-500 bg-orange-500/10 shadow-sm"
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    applicantType === "INDIVIDUAL"
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      شخص حقیقی (نصاب، کارشناس شبکه، فروشگاه محلی)
                    </span>
                    {applicantType === "INDIVIDUAL" && (
                      <CheckCircle2 className="h-4 w-4 text-orange-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                    بدون نیاز به ثبت شرکت؛ مناسب تکنسین‌های پسیو/اکتیو، نصابان دوربین و فروشگاه‌های دارای پروانه کسب یا کارت صنفی
                  </span>
                </div>
              </div>

              {/* Company Card */}
              <div
                onClick={() => setApplicantType("COMPANY")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  applicantType === "COMPANY"
                    ? "border-sky-500 bg-sky-500/10 shadow-sm"
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    applicantType === "COMPANY"
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      شخص حقوقی (شرکت ثبتی، سازمان، پیمانکار IT)
                    </span>
                    {applicantType === "COMPANY" && (
                      <CheckCircle2 className="h-4 w-4 text-sky-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                    دارای شناسه ملی ۱۱ رقمی، کد اقتصادی ۱۲ رقمی، روزنامه رسمی، صدور صورتحساب الکترونیکی سامانه مودیان و خط اعتباری بالا
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* ── 5.2 Specific Identity Section ───────────────────── */}
            {applicantType === "INDIVIDUAL" ? (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-xs border-b border-neutral-800 pb-2">
                  <User className="h-4 w-4" />
                  <span>مشخصات فردی و مجوزهای شغلی متقاضی حقیقی:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      نام و نام خانوادگی <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: کامران رستمی"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      کد ملی ۱۰ رقمی <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      maxLength={10}
                      placeholder="0012345678"
                      value={nationalCode}
                      onChange={(e) => setNationalCode(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      نام تابلوی فروشگاه / برند کاری (اختیاری):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: خدمات شبکه و دوربین رستمی"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      شماره پروانه کسب / کارت نظام صنفی (اختیاری):
                    </label>
                    <input
                      type="text"
                      placeholder="شماره مجوز اتحادیه الکترونیک یا رایانه"
                      value={businessLicenseNumber}
                      onChange={(e) => setBusinessLicenseNumber(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      سابقه فعالیت تخصصی:
                    </label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value={1}>۱ الی ۲ سال (نوپا)</option>
                      <option value={3}>۳ الی ۵ سال (متوسط)</option>
                      <option value={7}>۵ الی ۱۰ سال (حرفه‌ای)</option>
                      <option value={12}>بیش از ۱۰ سال (پیشکسوت)</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs border-b border-neutral-800 pb-2">
                  <Building2 className="h-4 w-4" />
                  <span>اطلاعات ثبتی و قانونی شرکت (شخص حقوقی):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      نام کامل و ثبتی شرکت <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: داده‌پردازی امن ارتباطات پیشرو"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      نوع شرکت:
                    </label>
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="private_joint_stock">سهامی خاص</option>
                      <option value="limited_liability">با مسئولیت محدود</option>
                      <option value="knowledge_based">دانش‌بنیان / فناور</option>
                      <option value="cooperative">تعاونی / موسسه</option>
                      <option value="other">سایر اشکال حقوقی</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      شناسه ملی ۱۱ رقمی <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      maxLength={11}
                      placeholder="14008765432"
                      value={nationalCompanyId}
                      onChange={(e) => setNationalCompanyId(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      کد اقتصادی ۱۲ رقمی <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="411654329871"
                      value={economicCode}
                      onChange={(e) => setEconomicCode(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      شماره ثبت شرکت:
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="548912"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      نام مدیرعامل یا نماینده رسمی <span className="text-rose-400">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: دکتر سعید ابراهیمی"
                      value={ceoOrAgentName}
                      onChange={(e) => {
                        setCeoOrAgentName(e.target.value);
                        setFullName(e.target.value);
                      }}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      سمت نماینده:
                    </label>
                    <input
                      type="text"
                      placeholder="مدیرعامل / مدیر خرید / مدیر فنی"
                      value={agentPosition}
                      onChange={(e) => setAgentPosition(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      سال تأسیس:
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="مثال: 1396"
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── 5.3 Contact & Location Section ──────────────────── */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs border-b border-neutral-800 pb-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>اطلاعات تماس و نشانی محل فعالیت:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    تلفن همراه <span className="text-rose-400">*</span>:
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="09121234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    تلفن ثابت / تماس دوم:
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    placeholder="02188776655"
                    value={landlinePhone}
                    onChange={(e) => setLandlinePhone(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    استان:
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    شهر:
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    آدرس دقیق محل فعالیت / دفتر <span className="text-rose-400">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="خیابان، پلاک، طبقه، واحد"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    کد پستی ۱۰ رقمی:
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={10}
                    placeholder="1234567890"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* ── 5.4 Activity & Credit Line Section ──────────────── */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs border-b border-neutral-800 pb-2">
                <Briefcase className="h-4 w-4 text-purple-400" />
                <span>حوزه تخصصی و برآورد اعتباری:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    رسته اصلی فعالیت شبکه:
                  </label>
                  <select
                    value={fieldOfActivity}
                    onChange={(e) => setFieldOfActivity(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    {FIELD_OF_ACTIVITIES.map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    میزان خرید ماهانه تقریبی (تومان):
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    step={10000000}
                    value={estimatedMonthlyPurchase}
                    onChange={(e) => setEstimatedMonthlyPurchase(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    {formatPrice(estimatedMonthlyPurchase)}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    سقف خط اعتباری پیشنهادی (تومان):
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    step={25000000}
                    value={requestedCreditLimit}
                    onChange={(e) => setRequestedCreditLimit(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white text-right focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-emerald-400 mt-1 block font-bold">
                    {formatPrice(requestedCreditLimit)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    وبسایت رسمی، صفحه اینستاگرام یا لینک رزومه:
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="https://... یا instagram.com/..."
                    value={websiteOrSocial}
                    onChange={(e) => setWebsiteOrSocial(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    توضیحات تکمیلی یا نیازهای خاص پروژه:
                  </label>
                  <input
                    type="text"
                    placeholder="شرح پروژه‌ها، تجهیزات خاص مورد نیاز و..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* ── 5.5 Document Uploads ────────────────────────────── */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs">
                  <UploadCloud className="h-4 w-4 text-sky-400" />
                  <span>
                    بارگذاری اسناد و مدارک {applicantType === "INDIVIDUAL" ? "هویتی و مهارتی" : "حقوقی و ثبتی"}:
                  </span>
                </div>
                {uploadingDocType && (
                  <span className="text-[11px] text-sky-400 animate-pulse">
                    در حال ارسال فایل به سرور...
                  </span>
                )}
              </div>

              {applicantType === "INDIVIDUAL" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileUploadBox
                    label="تصویر کارت ملی هوشمند متقاضی (الزامی):"
                    description="تصویر واضح روی کارت ملی (حداکثر ۱۵ مگابایت)"
                    acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                    selectedFileName={getDoc("national_card")?.fileName || null}
                    fileUrl={getDoc("national_card")?.fileUrl || null}
                    isLoading={uploadingDocType === "national_card"}
                    onFileSelect={() => {}}
                    onFilesSelect={(files) => {
                      if (files[0]) handleFileUpload("national_card", "تصویر کارت ملی", files[0]);
                    }}
                    onFileRemove={() => removeDoc("national_card")}
                  />

                  <FileUploadBox
                    label="تصویر پروانه کسب، کارت نظام صنفی یا مدرک تخصصی (اختیاری):"
                    description="مجوز کسب، گواهی دوره‌های شبکه یا معرفی‌نامه"
                    acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                    selectedFileName={getDoc("business_license")?.fileName || null}
                    fileUrl={getDoc("business_license")?.fileUrl || null}
                    isLoading={uploadingDocType === "business_license"}
                    onFileSelect={() => {}}
                    onFilesSelect={(files) => {
                      if (files[0]) handleFileUpload("business_license", "پروانه کسب یا مدرک مهارت", files[0]);
                    }}
                    onFileRemove={() => removeDoc("business_license")}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FileUploadBox
                    label="روزنامه رسمی آگهی تأسیس یا تغییرات:"
                    description="صفحه اول روزنامه رسمی شرکت ثبتی"
                    acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                    selectedFileName={getDoc("official_gazette")?.fileName || null}
                    fileUrl={getDoc("official_gazette")?.fileUrl || null}
                    isLoading={uploadingDocType === "official_gazette"}
                    onFileSelect={() => {}}
                    onFilesSelect={(files) => {
                      if (files[0]) handleFileUpload("official_gazette", "آگهی روزنامه رسمی", files[0]);
                    }}
                    onFileRemove={() => removeDoc("official_gazette")}
                  />

                  <FileUploadBox
                    label="گواهی ثبت‌نام ارزش افزوده یا مفاصا:"
                    description="گواهی سامانه مودیان یا مالیاتی"
                    acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                    selectedFileName={getDoc("tax_certificate")?.fileName || null}
                    fileUrl={getDoc("tax_certificate")?.fileUrl || null}
                    isLoading={uploadingDocType === "tax_certificate"}
                    onFileSelect={() => {}}
                    onFilesSelect={(files) => {
                      if (files[0]) handleFileUpload("tax_certificate", "گواهی ارزش افزوده", files[0]);
                    }}
                    onFileRemove={() => removeDoc("tax_certificate")}
                  />

                  <FileUploadBox
                    label="تصویر کارت ملی مدیرعامل / نماینده:"
                    description="کارت ملی نماینده تام‌الاختیار"
                    acceptedExtensions=".jpg,.jpeg,.png,.pdf"
                    selectedFileName={getDoc("ceo_national_card")?.fileName || null}
                    fileUrl={getDoc("ceo_national_card")?.fileUrl || null}
                    isLoading={uploadingDocType === "ceo_national_card"}
                    onFileSelect={() => {}}
                    onFilesSelect={(files) => {
                      if (files[0]) handleFileUpload("ceo_national_card", "کارت ملی مدیرعامل", files[0]);
                    }}
                    onFileRemove={() => removeDoc("ceo_national_card")}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-3 border-t border-[var(--theme-border-color)]">
              <Button
                type="submit"
                disabled={isSubmitting || !!uploadingDocType}
                variant="default"
                className="w-full sm:w-auto font-bold gap-2 justify-center px-6 h-11"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>در حال ثبت و ارسال به سرور...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>
                      {application ? "ذخیره و ارسال مجدد پرونده" : "ثبت پرونده و ارسال جهت ارزیابی اعتباری"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
