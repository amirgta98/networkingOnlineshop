import type { Metadata } from "next";
import { AdminInternetView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت اینترنت سازمانی و IP استاتیک | پنل مدیریت ققنوس آکادمی",
  description:
    "تعریف و ویرایش پلن‌های اینترنت سازمانی، نرخ پایه IP استاتیک و پایش سفارش‌های خطوط متصل به کارگاه‌ها.",
};

export default function AdminInternetPage() {
  return <AdminInternetView />;
}
