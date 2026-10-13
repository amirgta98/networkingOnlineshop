import type { Metadata } from "next";
import { ProductFormView } from "@/features/admin/components/products/product-form-view";

export const metadata: Metadata = {
  title: "افزودن محصول جدید | پنل مدیریت ققنوس آکادمی",
  description: "ثبت تجهیزات جدید شبکه با آپلود و برش ۱:۱ تصاویر، واترمارک و تعریف ویژگی‌های داینامیک",
};

export default function NewProductPage() {
  return <ProductFormView isEditMode={false} />;
}
