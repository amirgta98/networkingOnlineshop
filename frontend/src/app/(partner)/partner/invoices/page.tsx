import type { Metadata } from "next";
import { PartnerInvoicesView } from "@/features/partner";

export const metadata: Metadata = {
  title: "فاکتورهای رسمی و سامانه مودیان | پرتال سازمانی ققنوس آکادمی",
  description: "صورتحساب‌های الکترونیکی مالیاتی با شناسه یکتا و محاسبه ۱۰٪ ارزش افزوده رسمی.",
};

export default function PartnerInvoicesPage() {
  return <PartnerInvoicesView />;
}
