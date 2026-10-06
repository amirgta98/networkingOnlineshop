"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, FileCheck2, Truck, CreditCard, Check } from "lucide-react";
import { CheckoutStep } from "../types";
import { toPersianDigits } from "@/shared/lib/utils";

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
}

interface StepItem {
  id: CheckoutStep;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  {
    id: "shipping",
    label: "اطلاعات و آدرس ارسال",
    sublabel: "مشخصات تحویل‌گیرنده",
    icon: MapPin,
  },
  {
    id: "invoice",
    label: "نوع و صدور فاکتور",
    sublabel: "فاکتور رسمی یا عادی",
    icon: FileCheck2,
  },
  {
    id: "delivery",
    label: "شیوه و زمان ارسال",
    sublabel: "پیک، تیپاکس یا باربری",
    icon: Truck,
  },
  {
    id: "payment",
    label: "درگاه و پرداخت نهایی",
    sublabel: "بانک شتاب، اعتباری یا شبا",
    icon: CreditCard,
  },
];

const STEP_ORDER: CheckoutStep[] = ["shipping", "invoice", "delivery", "payment", "success"];

export function CheckoutStepper({ currentStep, onStepClick }: CheckoutStepperProps) {
  if (currentStep === "success") return null;

  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="w-full rounded-2xl border border-neutral-800 bg-[#111114]/90 p-4 sm:p-6 backdrop-blur-md shadow-xl mb-8">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress Background Track */}
        <div className="absolute top-1/2 right-12 left-12 -translate-y-1/2 h-1 bg-neutral-800 rounded-full -z-0" />

        {/* Active Animated Track */}
        <motion.div
          className="absolute top-1/2 right-12 -translate-y-1/2 h-1 bg-gradient-to-l from-orange-500 to-amber-400 rounded-full -z-0"
          initial={{ width: "0%" }}
          animate={{
            width: `${Math.max(0, Math.min(100, (currentIdx / (STEPS.length - 1)) * 88))}%`,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentIdx > idx;
          const isActive = currentIdx === idx;
          const isPending = currentIdx < idx;
          const isClickable = isDone && onStepClick;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10 select-none"
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id)}
                className={`group flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                  isDone
                    ? "border-emerald-500 bg-emerald-950/80 text-emerald-400 cursor-pointer shadow-lg shadow-emerald-950/40 hover:scale-105"
                    : isActive
                    ? "border-orange-500 bg-orange-950/90 text-orange-400 shadow-xl shadow-orange-950/60 ring-4 ring-orange-500/20 scale-110"
                    : "border-neutral-800 bg-[#18181c] text-neutral-500"
                }`}
              >
                {isDone ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </button>

              <div className="mt-3 text-center">
                <span
                  className={`text-xs font-bold block transition-colors ${
                    isActive
                      ? "text-white"
                      : isDone
                      ? "text-emerald-400"
                      : "text-neutral-400"
                  }`}
                >
                  {toPersianDigits(idx + 1)}. {step.label}
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5 block">
                  {step.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="flex md:hidden flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">مراحل تکمیل خرید:</span>
          <span className="text-orange-400 font-bold bg-orange-950/60 border border-orange-800/60 px-2.5 py-0.5 rounded-full">
            گام {toPersianDigits(currentIdx + 1)} از {toPersianDigits(STEPS.length)}
          </span>
        </div>

        {/* Mobile Mini Bar */}
        <div className="flex items-center gap-2">
          {STEPS.map((step, idx) => {
            const isDone = currentIdx > idx;
            const isActive = currentIdx === idx;
            return (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  isDone
                    ? "bg-emerald-500 shadow-xs shadow-emerald-500/40"
                    : isActive
                    ? "bg-gradient-to-r from-orange-500 to-amber-400 shadow-md shadow-orange-500/30"
                    : "bg-neutral-800"
                }`}
              />
            );
          })}
        </div>

        {/* Current Active Step Title */}
        <div className="flex items-center gap-2 pt-1">
          {(() => {
            const currentItem = STEPS[currentIdx] || STEPS[0];
            const Icon = currentItem.icon;
            return (
              <>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {currentItem.label}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {currentItem.sublabel}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
