"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, ArrowLeft, LogIn, Lock } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { type UserRole, getPartnerRouteForDashboard, normalizeUserRole } from "../types";
import { RoleBadge } from "./role-badge";
import { Button } from "@/shared/components/ui/button";

export interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackRedirect?: string;
}

function isRoleAllowed(role: string, allowed?: UserRole[], isPartnerFlag?: boolean) {
  if (!allowed || allowed.length === 0) return true;
  const normalized = normalizeUserRole(role, isPartnerFlag);
  const isPartner = normalized === "partner";
  const isAdmin = normalized === "admin";

  return allowed.some((allowedRole) => {
    const normAllowed = normalizeUserRole(allowedRole);
    return normAllowed === normalized;
  });
}

export function AuthGuard({
  children,
  allowedRoles,
  fallbackRedirect = "/login",
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, status, isAuthenticated, getRedirectUrlForRole, isPartner: isAuthPartner } = useAuth();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      const redirectUrl = `${fallbackRedirect}?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [status, pathname, fallbackRedirect, router]);

  const isUserPartner = isAuthPartner || normalizeUserRole(user?.role, Boolean((user as any)?.isPartner)) === "partner";

  // Auto-redirect partner users away from unauthorized routes (such as /dashboard)
  React.useEffect(() => {
    if (
      status === "authenticated" &&
      user &&
      allowedRoles &&
      allowedRoles.length > 0 &&
      !isRoleAllowed(user.role, allowedRoles, isUserPartner)
    ) {
      if (isUserPartner) {
        const targetUrl = pathname?.startsWith("/dashboard")
          ? getPartnerRouteForDashboard(pathname)
          : "/partner";
        router.replace(targetUrl);
      }
    }
  }, [status, user, allowedRoles, isUserPartner, pathname, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" dir="rtl">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--theme-primary)] border-t-transparent" />
        <span className="text-xs text-neutral-400">در حال بررسی لایه دسترسی و اعتبار نشست...</span>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-200">نیاز به احراز هویت</h2>
        <p className="text-xs text-neutral-400 max-w-sm mt-1 mb-5">
          برای مشاهده این بخش باید ابتدا وارد حساب کاربری خود شوید.
        </p>
        <Button
          onClick={() => {
            const redirectUrl = `${fallbackRedirect}?redirect=${encodeURIComponent(pathname)}`;
            router.push(redirectUrl);
          }}
          className="gap-2"
        >
          <LogIn className="h-4 w-4" />
          <span>ورود به حساب کاربری</span>
        </Button>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !isRoleAllowed(user.role, allowedRoles, isUserPartner)) {
    const rawHome = getRedirectUrlForRole(user.role);

    if (isUserPartner) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" dir="rtl">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          <span className="text-xs text-neutral-400">در حال انتقال به پرتال اختصاصی همکاران...</span>
        </div>
      );
    }

    const userHome = (rawHome && rawHome !== pathname)
      ? rawHome
      : (normalizeUserRole(user.role) === "admin" ? "/admin" : "/dashboard");

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-neutral-100">دسترسی به این بخش محدود است</h2>
        <p className="text-xs text-neutral-400 max-w-md mt-2 mb-4 leading-relaxed">
          نقش کاربری فعلی شما اجازه دسترسی به این بخش را ندارد.
        </p>

        <div className="flex items-center gap-2 mb-6 p-2 rounded-xl bg-neutral-900 border border-neutral-800">
          <span className="text-xs text-neutral-400">نقش فعلی شما:</span>
          <RoleBadge role={user.role} size="sm" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => router.push(userHome)}
            className="gap-2"
          >
            <span>انتقال به پنل اختصاصی شما</span>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/login")}
          >
            تغییر حساب کاربری
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
