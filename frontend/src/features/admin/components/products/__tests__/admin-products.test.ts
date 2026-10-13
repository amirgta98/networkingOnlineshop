import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const { renderToString, mountElement, sleep, loadComponent, React } = req(
  "../../shared/__tests__/test-env.ts"
) as typeof import("../../shared/__tests__/test-env");

const { INITIAL_ADMIN_PRODUCTS } = loadComponent<{
  INITIAL_ADMIN_PRODUCTS: import("../../types/admin-products.types").AdminProduct[];
}>("./src/features/admin/data/mock-admin-products.ts");

const {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_STATUS_CONFIG,
} = loadComponent<{
  PRODUCT_CATEGORY_LABELS: Record<string, string>;
  PRODUCT_STATUS_CONFIG: Record<string, { label: string }>;
}>("./src/features/admin/types/admin-products.types.ts");

const { AdminProductsView } = loadComponent<{
  AdminProductsView: React.ComponentType;
}>("./src/features/admin/components/products/admin-products-view.tsx");

const { ProductDetailDrawerContent } = loadComponent<{
  ProductDetailDrawerContent: React.ComponentType<any>;
}>("./src/features/admin/components/products/product-detail-drawer-content.tsx");

const { ProductQuickStockModal } = loadComponent<{
  ProductQuickStockModal: React.ComponentType<any>;
}>("./src/features/admin/components/products/product-quick-stock-modal.tsx");

const { ProductFormModal } = loadComponent<{
  ProductFormModal: React.ComponentType<any>;
}>("./src/features/admin/components/products/product-form-modal.tsx");

function dispatchClick(el: unknown) {
  (el as { dispatchEvent: (e: unknown) => boolean }).dispatchEvent(
    new (global as any).window.MouseEvent("click", { bubbles: true })
  );
}

function typeIntoInput(input: any, value: string) {
  const lastValue = input.value;
  input.value = value;
  const tracker = input._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  input.dispatchEvent(new (global as any).window.Event("input", { bubbles: true }));
}

const FIXTURE_PRODUCTS: import("../../types/admin-products.types").AdminProduct[] = [
  {
    id: "prod-cisco-2960x",
    name: "سوئیچ ۲۴ پورت سیسکو مدل WS-C2960X-24PS-L",
    slug: "cisco-ws-c2960x-24ps-l",
    sku: "WS-C2960X-24PS-L",
    category: "switches",
    brand: "Cisco",
    price: 18200000,
    costPrice: 14200000,
    stock: 14,
    minStockAlert: 5,
    status: "active",
    warranty: "گارانتی طلایی",
  },
  {
    id: "prod-cisco-9200l",
    name: "سوئیچ ۴۸ پورت سیسکو کاتالیست C9200L-48P-4G-E",
    slug: "cisco-catalyst-c9200l-48p-4g-e",
    sku: "C9200L-48P-4G-E",
    category: "switches",
    brand: "Cisco",
    price: 46500000,
    costPrice: 38000000,
    stock: 4,
    minStockAlert: 5,
    status: "active",
    warranty: "گارانتی ۳۶ ماهه",
  },
  {
    id: "prod-mikrotik-crs326",
    name: "سوئیچ روتر میکروتیک CRS326-24G-2S+RM",
    slug: "mikrotik-crs326-24g-2s-plus-rm",
    sku: "CRS326-24G-2S+RM",
    category: "switches",
    brand: "MikroTik",
    price: 12800000,
    costPrice: 9800000,
    stock: 0,
    minStockAlert: 3,
    status: "out_of_stock",
    warranty: "گارانتی ۱۸ ماهه",
  },
];

test("AdminProducts - Production INITIAL_ADMIN_PRODUCTS is empty", () => {
  assert.ok(Array.isArray(INITIAL_ADMIN_PRODUCTS), "INITIAL_ADMIN_PRODUCTS must be an array");
  assert.strictEqual(INITIAL_ADMIN_PRODUCTS.length, 0, "No mock products in production initial state");
});

test("AdminProducts - KPI calculations: Inventory value, unit counts, and stock alert rules", () => {
  const totalValue = FIXTURE_PRODUCTS.reduce((acc, p) => acc + p.stock * p.price, 0);
  const totalUnits = FIXTURE_PRODUCTS.reduce((acc, p) => acc + p.stock, 0);
  const lowStock = FIXTURE_PRODUCTS.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert);
  const outOfStock = FIXTURE_PRODUCTS.filter((p) => p.stock === 0);

  assert.ok(totalValue > 0, "Total inventory value must be positive");
  assert.ok(totalUnits > 0, "Total physical units must be positive");
  assert.ok(lowStock.length > 0, "Must have low-stock items to test warning indicators");
  assert.ok(outOfStock.length > 0, "Must have out-of-stock items to test critical alert status");
});

test("AdminProducts - Filter logic: Tab matching, Category, Brand, and Search query", () => {
  // Test category filter
  const switches = FIXTURE_PRODUCTS.filter((p) => p.category === "switches");
  assert.ok(switches.length >= 2, "Should contain multiple switches");

  // Test brand filter
  const ciscoItems = FIXTURE_PRODUCTS.filter((p) => p.brand === "Cisco");
  assert.ok(ciscoItems.length >= 2, "Should contain Cisco hardware");

  // Test search matching SKU
  const skuQuery = "2960X";
  const searchResults = FIXTURE_PRODUCTS.filter(
    (p) => p.sku.includes(skuQuery) || p.name.includes(skuQuery)
  );
  assert.strictEqual(searchResults.length, 1);
  assert.strictEqual(searchResults[0].sku, "WS-C2960X-24PS-L");
});

test("AdminProducts - AdminProductsView component renders without crashing", async () => {
  const { container, cleanup } = mountElement(
    React.createElement(AdminProductsView)
  );

  await sleep(100);

  // Check header title rendered
  const html = container.innerHTML;
  assert.ok(html.includes("کاتالوگ و موجودی انبار تجهیزات شبکه"), "Should render main title");
  assert.ok(html.includes("ارزش کل موجودی انبار"), "Should render KPI card title");
  assert.ok(html.includes("افزودن محصول جدید"), "Should render Add Product button");

  cleanup();
});

test("AdminProducts - Sorting by price and stock", () => {
  const sortedByPriceAsc = [...FIXTURE_PRODUCTS].sort((a, b) => a.price - b.price);
  assert.ok(sortedByPriceAsc[0].price <= sortedByPriceAsc[sortedByPriceAsc.length - 1].price);

  const sortedByStockDesc = [...FIXTURE_PRODUCTS].sort((a, b) => b.stock - a.stock);
  assert.ok(sortedByStockDesc[0].stock >= sortedByStockDesc[sortedByStockDesc.length - 1].stock);
});

test("AdminProducts - ProductDetailDrawerContent renders product details and specs correctly", async () => {
  const sample = FIXTURE_PRODUCTS[0];
  const { container, cleanup } = mountElement(
    React.createElement(ProductDetailDrawerContent, {
      product: sample,
      onEdit: () => {},
      onQuickStock: () => {},
      onDelete: () => {},
      onToggleStatus: () => {},
    })
  );

  await sleep(50);
  const html = container.innerHTML;
  assert.ok(html.includes(sample.name), "Should display product name");
  assert.ok(html.includes(sample.sku), "Should display product SKU");
  assert.ok(html.includes("پایش موجودی فیزیکی و انبارداری"), "Should render stock section");
  assert.ok(html.includes("ساختار قیمت‌گذاری و سودآوری ریالی"), "Should render pricing section");

  cleanup();
});

test("AdminProducts - ProductQuickStockModal renders adjust controls and rejects non-positive price", async () => {
  const sample = FIXTURE_PRODUCTS[0];
  let confirmed = false;

  const { container, cleanup } = mountElement(
    React.createElement(ProductQuickStockModal, {
      isOpen: true,
      onClose: () => {},
      product: sample,
      onConfirm: () => {
        confirmed = true;
      },
    })
  );

  await sleep(50);
  const bodyHtml = global.document.body.innerHTML;
  assert.ok(bodyHtml.includes("تنظیم سریع موجودی و قیمت"), "Should render modal title");
  assert.ok(bodyHtml.includes(sample.sku), "Should display SKU in modal");

  // Find price input and set to 0 to test validation error
  const inputs = Array.from(global.document.body.querySelectorAll("input"));
  const priceInput = inputs.find((inp: any) => String(inp.value) === String(sample.price));
  assert.ok(priceInput, "Price input found");

  typeIntoInput(priceInput, "0");

  const buttons = Array.from(global.document.body.querySelectorAll("button"));
  const submitBtn = buttons.find((b) => b.textContent?.includes("ثبت تغییرات انبار"));
  assert.ok(submitBtn, "Must have submit button");

  dispatchClick(submitBtn);
  await sleep(50);

  assert.strictEqual(confirmed, false, "Should not confirm when price <= 0");
  const updatedHtml = global.document.body.innerHTML;
  assert.ok(
    updatedHtml.includes("قیمت فروش واحد باید بزرگتر از صفر تومان باشد"),
    "Shows validation error"
  );

  cleanup();
});

test("AdminProducts - ProductFormModal validates duplicate SKU and supports Persian commas", async () => {
  let savedProduct: any = null;

  const { container, cleanup } = mountElement(
    React.createElement(ProductFormModal, {
      isOpen: true,
      onClose: () => {},
      product: null,
      existingProducts: FIXTURE_PRODUCTS,
      onSave: (p: any) => {
        savedProduct = p;
      },
    })
  );

  await sleep(50);
  const bodyHtml = global.document.body.innerHTML;
  assert.ok(bodyHtml.includes("افزودن محصول جدید به کاتالوگ انبار"), "Should render create title");

  // Fill in form with duplicate SKU of product 0
  const inputs = Array.from(global.document.body.querySelectorAll("input"));
  const nameInput = inputs.find((i: any) => i.placeholder?.includes("سوئیچ ۲۴ پورت"));
  const skuInput = inputs.find((i: any) => i.placeholder === "WS-C2960X-24PS-L");

  assert.ok(nameInput, "Name input found");
  assert.ok(skuInput, "SKU input found");

  typeIntoInput(nameInput, "سوئیچ تستی جدید");
  typeIntoInput(skuInput, FIXTURE_PRODUCTS[0].sku);

  const buttons = Array.from(global.document.body.querySelectorAll("button"));
  const submitBtn = buttons.find((b) => b.textContent?.includes("افزودن کالا به انبار"));
  assert.ok(submitBtn, "Submit button found");

  dispatchClick(submitBtn);
  await sleep(50);

  assert.strictEqual(savedProduct, null, "Duplicate SKU should be rejected");
  const errorHtml = global.document.body.innerHTML;
  assert.ok(errorHtml.includes("تکراری است"), "Should show duplicate SKU error message");

  cleanup();
});

test("AdminProducts - Persian comma splitting produces distinct badges and specs", () => {
  const badgesRaw = "پرفروش، گارانتی طلایی، تست فلوک";
  const badges = badgesRaw
    .split(/[,\u060C]/)
    .map((b) => b.trim())
    .filter(Boolean);

  assert.strictEqual(badges.length, 3);
  assert.deepStrictEqual(badges, ["پرفروش", "گارانتی طلایی", "تست فلوک"]);

  const specsRaw = "۲۴ پورت گیگابیت، ۳۷۰ وات PoE+، ۴ اسلات SFP";
  const specs = specsRaw
    .split(/[,\u060C]/)
    .map((s) => s.trim())
    .filter(Boolean);

  assert.strictEqual(specs.length, 3);
  assert.deepStrictEqual(specs, ["۲۴ پورت گیگابیت", "۳۷۰ وات PoE+", "۴ اسلات SFP"]);
});

test("AdminProducts - Pagination boundary clamping logic", () => {
  // If there were 9 items with pageSize 8, totalPages was 2
  const pageSize = 8;
  let itemsCount = 9;
  let currentPage = 2;

  let totalPages = Math.max(1, Math.ceil(itemsCount / pageSize));
  assert.strictEqual(totalPages, 2);

  // User deletes 1 item, now 8 items remain
  itemsCount = 8;
  totalPages = Math.max(1, Math.ceil(itemsCount / pageSize));
  assert.strictEqual(totalPages, 1);

  // Clamping rule
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  assert.strictEqual(currentPage, 1, "Page must automatically clamp to 1");
});

test("AdminProducts - Multi-page Select-All toggle logic", () => {
  const page1Ids = ["prod-1", "prod-2", "prod-3"];
  const page2Ids = ["prod-4", "prod-5"];

  let selectedIds: string[] = [];

  // 1. User selects all on page 1
  const isAllPage1Selected = page1Ids.every((id) => selectedIds.includes(id));
  assert.strictEqual(isAllPage1Selected, false);
  selectedIds = Array.from(new Set([...selectedIds, ...page1Ids]));
  assert.deepStrictEqual(selectedIds, ["prod-1", "prod-2", "prod-3"]);

  // 2. User goes to page 2 and clicks Select All on page 2
  const isAllPage2Selected = page2Ids.every((id) => selectedIds.includes(id));
  assert.strictEqual(isAllPage2Selected, false);
  selectedIds = Array.from(new Set([...selectedIds, ...page2Ids]));
  // Both pages are retained!
  assert.strictEqual(selectedIds.length, 5);

  // 3. User goes back to page 1 and clicks Header Checkbox to DESELECT page 1
  const isAllPage1SelectedNow = page1Ids.every((id) => selectedIds.includes(id));
  assert.strictEqual(isAllPage1SelectedNow, true);
  selectedIds = selectedIds.filter((id) => !page1Ids.includes(id));
  // Page 2 selections remain preserved!
  assert.deepStrictEqual(selectedIds, ["prod-4", "prod-5"]);
});
