import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "درخواست‌های نصب و پروژه‌های پسیو شبکه | پیشخوان کاربری",
  description: "پیگیری وضعیت درخواست‌های کابل‌کشی، دیتاسنتر، فیبر نوری، دوربین مداربسته و نظارت کارگاهی",
};

export default function DashboardInstallationsPluralPage() {
  return <DashboardSectionPage pageKey="installation" />;
}
