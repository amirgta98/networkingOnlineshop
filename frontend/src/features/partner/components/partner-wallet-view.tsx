"use client";

import * as React from "react";
import { WalletView } from "@/features/dashboard/components/wallet-view";

export function PartnerWalletView() {
  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <WalletView mode="partner" />
    </div>
  );
}
