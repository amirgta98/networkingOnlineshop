import type { Metadata } from "next";
import { AdminInstallationView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت درخواست‌های نصب و پسیو شبکه | پنل مدیریت ققنوس آکادمی",
  description:
    "پایش و مدیریت جامع پروژه‌های کابل‌کشی ساختاریافته، آرایش رک و دیتاسنتر، دوربین مداربسته و تست فلوک.",
};

export default function AdminInstallationPage() {
  return <AdminInstallationView />;
}
