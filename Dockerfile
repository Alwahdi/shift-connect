# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy source
COPY . .

# Build with placeholder values that will be replaced at container start time
# by docker/entrypoint.sh – this keeps the image reusable across environments.
ENV VITE_SUPABASE_URL=__SUPABASE_URL_PLACEHOLDER__
ENV VITE_SUPABASE_PUBLISHABLE_KEY=__SUPABASE_KEY_PLACEHOLDER__

RUN npm run build

# ── Production stage ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copy compiled assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx site configuration (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Runtime env-injection entrypoint
COPY docker/entrypoint.sh /docker-entrypoint-app.sh
RUN chmod +x /docker-entrypoint-app.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint-app.sh"]
