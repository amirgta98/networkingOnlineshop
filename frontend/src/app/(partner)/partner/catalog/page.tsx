import type { Metadata } from "next";
import { PartnerCatalogView } from "@/features/partner";

export const metadata: Metadata = {
  title: "کاتالوگ و لیست قیمت عمده همکاران | پرتال سازمانی ققنوس آکادمی",
  description: "مشاهده قیمت‌های همکاری بر اساس تیراژ کارتن و بسته با تخفیف‌های ویژه همکاران تجاری.",
};

export default function PartnerCatalogPage() {
  return <PartnerCatalogView />;
}
