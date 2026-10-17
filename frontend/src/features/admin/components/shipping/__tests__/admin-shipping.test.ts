import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
const { loadComponent } = req(
  "../../shared/__tests__/test-env.ts"
) as typeof import("../../shared/__tests__/test-env");

const {
  getEffectiveMethodDetails,
  isMethodAvailableForProvince,
  shippingApi,
} = loadComponent<{
  getEffectiveMethodDetails: (method: any, province?: string | null) => any;
  isMethodAvailableForProvince: (method: any, province?: string) => boolean;
  shippingApi: {
    getMethods: (province?: string, subtotal?: number) => Promise<any[]>;
    calculateShipping: (methodId: string, subtotal: number, province?: string) => Promise<any>;
  };
}>("./src/features/checkout/api/shipping-api.ts");

const { calculateOrderFinancials, placeOrder, DEFAULT_DELIVERY_METHODS } = loadComponent<{
  calculateOrderFinancials: (
    items: any[],
    deliveryMethodId: string,
    invoiceType: "personal" | "legal",
    appliedCoupon: any,
    availableMethods?: any[],
    province?: string
  ) => any;
  placeOrder: (payload: any, cartItems: any[], availableMethods?: any[]) => Promise<any>;
  DEFAULT_DELIVERY_METHODS: any[];
}>("./src/features/checkout/api/checkout-api.ts");

const { areProvincesMatching, normalizeProvinceName } = loadComponent<{
  areProvincesMatching: (p1?: string | null, p2?: string | null) => boolean;
  normalizeProvinceName: (p?: string | null) => string;
}>("./src/shared/lib/utils.ts");

const { adminShippingApi } = loadComponent<{
  adminShippingApi: any;
}>("./src/features/admin/api/admin-shipping-api.ts");

const { PRESET_CARRIER_ICONS } = loadComponent<{
  PRESET_CARRIER_ICONS: Array<{ name: string; label: string; icon: any }>;
}>("./src/features/admin/components/shipping/admin-shipping-view.tsx");

test("PRESET_CARRIER_ICONS includes 10 preset icons", () => {
  assert.strictEqual(PRESET_CARRIER_ICONS.length, 10);
  const names = PRESET_CARRIER_ICONS.map((p) => p.name);
  assert.ok(names.includes("truck"));
  assert.ok(names.includes("zap"));
  assert.ok(names.includes("package"));
  assert.ok(names.includes("building2"));
  assert.ok(names.includes("plane"));
  assert.ok(names.includes("bike"));
  assert.ok(names.includes("box"));
  assert.ok(names.includes("clock"));
  assert.ok(names.includes("shield-check"));
  assert.ok(names.includes("map-pin"));
});

test("getEffectiveMethodDetails returns base fields when no province or rule matches", () => {
  const method = {
    id: "m1",
    title: "تیپاکس سریع",
    cost: 55000,
    freeThreshold: 2000000,
    estimatedDeliveryTime: "۲۴ الی ۴۸ ساعت کاری",
    provinceRules: [
      {
        province: "خراسان رضوی",
        cost: 35000,
        estimatedDeliveryTime: "۲۴ ساعته",
      },
    ],
  };

  const detailsNoProv = getEffectiveMethodDetails(method, null);
  assert.strictEqual(detailsNoProv.cost, 55000);
  assert.strictEqual(detailsNoProv.effectiveCost, 55000);
  assert.strictEqual(detailsNoProv.estimatedDeliveryTime, "۲۴ الی ۴۸ ساعت کاری");
  assert.strictEqual(detailsNoProv.effectiveDeliveryTime, "۲۴ الی ۴۸ ساعت کاری");
  assert.strictEqual(detailsNoProv.freeThreshold, 2000000);
  assert.strictEqual(detailsNoProv.isFree, false);
  assert.strictEqual(detailsNoProv.isCustomized, false);

  const detailsOtherProv = getEffectiveMethodDetails(method, "گیلان");
  assert.strictEqual(detailsOtherProv.cost, 55000);
  assert.strictEqual(detailsOtherProv.isCustomized, false);
});

test("getEffectiveMethodDetails applies province rule overrides", () => {
  const method = {
    id: "m2",
    title: "پست پیشتاز",
    cost: 45000,
    freeThreshold: 1500000,
    estimatedDeliveryTime: "۲ الی ۴ روز کاری",
    provinceRules: [
      {
        province: "تهران",
        cost: 25000,
        estimatedDeliveryTime: "۲۴ ساعته",
        freeThreshold: 800000,
      },
      {
        province: "یزد",
        isFree: true,
      },
    ],
  };

  // Tehran override
  const tehranDetails = getEffectiveMethodDetails(method, "تهران");
  assert.strictEqual(tehranDetails.cost, 25000);
  assert.strictEqual(tehranDetails.effectiveCost, 25000);
  assert.strictEqual(tehranDetails.estimatedDeliveryTime, "۲۴ ساعته");
  assert.strictEqual(tehranDetails.freeThreshold, 800000);
  assert.strictEqual(tehranDetails.isFree, false);
  assert.strictEqual(tehranDetails.isCustomized, true);

  // Yazd isFree override
  const yazdDetails = getEffectiveMethodDetails(method, "یزد");
  assert.strictEqual(yazdDetails.cost, 0);
  assert.strictEqual(yazdDetails.effectiveCost, 0);
  assert.strictEqual(yazdDetails.isFree, true);
  assert.strictEqual(yazdDetails.effectiveIsFree, true);
  assert.strictEqual(yazdDetails.isCustomized, true);
});

test("shippingApi.calculateShipping dynamically applies destination province rules", async () => {
  // tipax_express in fallback has rules:
  // Tehran: cost 60000, freeThreshold 6000000
  // Qom: isFree = true (cost 0)
  // Khorasan Razavi: cost 85000, freeThreshold 9000000
  // Other provinces: base cost 75000, base freeThreshold 8000000

  // 1. Tehran with 1,000,000 subtotal
  const resultTehran = await shippingApi.calculateShipping("tipax_express", 1000000, "تهران");
  assert.strictEqual(resultTehran.cost, 60000);
  assert.strictEqual(resultTehran.isFree, false);

  // 2. Qom: isFree: true -> cost 0
  const resultQom = await shippingApi.calculateShipping("tipax_express", 1000000, "قم");
  assert.strictEqual(resultQom.cost, 0);
  assert.strictEqual(resultQom.isFree, true);

  // 3. Khorasan Razavi: cost 85000
  const resultKhorasan = await shippingApi.calculateShipping("tipax_express", 1000000, "خراسان رضوی");
  assert.strictEqual(resultKhorasan.cost, 85000);
  assert.strictEqual(resultKhorasan.isFree, false);

  // 4. Other province (Isfahan): base cost 75000
  const resultIsfahan = await shippingApi.calculateShipping("tipax_express", 1000000, "اصفهان");
  assert.strictEqual(resultIsfahan.cost, 75000);
  assert.strictEqual(resultIsfahan.isFree, false);

  // 5. Tehran with 7,000,000 subtotal reaches Tehran free threshold (6,000,000)
  const resultTehranFree = await shippingApi.calculateShipping("tipax_express", 7000000, "تهران");
  assert.strictEqual(resultTehranFree.cost, 0);
  assert.strictEqual(resultTehranFree.isFree, true);

  // 6. Khorasan Razavi with 7,000,000 subtotal does NOT reach Khorasan threshold (9,000,000)
  const resultKhorasanNotFree = await shippingApi.calculateShipping("tipax_express", 7000000, "خراسان رضوی");
  assert.strictEqual(resultKhorasanNotFree.cost, 85000);
  assert.strictEqual(resultKhorasanNotFree.isFree, false);
});

test("calculateOrderFinancials factors in destination province for shipping calculation", () => {
  const items = [
    {
      product: {
        id: "p1",
        title: "کابل شبکه",
        price: 500000,
        slug: "lan-cable",
      },
      quantity: 2,
    },
  ]; // subtotal = 1,000,000

  // Methods with province rules
  const customMethods = [
    {
      id: "carrier_spec",
      title: "پیک ویژه استانی",
      cost: 50000,
      freeThreshold: 2000000,
      provinceRules: [
        {
          province: "تهران",
          cost: 30000,
        },
        {
          province: "قم",
          isFree: true,
        },
      ],
    },
  ];

  // For Tehran: 30,000 shipping cost
  const finTehran = calculateOrderFinancials(
    items as any,
    "carrier_spec",
    "personal",
    null,
    customMethods as any,
    "تهران"
  );
  assert.strictEqual(finTehran.subtotal, 1000000);
  assert.strictEqual(finTehran.shippingCost, 30000);
  assert.strictEqual(finTehran.payableTotal, 1030000);

  // For Qom: free shipping
  const finQom = calculateOrderFinancials(
    items as any,
    "carrier_spec",
    "personal",
    null,
    customMethods as any,
    "قم"
  );
  assert.strictEqual(finQom.shippingCost, 0);
  assert.strictEqual(finQom.payableTotal, 1000000);

  // For Gilan: base cost 50,000
  const finGilan = calculateOrderFinancials(
    items as any,
    "carrier_spec",
    "personal",
    null,
    customMethods as any,
    "گیلان"
  );
  assert.strictEqual(finGilan.shippingCost, 50000);
  assert.strictEqual(finGilan.payableTotal, 1050000);
});

test("adminShippingApi supports carrier iconUrl and provinceRules CRUD", async () => {
  const created = await adminShippingApi.createMethod({
    title: "باربری اختصاصی جنوب",
    subtitle: "حمل و نقل سنگین به بنادر",
    cost: 120000,
    freeThreshold: 5000000,
    estimatedDeliveryTime: "۳ روز کاری",
    iconName: "package",
    iconUrl: "/uploads/carriers/carrier-123.png",
    provinceRules: [
      {
        province: "بوشهر",
        cost: 80000,
        estimatedDeliveryTime: "۲۴ ساعته",
      },
      {
        province: "هرمزگان",
        isFree: true,
      },
    ],
  });

  assert.ok(created.id);
  assert.strictEqual(created.iconUrl, "/uploads/carriers/carrier-123.png");
  assert.strictEqual(created.provinceRules?.length, 2);

  // Update rule
  const updated = await adminShippingApi.updateMethod(created.id, {
    cost: 110000,
    provinceRules: [
      {
        province: "بوشهر",
        cost: 70000,
      },
    ],
  });

  assert.strictEqual(updated.cost, 110000);
  assert.strictEqual(updated.provinceRules?.length, 1);
  assert.strictEqual(updated.provinceRules?.[0].cost, 70000);

  // Delete
  await adminShippingApi.deleteMethod(created.id);
  const allMethods = await adminShippingApi.getMethods();
  assert.ok(!allMethods.some((m: any) => m.id === created.id));
});

test("areProvincesMatching strictly prevents substring collision (Kerman vs Kermanshah)", () => {
  assert.strictEqual(areProvincesMatching("کرمان", "کرمانشاه"), false);
  assert.strictEqual(areProvincesMatching("کرمانشاه", "کرمان"), false);
  assert.strictEqual(areProvincesMatching("خراسان رضوی", "خراسان جنوبی"), false);
  assert.strictEqual(areProvincesMatching("خراسان رضوی", "خراسان"), false);

  // Valid canonical matches
  assert.strictEqual(areProvincesMatching("استان تهران", "تهران"), true);
  assert.strictEqual(areProvincesMatching("تهران", "استان تهران"), true);
  assert.strictEqual(areProvincesMatching("آذربایجان شرقی", "آذربایجان‌شرقی"), true);
  assert.strictEqual(areProvincesMatching("چهارمحال وبختیاری", "چهارمحال و بختیاری"), true);
});

test("getEffectiveMethodDetails strictly applies matching province rules without substring bleeding", () => {
  const method = {
    id: "m_kerman",
    title: "باربری کویر",
    cost: 80000,
    provinceRules: [
      {
        province: "کرمان",
        cost: 25000,
        estimatedDeliveryTime: "۲۴ ساعته",
      },
    ],
  };

  // Kerman gets 25,000
  const kermanDetails = getEffectiveMethodDetails(method as any, "کرمان");
  assert.strictEqual(kermanDetails.cost, 25000);
  assert.strictEqual(kermanDetails.isCustomized, true);

  // Ostān Kerman gets 25,000
  const ostanKermanDetails = getEffectiveMethodDetails(method as any, "استان کرمان");
  assert.strictEqual(ostanKermanDetails.cost, 25000);
  assert.strictEqual(ostanKermanDetails.isCustomized, true);

  // Kermanshah MUST get base cost 80,000 and isCustomized: false
  const kermanshahDetails = getEffectiveMethodDetails(method as any, "کرمانشاه");
  assert.strictEqual(kermanshahDetails.cost, 80000);
  assert.strictEqual(kermanshahDetails.isCustomized, false);
});

test("isMethodAvailableForProvince honors exact province restrictions", () => {
  const restrictedMethod = {
    id: "m_only_kerman",
    title: "پیک استانی",
    allowedProvinces: ["کرمان"],
    isActive: true,
  };

  assert.strictEqual(isMethodAvailableForProvince(restrictedMethod as any, "کرمان"), true);
  assert.strictEqual(isMethodAvailableForProvince(restrictedMethod as any, "استان کرمان"), true);
  assert.strictEqual(isMethodAvailableForProvince(restrictedMethod as any, "کرمانشاه"), false);
  assert.strictEqual(isMethodAvailableForProvince(restrictedMethod as any, "اصفهان"), false);
});

test("placeOrder applies province rules and zero shipping fee for free province", async () => {
  const cartItems = [
    {
      product: {
        id: "p1",
        title: "مودم فیبر نوری",
        price: 1500000,
        slug: "fiber-modem",
      },
      quantity: 1,
    },
  ];

  const customMethods = [
    {
      id: "carrier_express",
      title: "تیپاکس سریع",
      cost: 70000,
      freeThreshold: 4000000,
      provinceRules: [
        {
          province: "قم",
          isFree: true,
        },
        {
          province: "تهران",
          cost: 40000,
        },
      ],
    },
  ];

  // 1. Order to Qom: shipping should be 0, total 1,500,000
  const orderQom = await placeOrder(
    {
      shippingAddress: {
        recipientName: "رضا محمدی",
        phoneNumber: "09121112233",
        province: "قم",
        city: "قم",
        postalCode: "1234567890",
        address: "خیابان ارم",
        recipientIsSelf: true,
      },
      deliveryMethodId: "carrier_express",
      deliveryDate: "2026-10-25",
      deliveryDateJalali: "یکشنبه ۳ آبان",
      deliveryTimeSlot: "morning",
      paymentMethodId: "online_gateway",
      invoiceType: "personal",
    },
    cartItems as any,
    customMethods as any
  );

  assert.strictEqual(orderQom.financialSummary.shippingCost, 0);
  assert.strictEqual(orderQom.financialSummary.isFreeShipping, true);
  assert.strictEqual(orderQom.financialSummary.payableTotal, 1500000);

  // 2. Order to Tehran: shipping should be 40,000, total 1,540,000
  const orderTehran = await placeOrder(
    {
      shippingAddress: {
        recipientName: "رضا محمدی",
        phoneNumber: "09121112233",
        province: "تهران",
        city: "تهران",
        postalCode: "1234567890",
        address: "خیابان ولیعصر",
        recipientIsSelf: true,
      },
      deliveryMethodId: "carrier_express",
      deliveryDate: "2026-10-25",
      deliveryDateJalali: "یکشنبه ۳ آبان",
      deliveryTimeSlot: "morning",
      paymentMethodId: "online_gateway",
      invoiceType: "personal",
    },
    cartItems as any,
    customMethods as any
  );

  assert.strictEqual(orderTehran.financialSummary.shippingCost, 40000);
  assert.strictEqual(orderTehran.financialSummary.payableTotal, 1540000);

  // 3. Order to Yazd (no rule): shipping should be base 70,000, total 1,570,000
  const orderYazd = await placeOrder(
    {
      shippingAddress: {
        recipientName: "رضا محمدی",
        phoneNumber: "09121112233",
        province: "یزد",
        city: "یزد",
        postalCode: "1234567890",
        address: "میدان امیرچقماق",
        recipientIsSelf: true,
      },
      deliveryMethodId: "carrier_express",
      deliveryDate: "2026-10-25",
      deliveryDateJalali: "یکشنبه ۳ آبان",
      deliveryTimeSlot: "morning",
      paymentMethodId: "online_gateway",
      invoiceType: "personal",
    },
    cartItems as any,
    customMethods as any
  );

  assert.strictEqual(orderYazd.financialSummary.shippingCost, 70000);
  assert.strictEqual(orderYazd.financialSummary.payableTotal, 1570000);
});
