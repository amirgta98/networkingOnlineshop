import type { Metadata } from "next";
import { AdminPortfolioView } from "@/features/admin/components/portfolio";

export const metadata: Metadata = {
  title: "مدیریت پروژه‌ها و نمونه‌کارها | پنل مدیریت ققنوس آکادمی",
  description: "مدیریت پروژه‌های دیتاسنتر، سوییچینگ، فیبر نوری و ثبت چالش‌ها و دستاوردهای مهندسی.",
};

export default function AdminPortfolioPage() {
  return <AdminPortfolioView />;
}
