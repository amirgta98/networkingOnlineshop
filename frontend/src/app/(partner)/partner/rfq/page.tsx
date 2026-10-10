import type { Metadata } from "next";
import { PartnerRfqView } from "@/features/partner";

export const metadata: Metadata = {
  title: "استعلام قیمت پروژه‌ای و مناقصات (RFQ) | پرتال سازمانی ققنوس آکادمی",
  description: "ارسال لیست BOM تجهیزات پسیو و اکتیو پروژه و صدور پیش‌فاکتور رسمی با مهر الکترونیک.",
};

export default function PartnerRfqPage() {
  return <PartnerRfqView />;
}
