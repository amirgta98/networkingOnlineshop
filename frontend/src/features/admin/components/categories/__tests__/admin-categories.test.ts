import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const { renderToString, loadComponent, React } = req(
  "../../shared/__tests__/test-env.ts"
) as typeof import("../../shared/__tests__/test-env");

const { INITIAL_FRONTEND_CATEGORIES, categoriesApi } = loadComponent<{
  INITIAL_FRONTEND_CATEGORIES: any[];
  categoriesApi: any;
}>("./src/features/admin/api/categories-api.ts");

const { CATEGORY_ICON_PRESETS } = loadComponent<{
  CATEGORY_ICON_PRESETS: readonly { name: string; label: string }[];
}>("./src/features/admin/types/admin-categories.types.ts");

const { AdminCategoriesView } = loadComponent<{
  AdminCategoriesView: React.ComponentType;
}>("./src/features/admin/components/categories/admin-categories-view.tsx");

test("AdminCategories - Initial frontend categories structure and default 8 hardware categories", () => {
  assert.strictEqual(INITIAL_FRONTEND_CATEGORIES.length, 8);
  const slugs = INITIAL_FRONTEND_CATEGORIES.map((c: any) => c.slug);
  assert.ok(slugs.includes("switches"));
  assert.ok(slugs.includes("routers"));
  assert.ok(slugs.includes("wireless"));
  assert.ok(slugs.includes("fiber"));
  assert.ok(slugs.includes("cables"));
  assert.ok(slugs.includes("passive"));
  assert.ok(slugs.includes("security_firewall"));
  assert.ok(slugs.includes("accessories"));
});

test("AdminCategories - categoriesApi.getCategories returns all categories and filters by search query", async () => {
  const all = await categoriesApi.getCategories();
  assert.ok(all.length >= 8);

  const searchSwitches = await categoriesApi.getCategories({ search: "سوئیچ" });
  assert.ok(searchSwitches.length >= 1);
  assert.ok(searchSwitches.some((c: any) => c.slug === "switches"));
});

test("AdminCategories - categoriesApi create, update, and delete flow", async () => {
  const newCat = await categoriesApi.createCategory({
    shortName: "تجهیزات رادیویی صنعتی",
    slug: "industrial-radios",
    icon: "Radio",
    badge: "صنعتی",
    sortOrder: 15,
    isActive: true,
  });

  assert.ok(newCat.id);
  assert.strictEqual(newCat.slug, "industrial-radios");
  assert.strictEqual(newCat.shortName, "تجهیزات رادیویی صنعتی");

  // Update
  const updated = await categoriesApi.updateCategory(newCat.id, {
    badge: "ویژه کارخانجات",
  });
  assert.strictEqual(updated.badge, "ویژه کارخانجات");

  // Delete
  const deleted = await categoriesApi.deleteCategory(newCat.id, true);
  assert.strictEqual(deleted, true);

  const found = await categoriesApi.getCategoryById(newCat.id);
  assert.strictEqual(found, null);
});

test("AdminCategories - categoriesApi prevents duplicate slug creation", async () => {
  await assert.rejects(
    async () => {
      await categoriesApi.createCategory({
        shortName: "سوئیچ تکراری",
        slug: "switches", // duplicate
      });
    },
    {
      message: /قبلاً استفاده شده است/,
    }
  );
});

test("AdminCategories - category icon presets contain standard network icons", () => {
  assert.ok(CATEGORY_ICON_PRESETS.length >= 8);
  const presetNames = CATEGORY_ICON_PRESETS.map((p) => p.name);
  assert.ok(presetNames.includes("Layers"));
  assert.ok(presetNames.includes("Server"));
  assert.ok(presetNames.includes("Wifi"));
  assert.ok(presetNames.includes("FolderTree"));
});

test("AdminCategories - AdminCategoriesView component renders without crashing", () => {
  const html = renderToString(React.createElement(AdminCategoriesView));
  assert.ok(html.includes("مدیریت دسته‌بندی‌های کاتالوگ"));
  assert.ok(html.includes("افزودن دسته‌بندی جدید"));
  assert.ok(html.includes("کل گروه‌ها"));
});
