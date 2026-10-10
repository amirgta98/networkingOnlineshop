import type { Metadata } from "next";
import { PartnerWarrantyView } from "@/features/partner";

export const metadata: Metadata = {
  title: "گارانتی تعویض درجا و RMA همکاران | پرتال سازمانی ققنوس آکادمی",
  description: "تعهد تعویض درجا ۲۴ ساعته ویژه همکاران تجاری طلایی و استعلام سریال تجهیزات سیسکو و نگزنس.",
};

export default function PartnerWarrantyPage() {
  return <PartnerWarrantyView />;
}
