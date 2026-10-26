import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/features/payment/api/payment-utils";

const rawMerchant = process.env.ZARINPAL_MERCHANT_ID || "4ced0c52-2f31-11e7-9da8-000c295eb8fc";
const SANDBOX_MERCHANT_ID = rawMerchant.replace(/['"]/g, "").trim();
const IS_SANDBOX = process.env.ZARINPAL_SANDBOX !== "false";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const authority = url.searchParams.get("Authority") || url.searchParams.get("authority") || "";
  const status = url.searchParams.get("Status") || url.searchParams.get("status") || "";

  const type = url.searchParams.get("type") || "ORDER";
  const targetId = url.searchParams.get("targetId") || "";
  const orderNumber = url.searchParams.get("orderNumber") || "";
  const invoiceNumber = url.searchParams.get("invoiceNumber") || "";
  const trackingCode = url.searchParams.get("trackingCode") || `NET-PAY-${authority.slice(-6)}`;
  const amountStr = url.searchParams.get("amount") || "0";
  const amount = Math.max(1000, Math.round(Number(amountStr)) || 0);

  const origin = getAppBaseUrl(req);

  if (!authority) {
    return NextResponse.redirect(
      `${origin}/payment/callback?status=failed&message=${encodeURIComponent("شناسه تراکنش (Authority) یافت نشد.")}`
    );
  }

  // If user cancelled in gateway
  if (status.toUpperCase() !== "OK") {
    return NextResponse.redirect(
      `${origin}/payment/callback?status=failed&authority=${authority}&trackingCode=${trackingCode}&type=${type}&orderNumber=${orderNumber}&invoiceNumber=${invoiceNumber}&amount=${amount}&message=${encodeURIComponent("تراکنش پرداخت توسط کاربر در درگاه بانکی لغو گردید.")}`
    );
  }

  // Verify payment with ZarinPal API
  const verifyUrl = IS_SANDBOX
    ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
    : "https://payment.zarinpal.com/pg/v4/payment/verify.json";

  try {
    const payload = {
      merchant_id: SANDBOX_MERCHANT_ID,
      amount,
      authority,
    };

    console.log("[ZarinPal Verify] Verifying transaction:", payload);

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    console.log("[ZarinPal Verify] Result:", data);

    if (data?.data?.code === 100 || data?.data?.code === 101) {
      const refId = String(data.data.ref_id || Math.floor(10000000 + Math.random() * 90000000));
      const cardPan = data.data.card_pan || "۶۰۳۷-۹۹**-****-۵۵۲۱";

      // Also try to notify backend if backend server is running
      try {
        const backendBase = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:3001";
        await fetch(`${backendBase}/api/v1/payments/verify-direct`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authority,
            status: "OK",
            amount,
            type,
            targetId,
            trackingCode,
          }),
          signal: AbortSignal.timeout(2000),
        });
      } catch {
        // Backend notification is best-effort
      }

      const queryParams = new URLSearchParams({
        status: "success",
        authority,
        refId,
        cardPan,
        trackingCode,
        type,
        targetId,
        orderNumber,
        invoiceNumber,
        amount: String(amount),
        message: "پرداخت با موفقیت در درگاه تستی زرین‌پال تأیید و ثبت شد.",
      });

      return NextResponse.redirect(`${origin}/payment/callback?${queryParams.toString()}`);
    }

    const errorMsg = data?.errors?.message || "خطا در تأیید تراکنش در زرین‌پال";
    return NextResponse.redirect(
      `${origin}/payment/callback?status=failed&authority=${authority}&trackingCode=${trackingCode}&type=${type}&orderNumber=${orderNumber}&invoiceNumber=${invoiceNumber}&amount=${amount}&message=${encodeURIComponent(errorMsg)}`
    );
  } catch (err: any) {
    console.error("[ZarinPal Verify] Exception:", err);
    return NextResponse.redirect(
      `${origin}/payment/callback?status=failed&authority=${authority}&trackingCode=${trackingCode}&type=${type}&orderNumber=${orderNumber}&invoiceNumber=${invoiceNumber}&amount=${amount}&message=${encodeURIComponent("خطای شبکه در تأیید تراکنش زرین‌پال")}`
    );
  }
}
