# Assumptions — Elitech Lab (non-bloquantes)

Décisions prises pour avancer. Corriger ici si le métier tranche autrement.

| ID | Décision | Raison |
|---|---|---|
| A1 | Produit isolé : schéma SQL `lab` + routes `/lab/*` | Repo Sib. SQL Lab sur projet Supabase **Laboratoire** `omlhfjfpyttfvntfqjnk`, pas `sbyizudifmqakzxjlndr`. |
| A2 | Rôle `MADAME_ZINEB` = `RESPONSABLE_VALIDATION` | Un seul enum ; alias métier dans l’UI. |
| A3 | Rôle portail client = `CLIENT` | Distinct de `UTILISATEUR_STANDARD` interne. |
| A4 | Marge défaut 30 % via `lab.pricing_rules` | Configurable, jamais hardcodée dans le calcul métier. |
| A5 | Pénalité défaut 1 % / jour via `lab.settings` | Configurable. |
| A6 | OTP client = `signInWithOtp`, 10 min | `mailer_otp_exp=600` appliqué sur Laboratoire. |
| A7 | Admin = email + mot de passe Supabase + membership `lab` | MFA TOTP via `/lab/admin/mfa` (`lab.profiles.mfa_ready`). |
| A8 | Formulaire public : insert anon si org active | RPC `lab.submit_public_request`. |
| A9 | Schéma `lab` exposé dans l’API Supabase | `supabase/config.toml` + dashboard (exposed schemas). |
| A10 | Pas de TanStack Query | Non installé ; fetch ciblé + Zustand lab. |
| A11 | Pas de nouvelle dépendance npm | zod, RHF, lucide, supabase déjà là. |
| A12 | Conservation docs client : 365 jours | `settings.document_retention_days`. |
| A13 | Code échantillon : `ECH-{seq:6}-{year}-{PRODUCT}` | Configurable `settings.sample_code_pattern`. |
| A14 | IA heuristique (`rules-v1`) | Aide seulement ; jamais validation technique. |
| A15 | Emails : file `lab.email_messages` + worker serveur | `RESEND_API_KEY` ou SMTP. Jamais dans `src/`. |
| A16 | Org démo `elitech` seedée | Slug public pour le formulaire. |
| A17 | SUPER_ADMIN voit toutes les orgs | Autres rôles : `organization_id` strict. |
| A18 | Soft delete `deleted_at` | Pas de DELETE physique sur les tables métier. |
| A19 | Flush e-mails : Vercel `/api/lab/flush-emails` + cron `/api/lab/cron` | Pas de Railway. Header `x-lab-cron-secret` ou `CRON_SECRET`. |
| A20 | Backup inventaire : `npm run lab:backup` | `LAB_BACKUP_ORG_UUID` pour insérer `backup_runs`. Drive upload manuel. |
| A21 | Cron relances : `npm run lab:cron` / `POST /api/lab/cron` | Devis (3 j) + délais (J-2 / retard). File seulement, pas d’envoi. |
