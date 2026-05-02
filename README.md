# SyndeoCare — Production-Grade Microservices Platform

A healthcare staffing marketplace connecting **dental/medical professionals** with **clinics** for shift work.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Mobile                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   API Gateway       │
                    │   (nginx :8080)     │
                    └──────────┬──────────┘
          ┌──────────┬─────────┼──────────┬──────────┐
          │          │         │          │          │
    ┌─────▼──┐  ┌────▼───┐ ┌──▼─────┐ ┌──▼────┐ ┌──▼──────┐
    │ auth   │  │ users  │ │booking │ │notifs │ │payments │
    │ :3001  │  │ :3002  │ │ :3003  │ │ :3004 │ │  :3005  │
    └────────┘  └────────┘ └────────┘ └───────┘ └─────────┘
          │          │         │          │          │
    ┌─────▼──────────▼─────────▼──────────▼──────────▼──────┐
    │                 Shared Infrastructure                    │
    │   PostgreSQL  ·  Redis  ·  Kafka  ·  MinIO             │
    └────────────────────────────────────────────────────────┘
```

### Services

| Service | Port | Responsibility |
|---|---|---|
| `auth-service` | 3001 | JWT auth, OTP, user registration |
| `users-service` | 3002 | Profiles, clinics, documents |
| `bookings-service` | 3003 | Shifts, bookings, state machine |
| `notifications-service` | 3004 | Kafka consumer → email/in-app |
| `payments-service` | 3005 | Stripe, webhooks |
| `admin-service` | 3006 | Admin operations |
| `api-gateway` | 8080 | nginx reverse proxy + rate limiting |
| `frontend` | 80 | React/Vite SPA |

---

## Repository Structure

```
/
├── apps/
│   └── web/              ← React/Vite frontend (Shadcn UI, React Query)
├── services/
│   ├── auth-service/     ← NestJS: JWT, OTP, BullMQ
│   ├── users-service/    ← NestJS: profiles, clinics, documents, MinIO
│   ├── bookings-service/ ← NestJS: shifts, booking state machine
│   ├── notifications-service/ ← NestJS: Kafka consumer, Resend email
│   ├── payments-service/ ← NestJS: Stripe, idempotency, webhooks
│   └── admin-service/    ← NestJS: admin operations
├── packages/
│   ├── shared-types/     ← DTOs, Kafka event schemas, TypeScript enums
│   └── shared-config/    ← Zod env validation, NestJS config factories
├── infra/
│   ├── config/           ← Prometheus, Loki, Promtail, Grafana configs
│   └── gateway/          ← nginx API gateway configuration
├── docker-compose.microservices.yml  ← Full microservices stack
├── docker-compose.observability.yml  ← Opt-in observability (Grafana + Loki)
├── docker-compose.yml                ← Legacy Supabase self-hosted stack
└── turbo.json
```

---

## Quick Start (Microservices Stack)

### Prerequisites

- Docker & Docker Compose v2
- Node.js >= 20
- pnpm >= 10

### 1. Configure Environment

```bash
cp .env.microservices.example .env.microservices
# Edit .env.microservices — fill in ALL required secrets
```

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Start the Stack

```bash
# Microservices only
docker compose -f docker-compose.microservices.yml --env-file .env.microservices up -d

# With observability (Grafana + Loki + Prometheus)
docker compose \
  -f docker-compose.microservices.yml \
  -f docker-compose.observability.yml \
  --env-file .env.microservices \
  up -d
```

### 3. Access Services

| URL | Service |
|---|---|
| http://localhost | Frontend (React SPA) |
| http://localhost:8080 | API Gateway |
| http://localhost:8080/api/docs/auth | Auth Swagger UI |
| http://localhost:8090 | Kafka UI |
| http://localhost:9001 | MinIO Console |
| http://localhost:3100 | Grafana |
| http://localhost:9090 | Prometheus |

---

## Development

```bash
# Install all workspace dependencies
pnpm install

# Build shared packages first
pnpm --filter @syndeocare/shared-types build
pnpm --filter @syndeocare/shared-config build

# Run a service in watch mode
cd services/auth-service && pnpm dev

# Build all
pnpm build

# Type check all
pnpm typecheck
```

---

## Kafka Topics

| Topic | Producer | Consumers |
|---|---|---|
| `syndeocare.auth.user-registered` | auth-service | notifications, users |
| `syndeocare.bookings.booking-created` | bookings-service | notifications |
| `syndeocare.bookings.booking-status-changed` | bookings-service | notifications |
| `syndeocare.payments.payment-completed` | payments-service | notifications |
| `syndeocare.payments.payment-failed` | payments-service | notifications |

---

## Booking State Machine

```
REQUESTED -> ACCEPTED -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT -> COMPLETED
          -> DECLINED
          -> CANCELLED (from any pre-completed state)
```

---

## AWS Deployment Mapping

| Local | AWS |
|---|---|
| PostgreSQL container | RDS PostgreSQL |
| Redis container | ElastiCache |
| Kafka + Zookeeper | MSK (Managed Kafka) |
| MinIO | S3 |
| NestJS containers | ECS Fargate |
| nginx (frontend + gateway) | CloudFront + ALB |
| Grafana/Loki | Grafana Cloud |
| Prometheus | Amazon Managed Prometheus |

Environment variables map 1:1 between docker-compose and ECS task definitions.

---

## Legacy Supabase Stack

The original self-hosted Supabase stack is preserved at `docker-compose.yml`.
See `SELF_HOSTING.md` for its documentation.
