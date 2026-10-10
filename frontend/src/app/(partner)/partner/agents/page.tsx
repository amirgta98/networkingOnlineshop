import type { Metadata } from "next";
import { PartnerAgentsView } from "@/features/partner";

export const metadata: Metadata = {
  title: "نمایندگان و کارشناسان خرید شرکت | پرتال سازمانی ققنوس آکادمی",
  description: "مدیریت کارشناسان تدارکات، مهندسان شبکه و امور مالی با سقف اختیارات ریالی مجزا.",
};

export default function PartnerAgentsPage() {
  return <PartnerAgentsView />;
}
