"use client";

import * as React from "react";
import { Product, ProductOptionValue } from "@/features/catalog/types";
import { SelectedOptionDetail } from "@/features/cart/types";
import { ProductDetailTabId } from "../types";
import { ProductBreadcrumbs } from "./product-breadcrumbs";
import { ProductGallery } from "./product-gallery";
import { ProductInfo } from "./product-info";
import { ProductVariants } from "./product-variants";
import { ProductActions } from "./product-actions";
import { ProductTrustBadges } from "./product-trust-badges";
import { ProductTabs } from "./product-tabs";
import { ProductSpecsTable } from "./product-specs-table";
import { ProductOverview } from "./product-overview";
import { ProductReviews } from "./product-reviews";
import { ProductDownloads } from "./product-downloads";
import { ProductStickyBar } from "./product-sticky-bar";
import { RelatedProducts } from "./related-products";
import Link from "next/link";
import { Home } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { RollingNumber } from "@/shared/components/motion";
import { useCart } from "@/features/cart";
import {
  useMobileAppBar,
  AddToCartCounter,
} from "@/shared/components/layout/mobile-app-bar";

export interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  // Cart Hook for bidirectional sync
  const { items, updateQuantity } = useCart();

  // 1. Gallery Image Index State
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  // 2. Variants / Options State
  const [selectedOptions, setSelectedOptions] = React.useState<
    Record<string, SelectedOptionDetail>
  >(() => {
    const initial: Record<string, SelectedOptionDetail> = {};
    if (product.options) {
      for (const opt of product.options) {
        const defaultVal =
          opt.values.find((v) => v.value === opt.defaultSelected) ||
          opt.values[0];
        if (defaultVal) {
          initial[opt.id] = {
            optionName: opt.name,
            value: defaultVal.value,
            valueLabel: defaultVal.label,
            priceModifier: defaultVal.priceModifier || 0,
          };
        }
      }
    }
    return initial;
  });

  // Unique options key matching useCart logic
  const optionsKey = React.useMemo(() => {
    return selectedOptions
      ? Object.entries(selectedOptions)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v.value}`)
          .join("|")
      : "";
  }, [selectedOptions]);

  // Find matching items in cart for this product and selected options
  const matchingCartItems = React.useMemo(() => {
    return items.filter((item) => {
      if (item.product.id !== product.id) return false;
      if (!optionsKey) return true;
      const itemOptionsKey = item.selectedOptions
        ? Object.entries(item.selectedOptions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v.value}`)
            .join("|")
        : "";
      return itemOptionsKey === optionsKey;
    });
  }, [items, product.id, optionsKey]);

  const inCartCount = matchingCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const primaryCartItem = matchingCartItems[0];

  // 3. Quantity State: if item is already in cart, active quantity is inCartCount, otherwise local selectedQuantity
  const [selectedQuantity, setSelectedQuantity] = React.useState(1);
  const activeQuantity = inCartCount > 0 ? inCartCount : selectedQuantity;

  // 4. Tabs State
  const [activeTab, setActiveTab] = React.useState<ProductDetailTabId>("specs");
  const tabsSectionRef = React.useRef<HTMLDivElement | null>(null);

  // Calculate Base Unit Price with Options
  const { unitPrice, calculatedOriginalPrice } = React.useMemo(() => {
    const optionsModifier = Object.values(selectedOptions).reduce(
      (acc, curr) => acc + (curr.priceModifier || 0),
      0
    );

    const finalPrice = product.price + optionsModifier;
    const finalOriginalPrice = product.originalPrice
      ? product.originalPrice + optionsModifier
      : undefined;

    return {
      unitPrice: finalPrice,
      calculatedOriginalPrice: finalOriginalPrice,
    };
  }, [product.price, product.originalPrice, selectedOptions]);

  // Dynamic unit price getter based on quantity (supports tiered discounts)
  const getUnitPriceForQuantity = React.useCallback(
    (qty: number) => {
      const rules = product.tieredPricing;
      if (!rules || rules.length === 0) return unitPrice;
      const sorted = [...rules].sort((a, b) => a.minQuantity - b.minQuantity);
      const active = [...sorted].reverse().find((r) => qty >= r.minQuantity);
      if (!active || active.discountPercent <= 0) return unitPrice;
      return Math.round(unitPrice * (1 - active.discountPercent / 100));
    },
    [product.tieredPricing, unitPrice]
  );

  // Tiered Pricing Calculation based on current active quantity
  const { activeTier, tieredDiscountPercent, effectiveUnitPrice, totalPrice } =
    React.useMemo(() => {
      const discountedUnit = getUnitPriceForQuantity(activeQuantity);
      const rules = product.tieredPricing;
      const sorted = rules ? [...rules].sort((a, b) => a.minQuantity - b.minQuantity) : [];
      const active = sorted.reverse().find((r) => activeQuantity >= r.minQuantity) || null;
      const discount = active ? active.discountPercent : 0;
      const total = discountedUnit * activeQuantity;

      return {
        activeTier: active,
        tieredDiscountPercent: discount,
        effectiveUnitPrice: discountedUnit,
        totalPrice: total,
      };
    }, [activeQuantity, getUnitPriceForQuantity, product.tieredPricing]);

  // Centralized quantity change handler (used by stepper, mobile navbar, and tiered quick chips)
  const handleQuantityChange = React.useCallback(
    (newQty: number) => {
      const safeQty = Math.max(1, newQty);
      setSelectedQuantity(safeQty);
      if (primaryCartItem) {
        const newUnitPrice = getUnitPriceForQuantity(safeQty);
        updateQuantity(primaryCartItem.id, safeQty, newUnitPrice);
      }
    },
    [primaryCartItem, getUnitPriceForQuantity, updateQuantity]
  );

  // Handle Option Selection
  const handleSelectOption = (
    optionId: string,
    optionName: string,
    val: ProductOptionValue
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: {
        optionName,
        value: val.value,
        valueLabel: val.label,
        priceModifier: val.priceModifier || 0,
      },
    }));
  };

  // Scroll to Reviews Tab
  const handleReviewsClick = () => {
    setActiveTab("reviews");
    if (tabsSectionRef.current) {
      tabsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Discount calculations for mobile price element
  const hasDiscount = Boolean(
    calculatedOriginalPrice && calculatedOriginalPrice > unitPrice
  );
  const discountPercent =
    calculatedOriginalPrice && hasDiscount
      ? Math.round(((calculatedOriginalPrice - unitPrice) / calculatedOriginalPrice) * 100)
      : product.discountPercent || 0;

  // 5. Connect to Reusable Mobile App Bar (Price is completely separated from Add to Cart / Counter)
  const mobileBarConfig = React.useMemo(
    () => ({
      // Separate Dedicated Price Element with live RollingNumber
      priceElement: (
        <div className="flex flex-col items-start justify-center shrink-0 pr-1 select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-neutral-400 font-medium">
              {activeQuantity > 1 ? `مجموع (${toPersianDigits(activeQuantity)} عدد):` : "قیمت نهایی:"}
            </span>
            {tieredDiscountPercent > 0 ? (
              <span className="rounded bg-emerald-600 px-1 py-0.2 text-[9px] font-black text-white">
                {toPersianDigits(tieredDiscountPercent)}٪ تخفیف
              </span>
            ) : hasDiscount && discountPercent > 0 ? (
              <span className="rounded bg-red-600 px-1 py-0.2 text-[9px] font-black text-white">
                {toPersianDigits(discountPercent)}٪
              </span>
            ) : null}
          </div>
          <RollingNumber
            value={totalPrice}
            className="text-sm font-black text-white tracking-tight"
            currencyClassName="text-[10px]"
          />
        </div>
      ),

      // Separate Primary Action: Add to Cart / Numeric Counter Box
      primaryAction: (
        <AddToCartCounter
          product={product}
          selectedOptions={selectedOptions}
          unitPrice={effectiveUnitPrice}
          selectedQuantity={activeQuantity}
          onQuantityChange={handleQuantityChange}
          getUnitPriceForQuantity={getUnitPriceForQuantity}
          showPrice={false}
        />
      ),

      // Separate Leading Action: Home Button (on the left in RTL)
      leadingAction: (
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-0.5 text-neutral-400 hover:text-white px-2 py-1 rounded-xl transition-colors active:scale-95 text-[10px] font-medium shrink-0"
          aria-label="رفتن به صفحه اصلی"
        >
          <Home className="h-5 w-5" />
          <span>خانه</span>
        </Link>
      ),
    }),
    [
      product,
      selectedOptions,
      effectiveUnitPrice,
      totalPrice,
      activeQuantity,
      tieredDiscountPercent,
      hasDiscount,
      discountPercent,
      handleQuantityChange,
      getUnitPriceForQuantity,
    ]
  );

  useMobileAppBar(mobileBarConfig);

  return (
    <div className="py-6 sm:py-10 flex flex-col gap-10 sm:gap-14" dir="rtl">
      <Container className="flex flex-col gap-6 sm:gap-8">
        {/* ── Breadcrumb Navigation ─────────────────────────────────────── */}
        <ProductBreadcrumbs product={product} />

        {/* ── Main Hero Two-Column Layout ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Right Column (RTL): Gallery Stage (5 cols on lg) */}
          <div className="lg:col-span-5 w-full">
            <ProductGallery
              product={product}
              activeImageIndex={activeImageIndex}
              onSelectImage={setActiveImageIndex}
            />
          </div>

          {/* Left Column (RTL): Product Info, Configurator & Actions (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ProductInfo
              product={product}
              quantity={activeQuantity}
              unitPrice={unitPrice}
              effectiveUnitPrice={effectiveUnitPrice}
              totalPrice={totalPrice}
              calculatedOriginalPrice={calculatedOriginalPrice}
              tieredDiscountPercent={tieredDiscountPercent}
              onSelectTierQuantity={handleQuantityChange}
              onReviewsClick={handleReviewsClick}
            />

            {/* Configurable Variants (if any) */}
            {product.options && product.options.length > 0 && (
              <ProductVariants
                options={product.options}
                selectedOptions={selectedOptions}
                onSelectOption={handleSelectOption}
              />
            )}

            {/* Stepper, Add to Cart & Buy Now */}
            <ProductActions
              product={product}
              quantity={activeQuantity}
              onQuantityChange={handleQuantityChange}
              selectedOptions={selectedOptions}
              unitPrice={effectiveUnitPrice}
            />
          </div>
        </div>

        {/* ── Enterprise Trust Badges ───────────────────────────────────── */}
        <ProductTrustBadges className="mt-4" />

        {/* ── Deep Technical Tabs Section ───────────────────────────────── */}
        <div ref={tabsSectionRef} className="pt-6 sm:pt-10 flex flex-col gap-6">
          <ProductTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            reviewCount={product.reviewCount}
          />

          {/* Tab Content Display */}
          <div className="min-h-[360px] animate-fade-in" key={activeTab}>
            {activeTab === "specs" && <ProductSpecsTable product={product} />}
            {activeTab === "overview" && <ProductOverview product={product} />}
            {activeTab === "reviews" && <ProductReviews product={product} />}
            {activeTab === "downloads" && <ProductDownloads product={product} />}
          </div>
        </div>

        {/* ── Related / Compatible Products ─────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="pt-6 sm:pt-10 border-t border-neutral-800">
            <RelatedProducts
              products={relatedProducts}
              currentProductId={product.id}
            />
          </div>
        )}
      </Container>

      {/* ── Sticky Purchase Bar on Scroll ───────────────────────────────── */}
      <ProductStickyBar
        product={product}
        unitPrice={unitPrice}
        selectedOptions={selectedOptions}
      />
    </div>
  );
}
