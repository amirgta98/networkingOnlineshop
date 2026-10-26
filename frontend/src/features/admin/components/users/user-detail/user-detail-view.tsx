"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "@/features/admin/types/admin-users.types";
import { adminUsersApi } from "@/features/admin/api/admin-users-api";
import { AdminActionModal } from "@/features/admin/components/shared";
import { UserDetailHeader } from "./user-detail-header";
import {
  UserDetailTabsNav,
  type UserDetailTabId,
  USER_DETAIL_TABS,
} from "./user-detail-tabs-nav";
import {
  AccountTab,
  AddressesTab,
  CartTab,
  OrdersTab,
  InvoicesTab,
  WalletTab,
  FavoritesTab,
  RfqTab,
  AuthenticityTab,
  LoyaltyTab,
  SessionsTab,
} from "./tabs";
import {
  AlertCircle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Lock,
  Wifi,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface UserDetailViewProps {
  userId: string;
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State (synced with ?tab=...)
  const tabParam = searchParams.get("tab") as UserDetailTabId | null;
  const isValidTab = USER_DETAIL_TABS.some((t) => t.id === tabParam);
  const activeTab: UserDetailTabId = isValidTab && tabParam ? tabParam : "account";

  // User State
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modals & Actions
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState<boolean>(false);
  const [selectedNewRole, setSelectedNewRole] = React.useState<AdminUserRole>("partner_b2b");

  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState<boolean>(false);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [editFullName, setEditFullName] = React.useState<string>("");
  const [editPhone, setEditPhone] = React.useState<string>("");
  const [editEmail, setEditEmail] = React.useState<string>("");
  const [editNationalCode, setEditNationalCode] = React.useState<string>("");
  const [editCompanyName, setEditCompanyName] = React.useState<string>("");
  const [editNotes, setEditNotes] = React.useState<string>("");
  const [editUserTier, setEditUserTier] = React.useState<"gold" | "silver" | "bronze">("bronze");
  const [editCanBuyInternet, setEditCanBuyInternet] = React.useState<boolean>(false);

  // Toast feedback
  const [toast, setToast] = React.useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Fetch User Data
  const fetchUser = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminUsersApi.getUserById(userId);
      setUser(data);
    } catch (err: any) {
      console.error("Failed to load user:", err);
      setError("کاربر مورد نظر یافت نشد یا در برقراری ارتباط با سرور خطایی رخ داده است.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Tab change handler (updates URL ?tab=...)
  const handleTabChange = (tabId: UserDetailTabId) => {
    router.push(`/admin/users/${userId}?tab=${tabId}`, { scroll: false });
  };

  // Open Edit Modal
  const handleOpenEditModal = () => {
    if (!user) return;
    setEditFullName(user.fullName || "");
    setEditPhone(user.phone || "");
    setEditEmail(user.email || "");
    setEditNationalCode(user.nationalCode || "");
    setEditCompanyName(user.companyName || "");
    setEditNotes(user.notes || "");
    setEditUserTier(user.userTier || "bronze");
    setEditCanBuyInternet(Boolean(user.canBuyInternet));
    setIsEditModalOpen(true);
  };

  // Confirm Edit User
  const handleConfirmEditUser = async () => {
    if (!user) return;
    try {
      setIsProcessing(true);
      const updated = await adminUsersApi.updateUser(user.id, {
        fullName: editFullName,
        phone: editPhone,
        email: editEmail || undefined,
        nationalCode: editNationalCode,
        companyName: editCompanyName || undefined,
        notes: editNotes || undefined,
        userTier: editUserTier,
        canBuyInternet: editCanBuyInternet,
      });
      setUser(updated);
      setIsEditModalOpen(false);
      showToast("مشخصات کاربر با موفقیت در پایگاه داده ویرایش شد.", "success");
    } catch (err: any) {
      console.error("Failed to update user:", err);
      showToast("خطا در به‌روزرسانی مشخصات کاربر.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Role Modal
  const handleOpenRoleModal = () => {
    if (!user) return;
    setSelectedNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  // Confirm Role Change
  const handleConfirmChangeRole = async () => {
    if (!user) return;
    try {
      setIsProcessing(true);
      const updated = await adminUsersApi.updateUserRole(user.id, selectedNewRole);
      setUser(updated);
      setIsRoleModalOpen(false);
      showToast(`سطح دسترسی کاربر به «${selectedNewRole}» تغییر یافت.`, "success");
    } catch (err: any) {
      console.error("Failed to update user role:", err);
      showToast("خطا در تغییر سطح دسترسی کاربر.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Status Modal
  const handleOpenStatusModal = () => {
    if (!user) return;
    setIsStatusModalOpen(true);
  };

  // Confirm Status Toggle
  const handleConfirmToggleStatus = async () => {
    if (!user) return;
    const nextStatus: AdminUserStatus = user.status === "active" ? "suspended" : "active";
    try {
      setIsProcessing(true);
      const updated = await adminUsersApi.updateUserStatus(user.id, nextStatus);
      setUser(updated);
      setIsStatusModalOpen(false);
      showToast(
        nextStatus === "active"
          ? "حساب کاربر با موفقیت فعال گردید."
          : "حساب کاربر مسدود گردید.",
        "success"
      );
    } catch (err: any) {
      console.error("Failed to toggle user status:", err);
      showToast("خطا در تغییر وضعیت حساب کاربر.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-7xl mx-auto" dir="rtl">
        {/* Header Skeleton */}
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-neutral-800 rounded-2xl" />
            <div className="flex flex-col gap-2">
              <div className="h-6 w-48 bg-neutral-800 rounded-lg" />
              <div className="h-4 w-32 bg-neutral-800/60 rounded-md" />
            </div>
          </div>
          <div className="h-10 w-32 bg-neutral-800 rounded-xl" />
        </div>

        {/* Tab Nav Skeleton */}
        <div className="h-12 w-full bg-neutral-900/60 rounded-2xl border border-neutral-800 animate-pulse" />

        {/* Content Skeleton */}
        <div className="h-96 w-full bg-neutral-900/40 rounded-2xl border border-neutral-800 animate-pulse" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 sm:p-12 max-w-2xl mx-auto text-center flex flex-col items-center justify-center gap-4" dir="rtl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-white">کاربر یافت نشد</h2>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-md">
          {error || "شناسه کاربری ارسال‌شده نامعتبر است یا این کاربر از سامانه حذف شده است."}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchUser}
            className="gap-2 border-neutral-700 text-neutral-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>تلاش مجدد</span>
          </Button>

          <Button
            size="sm"
            onClick={() => router.push("/admin/users")}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>بازگشت به فهرست کاربران</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
              : toast.type === "error"
              ? "bg-red-950/90 text-red-300 border-red-500/40"
              : "bg-neutral-900/90 text-neutral-200 border-neutral-700"
          }`}
          dir="rtl"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Profile Identity */}
      <UserDetailHeader
        user={user}
        onEditUser={handleOpenEditModal}
        onChangeRole={handleOpenRoleModal}
        onToggleStatus={handleOpenStatusModal}
      />

      {/* 11-Tabs Navigation Bar */}
      <UserDetailTabsNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        ordersCount={user.ordersCount}
      />

      {/* Tab Content Panels */}
      <div className="min-h-[400px]">
        {activeTab === "account" && (
          <AccountTab
            user={user}
            onEditUser={handleOpenEditModal}
            onChangeRole={handleOpenRoleModal}
            onToggleStatus={handleOpenStatusModal}
          />
        )}

        {activeTab === "addresses" && <AddressesTab userId={user.id} />}

        {activeTab === "cart" && <CartTab userId={user.id} />}

        {activeTab === "orders" && <OrdersTab userId={user.id} />}

        {activeTab === "invoices" && <InvoicesTab userId={user.id} />}

        {activeTab === "wallet" && <WalletTab userId={user.id} />}

        {activeTab === "favorites" && <FavoritesTab userId={user.id} />}

        {activeTab === "rfq" && <RfqTab userId={user.id} />}

        {activeTab === "authenticity" && <AuthenticityTab userId={user.id} />}

        {activeTab === "loyalty" && <LoyaltyTab userId={user.id} />}

        {activeTab === "sessions" && <SessionsTab userId={user.id} />}
      </div>

      {/* Change Role Modal */}
      <AdminActionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onConfirm={handleConfirmChangeRole}
        title="تغییر سطح دسترسی کاربر (Role Assignment)"
        confirmLabel="ذخیره نقش جدید"
        variant="primary"
        isLoading={isProcessing}
      >
        <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right leading-relaxed">
          <p>
            سطح دسترسی جدید برای کاربر <strong className="text-white">«{user.fullName}»</strong> را مشخص کنید:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {[
              {
                id: "customer",
                label: "خریدار عادی فروشگاه (Customer)",
                desc: "دسترسی عادی به پنل کاربری، خرید خرده‌فروشی و پیگیری سفارش‌ها",
              },
              {
                id: "partner_b2b",
                label: "همکار تجاری حقوقی (B2B Partner)",
                desc: "دسترسی به قیمت‌های همکاری، تخفیف حجم، تسویه اعتباری و استعلام RFQ",
              },
              {
                id: "admin",
                label: "مدیر ارشد سامانه (Super Admin)",
                desc: "دسترسی نامحدود به کلیه بخش‌های پنل مدیریت، پیکربندی، حسابداری و کاربران",
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedNewRole(opt.id as AdminUserRole)}
                className={`p-3 rounded-xl border text-right transition-all duration-150 ${
                  selectedNewRole === opt.id
                    ? "border-emerald-500 bg-emerald-500/15 text-white"
                    : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700"
                }`}
              >
                <span className="font-bold block mb-0.5">{opt.label}</span>
                <span className="text-[10px] text-neutral-400 block">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </AdminActionModal>

      {/* Suspend / Activate Status Modal */}
      <AdminActionModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={
          user.status === "active"
            ? "مسدودسازی موقت حساب کاربری"
            : "رفع مسدودی حساب کاربری"
        }
        confirmLabel={user.status === "active" ? "مسدودسازی حساب" : "فعال‌سازی مجدد"}
        variant={user.status === "active" ? "danger" : "success"}
        isLoading={isProcessing}
      >
        <div className="flex flex-col gap-3 text-xs text-neutral-300 text-right leading-relaxed">
          <p>
            آیا از{" "}
            {user.status === "active" ? "مسدودسازی موقت" : "فعال‌سازی مجدد"} حساب
            کاربر <strong className="text-white">«{user.fullName}»</strong> با شماره{" "}
            <span className="font-mono text-emerald-400" dir="ltr">{user.phone}</span> اطمینان دارید؟
          </p>
          {user.status === "active" ? (
            <p className="text-[11px] text-red-400">
              با مسدودسازی حساب، کاربر امکان ورود، ثبت سفارش یا صدور درخواست نخواهد داشت.
            </p>
          ) : (
            <p className="text-[11px] text-emerald-400">
              با فعال‌سازی مجدد، کلیه دسترسی‌های خرید و ورود کاربر فوراً بازگردانده می‌شود.
            </p>
          )}
        </div>
      </AdminActionModal>

      {/* Edit User Modal */}
      <AdminActionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleConfirmEditUser}
        title={`ویرایش مشخصات کاربر: ${user.fullName}`}
        confirmLabel="ذخیره تغییرات در دیتابیس"
        variant="primary"
        isLoading={isProcessing}
      >
        <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">نام کامل</label>
              <input
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">شماره همراه</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                dir="ltr"
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">پست الکترونیکی</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                dir="ltr"
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">کد ملی</label>
              <input
                type="text"
                value={editNationalCode}
                onChange={(e) => setEditNationalCode(e.target.value)}
                dir="ltr"
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">سطح عضویت باشگاه (Loyalty Tier)</label>
              <select
                value={editUserTier}
                onChange={(e) => setEditUserTier(e.target.value as "gold" | "silver" | "bronze")}
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="bronze">برنزی (عادی)</option>
                <option value="silver">نقره‌ای (فعال)</option>
                <option value="gold">طلایی (VIP)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">سازمان / شرکت (اختیاری)</label>
              <input
                type="text"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">یادداشت داخلی ادمین</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-950/20 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <label htmlFor="detail-edit-can-buy-internet" className="text-xs font-bold text-white cursor-pointer flex items-center gap-2">
                <Wifi className="h-4 w-4 text-sky-400" />
                <span>امکان و قابلیت خرید اینترنت (/internet)</span>
              </label>
              <span className="text-[10px] text-neutral-300">
                با فعال بودن این گزینه، صفحه /internet برای این کاربر فعال خواهد شد و می‌تواند بسته‌های اینترنت را سفارش دهد.
              </span>
            </div>
            <input
              id="detail-edit-can-buy-internet"
              type="checkbox"
              checked={editCanBuyInternet}
              onChange={(e) => setEditCanBuyInternet(e.target.checked)}
              className="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-sky-500 focus:ring-sky-500 cursor-pointer accent-sky-500 shrink-0"
            />
          </div>
        </div>
      </AdminActionModal>
    </div>
  );
}
