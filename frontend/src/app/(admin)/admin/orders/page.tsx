import type { Metadata } from "next";
import { AdminOrdersView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت سفارش‌ها و مرسولات کل پلتفرم | پنل مدیریت ولوکس",
  description: "مدیریت سفارش‌های عادی و سازمانی، تغییر وضعیت فاکتورها و رهگیری ناوگان ارسال تجهیزات شبکه.",
};

export default function AdminOrdersPage() {
  return <AdminOrdersView />;
}
