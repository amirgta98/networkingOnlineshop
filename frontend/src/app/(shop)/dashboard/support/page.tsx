import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "تیکت‌ها و پشتیبانی مهندسی | پیشخوان کاربری",
  description: "مشاوره با مهندسان ارشد شبکه CCIE/MTCNA جهت طراحی توپولوژی، کانفیگ و ثبت تیکت",
};

export default function DashboardSupportPage() {
  return <DashboardSectionPage pageKey="support" />;
}
