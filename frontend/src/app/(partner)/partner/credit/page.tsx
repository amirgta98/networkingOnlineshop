import type { Metadata } from "next";
import { PartnerCreditView } from "@/features/partner";

export const metadata: Metadata = {
  title: "خط اعتباری و چک‌های صیادی | پرتال سازمانی ققنوس آکادمی",
  description: "مدیریت سقف اعتبار خرید سازمانی، ثبت چک صیادی بنفش در سامانه پیچک و سررسیدهای ۴۵ روزه.",
};

export default function PartnerCreditPage() {
  return <PartnerCreditView />;
}
