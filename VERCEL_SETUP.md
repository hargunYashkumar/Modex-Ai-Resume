# Vercel deployment (frontend + backend) + Neon + DeepSeek AI

This project is set up for **two Vercel projects** from the same repo (different **Root Directory**): one for the **React/Vite frontend**, one for the **Express API** (serverless entry: `backend/api/index.js`).

**Database:** use **[Neon](https://neon.tech)** serverless PostgreSQL. Paste Neon’s **connection string** into the backend project as `DATABASE_URL` (prefer the **pooled** connection string for serverless functions).

**AI:** the backend calls **[Hugging Face Inference API](https://huggingface.co/docs/api-inference)** with **DeepSeek** models defined in `backend/src/services/aiService.js`. Create a token at https://huggingface.co/settings/tokens and set `HUGGINGFACE_API_KEY` on the backend.

---

## 1. Neon (PostgreSQL)

1. Create a project at https://console.neon.tech
2. Copy the connection string (use **pooled** for Vercel serverless)
3. Run migrations **once** against that database (from your laptop or CI):

   ```bash
   cd backend
   DATABASE_URL="postgresql://..." npm run db:migrate
   npm run db:seed   # optional
   ```

---

## 2. Frontend Vercel project

1. Vercel Dashboard → **New Project** → import this repository
2. **Root Directory:** `frontend`
3. Framework: **Vite** (auto-detected)
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment variables**

   | Name | Example / notes |
   |------|-----------------|
   | `VITE_API_URL` | **Full URL of your backend**, e.g. `https://your-backend.vercel.app` — must be absolute when frontend and backend are separate projects (do **not** use `/api` alone) |
   | `VITE_GOOGLE_CLIENT_ID` | Same **Web client** ID as in Google Cloud Console |

7. Add your Vercel frontend URL to **Google OAuth** → Authorised JavaScript origins

---

## 3. Backend Vercel project

1. **New Project** → same repository
2. **Root Directory:** `backend`
3. Framework: **Other** (Express is invoked via Vercel’s serverless handler)
4. **Build Command:** `npm run build` (ensures `public/` exists; see `backend/package.json`)
5. **Output / entry:** follow `backend/vercel.json` rewrites to `api/index.js`
6. **Environment variables**

   | Name | Required | Notes |
   |------|----------|--------|
   | `DATABASE_URL` | Yes | Neon connection string (pooled recommended) |
   | `JWT_SECRET` | Yes | Long random string |
   | `GOOGLE_CLIENT_ID` | Yes | OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | Yes | OAuth secret |
   | `FRONTEND_URL` | Yes | Your **frontend** Vercel URL (CORS + email links), e.g. `https://your-app.vercel.app` |
   | `NODE_ENV` | Yes | `production` |
   | `HUGGINGFACE_API_KEY` | Yes (live AI) | Hugging Face token for DeepSeek inference |
   | `AI_MOCK_MODE` | No | `true` only for demos without HF calls |
   | `EMAIL_PROVIDER` | No | `log` / `ses` / `sendgrid` |
   | AWS vars | No | Only if using S3 uploads or SES email |

7. Add your **backend** Vercel URL to Google OAuth **Authorised redirect URIs** if you use redirect-based flows (match your `FRONTEND_URL` / API callback paths as configured in code).

---

## 4. After deploy

- Open the frontend URL; sign-in should call the backend at `VITE_API_URL`.
- Hit `https://your-backend.vercel.app/health` — `database.status` should be `ok` if `DATABASE_URL` is correct.

---

## Why two projects?

Vercel treats static frontends and Node serverless functions differently. Splitting **frontend** and **backend** gives independent deploys, logs, and env vars. The frontend must use an **absolute** `VITE_API_URL` pointing at the backend origin.

---

## Optional: single repo env file for reference

Do not commit secrets. Locally, copy `backend/.env.example` and `frontend/.env.example` and fill `HUGGINGFACE_API_KEY` and Neon `DATABASE_URL`.
