# Changelog

## v1.0.0 — Complete Release

### Backend
- Google OAuth 2.0 + JWT authentication (7-day tokens)
- Email/password registration and login with bcrypt (rounds=12)
- Password reset via email (SHA-256 hashed tokens, 1-hour expiry)
- 13 database tables across 2 migrations (node-pg-migrate)
- 30+ REST API endpoints across 8 route files
- 6 AI endpoints using Claude (parse, ATS score, bullet improver, summary, job match, course recommendations, tailor)
- Resume sharing with 256-bit tokens and view counts
- Audit logging middleware on all 2xx mutations
- Centralised AI service with retry logic (`aiService.js`)
- Upload service with S3/local disk fallback (`uploadService.js`)
- Email service with SES/SendGrid/console fallback (`emailService.js`)
- Request logger middleware (dev only)
- Proper Helmet CSP (not disabled)
- Rate limiting: 100/15min global, 10/min for AI routes
- Docker entrypoint that waits for DB readiness before migrating
- Multi-stage Dockerfiles with non-root users
- 6 test files: auth, resumes, ai (mocked), share, users, jobs

### Frontend
- 12 pages: Landing, Auth, Dashboard, Resume List, Resume Builder, Jobs, Courses, Profile, Public Resume, Reset Password, Not Found, Legal
- 5 resume templates: Modern, Minimal, Executive, Sidebar, Creative
- Live preview with instant re-render on every change
- Auto-save (2.5s debounce) with version history
- PDF + HTML export, public share links with view counts
- AI Toolbar: ATS scorer, bullet improver, summary generator, job tailor
- Template picker with live previews
- Customiser: 6 colour presets, custom colours, fonts, spacing, section toggles
- Resume upload with AI parsing (PDF/DOCX → structured JSON)
- Keyboard shortcuts: Cmd+S saves, Cmd+P previews, 1–5 switches panels
- 4 Zustand stores: auth, resume, job, course
- 11 hooks: useAutoSave, useDebounce, useLocalStorage, useResume, useWindowSize, useTitle, useToast, useAuth, useConfirm, useKeyboardShortcut, useBuilderShortcuts
- ATS Score Gauge (SVG circular progress, colour-coded)
- Error boundary wrapping the full app
- `useConfirm` hook for imperative delete confirmations
- Branded AI toast notifications (gold-bordered with ✦ icon)
- Responsive design: sidebar collapses on mobile
- `robots.txt`, `manifest.json`, OG meta tags, noscript fallback
- Terms of Service and Privacy Policy pages

### Infrastructure
- Docker Compose with pgAdmin on `--profile dev`
- `docker-compose.dev.yml` for hot-reload development
- PM2 ecosystem config with clustering and memory guard
- GitHub Actions CI/CD: test → build → deploy to EC2
- Makefile with 20 convenience commands
- Full AWS deployment guide (EC2 t2.micro + RDS db.t3.micro, free tier)
- One-command setup script (`setup.sh`)
- Zero-downtime deploy script (`deploy.sh`)
- Security checklist in `ARCHITECTURE.md`

### Docs
- `QUICKSTART.md` — get running in 10 minutes
- `docs/SETUP.md` — detailed local setup guide
- `docs/ARCHITECTURE.md` — routes, middleware chain, DB schema, security checklist, env vars reference
- `docs/AWS_DEPLOYMENT.md` — 13-step AWS deployment guide
