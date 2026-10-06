"use client";

import * as React from "react";
import {
  Headphones,
  Plus,
  Clock,
  CheckCircle2,
  MessageSquare,
  Send,
  Paperclip,
  User,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useDashboardSupport } from "../hooks/use-dashboard-support";
import { SupportTicket, TicketDepartment, TicketPriority, TicketStatus } from "../types/support.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardFilterBar,
  DashboardStatusBadge,
  DashboardEmptyState,
  DashboardModal,
  FileUploadBox,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

export function SupportView() {
  const { tickets, isLoaded, createTicket, replyTicket, closeTicket } = useDashboardSupport();

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // New Ticket State
  const [isNewTicketOpen, setIsNewTicketOpen] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [department, setDepartment] = React.useState<TicketDepartment>("cisco_switching");
  const [priority, setPriority] = React.useState<TicketPriority>("normal");
  const [message, setMessage] = React.useState("");
  const [attachmentName, setAttachmentName] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Conversation Modal State
  const [activeConversationTicket, setActiveConversationTicket] = React.useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = React.useState("");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!subject.trim()) {
      setFormError("موضوع تیکت الزامی است.");
      return;
    }
    if (!message.trim()) {
      setFormError("شرح سوال یا مشکل فنی را بنویسید.");
      return;
    }

    createTicket({
      subject,
      department,
      priority,
      initialMessage: message,
      attachmentFileName: attachmentName || undefined,
    });

    setIsNewTicketOpen(false);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversationTicket) return;

    replyTicket(activeConversationTicket.id, replyText);
    setReplyText("");
    // Refresh modal ticket
    const updated = tickets.find((t) => t.id === activeConversationTicket.id);
    if (updated) setActiveConversationTicket(updated);
  };

  // Keep active conversation ticket updated
  React.useEffect(() => {
    if (activeConversationTicket) {
      const refreshed = tickets.find((t) => t.id === activeConversationTicket.id);
      if (refreshed) setActiveConversationTicket(refreshed);
    }
  }, [tickets, activeConversationTicket]);

  // Filtered tickets
  const filteredTickets = React.useMemo(() => {
    return tickets.filter((t) => {
      if (activeTab === "open" && t.status !== "open" && t.status !== "answered") return false;
      if (activeTab === "resolved" && t.status !== "resolved" && t.status !== "closed") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = t.ticketNumber.toLowerCase().includes(q);
        const matchSub = t.subject.toLowerCase().includes(q);
        if (!matchNum && !matchSub) return false;
      }
      return true;
    });
  }, [tickets, activeTab, searchQuery]);

  // Statistics
  const stats = React.useMemo(() => {
    const activeCount = tickets.filter((t) => t.status === "open" || t.status === "answered").length;
    const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
    return { activeCount, resolvedCount };
  }, [tickets]);

  const priorityBadgeVariant: Record<TicketPriority, "danger" | "warning" | "neutral" | "purple"> = {
    critical_datacenter: "danger",
    high: "warning",
    normal: "neutral",
    low: "neutral",
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="تیکت‌ها و پشتیبانی مهندسی شبکه"
        description="ارتباط مستقیم با مهندسان ارشد CCIE/MTCNA جهت رفع عیب توپولوژی، کانفیگ سوئیچ و روتر و استعلامات فنی"
        icon={Headphones}
        badge="پاسخگویی زیر ۳۰ دقیقه"
        badgeVariant="emerald"
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setSubject("");
              setMessage("");
              setAttachmentName(null);
              setIsNewTicketOpen(true);
            }}
            className="text-xs gap-1.5 font-bold cursor-pointer shadow-md shadow-orange-500/15"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ ارسال تیکت جدید</span>
          </Button>
        }
      />

      {/* ── 2. Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <DashboardMetricCard
          title="تیکت‌های در جریان"
          value={
            <span>
              {toPersianDigits(stats.activeCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">تیکت فعال</span>
            </span>
          }
          subtitle="تحت بررسی مهندسان ارشد"
          icon={Clock}
          variant="orange"
        />

        <DashboardMetricCard
          title="میانگین زمان پاسخگویی"
          value="۲۴ دقیقه"
          subtitle="تعهد SLA در ساعات کاری و شیفت شب دیتاسنتر"
          icon={ShieldCheck}
          variant="emerald"
        />

        <DashboardMetricCard
          title="مسائل حل شده فنی"
          value={
            <span>
              {toPersianDigits(stats.resolvedCount)}{" "}
              <span className="text-xs font-normal text-neutral-400">مورد حل‌شده</span>
            </span>
          }
          subtitle="همراه با فایل‌های کانفیگ بهینه‌شده"
          icon={CheckCircle2}
          variant="sky"
        />
      </div>

      {/* ── 3. Filter Bar ─────────────────────────────────────────── */}
      <DashboardFilterBar
        tabs={[
          { key: "all", label: "همه تیکت‌ها", count: tickets.length },
          { key: "open", label: "در جریان / پاسخ داده شده", count: stats.activeCount },
          { key: "resolved", label: "حل شده و بسته‌شده", count: stats.resolvedCount },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchPlaceholder="جستجو بر اساس شماره تیکت، موضوع..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── 4. Tickets List ───────────────────────────────────────── */}
      {filteredTickets.length === 0 ? (
        <DashboardEmptyState
          icon={Headphones}
          title="تیکتی یافت نشد"
          description="هنوز تیکت پشتیبانی در این بخش ثبت نشده است."
          actionLabel="+ ایجاد تیکت پشتیبانی"
          onActionClick={() => setIsNewTicketOpen(true)}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-xs hover:border-neutral-700/80 transition-all p-4 sm:p-6 flex flex-col justify-between gap-4 text-right"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs text-neutral-400 font-mono">شناسه:</span>
                  <span className="text-sm font-black font-mono text-[var(--theme-foreground)]">
                    {ticket.ticketNumber}
                  </span>
                  <span className="text-neutral-700 hidden sm:inline">•</span>
                  <span className="text-xs text-neutral-400">
                    دپارتمان: {ticket.departmentLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <DashboardStatusBadge
                    label={ticket.priorityLabel}
                    variant={priorityBadgeVariant[ticket.priority]}
                    size="sm"
                  />
                  <DashboardStatusBadge
                    label={ticket.statusLabel}
                    variant={ticket.status === "answered" ? "success" : ticket.status === "closed" ? "neutral" : "warning"}
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--theme-foreground)] mb-1.5 leading-snug">
                  {ticket.subject}
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {ticket.messages[0]?.content}
                </p>
              </div>

              {ticket.assignedEngineer && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                  <User className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>پاسخگو: </span>
                  <strong className="text-neutral-200">{ticket.assignedEngineer.name}</strong>
                  <span className="text-neutral-500 font-mono text-[11px]">
                    ({ticket.assignedEngineer.title})
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-neutral-800 text-xs">
                <span className="text-neutral-500 font-mono text-[11px]">
                  آخرین بروزرسانی: {toPersianDigits(ticket.updatedAt)}
                </span>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  {ticket.status !== "closed" && (
                    <button
                      type="button"
                      onClick={() => closeTicket(ticket.id)}
                      className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                      title="بستن تیکت"
                    >
                      بستن تیکت
                    </button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveConversationTicket(ticket)}
                    className="text-xs gap-1.5 border-neutral-700 hover:bg-neutral-800 text-neutral-200 cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-orange-400" />
                    <span>مشاهده گفتگو ({toPersianDigits(ticket.messages.length)})</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. New Ticket Modal ────────────────────────────────────── */}
      <DashboardModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        title="ارسال تیکت جدید به مهندسان شبکه"
        description="پرسش‌های فنی، تحلیل ترافیک، راهنمای پچ پنل و استعلامات تخصصی"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4 text-right" dir="rtl">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              موضوع تیکت:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثلاً: مشکل در تنظیم Trunking و VLAN در سوئیچ 2960"
              className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                دپارتمان تخصصی:
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as any)}
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="cisco_switching">سوئیچینگ و روترهای سیسکو (CCIE)</option>
                <option value="fiber_cabling">فیبر نوری و کابل‌کشی ساختاریافته</option>
                <option value="warranty_rma">گارانتی طلایی و خدمات پس از فروش</option>
                <option value="billing_legal">امور مالی و فاکتور رسمی مودیان</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                درجه فوریت:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full h-9.5 px-3 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="normal">عادی</option>
                <option value="high">بالا</option>
                <option value="critical_datacenter">بحرانی دیتاسنتر (قطع سرویس)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              متن پیام و شرح کامل اشکال فنی:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="توضیحات دقیق، مدل قطعات و دستوراتی که خروجی خطا داده‌اند..."
              className="w-full p-2.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <FileUploadBox
            label="پیوست فایل کانفیگ یا عکس توپولوژی (اختیاری):"
            selectedFileName={attachmentName}
            onFileSelect={(name) => setAttachmentName(name)}
            onFileRemove={() => setAttachmentName(null)}
          />

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewTicketOpen(false)}
              className="w-full sm:w-auto"
            >
              انصراف
            </Button>
            <Button type="submit" variant="default" size="sm" className="w-full sm:w-auto font-bold justify-center">
              ارسال تیکت به کارشناسان
            </Button>
          </div>
        </form>
      </DashboardModal>

      {/* ── 6. Ticket Conversation Modal ───────────────────────────── */}
      {activeConversationTicket && (
        <DashboardModal
          isOpen={Boolean(activeConversationTicket)}
          onClose={() => setActiveConversationTicket(null)}
          title={`تیکت ${activeConversationTicket.ticketNumber}: ${activeConversationTicket.subject}`}
          description={`دپارتمان: ${activeConversationTicket.departmentLabel}`}
          maxWidth="2xl"
        >
          <div className="flex flex-col gap-4 text-right" dir="rtl">
            {/* Messages Thread */}
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
              {activeConversationTicket.messages.map((msg) => {
                const isUser = msg.senderRole === "user";
                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-xs flex flex-col gap-2 ${
                      isUser
                        ? "bg-neutral-900/80 border-neutral-800 self-end w-full sm:w-[85%]"
                        : "bg-orange-500/10 border-orange-500/25 self-start w-full sm:w-[85%]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b border-neutral-800/80 pb-1.5 text-[11px]">
                      <span className="font-bold text-neutral-200">
                        {msg.senderName}
                      </span>
                      <span className="font-mono text-neutral-500 text-[10px]">
                        {toPersianDigits(msg.createdAt)}
                      </span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap text-neutral-300 break-words">
                      {msg.content}
                    </p>

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-800/60">
                        {msg.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-400 font-mono break-all"
                          >
                            <Paperclip className="h-3 w-3 text-orange-400 shrink-0" />
                            <span>{att.name}</span>
                            <span className="text-neutral-500 shrink-0">({att.size})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            {activeConversationTicket.status !== "closed" ? (
              <form onSubmit={handleReplySubmit} className="flex flex-col gap-2 pt-3 border-t border-neutral-800">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="پاسخ خود را اینجا بنویسید..."
                  className="w-full p-2.5 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="default" size="sm" className="w-full sm:w-auto font-bold gap-1.5 justify-center">
                    <Send className="h-3.5 w-3.5" />
                    <span>ارسال پاسخ</span>
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-3 rounded-xl bg-neutral-900 text-center text-xs text-neutral-400">
                این تیکت بسته شده است. در صورت نیاز می‌توانید تیکت جدیدی ثبت فرمایید.
              </div>
            )}
          </div>
        </DashboardModal>
      )}
    </div>
  );
}
