# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY services/${SERVICE_NAME}/package.json ./services/${SERVICE_NAME}/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY services/${SERVICE_NAME}/ ./services/${SERVICE_NAME}/

RUN pnpm --filter @syndeocare/shared-types build || true
RUN pnpm --filter @syndeocare/shared-config build || true
RUN pnpm --filter @syndeocare/${SERVICE_NAME} build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

WORKDIR /app

COPY --from=builder --chown=nestjs:nodejs /app/services/${SERVICE_NAME}/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/services/${SERVICE_NAME}/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]
