"use client";

import * as React from "react";
import { useAuth } from "@/features/auth";
import { ALL_DASHBOARD_PAGES } from "../data/dashboard-pages";
import { DashboardPagePlaceholder } from "./dashboard-page-placeholder";
import { OrdersView } from "./orders-view";
import { InvoicesView } from "./invoices-view";
import { WalletView } from "./wallet-view";
import { WishlistView } from "./wishlist-view";
import { AddressesView } from "./addresses-view";
import { RfqView } from "./rfq-view";
import { WarrantyView } from "./warranty-view";
import { SupportView } from "./support-view";
import { ProfileView } from "./profile-view";
import { SecurityView } from "./security-view";
import { ClubView } from "./club-view";
import { UpgradePartnerView } from "./upgrade-partner-view";
import type { DashboardPageKey } from "../types/dashboard.types";
import { notFound } from "next/navigation";

interface DashboardSectionPageProps {
  pageKey: DashboardPageKey;
}

export function DashboardSectionPage({ pageKey }: DashboardSectionPageProps) {
  const { user } = useAuth();
  const pageDef = ALL_DASHBOARD_PAGES.find((p) => p.id === pageKey);

  if (!pageDef) {
    notFound();
  }

  // Render the dedicated rich view if implemented
  switch (pageKey) {
    case "orders":
      return <OrdersView />;
    case "invoices":
      return <InvoicesView />;
    case "wallet":
      return <WalletView />;
    case "wishlist":
      return <WishlistView />;
    case "addresses":
      return <AddressesView />;
    case "rfq":
      return <RfqView />;
    case "warranty":
      return <WarrantyView />;
    case "support":
      return <SupportView />;
    case "profile":
      return <ProfileView />;
    case "security":
      return <SecurityView />;
    case "club":
      return <ClubView />;
    case "upgrade-partner":
      return <UpgradePartnerView />;
    default:
      return <DashboardPagePlaceholder page={pageDef} user={user} />;
  }
}
