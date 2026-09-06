# Conventions SIB — détail (chargé à la demande)

Pointer depuis `CLAUDE.md`. Ne pas recopier dans le prompt.

## Stack

- React 18 + TypeScript + Vite (`src/`)
- Supabase auth + DB (`sbyizudifmqakzxjlndr`)
- Zustand `src/store/` · React Router v6 `src/lib/routes.ts` (`ROUTES.XXX`)
- Tailwind (navy/gold) · Playwright E2E · Vitest unitaires
- Dev `localhost:9323` · alias `@` = `./src`
- Config `src/lib/config.ts`

## Auth

- `await initializeAuth()` après `supabase.auth.signUp()` réussi
- `.maybeSingle()` pas `.single()` (évite 406)
- Rate limit login : `src/utils/rateLimiter.ts` (5 / 15 min)
- Validation admin DB-side : `src/lib/initAuth.ts`

## Sécurité

- `sanitizeHtml()` (`src/utils/sanitizeHtml.ts`) avant tout `dangerouslySetInnerHTML`
- `SUPABASE_SERVICE_ROLE_KEY` uniquement dans `server.js`, jamais côté client
- Clés `VITE_*` dans `.env.local` — ne jamais committer

## i18n

- Custom : `src/hooks/useTranslation.ts` + `src/store/languageStore.ts`
- Stores : `src/store/translations.fr.ts` / `.en.ts` / `.ar.ts`
- `src/i18n/translations/` = i18next parallèle — ne pas éditer les `.ts` là ; utiliser les stores
- Langues : `fr`, `en`, `ar` (RTL)

## Composants / fichiers

- Contextes : `src/contexts/` (`ThemeContext`, `SalonContext`)
- Guards : `src/components/guards/`
- `src/components/dev/` = outils dev, pas en prod
- Scripts : `scripts/` uniquement, jamais à la racine
- Hooks purs (pas de JSX) → `.ts` pas `.tsx`

## Tests / DB

- Unitaires : `tests/unit/` ou `src/**/__tests__/`
- E2E : `tests/e2e/` Playwright
- CI secrets : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Migrations `supabase/migrations/` · scripts `supabase/scripts/` · seeds `supabase/seeds/`
- Ops atomiques via RPC (`src/services/securityService.ts`)

## Commandes

```bash
npm run dev          # :9323
npm run build
npx vercel --prod --archive=tgz
npm run test:unit
npm run test:e2e     # besoin du dev server
```

## Projets imbriqués (ne pas toucher sans contexte)

`sib_zone_scanner/` Flutter · `luxury-next/` Next.js · `urbaevent/` tiers · `sib-app/` Capacitor

## Pièges

- Import dupliqué
- `dangerouslySetInnerHTML` sans `sanitizeHtml()`
- `.single()` au lieu de `.maybeSingle()`
- Hook `.tsx` sans JSX
- Script à la racine
