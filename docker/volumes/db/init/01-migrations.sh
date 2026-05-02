#!/bin/bash
# Apply all user migrations in chronological order.
# This script is executed by the supabase/postgres image on first boot
# (files in /docker-entrypoint-initdb.d/ are run alphabetically).
#
# Migrations are mounted at /docker-entrypoint-initdb.d/migrations/

set -e

MIGRATIONS_DIR="/docker-entrypoint-initdb.d/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found – skipping."
  exit 0
fi

echo "Applying SyndeoCare database migrations..."

for sql_file in $(ls -v "$MIGRATIONS_DIR"/*.sql 2>/dev/null); do
  echo "  → $(basename "$sql_file")"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$sql_file"
done

echo "All migrations applied successfully."
