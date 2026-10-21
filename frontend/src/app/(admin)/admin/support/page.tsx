import type { Metadata } from "next";
import { AdminSupportView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت تیکت‌ها و پشتیبانی فنی مهندسی | پنل مدیریت ققنوس آکادمی",
  description: "مرکز کنترل و پاسخگویی بلادرنگ به تیکت‌های مهندسی شبکه و کارفرمایان سازمانی.",
};

export default function AdminSupportPage() {
  return <AdminSupportView />;
}
