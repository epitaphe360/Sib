# Plan de tests terrain — UrbaEvent Mobile

Checklist avant ouverture salon (SIB 2026).

## Prérequis

- [x] `.env` avec `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_JWT_SECRET` *(auto 2026-06-04)*
- [ ] `app.json` → `extra.eas.projectId` renseigné (`eas init`) — encore `REPLACE_AFTER_eas_init`
- [ ] Build device : `eas build --profile preview --platform android`

> Script automatisé : `node scripts/run-salon-checklist.mjs` (API + JWT sans caméra)

## 1. Auth & rôles

| Test | Attendu |
|------|---------|
| Visiteur anonyme | Accès `(visitor)/(tabs)` sans login |
| Login visiteur free | Redirect `(visitor)/(tabs)` |
| Login exposant | Redirect `(exhibitor)/(tabs)` |
| Login partenaire | Redirect `(partner)/(tabs)` |
| Login sécurité | Redirect `(staff)/scanner` |
| Login admin | Redirect `(staff)/(tabs)` |
| Mot de passe oublié | Email Supabase + deep link `urbaevent://reset-password` |

## 2. Badge JWT ↔ Scanner

| Test | Attendu |
|------|---------|
| Badge visiteur free | QR JWT, zones public + hall |
| Badge VIP | QR JWT, zones VIP + networking |
| Scanner sécurité zone `public` | OK visiteur |
| Scanner zone `vip_lounge` | OK VIP, KO free |
| QR expiré (>60s sans refresh) | KO avec message |
| Scan exposant (caméra) | Lead enregistré |

## 3. RDV

| Test | Attendu |
|------|---------|
| Visiteur free → Réserver RDV | Message upgrade VIP |
| Visiteur VIP → liste créneaux | Créneaux exposants |
| Réservation | Statut `pending` côté exposant |
| Exposant accept/reject | Statut mis à jour visiteur |
| Push local | Notification à la confirmation |

## 4. Messages & réseautage

| Test | Attendu |
|------|---------|
| Visiteur free → Réseautage | Blocage + lien VIP |
| Visiteur VIP → recherche | Résultats + demande connexion |
| Thread messages | Envoi / réception |

## 5. Admin mobile

| Test | Attendu |
|------|---------|
| Stats live | Compteurs users / paiements |
| Validation paiement VIP | Approve → visitor_level premium |
| Tarif VIP | Mise à jour `visitor_levels` |
| Alertes | Liste `registration_requests` pending |

## 6. Offline

| Test | Attendu |
|------|---------|
| Annuaire exposants sans réseau | Cache 24h |
| Programme sans réseau | Cache 24h |

## 7. i18n

| Test | Attendu |
|------|---------|
| Paramètres → العربية | RTL + textes AR sur écrans clés |
| Retour FR | LTR |

## Compatibilité croisée web

- [ ] Tarif VIP modifié sur mobile = reflété web inscription
- [ ] RDV créé mobile visible web `/calendar`
- [ ] Paiement validé mobile = badge VIP actif mobile + web
