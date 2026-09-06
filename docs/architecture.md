# Architecture — Elitech Lab

Produit SaaS multi-tenant de gestion de laboratoire, **isolé** de la plateforme SIB.

## Isolation

| Couche | SIB | Lab |
|---|---|---|
| Routes | `/`, `/admin/*`, `/dashboard` | `/lab/*` |
| SQL | `public.*` | `lab.*` |
| Auth métier | `users.type` exposant/visiteur | `lab.organization_members.role` |
| UI chrome | Header / Footer SIB | `LabShell` (sidebar + header) |

## Stack (réutilisée)

React 18 + TS strict + Vite · Tailwind · Zod + React Hook Form · Lucide · Supabase Auth/DB/Storage · Zustand (`labSessionStore`) · Vitest.

Non ajouté : TanStack Query, Resend SDK, nouvelle lib UI.

## Modules (`src/features/lab/`)

`auth` · `rbac` · `requests` · `suppliers` · `quotes` · `samples` · `results` · `reports` · `billing` · `dashboard` · `settings`

Checkpoint 1 : auth + membership + shell + demandes publiques + transitions de statut.

## Auth

- **Admin** : `signInWithPassword` → charge `lab.profiles` + memberships. MFA TOTP : `/lab/admin/mfa`.
- **Client** : email OTP, aucune password locale.
- **Guards** : `LabGuard` (session + rôle). Permissions **hors** composants (matrice `rbac.ts`).
- Secrets : anon key seulement. Service role interdit côté client.
- E-mails : file `lab.email_messages` ; flush `scripts/lab-email-worker.mjs` / `POST /api/lab/flush-emails`.
- Inbox : classification `lab.processed_emails` (dédup `message_id`).
- Backup : `scripts/lab-backup.mjs` + `docs/RESTORE_TEST.md`.

## Multi-tenant

Toute ligne métier porte `organization_id`. RLS via `lab.user_org_ids()` / `lab.has_lab_role()`. Aucun cross-tenant.

## Front

`LabApp` monté sur `/lab/*`. Le chrome SIB (header, footer, chatbot, WhatsApp) est masqué sur ces routes.
