import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const { renderToString, mountElement, sleep, loadComponent, React } = req("./test-env.ts") as typeof import("./test-env");

const { AdminStatsCards } = loadComponent<{
  AdminStatsCards: React.ComponentType<Record<string, unknown>>;
}>("./src/features/admin/components/shared/admin-stats-cards.tsx");

const { AdminDetailDrawer } = loadComponent<{
  AdminDetailDrawer: React.ComponentType<Record<string, unknown>>;
}>("./src/features/admin/components/shared/admin-detail-drawer.tsx");

const { AdminActionModal } = loadComponent<{
  AdminActionModal: React.ComponentType<Record<string, unknown>>;
}>("./src/features/admin/components/shared/admin-action-modal.tsx");

// Dummy Icon
const MockIcon = ({ className }: { className?: string }) =>
  React.createElement("span", { className, "data-testid": "icon" }, "ICON");

test("AdminStatsCards - Variants, Persian localization, and click interactions", async () => {
  let clickedId = "";
  const items = [
    {
      id: "stat-1",
      title: "فروش روزانه",
      value: 125000000,
      subtitle: "نسبت به روز گذشته",
      changeText: "+14.2%",
      changePositive: true,
      icon: MockIcon,
      variant: "emerald" as const,
      onClick: () => {
        clickedId = "stat-1";
      },
    },
    {
      id: "stat-2",
      title: "سفارشات معلق",
      value: "۲۴ فقره",
      changeText: "-3",
      changePositive: false,
      icon: MockIcon,
      variant: "rose" as const,
    },
    {
      id: "stat-3",
      title: "کاربران فعال",
      value: 0,
      icon: MockIcon,
      variant: "amber" as const,
    },
  ];

  const { container, cleanup } = mountElement(
    React.createElement(AdminStatsCards, {
      items,
      columns: 3,
    })
  );

  await sleep(30);

  // Check Persian numbers formatting: 125,000,000 -> Persian digits
  assert.ok(container.innerHTML.includes("۱۲۵٬۰۰۰٬۰۰۰"));
  // Value 0 -> ۰
  assert.ok(container.innerHTML.includes("۰"));

  // Check click interaction
  const firstCard = container.querySelector('[class*="group"]') as unknown as HTMLElement;
  assert.ok(firstCard, "Card element should exist");
  firstCard.dispatchEvent(new window.MouseEvent("click", { bubbles: true }) as unknown as Event);
  assert.strictEqual(clickedId, "stat-1");

  cleanup();
});

test("AdminDetailDrawer - ESC key closing and scroll lock lifecycle", async () => {
  let drawerClosed = false;
  const initialOverflow = window.document.body.style.overflow;

  const { cleanup } = mountElement(
    React.createElement(
      AdminDetailDrawer,
      {
        isOpen: true,
        onClose: () => {
          drawerClosed = true;
        },
        title: "جزئیات سفارش #1042",
        subtitle: "مشتری: شرکت ارتباطات نوین",
      },
      React.createElement("div", null, "محتوای تست دراور")
    )
  );

  await sleep(30);

  // Body overflow should be locked to "hidden"
  assert.strictEqual(
    window.document.body.style.overflow,
    "hidden",
    "Body scroll must be locked when drawer is open"
  );

  // Press ESC key
  window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape" }) as unknown as Event);
  await sleep(20);
  assert.strictEqual(drawerClosed, true, "Drawer must trigger onClose upon ESC key");

  cleanup();

  // After unmount, original overflow must be restored
  assert.strictEqual(
    window.document.body.style.overflow,
    initialOverflow,
    "Body scroll must be restored on cleanup"
  );
});

test("AdminActionModal - Variants, loading state, and confirm callback", async () => {
  let confirmed = false;

  // 1. Idle state modal
  const { cleanup: cl1 } = mountElement(
    React.createElement(AdminActionModal, {
      isOpen: true,
      onClose: () => {},
      onConfirm: () => {
        confirmed = true;
      },
      title: "تایید پرداخت فاکتور",
      description: "آیا از تایید انتقال بانکی اطمینان دارید؟",
      variant: "success",
      confirmLabel: "تایید حواله",
      isLoading: false,
    })
  );

  await sleep(30);

  // Check confirm button
  const confirmBtn = Array.from(window.document.body.querySelectorAll("button")).find((b) =>
    b.textContent?.includes("تایید حواله")
  ) as unknown as HTMLButtonElement | undefined;
  assert.ok(confirmBtn, "Confirm button should exist");
  confirmBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }) as unknown as Event);
  assert.strictEqual(confirmed, true);
  cl1();

  // 2. Loading state modal: buttons disabled, spinner present, ESC disabled
  let escClosed = false;
  const { cleanup: cl2 } = mountElement(
    React.createElement(AdminActionModal, {
      isOpen: true,
      onClose: () => {
        escClosed = true;
      },
      onConfirm: () => {},
      title: "در حال ثبت تراکنش",
      variant: "danger",
      confirmLabel: "حذف حساب",
      isLoading: true,
    })
  );

  await sleep(30);

  // Spinner should be visible
  assert.ok(window.document.body.innerHTML.includes("animate-spin"));

  // ESC key should NOT trigger onClose while loading
  window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape" }) as unknown as Event);
  await sleep(20);
  assert.strictEqual(escClosed, false, "ESC key must be disabled while isLoading is true");

  cl2();
});

test("Shared Components - Boundary inputs and zero crashes", () => {
  // Empty items in AdminStatsCards
  assert.doesNotThrow(() => {
    renderToString(React.createElement(AdminStatsCards, { items: [] }));
  });

  // Closed modals / drawers
  assert.doesNotThrow(() => {
    renderToString(
      React.createElement(
        AdminDetailDrawer,
        {
          isOpen: false,
          onClose: () => {},
          title: "Test",
        },
        null
      )
    );
    renderToString(
      React.createElement(AdminActionModal, {
        isOpen: false,
        onClose: () => {},
        title: "Test",
        onConfirm: () => {},
      })
    );
  });
});
