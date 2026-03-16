# ── Stage 1: build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Accept build-time env vars
ARG VITE_API_URL=/api
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ── Stage 2: serve with nginx ─────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Non-root user
RUN addgroup -g 1001 -S nginx-app && \
    adduser  -S nginx-user -u 1001 -G nginx-app && \
    chown -R nginx-user:nginx-app /usr/share/nginx/html && \
    chown -R nginx-user:nginx-app /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx-user:nginx-app /var/run/nginx.pid

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --spider -q http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
