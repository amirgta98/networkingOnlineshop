import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";
import type { AdminProduct } from "../../types/admin-products.types";

const req = createRequire(import.meta.url);
const { mountElement, sleep, loadComponent, React } = req(
  "../../shared/__tests__/test-env.ts"
) as typeof import("../../shared/__tests__/test-env");

const { ProductRelationsManager } = loadComponent<{
  ProductRelationsManager: React.ComponentType<any>;
}>("./src/features/admin/components/products/product-relations-manager.tsx");

const mockProducts: AdminProduct[] = [
  {
    id: "prod-switch-24",
    name: "سوئیچ ۲۴ پورت سیسکو Catalyst 2960-X",
    slug: "cisco-catalyst-2960x-24ps-l",
    sku: "WS-C2960X-24PS-L",
    category: "switches",
    brand: "Cisco",
    price: 48500000,
    costPrice: 40000000,
    stock: 14,
    minStockAlert: 5,
    reservedStock: 0,
    warehouseLocation: "انبار مرکزی",
    status: "active",
    featured: true,
    rating: 4.9,
    reviewCount: 38,
    images: ["/uploads/products/sample-switch-1.webp"],
    warranty: "گارانتی طلایی ۳۶ ماهه",
    badges: ["پرفروش"],
    specs: ["۲۴ پورت گیگابیت"],
    shortDescription: "سوئیچ ۲۴ پورت",
    createdAt: "2026-09-01",
    updatedAt: "2026-09-01",
  },
  {
    id: "prod-router-ccr",
    name: "روتر میکروتیک CCR2004-16G-2S+",
    slug: "mikrotik-ccr2004",
    sku: "CCR2004-16G-2S+",
    category: "routers",
    brand: "MikroTik",
    price: 38200000,
    costPrice: 31000000,
    stock: 8,
    minStockAlert: 3,
    reservedStock: 0,
    warehouseLocation: "انبار مرکزی",
    status: "active",
    featured: true,
    rating: 4.8,
    reviewCount: 20,
    images: ["/uploads/products/sample-router-1.webp"],
    warranty: "گارانتی طلایی ۱۸ ماهه",
    badges: ["۱۰ گیگابیت"],
    specs: ["۱۶ پورت گیگابیت"],
    shortDescription: "روتر سازمانی",
    createdAt: "2026-09-01",
    updatedAt: "2026-09-01",
  },
  {
    id: "prod-sfp-module",
    name: "ماژول فیبر نوری سیسکو GLC-LH-SMD",
    slug: "cisco-glc-lh-smd",
    sku: "GLC-LH-SMD",
    category: "fiber",
    brand: "Cisco",
    price: 1950000,
    costPrice: 1500000,
    stock: 25,
    minStockAlert: 5,
    reservedStock: 0,
    warehouseLocation: "انبار مرکزی",
    status: "active",
    featured: false,
    rating: 5.0,
    reviewCount: 14,
    images: ["/uploads/products/sfp.webp"],
    warranty: "گارانتی اصالت",
    badges: ["اصلی"],
    specs: ["1G SFP 10km"],
    shortDescription: "ماژول فیبر نوری",
    createdAt: "2026-09-01",
    updatedAt: "2026-09-01",
  },
];

test("ProductRelationsManager - Renders selected products and available products pool", async () => {
  let currentSelected = ["prod-sfp-module"];

  const { container, cleanup } = mountElement(
    React.createElement(ProductRelationsManager, {
      currentProductId: "prod-switch-24",
      selectedIds: currentSelected,
      onChange: (ids: string[]) => {
        currentSelected = ids;
      },
      availableProducts: mockProducts,
    })
  );

  await sleep(60);

  const html = container.innerHTML;

  // Header and title check
  assert.ok(html.includes("مدیریت محصولات مرتبط و تجهیزات مکمل"), "Should render title");
  assert.ok(html.includes("محصولات مرتبط انتخاب‌شده"), "Should render selected section title");

  // Selected product should appear in selected section
  assert.ok(html.includes("GLC-LH-SMD"), "Should display selected product SKU");

  // Current product should NOT appear in selectable list
  assert.ok(!html.includes("prod-switch-24"), "Current product ID should be excluded from selection");

  // Another product should be available for selection
  assert.ok(html.includes("CCR2004-16G-2S+"), "Other available products should be listed");
  assert.ok(html.includes("افزودن"), "Should have Add button for unselected items");

  cleanup();
});

test("ProductRelationsManager - Displays empty state when no products are selected", async () => {
  const { container, cleanup } = mountElement(
    React.createElement(ProductRelationsManager, {
      currentProductId: "prod-switch-24",
      selectedIds: [],
      onChange: () => {},
      availableProducts: mockProducts,
    })
  );

  await sleep(60);

  const html = container.innerHTML;
  assert.ok(
    html.includes("هنوز هیچ محصول مرتبطی برای این کالا تعیین نشده است"),
    "Should render empty state message when selectedIds is empty"
  );

  cleanup();
});
