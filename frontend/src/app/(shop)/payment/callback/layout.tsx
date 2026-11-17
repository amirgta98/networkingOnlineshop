import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NOINDEX_NOFOLLOW_ROBOTS } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "نتیجه تراکنش و بازگشت از درگاه پرداخت",
  description: "بررسی وضعیت تایید و ثبت نهایی تراکنش مالی درگاه پرداخت.",
  robots: NOINDEX_NOFOLLOW_ROBOTS,
};

export default function PaymentCallbackLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
