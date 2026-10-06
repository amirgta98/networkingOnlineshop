import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "استعلام اصالت و گارانتی (RMA) | پیشخوان کاربری",
  description: "بررسی سریال نامبر تجهیزات سیسکو، میکروتیک و ثبت درخواست تعویض یا تعمیر گارانتی طلایی",
};

export default function DashboardWarrantyPage() {
  return <DashboardSectionPage pageKey="warranty" />;
}
