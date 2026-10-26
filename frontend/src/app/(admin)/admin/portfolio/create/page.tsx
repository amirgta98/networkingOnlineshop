import type { Metadata } from "next";
import { PortfolioFormView } from "@/features/admin/components/portfolio";

export const metadata: Metadata = {
  title: "ثبت پروژه و نمونه‌کار جدید | پنل مدیریت ققنوس آکادمی",
  description: "ثبت پروژه جدید با قابلیت درج شاخص‌های فنی، چالش‌ها و راهکارهای مهندسی ققنوس.",
};

export default function AdminPortfolioCreatePage() {
  return <PortfolioFormView isEditMode={false} />;
}
