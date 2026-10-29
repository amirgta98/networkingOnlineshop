"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Headphones,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Search,
  Filter,
  User,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import { cn, toPersianDigits } from "@/shared/lib/utils";
import type { SupportTicket, TicketStatus, TicketPriority, TicketDepartment } from "../../../dashboard/types/support.types";
import { adminSupportApi, type TicketStatsDto } from "../../api/admin-support-api";
import { Button } from "@/shared/components/ui/button";
import {
  AdminDataTable,
  type AdminColumnDef,
  AdminFilterToolbar,
  type FilterTabOption,
  AdminStatsCards,
  type AdminStatItem,
} from "../shared";

export function AdminSupportView() {
  const router = useRouter();

  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const [stats, setStats] = React.useState<TicketStatsDto>({
    total: 0,
    open: 0,
    answered: 0,
    waitingUser: 0,
    resolved: 0,
    closed: 0,
    critical: 0,
  });

  const fetchStats = React.useCallback(async () => {
    try {
      const s = await adminSupportApi.getStats();
      if (s) {
        setStats(s);
      }
    } catch (err: any) {
      console.error("[AdminSupportView] Failed to fetch ticket stats:", err);
    }
  }, []);

  const fetchTickets = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminSupportApi.getAllTickets({
        status: statusFilter !== "all" ? statusFilter : undefined,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        search: searchQuery.trim() || undefined,
        page: currentPage,
        pageSize,
      });

      if (res && Array.isArray(res.tickets)) {
        setTickets(res.tickets);
        setTotal(res.total ?? res.tickets.length);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err: any) {
      console.error("[AdminSupportView] Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, departmentFilter, priorityFilter, searchQuery, currentPage]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleRefresh = async () => {
    await Promise.all([fetchTickets(), fetchStats()]);
  };

  const statsItems: AdminStatItem[] = [
    {
      id: "stat-total",
      title: "کل تیکت‌های دریافتی",
      value: toPersianDigits(stats.total),
      subtitle: "تیکت‌های ثبت‌شده در پرتال",
      icon: Headphones,
      variant: "sky",
    },
    {
      id: "stat-open",
      title: "در انتظار پاسخ کارشناس",
      value: toPersianDigits(stats.open),
      subtitle: stats.open > 0 ? "نیازمند بررسی و پاسخ CCIE" : "همه تیکت‌ها بررسی شده‌اند",
      badge: stats.open > 0 ? "اقدام فوری" : undefined,
      icon: Clock,
      variant: "orange",
    },
    {
      id: "stat-critical",
      title: "تیکت‌های بحرانی دیتاسنتر",
      value: toPersianDigits(stats.critical),
      subtitle: "دارای بالاترین اولویت SLA",
      icon: ShieldAlert,
      variant: "rose",
    },
    {
      id: "stat-answered",
      title: "پاسخ داده شده / در انتظار کاربر",
      value: toPersianDigits(stats.answered + stats.waitingUser),
      subtitle: "پاسخ توسط مهندسان ارشد ارسال شد",
      icon: CheckCircle2,
      variant: "emerald",
    },
  ];

  const statusTabs: FilterTabOption[] = [
    { id: "all", label: "همه تیکت‌ها", count: stats.total },
    { id: "OPEN", label: "در انتظار بررسی", count: stats.open, badgeVariant: "rose" },
    { id: "ANSWERED", label: "پاسخ داده شده", count: stats.answered, badgeVariant: "emerald" },
    { id: "WAITING_USER", label: "در انتظار کاربر", count: stats.waitingUser, badgeVariant: "sky" },
    { id: "RESOLVED", label: "حل شده", count: stats.resolved, badgeVariant: "emerald" },
    { id: "CLOSED", label: "بسته شده", count: stats.closed },
  ];

  const columns: AdminColumnDef<SupportTicket>[] = [
    {
      key: "ticketNumber",
      header: "شناسه و موضوع",
      sortable: true,
      className: "min-w-[240px]",
      cell: (ticket) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-orange-400">
              {ticket.ticketNumber}
            </span>
            <span className="text-neutral-700">•</span>
            <span className="text-xs font-bold text-white line-clamp-1">{ticket.subject}</span>
          </div>
          <p className="text-[11px] text-neutral-400 line-clamp-1">
            {ticket.messages?.[0]?.content || "بدون متن"}
          </p>
        </div>
      ),
    },
    {
      key: "user",
      header: "اطلاعات کاربر",
      className: "min-w-[180px]",
      cell: (ticket) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
            <User className="h-3.5 w-3.5 text-sky-400" />
            <span>{ticket.userName || "کاربر ناشناس"}</span>
          </div>
          {ticket.userPhone && (
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
              <Phone className="h-3 w-3 text-neutral-500" />
              <span>{ticket.userPhone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "department",
      header: "دپارتمان",
      className: "min-w-[150px]",
      cell: (ticket) => (
        <span className="text-xs text-neutral-300">
          {ticket.departmentLabel || ticket.department}
        </span>
      ),
    },
    {
      key: "priority",
      header: "درجه فوریت",
      className: "whitespace-nowrap w-28",
      cell: (ticket) => {
        const p = ticket.priority.toUpperCase();
        const isCritical = p === "CRITICAL" || p === "CRITICAL_DATACENTER";
        const isHigh = p === "HIGH";
        return (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-bold border",
              isCritical
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : isHigh
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-neutral-800 text-neutral-300 border-neutral-700"
            )}
          >
            {ticket.priorityLabel || ticket.priority}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "وضعیت",
      className: "whitespace-nowrap w-32",
      cell: (ticket) => {
        const s = ticket.status.toUpperCase();
        return (
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-bold border",
              s === "ANSWERED"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : s === "OPEN"
                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                : s === "WAITING_USER"
                ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                : "bg-neutral-800 text-neutral-400 border-neutral-700"
            )}
          >
            {ticket.statusLabel || ticket.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "عملیات",
      className: "whitespace-nowrap w-28 text-left",
      cell: (ticket) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(`/admin/support/${ticket.id}`)}
            className="text-xs font-bold gap-1.5 shadow-md shadow-orange-500/20"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>ورود به چت</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ─── 1. Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--theme-surface)] border border-[var(--theme-border-color)]">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white">
              تیکت‌ها و پشتیبانی مهندسی شبکه
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              پاسخگویی به سوالات مهندسی شبکه، طراحی توپولوژی، کانفیگ سیسکو و راهنمایی فنی کارفرمایان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-xs font-bold gap-1.5 border-neutral-700 hover:bg-neutral-800"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            <span>بروزرسانی زنده</span>
          </Button>
        </div>
      </div>

      {/* ─── 2. Stats Cards ─── */}
      <AdminStatsCards items={statsItems} />

      {/* ─── 3. Filter Toolbar ─── */}
      <AdminFilterToolbar
        statusTabs={statusTabs}
        activeStatusTab={statusFilter}
        onStatusTabChange={(tab) => {
          setStatusFilter(tab);
          setCurrentPage(1);
        }}
        searchPlaceholder="جستجو بر اساس شماره تیکت، موضوع، نام یا شماره تماس کاربر..."
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        secondaryFilters={
          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-xl bg-neutral-900 border border-[var(--theme-border-color)] text-xs text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">همه دپارتمان‌ها</option>
              <option value="CISCO_SWITCHING">سوئیچینگ و روترهای سیسکو</option>
              <option value="FIBER_CABLING">فیبر نوری و کابل‌کشی</option>
              <option value="BILLING_LEGAL">امور مالی و فاکتور</option>
              <option value="WARRANTY_RMA">گارانتی طلایی و RMA</option>
              <option value="GENERAL">عمومی</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-xl bg-neutral-900 border border-[var(--theme-border-color)] text-xs text-neutral-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">همه اولویت‌ها</option>
              <option value="CRITICAL">بحرانی دیتاسنتر</option>
              <option value="HIGH">بالا</option>
              <option value="NORMAL">عادی</option>
              <option value="LOW">کم</option>
            </select>
          </div>
        }
      />

      {/* ─── 4. Data Table ─── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] overflow-hidden shadow-xs">
        <AdminDataTable<SupportTicket>
          columns={columns}
          data={tickets}
          keyExtractor={(ticket) => ticket.id}
          isLoading={loading}
          emptyMessage="هیچ تیکت پشتیبانی با این مشخصات یافت نشد."
          onRowClick={(ticket) => router.push(`/admin/support/${ticket.id}`)}
          pageSize={pageSize}
          currentPage={currentPage}
          totalItems={total}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
