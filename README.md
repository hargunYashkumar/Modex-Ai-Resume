# Modex 🚀

An AI-powered resume builder with job matching, skill gap analysis, and course recommendations — built with React, Node.js, PostgreSQL, and **DeepSeek** models via the **Hugging Face Inference API**.

## Features

- **AI Resume Parser** — upload PDF/DOCX, AI extracts every detail instantly
- **5 Professional Templates** — Modern, Minimal, Executive, Sidebar, Creative
- **Full Customisation** — colours, fonts, font size, spacing, section visibility
- **ATS Scoring** — real-time compatibility score with section-level feedback
- **AI Bullet Improver** — DeepSeek rewrites bullet points with impact metrics
- **AI Summary Generator** — generate a professional summary in one click
- **Resume Tailoring** — tailor your resume to any job description with match score
- **Job Matching** — AI surfaces the roles you're most qualified for right now
- **Course Roadmap** — personalised learning path with curated courses and certifications
- **Public Share Links** — shareable view-only link with view count tracking
- **Export** — PDF, HTML download; public share link
- **Google OAuth 2.0 + email/password** — full auth with password reset via email
- **Version History** — every save creates an immutable snapshot
- **Keyboard shortcuts** — ⌘S saves, ⌘P previews, 1-5 switch builder panels

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Zustand |
| Backend  | Node.js 18+, Express.js |
| Database | PostgreSQL (local, Docker, or **[Neon](https://neon.tech)** serverless in production) |
| Migrations | node-pg-migrate |
| AI       | **Hugging Face Inference API** — **DeepSeek** model chain (`aiService.js`) |
| Auth     | Google OAuth 2.0 + JWT (HS256) |
| Export   | jsPDF + html2canvas (dynamic import) |
| Hosting  | **[Vercel](https://vercel.com)** — separate projects for frontend + backend (serverless) |
| DevOps   | Docker, PM2, GitHub Actions; optional AWS EC2 + RDS (see `docs/AWS_DEPLOYMENT.md`) |

## Production deployment (current)

| Component | Typical setup |
|-----------|----------------|
| **Frontend** | Vercel project, root `frontend/` — static Vite build |
| **Backend** | Vercel project, root `backend/` — Express as serverless function (`api/index.js`) |
| **Database** | **[Neon](https://neon.tech)** PostgreSQL — set `DATABASE_URL` to the Neon connection string (pooled URI recommended for serverless) |
| **AI** | **[Hugging Face](https://huggingface.co/settings/tokens)** — `HUGGINGFACE_API_KEY`; models are DeepSeek variants configured in `backend/src/services/aiService.js` |

Step-by-step: [`VERCEL_SETUP.md`](VERCEL_SETUP.md). For AWS instead of Vercel: [`docs/AWS_DEPLOYMENT.md`](docs/AWS_DEPLOYMENT.md).

## Quick Start

```bash
git clone https://github.com/hargunYashkumar/MODEX.git
cd MODEX
make setup          # guided first-time setup
make dev            # starts backend :5000 + frontend :3000
```

Or read [`QUICKSTART.md`](QUICKSTART.md) for step-by-step instructions.

Demo login after seeding: `demo@modex.app` / `demo1234`

## Docker

```bash
cp backend/.env.example backend/.env     # fill in API keys
cp frontend/.env.example frontend/.env
docker-compose up --build
# First run: docker-compose exec backend npm run db:migrate && npm run db:seed
```

Add `--profile dev` for pgAdmin at http://localhost:5050.

## Project Structure

```
modex/
├── backend/
│   ├── src/
│   │   ├── __tests__/    6 test files (Jest + Supertest)
│   │   ├── middleware/   auth, validate, auditLog, requestLogger
│   │   ├── models/       pg connection pool
│   │   ├── routes/       8 route files, 30+ endpoints
│   │   ├── services/     aiService, uploadService, emailService
│   │   └── utils/        logger, seed
│   └── migrations/       2 migration files, 15 tables
├── frontend/
│   └── src/
│       ├── components/   layout, resume (5 templates), ui
│       ├── hooks/        12 hooks
│       ├── pages/        12 pages
│       ├── store/        4 Zustand stores
│       └── utils/        api, format
└── docs/
    ├── QUICKSTART.md
    ├── SETUP.md
    ├── ARCHITECTURE.md
    ├── PROJECT_REPORT.md
    └── AWS_DEPLOYMENT.md
```

## Database Schema

15 tables: `users`, `user_profiles`, `resumes`, `resume_versions`, `work_experiences`, `educations`, `projects`, `certifications`, `resume_shares`, `user_sessions`, `password_reset_tokens`, `job_searches`, `saved_jobs`, `course_recommendations`, `audit_logs`

## CI / GitHub Actions

Workflow runs backend tests + migrations and frontend build on pushes to `main`. For **AWS-based** deploys, optional secrets include `EC2_HOST`, `EC2_SSH_KEY`, and `VITE_GOOGLE_CLIENT_ID` — see `docs/AWS_DEPLOYMENT.md`. **Vercel** deploys are configured in the Vercel dashboard (see `VERCEL_SETUP.md`).

## Useful Commands

```bash
make dev              # Start frontend + backend
make test             # Run all backend tests
make migrate          # Run pending DB migrations
make seed             # Seed demo data
make docker           # Full Docker stack
make docker-dev       # Docker with hot reload + pgAdmin
make check-env        # Verify required env vars
make generate-secret  # Generate a JWT secret
make help             # All commands
```

## License

MIT
