import type { ReactNode } from "react";

export type AdminBadgeVariant = "default" | "success" | "warning" | "info" | "purple";

export interface AdminPageDefinition {
  id: string;
  title: string;
  shortDescription: string;
  category: "overview" | "commerce" | "partners" | "inventory" | "system";
  categoryLabel: string;
  iconName: string;
  href: string;
  badge?: string;
  badgeVariant?: AdminBadgeVariant;
}

export interface AdminMetricData {
  id: string;
  title: string;
  value: string;
  changeText: string;
  changePositive?: boolean;
  iconName: string;
  variant: "emerald" | "orange" | "sky" | "purple";
}

export interface AdminOrderSummary {
  id: string;
  trackingCode: string;
  customerName: string;
  customerType: "b2b" | "retail";
  companyName?: string;
  itemsCount: number;
  itemsSummary: string;
  totalAmount: number;
  status: "pending_financial" | "processing_warehouse" | "shipping" | "delivered";
  statusLabel: string;
  date: string;
  priority: "high" | "normal";
}

export interface AdminPartnerApplication {
  id: string;
  companyName: string;
  managerName: string;
  nationalCode: string;
  economicCode: string;
  requestedCreditLimit: number;
  submittedAt: string;
  documentsCount: number;
  status: "pending_review" | "approved" | "rejected";
}

export interface AdminRfqSummary {
  id: string;
  projectTitle: string;
  clientName: string;
  itemsCount: number;
  estimatedValue: number;
  deadlineHours: number;
  submittedDate: string;
  urgent: boolean;
}

export interface AdminStockAlert {
  id: string;
  sku: string;
  title: string;
  brand: string;
  currentStock: number;
  minThreshold: number;
  incomingShipmentDate?: string;
  severity: "critical" | "warning";
}

export interface AdminSecurityLogItem {
  id: string;
  timestamp: string;
  level: "success" | "warning" | "info";
  actor: string;
  action: string;
  ip: string;
  twoFactorUsed: boolean;
}

export interface AdminTelemetryInfo {
  coreSwitchesOnline: number;
  coreSwitchesTotal: number;
  accessSwitchesOnline: number;
  accessSwitchesTotal: number;
  uplinkBandwidthGbps: string;
  peakBandwidthGbps: string;
  cpuLoadPercentage: number;
  ramUsagePercentage: number;
  uptimePercent: string;
  activeSessionsCount: number;
}
