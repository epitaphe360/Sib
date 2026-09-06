# Checkpoint courant — Elitech Lab

**Date** : 2026-09-06
**Branche** : `cursor/elitech-lab-foundation-5783`
**État** : AUTH + multi-tenant + DB + dashboard shell.

## Fait

- Isolation `/lab` + schéma SQL `lab` (SIB intact)
- Migration + RLS + RPC `submit_public_request`
- RBAC central (`rbac.ts`) · machine à états · marge configurable
- Shell admin/client, login password + OTP, formulaire demande, qualification / consultation / devis brouillon
- Tests unitaires `tests/unit/lab-core.test.ts`

## À faire (humain)

- Appliquer la migration sur le projet Supabase
- Exposer le schéma `lab` (déjà dans `config.toml`)
- OTP TTL 10 min dans le dashboard Auth
- Créer le 1er membership SUPER_ADMIN (user auth + `lab.organization_members`)

## Prochaine étape

Phase 5–7 : CRUD fournisseurs, comparaison offres, envoi devis + relance.
