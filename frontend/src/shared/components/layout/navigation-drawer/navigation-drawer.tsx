"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Home,
  Package,
  ShoppingBag,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Palette,
  FileText,
  CreditCard,
  FileCheck2,
  Lock,
  PhoneCall,
  LogIn,
  LogOut,
  Sparkles,
  Server,
  Layers,
  ChevronLeft,
  ChevronDown,
  ExternalLink,
  Briefcase,
  FolderGit2,
  BookOpen,
  MapPin,
  Clock,
  Wrench,
  Globe,
  Heart,
  Wallet,
  FileSpreadsheet,
  Headphones,
  User,
  Award,
  ShieldAlert,
  Users2,
  Truck,
  FolderTree,
  ArrowRight,
  Wifi,
  Flame,
  BadgePercent,
  UserCog,
} from "lucide-react";
import { useNavigationDrawer } from "./navigation-drawer-context";
import { useAuth, RoleBadge } from "@/features/auth";
import { useCart } from "@/features/cart";
import { useContactSettings } from "@/features/contact-settings";
import { toPersianDigits, formatPrice } from "@/shared/lib/utils";
import {
  ADMIN_PAGES,
  ADMIN_CATEGORY_CONFIG,
  PARTNER_PAGES,
  PARTNER_CATEGORY_CONFIG,
  CUSTOMER_DRAWER_CATEGORIES,
} from "@/shared/config/navigation";

export function NavigationDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, closeDrawer, dynamicBadges } = useNavigationDrawer();
  const { user, isAuthenticated, logout, isLoading, getRedirectUrlForRole, isPartner: isAuthPartner } = useAuth();
  const { summary, toggleCart } = useCart();
  const { settings } = useContactSettings();
  const mainPhoneClean = (settings.mainPhone || "09134761097").replace(/[^0-9]/g, "");
  const mainPhoneDisplay = toPersianDigits(settings.mainPhone || "09134761097");
  const s1Clean = (settings.supportPhone1 || "09224761097").replace(/[^0-9]/g, "");
  const s1Display = toPersianDigits(settings.supportPhone1 || "09224761097");
  const s2Clean = (settings.supportPhone2 || "09354761097").replace(/[^0-9]/g, "");
  const s2Display = toPersianDigits(settings.supportPhone2 || "09354761097");
  const emClean = (settings.emergencyPhone || "09004761097").replace(/[^0-9]/g, "");
  const emDisplay = toPersianDigits(settings.emergencyPhone || "09004761097");

  const accountUrl = isAuthenticated ? getRedirectUrlForRole(user?.role) : "/login";

  // Close drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  // Close drawer automatically when route changes
  React.useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  const handleLinkClick = () => {
    closeDrawer();
  };

  const handleOpenCart = () => {
    closeDrawer();
    toggleCart();
  };

  const handleLogout = async () => {
    closeDrawer();
    await logout();
  };

  // Top-level Dashboard Accordion toggle (default open)
  const [isDashboardAccordionOpen, setIsDashboardAccordionOpen] = React.useState<boolean>(true);

  // Determine initial open category based on current pathname
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      // By default open all admin categories so admin sees full sidebar immediately
      overview: true,
      commerce: true,
      partners: true,
      inventory: true,
      system: true,
      admin: true,
    };
    if (pathname?.startsWith("/partner") || pathname?.includes("partner-")) {
      initial.partner = true;
    } else if (
      pathname?.includes("rfq") ||
      pathname?.includes("support")
    ) {
      initial.services = true;
    } else if (
      pathname?.includes("profile") ||
      pathname?.includes("security") ||
      pathname?.includes("club") ||
      pathname?.includes("upgrade-partner")
    ) {
      initial.account = true;
    }
    return initial;
  });

  const toggleCategory = (catKey: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const getBadgeStyle = (badgeColor?: string) => {
    switch (badgeColor) {
      case "emerald":
      case "success":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "sky":
      case "info":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "purple":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "amber":
      case "warning":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "orange":
        return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700/60";
    }
  };

  const isPartnerUserFlag = Boolean(isAuthPartner || user?.isPartner || (user as any)?.partnerCode);
  const rawRole = (user?.role || "customer").toLowerCase().trim();
  const role = isPartnerUserFlag || rawRole === "partner_b2b" || rawRole === "partner"
    ? "partner"
    : (rawRole === "admin" || rawRole === "super_admin" || rawRole === "staff_manager")
    ? "admin"
    : (rawRole === "site_manager" || rawRole === "sitemanager")
    ? "site_manager"
    : rawRole;

  // Unified Icon Map
  const ICON_MAP: Record<string, React.ElementType> = React.useMemo(
    () => ({
      LayoutDashboard,
      Package,
      FileText,
      FileSpreadsheet,
      Building2,
      Users2,
      Layers,
      FolderTree,
      ShieldCheck,
      Headphones,
      ShieldAlert,
      Palette,
      Truck,
      Flame,
      Wallet,
      BookOpen,
      Briefcase,
      Wrench,
      Globe2: Globe,
      Globe,
      Phone: PhoneCall,
      PhoneCall,
      UserCog: User,
      User,
      CreditCard,
      Wifi,
      Server,
      Lock,
      FileCheck2,
      Heart,
      MapPin,
      Award,
      Sparkles,
      BadgePercent,
      Home,
    }),
    []
  );

  // Admin Categories matching AdminSidebar exactly
  const adminDrawerCategories = React.useMemo(() => {
    return ADMIN_CATEGORY_CONFIG.map((cat) => ({
      ...cat,
      icon: ICON_MAP[cat.iconName] || LayoutDashboard,
      rolesAllowed: ["admin"],
      items: ADMIN_PAGES.filter((p) => p.category === cat.key).map((page) => {
        const dynamic = dynamicBadges[page.id];
        return {
          id: page.id,
          title: page.title,
          href: page.href,
          icon: ICON_MAP[page.iconName] || Layers,
          badge: dynamic?.badge ?? page.badge,
          badgeColor: (dynamic?.badgeColor ?? page.badgeVariant ?? "default") as string,
        };
      }),
    }));
  }, [ICON_MAP, dynamicBadges]);

  // Partner Categories matching PartnerSidebar & PARTNER_PAGES exactly
  const partnerDrawerCategories = React.useMemo(() => {
    return PARTNER_CATEGORY_CONFIG.map((cat) => ({
      ...cat,
      icon: ICON_MAP[cat.iconName] || LayoutDashboard,
      rolesAllowed: ["partner"],
      items: PARTNER_PAGES.filter((p) => p.category === cat.key).map((page) => {
        const dynamic = dynamicBadges[page.id];
        return {
          id: page.id,
          title: page.title,
          href: page.href,
          icon: ICON_MAP[page.iconName] || Building2,
          badge: dynamic?.badge ?? page.badge,
          badgeColor: (dynamic?.badgeColor ?? page.badgeVariant ?? "default") as string,
        };
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [ICON_MAP, dynamicBadges]);

  const defaultDrawerCategories = React.useMemo(() => {
    return CUSTOMER_DRAWER_CATEGORIES.map((cat) => ({
      ...cat,
      icon: ICON_MAP[cat.iconName] || Package,
      items: cat.items.map((item) => {
        const dynamic = dynamicBadges[item.id];
        let badge = dynamic?.badge ?? item.badge;
        let badgeColor = (dynamic?.badgeColor ?? item.badgeColor ?? "default") as string;

        if (item.id === "security" && !dynamic?.badge && user) {
          badge = user.twoFactorEnabled ? "۲FA فعال" : "۲FA غیرفعال";
          badgeColor = user.twoFactorEnabled ? "emerald" : "amber";
        }

        return {
          id: item.id,
          title: item.title,
          href: item.href,
          icon: ICON_MAP[item.iconName] || LayoutDashboard,
          badge,
          badgeColor,
        };
      }),
    }));
  }, [ICON_MAP, dynamicBadges, user]);

  const visibleDrawerCategories = React.useMemo(() => {
    if (role === "admin") {
      return adminDrawerCategories;
    }
    if (role === "site_manager") {
      const userPerms = new Set(user?.permissions || []);
      return adminDrawerCategories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) => {
            const pageDef = ADMIN_PAGES.find((p) => p.href === item.href);
            if (!pageDef) return false;
            return userPerms.has(`admin:${pageDef.id}`);
          }),
        }))
        .filter((cat) => cat.items.length > 0);
    }
    if (role === "partner") {
      return partnerDrawerCategories;
    }
    return defaultDrawerCategories.filter((c) =>
      c.rolesAllowed.includes(role as any)
    );
  }, [role, user?.permissions, adminDrawerCategories, partnerDrawerCategories, defaultDrawerCategories]);

  const totalAccessibleDrawerItems = visibleDrawerCategories.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel: Slides from RIGHT to LEFT */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 bottom-0 right-0 z-10 flex h-full w-full max-w-sm sm:max-w-md flex-col bg-[#0e0e11] text-neutral-100 shadow-2xl border-l border-neutral-800/90"
          >
            {/* Top Bar with Title and Close Button */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 px-4 sm:px-5 py-3.5 sm:py-4 bg-[#121216] shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-2 w-2 shrink-0 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                <h2 className="text-sm font-bold text-white tracking-tight truncate">
                  منوی ناوبری و صفحات کاربردی
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                aria-label="بستن منو"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-4 flex flex-col gap-4 sm:gap-5 text-right pb-6">
              {/* User Identity / Role Status Card */}
              {isAuthenticated && user ? (
                <Link
                  href={accountUrl}
                  onClick={handleLinkClick}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3.5 sm:p-4 shadow-sm relative overflow-hidden shrink-0 hover:border-neutral-700 transition-all block cursor-pointer"
                  title="رفتن به پیشخوان کاربری"
                >
                  {/* Subtle LED glow accent based on role */}
                  <div
                    className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none ${
                      role === "admin"
                        ? "bg-emerald-500/15"
                        : role === "partner"
                        ? "bg-sky-500/15"
                        : "bg-orange-500/15"
                    }`}
                  />

                  <div className="relative z-10 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black border transition-transform group-hover:scale-105 ${
                            role === "admin"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : role === "partner"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                          }`}
                        >
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover rounded-xl" />
                          ) : /^\d+$/.test(user.name?.trim() || "") ? (
                            <User className="h-4 w-4" />
                          ) : (
                            user.name.slice(0, 1)
                          )}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white leading-tight truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono truncate" dir="ltr">
                            {user.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <RoleBadge role={user.role} size="sm" />
                        <ChevronLeft className="h-4 w-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                      </div>
                    </div>

                    {(role === "site_manager" || user.role === "site_manager") && (
                      <div className="text-[11px] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-xl font-medium flex items-center justify-between">
                        <span>🛡️ پنل سایت‌گردان (مدیر دسترسی محدود)</span>
                        <span className="text-[10px] font-mono text-purple-300">SiteManager</span>
                      </div>
                    )}

                    {(role === "admin" || user.role === "admin" || (user.role as string) === "super_admin") && (
                      <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl font-medium flex items-center justify-between">
                        <span>🛡️ دسترسی سطح روت (Root Access)</span>
                        <span className="text-[10px] font-mono text-emerald-300">SuperAdmin</span>
                      </div>
                    )}

                    {user.companyName && (
                      <div className="text-[11px] text-sky-300 font-semibold truncate pt-1 border-t border-neutral-800/80">
                        🏢 {user.companyName}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-800 bg-gradient-to-b from-neutral-900/80 to-neutral-900/30 p-3.5 sm:p-4 text-right flex flex-col gap-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-orange-400 shrink-0" />
                    <span className="text-xs font-bold text-white">
                      ورود به حساب کاربری
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    برای دسترسی به داشبورد شخصی، قیمت‌های سازمانی B2B، یا پنل مدیریت وبسایت وارد شوید.
                  </p>
                  <Link
                    href="/login"
                    onClick={handleLinkClick}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[var(--theme-primary)]/20 transition-all cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>ورود / ثبت‌نام سریع</span>
                  </Link>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 1: منوی آکاردئونی صفحات پیشخوان و مدیریت
              ───────────────────────────────────────────────────────────── */}
              <div className="flex flex-col gap-2 shrink-0">
                {/* Master Accordion Button */}
                <button
                  type="button"
                  onClick={() => setIsDashboardAccordionOpen(!isDashboardAccordionOpen)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 transition-all cursor-pointer text-right group shadow-sm"
                  aria-expanded={isDashboardAccordionOpen}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm group-hover:scale-105 transition-transform ${
                        role === "admin"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : role === "partner"
                          ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                          : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {role === "admin" ? (
                        <ShieldAlert className="h-4.5 w-4.5" />
                      ) : (
                        <LayoutDashboard className="h-4.5 w-4.5" />
                      )}
                    </div>
                      <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white truncate">
                          {role === "admin"
                            ? "مرکز کنترل مدیریت سامانه (سایدبار ادمین)"
                            : role === "partner"
                            ? "پرتال و داشبورد همکار سازمانی"
                            : "پیشخوان و صفحات کاربری"}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          role === "admin"
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : role === "partner"
                            ? "text-sky-400 bg-sky-500/10 border border-sky-500/20"
                            : "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                        }`}>
                          {toPersianDigits(totalAccessibleDrawerItems)} صفحه
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 truncate">
                        {role === "admin"
                          ? "سایدبار ناوبری و منوی جامع پنل مدیریت"
                          : "منوی آکاردئونی دسته‌بندی‌شده کلیه صفحات"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 mr-2">
                    <span className="text-[10px] text-neutral-400 font-medium hidden sm:inline">
                      {isDashboardAccordionOpen ? "بستن" : "نمایش"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-neutral-400 group-hover:text-white transition-transform duration-200 ${
                        isDashboardAccordionOpen ? `rotate-180 ${role === "admin" ? "text-emerald-400" : "text-orange-400"}` : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Sub-Categories Accordion List */}
                <AnimatePresence initial={false}>
                  {isDashboardAccordionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden flex flex-col gap-2 pt-0.5"
                    >
                      {visibleDrawerCategories.map((cat) => {
                        const isCategoryOpen = !!openCategories[cat.key];
                        const CategoryIcon = cat.icon;

                        return (
                          <div
                            key={cat.key}
                            className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 overflow-hidden transition-colors hover:border-neutral-700/80"
                          >
                            {/* Category Header Accordion Trigger */}
                            <button
                              type="button"
                              onClick={() => toggleCategory(cat.key)}
                              className="flex items-center justify-between w-full p-2.5 sm:p-3 text-right hover:bg-neutral-800/40 transition-colors cursor-pointer"
                              aria-expanded={isCategoryOpen}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${cat.accentBg} ${cat.accentText} ${cat.accentBorder}`}
                                >
                                  <CategoryIcon className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-neutral-200 truncate">
                                    {cat.title}
                                  </span>
                                  <span className="text-[10px] text-neutral-400 truncate">
                                    {cat.subtitle}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 mr-2">
                                <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-full border border-neutral-700/50">
                                  {toPersianDigits(cat.items.length)}
                                </span>
                                <ChevronDown
                                  className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${
                                    isCategoryOpen ? `rotate-180 ${user?.role === "admin" ? "text-emerald-400" : "text-orange-400"}` : ""
                                  }`}
                                />
                              </div>
                            </button>

                            {/* Category Items List */}
                            <AnimatePresence initial={false}>
                              {isCategoryOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.18, ease: "easeInOut" }}
                                  className="overflow-hidden border-t border-neutral-800/70 bg-neutral-950/60 p-1.5 flex flex-col gap-1"
                                >
                                  {cat.items.map((item) => {
                                    const ItemIcon = item.icon;
                                    const isActive =
                                      pathname === item.href ||
                                      (item.id === "overview" &&
                                        (pathname === "/admin" || pathname === "/admin/")) ||
                                      (item.href !== "/" &&
                                        item.href !== "/dashboard" &&
                                        item.href !== "/admin" &&
                                        item.href !== "/partner" &&
                                        pathname?.startsWith(item.href));

                                    return (
                                      <Link
                                        key={item.id}
                                        href={item.href}
                                        onClick={handleLinkClick}
                                        className={`group/item flex items-center justify-between gap-2 p-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                          isActive
                                            ? role === "admin"
                                              ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25"
                                              : role === "partner"
                                              ? "bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30 shadow-sm"
                                              : "bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30 shadow-sm"
                                            : "text-neutral-300 hover:bg-neutral-800/80 hover:text-white"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          <ItemIcon
                                            className={`h-4 w-4 shrink-0 transition-transform group-hover/item:scale-110 ${
                                              isActive
                                                ? role === "admin"
                                                  ? "text-white"
                                                  : role === "partner"
                                                  ? "text-sky-400"
                                                  : "text-orange-400"
                                                : "text-neutral-400 group-hover/item:text-neutral-200"
                                            }`}
                                          />
                                          <span className="truncate">{item.title}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {item.badge && (
                                            <span
                                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                                                isActive && role === "admin"
                                                  ? "bg-white/20 text-white border-white/30"
                                                  : isActive && role === "partner"
                                                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                                                  : getBadgeStyle(item.badgeColor)
                                              }`}
                                            >
                                              {item.badge}
                                            </span>
                                          )}
                                          <ChevronLeft
                                            className={`h-3.5 w-3.5 transition-colors ${
                                              isActive
                                                ? role === "admin"
                                                  ? "text-white"
                                                  : role === "partner"
                                                  ? "text-sky-400"
                                                  : "text-orange-400"
                                                : "text-neutral-500 group-hover/item:text-neutral-300"
                                            }`}
                                          />
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}

                      {/* Admin Quick External Navigation Links & Logout (exact match to AdminSidebar) */}
                      {user?.role === "admin" && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
                          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-2.5 flex flex-col gap-1.5 text-xs">
                            <Link
                              href="/dashboard"
                              onClick={handleLinkClick}
                              className="flex items-center justify-between p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <ExternalLink className="h-3.5 w-3.5 text-orange-400" />
                                <span>مشاهده داشبورد کاربر عادی</span>
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                            </Link>

                            <Link
                              href="/partner"
                              onClick={handleLinkClick}
                              className="flex items-center justify-between p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 text-sky-400" />
                                <span>مشاهده پرتال سازمانی B2B</span>
                              </span>
                              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                            </Link>
                          </div>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-xs font-bold text-red-400 transition-all cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>خروج از پنل مدیریت</span>
                          </button>
                        </div>
                      )}

                      {/* Partner Logout Button (strictly no /dashboard link) */}
                      {role === "partner" && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-xs font-bold text-red-400 transition-all cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>خروج از پنل همکار سازمانی</span>
                          </button>
                        </div>
                      )}

                      {/* Site Manager Logout Button (strictly no /dashboard link) */}
                      {role === "site_manager" && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl border border-purple-500/20 bg-purple-950/10 hover:bg-purple-950/20 text-xs font-bold text-purple-400 transition-all cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>خروج از پنل سایت‌گردان</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 2: صفحات عمومی فروشگاه و تجهیزات شبکه
              ───────────────────────────────────────────────────────────── */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className="text-[11px] font-bold text-neutral-400 px-1">
                  فروشگاه و تجهیزات شبکه
                </span>

                <div className="flex flex-col gap-1 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-1.5 sm:p-2">
                  <Link
                    href="/"
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                      pathname === "/"
                        ? "bg-orange-500/10 text-orange-400 font-bold"
                        : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Home className="h-4 w-4 shrink-0 text-orange-400" />
                      <span className="truncate">صفحه اصلی فروشگاه</span>
                    </div>
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  </Link>

                  <Link
                    href="/products"
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                      pathname?.startsWith("/products")
                        ? "bg-orange-500/10 text-orange-400 font-bold"
                        : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Package className="h-4 w-4 shrink-0 text-sky-400" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-semibold text-neutral-200">کاتالوگ تجهیزات شبکه</span>
                        <span className="text-[10px] text-neutral-400 truncate">سوئیچ، رک، پسیو، کابل</span>
                      </div>
                    </div>
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  </Link>

                  <Link
                    href="/installation"
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                      pathname?.startsWith("/installation")
                        ? "bg-orange-500/10 text-orange-400 font-bold"
                        : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Wrench className="h-4 w-4 shrink-0 text-orange-400" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-semibold text-neutral-200">درخواست نصب و اجرا</span>
                        <span className="text-[10px] text-orange-400/90 truncate">تست فلوک با ۱۸ ماه گارانتی</span>
                      </div>
                    </div>
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  </Link>

                  <Link
                    href="/internet"
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                      pathname?.startsWith("/internet")
                        ? "bg-sky-500/10 text-sky-400 font-bold"
                        : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Globe className="h-4 w-4 shrink-0 text-sky-400" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-semibold text-neutral-200">خرید اینترنت و IP استاتیک</span>
                        <span className="text-[10px] text-sky-400/90 truncate">فیبر نوری FTTH، پهنای باند و آی‌پی ثابت</span>
                      </div>
                    </div>
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  </Link>

                  <Link
                    href="/about"
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                      pathname === "/about"
                        ? "bg-orange-500/10 text-orange-400 font-bold"
                        : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Building2 className="h-4 w-4 shrink-0 text-orange-400" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-semibold text-neutral-200">درباره ما و اطلاعات تماس</span>
                        <span className="text-[10px] text-neutral-400 truncate">تاریخچه، تیم مهندسی، آدرس و تلفن</span>
                      </div>
                    </div>
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  </Link>

                  {/* Cart Button */}
                  <button
                    type="button"
                    onClick={handleOpenCart}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer text-right w-full"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ShoppingBag className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="truncate">سبد خرید من</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {summary.itemCount > 0 ? (
                        <span className="text-[10px] font-bold bg-orange-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                          {toPersianDigits(summary.itemCount)} کالا
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500 whitespace-nowrap">خالی</span>
                      )}
                      <ChevronLeft className="h-3.5 w-3.5 text-neutral-500" />
                    </div>
                  </button>

                  <Link
                    href="/#articles"
                    onClick={handleLinkClick}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className="h-4 w-4 shrink-0 text-purple-400" />
                      <span className="truncate">مقالات تخصصی شبکه</span>
                    </div>
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  </Link>

                  <Link
                    href="/#portfolio"
                    onClick={handleLinkClick}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FolderGit2 className="h-4 w-4 shrink-0 text-amber-400" />
                      <span className="truncate">پروژه‌ها و نمونه‌کارها</span>
                    </div>
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  </Link>

                  <Link
                    href="/#careers"
                    onClick={handleLinkClick}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Briefcase className="h-4 w-4 shrink-0 text-blue-400" />
                      <span className="truncate">فرصت‌های شغلی و استخدام</span>
                    </div>
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  </Link>
                </div>
              </div>

            </div>

            {/* Bottom Footer Actions */}
            <div className="border-t border-neutral-800/80 p-3.5 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#121216] flex flex-col gap-2 shrink-0">
              <a
                href={`tel:${mainPhoneClean}`}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PhoneCall className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="truncate">تماس با شماره اصلی</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold text-xs shrink-0" dir="ltr">
                  {mainPhoneDisplay}
                </span>
              </a>
              <div className="px-1 text-[10px] text-neutral-500 text-center leading-relaxed">
                <span>سایر خطوط: </span>
                <a href={`tel:${s1Clean}`} className="font-mono text-neutral-400 hover:text-white" dir="ltr">{s1Display}</a>
                <span> | </span>
                <a href={`tel:${s2Clean}`} className="font-mono text-neutral-400 hover:text-white" dir="ltr">{s2Display}</a>
                <span> | </span>
                <a href={`tel:${emClean}`} className="font-mono text-neutral-400 hover:text-white" dir="ltr">{emDisplay}</a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
