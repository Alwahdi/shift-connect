#!/bin/bash
# SyndeoCare — PostgreSQL initialization script
# Creates a separate database for each microservice.
# Runs once when the Postgres data directory is empty (first container start).
set -e

echo "==> Creating service databases..."

for db in auth_db users_db bookings_db notifications_db payments_db admin_db; do
  echo "    Creating database: $db"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -c "SELECT 1 FROM pg_database WHERE datname = '$db'" \
    | grep -q 1 || \
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
    -c "CREATE DATABASE $db"
done

echo "==> Adding extensions to each service database..."

for db in auth_db users_db bookings_db notifications_db payments_db admin_db; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOSQL
done

echo "==> PostgreSQL initialization complete."
