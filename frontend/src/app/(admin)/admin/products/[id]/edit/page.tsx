import type { Metadata } from "next";
import { ProductEditLoader } from "@/features/admin/components/products/product-edit-loader";

export const metadata: Metadata = {
  title: "ویرایش محصول | پنل مدیریت ققنوس آکادمی",
  description: "ویرایش مشخصات، تصاویر با نسبت ۱:۱ و ویژگی‌های داینامیک محصول",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return <ProductEditLoader productId={id} />;
}
