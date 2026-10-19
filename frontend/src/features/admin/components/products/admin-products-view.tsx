"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { productsApi } from "../../api/products-api";
import {
  Layers,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Tag,
  Package,
  ShieldCheck,
  Check,
  Building2,
  X,
  FileSpreadsheet,
  Flame,
} from "lucide-react";
import type {
  AdminProduct,
  AdminProductCategory,
  AdminProductStatus,
} from "../../types/admin-products.types";
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_STATUS_CONFIG,
  POPULAR_BRANDS,
} from "../../types/admin-products.types";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  type FilterTabOption,
  AdminStatsCards,
  type AdminStatItem,
  AdminDetailDrawer,
  AdminActionModal,
} from "../shared";
import { ProductDetailDrawerContent } from "./product-detail-drawer-content";
import { ProductFormModal } from "./product-form-modal";
import { ProductQuickStockModal } from "./product-quick-stock-modal";
import { categoriesApi } from "../../api/categories-api";
import type { AdminCategory } from "../../types/admin-categories.types";
import { cn, formatPrice, toPersianDigits, resolveProductImageUrl } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

const LOCAL_STORAGE_KEY = "velox_admin_products_v1";

export function AdminProductsView() {
  let router: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    // safe fallback in environments without RouterContext (e.g. unit tests)
  }

  // ─── ۱. وضعیت محصولات و همگام‌سازی LocalStorage بدون خطای Hydration ────────────
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = React.useState<boolean>(false);

  // اعلان و توست
  const [toastMessage, setToastMessage] = React.useState<{
    text: string;
    variant?: "success" | "info" | "warning";
  } | null>(null);

  const showToast = (text: string, variant: "success" | "info" | "warning" = "success") => {
    setToastMessage({ text, variant });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // بارگذاری داده‌ها منحصراً از سرور پس از مانت در کلاینت
  React.useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch {}
      }

      try {
        const res = await productsApi.getProducts();
        if (isMounted && res && Array.isArray(res.products)) {
          setProducts(res.products);
          return;
        }
      } catch (err) {
        console.warn("[AdminProductsView] Failed to fetch products:", err);
      }
    }

    loadData().finally(() => {
      if (isMounted) setIsStorageLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateProducts = React.useCallback((newProducts: AdminProduct[]) => {
    setProducts(newProducts);
  }, []);

  // ─── ۲. وضعیت فیلترها و مرتب‌سازی ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeStatusTab, setActiveStatusTab] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [availableCategories, setAvailableCategories] = React.useState<AdminCategory[]>([]);

  // Load categories and sync URL query parameter
  React.useEffect(() => {
    categoriesApi
      .getCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setAvailableCategories(cats);
        }
      })
      .catch(() => {});

    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get("category");
        if (cat) {
          setCategoryFilter(cat);
        }
      } catch {
        // ignore
      }
    }
  }, []);
  const [brandFilter, setBrandFilter] = React.useState<string>("all");
  const [sortColumn, setSortColumn] = React.useState<string>("stock");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 8;

  // انتخاب دسته‌ای
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // ─── ۳. وضعیت مودال‌ها و کشو ────────────────────────────────────────────────
  const [detailProduct, setDetailProduct] = React.useState<AdminProduct | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const [formProduct, setFormProduct] = React.useState<AdminProduct | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);

  const [quickStockProduct, setQuickStockProduct] = React.useState<AdminProduct | null>(null);
  const [isQuickStockModalOpen, setIsQuickStockModalOpen] = React.useState(false);

  const [deleteProduct, setDeleteProduct] = React.useState<AdminProduct | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // ─── ۴. محاسبات شاخص‌های آماری انبار (KPI Stats) ──────────────────────────
  const totalStockUnits = React.useMemo(
    () => products.reduce((acc, p) => acc + p.stock, 0),
    [products]
  );

  const totalInventoryValue = React.useMemo(
    () => products.reduce((acc, p) => acc + p.stock * p.price, 0),
    [products]
  );

  const activeProductsCount = React.useMemo(
    () => products.filter((p) => p.status === "active").length,
    [products]
  );

  const lowStockProductsCount = React.useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length,
    [products]
  );

  const outOfStockCount = React.useMemo(
    () => products.filter((p) => p.stock === 0).length,
    [products]
  );

  const criticalStockAlertsCount = lowStockProductsCount + outOfStockCount;

  const featuredAndDiscountedCount = React.useMemo(
    () => products.filter((p) => p.featured || (p.discountPercent && p.discountPercent > 0)).length,
    [products]
  );

  const statCards: AdminStatItem[] = [
    {
      id: "stat-total-value",
      title: "ارزش کل موجودی انبار",
      value: formatPrice(totalInventoryValue),
      subtitle: `${toPersianDigits(totalStockUnits)} واحد فیزیکی در انبار مرکزی`,
      changeText: "+۱۴٪ رشد موجودی",
      changePositive: true,
      icon: Layers,
      variant: "sky",
      onClick: () => setActiveStatusTab("all"),
    },
    {
      id: "stat-active-skus",
      title: "تجهیزات فعال در کاتالوگ",
      value: `${toPersianDigits(activeProductsCount)} کالا`,
      subtitle: "آماده ثبت سفارش آنلاین",
      changeText: "فروش مستقیم",
      changePositive: true,
      icon: CheckCircle2,
      variant: "emerald",
      onClick: () => setActiveStatusTab("all"),
    },
    {
      id: "stat-alerts",
      title: "هشدار کسری و اتمام موجودی",
      value: `${toPersianDigits(criticalStockAlertsCount)} مورد`,
      subtitle: `${toPersianDigits(outOfStockCount)} ناموجود • ${toPersianDigits(lowStockProductsCount)} در آستانه اتمام`,
      changeText: "نیاز به تامین",
      changePositive: false,
      icon: AlertTriangle,
      variant: "orange",
      onClick: () => setActiveStatusTab("low_stock"),
    },
    {
      id: "stat-featured",
      title: "کالاهای منتخب و تخفیف‌دار",
      value: `${toPersianDigits(featuredAndDiscountedCount)} کالا`,
      subtitle: "پیشنهادهای ویژه همکاری B2B",
      changeText: "جذابیت فروش",
      changePositive: true,
      icon: TrendingUp,
      variant: "purple",
      onClick: () => setActiveStatusTab("featured"),
    },
  ];

  // ─── ۵. فیلتر کردن و مرتب‌سازی داده‌ها ───────────────────────────────────────
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // فیلتر تب وضعیت
      if (activeStatusTab === "in_stock" && product.stock <= product.minStockAlert) return false;
      if (
        activeStatusTab === "low_stock" &&
        !(product.stock > 0 && product.stock <= product.minStockAlert)
      ) {
        return false;
      }
      if (activeStatusTab === "out_of_stock" && product.stock > 0) return false;
      if (activeStatusTab === "featured" && !product.featured) return false;
      if (
        activeStatusTab === "discounted" &&
        !product.isSpecialOffer &&
        (!product.discountPercent || product.discountPercent <= 0)
      ) {
        return false;
      }

      // فیلتر دسته‌بندی
      if (categoryFilter !== "all" && product.category !== categoryFilter) return false;

      // فیلتر برند
      if (brandFilter !== "all" && product.brand !== brandFilter) return false;

      // جستجوی متنی
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(q);
        const matchSku = product.sku.toLowerCase().includes(q);
        const matchBrand = product.brand.toLowerCase().includes(q);
        const matchCat =
          PRODUCT_CATEGORY_LABELS[product.category]?.toLowerCase().includes(q) || false;
        const matchLocation = product.warehouseLocation.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchBrand && !matchCat && !matchLocation) return false;
      }

      return true;
    });
  }, [products, activeStatusTab, categoryFilter, brandFilter, searchQuery]);

  // مرتب‌سازی
  const sortedProducts = React.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof AdminProduct];
      let bVal: any = b[sortColumn as keyof AdminProduct];

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal, "fa")
          : bVal.localeCompare(aVal, "fa");
      }

      if (typeof aVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [filteredProducts, sortColumn, sortDirection]);

  // صفحه‌بندی و جلوگیری از گیر افتادن در صفحه خالی پس از حذف کالا
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  // بازنشانی صفحه هنگام تغییر فیلترها
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeStatusTab, categoryFilter, brandFilter]);

  // تب‌های نوار ابزار فیلتر
  const statusTabs: FilterTabOption[] = [
    {
      id: "all",
      label: "همه تجهیزات",
      count: products.length,
      badgeVariant: "default",
    },
    {
      id: "in_stock",
      label: "موجودی کافی",
      count: products.filter((p) => p.stock > p.minStockAlert).length,
      badgeVariant: "emerald",
    },
    {
      id: "low_stock",
      label: "کسری موجودی",
      count: lowStockProductsCount,
      badgeVariant: "orange",
    },
    {
      id: "out_of_stock",
      label: "اتمام موجودی",
      count: outOfStockCount,
      badgeVariant: "rose",
    },
    {
      id: "featured",
      label: "منتخب صفحه اول",
      count: products.filter((p) => p.featured).length,
      badgeVariant: "purple",
    },
    {
      id: "discounted",
      label: "فروش ویژه",
      count: products.filter((p) => p.isSpecialOffer || (p.discountPercent && p.discountPercent > 0)).length,
      badgeVariant: "sky",
    },
  ];

  // ─── ۶. اکشن‌ها و هندلرهای عملیاتی ──────────────────────────────────────────
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("desc");
    }
  };

  const handleOpenDetail = (product: AdminProduct) => {
    setDetailProduct(product);
    setIsDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    if (router) {
      router.push("/admin/products/new");
    } else if (typeof window !== "undefined" && window.location && window.location.pathname) {
      window.location.href = "/admin/products/new";
    } else {
      setFormProduct(null);
      setIsFormModalOpen(true);
    }
  };

  const handleOpenEdit = (product: AdminProduct) => {
    if (router) {
      router.push(`/admin/products/${product.id}/edit`);
    } else if (typeof window !== "undefined" && window.location && window.location.pathname) {
      window.location.href = `/admin/products/${product.id}/edit`;
    } else {
      setFormProduct(product);
      setIsFormModalOpen(true);
    }
  };

  const handleOpenQuickStock = (product: AdminProduct) => {
    setQuickStockProduct(product);
    setIsQuickStockModalOpen(true);
  };

  const handleOpenDelete = (product: AdminProduct) => {
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleSaveProduct = async (savedProduct: AdminProduct) => {
    if (formProduct) {
      // ویرایش محصول موجود
      updateProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
      if (detailProduct?.id === savedProduct.id) {
        setDetailProduct(savedProduct);
      }
      showToast(`کالای «${savedProduct.name}» با موفقیت بروزرسانی شد.`);
      try {
        await productsApi.updateProduct(savedProduct.id, savedProduct);
      } catch (err) {
        console.warn("[Admin API] Failed to update product on server:", err);
      }
    } else {
      // افزودن محصول جدید
      updateProducts([savedProduct, ...products]);
      showToast(`کالای جدید «${savedProduct.name}» با موفقیت به انبار اضافه شد.`);
      try {
        await productsApi.createProduct(savedProduct);
      } catch (err) {
        console.warn("[Admin API] Failed to create product on server:", err);
      }
    }
  };

  const handleConfirmQuickStock = (
    productId: string,
    newStock: number,
    newPrice: number,
    reason: string,
    operatorNote: string
  ) => {
    const today = new Intl.DateTimeFormat("fa-IR").format(new Date());
    const updated = products.map((p) => {
      if (p.id !== productId) return p;

      const diff = newStock - p.stock;
      const priceDiff = newPrice !== p.price;
      const currentLogs = p.inventoryLogs || [];
      const newLogs = [...currentLogs];

      // Only create stock movement log if stock actually changed
      if (diff !== 0) {
        newLogs.unshift({
          id: `log-${Date.now()}`,
          date: today,
          type: (diff > 0 ? "in" : "out") as "in" | "out",
          quantity: Math.abs(diff),
          reason: `${reason}${operatorNote ? ` (${operatorNote})` : ""}`,
          operator: "مدیر انبار مرکزی",
        });
      } else if (priceDiff) {
        newLogs.unshift({
          id: `log-${Date.now()}`,
          date: today,
          type: "adjustment" as const,
          quantity: 0,
          reason: `اصلاح قیمت از ${formatPrice(p.price)} به ${formatPrice(newPrice)}${operatorNote ? ` (${operatorNote})` : ""}`,
          operator: "مدیر انبار مرکزی",
        });
      }

      const newStatus: AdminProductStatus =
        newStock === 0 ? "out_of_stock" : p.status === "out_of_stock" ? "active" : p.status;

      return {
        ...p,
        stock: newStock,
        price: newPrice,
        status: newStatus,
        updatedAt: today,
        inventoryLogs: newLogs,
      };
    });

    updateProducts(updated);
    const target = updated.find((p) => p.id === productId);
    if (detailProduct?.id === productId && target) {
      setDetailProduct(target);
    }
    showToast(`موجودی انبار برای «${target?.name}» به ${toPersianDigits(newStock)} عدد تغییر یافت.`);

    // Async sync with backend
    productsApi.updateStock(productId, { stock: newStock, price: newPrice, note: reason }).catch((err) => {
      console.warn("[Admin API] Failed to sync stock to server:", err);
    });
  };

  const handleToggleProductStatus = (product: AdminProduct) => {
    const nextStatus: AdminProductStatus =
      product.status === "active" ? "inactive" : "active";
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, status: nextStatus } : p
    );
    updateProducts(updated);
    if (detailProduct?.id === product.id) {
      setDetailProduct({ ...product, status: nextStatus });
    }
    showToast(
      nextStatus === "active"
        ? `کالای «${product.name}» در فروشگاه فعال شد.`
        : `کالای «${product.name}» به حالت پیش‌نویس درآمد.`
    );

    // Async sync with backend
    productsApi.updateProduct(product.id, { status: nextStatus }).catch((err) => {
      console.warn("[Admin API] Failed to sync status to server:", err);
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteProduct) return;
    const deletedId = deleteProduct.id;
    const updated = products.filter((p) => p.id !== deletedId);
    updateProducts(updated);
    setSelectedIds((prev) => prev.filter((id) => id !== deletedId));
    if (detailProduct?.id === deletedId) {
      setIsDrawerOpen(false);
      setDetailProduct(null);
    }
    setIsDeleteModalOpen(false);
    showToast(`کالای «${deleteProduct.name}» از کاتالوگ انبار حذف گردید.`, "warning");
    setDeleteProduct(null);

    // Async sync with backend
    productsApi.deleteProduct(deletedId).catch((err) => {
      console.warn("[Admin API] Failed to sync delete to server:", err);
    });
  };

  // انتخاب سطر با پشتیبانی از چند صفحه
  const currentPageIds = paginatedProducts.map((p) => p.id);
  const isAllCurrentPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllCurrentPageSelected) {
      // اگر همه سطرهای صفحه جاری انتخاب شده‌اند، آنها را لغو انتخاب کن
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      // در غیر این صورت، همه سطرهای صفحه جاری را به لیست انتخاب‌ها اضافه کن
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // عملیات دسته‌ای (Bulk Actions)
  const handleBulkStatusChange = (newStatus: AdminProductStatus) => {
    const updated = products.map((p) =>
      selectedIds.includes(p.id) ? { ...p, status: newStatus } : p
    );
    updateProducts(updated);
    showToast(`وضعیت ${toPersianDigits(selectedIds.length)} کالای انتخابی بروزرسانی شد.`);
    setSelectedIds([]);
  };

  const handleConfirmBulkDelete = () => {
    const updated = products.filter((p) => !selectedIds.includes(p.id));
    updateProducts(updated);
    setIsBulkDeleteModalOpen(false);
    showToast(`${toPersianDigits(selectedIds.length)} کالا با موفقیت حذف شدند.`, "warning");
    setSelectedIds([]);
  };

  // ریست و بارگذاری مجدد از سرور
  const handleResetSampleData = async () => {
    try {
      const res = await productsApi.getProducts();
      if (res && Array.isArray(res.products)) {
        updateProducts(res.products);
        setSelectedIds([]);
        showToast("اطلاعات انبار از سرور به‌روزرسانی شد.");
        return;
      }
    } catch {}
    updateProducts([]);
    setSelectedIds([]);
    showToast("اطلاعات انبار پاک‌سازی شد.", "info");
  };

  // خروجی اکسل / CSV
  const handleExportCsv = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const rowsToExport =
          selectedIds.length > 0
            ? products.filter((p) => selectedIds.includes(p.id))
            : filteredProducts;

        const headers = [
          "شناسه",
          "نام کالا",
          "پارت نامبر (SKU)",
          "دسته‌بندی",
          "برند",
          "قیمت فروش (تومان)",
          "بهای تمام شده",
          "موجودی فیزیکی",
          "آستانه هشدار",
          "وضعیت",
          "محل در انبار",
          "گارانتی",
        ];

        const csvContent =
          "\uFEFF" +
          [
            headers.join(","),
            ...rowsToExport.map((p) =>
              [
                `"${p.id}"`,
                `"${p.name.replace(/"/g, '""')}"`,
                `"${p.sku}"`,
                `"${PRODUCT_CATEGORY_LABELS[p.category] || p.category}"`,
                `"${p.brand}"`,
                p.price,
                p.costPrice,
                p.stock,
                p.minStockAlert,
                `"${PRODUCT_STATUS_CONFIG[p.status]?.label || p.status}"`,
                `"${p.warehouseLocation}"`,
                `"${p.warranty.replace(/"/g, '""')}"`,
              ].join(",")
            ),
          ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `velox-inventory-catalog-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("فایل اکسل کاتالوگ انبار با موفقیت دانلود شد.");
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  // ─── ۷. ستون‌های جدول (AdminDataTable Columns) ─────────────────────────────
  const columns: AdminColumnDef<AdminProduct>[] = [
    // ستون ۱: چک‌باکس انتخاب
    {
      key: "select",
      header: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={
              paginatedProducts.length > 0 &&
              paginatedProducts.every((p) => selectedIds.includes(p.id))
            }
            onChange={handleToggleSelectAll}
            className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-orange-600 focus:ring-orange-500/30 cursor-pointer"
            aria-label="انتخاب همه سطرهای صفحه"
          />
        </div>
      ),
      className: "w-10 text-center",
      cell: (product) => (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(product.id)}
            onChange={() => handleToggleSelectRow(product.id)}
            className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-orange-600 focus:ring-orange-500/30 cursor-pointer"
            aria-label={`انتخاب ${product.name}`}
          />
        </div>
      ),
    },
    // ستون ۲: کالا و پارت‌نامبر
    {
      key: "name",
      header: "کالا و مشخصات پارت‌نامبر (SKU)",
      sortable: true,
      className: "min-w-[280px]",
      cell: (product) => (
        <div className="flex items-center gap-3 text-right">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800">
            {product.images && product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveProductImageUrl(product.images[0])}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            <div className="absolute inset-0 -z-10 flex h-full w-full items-center justify-center text-neutral-600 bg-neutral-900">
              <Package className="h-5 w-5" />
            </div>
            {product.featured && (
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-white text-xs sm:text-sm line-clamp-1 hover:text-orange-400 transition-colors">
                {product.name}
              </span>
              {product.isSpecialOffer && (
                <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/15 border border-orange-500/30 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" />
                  فروش ویژه
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.2 rounded border border-orange-500/20" dir="ltr">
                {product.sku}
              </span>
              <span className="text-[10px] text-neutral-400 bg-neutral-800/80 px-2 py-0.2 rounded border border-neutral-700">
                {product.brand}
              </span>
              <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.2 rounded border border-sky-500/20 hidden lg:inline">
                {PRODUCT_CATEGORY_LABELS[product.category] || product.category}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    // ستون ۳: قیمت و تخفیف
    {
      key: "price",
      header: "قیمت فروش (تومان)",
      sortable: true,
      className: "w-44 text-right whitespace-nowrap",
      cell: (product) => (
        <div className="flex flex-col text-right">
          <div className="font-bold text-emerald-400 text-sm font-mono">
            {formatPrice(product.price)}
          </div>
          {product.originalPrice && product.originalPrice > product.price ? (
            <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
              <span className="text-neutral-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded font-bold">
                %{toPersianDigits(product.discountPercent || 0)}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-neutral-500 mt-0.5">قیمت قطعی مصوب</span>
          )}
        </div>
      ),
    },
    // ستون ۴: موجودی انبار و هشدار
    {
      key: "stock",
      header: "موجودی فیزیکی انبار",
      sortable: true,
      className: "w-48 text-right whitespace-nowrap",
      cell: (product) => {
        const isOut = product.stock === 0;
        const isLow = product.stock > 0 && product.stock <= product.minStockAlert;

        return (
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border",
                    isOut
                      ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                      : isLow
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isOut ? "bg-rose-400" : isLow ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                    )}
                  />
                  {toPersianDigits(product.stock)} عدد
                </span>
              </div>

              <div className="text-[10px] text-neutral-500 mt-0.5">
                {isOut ? (
                  <span className="text-rose-400 font-semibold">هشدار اتمام موجودی</span>
                ) : isLow ? (
                  <span className="text-amber-400 font-semibold">
                    رو به اتمام (آستانه: {toPersianDigits(product.minStockAlert)})
                  </span>
                ) : (
                  <span>موقعیت: {product.warehouseLocation.split(" - ")[1] || "قفسه مرکزی"}</span>
                )}
              </div>
            </div>

            {/* دکمه تنظیم سریع موجودی */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenQuickStock(product);
              }}
              title="تنظیم سریع موجودی انبار"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-orange-400 hover:bg-neutral-800 transition cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
    // ستون ۵: وضعیت عرضه
    {
      key: "status",
      header: "وضعیت در کاتالوگ",
      sortable: true,
      className: "w-36 whitespace-nowrap",
      cell: (product) => {
        const conf = PRODUCT_STATUS_CONFIG[product.status] || PRODUCT_STATUS_CONFIG.active;
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleProductStatus(product);
            }}
            title="برای تغییر وضعیت کلیک کنید"
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition hover:opacity-80 cursor-pointer",
              conf.badgeClasses
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", conf.dotColor)} />
            {conf.label}
          </button>
        );
      },
    },
    // ستون ۶: گارانتی و شاخص‌ها
    {
      key: "warranty",
      header: "گارانتی و خدمات",
      hideOnMobile: true,
      className: "w-48 text-right",
      cell: (product) => (
        <div className="flex flex-col text-right">
          <div className="text-xs text-neutral-300 line-clamp-1 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span>{product.warranty}</span>
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
            {product.specs?.[0] || "تست سلامت فیزیکی"}
          </div>
        </div>
      ),
    },
    // ستون ۷: عملیات
    {
      key: "actions",
      header: "عملیات",
      className: "w-32 text-center whitespace-nowrap",
      cell: (product) => (
        <div
          className="flex items-center justify-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleOpenDetail(product)}
            title="مشاهده شناسنامه و پرونده فنی"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-sky-400 hover:bg-neutral-800 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(product)}
            title="ویرایش جامع کالا"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-orange-400 hover:bg-neutral-800 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(product)}
            title="حذف از انبار"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // ─── ۸. رندرر اختصاصی کارت‌های موبایل (Mobile Card View) ─────────────────────
  const mobileCardRenderer = (product: AdminProduct) => {
    const isOut = product.stock === 0;
    const isLow = product.stock > 0 && product.stock <= product.minStockAlert;
    const statusConf = PRODUCT_STATUS_CONFIG[product.status] || PRODUCT_STATUS_CONFIG.active;
    const isSelected = selectedIds.includes(product.id);

    return (
      <div
        key={product.id}
        onClick={() => handleOpenDetail(product)}
        className={cn(
          "rounded-2xl border p-3.5 transition-all cursor-pointer relative space-y-3",
          isSelected
            ? "border-orange-500/50 bg-orange-500/5 shadow-md shadow-orange-500/10"
            : "border-[var(--theme-border-color)] bg-[var(--theme-surface)] hover:border-neutral-700"
        )}
      >
        {/* هدر کارت موبایل */}
        <div className="flex items-start gap-3">
          {/* چک باکس */}
          <div
            className="pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggleSelectRow(product.id)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-orange-600 focus:ring-orange-500/30 cursor-pointer"
              aria-label={`انتخاب ${product.name}`}
            />
          </div>

          {/* تصویر */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800">
            {product.images && product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveProductImageUrl(product.images[0])}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            <div className="absolute inset-0 -z-10 flex h-full w-full items-center justify-center text-neutral-600 bg-neutral-900">
              <Package className="h-6 w-6" />
            </div>
            {product.featured && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-400 shadow-sm" />
            )}
          </div>

          {/* عنوان و پارت نامبر */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs leading-snug line-clamp-2">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="font-mono text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.2 rounded border border-orange-500/20" dir="ltr">
                {product.sku}
              </span>
              <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.2 rounded border border-neutral-700">
                {product.brand}
              </span>
            </div>
          </div>
        </div>

        {/* وضعیت موجودی و قیمت در موبایل */}
        <div className="flex items-center justify-between border-t border-b border-neutral-800/80 py-2.5">
          {/* موجودی */}
          <div>
            <div className="text-[10px] text-neutral-400">موجودی انبار:</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-mono border",
                  isOut
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    : isLow
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isOut ? "bg-rose-400" : isLow ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                  )}
                />
                {toPersianDigits(product.stock)} عدد
              </span>
            </div>
          </div>

          {/* قیمت */}
          <div className="text-left" dir="ltr">
            <div className="text-[10px] text-neutral-400 text-right">قیمت فروش:</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] text-rose-400 font-bold text-right">
                %{toPersianDigits(product.discountPercent || 0)} تخفیف ویژه
              </div>
            )}
          </div>
        </div>

        {/* دکمه‌های پایین کارت موبایل */}
        <div
          className="flex items-center justify-between pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
              statusConf.badgeClasses
            )}
          >
            <span className={cn("h-1 w-1 rounded-full", statusConf.dotColor)} />
            {statusConf.label}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleOpenQuickStock(product)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-orange-400 hover:bg-neutral-800 transition"
              title="تنظیم موجودی"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleOpenEdit(product)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-orange-400 hover:bg-neutral-800 transition"
              title="ویرایش"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleOpenDelete(product)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
              title="حذف"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── ۹. رندر ویو ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-right pb-12" dir="rtl">
      {/* پیام اعلان شناور (Toast Notification) */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-neutral-900/95 px-4 py-3 text-xs text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* سربرگ صفحه و عنوان راهبری */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border-color)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 font-semibold mb-1">
            <Boxes className="h-4 w-4" />
            <span>سامانه انبارداری و زنجیره تامین تجهیزات شبکه ققنوس</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            کاتالوگ و موجودی انبار تجهیزات شبکه
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            پایش بلادرنگ موجودی فیزیکی سوئیچ‌ها، روترها، کابل و رک با امکان تنظیم سریع قیمت، تعریف
            تخفیف‌های پروژه‌ای و اعلان کمبود انبار.
          </p>
        </div>

        {/* دکمه‌های اصلی هدر */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetSampleData}
            title="بازیابی کاتالوگ با داده‌های نمونه کارخانه‌ای"
            className="text-xs border-neutral-700 hover:bg-neutral-800 text-neutral-300 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 ml-1" />
            بازیابی نمونه
          </Button>

          <Button
            type="button"
            onClick={handleOpenCreate}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs h-9 px-4 shadow-lg shadow-orange-600/20 cursor-pointer"
          >
            <Plus className="h-4 w-4 ml-1.5" />
            افزودن محصول جدید
          </Button>
        </div>
      </div>

      {/* کارت‌های شاخص‌های کلیدی (KPI Cards) */}
      <AdminStatsCards items={statCards} columns={4} />

      {/* نوار فیلتر و جستجو */}
      <AdminFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="جستجو در نام محصول، پارت‌نامبر (SKU)، برند یا محل قفسه انبار..."
        statusTabs={statusTabs}
        activeStatusTab={activeStatusTab}
        onStatusTabChange={setActiveStatusTab}
        onExport={handleExportCsv}
        exportLabel="خروجی اکسل (CSV)"
        isExporting={isExporting}
        secondaryFilters={
          <div className="flex items-center gap-2 flex-wrap">
            {/* فیلتر دسته‌بندی */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              {availableCategories.length > 0
                ? availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.shortName}
                    </option>
                  ))
                : Object.entries(PRODUCT_CATEGORY_LABELS).map(([catKey, catLabel]) => (
                    <option key={catKey} value={catKey}>
                      {catLabel}
                    </option>
                  ))}
            </select>

            {/* فیلتر برند */}
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="h-9 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-xs text-white focus:border-orange-500 focus:outline-none cursor-pointer"
            >
              <option value="all">همه برندها</option>
              {POPULAR_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* دکمه بازنشانی فیلترها */}
            {(categoryFilter !== "all" || brandFilter !== "all" || searchQuery.trim() !== "") && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("all");
                  setBrandFilter("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>پاکسازی فیلتر</span>
              </button>
            )}
          </div>
        }
      />

      {/* نوار عملیات دسته‌ای شناور (Bulk Actions Toolbar) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-3 text-xs text-white backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 font-bold text-xs">
              {toPersianDigits(selectedIds.length)}
            </span>
            <span className="font-bold">کالا برای عملیات دسته‌ای انتخاب شده است.</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange("active")}
              className="text-xs h-8 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
            >
              فعال‌سازی در فروشگاه
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange("out_of_stock")}
              className="text-xs h-8 border-rose-500/40 text-rose-300 hover:bg-rose-500/10 cursor-pointer"
            >
              اعلام اتمام موجودی
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCsv}
              className="text-xs h-8 border-neutral-700 text-neutral-200 hover:bg-neutral-800 cursor-pointer"
            >
              دانلود CSV این موارد
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="text-xs h-8 bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
            >
              حذف دسته‌ای
            </Button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-neutral-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              لغو انتخاب
            </button>
          </div>
        </div>
      )}

      {/* جدول داده‌ها و نمای کارتی موبایل */}
      <AdminDataTable
        data={paginatedProducts}
        columns={columns}
        keyExtractor={(p) => p.id}
        totalItems={sortedProducts.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={handleOpenDetail}
        mobileCardRenderer={mobileCardRenderer}
        emptyMessage="هیچ تجهیزاتی با مشخصات مورد نظر در انبار یافت نشد"
        emptySubtitle="کلمات جستجو را تغییر دهید یا فیلترهای دسته و برند را بازنشانی کنید."
      />

      {/* کشوی شناسنامه فنی و پرونده محصول (Detail Drawer) */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setDetailProduct(null);
        }}
        title={detailProduct?.name || "شناسنامه فنی کالا"}
        subtitle={
          detailProduct ? (
            <span className="font-mono text-orange-400 font-bold" dir="ltr">
              {detailProduct.sku}
            </span>
          ) : undefined
        }
        badge={
          detailProduct ? (
            <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
              {PRODUCT_CATEGORY_LABELS[detailProduct.category]}
            </span>
          ) : undefined
        }
        size="lg"
      >
        {detailProduct && (
          <ProductDetailDrawerContent
            product={detailProduct}
            onEdit={(p) => {
              setIsDrawerOpen(false);
              handleOpenEdit(p);
            }}
            onQuickStock={(p) => {
              handleOpenQuickStock(p);
            }}
            onDelete={(p) => {
              handleOpenDelete(p);
            }}
            onToggleStatus={handleToggleProductStatus}
          />
        )}
      </AdminDetailDrawer>

      {/* مودال ایجاد و ویرایش محصول (Form Modal) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setFormProduct(null);
        }}
        product={formProduct}
        existingProducts={products}
        onSave={handleSaveProduct}
      />

      {/* مودال تنظیم سریع موجودی و قیمت (Quick Stock Modal) */}
      <ProductQuickStockModal
        isOpen={isQuickStockModalOpen}
        onClose={() => {
          setIsQuickStockModalOpen(false);
          setQuickStockProduct(null);
        }}
        product={quickStockProduct}
        onConfirm={handleConfirmQuickStock}
      />

      {/* مودال تایید حذف تکی محصول */}
      <AdminActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteProduct(null);
        }}
        title="حذف کالا از کاتالوگ انبار"
        description={`آیا از حذف کامل «${deleteProduct?.name}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.`}
        variant="danger"
        confirmLabel="بله، کالا حذف شود"
        cancelLabel="انصراف"
        onConfirm={handleConfirmDelete}
      />

      {/* مودال تایید حذف دسته‌ای */}
      <AdminActionModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="حذف دسته‌ای تجهیزات انتخاب‌شده"
        description={`آیا از حذف کامل ${toPersianDigits(selectedIds.length)} کالای انتخاب‌شده اطمینان دارید؟`}
        variant="danger"
        confirmLabel="بله، همه موارد حذف شوند"
        cancelLabel="انصراف"
        onConfirm={handleConfirmBulkDelete}
      />
    </div>
  );
}
