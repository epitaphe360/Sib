# CLAUDE.md — SIB 2026

Tokens-per-task. Mémoire : `/docs`. Ne pas reciter la spec. Détail : `docs/CONVENTIONS.md`.

## Tokens

- Lire seulement les fichiers utiles. Grep/glob ciblés. Batch les lectures indépendantes.
- Ne jamais relire tout le repo. Pas de régénération inutile. Réutiliser composants, types, services, schemas.
- Tests/build seulement si utile. Pas de commande identique répétée.
- Réponses très courtes (max 5 lignes de bilan). Travail dans le repo, pas dans le chat.
- Modèle rapide pour le code routine. Escalade seulement architecture / debug dur / sécu.
- `/docs/MEMORY.md` + `/docs/CHECKPOINT.md` à chaque livrable. Réponse : résultat, fichiers, tests, checkpoint.

## Hard

- `sanitizeHtml()` avant tout `dangerouslySetInnerHTML`
- Jamais `SUPABASE_SERVICE_ROLE_KEY` côté client ; jamais committer `.env*`
- `.maybeSingle()` pas `.single()` ; `initializeAuth()` après `signUp`
- `ROUTES.XXX` (`src/lib/routes.ts`) ; scripts dans `scripts/` seulement
- i18n via stores `src/store/translations.{fr,en,ar}.ts`, pas `src/i18n/translations/`
- RPC atomiques : `src/services/securityService.ts`

## Stack (une ligne)

React 18 + TS + Vite · Supabase · Zustand · RR v6 · Tailwind · Playwright/Vitest · `:9323`

## Hors scope sans contexte

`sib_zone_scanner/` · `luxury-next/` · `urbaevent/` · `sib-app/`

## Skills

Actif : `token-optimization`. Archives : `.claude/skills-archive/`. Agents SIB : `i18n-checker`, `security-reviewer`.
