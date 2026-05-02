-- SyndeoCare microservices schema bootstrap
-- Each NestJS service uses TypeORM's synchronize in dev,
-- and proper migrations in production.
-- This file creates extensions and the syndeocare database role.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create separate schemas per service for logical isolation
-- (all in the same Postgres instance for dev simplicity)
CREATE SCHEMA IF NOT EXISTS auth_svc;
CREATE SCHEMA IF NOT EXISTS users_svc;
CREATE SCHEMA IF NOT EXISTS bookings_svc;
CREATE SCHEMA IF NOT EXISTS notifications_svc;
CREATE SCHEMA IF NOT EXISTS payments_svc;
CREATE SCHEMA IF NOT EXISTS admin_svc;
