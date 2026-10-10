import type { Metadata } from "next";
import { PartnerP2PView } from "@/features/partner";

export const metadata: Metadata = {
  title: "خرید اینترنت P2P اختصاصی و پهنای باند وایرلس پوینت تو پوینت | پرتال همکاران ققنوس آکادمی",
  description: "سفارش آنلاین اینترنت اختصاصی پوینت تو پوینت (P2P) با پهنای باند ۱:۱ متقارن، ترافیک منعطف، امکان افزودن IP استاتیک و تسویه اعتباری همکاران.",
};

export default function PartnerInternetPage() {
  return <PartnerP2PView />;
}

