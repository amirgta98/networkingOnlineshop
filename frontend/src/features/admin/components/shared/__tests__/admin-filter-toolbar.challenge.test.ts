import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const { mountElement, renderToString, sleep, loadComponent, React } = req("./test-env.ts") as typeof import("./test-env");

const { AdminFilterToolbar } = loadComponent<{
  AdminFilterToolbar: React.ComponentType<Record<string, unknown>>;
}>("./src/features/admin/components/shared/admin-filter-toolbar.tsx");

function dispatchClick(el: unknown) {
  (el as { dispatchEvent: (e: unknown) => boolean }).dispatchEvent(
    new window.MouseEvent("click", { bubbles: true })
  );
}

function typeIntoInput(input: HTMLInputElement, value: string) {
  const lastValue = input.value;
  input.value = value;
  const tracker = (input as unknown as { _valueTracker?: { setValue: (v: string) => void } })._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  (input as unknown as { dispatchEvent: (e: unknown) => boolean }).dispatchEvent(
    new window.Event("input", { bubbles: true })
  );
}

test("AdminFilterToolbar - Debounce timing: Coalesces rapid keystrokes within 300ms", async () => {
  const searchCalls: { value: string; time: number }[] = [];
  const startTime = Date.now();

  const { container, cleanup } = mountElement(
    React.createElement(AdminFilterToolbar, {
      searchQuery: "",
      onSearchChange: (val: string) => {
        searchCalls.push({ value: val, time: Date.now() - startTime });
      },
    })
  );

  await sleep(20);
  const input = container.querySelector("input") as unknown as HTMLInputElement;
  assert.ok(input, "Search input should be rendered");

  // User types 'c' at t=0
  typeIntoInput(input, "c");
  // User types 'ci' at t=80ms
  await sleep(80);
  typeIntoInput(input, "ci");
  // User types 'cis' at t=160ms
  await sleep(80);
  typeIntoInput(input, "cis");
  // User types 'cisco' at t=240ms
  await sleep(80);
  typeIntoInput(input, "cisco");

  // At t=350ms (only ~110ms after last keystroke), onSearchChange should NOT have fired yet
  await sleep(100);
  assert.strictEqual(
    searchCalls.length,
    0,
    "Search callback should NOT fire before 300ms debounce window expires"
  );

  // At t=600ms (~360ms after last keystroke), onSearchChange should have fired exactly ONCE with 'cisco'
  await sleep(250);
  assert.strictEqual(
    searchCalls.length,
    1,
    "Search callback must fire exactly once after 300ms of inactivity"
  );
  assert.strictEqual(searchCalls[0].value, "cisco");

  cleanup();
});

test("AdminFilterToolbar - Search synchronization with external prop changes", async () => {
  let currentSearch = "";
  function Wrapper() {
    const [search, setSearch] = React.useState(currentSearch);
    (global as unknown as { __setSearch?: (v: string) => void }).__setSearch = setSearch;
    return React.createElement(AdminFilterToolbar, {
      searchQuery: search,
      onSearchChange: (v: string) => {
        currentSearch = v;
      },
    });
  }

  const { container, cleanup } = mountElement(React.createElement(Wrapper));
  await sleep(20);

  const input = container.querySelector("input") as unknown as HTMLInputElement;
  assert.strictEqual(input.value, "");

  // External change (e.g. from URL or parent filter reset)
  (global as unknown as { __setSearch?: (v: string) => void }).__setSearch?.("Catalyst-9300");
  await sleep(20);

  assert.strictEqual(
    input.value,
    "Catalyst-9300",
    "Input value must immediately synchronize when external searchQuery prop changes"
  );

  cleanup();
});

test("AdminFilterToolbar - Clear search button clears input and fires onSearchChange immediately", async () => {
  const calls: string[] = [];
  const { container, cleanup } = mountElement(
    React.createElement(AdminFilterToolbar, {
      searchQuery: "Initial Query",
      onSearchChange: (v: string) => {
        calls.push(v);
      },
    })
  );

  await sleep(20);
  const input = container.querySelector("input") as unknown as HTMLInputElement;
  assert.strictEqual(input.value, "Initial Query");

  // Find clear button
  const clearBtn = container.querySelector('button[aria-label="پاک کردن جستجو"]') as unknown as HTMLButtonElement;
  assert.ok(clearBtn, "Clear button should be visible when input has content");

  dispatchClick(clearBtn);
  await sleep(20);

  assert.strictEqual(input.value, "");
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0], "");

  cleanup();
});

test("AdminFilterToolbar - Status tabs selection, Persian badge formatting, and variants", async () => {
  const tabCalls: string[] = [];
  const statusTabs = [
    { id: "all", label: "همه سفارش‌ها", count: 142 },
    { id: "pending", label: "در انتظار مالی", count: 18, badgeVariant: "orange" as const },
    { id: "warehouse", label: "بسته‌بندی انبار", count: 0, badgeVariant: "emerald" as const },
  ];

  const { container, cleanup } = mountElement(
    React.createElement(AdminFilterToolbar, {
      searchQuery: "",
      onSearchChange: () => {},
      statusTabs,
      activeStatusTab: "pending",
      onStatusTabChange: (id: string) => {
        tabCalls.push(id);
      },
    })
  );

  await sleep(20);
  const tabButtons = container.querySelectorAll("button");
  assert.ok(tabButtons.length >= 3);

  // Tab 1 count (142 -> ۱۴۲)
  assert.ok(container.innerHTML.includes("۱۴۲"));
  // Tab 3 count (0 -> ۰)
  assert.ok(container.innerHTML.includes("۰"));

  // Click on "all" tab
  dispatchClick(tabButtons[0]);
  assert.strictEqual(tabCalls.length, 1);
  assert.strictEqual(tabCalls[0], "all");

  cleanup();
});

test("AdminFilterToolbar - Export button and loading state", async () => {
  let exportClicked = false;
  // Non-loading state
  const { container: c1, cleanup: cl1 } = mountElement(
    React.createElement(AdminFilterToolbar, {
      searchQuery: "",
      onSearchChange: () => {},
      onExport: () => {
        exportClicked = true;
      },
      exportLabel: "دریافت فایل اکسل",
      isExporting: false,
    })
  );

  await sleep(20);
  const exportBtn1 = Array.from(c1.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("دریافت فایل اکسل")
  ) as unknown as HTMLButtonElement | undefined;
  assert.ok(exportBtn1);
  dispatchClick(exportBtn1);
  assert.strictEqual(exportClicked, true);
  cl1();

  // Loading state (isExporting = true)
  const { container: c2, cleanup: cl2 } = mountElement(
    React.createElement(AdminFilterToolbar, {
      searchQuery: "",
      onSearchChange: () => {},
      onExport: () => {},
      exportLabel: "دریافت فایل اکسل",
      isExporting: true,
    })
  );

  await sleep(20);
  const exportBtn2 = Array.from(c2.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("دریافت فایل اکسل")
  ) as unknown as HTMLButtonElement | undefined;
  assert.ok(exportBtn2);
  assert.strictEqual(exportBtn2.disabled, true);
  // Spinner icon is present
  assert.ok(c2.innerHTML.includes("animate-spin"));
  cl2();
});

test("AdminFilterToolbar - Extreme inputs and zero crashes", () => {
  // Extreme 1: 5,000 character search query
  assert.doesNotThrow(() => {
    renderToString(
      React.createElement(AdminFilterToolbar, {
        searchQuery: "A".repeat(5000),
        onSearchChange: () => {},
      })
    );
  });

  // Extreme 2: Special characters & injection vectors
  assert.doesNotThrow(() => {
    renderToString(
      React.createElement(AdminFilterToolbar, {
        searchQuery: `<script>alert("xss")</script> & ' " \\ / !@#$%^&*()_+ فارسی ۰۱۲۳۴۵۶۷۸۹`,
        onSearchChange: () => {},
      })
    );
  });

  // Extreme 3: Empty statusTabs
  assert.doesNotThrow(() => {
    renderToString(
      React.createElement(AdminFilterToolbar, {
        searchQuery: "",
        onSearchChange: () => {},
        statusTabs: [],
      })
    );
  });
});
