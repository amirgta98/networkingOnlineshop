"use client";

import * as React from "react";
import { io, Socket } from "socket.io-client";
import type { TicketMessage, TicketStatus, TicketPriority } from "../types/support.types";

interface UseTicketSocketOptions {
  ticketId: string;
  role?: "user" | "admin";
  onNewMessage?: (message: TicketMessage) => void;
  onStatusChanged?: (status: TicketStatus, statusLabel?: string) => void;
  onPriorityChanged?: (priority: TicketPriority, priorityLabel?: string) => void;
  onDepartmentChanged?: (department: string, departmentLabel?: string) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
}

export function useTicketSocket({
  ticketId,
  role,
  onNewMessage,
  onStatusChanged,
  onPriorityChanged,
  onDepartmentChanged,
  onTyping,
}: UseTicketSocketOptions) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<"connected" | "connecting" | "disconnected">("connecting");
  const [isPeerTyping, setIsPeerTyping] = React.useState(false);
  const socketRef = React.useRef<Socket | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // References to callbacks to avoid socket re-subscription
  const onNewMessageRef = React.useRef(onNewMessage);
  const onStatusChangedRef = React.useRef(onStatusChanged);
  const onPriorityChangedRef = React.useRef(onPriorityChanged);
  const onDepartmentChangedRef = React.useRef(onDepartmentChanged);
  const onTypingRef = React.useRef(onTyping);

  React.useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onStatusChangedRef.current = onStatusChanged;
    onPriorityChangedRef.current = onPriorityChanged;
    onDepartmentChangedRef.current = onDepartmentChanged;
    onTypingRef.current = onTyping;
  });

  React.useEffect(() => {
    if (!ticketId) return;

    let token = "";
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("velox_auth_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed?.accessToken || parsed?.token || "";
        }
      } catch {
        // ignore
      }

      // Check cookie if token not found in localStorage
      if (!token && typeof document !== "undefined") {
        const match = document.cookie.match(/(?:velox_session_token|access_token)=([^;]+)/);
        if (match && match[1]) {
          token = decodeURIComponent(match[1].trim());
        }
      }

      if (!token) {
        // Fallback to role-specific token in dev
        token = role === "admin" ? "admin-token" : "mock_customer";
      }
    }

    let socketUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!socketUrl) {
      if (process.env.NEXT_PUBLIC_API_URL) {
        try {
          const parsed = new URL(process.env.NEXT_PUBLIC_API_URL);
          socketUrl = parsed.origin;
        } catch {
          socketUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/api(\/v\d+)?\/?$/, "");
        }
      } else if (typeof window !== "undefined") {
        const isLocalhost =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname === "[::1]";
        socketUrl = isLocalhost ? "http://localhost:3001" : `${window.location.protocol}//${window.location.hostname}:3001`;
      } else {
        socketUrl = "http://localhost:3001";
      }
    }

    const socket = io(`${socketUrl}/tickets`, {
      auth: { token, role },
      query: { token, role },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      // Join room for this ticket
      socket.emit("ticket:join", { ticketId });
    });

    socket.on("ticket:joined", (data: any) => {
      console.log("[WebSocket] Joined ticket room:", data);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[WebSocket] Disconnected:", reason);
      setIsConnected(false);
      setConnectionStatus("disconnected");
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("connect_error", (err) => {
      console.error("[WebSocket] Connection error:", err.message);
      setIsConnected(false);
      setConnectionStatus("connecting");
    });

    socket.on("exception", (err: any) => {
      console.error("[WebSocket] Gateway exception:", err);
    });

    socket.on("error", (err: any) => {
      console.error("[WebSocket] Error event:", err);
    });

    const matchesTicket = (id?: string) =>
      !id || id.trim().toLowerCase() === ticketId.trim().toLowerCase();

    socket.on("ticket:new_message", (data: any) => {
      console.log("[WebSocket] Received new message payload:", data);
      const msg: TicketMessage | null = data?.message || (data?.id ? data : null);
      const targetTicketId = data?.ticketId || msg?.ticketId;
      if (msg && matchesTicket(targetTicketId)) {
        onNewMessageRef.current?.(msg);
      }
    });

    socket.on("ticket:status_changed", (data: { ticketId: string; status: TicketStatus; statusLabel?: string }) => {
      if (matchesTicket(data?.ticketId)) {
        onStatusChangedRef.current?.(data.status, data.statusLabel);
      }
    });

    socket.on("ticket:priority_changed", (data: { ticketId: string; priority: TicketPriority; priorityLabel?: string }) => {
      if (matchesTicket(data?.ticketId)) {
        onPriorityChangedRef.current?.(data.priority, data.priorityLabel);
      }
    });

    socket.on("ticket:department_changed", (data: { ticketId: string; department: string; departmentLabel?: string }) => {
      if (matchesTicket(data?.ticketId)) {
        onDepartmentChangedRef.current?.(data.department, data.departmentLabel);
      }
    });

    socket.on("ticket:typing", (data: { ticketId: string; userId: string; isTyping: boolean }) => {
      if (matchesTicket(data?.ticketId)) {
        setIsPeerTyping(data.isTyping);
        onTypingRef.current?.(data.userId, data.isTyping);

        if (data.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsPeerTyping(false);
          }, 3000);
        }
      }
    });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("ticket:leave", { ticketId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [ticketId, role]);

  const sendTyping = React.useCallback(
    (isTyping: boolean) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("ticket:typing", { ticketId, isTyping });
      }
    },
    [ticketId, isConnected]
  );

  const sendMessageViaSocket = React.useCallback(
    (content: string, clientMessageId?: string, attachments?: any[]) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("ticket:send_message", {
          ticketId,
          content,
          clientMessageId,
          attachments,
        });
      }
    },
    [ticketId, isConnected]
  );

  return {
    isConnected,
    connectionStatus,
    isPeerTyping,
    sendTyping,
    sendMessageViaSocket,
  };
}
