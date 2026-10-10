import type { Metadata } from "next";
import { AdminUsersView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت کاربران و دسترسی‌ها | پنل مدیریت ققنوس آکادمی",
  description: "لیست کلیه خریداران، سطوح دسترسی سازمانی، سوابق ورود و وضعیت احراز هویت پلتفرم.",
};

export default function AdminUsersPage() {
  return <AdminUsersView />;
}
