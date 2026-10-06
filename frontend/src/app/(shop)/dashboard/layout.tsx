"use client";

import * as React from "react";
import { useAuth, AuthGuard } from "@/features/auth";
import {
  DashboardHeader,
  DashboardSidebar,
  getPagesForRole,
  type DashboardPageKey,
} from "@/features/dashboard";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loginWithDemoAccount, isLoading } = useAuth();
  const pathname = usePathname();

  // All pages corresponding to current role
  const allowedPages = React.useMemo(() => {
    return getPagesForRole(user?.role);
  }, [user?.role]);

  // Determine activePageKey from current route
  const activePageKey = React.useMemo<DashboardPageKey>(() => {
    if (!pathname || pathname === "/dashboard" || pathname === "/dashboard/") {
      return "overview";
    }
    const segment = pathname.replace(/^\/dashboard\/?/, "").split("/")[0] as DashboardPageKey;
    return segment || "overview";
  }, [pathname]);

  const handleSwitchUser = async (phone: string) => {
    await loginWithDemoAccount(phone, "/dashboard");
  };

  return (
    <AuthGuard allowedRoles={["customer", "partner", "admin"]}>
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
            pages={allowedPages}
            activePageKey={activePageKey}
            onLogout={logout}
            onSwitchUser={handleSwitchUser}
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
