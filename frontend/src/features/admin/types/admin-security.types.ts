export type SecurityAuditCategory =
  | 'AUTH'
  | 'NETWORK'
  | 'FIREWALL'
  | 'SESSION'
  | 'DATABASE'
  | 'SYSTEM';

export type SecurityAuditLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  category: SecurityAuditCategory;
  level: SecurityAuditLevel;
  action: string;
  actor: string;
  actorId?: string;
  ip: string;
  location?: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface SwitchPortInfo {
  id: string;
  type: '100G-QSFP28' | '40G-QSFP+' | '25G-SFP28' | '10G-SFP+';
  status: 'UP' | 'DOWN' | 'WARNING' | 'DISABLED';
  vlan: number;
  speedGbps: number;
  rxGbps: number;
  txGbps: number;
  opticPowerDbm?: number;
  opticTempC?: number;
  connectedTo?: string;
}

export interface CoreSwitchTelemetry {
  id: string;
  name: string;
  model: string;
  rack: string;
  role: 'Spine' | 'Leaf' | 'Core' | 'Distribution';
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  uptime: string;
  temperatureC: number;
  fanRpm: number;
  psuStatus: string;
  backplaneCapacityTbps: number;
  throughputGbps: number;
  bufferUtilizationPercent: number;
  portsTotal: number;
  portsUp: number;
  portsWarning: number;
  ports: SwitchPortInfo[];
}

export interface NetworkUplinkTelemetry {
  id: string;
  name: string;
  provider: string;
  interfaceName: string;
  capacityGbps: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'STANDBY' | 'DOWN';
  currentThroughputGbps: number;
  rxThroughputGbps: number;
  txThroughputGbps: number;
  utilizationPercent: number;
  latencyMs: number;
  packetLossPercent: number;
  bgpState: 'Established' | 'Active' | 'Idle' | 'Connect';
  bgpAsn: number;
  receivedPrefixes: number;
  transceiver: {
    type: string;
    wavelength: string;
    rxDbm: number;
    txDbm: number;
    temperatureC: number;
  };
  history: Array<{ time: string; rx: number; tx: number }>;
}

export interface HostRuntimeTelemetry {
  nodeVersion: string;
  uptimeSeconds: number;
  cpuCount: number;
  cpuModel: string;
  cpuLoadAvg: number[];
  osTotalMemBytes: number;
  osFreeMemBytes: number;
  osUsedMemPercent: number;
  processHeapUsedBytes: number;
  processHeapTotalBytes: number;
  processRssBytes: number;
}

export interface ClusterNodeTelemetry {
  id: string;
  name: string;
  role: string;
  ip: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  cpuUsagePercent: number;
  ramUsagePercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  diskUsagePercent: number;
  iops: number;
  activeConnections?: number;
  uptime: string;
}

export interface DatabaseTelemetry {
  engine: string;
  pingLatencyMs: number;
  activeConnections: number;
  maxConnections: number;
  idleConnections: number;
  cacheHitRatioPercent: number;
  transactionsPerSecond: number;
  slowQueries24h: number;
  replicationLagMs: number;
  tableCount: number;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

export interface WafSecurityStatus {
  enabled: boolean;
  underAttackMode: boolean;
  blockedRequests24h: number;
  activeRulesCount: number;
  threatLevel: 'SECURE' | 'ELEVATED' | 'HIGH' | 'UNDER_ATTACK';
  ddosMitigationTier: string;
  blacklistedIpsCount: number;
}

export interface ActiveAdminSessionDto {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userRole: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  isRevoked: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

export interface SecurityOverviewDto {
  threatLevel: 'SECURE' | 'ELEVATED' | 'HIGH' | 'UNDER_ATTACK';
  activeSessionsCount: number;
  totalSwitchesCount: number;
  switchesOnlineCount: number;
  switchesAlertCount: number;
  totalUplinksCapacityGbps: number;
  currentUplinksThroughputGbps: number;
  averageUplinkLatencyMs: number;
  clusterNodesHealthyCount: number;
  clusterNodesTotalCount: number;
  averageCpuPercent: number;
  averageRamPercent: number;
  databasePingLatencyMs: number;
  databaseStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  blockedThreatsCount: number;
  wafStatus: WafSecurityStatus;
  lastUpdated: string;
}

export interface SecurityTelemetryPayload {
  timestamp: string;
  hostRuntime: HostRuntimeTelemetry;
  databaseTelemetry: DatabaseTelemetry;
  switches: CoreSwitchTelemetry[];
  uplinks: NetworkUplinkTelemetry[];
  clusterNodes: ClusterNodeTelemetry[];
  wafStatus: WafSecurityStatus;
}
