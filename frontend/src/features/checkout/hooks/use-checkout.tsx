"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCart } from "@/features/cart";
import { addressesApi } from "@/features/dashboard/api/addresses-api";
import {
  CheckoutStep,
  InvoiceType,
  ShippingAddress,
  LegalInvoiceData,
  CouponDiscount,
  OrderFinancialSummary,
  PlacedOrderDetails,
  CreateOrderPayload,
} from "../types";
import {
  PRESET_LEGAL_DATA,
  validateCoupon,
  calculateOrderFinancials,
  placeOrder,
} from "../api/checkout-api";

interface CheckoutContextValue {
  // Step Navigation
  currentStep: CheckoutStep;
  goToStep: (step: CheckoutStep) => void;
  nextStep: () => boolean;
  prevStep: () => void;

  // Form State
  shippingAddress: ShippingAddress;
  setShippingAddress: React.Dispatch<React.SetStateAction<ShippingAddress>>;
  savedAddresses: ShippingAddress[];
  selectedAddressId: string;
  selectSavedAddress: (address: ShippingAddress) => void;
  isLoadingAddresses: boolean;
  addressesError: string | null;
  refreshAddresses: () => Promise<void>;

  invoiceType: InvoiceType;
  setInvoiceType: (type: InvoiceType) => void;
  legalInvoice: LegalInvoiceData;
  setLegalInvoice: React.Dispatch<React.SetStateAction<LegalInvoiceData>>;

  deliveryMethodId: string;
  setDeliveryMethodId: (id: string) => void;
  deliveryTimeSlot: string;
  setDeliveryTimeSlot: (slot: string) => void;

  paymentMethodId: string;
  setPaymentMethodId: (id: string) => void;
  selectedGatewayId: string;
  setSelectedGatewayId: (id: string) => void;

  // Coupons
  couponInput: string;
  setCouponInput: (val: string) => void;
  appliedCoupon: CouponDiscount | null;
  isApplyingCoupon: boolean;
  couponError: string | null;
  handleApplyCoupon: () => Promise<void>;
  handleRemoveCoupon: () => void;

  // Financials & Calculations
  financials: OrderFinancialSummary;

  // Order Submission
  isSubmitting: boolean;
  submitError: string | null;
  placedOrder: PlacedOrderDetails | null;
  handlePlaceOrder: () => Promise<PlacedOrderDetails | null>;

  // Validation
  errors: Record<string, string>;
  validateCurrentStep: () => boolean;
}

const CheckoutContext = React.createContext<CheckoutContextValue | null>(null);

const EMPTY_SHIPPING_ADDRESS: ShippingAddress = {
  id: "custom",
  title: "نشانی تحویل",
  recipientName: "",
  phoneNumber: "",
  province: "تهران",
  city: "تهران",
  postalCode: "",
  address: "",
  buildingNumber: "",
  unit: "",
  deliveryNotes: "",
  recipientIsSelf: true,
  isDefault: false,
};

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [currentStep, setCurrentStep] = React.useState<CheckoutStep>("shipping");
  const [savedAddresses, setSavedAddresses] = React.useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("");
  const [shippingAddress, setShippingAddress] = React.useState<ShippingAddress>(EMPTY_SHIPPING_ADDRESS);
  const [isLoadingAddresses, setIsLoadingAddresses] = React.useState<boolean>(true);
  const [addressesError, setAddressesError] = React.useState<string | null>(null);

  const [invoiceType, setInvoiceType] = React.useState<InvoiceType>("personal");
  const [legalInvoice, setLegalInvoice] = React.useState<LegalInvoiceData>(PRESET_LEGAL_DATA);

  const [deliveryMethodId, setDeliveryMethodId] = React.useState<string>("express_courier");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = React.useState<string>("morning");

  const [paymentMethodId, setPaymentMethodId] = React.useState<string>("online_gateway");
  const [selectedGatewayId, setSelectedGatewayId] = React.useState<string>("saman");

  // Coupon State
  const [couponInput, setCouponInput] = React.useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<CouponDiscount | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState<boolean>(false);
  const [couponError, setCouponError] = React.useState<string | null>(null);

  // Errors & Submission
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = React.useState<PlacedOrderDetails | null>(null);

  // Select a preset saved address
  const selectSavedAddress = React.useCallback((addr: ShippingAddress) => {
    setSelectedAddressId(addr.id || "custom");
    setShippingAddress(addr);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.recipientName;
      delete copy.phoneNumber;
      delete copy.province;
      delete copy.city;
      delete copy.postalCode;
      delete copy.address;
      delete copy.buildingNumber;
      return copy;
    });
  }, []);

  // Fetch real addresses from backend
  const fetchAddresses = React.useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      setAddressesError(null);
      const data = await addressesApi.getAddresses();
      const mapped: ShippingAddress[] = data.map((d) => ({
        id: d.id,
        title: d.title,
        recipientName: d.recipientName,
        phoneNumber: d.phoneNumber,
        province: d.province,
        city: d.city,
        postalCode: d.postalCode,
        address: d.fullAddress,
        buildingNumber: d.buildingNumber,
        unit: d.unit || "",
        deliveryNotes: d.deliveryNotes || "",
        recipientIsSelf: true,
        isDefault: d.isDefault,
      }));
      setSavedAddresses(mapped);

      const newAddressId = searchParams?.get("newAddressId");
      const shouldAdvance = searchParams?.get("advance") === "true";

      if (newAddressId) {
        const match = mapped.find((a) => a.id === newAddressId);
        if (match) {
          selectSavedAddress(match);
          if (shouldAdvance) {
            setCurrentStep("invoice");
          }
          if (typeof window !== "undefined") {
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.delete("newAddressId");
            nextUrl.searchParams.delete("advance");
            router.replace(nextUrl.pathname + (nextUrl.search ? nextUrl.search : ""), { scroll: false });
          }
          return;
        }
      }

      if (mapped.length > 0) {
        const defaultAddr = mapped.find((a) => a.isDefault) || mapped[0];
        selectSavedAddress(defaultAddr);
      } else {
        setSelectedAddressId("");
        setShippingAddress(EMPTY_SHIPPING_ADDRESS);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در دریافت نشانی‌های ثبت‌شده از سرور";
      setAddressesError(msg);
      setSelectedAddressId("");
      setShippingAddress(EMPTY_SHIPPING_ADDRESS);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [searchParams, router, pathname, selectSavedAddress]);

  React.useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  // Compute live financials
  const financials = React.useMemo(() => {
    return calculateOrderFinancials(items, deliveryMethodId, invoiceType, appliedCoupon);
  }, [items, deliveryMethodId, invoiceType, appliedCoupon]);

  // Apply Coupon
  const handleApplyCoupon = React.useCallback(async () => {
    if (!couponInput.trim()) {
      setCouponError("لطفاً کد تخفیف را وارد نمایید.");
      return;
    }
    try {
      setIsApplyingCoupon(true);
      setCouponError(null);
      const coupon = await validateCoupon(couponInput, financials.subtotal);
      setAppliedCoupon(coupon);
      setCouponInput("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCouponError(err.message);
      } else {
        setCouponError("خطا در اعمال کد تخفیف.");
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponInput, financials.subtotal]);

  const handleRemoveCoupon = React.useCallback(() => {
    setAppliedCoupon(null);
    setCouponError(null);
  }, []);

  // Validation function for current step
  const validateCurrentStep = React.useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === "shipping") {
      if (!shippingAddress.recipientName?.trim()) {
        newErrors.recipientName = "نام و نام خانوادگی تحویل‌گیرنده الزامی است.";
      }
      if (
        !shippingAddress.phoneNumber?.trim() ||
        !/^09[0-9]{9}$/.test(shippingAddress.phoneNumber.replace(/\s+/g, ""))
      ) {
        newErrors.phoneNumber = "شماره موبایل معتبر ۱۱ رقمی با فرمت ۰۹ وارد کنید.";
      }
      if (!shippingAddress.province?.trim()) {
        newErrors.province = "انتخاب استان الزامی است.";
      }
      if (!shippingAddress.city?.trim()) {
        newErrors.city = "انتخاب شهر الزامی است.";
      }
      if (
        !shippingAddress.postalCode?.trim() ||
        shippingAddress.postalCode.replace(/\D/g, "").length < 10
      ) {
        newErrors.postalCode = "کد پستی ۱۰ رقمی الزامی است.";
      }
      if (!shippingAddress.address?.trim() || shippingAddress.address.trim().length < 8) {
        newErrors.address = "نشانی دقیق پستی (حداقل ۸ کاراکتر) الزامی است.";
      }
      if (!shippingAddress.buildingNumber?.trim()) {
        newErrors.buildingNumber = "پلاک الزامی است.";
      }
    } else if (currentStep === "invoice") {
      if (invoiceType === "legal") {
        if (!legalInvoice.companyName?.trim()) {
          newErrors.companyName = "نام رسمی شرکت یا سازمان الزامی است.";
        }
        if (
          !legalInvoice.nationalId?.trim() ||
          legalInvoice.nationalId.replace(/\D/g, "").length < 11
        ) {
          newErrors.nationalId = "شناسه ملی ۱۱ رقمی معتبر الزامی است.";
        }
        if (!legalInvoice.economicCode?.trim()) {
          newErrors.economicCode = "کد اقتصادی الزامی است.";
        }
        if (!legalInvoice.registrationNumber?.trim()) {
          newErrors.registrationNumber = "شماره ثبت شرکت الزامی است.";
        }
        if (!legalInvoice.phoneNumber?.trim()) {
          newErrors.legalPhone = "شماره تلفن ثابت شرکت الزامی است.";
        }
        if (
          !legalInvoice.postalCode?.trim() ||
          legalInvoice.postalCode.replace(/\D/g, "").length < 10
        ) {
          newErrors.legalPostalCode = "کد پستی ۱۰ رقمی دفتر مرکزی الزامی است.";
        }
      }
    } else if (currentStep === "delivery") {
      if (!deliveryMethodId) {
        newErrors.deliveryMethod = "لطفاً یک روش ارسال را انتخاب کنید.";
      }
    } else if (currentStep === "payment") {
      if (!paymentMethodId) {
        newErrors.paymentMethod = "لطفاً روش پرداخت را انتخاب نمایید.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, shippingAddress, invoiceType, legalInvoice, deliveryMethodId, paymentMethodId]);

  // Step transitions
  const nextStep = React.useCallback((): boolean => {
    if (!validateCurrentStep()) return false;

    if (currentStep === "shipping") setCurrentStep("invoice");
    else if (currentStep === "invoice") setCurrentStep("delivery");
    else if (currentStep === "delivery") setCurrentStep("payment");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return true;
  }, [currentStep, validateCurrentStep]);

  const prevStep = React.useCallback(() => {
    if (currentStep === "payment") setCurrentStep("delivery");
    else if (currentStep === "delivery") setCurrentStep("invoice");
    else if (currentStep === "invoice") setCurrentStep("shipping");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const goToStep = React.useCallback((step: CheckoutStep) => {
    setCurrentStep(step);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Submit Order
  const handlePlaceOrder = React.useCallback(async (): Promise<PlacedOrderDetails | null> => {
    if (!validateCurrentStep()) return null;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const payload: CreateOrderPayload = {
        items: items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
          unitPrice: it.unitPrice ?? it.product.price,
        })),
        shippingAddress,
        invoiceType,
        legalInvoice: invoiceType === "legal" ? legalInvoice : undefined,
        deliveryMethodId,
        deliveryTimeSlot,
        paymentMethodId,
        selectedGatewayId: paymentMethodId === "online_gateway" ? selectedGatewayId : undefined,
        couponCode: appliedCoupon?.code,
      };

      const result = await placeOrder(payload, items);
      setPlacedOrder(result);
      clearCart();
      setCurrentStep("success");
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("متأسفانه در ثبت سفارش خطایی رخ داد. لطفاً مجدداً تلاش فرمایید.");
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateCurrentStep,
    items,
    shippingAddress,
    invoiceType,
    legalInvoice,
    deliveryMethodId,
    deliveryTimeSlot,
    paymentMethodId,
    selectedGatewayId,
    appliedCoupon,
    clearCart,
  ]);

  const value: CheckoutContextValue = {
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    shippingAddress,
    setShippingAddress,
    savedAddresses,
    selectedAddressId,
    selectSavedAddress,
    isLoadingAddresses,
    addressesError,
    refreshAddresses: fetchAddresses,
    invoiceType,
    setInvoiceType,
    legalInvoice,
    setLegalInvoice,
    deliveryMethodId,
    setDeliveryMethodId,
    deliveryTimeSlot,
    setDeliveryTimeSlot,
    paymentMethodId,
    setPaymentMethodId,
    selectedGatewayId,
    setSelectedGatewayId,
    couponInput,
    setCouponInput,
    appliedCoupon,
    isApplyingCoupon,
    couponError,
    handleApplyCoupon,
    handleRemoveCoupon,
    financials,
    isSubmitting,
    submitError,
    placedOrder,
    handlePlaceOrder,
    errors,
    validateCurrentStep,
  };

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
  const ctx = React.useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return ctx;
}
