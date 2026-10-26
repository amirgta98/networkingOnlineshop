import type { Metadata } from "next";
import { AdminArticlesView } from "@/features/admin/components/articles";

export const metadata: Metadata = {
  title: "مدیریت مقالات و وبلاگ تخصصی | پنل مدیریت ققنوس آکادمی",
  description: "نگارش، انتشار، سئو و بهینه‌سازی مقالات تخصصی مهندسی شبکه و دیتاسنتر.",
};

export default function AdminArticlesPage() {
  return <AdminArticlesView />;
}
