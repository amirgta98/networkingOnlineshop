import type { Metadata } from "next";
import { PartnerStaticIpView } from "@/features/partner";

export const metadata: Metadata = {
  title: "خرید آی‌پی استاتیک اختصاصی و بلوک‌های رسمی RIPE | پرتال همکاران ققنوس آکادمی",
  description: "خرید و تخصیص مستقیم آدرس‌های آی‌پی استاتیک (Static IP) در دوره‌های ۱، ۳، ۶ و ۱۲ ماهه با تعداد دلخواه، تنظیم خودکار rDNS و ثبت رسمی زیردامنه برای همکاران تجاری.",
};

export default function PartnerStaticIpPage() {
  return <PartnerStaticIpView />;
}
