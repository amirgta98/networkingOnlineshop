#!/usr/bin/env bash
# ==============================================================================
# اسکریپت بازیابی (Restore) دیتابیس PostgreSQL از فایل بک‌آپ
# نحوه استفاده:
# ./deploy/scripts/restore-db.sh /opt/backups/velox/velox_backup_YYYYMMDD_HHMMSS.sql.gz
# ==============================================================================

set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "❌ خطا: لطفاً مسیر فایل بک‌آپ را وارد کنید."
    echo "مثال: $0 /opt/backups/velox/velox_backup_20261006_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="velox-postgres-prod"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ خطا: فایل مورد نظر وجود ندارد: ${BACKUP_FILE}"
    exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [ -f "${PROJECT_DIR}/.env" ]; then
    export $(grep -v '^#' "${PROJECT_DIR}/.env" | xargs)
fi

DB_USER="${POSTGRES_USER:-velox_admin}"
DB_NAME="${POSTGRES_DB:-velox_db}"

echo "⚠️  هشدار: داده‌های فعلی دیتابیس ${DB_NAME} رونویسی خواهند شد!"
read -p "آیا از ادامه عملیات اطمینان دارید؟ (yes/no): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
    echo "عملیات متوقف شد."
    exit 0
fi

echo "🔄 در حال بازیابی داده‌ها..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "✅ بازیابی با موفقیت کامل شد!"
