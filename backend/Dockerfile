# ── Stage 1: dependencies ─────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: production image ─────────────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache wget      # needed for HEALTHCHECK

WORKDIR /app

# Copy deps from stage 1 (no npm in final image)
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy application source
COPY src/        ./src/
COPY migrations/ ./migrations/
COPY database.json ./
COPY entrypoint.sh ./

# Create directories for runtime files and set permissions
RUN mkdir -p uploads logs && \
    chmod +x entrypoint.sh && \
    addgroup -g 1001 -S nodejs && \
    adduser  -S modex -u 1001 && \
    chown -R modex:nodejs /app

USER modex

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["./entrypoint.sh"]
