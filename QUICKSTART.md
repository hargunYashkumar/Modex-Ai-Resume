# ResumeAI — Quickstart

Get the app running locally in under 10 minutes.

---

## Prerequisites

- **Node.js 20+** — https://nodejs.org
- **PostgreSQL 14+** — running locally on port 5432
- **Anthropic API key** — https://console.anthropic.com (free tier available)
- **Google OAuth credentials** — https://console.cloud.google.com (free)

---

## Step 1 — Get API keys (5 min)

### Anthropic (Claude AI)
1. Go to https://console.anthropic.com → API Keys → Create Key
2. Copy the `sk-ant-...` key

### Google OAuth
1. Go to https://console.cloud.google.com → Create project **ResumeAI**
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID → **Web application**
3. Add Authorised JavaScript origins: `http://localhost:3000`
4. Add Authorised redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Copy the **Client ID** and **Client Secret**

---

## Step 2 — Create the database

```bash
psql -U postgres -c "CREATE DATABASE resumeai_db;"
```

---

## Step 3 — Configure environment

```bash
git clone https://github.com/yourusername/resumeai.git
cd resumeai

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — fill in:
#   DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ANTHROPIC_API_KEY

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local — fill in VITE_GOOGLE_CLIENT_ID
```

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

---

## Step 4 — Install, migrate, seed

```bash
make setup
# OR manually:
cd backend  && npm install && npm run db:migrate && npm run db:seed && cd ..
cd frontend && npm install && cd ..
```

---

## Step 5 — Start

```bash
make dev
# OR in two terminals:
# Terminal 1:  cd backend  && npm run dev
# Terminal 2:  cd frontend && npm run dev
```

Open **http://localhost:3000**

Demo login: `demo@resumeai.app` / `demo1234`

---

## Docker alternative (no local Node/Postgres needed)

```bash
cp backend/.env.example backend/.env   # fill in your API keys
cp frontend/.env.example frontend/.env.local

docker-compose up --build

# First run only — run migrations and seed inside the container:
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

Then open http://localhost

Add `--profile dev` to also start pgAdmin on http://localhost:5050

---

## What's in the app

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Sign in / register (Google + email) |
| `/dashboard` | Overview with stats and recent resumes |
| `/resumes` | All your resumes — upload or create |
| `/resumes/new` | Resume builder |
| `/resumes/:id/edit` | Edit resume (Cmd+S to save, 1–5 to switch panels) |
| `/jobs` | AI job matching based on your resume |
| `/courses` | Personalised learning roadmap |
| `/profile` | Your details and skills |
| `/r/:token` | Public shared resume (no login needed) |
| `/legal/terms` | Terms of service |
| `/legal/privacy` | Privacy policy |

---

## Useful commands

```bash
make dev              # Start frontend + backend
make test             # Run backend test suite
make migrate          # Run pending DB migrations
make seed             # Add demo data
make docker           # Run full stack in Docker
make check-env        # Verify all required env vars are set
make generate-secret  # Generate a JWT secret
make help             # List all commands
```

---

## Deploying to AWS

See `docs/AWS_DEPLOYMENT.md` for a full 13-step guide.

**TL;DR:**
1. EC2 t2.micro (Ubuntu) — free tier 12 months
2. RDS db.t3.micro (PostgreSQL) — free tier 12 months
3. Nginx + PM2 + Certbot SSL
4. Push to `main` → GitHub Actions auto-deploys

---

## Project structure

```
resumeai/
├── backend/           Node.js + Express API
│   ├── src/
│   │   ├── routes/    auth, resumes, ai, jobs, courses, share, users
│   │   ├── middleware/ auth, validate, auditLog, requestLogger
│   │   ├── services/  aiService, uploadService, emailService
│   │   ├── models/    db (pg connection pool)
│   │   └── utils/     logger, seed
│   └── migrations/    node-pg-migrate schemas
├── frontend/          React + Vite + Tailwind
│   └── src/
│       ├── pages/     13 pages (landing → builder → jobs → courses)
│       ├── components/ layout, resume, ui
│       ├── store/     4 Zustand stores
│       ├── hooks/     8 hooks (useAutoSave, useTitle, etc.)
│       └── utils/     api, format, useAuth
└── docs/              SETUP, ARCHITECTURE, AWS_DEPLOYMENT
```
