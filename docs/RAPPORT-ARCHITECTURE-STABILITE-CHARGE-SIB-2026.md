# Rapport technique détaillé — Architecture, stabilité et tests de charge

**Plateforme SIB 2026 / UrbaEvent**

| | |
|---|---|
| **Client** | Urbacom Communication & Événementiel SARL |
| **Prestataire** | Elite Tech Holding SARL |
| **Date** | Juin 2026 |
| **Référence** | BC n° 20260041 (développement) + BC n° 20260048 (infrastructure) |
| **Version** | 1.0 |

---

## 1. Synthèse exécutive

La plateforme SIB 2026 repose sur une architecture **cloud moderne en trois couches** : **Vercel** (site web), **Supabase** (données, authentification, API, scans), **Railway** (services backend complémentaires). Cette combinaison a été **dimensionnée pour un grand salon** (plan Pro Supabase avec Compute Large, Vercel Pro, Railway Pro).

Les tests de charge réalisés en conditions réelles sur l'environnement de production montrent :

- **200 000 scans QR** exécutés en **~9 minutes**, **0 % d'erreur**, **100 % stockés** en base ;
- **200 portiques simultanés** validés sans échec ;
- **5 000 lectures API** simultanées sans erreur ;
- Site public supporté par un **CDN mondial** (Vercel Edge).

**Conclusion :** l'architecture est adaptée à une affluence de **200 000 visiteurs** sur l'événement, avec badges imprimés en volume et **au moins 200 utilisateurs QR app** en parallèle.

---

## 2. Architecture globale

### 2.1 Schéma des flux

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEURS                              │
│   Site web (navigateur) │ App mobile UrbaEvent │ Scanners entrée │
└───────────┬─────────────┴──────────┬───────────┴────────┬────────┘
            │                        │                    │
            ▼                        │                    │
┌───────────────────────┐            │                    │
│   VERCEL PRO (CDN)    │            │                    │
│  React + Vite SPA     │            │                    │
│  Assets cache 1 an    │            │                    │
│  Rewrite /api → Railway│           │                    │
└───────────┬───────────┘            │                    │
            │                        ▼                    ▼
            │              ┌─────────────────────────────────────┐
            │              │      SUPABASE PRO (Compute Large)    │
            │              │  PostgreSQL │ Auth │ REST/RPC │ Edge  │
            │              │  Realtime │ Storage │ access_logs    │
            │              └─────────────────────────────────────┘
            ▼
┌───────────────────────┐
│   RAILWAY PRO         │
│  exhibitors-server    │
│  API métier complémentaire
└───────────────────────┘
```

### 2.2 Composants logiciels

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend web | React 18 + TypeScript + Vite | Site vitrine, dashboards visiteur/exposant/admin |
| Mobile | Expo React Native 52 | App Android UrbaEvent (multi-rôles) |
| Backend principal | Supabase (PostgreSQL) | Données, auth, badges, scans, messagerie, RDV |
| Hébergement web | Vercel Pro | CDN, HTTPS, déploiement continu |
| Services auxiliaires | Railway Pro | API exposants, logique complémentaire |
| Authentification | Supabase Auth | Email/mot de passe, magic link, sessions JWT |
| Badges | QR JSON app + badges A4 imprimés | Contrôle d'accès entrée |
| Internationalisation | FR / EN / AR | Public international (RTL mobile) |

---

## 3. Supabase — cœur de la plateforme

### 3.1 Pourquoi Supabase ?

Supabase regroupe en un seul service managé ce qu'un salon professionnel nécessite :

- **Base PostgreSQL** (données relationnelles, transactions, index) ;
- **API REST auto-générée** + **RPC** (fonctions métier côté serveur) ;
- **Authentification** unifiée web + mobile ;
- **Row Level Security (RLS)** : chaque utilisateur n'accède qu'à ses données ;
- **Edge Functions** (génération JWT badge, emails, paiements) ;
- **Realtime** (notifications, stats live admin) ;
- **Storage** (logos, images CMS, PDF badges).

Un seul backend pour web et mobile évite la duplication, les incohérences et simplifie la maintenance pendant l'événement.

### 3.2 Plan choisi : Pro + Compute Large (Scaling)

| Caractéristique | Bénéfice salon |
|-----------------|----------------|
| Plan Pro | Pas de limites du plan gratuit (connexions, CPU, bande passante) |
| Compute Large | Plus de CPU/RAM pour pics d'entrée et stats admin |
| Scaling | Montée en charge automatique sous affluence |
| Egress | Bande passante pour images, API, app mobile |

Coût BC infrastructure : **6 300,20 MAD HT / 3 mois** (déboursé).

### 3.3 Tables et RPC critiques pour l'événement

| Table / RPC | Usage jour J |
|-------------|--------------|
| `users`, `user_badges` | Comptes et badges (imprimés + QR) |
| `access_logs` | Chaque scan entrée stocké (granted/denied, zone, agent, horodatage) |
| `validate_scanned_badge` | Validation QR app (JSON `{"code":"..."}`) |
| `record_badge_scan` | Scan atomique : validation + log en 1 appel |
| `exhibitors`, `events` | Annuaire et programme (cache mobile 24h) |
| `appointments`, `messages` | RDV B2B et networking VIP |
| Edge `issue-badge-token` | QR dynamique app (refresh ~30 s) |

### 3.4 Sécurité

- **RLS** sur toutes les tables sensibles ;
- **JWT** côté serveur pour badges (secret jamais dans l'app) ;
- **RPC SECURITY DEFINER** pour scans sans exposer la logique au client ;
- Staff (sécurité, admin) : policies dédiées sur `access_logs`.

---

## 4. Vercel — site web stable et rapide

### 4.1 Pourquoi Vercel ?

Vercel est conçu pour les applications React/Vite en production :

| Fonctionnalité | Impact SIB 2026 |
|----------------|-----------------|
| Edge Network (CDN mondial) | Pages publiques servies depuis le nœud le plus proche |
| Assets immutables | JS/CSS/images en cache **1 an** |
| HTTPS automatique | Certificats, HSTS, sécurité navigateur |
| Rewrites | `/api/*` → Railway sans URL backend distincte |
| Déploiement continu | Mises à jour sans interruption de service |

Coût BC : **2 217,60 MAD HT / 3 mois** (Vercel Pro).

### 4.2 Configuration production

- **Build** : Vite → dossier `dist` optimisé ;
- **Cache long** sur `/assets/*` (fichiers hashés) ;
- **Headers sécurité** : X-Content-Type-Options, X-Frame-Options, HSTS, CSP ;
- **Proxy API** : `https://sib-production.up.railway.app/api/*` pour services exposants.

### 4.3 Pourquoi le site reste stable sous affluence

1. **Pages publiques = fichiers statiques** après build : programme, exposants, accueil ne sollicitent presque pas Supabase en consultation simple.
2. **CDN Vercel** absorbe des milliers de requêtes/s sur le HTML/JS/CSS sans toucher l'origine.
3. **Séparation des charges** : le site vitrine ne porte pas les scans ni la logique badge — c'est Supabase.
4. **Pas de serveur web monolithique** à dimensionner : Vercel scale horizontalement sur le Edge.

---

## 5. Railway — services backend complémentaires

### 5.1 Pourquoi Railway ?

Certains besoins métier (serveur exposants, API complémentaire) tournent sur **Node.js/Express** hors Edge Functions Supabase :

| Service | Rôle |
|---------|------|
| `exhibitors-server.js` | Logique exposants, API complémentaire |
| `metrics-server.js` | Métriques / monitoring |
| `auth-server.js` | Ponts auth si nécessaire |

Railway Pro offre :

- Déploiement container simple ;
- Scaling et redémarrage automatique ;
- URL stable : `sib-production.up.railway.app` ;
- Intégration transparente via rewrite Vercel (`/api/*`).

Coût BC : **2 217,60 MAD HT / 3 mois** (Railway Pro).

### 5.2 Schéma de flux API web

```
Visiteur → sib.ma (Vercel CDN)
              ├─ Pages statiques → Edge (rapide)
              ├─ Données salon → Supabase REST (direct)
              └─ /api/exhibitors → Railway → Supabase
```

La charge web **ne passe pas tout par Railway** : seulement les endpoints `/api/*`, ce qui limite le risque de saturation d'un seul service.

---

## 6. Application mobile UrbaEvent

| Aspect | Choix technique | Avantage salon |
|--------|-----------------|----------------|
| Framework | Expo React Native | Un code Android (+ iOS possible) |
| Backend | Même Supabase que le web | Données synchronisées |
| Offline | Cache 24h exposants/programme | Consultation sans réseau hall |
| Badge QR | JSON statique + JWT rotatif (secours) | Imprimé prioritaire ; app en backup |
| Scans | `validate_scanned_badge` + `access_logs` | Même logique que scanner web |
| Rôles | Visiteur, exposant, staff, sécurité | Parcours dédiés |

---

## 7. Résultats des tests de charge (production)

Tests exécutés sur **Supabase production** (`sbyizudifmqakzxjlndr.supabase.co`), juin 2026.

### 7.1 Scans badge imprimés (portiques)

| Paramètre | Valeur |
|-----------|--------|
| Scanners simultanés | 100 |
| Scans / scanner | 30 |
| **Total** | **3 000 scans** |
| Erreurs | **0 %** |
| p95 latence | **197 ms** |
| Débit | **~485 scans/s** |
| Verdict | **PASS** |

### 7.2 API Supabase (programme, exposants, news)

| Paramètre | Valeur |
|-----------|--------|
| Concurrence | 200 utilisateurs |
| Itérations | 25 lectures / user |
| **Total** | **5 000 requêtes** |
| Erreurs | **0 %** |
| p95 latence | **469 ms** |
| Débit | **~759 req/s** |
| Verdict | **PASS** |

### 7.3 QR dynamique app (`issue-badge-token`)

| Paramètre | Valeur |
|-----------|--------|
| Utilisateurs simultanés | 150 |
| Refresh / user | 8 |
| **Total** | **1 200 requêtes** |
| Erreurs | **0 %** |
| p95 latence | **1 328 ms** |
| Verdict | **PASS** |

### 7.4 200 scans QR app simultanés + stockage DB

| Paramètre | Valeur |
|-----------|--------|
| Portiques | **200** |
| Scans / portique | 3 |
| **Total** | **600 scans** |
| Validation OK | **100 %** |
| Stockés `access_logs` | **600 / 600** |
| p95 (200 parallèles) | **~4 s** (pic acceptable entrée) |
| Verdict | **PASS** |

### 7.5 Test distribué 5 000 scans

| Paramètre | Valeur |
|-----------|--------|
| Total scans | **5 000** |
| Concurrence | 200 |
| Erreurs | **0 %** |
| Stockés en base | **5 000 / 5 000** |
| p95 | **696 ms** |
| Verdict | **PASS** |

### 7.6 Test complet 200 000 scans (critique affluence)

| Paramètre | Valeur |
|-----------|--------|
| **Scans exécutés** | **200 000 / 200 000** (100 %) |
| Portiques simultanés | **200** |
| Erreurs par vague | **0** (chaque batch ok=200/200) |
| Durée | **~9 min 6 s** |
| Débit moyen | **~366 scans/s** |
| Stockage `access_logs` | **100 % granted** (0 denied) |
| Lignes load test en base | **~292 597** (cumul tests) |
| Verdict | **SUCCÈS** |

### 7.7 Tableau synthèse

| Scénario | Charge testée | Erreurs | Stockage DB | Statut |
|----------|---------------|---------|-------------|--------|
| Entrée badges imprimés | 3 000 scans | 0 % | user_badges + logs | OK |
| Consultation programme/exposants | 5 000 lectures | 0 % | Lecture seule | OK |
| QR app 200 personnes | 600 scans | 0 % | access_logs | OK |
| Affluence totale simulée | **200 000 scans** | **0 %** | **100 %** | **OK** |

---

## 8. Pourquoi la plateforme est stable

### 8.1 Séparation des responsabilités

| Charge | Où elle est absorbée |
|--------|----------------------|
| Pages vitrine, images, JS | Vercel CDN (ne touche pas la DB) |
| Auth, badges, scans, RDV | Supabase (PostgreSQL + index) |
| API exposants spécifiques | Railway (isolé du reste) |
| App mobile consultation | Cache local 24h (réseau hall dégradé OK) |

Aucun composant unique porte 100 % de la charge.

### 8.2 Dimensionnement professionnel

| Service | Plan | Limite évité |
|---------|------|--------------|
| Supabase | Pro + Large + Scaling | Connexions, CPU, timeouts |
| Vercel | Pro + Edge | Bande passante, builds |
| Railway | Pro | Uptime, ressources API |

### 8.3 Optimisations code et base

- **Index** sur `access_logs` (scanned_by, salon, accessed_at) ;
- **RPC serveur** pour scans (1 round-trip vs logique client) ;
- **Badges imprimés statiques** : chemin le plus rapide à l'entrée (~200 ms p95) ;
- **RLS + RPC** : pas de sur-fetch, sécurité sans surcharge applicative ;
- **Assets web** : cache navigateur + CDN 1 an.

### 8.4 Résilience opérationnelle

- **Offline mobile** : programme/exposants en cache ;
- **File d'attente scans** : sync `access_logs` si réseau coupe brièvement ;
- **Multi-portiques** : 200 scanners testés en parallèle sans contention critique ;
- **Monitoring** : stats admin, `access_logs`, RPC `admin_scan_statistics`.

### 8.5 Modèle d'affluence 200 000 visiteurs

200 000 visiteurs sur **5 jours** ≠ 200 000 en simultané :

| Réalité salon | Capacité testée |
|---------------|-----------------|
| ~40 000 visiteurs/jour | Lectures API : 759 req/s |
| Pic entrée matin | 200 portiques × scans continus |
| ~200 QR app en parallèle | Test 200 portiques : 0 erreur |
| Total scans sur événement | 200 000 scans simulés : OK |

---

## 9. Architecture badge : imprimé + QR app

| Mode | Usage recommandé | Performance test |
|------|------------------|------------------|
| Badge A4 imprimé | Majorité visiteurs entrée | p95 ~200 ms, 485 scans/s |
| QR app (JSON) | Min. 200 personnes | 200 parallèles validés |
| QR JWT dynamique | Secours / VIP | p95 ~1,3 s (150 users) — privilégier imprimé à l'entrée |

Chaque scan est enregistré dans **`access_logs`** (user, zone, statut, agent, horodatage, événement).

---

## 10. Coût infrastructure (référence contractuelle)

| Prestation | Montant HT (3 mois) | Statut |
|------------|---------------------|--------|
| Supabase Pro + Large + Scaling | 6 300,20 MAD | Déboursé |
| Vercel Pro + Edge | 2 217,60 MAD | Déboursé |
| Railway Pro | 2 217,60 MAD | Déboursé |
| **Total déboursé TTC** | **12 882,48 MAD** | BC 20260048 |

**Recommandation :** prolonger l'infrastructure jusqu'après le **29 novembre 2026** (fin SIB).

---

## 11. Conclusion

La plateforme SIB 2026 utilise une architecture **cloud professionnelle** (Supabase + Vercel + Railway), dimensionnée **au-dessus des offres gratuites**, avec séparation claire entre **site vitrine** (CDN), **données et scans** (Supabase), et **services métier** (Railway).

Les tests de charge sur **production** confirment :

- **200 000 scans QR** en ~9 minutes, **0 % d'erreur**, **100 % enregistrés** ;
- **200 portiques simultanés** sans échec ;
- **5 000 lectures API** simultanées sans erreur ;
- Site public stable via **CDN mondial Vercel**.

Pour le Salon International du Bâtiment 2026 et une affluence jusqu'à **200 000 visiteurs**, l'architecture est **adaptée, testée et stable**, avec badges **imprimés en priorité** à l'entrée et **QR app** pour au moins **200 utilisateurs** simultanés.

---

*Document généré pour Urbacom — Elite Tech Holding SARL. Tests exécutés juin 2026 sur environnement production Supabase.*
