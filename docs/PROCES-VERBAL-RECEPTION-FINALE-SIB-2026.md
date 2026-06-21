# PROCÈS-VERBAL DE RÉCEPTION FINALE

## Plateforme numérique SIB 2026 — UrbaEvent

---

| | |
|---|---|
| **Projet** | Salon International du Bâtiment (SIB) 2026 — Plateforme web & application mobile UrbaEvent |
| **Client** | Urbacom Communication & Événementiel SARL — 63, Imm B, Rés LE YACHT, Bd de la Corniche, 7ème étage N°185, Casablanca 20510 |
| **Prestataire** | Elite Tech Holding SARL — 5 Rue Daraa, Rés. Fatima Zahra, Rabat — ICE : 003238091000068 |
| **BC développement** | N° **20260041** — 30/04/2026 — **96 000 MAD TTC** *(Plateforme Phase 1 & 2)* |
| **BC infrastructure** | N° **20260048** — 05/05/2026 — **12 882,48 MAD TTC déboursés** sur 14 257,39 MAD TTC *(3 mois cloud ; stores non déboursés)* |
| **Contrat / Devis cadre** | n° **URBACOM-2026-001** (signé le 05/05/2026 par M. Reda ELHADDAJ) |
| **Version document** | 1.0 — Réception finale |
| **Date de notification** | 15 juin 2026 |
| **Date limite de validation** | 22 juin 2026 *(7 jours calendaires)* |
| **Référence technique** | `Sib-1` — Monorepo React / React Native / Supabase |
| **URL production** | https://sbyizudifmqakzxjlndr.supabase.co |
| **Application mobile** | `com.urbacom.urbaevent` — APK **SIB-2026-1.0.13-release.apk** |

---

## 1. Objet du document

Le présent procès-verbal constitue le document officiel de **réception finale** de la plateforme numérique développée pour le Salon International du Bâtiment 2026. Il recense l’ensemble des fonctionnalités livrées sur :

1. **La plateforme web** (site public, espaces connectés, administration)
2. **L’application mobile Android** UrbaEvent (Expo React Native)
3. **L’infrastructure backend** Supabase (base de données, authentification, sécurité RLS, Edge Functions)

Ce document sert de référence contractuelle pour la validation de la livraison par le client.

---

## 2. Périmètre livré

### 2.1 Architecture globale

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Site web | React + TypeScript + Vite | Portail public, tableaux de bord, administration |
| Application mobile | Expo React Native 52 | Compagnon salon multi-rôles (Android APK) |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) | Données, sécurité, API, notifications |
| Authentification | Supabase Auth (magic link, email/mot de passe) | Connexion unifiée web & mobile |
| Badges | QR JWT rotatif + badge A4 bifold | Contrôle d’accès et identification |
| Internationalisation | FR (défaut), EN, AR (RTL sur mobile) | Public international |

### 2.2 Salons et multi-événements

La plateforme supporte le **catalogue multi-salons UrbaEvent** :

- SIB 2026 (Salon International du Bâtiment)
- SIR, SIP, BTP, SIE et salons associés
- Sélection de salon, hub par slug, inscription par événement
- Plan du hall (image/PDF), carte interactive, halls et stands

---

## 3. Plateforme web — Fonctionnalités livrées

### 3.1 Espace public (sans connexion)

| Module | Fonctionnalités |
|--------|-----------------|
| **Accueil & vitrine** | Pages d’accueil UrbaEvent, variantes thématiques, hero, carrousels salons, exposants vedettes, partenaires |
| **Annuaires** | Exposants, partenaires, pavillons, catalogue produits |
| **Programme** | Événements, conférences, speakers, calendrier |
| **Médias** | Webinaires, podcasts, capsules Inside SIB, live studio, best moments, médiathèque |
| **Informations pratiques** | Plan du hall, venue, hébergement, contact, support, RGPD |
| **Presse** | Accréditation presse |
| **Inscription** | Visiteur gratuit, visiteur VIP, exposant, partenaire |

### 3.2 Authentification web

- Inscription visiteur (gratuit / VIP)
- Inscription exposant et partenaire
- Connexion email / mot de passe
- Lien magique (OTP email)
- Réinitialisation mot de passe
- OAuth (selon configuration Supabase)
- Comptes en attente de validation / paiement (`pending_payment`, `pending`)

### 3.3 Tableau de bord visiteur — Personnalisation par niveau

| Niveau | Tableau de bord | Fonctionnalités |
|--------|-----------------|-----------------|
| **Visiteur FREE** | Vue simplifiée | Badge QR, consultation programme et exposants ; networking limité |
| **Visiteur PREMIUM / VIP** | Dashboard complet | Networking B2B, messagerie, matching IA, quotas RDV étendus, analytics personnelles, avantages VIP |
| **En attente de paiement** | Accès partiel | Redirection flux paiement Pass VIP |

**Modules visiteur connecté :**
- Badge numérique et QR (`/badge`, `/badge/digital`)
- Networking et matchmaking IA (`/networking`, `/matching/advanced`)
- Rendez-vous B2B et calendrier (`/appointments`, `/calendar`)
- Messagerie (`/messages`, `/chat`)
- Upgrade et paiement (`/visitor/upgrade`, `/visitor/payment`, virement bancaire)
- Lettre d’invitation visa (`/visitor/visa-letter`)
- Paramètres profil et disponibilités
- Consultation mini-sites exposants (`/minisites`)

### 3.4 Tableau de bord exposant — Personnalisation

| Section | Contenu |
|---------|---------|
| **Vue d’ensemble** | KPI stand : RDV, messages, connexions, vues mini-site, scans leads |
| **Quotas** | RDV B2B, équipe, démos, scans, médias selon formule |
| **Stand & profil** | Informations stand, publication profil, visibilité |
| **Mini-site** | Création, éditeur sections/produits, aperçu public, compteur vues |
| **Rendez-vous** | Demandes entrantes, acceptation / refus, calendrier |
| **Networking** | Matching IA, messagerie, connexions |
| **Badge & QR** | Badge exposant, QR stand, scanner visiteurs |
| **Analytics** | Engagement visiteurs, statuts RDV, évolution vues |
| **Produits & programme** | Catalogue produits, activité récente |

**Routes principales :** `/exhibitor/dashboard`, `/exhibitor/profile`, `/minisite/editor`, `/exhibitor/mini-site/create`

### 3.5 Tableau de bord partenaire — Personnalisation par tier

| Tier | Accès & quotas |
|------|----------------|
| **Museum / Bronze** | Profil partenaire, visibilité de base |
| **Silver** | Networking étendu, lounge VIP |
| **Gold / Platinum** | Accès zones premium, backstage, quotas maximaux |

**Onglets dashboard partenaire :**
1. Vue d’ensemble (KPI : vues profil, connexions, RDV, messages)
2. Profil & publication
3. Networking
4. Analytics
5. Services SIB

**Pages dédiées :** activité, leads, médias, événements, satisfaction, support, upload médias, analytics médias.

### 3.6 Administration — Tableau de bord organisation

| Domaine | Fonctionnalités admin |
|---------|----------------------|
| **Pilotage temps réel** | Métriques live, graphiques croissance, trafic, distribution types utilisateurs |
| **Participants** | Gestion exposants, partenaires, visiteurs VIP, utilisateurs, presse, invitations |
| **Contenu & CMS** | Images site, textes, bannières, actualités, événements, pavillons, speakers, modération |
| **Médias** | Bibliothèque, live events, approbation médias partenaires |
| **Paiements** | Validation paiements VIP, tarifs, codes promo |
| **Badges** | Configuration badge A4 bifold (`/admin/badge-config`) |
| **Salons** | Gestion multi-salons (`/admin/salons`) |
| **Opérationnel SIB** | Location matériel, chapiteaux, espaces publicitaires |
| **Sécurité** | Zones de contrôle, journal d’activité |
| **Configuration** | APIs (Supabase, SMTP, PayPal, OpenAI), modèles emails |
| **Analytics** | Métriques plateforme (`/metrics`), tracking pages |

### 3.7 Sécurité (rôle web)

- Scanner QR zones (`/security/scanner`) : validation badge, contrôle accès par zone
- Station d’impression badges (`/badge/print-station`)
- Zones de contrôle (`/admin/security-zones`)
- Application scanner dédiée (`ScannerApp`)

### 3.8 Marketing (rôle web)

- Dashboard marketing : médiathèque, articles, upload contenu, statistiques médias
- Accessible via compte admin / marketing

### 3.9 Service clientèle (rôle web)

- Station impression badges (recherche participant, aperçu badge A4, impression)
- Fonctionnalités complètes service client sur **application mobile** (voir section 4.7)

---

## 4. Application mobile UrbaEvent — Fonctionnalités livrées

### 4.1 Informations de livraison

| Élément | Valeur |
|---------|--------|
| **Nom affiché** | SIB 2026 |
| **Package Android** | `com.urbacom.urbaevent` |
| **Version** | 1.0.13 (versionCode 13) |
| **Fichier APK** | `apps/mobile/dist/SIB-2026-1.0.13-release.apk` |
| **Taille** | ~118 Mo |
| **Deep link** | `urbaevent://` (auth-callback, reset-password) |

### 4.2 Fonctionnalités transverses mobile

| Module | Description |
|--------|-------------|
| **Onboarding** | Présentation 3 slides au premier lancement |
| **Authentification** | Lien magique (visiteurs), mot de passe (pro), inscription gratuit/VIP |
| **i18n** | Français, anglais, arabe (RTL) |
| **Badge QR JWT** | QR rotatif 60 s, zones d’accès, export PDF A4 bifold, impression, partage, email |
| **Scanner** | Accès zones (staff/sécurité), scan leads (exposant) |
| **Messagerie** | Conversations directes, notifications temps réel |
| **Push notifications** | RDV, messages, connexions, paiements, leads |
| **Minisite** | Consultation publique, édition lite exposant |
| **Paiements VIP** | Virement bancaire (actif) ; PayPal/CMI (intégration prête, activation admin) |
| **Salons** | 5 salons, sélection, hub, inscription, plan hall |
| **Médias & actualités** | Bibliothèque médias, live studio, fil actualités |
| **Certificat & visa** | Certificat de participation, demande lettre visa |
| **Équipe stand** | Gestion collaborateurs, badges équipe (exposant/partenaire) |

### 4.3 Tableau de bord visiteur mobile

| Écran / module | Fonctionnalités |
|----------------|-----------------|
| **Accueil** | Hero UrbaEvent, actions rapides, réseaux sociaux, sélection salon |
| **Badge** | QR rotatif, PDF, email, mode kiosque |
| **Explorer** | Programme + annuaire exposants (recherche, filtres hall/secteur) |
| **Profil** | Statut pass, menu activité, déconnexion |
| **Rendez-vous** | Liste RDV, réservation créneaux exposants, bouton confirmation fixe |
| **Messages** | Messagerie (Pass Premium/VIP) |
| **Networking** | Recherche participants, suggestions IA, connexions, speed networking |
| **Carte / plan** | Plan hall SIB, halls, stands |
| **Actualités** | Articles publiés salon |
| **Événements** | Détail + inscription conférences |
| **Certificat** | Génération après présence enregistrée |
| **Lettre visa** | Demande invitation |
| **Factures** | Historique factures |
| **Paramètres** | Langue, activation notifications push |

**Personnalisation par forfait visiteur :**

| Forfait | Networking | Messages | RDV/jour | Zones VIP |
|---------|------------|----------|----------|-----------|
| **Gratuit** | Consultation limitée | Non | 5 max | Non |
| **Premium / VIP** | Complet + IA | Oui | Étendu | Oui |

### 4.4 Tableau de bord exposant mobile

| Onglet / écran | Fonctionnalités |
|----------------|-----------------|
| **Stand (accueil)** | KPI : RDV, messages, réseau, scans ; statut mini-site ; raccourcis |
| **Contacts** | Leads scannés au stand |
| **Scan** | Scanner QR visiteurs → enregistrement leads |
| **Badge** | Badge exposant format A4 |
| **Messages** | Messagerie B2B |
| **Profil** | Édition stand (description, contacts) |
| **RDV** | Gestion demandes (accepter / refuser) |
| **Mini-site** | Édition et publication |
| **Analytics** | RDV, messages, réseau, **vues profil réelles**, scans |
| **Équipe** | Collaborateurs stand, impression badges |

### 4.5 Tableau de bord partenaire mobile

| Onglet | Fonctionnalités |
|--------|-----------------|
| **Accueil** | KPI leads, messages, réseau ; outils rapides |
| **Leads** | Connexions réseau comme leads |
| **Messages** | Messagerie |
| **Médias** | Liste + upload médias partenaire |
| **Badge** | Badge partenaire (tier Museum/Silver/Gold/Platinum) |
| **Profil** | Informations compte, équipe |
| **Analytics** | Métriques partenaire |
| **Équipe** | Gestion collaborateurs |

**Personnalisation par tier partenaire :** quotas RDV, accès lounge VIP, zones backstage selon niveau.

### 4.6 Tableau de bord administration mobile (staff)

| Onglet / écran | Fonctionnalités |
|----------------|-----------------|
| **Live** | Stats temps réel : utilisateurs, paiements en attente, validations |
| **Scanner** | Contrôle accès multi-zones, historique, file offline |
| **Paiements** | Validation demandes Pass VIP |
| **Utilisateurs** | Recherche, suspension comptes |
| **Alertes** | Inscriptions en attente |
| **Tarifs** | Modification prix Pass VIP |
| **Impression** | Station badges sur place |
| **Capacité zones** | Suivi affluence temps réel |

### 4.7 Tableau de bord sécurité mobile

- Scanner accès (zones public, hall, VIP, networking, backstage)
- Historique scans session + synchronisation offline
- Station impression badges
- Capacité zones
- **Onglets masqués :** Live et Paiements (accès restreint)

### 4.8 Tableau de bord service clientèle mobile

| Onglet / écran | Fonctionnalités |
|----------------|-----------------|
| **Accueil** | Stats jour : inscriptions, badges émis, remplacements |
| **Recherche** | Lookup participant (email, nom, code badge) + scan QR + impression |
| **Inscription** | Inscription visiteur sur place (pass gratuit) |
| **Remplacement badge** | Badge perdu / endommagé |
| **Impression** | Station badges A4 |
| **Capacité zones** | Monitoring affluence |

---

## 5. Matrice des tableaux de bord par rôle

| Fonctionnalité | Visiteur | Exposant | Partenaire | Admin | Sécurité | Service client |
|----------------|:--------:|:--------:|:----------:|:-----:|:--------:|:--------------:|
| Dashboard personnalisé | ✅ (3 niveaux) | ✅ | ✅ (5 onglets) | ✅ | Outils scan | ✅ Desk |
| Badge QR | ✅ | ✅ | ✅ | Consultation | — | Recherche/impression |
| Scanner accès | — | — | — | ✅ | ✅ | — |
| Scanner leads | — | ✅ | — | — | — | — |
| Rendez-vous B2B | ✅ | ✅ Gestion | ✅ Leads | — | — | — |
| Messagerie | VIP | ✅ | ✅ | — | — | — |
| Networking / IA | VIP | ✅ | ✅ | — | — | — |
| Mini-site | Lecture | Édition | — | — | — | — |
| Analytics | Partiel | ✅ Complet | ✅ | ✅ Live | — | Stats desk |
| Paiements VIP | Paiement | — | Upgrade | Validation | — | — |
| CMS / contenu | Lecture | — | Médias | ✅ Complet | — | — |
| Inscription sur place | — | — | — | — | — | ✅ |
| Push notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| i18n FR / EN / AR | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 6. Infrastructure backend Supabase

### 6.1 Tables principales

`users`, `user_badges`, `exhibitors`, `partners`, `mini_sites`, `appointments`, `time_slots`, `connections`, `messages`, `conversations`, `payment_requests`, `access_logs`, `gates`, `registration_requests`, `news_articles`, `events`, `salons`, `media_contents`, `live_sessions`, `speed_networking_sessions`, `minisite_views`, `profile_views`, `exhibitor_leads`, `badge_replacements`, `visa_invitation_requests`, `notifications_devices`, `stand_collaborators`

### 6.2 Sécurité (RLS)

- Politiques Row Level Security par rôle et par table
- Fonctions SECURITY DEFINER anti-récursion (`auth_user_type`, `is_staff_or_service`, `get_my_profile`)
- RPC networking : `search_networking_users`, `list_networking_candidates`
- RPC rendez-vous : `book_appointment_atomic`
- RPC badge : `validate_scanned_badge`, `scan_badge`

### 6.3 Edge Functions

- `generate-visitor-badge` — Génération badge visiteur
- `create-paypal-order` / `capture-paypal-order` — Paiement PayPal
- `create-cmi-payment` / `payment-cmi-verify` — Paiement CMI Maroc

### 6.4 Migrations livrées (extrait)

- Correctifs RLS mobile (`20260611000002`, `20260615000001`)
- Audit mobile : news, networking RPC, sync publications
- Configuration badges, plan hall, multi-salons

---

## 7. Comptes de démonstration

### 7.1 Comptes production (tests client)

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| visiteur@sib.com | Visit123! | Visiteur |
| exposant@sib.com | Expo123! | Exposant |
| partenaire@sib.com | Partner123! | Partenaire |
| admin.sib@sib.com | Admin123! | Administrateur |
| securite@sib.com | Secu123! | Sécurité |
| service-clientele@sib.com | Service2026! | Service clientèle |

### 7.2 Connexion mobile

- **Visiteurs :** onglet « Lien magique » ou « Mot de passe (pro) »
- **Staff / exposants / partenaires :** onglet « Mot de passe (pro) »
- **Connexion rapide démo :** visible dans l’APK release (raccourcis par rôle)

---

## 8. Livrables techniques

| Livrable | Emplacement / référence |
|----------|-------------------------|
| Code source web | `Sib-1/src/` |
| Code source mobile | `Sib-1/apps/mobile/` |
| Migrations Supabase | `Sib-1/supabase/migrations/` |
| APK Android 1.0.13 | `Sib-1/apps/mobile/dist/SIB-2026-1.0.13-release.apk` |
| Documentation technique | `Sib-1/docs/`, `Sib-1/apps/mobile/docs/` |
| Scripts déploiement | `Sib-1/scripts/`, `build-apk.ps1` |
| Configuration badge admin | `/admin/badge-config` (web) |

---

## 9. Points d’attention et réserves techniques

Les éléments suivants sont documentés à titre informatif pour une réception en connaissance de cause :

| Point | Statut | Détail |
|-------|--------|--------|
| Paiement PayPal / CMI mobile | Intégration prête, désactivée | `PAYMENT_ENABLED = false` — flux virement + validation admin opérationnel |
| Connexion Google mobile | Retirée | Décision client — auth par magic link et mot de passe uniquement |
| Pages web non routées | Partiel | Certaines pages SIB 2026 existent en code mais ne sont pas toutes exposées dans `App.tsx` |
| Rôle marketing web | Partiel | Dashboard accessible via compte admin |
| Rôle service client web | Limité | Fonctionnalités complètes sur application mobile |
| Publication Store | Non réalisée | Apple Developer (914,76 DH) et Google Play (231 DH) **non déboursés** — livraison APK directe ; publication stores à la charge du client |
| Infra cloud BC 20260048 | Partiel | Supabase, Vercel et Railway : **3 mois déboursés** (10 735,40 DH HT) — renouvellement au-delà non inclus |

---

## 10. Tests de validation effectués

| Test | Résultat |
|------|----------|
| Connexion 6 comptes démo | ✅ |
| Profils utilisateurs (RLS) | ✅ |
| Actualités publiées | ✅ (8 articles) |
| Créneaux rendez-vous | ✅ (79 créneaux, 75 futurs) |
| Networking RPC | ✅ |
| Salons + plan hall | ✅ (5 salons) |
| Staff : lecture users/badges/paiements | ✅ |
| Compilation TypeScript mobile | ✅ |
| Build APK 1.0.13 | ✅ |

---

## 11. Réception

### 11.0 Notification officielle de livraison

Madame, Monsieur,

Nous vous informons que **l'application commandée via le Bon de Commande n° 20260041** (URBACOM Communication & Événementiel, en date du 30/04/2026), complété par le **BC n° 20260048** (infrastructure, 05/05/2026), dans le cadre du **Contrat n° URBACOM-2026-001**, est **entièrement développée** et **conforme au cahier des charges** convenu. L'ensemble des prestations couvre la plateforme web SIB 2026, l'application mobile UrbaEvent (APK 1.0.13) et l'infrastructure backend Supabase associée, tel que détaillé aux sections 3 à 10 du présent document.

**Les fichiers, codes sources et accès** sont prêts à vous être transférés à l'adresse / par le canal suivant :

| Élément | Mode de transfert | Coordonnées / emplacement |
|---------|-------------------|---------------------------|
| **Code source complet** | Dépôt Git / archive ZIP | *[À compléter : URL dépôt ou lien de téléchargement]* |
| **APK Android 1.0.13** | Fichier livrable | `apps/mobile/dist/SIB-2026-1.0.13-release.apk` |
| **Documentation projet** | Dépôt / partage | Dossier `Sib-1/docs/` |
| **Accès Supabase (production)** | Invitation projet | urbacom@urbacom.net |
| **Comptes de démonstration** | Document sécurisé | Section 7 du présent procès-verbal |
| **Contact livraison client** | E-mail / téléphone | urbacom@urbacom.net · +212 5 22 20 75 83 |

Nous restons à votre disposition pour toute assistance technique lors de la prise en main.

### 11.1 Délai de validation et recette tacite

Conformément aux usages contractuels de réception des prestations informatiques, vous disposez d'un **délai de sept (7) jours calendaires** à compter de la date de notification de livraison (**15 juin 2026**) pour :

1. **Valider** la livraison sans réserve, en retournant le présent procès-verbal signé ; ou
2. **Émettre des réserves techniques** exclusivement par écrit (courriel ou courrier recommandé), en précisant de manière détaillée et motivée les écarts constatés par rapport au cahier des charges.

**Date limite de réponse : 22 juin 2026 à 23 h 59 (heure du Maroc).**

**Recette tacite :** À défaut de retour écrit de votre part dans ce délai de sept (7) jours — que ce soit une validation expresse, des réserves techniques ou un refus motivé — **la livraison sera réputée acceptée sans réserve** (*recette tacite*), et le transfert définitif des livrables sera considéré comme acquis.

Les réserves éventuelles devront porter sur des **anomalies techniques avérées** et non sur des demandes d'évolution ou de fonctionnalités hors périmètre des **Bons de Commande n° 20260041 et 20260048**, du contrat n° URBACOM-2026-001 et du cahier des charges.

### 11.2 Déclaration du prestataire

Le prestataire **Elite Tech Holding SARL** déclare avoir livré la plateforme web SIB 2026, l'application mobile UrbaEvent (APK 1.0.13) et l'infrastructure Supabase associée, conformément au périmètre fonctionnel décrit aux sections 3 à 6 du présent document, aux **Bons de Commande n° 20260041 et 20260048** et au **Contrat n° URBACOM-2026-001**.

**Détail du Bon de Commande n° 20260041** (30/04/2026 — Urbacom → Elite Tech Holding Sarl) :

| Prestation | Montant |
|------------|---------|
| Développement Plateforme (Phase 1 & 2) — Volet 1 : Site Vitrine & Communication | |
| Volet 2 : Portail Professionnel Exposants | |
| Volet 3 : Portail Visiteurs & Système QR | |
| Volet 4 : Intégration mobile | |
| Volet 5 : Déploiement et onboarding | |
| **Total HT** | **80 000,00 DH** |
| TVA (20 %) | 16 000,00 DH |
| **Total TTC** | **96 000,00 MAD** |

**Échéancier BC n° 20260041 :**

| Échéance | % | Montant TTC |
|----------|---|-------------|
| Acompte à la signature du contrat | 30 % | 28 800,00 MAD |
| Lancement Beta — Livraison MVP Phase 1 | 40 % | 38 400,00 MAD |
| Livraison finale — Réception complète | 30 % | 28 800,00 MAD |

**Détail du Bon de Commande n° 20260048** (05/05/2026 — infrastructure) :

| Prestation | Période / statut | Montant HT (DH) | Déboursé |
|------------|------------------|-----------------|----------|
| Supabase Cloud — Plan Pro + Compute Large (Scaling) + Egress | 3 mois | 6 300,20 | Oui |
| Vercel Pro — Hébergement Frontend & Edge Network | 3 mois | 2 217,60 | Oui |
| Railway Pro — Services Backend & Logiciels de Validation | 3 mois | 2 217,60 | Oui |
| Apple Developer — Frais de maintenance Store iOS | — | 914,76 | **Non** |
| Google Play Store — Frais uniques de publication Store Android | — | 231,00 | **Non** |
| **Sous-total déboursé HT** | | **10 735,40** | |
| **Sous-total non déboursé HT** | | **1 145,76** | |
| **Total HT (BC)** | | **11 881,16** | |
| TVA (20 %) sur montant déboursé | | 2 147,08 | |
| **Total TTC déboursé** | | **12 882,48 MAD** | |
| TVA (20 %) sur montant non déboursé | | 229,15 | |
| **Reste non déboursé TTC** | | **1 374,91 MAD** | |
| **Total TTC (BC)** | | **14 257,39 MAD** | |

*Note : les frais Apple Developer et Google Play Store figurant au BC n° 20260048 n'ont pas été engagés par le prestataire à la date de livraison. La publication sur les stores reste à la charge du client.*

### 11.3 Réception par le client

| | |
|---|---|
| **Réception** | ☐ Acceptée sans réserve &nbsp;&nbsp; ☐ Acceptée avec réserves &nbsp;&nbsp; ☐ Refusée |
| **Date de réponse client** | |
| **Réserves techniques éventuelles** *(obligatoirement détaillées si réserves)* | |
| | |
| | |

### 11.4 Signatures

| | Prestataire — Elite Tech Holding SARL | Client — Urbacom |
|---|-------------|--------|
| **Nom** | | Reda ELHADDAJ *(signataire contrat)* |
| **Fonction** | | |
| **Date** | | |
| **Signature** | | |

---

## Annexe A — Correspondance des rôles web / mobile

| Rôle métier | Type base `users.type` | Web | Mobile |
|-------------|------------------------|-----|--------|
| Visiteur | `visitor` | `/visitor/dashboard` | `(visitor)` |
| Exposant | `exhibitor` | `/exhibitor/dashboard` | `(exhibitor)` |
| Partenaire | `partner` | `/partner/dashboard` | `(partner)` |
| Administrateur | `admin` | `/admin/dashboard` | `(staff)` |
| Sécurité | `security` | `/security/scanner` | `(staff)` — scanner |
| Service clientèle | `service_client` | Print station | `(service-client)` |
| Marketing | `marketing` | `/marketing/dashboard` | `(staff)` |

## Annexe B — Historique des versions APK

| Version | Date | Principales évolutions |
|---------|------|------------------------|
| 1.0.12 | 15/06/2026 | Correctifs RLS, plan hall, mini-site |
| **1.0.13** | **15/06/2026** | **Démarrage rapide, RDV fixe, vues profil, suppression Google, audit complet** |

---

*Document généré pour la réception finale du projet SIB 2026 — UrbaEvent.*  
*Référence : `docs/PROCES-VERBAL-RECEPTION-FINALE-SIB-2026.md`*
