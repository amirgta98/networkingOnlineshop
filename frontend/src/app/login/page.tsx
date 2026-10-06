import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ShieldCheck, Server, Lock, Cpu } from "lucide-react";
import { AuthCard } from "@/features/auth";

export const metadata: Metadata = {
  title: "ورود به سامانه | ولوکس تجهیزات شبکه",
  description:
    "ورود به پنل کاربری، پرتال سازمانی B2B و مدیریت فروشگاه تجهیزات شبکه ولوکس با سیستم احراز هویت دو مرحله‌ای امن.",
};

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[var(--theme-background)] selection:bg-[var(--theme-primary)]/30 selection:text-white"
      dir="rtl"
    >
      {/* Background Datacenter & Grid Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Ambient Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-600/10 via-[var(--theme-primary)]/15 to-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full border-b border-[var(--theme-border-color)] px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[var(--theme-muted)] hover:text-[var(--theme-foreground)] transition-colors group cursor-pointer"
          >
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            <span>بازگشت به فروشگاه</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="font-mono text-[11px]">پروتکل امن TLS 1.3 / ۲FA Protected</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
        <Suspense
          fallback={
            <div className="flex h-96 w-full max-w-md items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--theme-primary)] border-t-transparent" />
            </div>
          }
        >
          <AuthCard />
        </Suspense>
      </main>

      {/* Security & Infrastructure Footer */}
      <footer className="relative z-10 w-full border-t border-[var(--theme-border-color)] py-4 px-6 text-center text-xs text-neutral-500">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 sm:justify-between">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              احراز هویت دومرحله‌ای سخت‌گیرانه
            </span>
            <span className="inline-flex items-center gap-1.5 text-neutral-400">
              <Server className="h-3.5 w-3.5 text-sky-400" />
              تفکیک سطح دسترسی سازمانی و عادی
            </span>
            <span className="inline-flex items-center gap-1.5 text-neutral-400">
              <Lock className="h-3.5 w-3.5 text-orange-400" />
              نشست‌های رمزنگاری شده توکن‌محور
            </span>
          </div>

          <p className="text-[11px] text-neutral-500">
            سامانه تجهیزات شبکه ولوکس © {new Date().getFullYear()} — تمامی حقوق محفوظ است.
          </p>
        </div>
      </footer>
    </div>
  );
}
