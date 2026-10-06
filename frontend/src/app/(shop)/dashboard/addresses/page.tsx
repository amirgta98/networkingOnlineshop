import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "آدرس‌ها و اطلاعات تحویل | پیشخوان کاربری",
  description: "مدیریت آدرس‌های انبار، پروژه و دفاتر جهت ارسال سفارشات با پیک و باربری",
};

export default function DashboardAddressesPage() {
  return <DashboardSectionPage pageKey="addresses" />;
}
