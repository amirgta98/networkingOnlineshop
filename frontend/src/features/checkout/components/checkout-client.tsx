"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { CheckoutProvider, useCheckout } from "../hooks/use-checkout";
import { useCart } from "@/features/cart";
import { CheckoutStepper } from "./checkout-stepper";
import { CheckoutShippingStep } from "./checkout-shipping-step";
import { CheckoutInvoiceStep } from "./checkout-invoice-step";
import { CheckoutDeliveryStep } from "./checkout-delivery-step";
import { CheckoutPaymentStep } from "./checkout-payment-step";
import { CheckoutOrderSummary } from "./checkout-order-summary";
import { CheckoutSuccessView } from "./checkout-success-view";
import { Button } from "@/shared/components/ui/button";

function CheckoutContent() {
  const { items } = useCart();
  const { currentStep, goToStep } = useCheckout();

  // If cart is completely empty and not on success view
  if (items.length === 0 && currentStep !== "success") {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-5" dir="rtl">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-500 shadow-xl">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-white">سبد خرید شما خالی است!</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          برای تکمیل فرآیند خرید، لطفاً ابتدا کالاهای مورد نیاز خود را به سبد خرید اضافه نمایید.
        </p>
        <Link href="/products" className="inline-block pt-2">
          <Button className="bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold h-11 px-6">
            <span>مشاهده لیست تجهیزات شبکه</span>
            <ArrowLeft className="h-4 w-4 mr-1.5 rtl:rotate-180" />
          </Button>
        </Link>
      </div>
    );
  }

  if (currentStep === "success") {
    return <CheckoutSuccessView />;
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Stepper ─────────────────────────────────────────────────── */}
      <CheckoutStepper currentStep={currentStep} onStepClick={goToStep} />

      {/* ── Two-Column Grid: Form Steps + Sidebar Summary ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Main Column: Step Content (8 cols) */}
        <div className="lg:col-span-8 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep === "shipping" && <CheckoutShippingStep />}
              {currentStep === "invoice" && <CheckoutInvoiceStep />}
              {currentStep === "delivery" && <CheckoutDeliveryStep />}
              {currentStep === "payment" && <CheckoutPaymentStep />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Sticky Summary Box (4 cols) */}
        <div className="lg:col-span-4 sticky top-20">
          <CheckoutOrderSummary />
        </div>
      </div>
    </div>
  );
}

export function CheckoutClient() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
