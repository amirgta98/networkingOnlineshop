import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "علاقه‌مندی‌ها و اطلاع از موجودی | پیشخوان کاربری",
  description: "تجهیزات نشان‌شده شبکه، مقایسه سریع مشخصات فنی و هشدار کاهش قیمت انبار",
};

export default function DashboardWishlistPage() {
  return <DashboardSectionPage pageKey="wishlist" />;
}
