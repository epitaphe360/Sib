# Audit CDC Elitech Lab — 2026-09-06

Sources : *Cahier des charges fonctionnel & technique* v1.0 (05/09/2026) + infographie 12 étapes.  
Verdict global : **PARTIAL**. Le workflow métier est codé. Ce qui manque est surtout l’allumage prod (Resend, Drive, premier admin), les gabarits officiels, la boîte mail réelle, et l’Excel/PDF binaire.

Légende : **OK** = codé et testé (logique + UI/SQL). **PARTIAL** = présent mais incomplet ou heuristique. **MISSING** = pas dans le produit.

## Chapitres CDC

| Ch. | Exigence | Statut | Preuve / écart |
|---|---|---|---|
| 1 | Dossier maître unique | **OK** | `client_requests` + items, devis, BDC, échantillons, résultats, factures |
| 1 | Formulaire = source opérationnelle | **OK** | `submit_public_request` ; e-mail brut jamais traité en aval |
| 1 | E-mail libre → pré-remplissage | **PARTIAL** | `extractRequestFromEmail` / `extractRequestDraftFromEmail` = **rules-v1**, pas GPT |
| 1 | Interne FR / sous-traitant EN | **OK** | `execution_channel` + `supplierLanguage` ; consultations `language: 'en'` |
| 1 | Décisions horodatées + auteur | **PARTIAL** | `audit_logs` + reviews ; pas toutes les actions UI auditées |
| 1 | PII client non envoyée au ST sauf besoin | **PARTIAL** | Pas de masquage automatique des champs |
| 2.1 | Formulaire + téléphone indicatif + chiffres | **OK** | `clientRequestSchema` + `LAB_COUNTRY_CODES` |
| 2.2 | Qualification type + flux interne/ST | **OK** | UI qualification + `request_items.is_internal` |
| 2.3 | Top 3/5, prix/délai/accréditation, choix Zineb | **OK** | `rankOffers` / `rankSuppliersForConsult` ; jamais auto-select |
| 2.3 | Réponses tardives conservées | **OK** | Aucune exclusion automatique |
| 2.4 | Comparaison + marge ~30 % paramétrable | **OK** | `pricing_rules` + `applyMargin` |
| 2.4 | Contrôle compétitivité + réduction marge | **OK** | `assessCompetitiveness` + nouvelle version devis (humain) |
| 2.4 | Versions devis | **PARTIAL** | Colonne `version` + UI ; SQL à appliquer sur Laboratoire |
| 2.5 | Relance 3–4 j + sondage | **OK** | Cron + `/lab/quote-survey/:token` |
| 2.5 | Scan e-mails 30 min + BDC IA | **PARTIAL** | Cron Vercel + `classifyInboundEmail` rules-v1. **Pas d’IMAP réel** |
| 2.6 | Réception + `ECH-seq-year-product` | **OK** | `formatSampleCode` + registre Supabase |
| 2.7 | Délais + pénalité **paramétrable** (pas 1 % figé) | **OK** | `settings.penalty_percent_per_day` |
| 2.8 | Triple contrôle ; IA n’accepte jamais | **OK** | `detectResultAnomalies` + reviews tech/Zineb ; double refus → 6 h |
| 2.9 | Gabarits physico / micro + PDF versionné | **PARTIAL** | Sélection auto + PDF générique. **Gabarits officiels compagnie absents** |
| 2.10 | Portail OTP 10 min, accès 1 an | **PARTIAL** | OTP 10 min OK. Filtre conservation 365 j. **Pas de login Google** |
| 3 | Dashboard KPI + tâches + graphiques | **OK** | KPI + suivi (relances, BDC, revues, tâches) + Recharts (pipeline, devis, transactions, marge, succès). Vide = graphes démo locaux, pas la base. |
| 3 | Suivi appels (remplace Excel Drive) | **OK** | `/lab/admin/calls` + table `lab.client_calls` (migration à appliquer) |
| 3 | Factures client + fournisseur | **OK** | Pages + `invoiceProgress` |
| 3 | Confirmation actions sensibles | **OK** | `confirmLabAction` devis / validation / choix ST / réglementaire |
| 4 | Réglementation MA + import produits | **PARTIAL** | Catalogue textes identifiés + CSV. **Pas d’import Excel/PDF binaire**. Validation humaine obligatoire |
| 5 | React / Vercel / Supabase / Resend | **OK** | Isolation `/lab` + `api/lab/*` |
| 5 | Railway | **MISSING (volontaire)** | Vercel only, conformément à la consigne métier |
| 5 | Boîte mail pro IMAP/API | **MISSING** | Inbox manuelle + webhook ; fournisseur mailbox non branché |
| 6 | RBAC + RLS + OTP | **OK** | Schéma `lab` projet `omlhfjfpyttfvntfqjnk` |
| 6 | Backup Drive hebdo chiffré + restore | **PARTIAL** | Manifest + `backup_runs` + `lab:restore-check`. Upload Drive si jeton |
| 7 | UX luxe / parcours 12 étapes | **OK** | Landing + rail + dashboard + portail |
| 8 | Modèle de données | **OK** | 43+ tables fondation ; gaps = migration `20260906000007` |
| 9 | Statuts workflow | **OK** | Machine à états + chemin interne |
| 12 | Acceptation (lien dossier, isolation, idempotence) | **PARTIAL** | Isolé `/lab` + RLS. Restore et Relance idempotentes côté code. Prod non allumée |

## Infographie — 12 étapes

| # | Étape | Alignement produit | Statut |
|---|---|---|---|
| 1 | Demande standardisée (form + e-mail → champs) | Formulaire public + extract rules-v1 | **PARTIAL** |
| 2 | Qualification interne FR / ST EN | Canal + listes internes/ST | **OK** |
| 3 | Consultation Top 3/5, compare, choix Zineb, ~30 % | Comparatif + marge configurable | **OK** |
| 4 | Devis + PO, relance 3–4 j, sondage, e-mails 30 min | Relance + sondage + cron. IMAP **MISSING** | **PARTIAL** |
| 5 | Réception / code `ECH-…` / Supabase | Codification + registre | **OK** |
| 6 | Lancement analyses + pénalité 1 %/j *paramétrable* | Deadlines + taux settings | **OK** |
| 7 | Triple contrôle + correction 6 h | IA aide / RT / Zineb | **OK** |
| 8 | Rapport gabarit + PDF auto | PDF générique, pas gabarit officiel | **PARTIAL** |
| 9 | Portail e-mail + OTP 10 min, 1 an | OTP + rétention. Pas Google | **PARTIAL** |
| 10 | Dashboard admin KPI / tâches | KPI + suivi + graphes Recharts + actions vers les pages | **OK** |
| 11 | Facturation client + fournisseur, marge ~30 % | Factures + règlements + marge | **OK** |
| 12 | Archivage / audit / backup. Stack : Supabase+Vercel+Resend (**pas Railway**) | Audit + backup planifié | **PARTIAL** |

## Encore humain (bloqueurs)

1. Comptes DEV : `npm run lab:seed` (docs/LAB_SEED.md). Sans jeton Management, aucun user Auth n’existe.
2. Vercel : `RESEND_API_KEY`, `LAB_CRON_SECRET`, `VITE_LAB_SUPABASE_*`.
3. `lab:seed` applique `20260906000007` si `client_calls` manque. Vérifier ensuite sur Laboratoire.
4. Gabarits officiels physico / micro à intégrer.
5. Fournisseur mailbox (IMAP/API) si scan 30 min réel.
6. Jeton Google Drive pour backup hebdo automatique.

## Tests

Voir le run Vitest de cette livraison. Cible : **30+** tests lab verts.
