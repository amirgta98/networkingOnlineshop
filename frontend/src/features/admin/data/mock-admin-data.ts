import type {
  AdminMetricData,
  AdminOrderSummary,
  AdminPartnerApplication,
  AdminRfqSummary,
  AdminStockAlert,
  AdminSecurityLogItem,
  AdminTelemetryInfo,
} from "../types/admin.types";

export const MOCK_ADMIN_METRICS: AdminMetricData[] = [];

export const MOCK_ADMIN_ORDERS: AdminOrderSummary[] = [];

export const MOCK_ADMIN_PARTNER_APPLICATIONS: AdminPartnerApplication[] = [];

export const MOCK_ADMIN_RFQ_ITEMS: AdminRfqSummary[] = [];

export const MOCK_ADMIN_STOCK_ALERTS: AdminStockAlert[] = [];

export const MOCK_ADMIN_TELEMETRY: AdminTelemetryInfo = {
  coreSwitchesOnline: 0,
  coreSwitchesTotal: 0,
  accessSwitchesOnline: 0,
  accessSwitchesTotal: 0,
  uplinkBandwidthGbps: "0",
  peakBandwidthGbps: "0",
  cpuLoadPercentage: 0,
  ramUsagePercentage: 0,
  uptimePercent: "۱۰۰٪",
  activeSessionsCount: 1,
};

export const MOCK_ADMIN_SECURITY_LOGS: AdminSecurityLogItem[] = [];
