import type { Metadata } from "next";
import { PartnerSecurityView } from "@/features/partner";

export const metadata: Metadata = {
  title: "امنیت سازمانی، نشست‌ها و تایید ۲FA | پرتال سازمانی ققنوس آکادمی",
  description: "پایش نشست‌های ورود نمایندگان، احراز هویت دو مرحله‌ای و لاگ‌های امنیتی خرید.",
};

export default function PartnerSecurityPage() {
  return <PartnerSecurityView />;
}
