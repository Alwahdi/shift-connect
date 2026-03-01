#!/bin/bash
# ============================================================================
# SyndeoCare — Database Backup Script
# ============================================================================
# Usage: ./backup.sh [output_dir]
#
# Requires: SUPABASE_DB_URL environment variable
# Example:  SUPABASE_DB_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

set -euo pipefail

OUTPUT_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${OUTPUT_DIR}/syndeocare_backup_${TIMESTAMP}.sql"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "🏥 SyndeoCare Database Backup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Timestamp: ${TIMESTAMP}"
echo "Output:    ${BACKUP_FILE}"

# Check for required env var
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "❌ Error: SUPABASE_DB_URL environment variable is not set"
  echo "Set it to your database connection string"
  exit 1
fi

# Run pg_dump
echo "📦 Starting backup..."
pg_dump "$SUPABASE_DB_URL" \
  --schema=public \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  > "$BACKUP_FILE"

# Compress
echo "🗜️  Compressing..."
gzip "$BACKUP_FILE"

FINAL_FILE="${BACKUP_FILE}.gz"
FILE_SIZE=$(du -sh "$FINAL_FILE" | cut -f1)

echo "✅ Backup complete!"
echo "   File: ${FINAL_FILE}"
echo "   Size: ${FILE_SIZE}"

# Clean old backups (keep last 30 days)
echo "🧹 Cleaning backups older than 30 days..."
find "$OUTPUT_DIR" -name "syndeocare_backup_*.sql.gz" -mtime +30 -delete

echo "Done!"
