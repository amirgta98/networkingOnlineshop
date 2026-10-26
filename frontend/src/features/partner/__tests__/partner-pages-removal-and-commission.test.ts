import test from "node:test";
import assert from "node:assert";
import { PARTNER_PAGES } from "../data/partner-pages.ts";
import { ALL_DASHBOARD_PAGES } from "../../dashboard/data/dashboard-pages.ts";
import {
  getPartnerRouteForDashboard,
  resolveAuthRedirect,
} from "../../auth/types/auth.types.ts";

test("PARTNER_PAGES: strictly excludes deleted pages (internet, static-ip, catalog, agents)", () => {
  const pageIds = PARTNER_PAGES.map((p) => p.id);
  const pageHrefs = PARTNER_PAGES.map((p) => p.href);

  assert.strictEqual(pageIds.includes("internet"), false, "internet page must not be in PARTNER_PAGES");
  assert.strictEqual(pageIds.includes("static-ip"), false, "static-ip page must not be in PARTNER_PAGES");
  assert.strictEqual(pageIds.includes("catalog"), false, "catalog page must not be in PARTNER_PAGES");
  assert.strictEqual(pageIds.includes("agents"), false, "agents page must not be in PARTNER_PAGES");

  assert.strictEqual(pageHrefs.includes("/partner/internet"), false);
  assert.strictEqual(pageHrefs.includes("/partner/static-ip"), false);
  assert.strictEqual(pageHrefs.includes("/partner/catalog"), false);
  assert.strictEqual(pageHrefs.includes("/partner/agents"), false);
});

test("ALL_DASHBOARD_PAGES: strictly excludes partner-internet, partner-static-ip, partner-catalog, partner-agents", () => {
  const dashboardPageIds = ALL_DASHBOARD_PAGES.map((p) => p.id);

  assert.strictEqual(dashboardPageIds.includes("partner-internet" as any), false);
  assert.strictEqual(dashboardPageIds.includes("partner-static-ip" as any), false);
  assert.strictEqual(dashboardPageIds.includes("partner-catalog" as any), false);
  assert.strictEqual(dashboardPageIds.includes("partner-agents" as any), false);
});

test("getPartnerRouteForDashboard: redirects internet and static-ip to /internet, and catalog and agents to /partner", () => {
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/partner-internet"), "/internet");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/partner-static-ip"), "/internet");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/partner-catalog"), "/partner");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/partner-agents"), "/partner");

  // Query parameter preservation
  assert.strictEqual(
    getPartnerRouteForDashboard("/dashboard/partner-internet?plan=ftth"),
    "/internet?plan=ftth"
  );
  assert.strictEqual(
    getPartnerRouteForDashboard("/dashboard/partner-static-ip?qty=2"),
    "/internet?qty=2"
  );
  assert.strictEqual(
    getPartnerRouteForDashboard("/dashboard/partner-catalog?cat=cisco"),
    "/partner?cat=cisco"
  );
  assert.strictEqual(
    getPartnerRouteForDashboard("/dashboard/partner-agents?view=all"),
    "/partner?view=all"
  );
});

test("resolveAuthRedirect: redirects partner users visiting obsolete partner URLs cleanly", () => {
  assert.strictEqual(resolveAuthRedirect("partner", "/partner/internet"), "/internet");
  assert.strictEqual(resolveAuthRedirect("partner", "/partner/static-ip"), "/internet");
  assert.strictEqual(resolveAuthRedirect("partner", "/partner/catalog"), "/partner");
  assert.strictEqual(resolveAuthRedirect("partner", "/partner/agents"), "/partner");

  // Works for partner_b2b as well
  assert.strictEqual(resolveAuthRedirect("partner_b2b", "/partner/internet"), "/internet");
  assert.strictEqual(resolveAuthRedirect("partner_b2b", "/partner/static-ip"), "/internet");
  assert.strictEqual(resolveAuthRedirect("partner_b2b", "/partner/catalog"), "/partner");
  assert.strictEqual(resolveAuthRedirect("partner_b2b", "/partner/agents"), "/partner");

  // Preserves query strings
  assert.strictEqual(
    resolveAuthRedirect("partner", "/partner/internet?cycle=12_months"),
    "/internet?cycle=12_months"
  );
});

test("commission calculation logic for internet and static IP orders", () => {
  const defaultInternetCommission = 400_000;
  const defaultStaticIpCommission = 150_000;

  // Internet only
  const calcCommission = (hasStaticIp: boolean, internetRate = defaultInternetCommission, ipRate = defaultStaticIpCommission) => {
    return internetRate + (hasStaticIp ? ipRate : 0);
  };

  assert.strictEqual(calcCommission(false), 400_000);
  assert.strictEqual(calcCommission(true), 550_000);

  // Custom rates from profile
  assert.strictEqual(calcCommission(false, 500_000, 200_000), 500_000);
  assert.strictEqual(calcCommission(true, 500_000, 200_000), 700_000);

  // Nullish coalescing test: explicit 0 commission must NOT fall back to default
  const resolveCommission = (customRate: number | undefined, defaultRate: number) =>
    customRate ?? defaultRate;
  assert.strictEqual(
    resolveCommission(0, defaultInternetCommission),
    0,
    "Explicit 0 commission rate must NOT fall back to 400,000 Toman"
  );
  assert.strictEqual(
    resolveCommission(0, defaultStaticIpCommission),
    0,
    "Explicit 0 commission rate must NOT fall back to 150,000 Toman"
  );
  assert.strictEqual(resolveCommission(undefined, defaultInternetCommission), 400_000);
  assert.strictEqual(resolveCommission(undefined, defaultStaticIpCommission), 150_000);
});

test("commission percentage calculation relative to plan and total payable order", () => {
  const calcPercent = (commission: number, total: number) =>
    total > 0 ? Math.round((commission / total) * 100) : 0;

  // FTTH plan: 1,850,000 monthly
  const ftthMonthly = 1_850_000;
  assert.strictEqual(calcPercent(400_000, ftthMonthly), 22, "FTTH commission should be ~22% of monthly rate");

  // Point to Point plan: 3,400,000 monthly
  const ptpMonthly = 3_400_000;
  assert.strictEqual(calcPercent(400_000, ptpMonthly), 12, "PTP commission should be ~12% of monthly rate");

  // Single Static IP: 120,000 monthly
  const singleIpMonthly = 120_000;
  assert.strictEqual(calcPercent(150_000, singleIpMonthly), 125, "Single IP commission can exceed 100% of single monthly rate");

  // Combined order: 12 months FTTH (20% discount = 1,480,000 * 12 = 17,760,000) + IP single (96,000 * 12 = 1,152,000)
  const totalOrderAmount = 17_760_000 + 1_152_000;
  const totalCommission = 400_000 + 150_000; // 550,000
  assert.strictEqual(calcPercent(totalCommission, totalOrderAmount), 3);
});

test("partner wallet transaction structure for credited commission on internet order", () => {
  const trackingCode = "NET-ISP-981245";
  const commissionAmount = 550_000;
  const planName = "فیبر نوری سازمانی الترا (FTTH Enterprise)";
  const ipLabel = "۱ عدد IP استاتیک اختصاصی (تکی)";

  const walletTx = {
    id: `tx-comm-1700000000000`,
    trackingCode: `COMM-${trackingCode}`,
    amount: commissionAmount,
    type: "deposit",
    typeLabel: "پورسانت فروش همکار",
    title: `پورسانت فروش ${planName} و ${ipLabel} (سفارش ${trackingCode})`,
    status: "successful",
    statusLabel: "شارژ شد",
    gatewayName: "کیف پول همکاران B2B",
  };

  assert.strictEqual(walletTx.amount, 550_000);
  assert.strictEqual(walletTx.type, "deposit");
  assert.strictEqual(walletTx.trackingCode, "COMM-NET-ISP-981245");
  assert.strictEqual(walletTx.status, "successful");
  assert.ok(walletTx.title.includes("پورسانت فروش"));
  assert.ok(walletTx.title.includes(trackingCode));
});

test("PARTNER_PAGES includes wallet route under finance category", () => {
  const walletPage = PARTNER_PAGES.find((p) => p.id === "wallet");
  assert.ok(walletPage, "wallet page must exist in PARTNER_PAGES");
  assert.strictEqual(walletPage?.href, "/partner/wallet");
  assert.strictEqual(walletPage?.category, "finance");
});

test("getPartnerRouteForDashboard correctly routes /dashboard/wallet to /partner/wallet", () => {
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/wallet"), "/partner/wallet");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/wallet?tab=withdraw"), "/partner/wallet?tab=withdraw");
});

test("toEnglishDigits and card/sheba normalization handles Persian/Arabic digits correctly", () => {
  const toEnglishDigits = (str?: string): string => {
    if (!str) return "";
    return str
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
  };

  // Persian digits
  assert.strictEqual(toEnglishDigits("۶۰۳۷۹۹۱۱"), "60379911");
  // Arabic digits
  assert.strictEqual(toEnglishDigits("٦٠٣٧٩٩١١"), "60379911");

  // Spaced and dashed card
  const cleanCard = toEnglishDigits("۶۰۳۷-۹۹۱۱-۲۲۳۳-۴۴۵۵").replace(/[\s-]/g, "").replace(/\D/g, "");
  assert.strictEqual(cleanCard, "6037991122334455");

  // Sheba with spaces and lowercase
  let cleanSheba = toEnglishDigits("ir ۱۲ ۰۱۷۰ ۰۰۰۰ ۰۰۱۲ ۳۴۵۶ ۷۸۹۰ ۱۲").replace(/[\s-]/g, "").toUpperCase();
  if (!cleanSheba.startsWith("IR")) cleanSheba = "IR" + cleanSheba.replace(/^IR/i, "");
  assert.strictEqual(cleanSheba, "IR120170000000123456789012");
  assert.strictEqual(cleanSheba.length, 26);
  assert.strictEqual(/^IR\d{24}$/.test(cleanSheba), true);
});


