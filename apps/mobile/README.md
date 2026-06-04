# UrbaEvent Mobile — Option C (multi-rôles)

Application **React Native / Expo** unique, routée par `users.type` après connexion. Même backend Supabase que le site SIB 2026.

## Rôles et navigation

| Rôle | Groupe Expo | MVP salon-ready |
|------|-------------|-----------------|
| **Visiteur** | `(visitor)/(tabs)` | Badge JWT rotatif, RDV, messages, réseautage lite |
| **Exposant** | `(exhibitor)/(tabs)` | Mon stand, scan contacts (caméra), RDV accept/reject, mini-site lite |
| **Partenaire** | `(partner)/(tabs)` | Dashboard KPI, leads/RDV, médias |
| **Sécurité** | `(staff)/scanner` | Scanner zones + historique session |
| **Organisation** | `(staff)/(tabs)` | Stats live, validation paiements VIP, tarif Pass VIP |

L'inscription mobile est réservée aux **visiteurs** (gratuit / VIP). **Validation par lien magique** (pas de mot de passe) — voir [docs/AUTH-MAGIC-LINK.md](docs/AUTH-MAGIC-LINK.md). Exposants, partenaires et staff : onglet **Mot de passe (pro)** ou compte web.

## Architecture

```
apps/mobile/
├── app/
│   ├── index.tsx              # redirect selon rôle
│   ├── (auth)/                # login, register, register-vip
│   ├── (visitor)/             # tabs + stack (RDV, messages, networking, settings)
│   ├── (exhibitor)/           # tabs + scan, minisite, messages/[id]
│   ├── (partner)/             # tabs KPI, leads, médias
│   ├── (staff)/               # tabs live/scanner/payments + stack scanner, payments, pricing
│   ├── payment/[id].tsx
│   └── exhibitor/[id].tsx
└── src/
    ├── api/                   # appointments, chat, networking, qr, scanner, admin, analytics…
    ├── navigation/roleConfig.ts
    ├── components/guards/RoleGate.tsx
    ├── hooks/useRotatingQR.ts
    └── i18n/                  # FR + AR (RTL)
```

## Badge QR sécurisé

Le badge visiteur utilise un **JWT rotatif** (60 s, renouvelé toutes les 30 s) aligné sur `src/services/qrCodeService.ts` (web). Compatible avec le scanner sécurité (`validateQRCode` + legacy `scan_badge`).

Variables optionnelles : `EXPO_PUBLIC_JWT_SECRET` (ou `EXPO_PUBLIC_VITE_JWT_SECRET`).

### Reset password mobile

- Redirect Supabase : `urbaevent://reset-password` (déjà dans `supabase/config.toml` + projet distant SIB)
- Deep link configuré dans `app.json` → `linking.prefixes`
- Flux : `(auth)/forgot-password` → email → `(auth)/reset-password`

## Push & realtime

- Token Expo → table `notifications_devices`
- Écoute Supabase realtime : RDV, messages, paiements VIP (admin / visiteur)

## i18n

Français par défaut, arabe avec RTL via `(visitor)/settings` ou `I18nProvider`.

## Installation

```bash
cd apps/mobile
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL
# EXPO_PUBLIC_SUPABASE_ANON_KEY
# EXPO_PUBLIC_JWT_SECRET (prod)

npm install
npm run typecheck
npx expo start
```

## Build EAS

```bash
eas login
eas init          # projectId dans app.json
eas build --profile preview --platform android
eas build --profile production --platform all
```

Permissions : caméra (scan QR), notifications push.

## Tests terrain (salon)

Checklist complète : [docs/SALON-TEST-PLAN.md](docs/SALON-TEST-PLAN.md)

## Compléments livrés (périmètre étendu)

- Création RDV : `(visitor)/appointments/new` via `book_appointment_atomic`
- Mot de passe oublié : `(auth)/forgot-password` + deep link `urbaevent://reset-password`
- Permissions VIP/free : `src/lib/networkingPermissions.ts`
- i18n FR/AR étendu (login, RDV, réseautage, settings, analytics)
- Analytics exposant : `(exhibitor)/analytics`
- Alertes orga : `(staff)/alerts`

## Fonctionnalités avancées (livré)

- Scanner : RPC `validate_scanned_badge` + JWT + logs `access_logs`
- File d’attente offline pour scans sécurité
- Badge QR en cache hors ligne
- Matchmaking (suggestions secteur / rôle)
- Messages partenaire (onglet dédié)
- Admin : liste utilisateurs + suspendre/activer
- Push : RDV, messages, connexions, leads exposant, paiement VIP
- i18n FR/AR étendu (scanner, admin, paiement)
- Web : fallback saisie manuelle (pas de caméra)
- CI : `.github/workflows/mobile.yml`
- Script checklist : `npm run checklist`
- Comptes démo : `npm run setup:demo` (depuis racine repo + service_role)

## V1.2 (optionnel)

Éditeur mini-site complet, push serveur Edge Function dédiée, carte salon, Sentry, tests E2E Maestro.
