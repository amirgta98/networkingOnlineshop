"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Plus,
  MapPin,
  User,
  Phone,
  Package,
  CheckCircle2,
  Edit2,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
  X,
  FileSpreadsheet,
  ArrowLeft,
  Globe2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import {
  partnerProjectsApi,
  type CreateProjectPayload,
  type UpdateProjectPayload,
} from "../api/partner-projects-api";
import type { PartnerProjectSite } from "../types/partner.types";

export function PartnerProjectsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromInternet = searchParams.get("from") === "internet";
  const actionParam = searchParams.get("action");

  const [sites, setSites] = React.useState<PartnerProjectSite[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Modals
  const [showAddSiteModal, setShowAddSiteModal] = React.useState(false);
  const [editingSite, setEditingSite] = React.useState<PartnerProjectSite | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Auto-open modal if action=new
  React.useEffect(() => {
    if (actionParam === "new") {
      setShowAddSiteModal(true);
    }
  }, [actionParam]);

  // Form State
  const [formName, setFormName] = React.useState("");
  const [formProvince, setFormProvince] = React.useState("تهران");
  const [formCity, setFormCity] = React.useState("تهران");
  const [formAddress, setFormAddress] = React.useState("");
  const [formSupervisor, setFormSupervisor] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formPostalCode, setFormPostalCode] = React.useState("");
  const [formPlaque, setFormPlaque] = React.useState("۱");
  const [formUnit, setFormUnit] = React.useState("");
  const [formDeliveryNotes, setFormDeliveryNotes] = React.useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const fetchSites = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await partnerProjectsApi.getMyProjects();
      setSites(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("[PartnerProjectsView] Failed to fetch sites:", err);
      setFetchError("خطا در فراخوانی کارگاه‌ها و سایت‌های پروژه از سرور.");
      setSites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchSites();
  }, [fetchSites]);

  const handleOpenAdd = () => {
    setEditingSite(null);
    setFormName("");
    setFormProvince("تهران");
    setFormCity("تهران");
    setFormAddress("");
    setFormSupervisor("");
    setFormPhone("");
    setFormPostalCode("");
    setFormPlaque("۱");
    setFormUnit("");
    setFormDeliveryNotes("");
    setShowAddSiteModal(true);
  };

  const handleOpenEdit = (site: PartnerProjectSite) => {
    setEditingSite(site);
    setFormName(site.name || site.title || "");
    setFormProvince(site.province || "تهران");
    setFormCity(site.city || "تهران");
    setFormAddress(site.address || site.detailedAddress || site.fullAddress || "");
    setFormSupervisor(site.supervisorName || site.recipientName || "");
    setFormPhone(site.supervisorPhone || site.phoneNumber || site.recipientMobile || "");
    setFormPostalCode(site.postalCode || "");
    setFormPlaque(site.plaque || site.buildingNumber || "۱");
    setFormUnit(site.unit || "");
    setFormDeliveryNotes(site.deliveryNotes || "");
    setShowAddSiteModal(true);
  };

  const handleSubmitSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) {
      showToast("عنوان و نشانی دقیق سایت پروژه الزامی است.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingSite) {
        const payload: UpdateProjectPayload = {
          title: formName.trim(),
          name: formName.trim(),
          province: formProvince.trim(),
          city: formCity.trim(),
          address: formAddress.trim(),
          detailedAddress: formAddress.trim(),
          fullAddress: formAddress.trim(),
          supervisorName: formSupervisor.trim() || "مهندس ناظر پروژه",
          recipientName: formSupervisor.trim() || "مهندس ناظر پروژه",
          supervisorPhone: formPhone.trim() || "09120000000",
          phoneNumber: formPhone.trim() || "09120000000",
          postalCode: formPostalCode.trim() || "1983963111",
          plaque: formPlaque.trim() || "۱",
          unit: formUnit.trim() || undefined,
          deliveryNotes: formDeliveryNotes.trim() || undefined,
        };
        await partnerProjectsApi.updateProject(editingSite.id, payload);
        showToast(`✅ سایت پروژه «${formName.trim()}» با موفقیت بروزرسانی شد.`);
      } else {
        const payload: CreateProjectPayload = {
          title: formName.trim(),
          name: formName.trim(),
          province: formProvince.trim(),
          city: formCity.trim(),
          address: formAddress.trim(),
          detailedAddress: formAddress.trim(),
          fullAddress: formAddress.trim(),
          supervisorName: formSupervisor.trim() || "مهندس ناظر پروژه",
          recipientName: formSupervisor.trim() || "مهندس ناظر پروژه",
          supervisorPhone: formPhone.trim() || "09120000000",
          phoneNumber: formPhone.trim() || "09120000000",
          postalCode: formPostalCode.trim() || "1983963111",
          plaque: formPlaque.trim() || "۱",
          unit: formUnit.trim() || undefined,
          deliveryNotes: formDeliveryNotes.trim() || undefined,
        };
        await partnerProjectsApi.createProject(payload);
        showToast(`✅ سایت پروژه «${formName.trim()}» با موفقیت ثبت گردید.`);
      }

      setShowAddSiteModal(false);
      await fetchSites();

      if (fromInternet) {
        showToast("✅ کارگاه ثبت شد! در حال هدایت به فرم سفارش اینترنت...");
        setTimeout(() => {
          router.push("/internet#internet-order-form-box");
        }, 1200);
      }
    } catch (err: any) {
      console.error("[PartnerProjectsView] Failed to save site:", err);
      showToast("❌ خطا در ذخیره سایت پروژه. لطفاً اطلاعات ورودی را بررسی فرمایید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSite = async (id: string, name: string) => {
    if (!confirm(`آیا از حذف سایت پروژه «${name}» اطمینان دارید؟`)) return;

    try {
      setIsDeleting(id);
      await partnerProjectsApi.deleteProject(id);
      showToast(`سایت پروژه «${name}» با موفقیت حذف شد.`);
      await fetchSites();
    } catch (err: any) {
      console.error("[PartnerProjectsView] Delete failed:", err);
      showToast("خطا در حذف سایت پروژه.");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredSites = React.useMemo(() => {
    if (!searchQuery.trim()) return sites;
    const q = searchQuery.toLowerCase().trim();
    return sites.filter((s) => {
      const matchName = (s.name || s.title || "").toLowerCase().includes(q);
      const matchCity = (s.city || "").toLowerCase().includes(q);
      const matchAddr = (s.address || s.fullAddress || "").toLowerCase().includes(q);
      const matchSuper = (s.supervisorName || "").toLowerCase().includes(q);
      return matchName || matchCity || matchAddr || matchSuper;
    });
  }, [sites, searchQuery]);

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 rounded-2xl bg-neutral-900/95 border border-sky-500/40 text-white px-5 py-3 shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-sky-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* From Internet Banner */}
      {fromInternet && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-sky-500/40 bg-gradient-to-r from-sky-950/40 via-neutral-900 to-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-lg animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                در حال ثبت کارگاه برای سفارش اینترنت سازمانی
              </h3>
              <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                اطلاعات واردشده شما در فرم خرید ذخیره شده است. پس از افزودن کارگاه، می‌توانید جهت نهایی‌سازی سفارش به صفحه خرید بازگردید.
              </p>
            </div>
          </div>
          <Link
            href="/internet#internet-order-form-box"
            className="flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold transition-all shadow-md whitespace-nowrap cursor-pointer"
          >
            <span>بازگشت به فرم خرید اینترنت</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">پروژه‌ها و مقاصد تحویل کارگاهی</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                تعریف سایت‌های اجرایی، کارگاه‌های نصب و دیتاسنترها جهت ارسال مستقیم تجهیزات به محل پروژه
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenAdd}
            className="bg-sky-600 hover:bg-sky-500 text-white gap-2 text-xs cursor-pointer shadow-lg shadow-sky-600/25"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن سایت / پروژه جدید</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-neutral-400">
          تعداد سایت‌های فعال: <strong className="font-mono text-white">{toPersianDigits(sites.length)}</strong> سایت کارگاهی
        </span>

        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="جستجوی عنوان سایت، شهر، نشانی یا مهندس ناظر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500/60"
          />
        </div>
      </div>

      {/* Sites Grid */}
      {isLoading ? (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
          <span className="text-xs text-neutral-400">در حال فراخوانی نشانی‌ها و کارگاه‌های پروژه...</span>
        </div>
      ) : fetchError ? (
        <div className="rounded-3xl border border-rose-500/30 bg-[var(--theme-surface)] p-12 text-center flex flex-col items-center justify-center gap-3">
          <AlertCircle className="h-8 w-8 text-rose-400" />
          <span className="text-xs text-rose-300 font-medium">{fetchError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchSites()}
            className="text-xs border-neutral-700 text-white mt-2"
          >
            تلاش مجدد
          </Button>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-white">هیچ سایتی تعریف نشده است</h3>
          <p className="text-xs text-neutral-400 max-w-sm">
            {searchQuery
              ? "سایت کارگاهی منطبق با عبارت جستجو پیدا نشد."
              : "برای تعریف مقاصد تحویل پروژه‌ای، کارگاه‌های نصب و دیتاسنترها جهت ارسال مستقیم تجهیزات، از دکمه «افزودن سایت / پروژه جدید» استفاده فرمایید."}
          </p>
          <Button
            onClick={handleOpenAdd}
            className="bg-sky-600 hover:bg-sky-500 text-white gap-2 text-xs mt-2"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن اولین سایت پروژه</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm hover:border-sky-500/30 transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{site.name || site.title}</span>
                    <span className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      شهر: {site.city} {site.province && site.province !== site.city ? `(${site.province})` : ""}
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-sky-500/10 text-sky-300 border-sky-500/30">
                    {site.tagLabel || "سایت تحویل مستقیم"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col gap-2 text-xs">
                  <div className="flex items-start gap-1.5 text-neutral-300">
                    <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed line-clamp-2">
                      {site.address || site.detailedAddress || site.fullAddress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1.5 border-t border-neutral-800">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-neutral-400" />
                      <span>{site.supervisorName || site.recipientName || "مهندس ناظر"}</span>
                    </span>
                    <span className="font-mono text-white flex items-center gap-1">
                      <Phone className="h-3 w-3 text-neutral-400" />
                      <span>{toPersianDigits(site.supervisorPhone || site.phoneNumber || site.recipientMobile || "")}</span>
                    </span>
                  </div>

                  {site.deliveryNotes && (
                    <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-800/50">
                      راهنمای تحویل: {site.deliveryNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    کد پستی: {toPersianDigits(site.postalCode || "—")}
                  </span>

                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                    {toPersianDigits(site.activeOrdersCount || 0)} سفارش جاری
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(site)}
                    className="text-sky-400 hover:text-sky-300 p-1 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>ویرایش</span>
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting === site.id}
                    onClick={() => handleDeleteSite(site.id, site.name || site.title || "سایت")}
                    className="text-rose-400 hover:text-rose-300 p-1 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {isDeleting === site.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>حذف سایت</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Site Modal */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-sky-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  {editingSite ? "ویرایش مشخصات سایت پروژه" : "افزودن سایت / مقصد پروژه جدید"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSiteModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-xl bg-neutral-900 border border-neutral-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSite} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-neutral-300 font-semibold">عنوان یا نام سایت / کارگاه پروژه (الزامی):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دیتاسنتر پالایشگاه - اتاق سرور مرکزی"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-semibold">استان:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تهران"
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-semibold">شهر محل پروژه:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تهران / اصفهان"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-neutral-300 font-semibold">نشانی کامل پستی کارگاه / انبار تحویل (الزامی):</label>
                <textarea
                  rows={2}
                  required
                  placeholder="نشانی دقیق، خیابان، پلاک، نام سوله یا اتاق سرور..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-semibold">پلاک / شماره سوله:</label>
                  <input
                    type="text"
                    placeholder="مثال: ۱۲"
                    value={formPlaque}
                    onChange={(e) => setFormPlaque(e.target.value)}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-semibold">واحد / طبقه:</label>
                  <input
                    type="text"
                    placeholder="مثال: اتاق رک ۴"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-semibold">نام مهندس ناظر / تحویل‌گیرنده:</label>
                  <input
                    type="text"
                    placeholder="مثال: مهندس حسینی"
                    value={formSupervisor}
                    onChange={(e) => setFormSupervisor(e.target.value)}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300 font-semibold">شماره تماس مستقیم ناظر:</label>
                  <input
                    type="text"
                    placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono text-left"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-neutral-300 font-semibold">کد پستی ۱۰ رقمی محل پروژه:</label>
                <input
                  type="text"
                  placeholder="مثال: ۱۹۸۳۹۶۳۱۱۱"
                  value={formPostalCode}
                  onChange={(e) => setFormPostalCode(e.target.value)}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono text-left"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-neutral-300 font-semibold">راهنمای تحویل بار / هماهنگی حراست:</label>
                <input
                  type="text"
                  placeholder="مثال: نیاز به بالابر یا هماهنگی قبلی با حراست شهرک"
                  value={formDeliveryNotes}
                  onChange={(e) => setFormDeliveryNotes(e.target.value)}
                  className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddSiteModal(false)}
                  className="cursor-pointer"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-500 text-white cursor-pointer px-5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-1.5" />
                      <span>در حال ذخیره...</span>
                    </>
                  ) : (
                    <span>{editingSite ? "ذخیره تغییرات سایت" : "ثبت سایت پروژه"}</span>
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
