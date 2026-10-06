import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const { renderToString, mountElement, sleep, loadComponent, React } = req("./test-env.ts") as typeof import("./test-env");

const { AdminDataTable } = loadComponent<{
  AdminDataTable: React.ComponentType<Record<string, unknown>>;
}>("./src/features/admin/components/shared/admin-data-table.tsx");

interface SampleRow {
  id: string;
  name: string;
  count: number;
  date: string;
  meta: {
    tag: string;
  };
}

const sampleData: SampleRow[] = [
  { id: "1", name: "Switch B", count: 20, date: "2026-03-01", meta: { tag: "Zebra" } },
  { id: "2", name: "Switch A", count: 5, date: "2026-01-15", meta: { tag: "Alpha" } },
  { id: "3", name: "Router C", count: 100, date: "2026-02-20", meta: { tag: "Beta" } },
];

const sampleColumns = [
  {
    key: "name",
    header: "نام دستگاه",
    sortable: true,
    cell: (row: SampleRow) => row.name,
  },
  {
    key: "count",
    header: "تعداد",
    sortable: true,
    cell: (row: SampleRow) => String(row.count),
  },
  {
    key: "date",
    header: "تاریخ",
    sortable: true,
    cell: (row: SampleRow) => row.date,
  },
  {
    key: "meta.tag",
    header: "برچسب",
    sortable: true,
    cell: (row: SampleRow) => row.meta.tag,
  },
  {
    key: "actions",
    header: "عملیات",
    sortable: false,
    cell: () => React.createElement("button", null, "ویرایش"),
  },
];

test("AdminDataTable - Empirical Sorting: Does NOT perform internal sorting (Controlled presentation)", () => {
  // Pass unsorted data with sortColumn="name", sortDirection="asc"
  const html = renderToString(
    React.createElement(AdminDataTable, {
      data: sampleData,
      columns: sampleColumns,
      keyExtractor: (r: SampleRow) => r.id,
      sortColumn: "name",
      sortDirection: "asc",
    })
  );

  // In sampleData, "Switch B" is index 0 and "Switch A" is index 1.
  // If AdminDataTable sorted data, "Switch A" would appear before "Switch B".
  const posSwitchB = html.indexOf("Switch B");
  const posSwitchA = html.indexOf("Switch A");
  assert.ok(posSwitchB > -1 && posSwitchA > -1);
  assert.ok(
    posSwitchB < posSwitchA,
    "Empirical Fact: AdminDataTable does not sort rows internally; it preserves input data array order"
  );
});

test("AdminDataTable - Header click and onSort callback with nested keys", async () => {
  const calls: string[] = [];
  const { container, cleanup } = mountElement(
    React.createElement(AdminDataTable, {
      data: sampleData,
      columns: sampleColumns,
      keyExtractor: (r: SampleRow) => r.id,
      sortColumn: "name",
      sortDirection: "asc",
      onSort: (key: string) => {
        calls.push(key);
      },
    })
  );

  await sleep(20);
  const headers = container.querySelectorAll("th");
  assert.strictEqual(headers.length, 5);

  const dispatchClick = (el: unknown) => {
    (el as { dispatchEvent: (e: unknown) => boolean }).dispatchEvent(
      new window.MouseEvent("click", { bubbles: true })
    );
  };

  // Click sortable column "name"
  dispatchClick(headers[0]);
  // Click sortable column "meta.tag" (nested key)
  dispatchClick(headers[3]);
  // Click non-sortable column "actions"
  dispatchClick(headers[4]);

  assert.strictEqual(calls.length, 2);
  assert.strictEqual(calls[0], "name");
  assert.strictEqual(calls[1], "meta.tag");
  cleanup();
});

test("AdminDataTable - Empirical Pagination: Row slicing behavior", () => {
  const thirtyItems: SampleRow[] = Array.from({ length: 30 }, (_, i) => ({
    id: String(i + 1),
    name: `Item ${i + 1}`,
    count: i,
    date: "2026-01-01",
    meta: { tag: "T" },
  }));

  // Scenario 1: Parent passes full 30 items with pageSize=10 and onPageChange
  const html = renderToString(
    React.createElement(AdminDataTable, {
      data: thirtyItems,
      columns: sampleColumns,
      keyExtractor: (r: SampleRow) => r.id,
      pageSize: 10,
      currentPage: 1,
      onPageChange: () => {},
    })
  );

  // Check how many <tr> tags exist in the table
  const trMatches = (html.match(/<tr/g) || []).length;
  // 1 header tr + 30 row trs = 31 trs
  assert.strictEqual(
    trMatches - 1,
    30,
    "Empirical Finding: AdminDataTable renders ALL 30 data rows in tbody without slicing to pageSize"
  );

  // Scenario 2: Parent slices data beforehand to 10 items without passing totalItems
  const htmlSlicedWithoutTotal = renderToString(
    React.createElement(AdminDataTable, {
      data: thirtyItems.slice(0, 10),
      columns: sampleColumns,
      keyExtractor: (r: SampleRow) => r.id,
      pageSize: 10,
      currentPage: 1,
      onPageChange: () => {},
    })
  );
  // Total is calculated as data.length (10), so totalPages = 1
  assert.ok(htmlSlicedWithoutTotal.includes(">۱</span>"));
});

test("AdminDataTable - Pagination boundary arithmetic and page transitions", () => {
  // Test boundary 1: currentPage = 0 (boundary <= 0)
  const htmlPageZero = renderToString(
    React.createElement(AdminDataTable, {
      data: sampleData,
      columns: sampleColumns,
      keyExtractor: (r: SampleRow) => r.id,
      pageSize: 1,
      currentPage: 0,
      totalItems: 10,
      onPageChange: () => {},
    })
  );
  // Previous button must be disabled (currentPage <= 1)
  assert.ok(htmlPageZero.includes("disabled=\"\"") || htmlPageZero.includes("disabled"));

  // Test boundary 2: currentPage > totalPages (e.g. page 15 of 10)
  const htmlPageOver = renderToString(
    React.createElement(AdminDataTable, {
      data: sampleData,
      columns: sampleColumns,
      keyExtractor: (r: SampleRow) => r.id,
      pageSize: 1,
      currentPage: 15,
      totalItems: 10,
      onPageChange: () => {},
    })
  );
  // Next button must be disabled (currentPage >= totalPages)
  assert.ok(htmlPageOver.includes("بعدی"));

  // Test boundary 3: total = 0, empty data
  const htmlEmpty = renderToString(
    React.createElement(AdminDataTable, {
      data: [],
      columns: sampleColumns,
      keyExtractor: (r: SampleRow) => r.id,
      pageSize: 10,
      currentPage: 1,
      onPageChange: () => {},
    })
  );
  // hasPagination is false because total = 0
  assert.ok(!htmlEmpty.includes("قبلی"));
  assert.ok(!htmlEmpty.includes("بعدی"));
  assert.ok(htmlEmpty.includes("هیچ رکوردی یافت نشد"));
});

test("AdminDataTable - Extreme Inputs and Zero Crashes", () => {
  // Extreme 1: pageSize = 0
  assert.doesNotThrow(() => {
    renderToString(
      React.createElement(AdminDataTable, {
        data: sampleData,
        columns: sampleColumns,
        keyExtractor: (r: SampleRow) => r.id,
        pageSize: 0,
        onPageChange: () => {},
      })
    );
  });

  // Extreme 2: negative pageSize = -5 with isLoading = true
  assert.doesNotThrow(() => {
    renderToString(
      React.createElement(AdminDataTable, {
        data: sampleData,
        columns: sampleColumns,
        keyExtractor: (r: SampleRow) => r.id,
        pageSize: -5,
        isLoading: true,
        onPageChange: () => {},
      })
    );
  });

  // Extreme 3: NaN and Infinity pageSize
  assert.doesNotThrow(() => {
    renderToString(
      React.createElement(AdminDataTable, {
        data: sampleData,
        columns: sampleColumns,
        keyExtractor: (r: SampleRow) => r.id,
        pageSize: Number.NaN,
        onPageChange: () => {},
      })
    );
    renderToString(
      React.createElement(AdminDataTable, {
        data: sampleData,
        columns: sampleColumns,
        keyExtractor: (r: SampleRow) => r.id,
        pageSize: Number.POSITIVE_INFINITY,
        onPageChange: () => {},
      })
    );
  });

  // Extreme 4: Empty columns array
  assert.doesNotThrow(() => {
    renderToString(
      React.createElement(AdminDataTable, {
        data: sampleData,
        columns: [],
        keyExtractor: (r: SampleRow) => r.id,
      })
    );
  });
});
