"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { adminSecurityApi } from "../api/admin-security-api";
import type {
  SecurityOverviewDto,
  SecurityTelemetryPayload,
  SecurityAuditLog,
  ActiveAdminSessionDto,
  WafSecurityStatus,
} from "../types/admin-security.types";

export type ConnectionStatus = "connected" | "connecting" | "polling" | "disconnected";

export function useSecurityStream() {
  const [overview, setOverview] = useState<SecurityOverviewDto | null>(null);
  const [telemetry, setTelemetry] = useState<SecurityTelemetryPayload | null>(null);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [sessions, setSessions] = useState<ActiveAdminSessionDto[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [pingMs, setPingMs] = useState<number>(2.4);
  const [isStreamPaused, setIsStreamPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRevokedAlert, setLastRevokedAlert] = useState<{ message: string; timestamp: number } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const isStreamPausedRef = useRef<boolean>(false);
  isStreamPausedRef.current = isStreamPaused;

  const getSocketBaseUrl = (): string => {
    if (typeof window === "undefined") return "http://localhost:3001";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && apiUrl.startsWith("http")) {
      try {
        const parsed = new URL(apiUrl);
        return `${parsed.protocol}//${parsed.host}`;
      } catch {
        return window.location.origin;
      }
    }
    return window.location.origin;
  };

  // Initial load via REST API for immediate instant render
  const fetchInitialData = useCallback(async () => {
    try {
      const [overviewData, telemetryData, logsData, sessionsData] = await Promise.all([
        adminSecurityApi.getOverview().catch(() => null),
        adminSecurityApi.getTelemetry().catch(() => null),
        adminSecurityApi.getAuditLogs({ limit: 40 }).catch(() => []),
        adminSecurityApi.getActiveSessions().catch(() => []),
      ]);

      if (overviewData) setOverview(overviewData);
      if (telemetryData) setTelemetry(telemetryData);
      if (logsData && logsData.length > 0) setAuditLogs(logsData);
      if (sessionsData && sessionsData.length > 0) setSessions(sessionsData);
    } catch (err) {
      console.warn("Initial security data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await fetchInitialData();
  }, [fetchInitialData]);

  // Socket.IO lifecycle & Fallback Polling
  useEffect(() => {
    fetchInitialData();

    const baseUrl = getSocketBaseUrl();
    let socket: Socket | null = null;
    let fallbackPollInterval: NodeJS.Timeout | null = null;
    let pingInterval: NodeJS.Timeout | null = null;

    try {
      socket = io(`${baseUrl}/security`, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 5000,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setConnectionStatus("connected");
        // Clear fallback polling if active
        if (fallbackPollInterval) {
          clearInterval(fallbackPollInterval);
          fallbackPollInterval = null;
        }
      });

      socket.on("disconnect", () => {
        setConnectionStatus("polling");
        // Start polling fallback if disconnected
        if (!fallbackPollInterval) {
          fallbackPollInterval = setInterval(async () => {
            try {
              const tel = await adminSecurityApi.getTelemetry();
              setTelemetry(tel);
            } catch {
              // Ignore silent polling error
            }
          }, 3500);
        }
      });

      socket.on("connect_error", () => {
        setConnectionStatus("polling");
        if (!fallbackPollInterval) {
          fallbackPollInterval = setInterval(async () => {
            try {
              const tel = await adminSecurityApi.getTelemetry();
              setTelemetry(tel);
            } catch {
              // Ignore silent polling error
            }
          }, 3500);
        }
      });

      // Stream handlers
      socket.on("security:telemetry", (data: SecurityTelemetryPayload) => {
        setTelemetry(data);
        setOverview((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            currentUplinksThroughputGbps: Number(
              data.uplinks.reduce((sum, u) => sum + u.currentThroughputGbps, 0).toFixed(1),
            ),
            databasePingLatencyMs: data.databaseTelemetry.pingLatencyMs,
            databaseStatus: data.databaseTelemetry.status,
            lastUpdated: data.timestamp,
          };
        });
      });

      socket.on("security:initial_logs", (initialLogs: SecurityAuditLog[]) => {
        setAuditLogs(initialLogs);
      });

      socket.on("security:audit_log", (newLog: SecurityAuditLog) => {
        if (!isStreamPausedRef.current) {
          setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
        }
      });

      socket.on("security:session_revoked", (payload: { sessionId: string; revokedBy: string }) => {
        setSessions((prev) => prev.filter((s) => s.id !== payload.sessionId));
        setLastRevokedAlert({
          message: `نشست ${payload.sessionId} با موفقیت ابطال شد.`,
          timestamp: Date.now(),
        });
      });

      socket.on(
        "security:emergency_logout",
        (payload: { triggeredBy: string; revokedCount: number; reason?: string }) => {
          setSessions([]);
          setLastRevokedAlert({
            message: `فرمان خروج اضطراری صادر شد. ${payload.revokedCount} نشست فعال باطل گردیدند.`,
            timestamp: Date.now(),
          });
        },
      );

      socket.on("security:waf_changed", (wafStatus: WafSecurityStatus) => {
        setOverview((prev) => (prev ? { ...prev, wafStatus, threatLevel: wafStatus.threatLevel } : null));
        setTelemetry((prev) => (prev ? { ...prev, wafStatus } : null));
      });

      // Ping measurement loop
      pingInterval = setInterval(() => {
        if (socket?.connected) {
          const start = performance.now();
          socket.emit("security:ping", { clientTime: Date.now() }, () => {
            const rtt = Math.max(1, Number((performance.now() - start).toFixed(1)));
            setPingMs(rtt);
          });
        }
      }, 4000);
    } catch (err) {
      console.warn("Socket.io init exception, switching to polling", err);
      setConnectionStatus("polling");
    }

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      if (fallbackPollInterval) clearInterval(fallbackPollInterval);
      if (socket) socket.disconnect();
    };
  }, [fetchInitialData]);

  // Action methods
  const revokeSession = async (sessionId: string) => {
    const res = await adminSecurityApi.revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    // Also refresh overview to decrement count
    setOverview((prev) => (prev ? { ...prev, activeSessionsCount: Math.max(0, prev.activeSessionsCount - 1) } : null));
    return res;
  };

  const emergencyKill = async (options: {
    excludeCurrentSession?: boolean;
    currentSessionId?: string;
    reason?: string;
  }) => {
    const res = await adminSecurityApi.emergencyKillSessions(options);
    if (options.excludeCurrentSession && options.currentSessionId) {
      setSessions((prev) => prev.filter((s) => s.id === options.currentSessionId));
      setOverview((prev) => (prev ? { ...prev, activeSessionsCount: 1 } : null));
    } else {
      setSessions([]);
      setOverview((prev) => (prev ? { ...prev, activeSessionsCount: 0 } : null));
    }
    return res;
  };

  const toggleUnderAttackMode = async (enabled: boolean) => {
    const newWaf = await adminSecurityApi.toggleUnderAttackMode(enabled);
    setOverview((prev) => (prev ? { ...prev, wafStatus: newWaf, threatLevel: newWaf.threatLevel } : null));
    setTelemetry((prev) => (prev ? { ...prev, wafStatus: newWaf } : null));
    return newWaf;
  };

  const blockIp = async (ip: string, reason?: string) => {
    return adminSecurityApi.blockIp(ip, reason);
  };

  const clearLogs = () => {
    setAuditLogs([]);
  };

  return {
    overview,
    telemetry,
    auditLogs,
    sessions,
    isLoading,
    connectionStatus,
    pingMs,
    isStreamPaused,
    setIsStreamPaused,
    lastRevokedAlert,
    refreshAll,
    revokeSession,
    emergencyKill,
    toggleUnderAttackMode,
    blockIp,
    clearLogs,
  };
}
