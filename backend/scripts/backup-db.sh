#!/bin/bash
# ==============================================================================
# Mela Note - MySQL Automated Backup Script
# Usage: ./backup-db.sh [backup_dir]
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/mela_note_${TIMESTAMP}.sql"
GZ_FILE="${BACKUP_FILE}.gz"

# Load database credentials from .env if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_USER="${MYSQL_USER:-mela_app}"
DB_PASSWORD="${MYSQL_PASSWORD:-}"
DB_HOST="${MYSQL_HOST:-localhost}"
DB_PORT="${MYSQL_PORT:-3306}"
DB_NAME="${MYSQL_DATABASE:-mela_note}"

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting backup for database '${DB_NAME}'..."

if [ -n "${DB_PASSWORD}" ]; then
  MYSQL_PWD="${DB_PASSWORD}" mysqldump \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    "${DB_NAME}" > "${BACKUP_FILE}"
else
  mysqldump \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    "${DB_NAME}" > "${BACKUP_FILE}"
fi

# Compress the backup
gzip -f "${BACKUP_FILE}"

echo "[SUCCESS] Backup created successfully: ${GZ_FILE} ($(du -h "${GZ_FILE}" | cut -f1))"

# Retention: Delete backups older than 7 days
find "${BACKUP_DIR}" -type f -name "mela_note_*.sql.gz" -mtime +7 -delete
echo "[INFO] Cleaned up backups older than 7 days."
