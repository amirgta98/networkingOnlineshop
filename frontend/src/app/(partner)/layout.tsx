import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PartnerLayoutClient } from "@/features/partner";

export const metadata: Metadata = {
  title: "پرتال سازمانی و همکاران تجاری (B2B) | ققنوس آکادمی",
  description:
    "پرتال اختصاصی خرید عمده تجهیزات شبکه، صدور فاکتور رسمی و خرید اعتباری ویژه شرکت‌ها و پیمانکاران فناوری اطلاعات.",
};

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <PartnerLayoutClient>{children}</PartnerLayoutClient>;
}
