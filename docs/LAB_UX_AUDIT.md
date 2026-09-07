# Audit UX Elitech Lab — opérateur quotidien

Date : 2026-09-07. Périmètre : `src/features/lab/**` uniquement.  
Objectif : un admin / une assistante / Madame Zineb **travaille un dossier sans chasser** l’information.

Ce document n’est pas un cahier des charges. C’est un constat d’usage + un plan d’écran.

---

## 1. Diagnostic (pourquoi c’est dur aujourd’hui)

Le métier est **codé**. L’écran est **découpé comme une base de données**, pas comme une journée de labo.

Un dossier (ex. Atlas Oils `DEM-SEED-01`) n’est pas un parcours. C’est **12 listes + 1 page trop longue**.

| Ce que l’opérateur veut | Ce que le produit fait |
|---|---|
| Voir **la phase actuelle** et **la prochaine action** | Voir 26 liens de menu + 6 graphes + 3 formulaires empilés |
| Un dossier = un fil | Un dossier = Demandes **et** Consultations **et** Devis **et** BDC **et** Échantillons **et** Sous-traitance **et** Résultats **et** Validations **et** Rapports **et** Factures |
| Phase 1 visible, puis Suivant, phase 2 | `LabRequestDetailPage` affiche Qualification + Consultation + Devis **en même temps**, même si le statut est `NEW_REQUEST` |
| File d’attente temps réel | Dashboard Recharts d’abord ; rail figé sur l’étape 1 (`status="NEW_REQUEST"`) |
| Labels métier (À qualifier, En attente ECH) | Enums bruts `NEW_REQUEST`, `WAITING_SUPPLIER_QUOTES` |

Preuves concrètes :

- **`LabShell` NAV** : 26 items à plat, du Dashboard aux Sauvegardes. Aucun regroupement « travail du jour » vs « référentiels ».
- **`LabDashboardPage`** : 8 KPI + 4 seaux + 6 graphes **avant** les listes de suivi. `LabJourneyRail` n’utilise pas les dossiers en cours. En bas, `LabJourneyGrid` = infographie marketing, pas un outil.
- **`LabRequestDetailPage`** : rail 12 pastilles (`LabJourneyRail`) **sans lien** (`hrefForStep` absent). Trois `LabSection` empilées (qualifier / consulter / devis). Phases 5–12 **absentes** de cette page — elles vivent ailleurs.
- **`hrefForJourneyStep`** (dashboard) envoie vers des **listes** (`/lab/admin/quotes`, `/samples`…) jamais vers le dossier ouvert.
- **Étapes 9 et 10** dans `LAB_JOURNEY` ont `statuses: []` : ce sont des **surfaces produit** (portail, dashboard) collées dans le pipeline dossier. Le bar chart « Pipeline 12 étapes » les compte à 0 pour toujours.
- **Aucun realtime** : fetch unique `useEffect` partout. Pas de canal Supabase, pas de polling.

Résultat : l’opérateur **sait** qu’il y a 12 étapes, mais il **scrolle et clique** pour trouver laquelle est la sienne.

---

## 2. Modèle proposé — un dossier = un wizard

### Règle unique

> **Un écran de travail = un dossier + une phase + une action principale « Suivant ».**

Les autres phases : **repliées** (faites) ou **verrouillées** (pas encore). Jamais trois formulaires actifs.

### Phases dossier (10, pas 12)

Les étapes 9 (portail client) et 10 (dashboard) **sortent du rail dossier**. Ce sont des **lieux**, pas des états d’un dossier.

| Phase | Titre opérateur | Statuts `client_requests` | Action « Suivant » quand |
|---|---|---|---|
| 1 | Demande reçue | `NEW_REQUEST` | Lecture OK → ouvrir Qualification |
| 2 | Qualification | `QUALIFICATION` | Canal + type d’analyse enregistrés |
| 3 | Consultation ST | `WAITING_SUPPLIER_QUOTES`, `SUPPLIER_SELECTED` | Fournisseur choisi (humain) **ou** canal Interne (saut) |
| 4 | Devis + BDC | `CLIENT_QUOTE_*`, `WAITING_CLIENT_RESPONSE`, `PURCHASE_ORDER_RECEIVED`, `WAITING_SAMPLES` | BDC accepté |
| 5 | Réception ECH | `SAMPLES_RECEIVED`, `SAMPLES_CODED` | Au moins un code ECH |
| 6 | Lancement analyses | `SENT_TO_SUPPLIER`, `ANALYSIS_IN_PROGRESS` | Ordre ST envoyé |
| 7 | Triple contrôle | `RESULTS_*`, `AI_REVIEW`, `TECHNICAL_REVIEW`, `FINAL_REVIEW`, `CORRECTION_REQUESTED` | Validation finale Zineb |
| 8 | Rapport | `APPROVED`, `REPORT_GENERATION`, `REPORT_SENT` | PDF envoyé |
| 9 | Facturation | `INVOICED` | Facture émise (règlements = sous-étape) |
| 10 | Archive | `CLOSED` | Clôturé |

### Architecture d’information (cible)

```
Travail (toujours visible)
├── File d’attente          /lab/admin/dashboard     ← ACCUEIL
└── Dossier (wizard)        /lab/admin/requests/:id  ← 90 % du temps

Attentes (raccourcis, pas des silos)
├── Relances devis          filtre phase 4
├── ECH à réceptionner      filtre phase 5
└── À valider               filtre phase 7

Référentiels (menu replié « Admin »)
├── Fournisseurs · Clients · Utilisateurs
├── Réglementation (une seule page)
├── Appels (CRM léger)
└── Réglages · MFA · Audit · Sauvegardes · Gabarits

Hors labo (public)
├── Formulaire demande · Login admin · Login client OTP
└── Offre ST (token) · Sondage devis (token)
```

### Maquette wizard dossier (markdown)

```
┌─────────────────────────────────────────────────────────────┐
│ DEM-SEED-01  Atlas Oils  ·  Huile d’argan                   │
│ PHASE 2 / 10  Qualification                                 │
│ Prochaine action : enregistrer canal Interne / Sous-traité  │
├─────────────────────────────────────────────────────────────┤
│  ●1  ●2 actuel  ○3  ○4  ○5  ○6  ○7  ○8  ○9  ○10            │
│  (fait) (cyan)  (gris verrouillé)                           │
├─────────────────────────────────────────────────────────────┤
│  ▸ Phase 1 Demande          [repliée — résumé 3 lignes]     │
│                                                             │
│  ▾ Phase 2 Qualification    ← SEULE ZONE ACTIVE             │
│      Type · Canal · Analyses FR/EN                          │
│      [ Enregistrer et passer à la suite ]                   │
│                                                             │
│  ▸ Phase 3 Consultation     🔒 après qualification          │
│  ▸ …                                                    🔒  │
└─────────────────────────────────────────────────────────────┘
```

Dashboard cible (file, pas cockpit) :

```
┌─ File d’attente ────────────────────────────────────────────┐
│  À faire aujourd’hui (moi)     4                            │
│  En attente (client / ST)      6                            │
│  En retard                     2  ← rouge, en haut          │
│  À valider (Zineb)             1                            │
├─────────────────────────────────────────────────────────────┤
│  Phase 2 Qualification                                      │
│    DEM-SEED-01  Atlas Oils   [Ouvrir]                       │
│  Phase 4 Relance devis                                      │
│    DEM-SEED-05  Miel         [Relancer]                     │
│  Phase 5 Attente ECH                                        │
│    DEM-SEED-06  BDC accepté  [Réceptionner]                 │
├─ KPI direction (replié)  Marge · Impayés · Pipeline ───────┤
└─────────────────────────────────────────────────────────────┘
```

Realtime : subscription `client_requests` (statut) + pastille « mis à jour il y a Xs » sur la file et le wizard.

---

## 3. Inventaire des routes

Source : `LabApp.tsx` + `LAB_ROUTES` + `LabShell` / `LabClientShell`.

### Public

| Route | Page | Rôle |
|---|---|---|
| `/lab` | `LabLandingPage` | Vitrine 12 étapes + 3 CTA |
| `/lab/login` | `LabAdminLoginPage` | Login interne + comptes démo |
| `/lab/client-login` | `LabClientLoginPage` | OTP 10 min, 2 étapes |
| `/lab/request-form` | `LabRequestFormPage` | Formulaire public + extraction e-mail |
| `/lab/supplier-offer/:token` | `LabSupplierOfferPage` | Saisie offre ST (EN) |
| `/lab/quote-survey/:token` | `LabQuoteSurveyPage` | Sondage devis client |

### Admin (shell 26 liens)

| Route | Page | Dans le menu ? |
|---|---|---|
| `/lab/admin/dashboard` | `LabDashboardPage` | oui |
| `/lab/admin/requests` | `LabRequestsPage` | oui |
| `/lab/admin/requests/:id` | `LabRequestDetailPage` | via liste |
| `/lab/admin/calls` | `LabCallsPage` | oui |
| `/lab/admin/regulatory` | `LabRegulatoryPage` | oui |
| `/lab/admin/regulation` | `LabRegulationPage` | **non** (doublon orphelin) |
| `/lab/admin/suppliers` | `LabSuppliersPage` | oui |
| `/lab/admin/suppliers/:id` | `LabSupplierDetailPage` | via liste |
| `/lab/admin/consultations` | `LabConsultationsPage` | oui |
| `/lab/admin/consultations/:id` | `LabConsultationDetailPage` | via liste |
| `/lab/admin/quotes` | `LabQuotesPage` | oui |
| `/lab/admin/quotes/:id` | `LabQuoteDetailPage` | via liste |
| `/lab/admin/orders` | `LabOrdersPage` | oui |
| `/lab/admin/orders/:id` | `LabOrderDetailPage` | via liste — **réception ECH ici** |
| `/lab/admin/samples` | `LabSamplesPage` | oui |
| `/lab/admin/samples/:id` | `LabSampleDetailPage` | via liste |
| `/lab/admin/analyses` | `LabAnalysesPage` | oui |
| `/lab/admin/results` | `LabResultsPage` | oui |
| `/lab/admin/validations` | `LabValidationsPage` | oui |
| `/lab/admin/reports` | `LabReportsPage` | oui |
| `/lab/admin/report-templates` | `LabReportTemplatesPage` | **non** |
| `/lab/admin/clients` | `LabClientsPage` | oui |
| `/lab/admin/users` | `LabUsersPage` | oui |
| `/lab/admin/tasks` | `LabTasksPage` | oui |
| `/lab/admin/invoices` | `LabInvoicesPage` | oui |
| `/lab/admin/payments` | `LabPaymentsPage` | oui |
| `/lab/admin/supplier-invoices` | `LabSupplierInvoicesPage` | oui |
| `/lab/admin/deadlines` | `LabDeadlinesPage` | oui |
| `/lab/admin/emails` | `LabEmailsPage` | oui |
| `/lab/admin/inbox` | `LabInboxPage` | oui |
| `/lab/admin/mfa` | `LabMfaPage` | oui |
| `/lab/admin/settings` | `LabSettingsPage` | oui |
| `/lab/admin/audit` | `LabAuditPage` | oui |
| `/lab/admin/backups` | `LabBackupsPage` | oui |

### Portail client

| Route | Page |
|---|---|
| `/lab/client/dashboard` | `LabClientHomePage` |
| `/lab/client/requests` | `LabClientRequestsPage` |
| `/lab/client/requests/:id` | `LabClientRequestDetailPage` |
| `/lab/client/quotes` | `LabClientQuotesPage` |
| `/lab/client/reports` | `LabClientReportsPage` |
| `/lab/client/invoices` | `LabClientInvoicesPage` |
| `/lab/client/profile` | `LabClientProfilePage` (pas dans le nav) |

Mort : `LabPlaceholderPage` n’est plus monté dans `LabApp`.

---

## 4. Suggestions par page

Priorité : **P0** bloque le quotidien · **P1** friction forte · **P2** polish / dette.

### 4.1 Accueil opérateur — `LabDashboardPage`

**Fait aujourd’hui.** Cockpit direction : kicker « Étape 10 · Pilotage », 8 tuiles KPI, 4 seaux (À faire / En attente / En retard / À valider), 6 Recharts, 5 listes de tracking, grille 12 cartes.

**Problème.** L’assistante ouvre l’app pour **travailler**. Elle voit d’abord des aires et un camembert. Les listes utiles sont sous le pli. Le rail est cosmétique (toujours étape 01). Les seaux `TASK_BUCKETS` pointent vers des **pages différentes** (Demandes, BDC, Délais, Validations) — pas une file unique.

**Suggestion.** Inverser : file d’attente par phase en premier (clic = wizard). Compteurs retard / à valider collés en haut. Graphes dans un volet « Pilotage » replié (Direction seulement). Rail dashboard = **colonnes de dossiers**, pas 12 pastilles globales. **P0**

### 4.2 Liste demandes — `LabRequestsPage`

**Fait.** Tableau 50 dernières : dossier, client, produit, n° d’étape (`journeyStepForStatus` = chiffre seul « 2 »), badge statut enum.

**Problème.** Pas de filtre phase. Pas de colonne « prochaine action ». Étape = `2` sans libellé. Tous les dossiers mélangés (ouverts + clos). Lien vers une page qui n’est pas un wizard.

**Suggestion.** Grouper par phase. Colonne **À faire** en français. Filtre « mes urgences ». Clic = wizard à la phase courante. **P0**

### 4.3 Dossier — `LabRequestDetailPage`  ★ cœur du problème

**Fait.** En-tête n° + société + `product · STATUS · canal`. Rail 12 pastilles. Puis **toujours** :

1. `LabSection` Qualification (formulaire complet + bouton Qualifier)
2. Consultation ST (si canal ≠ INTERNAL) — checkboxes fournisseurs + Envoyer brouillon
3. Devis client — prix ST, marge, plafond, Générer le devis

**Problème (Atlas Oils, étapes 01–05 sur un scroll).**

- Aucun conditionnement par statut : on peut générer un devis **avant** d’avoir choisi un ST.
- Qualifier ne masque pas le formulaire ni n’ouvre la phase suivante : un toast, et les 3 cartes restent.
- Consultation « Envoyer (brouillon) » **n’envoie pas** : pas de lien vers `LabConsultationDetailPage`, pas d’attente d’offres, pas de « Suivant ».
- Devis créé ici ; **valider / envoyer / relancer** est sur `LabQuotesPage`. L’opérateur casse le fil.
- Réception ECH, analyses, contrôle, rapport, facture : **invisibles**. Il faut deviner le menu.
- Rail sans href, sans « phase verrouillée », sans résumé des étapes faites.

**Suggestion.** Transformer cette page en **wizard unique** (maquette §2). Chaque phase = composant (qualifier, consulter, devis, réception, envoi ST, résultats, revue, PDF, facture). `Suivant` disabled tant que les champs requis de **cette** phase ne sont pas faits. Historique en accordéons. **P0**

### 4.4 Consultations — `LabConsultationsPage` / `LabConsultationDetailPage`

**Liste.** Date + mode TOP_3 + lien « ouvrir » dossier. Pas de n° dossier, pas d’état (en attente d’offres / à choisir), pas de compteur d’offres.

**Détail.** Comparaison rang / prix / délai + bouton Valider : **c’est la meilleure UI métier actuelle**. Mais : tokens d’offre en brut `/lab/supplier-offer/uuid`, pas de copie mail, pas de retour wizard, pas d’état « 2/3 réponses ».

**Suggestion.** Ne plus en faire une destination quotidienne. Embed comparaison dans le wizard phase 3. Liste = raccourci « consultations en attente ». Copier lien / renvoyer invitation. **P0** (parcours) / détail comparaison **OK à réutiliser**.

### 4.5 Devis — `LabQuotesPage` / `LabQuoteDetailPage`

**Liste.** N°, montant, statut, boutons contextuels Valider / Envoyer / Relancer. Utile.

**Problème.** Coupée du dossier. Pas de client ni de phase. `LabQuoteDetailPage` = fichier + « nouvelle version » marge — pas d’envoi, pas de lien dossier, sondage en URL brute.

**Suggestion.** Actions devis **dans le wizard phase 4**. Liste = file « à valider / à relancer » avec lien dossier. Détail = historique versions, pas un silo. **P0**

### 4.6 BDC — `LabOrdersPage` / `LabOrderDetailPage`

**Liste.** Formulaire d’ingest BDC (réf, client, montant) + tableau. Copie claire : l’app n’invente pas le BDC.

**Détail.** Si `accepted`, **formulaire de réception / codification ECH** (`next_sample_codes`). Donc la phase 5 est **cachée derrière un BDC**, pas derrière le dossier.

**Suggestion.** Ingest BDC + réception ECH = étapes du wizard 4 puis 5. Liste BDC = exceptions (à corriger). **P0**

### 4.7 Échantillons — `LabSamplesPage` / `LabSampleDetailPage`

**Liste.** Code, produit, date. Pas de dossier, pas d’état « en analyse ».

**Détail.** Fiche lecture + fichier. Pas d’action « lancer analyse ».

**Suggestion.** Registre OK en secondaire. Réception et lancement = wizard. **P1**

### 4.8 Sous-traitance — `LabAnalysesPage`

**Fait.** **Tous** les échantillons, bouton « envoyer » + délai global 7 j.

**Problème.** Aucun filtre « déjà envoyé ». Pas de dossier visible. Un clic envoie un PO ST sans confirmation de phase.

**Suggestion.** Uniquement les dossiers phase 6 dans le wizard. Liste = file « à envoyer ». **P0**

### 4.9 Résultats — `LabResultsPage`

**Fait.** Formulaire saisie (select **tous** les dossiers) + liste plate.

**Problème.** On rattache un résultat à n’importe quel dossier, même non analysé. Pas de contexte échantillon / méthode attendue.

**Suggestion.** Saisie dans wizard phase 7, pré-rempli analyses du dossier. **P1**

### 4.10 Validations — `LabValidationsPage`

**Fait.** Une carte par résultat : résumé IA, motif, 4 boutons Tech/Zineb accepter/refuser.

**Problème.** Tous les résultats, y compris déjà validés. **Pas de n° dossier**. Tech et Zineb sur la même carte (risque de cliquer le mauvais niveau). Pas d’enchaînement « IA aide → tech → Zineb » visible.

**Suggestion.** File « à valider » = dossiers phase 7. Dans le wizard : 3 colonnes / 3 étapes, boutons selon rôle. **P0** pour Zineb.

### 4.11 Rapports — `LabReportsPage` / `LabReportTemplatesPage`

**Fait.** Cartes des dossiers `APPROVED`+ ; génère PDF + envoi. Gabarits : liste sans CRUD, **hors menu**.

**Suggestion.** Générer / envoyer dans wizard phase 8. Gabarits sous Réglages. **P1**

### 4.12 Factures — `LabInvoicesPage` / `LabPaymentsPage` / `LabSupplierInvoicesPage`

**Client.** Boutons « Facturer {dossier} » si `REPORT_SENT` + tableau restant + form paiement. **Paiements** = liste sans action (renvoie à Factures). **Fournisseurs** = saisie + agrégat par ST.

**Problème.** Facturer = bouton isolé hors dossier. Trois menus pour l’étape 11.

**Suggestion.** Wizard phase 9 = facture client du dossier. Menu Finance unique (client | ST | paiements en onglets). **P1**

### 4.13 Délais — `LabDeadlinesPage`

**Fait.** Tableau attendu / état / pénalité / relance. Utile mais UUID `request_id` brut.

**Suggestion.** Lier au dossier. Alertes dans la file dashboard, pas un 21ᵉ menu. **P1**

### 4.14 Inbox / E-mails — `LabInboxPage` / `LabEmailsPage`

**Inbox.** Formulaire `message_id` + classer / créer fiche. Secours étape 1, pas une boîte réelle.

**E-mails.** File `email_messages` (queued/sent). Deux menus voisins, deux concepts.

**Suggestion.** Un item « Courrier » : Entrant | Sortant. Création de fiche → **ouvre le wizard phase 1**. **P1**

### 4.15 Appels — `LabCallsPage`

**Fait.** Formulaire + liste. Remplace Excel. **Pas de lien dossier.**

**Suggestion.** Option « créer / rattacher une demande ». Sinon OK comme CRM léger. **P2** (page honnête)

### 4.16 Réglementation — `LabRegulatoryPage` **et** `LabRegulationPage`

**Problème.** Deux pages, deux catalogues (`regulatoryCatalog` vs `regulationCatalog`). Une seule dans le nav. L’opérateur ne sait pas laquelle est la source.

**Suggestion.** Une page. L’autre route redirige. **P1**

### 4.17 Fournisseurs / Clients / Users / Tâches

| Page | Verdict | Suggestion |
|---|---|---|
| `LabSuppliersPage` + détail | **OK** référentiel (form + liste) | Scores qualité/délai/prix visibles en liste (besoin phase 3). **P2** |
| `LabClientsPage` | Minimal (nom société) | Rattacher aux dossiers. **P2** |
| `LabUsersPage` | Invite + UUID tronqué | Afficher e-mail, pas `user_id.slice(0,8)`. **P1** |
| `LabTasksPage` | To-do générique parallèle au workflow | Ne pas concurrencer la file dossier. Tâches = exceptions, ou supprimer du menu principal. **P1** |

### 4.18 Réglages / MFA / Audit / Backups

`LabSettingsPage` : formulaire dense mais **lisible** (marge, pénalité, relance, conservation, pattern ECH). **OK.**  
`LabMfaPage` : enrollment TOTP. **OK**, à ranger sous profil, pas 23ᵉ item.  
Audit / backups : listes brutes. **OK** pour admin rare. Hors nav quotidien. **P2**

### 4.19 Login / landing / formulaire public

| Page | Verdict |
|---|---|
| `LabAdminLoginPage` | **OK** — focus, démo, CTA unique |
| `LabClientLoginPage` | **OK** — email puis code, message 10 min |
| `LabRequestFormPage` | **OK** comme étape 1 client. Succès = UUID interne, pas de « et maintenant ». Ajouter : « Conservez la référence, espace client OTP ». **P2** |
| `LabLandingPage` | Marketing 12 cartes. Fine pour visiteurs. **Ne pas** en faire l’écran post-login. **OK** |
| `LabSupplierOfferPage` | **OK** (EN). Succès trop nu. **P2** |
| `LabQuoteSurveyPage` | **OK** court. **P2** |

### 4.20 Portail client

| Page | Problème | Suggestion |
|---|---|---|
| `LabClientHomePage` | 4 tuiles documents, **zéro dossier en cours** | Accueil = « Votre dossier X est à l’étape Devis — accepter / attendre » **P0** |
| `LabClientRequestsPage` | `LabDossierTrack` (12 barres sans texte) | Libellé phase + prochaine action client **P1** |
| `LabClientRequestDetailPage` | Badge enum + barres. Pas de devis, pas de rapport | Même wizard **lecture** (phases verrouillées, CTA si action client) **P0** |
| Quotes / Reports / Invoices | Lignes `DEV-… · montant · draft` ; rapport = `id.slice(0,8)` ; pas de PDF | Télécharger, statut FR, lier au dossier **P1** |
| `LabClientProfilePage` | E-mail seul, hors nav | OK ou fusionner header **P2** |

`LabClientShell` : nav Demandes / Devis / Rapports / Factures = mêmes silos que l’admin.

---

## 5. Menu — proposition concrète

Aujourd’hui (`LabShell` `NAV`) : 26 liens, ordre workflow mélangé à l’admin (Appels et Réglementation **avant** Devis).

Cible (rôle ASSISTANTE / Zineb) :

1. **File d’attente** (dashboard)
2. **Dossiers** (liste filtrable — optionnel si la file suffit)
3. Relances · Validations · Réception ECH *(badges compteur, raccourcis de filtre)*
4. — séparateur —
5. Fournisseurs
6. Clients
7. Courrier
8. Finance (factures)
9. — Admin —
10. Réglages (inclut MFA, gabarits, users)
11. Audit / sauvegardes

Hors menu : consultations, devis, BDC, échantillons, analyses, résultats, rapports, délais, paiements, tâches, regulation orpheline — **accessibles depuis le dossier**.

---

## 6. Affichage (transversal)

1. **Statuts en français** : « Nouvelle demande », pas `NEW_REQUEST`. Fichier labels unique.
2. **Toujours n° dossier + client** sur chaque carte / ligne (validations, délais, analyses).
3. **Une action primaire** par écran (or, pleine largeur mobile). Secondaires en overflow.
4. **Rail compact** : 10 pastilles, actuelle agrandie + titre. Pas 12 chips `truncate` de 7,5 rem.
5. **Homogénéiser** `LabPage` / `LabBtn` vs `Button`+`h1` brut (`LabConsultationsPage`, `LabAnalysesPage`, listes admin).
6. **Confirmations** déjà là (`confirmLabAction`) : les garder dans le wizard.
7. **Temps réel** : au minimum refetch 15 s ou `postgres_changes` sur `client_requests`. Pastille live sur la file.

---

## 7. Priorités (décision)

### P0 — sans ça, on continue de chasser

1. Wizard dossier : une phase à l’écran + Suivant + phases repliées/verrouillées (`LabRequestDetailPage`).
2. Dashboard = file par phase, graphes repliés. Rail dashboard **corrigé** (plus `NEW_REQUEST` en dur).
3. Brancher dans le wizard : qualification, consultation+choix, devis valider/envoyer, BDC, réception ECH, envoi ST, validations.
4. Menu réduit (travail vs admin).
5. Portail client : dossier + prochaine action, pas 4 silos vides.

### P1

File filtres (relances, ECH, à valider) comme vues de la même file.  
Fusion réglementation. Courrier unique. Finance en onglets. Labels FR. Users e-mail. Tâches hors nav principal. Rapports/factures dans le wizard. Realtime.

### P2 — déjà utilisable

Logins, formulaire public, offre ST, sondage devis, réglages, MFA, fiche fournisseur, page appels (si on accepte le CRM séparé), landing.

---

## 8. Ce qu’on ne casse pas

- Transitions `canTransition` / `lib/status.ts` — le wizard **consomme** cette machine, il ne la réinvente pas.
- Choix ST toujours humain (`LabConsultationDetailPage` à extraire en composant).
- Marge jamais auto-modifiée ; nouvelle version devis = action humaine.
- OTP client 10 min, isolation `/lab`.
- Formulaire public = source opérationnelle.

---

## 9. Effort (technique, pas calendrier)

| Lot | Surfaces | Nature |
|---|---|---|
| A | `LabRequestDetailPage` + extraire sections existantes | Wizard + gating par `journeyStepForStatus` |
| B | `LabDashboardPage` + `LabShell` NAV | File d’abord, menu court |
| C | Embed actions aujourd’hui sur Quotes / Orders / Analyses / Validations / Reports / Invoices | Pas de nouvelle logique métier, déplacement UI |
| D | Portail client détail | Lecture + CTA |
| E | Realtime + labels FR + fusion regulation | Finition |

Lot A+B suffisent à **prouver** le modèle sur DEM-SEED-01 (plus de scroll 01–05).

Si validation : implémenter d’abord **wizard dossier + dashboard file d’attente**.
