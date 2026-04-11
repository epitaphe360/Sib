---
description: "Perform comprehensive security audits: OWASP Top 10 vulnerability scanning, dependency analysis, secret detection, authentication hardening, SQL injection, XSS prevention, CSRF protection, rate limiting validation, input sanitization checks."
---

# Security Audit Skill

## When to Activate
- User asks to audit, scan, or check security
- User mentions vulnerabilities, OWASP, CVE, XSS, CSRF, SQL injection
- User asks about authentication hardening or rate limiting
- User mentions dependency security or secret detection

## Instructions

### Phase 1: Reconnaissance
1. Identify the technology stack (Express.js, React, PostgreSQL/Drizzle ORM for this project)
2. Locate entry points: `server/index.ts`, `server/routes.ts`, `server/admin-routes.ts`, `server/public-api-routes.ts`, `server/payment-routes.ts`
3. Check middleware configuration (helmet, CORS, rate limiting)
4. Identify authentication mechanisms and session handling

### Phase 2: OWASP Top 10 Analysis
Systematically check each category:

| # | Category | What to Check |
|---|----------|--------------|
| A01 | Broken Access Control | Route authorization, admin-only guards, IDOR |
| A02 | Cryptographic Failures | Password hashing (scrypt/bcrypt), TLS, token generation |
| A03 | Injection | SQL injection via Drizzle ORM, XSS in templates, command injection |
| A04 | Insecure Design | Business logic flaws, missing rate limits |
| A05 | Security Misconfiguration | Helmet CSP, CORS origins, debug endpoints |
| A06 | Vulnerable Components | npm audit, outdated dependencies |
| A07 | Authentication Failures | Brute force protection, password complexity, session management |
| A08 | Data Integrity Failures | Unsigned tokens, insecure deserialization |
| A09 | Logging Failures | Missing audit logs, PII in logs |
| A10 | SSRF | URL validation in fetch/redirect endpoints |

### Phase 3: Code-Level Scanning
For each server file:
1. Check all `req.body` / `req.params` / `req.query` usage for validation (Zod schemas preferred)
2. Verify SQL queries use parameterized statements (Drizzle ORM `eq()`, `and()`, `sql` template)
3. Check for `eval()`, `exec()`, `child_process` usage
4. Verify file upload MIME type and size restrictions
5. Check rate limiters on sensitive endpoints (login, password reset, payment)
6. Verify HMAC/crypto operations use timing-safe comparison

### Phase 4: Dependency Audit
```bash
npm audit
npx npm-check-updates
```

### Phase 5: Report
Output a structured report:
```markdown
## Security Audit Report

### Critical (Immediate Action)
- [C1] Description | File | Line | Fix

### High (Fix This Sprint)
- [H1] Description | File | Line | Fix

### Medium (Plan Fix)
- [M1] Description | File | Line | Fix

### Low (Informational)
- [L1] Description | File | Line | Fix

### Passed Checks ✅
- List of security controls that are properly implemented
```

## Project-Specific Context
- Backend: Express.js with helmet (CSP, HSTS), express-rate-limit
- ORM: Drizzle ORM with PostgreSQL (parameterized by default)
- Auth: bcrypt/scrypt password hashing, JWT tokens, magic links with crypto.randomBytes
- Payments: Stripe integration with HMAC-signed devis routes
- File uploads: MIME whitelist (no ZIP), multer with size limits
- Frontend: React SPA, no SSR (limited XSS surface)
