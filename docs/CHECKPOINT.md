# Checkpoint courant

**Date** : 2026-09-06
**Branche** : `cursor/token-optimization-skill-5783`
**État** : skill `token-optimization` v1.8.3 installé et versionné.

## Fait

- `npx skills add bm629/agent-skills --skill token-optimization` → OK
- Copie projet : `.agents/skills/token-optimization/` + `.claude/skills/token-optimization/`
- Lock : `skills-lock.json` (source `bm629/agent-skills`, hash `3cf99d341bebb75f4f5f8ce349beaf23c22ecb4f669841f86d0d6d763a68fb6c`)
- Mémoire : `docs/MEMORY.md`

## Prochain checkpoint

Audit tokens-per-task SIB (Step 1) : mesurer les 5 buckets (system / tools / history / tool results / output) sur `CLAUDE.md`, skills `.claude/skills/*`, et MCP activés. Cible : `CLAUDE.md` < 1 500 tokens ; index mémoire < 3 000 ; ≤ ~10 serveurs MCP utiles. Appliquer Steps 2–3 seulement si un bucket domine.
