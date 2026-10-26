import type { Metadata } from "next";
import { AdminWalletView } from "@/features/admin";

export const metadata: Metadata = {
  title: "درخواست‌های واریز و برداشت | پنل مدیریت ققنوس آکادمی",
  description: "مدیریت تسویه‌حساب‌های شتاب، تایید واریز پایا و ساتنا، استرداد و رهگیری شارژهای آنلاین کیف پول کاربران و همکاران.",
};

export default function AdminWalletPage() {
  return <AdminWalletView />;
}
