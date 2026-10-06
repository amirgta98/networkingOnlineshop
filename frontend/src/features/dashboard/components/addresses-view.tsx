"use client";

import * as React from "react";
import {
  MapPin,
  Plus,
  Building,
  Home,
  CheckCircle2,
  Trash2,
  Edit2,
  Phone,
  User,
  Compass,
  Star,
  AlertCircle,
} from "lucide-react";
import { useDashboardAddresses } from "../hooks/use-dashboard-addresses";
import { DashboardAddress, AddressTag } from "../types/addresses.types";
import { PROVINCES_AND_CITIES } from "@/features/checkout/api/checkout-api";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardEmptyState,
  DashboardModal,
  ConfirmDialog,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

export function AddressesView() {
  const {
    addresses,
    isLoaded,
    setDefaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
  } = useDashboardAddresses();

  // Modal form state
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingAddress, setEditingAddress] = React.useState<DashboardAddress | null>(null);

  // Delete dialog state
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = React.useState("");
  const [tag, setTag] = React.useState<AddressTag>("central_office");
  const [recipientName, setRecipientName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [province, setProvince] = React.useState("تهران");
  const [city, setCity] = React.useState("تهران");
  const [fullAddress, setFullAddress] = React.useState("");
  const [buildingNumber, setBuildingNumber] = React.useState("");
  const [unit, setUnit] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [deliveryNotes, setDeliveryNotes] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Synchronize cities when province changes
  const availableCities = React.useMemo(() => {
    return PROVINCES_AND_CITIES[province] || PROVINCES_AND_CITIES["تهران"] || [];
  }, [province]);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setTitle("دفتر جدید");
    setTag("central_office");
    setRecipientName("مهندس عرفان رضایی");
    setPhoneNumber("09121234567");
    setProvince("تهران");
    setCity("تهران");
    setFullAddress("");
    setBuildingNumber("");
    setUnit("");
    setPostalCode("");
    setDeliveryNotes("");
    setIsDefault(addresses.length === 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: DashboardAddress) => {
    setEditingAddress(addr);
    setTitle(addr.title);
    setTag(addr.tag);
    setRecipientName(addr.recipientName);
    setPhoneNumber(addr.phoneNumber);
    setProvince(addr.province);
    setCity(addr.city);
    setFullAddress(addr.fullAddress);
    setBuildingNumber(addr.buildingNumber);
    setUnit(addr.unit || "");
    setPostalCode(addr.postalCode);
    setDeliveryNotes(addr.deliveryNotes || "");
    setIsDefault(addr.isDefault);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProv = e.target.value;
    setProvince(newProv);
    const cities = PROVINCES_AND_CITIES[newProv] || [];
    setCity(cities[0] || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("لطفاً عنوان نشانی را وارد فرمایید.");
      return;
    }
    if (!recipientName.trim()) {
      setFormError("لطفاً نام تحویل‌گیرنده را وارد فرمایید.");
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError("لطفاً شماره تماس را وارد فرمایید.");
      return;
    }
    if (!fullAddress.trim()) {
      setFormError("لطفاً آدرس پستی دقیق را وارد فرمایید.");
      return;
    }
    if (!postalCode.trim() || postalCode.replace(/\D/g, "").length < 10) {
      setFormError("کد پستی باید حداقل ۱۰ رقم معتبر باشد.");
      return;
    }

    const tagLabels: Record<AddressTag, string> = {
      central_office: "دفتر مرکزی",
      warehouse: "انبار مرکزی",
      project_site: "سایت پروژه",
      residence: "سکونت",
    };

    const payload = {
      title,
      tag,
      tagLabel: tagLabels[tag],
      recipientName,
      phoneNumber,
      province,
      city,
      fullAddress,
      buildingNumber,
      unit,
      postalCode,
      deliveryNotes,
      isDefault,
    };

    if (editingAddress) {
      updateAddress(editingAddress.id, payload);
    } else {
      addAddress(payload);
    }

    setIsModalOpen(false);
  };

  const defaultAddr = addresses.find((a) => a.isDefault);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="آدرس‌ها و اطلاعات تحویل"
        description="مدیریت نشانی دفاتر، انبارها و سایت‌های اجرای پروژه جهت ارسال سریع با ناوگان اختصاصی، تیپاکس و باربری سنگین"
        icon={MapPin}
        badge={`${toPersianDigits(addresses.length)} نشانی ثبت‌شده`}
        badgeVariant="sky"
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={handleOpenAddModal}
            className="text-xs gap-1.5 font-bold cursor-pointer shadow-md shadow-orange-500/15"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ ثبت نشانی جدید</span>
          </Button>
        }
      />

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="نشانی‌های ثبت شده در سیستم"
          value={
            <span>
              {toPersianDigits(addresses.length)}{" "}
              <span className="text-xs font-normal text-neutral-400">موقعیت مکانی</span>
            </span>
          }
          subtitle="دارای مشخصات کامل تحویل‌گیرنده"
          icon={MapPin}
          variant="sky"
        />

        <DashboardMetricCard
          title="نشانی پیش‌فرض تحویل سریع"
          value={
            <span className="truncate text-base sm:text-lg">
              {defaultAddr?.title || "تعیین نشده"}
            </span>
          }
          subtitle={defaultAddr ? `${defaultAddr.city} - ${defaultAddr.recipientName}` : "لطفاً یک آدرس را به عنوان پیش‌فرض انتخاب کنید"}
          icon={Star}
          variant="orange"
        />

        <DashboardMetricCard
          title="پوشش لجستیک و انبارها"
          value="سراسر کشور"
          subtitle="تیپاکس، باربری ریلی/زمینی و پیک هوایی"
          icon={Building}
          variant="emerald"
        />
      </div>

      {/* ── 3. Addresses Cards Grid ───────────────────────────────── */}
      {addresses.length === 0 ? (
        <DashboardEmptyState
          icon={MapPin}
          title="هیچ نشانی ثبت نشده است"
          description="برای ارسال سفارش‌ها و تجهیزات شبکه، لطفاً حداقل یک نشانی معتبر به همراه نام تحویل‌گیرنده و کد پستی ثبت فرمایید."
          actionLabel="+ افزودن اولین آدرس"
          onActionClick={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-3xl border transition-all p-5 sm:p-6 flex flex-col justify-between gap-5 text-right ${
                addr.isDefault
                  ? "border-orange-500/40 bg-gradient-to-br from-orange-500/5 via-[var(--theme-surface)] to-[var(--theme-surface)] shadow-md shadow-orange-500/5 ring-1 ring-orange-500/20"
                  : "border-[var(--theme-border-color)] bg-[var(--theme-surface)] hover:border-neutral-700/80"
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                      addr.isDefault
                        ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                    }`}
                  >
                    <Building className="h-5 w-5" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--theme-foreground)] leading-snug">
                        {addr.title}
                      </h3>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 shrink-0">
                        {addr.tagLabel}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 mt-0.5">
                      {addr.province} - {addr.city}
                    </span>
                  </div>
                </div>

                <div className="flex items-center self-start sm:self-center shrink-0 pt-1 sm:pt-0">
                  {addr.isDefault ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/30">
                      <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                      <span>نشانی پیش‌فرض</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-xs text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer py-0.5"
                    >
                      تنظیم به عنوان پیش‌فرض
                    </button>
                  )}
                </div>
              </div>

              {/* Full Address Info */}
              <div className="flex flex-col gap-2.5 text-xs text-neutral-300 bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800/60">
                <p className="leading-relaxed text-neutral-200 break-words">
                  {addr.fullAddress}
                  {addr.buildingNumber && ` • پلاک ${toPersianDigits(addr.buildingNumber)}`}
                  {addr.unit && ` • واحد ${toPersianDigits(addr.unit)}`}
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/60">
                  <span className="font-mono">
                    کد پستی: {toPersianDigits(addr.postalCode)}
                  </span>
                  <span>• تحویل‌گیرنده: {addr.recipientName}</span>
                  <span className="font-mono">• تماس: {toPersianDigits(addr.phoneNumber)}</span>
                </div>

                {addr.deliveryNotes && (
                  <div className="text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 mt-1 leading-relaxed">
                    <span className="font-semibold text-neutral-300">راهنمای باربری/پیک:</span>{" "}
                    {addr.deliveryNotes}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-xs">
                <button
                  type="button"
                  onClick={() => setDeletingId(addr.id)}
                  className="flex items-center gap-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer py-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>حذف نشانی</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditModal(addr)}
                    className="text-xs gap-1.5 border-neutral-700 hover:bg-neutral-800 text-neutral-200 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>ویرایش جزئیات</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 4. Add / Edit Address Modal ────────────────────────────── */}
      <DashboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? "ویرایش نشانی تحویل" : "ثبت نشانی تحویل جدید"}
        description="مشخصات موقعیت مکانی و تحویل‌گیرنده جهت ارسال تجهیزات شبکه"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right" dir="rtl">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                عنوان نشانی (مانند دفتر مرکزی، انبار، پروژه):
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: دفتر مرکزی ولنجک"
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نوع محل:
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as AddressTag)}
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="central_office">دفتر مرکزی / ستاد</option>
                <option value="warehouse">انبار مرکزی کالا</option>
                <option value="project_site">سایت اجرای پروژه شبکه</option>
                <option value="residence">سکونت شخص</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نام و نام خانوادگی تحویل‌گیرنده:
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="نام مسئول تحویل کالا"
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                شماره موبایل هماهنگی تحویل:
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912..."
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                استان:
              </label>
              <select
                value={province}
                onChange={handleProvinceChange}
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {Object.keys(PROVINCES_AND_CITIES).map((p) => (
                  <option key={p} value={p}>
                    {p.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                شهر:
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              نشانی پستی دقیق:
            </label>
            <textarea
              rows={2}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="خیابان اصلی، خیابان فرعی، کوچه، بن‌بست..."
              className="w-full p-2.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                پلاک:
              </label>
              <input
                type="text"
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                واحد / طبقه:
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                کد پستی ۱۰ رقمی:
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                maxLength={10}
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              توضیحات و راهنمای تحویل (اختیاری):
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="مثلاً: هماهنگی با حراست، نیاز به بالابر برای رک ۴۲ یونیت"
              className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultCheckbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 text-orange-500 focus:ring-orange-500/40 bg-neutral-900 cursor-pointer"
            />
            <label htmlFor="isDefaultCheckbox" className="text-xs text-neutral-300 cursor-pointer">
              تنظیم این نشانی به عنوان آدرس پیش‌فرض تحویل سفارش‌ها
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="font-bold"
            >
              {editingAddress ? "ذخیره تغییرات" : "ثبت و افزودن نشانی"}
            </Button>
          </div>
        </form>
      </DashboardModal>

      {/* ── 5. Confirm Delete Dialog ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            deleteAddress(deletingId);
            setDeletingId(null);
          }
        }}
        title="حذف نشانی"
        message="آیا از حذف این نشانی اطمینان دارید؟ در صورت حذف، دیگر امکان ارسال به این آدرس وجود نخواهد داشت."
        confirmLabel="حذف نشانی"
        cancelLabel="انصراف"
        variant="danger"
      />
    </div>
  );
}
