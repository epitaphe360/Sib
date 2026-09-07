# Mémoire — Elitech Lab + SIB

| Sujet | Fichier |
|---|---|
| Assumptions | `docs/ASSUMPTIONS.md` |
| Architecture lab | `docs/architecture.md` |
| Schéma SQL | `docs/database.md` |
| Workflows | `docs/workflows.md` |
| Sécurité | `docs/security.md` |
| Checkpoint | `docs/CHECKPOINT.md` |
| Audit plan | `docs/LAB_AUDIT.md` |
| Vercel Lab | `npm run lab:vercel` |
| Code lab | `src/features/lab/` |
| Migrations | `supabase/migrations/20260906000001` → `05` |
| Worker e-mails | `scripts/lab-email-worker.mjs` |
| Cron relances | `scripts/lab-cron.mjs` |
| Backup | `scripts/lab-backup.mjs` + `docs/RESTORE_TEST.md` |

SIB reste sur `public` + routes existantes. Lab = `/lab` + schéma `lab`.
