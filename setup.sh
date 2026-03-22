#!/usr/bin/env bash
# setup.sh — First-time local setup for Modex
# Usage: bash setup.sh
# Requires: Node.js 20+, PostgreSQL running locally

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

info()    { echo -e "${BLUE}ℹ ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC}  $1"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $1"; }
error()   { echo -e "${RED}✗${NC}  $1"; exit 1; }
step()    { echo -e "\n${BLUE}──────────────────────────────────────────${NC}"; echo -e "${BLUE}▶ $1${NC}"; }

# ── Check prerequisites ───────────────────────────────────────────────────
step "Checking prerequisites"

command -v node >/dev/null 2>&1 || error "Node.js not found. Install from https://nodejs.org"
NODE_VER=$(node --version | cut -d. -f1 | tr -d 'v')
[ "$NODE_VER" -ge 18 ] && success "Node.js $(node --version)" || error "Need Node.js 18+, got $(node --version)"

command -v npm  >/dev/null 2>&1 && success "npm $(npm --version)"  || error "npm not found"
command -v psql >/dev/null 2>&1 && success "psql found" || warn "psql not in PATH — make sure PostgreSQL is running"

# ── Backend .env ──────────────────────────────────────────────────────────
step "Setting up backend environment"

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  warn "Created backend/.env from template."
  warn "Please fill in these required values before running:"
  echo ""
  echo "  DATABASE_URL      — your PostgreSQL connection string"
  echo "  GOOGLE_CLIENT_ID  — from Google Cloud Console"
  echo "  GOOGLE_CLIENT_SECRET"
  echo "  HUGGINGFACE_API_KEY — from huggingface.co/settings/tokens (DeepSeek via Inference API)"
  echo ""
  read -p "Press Enter after editing backend/.env to continue..." _
else
  success "backend/.env already exists"
fi

# ── Frontend .env ─────────────────────────────────────────────────────────
step "Setting up frontend environment"

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  warn "Created frontend/.env — fill in VITE_GOOGLE_CLIENT_ID"
  read -p "Press Enter after editing frontend/.env to continue..." _
else
  success "frontend/.env already exists"
fi

# ── Install dependencies ──────────────────────────────────────────────────
step "Installing backend dependencies"
cd backend && npm install && cd ..
success "Backend deps installed"

step "Installing frontend dependencies"
cd frontend && npm install && cd ..
success "Frontend deps installed"

# ── Database setup ────────────────────────────────────────────────────────
step "Running database migrations"
cd backend

# Load DATABASE_URL from .env
export $(grep -v '^#' .env | grep DATABASE_URL | xargs)

if [ -z "$DATABASE_URL" ]; then
  error "DATABASE_URL not set in backend/.env"
fi

npm run db:migrate && success "Migrations complete"

read -p "Seed demo data? (demo account + sample resume) [y/N] " SEED
if [[ "$SEED" =~ ^[Yy]$ ]]; then
  npm run db:seed && success "Demo data seeded (demo@modex.app / demo1234)"
fi

cd ..

# ── Done ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Modex is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Start the app:"
echo ""
echo -e "    ${BLUE}Terminal 1:${NC} cd backend && npm run dev   (API on :5000)"
echo -e "    ${BLUE}Terminal 2:${NC} cd frontend && npm run dev  (App on :3000)"
echo ""
echo "  Or with Docker:"
echo -e "    ${BLUE}docker-compose up --build${NC}"
echo ""
echo "  Demo login: demo@modex.app / demo1234"
echo ""
