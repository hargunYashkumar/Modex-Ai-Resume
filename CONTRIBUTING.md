# Contributing to ResumeAI

Thank you for your interest in contributing!

## Development Setup

1. Follow the instructions in `docs/SETUP.md`
2. Run `bash setup.sh` for automated first-time setup

## Project Structure

```
resumeai/
├── backend/               Node.js + Express API
│   ├── src/
│   │   ├── __tests__/     Jest integration tests
│   │   ├── middleware/     auth, validate, auditLog
│   │   ├── models/         DB connection pool
│   │   ├── routes/         Route handlers
│   │   ├── services/       aiService, uploadService, emailService
│   │   └── utils/          logger, seed
│   └── migrations/        node-pg-migrate schema files
└── frontend/              React + Vite SPA
    └── src/
        ├── components/
        │   ├── layout/    AppLayout, sidebar
        │   ├── resume/    Editor, Preview, AI tools, Export
        │   └── ui/        Spinner, Modal, ErrorBoundary, Badge...
        ├── hooks/         useAutoSave, useDebounce, useResume...
        ├── pages/         Route-level page components
        ├── store/         Zustand stores (auth, resume, job, course)
        └── utils/         api.js (Axios), format.js
```

## Branch Strategy

- `main` — production-ready, deployed automatically via GitHub Actions
- `dev` — integration branch, merged to main via PR
- `feature/your-feature` — feature branches off `dev`

## Running Tests

```bash
cd backend
npm test               # all tests
npm test -- --watch    # watch mode
npm test -- --coverage # coverage report
```

Tests use a real PostgreSQL test database. Set `DATABASE_URL` pointing to a test DB and run `npm run db:migrate` before the first run.

## Adding a Migration

```bash
cd backend
# Create a new migration file (timestamp is auto-generated)
npx node-pg-migrate create your-migration-name

# Apply
npm run db:migrate

# Roll back one step
npm run db:migrate:down
```

## AI Prompts

All Claude prompts live in `backend/src/routes/ai.js` and use `aiService.askJSON()`. When modifying prompts:

1. Test locally with a real Anthropic API key
2. Add a Jest test with a mocked `askJSON` response
3. Document the expected JSON shape in a comment

## Code Style

- ES modules on frontend (`.jsx`), CommonJS on backend (`.js`)
- 2-space indentation throughout
- Single quotes in JS, double quotes in JSX attributes
- `async/await` only — no raw `.then()` chains
- All route handlers wrapped in `asyncHandler()` from `middleware/validate.js`

## Submitting a PR

1. Fork the repo and create a feature branch
2. Write tests for new backend routes
3. Run `npm test` — all tests must pass
4. Open a PR against `dev` with a clear description of what changed and why
