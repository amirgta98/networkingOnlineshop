"use client";

import * as React from "react";
import { SupportTicket, TicketDepartment, TicketPriority } from "../types/support.types";
import { INITIAL_TICKETS } from "../data/mock-support";

const TICKETS_KEY = "velox_dashboard_tickets_v1";

export function useDashboardSupport() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(TICKETS_KEY);
      if (stored) setTickets(JSON.parse(stored));
      else {
        setTickets(INITIAL_TICKETS);
        localStorage.setItem(TICKETS_KEY, JSON.stringify(INITIAL_TICKETS));
      }
    } catch {
      setTickets(INITIAL_TICKETS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    try {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save tickets", e);
    }
  };

  const createTicket = (data: {
    subject: string;
    department: TicketDepartment;
    priority: TicketPriority;
    initialMessage: string;
    attachmentFileName?: string;
  }) => {
    const depLabels: Record<TicketDepartment, string> = {
      cisco_switching: "دپارتمان سوئیچینگ و روترهای سازمانی (CCIE)",
      fiber_cabling: "کابل‌کشی ساختاریافته و فیبر نوری",
      billing_legal: "امور مالی و فاکتور رسمی مودیان",
      warranty_rma: "مرکز گارانتی طلایی و RMA",
    };

    const prioLabels: Record<TicketPriority, string> = {
      low: "کم",
      normal: "عادی",
      high: "بالا",
      critical_datacenter: "بحرانی دیتاسنتر (پاسخ آنی)",
    };

    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TCK-1403-${Math.floor(100 + Math.random() * 900)}`,
      subject: data.subject,
      department: data.department,
      departmentLabel: depLabels[data.department],
      priority: data.priority,
      priorityLabel: prioLabels[data.priority],
      status: "open",
      statusLabel: "در انتظار بررسی کارشناس ارشد",
      createdAt: "هم‌اکنون",
      updatedAt: "هم‌اکنون",
      assignedEngineer: {
        name: "مهندس شایان کاظمی",
        title: "مهندس ارشد زیرساخت ولوکس (CCIE)",
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: "عرفان رضایی",
          senderRole: "user",
          content: data.initialMessage,
          createdAt: "هم‌اکنون",
          attachments: data.attachmentFileName
            ? [{ name: data.attachmentFileName, size: "120 KB", type: "config" }]
            : undefined,
        },
      ],
    };

    const updated = [newTicket, ...tickets];
    saveTickets(updated);
    return newTicket;
  };

  const replyTicket = (ticketId: string, replyText: string) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: "waiting_user" as const,
          statusLabel: "در انتظار پاسخ کاربر",
          updatedAt: "هم‌اکنون",
          messages: [
            ...t.messages,
            {
              id: `msg-${Date.now()}`,
              senderName: "عرفان رضایی",
              senderRole: "user" as const,
              content: replyText,
              createdAt: "هم‌اکنون",
            },
          ],
        };
      }
      return t;
    });
    saveTickets(updated);
  };

  const closeTicket = (ticketId: string) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? { ...t, status: "closed" as const, statusLabel: "تیکت بسته شد" }
        : t
    );
    saveTickets(updated);
  };

  return {
    tickets,
    isLoaded,
    createTicket,
    replyTicket,
    closeTicket,
  };
}
