"use client";

import * as React from "react";
import {
  X,
  Briefcase,
  Layers,
  MapPin,
  Clock,
  Award,
  Plus,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { JobPosition, JobPositionType } from "@/features/careers/types";

interface JobPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<JobPosition>) => Promise<void>;
  initialData?: JobPosition | null;
}

const JOB_TYPES: { value: JobPositionType; label: string }[] = [
  { value: "FULL_TIME", label: "تمام وقت" },
  { value: "PART_TIME", label: "پاره وقت" },
  { value: "CONTRACT", label: "پروژه‌ای / قراردادی" },
  { value: "HYBRID", label: "هیبریدی" },
  { value: "REMOTE", label: "دورکاری" },
];

const DEPARTMENTS = [
  "واحد فنی و پشتیبانی",
  "دپارتمان فروش و بازرگانی",
  "واحد اجرا و پروژه‌ها",
  "دپارتمان مارکتینگ",
  "منابع انسانی",
  "مدیریت و مالی",
  "انبارداری و لجستیک",
];

export function JobPositionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: JobPositionModalProps) {
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [department, setDepartment] = React.useState(DEPARTMENTS[0]);
  const [type, setType] = React.useState<JobPositionType>("FULL_TIME");
  const [experience, setExperience] = React.useState("");
  const [location, setLocation] = React.useState("تهران — دفتر مرکزی");
  const [badge, setBadge] = React.useState("");
  const [skills, setSkills] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [requirements, setRequirements] = React.useState("");
  const [benefits, setBenefits] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [sortOrder, setSortOrder] = React.useState(0);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSlug(initialData.slug || "");
      setDepartment(initialData.department || DEPARTMENTS[0]);
      setType((initialData.type as JobPositionType) || "FULL_TIME");
      setExperience(initialData.experience || "");
      setLocation(initialData.location || "تهران — دفتر مرکزی");
      setBadge(initialData.badge || "");
      setSkills(Array.isArray(initialData.skills) ? initialData.skills : []);
      setDescription(initialData.description || "");
      setRequirements(initialData.requirements || "");
      setBenefits(initialData.benefits || "");
      setIsActive(initialData.isActive ?? true);
      setSortOrder(initialData.sortOrder ?? 0);
    } else {
      setTitle("");
      setSlug("");
      setDepartment(DEPARTMENTS[0]);
      setType("FULL_TIME");
      setExperience("");
      setLocation("تهران — دفتر مرکزی");
      setBadge("");
      setSkills([]);
      setDescription("");
      setRequirements("");
      setBenefits("");
      setIsActive(true);
      setSortOrder(0);
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("لطفاً عنوان موقعیت شغلی را وارد فرمایید.");
      return;
    }
    if (!department.trim()) {
      setErrorMsg("لطفاً دپارتمان را مشخص فرمایید.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        slug: slug.trim() || undefined,
        department: department.trim(),
        type,
        experience: experience.trim() || undefined,
        location: location.trim() || undefined,
        badge: badge.trim() || undefined,
        skills,
        description: description.trim() || undefined,
        requirements: requirements.trim() || undefined,
        benefits: benefits.trim() || undefined,
        isActive,
        sortOrder: Number(sortOrder) || 0,
      });
      onClose();
    } catch (err: any) {
      console.error("Save position error:", err);
      setErrorMsg(err?.message || "خطا در ذخیره موقعیت شغلی.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-[#121215] p-6 shadow-2xl space-y-5 text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? "ویرایش موقعیت شغلی" : "ایجاد موقعیت شغلی جدید"}
              </h3>
              <p className="text-xs text-neutral-400">
                مشخصات و شرایط احراز این موقعیت را در سامانه تنظیم فرمایید.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                عنوان موقعیت شغلی <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: کارشناس ارشد سیسکو و شبکه"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                دپارتمان / واحد کاری <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                list="departments-list"
                placeholder="انتخاب یا تایپ واحد..."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none"
              />
              <datalist id="departments-list">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 2: Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                نوع همکاری
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as JobPositionType)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-100 focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-neutral-900">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                محل کار / شهر
              </label>
              <input
                type="text"
                placeholder="مثال: تهران — سهروردی"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Experience, Badge, SortOrder */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                حداقل سابقه کار
              </label>
              <input
                type="text"
                placeholder="مثال: +۲ سال سابقه"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                برچسب شاخص (Badge)
              </label>
              <input
                type="text"
                placeholder="مثال: فوری، پورسانت عالی"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                اولویت چیدمان
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs text-neutral-100 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              مهارت‌های کلیدی مورد انتظار
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="مثال: Cisco CCNP، میکروتیک، مذاکره B2B..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                افزودن تگ
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-neutral-800/80 bg-neutral-900/40">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200 font-mono"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description & Requirements */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              شرح وظایف و مسئولیت‌ها
            </label>
            <textarea
              rows={3}
              placeholder="شرح کارهای روزانه، اهداف موقعیت و انتظارات..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              شرایط احراز و شایستگی‌ها
            </label>
            <textarea
              rows={3}
              placeholder="مدارک تخصصی، تحصیلات، پیش‌نیازهای مهارتی..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              مزایای سازمانی و رفاهی
            </label>
            <textarea
              rows={2}
              placeholder="بیمه تکمیلی، پاداش فصلی، دوره‌های آموزشی..."
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>

          {/* Active switch */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
            <div>
              <span className="text-xs font-bold text-white block">
                وضعیت انتشار در صفحه فرصت‌های شغلی
              </span>
              <span className="text-[11px] text-neutral-400">
                در صورت غیرفعال بودن، این موقعیت در سایت نمایش داده نمی‌شود.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-500 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <span>{initialData ? "ذخیره تغییرات" : "ایجاد موقعیت شغلی"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
