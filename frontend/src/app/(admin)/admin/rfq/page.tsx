import type { Metadata } from "next";
import { AdminRfqView } from "@/features/admin";

export const metadata: Metadata = {
  title: "استعلام‌های قیمت پروژه‌ای (RFQ) | پنل مدیریت ولوکس",
  description: "بررسی لیست تجمیعی تجهیزات استعلام‌شده توسط شرکت‌ها، تخصیص قیمت و صدور پیش‌فاکتور رسمی.",
};

export default function AdminRfqPage() {
  return <AdminRfqView />;
}
