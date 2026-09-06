# Checkpoint courant — Elitech Lab

**Date** : 2026-09-06
**Branche** : `cursor/elitech-lab-foundation-5783`
**État** : workflow + MFA + inbox + worker e-mails + manifeste backup.

## Infra (humain)

1. ~~Migrations `01`–`05`~~ appliquées sur le projet **Laboratoire** `omlhfjfpyttfvntfqjnk` (schéma `lab` exposé).
2. App : `VITE_LAB_SUPABASE_URL` + `VITE_LAB_SUPABASE_ANON_KEY` (projet Laboratoire), pas le projet SIB.
3. Créer le premier `SUPER_ADMIN` (`auth.users` + `lab.organization_members`).
4. OTP client : TTL 10 min dans Auth.
5. Env serveur : `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` ou SMTP, `LAB_FROM_EMAIL`, `LAB_CRON_SECRET`, `LAB_BACKUP_ORG_UUID`.
6. Cron : `npm run lab:flush-emails` et `npm run lab:backup`. Upload Drive manuel. Exécuter `docs/RESTORE_TEST.md`.

## Scripts

- `npm run lab:flush-emails` / `--dry-run`
- `npm run lab:cron` — relances devis + rappels délais
- `npm run lab:backup` → `scripts/output/lab-backup-manifest.json`
- `POST /api/lab/flush-emails` et `POST /api/lab/cron` (header `x-lab-cron-secret`)

## Audit

Voir `docs/LAB_AUDIT.md`. Vercel Lab : `npm run lab:vercel`.

## Reste prod

SUPER_ADMIN, OTP 10 min, cron Resend/Drive, E2E login lab, restore test exécuté.
