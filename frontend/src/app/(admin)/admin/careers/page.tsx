import type { Metadata } from "next";
import { AdminCareersView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت فرصت‌های شغلی و رزومه‌ها | پنل مدیریت ققنوس آکادمی",
  description:
    "ایجاد، ویرایش، حذف و فعال/غیرفعال‌سازی موقعیت‌های شغلی و بررسی درخواست‌های استخدامی و رزومه‌های متقاضیان.",
};

export default function AdminCareersPage() {
  return <AdminCareersView />;
}
