# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm ci --prefer-offline
COPY apps/web/ .
# Placeholder values replaced at container start by entrypoint
ENV VITE_API_URL=__API_URL_PLACEHOLDER__
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /docker-entrypoint-app.sh
RUN chmod +x /docker-entrypoint-app.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint-app.sh"]
