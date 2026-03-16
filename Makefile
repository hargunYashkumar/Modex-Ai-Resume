# ResumeAI Makefile
# Usage: make <target>

.PHONY: help setup dev build test migrate seed clean docker docker-dev logs deploy

# ── Colours ──────────────────────────────────────────────────────────────────
BLUE  := \033[0;34m
GREEN := \033[0;32m
RESET := \033[0m

help: ## Show this help
	@echo ""
	@echo "  ResumeAI — available commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ── First-time setup ─────────────────────────────────────────────────────────
setup: ## Run interactive first-time setup
	@bash setup.sh

# ── Development ──────────────────────────────────────────────────────────────
dev-backend: ## Start backend dev server (port 5000)
	@cd backend && npm run dev

dev-frontend: ## Start frontend dev server (port 3000)
	@cd frontend && npm run dev

dev: ## Start both servers concurrently
	@npm run dev

# ── Database ─────────────────────────────────────────────────────────────────
migrate: ## Run pending database migrations
	@cd backend && npm run db:migrate

migrate-down: ## Roll back last migration
	@cd backend && npm run db:migrate:down

seed: ## Seed demo data (demo@resumeai.app / demo1234)
	@cd backend && npm run db:seed

# ── Testing ───────────────────────────────────────────────────────────────────
test: ## Run backend test suite
	@cd backend && npm test

test-watch: ## Run tests in watch mode
	@cd backend && npx jest --watch

test-coverage: ## Run tests with coverage report
	@cd backend && npx jest --coverage

# ── Build ─────────────────────────────────────────────────────────────────────
build: ## Build frontend for production
	@cd frontend && npm run build

install: ## Install all dependencies
	@cd backend  && npm install
	@cd frontend && npm install

# ── Docker ────────────────────────────────────────────────────────────────────
docker: ## Start production Docker stack
	@docker-compose up --build

docker-dev: ## Start development Docker stack (hot reload)
	@docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

docker-down: ## Stop Docker stack
	@docker-compose down

docker-clean: ## Stop stack and remove volumes
	@docker-compose down -v

docker-migrate: ## Run migrations inside Docker
	@docker-compose exec backend npm run db:migrate

docker-seed: ## Run seed inside Docker
	@docker-compose exec backend npm run db:seed

logs: ## Tail backend logs
	@docker-compose logs -f backend

# ── Production (EC2) ──────────────────────────────────────────────────────────
deploy: ## Deploy to EC2 (run from server)
	@bash deploy.sh

deploy-frontend-only: ## Rebuild and deploy frontend only
	@bash deploy.sh --skip-migrate

# ── Utilities ─────────────────────────────────────────────────────────────────
clean: ## Remove node_modules and build artifacts
	@rm -rf backend/node_modules frontend/node_modules frontend/dist
	@echo "$(GREEN)Cleaned.$(RESET)"

lint: ## Lint frontend code
	@cd frontend && npm run lint

generate-secret: ## Generate a secure JWT secret
	@node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"

check-env: ## Verify required env vars are set
	@echo "Checking backend .env..."
	@cd backend && node -e " \
		require('dotenv').config(); \
		const req = ['DATABASE_URL','JWT_SECRET','GOOGLE_CLIENT_ID','ANTHROPIC_API_KEY']; \
		const missing = req.filter(k => !process.env[k]); \
		if (missing.length) { console.error('Missing:', missing.join(', ')); process.exit(1); } \
		else console.log('All required env vars present ✓'); \
	"
