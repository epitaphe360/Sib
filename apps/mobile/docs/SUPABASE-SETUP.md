# Supabase — configuration mobile (checklist)

Projet lié : **SIB** (`sbyizudifmqakzxjlndr`)

## Déjà appliqué (2026-06-02)

- [x] Auth redirect `urbaevent://reset-password`
- [x] Auth redirect `urbaevent://auth-callback` (lien magique — aligné web `signInWithOtp`)
- [x] Table `exhibitor_leads` + RLS (migration `20260602000001`)
- [x] Realtime : `appointments`, `messages`, `payment_requests`, `registration_requests`
- [x] `eas.json` + `.env.example` : `EXPO_PUBLIC_JWT_SECRET`

## Migrations locales encore à pousser

**Recommandé (CLI bloqué ECIRCUITBREAKER)** : ouvrir [`SUPABASE-MANUAL-SQL.sql`](./SUPABASE-MANUAL-SQL.sql), coller dans **Supabase Dashboard → SQL Editor**, exécuter bloc par bloc (ou tout le fichier — idempotent).

Historique migration désynchronisé — alternative CLI (après ~15–30 min) :

```powershell
cd "c:\Users\samye\OneDrive\Desktop\devellopement\ SIB\Sib-1"
.\apps\mobile\scripts\supabase-apply-pending.ps1
npx supabase migration repair --status applied 20260602000001
```

Ou manuellement fichier par fichier :

```bash
cd supabase
npx supabase db query --linked -f migrations/20260411000002_insert_official_partners.sql
npx supabase db query --linked -f migrations/20260412000002_rename_siport_to_sib.sql
npx supabase db query --linked -f migrations/20260601000002_create_site_banners.sql
npx supabase db query --linked -f migrations/20260601000003_add_ministry_egide_banner.sql
npx supabase db query --linked -f migrations/20260601000004_site_banner_storage.sql
```

## JWT badge (obligatoire prod)

```bash
# Même secret web + mobile (min 32 car.)
openssl rand -hex 32

# Web (Vercel/Railway)
VITE_JWT_SECRET=<secret>

# Mobile (.env + EAS)
EXPO_PUBLIC_JWT_SECRET=<secret>

eas secret:create --name EXPO_PUBLIC_JWT_SECRET --value "<secret>" --scope project
```

Remplacer `SAME_AS_VITE_JWT_SECRET` dans `eas.json` par le vrai secret ou utiliser EAS Secrets.

## SMTP reset password

Dashboard → Authentication → SMTP Settings  
Ou secrets Edge Functions (voir `supabase/functions/SMTP_CONFIGURATION.md`).

## Données métier requises

| Table | Contenu |
|-------|---------|
| `visitor_levels` | `premium` / `vip` avec `price_annual` > 0 |
| `time_slots` | Créneaux créés par les exposants |
| `exhibitors` | Fiches liées aux comptes exposant |
| `users` | Comptes `admin`, `security`, `partner`, `exhibitor` |
