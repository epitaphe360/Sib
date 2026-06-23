# Authentification par lien magique

## Déjà en place sur le projet

| Élément | Statut |
|---------|--------|
| **Web** — onglet « Lien magique » sur `LoginPage.tsx` | ✅ `OAuthService.sendMagicLink()` → `signInWithOtp` |
| **Web** — callback `/auth/callback` | ✅ `OAuthCallbackPage` + `detectSessionInUrl` |
| **Supabase Auth** — email activé | ✅ `supabase/config.toml` `[auth.email]` |
| **Mobile** — reset password | ✅ `urbaevent://reset-password` (déjà dans `additional_redirect_urls`) |
| **Mobile** — connexion / inscription OTP | ✅ `magicLinkAuth.ts` + `auth-callback` (même API Supabase que le web) |

Le mobile **réutilise la validation Supabase existante** ; seule la **URL de retour** change (`urbaevent://auth-callback` au lieu de `https://…/auth/callback`).

## Pourquoi le mobile en plus

Pour **200 000+ visiteurs** sur l’app : pas de `signInWithPassword` visiteur — emails en base, **validation par lien** uniquement.

## Redirect URLs (`supabase/config.toml`)

Déjà listées :

- `https://sib2026.ma/auth/callback` (web)
- `urbaevent://reset-password` (mobile)

Ajouté pour l’app native :

- `urbaevent://auth-callback`
- `exp://…/--/auth-callback` (Expo Go dev)

Vérifier sur le **projet Supabase distant** (Dashboard → Auth → URL Configuration) que `urbaevent://auth-callback` y figure aussi si vous déployez sans repousser `config.toml`.

## Flux

### Inscription visiteur (free / VIP)

1. Formulaire (sans mot de passe)
2. `requestVisitorSignup` → profil en attente + `signInWithOtp(shouldCreateUser: true)`
3. Clic lien email → `auth-callback` → ligne `users` + badge (+ paiement si VIP)

### Connexion visiteur existant

1. Email seul
2. `sendMagicLinkLogin` → `signInWithOtp(shouldCreateUser: false)`
3. Clic lien → session + redirect selon rôle

## Charge Supabase

| Opération | Coût relatif |
|-----------|----------------|
| `signInWithOtp` (envoi email) | 1 appel + email SMTP |
| Clic lien (session) | 1 session, pas de verify password |
| `signInWithPassword` | Hash + verify à chaque login |

Recommandation salon : **rate limiting** + **SMTP dédié** (Resend, SendGrid) via Supabase.
