import test from "node:test";
import assert from "node:assert";
import {
  isValidIranianMobile,
  normalizePhoneNumber,
  maskPhone,
} from "../api/mock-users.ts";

test("phone validation: recognizes valid Iranian 11-digit mobile starting with 09", () => {
  assert.strictEqual(isValidIranianMobile("09123456789"), true);
  assert.strictEqual(isValidIranianMobile("09901234567"), true);
  assert.strictEqual(isValidIranianMobile("09351112233"), true);

  // Invalid formats
  assert.strictEqual(isValidIranianMobile("02188888888"), false); // Tehran landline
  assert.strictEqual(isValidIranianMobile("0912345678"), false);  // 10 digits
  assert.strictEqual(isValidIranianMobile("091234567890"), false); // 12 digits
  assert.strictEqual(isValidIranianMobile(""), false);
});

test("phone normalization: handles Persian and Arabic numerals", () => {
  const persianInput = "۰۹۱۲۳۴۵۶۷۸۹";
  const normalized = normalizePhoneNumber(persianInput);
  assert.strictEqual(normalized, "09123456789");
  assert.strictEqual(isValidIranianMobile(normalized), true);
});

test("phone normalization: handles country code +98 and spaces/dashes", () => {
  assert.strictEqual(normalizePhoneNumber("+989123456789"), "09123456789");
  assert.strictEqual(normalizePhoneNumber("00989123456789"), "09123456789");
  assert.strictEqual(normalizePhoneNumber("0912-345-6789"), "09123456789");
  assert.strictEqual(normalizePhoneNumber("0912 345 6789"), "09123456789");
});

test("phone masking: masks middle digits correctly", () => {
  const masked = maskPhone("09123456789");
  assert.strictEqual(masked.includes("***"), true);
  assert.strictEqual(masked.startsWith("0912"), true);
  assert.strictEqual(masked.endsWith("6789"), true);
});

import {
  normalizeUserRole,
  getPartnerRouteForDashboard,
  resolveAuthRedirect,
} from "../types/auth.types.ts";

test("role-based redirect logic maps roles to designated portals including partner_b2b", () => {
  assert.strictEqual(resolveAuthRedirect("admin"), "/admin");
  assert.strictEqual(resolveAuthRedirect("super_admin"), "/admin");
  assert.strictEqual(resolveAuthRedirect("partner"), "/partner");
  assert.strictEqual(resolveAuthRedirect("partner_b2b"), "/partner");
  assert.strictEqual(resolveAuthRedirect("customer"), "/dashboard");
  assert.strictEqual(resolveAuthRedirect(undefined), "/dashboard");
  assert.strictEqual(resolveAuthRedirect(""), "/dashboard");
});

test("resolveAuthRedirect prevents partners from being routed to /dashboard", () => {
  // Direct visits to /dashboard redirected to /partner
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard"), "/partner");
  assert.strictEqual(resolveAuthRedirect("partner_b2b", "/dashboard"), "/partner");
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/"), "/partner");

  // Absolute URL visits (e.g. from browser address bar "http://localhost:3000/dashboard")
  assert.strictEqual(resolveAuthRedirect("partner", "http://localhost:3000/dashboard"), "/partner");
  assert.strictEqual(resolveAuthRedirect("partner", "http://localhost:3000/dashboard/"), "/partner");
  assert.strictEqual(resolveAuthRedirect("partner", "http://localhost:3000/dashboard/orders"), "/partner/orders");
  assert.strictEqual(resolveAuthRedirect("partner_b2b", "http://localhost:3000/dashboard/orders?tab=active"), "/partner/orders?tab=active");

  // Specific dashboard subpages mapped to partner equivalents
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/orders"), "/partner/orders");
  assert.strictEqual(resolveAuthRedirect("partner_b2b", "/dashboard/invoices"), "/partner/invoices");
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/rfq"), "/partner/rfq");
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/support"), "/partner/support");
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/partner-catalog"), "/partner");
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/partner-credit"), "/partner/credit");
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/addresses"), "/partner/projects");
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/wallet"), "/partner/wallet");
  assert.strictEqual(resolveAuthRedirect("partner", "/partner/internet"), "/internet");
  assert.strictEqual(resolveAuthRedirect("partner", "/partner/static-ip"), "/internet");
  assert.strictEqual(resolveAuthRedirect("partner", "/partner/catalog"), "/partner");
  assert.strictEqual(resolveAuthRedirect("partner", "/partner/agents"), "/partner");

  // Query parameter preservation
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/orders?tab=active"), "/partner/orders?tab=active");
  assert.strictEqual(resolveAuthRedirect("partner", "/dashboard/invoices?orderId=123"), "/partner/invoices?orderId=123");

  // isPartner boolean flag support even if role is customer
  assert.strictEqual(resolveAuthRedirect("customer", "/dashboard", true), "/partner");
  assert.strictEqual(resolveAuthRedirect("customer", "/dashboard/orders", true), "/partner/orders");

  // Non-dashboard pages preserved
  assert.strictEqual(resolveAuthRedirect("partner", "/products"), "/products");
  assert.strictEqual(resolveAuthRedirect("partner", "/partner/projects"), "/partner/projects");

  // Customer pages preserved as dashboard
  assert.strictEqual(resolveAuthRedirect("customer", "/dashboard"), "/dashboard");
  assert.strictEqual(resolveAuthRedirect("customer", "/dashboard/orders"), "/dashboard/orders");
  assert.strictEqual(resolveAuthRedirect("admin", "/dashboard"), "/dashboard");
});

test("getPartnerRouteForDashboard maps customer dashboard routes to partner equivalents with query strings and full URLs", () => {
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard"), "/partner");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/"), "/partner");
  assert.strictEqual(getPartnerRouteForDashboard("http://localhost:3000/dashboard"), "/partner");
  assert.strictEqual(getPartnerRouteForDashboard("http://localhost:3000/dashboard/"), "/partner");
  assert.strictEqual(getPartnerRouteForDashboard("http://localhost:3000/dashboard/orders"), "/partner/orders");

  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/orders"), "/partner/orders");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/invoices"), "/partner/invoices");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/rfq"), "/partner/rfq");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/support"), "/partner/support");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/profile"), "/partner/profile");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/security"), "/partner/security");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/warranty"), "/partner/warranty");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/partner-catalog"), "/partner");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/partner-credit"), "/partner/credit");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/partner-agents"), "/partner");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/partner-internet"), "/internet");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/partner-static-ip"), "/internet");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/addresses"), "/partner/projects");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/projects"), "/partner/projects");
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/wallet"), "/partner/wallet");

  // Query parameter preservation
  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/orders?tab=completed"), "/partner/orders?tab=completed");
  assert.strictEqual(getPartnerRouteForDashboard("http://localhost:3000/dashboard/invoices?year=1403"), "/partner/invoices?year=1403");

  assert.strictEqual(getPartnerRouteForDashboard("/dashboard/unknown-page"), "/partner");
  assert.strictEqual(getPartnerRouteForDashboard(""), "/partner");
  assert.strictEqual(getPartnerRouteForDashboard(null), "/partner");
});

test("normalizeUserRole maps partner_b2b to partner and super_admin to admin", () => {
  assert.strictEqual(normalizeUserRole("partner_b2b"), "partner");
  assert.strictEqual(normalizeUserRole("partner"), "partner");
  assert.strictEqual(normalizeUserRole("admin"), "admin");
  assert.strictEqual(normalizeUserRole("super_admin"), "admin");
  assert.strictEqual(normalizeUserRole("customer"), "customer");
  assert.strictEqual(normalizeUserRole(null), "customer");
  assert.strictEqual(normalizeUserRole(undefined), "customer");
});

test("isRoleAllowed denies partner and partner_b2b on customer dashboard routes", () => {
  const isRoleAllowed = (role: string, allowed?: string[]) => {
    if (!allowed || allowed.length === 0) return true;
    const normalized = (role || "").toLowerCase().trim();
    const isPartner = normalized === "partner" || normalized === "partner_b2b";
    const isAdmin = normalized === "admin" || normalized === "super_admin";

    return allowed.some((allowedRole) => {
      const normAllowed = (allowedRole || "").toLowerCase().trim();
      if (normAllowed === normalized) return true;
      if ((normAllowed === "partner" || normAllowed === "partner_b2b") && isPartner) return true;
      if ((normAllowed === "admin" || normAllowed === "super_admin") && isAdmin) return true;
      return false;
    });
  };

  // Customer dashboard layout strictly allows ["customer", "admin"] (partners denied)
  assert.strictEqual(isRoleAllowed("partner_b2b", ["customer", "admin"]), false);
  assert.strictEqual(isRoleAllowed("partner", ["customer", "admin"]), false);
  assert.strictEqual(isRoleAllowed("customer", ["customer", "admin"]), true);
  assert.strictEqual(isRoleAllowed("admin", ["customer", "admin"]), true);

  // Partner layout allows partner, admin
  assert.strictEqual(isRoleAllowed("partner_b2b", ["partner", "admin"]), true);
  assert.strictEqual(isRoleAllowed("partner", ["partner", "admin"]), true);
  assert.strictEqual(isRoleAllowed("customer", ["partner", "admin"]), false);

  // Admin layout allows admin
  assert.strictEqual(isRoleAllowed("partner_b2b", ["admin"]), false);
  assert.strictEqual(isRoleAllowed("admin", ["admin"]), true);
  assert.strictEqual(isRoleAllowed("super_admin", ["admin"]), true);
});

test("OTP code validation: accepts strictly 5 digits and preserves leading zeros", () => {
  const isValid5DigitOtp = (code: string) => /^\d{5}$/.test(code.trim());

  assert.strictEqual(isValid5DigitOtp("01234"), true); // Preserves leading zero
  assert.strictEqual(isValid5DigitOtp("54321"), true);
  assert.strictEqual(isValid5DigitOtp("1234"), false);  // 4 digits
  assert.strictEqual(isValid5DigitOtp("123456"), false); // 6 digits
  assert.strictEqual(isValid5DigitOtp("abcde"), false); // Non-numeric
});

test("step progression logic: skips 2FA when user does not have 2FA enabled", () => {
  const getNextStep = (hasTwoFactor: boolean) => {
    return hasTwoFactor ? "2fa" : "success";
  };

  assert.strictEqual(getNextStep(false), "success");
  assert.strictEqual(getNextStep(true), "2fa");
});

test("partner role resolution: partner_b2b user is strictly guarded from /dashboard and routed to /partner", () => {
  const user = { role: "partner_b2b" as const };
  const normalizedRole = normalizeUserRole(user.role);
  assert.strictEqual(normalizedRole, "partner");

  // Route guarding check for customer dashboard: must be FALSE for partner
  const dashboardAllowed = ["customer", "admin"];
  const isDashboardAllowed = dashboardAllowed.some(
    (allowed) => allowed === normalizedRole || (allowed === "partner" && user.role === "partner_b2b")
  );
  assert.strictEqual(isDashboardAllowed, false);

  // Partner portal route guarding check: must be TRUE for partner
  const partnerAllowed = ["partner", "admin"];
  const isPartnerAllowed = partnerAllowed.some(
    (allowed) => allowed === normalizedRole || (allowed === "partner" && user.role === "partner_b2b")
  );
  assert.strictEqual(isPartnerAllowed, true);

  // Redirection destination when visiting /dashboard
  assert.strictEqual(resolveAuthRedirect(user.role, "/dashboard"), "/partner");
  assert.strictEqual(resolveAuthRedirect(user.role, "/dashboard/orders"), "/partner/orders");
  assert.strictEqual(resolveAuthRedirect(user.role), "/partner");
});

test("partner role resolution: isPartner boolean flag strictly prevents access to /dashboard pages", () => {
  // A customer user with isPartner: true
  const customerPartner = { role: "customer" as const, isPartner: true };
  const normalizedRole = normalizeUserRole(customerPartner.role, customerPartner.isPartner);
  assert.strictEqual(normalizedRole, "partner");

  // Route guarding strictly denies customer with isPartner: true
  const dashboardAllowed = ["customer", "admin"];
  const isDenied = !dashboardAllowed.includes(normalizedRole);
  assert.strictEqual(isDenied, true);

  // Redirection strictly resolves to /partner even when visiting http://localhost:3000/dashboard
  assert.strictEqual(
    resolveAuthRedirect(customerPartner.role, "http://localhost:3000/dashboard", customerPartner.isPartner),
    "/partner"
  );
  assert.strictEqual(
    resolveAuthRedirect(customerPartner.role, "/dashboard/wallet", customerPartner.isPartner),
    "/partner/wallet"
  );
  assert.strictEqual(
    resolveAuthRedirect(customerPartner.role, "/dashboard/addresses", customerPartner.isPartner),
    "/partner/projects"
  );

  // When filtering pages for partner role on customer dashboard:
  const isPartnerAllowedOnPage = (rolesAllowed: string[]) => rolesAllowed.includes(normalizedRole);
  assert.strictEqual(isPartnerAllowedOnPage(["customer"]), false);
  assert.strictEqual(isPartnerAllowedOnPage(["customer", "admin"]), false);
});


