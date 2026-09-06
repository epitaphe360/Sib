# Mémoire permanente — SIB 2026

Index court. Détail dans les fichiers liés. Ne pas y coller de cahier des charges.

## Skills agents

| Skill | Source | Version | Chemins | Lock |
|---|---|---|---|---|
| token-optimization | `bm629/agent-skills` (`skills.sh`) | 1.8.3 | `.agents/skills/token-optimization/` (canon) · `.claude/skills/token-optimization/` (Claude) | `skills-lock.json` hash `3cf99d341bebb75f…` |

Activation : coûts API, fenêtre de contexte, loops lents, prompt caching, compaction. Pas JWT / design tokens.

Workflow : mesurer → cacher le préfixe → alléger le contexte toujours chargé → compresser l’historique → masquer les observations outils → router le modèle → couper les itérations → trim output → re-mesurer.

## Règles de session

- `/docs` = mémoire persistante. Mettre à jour `docs/MEMORY.md` et `docs/CHECKPOINT.md` à chaque livrable.
- Réponse agent : résultat, fichiers, tests, prochain checkpoint. Pas de recopie de spec.
- Ne pas committer `.env*` ni `SUPABASE_SERVICE_ROLE_KEY`.
