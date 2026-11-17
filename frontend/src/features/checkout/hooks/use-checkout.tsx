"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCart } from "@/features/cart";
import { useAffiliate } from "@/features/affiliate";
import { addressesApi } from "@/features/dashboard/api/addresses-api";
import {
  CheckoutStep,
  InvoiceType,
  ShippingAddress,
  LegalInvoiceData,
  DeliveryMethod,
  DeliveryDateOption,
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
  DEFAULT_DELIVERY_METHODS,
} from "../api/checkout-api";
import { shippingApi, isMethodAvailableForProvince } from "../api/shipping-api";
import { paymentApi } from "@/features/payment";

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

  // Shipping & Delivery Scheduling
  deliveryMethodId: string;
  setDeliveryMethodId: (id: string) => void;
  deliveryDate: string;
  setDeliveryDate: (date: string) => void;
  deliveryDateJalali: string;
  setDeliveryDateJalali: (jalali: string) => void;
  deliveryTimeSlot: string;
  setDeliveryTimeSlot: (slot: string) => void;
  specialDeliveryNotes: string;
  setSpecialDeliveryNotes: (notes: string) => void;
  liftRequired: boolean;
  setLiftRequired: (required: boolean) => void;

  availableDeliveryMethods: DeliveryMethod[];
  isLoadingDeliveryMethods: boolean;
  deliveryMethodsError: string | null;
  availableScheduleDays: DeliveryDateOption[];
  isLoadingSchedule: boolean;
  refreshShippingData: () => Promise<void>;

  paymentMethodId: string;
  setPaymentMethodId: (id: string) => void;
  selectedGatewayId: string;
  setSelectedGatewayId: (id: string) => void;
  selectedBankAccountId: string;
  setSelectedBankAccountId: (id: string) => void;

  // Card-to-Card Receipt
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
  receiptUrl: string | null;
  setReceiptUrl: (url: string | null) => void;
  receiptNumber: string;
  setReceiptNumber: (num: string) => void;
  isUploadingReceipt: boolean;
  uploadReceiptFile: (file: File) => Promise<string | null>;

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
  const { isPartner, partnerCode, calculateAffiliatePrice } = useAffiliate();
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

  // Delivery states
  const [deliveryMethodId, setDeliveryMethodId] = React.useState<string>("express_courier");
  const [deliveryDate, setDeliveryDate] = React.useState<string>("");
  const [deliveryDateJalali, setDeliveryDateJalali] = React.useState<string>("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = React.useState<string>("morning");
  const [specialDeliveryNotes, setSpecialDeliveryNotes] = React.useState<string>("");
  const [liftRequired, setLiftRequired] = React.useState<boolean>(false);

  // Dynamic Shipping API data
  const [availableDeliveryMethods, setAvailableDeliveryMethods] = React.useState<DeliveryMethod[]>(
    DEFAULT_DELIVERY_METHODS
  );
  const [isLoadingDeliveryMethods, setIsLoadingDeliveryMethods] = React.useState<boolean>(false);
  const [deliveryMethodsError, setDeliveryMethodsError] = React.useState<string | null>(null);

  const [availableScheduleDays, setAvailableScheduleDays] = React.useState<DeliveryDateOption[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = React.useState<boolean>(false);

  const [paymentMethodId, setPaymentMethodId] = React.useState<string>("online_gateway");
  const [selectedGatewayId, setSelectedGatewayId] = React.useState<string>("zarinpal");
  const [selectedBankAccountId, setSelectedBankAccountId] = React.useState<string>("");

  // Card-to-Card Receipt State
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = React.useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = React.useState<string>("");
  const [isUploadingReceipt, setIsUploadingReceipt] = React.useState<boolean>(false);

  const uploadReceiptFile = React.useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsUploadingReceipt(true);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.receipt;
        return next;
      });
      const res = await paymentApi.uploadReceipt(file);
      if (res && res.url) {
        setReceiptUrl(res.url);
        setReceiptFile(file);
        return res.url;
      }
      return null;
    } catch (err: any) {
      console.error("[useCheckout] Receipt upload failed:", err);
      const msg = err?.response?.data?.message || err?.message || "خطا در بارگذاری تصویر فیش.";
      setErrors((prev) => ({
        ...prev,
        receipt: Array.isArray(msg) ? msg.join(" - ") : msg,
      }));
      return null;
    } finally {
      setIsUploadingReceipt(false);
    }
  }, []);

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

  // Fetch available shipping methods and schedule based on destination province
  const fetchShippingData = React.useCallback(async () => {
    try {
      setIsLoadingDeliveryMethods(true);
      setIsLoadingSchedule(true);
      setDeliveryMethodsError(null);

      const subtotal = items.reduce(
        (sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity,
        0
      );

      const [methods, schedule] = await Promise.all([
        shippingApi.getMethods(shippingAddress.province, subtotal),
        shippingApi.getSchedule(shippingAddress.province),
      ]);

      setAvailableDeliveryMethods(methods);
      setAvailableScheduleDays(schedule);

      // Verify or auto-select valid unrestricted delivery method
      if (methods.length > 0) {
        const currentMethod = methods.find((m) => m.id === deliveryMethodId);
        const isCurrentRestricted = currentMethod
          ? !isMethodAvailableForProvince(currentMethod, shippingAddress.province)
          : true;

        if (!currentMethod || isCurrentRestricted) {
          const firstAvailable = methods.find((m) =>
            isMethodAvailableForProvince(m, shippingAddress.province)
          );
          if (firstAvailable) {
            setDeliveryMethodId(firstAvailable.id);
          } else {
            setDeliveryMethodId(methods[0].id);
          }
        }
      }

      // Auto-select first date if not yet selected or if previous date is no longer in schedule
      if (schedule.length > 0) {
        const dateStillValid = schedule.some((d) => d.date === deliveryDate);
        if (!deliveryDate || !dateStillValid) {
          setDeliveryDate(schedule[0].date);
          setDeliveryDateJalali(schedule[0].jalaliDate);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "خطا در دریافت شیوه‌ها و زمان‌بندی ارسال";
      setDeliveryMethodsError(msg);
    } finally {
      setIsLoadingDeliveryMethods(false);
      setIsLoadingSchedule(false);
    }
  }, [shippingAddress.province, items, deliveryMethodId, deliveryDate]);

  React.useEffect(() => {
    void fetchShippingData();
  }, [fetchShippingData]);

  const affiliateDiscountTotal = React.useMemo(() => {
    if (!isPartner) return 0;
    return items.reduce((sum, item) => {
      const evalResult = calculateAffiliatePrice(item.product);
      if (evalResult.isEligible) {
        return sum + evalResult.discountAmount * item.quantity;
      }
      return sum;
    }, 0);
  }, [items, isPartner, calculateAffiliatePrice]);

  // Compute live financials
  const financials = React.useMemo(() => {
    return calculateOrderFinancials(
      items,
      deliveryMethodId,
      invoiceType,
      appliedCoupon,
      availableDeliveryMethods,
      shippingAddress.province,
      isPartner ? affiliateDiscountTotal : 0
    );
  }, [
    items,
    deliveryMethodId,
    invoiceType,
    appliedCoupon,
    availableDeliveryMethods,
    shippingAddress.province,
    isPartner,
    affiliateDiscountTotal,
  ]);

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
        if (!legalInvoice.address?.trim() || legalInvoice.address.trim().length < 8) {
          newErrors.legalAddress = "نشانی کامل دفتر مرکزی مطابق روزنامه رسمی الزامی است.";
        }
      }
    } else if (currentStep === "delivery") {
      if (!deliveryMethodId) {
        newErrors.deliveryMethod = "لطفاً یک روش ارسال را انتخاب کنید.";
      } else {
        const selected = availableDeliveryMethods.find((m) => m.id === deliveryMethodId);
        if (selected && selected.allowedProvinces && selected.allowedProvinces.length > 0) {
          const match = selected.allowedProvinces.some(
            (p) =>
              p.trim() === shippingAddress.province?.trim() ||
              shippingAddress.province?.includes(p.trim()) ||
              p.trim().includes(shippingAddress.province?.trim() || "")
          );
          if (!match) {
            newErrors.deliveryMethod = `روش انتخابی فقط برای استان‌های (${selected.allowedProvinces.join("، ")}) فعال است.`;
          }
        }
      }

      if (!deliveryDate && availableScheduleDays.length > 0) {
        newErrors.deliveryDate = "لطفاً تاریخ تحویل سفارش را انتخاب فرمایید.";
      }

      if (!deliveryTimeSlot) {
        newErrors.deliveryTimeSlot = "لطفاً بازه زمانی تحویل را مشخص فرمایید.";
      }
    } else if (currentStep === "payment") {
      if (!paymentMethodId) {
        newErrors.paymentMethod = "لطفاً روش پرداخت را انتخاب نمایید.";
      } else if (
        paymentMethodId === "bank_transfer" ||
        paymentMethodId === "card_to_card" ||
        paymentMethodId === "bank_wire"
      ) {
        if (!receiptUrl && !receiptFile) {
          newErrors.receipt = "برای روش کارت به کارت، بارگذاری تصویر یا عکس فیش واریز الزامی است.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    currentStep,
    shippingAddress,
    invoiceType,
    legalInvoice,
    deliveryMethodId,
    deliveryDate,
    deliveryTimeSlot,
    availableDeliveryMethods,
    availableScheduleDays,
    paymentMethodId,
    receiptUrl,
    receiptFile,
  ]);

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
    if (isSubmitting) return null;
    if (!validateCurrentStep()) return null;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      let finalReceiptUrl = receiptUrl;
      const isCardToCard =
        paymentMethodId === "bank_transfer" ||
        paymentMethodId === "card_to_card" ||
        paymentMethodId === "bank_wire";

      if (isCardToCard && receiptFile && !finalReceiptUrl) {
        finalReceiptUrl = await uploadReceiptFile(receiptFile);
      }

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
        deliveryDate,
        deliveryDateJalali,
        deliveryTimeSlot,
        specialDeliveryNotes,
        liftRequired,
        paymentMethodId,
        paymentReceiptNumber: receiptNumber?.trim() || undefined,
        paymentReceiptUrl: finalReceiptUrl || undefined,
        selectedGatewayId: paymentMethodId === "online_gateway" || paymentMethodId === "gateway" ? selectedGatewayId : undefined,
        selectedBankAccountId:
          paymentMethodId === "bank_transfer" || paymentMethodId === "card_to_card" || paymentMethodId === "bank_wire"
            ? selectedBankAccountId
            : undefined,
        couponCode: appliedCoupon?.code,
        affiliateCode: partnerCode || undefined,
      };

      const result = await placeOrder(payload, items, availableDeliveryMethods);
      setPlacedOrder(result);

      // Central Unified Payment Initiation
      try {
        const targetOrderId = result.orderId || result.orderNumber;
        const rawAmount = result.financialSummary?.payableTotal || financials.payableTotal;
        const payableAmount = Math.max(1000, Math.round(Number(rawAmount) || 10000));

        let unifiedMethod: "online_gateway" | "wallet" | "card_to_card" | "bank_transfer" | "corporate_credit" | "sayad_cheque" = "online_gateway";
        if (payload.paymentMethodId === "wallet") {
          unifiedMethod = "wallet";
        } else if (payload.paymentMethodId === "corporate_credit" || payload.paymentMethodId === "credit") {
          unifiedMethod = "corporate_credit";
        } else if (payload.paymentMethodId === "bank_transfer" || payload.paymentMethodId === "card_to_card" || payload.paymentMethodId === "bank_wire") {
          unifiedMethod = "bank_transfer";
        } else if (payload.paymentMethodId === "sayad_cheque" || payload.paymentMethodId === "cheque") {
          unifiedMethod = "sayad_cheque";
        }

        const paymentRes = await paymentApi.initiatePayment({
          targetType: "ORDER",
          targetId: targetOrderId,
          paymentMethod: unifiedMethod,
          amount: payableAmount,
          gatewayId: selectedGatewayId || undefined,
          bankAccountId: selectedBankAccountId || undefined,
          receiptNumber: receiptNumber?.trim() || undefined,
          receiptUrl: finalReceiptUrl || undefined,
          callbackUrl: typeof window !== "undefined" ? `${window.location.origin}/payment/callback` : undefined,
        });

        if (paymentRes?.paymentMethod === "online_gateway" && paymentRes?.paymentUrl) {
          try {
            sessionStorage.setItem(
              "velox_pending_checkout_order",
              JSON.stringify({
                order: result,
                orderNumber: result.orderNumber,
                payableAmount,
                timestamp: Date.now(),
              })
            );
          } catch {}

          let targetUrl = paymentRes.paymentUrl;
          if (targetUrl.startsWith("/")) {
            const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002")
              .replace(/\/api\/v1\/?$/, "")
              .replace(/\/$/, "");
            targetUrl = `${apiBase}${targetUrl}`;
          }
          window.location.href = targetUrl;
          return result;
        }

        // Offline / non-redirect payment methods (wallet, credit, wire transfer, cheque)
        clearCart();
        setCurrentStep("success");
        return result;
      } catch (paymentErr: any) {
        console.error("[Checkout] Payment initiation error:", paymentErr);
        const errorMsg =
          paymentErr?.response?.data?.message ||
          paymentErr?.message ||
          "خطا در ایجاد درخواست پرداخت. لطفاً مجدداً تلاش فرمایید.";
        setSubmitError(Array.isArray(errorMsg) ? errorMsg.join(" - ") : errorMsg);
        return null;
      }
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
    deliveryDate,
    deliveryDateJalali,
    deliveryTimeSlot,
    specialDeliveryNotes,
    liftRequired,
    paymentMethodId,
    selectedGatewayId,
    selectedBankAccountId,
    receiptNumber,
    receiptUrl,
    receiptFile,
    uploadReceiptFile,
    appliedCoupon,
    clearCart,
    availableDeliveryMethods,
    financials.payableTotal,
    partnerCode,
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
    deliveryDate,
    setDeliveryDate,
    deliveryDateJalali,
    setDeliveryDateJalali,
    deliveryTimeSlot,
    setDeliveryTimeSlot,
    specialDeliveryNotes,
    setSpecialDeliveryNotes,
    liftRequired,
    setLiftRequired,
    availableDeliveryMethods,
    isLoadingDeliveryMethods,
    deliveryMethodsError,
    availableScheduleDays,
    isLoadingSchedule,
    refreshShippingData: fetchShippingData,
    paymentMethodId,
    setPaymentMethodId,
    selectedGatewayId,
    setSelectedGatewayId,
    selectedBankAccountId,
    setSelectedBankAccountId,
    receiptFile,
    setReceiptFile,
    receiptUrl,
    setReceiptUrl,
    receiptNumber,
    setReceiptNumber,
    isUploadingReceipt,
    uploadReceiptFile,
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
