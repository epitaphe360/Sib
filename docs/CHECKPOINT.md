# Checkpoint courant — Elitech Lab

**Date** : 2026-09-06
**Branche** : `cursor/elitech-lab-foundation-5783`
**État** : workflow + MFA + inbox + worker e-mails + manifeste backup.

## Infra (humain)

1. Migrations `01`–`06` + schéma `lab` exposé sur Laboratoire.
2. OTP 10 min (`mailer_otp_exp=600`).
3. Premier login `/lab/login` → `claim_first_admin`.
4. App : `VITE_LAB_SUPABASE_*`. Railway : Resend + `LAB_CRON_SECRET`. Drive : `GOOGLE_DRIVE_ACCESS_TOKEN`.

## Scripts

- `npm run lab:flush-emails` / `--dry-run`
- `npm run lab:cron` — relances devis + rappels délais
- `npm run lab:backup` → `scripts/output/lab-backup-manifest.json`
- `POST /api/lab/flush-emails` et `POST /api/lab/cron` (header `x-lab-cron-secret`)

## Audit

Voir `docs/LAB_AUDIT.md`. Vercel Lab : `npm run lab:vercel`.

## Reste prod

SUPER_ADMIN, OTP 10 min, cron Resend/Drive, E2E login lab, restore test exécuté.
