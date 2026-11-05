import type { Metadata } from "next";
import { AdminProfileView } from "@/features/admin";

export const metadata: Metadata = {
  title: "پروفایل و مدیریت حساب ادمین | پنل مدیریت",
  description:
    "مشاهده و ویرایش مشخصات فردی، شماره تلفن همراه و پست الکترونیک حساب مدیریت سامانه.",
};

export default function AdminProfilePage() {
  return <AdminProfileView />;
}
