"use client";

import * as React from "react";
import {
  Building2,
  Plus,
  MapPin,
  User,
  Phone,
  Package,
  CheckCircle2,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { MOCK_PARTNER_PROJECT_SITES } from "../data/mock-partner-data";
import type { PartnerProjectSite } from "../types/partner.types";

export function PartnerProjectsView() {
  const [sites, setSites] = React.useState<PartnerProjectSite[]>(MOCK_PARTNER_PROJECT_SITES);
  const [showAddSiteModal, setShowAddSiteModal] = React.useState(false);

  // Form state
  const [formName, setFormName] = React.useState("");
  const [formCity, setFormCity] = React.useState("تهران");
  const [formAddress, setFormAddress] = React.useState("");
  const [formSupervisor, setFormSupervisor] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formAddress) return;

    const newSite: PartnerProjectSite = {
      id: `psite_${Date.now()}`,
      name: formName,
      projectCode: `PRJ-${Math.floor(Math.random() * 900) + 100}`,
      city: formCity,
      address: formAddress,
      supervisorName: formSupervisor || "مهندس ناظر پروژه",
      supervisorPhone: formPhone || "۰۹۱۲۰۰۰۰۰۰۰",
      activeOrdersCount: 0,
    };

    setSites([...sites, newSite]);
    setShowAddSiteModal(false);
    setFormName("");
    setFormAddress("");
    setFormSupervisor("");
    setFormPhone("");
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
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

        <Button
          onClick={() => setShowAddSiteModal(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white gap-2 text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>افزودن سایت / پروژه جدید</span>
        </Button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div
            key={site.id}
            className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm hover:border-sky-500/30 transition-all flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20 w-fit mb-1">
                    {site.projectCode}
                  </span>
                  <h3 className="font-bold text-white text-sm leading-relaxed">{site.name}</h3>
                </div>
                <span className="text-[11px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-full shrink-0">
                  {site.city}
                </span>
              </div>

              <div className="flex items-start gap-2 text-xs text-neutral-400 leading-relaxed bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-800/80">
                <MapPin className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{site.address}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400">سرپرست تحویل‌گیرنده:</span>
                  <span className="font-semibold text-neutral-200 mt-0.5">{site.supervisorName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400">تلفن کارگاه:</span>
                  <span className="font-mono font-medium text-neutral-200 mt-0.5" dir="ltr">
                    {site.supervisorPhone}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-sky-400" />
                <span>سفارش‌های فعال: <strong className="text-white">{toPersianDigits(site.activeOrdersCount)}</strong></span>
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-sky-400 hover:text-sky-300"
                onClick={() => alert(`ارسال تجهیزات به ${site.name} در سبد خرید انتخاب شد.`)}
              >
                <span>ارسال سفارش به این کارگاه</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Site Modal */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-sky-500/30 bg-[var(--theme-surface)] p-6 shadow-2xl flex flex-col gap-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">افزودن کارگاه / مقصد تحویل جدید</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSiteModal(false)}
                className="text-neutral-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕ بستن
              </button>
            </div>

            <form onSubmit={handleAddSite} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">نام پروژه / سایت کارگاهی:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: کارگاه دیتاسنتر پالایشگاه اصفهان فاز ۳"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">استان / شهر مقصد:</label>
                <input
                  type="text"
                  required
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-300 font-semibold">آدرس دقیق پستی جهت تخلیه باربری:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="آدرس کارگاه، کیلومتر جاده، مشخصات انبار تحویل بار..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">نام سرپرست تحویل‌گیرنده:</label>
                  <input
                    type="text"
                    required
                    placeholder="مهندس احمدی"
                    value={formSupervisor}
                    onChange={(e) => setFormSupervisor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-300 font-semibold">تلفن همراه سرپرست کارگاه:</label>
                  <input
                    type="text"
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddSiteModal(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-500 text-white"
                >
                  ثبت کارگاه در سیستم
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
