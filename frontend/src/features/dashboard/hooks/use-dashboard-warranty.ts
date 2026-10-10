"use client";

import * as React from "react";
import { SerialVerificationResult, RmaRequest } from "../types/warranty.types";
import { MOCK_SERIAL_DATABASE, INITIAL_RMA_REQUESTS } from "../data/mock-warranty";

const RMA_STORAGE_KEY = "velox_dashboard_rma_v1";

export function useDashboardWarranty() {
  const [rmaRequests, setRmaRequests] = React.useState<RmaRequest[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RMA_STORAGE_KEY);
      if (stored) setRmaRequests(JSON.parse(stored));
      else {
        setRmaRequests(INITIAL_RMA_REQUESTS);
        localStorage.setItem(RMA_STORAGE_KEY, JSON.stringify(INITIAL_RMA_REQUESTS));
      }
    } catch {
      setRmaRequests(INITIAL_RMA_REQUESTS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveRma = (updated: RmaRequest[]) => {
    setRmaRequests(updated);
    try {
      localStorage.setItem(RMA_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save RMA requests", e);
    }
  };

  const verifySerialNumber = (serial: string): SerialVerificationResult | null => {
    const cleaned = serial.trim().toUpperCase();
    if (MOCK_SERIAL_DATABASE[cleaned]) {
      return MOCK_SERIAL_DATABASE[cleaned];
    }
    // Generated fallback if authentic format
    if (cleaned.length >= 6) {
      return {
        serialNumber: cleaned,
        productName: "تجهیزات شبکه ثبت شده در پایگاه ققنوس آکادمی",
        model: "GENERIC-NET-DEVICE",
        brand: "تجهیزات معتبر",
        warrantyType: "گارانتی رسمی ۲۴ ماهه ققنوس آکادمی",
        status: "active",
        statusLabel: "تحت پوشش گارانتی معتبر",
        startDate: "۱۴۰۳/۰۱/۰۱",
        endDate: "۱۴۰۵/۰۱/۰۱",
        daysRemaining: 420,
        isAuthentic: true,
        hologramCode: `VLX-GEN-${Math.floor(100000 + Math.random() * 900000)}`,
      };
    }
    return null;
  };

  const submitRma = (data: {
    serialNumber: string;
    productName: string;
    faultDescription: string;
    deliveryMethod: "courier" | "tipax" | "in_person";
  }) => {
    const newRma: RmaRequest = {
      id: `rma-${Date.now()}`,
      rmaNumber: `RMA-1403-${Math.floor(100 + Math.random() * 900)}`,
      serialNumber: data.serialNumber,
      productName: data.productName,
      faultDescription: data.faultDescription,
      deliveryMethod: data.deliveryMethod,
      createdAt: "هم‌اکنون",
      currentStage: "received",
      currentStageLabel: "درخواست ثبت شد - در انتظار ارسال کالا",
      timeline: [
        {
          stage: "received",
          title: "ثبت درخواست RMA",
          description: "درخواست عودت جهت بررسی در لابراتوار ثبت شد.",
          timestamp: "هم‌اکنون",
          isCompleted: true,
          isCurrent: true,
        },
        {
          stage: "lab_testing",
          title: "تست سخت‌افزاری در لابراتوار",
          description: "بررسی پورت‌ها، منبع تغذیه و لاجیک بورد.",
          isCompleted: false,
        },
        {
          stage: "replacement_approved",
          title: "تصمیم‌گیری خدمات (تعمیر یا تعویض نو)",
          description: "اعمال گارانتی طلایی تعویض درجا.",
          isCompleted: false,
        },
        {
          stage: "dispatched",
          title: "تحویل به مشتری",
          description: "ارسال قطعه نو با گواهی جدید.",
          isCompleted: false,
        },
      ],
    };

    const updated = [newRma, ...rmaRequests];
    saveRma(updated);
    return newRma;
  };

  return {
    rmaRequests,
    isLoaded,
    verifySerialNumber,
    submitRma,
  };
}
