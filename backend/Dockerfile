# ==============================================================================
# Multi-stage Dockerfile for NestJS Backend (with Prisma ORM)
# بهینه‌سازی شده برای حداقل حجم، سرعت بیلد بالا و کاربر غیر ریشه (Non-root)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base image
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
# نصب پکیج‌های ضروری برای کلاینت Prisma و اجرای ایمن پروسه‌ها
RUN apk add --no-cache libc6-compat openssl dumb-init ca-certificates

# ------------------------------------------------------------------------------
# Stage 2: Install dependencies & Generate Prisma Client
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

ENV NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# کپی فایل‌های پکیج قبل از سایر فایل‌ها جهت استفاده حداکثری از کش داکر
COPY package.json package-lock.json* .npmrc* ./

# نصب تمام وابستگی‌ها با استفاده از کش بیلدکیت
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit

# تولید کلاینت Prisma بعد از نصب وابستگی‌ها
COPY prisma ./prisma/
RUN npx prisma generate

# ------------------------------------------------------------------------------
# Stage 3: Build TypeScript source code
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# بیلد پروژه NestJS و تولید پوشه dist
RUN npm run build

# پاکسازی وابستگی‌های dev جهت سبک‌سازی لایه پروداکشن
RUN npm prune --production --legacy-peer-deps

# ------------------------------------------------------------------------------
# Stage 4: Production runner
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# نصب openssl برای ارتباط Prisma با PostgreSQL، dumb-init و su-exec برای مدیریت مجوزهای پوشه آپلود
RUN apk add --no-cache openssl dumb-init su-exec ca-certificates curl

# کپی فایل‌های خروجی و پکیج‌های سبک پروداکشن
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/assets ./assets

# اسکریپت راه‌اندازی و تنظیم مجوزهای ولوم آپلود
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3001

# هلث‌چک دوره‌ای برای بررسی بالا بودن وب‌سرور API
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/docs || exit 1

# اجرای انٹری‌پوینت با dumb-init و su-exec
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
