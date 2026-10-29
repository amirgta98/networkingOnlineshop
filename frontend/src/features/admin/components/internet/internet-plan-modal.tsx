"use client";

import * as React from "react";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Wifi,
  DollarSign,
  Layers,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { InternetPlan, NightTrafficType } from "@/features/internet/types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface InternetPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (planData: Partial<InternetPlan>) => Promise<void>;
  plan?: InternetPlan | null;
}

export function InternetPlanModal({
  isOpen,
  onClose,
  onSave,
  plan,
}: InternetPlanModalProps) {
  const isEditing = Boolean(plan?.id);

  const [title, setTitle] = React.useState("");
  const [badge, setBadge] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [monthlyPrice, setMonthlyPrice] = React.useState<number>(2000000);
  const [sortOrder, setSortOrder] = React.useState<number>(0);
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  // Traffic
  const [isInternationalUnlimited, setIsInternationalUnlimited] = React.useState(true);
  const [internationalTraffic, setInternationalTraffic] = React.useState<number>(500);

  const [isDomesticUnlimited, setIsDomesticUnlimited] = React.useState(true);
  const [domesticTraffic, setDomesticTraffic] = React.useState<number>(1500);

  const [nightTraffic, setNightTraffic] = React.useState<NightTrafficType>("NORMAL");

  // Discounts
  const [discountThreeMonths, setDiscountThreeMonths] = React.useState<number>(0);
  const [discountSixMonths, setDiscountSixMonths] = React.useState<number>(0);
  const [discountYearly, setDiscountYearly] = React.useState<number>(20);

  // Features
  const [features, setFeatures] = React.useState<string[]>([]);
  const [newFeature, setNewFeature] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Sync state when plan changes or modal opens
  React.useEffect(() => {
    if (plan) {
      setTitle(plan.title || plan.name || "");
      setBadge(plan.badge || "");
      setDescription(plan.description || plan.recommendedFor || "");
      setMonthlyPrice(plan.monthlyPrice || plan.basePricePerMonth || 2000000);
      setSortOrder(plan.sortOrder || 0);
      setIsFeatured(Boolean(plan.isFeatured || plan.popular));
      setIsActive(plan.isActive !== undefined ? plan.isActive : true);

      setIsInternationalUnlimited(plan.internationalTraffic === null || plan.internationalTraffic === undefined);
      setInternationalTraffic(plan.internationalTraffic || 500);

      setIsDomesticUnlimited(plan.domesticTraffic === null || plan.domesticTraffic === undefined);
      setDomesticTraffic(plan.domesticTraffic || 1500);

      setNightTraffic(plan.nightTraffic || (plan.nightTrafficFree ? "FREE_BUSINESS" : "NORMAL"));

      setDiscountThreeMonths(plan.discountThreeMonths || 0);
      setDiscountSixMonths(plan.discountSixMonths || 0);
      setDiscountYearly(plan.discountYearly !== undefined ? plan.discountYearly : 20);

      setFeatures(Array.isArray(plan.features) ? [...plan.features] : []);
    } else {
      setTitle("");
      setBadge("");
      setDescription("");
      setMonthlyPrice(2000000);
      setSortOrder(0);
      setIsFeatured(false);
      setIsActive(true);
      setIsInternationalUnlimited(true);
      setInternationalTraffic(500);
      setIsDomesticUnlimited(true);
      setDomesticTraffic(1500);
      setNightTraffic("NORMAL");
      setDiscountThreeMonths(0);
      setDiscountSixMonths(5);
      setDiscountYearly(20);
      setFeatures([
        "پایداری و آپتایم ۹۹.۹٪ با پشتیبانی NOC",
        "پشتیبانی از پروتکل‌های سازمانی و روتینگ BGP",
      ]);
    }
    setNewFeature("");
    setErrorMsg(null);
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    if (features.includes(trimmed)) return;
    setFeatures([...features, trimmed]);
    setNewFeature("");
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("لطفاً عنوان پلن را وارد نمایید.");
      return;
    }

    if (monthlyPrice <= 0) {
      setErrorMsg("قیمت ماهانه باید مقداری مثبت باشد.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        badge: badge.trim() || null,
        description: description.trim() || null,
        monthlyPrice,
        sortOrder: Number(sortOrder) || 0,
        isFeatured,
        isActive,
        internationalTraffic: isInternationalUnlimited ? null : Number(internationalTraffic),
        domesticTraffic: isDomesticUnlimited ? null : Number(domesticTraffic),
        nightTraffic,
        discountThreeMonths: Number(discountThreeMonths) || 0,
        discountSixMonths: Number(discountSixMonths) || 0,
        discountYearly: Number(discountYearly) || 0,
        features,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "خطایی در ذخیره‌سازی پلن رخ داد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-neutral-800 bg-[#141418] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Wifi className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {isEditing ? "ویرایش پلن اینترنت" : "ایجاد پلن جدید اینترنت سازمانی"}
              </h3>
              <p className="text-xs text-neutral-400">
                مشخصات فنی، ترافیک، تعرفه ماهانه و تخفیف‌های دوره‌ای
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>اطلاعات عمومی و شناسنامه پلن</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  عنوان پلن <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: فیبر نوری سازمانی توربو الترا"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  نشان یا بج ویژه (اختیاری)
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="مثال: پیشنهاد ویژه سازمانی، اقتصادی"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                توضیحات و کاربرد پیشنهادی
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیح کوتاه درباره جامعه هدف، کیفیت خط، و پایداری..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600 transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Traffic Specs */}
          <div className="space-y-4 pt-2 border-t border-neutral-800/80">
            <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5" />
              <span>مشخصات ترافیک و حجم ماهیانه</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* International Traffic */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">ترافیک بین‌الملل:</span>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternationalUnlimited}
                      onChange={(e) => setIsInternationalUnlimited(e.target.checked)}
                      className="rounded border-neutral-700 bg-neutral-800 text-sky-500 focus:ring-0"
                    />
                    <span className="font-semibold text-emerald-400">نامحدود سازمانی</span>
                  </label>
                </div>
                {!isInternationalUnlimited && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={internationalTraffic}
                      onChange={(e) => setInternationalTraffic(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-xs font-mono"
                    />
                    <span className="text-xs text-neutral-400 whitespace-nowrap">گیگابایت</span>
                  </div>
                )}
              </div>

              {/* Domestic Traffic */}
              <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">ترافیک شبکه داخلی:</span>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDomesticUnlimited}
                      onChange={(e) => setIsDomesticUnlimited(e.target.checked)}
                      className="rounded border-neutral-700 bg-neutral-800 text-sky-500 focus:ring-0"
                    />
                    <span className="font-semibold text-emerald-400">نامحدود سازمانی</span>
                  </label>
                </div>
                {!isDomesticUnlimited && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={domesticTraffic}
                      onChange={(e) => setDomesticTraffic(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-xs font-mono"
                    />
                    <span className="text-xs text-neutral-400 whitespace-nowrap">گیگابایت</span>
                  </div>
                )}
              </div>
            </div>

            {/* Night Traffic Radio */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                سیاست مصرف ترافیک شبانه:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "NORMAL", label: "عادی (بدون تخفیف)" },
                  { id: "HALF_PRICE", label: "نیم‌بها" },
                  { id: "FREE_BUSINESS", label: "رایگان سازمانی" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNightTraffic(item.id as NightTrafficType)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      nightTraffic === item.id
                        ? "border-sky-500 bg-sky-500/15 text-sky-300"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Periodic Discounts */}
          <div className="space-y-4 pt-2 border-t border-neutral-800/80">
            <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              <span>قیمت‌گذاری پایه و تخفیف‌های دوره‌ای (تومان)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  قیمت پایه ماهانه (تومان) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={10000}
                    min={0}
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs font-mono pl-16"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-neutral-500">تومان</span>
                </div>
                {monthlyPrice > 0 && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono">
                    معادل: {formatPrice(monthlyPrice)} در ماه
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  اولویت نمایش (ترتیب)
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Discounts */}
            <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <span className="text-xs font-bold text-neutral-300 block mb-3">
                درصد تخفیف پیش‌فرض برای دوره‌های اشتراک:
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">دوره ۳ ماهه (٪)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountThreeMonths}
                    onChange={(e) => setDiscountThreeMonths(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">دوره ۶ ماهه (٪)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountSixMonths}
                    onChange={(e) => setDiscountSixMonths(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">دوره ۱۲ ماهه (٪)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={discountYearly}
                    onChange={(e) => setDiscountYearly(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-xs font-mono text-center text-emerald-400 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Features */}
          <div className="space-y-3 pt-2 border-t border-neutral-800/80">
            <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              <span>ویژگی‌ها و قابلیت‌های برجسته پلن</span>
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="افزودن ویژگی جدید (مثال: پینگ تک رقمی به سرورهای ایران)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>افزودن</span>
              </button>
            </div>

            {features.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500 italic">هنوز ویژگی‌ای ثبت نشده است.</p>
            )}
          </div>

          {/* Section 5: Status Switches */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-neutral-800/80">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
              />
              <span>وضعیت فعال (نمایش در وب‌سایت)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0"
              />
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>پلن برگزیده و پیشنهادی (Featured)</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-900/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            انصراف
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs shadow-lg shadow-sky-500/20"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>در حال ذخیره...</span>
              </span>
            ) : (
              <span>{isEditing ? "بروزرسانی پلن" : "ایجاد و ذخیره پلن"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
