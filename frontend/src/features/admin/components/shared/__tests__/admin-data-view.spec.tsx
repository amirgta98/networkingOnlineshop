import test, { describe, it } from "node:test";
import assert from "node:assert";
import React from "react";
import { renderToString } from "react-dom/server";
import { AdminDataView, type AdminColumnDef } from "../admin-data-view";

interface TestItem {
  id: string;
  name: string;
  count: number;
  status: string;
  meta?: {
    tag: string;
  };
}

const mockItems: TestItem[] = [
  { id: "1", name: "محصول اول", count: 15, status: "active", meta: { tag: "برچسب الف" } },
  { id: "2", name: "محصول دوم", count: 5, status: "pending", meta: { tag: "برچسب ب" } },
  { id: "3", name: "محصول سوم", count: 30, status: "inactive", meta: { tag: "برچسب ج" } },
];

const mockColumns: AdminColumnDef<TestItem>[] = [
  {
    key: "select",
    header: <input type="checkbox" aria-label="select-all" />,
    cell: (item) => <input type="checkbox" aria-label={`select-${item.id}`} />,
  },
  {
    key: "name",
    header: "عنوان محصول",
    sortable: true,
    cell: (item) => <span className="font-bold">{item.name}</span>,
  },
  {
    key: "count",
    header: "تعداد موجودی",
    sortable: true,
    cell: (item) => <span>{`${item.count} عدد`}</span>,
  },
  {
    key: "status",
    header: "وضعیت",
    cell: (item) => <span className="badge">{item.status}</span>,
  },
  {
    key: "actions",
    header: "عملیات",
    cell: (item) => <button type="button">{`ویرایش ${item.id}`}</button>,
  },
];

describe("AdminDataView Component Suite", () => {
  it("renders Cards mode by default with clean separation of select, primary, and details", () => {
    const html = renderToString(
      <AdminDataView<TestItem>
        data={mockItems}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        defaultViewMode="cards"
      />
    );

    // Verify view mode toolbar exists
    assert.ok(html.includes("کارت‌ها"), "Toolbar includes Cards toggle");
    assert.ok(html.includes("فهرست"), "Toolbar includes List toggle");
    assert.ok(html.includes("جدول"), "Toolbar includes Table toggle");

    // Verify primary column (name) is rendered properly in header
    assert.ok(html.includes("محصول اول"), "Renders first product title");
    assert.ok(html.includes("محصول دوم"), "Renders second product title");

    // Verify select column is rendered alongside
    assert.ok(html.includes('aria-label="select-1"'), "Renders selection checkbox");

    // Verify detail columns
    assert.ok(html.includes("تعداد موجودی"), "Renders detail header label");
    assert.ok(html.includes("15 عدد"), "Renders detail value");

    // Verify pinned actions
    assert.ok(html.includes("ویرایش 1"), "Renders action button in pinned footer");
  });

  it("renders List view mode when specified", () => {
    const html = renderToString(
      <AdminDataView<TestItem>
        data={mockItems}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        defaultViewMode="list"
      />
    );

    assert.ok(html.includes("محصول اول"), "Renders item in list view");
    assert.ok(html.includes("ویرایش 1"), "Renders action in list view");
  });

  it("renders Table view mode with sticky action column when specified", () => {
    const html = renderToString(
      <AdminDataView<TestItem>
        data={mockItems}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        defaultViewMode="table"
      />
    );

    assert.ok(html.includes("<table"), "Renders HTML table tag in table view");
    assert.ok(html.includes("<thead"), "Renders thead in table view");
    assert.ok(html.includes("<tbody"), "Renders tbody in table view");
    assert.ok(html.includes("sticky left-0"), "Sticky action column is styled");
  });

  it("renders empty state gracefully with custom message and subtitle", () => {
    const html = renderToString(
      <AdminDataView<TestItem>
        data={[]}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        emptyMessage="هیچ آیتمی یافت نشد"
        emptySubtitle="لطفاً فیلترها را بررسی فرمایید"
      />
    );

    assert.ok(html.includes("هیچ آیتمی یافت نشد"), "Renders custom empty message");
    assert.ok(html.includes("لطفاً فیلترها را بررسی فرمایید"), "Renders empty subtitle");
  });

  it("renders pagination and page size options with Persian numerals", () => {
    // 25 mock items
    const manyItems: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      name: `کالای شماره ${i + 1}`,
      count: i * 2,
      status: "active",
    }));

    const html = renderToString(
      <AdminDataView<TestItem>
        data={manyItems}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        currentPage={1}
        onPageChange={() => {}}
      />
    );

    // Verify Persian page size buttons
    assert.ok(html.includes("تعداد در صفحه:"), "Page size selector label");
    // ۱۰ is Persian for 10
    assert.ok(html.includes("۱۰"), "Page size 10 in Persian numerals");
    // ۲۰ is Persian for 20
    assert.ok(html.includes("۲۰"), "Page size 20 in Persian numerals");
    // ۵۰ is Persian for 50
    assert.ok(html.includes("۵۰"), "Page size 50 in Persian numerals");

    // Slices to pageSize (10) internally when uncontrolled totalItems is omitted
    assert.ok(html.includes("کالای شماره 1"), "First page contains first item");
    assert.ok(html.includes("کالای شماره 10"), "First page contains tenth item");
    assert.strictEqual(
      html.includes("کالای شماره 11"),
      false,
      "First page does not contain eleventh item (sliced to 10)"
    );
  });

  it("handles extreme inputs without throwing exceptions", () => {
    assert.doesNotThrow(() => {
      renderToString(
        <AdminDataView<any>
          data={[]}
          columns={[]}
          keyExtractor={() => "key"}
        />
      );
    }, "Empty columns and data do not crash");

    assert.doesNotThrow(() => {
      renderToString(
        <AdminDataView<any>
          data={[{ id: "x", missingField: null, undefinedField: undefined }]}
          columns={[
            {
              key: "nested.nonexistent.field",
              header: "تست فیلد نامعتبر",
              cell: (item) => String(item?.missingField ?? "پیش‌فرض"),
            },
          ]}
          keyExtractor={(item) => item.id}
        />
      );
    }, "Deeply nested or null values do not crash");
  });

  it("renders custom cardRenderer when provided", () => {
    const html = renderToString(
      <AdminDataView<TestItem>
        data={mockItems}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        cardRenderer={(item) => <div className="custom-card-box">کارت اختصاصی: {item.name}</div>}
      />
    );

    assert.ok(html.includes("custom-card-box"), "Renders custom card wrapper");
    assert.ok(html.includes("کارت اختصاصی:"), "Renders custom card content");
  });

  it("renders responsive mobileCardRenderer using pure CSS classes (zero window.innerWidth SSR mismatch)", () => {
    const html = renderToString(
      <AdminDataView<TestItem>
        data={mockItems}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        mobileCardRenderer={(item) => <div className="mobile-only-pill">نسخه فشرده موبایل: {item.id}</div>}
      />
    );

    assert.ok(html.includes("block md:hidden"), "Mobile wrapper has CSS block md:hidden");
    assert.ok(html.includes("mobile-only-pill"), "Mobile card rendered inside CSS wrapper");
    assert.ok(html.includes("hidden md:block"), "Desktop card wrapper has CSS hidden md:block");
  });

  it("sorts data internally by numeric or string keys when onSort is not passed", () => {
    const unorderedItems: TestItem[] = [
      { id: "1", name: "زیرساخت", count: 50, status: "active" },
      { id: "2", name: "آنتن", count: 10, status: "active" },
      { id: "3", name: "مودم", count: 100, status: "active" },
    ];

    // Default sorting asc on 'count'
    const htmlAsc = renderToString(
      <AdminDataView<TestItem>
        data={unorderedItems}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        sortColumn="count"
        sortDirection="asc"
      />
    );

    const posAntenna = htmlAsc.indexOf("آنتن"); // count 10
    const posInfra = htmlAsc.indexOf("زیرساخت"); // count 50
    const posModem = htmlAsc.indexOf("مودم"); // count 100
    assert.ok(posAntenna < posInfra && posInfra < posModem, "Numerically sorted ascending (10 -> 50 -> 100)");

    // Sort desc on 'count'
    const htmlDesc = renderToString(
      <AdminDataView<TestItem>
        data={unorderedItems}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        sortColumn="count"
        sortDirection="desc"
      />
    );

    const posModemDesc = htmlDesc.indexOf("مودم"); // count 100
    const posInfraDesc = htmlDesc.indexOf("زیرساخت"); // count 50
    const posAntennaDesc = htmlDesc.indexOf("آنتن"); // count 10
    assert.ok(posModemDesc < posInfraDesc && posInfraDesc < posAntennaDesc, "Numerically sorted descending (100 -> 50 -> 10)");
  });
});
