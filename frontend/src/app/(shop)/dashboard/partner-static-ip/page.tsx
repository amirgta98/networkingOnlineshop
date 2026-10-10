import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "خرید آی‌پی استاتیک اختصاصی همکاران | پیشخوان کاربری",
  description: "خرید و تخصیص مستقیم آدرس‌های آی‌پی ثابت سازمانی در دوره‌های ۱، ۳، ۶ و ۱۲ ماهه ویژه همکاران تجاری.",
};

export default function DashboardPartnerStaticIpPage() {
  return <DashboardSectionPage pageKey="partner-static-ip" />;
}
