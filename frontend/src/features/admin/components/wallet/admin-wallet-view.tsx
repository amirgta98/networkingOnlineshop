"use client";

import * as React from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Search,
  Filter,
  Eye,
  CheckCheck,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  User,
  Phone,
} from "lucide-react";
import {
  AdminDataTable,
  AdminColumnDef,
  AdminFilterToolbar,
  AdminStatsCards,
  AdminDetailDrawer,
  AdminActionModal,
  AdminStatItem,
} from "../shared";
import {
  adminWalletApi,
  AdminWithdrawalItem,
  AdminDepositItem,
  AdminWithdrawalsResponse,
  AdminDepositsResponse,
} from "../../api/admin-wallet-api";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

export function AdminWalletView() {
  const [activeSection, setActiveSection] = React.useState<"withdrawals" | "deposits">("withdrawals");
  const [activeStatus, setActiveStatus] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [withdrawalsData, setWithdrawalsData] = React.useState<AdminWithdrawalsResponse>({
    items: [],
    total: 0,
    metrics: { pendingCount: 0, pendingAmount: 0, completedCount: 0, completedAmount: 0 },
  });
  const [depositsData, setDepositsData] = React.useState<AdminDepositsResponse>({
    items: [],
    total: 0,
    totalAmount: 0,
  });

  // Selected for drawer
  const [selectedWithdrawal, setSelectedWithdrawal] = React.useState<AdminWithdrawalItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  // Approval modal
  const [approveItem, setApproveItem] = React.useState<AdminWithdrawalItem | null>(null);
  const [payoutRefInput, setPayoutRefInput] = React.useState<string>("");
  const [isApproving, setIsApproving] = React.useState<boolean>(false);

  // Rejection modal
  const [rejectItem, setRejectItem] = React.useState<AdminWithdrawalItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = React.useState<string>("");
  const [isRejecting, setIsRejecting] = React.useState<boolean>(false);

  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [wRes, dRes] = await Promise.all([
        adminWalletApi.getAdminWithdrawals({
          status: activeStatus,
          search: searchQuery,
        }),
        adminWalletApi.getAdminDeposits({
          search: searchQuery,
        }),
      ]);
      setWithdrawalsData(wRes);
      setDepositsData(dRes);
    } catch (e) {
      console.error("Failed to load admin wallet data", e);
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus, searchQuery]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Approve
  const handleConfirmApprove = async () => {
    if (!approveItem) return;
    setIsApproving(true);
    try {
      await adminWalletApi.updateWithdrawalStatus(approveItem.id, {
        status: "COMPLETED",
        payoutReference: payoutRefInput.trim() || `PAYA-${Date.now().toString().slice(-8)}`,
      });
      showToast(`درخواست تسویه ${approveItem.trackingCode} با موفقیت تایید و ثبت گردید.`);
      setApproveItem(null);
      setPayoutRefInput("");
      if (selectedWithdrawal?.id === approveItem.id) {
        setIsDrawerOpen(false);
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || "خطا در تایید تسویه");
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Reject
  const handleConfirmReject = async () => {
    if (!rejectItem) return;
    if (!rejectionReasonInput.trim()) {
      showToast("لطفاً دلیل عدم تایید درخواست را درج نمایید.");
      return;
    }
    setIsRejecting(true);
    try {
      await adminWalletApi.updateWithdrawalStatus(rejectItem.id, {
        status: "REJECTED",
        rejectionReason: rejectionReasonInput.trim(),
      });
      showToast(`درخواست ${rejectItem.trackingCode} رد شد و وجه به کیف پول کاربر عودت داده شد.`);
      setRejectItem(null);
      setRejectionReasonInput("");
      if (selectedWithdrawal?.id === rejectItem.id) {
        setIsDrawerOpen(false);
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || "خطا در رد درخواست تسویه");
    } finally {
      setIsRejecting(false);
    }
  };

  // Stats cards configuration
  const statItems: AdminStatItem[] = [
    {
      id: "pending_withdrawals",
      title: "درخواست‌های در انتظار تسویه",
      value: formatPrice(withdrawalsData.metrics.pendingAmount),
      subtitle: `${toPersianDigits(withdrawalsData.metrics.pendingCount)} درخواست در صف پرداخت پایا/ساتنا`,
      icon: Clock,
      variant: "amber",
      badge: "نیاز به بررسی",
    },
    {
      id: "completed_withdrawals",
      title: "مجموع تسویه‌های پرداخت‌شده",
      value: formatPrice(withdrawalsData.metrics.completedAmount),
      subtitle: `${toPersianDigits(withdrawalsData.metrics.completedCount)} تسویه موفق بانکی`,
      icon: CheckCircle2,
      variant: "emerald",
    },
    {
      id: "total_deposits",
      title: "مجموع واریزی‌های آنلاین کاربران",
      value: formatPrice(depositsData.totalAmount),
      subtitle: `${toPersianDigits(depositsData.total)} تراکنش شارژ موفق شاپرک`,
      icon: ArrowDownLeft,
      variant: "sky",
    },
    {
      id: "system_status",
      title: "وضعیت درگاه‌های پرداخت و شتاب",
      value: "فعال و برخط",
      subtitle: "زرین‌پال، سامان، شاپرک و پایا",
      icon: ShieldCheck,
      variant: "purple",
    },
  ];

  // Columns for Withdrawals
  const withdrawalColumns: AdminColumnDef<AdminWithdrawalItem>[] = [
    {
      key: "user",
      header: "کاربر / همکار",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-xs">{row.user?.name || row.accountHolder}</span>
            {row.user?.isPartner && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                همکار تجاری
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-neutral-400">{row.user?.phone}</span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "مبلغ درخواستی",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-rose-400 text-sm">
          -{formatPrice(row.amount)}
        </span>
      ),
    },
    {
      key: "bank",
      header: "مشخصات حساب بانکی",
      cell: (row) => (
        <div className="flex flex-col gap-0.5 font-mono text-[11px]">
          <span className="text-white font-semibold flex items-center gap-1">
            <Building className="h-3 w-3 text-neutral-400" />
            {row.bankName}
          </span>
          <div className="flex items-center gap-1 text-neutral-300">
            <span>کارت: {row.cardNumber}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(row.cardNumber, `card-${row.id}`);
              }}
              className="text-neutral-500 hover:text-white cursor-pointer"
            >
              {copiedId === `card-${row.id}` ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-1 text-neutral-400">
            <span>شبا: {row.shabaNumber}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(row.shabaNumber, `shaba-${row.id}`);
              }}
              className="text-neutral-500 hover:text-white cursor-pointer"
            >
              {copiedId === `shaba-${row.id}` ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      ),
    },
    {
      key: "tracking",
      header: "کد پیگیری و زمان",
      cell: (row) => (
        <div className="flex flex-col gap-0.5 font-mono text-[11px]">
          <span className="text-neutral-200">{row.trackingCode}</span>
          <span className="text-neutral-500 text-[10px]">{toPersianDigits(row.requestedAt)}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      cell: (row) => {
        const isSuccess = row.status === "COMPLETED";
        const isRejected = row.status === "REJECTED" || row.status === "CANCELLED";
        const isPending = row.status === "PENDING" || row.status === "PROCESSING";

        return (
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 border ${
              isSuccess
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : isRejected
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {isSuccess && <CheckCircle2 className="h-3 w-3" />}
            {isRejected && <XCircle className="h-3 w-3" />}
            {isPending && <Clock className="h-3 w-3" />}
            {row.statusLabel}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "عملیات",
      cell: (row) => {
        const isPending = row.status === "PENDING" || row.status === "PROCESSING";

        return (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedWithdrawal(row);
                setIsDrawerOpen(true);
              }}
              className="h-8 px-2.5 text-[11px] border-neutral-700 hover:bg-neutral-800 text-neutral-300"
            >
              <Eye className="h-3.5 w-3.5 ml-1" />
              <span>جزییات</span>
            </Button>

            {isPending && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setApproveItem(row);
                    setPayoutRefInput(`PAYA-${Date.now().toString().slice(-8)}`);
                  }}
                  className="h-8 px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <CheckCheck className="h-3.5 w-3.5 ml-1" />
                  <span>تایید واریز</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRejectItem(row);
                    setRejectionReasonInput("");
                  }}
                  className="h-8 px-2.5 text-[11px] border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                >
                  <XCircle className="h-3.5 w-3.5 ml-1" />
                  <span>رد</span>
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Columns for Deposits
  const depositColumns: AdminColumnDef<AdminDepositItem>[] = [
    {
      key: "user",
      header: "کاربر واریزکننده",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-xs">{row.user?.name || "کاربر شبکه"}</span>
            {row.user?.isPartner && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                همکار تجاری
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-neutral-400">{row.user?.phone}</span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "مبلغ واریزی",
      cell: (row) => (
        <span className="font-mono font-bold text-emerald-400 text-sm">
          +{formatPrice(row.amount)}
        </span>
      ),
    },
    {
      key: "tracking",
      header: "شناسه پیگیری و ارجاع شاپرک",
      cell: (row) => (
        <div className="flex flex-col gap-0.5 font-mono text-[11px]">
          <span className="text-white font-semibold">{row.trackingCode}</span>
          <span className="text-neutral-400 text-[10px]">{row.referenceId || "زرین‌پال شاپرک"}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "شرح تراکنش",
      cell: (row) => (
        <span className="text-neutral-300 text-xs line-clamp-1">{row.description || "شارژ آنلاین کیف پول"}</span>
      ),
    },
    {
      key: "date",
      header: "تاریخ و ساعت",
      cell: (row) => (
        <span className="font-mono text-neutral-400 text-[11px]">{toPersianDigits(row.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "وضعیت",
      cell: () => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          واریز موفق
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-neutral-900 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border-color)] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Wallet className="h-6 w-6 text-orange-500" />
            <span>مدیریت مالی: درخواست‌های واریز و برداشت</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            بررسی و تایید درخواست‌های تسویه وجه کاربران و همکاران، ثبت کد پیگیری پایا، استرداد و رهگیری کلیه واریزهای آنلاین
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Section Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveSection("withdrawals")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === "withdrawals"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              درخواست‌های برداشت ({toPersianDigits(withdrawalsData.total)})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("deposits")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSection === "deposits"
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              واریزی‌ها و شارژ آنلاین ({toPersianDigits(depositsData.total)})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            className="border-neutral-800 text-neutral-300 hover:bg-neutral-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <AdminStatsCards items={statItems} columns={4} />

      {/* Toolbar & Filters */}
      {activeSection === "withdrawals" ? (
        <AdminFilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="جستجو با نام کاربر، شماره کارت، شبا، تلفن یا کد رهگیری..."
          activeStatusTab={activeStatus}
          onStatusTabChange={setActiveStatus}
          statusTabs={[
            { id: "all", label: "همه درخواست‌ها", count: withdrawalsData.total },
            {
              id: "pending",
              label: "در انتظار بررسی",
              count: withdrawalsData.metrics.pendingCount,
              badgeVariant: "orange",
            },
            {
              id: "processing",
              label: "در حال انتقال پایا",
              badgeVariant: "purple",
            },
            {
              id: "completed",
              label: "تسویه شده",
              count: withdrawalsData.metrics.completedCount,
              badgeVariant: "emerald",
            },
            {
              id: "rejected",
              label: "رد شده / مسترد",
              badgeVariant: "rose",
            },
          ]}
        />
      ) : (
        <AdminFilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="جستجو در نام کاربر، کد رهگیری شاپرک یا شماره تلفن..."
        />
      )}

      {/* Main Table */}
      {activeSection === "withdrawals" ? (
        <AdminDataTable
          data={withdrawalsData.items}
          columns={withdrawalColumns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="هیچ درخواست برداشتی با فیلتر انتخابی یافت نشد"
          onRowClick={(row) => {
            setSelectedWithdrawal(row);
            setIsDrawerOpen(true);
          }}
        />
      ) : (
        <AdminDataTable
          data={depositsData.items}
          columns={depositColumns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="هیچ رکورد واریزی یافت نشد"
        />
      )}

      {/* ── Detail Drawer ─────────────────────────────────────────── */}
      <AdminDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          selectedWithdrawal ? (
            <div className="flex items-center gap-2">
              <span>درخواست تسویه وجه {selectedWithdrawal.trackingCode}</span>
            </div>
          ) : (
            "جزییات تسویه"
          )
        }
        subtitle={
          selectedWithdrawal
            ? `ثبت شده در تاریخ ${toPersianDigits(selectedWithdrawal.requestedAt)}`
            : undefined
        }
        badge={
          selectedWithdrawal && (
            <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-neutral-800">
              {selectedWithdrawal.statusLabel}
            </span>
          )
        }
        footer={
          selectedWithdrawal &&
          (selectedWithdrawal.status === "PENDING" || selectedWithdrawal.status === "PROCESSING") ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectItem(selectedWithdrawal);
                  setRejectionReasonInput("");
                }}
                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              >
                رد درخواست و عودت وجه
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setApproveItem(selectedWithdrawal);
                  setPayoutRefInput(`PAYA-${Date.now().toString().slice(-8)}`);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                تایید تسویه و ثبت کد پایا
              </Button>
            </div>
          ) : undefined
        }
      >
        {selectedWithdrawal && (
          <div className="flex flex-col gap-6 text-right" dir="rtl">
            {/* Amount & Status Card */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block mb-1">مبلغ درخواستی تسویه:</span>
                <span className="text-xl font-bold font-mono text-rose-400">
                  {formatPrice(selectedWithdrawal.amount)}
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-neutral-400 block mb-1">وضعیت فعلی:</span>
                <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700">
                  {selectedWithdrawal.statusLabel}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-neutral-300">اطلاعات هویتی درخواست‌دهنده:</h4>
              <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">نام کاربر:</span>
                  <span className="text-white font-semibold">
                    {selectedWithdrawal.user?.name || selectedWithdrawal.accountHolder}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">شماره همراه:</span>
                  <span className="text-neutral-200 font-mono">{selectedWithdrawal.user?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">سطح دسترسی:</span>
                  <span className="text-sky-400 font-semibold">
                    {selectedWithdrawal.user?.isPartner ? "همکار تجاری (سازمانی)" : "مشتری عادی"}
                  </span>
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-neutral-300">اطلاعات حساب بانکی مقصد:</h4>
              <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col gap-2.5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">بانک مقصد:</span>
                  <span className="text-white font-bold">{selectedWithdrawal.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">نام صاحب حساب:</span>
                  <span className="text-white">{selectedWithdrawal.accountHolder}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">شماره کارت:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-bold tracking-wider">
                      {selectedWithdrawal.cardNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedWithdrawal.cardNumber, "drawer-card")}
                      className="text-neutral-500 hover:text-white"
                    >
                      {copiedId === "drawer-card" ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">شماره شبا:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sky-300 font-bold">{selectedWithdrawal.shabaNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedWithdrawal.shabaNumber, "drawer-shaba")}
                      className="text-neutral-500 hover:text-white"
                    >
                      {copiedId === "drawer-shaba" ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Notice Reminder */}
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                طبق تعهدنامه ثبت‌شده توسط کاربر: اگر شماره کارت یا شبا اشتباه وارد شده بود سایت هیچ مسئولیتی ندارد.
              </span>
            </div>

            {/* Payout Reference / Rejection Details */}
            {selectedWithdrawal.payoutReference && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col gap-1">
                <span className="font-bold">شناسه پیگیری حواله پایا/ساتنا:</span>
                <span className="font-mono text-sm">{selectedWithdrawal.payoutReference}</span>
                {selectedWithdrawal.processedAt && (
                  <span className="text-[10px] text-emerald-400/80">
                    تاریخ تایید: {toPersianDigits(selectedWithdrawal.processedAt)}
                  </span>
                )}
              </div>
            )}

            {selectedWithdrawal.rejectionReason && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-1">
                <span className="font-bold">علت رد درخواست تسویه:</span>
                <span>{selectedWithdrawal.rejectionReason}</span>
              </div>
            )}
          </div>
        )}
      </AdminDetailDrawer>

      {/* ── Approve Modal ─────────────────────────────────────────── */}
      <AdminActionModal
        isOpen={Boolean(approveItem)}
        onClose={() => setApproveItem(null)}
        title="تایید پرداخت و تسویه حساب"
        description="انتقال وضعیت درخواست به تسویه موفق بانکی. لطفاً شناسه پیگیری حواله پایا یا ساتنا صادر شده از بانک را وارد نمایید:"
        confirmLabel="ثبت و تایید نهایی پرداخت"
        variant="success"
        isLoading={isApproving}
        onConfirm={handleConfirmApprove}
      >
        {approveItem && (
          <div className="flex flex-col gap-3 text-right" dir="rtl">
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between text-xs">
              <span className="text-neutral-400">مبلغ واریز:</span>
              <span className="font-bold text-emerald-400 font-mono">{formatPrice(approveItem.amount)}</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                شناسه پیگیری واریز حواله پایا / ساتنا:
              </label>
              <input
                type="text"
                value={payoutRefInput}
                onChange={(e) => setPayoutRefInput(e.target.value)}
                placeholder="مثال: PAYA-14030802-998811"
                className="w-full h-10 px-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 text-left"
                dir="ltr"
              />
            </div>
          </div>
        )}
      </AdminActionModal>

      {/* ── Reject Modal ──────────────────────────────────────────── */}
      <AdminActionModal
        isOpen={Boolean(rejectItem)}
        onClose={() => setRejectItem(null)}
        title="رد درخواست برداشت و استرداد وجه"
        description="با رد این درخواست، مبلغ کسر شده به صورت خودکار به کیف پول کاربر عودت داده خواهد شد و تراکنش استرداد ثبت می‌گردد."
        confirmLabel="رد درخواست و عودت وجه"
        variant="danger"
        isLoading={isRejecting}
        onConfirm={handleConfirmReject}
      >
        {rejectItem && (
          <div className="flex flex-col gap-3 text-right" dir="rtl">
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between text-xs">
              <span className="text-neutral-400">مبلغ عودتی به کیف پول:</span>
              <span className="font-bold text-white font-mono">{formatPrice(rejectItem.amount)}</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                علت عدم تایید / رد درخواست (جهت نمایش به کاربر):
              </label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="مثال: عدم تطابق شماره کارت و شماره شبا با مشخصات احراز هویت شده کاربر..."
                rows={3}
                required
                className="w-full p-3 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
