import type { Metadata } from "next";
import { PartnerSupportView } from "@/features/partner";

export const metadata: Metadata = {
  title: "مدیر حساب اختصاصی و پشتیبانی مهندسی VIP | پرتال سازمانی ققنوس آکادمی",
  description: "ارتباط مستقیم با مدیر ارشد حساب سازمانی ققنوس آکادمی و تیکت‌های اضطراری زیرساخت شبکه با SLA فوری.",
};

export default function PartnerSupportPage() {
  return <PartnerSupportView />;
}
