import type { Metadata } from "next";
import { AdminInvoicesView } from "@/features/admin";

export const metadata: Metadata = {
  title: "فاکتورها و سامانه مودیان مالیاتی | پنل مدیریت ققنوس آکادمی",
  description: "سامانه مودیان، محاسبه ارزش افزوده، دانلود دفاتر مالیاتی و گزارش‌های حسابداری رسمی.",
};

export default function AdminInvoicesPage() {
  return <AdminInvoicesView />;
}
