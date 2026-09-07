# Document 27 — Qualification de demande client

Source : PDF `Document_27_17e1.pdf` (18 pages). Date d’audit : 2026-09-07.  
Périmètre : écran public **Demande d’analyse** (`/lab/request-form`) + données associées.  
Le PDF s’arrête à l’interface « Échantillon 1 / Échant » (fin page 18). Les étapes 3–5 **détaillées champ par champ** ne sont pas dans le fichier. Les champs 3–5 ci-dessous viennent des **objectifs §1 (points 3–9)** et des **titres d’architecture §2**, pas d’un inventaire inventé.

Légende : **OK** = dans le produit. **PARTIAL** = présent mais incomplet. **MISSING** = absent avant cette livraison.

## Contraintes générales

| # | Directive | Avant | Après |
|---|---|---|---|
| G1 | Ne pas recréer le projet ; réutiliser stack `/lab` | OK | OK |
| G2 | Ne casser aucune route SIB / Lab existante | OK | OK |
| G3 | Desktop / tablette / mobile | PARTIAL (formulaire unique) | OK (wizard + barre compacte) |
| G4 | Design navy / or / cyan, épuré | OK | OK |
| G5 | Étapes progressives, champs conditionnels | MISSING | OK |
| G6 | L’IA n’invente jamais analyse / norme / accréditation comme certaine | PARTIAL (rules-v1, pas GPT) | OK (suggestions marquées ; source `rules-v1`) |

## §1 Objectif du module

| # | Directive | Avant | Après |
|---|---|---|---|
| 1.1 | Collecter les données client | PARTIAL (société, contact, email, tél) | OK (fiche demandeur complète) |
| 1.2 | Identifier précisément l’échantillon | PARTIAL (champ Produit) | OK (hiérarchie + multi-échantillons) |
| 1.3 | Comprendre l’objectif analytique | MISSING | OK (étape 3) |
| 1.4 | Identifier les analyses souhaitées | PARTIAL (texte libre) | OK (liste + « je ne sais pas ») |
| 1.5 | Conformité réglementaire demandée ? | MISSING | OK |
| 1.6 | Accréditation nécessaire ? | PARTIAL (checkbox) | OK (oui / non / ne sait pas) |
| 1.7 | Gérer le prélèvement | MISSING | OK (étape 4) |
| 1.8 | Gérer les délais | PARTIAL (colonnes SQL `urgency`/`deadline` non exposées) | OK |
| 1.9 | Gérer les documents | MISSING | OK (types + pièces, upload best-effort) |
| 1.10 | Identifier automatiquement les infos manquantes | PARTIAL (extract e-mail) | OK (gap list recap + ICE avant facture) |
| 1.11 | IA préremplit depuis e-mail / message | PARTIAL (rules-v1, pas GPT) | PARTIAL (inchangé : **pas GPT**) |
| 1.12 | Créer automatiquement un dossier | OK (`submit_public_request`) | OK (`submit_qualified_request`) |
| 1.13 | Numéro unique | OK (`DOS-YYYY-######`) | OK |
| 1.14 | Workflow de suivi interne | OK (statuts 12 étapes) | OK (statut `NEW_REQUEST` + notif interne) |
| 1.15 | Labo complète / corrige avant devis | PARTIAL (wizard dossier phase 1 lecture) | OK (récap qualification + édition manquants) |
| 1.16 | Préparer les données pour un futur moteur de devis | MISSING | PARTIAL (JSONB `qualification`, **pas** de moteur de devis auto) |

## §2 Architecture du formulaire

| # | Directive | Avant | Après |
|---|---|---|---|
| 2.1 | Wizard 5 étapes : Client / Échantillon / Besoin / Logistique / Documents | MISSING | OK |
| 2.2 | Soumission → dossier → statut initial → notification interne | PARTIAL (dossier + audit, pas notif) | OK |
| 2.3 | Barre : Client, Échantillon, Analyses, Logistique, Vérification | MISSING | OK |
| 2.4 | Mobile : barre compacte, « Étape N sur 5 » | MISSING | OK |
| 2.5 | Revenir en arrière sans perdre les données | MISSING | OK |
| 2.6 | Brouillon si authentifié | MISSING | OK (`request_drafts` + localStorage) |
| 2.7 | Message clair si champ obligatoire | PARTIAL (zod) | OK (par étape, libellés FR) |

## §3 Étape 1 — Client

| # | Directive | Avant | Après |
|---|---|---|---|
| 3.1 | Section « Informations du demandeur » | MISSING | OK |
| 3.2 | `type_client` (7 valeurs) | MISSING | OK |
| 3.3 | « Je suis déjà client » + recherche | MISSING | OK (RPC `match_existing_client`) |
| 3.4 | Préremplir société, ICE, IF, adresse, ville, pays, contact, tél, email | MISSING | OK |
| 3.5 | Ne pas écraser sans avertissement | MISSING | OK |
| 3.6 | Société obligatoire sauf particulier | PARTIAL (toujours obligatoire) | OK |
| 3.7 | Raison sociale, ICE, IF, RC, adresse, ville, CP, pays (défaut Maroc) | MISSING | OK |
| 3.8 | Civilité, prénom, nom, fonction | PARTIAL (contact unique) | OK |
| 3.9 | Email, tél, indicatif international, tél secondaire | PARTIAL | OK |
| 3.10 | Canal / langue de préférence | MISSING | OK |
| 3.11 | Autre personne pour le devis | MISSING | OK |
| 3.12 | Facturation différente | MISSING | OK |
| 3.13 | Validations e-mail / tél ; ICE non bloquant ; flag « à compléter avant facturation » | PARTIAL | OK |

## §4 Étape 2 — Échantillon

| # | Directive | Avant | Après |
|---|---|---|---|
| 4.1 | Titre « Échantillon à analyser » | MISSING | OK |
| 4.2 | `type_echantillon` (13 familles) | MISSING | OK |
| 4.3 | Sous-catégorie dynamique (ex. alimentaire) | MISSING | OK |
| 4.4 | `produit_exact` searchable | MISSING | OK |
| 4.5 | Listes depuis Supabase, pas uniquement en dur | MISSING | OK (tables + fallback seed) |
| 4.6 | Tables `sample_categories` / `_subcategories` / `_products` + admin | MISSING | OK |
| 4.7 | Nom commercial, marque, réf, lot | MISSING | OK |
| 4.8 | Dates fabrication / DDM / DLC conditionnelles | MISSING | OK (matrices alimentaires / cosmétique / animal) |
| 4.9 | Origine Maroc / Import / Inconnue + pays si import | MISSING | OK |
| 4.10 | Température, état physique, conditionnement, qté / unité | MISSING | OK |
| 4.11 | Nombre d’échantillons > 0 obligatoire | OK | OK |
| 4.12 | « Échantillons identiques ? » sinon liste individuelle | MISSING | OK |

## Étapes 3–5 (titres PDF + objectifs §1 ; détail champ absents du PDF)

| # | Directive | Avant | Après |
|---|---|---|---|
| 5.1 | Étape 3 besoin : objectif, analyses, conformité, accréditation | MISSING | OK |
| 5.2 | Étape 4 logistique : prélèvement, envoi, urgence, délai | MISSING | OK |
| 5.3 | Étape 5 documents + récap + manquants + envoi | MISSING | OK |

## Humain (non codeable ici)

1. Appliquer la migration `20260907000008_lab_qualification.sql` sur Laboratoire (`omlhfjfpyttfvntfqjnk`).
2. GPT / IMAP / gabarits PDF officiels : **toujours absents** (heuristiques rules-v1).
3. Pages 19+ du Document 27 si elles existent ailleurs — le PDF fourni s’arrête p.18.
4. Moteur de devis automatique : données préparées, pas de pricing auto.
5. Bucket Storage `lab-client-documents` pour pièces jointes réelles.
