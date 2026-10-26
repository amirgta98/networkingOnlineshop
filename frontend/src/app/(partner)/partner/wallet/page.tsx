import type { Metadata } from "next";
import { PartnerWalletView } from "@/features/partner";

export const metadata: Metadata = {
  title: "کیف پول و موجودی نقدی همکاران | پرتال سازمانی ققنوس آکادمی",
  description: "مدیریت موجودی نقد آزاد، تسویه پورسانت‌های فروش سازمانی به شماره کارت و شبا، واریزی‌های آنلاین و پیگیری واریزهای پایا.",
};

export default function PartnerWalletPage() {
  return <PartnerWalletView />;
}
