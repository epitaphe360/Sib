# Livraison APK UrbaEvent Mobile

## Fichier livré

`apps/mobile/dist/UrbaEvent-1.0.0-release.apk`

## Comptes démo (mot de passe pro)

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| visitor-free@test.sib2026.ma | Demo2026! | Visiteur free |
| visitor-vip@test.sib2026.ma | Demo2026! | Visiteur VIP |
| exhibitor-9m@test.sib2026.ma | Demo2026! | Exposant |
| partner-museum@test.sib2026.ma | Demo2026! | Partenaire |
| admin@sib.com | Demo2026! | Admin |
| service-clientele@sib.com | Service2026! | Sécurité |

Comptes E2E alternatifs : `visiteur@sib.com` / `Visit123!`, `exposant@sib.com` / `Expo123!`, etc.

Connexion : onglet **Mot de passe (pro)**.

Checklist : `npm run checklist` → **32/33** (EAS projectId optionnel).

## Avant build (développeur)

```powershell
cd apps/mobile
# 1. JWT + Supabase dans .env
npm run ensure-env

# 2. Comptes démo (ajouter VITE_SUPABASE_SERVICE_ROLE_KEY dans .env racine ou mobile)
npm run seed:demo

# 3. APK
npm run build:apk
```

## SMTP magic link (admin Supabase)

Dashboard → **Authentication** → **SMTP** : `mail.sib2026.ma` port 587.

Sans SMTP : inscription par email indisponible ; utiliser mot de passe pro ou créer comptes via `seed:demo`.

## JWT badge QR

`EXPO_PUBLIC_JWT_SECRET` doit être identique à **JWT_SECRET** Supabase (Edge Functions / Railway).
