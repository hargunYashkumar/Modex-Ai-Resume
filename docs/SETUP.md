# ResumeAI — Local Setup Guide

## Prerequisites

| Tool        | Version | Install |
|-------------|---------|---------|
| Node.js     | 20+     | https://nodejs.org |
| PostgreSQL  | 14+     | https://postgresql.org |
| Git         | any     | https://git-scm.com |

---

## 1. Get API Keys

### Anthropic (Claude AI)
1. Go to https://console.anthropic.com
2. API Keys → Create Key
3. Copy the `sk-ant-...` key → paste into `backend/.env` as `ANTHROPIC_API_KEY`

### Google OAuth 2.0
1. Go to https://console.cloud.google.com
2. Create project → **ResumeAI**
3. APIs & Services → Credentials → **Create OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorised JavaScript origins:
   - `http://localhost:3000`
6. Authorised redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
7. Copy **Client ID** → `GOOGLE_CLIENT_ID` in both `.env` files
8. Copy **Client Secret** → `GOOGLE_CLIENT_SECRET` in `backend/.env`

---

## 2. Create PostgreSQL Database

```bash
# Connect to Postgres
psql -U postgres

# Create database
CREATE DATABASE resumeai_db;
\q
```

Or with a GUI like TablePlus / pgAdmin — just create a database named `resumeai_db`.

---

## 3. Configure Environment Files

### backend/.env
```env
NODE_ENV=development
PORT=5000

# Replace with your actual values:
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/resumeai_db
JWT_SECRET=change-this-to-a-random-64-char-string
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
ANTHROPIC_API_KEY=sk-ant-api03-xxx
FRONTEND_URL=http://localhost:3000
```

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### frontend/.env.local
```env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## 4. Run Setup

### Automatic (recommended)
```bash
bash setup.sh
```

### Manual
```bash
# Backend
cd backend
npm install
npm run db:migrate     # creates all 12 tables
npm run db:seed        # optional: demo account + sample resume

# Frontend  
cd ../frontend
npm install
```

---

## 5. Start Development Servers

Open **two terminal windows**:

**Terminal 1 — Backend API**
```bash
cd backend
npm run dev
# → Server running on http://localhost:5000
# → Try: curl http://localhost:5000/health
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
# → App running on http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

---

## 6. Test the App

If you ran `db:seed`, you can log in with:
- **Email:** `demo@resumeai.app`
- **Password:** `demo1234`

Or register a new account (email/password or Google).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED 5432` | PostgreSQL isn't running — start it with `pg_ctl start` or your system service manager |
| `invalid_grant` on Google OAuth | Add `http://localhost:3000` to authorised origins in Google Console |
| `Cannot find module 'pg'` | Run `npm install` inside the `backend/` folder |
| CORS error in browser | Make sure `FRONTEND_URL=http://localhost:3000` in `backend/.env` |
| Blank page / 404 | Make sure Vite is running on `:3000` and the proxy in `vite.config.js` points to `:5000` |

---

## Docker Alternative

If you prefer Docker (no Node.js or Postgres installation needed):

```bash
# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit both files with your API keys

# Start everything
docker-compose up --build

# Run migrations inside the container
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

Visit http://localhost
