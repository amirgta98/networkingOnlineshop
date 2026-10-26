import type { Metadata } from "next";
import { ArticleFormView } from "@/features/admin/components/articles";

export const metadata: Metadata = {
  title: "نگارش مقاله جدید | پنل مدیریت ققنوس آکادمی",
  description: "نگارش مقاله تخصصی مهندسی شبکه با پشتیبانی از ویرایشگر غنی، هایلایت کد و سئو پیشرفته.",
};

export default function AdminArticleCreatePage() {
  return <ArticleFormView isEditMode={false} />;
}
