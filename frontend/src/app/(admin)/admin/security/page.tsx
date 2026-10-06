import type { Metadata } from "next";
import { ADMIN_PAGES, AdminPagePlaceholder } from "@/features/admin";

export const metadata: Metadata = {
  title: "پایش سرورها، زیرساخت و لاگ امنیت | پنل مدیریت ولوکس",
  description: "مانیتورینگ سوییچ‌های Core و Access، لاگ احراز هویت دو مرحله‌ای و نشست‌های فعال شبکه.",
};

export default function AdminSecurityPage() {
  const page = ADMIN_PAGES.find((p) => p.id === "security")!;
  return <AdminPagePlaceholder page={page} />;
}
