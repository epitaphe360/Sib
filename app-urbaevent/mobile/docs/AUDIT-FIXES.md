# Correctifs audit mobile — 2026-06-04

## Corrigé dans le code

| Priorité | Problème | Fichiers |
|----------|----------|----------|
| CRITIQUE | Colonnes `connections` (`requester_id` / `addressee_id`) | `api/networking.ts`, `matchmaking.ts`, `analytics.ts` |
| CRITIQUE | Stats accueil alignées sib.ma | `data/salons.ts` |
| CRITIQUE | Inscription magic link multi-appareil | `lib/registrationPending.ts`, `magicLinkAuth.ts` |
| HAUTE | VIP `pending_payment` → zones free | `api/qr.ts` |
| HAUTE | Scanner partenaire `checkZoneAccess` | `api/scanner.ts`, payload `partnerTier` |
| HAUTE | `auth-callback` timeout + erreurs URL | `auth-callback.tsx` |
| HAUTE | Route `/profile` → profil visiteur | `payment/[id].tsx` |
| HAUTE | `check_email_registered` fail-closed | `authAccount.ts` |
| HAUTE | Doublon email inscription | `register.tsx`, `register-vip.tsx` |
| HAUTE | Session orpheline sans profil | `AuthContext.tsx` |
| HAUTE | Réseautage : noms contacts + erreurs | `networking.tsx` |
| HAUTE | Recherche utilisateurs sanitizée | `api/networking.ts` |
| MOYENNE | Cache QR expiré ignoré | `useRotatingQR.ts` |
| MOYENNE | Signature QR sans fallback faible | `api/qr.ts` |
| MOYENNE | `partner_tier` dans profil | `auth.ts`, `types/index.ts` |
| MOYENNE | Onglets i18n + `tabs.salons` | `(visitor)/(tabs)/_layout.tsx`, locales |
| MOYENNE | RDV : erreurs + invité | `appointments/index.tsx` |
| MOYENNE | Config Supabase visible login/register | `login.tsx`, `register.tsx` |
| MOYENNE | Route salons → exposants explicite | `salons.tsx` |

## Reste à faire côté infra (non code)

1. **SMTP Supabase** — magic link (Dashboard → Auth → SMTP).
2. **Comptes démo** — `VITE_SUPABASE_SERVICE_ROLE_KEY` + `npm run seed:demo`.
3. **eas.projectId** — `eas init` dans `app.json`.
4. **JWT production** — retirer `EXPO_PUBLIC_JWT_SECRET` du client à terme ; tokens via Edge Function uniquement.

## Vérification

```powershell
cd apps/mobile
npm run typecheck
node scripts/run-salon-checklist.mjs
npm run build:apk
```
