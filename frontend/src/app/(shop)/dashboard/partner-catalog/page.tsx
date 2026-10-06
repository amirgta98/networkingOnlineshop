import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "کاتالوگ و لیست قیمت عمده همکاران | پیشخوان کاربری",
  description: "مشاهده قیمت‌های همکاری بر اساس تیراژ کارتن و قرقره به همراه فایل اکسل روزانه",
};

export default function DashboardPartnerCatalogPage() {
  return <DashboardSectionPage pageKey="partner-catalog" />;
}
