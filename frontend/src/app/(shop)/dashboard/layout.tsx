"use client";

import * as React from "react";
import { useAuth, AuthGuard, authApi, getPartnerRouteForDashboard, normalizeUserRole } from "@/features/auth";
import {
  DashboardHeader,
  DashboardSidebar,
  getPagesForRole,
  type DashboardPageKey,
  useCustomerNavBadges,
} from "@/features/dashboard";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading, isPartner: isAuthPartner } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const sessionUser = typeof window !== "undefined" ? authApi.getSession()?.user : undefined;
  const rawRole = user?.role || sessionUser?.role || "";
  const isPartnerFlag = Boolean(isAuthPartner || user?.isPartner || (user as any)?.partnerCode || sessionUser?.isPartner);
  const isPartner = isPartnerFlag || normalizeUserRole(rawRole, isPartnerFlag) === "partner";

  React.useEffect(() => {
    if (isPartner) {
      router.replace(getPartnerRouteForDashboard(pathname));
    }
  }, [isPartner, pathname, router]);

  // All pages corresponding to current role (with fallback to cached session)
  const allowedPages = React.useMemo(() => {
    const role = user?.role || (typeof window !== "undefined" ? authApi.getSession()?.user?.role : undefined);
    return getPagesForRole(role || "customer", isPartner);
  }, [user?.role, isPartner]);

  // Dynamic badges with valid real stats
  const { pages: dynamicPages } = useCustomerNavBadges(allowedPages);

  // Determine activePageKey from current route
  const activePageKey = React.useMemo<DashboardPageKey>(() => {
    if (!pathname || pathname === "/dashboard" || pathname === "/dashboard/") {
      return "overview";
    }
    const segment = pathname.replace(/^\/dashboard\/?/, "").split("/")[0] as DashboardPageKey;
    return segment || "overview";
  }, [pathname]);

  if (isPartner) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" dir="rtl">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        <span className="text-xs text-neutral-400">در حال انتقال به پرتال اختصاصی همکاران...</span>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["customer", "admin"]}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8" dir="rtl">
        {/* Header Hero Banner */}
        <DashboardHeader
          user={user}
          onLogout={logout}
          isLoading={isLoading}
        />

        {/* Dashboard Main Content Area: Sidebar + Active View */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Categorized Navigation Sidebar */}
          <DashboardSidebar
            user={user}
            pages={dynamicPages}
            activePageKey={activePageKey}
            onLogout={logout}
          />

          {/* Active Content: Current route page */}
          <div className="flex-1 min-w-0 w-full">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
