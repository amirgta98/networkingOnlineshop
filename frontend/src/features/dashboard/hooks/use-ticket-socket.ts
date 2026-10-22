"use client";

import * as React from "react";
import { io, Socket } from "socket.io-client";
import type { TicketMessage, TicketStatus, TicketPriority } from "../types/support.types";

interface UseTicketSocketOptions {
  ticketId: string;
  onNewMessage?: (message: TicketMessage) => void;
  onStatusChanged?: (status: TicketStatus, statusLabel?: string) => void;
  onPriorityChanged?: (priority: TicketPriority, priorityLabel?: string) => void;
  onDepartmentChanged?: (department: string, departmentLabel?: string) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
}

export function useTicketSocket({
  ticketId,
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
      if (!token) {
        // Fallback to mock session token in dev
        token = "mock_customer";
      }
    }

    const defaultUrl =
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
        ? window.location.origin
        : "http://localhost:3001";
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || defaultUrl;

    const socket = io(`${socketUrl}/tickets`, {
      auth: { token },
      query: { token },
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

    socket.on("ticket:new_message", (data: { ticketId: string; message: TicketMessage }) => {
      console.log("[WebSocket] Received new message:", data);
      if (data.ticketId === ticketId && data.message) {
        onNewMessageRef.current?.(data.message);
      }
    });

    socket.on("ticket:status_changed", (data: { ticketId: string; status: TicketStatus; statusLabel?: string }) => {
      if (data.ticketId === ticketId) {
        onStatusChangedRef.current?.(data.status, data.statusLabel);
      }
    });

    socket.on("ticket:priority_changed", (data: { ticketId: string; priority: TicketPriority; priorityLabel?: string }) => {
      if (data.ticketId === ticketId) {
        onPriorityChangedRef.current?.(data.priority, data.priorityLabel);
      }
    });

    socket.on("ticket:department_changed", (data: { ticketId: string; department: string; departmentLabel?: string }) => {
      if (data.ticketId === ticketId) {
        onDepartmentChangedRef.current?.(data.department, data.departmentLabel);
      }
    });

    socket.on("ticket:typing", (data: { ticketId: string; userId: string; isTyping: boolean }) => {
      if (data.ticketId === ticketId) {
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
  }, [ticketId]);

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
