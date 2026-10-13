import type { Metadata } from "next";
import { AdminCategoriesView } from "@/features/admin/components/categories/admin-categories-view";

export const metadata: Metadata = {
  title: "مدیریت دسته‌بندی‌های کاتالوگ | پنل مدیریت ققنوس آکادمی",
  description: "مدیریت و پیکربندی ساختار درختی کالاها، آیکون‌ها، اسلاگ و اتصال به کاتالوگ محصولات",
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesView />;
}
