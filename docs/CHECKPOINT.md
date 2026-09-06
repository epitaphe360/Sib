# Checkpoint courant

**Date** : 2026-09-06
**Branche** : `cursor/token-optimization-skill-5783`
**État** : token-optimization appliqué au projet (Step 1 + 3).

## Mesure (Step 1)

| Bucket | Avant | Après | Action |
|---|---|---|---|
| System / `CLAUDE.md` | ~700–950 tok | ~250 tok | Slim + pointeurs `/docs` |
| Catalogue skills L1 | ~38 skills metadata / tour | 1 skill | Archive `.claude/skills-archive/` |
| Mémoire | n/a | index < 200 tok | `docs/MEMORY.md` |
| Tool defs / MCP | settings.local permissions only | inchangé | Pas de MCP projet |

Dominant : prefix always-on (CLAUDE.md + catalogue skills), pas l’historique.

## Fait

- Skill v1.8.3 installé + lock
- `CLAUDE.md` allégé ; détail dans `docs/CONVENTIONS.md`
- 39 skills hors SIB archivés ; actif : `token-optimization`
- Règles tokens-per-task dans `CLAUDE.md`

## Prochain checkpoint

Step 2 (cache prefix) : ne pas dater/mélanger `CLAUDE.md`. Step 9 : re-mesurer sur une tâche réelle (edit + test) et noter delta tokens-per-task dans ce fichier.
