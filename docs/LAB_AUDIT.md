# Audit Elitech Lab — cahier des charges v1.0 + infographie 12 étapes

Sources : PDF `Cahier_des_charges_Elitech_Laboratoire_v1`, infographie « Automatisation complète », code `src/features/lab/**`, SQL `lab.*`, workers `api/lab/*`.

**Légende** : OK = codé et branché · PARTIAL = logique ou UI incomplète · MISSING = pas livré · HUMAN = secret / décision métier, pas du code.

## Infographie 12 étapes (1:1)

| # | Étape | Fichier / RPC | Statut | Note |
|---|---|---|---|---|
| 1 | Demande standardisée (formulaire + IA e-mail → champs) | `LabRequestFormPage.tsx`, `schemas.ts`, `lab.submit_public_request`, `emailToRequest.ts`, `LabInboxPage.tsx` | **OK** | Formulaire strict (tél. chiffres +212). Inbox crée une fiche structurée et liste les manquants. E-mail brut n’est pas la source aval. |
| 2 | Qualification interne FR / sous-traitance EN | `LabRequestDetailPage.tsx`, `request_items.is_internal` | **OK** | Type d’analyse + scission interne/sous-traitée. Consultations forcées `language: en`. |
| 3 | Consultation Top 3/5, comparaison, choix Zineb, ~30 % | `compareOffers.ts`, `LabConsultationDetailPage.tsx`, `pricing_rules`, `applyMargin` | **OK** | Classement scores + accréditation. Choix humain obligatoire. Marge défaut 30 % configurable. |
| 4 | Relance devis 3–4 j + sondage + IA e-mail / 30 min | `quoteFollowup.ts`, `LabQuotesPage.tsx`, `LabQuoteSurveyPage.tsx`, `api/lab/cron.ts`, `api/lab/inbound-email.ts` | **PARTIAL** | Relance + sondage + cron + inbox BDC OK. Boîte IMAP réelle = HUMAN (fournisseur non choisi). Scan 30 min = cron Vercel, pas un worker Railway. |
| 5 | Réception + codes uniques | `LabSamplesPage.tsx`, `sampleCode.ts`, table `lab.samples` | **OK** | Code `ECH-{seq}-{year}-{PRODUCT}` paramétrable. Remplace le registre Excel. |
| 6 | Lancement analyses + pénalité | `LabAnalysesPage.tsx`, `LabDeadlinesPage.tsx`, `deadlines.ts`, `settings.penalty_percent_per_day` | **OK** | 1 %/j = **défaut paramétrable**, jamais règle universelle (conforme PDF §2.7). |
| 7 | Triple revue IA / tech / Zineb + correction 6 h | `LabResultsPage.tsx`, `LabValidationsPage.tsx`, `resultReview.ts`, `aiHeuristics.ts` | **OK** | IA = aide, jamais validation. Motif obligatoire au refus. Double refus → e-mail + délai 6 h. |
| 8 | Rapport PDF par type | `LabReportsPage.tsx`, `reportPdf.ts`, `reportReadiness.ts`, `report_templates` | **PARTIAL** | Gabarits physico / microbio + PDF versionné. Gabarits **officiels compagnie** non intégrés (HUMAN, §10). |
| 9 | Portail OTP 10 min, docs 1 an | `LabClientLoginPage.tsx`, `labSessionStore.ts`, `documentRetention.ts` | **PARTIAL** | OTP 10 min OK. Filtre conservation 365 j OK. Google passwordless = HUMAN (OAuth projet Laboratoire). |
| 10 | Dashboard KPI + tâches | `LabDashboardPage.tsx`, `LabTasksPage`, `LabJourney.tsx` | **OK** | KPI spec + seaux à faire / attente / retard / à valider + parcours 12 étapes. Graphiques = barres/KPI CSS, pas une lib charts. |
| 11 | Facturation client/fournisseur + marge | `LabInvoicesPage.tsx`, `LabSupplierInvoicesPage.tsx`, `invoices.ts` | **OK** | Statuts payé / attente / retard. Marge via `pricing_rules`. |
| 12 | Archive / backup Drive hebdo + audit | `LabBackupsPage.tsx`, `backupManifest.ts`, `lab:backup`, `RESTORE_TEST.md`, `audit_logs` | **PARTIAL** | Inventaire + run `weekly_drive` + audit. Upload Drive chiffré = HUMAN (token). Restauration testée par procédure, pas un bouton magique. |

## PDF — chapitres

### 1. Principes

| Item | Fichier | Statut |
|---|---|---|
| Dossier maître unique | `client_requests` + FK devis/BDC/échantillons/rapports | **OK** |
| Formulaire = canal cible, e-mail = secours IA | form + `extractRequestDraftFromEmail` | **OK** |
| Interne FR / externe EN | UI FR, consultations EN | **OK** |
| Décision = statut + horodatage + auteur + versions | `audit_logs`, `result_reviews`, `quotes.version` | **OK** |
| Pas d’identité client au sous-traitant sans besoin | Offre publique token, pas de PII client dans le formulaire EN | **PARTIAL** | Pas de masquage automatique des notes internes. |

### 2. Workflow 2.1–2.10

Couvert par la matrice 12 étapes ci-dessus. Écarts honnêtes :

| Item PDF | Statut |
|---|---|
| Matrice commerciale détaillée par famille/client | **PARTIAL** — une règle org, pas une matrice multi-familles (§10). |
| Contrôle compétitivité + renégociation | **OK** — alerte sondage + nouvelle version devis (humain). Jamais de changement auto. |
| Historique versions devis | **OK** — `quotes.version` / `parent_quote_id`. |
| IMAP 30 min | **HUMAN** — cron Vercel + webhook `inbound-email`. |
| Pénalité 1 %/j non universelle | **OK** |
| Arbitrage tech vs Zineb (1 oui / 1 non) | **HUMAN** — §10 ; code exige les deux niveaux, pas de règle d’arbitrage inventée. |

### 3. Portail admin

| Item | Fichier | Statut |
|---|---|---|
| Dashboard visuel + KPI listés | `LabDashboardPage.tsx` | **OK** |
| Avancement par test / labo / sous-traitant | Journey + délais + factures fourn. | **PARTIAL** — pas de Gantt par labo. |
| Tâches priorité / échéance / statut | `tasks`, `LabTasksPage` | **OK** |
| Suivi appels (remplace Excel Drive) | `lab.client_calls`, `LabCallsPage.tsx` | **OK** |
| Factures / règlements / justificatifs | invoices + `LabFileField` | **OK** |
| Confirmation actions sensibles | `confirmLabAction` (devis, choix, validations, réglementaire) | **OK** |

### 4. Appels d’offres / réglementation

| Item | Fichier | Statut |
|---|---|---|
| Import listes produits Excel/PDF | CSV / TSV (`parseProductListCsv`) | **PARTIAL** | Excel/PDF binaires : exporter CSV. Pas de parseur xlsx/pdf (pas de nouvelle lib). |
| Uniquement analyses réglementées (textes MA) | `regulatoryCatalog.ts` | **OK** | Catalogue fermé : Loi 28-07, Arrêté 1643-16, NM 03.7.001. Produit hors matrice → **zéro** proposition. |
| Nommer le contaminant | paramètres explicites (Plomb, Salmonella spp., …) | **OK** |
| Texte + référence exacte | `REGULATORY_TEXTS` | **OK** |
| Pas de reco scientifique déguisée | moteur vide si hors catalogue | **OK** |
| Validation humaine avant usage commercial | `regulatory_proposals.status` | **OK** |
| Catalogue exhaustif de tous les arrêtés MA | — | **PARTIAL** | Starter honnête. Limites numériques par denrée et autres arrêtés (ex. contaminants alimentaires hors eau) **non inventés**. |

### 5. Architecture

| Couche | Cible PDF | Livré | Statut |
|---|---|---|---|
| Frontend | React / TS | `src/features/lab` | **OK** |
| Déploiement | Vercel | `api/lab/*`, `lab:vercel` | **OK** |
| Base / Auth / Storage | Supabase projet `omlhfjfpyttfvntfqjnk` schéma `lab` | **OK** |
| Backend / workers | Railway | **Non** — Vercel cron + flush (contrainte produit). | **OK** (écart volontaire) |
| E-mail sortant | Resend | file `email_messages` + worker | **PARTIAL** | `RESEND_API_KEY` HUMAN |
| Boîte entrante | IMAP/API | webhook + classification | **HUMAN** |
| Backup | Drive hebdo | inventaire + planned run | **HUMAN** token |
| Git | oui | PR #9 | **OK** |

Footer UI : React, Supabase, Vercel, Resend, Google Backup — **pas Railway**.

### 6. Sécurité

| Item | Statut | Fichier |
|---|---|---|
| OTP client 10 min | **OK** | A6, login client |
| RBAC + RLS | **OK** | `rbac.ts`, migrations |
| Validation client + serveur | **OK** | zod + RPC `submit_public_request` |
| Rate limit login | **OK** | `labSessionStore` + `rateLimiter` |
| Secrets hors `src/` | **OK** | workers `api/lab` |
| Confirmations sensibles | **OK** | `confirmLabAction` |
| Audit validations | **OK** | `result_reviews`, `audit_logs` |
| Backups + restore test | **PARTIAL** | procédure `docs/RESTORE_TEST.md` |

### 7. UX/UI

| Item | Statut |
|---|---|
| Design premium responsive | **OK** — navy / or / cyan, landing + shell + dashboard + flux clés |
| Nav tâches (à faire / attente / retard / à valider) | **OK** dashboard |
| Formulaires + masques + erreurs | **OK** |
| Dashboard lisible en quelques secondes | **OK** |

### 8. Modèle de données

Toutes les entités du PDF existent (`clients` … `audit_logs`) + `client_calls`, `regulatory_*`, `backup_runs`. Isolation `organization_id` + RLS.

### 9. Statuts

Machine `status.ts` / `lab.dossier_status` couvre le happy path et la correction. Libellés UI = enums techniques (pas de traduction métier complète partout) → **PARTIAL** cosmétique.

### 10. Points à paramétrer (HUMAN — pas inventés)

Format code échantillon · matrice commerciale fine · clauses pénalité par contrat · arbitrage tech/Zineb · gabarits officiels · fournisseur mailbox · règles facturation héritées · conservation légale > 1 an.

### 11–12. Acceptation

| Critère | Statut |
|---|---|
| Lien dossier jamais perdu | **OK** (FK) |
| Isolation clients | **OK** RLS (à valider en prod après 1er SUPER_ADMIN) |
| Relances / pénalités idempotentes | **OK** flags `followup_sent_at`, `reminded_at`, `late_notified_at` |
| Validations auditées | **OK** |
| Restauration testée | **PARTIAL** procédure |
| Formulaires invalides refusés | **OK** |
| Perf desktop / tablette / mobile | **OK** layout responsive (non bench load) |

## Encore HUMAN (pas du code)

1. Premier login `/lab/login` → SUPER_ADMIN.
2. Vercel : `RESEND_API_KEY`, `LAB_CRON_SECRET`, projet Laboratoire.
3. Token Google Drive + politique de restauration réelle.
4. Gabarits PDF officiels.
5. Compte mailbox IMAP/API.
6. OAuth Google client (option PDF §2.10).
7. Enrichir le catalogue réglementaire avec les arrêtés manquants **cités**, après relecture juridique.

## Tests

`npm run test:unit -- tests/unit/lab-core.test.ts` — doit rester vert (pricing, statuts, réglementaire, e-mail→fiche, rétention, parcours 12).
