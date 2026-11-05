import type { Metadata } from "next";
import { AdminInstallationCreateView } from "@/features/admin";

export const metadata: Metadata = {
  title: "ثبت و تعریف پروژه جدید پسیو شبکه | پنل مدیریت ققنوس آکادمی",
  description:
    "ایجاد پروژه جدید کابل‌کشی ساختاریافته، آرایش رک، دوربین مداربسته، تخصیص سرپرست فنی و ثبت پیش‌فاکتور.",
};

export default function AdminInstallationNewPage() {
  return <AdminInstallationCreateView />;
}
