import type { Metadata } from "next";
import { PartnerOrdersView } from "@/features/partner";

export const metadata: Metadata = {
  title: "سفارش‌ها و مرسولات شرکتی | پرتال سازمانی ققنوس آکادمی",
  description: "رهگیری سفارش‌های پروژه‌ای، بارنامه‌های باربری و صدور حواله از انبار مرکزی ققنوس آکادمی.",
};

export default function PartnerOrdersPage() {
  return <PartnerOrdersView />;
}
