"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  FileText,
  Download,
  X,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  ChevronDown,
  RefreshCw,
  Image as ImageIcon,
  ShieldAlert,
  Headphones,
  User as UserIcon,
} from "lucide-react";
import { cn, toPersianDigits } from "@/shared/lib/utils";
import type { SupportTicket, TicketMessage, TicketStatus, TicketPriority, TicketDepartment } from "../../types/support.types";
import { useTicketSocket } from "../../hooks/use-ticket-socket";
import { supportApi } from "../../api/support-api";
import { adminSupportApi } from "@/features/admin/api/admin-support-api";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";

interface TicketChatProps {
  initialTicket: SupportTicket;
  role: "user" | "admin";
  onTicketUpdated?: (updated: SupportTicket) => void;
  backHref?: string;
}

export function TicketChat({ initialTicket, role, onTicketUpdated, backHref }: TicketChatProps) {
  const { isPartner } = useAuth();
  const [ticket, setTicket] = React.useState<SupportTicket>(initialTicket);
  const [messages, setMessages] = React.useState<TicketMessage[]>(initialTicket.messages || []);
  const [inputText, setInputText] = React.useState("");
  const [pendingFiles, setPendingFiles] = React.useState<File[]>([]);
  const [isSending, setIsSending] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = React.useState<string | null>(null);

  const messagesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const currentTicketIdRef = React.useRef(initialTicket.id);

  const isSameMessage = React.useCallback((a: TicketMessage, b: TicketMessage): boolean => {
    if (a.id && b.id && a.id.toLowerCase() === b.id.toLowerCase()) {
      return true;
    }
    if (
      a.clientMessageId &&
      b.clientMessageId &&
      a.clientMessageId.trim() &&
      b.clientMessageId.trim() &&
      a.clientMessageId.trim() === b.clientMessageId.trim()
    ) {
      return true;
    }
    return false;
  }, []);

  // Sync state with prop safely without wiping out real-time socket messages
  React.useEffect(() => {
    setTicket(initialTicket);
    if (initialTicket.id !== currentTicketIdRef.current) {
      currentTicketIdRef.current = initialTicket.id;
      setMessages(initialTicket.messages || []);
    } else if (initialTicket.messages?.length) {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id.toLowerCase()));
        const newFromProp = (initialTicket.messages || []).filter(
          (m) => !existingIds.has(m.id.toLowerCase())
        );
        if (newFromProp.length === 0) return prev;
        return [...prev, ...newFromProp];
      });
    }
  }, [initialTicket]);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const performScroll = () => {
      try {
        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
      } catch {
        container.scrollTop = container.scrollHeight;
      }
    };

    performScroll();
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        performScroll();
        setTimeout(performScroll, 60);
      });
    }
  }, []);

  // WebSocket Integration
  const { isConnected, connectionStatus, isPeerTyping, sendTyping } = useTicketSocket({
    ticketId: ticket.id,
    role,
    onNewMessage: (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => isSameMessage(m, newMsg))) {
          return prev;
        }
        return [...prev, newMsg];
      });
      scrollToBottom("smooth");
    },
    onStatusChanged: (newStatus, label) => {
      setTicket((prev) => ({
        ...prev,
        status: newStatus,
        statusLabel: label || newStatus,
      }));
    },
    onPriorityChanged: (newPriority, label) => {
      setTicket((prev) => ({
        ...prev,
        priority: newPriority,
        priorityLabel: label || newPriority,
      }));
    },
    onDepartmentChanged: (newDept, label) => {
      setTicket((prev) => ({
        ...prev,
        department: newDept as any,
        departmentLabel: label || newDept,
      }));
    },
  });

  // Initial and reactive container scroll to bottom without affecting window/viewport
  React.useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  React.useEffect(() => {
    scrollToBottom("smooth");
  }, [messages.length, scrollToBottom]);

  // Handle typing notification
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setPendingFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    if (!content && pendingFiles.length === 0) return;
    if (isSending) return;

    setIsSending(true);
    setSendError(null);
    sendTyping(false);

    try {
      let uploadedAttachments: any[] = [];
      if (pendingFiles.length > 0) {
        setIsUploading(true);
        if (role === "admin") {
          uploadedAttachments = await adminSupportApi.uploadAttachments(ticket.id, pendingFiles);
        } else {
          uploadedAttachments = await supportApi.uploadAttachments(ticket.id, pendingFiles);
        }
        setIsUploading(false);
      }

      const clientMsgId = `cmsg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let newMsg: TicketMessage;

      if (role === "admin") {
        newMsg = await adminSupportApi.sendMessage(ticket.id, {
          content: content || "فایل‌های پیوست ارسال شد.",
          clientMessageId: clientMsgId,
          attachments: uploadedAttachments,
        });
      } else {
        newMsg = await supportApi.sendMessage(ticket.id, {
          content: content || "فایل‌های پیوست ارسال شد.",
          clientMessageId: clientMsgId,
          attachments: uploadedAttachments,
        });
      }

      // Add to local messages if not already added by socket
      setMessages((prev) => {
        if (prev.some((m) => isSameMessage(m, newMsg))) return prev;
        return [...prev, newMsg];
      });

      setInputText("");
      setPendingFiles([]);
      scrollToBottom("smooth");
      setTimeout(() => {
        textareaRef.current?.focus({ preventScroll: true });
      }, 50);
    } catch (err: any) {
      setSendError(err.message || "خطا در ارسال پیام. لطفاً دوباره تلاش فرمایید.");
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Admin Actions
  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await adminSupportApi.updateStatus(ticket.id, newStatus);
      setTicket(updated);
      onTicketUpdated?.(updated);
    } catch (err: any) {
      alert("خطا در تغییر وضعیت: " + err.message);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      const updated = await adminSupportApi.updatePriority(ticket.id, newPriority);
      setTicket(updated);
      onTicketUpdated?.(updated);
    } catch (err: any) {
      alert("خطا در تغییر اولویت: " + err.message);
    }
  };

  const handleDepartmentChange = async (newDept: string) => {
    try {
      const updated = await adminSupportApi.updateDepartment(ticket.id, newDept);
      setTicket(updated);
      onTicketUpdated?.(updated);
    } catch (err: any) {
      alert("خطا در تغییر دپارتمان: " + err.message);
    }
  };

  const isClosed = ticket.status === "CLOSED" || ticket.status === "closed";

  const priorityBadges: Record<string, { label: string; bg: string; text: string }> = {
    LOW: { label: "کم", bg: "bg-neutral-800", text: "text-neutral-300" },
    NORMAL: { label: "عادی", bg: "bg-blue-500/10", text: "text-blue-400" },
    HIGH: { label: "بالا", bg: "bg-amber-500/10", text: "text-amber-400" },
    CRITICAL: { label: "بحرانی دیتاسنتر", bg: "bg-rose-500/10", text: "text-rose-400" },
    low: { label: "کم", bg: "bg-neutral-800", text: "text-neutral-300" },
    normal: { label: "عادی", bg: "bg-blue-500/10", text: "text-blue-400" },
    high: { label: "بالا", bg: "bg-amber-500/10", text: "text-amber-400" },
    critical_datacenter: { label: "بحرانی دیتاسنتر", bg: "bg-rose-500/10", text: "text-rose-400" },
  };

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    OPEN: { label: "در انتظار بررسی", bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400" },
    ANSWERED: { label: "پاسخ داده شد", bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
    WAITING_USER: { label: "در انتظار پاسخ شما", bg: "bg-sky-500/15 border-sky-500/30", text: "text-sky-400" },
    RESOLVED: { label: "حل شده", bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
    CLOSED: { label: "بسته شده", bg: "bg-neutral-800 border-neutral-700", text: "text-neutral-400" },
    open: { label: "در انتظار بررسی", bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400" },
    answered: { label: "پاسخ داده شد", bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
    waiting_user: { label: "در انتظار پاسخ شما", bg: "bg-sky-500/15 border-sky-500/30", text: "text-sky-400" },
    resolved: { label: "حل شده", bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400" },
    closed: { label: "بسته شده", bg: "bg-neutral-800 border-neutral-700", text: "text-neutral-400" },
  };

  const defaultBack = role === "admin"
    ? "/admin/support"
    : isPartner
    ? "/partner/support"
    : "/dashboard/support";

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] max-h-[850px] rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] shadow-2xl overflow-hidden text-right" dir="rtl">
      {/* ─── 1. Telegram-Style Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-[var(--theme-border-color)] bg-neutral-900/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={backHref || defaultBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="بازگشت به لیست تیکت‌ها"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-orange-400">
                {ticket.ticketNumber}
              </span>
              <span className="text-neutral-700">•</span>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {ticket.subject}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
              <span>دپارتمان: <strong className="text-neutral-300">{ticket.departmentLabel}</strong></span>
              {ticket.userName && (
                <>
                  <span className="text-neutral-700">•</span>
                  <span>کاربر: <strong className="text-sky-400">{ticket.userName}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Badges & Status Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
          {/* Connection status indicator */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border",
              connectionStatus === "connected"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : connectionStatus === "connecting"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                : "bg-rose-500/10 text-rose-400 border-rose-500/30"
            )}
            title={connectionStatus === "connected" ? "ارتباط زنده WebSocket برقرار است" : "در حال تلاش برای برقراری اتصال..."}
          >
            {connectionStatus === "connected" ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Real-Time</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>ارتباط مجدد...</span>
              </>
            )}
          </div>

          {/* User view of badges */}
          {role !== "admin" ? (
            <>
              <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold border", priorityBadges[ticket.priority]?.bg, priorityBadges[ticket.priority]?.text)}>
                {priorityBadges[ticket.priority]?.label || ticket.priorityLabel}
              </span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold border", statusBadges[ticket.status]?.bg, statusBadges[ticket.status]?.text)}>
                {statusBadges[ticket.status]?.label || ticket.statusLabel}
              </span>
            </>
          ) : (
            /* Admin controls for status and priority */
            <div className="flex items-center gap-1.5">
              <select
                value={ticket.priority.toUpperCase()}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="h-8 px-2 rounded-lg bg-neutral-800 border border-neutral-700 text-[11px] text-neutral-200 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="LOW">اولویت کم</option>
                <option value="NORMAL">اولویت عادی</option>
                <option value="HIGH">اولویت بالا</option>
                <option value="CRITICAL">بحرانی دیتاسنتر</option>
              </select>

              <select
                value={ticket.status.toUpperCase()}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-8 px-2 rounded-lg bg-neutral-800 border border-neutral-700 text-[11px] text-neutral-200 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="OPEN">در انتظار بررسی</option>
                <option value="ANSWERED">پاسخ داده شد</option>
                <option value="WAITING_USER">در انتظار پاسخ کاربر</option>
                <option value="RESOLVED">حل شده</option>
                <option value="CLOSED">بسته شده</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ─── 2. Telegram-Style Conversation Area ─── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-neutral-950/40 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px]"
      >
        {/* Ticket Start Banner */}
        <div className="flex justify-center my-2">
          <div className="px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2 shadow-xs">
            <Clock className="h-3 w-3 text-orange-400" />
            <span>
              تیکت در تاریخ {toPersianDigits(new Date(ticket.createdAt).toLocaleDateString("fa-IR"))} ایجاد شد.
            </span>
          </div>
        </div>

        {/* Message Thread */}
        {messages.map((msg, index) => {
          const isSenderUser = msg.senderRole === "user";
          const isSystem = msg.isSystemMessage || msg.senderRole === "system";

          if (isSystem) {
            return (
              <div key={msg.id || index} className="flex justify-center my-2">
                <div className="px-3.5 py-1 rounded-full bg-neutral-900/80 border border-neutral-800/80 text-[11px] text-neutral-400">
                  {msg.content}
                </div>
              </div>
            );
          }

          // In Telegram web, incoming is left or right based on role
          // If viewing as user: user is "Me" (sent), admin is "Them" (received)
          // If viewing as admin: admin is "Me" (sent), user is "Them" (received)
          const isMyMessage = (role === "user" && isSenderUser) || (role === "admin" && !isSenderUser);

          return (
            <div
              key={msg.id || index}
              className={cn("flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]", isMyMessage ? "mr-auto items-start" : "ml-auto items-end")}
            >
              <div
                className={cn(
                  "p-3.5 sm:p-4 rounded-3xl text-xs space-y-2 shadow-md relative transition-all",
                  isMyMessage
                    ? "bg-gradient-to-br from-orange-600/20 to-orange-500/10 border border-orange-500/30 text-white rounded-br-none"
                    : "bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-bl-none"
                )}
              >
                {/* Sender Title */}
                <div className="flex items-center justify-between gap-3 text-[10px] pb-1 border-b border-white/5 font-bold">
                  <div className="flex items-center gap-1.5">
                    {isSenderUser ? (
                      <span className="flex items-center gap-1 text-sky-400">
                        <UserIcon className="h-3 w-3" />
                        {msg.senderName || "کاربر"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-400">
                        <Headphones className="h-3 w-3" />
                        {msg.senderName || "پشتیبان ارشد ققنوس"}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {toPersianDigits(new Date(msg.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }))}
                  </span>
                </div>

                {/* Message Body */}
                <div className="leading-relaxed whitespace-pre-wrap break-words text-neutral-100 text-[13px]">
                  {msg.content}
                </div>

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                    {msg.attachments.map((att, attIdx) => {
                      const isImage = att.mimeType?.startsWith("image/") || att.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                      return isImage ? (
                        <div key={attIdx} className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950/80 max-w-sm cursor-pointer group relative">
                          <img
                            src={att.url}
                            alt={att.fileName || "پیوست"}
                            className="max-h-56 w-full object-cover group-hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImagePreview(att.url || null)}
                          />
                          <div className="p-2 flex items-center justify-between text-[11px] bg-neutral-950/90">
                            <span className="truncate max-w-[200px] text-neutral-300 font-mono">{att.fileName}</span>
                            <a
                              href={att.url}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg hover:bg-neutral-800 text-orange-400"
                              title="دانلود تصویر"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={attIdx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-orange-400 shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="font-mono text-neutral-200 truncate max-w-[180px] sm:max-w-xs text-[11px]">
                                {att.fileName}
                              </span>
                              {att.fileSize && (
                                <span className="text-[10px] text-neutral-500 font-mono">
                                  {(att.fileSize / 1024).toFixed(1)} KB
                                </span>
                              )}
                            </div>
                          </div>

                          <a
                            href={att.url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-orange-400 text-[11px] font-bold shrink-0 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>دانلود</span>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Status indicator on sent message */}
                {isMyMessage && (
                  <div className="flex justify-end pt-0.5">
                    <CheckCheck className="h-3.5 w-3.5 text-orange-400" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Peer Typing Indicator */}
        {isPeerTyping && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 p-2.5 rounded-2xl bg-neutral-900/60 max-w-xs animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-ping" />
            <span>{role === "user" ? "کارشناس در حال تایپ است..." : "کاربر در حال تایپ است..."}</span>
          </div>
        )}
      </div>

      {/* ─── 3. Pending Attachments Preview ─── */}
      {pendingFiles.length > 0 && (
        <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 flex flex-wrap gap-2 shrink-0">
          {pendingFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-200">
              <span className="truncate max-w-[150px] font-mono text-[11px]">{f.name}</span>
              <button
                type="button"
                onClick={() => removePendingFile(i)}
                className="text-neutral-400 hover:text-rose-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── 4. Telegram-Style Input Bar ─── */}
      {isClosed ? (
        <div className="p-4 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between gap-4 text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد.</span>
          </div>
          {role === "admin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("OPEN")}
              className="text-xs font-bold border-neutral-700 hover:bg-neutral-800 text-emerald-400 cursor-pointer"
            >
              بازگشایی مجدد تیکت
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-neutral-900/70 border-t border-[var(--theme-border-color)] shrink-0">
          {sendError && (
            <div className="p-2 mb-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {sendError}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.xlsx,.xls,.doc,.docx,.txt,.log,.png,.jpg,.jpeg,.zip,.rar"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-orange-400 transition-all cursor-pointer"
              title="پیوست فایل یا تصویر"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Expanding Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="پیام خود را بنویسید... (Enter برای ارسال، Shift+Enter برای خط جدید)"
                className="w-full resize-none min-h-[42px] max-h-32 px-4 py-2.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 transition-all placeholder:text-neutral-500"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isSending || isUploading || (!inputText.trim() && pendingFiles.length === 0)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 text-white shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
              title="ارسال پیام"
            >
              {isSending || isUploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 -rotate-90" />
              )}
            </button>
          </div>
        </form>
      )}

      {/* ─── 5. Image Lightbox Modal ─── */}
      {selectedImagePreview && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
          onClick={() => setSelectedImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImagePreview}
              alt="پیش‌نمایش تصویر"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-neutral-800"
            />
            <button
              type="button"
              onClick={() => setSelectedImagePreview(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
