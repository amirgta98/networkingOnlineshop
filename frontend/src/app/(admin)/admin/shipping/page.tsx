import type { Metadata } from "next";
import { AdminShippingView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت روش‌ها و زمان‌بندی ارسال مرسولات | پنل مدیریت ققنوس آکادمی",
  description: "تنظیم حامل‌های پستی، ناوگان اختصاصی، سقف ارسال رایگان، بازه‌های زمانی و تقویم اعزام سفارش‌های تجهیزات شبکه.",
};

export default function AdminShippingPage() {
  return <AdminShippingView />;
}
