import test from "node:test";
import assert from "node:assert";

// Product shape representation matching catalog types
interface ProductStub {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  tieredPricing?: Array<{ minQuantity: number; discountPercent: number }>;
}

// Logic mirror of isProductEligibleForAffiliateDiscount and calculateAffiliatePrice
function isProductEligibleForAffiliateDiscount(
  product: ProductStub,
  isPartner: boolean,
  settings = {
    isAffiliateSystemEnabled: true,
    isProductDiscountEnabled: true,
    eligibleCategoryIds: [] as string[],
    eligibleProductIds: [] as string[],
  }
): boolean {
  // Rule 0: Strictly requires active partner role
  if (!isPartner) {
    return false;
  }

  if (!settings.isAffiliateSystemEnabled || !settings.isProductDiscountEnabled) {
    return false;
  }

  const sku = (product.sku || "").toUpperCase();
  const name = (product.name || "").toUpperCase();
  const category = (product.category || "").toLowerCase();

  // Rule 1: Internet & Static IP never get affiliate discounts
  const isStaticIp =
    sku.includes("IP-STATIC") ||
    sku.includes("STATIC_IP") ||
    name.includes("IP استاتیک") ||
    name.includes("IP ثابت") ||
    category === "static-ip";

  const isInternet =
    sku.includes("INT-") ||
    sku.includes("FTTH") ||
    sku.includes("INTERNET") ||
    name.includes("اینترنت") ||
    name.includes("پهنای باند") ||
    category === "internet";

  if (isStaticIp || isInternet) {
    return false;
  }

  // Rule 2: Product MUST NOT already have standard sale discounts
  const originalPrice = product.originalPrice ?? 0;
  const price = product.price ?? 0;
  const discountPercent = product.discountPercent ?? 0;

  if ((originalPrice > 0 && originalPrice > price) || discountPercent > 0) {
    return false;
  }

  // Rule 3: Product MUST NOT have tiered stepped pricing
  if (product.tieredPricing && product.tieredPricing.length > 0) {
    return false;
  }

  // Rule 4: Whitelist checks
  if (settings.eligibleCategoryIds && settings.eligibleCategoryIds.length > 0) {
    if (!settings.eligibleCategoryIds.includes(category)) {
      return false;
    }
  }

  if (settings.eligibleProductIds && settings.eligibleProductIds.length > 0 && product.id) {
    if (!settings.eligibleProductIds.includes(product.id)) {
      return false;
    }
  }

  return true;
}

function getEffectiveDiscountPercent(isPartner: boolean, customDiscount?: number | null, defaultPercent = 8): number {
  if (!isPartner) return 0;
  return customDiscount ?? defaultPercent;
}

function calculateAffiliatePrice(
  product: ProductStub,
  isPartner: boolean,
  effectiveDiscountPercent = 8
) {
  const price = product.price || 0;

  // Affiliate discount applies strictly to users with partner role
  if (!isPartner) {
    return {
      isEligible: false,
      discountPercent: 0,
      discountAmount: 0,
      unitPriceAfterDiscount: price,
    };
  }

  const isEligible = isProductEligibleForAffiliateDiscount(product, isPartner);

  if (!isEligible) {
    return {
      isEligible: false,
      discountPercent: 0,
      discountAmount: 0,
      unitPriceAfterDiscount: price,
    };
  }

  const discountRate = effectiveDiscountPercent;
  const discountAmount = Math.round(price * (discountRate / 100));
  const unitPriceAfterDiscount = Math.max(0, price - discountAmount);

  return {
    isEligible: true,
    discountPercent: discountRate,
    discountAmount,
    unitPriceAfterDiscount,
  };
}

// UI Badge Visibility helper matching ProductCard & ProductInfo
function shouldShowPartnerBadge(product: ProductStub, isPartner: boolean): boolean {
  const calc = calculateAffiliatePrice(product, isPartner);
  return isPartner && calc.isEligible;
}

test("regular user (role: customer) must NOT see partner discount on standard products", () => {
  const product: ProductStub = {
    id: "prod-1",
    sku: "SW-CISCO-2960",
    name: "سوئیچ ۲۴ پورت سیسکو",
    category: "switch",
    price: 10_000_000,
  };

  const isPartner = false; // Normal customer
  assert.strictEqual(isProductEligibleForAffiliateDiscount(product, isPartner), false);
  assert.strictEqual(getEffectiveDiscountPercent(isPartner), 0, "Effective discount for regular customer must be 0%");

  const calc = calculateAffiliatePrice(product, isPartner);
  assert.strictEqual(calc.isEligible, false, "Regular user must not be eligible for affiliate discount");
  assert.strictEqual(calc.discountPercent, 0);
  assert.strictEqual(calc.discountAmount, 0);
  assert.strictEqual(calc.unitPriceAfterDiscount, 10_000_000);
  assert.strictEqual(shouldShowPartnerBadge(product, isPartner), false, "Badge must be hidden for regular user");
});

test("admin user (role: admin) must NOT receive partner discount unless explicitly partnered", () => {
  const userRole = "admin";
  const isPartner = userRole === "partner" || (userRole as string) === "partner_b2b";

  const product: ProductStub = {
    id: "prod-1",
    sku: "SW-CISCO-2960",
    name: "سوئیچ ۲۴ پورت سیسکو",
    category: "switch",
    price: 10_000_000,
  };

  assert.strictEqual(isPartner, false);
  assert.strictEqual(isProductEligibleForAffiliateDiscount(product, isPartner), false);
  assert.strictEqual(getEffectiveDiscountPercent(isPartner), 0);
  assert.strictEqual(shouldShowPartnerBadge(product, isPartner), false);
});

test("partner user (role: partner) DOES see partner discount on eligible standard products", () => {
  const product: ProductStub = {
    id: "prod-1",
    sku: "SW-CISCO-2960",
    name: "سوئیچ ۲۴ پورت سیسکو",
    category: "switch",
    price: 10_000_000,
  };

  const isPartner = true; // Partner role
  assert.strictEqual(isProductEligibleForAffiliateDiscount(product, isPartner), true);
  assert.strictEqual(getEffectiveDiscountPercent(isPartner), 8);

  const calc = calculateAffiliatePrice(product, isPartner, 8);
  assert.strictEqual(calc.isEligible, true, "Partner user must be eligible for affiliate discount");
  assert.strictEqual(calc.discountPercent, 8);
  assert.strictEqual(calc.discountAmount, 800_000);
  assert.strictEqual(calc.unitPriceAfterDiscount, 9_200_000);
  assert.strictEqual(shouldShowPartnerBadge(product, isPartner), true, "Badge must be visible for partner");
});

test("partner user with partner_b2b role also qualifies as partner", () => {
  const userRole = "partner_b2b";
  const isPartner = userRole === "partner" || userRole === "partner_b2b";

  const product: ProductStub = {
    id: "prod-1",
    sku: "RT-MIKROTIK-HEX",
    name: "روتر میکروتیک hEX",
    category: "router",
    price: 5_000_000,
  };

  assert.strictEqual(isProductEligibleForAffiliateDiscount(product, isPartner), true);
  const calc = calculateAffiliatePrice(product, isPartner, 8);
  assert.strictEqual(calc.isEligible, true);
  assert.strictEqual(calc.unitPriceAfterDiscount, 4_600_000);
  assert.strictEqual(shouldShowPartnerBadge(product, isPartner), true);
});

test("partner discount is denied even for partners when product has existing sale discount", () => {
  const productWithSale: ProductStub = {
    id: "prod-2",
    sku: "FW-FORTI-60F",
    name: "فایروال فورتی‌نت 60F",
    category: "firewall",
    price: 45_000_000,
    originalPrice: 50_000_000,
    discountPercent: 10,
  };

  const isPartner = true;
  assert.strictEqual(isProductEligibleForAffiliateDiscount(productWithSale, isPartner), false);
  const calc = calculateAffiliatePrice(productWithSale, isPartner);

  assert.strictEqual(calc.isEligible, false, "Sale products do not combine with partner discount");
  assert.strictEqual(calc.unitPriceAfterDiscount, 45_000_000);
  assert.strictEqual(shouldShowPartnerBadge(productWithSale, isPartner), false);
});

test("partner discount is denied even for partners when product has tiered pricing", () => {
  const tieredProduct: ProductStub = {
    id: "prod-3",
    sku: "CB-CAT6-UTP",
    name: "کابل شبکه لگراند Cat6",
    category: "cable",
    price: 4_000_000,
    tieredPricing: [
      { minQuantity: 5, discountPercent: 10 },
      { minQuantity: 10, discountPercent: 15 },
    ],
  };

  const isPartner = true;
  assert.strictEqual(isProductEligibleForAffiliateDiscount(tieredProduct, isPartner), false);
  const calc = calculateAffiliatePrice(tieredProduct, isPartner);

  assert.strictEqual(calc.isEligible, false, "Tiered pricing products do not combine with partner discount");
  assert.strictEqual(shouldShowPartnerBadge(tieredProduct, isPartner), false);
});

test("partner discount is denied for static IP and Internet products", () => {
  const staticIpProduct: ProductStub = {
    id: "prod-ip",
    sku: "IP-STATIC-1M",
    name: "آی پی استاتیک اختصاصی ۱ ماهه",
    category: "static-ip",
    price: 150_000,
  };

  const isPartner = true;
  assert.strictEqual(isProductEligibleForAffiliateDiscount(staticIpProduct, isPartner), false);
  const calc = calculateAffiliatePrice(staticIpProduct, isPartner);

  assert.strictEqual(calc.isEligible, false, "Static IP items receive fixed commission, not partner discount");
  assert.strictEqual(shouldShowPartnerBadge(staticIpProduct, isPartner), false);
});

test("unauthenticated guest (isPartner: false) never sees partner discount badge or pricing", () => {
  const product: ProductStub = {
    id: "prod-5",
    sku: "ANT-UBIQUITI-LBE",
    name: "آنتن وایرلس لایت‌بیم",
    category: "wireless",
    price: 3_200_000,
  };

  const isPartner = false;
  assert.strictEqual(isProductEligibleForAffiliateDiscount(product, isPartner), false);
  assert.strictEqual(getEffectiveDiscountPercent(isPartner), 0);
  const calc = calculateAffiliatePrice(product, isPartner);

  assert.strictEqual(calc.isEligible, false);
  assert.strictEqual(shouldShowPartnerBadge(product, isPartner), false);
});
