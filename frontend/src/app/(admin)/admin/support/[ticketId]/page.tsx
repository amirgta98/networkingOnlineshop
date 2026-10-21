"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { adminSupportApi } from "@/features/admin/api/admin-support-api";
import type { SupportTicket } from "@/features/dashboard/types/support.types";
import { TicketChat } from "@/features/dashboard/components/shared/ticket-chat";
import { RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function AdminTicketChatPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = React.useState<SupportTicket | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTicket = React.useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminSupportApi.getTicket(ticketId);
      setTicket(data);
    } catch (err: any) {
      console.error("[AdminTicketChatPage] Failed to fetch ticket:", err);
      setError(err.message || "خطا در دریافت اطلاعات تیکت از سرور");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  React.useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-3 text-neutral-400">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-400" />
        <span className="text-sm font-medium">در حال اتصال به گفتگوی تیکت...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-4 text-center p-6 bg-neutral-900/40 rounded-3xl border border-neutral-800">
        <AlertCircle className="h-10 w-10 text-rose-400" />
        <h3 className="text-base font-bold text-white">تیکت یافت نشد</h3>
        <p className="text-xs text-neutral-400 max-w-md">{error || "ممکن است این تیکت حذف شده باشد."}</p>
        <Link href="/admin/support">
          <Button variant="default" size="sm" className="gap-2 font-bold">
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به لیست تیکت‌ها</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TicketChat
        initialTicket={ticket}
        role="admin"
        backHref="/admin/support"
        onTicketUpdated={(updated) => setTicket(updated)}
      />
    </div>
  );
}
