import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "درخواست ارتقا به همکار سازمانی (B2B) | پیشخوان کاربری",
  description: "ثبت اطلاعات شرکت و دریافت تخفیف‌های ویژه نمایندگی، خط اعتباری و خرید چکی",
};

export default function DashboardUpgradePartnerPage() {
  return <DashboardSectionPage pageKey="upgrade-partner" />;
}
