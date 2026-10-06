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
} from "lucide-react";
import { useNavigationDrawer } from "./navigation-drawer-context";
import { useAuth, RoleBadge } from "@/features/auth";
import { useCart } from "@/features/cart";
import { toPersianDigits, formatPrice } from "@/shared/lib/utils";

export function NavigationDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, closeDrawer } = useNavigationDrawer();
  const { user, isAuthenticated, logout, loginWithDemoAccount, isLoading, getRedirectUrlForRole } = useAuth();
  const { summary, toggleCart } = useCart();

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
    const initial: Record<string, boolean> = {};
    if (pathname?.startsWith("/admin")) {
      initial.admin = true;
    } else if (pathname?.startsWith("/partner") || pathname?.includes("partner-")) {
      initial.partner = true;
    } else if (
      pathname?.includes("rfq") ||
      pathname?.includes("warranty") ||
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
    } else {
      initial.admin = true;
      initial.commerce = true;
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
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "sky":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "purple":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "amber":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "orange":
        return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700/60";
    }
  };

  const role = user?.role || "customer";

  const drawerCategories = [
    // 1. ابزارهای راهبری کل سامانه (Admin Only)
    {
      key: "admin",
      title: "ابزارهای راهبری و مدیریت کل سامانه",
      subtitle: "پیشخوان Root، مانیتورینگ سرورها و تم زنده",
      icon: ShieldAlert,
      accentBg: "bg-emerald-500/15",
      accentText: "text-emerald-400",
      accentBorder: "border-emerald-500/30",
      rolesAllowed: ["admin"],
      items: [
        {
          id: "admin-root",
          title: "پیشخوان مدیریت کل سایت",
          href: "/admin",
          icon: ShieldCheck,
          badge: "مرکز فرماندهی",
          badgeColor: "emerald" as const,
        },
        {
          id: "admin-overview",
          title: "مانیتورینگ سامانه و لاگ‌های سرور",
          href: "/dashboard/admin-overview",
          icon: ShieldAlert,
          badge: "Root Access",
          badgeColor: "emerald" as const,
        },
        {
          id: "admin-theme",
          title: "شخصی‌سازی زنده ظاهر و رنگ تم",
          href: "/admin/theme",
          icon: Palette,
          badge: "طراحی زنده",
          badgeColor: "purple" as const,
        },
        {
          id: "admin-partner-watch",
          title: "نظارت بر پرتال همکاران B2B",
          href: "/partner",
          icon: Building2,
          badge: "سازمانی",
          badgeColor: "sky" as const,
        },
      ],
    },

    // 2. امکانات سازمانی و همکاران B2B (Partner & Admin)
    {
      key: "partner",
      title: "امکانات سازمانی و همکاران B2B",
      subtitle: "کاتالوگ عمده، خط اعتباری و کارشناسان",
      icon: Building2,
      accentBg: "bg-sky-500/15",
      accentText: "text-sky-400",
      accentBorder: "border-sky-500/30",
      rolesAllowed: ["partner", "admin"],
      items: [
        {
          id: "partner-portal",
          title: "پرتال اختصاصی همکاران B2B",
          href: "/partner",
          icon: Building2,
          badge: "Tier A",
          badgeColor: "sky" as const,
        },
        {
          id: "partner-catalog",
          title: "کاتالوگ و لیست قیمت عمده",
          href: "/dashboard/partner-catalog",
          icon: Layers,
          badge: "تخفیف تا ۱۸٪",
          badgeColor: "purple" as const,
        },
        {
          id: "partner-credit",
          title: "مدیریت خط اعتباری و چک‌های صیادی",
          href: "/dashboard/partner-credit",
          icon: CreditCard,
          badge: "۵۰۰ م.ت اعتبار",
          badgeColor: "emerald" as const,
        },
        {
          id: "partner-agents",
          title: "مدیریت کارشناسان خرید شرکت",
          href: "/dashboard/partner-agents",
          icon: Users2,
          badge: "۳ نماینده",
          badgeColor: "sky" as const,
        },
      ],
    },

    // 3. خرید، سفارشات و امور مالی (همه نقش‌ها)
    {
      key: "commerce",
      title: "خرید، سفارشات و اسناد مالی",
      subtitle: "پیگیری سفارش‌ها، فاکتور مودیان و کیف پول",
      icon: Package,
      accentBg: "bg-orange-500/15",
      accentText: "text-orange-400",
      accentBorder: "border-orange-500/30",
      rolesAllowed: ["customer", "partner", "admin"],
      items: [
        {
          id: "overview",
          title: "پیشخوان اصلی و خلاصه وضعیت",
          href: "/dashboard",
          icon: LayoutDashboard,
          badge: "داشبورد",
          badgeColor: "orange" as const,
        },
        {
          id: "orders",
          title: "سفارش‌ها و رهگیری مرسولات",
          href: "/dashboard/orders",
          icon: Package,
          badge: "۲ سفارش فعال",
          badgeColor: "sky" as const,
        },
        {
          id: "invoices",
          title: "فاکتورهای رسمی و اسناد مالی",
          href: "/dashboard/invoices",
          icon: FileText,
          badge: "ارزش افزوده",
          badgeColor: "default" as const,
        },
        {
          id: "wallet",
          title: "کیف پول و اعتبارات خرید",
          href: "/dashboard/wallet",
          icon: Wallet,
          badge: "شارژ آنی",
          badgeColor: "emerald" as const,
        },
        {
          id: "wishlist",
          title: "علاقه‌مندی‌ها و نشان‌شده‌ها",
          href: "/dashboard/wishlist",
          icon: Heart,
          badge: "۴ قلم کالا",
          badgeColor: "default" as const,
        },
        {
          id: "addresses",
          title: "دفترچه آدرس‌ها و انبارهای تحویل",
          href: "/dashboard/addresses",
          icon: MapPin,
          badge: "پروژه / دفتر",
          badgeColor: "default" as const,
        },
      ],
    },

    // 4. خدمات تخصصی زیرساخت و پروژه‌ها (همه نقش‌ها)
    {
      key: "services",
      title: "خدمات تخصصی زیرساخت و پروژه‌ها",
      subtitle: "استعلام RFQ، گارانتی طلایی RMA و تیکت",
      icon: FileSpreadsheet,
      accentBg: "bg-purple-500/15",
      accentText: "text-purple-400",
      accentBorder: "border-purple-500/30",
      rolesAllowed: ["customer", "partner", "admin"],
      items: [
        {
          id: "rfq",
          title: "استعلام قیمت پروژه‌ای (RFQ)",
          href: "/dashboard/rfq",
          icon: FileSpreadsheet,
          badge: "ویژه پروژه‌ها",
          badgeColor: "purple" as const,
        },
        {
          id: "warranty",
          title: "استعلام اصالت و گارانتی (RMA)",
          href: "/dashboard/warranty",
          icon: ShieldCheck,
          badge: "گارانتی طلایی",
          badgeColor: "emerald" as const,
        },
        {
          id: "support",
          title: "تیکت‌ها و پشتیبانی مهندسی",
          href: "/dashboard/support",
          icon: Headphones,
          badge: "مشاوره فنی",
          badgeColor: "amber" as const,
        },
      ],
    },

    // 5. حساب کاربری و امنیت (همه نقش‌ها)
    {
      key: "account",
      title: "امنیت و حساب کاربری",
      subtitle: "اطلاعات هویتی، ۲FA و باشگاه مشتریان",
      icon: Lock,
      accentBg: "bg-amber-500/15",
      accentText: "text-amber-400",
      accentBorder: "border-amber-500/30",
      rolesAllowed: ["customer", "partner", "admin"],
      items: [
        {
          id: "profile",
          title: "مشخصات حساب و احراز هویت",
          href: "/dashboard/profile",
          icon: User,
          badge: "احراز شده ✓",
          badgeColor: "emerald" as const,
        },
        {
          id: "security",
          title: "امنیت و تایید دو مرحله‌ای (۲FA)",
          href: "/dashboard/security",
          icon: Lock,
          badge: user?.twoFactorEnabled ? "۲FA فعال" : "۲FA غیرفعال",
          badgeColor: user?.twoFactorEnabled ? "emerald" as const : "amber" as const,
        },
        ...(role !== "partner"
          ? [
              {
                id: "club",
                title: "باشگاه مشتریان و امتیاز وفاداری",
                href: "/dashboard/club",
                icon: Award,
                badge: "۴۸۰ امتیاز",
                badgeColor: "sky" as const,
              },
            ]
          : []),
        ...(role === "customer"
          ? [
              {
                id: "upgrade-partner",
                title: "درخواست ارتقا به همکار سازمانی (B2B)",
                href: "/dashboard/upgrade-partner",
                icon: Sparkles,
                badge: "ارتقای سطح",
                badgeColor: "purple" as const,
              },
            ]
          : []),
      ],
    },
  ];

  const visibleDrawerCategories = drawerCategories.filter((c) =>
    c.rolesAllowed.includes(role as any)
  );

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
                      user.role === "admin"
                        ? "bg-emerald-500/15"
                        : user.role === "partner"
                        ? "bg-sky-500/15"
                        : "bg-orange-500/15"
                    }`}
                  />

                  <div className="relative z-10 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black border transition-transform group-hover:scale-105 ${
                            user.role === "admin"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : user.role === "partner"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                          }`}
                        >
                          {user.name.slice(0, 1)}
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
                        user?.role === "admin"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : user?.role === "partner"
                          ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                          : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {user?.role === "admin" ? (
                        <ShieldAlert className="h-4.5 w-4.5" />
                      ) : (
                        <LayoutDashboard className="h-4.5 w-4.5" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white truncate">
                          {user?.role === "admin"
                            ? "پیشخوان مدیریت و ابزارهای کل"
                            : user?.role === "partner"
                            ? "پرتال و داشبورد همکار سازمانی"
                            : "پیشخوان و صفحات کاربری"}
                        </span>
                        <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full shrink-0">
                          {toPersianDigits(totalAccessibleDrawerItems)} صفحه
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 truncate">
                        منوی آکاردئونی دسته‌بندی‌شده کلیه صفحات
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 mr-2">
                    <span className="text-[10px] text-neutral-400 font-medium hidden sm:inline">
                      {isDashboardAccordionOpen ? "بستن" : "نمایش"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-neutral-400 group-hover:text-white transition-transform duration-200 ${
                        isDashboardAccordionOpen ? "rotate-180 text-orange-400" : ""
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
                                    isCategoryOpen ? "rotate-180 text-orange-400" : ""
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
                                            ? "bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30 shadow-sm"
                                            : "text-neutral-300 hover:bg-neutral-800/80 hover:text-white"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          <ItemIcon
                                            className={`h-4 w-4 shrink-0 transition-transform group-hover/item:scale-110 ${
                                              isActive
                                                ? "text-orange-400"
                                                : "text-neutral-400 group-hover/item:text-neutral-200"
                                            }`}
                                          />
                                          <span className="truncate">{item.title}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          {item.badge && (
                                            <span
                                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${getBadgeStyle(
                                                item.badgeColor
                                              )}`}
                                            >
                                              {item.badge}
                                            </span>
                                          )}
                                          <ChevronLeft
                                            className={`h-3.5 w-3.5 transition-colors ${
                                              isActive
                                                ? "text-orange-400"
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

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 3: سوئیچ سریع نقش‌ها (تست و ارزیابی آنی منو)
              ───────────────────────────────────────────────────────────── */}
              <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">تست آنی لایه‌های منو:</span>
                  </span>
                  <span className="text-[9px] text-amber-400 font-mono shrink-0">DEMO</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => loginWithDemoAccount("09121111111")}
                    className={`py-2 px-1 rounded-xl border text-center text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap truncate ${
                      user?.role === "customer"
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                        : "bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    کاربر عادی
                  </button>

                  <button
                    type="button"
                    onClick={() => loginWithDemoAccount("09123333333")}
                    className={`py-2 px-1 rounded-xl border text-center text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap truncate ${
                      user?.role === "partner"
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                        : "bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    همکار B2B
                  </button>

                  <button
                    type="button"
                    onClick={() => loginWithDemoAccount("09129999999")}
                    className={`py-2 px-1 rounded-xl border text-center text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap truncate ${
                      user?.role === "admin"
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                        : "bg-neutral-800/60 border-neutral-700/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    ادمین سایت
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer Actions */}
            <div className="border-t border-neutral-800/80 p-3.5 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-[#121216] flex flex-col gap-2 shrink-0">
              <a
                href="tel:09134761097"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PhoneCall className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="truncate">تماس با شماره اصلی</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold text-xs shrink-0" dir="ltr">
                  ۰۹۱۳۴۷۶۱۰۹۷
                </span>
              </a>
              <div className="px-1 text-[10px] text-neutral-500 text-center leading-relaxed">
                <span>سایر خطوط: </span>
                <a href="tel:09224761097" className="font-mono text-neutral-400 hover:text-white" dir="ltr">۰۹۲۲۴۷۶۱۰۹۷</a>
                <span> | </span>
                <a href="tel:09354761097" className="font-mono text-neutral-400 hover:text-white" dir="ltr">۰۹۳۵۴۷۶۱۰۹۷</a>
                <span> | </span>
                <a href="tel:09004761097" className="font-mono text-neutral-400 hover:text-white" dir="ltr">۰۹۰۰۴۷۶۱۰۹۷</a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
