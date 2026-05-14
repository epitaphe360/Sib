# CLAUDE.md — SIB 2026 Platform

Règles et conventions du projet pour Claude Code. Mis à jour après chaque correction.

## Stack & Architecture

- **React 18 + TypeScript + Vite** — app principale (`src/`)
- **Supabase** — auth + base de données (projet `sbyizudifmqakzxjlndr`)
- **Zustand** — state management (`src/store/`)
- **React Router v6** — routing, routes centralisées dans `src/lib/routes.ts`
- **Tailwind CSS** — styles, design system marocain (navy/gold)
- **Playwright** — tests E2E, **Vitest** — tests unitaires
- **Dev server** : `localhost:9323`
- **Déploiement** : `npx vercel --prod --archive=tgz`

## Conventions importantes

### Auth
- Toujours appeler `await initializeAuth()` après un `supabase.auth.signUp()` réussi
- Utiliser `.maybeSingle()` au lieu de `.single()` pour éviter les erreurs 406
- Le rate limiter login est dans `src/utils/rateLimiter.ts` (5 tentatives / 15 min)
- La validation admin se fait en DB-side dans `src/lib/initAuth.ts`

### Sécurité — OBLIGATOIRE
- **TOUJOURS** passer par `sanitizeHtml()` de `src/utils/sanitizeHtml.ts` avant tout `dangerouslySetInnerHTML`
- Ne JAMAIS exposer `SUPABASE_SERVICE_ROLE_KEY` côté client (uniquement dans `server.js`)
- Les clés VITE_ sont dans `.env.local` (gitignorées) — ne jamais les committer

### i18n / Traductions
- Système custom : `src/hooks/useTranslation.ts` + `src/store/languageStore.ts`
- Fichiers de traduction : `src/store/translations.fr.ts`, `.en.ts`, `.ar.ts`
- Les fichiers dans `src/i18n/translations/` sont le système i18next (parallèle — à unifier)
- 3 langues supportées : `fr`, `en`, `ar` (RTL pour arabe)
- Ne pas modifier les fichiers `.ts` dans `src/i18n/translations/` directement — utiliser les stores

### Composants
- `src/contexts/` — tous les contextes React (`ThemeContext`, `SalonContext`)
- Les guards de rôle sont dans `src/components/guards/`
- `src/components/dev/` contient des outils de développement uniquement (ne pas inclure en prod)

### Structure des fichiers
- Routes centralisées : `src/lib/routes.ts` — toujours utiliser `ROUTES.XXX`
- Config centralisée : `src/lib/config.ts`
- Alias `@` = `./src` dans Vite et Vitest
- **Ne pas créer de scripts à la racine** — les mettre dans `scripts/`

### Tests
- Unitaires dans `tests/unit/` ou `src/**/__tests__/`
- E2E dans `tests/e2e/` avec Playwright
- Les credentials Supabase pour CI sont dans les **GitHub Secrets** : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Base de données
- Migrations dans `supabase/migrations/` (versionées)
- Scripts utilitaires/diagnostic dans `supabase/scripts/` (référence, non versionés)
- Seed data dans `supabase/seeds/` (comptes test, données de démo)
- Toujours utiliser des RPC Supabase pour les opérations atomiques (voir `src/services/securityService.ts`)

## Erreurs fréquentes à éviter

1. **Double import** : vérifier qu'une même ligne `import` n'est pas dupliquée dans un fichier
2. **dangerouslySetInnerHTML sans sanitize** : toujours wrapper avec `sanitizeHtml()`
3. **`.single()` Supabase** : remplacer par `.maybeSingle()` pour éviter les erreurs 406
4. **Fichiers dupliqués** : vérifier `.ts` vs `.tsx` pour les hooks purs (pas de JSX → `.ts`)
5. **Scripts à la racine** : placer dans `scripts/` pas à la racine du projet

## Déploiement

```bash
# Dev local
npm run dev          # port 9323

# Build
npm run build        # Vite build + inject version

# Deploy Vercel
npx vercel --prod --archive=tgz   # Exit 0 = succès

# Tests
npm run test:unit    # Vitest
npm run test:e2e     # Playwright (nécessite serveur dev actif)
```

## Projets imbriqués (NE PAS modifier sans contexte)

- `sib_zone_scanner/` — Flutter app (scanner QR badges)
- `luxury-next/` — Next.js projet séparé
- `urbaevent/` — Projet tiers
- `sib-app/` — App mobile Capacitor
