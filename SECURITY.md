# Security Policy

## Reporting Vulnerabilities

Please report security issues to **security@resumeai.app** rather than opening a public issue.

---

## Implemented Protections

### Authentication & Authorisation
- JWT tokens signed with HS256, expire after 7 days
- Google OAuth 2.0 tokens verified server-side via `google-auth-library`
- Every protected route verifies token and checks user still exists in DB
- Password hashing with `bcryptjs` at cost factor 12
- Password reset tokens are SHA-256 hashed before storage, expire in 1 hour, single-use

### Input Validation
- All user inputs validated with `express-validator` before processing
- SQL queries use parameterised placeholders exclusively — no string interpolation
- File uploads restricted to PDF/DOCX, max 5 MB, scanned via `multer` before parsing

### Transport & Headers
- Helmet.js with Content Security Policy, HSTS, X-Frame-Options, and more
- CORS restricted to configured `FRONTEND_URL` only
- Rate limiting: 100 req/15 min globally, 10 req/min for AI endpoints specifically

### Data
- Ownership check on every resume/job operation — users can only access their own data
- Audit log records create/delete operations with IP and user ID
- Database runs in private subnet in production (not publicly accessible)
- S3 bucket blocks all public access; files served via signed URLs

---

## Production Hardening Checklist

Before going live, complete these steps:

- [ ] Generate a strong `JWT_SECRET` (48+ random bytes)
- [ ] Set `NODE_ENV=production`
- [ ] Enable SSL on RDS and set `?sslmode=require` in `DATABASE_URL`
- [ ] Put RDS in a private subnet — not publicly accessible
- [ ] Set `AWS_SES_REGION` and configure email sending for password reset
- [ ] Enable CloudTrail on your AWS account for API-level audit logs
- [ ] Set up CloudWatch Alarms on 5xx error rate and high CPU
- [ ] Review and tighten EC2 Security Group — remove port 5000 after Nginx is confirmed working
- [ ] Enable automatic OS security updates: `sudo unattended-upgrades`
- [ ] Set up daily RDS automated backups with 7-day retention
- [ ] Rotate `JWT_SECRET` and `ANTHROPIC_API_KEY` every 90 days

---

## Known Limitations (acceptable for v1)

- JWT tokens cannot be revoked before expiry (no token blacklist). Mitigation: short expiry (7d).
- No IP-based lockout on password attempts — rate limiter provides partial protection.
- PDF export uses `html2canvas` which requires the preview to be rendered in-browser.
