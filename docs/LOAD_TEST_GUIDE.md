# Guide tests de charge — SIB 2026 / UrbaEvent

Objectif : valider que la plateforme tient l'affluence salon **avant le jour J**.

## Scénarios couverts

| # | Scénario | Script | Charge cible | SLA |
|---|----------|--------|--------------|-----|
| 1 | **Site web public** | `npm run load:smoke` | 30–60 requêtes parallèles | p95 < 1200 ms, erreurs < 2 % |
| 2 | **API Supabase** (exposants, programme) | `npm run load:supabase-api` | 400+ lectures | p95 < 1000 ms |
| 3 | **Scans badge entrée** | `npm run load:badge-scan` | 30 portiques × 10 scans | p95 < 800 ms |
| 4 | **QR dynamique app** | `npm run load:qr-token` | 50 users × 4 refresh | p95 < 1500 ms |
| 5 | **5 000 VUs web** (CDC) | `k6 run tests/load/k6-5000-vus.js` | pic 5000 VUs | p95 < 2 s |
| 6 | **Pic entrée k6** | `k6 run tests/load/k6-badge-entrance.js` | 50–100 scanners | p95 < 800 ms |

---

## Prérequis

1. **Node 18+** et dépendances installées (`npm install`)
2. Fichier `.env` racine ou `apps/mobile/.env` avec :
   - `VITE_SUPABASE_URL` ou `EXPO_PUBLIC_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` ou `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` *(recommandé pour pool de badges — tests scan)*
3. **k6** (optionnel, scénarios massifs) : https://k6.io/docs/getting-started/installation/

---

## Exécution rapide (tout en une commande)

### Mode léger — safe sur production

```bash
npm run load:all:light
```

Concurrence réduite (~10–20 VUs équivalent). Idéal pour première validation.

### Mode standard — pré-événement

```bash
npm run load:all
```

---

## Scénarios individuels

### 1. Site web public

```bash
# Local (preview)
npm run build && npm run preview -- --port 9323
LOAD_BASE_URL=http://localhost:9323 npm run load:smoke

# Production
LOAD_BASE_URL=https://sib.ma LOAD_CONCURRENCY=60 LOAD_ITERATIONS=10 npm run load:smoke
```

### 2. Scans badge (critique entrée)

Simule des portiques scannant des badges imprimés.

**Important** : l'app mobile utilise `validate_scanned_badge`. Appliquer avant le test :

```bash
# SQL Editor Supabase → exécuter :
# supabase/migrations/20260625000001_fix_validate_scanned_badge.sql
```

```bash
# Léger
LOAD_SCAN_CONCURRENCY=10 LOAD_SCAN_ITERATIONS=5 npm run load:badge-scan

# Standard (30 portiques, 300 scans) — RPC validate (comme l'app)
npm run load:badge-scan

# Temporaire si migration non appliquée
LOAD_SCAN_RPC=scan_badge npm run load:badge-scan

# Stress entrée (50 portiques, 1000 scans)
LOAD_SCAN_CONCURRENCY=50 LOAD_SCAN_ITERATIONS=20 npm run load:badge-scan
```

### 3. QR dynamique (app mobile)

Simule visiteurs avec écran badge ouvert (refresh JWT).

```bash
npm run load:qr-token

# 100 utilisateurs simultanés
LOAD_QR_CONCURRENCY=100 LOAD_QR_ITERATIONS=6 npm run load:qr-token
```

### 4. API Supabase (lectures salon)

```bash
npm run load:supabase-api
```

### 5. k6 — 5 000 visiteurs simultanés (CDC)

```bash
k6 run -e BASE_URL=https://sib.ma \
  -e SUPABASE_URL=https://xxx.supabase.co \
  -e SUPABASE_ANON_KEY=eyJ... \
  tests/load/k6-5000-vus.js
```

### 6. k6 — Pic d'entrée portiques

Exporter des codes badge (SQL Supabase) :

```sql
SELECT badge_code FROM user_badges WHERE status = 'active' LIMIT 100;
```

```bash
k6 run -e SUPABASE_URL=https://xxx.supabase.co \
  -e SUPABASE_ANON_KEY=eyJ... \
  -e BADGE_CODES=CODE1,CODE2,CODE3,... \
  -e LOAD_PROFILE=peak \
  tests/load/k6-badge-entrance.js
```

Profils k6 : `smoke`, `standard`, `peak`.

---

## Artillery (pages publiques)

```bash
npm run load:artillery          # baseline
npm run load:artillery:staged   # montée progressive jusqu'à stress
```

---

## Critères de succès (jour J)

| Métrique | Seuil |
|----------|-------|
| Taux d'erreur | < 1–2 % |
| Scan badge p95 | < 800 ms |
| API lecture p95 | < 1000 ms |
| Site public p95 | < 1200 ms (CDN) |
| QR token p95 | < 1500 ms |
| Aucun pic 5xx soutenu | Supabase dashboard |

---

## Monitoring pendant le test

1. **Supabase Dashboard** → Database → CPU, connexions, requêtes lentes
2. **Supabase** → Edge Functions → `issue-badge-token` invocations / erreurs
3. **Vercel** → Analytics (si site web testé)
4. Exporter le JSON de sortie des scripts pour rapport client

---

## Plan recommandé J-14 / J-7 / J-1

| Date | Action |
|------|--------|
| **J-14** | `npm run load:all:light` sur production · corriger si échec |
| **J-7** | `npm run load:all` + k6 badge `LOAD_PROFILE=standard` |
| **J-3** | k6 `k6-5000-vus.js` en heures creuses (notifier Supabase) |
| **J-1** | Test terrain : 2 portiques réels + `load:badge-scan` léger en parallèle |
| **Jour J** | Monitoring Supabase, pas de test de charge |

---

## Interprétation pour le client

- **PASS** sur scans badge + API + web → architecture validée pour affluence salon standard.
- **FAIL** sur scans seuls → optimiser RPC / indexes / connexions Supabase avant événement.
- **FAIL** sur QR seul → privilégier badges imprimés à l'entrée (mode prévu).

---

## Fichiers

```
scripts/run-load-smoke.mjs       # Web public
scripts/run-load-badge-scan.mjs  # Scans entrée
scripts/run-load-qr-token.mjs    # QR dynamique
scripts/run-load-supabase-api.mjs# Lectures API
scripts/run-load-all.mjs         # Suite complète
scripts/load/shared.mjs          # Utilitaires
tests/load/k6-5000-vus.js        # 5000 VUs web
tests/load/k6-badge-entrance.js  # Pic entrée
tests/load/public-pages.yml      # Artillery
```
