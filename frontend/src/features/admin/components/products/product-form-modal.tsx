"use client";

import * as React from "react";
import {
  Package,
  Boxes,
  DollarSign,
  Tag,
  ShieldCheck,
  Cpu,
  Sparkles,
  AlertCircle,
  Building2,
  FileText,
  ImageIcon,
  Flame,
} from "lucide-react";
import type {
  AdminProduct,
  AdminProductCategory,
  AdminProductStatus,
  AdminTieredPrice,
} from "../../types/admin-products.types";
import {
  PRODUCT_CATEGORY_LABELS,
  POPULAR_BRANDS,
} from "../../types/admin-products.types";
import { formatPrice, resolveProductImageUrl } from "@/shared/lib/utils";
import { AdminActionModal } from "../shared";

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: AdminProduct | null;
  existingProducts?: AdminProduct[];
  onSave: (product: AdminProduct) => Promise<void> | void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  existingProducts,
  onSave,
}: ProductFormModalProps) {
  const isEditMode = Boolean(product);

  const [activeTab, setActiveTab] = React.useState<"general" | "pricing" | "specs">("general");

  // Form Fields
  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [category, setCategory] = React.useState<AdminProductCategory>("switches");
  const [brand, setBrand] = React.useState("Cisco");
  const [customBrand, setCustomBrand] = React.useState("");
  const [price, setPrice] = React.useState<number>(15000000);
  const [originalPrice, setOriginalPrice] = React.useState<number>(0);
  const [costPrice, setCostPrice] = React.useState<number>(12000000);
  const [stock, setStock] = React.useState<number>(10);
  const [minStockAlert, setMinStockAlert] = React.useState<number>(5);
  const [warehouseLocation, setWarehouseLocation] = React.useState("انبار مرکزی - قفسه A1");
  const [warranty, setWarranty] = React.useState("گارانتی ۳۶ ماهه طلایی تعویض درجا ققنوس");
  const [shortDescription, setShortDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [badgesText, setBadgesText] = React.useState("پرفروش, گارانتی طلایی");
  const [specsText, setSpecsText] = React.useState("۲۴ پورت گیگابیت, PoE+, ۴ پورت SFP");
  const [status, setStatus] = React.useState<AdminProductStatus>("active");
  const [featured, setFeatured] = React.useState<boolean>(false);
  const [isSpecialOffer, setIsSpecialOffer] = React.useState<boolean>(false);
  const [tieredPricing, setTieredPricing] = React.useState<AdminTieredPrice[]>([
    { minQuantity: 3, discountPercent: 5, label: "بسته ۳ تایی همکاری" },
    { minQuantity: 5, discountPercent: 10, label: "خرید سازمانی ۵ تایی" },
  ]);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Initialize or reset form state
  React.useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setCategory(product.category);
      if (POPULAR_BRANDS.includes(product.brand as any)) {
        setBrand(product.brand);
        setCustomBrand("");
      } else {
        setBrand("other");
        setCustomBrand(product.brand);
      }
      setPrice(product.price);
      setOriginalPrice(product.originalPrice || 0);
      setCostPrice(product.costPrice || Math.round(product.price * 0.8));
      setStock(product.stock);
      setMinStockAlert(product.minStockAlert || 5);
      setWarehouseLocation(product.warehouseLocation || "انبار مرکزی");
      setWarranty(product.warranty || "گارانتی طلایی تعویض درجا");
      setShortDescription(product.shortDescription || "");
      setImageUrl(product.images?.[0] || "");
      setBadgesText(product.badges?.join(", ") || "");
      setSpecsText(product.specs?.join(", ") || "");
      setStatus(product.status || "active");
      setFeatured(product.featured || false);
      setIsSpecialOffer(product.isSpecialOffer || false);
      setTieredPricing(
        product.tieredPricing && product.tieredPricing.length > 0
          ? product.tieredPricing
          : [
              { minQuantity: 3, discountPercent: 5, label: "بسته ۳ تایی همکاری" },
              { minQuantity: 5, discountPercent: 10, label: "خرید سازمانی ۵ تایی" },
            ]
      );
    } else {
      setName("");
      setSku("");
      setCategory("switches");
      setBrand("Cisco");
      setCustomBrand("");
      setPrice(18000000);
      setOriginalPrice(0);
      setCostPrice(14000000);
      setStock(10);
      setMinStockAlert(5);
      setWarehouseLocation("انبار مرکزی - قفسه A1");
      setWarranty("گارانتی ۳۶ ماهه طلایی تعویض درجا ققنوس");
      setShortDescription("");
      setImageUrl("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80");
      setBadgesText("اورجینال, گارانتی طلایی");
      setSpecsText("پورت گیگابیت, ریداندنت, مدیریت لایه ۳");
      setStatus("active");
      setFeatured(false);
      setIsSpecialOffer(false);
      setTieredPricing([
        { minQuantity: 3, discountPercent: 5, label: "بسته ۳ تایی همکاری" },
        { minQuantity: 5, discountPercent: 10, label: "خرید سازمانی ۵ تایی" },
      ]);
    }
    setFormError(null);
    setActiveTab("general");
  }, [product, isOpen]);

  const handleSubmit = async () => {
    setFormError(null);

    if (!name.trim()) {
      setFormError("لطفاً نام یا عنوان تجاری کالا را وارد نمایید.");
      setActiveTab("general");
      return;
    }

    if (!sku.trim()) {
      setFormError("پارت‌نامبر سازنده (SKU) الزامی است.");
      setActiveTab("general");
      return;
    }

    const cleanSku = sku.trim().toUpperCase();
    const duplicate = existingProducts?.find(
      (p) => p.sku.trim().toUpperCase() === cleanSku && p.id !== product?.id
    );
    if (duplicate) {
      setFormError(
        `پارت‌نامبر «${cleanSku}» تکراری است و قبلاً برای کالای «${duplicate.name}» ثبت شده است.`
      );
      setActiveTab("general");
      return;
    }

    if (price <= 0) {
      setFormError("قیمت فروش کالا باید بزرگتر از صفر باشد.");
      setActiveTab("pricing");
      return;
    }

    if (originalPrice > 0 && originalPrice <= price) {
      setFormError("قیمت اولیه باید بیشتر از قیمت فروش نهایی باشد تا تخفیف محاسبه گردد.");
      setActiveTab("pricing");
      return;
    }

    if (stock < 0) {
      setFormError("موجودی کالا نمی‌تواند منفی باشد.");
      setActiveTab("pricing");
      return;
    }

    const effectiveBrand = brand === "other" ? (customBrand.trim() || "نامشخص") : brand;

    // Support both English (,) and Persian (،) commas
    const badges = badgesText
      .split(/[,\u060C]/)
      .map((b) => b.trim())
      .filter(Boolean);

    const specs = specsText
      .split(/[,\u060C]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const images = imageUrl.trim()
      ? [imageUrl.trim()]
      : ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80"];

    const discountPercent =
      originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined;

    const nowStr = new Intl.DateTimeFormat("fa-IR").format(new Date());

    const savedProduct: AdminProduct = {
      id: product?.id || `prod-${Date.now()}`,
      name: name.trim(),
      slug: (sku.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || `item-${Date.now()}`),
      sku: cleanSku,
      category,
      brand: effectiveBrand,
      price,
      originalPrice: originalPrice > price ? originalPrice : undefined,
      discountPercent,
      costPrice: costPrice > 0 ? costPrice : Math.round(price * 0.8),
      stock,
      minStockAlert,
      reservedStock: product?.reservedStock || 0,
      warehouseLocation: warehouseLocation.trim() || "انبار مرکزی",
      status: stock === 0 && status === "active" ? "out_of_stock" : status,
      featured,
      isSpecialOffer: Boolean(isSpecialOffer || featured),
      inStock: stock > 0 && status !== "out_of_stock",
      rating: product?.rating || 5.0,
      reviewCount: product?.reviewCount || 1,
      images: product?.images && product.images.length > 1 ? [images[0], ...product.images.slice(1)] : images,
      warranty: warranty.trim(),
      badges,
      specs,
      specGroups: product?.specGroups || [],
      tieredPricing: tieredPricing,
      relatedProductIds: product?.relatedProductIds || [],
      relatedProducts: product?.relatedProducts || [],
      shortDescription: shortDescription.trim(),
      inventoryLogs: product?.inventoryLogs || [],
      createdAt: product?.createdAt || nowStr,
      updatedAt: nowStr,
    };

    setIsLoading(true);
    try {
      await onSave(savedProduct);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "ویرایش مشخصات کالا در انبار" : "افزودن محصول جدید به کاتالوگ انبار"}
      description={
        isEditMode
          ? `بروزرسانی مشخصات فنی و تجاری برای پارت‌نامبر ${sku}`
          : "مشخصات فنی و قیمت‌گذاری کالا را جهت ثبت در انبار و فروشگاه آنلاین تکمیل نمایید."
      }
      variant="primary"
      confirmLabel={isLoading ? "در حال ذخیره..." : isEditMode ? "ذخیره تغییرات" : "افزودن کالا به انبار"}
      cancelLabel="انصراف"
      onConfirm={handleSubmit}
      isLoading={isLoading}
      maxWidth="lg"
    >
      <div className="space-y-4 text-right pt-2" dir="rtl">
        {/* پیام خطای اعتبارسنجی */}
        {formError && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* زبانه‌های تب فرم (Tab Navigation) */}
        <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "general"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            ۱. مشخصات عمومی و هویت کالا
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "pricing"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            ۲. قیمت‌گذاری و مدیریت موجودی
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "specs"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            ۳. ویژگی‌ها و وضعیت عرضه
          </button>
        </div>

        {/* =========================================================================
            زبانه ۱: مشخصات عمومی
           ========================================================================= */}
        {activeTab === "general" && (
          <div className="space-y-3.5">
            {/* نام کالا */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                نام کامل محصول (فارسی) <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: سوئیچ ۲۴ پورت سیسکو مدل WS-C2960X-24PS-L"
                className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* پارت‌نامبر و دسته‌بندی */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  پارت‌نامبر / کد انبار (SKU) <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="WS-C2960X-24PS-L"
                  dir="ltr"
                  className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs font-mono font-bold text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  دسته‌بندی تجهیزات شبکه:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AdminProductCategory)}
                  className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                >
                  {Object.entries(PRODUCT_CATEGORY_LABELS).map(([catKey, catLabel]) => (
                    <option key={catKey} value={catKey}>
                      {catLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* برند سازنده */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  برند تولیدکننده:
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
                >
                  {POPULAR_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="other">سایر برندها (ورود دستی)</option>
                </select>
              </div>

              {brand === "other" && (
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    نام برند سفارشی:
                  </label>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="مثال: Allied Telesis"
                    className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}

              <div className={brand === "other" ? "sm:col-span-2" : ""}>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  شرایط گارانتی و ضمانت:
                </label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="گارانتی ۳۶ ماهه طلایی تعویض درجا"
                  className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* آدرس تصویر محصول و پیش‌نمایش */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                آدرس تصویر کالا (URL):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  dir="ltr"
                  className="h-10 flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs font-mono text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                />
                {imageUrl && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveProductImageUrl(imageUrl)}
                      alt="پیش‌نمایش"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                    <ImageIcon className="h-4 w-4 text-neutral-600 -z-10 absolute" />
                  </div>
                )}
              </div>
            </div>

            {/* توضیحات مختصر کالا */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                توضیحات کوتاه تجاری کالا:
              </label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="توضیحاتی مختصر پیرامون کاربرد و ویژگی‌های شاخص سوئیچ یا تجهیز..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            زبانه ۲: قیمت‌گذاری و انبارداری
           ========================================================================= */}
        {activeTab === "pricing" && (
          <div className="space-y-3.5">
            {/* قیمت فروش و قیمت اصلی */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  قیمت فروش نهایی (تومان) <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="number"
                  step="100000"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  dir="ltr"
                  className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs font-mono font-bold text-emerald-400 focus:border-orange-500 focus:outline-none"
                />
                <span className="text-[11px] text-neutral-400 mt-0.5 block">
                  معادل: {formatPrice(price)}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  قیمت اولیه قبل از تخفیف (اختیاری):
                </label>
                <input
                  type="number"
                  step="100000"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  dir="ltr"
                  placeholder="0"
                  className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs font-mono text-neutral-300 focus:border-orange-500 focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  در صورت وارد کردن، درصد تخفیف خودکار محاسبه می‌گردد
                </span>
              </div>
            </div>

            {/* بهای تمام شده برای محاسبه سود */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                بهای تمام‌شده انبار / قیمت خرید (تومان):
              </label>
              <input
                type="number"
                step="100000"
                value={costPrice}
                onChange={(e) => setCostPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                dir="ltr"
                className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs font-mono text-neutral-300 focus:border-orange-500 focus:outline-none"
              />
              <span className="text-[11px] text-sky-400 mt-0.5 block">
                سود ناخالص هر واحد: {formatPrice(Math.max(0, price - costPrice))}
              </span>
            </div>

            {/* موجودی و هشدار آستانه */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-neutral-800">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  تعداد موجودی فیزیکی انبار <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  dir="ltr"
                  className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs font-mono font-bold text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  آستانه هشدار کسری موجودی:
                </label>
                <input
                  type="number"
                  min="1"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  dir="ltr"
                  className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs font-mono text-neutral-300 focus:border-orange-500 focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 mt-0.5 block">
                  در صورت رسیدن موجودی به این عدد، سیستم هشدار می‌دهد
                </span>
              </div>
            </div>

            {/* موقعیت قفسه در انبار */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                کد قفسه و محل نگهداری در انبار:
              </label>
              <input
                type="text"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                placeholder="مثال: انبار مرکزی - قفسه B2-05"
                className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* طرح‌های تخفیف پلکانی B2B */}
            <div className="pt-2 border-t border-neutral-800 space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                تخفیف‌های پلکانی همکاری و فروش B2B:
              </label>
              <div className="space-y-2">
                {tieredPricing.map((tier, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800 text-xs"
                  >
                    <input
                      type="text"
                      value={tier.label}
                      onChange={(e) => {
                        const next = [...tieredPricing];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setTieredPricing(next);
                      }}
                      placeholder="عنوان طرح"
                      className="h-8 flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-2 text-xs text-white"
                    />
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <span>حداقل:</span>
                      <input
                        type="number"
                        min="2"
                        value={tier.minQuantity}
                        onChange={(e) => {
                          const next = [...tieredPricing];
                          next[idx] = {
                            ...next[idx],
                            minQuantity: Math.max(2, parseInt(e.target.value, 10) || 2),
                          };
                          setTieredPricing(next);
                        }}
                        className="h-8 w-12 rounded-lg border border-neutral-700 bg-neutral-900 px-1 text-center font-mono text-white text-xs"
                      />
                      <span>عدد</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                      <span>تخفیف:</span>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={tier.discountPercent}
                        onChange={(e) => {
                          const next = [...tieredPricing];
                          next[idx] = {
                            ...next[idx],
                            discountPercent: Math.max(1, Math.min(90, parseInt(e.target.value, 10) || 1)),
                          };
                          setTieredPricing(next);
                        }}
                        className="h-8 w-12 rounded-lg border border-neutral-700 bg-neutral-900 px-1 text-center font-mono text-emerald-400 text-xs font-bold"
                      />
                      <span>٪</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTieredPricing(tieredPricing.filter((_, i) => i !== idx))}
                      className="text-neutral-500 hover:text-rose-400 p-1 text-xs cursor-pointer"
                      title="حذف سطح تخفیف"
                    >
                      حذف
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setTieredPricing([
                      ...tieredPricing,
                      { minQuantity: 5, discountPercent: 8, label: "بسته ۵ تایی سازمانی" },
                    ])
                  }
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer block"
                >
                  + افزودن سطح جدید به قیمت‌گذاری پلکانی
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            زبانه ۳: مشخصات و وضعیت
           ========================================================================= */}
        {activeTab === "specs" && (
          <div className="space-y-3.5">
            {/* برچسب‌ها (Badges) */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                برچسب‌های بازاریابی (با کاما انگلیسی جدا کنید):
              </label>
              <input
                type="text"
                value={badgesText}
                onChange={(e) => setBadgesText(e.target.value)}
                placeholder="پرفروش, گارانتی طلایی, تست فلوک پاس"
                className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* مشخصات سریع (Specs) */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                مشخصات فنی کلیدی (با کاما انگلیسی جدا کنید):
              </label>
              <input
                type="text"
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
                placeholder="۲۴ پورت گیگابیت, توان ۳۷۰ وات PoE+, ۴ اسلات SFP"
                className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* وضعیت در فروشگاه */}
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                وضعیت عرضه در فروشگاه آنلاین:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminProductStatus)}
                className="h-10 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="active">فعال و قابل خرید در فروشگاه آنلاین</option>
                <option value="inactive">پیش‌نویس / غیرفعال (پنهان از دید خریداران)</option>
                <option value="out_of_stock">اتمام موجودی در انبار</option>
                <option value="discontinued">توقف تولید توسط کارخانه</option>
              </select>
            </div>

            {/* چک‌باکس‌های فروش ویژه و کالای شاخص */}
            <div className="pt-3 border-t border-neutral-800 space-y-3">
              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSpecialOffer}
                    onChange={(e) => setIsSpecialOffer(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-orange-600 focus:ring-orange-500/30 accent-orange-500"
                  />
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    نمایش در فروش ویژه (پیشنهاد شگفت‌انگیز صفحه اصلی با تایمر و تخفیف)
                  </span>
                </label>
                <span className="text-[11px] text-neutral-400 block mt-0.5 mr-6">
                  این کالا مستقیماً به ردیف و اسلایدر فروش ویژه صفحه نخست سایت اضافه خواهد شد.
                </span>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-purple-500/30 accent-purple-500"
                  />
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    نمایش به عنوان کالای شاخص و منتخب در کاتالوگ (Featured)
                  </span>
                </label>
                <span className="text-[11px] text-neutral-400 block mt-0.5 mr-6">
                  کالاهای شاخص در اولویت رتبه‌بندی و پیش‌فرض جستجوی کاتالوگ قرار می‌گیرند.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminActionModal>
  );
}
