"use client";

import { useAuth } from "@/features/auth";
import { AdminOverview, SiteManagerDashboard } from "@/features/admin";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  if (user?.role === "site_manager") {
    return <SiteManagerDashboard user={user} />;
  }

  return <AdminOverview />;
}
