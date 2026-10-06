"use client";

import * as React from "react";
import { useAuth } from "@/features/auth";
import {
  DashboardOverview,
  getPagesForRole,
} from "@/features/dashboard";

export default function DashboardOverviewPage() {
  const { user, toggleTwoFactor } = useAuth();
  const [override2FA, setOverride2FA] = React.useState<boolean | null>(null);
  const [isUpdating2FA, setIsUpdating2FA] = React.useState<boolean>(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  // Derive 2FA status from auth user or local override
  const twoFactorActive = override2FA ?? (user?.twoFactorEnabled ?? false);

  const allowedPages = React.useMemo(() => {
    return getPagesForRole(user?.role);
  }, [user?.role]);

  // Handle 2FA toggle
  const handleToggle2FA = async () => {
    setIsUpdating2FA(true);
    const newState = !twoFactorActive;
    const ok = await toggleTwoFactor(newState, "123456");
    if (ok) {
      setOverride2FA(newState);
      setToastMsg(
        newState
          ? "✅ تایید دو مرحله‌ای فعال شد! در ورود بعدی، لایه رمز دوم برایتان نمایش داده خواهد شد."
          : "ℹ️ تایید دو مرحله‌ای غیرفعال شد! در ورود بعدی، مستقیماً با پیامک ۵ رقمی وارد می‌شوید."
      );
      setTimeout(() => setToastMsg(null), 5000);
    }
    setIsUpdating2FA(false);
  };

  return (
    <DashboardOverview
      user={user}
      pages={allowedPages}
      twoFactorActive={twoFactorActive}
      onToggle2FA={handleToggle2FA}
      isUpdating2FA={isUpdating2FA}
      toastMsg={toastMsg}
    />
  );
}
