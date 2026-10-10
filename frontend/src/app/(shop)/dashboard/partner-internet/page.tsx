import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "خرید اینترنت سازمانی و IP استاتیک همکاران | پیشخوان کاربری",
  description: "سفارش پهنای باند اختصاصی و بلوک‌های ساب‌نت آی‌پی ثابت ویژه همکاران تجاری.",
};

export default function DashboardPartnerInternetPage() {
  return <DashboardSectionPage pageKey="partner-internet" />;
}
