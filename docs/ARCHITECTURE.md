# ResumeAI — Architecture Reference

## System Overview

```
Browser (React SPA)
  │
  ├── /api/*  →  Express API (Node.js)
  │               ├── PostgreSQL (RDS)
  │               ├── Claude AI (Anthropic SDK)
  │               └── S3 (file uploads, optional)
  │
  ├── /r/:token  →  Public resume view (no auth)
  └── /*          →  React Router SPA
```

---

## Frontend Architecture

### State management — Zustand stores

| Store | File | Manages |
|-------|------|---------|
| `authStore` | `store/authStore.js` | User, JWT token, hydration |
| `resumeStore` | `store/resumeStore.js` | Resume list, current resume, ATS data |
| `jobStore` | `store/jobStore.js` | Saved jobs, job search results |
| `courseStore` | `store/courseStore.js` | Course recommendations |

All stores use `zustand`. `authStore` uses `persist` middleware to survive page reloads.

### Routing

```
/                    LandingPage          (public)
/auth                AuthPage             (public, redirects → /dashboard if authed)
/auth/forgot-password  ResetPasswordPage  (public)
/auth/reset-password   ResetPasswordPage  (public, reads ?token=)
/r/:token            PublicResumePage     (public, no auth)
/dashboard           DashboardPage        (protected)
/resumes             ResumeListPage       (protected)
/resumes/new         ResumeBuilder        (protected)
/resumes/:id/edit    ResumeBuilder        (protected)
/jobs                JobsPage             (protected)
/courses             CoursesPage          (protected)
/profile             ProfilePage          (protected)
```

### Custom hooks

| Hook | Purpose |
|------|---------|
| `useAutoSave` | Debounced save — fires 2.5s after last content change |
| `useDebounce`  | Delays a value update — prevents API spam on keystrokes |
| `useLocalStorage` | Persists state to localStorage with graceful fallback |
| `useResume`    | Convenience wrapper around resumeStore for the builder |

### Component tree (Resume Builder)

```
ResumeBuilder (page)
├── Toolbar (title input, tab selector, save/preview buttons)
├── Left panel (340px, scrollable)
│   ├── ResumeEditor    — accordion form sections
│   ├── TemplatePicker  — 4 template cards
│   ├── CustomiserPanel — colors, font, spacing, section toggles
│   ├── AiToolbar       — ATS scorer, bullet improver, summary gen, tailor
│   └── ExportPanel     — PDF, HTML, share link
└── Preview canvas (A4, bg-stone-200)
    └── ResumePreview   — renders the live resume
        ├── ModernTemplate
        ├── MinimalTemplate
        ├── ExecutiveTemplate
        └── SidebarTemplate
```

---

## Backend Architecture

### Route map

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/google | — | Google OAuth token exchange |
| POST | /api/auth/register | — | Email/password registration |
| POST | /api/auth/login | — | Email/password login |
| GET  | /api/auth/me | ✓ | Fetch current user |
| POST | /api/auth/logout | ✓ | Logout (client clears JWT) |
| POST | /api/auth/forgot-password | — | Send password reset email |
| POST | /api/auth/reset-password | — | Reset with token |
| GET  | /api/users/profile | ✓ | Get profile |
| PUT  | /api/users/profile | ✓ | Update profile |
| GET  | /api/users/dashboard | ✓ | Dashboard stats |
| GET  | /api/resumes | ✓ | List user's resumes |
| POST | /api/resumes | ✓ | Create resume |
| GET  | /api/resumes/:id | ✓ | Get single resume (with all sections joined) |
| PUT  | /api/resumes/:id | ✓ | Update resume (saves version snapshot) |
| DELETE | /api/resumes/:id | ✓ | Delete resume |
| POST | /api/resumes/upload/parse | ✓ | Upload + extract text from PDF/DOCX |
| POST | /api/resumes/:id/duplicate | ✓ | Duplicate resume |
| POST | /api/ai/parse-resume | ✓ | AI: parse raw text → structured JSON |
| POST | /api/ai/ats-score | ✓ | AI: ATS compatibility analysis |
| POST | /api/ai/improve-bullet | ✓ | AI: rewrite a bullet point |
| POST | /api/ai/generate-summary | ✓ | AI: write professional summary |
| POST | /api/ai/job-matches | ✓ | AI: find matching roles |
| POST | /api/ai/course-recommendations | ✓ | AI: curate learning roadmap |
| POST | /api/ai/tailor-resume | ✓ | AI: tailor resume for a JD |
| GET  | /api/jobs/saved | ✓ | List saved jobs |
| POST | /api/jobs/save | ✓ | Save a job |
| PATCH | /api/jobs/:id/status | ✓ | Update application status |
| DELETE | /api/jobs/:id | ✓ | Remove saved job |
| GET  | /api/courses/history | ✓ | Past recommendations |
| POST | /api/share/:resumeId/generate | ✓ | Create public share link |
| GET  | /api/share/:token | — | Public: view shared resume |
| DELETE | /api/share/:resumeId | ✓ | Revoke share link |
| GET  | /api/share/:resumeId/stats | ✓ | View count + link status |

### Middleware chain

```
Request
  → helmet (CSP, XSS headers)
  → cors (FRONTEND_URL whitelist)
  → rateLimit (100 req/15min global, 10 req/min for /api/ai/*)
  → express.json (10MB limit)
  → authenticate (JWT verify, attaches req.userId)
  → validate (express-validator, returns 400 on failure)
  → route handler
  → auditLog (writes to audit_logs on 2xx, fire-and-forget)
  → global error handler
```

### Services

| Service | File | Responsibility |
|---------|------|----------------|
| `aiService` | `services/aiService.js` | Anthropic SDK wrapper, retry logic, JSON parsing |
| `uploadService` | `services/uploadService.js` | S3 in prod, local disk in dev |
| `emailService` | `services/emailService.js` | SES/SendGrid/console-log email sending |

---

## Database Schema

### Tables

```
users                 — accounts (email + google_id, both optional)
user_profiles         — phone, location, links, skills JSON
resumes               — title, template_id, content JSON, customization JSON
resume_versions       — immutable snapshots (created on each PUT)
work_experiences      — normalised work history rows
educations            — normalised education rows
projects              — normalised project rows
certifications        — normalised certification rows
resume_shares         — public share tokens with view counts
user_sessions         — (future: JWT blacklist for forced logout)
password_reset_tokens — one-time reset tokens (hashed)
job_searches          — AI search queries + results JSON
saved_jobs            — user's bookmarked jobs with status pipeline
course_recommendations — AI recommendation runs
audit_logs            — immutable event log
```

### Key design decisions

- `resumes.content` is a JSONB column holding all resume data. The normalised `work_experiences`, `educations` etc. tables exist for structured querying. On write, only `content` is updated — the normalised tables are populated by the seed and can be synced if needed.
- `resume_shares.share_token` is a 32-byte random hex string (256-bit entropy). Not a JWT — no expiry embedded; expiry is checked server-side from `expires_at`.
- `password_reset_tokens.token_hash` is SHA-256 of the raw token. The raw token is only ever in the URL; the DB stores only the hash.
- All UUIDs use `uuid_generate_v4()` via the `uuid-ossp` extension.

---

## Security Checklist

- [x] Helmet CSP configured (not disabled)
- [x] CORS restricted to FRONTEND_URL
- [x] Rate limiting: global (100/15min) + AI routes (10/min)
- [x] JWT signed with HS256, validated on every protected route
- [x] Passwords hashed with bcrypt (rounds=12)
- [x] Google tokens verified server-side via `google-auth-library`
- [x] Password reset tokens hashed before storage
- [x] File uploads: type whitelist (PDF/DOCX), 5MB max
- [x] SQL: all queries use parameterised `$1, $2` — no concatenation
- [x] Audit log on all 2xx mutations
- [x] Share tokens: 256-bit entropy, server-side expiry check
- [x] Error messages: no stack traces in production responses
- [ ] TODO: Add refresh token rotation (current JWTs are 7d, stateless)
- [ ] TODO: Add CAPTCHA on register/login for bot protection
- [ ] TODO: Enable RDS encryption at rest

---

## Environment Variables Reference

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | |
| `PORT` | No | 5000 | |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | ≥32 char random string |
| `JWT_EXPIRES_IN` | No | 7d | |
| `GOOGLE_CLIENT_ID` | Yes | — | OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | — | OAuth 2.0 secret |
| `ANTHROPIC_API_KEY` | Yes | — | `sk-ant-...` |
| `FRONTEND_URL` | Yes | http://localhost:3000 | For CORS + email links |
| `EMAIL_PROVIDER` | No | log | `log` / `ses` / `sendgrid` |
| `EMAIL_FROM` | No | noreply@resumeai.app | Sender address |
| `AWS_ACCESS_KEY_ID` | If S3 | — | |
| `AWS_SECRET_ACCESS_KEY` | If S3 | — | |
| `AWS_REGION` | If S3 | ap-south-1 | |
| `AWS_S3_BUCKET` | If S3 | — | |
| `AWS_SES_REGION` | If SES email | ap-south-1 | |
| `SENDGRID_API_KEY` | If SendGrid | — | |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | `/api` in prod, `http://localhost:5000/api` in dev |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Same as backend `GOOGLE_CLIENT_ID` |
