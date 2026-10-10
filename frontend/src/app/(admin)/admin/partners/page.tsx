import type { Metadata } from "next";
import { AdminPartnersView } from "@/features/admin";

export const metadata: Metadata = {
  title: "همکاران سازمانی و تایید B2B | پنل مدیریت ققنوس آکادمی",
  description: "بررسی مدارک ثبتی شرکت‌ها، تصویب خط اعتباری تا ۵۰۰ میلیون تومان و چک‌های صیادی بنفش.",
};

export default function AdminPartnersPage() {
  return <AdminPartnersView />;
}
