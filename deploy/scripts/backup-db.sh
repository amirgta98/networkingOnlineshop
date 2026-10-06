#!/usr/bin/env bash
# ==============================================================================
# اسکریپت بک‌آپ‌گیری خودکار از دیتابیس PostgreSQL
# این اسکریپت یک فایل فشرده با فرمت gzip تولید کرده و نسخه‌های قدیمی‌تر از ۷ روز را پاک می‌کند
# ==============================================================================

set -euo pipefail

# پوشه ذخیره بک‌آپ‌ها روی سرور
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/velox}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/velox_backup_${TIMESTAMP}.sql.gz"
CONTAINER_NAME="velox-postgres-prod"

# بارگذاری متغیرهای محیطی دیتابیس در صورت وجود فایل .env
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [ -f "${PROJECT_DIR}/.env" ]; then
    export $(grep -v '^#' "${PROJECT_DIR}/.env" | xargs)
fi

DB_USER="${POSTGRES_USER:-velox_admin}"
DB_NAME="${POSTGRES_DB:-velox_db}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 شروع فرآیند تهیه بک‌آپ از دیتابیس ${DB_NAME}..."

# ایجاد پوشه بک‌آپ در صورت عدم وجود
mkdir -p "${BACKUP_DIR}"

# گرفتن دامپ از دیتابیس داخل کانتینر و فشرده‌سازی در لحظه
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# بررسی حجم فایل تولید شده
FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ بک‌آپ با موفقیت ایجاد شد: ${BACKUP_FILE} (حجم: ${FILE_SIZE})"

# پاکسازی بک‌آپ‌های قدیمی‌تر از ۷ روز
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧹 در حال پاکسازی نسخه‌های قدیمی‌تر از ۷ روز..."
find "${BACKUP_DIR}" -name "velox_backup_*.sql.gz" -type f -mtime +7 -exec rm -f {} \;

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✨ عملیات بک‌آپ‌گیری با موفقیت به پایان رسید."
