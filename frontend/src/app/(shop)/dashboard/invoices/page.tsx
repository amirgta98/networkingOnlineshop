import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "فاکتورها و اسناد مالی | پیشخوان کاربری",
  description: "دانلود فاکتورهای رسمی با شناسه یکتای مالیاتی و مهر الکترونیک منطبق با سامانه مودیان",
};

export default function DashboardInvoicesPage() {
  return <DashboardSectionPage pageKey="invoices" />;
}
