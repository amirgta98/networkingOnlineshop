import type { Metadata } from "next";
import { AdminPaymentsView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت درگاه‌های پرداخت و حساب‌های بانکی | پنل مدیریت ققنوس آکادمی",
  description: "مدیریت درگاه‌های شاپرک، شماره کارت و شبا، و تنظیمات محیط سندباکس و زنده.",
};

export default function AdminPaymentsPage() {
  return <AdminPaymentsView />;
}
