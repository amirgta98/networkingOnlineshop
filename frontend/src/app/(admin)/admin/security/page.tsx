import type { Metadata } from "next";
import { AdminSecurityView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مرکز عملیات امنیت (NOC & SOC) و پایش زیرساخت دیتاسنتر | پنل مدیریت",
  description: "پایش بلادرنگ سوییچ‌های Core، آپلینک‌های شبکه، لود سرورها، نشست‌های فعال ادمین و استریم لاگ‌های ممیزی.",
};

export default function AdminSecurityPage() {
  return <AdminSecurityView />;
}
