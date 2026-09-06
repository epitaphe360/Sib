# Audit plan Elitech Lab — 2026-09-06

Source : cahier Lab (isolation SIB, workflow complet, RLS, e-mails, backups) + `docs/workflows.md` / `docs/ASSUMPTIONS.md`.

**Verdict** : le produit Lab est **livré et testé au niveau code + SQL**. Ce n’est **pas** 100 % « prod allumée » : quelques briques restent infra / humaine.

## Tests exécutés ici

| Test | Résultat |
|---|---|
| Vitest `tests/unit/lab-core.test.ts` | **27/27 OK** (pricing, statuts, BDC, RBAC, file e-mails, cron, backup) |
| Playwright `tests/e2e/lab-public.spec.ts` | **OK** (landing, logins, formulaire, MFA/inbox derrière login) |
| `npm run build` | **OK** |
| SQL projet Laboratoire `omlhfjfpyttfvntfqjnk` | **42 tables**, org `elitech`, schéma `lab` exposé, 7 buckets storage |
| E2E login admin / OTP client / parcours métier authentifié | **Non** (pas de SUPER_ADMIN ni credentials Lab) |
| Restore test exécuté | **Non** (`docs/RESTORE_TEST.md` seulement) |
| Envoi e-mail réel Resend/SMTP | **Non** (file + worker, provider pas configuré) |

## Plan métier — livré

| # | Tâche | Statut | Preuve |
|---|---|---|---|
| 1 | Isolé de SIB (`/lab/*`, chrome masqué, rôles `lab.*`) | OK | `isLabPath`, `LabApp`, schéma `lab` |
| 2 | Multi-tenant + RLS | OK SQL | helpers `user_org_ids` / `has_lab_role` ; pas de test cross-org live |
| 3 | Formulaire public demande | OK | `/lab/request-form` + RPC `submit_public_request` |
| 4 | Qualification dossier | OK | `LabRequestDetailPage` |
| 5 | Consultation fournisseurs EN, choix humain | OK | consultations + `rankOffers` (jamais auto-select) |
| 6 | Devis + marge 30 % configurable | OK | `pricing_rules` + `applyMargin` |
| 7 | Envoi devis, relance 3 j, sondage, pas de prix auto | OK | quotes + cron + `/lab/quote-survey/:token` |
| 8 | Ingestion BDC client (jamais créé par le lab) | OK | `reviewPurchaseOrder` |
| 9 | Réception / code échantillons `ECH-…` | OK | `formatSampleCode`, `next_sample_codes` |
| 10 | BDC fournisseur + délais / pénalité 1 %/j | OK | analyses + deadlines + templates |
| 11 | Résultats + double revue tech / Zineb, correction 6 h | OK | `LabValidationsPage` (alias Zineb) |
| 12 | IA = aide, jamais validation | OK (noop) | `aiProvider.ts` |
| 13 | PDF rapport | OK | `reportPdf.ts` / `LabReportsPage` |
| 14 | Factures client + paiements multiples | OK | `LabInvoicesPage` |
| 15 | Factures fournisseur | OK | `LabSupplierInvoicesPage` |
| 16 | Portail client OTP | OK UI | `/lab/client/*` |
| 17 | File e-mails + worker Resend/SMTP | OK code | `lab-email-worker.mjs` |
| 18 | Inbox dédup `message_id` | OK UI | classification manuelle, pas IMAP |
| 19 | MFA TOTP admin | OK UI | `/lab/admin/mfa` |
| 20 | Audit + settings + tâches + backups UI | OK | pages admin |
| 21 | SQL `01`–`05` appliqué | OK | projet Laboratoire |
| 22 | Isolation auth Lab vs SIB | OK code | `VITE_LAB_SUPABASE_*` |

## Non livré / partiel (pas oublié : documenté)

| # | Tâche | Pourquoi |
|---|---|---|
| A | Premier `SUPER_ADMIN` | Aucun user Auth créé sur Laboratoire |
| B | OTP TTL 10 min | Réglage dashboard Auth, pas SQL |
| C | Provider IA réel | Interface `noop` volontaire (A14) |
| D | Cron Resend/Drive allumés | Worker prêt ; clés + cron hébergeur manquants |
| E | Upload Drive hebdo | Manifeste seulement, pas d’API Google |
| F | Restore test joué | Procédure écrite, pas exécutée |
| G | E2E authentifié bout-en-bout | Bloqué sans compte Lab |
| H | Inbox IMAP / webhook mail | Formulaire de classement seulement |
| I | i18n Lab fr/en/ar | UI Lab en FR ; stores SIB non utilisés |
| J | Page Utilisateurs : invitation | Liste des memberships, pas d’invite e-mail |
| K | Signed URLs storage | Buckets existent ; pas de policies upload UI |
| L | Dépôt GitHub `epitaphe360/Lab` | Privé, hors scope token Cursor |

## Fichier Vercel (zéro saisie dashboard)

```bash
npm run lab:vercel
```

Pose `VITE_LAB_SUPABASE_URL` + `VITE_LAB_SUPABASE_ANON_KEY` (production / preview / development) puis `vercel --prod`.
