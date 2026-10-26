"use client";

import * as React from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Hash,
  Coins,
  FileText,
  User,
} from "lucide-react";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AdminActionModal } from "../shared";
import type {
  AffiliatePartnerDto,
  CreateAffiliatePayoutPayload,
  AffiliatePayoutDto,
} from "@/features/affiliate";
import { affiliateApi } from "@/features/affiliate";

interface NewPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: AffiliatePartnerDto[];
  selectedPartnerId?: string;
  onPayoutCreated: (payout: AffiliatePayoutDto) => void;
}

export function NewPayoutModal({
  isOpen,
  onClose,
  partners,
  selectedPartnerId: initialPartnerId,
  onPayoutCreated,
}: NewPayoutModalProps) {
  const [partnerId, setPartnerId] = React.useState<string>(initialPartnerId || "");
  const [amount, setAmount] = React.useState<string>("");
  const [trackingCode, setTrackingCode] = React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("SATNA_PAYA");
  const [description, setDescription] = React.useState<string>("");

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialPartnerId) {
      setPartnerId(initialPartnerId);
    } else if (partners.length > 0 && !partnerId) {
      setPartnerId(partners[0].id);
    }
  }, [initialPartnerId, partners, partnerId]);

  const selectedPartner = partners.find((p) => p.id === partnerId) || null;
  const approvedCommission = selectedPartner ? (selectedPartner.approvedCommission || 0) : 0;
  const paidCommission = selectedPartner ? (selectedPartner.paidCommission || 0) : 0;
  const payableBalance = Math.max(0, approvedCommission - paidCommission);

  const handleMaxAmount = () => {
    if (payableBalance > 0) {
      setAmount(payableBalance.toString());
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!partnerId) {
      setError("لطفاً همکار مورد نظر را انتخاب فرمایید.");
      return;
    }
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("مبلغ واریزی باید بزرگتر از صفر باشد.");
      return;
    }
    if (!trackingCode.trim()) {
      setError("ثبت کد رهگیری بانکی (ساتنا، پایا یا شماره تراکنش) الزامی است.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: CreateAffiliatePayoutPayload = {
        partnerId,
        amount: numAmount,
        trackingCode: trackingCode.trim(),
        paymentMethod,
        description: description.trim() || undefined,
      };

      const result = await affiliateApi.createAdminPayout(payload);
      onPayoutCreated(result);
      onClose();
    } catch (err: any) {
      setError(err?.message || "خطا در ثبت پرداخت پورسانت. لطفاً مجدداً تلاش فرمایید.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminActionModal
      isOpen={isOpen}
      onClose={onClose}
      title="ثبت تسویه‌حساب و پرداخت پورسانت"
      description="ثبت حواله بانکی ساتنا/پایا برای تسویه مطالبات پورسانت همکار"
      variant="success"
      icon={CreditCard}
      confirmLabel="ثبت قطعی پرداخت"
      cancelLabel="انصراف"
      onConfirm={handleSubmit}
      isLoading={isLoading}
      maxWidth="lg"
    >
      <div className="space-y-4 py-2 text-right" dir="rtl">
        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Partner Select */}
        <div>
          <label className="text-xs text-neutral-300 font-bold block mb-1.5">انتخاب همکار</label>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            <option value="">-- انتخاب همکار --</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.partnerCode} - {p.user?.name || "کاربر سیستم"} ({p.user?.phone || "بدون شماره"})
              </option>
            ))}
          </select>
        </div>

        {/* Partner Balance Strip */}
        {selectedPartner && (
          <div className="p-3 rounded-xl border border-neutral-800 bg-[#16161b] flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-400 block mb-0.5">پورسانت تاییدشده و تسویه‌نشده:</span>
              <span className="text-sm font-black text-emerald-400">{formatPrice(payableBalance)}</span>
            </div>
            {payableBalance > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleMaxAmount}
                className="text-xs h-7 px-2.5 text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
              >
                تسویه کل مبلغ
              </Button>
            )}
          </div>
        )}

        {/* 2. Amount Input */}
        <div>
          <label className="text-xs text-neutral-300 font-bold block mb-1.5">مبلغ واریزی (تومان)</label>
          <div className="relative">
            <Input
              type="number"
              step="50000"
              min="1000"
              placeholder="مثلاً: 1500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white text-xs pl-16 pr-3 h-10 font-bold"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-medium">
              تومان
            </span>
          </div>
        </div>

        {/* 3. Tracking Code */}
        <div>
          <label className="text-xs text-neutral-300 font-bold block mb-1.5">کد رهگیری بانکی (ساتنا / پایا)</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="مثلاً: SATNA-982143009"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white text-xs pr-8 h-10 font-mono"
            />
            <Hash className="h-3.5 w-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4. Payment Method */}
        <div>
          <label className="text-xs text-neutral-300 font-bold block mb-1.5">روش پرداخت / کانال بانکی</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            <option value="SATNA_PAYA">انتقال ساتنا / پایا (حواله بین‌بانکی)</option>
            <option value="CARD_TO_CARD">کارت‌به‌کارت بانکی</option>
            <option value="CHEQUE">چک صیادی بانکی</option>
            <option value="CASH">نقدی / دستی</option>
          </select>
        </div>

        {/* 5. Description */}
        <div>
          <label className="text-xs text-neutral-300 font-bold block mb-1.5">توضیحات و بابت پرداخت</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثلاً: تسویه پورسانت فروش خطوط اینترنت سازمانی مهرماه..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 leading-relaxed"
          />
        </div>
      </div>
    </AdminActionModal>
  );
}
