import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "کیف پول و اعتبارات خرید | پیشخوان کاربری",
  description: "مدیریت موجودی نقد، شارژ سریع حساب، برداشت و پیگیری تراکنش‌های مالی شتابی",
};

export default function DashboardWalletPage() {
  return <DashboardSectionPage pageKey="wallet" />;
}
