import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminLayoutClient } from "@/features/admin";

export const metadata: Metadata = {
  title: "پنل مدیریت کل و صاحب وبسایت | ققنوس آکادمی",
  description: "پنل مدیریتی و نظارتی پلتفرم ققنوس آکادمی — تنظیمات تم، سرورها، سفارشات و شرکای سازمانی.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
