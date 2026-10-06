export interface ActiveSession {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface LoginLogEntry {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  location: string;
  status: "success" | "blocked" | "failed_pin";
  statusLabel: string;
}

export interface SecuritySettingsState {
  twoFactorEnabled: boolean;
  twoFactorPin?: string;
  hasPasswordSet: boolean;
  activeSessions: ActiveSession[];
  loginHistory: LoginLogEntry[];
}
