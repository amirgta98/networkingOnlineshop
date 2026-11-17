import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminLayoutClient } from "@/features/admin";
import { NOINDEX_NOFOLLOW_ROBOTS } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "پنل مدیریت کل و صاحب وبسایت",
  description: "پنل مدیریتی و نظارتی پلتفرم ققنوس آکادمی — تنظیمات تم، سرورها، سفارشات و شرکای سازمانی.",
  robots: NOINDEX_NOFOLLOW_ROBOTS,
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
