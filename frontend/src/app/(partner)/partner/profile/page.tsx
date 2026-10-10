import type { Metadata } from "next";
import { PartnerProfileView } from "@/features/partner";

export const metadata: Metadata = {
  title: "مشخصات شرکت و مدارک حقوقی | پرتال سازمانی ققنوس آکادمی",
  description: "اطلاعات احراز هویت حقوقی، روزنامه رسمی، کد اقتصادی و اطلاعات حساب بانکی شرکتی.",
};

export default function PartnerProfilePage() {
  return <PartnerProfileView />;
}
