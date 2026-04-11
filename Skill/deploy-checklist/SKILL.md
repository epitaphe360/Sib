---
description: "Deployment preparation and checklist: pre-flight validation, environment variables check, build verification, Railway/Docker deployment, database migration readiness, rollback procedures, monitoring setup, production security verification."
---

# Deploy Checklist Skill

## When to Activate
- User asks to deploy, release, or push to production
- User mentions Railway, Docker, or production readiness
- User asks for a deployment checklist or pre-flight check

## Instructions

### Pre-Deployment Checklist

#### 1. Code Quality
- [ ] TypeScript compiles: `npx tsc --noEmit` — 0 errors
- [ ] No `console.log` in production code (use proper logging)
- [ ] All TODO/FIXME comments addressed or tracked
- [ ] No hardcoded secrets or API keys in source code

#### 2. Security
- [ ] `npm audit` shows no critical/high vulnerabilities
- [ ] Helmet middleware configured with proper CSP
- [ ] CORS restricted to production domain
- [ ] Rate limiting on login, password reset, payment endpoints
- [ ] All user inputs validated with Zod schemas
- [ ] No SQL injection vectors (Drizzle ORM parameterized)
- [ ] File upload restrictions (MIME whitelist, size limit)

#### 3. Environment Variables
Verify all required env vars are set in Railway/production:
```
DATABASE_URL          — PostgreSQL connection string
JWT_SECRET            — Strong random secret (32+ chars)
SITE_URL              — Production domain (https://epitaphe360.ma)
STRIPE_SECRET_KEY     — Stripe API key
STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret
SMTP_HOST             — Email server host
SMTP_PORT             — Email server port
SMTP_USER             — Email credentials
SMTP_PASS             — Email credentials
```

#### 4. Build Verification
```bash
npm run build          # Should complete without errors
npm run start          # Test production mode locally
```

#### 5. Database
- [ ] All migrations applied in order
- [ ] Seed data inserted for required settings
- [ ] No destructive migration without backup plan
- [ ] Connection pool configured properly

#### 6. Infrastructure
- [ ] `railway.json` / `Dockerfile` / `nixpacks.toml` up to date
- [ ] `Procfile` has correct start command
- [ ] Health check endpoint responding (`/api/health` or similar)
- [ ] Static assets served with proper cache headers

#### 7. Rollback Plan
- [ ] Previous working commit hash documented
- [ ] Database rollback SQL prepared (if schema changed)
- [ ] Quick rollback command ready: `git revert <commit> && git push`

### Deployment Commands
```bash
# Build and verify
npm run build
npx tsc --noEmit

# Git
git add --all
git commit -m "release: v{version} — {description}"
git push origin main

# Railway auto-deploys from main branch
# Monitor: railway logs
```

### Post-Deployment Verification
1. Check production URL loads correctly
2. Test login/authentication flow
3. Verify API endpoints respond (health, public pages)
4. Check error monitoring for new exceptions
5. Verify email sending works (contact form)
6. Test payment flow in Stripe test mode
