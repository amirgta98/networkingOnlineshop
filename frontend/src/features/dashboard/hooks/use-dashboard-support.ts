"use client";

import * as React from "react";
import type { SupportTicket, TicketDepartment, TicketPriority } from "../types/support.types";
import { supportApi } from "../api/support-api";

export function useDashboardSupport() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTickets = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supportApi.getMyTickets();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (err: any) {
      console.error("[useDashboardSupport] Failed to fetch tickets:", err);
      setError(err.message || "خطا در دریافت لیست تیکت‌ها از سرور");
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async (data: {
    subject: string;
    department: TicketDepartment;
    priority: TicketPriority;
    initialMessage: string;
    attachmentFileName?: string;
  }): Promise<SupportTicket> => {
    try {
      const newTicket = await supportApi.createTicket({
        subject: data.subject,
        department: data.department,
        priority: data.priority,
        initialMessage: data.initialMessage,
        attachmentFileName: data.attachmentFileName,
      });

      setTickets((prev) => [newTicket, ...prev]);
      return newTicket;
    } catch (err: any) {
      console.error("[useDashboardSupport] Failed to create ticket:", err);
      throw err;
    }
  };

  const replyTicket = async (ticketId: string, replyText: string) => {
    try {
      const newMsg = await supportApi.sendMessage(ticketId, { content: replyText });
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === ticketId) {
            return {
              ...t,
              status: "WAITING_USER",
              statusLabel: "در انتظار پاسخ کاربر",
              updatedAt: new Date().toISOString(),
              messages: [...(t.messages || []), newMsg],
            };
          }
          return t;
        })
      );
      return newMsg;
    } catch (err: any) {
      console.error("[useDashboardSupport] Failed to reply ticket:", err);
      throw err;
    }
  };

  const closeTicket = async (ticketId: string) => {
    // In user mode, close can be status update or note
    try {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: "CLOSED", statusLabel: "تیکت بسته شد" }
            : t
        )
      );
    } catch (e) {
      console.error("Failed to close ticket", e);
    }
  };

  return {
    tickets,
    isLoaded,
    isLoading,
    error,
    createTicket,
    replyTicket,
    closeTicket,
    refreshTickets: fetchTickets,
  };
}
