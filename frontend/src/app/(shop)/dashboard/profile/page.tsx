import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "مشخصات حساب و احراز هویت | پیشخوان کاربری",
  description: "اطلاعات هویتی، کد ملی، شماره شبا، شماره تماس اضطراری و کد پستی حساب کاربری",
};

export default function DashboardProfilePage() {
  return <DashboardSectionPage pageKey="profile" />;
}
