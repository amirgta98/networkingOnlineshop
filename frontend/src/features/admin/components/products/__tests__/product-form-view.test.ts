import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const { mountElement, sleep, loadComponent, React } = req(
  "../../shared/__tests__/test-env.ts"
) as typeof import("../../shared/__tests__/test-env");

const { ProductFormView } = loadComponent<{
  ProductFormView: React.ComponentType<any>;
}>("./src/features/admin/components/products/product-form-view.tsx");

test("ProductFormView - Renders Add Product page with standalone tabs and actions", async () => {
  const { container, cleanup } = mountElement(
    React.createElement(ProductFormView, { isEditMode: false })
  );

  await sleep(60);

  const html = container.innerHTML;
  assert.ok(html.includes("افزودن محصول جدید به کاتالوگ"), "Should render add product title");
  assert.ok(html.includes("اطلاعات اصلی محصول"), "Should render general tab");
  assert.ok(html.includes("تصاویر و واترمارک"), "Should render media tab");
  assert.ok(html.includes("ویژگی‌های داینامیک"), "Should render dynamic features tab");
  assert.ok(html.includes("محصولات مرتبط"), "Should render related products tab");
  assert.ok(html.includes("قیمت‌گذاری و انبار"), "Should render pricing tab");
  assert.ok(html.includes("ثبت و انتشار محصول"), "Should render submit button");

  cleanup();
});

test("ProductFormView - Renders Edit Product page with pre-populated values and features", async () => {
  const sample = {
    id: "prod-test-switch",
    name: "سوئیچ ۲۴ پورت سیسکو مدل WS-C2960X-24PS-L",
    slug: "cisco-ws-c2960x-24ps-l",
    sku: "WS-C2960X-24PS-L",
    category: "switches",
    brand: "Cisco",
    price: 18200000,
    costPrice: 14000000,
    stock: 10,
    status: "active",
    features: [],
  };
  const { container, cleanup } = mountElement(
    React.createElement(ProductFormView, {
      isEditMode: true,
      initialProduct: sample,
      productId: sample.id,
    })
  );

  await sleep(60);

  const html = container.innerHTML;
  assert.ok(html.includes(`ویرایش محصول: ${sample.name}`), "Should display product name in header");
  assert.ok(html.includes(sample.sku), "Should contain product SKU in input");
  assert.ok(html.includes("ذخیره تغییرات محصول"), "Should render update button");

  cleanup();
});

test("ProductsApi - verifies deleteImage, deleteFeatureIcon, and updateProductImages methods exist", () => {
  const { productsApi } = loadComponent<{
    productsApi: any;
  }>("./src/features/admin/api/products-api.ts");

  assert.strictEqual(typeof productsApi.deleteImage, "function");
  assert.strictEqual(typeof productsApi.deleteFeatureIcon, "function");
  assert.strictEqual(typeof productsApi.updateProductImages, "function");
  assert.strictEqual(typeof productsApi.uploadImages, "function");
  assert.strictEqual(typeof productsApi.uploadFeatureIcon, "function");
});

test("ProductImageEditorModal - Renders 1:1 crop modal with zoom and watermark preview controls", async () => {
  const { ProductImageEditorModal } = loadComponent<{
    ProductImageEditorModal: React.ComponentType<any>;
  }>("./src/features/admin/components/products/product-image-editor-modal.tsx");

  const { container, cleanup } = mountElement(
    React.createElement(ProductImageEditorModal, {
      isOpen: true,
      onClose: () => {},
      imageUrl: "/images/watermark.png",
      hasCustomCrop: true,
      onSaveCrop: () => {},
      onRevertToOriginal: () => {},
    })
  );

  await sleep(60);
  const html = container.innerHTML;
  assert.ok(html.includes("ویرایش و برش تصویر (نسبت ۱:۱ مربع)"), "Should display crop title");
  assert.ok(html.includes("پیش‌نمایش واترمارک رسمی ققنوس آکادمی"), "Should have watermark preview checkbox");
  assert.ok(html.includes("بازگشت به تصویر خام اولیه"), "Should have revert to original button");
  assert.ok(html.includes("بازنشانی کادربندی"), "Should have reset frame button");
  assert.ok(html.includes("تأیید و اعمال برش ۱:۱"), "Should have confirm crop button");

  cleanup();
});

test("ProductFeaturesManager - Renders dynamic features and preset network icons", async () => {
  const { ProductFeaturesManager, PRESET_SYSTEM_ICONS } = loadComponent<{
    ProductFeaturesManager: React.ComponentType<any>;
    PRESET_SYSTEM_ICONS: any[];
  }>("./src/features/admin/components/products/product-features-manager.tsx");

  assert.ok(PRESET_SYSTEM_ICONS.length >= 10, "Should have 10+ preset icons");

  const { container, cleanup } = mountElement(
    React.createElement(ProductFeaturesManager, {
      features: [
        {
          id: "f-1",
          title: "پورت اترنت",
          description: "گیگابیت سرعت بالا",
          iconName: "network",
          sortOrder: 0,
        },
      ],
      onChange: () => {},
    })
  );

  await sleep(60);
  const html = container.innerHTML;
  assert.ok(html.includes("ویژگی‌های فنی و داینامیک محصول"), "Should render title");
  assert.ok(html.includes("پورت اترنت"), "Should display feature title");
  assert.ok(html.includes("گیگابیت سرعت بالا"), "Should display feature description");

  cleanup();
});

test("sanitizeProductPayload - Strips non-whitelisted entity fields and normalizes image paths", () => {
  const { sanitizeProductPayload } = loadComponent<{
    sanitizeProductPayload: (payload: any) => any;
  }>("./src/features/admin/api/products-api.ts");

  const rawPayload = {
    id: "prod-123",
    name: "روتر سازمانی سیسکو",
    sku: "ISR-4331-K9",
    category: "routers",
    brand: "Cisco",
    price: 35000000,
    stock: 5,
    reservedStock: 2,
    rating: 4.8,
    reviewCount: 12,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    inventoryLogs: [{ id: "log-1", quantity: 5 }],
    specGroups: [{ category: "Ports", items: [] }],
    tieredPricing: [{ minQuantity: 5, discountPercent: 10, label: "عمده" }],
    images: ["sample-router-1.webp", "uploads/products/sample-2.webp", "https://example.com/img.png"],
    relatedProductIds: ["prod-a", "prod-b"],
    features: [
      { id: "feat-1", title: "سرعت", description: "۱ گیگابیت", iconName: "zap" },
      { id: "feat-empty", title: "", description: "" },
    ],
  };

  const clean = sanitizeProductPayload(rawPayload);

  // Non-whitelisted fields stripped
  assert.strictEqual(clean.id, undefined);
  assert.strictEqual(clean.createdAt, undefined);
  assert.strictEqual(clean.updatedAt, undefined);
  assert.strictEqual(clean.inventoryLogs, undefined);
  assert.strictEqual(clean.specGroups, undefined);
  assert.strictEqual(clean.tieredPricing, undefined);

  // Whitelisted fields retained
  assert.strictEqual(clean.name, "روتر سازمانی سیسکو");
  assert.strictEqual(clean.reservedStock, 2);
  assert.strictEqual(clean.rating, 4.8);
  assert.strictEqual(clean.reviewCount, 12);
  assert.deepStrictEqual(clean.relatedProductIds, ["prod-a", "prod-b"]);

  // Images normalized
  assert.deepStrictEqual(clean.images, [
    "/uploads/products/sample-router-1.webp",
    "/uploads/products/sample-2.webp",
    "https://example.com/img.png",
  ]);

  // Features cleaned
  assert.strictEqual(clean.features.length, 1);
  assert.strictEqual(clean.features[0].title, "سرعت");
});

test("resolveProductImageUrl - Properly resolves raw filenames, uploads paths, and full URLs", () => {
  const { resolveProductImageUrl } = loadComponent<{
    resolveProductImageUrl: (url?: string | null) => string;
  }>("./src/shared/lib/utils.ts");

  assert.strictEqual(resolveProductImageUrl("sample-switch-1.webp"), "/uploads/products/sample-switch-1.webp");
  assert.strictEqual(resolveProductImageUrl("prod-46b1a540.webp"), "/uploads/products/prod-46b1a540.webp");
  assert.strictEqual(resolveProductImageUrl("/uploads/products/switch.webp"), "/uploads/products/switch.webp");
  assert.strictEqual(resolveProductImageUrl("uploads/products/switch.webp"), "/uploads/products/switch.webp");
  assert.strictEqual(resolveProductImageUrl("https://images.unsplash.com/sample.jpg"), "https://images.unsplash.com/sample.jpg");
  assert.strictEqual(resolveProductImageUrl("blob:http://localhost:3000/123"), "blob:http://localhost:3000/123");
  assert.strictEqual(resolveProductImageUrl(""), "");
  assert.strictEqual(resolveProductImageUrl(null), "");
});
