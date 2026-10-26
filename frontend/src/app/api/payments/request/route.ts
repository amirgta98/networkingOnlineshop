import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/features/payment/api/payment-utils";

const rawMerchant = process.env.ZARINPAL_MERCHANT_ID || "4ced0c52-2f31-11e7-9da8-000c295eb8fc";
const SANDBOX_MERCHANT_ID = rawMerchant.replace(/['"]/g, "").trim();
const IS_SANDBOX = process.env.ZARINPAL_SANDBOX !== "false";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      type = "ORDER",
      targetId = "",
      orderNumber = "",
      invoiceNumber = "",
      description = "",
      mobile = "",
    } = body;

    // Zarinpal v4 requires an integer amount of at least 1,000 Tomans
    const parsedAmount = Math.max(1000, Math.round(Number(amount)) || 10000);
    const trackingCode = `NET-PAY-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const baseUrl = getAppBaseUrl(req);

    // Encode metadata inside callback URL query so verification is completely stateless
    const callbackParams = new URLSearchParams({
      type,
      targetId: String(targetId),
      orderNumber: String(orderNumber),
      invoiceNumber: String(invoiceNumber),
      trackingCode,
      amount: String(parsedAmount),
    });

    const callbackUrl = `${baseUrl}/api/payments/verify?${callbackParams.toString()}`;

    const requestUrl = IS_SANDBOX
      ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
      : "https://payment.zarinpal.com/pg/v4/payment/request.json";

    const startPayBase = IS_SANDBOX
      ? "https://sandbox.zarinpal.com/pg/StartPay"
      : "https://payment.zarinpal.com/pg/StartPay";

    const desc =
      description ||
      (type === "WALLET"
        ? `شارژ آنلاین کیف پول کاربری - ${parsedAmount.toLocaleString("fa-IR")} تومان`
        : type === "INVOICE"
        ? `تسویه فاکتور ${invoiceNumber || targetId}`
        : `پرداخت سفارش تجهیزات شبکه ${orderNumber || targetId}`);

    const cleanMobile = mobile ? String(mobile).replace(/[^0-9+]/g, "") : undefined;

    const zarinpalPayload = {
      merchant_id: SANDBOX_MERCHANT_ID,
      amount: parsedAmount,
      currency: "IRT",
      description: desc,
      callback_url: callbackUrl,
      metadata: cleanMobile ? { mobile: cleanMobile } : undefined,
    };

    console.log("[ZarinPal Request] Sending request to ZarinPal Sandbox:", {
      merchant_id: SANDBOX_MERCHANT_ID,
      amount: parsedAmount,
      callbackUrl,
    });

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(zarinpalPayload),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    console.log("[ZarinPal Request] Response:", data);

    if (data?.data?.code === 100 || data?.data?.code === 101) {
      const authority = data.data.authority;
      const paymentUrl = `${startPayBase}/${authority}`;

      return NextResponse.json({
        success: true,
        authority,
        paymentUrl,
        trackingCode,
        amount: parsedAmount,
        orderNumber,
        invoiceNumber,
      });
    }

    const errorMsg =
      data?.errors?.message ||
      (typeof data?.errors === "string" ? data.errors : "خطا در برقراری ارتباط با درگاه تستی زرین‌پال");
    console.error("[ZarinPal Request] Error from ZarinPal:", errorMsg, data);

    return NextResponse.json(
      { success: false, error: errorMsg, details: data?.errors },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[ZarinPal Request] Exception:", err);
    return NextResponse.json(
      { success: false, error: err.message || "خطا در ایجاد درخواست پرداخت زرین‌پال" },
      { status: 500 }
    );
  }
}
