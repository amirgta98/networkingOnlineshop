/**
 * User Roles in the Velox Network Equipment Platform
 * - customer: Standard retail buyer (کاربر عادی)
 * - partner: B2B corporate client / organization (پنل سازمانی یا همکاری)
 * - admin: System superadmin / website owner (ادمین یا صاحب وبسایت)
 */
export type UserRole = "customer" | "partner" | "partner_b2b" | "admin";

export function normalizeUserRole(role?: string | null, isPartner?: boolean): "customer" | "partner" | "admin" {
  if (isPartner) return "partner";
  if (!role) return "customer";
  const r = role.toLowerCase().trim();
  if (r === "admin" || r === "super_admin" || r === "staff_manager") return "admin";
  if (r === "partner" || r === "partner_b2b") return "partner";
  return "customer";
}

/**
 * Extracts normalized pathname and query string from either a relative path or an absolute URL
 * (e.g. "http://localhost:3000/dashboard/orders?tab=active" -> { path: "/dashboard/orders", query: "tab=active" })
 */
export function extractPathAndQuery(urlOrPath?: string | null): { path: string; query: string } {
  if (!urlOrPath) return { path: "", query: "" };
  const raw = urlOrPath.trim();
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw);
      return { path: parsed.pathname, query: parsed.search.replace(/^\?/, "") };
    } catch {
      const withoutScheme = raw.replace(/^https?:\/\/[^/]+/, "");
      const [p, q] = withoutScheme.split("?");
      return { path: p || "", query: q || "" };
    }
  }
  const [p, q] = raw.split("?");
  return { path: p || "", query: q || "" };
}

/**
 * Maps a customer dashboard route (/dashboard/...) to its partner equivalent (/partner/...).
 * Correctly preserves query parameters and translates subroutes (orders, invoices, rfq, support, wallet, addresses, etc.).
 * Also safely handles absolute URLs (such as "http://localhost:3000/dashboard").
 */
export function getPartnerRouteForDashboard(pathname?: string | null): string {
  const { path, query } = extractPathAndQuery(pathname);
  const querySuffix = query ? `?${query}` : "";

  if (!path || path === "/dashboard" || path === "/dashboard/") {
    return `/partner${querySuffix}`;
  }

  const cleanPath = path.replace(/^\/dashboard\/?/, "");
  const segment = cleanPath.split("/")[0].toLowerCase().trim();

  switch (segment) {
    case "orders":
      return `/partner/orders${querySuffix}`;
    case "invoices":
      return `/partner/invoices${querySuffix}`;
    case "rfq":
      return `/partner/rfq${querySuffix}`;
    case "support":
      return `/partner/support${querySuffix}`;
    case "profile":
      return `/partner/profile${querySuffix}`;
    case "security":
      return `/partner/security${querySuffix}`;
    case "warranty":
      return `/partner/warranty${querySuffix}`;
    case "partner-catalog":
    case "catalog":
      return `/partner${querySuffix}`;
    case "partner-credit":
    case "credit":
      return `/partner/credit${querySuffix}`;
    case "wallet":
      return `/partner/wallet${querySuffix}`;
    case "partner-agents":
    case "agents":
      return `/partner${querySuffix}`;
    case "partner-internet":
    case "internet":
      return `/internet${querySuffix}`;
    case "partner-static-ip":
    case "static-ip":
      return `/internet${querySuffix}`;
    case "addresses":
    case "projects":
      return `/partner/projects${querySuffix}`;
    default:
      return `/partner${querySuffix}`;
  }
}

/**
 * Resolves safe role-based redirect URL after authentication or navigation guard.
 * Ensures partner users (by role or isPartner flag) are strictly routed to /partner (or partner counterpart) and never /dashboard.
 * Safely strips absolute origin (e.g. http://localhost:3000/dashboard) to prevent redirect bypass.
 */
export function resolveAuthRedirect(
  role?: UserRole | string | null,
  targetRedirect?: string | null,
  isPartner?: boolean
): string {
  const normRole = normalizeUserRole(role, isPartner);

  if (normRole === "partner") {
    const { path, query } = extractPathAndQuery(targetRedirect);
    const querySuffix = query ? `?${query}` : "";

    if (!path || path === "/" || path === "/dashboard" || path === "/dashboard/" || path === "/partner" || path === "/partner/") {
      return `/partner${querySuffix}`;
    }
    if (path.startsWith("/dashboard")) {
      return getPartnerRouteForDashboard(targetRedirect);
    }
    if (path === "/partner/internet" || path === "/partner/static-ip") {
      return `/internet${querySuffix}`;
    }
    if (path === "/partner/catalog" || path === "/partner/agents") {
      return `/partner${querySuffix}`;
    }
    return targetRedirect!;
  }

  if (normRole === "admin") {
    if (!targetRedirect) return "/admin";
    return targetRedirect;
  }

  // Customer / default
  if (!targetRedirect) return "/dashboard";
  return targetRedirect;
}

export type TwoFactorMethod = "pin" | "totp" | "sms_fallback";

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod;
  email?: string;
  avatarUrl?: string;
  canBuyInternet?: boolean;
  // B2B Partner specific fields
  isPartner?: boolean;
  partnerCode?: string;
  companyName?: string;
  economicCode?: string;
  nationalId?: string;
  creditLimit?: number; // In Toman
  creditBalance?: number; // Available credit in Toman
  // Admin specific fields
  adminLevel?: "owner" | "superadmin" | "technical";
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in ms
  user: AuthUser;
}

export type AuthStep = "phone" | "otp" | "2fa" | "success";

export interface AuthChallenge {
  ticket: string;
  phone: string;
  maskedPhone: string;
  expiresAt: number;
  hasTwoFactor: boolean;
  twoFactorType?: TwoFactorMethod;
  devCode?: string; // Provided in dev/mock mode for fast testing
}
