import type { Metadata } from "next";
import { PortfolioFormView } from "@/features/admin/components/portfolio";

export const metadata: Metadata = {
  title: "ویرایش پروژه مهندسی | پنل مدیریت ققنوس آکادمی",
  description: "ویرایش اطلاعات و مستندات فنی پروژه مهندسی ققنوس.",
};

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function AdminPortfolioEditPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <PortfolioFormView isEditMode={true} projectId={resolvedParams.id} />;
}
