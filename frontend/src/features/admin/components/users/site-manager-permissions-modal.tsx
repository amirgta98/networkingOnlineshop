"use client";

import * as React from "react";
import type { AdminUser } from "../../types/admin-users.types";
import { adminUsersApi } from "../../api/admin-users-api";
import { ADMIN_PAGES } from "../../data/admin-pages";
import type { AdminPageDefinition } from "../../types/admin.types";
import { AdminDetailDrawer } from "../shared/admin-detail-drawer";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  Package,
  Building2,
  Layers,
  BookOpen,
  Sliders,
  CheckCircle2,
  Info,
  ExternalLink,
} from "lucide-react";

export interface SiteManagerPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSaved: (updatedUser: AdminUser) => void;
  /** When true, will also transition user role to site_manager with these permissions */
  assignRoleOnSave?: boolean;
}

const CATEGORY_METADATA: Record<
  string,
  { label: string; icon: React.ElementType; description: string; badgeColor: string }
> = {
  overview: {
    label: "راهبری و پایش سیستم",
    icon: LayoutDashboard,
    description: "مرکز فرماندهی، خلاصه شاخص‌های فروش و سلامت سرویس‌ها",
    badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  },
  commerce: {
    label: "خرید، سفارش‌ها و مالی",
    icon: Package,
    description: "سفارش‌ها، فاکتورها، استعلام‌های سازمانی (RFQ)، کیف پول و ناوگان ارسال",
    badgeColor: "border-sky-500/30 text-sky-400 bg-sky-500/10",
  },
  partners: {
    label: "همکاران سازمانی و مشتریان",
    icon: Building2,
    description: "پنل همکاران B2B، سیستم همکاری در فروش (Affiliates) و مدیریت کاربران",
    badgeColor: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  },
  inventory: {
    label: "انبارداری و خدمات مهندسی",
    icon: Layers,
    description: "کاتالوگ کالاها، دسته‌بندی تجهیزات، پروژه‌های پسیو، گارانتی و تیکت‌ها",
    badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  },
  content: {
    label: "محتوا و آکادمی تخصصی",
    icon: BookOpen,
    description: "مقالات تخصصی، نمونه‌کارهای اجراشده و فرصت‌های شغلی / رزومه‌ها",
    badgeColor: "border-rose-500/30 text-rose-400 bg-rose-500/10",
  },
  system: {
    label: "تنظیمات و امنیت سامانه",
    icon: Sliders,
    description: "لاگ‌های امنیتی سرورها، نشست‌های فعال و شخصی‌سازی زنده تم",
    badgeColor: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
  },
};

const SENSITIVE_PERMISSION_KEYS = new Set([
  "admin:users",
  "admin:security",
  "admin:theme",
]);

export function SiteManagerPermissionsModal({
  isOpen,
  onClose,
  user,
  onSaved,
  assignRoleOnSave = false,
}: SiteManagerPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Sync selected permissions from user prop
  React.useEffect(() => {
    if (user && isOpen) {
      const initial = new Set(user.permissions || []);
      setSelectedPermissions(initial);
      setSearchQuery("");
      setErrorMessage(null);
    }
  }, [user, isOpen]);

  // All valid permission keys from ADMIN_PAGES
  const allPermissionKeys = React.useMemo(() => {
    return ADMIN_PAGES.map((p) => `admin:${p.id}`);
  }, []);

  const totalPagesCount = ADMIN_PAGES.length;
  const selectedCount = selectedPermissions.size;
  const isAllSelected = selectedCount === totalPagesCount;
  const isNoneSelected = selectedCount === 0;

  // Toggle individual permission
  const handleTogglePermission = (key: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Toggle category
  const handleToggleCategory = (categoryKey: string, categoryPages: AdminPageDefinition[]) => {
    const categoryPermKeys = categoryPages.map((p) => `admin:${p.id}`);
    const areAllCategorySelected = categoryPermKeys.every((k) => selectedPermissions.has(k));

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (areAllCategorySelected) {
        categoryPermKeys.forEach((k) => next.delete(k));
      } else {
        categoryPermKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  // Global toggle
  const handleSelectAll = () => {
    setSelectedPermissions(new Set(allPermissionKeys));
  };

  const handleDeselectAll = () => {
    setSelectedPermissions(new Set());
  };

  // Group pages by category
  const categoriesList = React.useMemo(() => {
    const map: Record<string, AdminPageDefinition[]> = {};
    for (const page of ADMIN_PAGES) {
      if (!map[page.category]) {
        map[page.category] = [];
      }
      map[page.category].push(page);
    }
    return map;
  }, []);

  // Filtered categories according to search query
  const filteredCategories = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoriesList;

    const result: Record<string, AdminPageDefinition[]> = {};
    for (const [catKey, pages] of Object.entries(categoriesList)) {
      const catMeta = CATEGORY_METADATA[catKey];
      const matchCat =
        catMeta?.label.toLowerCase().includes(query) ||
        catMeta?.description.toLowerCase().includes(query);

      const matchedPages = pages.filter((page) => {
        if (matchCat) return true;
        return (
          page.title.toLowerCase().includes(query) ||
          page.shortDescription.toLowerCase().includes(query) ||
          page.href.toLowerCase().includes(query) ||
          page.id.toLowerCase().includes(query)
        );
      });

      if (matchedPages.length > 0) {
        result[catKey] = matchedPages;
      }
    }
    return result;
  }, [categoriesList, searchQuery]);

  // Submit to backend
  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setErrorMessage(null);

    const permissionsArray = Array.from(selectedPermissions);

    try {
      let updatedUser: AdminUser;

      if (assignRoleOnSave || user.role !== "site_manager") {
        // Elevate/set role to site_manager with explicit permissions
        updatedUser = await adminUsersApi.updateUserRole(
          user.id,
          "site_manager",
          permissionsArray
        );
      } else {
        // Update permissions for existing site manager
        updatedUser = await adminUsersApi.updateUserPermissions(
          user.id,
          permissionsArray
        );
      }

      onSaved(updatedUser);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "خطا در برقراری ارتباط با وب‌سرویس و ذخیره دسترسی‌ها";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const percentage = Math.round((selectedCount / (totalPagesCount || 1)) * 100);

  return (
    <AdminDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <KeyRound className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black text-white">
              تعیین و مدیریت دسترسی‌های «سایت‌گردان»
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">
              کاربر: <strong className="text-white font-bold">{user?.fullName || "—"}</strong>{" "}
              ({user?.phone || ""})
            </span>
          </div>
        </div>
      }
      subtitle={
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-neutral-400 leading-relaxed">
            صفحات و قابلیت‌های مجاز این کاربر در پنل مدیریت را تعیین نمایید. عدم انتخاب به منزله عدم دسترسی و پاسخ ۴۰۳ در بکاند است.
          </span>
        </div>
      }
      badge={
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border border-purple-500/30 bg-purple-500/15 text-purple-300">
          <ShieldCheck className="h-3 w-3" />
          <span>نقش: سایت‌گردان (Site Manager)</span>
        </span>
      }
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full" dir="rtl">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span>
              وضعیت انتخابی:{" "}
              <strong className="text-purple-300 font-mono font-bold">
                {toPersianDigits(selectedCount)}
              </strong>{" "}
              از{" "}
              <span className="font-mono">{toPersianDigits(totalPagesCount)}</span> بخش مجاز
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-initial h-9 px-4 border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs"
            >
              انصراف
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-initial h-9 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25"
            >
              {isSaving ? "در حال ذخیره در دیتابیس..." : "ذخیره و اعمال بلادرنگ دسترسی‌ها"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5 text-right" dir="rtl">
        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-200 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold">خطا در ذخیره مجوزها:</span>
              <span className="text-[11px] text-red-300 leading-relaxed">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Status & Control Summary Card */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-neutral-900/60 to-neutral-950 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-white">
                  شاخص دسترسی‌های فعال این کاربر
                </span>
                <span className="text-[11px] font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  {toPersianDigits(percentage)}٪
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xl">
                کاربرانی که این نقش را دارند، فقط به آیتم‌های تیک‌خورده دسترسی خواهند داشت و بقیه منوها مخفی شده و APIهای آن‌ها با خطای ۴۰۳ مسدود خواهد شد.
              </p>
            </div>

            {/* Quick Actions (Select All / Clear All) */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                disabled={isAllSelected}
                className="h-8 px-2.5 text-[11px] border-neutral-700 bg-neutral-900/80 hover:bg-purple-950/40 hover:text-purple-300 text-neutral-300 gap-1.5"
              >
                <CheckSquare className="h-3.5 w-3.5 text-purple-400" />
                <span>انتخاب همه (۲۱)</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDeselectAll}
                disabled={isNoneSelected}
                className="h-8 px-2.5 text-[11px] border-neutral-700 bg-neutral-900/80 hover:bg-red-950/40 hover:text-red-300 text-neutral-300 gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
                <span>لغو همه</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3.5 h-2 w-full rounded-full bg-neutral-800/80 overflow-hidden border border-neutral-700/50">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Search Bar Filter */}
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در بین صفحات، دسته‌ها و مجوزها (مثال: سفارش، مقالات، امنیت)..."
            className="w-full h-10 pr-10 pl-4 rounded-xl bg-neutral-900/90 border border-neutral-700/70 text-white text-xs placeholder:text-neutral-500 focus:border-purple-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-white px-1.5 py-0.5 rounded bg-neutral-800"
            >
              پاک کردن
            </button>
          )}
        </div>

        {/* Categories and Pages List */}
        <div className="flex flex-col gap-6 pb-4">
          {Object.entries(filteredCategories).map(([catKey, pages]) => {
            const catMeta = CATEGORY_METADATA[catKey] || {
              label: catKey,
              icon: Layers,
              description: "",
              badgeColor: "border-neutral-700 text-neutral-300 bg-neutral-800",
            };
            const CatIcon = catMeta.icon;

            const categoryPermKeys = pages.map((p) => `admin:${p.id}`);
            const categorySelectedCount = categoryPermKeys.filter((k) =>
              selectedPermissions.has(k)
            ).length;
            const isCategoryAllSelected = categorySelectedCount === pages.length;

            return (
              <div
                key={catKey}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/30 overflow-hidden shadow-sm transition-all"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-neutral-900/80 border-b border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 text-white">
                      <CatIcon className="h-4.5 w-4.5 text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {catMeta.label}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold ${catMeta.badgeColor}`}
                        >
                          {toPersianDigits(categorySelectedCount)} از{" "}
                          {toPersianDigits(pages.length)} فعال
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                        {catMeta.description}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCategory(catKey, pages)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-700/80 bg-neutral-800/60 hover:bg-neutral-800 text-[11px] font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer shrink-0 self-start sm:self-center"
                  >
                    {isCategoryAllSelected ? (
                      <>
                        <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                        <span>لغو انتخاب این دسته</span>
                      </>
                    ) : (
                      <>
                        <Square className="h-3.5 w-3.5 text-neutral-400" />
                        <span>انتخاب همه ({toPersianDigits(pages.length)})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Category Pages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3 sm:p-4 bg-neutral-950/20">
                  {pages.map((page) => {
                    const permKey = `admin:${page.id}`;
                    const isChecked = selectedPermissions.has(permKey);
                    const isSensitive = SENSITIVE_PERMISSION_KEYS.has(permKey);

                    return (
                      <div
                        key={page.id}
                        onClick={() => handleTogglePermission(permKey)}
                        className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? "border-purple-500/60 bg-purple-950/25 shadow-sm shadow-purple-950/40"
                            : "border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/70"
                        }`}
                      >
                        {/* Custom Checkbox */}
                        <div className="pt-0.5 shrink-0">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-lg border transition-all ${
                              isChecked
                                ? "border-purple-500 bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                                : "border-neutral-700 bg-neutral-900/80 text-transparent group-hover:border-neutral-500"
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        </div>

                        {/* Page Info */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-xs font-bold truncate transition-colors ${
                                isChecked ? "text-white" : "text-neutral-300 group-hover:text-white"
                              }`}
                            >
                              {page.title}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isSensitive && (
                                <span
                                  title="این صفحه دارای تنظیمات یا لاگ‌های حیاتی است و نیازمند دقت در تخصیص است."
                                  className="text-[9px] px-1.5 py-0.2 rounded-md border border-amber-500/40 bg-amber-500/15 text-amber-300 flex items-center gap-1 font-semibold"
                                >
                                  <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                                  <span>حساس</span>
                                </span>
                              )}
                              <span className="text-[10px] text-neutral-500 font-mono" dir="ltr">
                                {page.href}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                            {page.shortDescription}
                          </p>

                          {/* Key pill */}
                          <div className="mt-2 flex items-center justify-between">
                            <span
                              className="text-[10px] font-mono text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20"
                              dir="ltr"
                            >
                              {permKey}
                            </span>
                            {page.badge && (
                              <span className="text-[10px] text-neutral-400 font-medium">
                                {page.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {Object.keys(filteredCategories).length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 text-center">
              <Search className="h-8 w-8 text-neutral-500 mb-2" />
              <span className="text-xs font-bold text-neutral-300">
                هیچ صفحه‌ای با عبارت «{searchQuery}» پیدا نشد.
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-purple-400 hover:underline"
              >
                نمایش همه صفحات
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminDetailDrawer>
  );
}