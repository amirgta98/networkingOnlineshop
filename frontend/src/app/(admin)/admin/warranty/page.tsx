import type { Metadata } from "next";
import { ADMIN_PAGES, AdminPagePlaceholder } from "@/features/admin";

export const metadata: Metadata = {
  title: "خدمات گارانتی و RMA تجهیزات شبکه | پنل مدیریت ققنوس آکادمی",
  description: "ثبت و استعلام سریال نامبر تجهیزات سیسکو و نگزنس، تایید تعویض درجا و پیگیری فنی در لابراتوار.",
};

export default function AdminWarrantyPage() {
  const page = ADMIN_PAGES.find((p) => p.id === "warranty")!;
  return <AdminPagePlaceholder page={page} />;
}
