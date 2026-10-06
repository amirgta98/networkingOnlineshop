import { WishlistItem } from "../types/wishlist.types";
import { MOCK_PRODUCTS } from "@/shared/lib/mocks/mock-products";

const findProduct = (id: string) => {
  return MOCK_PRODUCTS.find((p) => p.id === id) || (MOCK_PRODUCTS[0] as unknown as import("@/features/catalog/types").Product);
};

export const INITIAL_WISHLIST: WishlistItem[] = [
  {
    id: "wish-1",
    productId: "net-cisco-9200l",
    addedAt: "۱۴۰۳/۰۸/۱۵",
    notifyOnRestock: true,
    notifyOnPriceDrop: true,
    notes: "بررسی برای پروژه ارتقای سوئیچینگ طبقه ۴",
    product: findProduct("net-cisco-9200l") as unknown as import("@/features/catalog/types").Product,
  },
  {
    id: "wish-2",
    productId: "net-mikrotik-crs326",
    addedAt: "۱۴۰۳/۰۸/۱۸",
    notifyOnRestock: false,
    notifyOnPriceDrop: true,
    notes: "مناسب برای توزیع پسیو رک دوم",
    product: findProduct("net-mikrotik-crs326") as unknown as import("@/features/catalog/types").Product,
  },
  {
    id: "wish-3",
    productId: "net-cisco-isr4331",
    addedAt: "۱۴۰۳/۰۸/۰۲",
    notifyOnRestock: true,
    notifyOnPriceDrop: false,
    notes: "نیاز به استعلام پیش‌فاکتور با ۲ ماژول E1",
    product: findProduct("net-cisco-isr4331") as unknown as import("@/features/catalog/types").Product,
  },
  {
    id: "wish-4",
    productId: "net-ubiquiti-u6-lr",
    addedAt: "۱۴۰۳/۰۸/۲۱",
    notifyOnRestock: false,
    notifyOnPriceDrop: true,
    product: findProduct("net-ubiquiti-u6-lr") as unknown as import("@/features/catalog/types").Product,
  },
];
