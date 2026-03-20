# Vercel Deployment Setup

## Recommended: Two Separate Projects

### Frontend Project
1. Go to Vercel Dashboard → New Project → Import repo
2. Set **Root Directory**: `frontend`
3. Framework: `Vite` (auto-detected)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add env vars:
   - `VITE_API_URL` = `https://modex-ai-resume-backend.vercel.app`
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth client ID

### Backend Project
1. Go to Vercel Dashboard → New Project → Import **same** repo
2. Set **Root Directory**: `backend`
3. Framework: `Other`
4. Build Command: *(leave empty)*
5. Output Directory: *(leave empty)*
6. Add env vars:
   - `DATABASE_URL` = your PostgreSQL connection string
   - `JWT_SECRET` = a long random secret
   - `GOOGLE_CLIENT_ID` = your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` = your Google OAuth secret
   - `FRONTEND_URL` = your frontend Vercel URL
   - `NODE_ENV` = `production`
   - `ANTHROPIC_API_KEY` = your key (if using Claude)
   - `GEMINI_API_KEY` = your key (if using Gemini)

## Why Two Projects?
Vercel handles frontend (static) and backend (serverless) differently.
Separating them gives you independent deployments, logs, and scaling.
