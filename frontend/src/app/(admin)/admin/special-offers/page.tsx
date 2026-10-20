import type { Metadata } from "next";
import { AdminSpecialOffersView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت فروش‌های ویژه و کمپین‌ها | پنل مدیریت ققنوس آکادمی",
  description: "مدیریت کمپین‌های تخفیف شگفت‌انگیز تجهیزات شبکه، تعیین سقف تخفیف و نظارت بر فروش و زمان‌بندی.",
};

export default function AdminSpecialOffersPage() {
  return <AdminSpecialOffersView />;
}
