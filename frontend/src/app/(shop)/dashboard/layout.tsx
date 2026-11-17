import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NOINDEX_NOFOLLOW_ROBOTS } from "@/shared/lib/seo";
import { DashboardLayoutClient } from "./dashboard-layout-client";

export const metadata: Metadata = {
  title: "حساب کاربری و پنل سفارشات",
  description: "پنل اختصاصی مدیریت سفارشات، فاکتورها، تیکت‌های پشتیبانی و اطلاعات حساب کاربری ققنوس آکادمی.",
  robots: NOINDEX_NOFOLLOW_ROBOTS,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
