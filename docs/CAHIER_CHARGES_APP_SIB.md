# Cahier des Charges — Application Mobile SIB 2026
## Salon International du Bâtiment — 20ème Édition

**Date** : Avril 2026  
**Version** : 1.0  
**Statut** : À développer from scratch

---

## 1. Contexte et Objectifs

### 1.1 Présentation du projet
Le Salon International du Bâtiment (SIB) tient sa 20ème édition du **25 au 29 novembre 2026** au Parc d'Exposition Mohammed VI d'El Jadida. L'application mobile SIB 2026 est le compagnon numérique officiel de l'événement, destiné aux visiteurs, exposants et agents d'accueil.

### 1.2 Objectifs
- Faciliter l'inscription et l'accès au salon (E-badge QR code)
- Permettre aux visiteurs de gérer leur programme (conférences, rendez-vous)
- Faciliter le networking entre participants
- Optimiser le contrôle d'accès aux entrées via scan QR
- Centraliser toutes les informations du salon (plan, horaires, exposants)
- Envoyer des notifications push aux participants

### 1.3 Périmètre
L'application couvre **3 profils utilisateurs** :
1. **Visiteur** — inscrit, badge numérique, programme conférences, networking
2. **Exposant** — badge, liste de ses collaborateurs, contacts scannés
3. **Agent d'accueil** — scan des badges à l'entrée (mode sécurisé)

---

## 2. Stack Technologique Recommandée

Étant donné que la plateforme web SIB est déjà sur **Supabase + React**, la recommandation est :

| Composant | Technologie | Justification |
|---|---|---|
| Application mobile | **Flutter** (Dart) | iOS + Android depuis un seul code |
| Backend API | **Supabase** (existant) | Réutiliser l'infrastructure en place |
| Auth | **Supabase Auth** | Google, Apple, email/OTP déjà configurés |
| Notifications push | **Firebase Cloud Messaging** | Standard industrie |
| Stockage médias | **Supabase Storage** | Badges, images, plans |
| Back-office | **Intégré dans l'admin SIB existant** | React/TypeScript déjà en place |

> **Avantage majeur** : Pas de nouveau backend à gérer — tout passe par Supabase déjà en production.

---

## 3. Fonctionnalités Détaillées

### 3.1 Authentification

#### F-AUTH-01 : Inscription email/mot de passe
- Formulaire : Prénom, Nom, Téléphone, Email, Mot de passe, Confirmation
- Validation : format email, téléphone Maroc/international, force du mot de passe
- Vérification OTP par email avant activation du compte
- Photo de profil optionnelle (galerie ou caméra)
- Sélection du secteur d'activité (liste prédéfinie)

#### F-AUTH-02 : Connexion sociale
- Google Sign-In (Android + iOS)
- Apple Sign-In (iOS obligatoire App Store)
- LinkedIn (optionnel)

#### F-AUTH-03 : Mot de passe oublié
- Envoi d'un lien de réinitialisation par email

#### F-AUTH-04 : Vérification OTP
- Code à 6 chiffres envoyé par email
- Renvoi du code après délai
- Expiration du code après 15 minutes

#### F-AUTH-05 : Rôles et navigation
Après connexion, l'application détermine le rôle :
- `visitor` → écran visiteur
- `exhibitor` → écran exposant
- `agent` → écran agent de scan
- `collaborator` → écran collaborateur d'exposant

---

### 3.2 Écran d'accueil (Visiteur/Exposant)

#### F-HOME-01 : Événements en cours et à venir
- Bannière principale avec image, nom, date, lieu
- Liste des événements disponibles à l'inscription
- Indicateur "inscrit / non inscrit"

#### F-HOME-02 : Mes E-Badges
- Affichage des badges actifs de l'utilisateur
- Accès rapide au QR code de chaque badge
- Téléchargement PDF du badge

#### F-HOME-03 : Contacts récents
- Liste des personnes dont le badge a été scanné récemment
- Accès rapide au profil de chaque contact

#### F-HOME-04 : Scanner QR intégré
- Bouton scan accessible depuis l'accueil
- Deux usages possibles :
  1. Scanner le badge d'un exposant → ajouter en contact
  2. Mode agent → valider l'accès à une entrée

#### F-HOME-05 : Notifications
- Cloche avec compteur non-lus
- Liste des notifications avec horodatage

---

### 3.3 Détails d'un Événement

#### F-EVT-01 : Page de présentation
- Bannière, nom, organisateur
- Description complète (rich text)
- Dates, horaires, adresse
- Carte Google Maps avec localisation
- Lien d'inscription

#### F-EVT-02 : Inscription à l'événement
- Bouton "S'inscrire" (si non inscrit)
- Choix du type : visiteur ou exposant
- Confirmation avec envoi du badge par email
- Génération automatique du QR code

#### F-EVT-03 : Conférences
- Liste des conférences de l'événement
- Filtres par date, salle
- Détail : titre, description, date, heure, lieu, places disponibles
- Inscription à une conférence (décompte des places)

#### F-EVT-04 : Mon Planning
- Agenda personnel des conférences auxquelles l'utilisateur est inscrit
- Trié par date et heure croissantes
- Rappel de conférence imminente

#### F-EVT-05 : Plan du salon
- Image du plan zoomable
- Marqueurs des entrées et espaces thématiques

#### F-EVT-06 : Annuaire exposants (Portail)
- Liste des exposants confirmés avec logo, nom, stand, secteur
- Recherche par nom ou secteur
- Fiche exposant : coordonnées, description, stand

---

### 3.4 E-Badge

#### F-BADGE-01 : Affichage du badge
- Photo de profil de l'utilisateur
- Nom complet, société, titre
- Logo de l'événement
- QR code unique et signé
- Type de badge (VISITEUR / EXPOSANT / VIP)

#### F-BADGE-02 : QR Code
- Généré côté serveur et signé (non falsifiable)
- Contient : ID registration + hash de vérification
- Format : PNG haute résolution

#### F-BADGE-03 : Téléchargement PDF
- Badge format A4 téléchargeable
- Enregistrement local sur appareil
- Partage via apps natives (WhatsApp, email, etc.)

#### F-BADGE-04 : Envoi par email
- Envoi automatique à l'inscription
- Re-envoi manuel depuis l'app

---

### 3.5 Networking / Contacts

#### F-NET-01 : Scanner un badge
- Scanner le QR d'un autre participant
- Son profil s'affiche (nom, titre, société, secteur, photo)
- Bouton "Ajouter aux contacts"
- Son sur vibration à la lecture réussie

#### F-NET-02 : Mes contacts
- Liste des contacts scannés
- Informations : nom, poste, société, événement de rencontre
- Accès aux coordonnées

#### F-NET-03 : Fiche contact
- Photo, nom, titre, société, secteur
- Liste des événements communs
- Date de première rencontre

---

### 3.6 Gestion Collaborateurs (Exposants)

#### F-COLLAB-01 : Ajouter un collaborateur
- Créer un sous-compte rattaché au compte exposant
- Formulaire : prénom, nom, email, téléphone
- Badge automatiquement généré pour le collaborateur

#### F-COLLAB-02 : Liste des collaborateurs
- Tableau avec nom, email, statut badge
- Suppression d'un collaborateur

---

### 3.7 Mode Agent (Contrôle d'accès)

#### F-AGENT-01 : Authentification agent
- Login séparé avec rôle "agent"
- Sélection du portail/entrée assigné

#### F-AGENT-02 : Scanner d'entrée
- Caméra en plein écran en mode continu
- Lecture instantanée du QR code du badge
- Résultat : 
  - ✅ VERT — Badge valide, nom du visiteur affiché, son de validation
  - ❌ ROUGE — Badge invalide ou déjà utilisé, son d'erreur
  - ⚠️ ORANGE — Badge valide mais mauvaise entrée

#### F-AGENT-03 : Historique des scans
- Liste chronologique des scans effectués par l'agent
- Date, heure, nom participant, résultat

---

### 3.8 Profil Utilisateur

#### F-PROFIL-01 : Voir et modifier le profil
- Photo, prénom, nom, email (non modifiable), téléphone
- Titre professionnel, société, secteur d'activité
- Langue de l'application (FR / AR / EN)

#### F-PROFIL-02 : Changer de mot de passe
- Ancien mot de passe + nouveau + confirmation

#### F-PROFIL-03 : Déconnexion

---

### 3.9 Notifications Push

#### F-NOTIF-01 : Types de notifications
- Confirmation d'inscription à un événement
- Rappel de conférence (1h avant)
- Nouveau message/annonce du salon
- Badge envoyé par email

#### F-NOTIF-02 : Centre de notifications
- Liste historique des notifications reçues
- Marquage lu/non-lu
- Badge numérique sur l'icône

---

### 3.10 Internationalisation

#### F-I18N-01 : Langues supportées
- **Français** (langue principale)
- **Arabe** (avec support RTL)
- **Anglais**
- Sélection au premier lancement et modifiable dans le profil

---

## 4. Back-Office Administrateur

Le back-office est intégré à l'admin SIB existant (`/admin`), avec de nouveaux modules :

### F-BO-01 : Gestion des événements
- Créer/modifier/supprimer un événement
- Champs : nom, organisateur, description, dates, lieu, GPS, banner, logo
- Activer/désactiver la visibilité

### F-BO-02 : Gestion des conférences
- Rattachées à un événement
- Champs : titre, description, date, heure début/fin, lieu, places max
- Clôture automatique des inscriptions si complet

### F-BO-03 : Gestion des portails (entrées)
- Créer des portes d'entrée rattachées à un événement
- Assigner des agents à chaque porte

### F-BO-04 : Gestion des inscriptions
- Tableau avec filtres : type, confirmé, événement
- Confirmer/annuler manuellement une inscription
- Envoyer le badge par email depuis le back-office
- Export Excel complet

### F-BO-05 : Envoi de notifications
- Composer un message push
- Cibler : tous les inscrits / un événement / un type (visiteur/exposant)

### F-BO-06 : Statistiques
- Nombre d'inscrits par type
- Nombre de scans par entrée et par heure
- Taux de présence (inscrit vs scanné)
- Export des données

---

## 5. Modèle de Données

### Table `events`
| Champ | Type | Description |
|---|---|---|
| id | UUID | Clé primaire |
| name | text | Nom de l'événement |
| organizer | text | Organisateur |
| description | text | Description rich text |
| start_date | timestamptz | Date/heure début |
| end_date | timestamptz | Date/heure fin |
| location_address | text | Adresse |
| location_lat | float | Latitude GPS |
| location_lng | float | Longitude GPS |
| banner_url | text | Image bannière |
| logo_url | text | Logo |
| enabled | boolean | Visible dans l'app |

### Table `conferences`
| Champ | Type | Description |
|---|---|---|
| id | UUID | Clé primaire |
| event_id | UUID | FK → events |
| name | text | Titre |
| description | text | Description |
| date | date | Date |
| start_time | time | Heure début |
| end_time | time | Heure fin |
| location | text | Salle/emplacement |
| available_seats | int | Places disponibles (null = illimité) |
| banner_url | text | Image |

### Table `registrations`
| Champ | Type | Description |
|---|---|---|
| id | UUID | Clé primaire |
| user_id | UUID | FK → auth.users |
| event_id | UUID | FK → events |
| conference_id | UUID | FK → conferences (null si event) |
| gate_id | UUID | FK → gates (entrée assignée) |
| type | enum | visitor / exhibitor / collaborator |
| booth | text | Numéro de stand (exposants) |
| confirmed | boolean | Badge confirmé |
| qr_hash | text | Hash unique du QR code |
| badge_sent | boolean | Email badge envoyé |

### Table `gates`
| Champ | Type | Description |
|---|---|---|
| id | UUID | Clé primaire |
| event_id | UUID | FK → events |
| name | text | Nom de l'entrée |

### Table `scans`
| Champ | Type | Description |
|---|---|---|
| id | UUID | Clé primaire |
| registration_id | UUID | Badge scanné |
| scanned_by | UUID | Agent qui a scanné |
| gate_id | UUID | Entrée |
| scanned_at | timestamptz | Horodatage |
| result | enum | success / invalid / wrong_gate |

### Table `scan_contacts`
| Champ | Type | Description |
|---|---|---|
| id | UUID | Clé primaire |
| scanner_user_id | UUID | Utilisateur qui scanne |
| scanned_user_id | UUID | Utilisateur scanné |
| event_id | UUID | Événement |
| scanned_at | timestamptz | Horodatage |

### Table `notifications`
| Champ | Type | Description |
|---|---|---|
| id | UUID | Clé primaire |
| user_id | UUID | null = broadcast |
| title | text | Titre |
| body | text | Contenu |
| type | text | info / reminder / badge |
| read | boolean | Lu |
| created_at | timestamptz | Date envoi |

---

## 6. Architecture Technique

```
┌─────────────────────────────────────────┐
│           Application Flutter           │
│   iOS / Android (un seul code source)   │
└──────────────┬──────────────────────────┘
               │ HTTPS / REST / Realtime
┌──────────────▼──────────────────────────┐
│            Supabase (existant)          │
│  - Auth (email, Google, Apple)          │
│  - Database PostgreSQL                  │
│  - Storage (badges, images)             │
│  - Edge Functions (génération PDF badge)│
│  - Realtime (notifications live)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Services externes               │
│  - Firebase FCM (push notifications)    │
│  - Brevo/SendGrid (emails badges)       │
│  - Google Maps (plan interactif)        │
└─────────────────────────────────────────┘
```

---

## 7. Sécurité

- **QR Code non falsifiable** : hash SHA-256 signé côté serveur (Supabase Edge Function)
- **RLS Supabase** : chaque utilisateur n'accède qu'à ses propres données
- **JWT tokens** : expiration 1h, refresh token 7 jours
- **Mode agent isolé** : les agents ne voient que les scans de leur portail
- **Aucun secret dans le code mobile** : toutes les clés sensibles dans les Edge Functions
- **OTP email** : validation obligatoire avant activation du compte

---

## 8. Design et UX

### 8.1 Charte graphique SIB
- **Couleur principale** : Bleu SIB `#1E40AF`
- **Couleur accent** : Or `#D4AF37`
- **Font** : Inter (corps) + Playfair Display (titres)
- **Ton** : Professionnel, sobre, événementiel haut de gamme

### 8.2 Navigation
- Barre de navigation bas : Accueil | Événements | Mon Badge | Contacts | Profil
- Mode agent : navigation simplifiée (Scanner | Mes scans | Profil)

### 8.3 Écrans obligatoires
1. Splash screen avec logo SIB
2. Onboarding (3 slides au premier lancement)
3. Connexion / Inscription
4. Vérification OTP
5. Accueil
6. Détail événement (onglets : Info / Conférences / Plan / Exposants)
7. Mon badge (QR code en grand, plein écran)
8. Scanner QR
9. Mon planning
10. Mes contacts
11. Profil
12. Mode agent (scanner plein écran)

---

## 9. Contraintes et Exigences Non-Fonctionnelles

| Contrainte | Exigence |
|---|---|
| Performance | Chargement liste événements < 2 secondes |
| Offline | Badge QR accessible hors connexion (mis en cache) |
| Compatibilité | iOS 14+ et Android 8+ |
| Stores | Publication sur App Store et Google Play Store |
| Langues store | FR, AR, EN |
| Accessibilité | Contraste suffisant, tailles de texte adaptées |
| Scanner | Lecture QR en < 1 seconde dans conditions normales |

---

## 10. Livrables Attendus

| # | Livrable | Description |
|---|---|---|
| 1 | Code source Flutter | Dépôt Git propre avec README |
| 2 | Fichiers de configuration | `google-services.json`, `GoogleService-Info.plist` |
| 3 | Scripts SQL Supabase | Migrations tables + RLS policies |
| 4 | Edge Functions | Génération badge PDF, envoi email, validation QR |
| 5 | Guide de déploiement | Procédure App Store + Play Store |
| 6 | Compte développeur | Accès aux comptes Apple Developer et Google Play |
| 7 | Données de test | Comptes de test pour chaque rôle |
| 8 | Documentation API | Endpoints utilisés + format des réponses |

---

## 11. Estimation de Charge

| Module | Complexité | Estimation |
|---|---|---|
| Auth (email + social) | Moyenne | 10j |
| Accueil + profil | Faible | 5j |
| Événements + conférences | Moyenne | 8j |
| E-Badge + QR Code | Haute | 10j |
| Scanner networking | Haute | 7j |
| Mode agent scan entrée | Haute | 8j |
| Notifications push | Moyenne | 5j |
| Back-office admin (intégré SIB) | Haute | 15j |
| Internationalisation FR/AR/EN | Faible | 5j |
| Tests + corrections + stores | — | 10j |
| **TOTAL estimé** | | **~83 jours/homme** |

---

## 12. Critères de Recette

L'application est considérée **livrée et acceptée** si :

- [ ] Inscription et connexion fonctionnelle sur iOS et Android réels
- [ ] E-Badge QR généré et accessible hors connexion
- [ ] Scan de badge entrant : résultat affiché en < 1 seconde
- [ ] Inscription à une conférence avec décompte des places en temps réel
- [ ] Notification push reçue sur les deux plateformes
- [ ] Export Excel des inscriptions fonctionnel depuis le back-office
- [ ] Application publiée sur App Store et Google Play
- [ ] Aucune donnée visible d'un autre utilisateur (test RLS)
- [ ] Branding SIB 100% conforme (aucune référence UrbaEvent)
- [ ] Support FR, AR (RTL) et EN vérifié

---

*Cahier des charges établi sur la base de l'analyse du code source UrbaEvent existant — Version SIB 2026*
