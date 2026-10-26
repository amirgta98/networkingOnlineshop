"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "../../types/admin-users.types";
import { adminUsersApi } from "../../api/admin-users-api";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  AdminStatsCards,
  AdminActionModal,
} from "../shared";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  Users2,
  ShieldCheck,
  Lock,
  ShoppingBag,
  Eye,
  KeyRound,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function AdminUsersView() {
  const router = useRouter();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Tabs and Search
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const pageSize = 10;
  const [sortColumn, setSortColumn] = React.useState<string | undefined>("spent");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  // Change Role Modal
  const [roleChangingUser, setRoleChangingUser] = React.useState<AdminUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = React.useState<AdminUserRole>("partner_b2b");
  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState<boolean>(false);

  // Suspend / Activate Status Modal
  const [statusChangingUser, setStatusChangingUser] = React.useState<AdminUser | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState<boolean>(false);

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState<boolean>(false);
  const [createFullName, setCreateFullName] = React.useState<string>("");
  const [createPhone, setCreatePhone] = React.useState<string>("");
  const [createEmail, setCreateEmail] = React.useState<string>("");
  const [createNationalCode, setCreateNationalCode] = React.useState<string>("");
  const [createRole, setCreateRole] = React.useState<AdminUserRole>("customer");
  const [createStatus, setCreateStatus] = React.useState<AdminUserStatus>("active");
  const [createCompanyName, setCreateCompanyName] = React.useState<string>("");
  const [createNotes, setCreateNotes] = React.useState<string>("");
  const [createCanBuyInternet, setCreateCanBuyInternet] = React.useState<boolean>(false);

  // Edit User Modal
  const [editingUser, setEditingUser] = React.useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [editFullName, setEditFullName] = React.useState<string>("");
  const [editPhone, setEditPhone] = React.useState<string>("");
  const [editEmail, setEditEmail] = React.useState<string>("");
  const [editNationalCode, setEditNationalCode] = React.useState<string>("");
  const [editCompanyName, setEditCompanyName] = React.useState<string>("");
  const [editNotes, setEditNotes] = React.useState<string>("");
  const [editUserTier, setEditUserTier] = React.useState<"gold" | "silver" | "bronze">("bronze");
  const [editCanBuyInternet, setEditCanBuyInternet] = React.useState<boolean>(false);

  // Delete User Modal
  const [deletingUser, setDeletingUser] = React.useState<AdminUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>(false);

  // Processing & Toast
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
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

  // ─── 1. دریافت اطلاعات واقعی از API بکاند ───
  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await adminUsersApi.getUsers();
      setUsers(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "خطا در برقراری ارتباط با وب‌سرویس مدیریت کاربران";
      setFetchError(msg);
      showToast(`خطا در دریافت لیست کاربران: ${msg}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      subtitle: "حساب‌های فعال در پایگاه داده",
      changeText: "داده‌های زنده",
      changePositive: true,
      icon: Users2,
      variant: "sky" as const,
    },
    {
      id: "stat-b2b",
      title: "حساب‌های همکار سازمانی (B2B)",
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
      changeText: "تراکنش‌های واقعی",
      changePositive: true,
      icon: ShoppingBag,
      variant: "orange" as const,
    },
  ];

  // Filtering
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      if (activeTab === "partner_b2b" && user.role !== "partner_b2b") return false;
      if (activeTab === "customer" && user.role !== "customer") return false;
      if (activeTab === "admin" && user.role !== "admin") return false;
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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const sortedUsers = React.useMemo(() => {
    if (!sortColumn) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof AdminUser];
      let bVal: any = b[sortColumn as keyof AdminUser];
      if (sortColumn === "spent") {
        aVal = a.totalSpent;
        bVal = b.totalSpent;
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      const strA = String(aVal || "");
      const strB = String(bVal || "");
      return sortDirection === "asc"
        ? strA.localeCompare(strB, "fa")
        : strB.localeCompare(strA, "fa");
    });
  }, [filteredUsers, sortColumn, sortDirection]);

  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  // Navigation to Dedicated User Detail Page
  const handleOpenDetail = (user: AdminUser) => {
    router.push(`/admin/users/${user.id}`);
  };

  // Role Modal
  const handleOpenRoleModal = (user: AdminUser) => {
    setRoleChangingUser(user);
    setSelectedNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleConfirmChangeRole = async () => {
    if (!roleChangingUser) return;
    try {
      setIsProcessing(true);
      const updated = await adminUsersApi.updateUserRole(roleChangingUser.id, selectedNewRole);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setIsRoleModalOpen(false);
      showToast(`✅ نقش کاربری «${updated.fullName}» با موفقیت تغییر یافت.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در تغییر سطح دسترسی کاربر";
      showToast(`❌ ${msg}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Status Modal
  const handleOpenStatusModal = (user: AdminUser) => {
    setStatusChangingUser(user);
    setIsStatusModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!statusChangingUser) return;
    try {
      setIsProcessing(true);
      const targetStatus: AdminUserStatus =
        statusChangingUser.status === "active" ? "suspended" : "active";
      const updated = await adminUsersApi.updateUserStatus(statusChangingUser.id, targetStatus);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setIsStatusModalOpen(false);
      showToast(
        updated.status === "suspended"
          ? `⛔ حساب کاربری «${updated.fullName}» مسدود شد.`
          : `✅ حساب کاربری «${updated.fullName}» فعال گردید.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در تغییر وضعیت حساب کاربری";
      showToast(`❌ ${msg}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Create User
  const handleOpenCreateModal = () => {
    setCreateFullName("");
    setCreatePhone("");
    setCreateEmail("");
    setCreateNationalCode("");
    setCreateRole("customer");
    setCreateStatus("active");
    setCreateCompanyName("");
    setCreateNotes("");
    setCreateCanBuyInternet(false);
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreateUser = async () => {
    if (!createFullName.trim() || !createPhone.trim()) {
      showToast("لطفاً نام و شماره موبایل کاربر را وارد کنید.", "error");
      return;
    }
    try {
      setIsProcessing(true);
      const created = await adminUsersApi.createUser({
        fullName: createFullName.trim(),
        phone: createPhone.trim(),
        email: createEmail.trim() || undefined,
        nationalCode: createNationalCode.trim() || undefined,
        role: createRole,
        status: createStatus,
        companyName: createCompanyName.trim() || undefined,
        notes: createNotes.trim() || undefined,
        canBuyInternet: createCanBuyInternet,
      });
      setUsers((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      showToast(`✅ کاربر جدید «${created.fullName}» با موفقیت در سیستم ثبت گردید.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ثبت کاربر جدید";
      showToast(`❌ ${msg}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Edit User
  const handleOpenEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditPhone(user.phone);
    setEditEmail(user.email || "");
    setEditNationalCode(user.nationalCode || "");
    setEditCompanyName(user.companyName || "");
    setEditNotes(user.notes || "");
    setEditUserTier(user.userTier || "bronze");
    setEditCanBuyInternet(Boolean(user.canBuyInternet));
    setIsEditModalOpen(true);
  };

  const handleConfirmEditUser = async () => {
    if (!editingUser) return;
    try {
      setIsProcessing(true);
      const updated = await adminUsersApi.updateUser(editingUser.id, {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim() || undefined,
        nationalCode: editNationalCode.trim(),
        companyName: editCompanyName.trim() || undefined,
        notes: editNotes.trim() || undefined,
        userTier: editUserTier,
        canBuyInternet: editCanBuyInternet,
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setIsEditModalOpen(false);
      showToast(`✅ اطلاعات کاربر «${updated.fullName}» بروزرسانی شد.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ویرایش اطلاعات کاربر";
      showToast(`❌ ${msg}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete User
  const handleOpenDeleteModal = (user: AdminUser) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setIsProcessing(true);
      await adminUsersApi.deleteUser(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setIsDeleteModalOpen(false);
      showToast(`🗑️ حساب کاربری «${deletingUser.fullName}» حذف شد.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در حذف کاربر";
      showToast(`❌ ${msg}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Export CSV
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
    showToast("📁 لیست کاربران پلتفرم با موفقیت دریافت شد.");
  };

  // Columns definition
  const columns: AdminColumnDef<AdminUser>[] = [
    {
      key: "fullName",
      header: "کاربر و اطلاعات تماس",
      sortable: true,
      className: "min-w-[220px]",
      cell: (user) => {
        const hasSpecificName =
          Boolean(user.fullName) &&
          user.fullName.trim() !== "" &&
          user.fullName !== user.phone &&
          !/^[\s\?؟]+$/.test(user.fullName) &&
          !user.fullName.includes("***");
        const displayName = hasSpecificName ? user.fullName : (user.phone || "کاربر");
        const initial = hasSpecificName ? displayName.slice(0, 1) : "ک";

        return (
          <div className="flex items-center gap-3 text-right min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs border border-neutral-700">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs sm:text-sm truncate">
                  {displayName}
                </span>
                {user.companyName && (
                  <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.2 rounded-full border border-sky-500/20 font-semibold truncate hidden sm:inline">
                    {user.companyName}
                  </span>
                )}
              </div>
              {hasSpecificName && user.phone && (
                <span className="text-[11px] text-neutral-400 font-mono mt-0.5 whitespace-nowrap" dir="ltr">
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "سطح دسترسی",
      sortable: true,
      className: "whitespace-nowrap w-36",
      cell: (user) => {
        switch (user.role) {
          case "admin":
            return (
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold whitespace-nowrap inline-block">
                مدیر کل (Root)
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
      key: "canBuyInternet",
      header: "خرید اینترنت",
      sortable: true,
      className: "whitespace-nowrap w-28",
      cell: (user) =>
        user.canBuyInternet ? (
          <span className="text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1 whitespace-nowrap">
            <Wifi className="h-3 w-3" />
            <span>مجاز</span>
          </span>
        ) : (
          <span className="text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 whitespace-nowrap">
            <WifiOff className="h-3 w-3" />
            <span>غیرفعال</span>
          </span>
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
      sortable: true,
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
      className: "whitespace-nowrap w-40 text-left",
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
              handleOpenEditModal(user);
            }}
            className="h-7 px-2 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-[11px] gap-1 whitespace-nowrap"
            title="ویرایش مشخصات"
          >
            <Pencil className="h-3 w-3 text-sky-400" />
            <span className="hidden sm:inline">ویرایش</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetail(user);
            }}
            className="h-7 px-2 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-[11px] gap-1 whitespace-nowrap"
            title="مشاهده پروفایل"
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
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-semibold shadow-2xl backdrop-blur-md ${
              toast.type === "error"
                ? "bg-red-950 border-red-500/40 text-red-200"
                : toast.type === "info"
                ? "bg-sky-950 border-sky-500/40 text-sky-200"
                : "bg-emerald-950 border-emerald-500/40 text-emerald-200"
            }`}
          >
            {toast.type === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.text}</span>
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
                مدیریت کلیه حساب‌های کاربری حقیقی و حقوقی، سطوح دسترسی سازمانی، وضعیت احراز هویت شاهکار، سوابق ورود با ۲FA و کنترل امنیت متصل به دیتابیس ققنوس آکادمی.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <Button
              onClick={fetchUsers}
              variant="outline"
              disabled={isLoading}
              className="h-9 px-3 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isLoading ? "animate-spin" : ""}`} />
              <span>بروزرسانی داده‌ها</span>
            </Button>

            <Button
              onClick={handleOpenCreateModal}
              className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>کاربر جدید</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Fetch Error Banner with Retry */}
      {fetchError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-xs text-red-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>خطا در برقراری ارتباط با وب‌سرویس: {fetchError}</span>
          </div>
          <Button
            size="sm"
            onClick={fetchUsers}
            variant="outline"
            className="border-red-500/40 text-red-300 hover:bg-red-500/20 h-7 text-xs"
          >
            تلاش مجدد
          </Button>
        </div>
      )}

      {/* Metric Stat Cards */}
      <AdminStatsCards items={statCards} />

      {/* Filter Toolbar */}
      <AdminFilterToolbar
        searchPlaceholder="جستجو در نام، شماره موبایل، ایمیل، کد ملی یا نام شرکت..."
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeStatusTab={activeTab}
        onStatusTabChange={handleTabChange}
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
            count: users.filter((u) => u.role === "admin").length,
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
        data={paginatedUsers}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={handleOpenDetail}
        isLoading={isLoading}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalItems={sortedUsers.length}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="هیچ کاربری مطابق با فیلترهای تعیین‌شده یافت نشد."
        emptySubtitle="کلمه جستجوی دیگری را وارد کنید یا فیلتر تب‌ها را به «همه کاربران» بازگردانید."
      />


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

      {/* Create User Modal */}
      <AdminActionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleConfirmCreateUser}
        title="ثبت و ایجاد کاربر جدید در سامانه"
        confirmLabel="ثبت کاربر در سرور"
        variant="primary"
        isLoading={isProcessing}
      >
        <div className="flex flex-col gap-3.5 text-xs text-neutral-300 text-right leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">نام و نام خانوادگی *</label>
              <input
                type="text"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                placeholder="مثال: عرفان سعیدی"
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">شماره همراه *</label>
              <input
                type="text"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                placeholder="09121112233"
                dir="ltr"
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">پست الکترونیکی</label>
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="user@example.com"
                dir="ltr"
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">کد ملی</label>
              <input
                type="text"
                value={createNationalCode}
                onChange={(e) => setCreateNationalCode(e.target.value)}
                placeholder="۰۰۷۹۸۲۳۴۰۱"
                dir="ltr"
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">نقش و سطح دسترسی</label>
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value as AdminUserRole)}
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="customer">خریدار عادی فروشگاه</option>
                <option value="partner_b2b">همکار سازمانی (B2B)</option>
                <option value="admin">مدیر ارشد پلتفرم (Root)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">وضعیت حساب</label>
              <select
                value={createStatus}
                onChange={(e) => setCreateStatus(e.target.value as AdminUserStatus)}
                className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="active">فعال</option>
                <option value="pending_verification">در انتظار احراز هویت</option>
                <option value="suspended">مسدود شده</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">شرکت یا سازمان وابسته (اختیاری)</label>
            <input
              type="text"
              value={createCompanyName}
              onChange={(e) => setCreateCompanyName(e.target.value)}
              placeholder="مثال: شرکت داده‌گستر پارس"
              className="w-full h-9 px-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">یادداشت داخلی ادمین (اختیاری)</label>
            <textarea
              value={createNotes}
              onChange={(e) => setCreateNotes(e.target.value)}
              placeholder="توضیحات مربوط به دسترسی یا حساب کاربر..."
              rows={2}
              className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-950/20 flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <label htmlFor="create-can-buy-internet" className="text-xs font-bold text-white cursor-pointer flex items-center gap-2">
                <Wifi className="h-4 w-4 text-sky-400" />
                <span>امکان و قابلیت خرید اینترنت (/internet)</span>
              </label>
              <span className="text-[10px] text-neutral-300">
                در صورت فعال بودن، کاربر می‌تواند وارد پرتال خرید اینترنت شده و بسته‌ها را خریداری نماید.
              </span>
            </div>
            <input
              id="create-can-buy-internet"
              type="checkbox"
              checked={createCanBuyInternet}
              onChange={(e) => setCreateCanBuyInternet(e.target.checked)}
              className="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-sky-500 focus:ring-sky-500 cursor-pointer accent-sky-500 shrink-0"
            />
          </div>
        </div>
      </AdminActionModal>

      {/* Edit User Modal */}
      <AdminActionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleConfirmEditUser}
        title={editingUser ? `ویرایش مشخصات کاربر: ${editingUser.fullName}` : "ویرایش کاربر"}
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
                <option value="bronze">سطح برنزی (پایه)</option>
                <option value="silver">سطح نقره‌ای</option>
                <option value="gold">سطح طلایی (ویژه VIP)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">شرکت یا سازمان وابسته</label>
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
              <label htmlFor="edit-can-buy-internet" className="text-xs font-bold text-white cursor-pointer flex items-center gap-2">
                <Wifi className="h-4 w-4 text-sky-400" />
                <span>امکان و قابلیت خرید اینترنت (/internet)</span>
              </label>
              <span className="text-[10px] text-neutral-300">
                با زدن این تیک، کاربر اجازه خرید آنلاین اینترنت و آی‌پی استاتیک در سامانه را خواهد داشت. در غیر این صورت پیام راهنمای تماس با ادمین نمایش می‌یابد.
              </span>
            </div>
            <input
              id="edit-can-buy-internet"
              type="checkbox"
              checked={editCanBuyInternet}
              onChange={(e) => setEditCanBuyInternet(e.target.checked)}
              className="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-sky-500 focus:ring-sky-500 cursor-pointer accent-sky-500 shrink-0"
            />
          </div>
        </div>
      </AdminActionModal>

      {/* Delete User Modal */}
      <AdminActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteUser}
        title="حذف دائمی حساب کاربری"
        confirmLabel="حذف دائمی کاربر"
        variant="danger"
        isLoading={isProcessing}
      >
        {deletingUser && (
          <div className="flex flex-col gap-3 text-xs text-neutral-300 text-right leading-relaxed">
            <p>
              آیا از حذف کامل حساب کاربری <strong className="text-white">«{deletingUser.fullName}»</strong> با شماره{" "}
              <span className="font-mono text-emerald-400" dir="ltr">{deletingUser.phone}</span> اطمینان دارید؟
            </p>
            <p className="text-[11px] text-red-400 font-semibold">
              توجه: این عملیات غیرقابل بازگشت است و دسترسی‌های کاربر به طور دائم از سرور حذف خواهند شد.
            </p>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
