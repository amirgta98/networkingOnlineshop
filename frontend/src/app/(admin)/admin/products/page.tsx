import type { Metadata } from "next";
import { ADMIN_PAGES, AdminPagePlaceholder } from "@/features/admin";

export const metadata: Metadata = {
  title: "کاتالوگ و موجودی انبار تجهیزات شبکه | پنل مدیریت ققنوس آکادمی",
  description: "پایش موجودی فیزیکی سوئیچ‌ها، روترها، کابل و تجهیزات پسیو با اعلان هشدار اتمام موجودی.",
};

export default function AdminProductsPage() {
  const page = ADMIN_PAGES.find((p) => p.id === "products")!;
  return <AdminPagePlaceholder page={page} />;
}
