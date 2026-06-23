# Résultats checklist terrain — 2026-06-04

Commande : `node scripts/run-salon-checklist.mjs`

## Résumé : 20/30 automatisés OK

### Validé automatiquement

| Section | Détail |
|---------|--------|
| **Prérequis** | `.env` Supabase + JWT secret (45 car.) |
| **Backend** | Tables `exhibitor_leads`, `time_slots`, `appointments`, `visitor_levels`, `registration_requests` + RPC `book_appointment_atomic` |
| **Auth (code)** | Redirect anonyme → `/(visitor)` ; deep link `urbaevent://reset-password` |
| **Badge JWT** | Zones free/VIP, QR expiré rejeté, scan visiteur (logique), signature HMAC |
| **RDV** | Permissions free/VIP ; 5+ créneaux en base |

### Bloqué — comptes démo absents sur Supabase

Tous les logins testés renvoient `Invalid login credentials` :

- `visitor-free@test.sib2026.ma` / `Demo2026!`
- `visitor-vip@test.sib2026.ma` / `Demo2026!`
- `exhibitor-9m@test.sib2026.ma` / `Demo2026!`
- `partner-museum@test.sib2026.ma` / `Demo2026!`
- `admin@sib.com` / `Demo2026!`
- `service-clientele@sib.com` / `Service2026!`
- `visiteur@sib.com` / `Visit123!` (E2E)

**Action requise** : créer ou réinitialiser les comptes (voir ci-dessous).

### À faire manuellement (Expo Go)

- [ ] Lancer l’app : `cd apps/mobile && npx expo start`
- [ ] Scanner le QR Metro avec **Expo Go** (Android/iOS)
- [ ] Auth : login chaque rôle + vérifier l’écran d’accueil
- [ ] Badge : QR rotatif sur écran Badge
- [ ] Caméra : scanner sécurité + scan exposant
- [ ] RDV : réserver (VIP) + accepter (exposant)
- [ ] Messages / réseautage
- [ ] Admin : stats, paiement VIP, alertes
- [ ] Offline : annuaire + programme après 1er chargement
- [ ] i18n : Paramètres → العربية
- [ ] `eas init` puis `eas build --profile preview --platform android`

## Créer les comptes de test

Ajouter dans la racine du repo `.env` :

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=<clé service_role Supabase>
```

Puis :

```powershell
cd "c:\Users\samye\OneDrive\Desktop\devellopement\ SIB\Sib-1"
node scripts/create-test-users.js
node scripts/create-service-clientele-account.mjs
node apps/mobile/scripts/run-salon-checklist.mjs
```

Comptes E2E créés par `create-test-users.js` :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| visiteur@sib.com | Visit123! | visitor |
| exposant@sib.com | Expo123! | exhibitor |
| partenaire@sib.com | Partner123! | partner |
| admin.sib@sib.com | Admin123! | admin |

Sécurité : `service-clientele@sib.com` / `Service2026!`
