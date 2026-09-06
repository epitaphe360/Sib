# Checkpoint courant — Elitech Lab

**Date** : 2026-09-06
**Branche** : `cursor/elitech-lab-foundation-5783`
**État** : workflow métier couvert (demande → facture), UI admin + portail client.

## Fait

Phases 1–17 dans `/lab` : auth, multi-tenant, demandes, fournisseurs, devis, BDC, échantillons, BDC sous-traitant, résultats, triple validation, rapports, factures, réglages, audit, backups, portail client.

## Infra

Appliquer les 4 migrations `2026090600000[1-4]_lab_*`. Exposer schéma `lab`. Créer SUPER_ADMIN.

## Reste hors code (prod)

Resend réel, Drive cron, MFA enrollment, E2E Playwright login réel, restore test exécuté.
