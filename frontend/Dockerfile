# ==============================================================================
# Multi-stage Dockerfile for Next.js (Standalone Mode)
# بهینه‌سازی شده برای حداقل حجم ایمیج و امنیت با کاربر غیر ریشه (Non-root)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base image
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
# نصب ابزارهای ضروری سیستم‌عامل در صورت نیاز پکیج‌ها به کامپایل بومی
RUN apk add --no-cache libc6-compat

# ------------------------------------------------------------------------------
# Stage 2: Install dependencies
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# کپی فایل‌های تعریف پکیج‌ها جهت استفاده حداکثری از کش لایه‌های داکر
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --ignore-scripts --legacy-peer-deps

# ------------------------------------------------------------------------------
# Stage 3: Build the application
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# تنظیم متغیرهای محیطی زمان بیلد Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# بیلد پروژه Next.js (خروجی standalone در next.config.ts فعال است)
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Production runner (حداقل حجم و ایمن‌ترین لایه نهایی)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ایجاد کاربر و گروه اختصاصی غیر ریشه جهت ارتقای امنیت کانتینر
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# کپی کردن پوشه public برای فایلهای استاتیک
COPY --from=builder /app/public ./public

# کپی کردن خروجی Standalone که توسط Next.js ایجاد شده است
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# سوئیچ به کاربر غیر ریشه
USER nextjs

EXPOSE 3000

# هلث‌چک جهت مانیتور سلامت کانتینر توسط داکر و کامپوز
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

# اجرای وب‌سرور سبک Next.js Standalone
CMD ["node", "server.js"]
