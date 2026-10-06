import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "مدیریت خط اعتباری و چک‌های صیادی | پیشخوان کاربری",
  description: "مشاهده سقف اعتبار ۵۰۰ میلیون تومانی، وضعیت چک‌های صیادی بنفش و سررسیدها",
};

export default function DashboardPartnerCreditPage() {
  return <DashboardSectionPage pageKey="partner-credit" />;
}
