# Mémoire permanente — SIB 2026

Index court. Détail dans les fichiers liés. Ne pas coller de spec ici.

| Sujet | Fichier |
|---|---|
| Conventions (stack, auth, i18n, tests, DB) | `docs/CONVENTIONS.md` |
| Checkpoint courant | `docs/CHECKPOINT.md` |
| Token skill (canon) | `.agents/skills/token-optimization/SKILL.md` |
| Token skill (Claude) | `.claude/skills/token-optimization/SKILL.md` |
| Skills hors catalogue | `.claude/skills-archive/` |
| Lock | `skills-lock.json` |

## Tokens

- Cible : tokens-par-tâche, pas tokens-par-message.
- `CLAUDE.md` always-on ~250 tokens (était ~700–950). Détail déplacé vers `docs/CONVENTIONS.md`.
- Catalogue skills : 1 actif (`token-optimization`). 39 archivés (metadata plus injectée).
- Agents SIB conservés : `.claude/agents/i18n-checker`, `security-reviewer`.

## Session

- `/docs` = mémoire. Maj `MEMORY.md` + `CHECKPOINT.md` à chaque livrable.
- Réponse : résultat, fichiers, tests, checkpoint.
- Jamais committer `.env*` ni `SUPABASE_SERVICE_ROLE_KEY`.
