import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("ProductCard must maintain horizontal layout (flex-row) on mobile and vertical (sm:flex-col) on desktop", () => {
  const cardPath = path.resolve(__dirname, "../components/product-card.tsx");
  const content = fs.readFileSync(cardPath, "utf-8");

  // Root article must be flex-row for mobile and sm:flex-col for desktop
  assert.ok(
    content.includes("flex-row sm:flex-col"),
    "ProductCard article must contain 'flex-row sm:flex-col' to ensure horizontal mode on small screens and vertical on desktop"
  );

  // Must not force flex-col on mobile screens
  assert.ok(
    !content.includes("className={`group relative flex h-full w-full max-w-full flex-col"),
    "ProductCard must NOT force flex-col on mobile screens"
  );

  // Must have overflow prevention
  assert.ok(content.includes("overflow-hidden"), "ProductCard must have overflow-hidden to prevent layout leaks");
  assert.ok(content.includes("min-w-0"), "ProductCard content container must have min-w-0 to allow proper flex shrinking");

  // Image must be horizontally sized on mobile and full width with aspect ratio on desktop
  assert.ok(
    content.includes("self-stretch sm:self-auto sm:aspect-[4/3]"),
    "Image container must be self-stretch on mobile flex-row and aspect-[4/3] on desktop"
  );
  assert.ok(
    content.includes("w-28 xs:w-36 sm:w-full"),
    "Image container must have responsive widths (w-28 xs:w-36 sm:w-full) for small screens"
  );

  // Description should be hidden on mobile to keep horizontal card compact and well-proportioned
  assert.ok(
    content.includes("hidden sm:block"),
    "Product description should be hidden on mobile (hidden sm:block) for optimal horizontal card height"
  );

  // Primary action button must have proper padding override and flex shrinking to eliminate blowout
  assert.ok(
    content.includes("flex-1 min-w-0"),
    "Primary action button must have flex-1 and min-w-0 to fit within available space"
  );
  assert.ok(
    content.includes("px-2 xs:px-2.5 sm:px-4"),
    "Primary action button must override default px-4 with compact mobile padding"
  );

  // Primary button text must provide ultra-compact fallback for <340px devices
  assert.ok(
    content.includes("min-[340px]:hidden"),
    "Primary button must have adaptive text fallback ('افزودن') for <340px displays"
  );

  // Secondary details button text must be hidden on mobile to protect primary button touch target
  assert.ok(
    content.includes("hidden sm:inline whitespace-nowrap"),
    "Details button text must be hidden on mobile (hidden sm:inline) to protect primary action area"
  );

  // Redundant discount tag in pricing row should be hidden on mobile to prevent line-wrapping blowout
  assert.ok(
    content.includes("hidden sm:inline-flex items-center gap-0.5 text-[9px] sm:text-[11px]"),
    "Discount tag in price row must be hidden on mobile (hidden sm:inline-flex) because discount badge already exists on image"
  );

  // Stock guard in click handlers must check isInStock to support backend products without inStock boolean
  assert.ok(
    content.includes("if (!isInStock || isFlying) return;"),
    "handleAddToCart must check !isInStock"
  );
  assert.ok(
    content.includes("if (!isInStock) return;"),
    "handleIncrement must check !isInStock"
  );
});

test("ProductSkeleton must match ProductCard horizontal-on-mobile and vertical-on-desktop layout", () => {
  const skeletonPath = path.resolve(__dirname, "../components/product-skeleton.tsx");
  const content = fs.readFileSync(skeletonPath, "utf-8");

  assert.ok(
    content.includes("flex-row sm:flex-col"),
    "ProductSkeleton must have flex-row sm:flex-col to avoid layout shift (CLS) with ProductCard"
  );
  assert.ok(
    content.includes("w-28 xs:w-36 sm:w-full"),
    "ProductSkeleton image placeholder must match ProductCard image widths"
  );
  // Skeleton action area must mirror 2-button layout
  assert.ok(
    content.includes("flex items-center gap-1.5 sm:gap-2 w-full"),
    "ProductSkeleton action area must mirror the 2-button row structure"
  );
});

test("ProductGrid, ProductGridSkeleton and RelatedProducts must use single column on mobile so horizontal cards span full width", () => {
  const gridPath = path.resolve(__dirname, "../components/product-grid.tsx");
  const gridContent = fs.readFileSync(gridPath, "utf-8");

  assert.ok(
    gridContent.includes("grid-cols-[minmax(0,1fr)] sm:grid-cols-2"),
    "ProductGrid must use 1 column (minmax(0,1fr)) on mobile and 2+ columns on desktop"
  );

  const skeletonPath = path.resolve(__dirname, "../components/product-skeleton.tsx");
  const skeletonContent = fs.readFileSync(skeletonPath, "utf-8");

  assert.ok(
    skeletonContent.includes("grid-cols-[minmax(0,1fr)] sm:grid-cols-2"),
    "ProductGridSkeleton must match ProductGrid column definitions"
  );

  const relatedPath = path.resolve(__dirname, "../../product-detail/components/related-products.tsx");
  const relatedContent = fs.readFileSync(relatedPath, "utf-8");

  assert.ok(
    relatedContent.includes("grid-cols-[minmax(0,1fr)] sm:grid-cols-2"),
    "RelatedProducts must use 1 column (minmax(0,1fr)) on mobile and 2+ columns on desktop"
  );
});

test("globals.css must define xs breakpoint for responsive mobile utilities", () => {
  const cssPath = path.resolve(__dirname, "../../../app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  assert.ok(
    cssContent.includes("--breakpoint-xs"),
    "globals.css must define --breakpoint-xs for Tailwind v4"
  );
});
