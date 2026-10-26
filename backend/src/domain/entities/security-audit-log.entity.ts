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
  timestamp: string; // ISO 8601
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
