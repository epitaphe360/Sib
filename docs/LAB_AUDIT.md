# Audit plan Elitech Lab — 2026-09-06 (closeout)

Plan maître : AUTH + multi-tenant + workflow complet + storage signé + IA aide + e-mails + Drive.

**Verdict** : exigences **code + SQL** du plan sont en place. Allumage prod restant : clés Resend / Drive + premier login SUPER_ADMIN.

## Tests

| Test | Résultat |
|---|---|
| Vitest | **30/30** |
| E2E public | landing / login / MFA derrière garde |
| SQL Laboratoire | **43 tables**, org `elitech`, RPC closeout, OTP 10 min |
| `npm run lab:restore-check` | **ok** |

## Plan — livré

Isolation `/lab` · RLS · formulaire · qualification · consultations EN · choix humain · marge 30 % · devis **validé par Zineb avant envoi** · relance 3 j · sondage · BDC client · échantillons + fichiers signés · sous-traitance · délais 1 %/j · triple revue · correction 6 h · PDF · factures / paiements · portail OTP · MFA · invitations · `claim_first_admin` · inbox + webhook · worker Resend · cron relances + impayés · backup + upload Drive si token · IA heuristique (jamais validation).

## Encore humain (pas du code)

1. Se connecter une fois sur `/lab/login` → premier user = SUPER_ADMIN.
2. Vercel : `RESEND_API_KEY` + `LAB_CRON_SECRET` (optionnel, file e-mails).
3. `npm run lab:vercel` — pas de Railway.
