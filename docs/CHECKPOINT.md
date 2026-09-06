# Checkpoint courant — Elitech Lab

**Date** : 2026-09-06
**Branche** : `cursor/elitech-lab-foundation-5783`
**État** : workflow + MFA + inbox + worker e-mails + manifeste backup.

## Infra (humain)

1. Appliquer migrations `20260906000001` → `05` sur `sbyizudifmqakzxjlndr`.
2. Exposer le schéma `lab` dans l’API Supabase.
3. Créer le premier `SUPER_ADMIN` (`auth.users` + `lab.organization_members`).
4. OTP client : TTL 10 min dans Auth.
5. Env serveur : `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` ou SMTP, `LAB_FROM_EMAIL`, `LAB_CRON_SECRET`, `LAB_BACKUP_ORG_UUID`.
6. Cron : `npm run lab:flush-emails` et `npm run lab:backup`. Upload Drive manuel. Exécuter `docs/RESTORE_TEST.md`.

## Scripts

- `npm run lab:flush-emails` / `--dry-run`
- `npm run lab:backup` → `scripts/output/lab-backup-manifest.json`
- `POST /api/lab/flush-emails` (header `x-lab-cron-secret`)

## Reste prod

Cron Resend réel, upload Drive, E2E login lab, restore test exécuté.
