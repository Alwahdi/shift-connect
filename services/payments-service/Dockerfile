# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY services/payments-service/package.json ./services/payments-service/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store     pnpm install --frozen-lockfile
COPY packages/ ./packages/
COPY services/payments-service/ ./services/payments-service/
RUN pnpm --filter @syndeocare/shared-types build || true &&     pnpm --filter @syndeocare/shared-config build || true &&     pnpm --filter @syndeocare/payments-service build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
WORKDIR /app
COPY --from=builder --chown=nestjs:nodejs /app/services/payments-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/services/payments-service/package.json ./
USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD wget -qO- http://localhost:3000/api/v1/health/ready || exit 1
CMD ["node", "dist/main"]
