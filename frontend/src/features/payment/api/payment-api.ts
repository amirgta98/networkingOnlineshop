import { apiClient } from "@/shared/lib/api-client";

export interface PaymentInitiatedResponse {
  authority: string;
  paymentUrl: string;
  trackingCode: string;
  amount: number;
  orderId?: string;
  orderNumber?: string;
  invoiceId?: string;
  invoiceNumber?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  trackingCode: string;
  refId?: string;
  cardPan?: string;
  type: string;
  targetId: string;
  orderNumber?: string;
  invoiceNumber?: string;
  amount: number;
  message: string;
}

export interface PaymentRequestOptions {
  amount?: number;
  orderNumber?: string;
  invoiceNumber?: string;
  phoneNumber?: string;
  description?: string;
  callbackUrl?: string;
}

export interface PaymentGatewayItem {
  id: string;
  name: string;
  provider: string;
  isSandbox: boolean;
  isDefault: boolean;
  description?: string;
}

export interface BankAccountItem {
  id: string;
  bankName: string;
  accountOwner: string;
  cardNumber: string;
  shebaNumber: string;
  accountNumber?: string;
  isActive: boolean;
  isDefault: boolean;
  displayOrder: number;
}

export interface PaymentSettingsItem {
  isSandboxMode: boolean;
  isWalletEnabled: boolean;
  isCardToCardEnabled: boolean;
  isChequeEnabled: boolean;
  isCorporateCreditEnabled: boolean;
  minWalletRecharge: number;
  maxWalletRecharge: number;
}

export interface UserWalletInfo {
  balance: number;
  lockedBalance: number;
  totalUsable: number;
}

export interface PaymentConfigResponse {
  gateways: PaymentGatewayItem[];
  bankAccounts: BankAccountItem[];
  settings: PaymentSettingsItem;
  userWallet: UserWalletInfo | null;
}

export interface InitiatePaymentRequest {
  targetType: "ORDER" | "INTERNET_ORDER" | "WALLET" | "INVOICE";
  targetId: string;
  paymentMethod: "online_gateway" | "wallet" | "card_to_card" | "bank_transfer" | "corporate_credit" | "sayad_cheque";
  amount?: number;
  gatewayId?: string;
  bankAccountId?: string;
  callbackUrl?: string;
  chequeNumber?: string;
  chequeSayadId?: string;
  chequeDueDate?: string;
  notes?: string;
  receiptNumber?: string;
  receiptUrl?: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  paymentMethod: string;
  status: string;
  authority?: string;
  paymentUrl?: string;
  trackingCode: string;
  amount: number;
  isSandbox?: boolean;
  message?: string;
  order?: any;
  bankAccount?: BankAccountItem;
  receiptNumber?: string;
  receiptUrl?: string;
}

export const paymentApi = {
  /**
   * Fetch public payment configuration: active gateways, bank accounts, enabled methods, user wallet
   */
  async getPaymentConfig(): Promise<PaymentConfigResponse> {
    try {
      const res = await apiClient.get<PaymentConfigResponse>("/payments/config");
      if (res && res.gateways) {
        return res;
      }
    } catch (err) {
      console.warn("Direct backend /payments/config call failed, returning defaults:", err);
    }

    return {
      gateways: [
        {
          id: "default-zarinpal",
          name: "درگاه پرداخت امن زرین‌پال شاپرک",
          provider: "zarinpal",
          isSandbox: true,
          isDefault: true,
          description: "درگاه پرداخت شاپرک زرین‌پال با پشتیبانی از کلیه کارت‌های عضو شتاب",
        },
      ],
      bankAccounts: [
        {
          id: "saman-default",
          bankName: "بانک سامان",
          accountOwner: "شرکت ققنوس عصر داده ورزان",
          cardNumber: "۶۲۱۹-۸۶۱۰-۴۳۲۱-۹۸۷۶",
          shebaNumber: "IR890560000000001234567890",
          accountNumber: "890-560-1234567-1",
          isActive: true,
          isDefault: true,
          displayOrder: 1,
        },
      ],
      settings: {
        isSandboxMode: true,
        isWalletEnabled: true,
        isCardToCardEnabled: true,
        isChequeEnabled: true,
        isCorporateCreditEnabled: true,
        minWalletRecharge: 10000,
        maxWalletRecharge: 500000000,
      },
      userWallet: null,
    };
  },

  /**
   * Unified payment initiation for Orders, Internet Orders, Wallet Recharges, Invoices
   */
  async initiatePayment(dto: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const res = await apiClient.post<InitiatePaymentResponse>("/payments/initiate", dto);
    return res;
  },

  /**
   * Upload bank transfer / card-to-card receipt file (image or PDF)
   */
  async uploadReceipt(file: File): Promise<{
    success: boolean;
    url: string;
    fileName: string;
    originalName: string;
    fileSize: number;
  }> {
    const formData = new FormData();
    formData.append("receipt", file);
    return apiClient.post<{
      success: boolean;
      url: string;
      fileName: string;
      originalName: string;
      fileSize: number;
    }>("/payments/upload-receipt", formData);
  },

  /**
   * Attach receipt to an existing order
   */
  async attachReceipt(orderId: string, receiptNumber?: string, receiptUrl?: string) {
    return apiClient.post<{
      success: boolean;
      message: string;
      orderNumber: string;
      paymentReceiptUrl?: string;
      paymentReceiptNumber?: string;
    }>("/payments/attach-receipt", {
      orderId,
      receiptNumber,
      receiptUrl,
    });
  },
  /**
   * Request online payment for an order via Zarinpal Sandbox
   */
  async requestOrderPayment(
    orderId: string,
    options?: PaymentRequestOptions
  ): Promise<PaymentInitiatedResponse> {
    try {
      const backendRes = await apiClient.post<PaymentInitiatedResponse>(`/payments/order/${orderId}/pay`, {
        callbackUrl: options?.callbackUrl,
      });
      if (backendRes?.paymentUrl) {
        return backendRes;
      }
    } catch (err) {
      console.warn("Direct backend order payment call failed, falling back to local route:", err);
    }

    const payload = {
      type: "ORDER",
      targetId: orderId,
      amount: options?.amount || 0,
      orderNumber: options?.orderNumber || orderId,
      mobile: options?.phoneNumber,
      description: options?.description || `پرداخت سفارش ${options?.orderNumber || orderId}`,
      callbackUrl: options?.callbackUrl,
    };

    const response = await fetch("/api/payments/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "خطا در برقراری ارتباط با درگاه زرین‌پال");
    }

    return {
      authority: data.authority,
      paymentUrl: data.paymentUrl,
      trackingCode: data.trackingCode,
      amount: data.amount,
      orderId,
      orderNumber: data.orderNumber || options?.orderNumber,
    };
  },

  /**
   * Request online recharge for user wallet via Zarinpal Sandbox
   */
  async requestWalletCharge(
    amount: number,
    options?: PaymentRequestOptions
  ): Promise<PaymentInitiatedResponse> {
    try {
      const backendRes = await apiClient.post<PaymentInitiatedResponse>("/payments/wallet/charge", {
        amount,
        callbackUrl: options?.callbackUrl,
      });
      if (backendRes?.paymentUrl) {
        return backendRes;
      }
    } catch (err) {
      console.warn("Direct backend wallet charge call failed, falling back to local route:", err);
    }

    const payload = {
      type: "WALLET",
      targetId: "wallet",
      amount,
      mobile: options?.phoneNumber,
      description: options?.description || `شارژ آنلاین کیف پول - ${amount.toLocaleString("fa-IR")} تومان`,
      callbackUrl: options?.callbackUrl,
    };

    const response = await fetch("/api/payments/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "خطا در درخواست شارژ کیف پول از زرین‌پال");
    }

    return {
      authority: data.authority,
      paymentUrl: data.paymentUrl,
      trackingCode: data.trackingCode,
      amount: data.amount,
    };
  },

  /**
   * Request online payment for an invoice via Zarinpal Sandbox
   */
  async requestInvoicePayment(
    invoiceId: string,
    options?: PaymentRequestOptions
  ): Promise<PaymentInitiatedResponse> {
    try {
      const backendRes = await apiClient.post<PaymentInitiatedResponse>(`/payments/invoice/${invoiceId}/pay`, {
        callbackUrl: options?.callbackUrl,
      });
      if (backendRes?.paymentUrl) {
        return backendRes;
      }
    } catch (err) {
      console.warn("Direct backend invoice payment call failed, falling back to local route:", err);
    }

    const payload = {
      type: "INVOICE",
      targetId: invoiceId,
      amount: options?.amount || 0,
      invoiceNumber: options?.invoiceNumber || invoiceId,
      mobile: options?.phoneNumber,
      description: options?.description || `تسویه فاکتور رسمی ${options?.invoiceNumber || invoiceId}`,
      callbackUrl: options?.callbackUrl,
    };

    const response = await fetch("/api/payments/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "خطا در تسویه فاکتور از طریق زرین‌پال");
    }

    return {
      authority: data.authority,
      paymentUrl: data.paymentUrl,
      trackingCode: data.trackingCode,
      amount: data.amount,
      invoiceId,
      invoiceNumber: data.invoiceNumber || options?.invoiceNumber,
    };
  },
};
