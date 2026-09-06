# Security — Elitech Lab

## Tenant isolation

- RLS sur **toutes** les tables `lab.*`.
- `organization_id` obligatoire sur les lignes métier.
- Policies : `organization_id IN (SELECT lab.user_org_ids())` sauf SUPER_ADMIN.
- Client (`CLIENT`) : restreint à son `client_id` (demandes, devis, rapports, factures).
- Test cible : user org A ne lit/écrit jamais org B.

## Auth

- Client : OTP email uniquement (pas de password local). Rate-limit client (`otpRateLimiter`, 5 / 15 min).
- Admin : password Supabase ; MFA TOTP (`/lab/admin/mfa`, `lab.profiles.mfa_ready`).
- Guards UI = UX. Autorisation réelle = RLS + RPC.

## Secrets

- Interdit : `SUPABASE_SERVICE_ROLE_KEY` dans `src/`.
- Actions privilégiées : `server.js` (`POST /api/lab/flush-emails` + `LAB_CRON_SECRET`) / `scripts/lab-email-worker.mjs` / `scripts/lab-backup.mjs`.
- Env serveur : `RESEND_API_KEY`, `LAB_FROM_EMAIL`, `LAB_CRON_SECRET`, `LAB_BACKUP_ORG_UUID`. Jamais `VITE_*` pour ces secrets.

## XSS / injections

- `sanitizeHtml()` avant tout HTML riche.
- Zod côté client ; CHECK / types côté SQL.
- RPC `submit_public_request` : whitelist de colonnes, pas de SQL dynamique.

## Fichiers

- Buckets privés, MIME + taille (50 Mo storage), noms uuid.
- Signed URLs expirées (phase storage).

## Audit

`lab.audit_logs` : user, action, entity, old/new, IP si dispo. Pas de DELETE physique.
