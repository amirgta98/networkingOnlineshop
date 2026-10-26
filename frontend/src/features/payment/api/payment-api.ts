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

export const paymentApi = {
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
