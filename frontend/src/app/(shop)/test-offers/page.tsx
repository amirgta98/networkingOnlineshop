import type { Metadata } from "next";
import { SpecialOfferSection } from "@/features/special-offers";
import { NOINDEX_NOFOLLOW_ROBOTS } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "پیش‌نمایش آزمایشی پیشنهادات",
  description: "صفحه آزمایشی داخلی پیشنهادات ویژه.",
  robots: NOINDEX_NOFOLLOW_ROBOTS,
};

export default function TestPage() {
  return (
    <div className="min-h-screen bg-[#09090b] py-6">
      <SpecialOfferSection />
    </div>
  );
}
