import * as React from "react";
import { CareersPageClient } from "@/features/careers";

export const metadata = {
  title: "همکاری با ققنوس آکادمی و ارسال رزومه کاری | ققنوس آکادمی",
  description:
    "موقعیت‌های شغلی فعال، مزایای سازمانی و فرم آنلاین ارسال رزومه کاری در فروشگاه تخصصی تجهیزات شبکه ققنوس آکادمی. به تیم ما بپیوندید.",
};

export default function CareersPage() {
  return (
    <React.Suspense fallback={null}>
      <CareersPageClient />
    </React.Suspense>
  );
}
