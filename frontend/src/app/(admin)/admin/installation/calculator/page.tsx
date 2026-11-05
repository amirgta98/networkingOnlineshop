import type { Metadata } from "next";
import { AdminInstallationCalculatorView } from "@/features/admin";

export const metadata: Metadata = {
  title: "شخصی‌سازی فرمول‌های محاسبه‌گر آنلاین | پنل مدیریت ققنوس آکادمی",
  description:
    "مدیریت و پیکربندی نیازمندی‌ها، انواع شمارنده‌ها (اسلایدر، نامبریک، گزینه‌ای، چک‌باکس)، قیمت‌گذاری واحد و اتصال خودکار به کالاهای فروشگاه.",
};

export default function AdminInstallationCalculatorPage() {
  return <AdminInstallationCalculatorView />;
}
