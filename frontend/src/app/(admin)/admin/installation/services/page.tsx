import type { Metadata } from "next";
import { AdminInstallationServicesView } from "@/features/admin";

export const metadata: Metadata = {
  title: "تعرفه‌ها و خدمات پسیو شبکه | پنل مدیریت ققنوس آکادمی",
  description:
    "مشاهده استانداردهای اجرایی، تجهیزات تست فلوک و نرخ‌های پایه خدمات کابل‌کشی، رک و دیتاسنتر.",
};

export default function AdminInstallationServicesPage() {
  return <AdminInstallationServicesView />;
}
