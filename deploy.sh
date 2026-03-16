#!/usr/bin/env bash
# deploy.sh — Zero-downtime deployment script for EC2
# Usage: bash deploy.sh [--skip-frontend] [--skip-migrate]
# Run from: /home/ubuntu/resumeai on the EC2 instance

set -e

GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${BLUE}[deploy]${NC} $1"; }
success() { echo -e "${GREEN}[deploy]${NC} $1"; }
warn()    { echo -e "${YELLOW}[deploy]${NC} $1"; }

SKIP_FRONTEND=false
SKIP_MIGRATE=false

for arg in "$@"; do
  case $arg in
    --skip-frontend) SKIP_FRONTEND=true ;;
    --skip-migrate)  SKIP_MIGRATE=true  ;;
  esac
done

START_TIME=$(date +%s)
info "Starting deployment at $(date '+%Y-%m-%d %H:%M:%S')"

# ── Pull latest code ──────────────────────────────────────────────────────
info "Pulling latest code from main..."
git pull origin main
success "Code updated"

# ── Backend ───────────────────────────────────────────────────────────────
info "Updating backend dependencies..."
cd backend
npm install --production --silent

if [ "$SKIP_MIGRATE" = false ]; then
  info "Running database migrations..."
  npm run db:migrate
  success "Migrations applied"
fi

info "Reloading backend process (zero-downtime)..."
if pm2 describe resumeai-backend > /dev/null 2>&1; then
  pm2 reload resumeai-backend
else
  pm2 start ecosystem.config.js --env production
fi
pm2 save
success "Backend reloaded"

# ── Frontend ──────────────────────────────────────────────────────────────
cd ..
if [ "$SKIP_FRONTEND" = false ]; then
  info "Building frontend..."
  cd frontend
  npm install --silent
  npm run build
  sudo cp -r dist/* /var/www/html/
  cd ..
  success "Frontend deployed"
else
  warn "Skipping frontend build (--skip-frontend)"
fi

# ── Health check ──────────────────────────────────────────────────────────
info "Running health check..."
sleep 3
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)

if [ "$HTTP_STATUS" = "200" ]; then
  success "Health check passed (HTTP $HTTP_STATUS)"
else
  warn "Health check returned HTTP $HTTP_STATUS — check pm2 logs"
fi

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
success "Deployment complete in ${ELAPSED}s"
echo ""
echo "  Backend status: pm2 status"
echo "  Backend logs:   pm2 logs resumeai-backend"
echo "  Nginx logs:     sudo tail -f /var/log/nginx/error.log"
echo ""
