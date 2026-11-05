"use client";

import * as React from "react";
import { UserPlus, CheckCircle2, AlertCircle, Phone, User, Percent, Coins, FileText, Hash } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AdminActionModal } from "../shared";
import type {
  AffiliatePartnerDto,
  CreateAffiliatePartnerPayload,
  AffiliatePartnerStatus,
} from "../../types/admin-affiliates.types";
import { adminAffiliatesApi } from "../../api/admin-affiliates-api";

interface NewPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPartnerCreated: (partner: AffiliatePartnerDto) => void;
}

export function NewPartnerModal({ isOpen, onClose, onPartnerCreated }: NewPartnerModalProps) {
  const [name, setName] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [partnerCode, setPartnerCode] = React.useState<string>("");
  const [status, setStatus] = React.useState<AffiliatePartnerStatus>("ACTIVE");
  const [customDiscount, setCustomDiscount] = React.useState<string>("");
  const [customStaticIp, setCustomStaticIp] = React.useState<string>("");
  const [customInternet, setCustomInternet] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setPhone("");
    setPartnerCode("");
    setStatus("ACTIVE");
    setCustomDiscount("");
    setCustomStaticIp("");
    setCustomInternet("");
    setNotes("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("لطفاً نام یا نام شرکت همکار را وارد فرمایید.");
      return;
    }
    if (!phone.trim()) {
      setError("شماره همراه معتبر برای ثبت حساب همکار الزامی است.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: CreateAffiliatePartnerPayload = {
        name: name.trim(),
        phone: phone.trim(),
        partnerCode: partnerCode.trim() ? partnerCode.trim().toUpperCase() : undefined,
        status,
        customDiscountPercent: customDiscount ? parseFloat(customDiscount) : null,
        customStaticIpCommission: customStaticIp ? parseInt(customStaticIp, 10) : null,
        customInternetCommission: customInternet ? parseInt(customInternet, 10) : null,
        notes: notes.trim() || undefined,
        isDiscountEnabled: true,
        isCommissionEnabled: true,
      };

      const result = await adminAffiliatesApi.createPartner(payload);
      onPartnerCreated(result);
      handleClose();
    } catch (err: any) {
      setError(err?.message || "خطا در ثبت همکار جدید. لطفاً مجدداً بررسی فرمایید.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminActionModal
      isOpen={isOpen}
      onClose={handleClose}
      title="ثبت و فعال‌سازی همکار فروش جدید"
      description="افزودن همکار به شبکه نمایندگان فروش با نرخ‌های اختصاصی یا پیش‌فرض عمومی"
      icon={UserPlus}
      variant="info"
      confirmLabel="ثبت و ایجاد همکار"
      cancelLabel="انصراف"
      onConfirm={handleSubmit}
      isLoading={isLoading}
    >
      <div className="space-y-4 text-right" dir="rtl">
        {error && (
          <div className="p-3 rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-300 font-bold flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-neutral-400" />
              <span>نام و نام خانوادگی / عنوان شرکت *</span>
            </label>
            <Input
              type="text"
              placeholder="مثلاً: شرکت مهندسی شبکه پارس یا کامران رستمی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white text-xs h-10"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-300 font-bold flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-neutral-400" />
              <span>شماره همراه همکار *</span>
            </label>
            <Input
              type="text"
              dir="ltr"
              placeholder="09120000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white text-xs font-mono h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Partner Code */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-300 font-bold flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-orange-400" />
              <span>کد معرف اختصاصی (اختیاری)</span>
            </label>
            <Input
              type="text"
              dir="ltr"
              placeholder="مثال: PRT-8801 (خودکار در صورت خالی بودن)"
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-orange-400 font-mono text-xs h-10"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-300 font-bold block">وضعیت اولیه حساب</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AffiliatePartnerStatus)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 h-10"
            >
              <option value="ACTIVE">همکار فعال (ACTIVE)</option>
              <option value="PENDING_APPROVAL">در انتظار بررسی (PENDING_APPROVAL)</option>
              <option value="INACTIVE">غیرفعال (INACTIVE)</option>
            </select>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3">
          <span className="text-xs font-bold text-neutral-300 block">
            تنظیم نرخ‌های اختصاصی (در صورت خالی بودن، مقادیر پیش‌فرض عمومی اعمال می‌شود):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Custom Discount */}
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400 block">درصد تخفیف محصولات</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="پیش‌فرض (۸٪)"
                  step="0.5"
                  min="0"
                  max="100"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-white text-xs h-9 pl-7 pr-2"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500">٪</span>
              </div>
            </div>

            {/* Custom Static IP */}
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400 block">پورسانت IP استاتیک (تومان)</label>
              <Input
                type="number"
                placeholder="پیش‌فرض (۱۵۰,۰۰۰)"
                step="10000"
                min="0"
                value={customStaticIp}
                onChange={(e) => setCustomStaticIp(e.target.value)}
                className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
              />
            </div>

            {/* Custom Internet */}
            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400 block">پورسانت اینترنت (تومان)</label>
              <Input
                type="number"
                placeholder="پیش‌فرض (۴۰۰,۰۰۰)"
                step="10000"
                min="0"
                value={customInternet}
                onChange={(e) => setCustomInternet(e.target.value)}
                className="bg-neutral-950 border-neutral-800 text-white text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs text-neutral-300 font-bold flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-neutral-400" />
            <span>یادداشت یا توضیحات مدیریتی (اختیاری)</span>
          </label>
          <textarea
            rows={2}
            placeholder="یادداشت‌های داخلی در خصوص قرارداد، معرفی‌کننده یا شرایط همکاری..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>
      </div>
    </AdminActionModal>
  );
}
