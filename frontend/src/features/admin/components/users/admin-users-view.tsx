"use client";

import * as React from "react";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "../../types/admin-users.types";
import { MOCK_ADMIN_USERS } from "../../data/mock-admin-users";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  AdminStatsCards,
  AdminDetailDrawer,
  AdminActionModal,
} from "../shared";
import { UserDetailDrawerContent } from "./user-detail-drawer-content";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  Users2,
  ShieldCheck,
  Lock,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  KeyRound,
  ShieldAlert,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function AdminUsersView() {
  const [users, setUsers] = React.useState<AdminUser[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("velox_admin_users");
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return MOCK_ADMIN_USERS;
  });

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [roleChangingUser, setRoleChangingUser] = React.useState<AdminUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = React.useState<AdminUserRole>("partner_b2b");
  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState<boolean>(false);
  const [statusChangingUser, setStatusChangingUser] = React.useState<AdminUser | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState<boolean>(false);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync to local storage
  React.useEffect(() => {
    try {
      localStorage.setItem("velox_admin_users", JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Metrics
  const totalUsersCount = users.length;
  const b2bPartnersCount = users.filter((u) => u.role === "partner_b2b").length;
  const twoFactorVerifiedCount = users.filter((u) => u.twoFactorActive).length;
  const totalUsersSpent = users.reduce((acc, u) => acc + u.totalSpent, 0);

  const statCards = [
    {
      id: "stat-total-users",
      title: "کل کاربران حقیقی و حقوقی",
      value: `${toPersianDigits(totalUsersCount)} حساب`,
      subtitle: "حساب‌های فعال پلتفرم",
      changeText: "+۹٪ ماهانه",
      changePositive: true,
      icon: Users2,
      variant: "sky" as const,
    },
    {
      id: "stat-b2b",
      title: "حساب‌های فعال شرکتی (B2B)",
      value: `${toPersianDigits(b2bPartnersCount)} شرکت`,
      subtitle: "دارای خط اعتباری و خرید چکی",
      changeText: "سازمانی",
      changePositive: true,
      icon: Building2,
      variant: "purple" as const,
    },
    {
      id: "stat-2fa",
      title: "امنیت حساب‌ها (۲FA فعال)",
      value: `${toPersianDigits(twoFactorVerifiedCount)} حساب`,
      subtitle: "ورود دو مرحله‌ای رمز پویا",
      changeText: "امنیت تاییدشده",
      changePositive: true,
      icon: Lock,
      variant: "emerald" as const,
    },
    {
      id: "stat-spent",
      title: "مجموع خرید کل کاربران",
      value: formatPrice(totalUsersSpent),
      subtitle: "گردش حساب تجمعی فروشگاه",
      changeText: "تراکنش‌های موفق",
      changePositive: true,
      icon: ShoppingBag,
      variant: "orange" as const,
    },
  ];

  // Filtering
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      // Tab filter
      if (activeTab === "partner_b2b" && user.role !== "partner_b2b") return false;
      if (activeTab === "customer" && user.role !== "customer") return false;
      if (activeTab === "admin" && user.role !== "admin" && user.role !== "sales_manager") return false;
      if (activeTab === "suspended" && user.status !== "suspended") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = user.fullName.toLowerCase().includes(q);
        const matchPhone = user.phone.includes(q);
        const matchEmail = user.email?.toLowerCase().includes(q) || false;
        const matchNational = user.nationalCode.includes(q);
        const matchCompany = user.companyName?.toLowerCase().includes(q) || false;
        if (!matchName && !matchPhone && !matchEmail && !matchNational && !matchCompany) return false;
      }

      return true;
    });
  }, [users, activeTab, searchQuery]);

  const handleOpenDetail = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleOpenRoleModal = (user: AdminUser) => {
    setRoleChangingUser(user);
    setSelectedNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleConfirmChangeRole = async () => {
    if (!roleChangingUser) return;
    setIsProcessing(true);

    await new Promise((res) => setTimeout(res, 500));

    setUsers((prev) =>
      prev.map((u) =>
        u.id === roleChangingUser.id
          ? {
              ...u,
              role: selectedNewRole,
            }
          : u
      )
    );

    setIsProcessing(false);
    setIsRoleModalOpen(false);
    showToast(`✅ نقش کاربری «${roleChangingUser.fullName}» با موفقیت تغییر یافت.`);
  };

  const handleOpenStatusModal = (user: AdminUser) => {
    setStatusChangingUser(user);
    setIsStatusModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusChangingUser) return;
    setIsProcessing(true);

    await new Promise((res) => setTimeout(res, 500));

    const newStatus: AdminUserStatus =
      statusChangingUser.status === "active" ? "suspended" : "active";

    setUsers((prev) =>
      prev.map((u) =>
        u.id === statusChangingUser.id ? { ...u, status: newStatus } : u
      )
    );

    setIsProcessing(false);
    setIsStatusModalOpen(false);
    showToast(
      newStatus === "suspended"
        ? `⛔ حساب کاربری «${statusChangingUser.fullName}» مسدود شد.`
        : `✅ حساب کاربری «${statusChangingUser.fullName}» فعال گردید.`
    );
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["نام کاربر,تلفن,ایمیل,کد ملی,نقش,وضعیت,تعداد سفارش,مجموع خرید"]
        .concat(
          filteredUsers.map(
            (u) =>
              `"${u.fullName}",${u.phone},"${u.email || ""}",${u.nationalCode},${u.role},${u.status},${u.ordersCount},${u.totalSpent}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fonix-users-export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📁 لیست کاربران پلتفرم دانلود شد.");
  };

  // Columns
  const columns: AdminColumnDef<AdminUser>[] = [
    {
      key: "fullName",
      header: "کاربر و اطلاعات تماس",
      className: "min-w-[220px]",
      cell: (user) => (
        <div className="flex items-center gap-3 text-right min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs border border-neutral-700">
            {user.fullName.slice(0, 1)}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs sm:text-sm truncate">
                {user.fullName}
              </span>
              {user.companyName && (
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.2 rounded-full border border-sky-500/20 font-semibold truncate hidden sm:inline">
                  {user.companyName}
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400 font-mono mt-0.5 whitespace-nowrap" dir="ltr">
              {user.phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "سطح دسترسی",
      className: "whitespace-nowrap w-36",
      cell: (user) => {
        switch (user.role) {
          case "admin":
            return (
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold whitespace-nowrap inline-block">
                مدیر کل (Root)
              </span>
            );
          case "sales_manager":
            return (
              <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold whitespace-nowrap inline-block">
                مدیر فروش
              </span>
            );
          case "partner_b2b":
            return (
              <span className="text-[10px] bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold whitespace-nowrap inline-block">
                همکار B2B
              </span>
            );
          case "customer":
          default:
            return (
              <span className="text-[10px] bg-neutral-800 text-neutral-300 border border-neutral-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap inline-block">
                کاربر عادی
              </span>
            );
        }
      },
    },
    {
      key: "security",
      header: "احراز هویت و ۲FA",
      hideOnMobile: true,
      className: "whitespace-nowrap w-44",
      cell: (user) => (
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-semibold whitespace-nowrap ${
              user.nationalCodeVerified
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-neutral-800 text-neutral-500 border-neutral-700"
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>{user.nationalCodeVerified ? "شاهکار تایید" : "کد ملی"}</span>
          </span>

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-semibold whitespace-nowrap ${
              user.twoFactorActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-neutral-800 text-neutral-500 border-neutral-700"
            }`}
          >
            <Lock className="h-3 w-3" />
            <span>۲FA</span>
          </span>
        </div>
      ),
    },
    {
      key: "spent",
      header: "گردش خرید",
      sortable: true,
      className: "whitespace-nowrap w-36",
      cell: (user) => (
        <div className="flex flex-col text-right whitespace-nowrap">
          <span className="font-mono font-bold text-xs text-white whitespace-nowrap">
            {formatPrice(user.totalSpent)}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono whitespace-nowrap">
            {toPersianDigits(user.ordersCount)} سفارش
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      className: "whitespace-nowrap w-28",
      cell: (user) => {
        if (user.status === "active") {
          return (
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-xl font-semibold whitespace-nowrap inline-block">
              فعال
            </span>
          );
        }
        if (user.status === "pending_verification") {
          return (
            <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-xl font-semibold whitespace-nowrap inline-block">
              در انتظار
            </span>
          );
        }
        return (
          <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-xl font-semibold whitespace-nowrap inline-block">
            مسدود شده
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "عملیات",
      className: "whitespace-nowrap w-32 text-left",
      cell: (user) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenRoleModal(user);
            }}
            className="h-7 px-2 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-[11px] gap-1 whitespace-nowrap"
            title="تغییر دسترسی"
          >
            <KeyRound className="h-3 w-3 text-emerald-400" />
            <span className="hidden sm:inline">نقش</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetail(user);
            }}
            className="h-7 px-2 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-[11px] gap-1 whitespace-nowrap"
          >
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">پروفایل</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl font-black ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <Users2 className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  مدیریت کاربران و سطوح دسترسی
                </h1>
                <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  کنترل دسترسی نقش‌محور (RBAC)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                مدیریت کلیه حساب‌های کاربری حقیقی و حقوقی، سطوح دسترسی سازمانی، وضعیت احراز هویت شاهکار، سوابق ورود با ۲FA و کنترل امنیت پلتفرم ققنوس آکادمی.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <AdminStatsCards items={statCards} />

      {/* Filter Toolbar */}
      <AdminFilterToolbar
        searchPlaceholder="جستجو در نام، شماره موبایل، ایمیل، کد ملی یا نام شرکت..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeStatusTab={activeTab}
        onStatusTabChange={setActiveTab}
        statusTabs={[
          { id: "all", label: "همه کاربران", count: users.length },
          {
            id: "partner_b2b",
            label: "همکاران B2B",
            count: users.filter((u) => u.role === "partner_b2b").length,
          },
          {
            id: "customer",
            label: "خریداران عادی",
            count: users.filter((u) => u.role === "customer").length,
          },
          {
            id: "admin",
            label: "مدیران و ادمین‌ها",
            count: users.filter((u) => u.role === "admin" || u.role === "sales_manager").length,
          },
          {
            id: "suspended",
            label: "حساب‌های مسدود",
            count: users.filter((u) => u.status === "suspended").length,
          },
        ]}
        onExport={handleExport}
      />

      {/* Data Table */}
      <AdminDataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={handleOpenDetail}
        emptyMessage="هیچ کاربری مطابق با فیلترهای تعیین‌شده یافت نشد."
        emptySubtitle="کلمه جستجوی دیگری را وارد کنید یا فیلتر تب‌ها را به «همه کاربران» بازگردانید."
      />

      {/* Detail Slide-Over Drawer */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedUser ? `پروفایل کاربر: ${selectedUser.fullName}` : "جزییات کاربر"}
        subtitle={selectedUser?.phone}
        badge={
          selectedUser?.status === "active"
            ? "حساب فعال"
            : selectedUser?.status === "pending_verification"
            ? "در انتظار تایید"
            : "مسدود شده"
        }
      >
        {selectedUser && (
          <UserDetailDrawerContent
            user={selectedUser}
            onChangeRole={(u) => {
              setIsDrawerOpen(false);
              handleOpenRoleModal(u);
            }}
            onToggleStatus={(u) => {
              setIsDrawerOpen(false);
              handleOpenStatusModal(u);
            }}
          />
        )}
      </AdminDetailDrawer>

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
        {roleChangingUser && (
          <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              سطح دسترسی جدید برای کاربر <strong className="text-white">«{roleChangingUser.fullName}»</strong> را مشخص کنید:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { role: "customer" as const, label: "خریدار عادی فروشگاه", desc: "دسترسی عادی به کاتالوگ و خرید مصرف‌کننده" },
                { role: "partner_b2b" as const, label: "همکار حقوقی (B2B)", desc: "دسترسی به خط اعتباری و خرید چکی صیادی" },
                { role: "sales_manager" as const, label: "مدیر فروش سازمانی", desc: "مدیریت سفارش‌ها و قیمت‌دهی RFQ" },
                { role: "admin" as const, label: "مدیر ارشد پلتفرم (Root)", desc: "اختیارات کامل روی کلیه بخش‌ها و سرورها" },
              ].map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setSelectedNewRole(opt.role)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    selectedNewRole === opt.role
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
        )}
      </AdminActionModal>

      {/* Suspend / Activate Modal */}
      <AdminActionModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={
          statusChangingUser?.status === "active"
            ? "مسدودسازی موقت حساب کاربری"
            : "رفع مسدودی حساب کاربری"
        }
        confirmLabel={statusChangingUser?.status === "active" ? "مسدودسازی حساب" : "فعال‌سازی مجدد"}
        variant={statusChangingUser?.status === "active" ? "danger" : "success"}
        isLoading={isProcessing}
      >
        {statusChangingUser && (
          <div className="flex flex-col gap-3 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از{" "}
              {statusChangingUser.status === "active" ? "مسدودسازی موقت" : "فعال‌سازی مجدد"} حساب
              کاربر <strong className="text-white">«{statusChangingUser.fullName}»</strong> با شماره{" "}
              <span className="font-mono text-emerald-400" dir="ltr">{statusChangingUser.phone}</span> اطمینان دارید؟
            </p>
            {statusChangingUser.status === "active" ? (
              <p className="text-[11px] text-red-400">
                با مسدودسازی حساب، کاربر امکان ورود، ثبت سفارش یا صدور درخواست نخواهد داشت.
              </p>
            ) : (
              <p className="text-[11px] text-emerald-400">
                با فعال‌سازی مجدد، کلیه دسترسی‌های خرید و ورود کاربر فوراً بازگردانده می‌شود.
              </p>
            )}
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
