import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "استعلام قیمت پروژه‌ای (RFQ) | پیشخوان کاربری",
  description: "درخواست استعلام لیست تجمیعی سوئیچ، روتر، رک و کابل شبکه با قیمت ویژه پروژه",
};

export default function DashboardRfqPage() {
  return <DashboardSectionPage pageKey="rfq" />;
}
