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
RUN apk add --no-cache libc6-compat openssl dumb-init

# ------------------------------------------------------------------------------
# Stage 2: Install dependencies & Generate Prisma Client
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* .npmrc* ./
COPY prisma ./prisma/

# نصب تمام وابستگی‌ها و تولید کلاینت Prisma با حل تداخلات peer-deps
RUN npm ci --legacy-peer-deps
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

# نصب openssl برای ارتباط Prisma با PostgreSQL و dumb-init برای مدیریت سیگنال‌ها
RUN apk add --no-cache openssl dumb-init

# ساخت پوشه آپلود فایل‌ها با دسترسی کاربر node
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# کپی فایل‌های خروجی و پکیج‌های سبک پروداکشن
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma

# تغییر سطح دسترسی به کاربر غیر ریشه داخلی node
USER node

EXPOSE 3001

# هلث‌چک دوره‌ای برای بررسی بالا بودن وب‌سرور API
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/docs || exit 1

# استفاده از dumb-init به عنوان PID 1 برای مدیریت صحیح سیگنال‌های خروج (SIGTERM / SIGINT)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
