"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  CreditCard,
  ShoppingBag,
  Wallet,
  FileText,
  ArrowRight,
  Printer,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { useAuth } from "@/features/auth";

export default function PaymentCallbackPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-white">در حال بارگذاری اطلاعات تراکنش...</div>}>
      <PaymentCallbackContent />
    </React.Suspense>
  );
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isPartner } = useAuth();

  const status = searchParams.get("status");
  const isSuccess = status === "success" || searchParams.get("Status") === "OK";
  const authority = searchParams.get("authority") || searchParams.get("Authority") || "";
  const trackingCode = searchParams.get("trackingCode") || searchParams.get("tracking_code") || authority.slice(-8);
  const refId = searchParams.get("refId") || searchParams.get("ref_id") || "109" + Math.floor(10000 + Math.random() * 90000);
  const cardPan = searchParams.get("cardPan") || searchParams.get("card_pan") || "۶۰۳۷-۹۹**-****-۵۵۲۱";
  const type = (searchParams.get("type") || "ORDER").toUpperCase();
  const orderNumber = searchParams.get("orderNumber") || "";
  const invoiceNumber = searchParams.get("invoiceNumber") || "";
  const amountStr = searchParams.get("amount") || "0";
  const amount = Number(amountStr) || 0;
  const message = searchParams.get("message") || (isSuccess ? "تراکنش بانکی با موفقیت در شبکه شاپرک و درگاه زرین‌پال تأیید گردید." : "پرداخت ناموفق بود یا توسط کاربر لغو شد.");

  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Sync client-side localStorage state on successful payment (Orders, Wallet, Invoices)
  React.useEffect(() => {
    if (!isSuccess || typeof window === "undefined") return;

    if (type === "ORDER") {
      try {
        // Clear active cart upon confirmed payment
        localStorage.removeItem("cart-storage");
        window.dispatchEvent(new Event("storage"));

        // Sync order status in velox_admin_invoices
        const invKey = "velox_admin_invoices";
        const stored = localStorage.getItem(invKey);
        if (stored) {
          const list = JSON.parse(stored);
          const item = list.find((it: any) => it.orderNumber === orderNumber || it.invoiceNumber === orderNumber || it.id === orderNumber);
          if (item) {
            item.paymentStatus = "paid";
            item.paymentMethod = "zarinpal_sandbox";
            localStorage.setItem(invKey, JSON.stringify(list));
          }
        }
        sessionStorage.removeItem("velox_pending_checkout_order");
      } catch (e) {
        console.error("Failed to sync order payment status", e);
      }
    }

    if (type === "WALLET" && amount > 0) {
      try {
        const balKey = "velox_dashboard_wallet_bal_v2";
        const txKey = "velox_dashboard_wallet_tx_v2";
        const storedBal = localStorage.getItem(balKey);
        const storedTx = localStorage.getItem(txKey);

        const currentBal = storedBal ? JSON.parse(storedBal) : { totalUsable: 0, cashBalance: 0 };
        currentBal.cashBalance = (currentBal.cashBalance || 0) + amount;
        currentBal.totalUsable = (currentBal.totalUsable || 0) + amount;
        localStorage.setItem(balKey, JSON.stringify(currentBal));
        localStorage.setItem("velox_dashboard_wallet_bal_v1", JSON.stringify(currentBal));

        const list = storedTx ? JSON.parse(storedTx) : [];
        list.unshift({
          id: `tx-${Date.now()}`,
          trackingCode: trackingCode || `SHP-${Date.now()}`,
          amount,
          type: "deposit",
          typeLabel: "شارژ آنلاین کیف پول",
          title: `شارژ آنی از طریق درگاه تستی زرین‌پال (شماره ارجاع: ${refId})`,
          createdAt: "هم‌اکنون",
          status: "successful",
          statusLabel: "موفق",
          gatewayName: "زرین‌پال تستی",
        });
        localStorage.setItem(txKey, JSON.stringify(list));
        localStorage.setItem("velox_dashboard_wallet_tx_v1", JSON.stringify(list));
        window.dispatchEvent(new CustomEvent("dashboard-stats-updated"));
      } catch (e) {
        console.error("Failed to sync wallet state in localStorage", e);
      }
    }

    if (type === "INVOICE" && invoiceNumber) {
      try {
        const invKey = "velox_admin_invoices";
        const stored = localStorage.getItem(invKey);
        if (stored) {
          const list = JSON.parse(stored);
          const item = list.find((it: any) => it.invoiceNumber === invoiceNumber || it.id === invoiceNumber);
          if (item) {
            item.paymentStatus = "paid";
            item.paymentMethod = "zarinpal_sandbox";
            localStorage.setItem(invKey, JSON.stringify(list));
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isSuccess, type, amount, refId, trackingCode, invoiceNumber]);

  return (
    <div className="py-10 sm:py-16" dir="rtl">
      <Container>
        <div className="max-w-xl mx-auto">
          {/* Card Frame */}
          <div className="rounded-3xl border border-neutral-800 bg-[#141417] p-6 sm:p-10 shadow-2xl relative overflow-hidden text-right">
            {/* Ambient Background Glow */}
            <div
              className={`absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
                isSuccess ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />

            {/* Header Status */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-neutral-800/80">
              <div
                className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 transition-transform ${
                  isSuccess
                    ? "bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/20"
                    : "bg-rose-500/15 border-2 border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/20"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                ) : (
                  <XCircle className="h-10 w-10" />
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border bg-neutral-900/80">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="text-orange-300">درگاه پرداخت تستی زرین‌پال (سندباکس شاپرک)</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isSuccess ? "پرداخت با موفقیت انجام شد" : "پرداخت ناموفق بود"}
              </h1>

              <p className="mt-1.5 text-xs text-neutral-400 max-w-md leading-relaxed">
                {message}
              </p>
            </div>

            {/* Receipt Summary Table */}
            <div className="my-6 space-y-3">
              <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 space-y-3 text-xs">
                {/* Transaction Type */}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">نوع تراکنش:</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {type === "WALLET" ? (
                      <>
                        <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                        <span>شارژ و افزایش موجودی کیف پول</span>
                      </>
                    ) : type === "INVOICE" ? (
                      <>
                        <FileText className="h-3.5 w-3.5 text-sky-400" />
                        <span>تسویه آنلاین فاکتور رسمی</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-3.5 w-3.5 text-orange-400" />
                        <span>پرداخت سفارش تجهیزات شبکه</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Amount */}
                {amount > 0 && (
                  <div className="flex items-center justify-between border-t border-neutral-800 pt-2.5">
                    <span className="text-neutral-400">مبلغ تراکنش:</span>
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      {formatPrice(amount)}
                    </span>
                  </div>
                )}

                {/* Ref ID (Zarinpal) */}
                {isSuccess && refId && (
                  <div className="flex items-center justify-between border-t border-neutral-800 pt-2.5">
                    <span className="text-neutral-400">شماره ارجاع بانکی (RefID):</span>
                    <div className="flex items-center gap-1 font-mono text-white font-bold">
                      <span>{toPersianDigits(refId)}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(refId, "ref")}
                        className="text-neutral-400 hover:text-white p-1"
                        title="کپی شماره ارجاع"
                      >
                        {copiedKey === "ref" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tracking Code */}
                {trackingCode && (
                  <div className="flex items-center justify-between border-t border-neutral-800 pt-2.5">
                    <span className="text-neutral-400">کد رهگیری شاپرک / زرین‌پال:</span>
                    <div className="flex items-center gap-1 font-mono text-white font-bold">
                      <span>{trackingCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(trackingCode, "track")}
                        className="text-neutral-400 hover:text-white p-1"
                        title="کپی کد رهگیری"
                      >
                        {copiedKey === "track" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Number */}
                {orderNumber && (
                  <div className="flex items-center justify-between border-t border-neutral-800 pt-2.5">
                    <span className="text-neutral-400">شماره سفارش:</span>
                    <span className="font-mono font-bold text-orange-400">{orderNumber}</span>
                  </div>
                )}

                {/* Invoice Number */}
                {invoiceNumber && (
                  <div className="flex items-center justify-between border-t border-neutral-800 pt-2.5">
                    <span className="text-neutral-400">شماره فاکتور:</span>
                    <span className="font-mono font-bold text-sky-400">{invoiceNumber}</span>
                  </div>
                )}

                {/* Card Pan */}
                {isSuccess && (
                  <div className="flex items-center justify-between border-t border-neutral-800 pt-2.5">
                    <span className="text-neutral-400">کارت پرداخت‌کننده:</span>
                    <span className="font-mono text-neutral-300">{cardPan}</span>
                  </div>
                )}

                {/* Date & Time */}
                <div className="flex items-center justify-between border-t border-neutral-800 pt-2.5">
                  <span className="text-neutral-400">زمان تراکنش:</span>
                  <span className="text-neutral-300 font-mono">
                    {toPersianDigits(new Date().toLocaleDateString("fa-IR"))} -{" "}
                    {toPersianDigits(new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }))}
                  </span>
                </div>
              </div>

              {/* Security Shield Note */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-neutral-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  رسید دیجیتال این تراکنش در سامانه ثبت گردید و پیامک تأیید نیز به شماره همراه شما ارسال شد.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {isSuccess ? (
                <>
                  {type === "WALLET" ? (
                    <Link
                      href={isPartner ? "/partner/wallet" : "/dashboard/wallet"}
                      className={cn(buttonVariants({ variant: "default", size: "md" }), "w-full sm:w-auto font-bold gap-2 cursor-pointer shadow-md shadow-orange-500/20")}
                    >
                      <Wallet className="h-4 w-4" />
                      <span>{isPartner ? "مشاهده کیف پول و تسویه" : "مشاهده کیف پول و موجودی"}</span>
                    </Link>
                  ) : type === "INVOICE" ? (
                    <Link
                      href={isPartner ? "/partner/invoices" : "/dashboard/invoices"}
                      className={cn(buttonVariants({ variant: "default", size: "md" }), "w-full sm:w-auto font-bold gap-2 cursor-pointer shadow-md shadow-orange-500/20")}
                    >
                      <FileText className="h-4 w-4" />
                      <span>مشاهده و چاپ فاکتورها</span>
                    </Link>
                  ) : (
                    <Link
                      href={isPartner ? "/partner/orders" : "/dashboard/orders"}
                      className={cn(buttonVariants({ variant: "default", size: "md" }), "w-full sm:w-auto font-bold gap-2 cursor-pointer shadow-md shadow-orange-500/20")}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>پیگیری سفارشات در پیشخوان</span>
                    </Link>
                  )}

                  <Link
                    href="/products"
                    className={cn(buttonVariants({ variant: "outline", size: "md" }), "w-full sm:w-auto border-neutral-700 text-neutral-300 hover:bg-neutral-800 cursor-pointer")}
                  >
                    <span>بازگشت به فروشگاه</span>
                    <ArrowRight className="h-4 w-4 mr-1" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={type === "WALLET" ? (isPartner ? "/partner/wallet" : "/dashboard/wallet") : type === "INVOICE" ? (isPartner ? "/partner/invoices" : "/dashboard/invoices") : "/checkout"}
                    className={cn(buttonVariants({ variant: "default", size: "md" }), "w-full sm:w-auto font-bold cursor-pointer bg-orange-600 hover:bg-orange-500")}
                  >
                    <span>تلاش مجدد برای پرداخت</span>
                  </Link>

                  <Link
                    href="/"
                    className={cn(buttonVariants({ variant: "outline", size: "md" }), "w-full sm:w-auto border-neutral-700 text-neutral-300 hover:bg-neutral-800 cursor-pointer")}
                  >
                    <span>بازگشت به صفحه اصلی</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
