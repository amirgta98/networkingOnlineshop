import type { Metadata } from "next";
import { ArticleFormView } from "@/features/admin/components/articles";

export const metadata: Metadata = {
  title: "ویرایش مقاله تخصصی | پنل مدیریت ققنوس آکادمی",
  description: "ویرایش اطلاعات مقاله، متادیتا و بهینه‌سازی محتوا.",
};

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function AdminArticleEditPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <ArticleFormView isEditMode={true} articleId={resolvedParams.id} />;
}
