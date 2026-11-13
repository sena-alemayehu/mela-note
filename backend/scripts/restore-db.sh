#!/bin/bash
# ==============================================================================
# Mela Note - MySQL Database Restore Script
# Usage: ./restore-db.sh <backup_file.sql.gz> [target_database]
# ==============================================================================

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <backup_file.sql.gz> [target_database]"
  exit 1
fi

BACKUP_FILE="$1"
TARGET_DB="${2:-mela_note}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[ERROR] Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_USER="${MYSQL_USER:-mela_app}"
DB_PASSWORD="${MYSQL_PASSWORD:-}"
DB_HOST="${MYSQL_HOST:-localhost}"
DB_PORT="${MYSQL_PORT:-3306}"

echo "[INFO] Restoring '${BACKUP_FILE}' into database '${TARGET_DB}'..."

if [[ "${BACKUP_FILE}" == *.gz ]]; then
  if [ -n "${DB_PASSWORD}" ]; then
    gunzip -c "${BACKUP_FILE}" | MYSQL_PWD="${DB_PASSWORD}" mysql \
      --host="${DB_HOST}" \
      --port="${DB_PORT}" \
      --user="${DB_USER}" \
      "${TARGET_DB}"
  else
    gunzip -c "${BACKUP_FILE}" | mysql \
      --host="${DB_HOST}" \
      --port="${DB_PORT}" \
      --user="${DB_USER}" \
      "${TARGET_DB}"
  fi
else
  if [ -n "${DB_PASSWORD}" ]; then
    MYSQL_PWD="${DB_PASSWORD}" mysql \
      --host="${DB_HOST}" \
      --port="${DB_PORT}" \
      --user="${DB_USER}" \
      "${TARGET_DB}" < "${BACKUP_FILE}"
  else
    mysql \
      --host="${DB_HOST}" \
      --port="${DB_PORT}" \
      --user="${DB_USER}" \
      "${TARGET_DB}" < "${BACKUP_FILE}"
  fi
fi

echo "[SUCCESS] Database restoration complete for '${TARGET_DB}'!"
