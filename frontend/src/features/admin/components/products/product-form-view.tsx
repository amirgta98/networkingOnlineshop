"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Layers,
  Sparkles,
  DollarSign,
  Boxes,
  ShieldCheck,
  Check,
  ArrowRight,
  AlertCircle,
  Loader2,
  Save,
  Building2,
  FileText,
  Tag,
  Cpu,
  Flame,
} from "lucide-react";
import type {
  AdminProduct,
  AdminProductCategory,
  AdminProductStatus,
  AdminProductFeature,
  AdminTieredPrice,
} from "../../types/admin-products.types";
import {
  PRODUCT_CATEGORY_LABELS,
  POPULAR_BRANDS,
} from "../../types/admin-products.types";
import { ProductImageUploader } from "./product-image-uploader";
import { ProductFeaturesManager } from "./product-features-manager";
import { ProductRelationsManager } from "./product-relations-manager";
import { productsApi } from "../../api/products-api";
import { categoriesApi } from "../../api/categories-api";
import type { AdminCategory } from "../../types/admin-categories.types";
import { Button } from "@/shared/components/ui/button";
import { cn, formatPrice } from "@/shared/lib/utils";

export interface ProductFormViewProps {
  initialProduct?: AdminProduct | null;
  isEditMode?: boolean;
  productId?: string;
}

export function ProductFormView({
  initialProduct,
  isEditMode = false,
  productId,
}: ProductFormViewProps) {
  let router: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    // safe fallback in test environments
  }

  // Active Section Tab
  const [activeTab, setActiveTab] = React.useState<
    "general" | "media" | "features" | "relations" | "pricing"
  >("general");

  // Related Products State
  const [relatedProductIds, setRelatedProductIds] = React.useState<string[]>(
    initialProduct?.relatedProductIds || []
  );

  // General Information
  const [name, setName] = React.useState(initialProduct?.name || "");
  const [slug, setSlug] = React.useState(initialProduct?.slug || "");
  const [sku, setSku] = React.useState(initialProduct?.sku || "");
  const [category, setCategory] = React.useState<string>(
    initialProduct?.category || "switches"
  );
  const [availableCategories, setAvailableCategories] = React.useState<AdminCategory[]>([]);

  React.useEffect(() => {
    categoriesApi
      .getCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setAvailableCategories(cats);
        }
      })
      .catch(() => {});
  }, []);
  const [brand, setBrand] = React.useState<string>(initialProduct?.brand || "Cisco");
  const [customBrand, setCustomBrand] = React.useState<string>("");
  const [warranty, setWarranty] = React.useState<string>(
    initialProduct?.warranty || "گارانتی طلایی ۳۶ ماهه ققنوس آکادمی"
  );
  const [shortDescription, setShortDescription] = React.useState<string>(
    initialProduct?.shortDescription || ""
  );
  const [fullDescription, setFullDescription] = React.useState<string>(
    initialProduct?.fullDescription || ""
  );
  const [badgesText, setBadgesText] = React.useState<string>(
    initialProduct?.badges?.join(", ") || "گارانتی اصلی, تحویل فوری"
  );

  // Images & Media
  const [images, setImages] = React.useState<string[]>(initialProduct?.images || []);

  // Dynamic Features
  const [features, setFeatures] = React.useState<AdminProductFeature[]>(
    initialProduct?.features || [
      {
        id: "feat-init-1",
        title: "نوع پورت‌ها",
        description: "۲۴ پورت گیگابیت اترنت با پشتیبانی کامل از PoE+",
        iconName: "network",
        sortOrder: 0,
      },
      {
        id: "feat-init-2",
        title: "ماژول‌های آپ‌لینک",
        description: "۴ اسلات ۱ گیگابیت SFP برای ارتباطات فیبر نوری",
        iconName: "layers",
        sortOrder: 1,
      },
      {
        id: "feat-init-3",
        title: "توان خروجی منبع تغذیه",
        description: "توان کل ۳۷۰ وات با مصرف بهینه سازمانی",
        iconName: "zap",
        sortOrder: 2,
      },
    ]
  );

  // Pricing & Inventory
  const [price, setPrice] = React.useState<number>(initialProduct?.price || 15000000);
  const [originalPrice, setOriginalPrice] = React.useState<number>(
    initialProduct?.originalPrice || 0
  );
  const [costPrice, setCostPrice] = React.useState<number>(
    initialProduct?.costPrice || 12000000
  );
  const [stock, setStock] = React.useState<number>(initialProduct?.stock ?? 10);
  const [minStockAlert, setMinStockAlert] = React.useState<number>(
    initialProduct?.minStockAlert ?? 5
  );
  const [warehouseLocation, setWarehouseLocation] = React.useState<string>(
    initialProduct?.warehouseLocation || "انبار مرکزی تهران - قفسه A1"
  );
  const [status, setStatus] = React.useState<AdminProductStatus>(
    initialProduct?.status || "active"
  );
  const [featured, setFeatured] = React.useState<boolean>(initialProduct?.featured ?? false);
  const [isSpecialOffer, setIsSpecialOffer] = React.useState<boolean>(
    initialProduct?.isSpecialOffer ?? false
  );

  // States
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Auto-generate slug from name if creating
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode && !slug) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Validation
  const validateForm = (): boolean => {
    setFormError(null);

    if (!name.trim()) {
      setFormError("نام محصول الزامی است.");
      setActiveTab("general");
      return false;
    }

    if (!sku.trim()) {
      setFormError("شناسه یکتای انبار (SKU / پارت‌نامبر) الزامی است.");
      setActiveTab("general");
      return false;
    }

    if (price <= 0) {
      setFormError("قیمت فروش محصول باید بزرگتر از صفر باشد.");
      setActiveTab("pricing");
      return false;
    }

    if (stock < 0) {
      setFormError("تعداد موجودی انبار نمی‌تواند منفی باشد.");
      setActiveTab("pricing");
      return false;
    }

    if (images.length === 0) {
      setFormError("لطفاً حداقل یک تصویر برای محصول بارگذاری نمایید.");
      setActiveTab("media");
      return false;
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError(null);

    // Split badges
    const badges = badgesText
      .split(/[,\u060C]/)
      .map((b) => b.trim())
      .filter(Boolean);

    // Filter and sanitize features to ensure valid structure
    const cleanedFeatures = features
      .filter((f) => f.title?.trim() && f.description?.trim())
      .map((f, idx) => ({
        id: f.id,
        title: f.title.trim(),
        description: f.description.trim(),
        iconUrl: f.iconUrl || undefined,
        iconName: f.iconName || "network",
        sortOrder: f.sortOrder ?? idx,
      }));

    // Prepare specs array from features for backward-compatibility
    const specs = cleanedFeatures
      .map((f) => `${f.title}: ${f.description}`)
      .filter(Boolean);

    const finalBrand = brand === "other" && customBrand.trim() ? customBrand.trim() : brand;
    const cleanSku = sku.trim().toUpperCase();

    const payload: Partial<AdminProduct> = {
      name: name.trim(),
      slug: slug.trim() || `prod-${Date.now()}`,
      sku: cleanSku,
      category: category as AdminProductCategory,
      brand: finalBrand,
      price: Number(price) || 0,
      originalPrice: originalPrice > price ? Number(originalPrice) : undefined,
      costPrice: costPrice > 0 ? Number(costPrice) : undefined,
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 0,
      warehouseLocation: warehouseLocation.trim() || "انبار مرکزی",
      status,
      featured,
      isSpecialOffer: Boolean(isSpecialOffer || featured),
      discountPercent:
        originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : undefined,
      inStock: Number(stock) > 0 && status !== "out_of_stock",
      images,
      warranty: warranty.trim() || undefined,
      badges,
      specs,
      features: cleanedFeatures,
      relatedProductIds,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
    };

    try {
      if (isEditMode && productId) {
        await productsApi.updateProduct(productId, payload);
        setSuccessMessage("اطلاعات محصول با موفقیت به‌روزرسانی شد. در حال بازگشت به لیست...");
      } else {
        await productsApi.createProduct(payload);
        setSuccessMessage("محصول جدید با موفقیت ایجاد و ثبت گردید. در حال بازگشت به لیست...");
      }

      // Synchronize with LocalStorage for offline fallback
      try {
        const saved = localStorage.getItem("velox_admin_products_v1");
        const list: AdminProduct[] = saved ? JSON.parse(saved) : [];
        if (isEditMode && productId) {
          const updatedList = list.map((p) =>
            p.id === productId ? ({ ...p, ...payload, updatedAt: new Date().toISOString() } as AdminProduct) : p
          );
          localStorage.setItem("velox_admin_products_v1", JSON.stringify(updatedList));
        } else {
          const newProduct: AdminProduct = {
            ...(payload as AdminProduct),
            id: `prod-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem("velox_admin_products_v1", JSON.stringify([newProduct, ...list]));
        }
      } catch {
        // ignore
      }

      // Redirect back to products list
      setTimeout(() => {
        if (router) {
          router.push("/admin/products");
        } else if (typeof window !== "undefined" && window.location) {
          window.location.href = "/admin/products";
        }
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور و ذخیره محصول.";
      setFormError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1.5">
            <Link
              href="/admin/products"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <Package className="w-3.5 h-3.5" />
              مدیریت محصولات
            </Link>
            <span>/</span>
            <span className="text-white font-medium">
              {isEditMode ? "ویرایش مشخصات محصول" : "افزودن محصول جدید"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Package className="w-6 h-6" />
            </span>
            {isEditMode ? `ویرایش محصول: ${initialProduct?.name || ""}` : "افزودن محصول جدید به کاتالوگ"}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            مشخصات فنی، تصاویر با برش ۱:۱ و واترمارک، ویژگی‌های داینامیک و انبارداری کالا را تکمیل فرمایید.
          </p>
        </div>

        {/* Back and Save Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Link prefetch={false} href="/admin/products">
            <Button
              type="button"
              variant="outline"
              className="border-white/15 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 text-xs h-10 px-4"
            >
              <ArrowRight className="w-4 h-4 ml-1.5" />
              بازگشت به لیست
            </Button>
          </Link>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال پردازش و ذخیره...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? "ذخیره تغییرات محصول" : "ثبت و انتشار محصول"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {formError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-xs text-rose-300 flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="font-medium">{formError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-xs text-emerald-300 flex items-center gap-3 animate-in fade-in">
          <Check className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-r border-l transition-all shrink-0",
            activeTab === "general"
              ? "bg-[#141417] border-white/15 text-emerald-400 border-b-transparent -mb-px"
              : "border-transparent text-neutral-400 hover:text-white"
          )}
        >
          <FileText className="w-4 h-4" />
          اطلاعات اصلی محصول
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-r border-l transition-all shrink-0",
            activeTab === "media"
              ? "bg-[#141417] border-white/15 text-emerald-400 border-b-transparent -mb-px"
              : "border-transparent text-neutral-400 hover:text-white"
          )}
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          تصاویر و واترمارک ({images.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("features")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-r border-l transition-all shrink-0",
            activeTab === "features"
              ? "bg-[#141417] border-white/15 text-emerald-400 border-b-transparent -mb-px"
              : "border-transparent text-neutral-400 hover:text-white"
          )}
        >
          <Cpu className="w-4 h-4" />
          ویژگی‌های داینامیک ({features.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("relations")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-r border-l transition-all shrink-0",
            activeTab === "relations"
              ? "bg-[#141417] border-white/15 text-emerald-400 border-b-transparent -mb-px"
              : "border-transparent text-neutral-400 hover:text-white"
          )}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          محصولات مرتبط ({relatedProductIds.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-r border-l transition-all shrink-0",
            activeTab === "pricing"
              ? "bg-[#141417] border-white/15 text-emerald-400 border-b-transparent -mb-px"
              : "border-transparent text-neutral-400 hover:text-white"
          )}
        >
          <Boxes className="w-4 h-4" />
          قیمت‌گذاری و انبار
        </button>
      </div>

      {/* Form Content Area */}
      <form onSubmit={handleSubmit} className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8">
        {/* ─── TAB 1: GENERAL INFORMATION ─── */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200 flex items-center justify-between">
                  <span>نام کامل کالا (فارسی و انگلیسی) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سوئیچ ۲۴ پورت سیسکو WS-C2960X-24PS-L"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* SKU / Part Number */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">
                  شناسه یکتای کالا (SKU / پارت‌نامبر) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="WS-C2960X-24PS-L"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full h-11 px-4 text-xs font-mono bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-200">دسته‌بندی تجهیزات *</label>
                  <Link
                    href="/admin/categories"
                    target="_blank"
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
                  >
                    <span>+ مدیریت دسته‌ها</span>
                  </Link>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                >
                  {availableCategories.length > 0
                    ? availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.slug} className="bg-[#18181b] text-white">
                          {cat.shortName} ({cat.slug})
                        </option>
                      ))
                    : Object.entries(PRODUCT_CATEGORY_LABELS).map(([catKey, catLabel]) => (
                        <option key={catKey} value={catKey} className="bg-[#18181b] text-white">
                          {catLabel}
                        </option>
                      ))}
                </select>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">برند تجاری *</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full h-11 px-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    {POPULAR_BRANDS.map((b) => (
                      <option key={b} value={b} className="bg-[#18181b] text-white">
                        {b}
                      </option>
                    ))}
                    <option value="other" className="bg-[#18181b] text-white">
                      سایر برندها...
                    </option>
                  </select>

                  {brand === "other" && (
                    <input
                      type="text"
                      placeholder="نام برند دیگر..."
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="w-full h-11 px-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  )}
                </div>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">
                  نامک در پیوند یکتا (Slug URL)
                </label>
                <input
                  type="text"
                  placeholder="cisco-ws-c2960x-24ps-l"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full h-11 px-4 text-xs font-mono bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Warranty */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">مدت و شرایط گارانتی</label>
                <input
                  type="text"
                  placeholder="گارانتی ۳۶ ماهه تعویض درجا طلایی ققنوس"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-200">
                برچسب‌ها و نشان‌های تبلیغاتی (با ویرگول جدا کنید)
              </label>
              <input
                type="text"
                placeholder="پرفروش، گارانتی اصلی، تخفیف ویژه سازمانی، ارسال رایگان"
                value={badgesText}
                onChange={(e) => setBadgesText(e.target.value)}
                className="w-full h-11 px-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-200">
                توضیحات کوتاه و چکیده کالا (نمایش در کارت محصول)
              </label>
              <textarea
                rows={2}
                placeholder="سوئیچ لایه ۲ انترپرایز با قابلیت استک‌پذیری، پورت‌های گیگابیت اترنت PoE+ و توان ۳۷۰ وات"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full p-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-200">
                توضیحات کامل و مشخصات کاربردی محصول
              </label>
              <textarea
                rows={5}
                placeholder="توضیحات جامع پیرامون کاربرد در دیتاسنترها، سناریوهای استقرار شبکه و استانداردهای پشتیبانی‌شده..."
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full p-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 2: MEDIA & WATERMARK ─── */}
        {activeTab === "media" && (
          <div className="space-y-6">
            <div className="bg-[#161619] border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                آپلود، برش ۱:۱ و اعمال واترمارک تصاویر
              </h3>
              <p className="text-xs text-neutral-400">
                تصاویر به صورت مستقیم از سیستم کاربر دریافت، به نسبت دقیق ۱:۱ برش داده شده و واترمارک رسمی ققنوس آکادمی بر روی آن‌ها اعمال می‌گردد.
              </p>
            </div>

            <ProductImageUploader
              images={images}
              onChange={setImages}
              maxFiles={10}
              maxSizeMb={10}
            />
          </div>
        )}

        {/* ─── TAB 3: DYNAMIC FEATURES ─── */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <ProductFeaturesManager
              features={features}
              onChange={setFeatures}
            />
          </div>
        )}

        {/* ─── TAB 4: RELATED PRODUCTS ─── */}
        {activeTab === "relations" && (
          <div className="space-y-6">
            <ProductRelationsManager
              currentProductId={productId || initialProduct?.id}
              selectedIds={relatedProductIds}
              onChange={setRelatedProductIds}
            />
          </div>
        )}

        {/* ─── TAB 5: PRICING & INVENTORY ─── */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Selling Price */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">
                  قیمت فروش نهایی (تومان) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full h-11 pl-12 pr-4 text-xs font-mono bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
                    تومان
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono">
                  معادل: {formatPrice(price)}
                </p>
              </div>

              {/* Compare At Price / Original Price */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">
                  قیمت قبل از تخفیف (اختیاری)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full h-11 pl-12 pr-4 text-xs font-mono bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
                    تومان
                  </span>
                </div>
                {originalPrice > price && (
                  <p className="text-[11px] text-orange-400 font-mono">
                    تخفیف: {Math.round(((originalPrice - price) / originalPrice) * 100)}٪
                  </p>
                )}
              </div>

              {/* Cost Price */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">
                  قیمت تمام‌شده خرید کالا (تومان)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full h-11 pl-12 pr-4 text-xs font-mono bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
                    تومان
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">
                  حاشیه سود: {formatPrice(price - costPrice)}
                </p>
              </div>

              {/* Physical Stock */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">
                  موجودی فیزیکی در انبار (عدد) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full h-11 px-4 text-xs font-mono bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Minimum Stock Alert */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">
                  آستانه هشدار کسری موجودی
                </label>
                <input
                  type="number"
                  min={0}
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(Number(e.target.value))}
                  className="w-full h-11 px-4 text-xs font-mono bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Warehouse Location */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">محل استقرار در انبار</label>
                <input
                  type="text"
                  placeholder="انبار مرکزی - قفسه C3"
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  className="w-full h-11 px-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-200">وضعیت در فروشگاه</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AdminProductStatus)}
                  className="w-full h-11 px-4 text-xs bg-[#18181b] border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors"
                >
                  <option value="active" className="bg-[#18181b]">فعال در فروشگاه</option>
                  <option value="inactive" className="bg-[#18181b]">پیش‌نویس / غیرفعال</option>
                  <option value="out_of_stock" className="bg-[#18181b]">اتمام موجودی</option>
                  <option value="discontinued" className="bg-[#18181b]">توقف تولید</option>
                </select>
              </div>

              {/* Special Offer and Featured toggles */}
              <div className="space-y-3 flex flex-col justify-end">
                <label className="flex items-center gap-3 p-3 bg-[#18181b] border border-orange-500/20 rounded-xl cursor-pointer hover:border-orange-500/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={isSpecialOffer}
                    onChange={(e) => setIsSpecialOffer(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      نمایش در فروش ویژه (پیشنهاد شگفت‌انگیز)
                    </span>
                    <span className="text-[10px] text-neutral-400">نمایش در اسلایدر و گردونه فروش ویژه صفحه نخست</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#18181b] border border-white/10 rounded-xl cursor-pointer hover:border-purple-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      کالای منتخب و ویژه (Featured)
                    </span>
                    <span className="text-[10px] text-neutral-400">نمایش به عنوان کالای شاخص و اولویت در کاتالوگ</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Form Actions */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <Link prefetch={false} href="/admin/products">
            <Button
              type="button"
              variant="outline"
              className="border-white/15 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 text-xs"
            >
              انصراف
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-6 flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال ذخیره‌سازی...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEditMode ? "ذخیره نهایی ویرایش محصول" : "ثبت نهایی و انتشار کالا"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
