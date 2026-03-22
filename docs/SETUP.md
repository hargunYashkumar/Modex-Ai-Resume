# Modex — Local Setup Guide

## Prerequisites

| Tool        | Version | Install |
|-------------|---------|---------|
| Node.js     | 20+     | https://nodejs.org |
| PostgreSQL  | 14+     | https://postgresql.org (or use **Neon** / Docker only) |
| Git         | any     | https://git-scm.com |

---

## 1. Get API Keys

### Hugging Face (DeepSeek via Inference API)

AI features use **`backend/src/services/aiService.js`** with the **Hugging Face Inference API** and **DeepSeek** models.

1. Create an account at https://huggingface.co
2. Settings → **Access Tokens** → create a token with **read** permission
3. Add to `backend/.env` as `HUGGINGFACE_API_KEY`

Optional: set `AI_MOCK_MODE=true` for local development without calling the API (returns mock structured data).

### Google OAuth 2.0

1. Go to https://console.cloud.google.com
2. Create project → **Modex**
3. APIs & Services → Credentials → **Create OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorised JavaScript origins:
   - `http://localhost:3000`
   - Your Vercel frontend URL when deployed
6. Authorised redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (adjust port if needed)
   - Production callback URL on your backend host
7. Copy **Client ID** → `GOOGLE_CLIENT_ID` in both `.env` files
8. Copy **Client Secret** → `GOOGLE_CLIENT_SECRET` in `backend/.env`

---

## 2. Create PostgreSQL Database

### Option A — Local Postgres

```bash
psql -U postgres -c "CREATE DATABASE modex_db;"
```

Or with a GUI like TablePlus / pgAdmin — create a database named `modex_db`.

### Option B — Neon (matches production-style hosting)

1. Create a project at https://neon.tech
2. Create a database; copy the **connection string** (use the **pooled** URI for apps that open many short-lived connections)
3. Set `DATABASE_URL` in `backend/.env` to that string
4. Run migrations from your machine: `cd backend && npm run db:migrate`

---

## 3. Configure Environment Files

### backend/.env

```env
NODE_ENV=development
PORT=5000

# Local example — or paste Neon connection string:
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/modex_db
JWT_SECRET=change-this-to-a-random-64-char-string
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
HUGGINGFACE_API_KEY=hf_xxx
FRONTEND_URL=http://localhost:3000
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000
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
npm run db:migrate     # creates all tables
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

- **Email:** `demo@modex.app`
- **Password:** `demo1234`

Or register a new account (email/password or Google).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED 5432` | PostgreSQL isn't running — start it, or use Neon and `DATABASE_URL` |
| `invalid_grant` on Google OAuth | Add your app origin to authorised origins in Google Console |
| `Cannot find module 'pg'` | Run `npm install` inside the `backend/` folder |
| CORS error in browser | Set `FRONTEND_URL` to your exact frontend origin (including Vercel URL in prod) |
| Blank page / 404 | Ensure Vite is running and `VITE_API_URL` points at the API |
| AI errors / missing key | Set `HUGGINGFACE_API_KEY` or `AI_MOCK_MODE=true` for testing |

---

## Docker Alternative

If you prefer Docker (no local Node.js or Postgres installation needed):

```bash
# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both files with your API keys (use HUGGINGFACE_API_KEY for AI)

# Start everything
docker-compose up --build

# Run migrations inside the container
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

Visit http://localhost

---

## Production: Vercel + Neon

See **[`../VERCEL_SETUP.md`](../VERCEL_SETUP.md)** for deploying the frontend and backend to Vercel with Neon as `DATABASE_URL`.
