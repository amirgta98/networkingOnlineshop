import type { Metadata } from "next";
import { AdminProductsView } from "@/features/admin";

export const metadata: Metadata = {
  title: "کاتالوگ و موجودی انبار تجهیزات شبکه | پنل مدیریت ققنوس آکادمی",
  description: "پایش موجودی فیزیکی سوئیچ‌ها، روترها، کابل و تجهیزات پسیو با اعلان هشدار اتمام موجودی.",
};

export default function AdminProductsPage() {
  return <AdminProductsView />;
}

