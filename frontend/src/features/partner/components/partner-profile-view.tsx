"use client";

import * as React from "react";
import {
  FileCheck2,
  CheckCircle2,
  MapPin,
  Landmark,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { profileApi } from "@/features/dashboard/api/profile-api";
import { UserProfileData } from "@/features/dashboard/types/profile.types";
import { detectBankFromCardNumber, formatCardNumberSpaces, formatShebaSpaces } from "@/features/dashboard/components/wallet-view";

export function PartnerProfileView() {
  const { user } = useAuth();

  const [profile, setProfile] = React.useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Bank Form State directly on-page
  const [bankFormData, setBankFormData] = React.useState({
    cardNumber: "",
    shebaNumber: "",
    bankName: "",
    accountHolderName: "",
  });
  const [isSavingBank, setIsSavingBank] = React.useState<boolean>(false);
  const [bankError, setBankError] = React.useState<string | null>(null);
  const [bankSuccessMsg, setBankSuccessMsg] = React.useState<string | null>(null);

  const loadProfile = React.useCallback(async () => {
    setIsLoading(true);
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("velox_dashboard_profile_v2");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.shebaNumber) {
            setProfile(parsed);
            setBankFormData({
              cardNumber: parsed.cardNumber || "",
              shebaNumber: parsed.shebaNumber || "",
              bankName: parsed.bankName || "",
              accountHolderName: parsed.accountHolderName || parsed.fullName || "",
            });
          }
        }
      } catch {}
    }
    try {
      const data = await profileApi.getProfile();
      if (data) {
        setProfile(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("velox_dashboard_profile_v2", JSON.stringify(data));
        }
        setBankFormData({
          cardNumber: data.cardNumber || "",
          shebaNumber: data.shebaNumber || "",
          bankName: data.bankName || "",
          accountHolderName: data.accountHolderName || data.fullName || "",
        });
      }
    } catch (err) {
      console.warn("Error fetching partner profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const companyName = profile?.companyName || user?.companyName || "ثبت نشده";
  const brandName = profile?.fullName || user?.name || "ثبت نشده";
  const nationalId = profile?.nationalCode || user?.nationalId ? toPersianDigits(profile?.nationalCode || user?.nationalId || "") : "ثبت نشده";
  const officialPhone = profile?.companyPhone || profile?.mobileNumber || user?.phone ? toPersianDigits(profile?.companyPhone || profile?.mobileNumber || user?.phone || "") : "ثبت نشده";
  const officialEmail = profile?.email || user?.email || "ثبت نشده";
  const officialAddress = profile?.companyAddress || "ثبت نشده";

  const registeredSheba = profile?.shebaNumber?.trim();
  const registeredCard = profile?.cardNumber?.trim();
  const registeredBankName = profile?.bankName?.trim() || (registeredCard ? detectBankFromCardNumber(registeredCard).name : "بانک مقصد");
  const registeredHolder = profile?.accountHolderName?.trim() || profile?.fullName || "ثبت نشده";
  const hasRegisteredBank = Boolean(registeredSheba && registeredSheba.length >= 26);

  const detectedBank = React.useMemo(() => {
    return detectBankFromCardNumber(bankFormData.cardNumber);
  }, [bankFormData.cardNumber]);

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankError(null);
    setBankSuccessMsg(null);

    const cleanCard = bankFormData.cardNumber.replace(/[\s-]/g, "").replace(/\D/g, "");
    let cleanSheba = bankFormData.shebaNumber.toUpperCase().replace(/[\s-]/g, "");
    if (cleanSheba && !cleanSheba.startsWith("IR")) {
      cleanSheba = "IR" + cleanSheba.replace(/^IR/i, "");
    }

    if (!cleanSheba || cleanSheba.length !== 26 || !/^IR\d{24}$/.test(cleanSheba)) {
      setBankError("شماره شبا باید با پیشوند IR آغاز شده و دارای ۲۴ رقم عددی باشد.");
      return;
    }

    if (cleanCard && cleanCard.length !== 16) {
      setBankError("شماره کارت بانکی شتاب باید دقیقاً ۱۶ رقم باشد.");
      return;
    }

    setIsSavingBank(true);
    try {
      const updated = await profileApi.updateProfile({
        shebaNumber: cleanSheba,
        cardNumber: cleanCard || undefined,
        bankName: bankFormData.bankName.trim() || detectedBank.name,
        accountHolderName: bankFormData.accountHolderName.trim() || brandName,
      });

      if (typeof window !== "undefined") {
        try {
          const current = localStorage.getItem("velox_dashboard_profile_v2");
          const merged = current ? { ...JSON.parse(current), ...updated } : updated;
          localStorage.setItem("velox_dashboard_profile_v2", JSON.stringify(merged));
        } catch {}
      }

      setBankSuccessMsg("مشخصات حساب بانکی و شماره شبا با موفقیت در پروفایل شما ثبت گردید. این شماره شبا برای کلیه درخواست‌های برداشت شما استفاده خواهد شد.");
      await loadProfile();
      setTimeout(() => {
        setBankSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      setBankError(err.message || "خطا در ذخیره مشخصات حساب بانکی.");
    } finally {
      setIsSavingBank(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">مشخصات شرکت و مدارک حقوقی ثبتی</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                اطلاعات احراز هویت شرکتی، روزنامه رسمی، کد اقتصادی و حساب بانکی پیش‌فرض جهت تسویه مطالبات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>احراز هویت همکار سازمانی ✓</span>
          </span>
        </div>
      </div>

      {/* ── Direct Bank & Sheba Registration Section (Always on-page) ── */}
      <div className="rounded-3xl border border-sky-500/30 bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">اطلاعات حساب بانکی و شماره شبا جهت تسویه و برداشت کیف پول</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                این شماره شبا برای تمامی درخواست‌های تسویه شما در پنل کیف پول اعمال خواهد شد و نیازی به ورود آن در هر درخواست نیست.
              </p>
            </div>
          </div>
          {hasRegisteredBank ? (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCircle2 className="h-4 w-4" />
              <span>شماره شبا فعال و تایید شده</span>
            </span>
          ) : (
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-bold self-start sm:self-auto">
              نیاز به ثبت شماره شبا
            </span>
          )}
        </div>

        <form onSubmit={handleBankSubmit} className="flex flex-col gap-5">
          {bankError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {bankError}
            </div>
          )}

          {bankSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{bankSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sheba input */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  شماره شبا بانکی (با پیشوند IR و ۲۴ رقم عددی): <span className="text-rose-400">*</span>
                </label>
                {registeredSheba && (
                  <span className="text-[10px] text-sky-400 font-mono font-bold">
                    ثبت فعلی: {formatShebaSpaces(registeredSheba)}
                  </span>
                )}
              </div>
              <input
                type="text"
                dir="ltr"
                value={bankFormData.shebaNumber}
                onChange={(e) => {
                  let val = e.target.value.toUpperCase().replace(/[\s-]/g, "");
                  if (val && !val.startsWith("IR")) val = "IR" + val.replace(/^IR/i, "");
                  setBankFormData((prev) => ({ ...prev, shebaNumber: val.slice(0, 26) }));
                }}
                placeholder="IR..."
                required
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-sm font-mono text-sky-400 font-bold text-left tracking-wider focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Card input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  شماره کارت بانکی (۱۶ رقم شتاب):
                </label>
                {bankFormData.cardNumber.replace(/\D/g, "").length >= 6 && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${detectedBank.color}`}>
                    {detectedBank.name}
                  </span>
                )}
              </div>
              <input
                type="text"
                dir="ltr"
                value={bankFormData.cardNumber}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[\s-]/g, "").slice(0, 16);
                  setBankFormData((prev) => ({ ...prev, cardNumber: raw }));
                }}
                placeholder="۶۰۳۷۹۹۱۱..."
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-sm font-mono text-white text-left tracking-wider focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                نام بانک صادرکننده:
              </label>
              <input
                type="text"
                value={bankFormData.bankName}
                onChange={(e) => setBankFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                placeholder={detectedBank.name !== "شبکه بانکی شتاب" ? detectedBank.name : "مثال: بانک سامان، ملت..."}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Account Holder Name */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                نام و نام خانوادگی صاحب حساب (حقوقی یا نماینده):
              </label>
              <input
                type="text"
                value={bankFormData.accountHolderName}
                onChange={(e) => setBankFormData((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                placeholder={companyName || brandName || "نام صاحب حساب"}
                className="w-full h-11 px-3.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Legal disclaimer */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-bold text-amber-300">هشدار سلب مسئولیت:</span>
              <span className="text-amber-200/90 font-medium">
                اگر شماره کارت یا شبا اشتباه وارد شده بود سایت هیچ مسئولیتی ندارد.
              </span>
              <span className="text-[11px] text-neutral-400">
                این شماره شبا برای کلیه درخواست‌های برداشت از کیف پول همکار ثبت و استفاده می‌شود و مبالغ واریز شده به حساب‌های اشتباه قابل استرداد نخواهند بود.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="default"
              size="sm"
              isLoading={isSavingBank}
              disabled={isSavingBank}
              className="font-bold bg-sky-600 hover:bg-sky-500 text-white px-6 h-10"
            >
              ذخیره و ثبت مشخصات حساب بانکی همکار
            </Button>
          </div>
        </form>
      </div>

      {/* Corporate Registration Details */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
        <h3 className="font-bold text-white text-base border-b border-neutral-800 pb-3 flex items-center justify-between">
          <span>مشخصات شناسنامه‌ای و ثبتی شرکت</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">نام کامل ثبتی شرکت:</span>
            <span className="text-white font-bold">{companyName}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">نام رابط / نماینده:</span>
            <span className="text-neutral-200 font-bold">{brandName}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">شناسه ملی / کد ملی:</span>
            <span className="text-white font-mono font-bold tracking-wider">{nationalId}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">شماره تماس مستقیم:</span>
            <span className="text-white font-mono font-bold">{officialPhone}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">ایمیل رسمی:</span>
            <span className="text-white font-mono font-bold">{officialEmail}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px]">سطح همکاری سازمانی:</span>
            <span className="text-sky-400 font-bold">همکار رسمی ققنوس آکادمی</span>
          </div>
        </div>

        {/* Address info */}
        <div className="grid grid-cols-1 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-1">
            <span className="text-neutral-400 text-[11px] flex items-center gap-1">
              <MapPin className="h-3 w-3 text-sky-400" />
              <span>نشانی رسمی و قانونی:</span>
            </span>
            <span className="text-neutral-200 leading-relaxed font-medium">{officialAddress}</span>
          </div>
        </div>
      </div>

      {/* Uploaded Legal Documents Status */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">وضعیت اسناد و مدارک حقوقی</h3>
        </div>

        <div className="p-8 text-center text-neutral-400 bg-neutral-900/30 rounded-2xl border border-neutral-800">
          <p className="text-sm font-semibold text-white">مدارک حقوقی همکار سازمانی تایید گردید</p>
          <p className="text-xs text-neutral-500 mt-1">
            جهت ارسال نسخه جدید روزنامه رسمی یا تغییر اطلاعات نمایندگی شرکت، با واحد امور حقوقی در ارتباط باشید.
          </p>
        </div>
      </div>
    </div>
  );
}
