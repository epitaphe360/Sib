# SIB 2026 — Plateforme Digitale du Salon International du Bâtiment

> **20ème édition** | 25 – 29 Novembre 2026 | Parc d'Exposition Mohammed VI, El Jadida, Maroc

![Version](https://img.shields.io/badge/version-2.5.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture technique](#architecture-technique)
- [Stack technologique](#stack-technologique)
- [Fonctionnalités](#fonctionnalités)
- [Rôles utilisateurs](#rôles-utilisateurs)
- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [Intégrations externes](#intégrations-externes)
- [Installation et Développement](#installation-et-développement)
- [Déploiement](#déploiement)
- [Tests](#tests)
- [Sécurité](#sécurité)
- [Internationalisation](#internationalisation)
- [Contribuer](#contribuer)

---

## Vue d'ensemble

SIB 2026 est une **plateforme digitale complète** pour le Salon International du Bâtiment. Elle centralise l'inscription des participants, la gestion des exposants, le networking B2B, les paiements, la gestion de contenu et le suivi analytique dans un seul écosystème multi-salon.

### Chiffres clés

| Indicateur | Valeur |
|---|---|
| Pages / routes | 150+ |
| Composants React | 160+ |
| Stores Zustand | 17 |
| Services métier | 50+ |
| Edge Functions Supabase | 30+ |
| Migrations SQL | 25+ |
| Rôles utilisateurs | 6 |
| Salons supportés | 5 (SIB, SIR, SIP, BTP, SIE) |
| Langues | 3 (FR, EN, AR) |
| Tests E2E Playwright | 15+ scénarios |

### Salons de l'écosystème UrbaEvent

| Salon | Nom complet | Domaine |
|---|---|---|
| **SIB** | Salon International du Bâtiment | Construction & Architecture |
| **SIR** | Salon International de l'Immobilier | Immobilier |
| **SIP** | Salon International de la Promotion | Promotion immobilière |
| **BTP** | Salon du Bâtiment et des Travaux Publics | Travaux publics |
| **SIE** | Salon International de l'Environnement | Environnement & Énergie |

---

## Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  Web App (React/Vite)    │   Mobile App (Flutter/Capacitor)  │
│  Vercel CDN              │   iOS & Android                   │
└──────────────┬───────────┴───────────────────┬──────────────┘
               │                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│                         API LAYER                            │
│  Express.js Server (Railway)  │  Supabase Edge Functions     │
│  Port 5000 (prod)             │  (Deno runtime)              │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│                       SERVICES LAYER                         │
│  Supabase Auth    │  Firebase Auth   │  PayPal / CMI         │
│  Supabase DB      │  Firebase FCM    │  Resend (Email)       │
│  Supabase Storage │  Sentry (Errors) │  reCAPTCHA v3         │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack technologique

### Frontend Web

| Technologie | Version | Rôle |
|---|---|---|
| React | 18 | Framework UI |
| TypeScript | 5.5 | Typage statique |
| Vite | 6 | Build tool & dev server |
| TailwindCSS | 3 | Styles utilitaires |
| shadcn/ui | latest | Composants UI accessibles |
| Zustand | 5 | State management (14 stores) |
| React Router | 6 | Navigation SPA |
| Framer Motion | latest | Animations fluides |
| React Hook Form | latest | Gestion des formulaires |
| Zod | latest | Validation schéma |
| i18next | latest | Internationalisation |
| Recharts | latest | Graphiques & analytics |
| jsPDF | latest | Génération PDF (badges) |
| html2canvas | latest | Capture écran |
| qrcode.react | latest | Génération QR codes |
| Sonner | latest | Notifications toast |
| DOMPurify | latest | Prévention XSS |
| xlsx | latest | Export Excel |

### Backend & Services

| Technologie | Version | Rôle |
|---|---|---|
| Express.js | 5 | Serveur API REST |
| Node.js | 18+ | Runtime serveur |
| Supabase | latest | BDD, Auth, Storage, Edge Functions |
| PostgreSQL | 15 | Base de données relationnelle |
| Firebase | 10 | OAuth Google + Push notifications |
| Nodemailer | latest | Service email SMTP |
| Resend | latest | Email transactionnel |
| PayPal SDK | latest | Paiements internationaux |

### Mobile (Flutter / UrbaEvent)

| Technologie | Version | Rôle |
|---|---|---|
| Flutter | 3+ | Framework mobile cross-platform |
| Dart | 3+ | Langage |
| Capacitor | latest | Webview natif iOS/Android |
| Supabase Flutter SDK | 2.5.9 | Backend mobile |
| Firebase Auth | latest | Authentification mobile |
| FCM | latest | Push notifications |

### DevOps & Outils

| Outil | Rôle |
|---|---|
| Vercel | Hébergement frontend (CDN mondial, auto-deploy) |
| Railway | Hébergement backend Node.js |
| Sentry | Monitoring erreurs production |
| Playwright | Tests End-to-End |
| Vitest | Tests unitaires & composants |
| ESLint | Qualité du code TypeScript |
| GitHub Actions | CI/CD automatisé |

---

## Fonctionnalités

### Authentification & Sécurité

- Inscription multi-rôle : Visiteur, Exposant, Partenaire avec workflow de validation
- Google OAuth via Firebase
- Vérification email obligatoire à l'inscription
- Réinitialisation de mot de passe par lien email sécurisé
- Session timeout automatique (30 minutes d'inactivité)
- Rate limiting sur les tentatives de connexion
- reCAPTCHA v3 sur tous les formulaires publics
- Journal d'audit complet de toutes les activités utilisateur
- Row Level Security (RLS) au niveau base de données Supabase

### Paiements & Abonnements

- **PayPal** — Paiements internationaux en EUR (SDK + webhooks)
- **CMI** — Cartes bancaires marocaines (MAD) avec webhooks de confirmation
- **Stripe** — Paiements par carte internationale (Checkout Session + webhooks)
- **Virement bancaire** — Avec upload de justificatif, validation manuelle admin
- **Pass VIP Visiteur** — 300 EUR (accès fonctionnalités premium)
- Workflow d'approbation admin avec notifications automatiques
- Statuts : `pending` → `pending_payment` → `active` / `rejected`
- Gestion des abonnements partenaires avec niveaux de sponsoring

### Emails & Notifications

- Emails de bienvenue personnalisés par rôle
- Confirmation d'inscription avec QR code attaché
- Rappels automatiques de rendez-vous
- Alertes paiement (confirmation, rejet, instructions)
- Email de validation compte par l'administrateur
- Notifications push Firebase (application mobile)
- Templates d'email entièrement éditables depuis l'interface admin
- Formulaire de contact avec réponse automatique

### Networking & Matching IA

- Algorithme de matching avancé avec score de compatibilité par profil
- Détection d'intérêts mutuels — recommandations bidirectionnelles
- Historique d'interactions et suivi des échanges
- Salles de networking — sessions B2B programmées
- Speed networking — sessions courtes et intensives
- Planificateur de rendez-vous — créneaux synchronisés entre participants
- Messagerie interne — chat temps réel avec pièces jointes
- Score de compatibilité visible par secteur d'activité
- Edge Function `match-exhibitors` — matching côté serveur via Supabase

### Mini-Site Exposant (Builder)

- Éditeur drag-and-drop par sections modulaires
- Sections disponibles : Hero, À propos, Produits, Actualités, Galerie, Équipe, Certifications, Contact
- Personnalisation du thème : couleurs primaire, secondaire et accent
- Prévisualisation en temps réel sur mobile et desktop
- URL personnalisée et pérenne pour chaque exposant
- Compteur de vues et statistiques d'audience
- Export PDF du mini-site
- Design responsive (mobile, tablette, desktop)
- **IA Scraper** — Edge Function `scrape-and-create-minisite` : création automatique du mini-site par scraping du site web de l'exposant
- Bibliothèque de templates prédéfinis (templateLibraryService)
- CDN de médias avec optimisation et redimensionnement (cdnService)

### Médiathèque

| Catégorie | Description |
|---|---|
| Webinaires | Replays de sessions thématiques en replay |
| Podcasts | SIB Talks — interviews d'experts du secteur |
| Capsules | Inside SIB — formats courts et dynamiques |
| Live Studio | Meet The Leaders — rencontres dirigeants |
| Best Moments | Moments forts des éditions précédentes |
| Témoignages | Vidéos témoignages partenaires |

- Upload de médias par les partenaires avec workflow de validation admin
- Analytics : vues, durée de lecture, engagement
- Lecteur vidéo intégré avec contrôles avancés
- Filtrage multi-critères : catégorie, salon, date, langue

### Badges Numériques & Check-in

- Badge numérique personnalisé avec QR code unique par participant
- Station d'impression de badges (interface admin dédiée)
- Scanner QR code pour contrôle d'accès en temps réel
- Vérification instantanée : accès valide ou refusé
- Suivi des check-ins par jour et par zone
- Export PDF du badge individuel
- Badge VIP avec design personnalisé
- Edge Function `generate-visitor-badge` — génération badge côté serveur
- Edge Function `generate-qr` — génération QR codes dynamiques
- **Application Flutter dédiée** (`sib_zone_scanner/`) — scanner mobile natif iOS/Android
- Email de scan automatique (`send-scan-email`) à chaque check-in

### Analytics & Reporting

- Dashboard admin avec métriques en temps réel
- Trafic hebdomadaire segmenté par type d'utilisateur
- Classement des pages les plus visitées
- Statistiques d'inscription et taux de conversion
- ROI partenaires avec tableaux de bord dédiés par sponsor
- Export Excel et PDF des rapports
- Logs d'activité consultables et filtrables par admin

### Gestion des Événements

- Programme de conférences avec agenda interactif
- Inscription individuelle par session
- Gestion des intervenants (biographies, photos, réseaux)
- Calendrier partagé exportable en .ics
- Live events — streaming vidéo intégré
- Compteur de places disponibles en temps réel
- Notifications de rappel avant chaque session

### Plan & Pavillons

- Plan interactif de l'exposition avec navigation
- Gestion des pavillons thématiques par l'admin
- Localisation des exposants par stand
- Informations stands consultables depuis le plan
- Export PDF du plan de salle
- Métriques par pavillon (affluence, check-ins, densité) via `pavilionMetrics`
- Gestion des zones de scan par pavillon (`zonesService`)

### Gestion de Contenu (CMS)

- Articles de presse : création, édition, publication avec éditeur riche
- Contrôle de visibilité : publier / dépublier sans suppression
- Modération de contenu par l'équipe admin
- Gestion des accréditations presse
- Pages statiques éditables (À propos, Pourquoi visiter, etc.)
- **Synchronisation automatique des actualités** — Edge Function `sync-news-articles` (scraping)
- **Audio articles** — Text-to-speech via Edge Function `convert-text-to-speech` (articleAudioService)
- Feature flags dynamiques — activation/désactivation fonctionnalités sans redéploiement

### Sécurité & Authentification avancée

- **2FA TOTP** — Authentification à deux facteurs avec applications authenticator (Edge Functions `generate-totp-secret`, `verify-totp-token`)
- **Codes de secours** — Génération et validation de backup codes (Edge Function `generate-backup-codes`)
- **Notifications push** — FCM via Edge Functions `send-push-notification`, `broadcast-push-notification`
- **Comptes collaborateurs** — Création de sous-comptes via `create-collaborator-account`
- Vérification reCAPTCHA côté serveur (Edge Function `verify-recaptcha`)
- Synchronisation hors-ligne — file d'attente d'actions en mode offline (`offlineSyncService`)

### Dashboards — Interface unifiée

| Dashboard | Rôle | Composants clés |
|---|---|---|
| **AdminDashboard** | Super admin | AdminMetricsGrid, AdminChartsSection, ActivityFeed, SystemHealthPanel |
| **ExhibitorDashboard** | Exposant | ExhibitorStatsGrid, ExhibitorHeader, ExhibitorAppointmentSection, ExhibitorAnalyticsSection |
| **PartnerDashboard** | Partenaire / sponsor | Métriques ROI, upload médias, analytics |
| **MarketingDashboard** | Équipe marketing | Funnel inscriptions, CMS, analytics |
| **MediaPartnerDashboard** | Partenaires média | Accès médiathèque, statistiques diffusion |
| **DashboardPage** | Routing dynamique | Redirige vers le dashboard du rôle actif |

**Améliorations UI dashboards (v2.5)** :
- KPIs en grille 2×2 compacte sur mobile (`grid-cols-2 md:grid-cols-4`)
- Headers allégés (`py-5`, icônes `h-7 w-7`, titres `text-xl`)
- ChatBot et WhatsApp masqués automatiquement sur les pages admin, exposant et visiteur

---

## Rôles utilisateurs

### Hiérarchie des rôles

```
Admin (accès total à la plateforme)
├── Marketing (analytics & CMS)
├── Securite / Staff (scanner QR check-in)
├── Partenaire (6 niveaux de sponsoring)
│   ├── Organisateur
│   ├── Co-organisateur
│   ├── Sponsor officiel
│   ├── Organisateur délégué
│   ├── Partenaire presse
│   └── Partenaire général
├── Exposant (profil + mini-site + rendez-vous)
└── Visiteur (2 niveaux d'accès)
    ├── Visiteur gratuit (Free Pass — badge uniquement, aucun rendez-vous)
    └── Visiteur VIP (Premium VIP Pass — networking, RDV B2B, gala, conférences)
```

### Tableau des permissions

| Fonctionnalité | Visiteur | Exposant | Partenaire | Admin |
|---|:---:|:---:|:---:|:---:|
| Navigation pages publiques | Oui | Oui | Oui | Oui |
| Profil personnel | Oui | Oui | Oui | Oui |
| Prise de rendez-vous B2B | Oui | Oui | — | — |
| Networking & matching IA | Oui | Oui | — | — |
| Mini-site builder | — | Oui | — | — |
| Upload & gestion médias | — | — | Oui | Oui |
| Analytics avancés | — | — | Oui | Oui |
| Gestion des utilisateurs | — | — | — | Oui |
| Validation des paiements | — | — | — | Oui |
| Modération du contenu | — | — | — | Oui |
| Scanner QR / check-in | — | — | — | Oui |
| Lettre de visa | VIP uniquement | — | — | — |
| Dashboard marketing | — | — | — | Oui |

---

## Structure du projet

```
Sib/
├── src/
│   ├── App.tsx                         # Configuration des 130+ routes
│   ├── main.tsx                        # Point d'entrée React + i18n
│   │
│   ├── components/                     # 130+ composants réutilisables
│   │   ├── admin/                      # Panneaux d'administration
│   │   ├── auth/                       # Login, Register, Reset password
│   │   ├── dashboard/                  # Tableaux de bord par rôle
│   │   │   ├── visitor/
│   │   │   ├── exhibitor/
│   │   │   ├── partner/
│   │   │   └── admin/
│   │   ├── chat/                       # Messagerie interne temps réel
│   │   ├── appointments/               # Gestion rendez-vous B2B
│   │   ├── minisite/                   # Éditeur mini-site exposant
│   │   ├── networking/                 # Matching IA & networking
│   │   ├── badge/                      # Badges numériques
│   │   ├── media/                      # Lecteur vidéo & médiathèque
│   │   ├── security/                   # Scanner QR code
│   │   └── ui/                         # Composants shadcn/ui de base
│   │
│   ├── pages/                          # 60+ composants de pages
│   │   ├── public/                     # Pages accessibles sans compte
│   │   ├── visitor/                    # Espace visiteur
│   │   ├── exhibitor/                  # Espace exposant
│   │   ├── partner/                    # Espace partenaire
│   │   └── admin/                      # Pages administration
│   │
│   ├── services/                       # 50+ services métier
│   │   ├── paymentService.ts           # PayPal, CMI, Stripe, virement bancaire
│   │   ├── emailService.ts             # Envoi d'emails transactionnels
│   │   ├── emailTemplateService.ts     # Templates d'emails éditables
│   │   ├── advancedMatchingService.ts  # Algorithme de matching IA
│   │   ├── aiMatchingService.ts        # Matching IA côté serveur
│   │   ├── aiAgentService.ts           # Agent IA conversationnel
│   │   ├── aiScrapperService.ts        # Scraping automatique mini-sites
│   │   ├── badgeService.ts             # Génération et gestion badges
│   │   ├── badgePrintService.ts        # Impression badges physiques
│   │   ├── analyticsService.ts         # Tracking et analytics
│   │   ├── articleAudioService.ts      # Text-to-speech articles
│   │   ├── auditService.ts             # Journal d'audit activités
│   │   ├── cdnService.ts               # Gestion CDN et médias
│   │   ├── chatFileUploadService.ts    # Upload pièces jointes chat
│   │   ├── exportService.ts            # Export Excel / PDF
│   │   ├── featureFlagService.ts       # Feature flags dynamiques
│   │   ├── invoiceService.ts           # Génération factures PDF
│   │   ├── mediaService.ts             # Médiathèque vidéos & podcasts
│   │   ├── mobilePushService.ts        # Push notifications mobile
│   │   ├── nativeFeaturesService.ts    # Fonctionnalités natives Capacitor
│   │   ├── networkingScoring.ts        # Scoring algorithme networking
│   │   ├── newsScraperService.ts       # Scraping articles d'actualité
│   │   ├── notificationService.ts      # Notifications in-app
│   │   ├── offlineSyncService.ts       # Sync hors-ligne / file d'attente
│   │   ├── partnerPaymentService.ts    # Paiements & abonnements partenaires
│   │   ├── pavilionMetrics.ts          # Métriques pavillons & zones
│   │   ├── pushNotificationService.ts  # Firebase FCM
│   │   ├── qrCodeService.ts            # Génération QR codes
│   │   ├── realtimeService.ts          # Abonnements Supabase Realtime
│   │   ├── recommendationService.ts    # Recommandations personnalisées
│   │   ├── roleVerificationService.ts  # Vérification rôles côté client
│   │   ├── searchService.ts            # Recherche full-text
│   │   ├── securityService.ts          # RPC Supabase opérations sécurisées
│   │   ├── speedNetworking.ts          # Sessions speed networking
│   │   ├── storageService.ts           # Upload Supabase Storage
│   │   ├── templateLibraryService.ts   # Bibliothèque templates mini-sites
│   │   ├── transactionService.ts       # Historique transactions
│   │   └── zonesService.ts             # Zones de scan & contrôle d'accès
│   │
│   ├── store/                          # 17 stores Zustand
│   │   ├── authStore.ts                # Authentification & session
│   │   ├── dashboardStore.ts           # État global dashboard
│   │   ├── exhibitorStore.ts           # Profil exposant
│   │   ├── networkingStore.ts          # Matching & networking
│   │   ├── appointmentStore.ts         # Rendez-vous
│   │   ├── chatStore.ts                # Messagerie interne
│   │   ├── chatbotStore.ts             # État chatbot IA
│   │   ├── eventStore.ts               # Événements & inscriptions
│   │   ├── adminDashboardStore.ts      # Métriques admin temps réel
│   │   ├── visitorStore.ts             # Profil & quotas visiteur
│   │   ├── mediaVisibilityStore.ts     # Visibilité médias (admin)
│   │   ├── programmeStore.ts           # Programme conférences
│   │   ├── navigationStore.ts          # État navigation globale
│   │   ├── navVisibilityStore.ts       # Visibilité éléments nav
│   │   ├── languageStore.ts            # Langue active (fr/en/ar)
│   │   ├── filterStore.ts              # Filtres catalogue exposants
│   │   └── newsStore.ts                # Articles et actualités
│   │
│   ├── lib/                            # Configuration & utilitaires
│   │   ├── supabase.ts                 # Client Supabase configuré
│   │   ├── firebase.ts                 # Configuration Firebase
│   │   ├── routes.ts                   # Définition centralisée des routes
│   │   └── utils.ts                    # Fonctions utilitaires partagées
│   │
│   ├── types/                          # Interfaces TypeScript
│   │   └── index.ts                    # Types globaux de l'application
│   │
│   ├── hooks/                          # Hooks React personnalisés
│   └── i18n/                           # Traductions
│       ├── fr/                         # Français (complet)
│       ├── en/                         # Anglais (complet)
│       └── ar/                         # Arabe (partiel, RTL)
│
├── server/                             # Backend Express.js
│   ├── server.js                       # Serveur API principal (port 5000)
│   ├── metrics-server.js               # Serveur métriques admin
│   └── exhibitors-server.js            # Import en masse d'exposants
│
├── supabase/                           # Backend Supabase
│   ├── migrations/                     # 21+ scripts de migration SQL
│   ├── functions/                      # Edge Functions (Deno)
│   │   ├── send-contact-email/
│   │   ├── send-registration-email/
│   │   ├── send-validation-email/
│   │   └── send-exhibitor-payment-instructions/
│   └── master_migration.sql            # Migration complète consolidée
│
├── tests/                              # Tests Playwright E2E
├── scripts/                            # Scripts utilitaires et seeds
├── urbaevent/                          # Application mobile Flutter
├── docs/                               # Documentation technique
│
├── package.json                        # Dépendances & scripts npm
├── vite.config.ts                      # Configuration Vite
├── tailwind.config.ts                  # Configuration TailwindCSS
└── tsconfig.json                       # Configuration TypeScript
```

---

## Base de données

### Tables principales (Supabase PostgreSQL)

| Table | Description |
|---|---|
| `users` | Comptes utilisateurs (lié à auth.users Supabase) |
| `exhibitors` | Profils des entreprises exposantes |
| `partners` | Organisations partenaires et sponsors |
| `mini_sites` | Pages landing des exposants (mini-site builder) |
| `products` | Catalogue produits et services des exposants |
| `appointments` | Rendez-vous B2B entre participants |
| `conversations` | Fils de discussion messagerie interne |
| `messages` | Messages individuels du chat |
| `message_attachments` | Pièces jointes dans le chat |
| `event_registrations` | Inscriptions aux événements et conférences |
| `networking_recommendations` | Résultats de l'algorithme de matching |
| `analytics` | Tracking pages vues & événements utilisateur |
| `activities` | Journal d'audit complet des actions |
| `time_slots` | Créneaux de disponibilité pour rendez-vous |
| `news_articles` | Articles de presse et actualités |
| `events` | Conférences, webinaires et sessions |
| `pavilions` | Zones thématiques de l'exposition |
| `salons` | Références multi-salons (SIB, SIR, SIP, BTP, SIE) |
| `page_contents` | CMS pour les pages statiques |
| `media_content` | Métadonnées vidéos, podcasts et médias |
| `badges` | Badges numériques des participants |
| `payment_requests` | Suivi et historique des paiements |
| `press_accreditations` | Accréditations pour les journalistes |
| `speakers` | Intervenants des événements |
| `email_templates` | Templates d'emails éditables |

### Row Level Security (RLS)

Toutes les tables sont protégées par des politiques RLS Supabase :
- Les visiteurs accèdent uniquement à leurs propres données
- Les exposants peuvent voir les informations des visiteurs ayant pris rendez-vous
- Les admins ont un accès complet via service role key (côté serveur uniquement)
- La clé `service_role` n'est jamais exposée côté client

---

## Intégrations externes

### Authentification

| Service | Rôle |
|---|---|
| Supabase Auth | Email/password, gestion sessions JWT, tokens de rafraîchissement |
| Firebase Auth | Google OAuth, OIDC provider |

### Paiements

| Service | Devise | Méthode |
|---|---|---|
| PayPal | EUR (international) | Carte bancaire, compte PayPal |
| CMI | MAD (Maroc) | Cartes bancaires marocaines Visa/Mastercard |
| Virement bancaire | MAD / EUR | Manuel avec upload de justificatif |

### Emails

| Service | Usage |
|---|---|
| Resend | Email transactionnel via Supabase Edge Functions |
| Nodemailer | Email SMTP depuis le serveur Express |

### Cloud & Hébergement

| Service | Rôle |
|---|---|
| Supabase | BDD PostgreSQL + Auth + Storage + Edge Functions |
| Firebase | OAuth Google + Cloud Messaging (push mobile) |
| Vercel | Frontend (CDN mondial, auto-deploy depuis GitHub) |
| Railway | Backend Node.js (auto-deploy depuis GitHub) |
| Sentry | Monitoring et tracking erreurs en production |

---

## Installation et Développement

### Prérequis

- Node.js >= 18.0.0
- npm >= 9.0.0
- Compte Supabase avec un projet configuré
- Compte Firebase avec OAuth Google activé
- Compte Resend ou accès SMTP pour les emails

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
# Supabase (frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Firebase
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# reCAPTCHA v3
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Backend Express (server.js)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EMAIL_HOST=smtp.your-provider.com
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
PORT=3000

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET=your-paypal-secret
```

### Installation locale

```bash
# 1. Cloner le dépôt
git clone https://github.com/your-org/sib-2026.git
cd sib-2026

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Remplir .env.local avec vos clés

# 4. Lancer le frontend (port 9324)
npm run dev

# 5. Lancer le backend dans un terminal séparé (port 3000)
npm run start:server

# 6. (Optionnel) Lancer le serveur métriques
npm run metrics-server
```

### Commandes npm disponibles

```bash
npm run dev              # Serveur de développement Vite (port 9323)
npm run build            # Build production avec injection version
npm run build:vercel     # Build optimisé pour Vercel
npm run build:railway    # Build pour déploiement Railway
npm run build:mobile     # Build avec export Capacitor iOS/Android
npm run lint             # Vérification ESLint TypeScript
npm run preview          # Prévisualiser le build de production
npm run start:server     # Démarrer le serveur Express.js
npm run metrics-server   # Démarrer le serveur métriques admin
npm run seed:templates   # Initialiser les templates mini-sites
npm run test:unit        # Tests unitaires Vitest
npm run test:e2e         # Tests E2E Playwright
```

---

## Déploiement

### Frontend — Vercel

```bash
# Auto-deploy automatique sur push vers la branche main
git push origin main

# Déploiement manuel (recommandé)
npx vercel --prod --archive=tgz

# Build command configuré dans vercel.json
npm run build:vercel

# Répertoire de sortie
dist/
```

**URLs de production :**
- `https://sib2026.ma`
- `https://www.sib2026.ma`
- `https://sib2026.vercel.app` (Vercel direct)

### Backend — Railway

```bash
# Auto-deploy via détection nixpacks
# Fichier de config : nixpacks.toml
# Commande de démarrage : node server.js
# Port production : 5000
```

**URL API :** `https://sib-production.up.railway.app`

### Base de données — Supabase

```bash
# Option 1 : Via le SQL Editor du dashboard Supabase
# Coller et exécuter : supabase/master_migration.sql

# Option 2 : Via Supabase CLI
supabase db push
```

### Edge Functions — Supabase

```bash
# Déployer toutes les fonctions
supabase functions deploy --all

# Ou individuellement
supabase functions deploy send-contact-email
supabase functions deploy send-registration-email
supabase functions deploy send-validation-email
supabase functions deploy send-exhibitor-payment-instructions
```

#### Catalogue complet des Edge Functions (30+)

| Fonction | Rôle |
|---|---|
| `send-contact-email` | Email formulaire de contact |
| `send-registration-email` | Confirmation d'inscription avec QR code |
| `send-validation-email` | Email de validation compte par admin |
| `send-exhibitor-payment-instructions` | Instructions paiement exposant |
| `send-partner-payment-instructions` | Instructions paiement partenaire |
| `send-visitor-welcome-email` | Email de bienvenue visiteur |
| `send-credentials` | Envoi identifiants de connexion |
| `send-email-notification` | Notifications email génériques |
| `send-template-email` | Email depuis template éditeur admin |
| `send-scan-email` | Email de confirmation check-in QR |
| `send-push-notification` | Push notification ciblée (FCM) |
| `broadcast-push-notification` | Push notification en masse |
| `create-paypal-order` | Initialisation paiement PayPal |
| `capture-paypal-order` | Capture paiement PayPal |
| `paypal-webhook` | Webhooks PayPal (IPN) |
| `create-cmi-payment` | Initialisation paiement CMI |
| `cmi-webhook` | Webhooks CMI (notifications paiement) |
| `create-stripe-checkout` | Session Checkout Stripe |
| `stripe-webhook` | Webhooks Stripe |
| `generate-visitor-badge` | Génération badge visiteur (PDF) |
| `generate-qr` | Génération QR codes dynamiques |
| `generate-totp-secret` | Secret 2FA TOTP |
| `verify-totp-token` | Vérification token 2FA |
| `generate-backup-codes` | Codes de secours 2FA |
| `verify-recaptcha` | Vérification reCAPTCHA v3 |
| `scrape-and-create-minisite` | Scraping site web → mini-site auto |
| `match-exhibitors` | Matching IA exposants côté serveur |
| `sync-news-articles` | Synchronisation articles actualités |
| `convert-text-to-speech` | Text-to-speech articles audio |
| `create-collaborator-account` | Création comptes collaborateurs |
| `delete-exhibitor` | Suppression sécurisée exposant |

---

## Tests

### Tests unitaires (Vitest)

```bash
npm run test           # Lancer les tests unitaires
npm run test:coverage  # Avec rapport de couverture de code
```

### Tests E2E (Playwright)

```bash
# Installer le navigateur Playwright
npx playwright install chromium

# Lancer tous les tests
npx playwright test

# Lancer un scénario spécifique
npx playwright test tests/auth.spec.ts

# Interface graphique interactive
npx playwright test --ui

# Rapport HTML
npx playwright show-report
```

#### Scénarios E2E disponibles

| Scénario | Description |
|---|---|
| `auth.spec.ts` | Login, signup, Google OAuth, reset password |
| `appointments.spec.ts` | Réservation et gestion rendez-vous B2B |
| `networking.spec.ts` | Matching IA et sessions networking |
| `payment.spec.ts` | Flux PayPal, CMI et virement bancaire |
| `admin.spec.ts` | Validation comptes, modération, dashboard |
| `dashboard.spec.ts` | UI des tableaux de bord par rôle |
| `marketing.spec.ts` | Dashboard marketing et CMS |
| `quota.spec.ts` | Système de quotas visiteurs |
| `calendar.spec.ts` | Calendrier public et exports |

### Tests de charge (Artillery)

```bash
# Smoke test sur les pages publiques
npx artillery run tests/load/smoke.yml
```

---

## Sécurité

### Mesures de sécurité implémentées

| Mesure | Implémentation |
|---|---|
| Row Level Security | Politiques RLS sur toutes les tables Supabase |
| JWT | Tokens signés Supabase avec expiration automatique |
| Rate limiting | Limitation des tentatives de login (5/15 min — `rateLimiter.ts`) |
| reCAPTCHA v3 | Vérification côté serveur via Edge Function `verify-recaptcha` |
| 2FA TOTP | Authentification à deux facteurs avec backup codes |
| CORS | Liste blanche des origines autorisées uniquement |
| HTTPS | Forcé en production via Vercel et Railway |
| Session timeout | Déconnexion automatique après 30 min d'inactivité |
| XSS | `sanitizeHtml()` appliqué sur tout `dangerouslySetInnerHTML` |
| Service Role Key | Jamais exposée côté client, serveur uniquement (`server.js`) |
| Audit Log | Traçabilité complète via `auditService.ts` |
| Opérations atomiques | RPC Supabase pour les opérations critiques (`securityService.ts`) |

### Cycle de vie d'un compte

```
Inscription
    │
    ▼
pending (en attente validation admin)
    │
    ├── (rejeté) ──────────────────► rejected
    │
    ▼
pending_payment (paiement requis)
    │
    ├── (non approuvé) ─────────────► rejected
    │
    ▼
active (compte opérationnel)
    │
    └── (admin) ───────────────────► suspended
```

---

## Internationalisation

La plateforme supporte **3 langues** via un système custom et i18next :

| Langue | Code | Direction | Statut |
|---|---|---|---|
| Français | `fr` | LTR (gauche à droite) | Complet |
| Anglais | `en` | LTR (gauche à droite) | Complet |
| Arabe | `ar` | RTL (droite à gauche) | Complet |

- Système custom : `useTranslation` hook + `languageStore` (Zustand)
- Fichiers de traductions : `translations.fr.ts`, `translations.en.ts`, `translations.ar.ts`
- Détection automatique via `i18next-browser-languagedetector`
- Support RTL complet pour l'arabe avec adaptation CSS automatique
- Sélecteur de langue accessible dans la navigation principale
- 2 systèmes parallèles : store Zustand (principal) + i18next (pages publiques)

---

## Contribuer

### Conventions de commit

```
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
refactor: Refactorisation sans changement de comportement
docs:     Documentation uniquement
test:     Ajout ou correction de tests
style:    Formatage et espaces (aucune logique modifiée)
chore:    Maintenance (dépendances, configuration)
```

### Branches

| Branche | Rôle |
|---|---|
| `main` | Production — auto-deploy Vercel & Railway |
| `develop` | Intégration continue et staging |
| `feature/*` | Développement de nouvelles fonctionnalités |
| `fix/*` | Corrections de bugs isolées |
| `release/*` | Préparation des releases versionnées |

### Workflow Pull Request

1. Créer une branche depuis `develop` : `git checkout -b feature/ma-fonctionnalite`
2. Développer et tester localement
3. Lancer `npm run lint` et corriger les erreurs
4. Lancer `npx playwright test` pour les tests E2E
5. Ouvrir une Pull Request vers `develop`
6. Attendre la review d'au moins 1 développeur
7. Merge → auto-deploy en staging
8. Release : merge `develop` → `main` → production

---

## Contacts & Ressources

| Ressource | URL / Info |
|---|---|
| Application web production | https://sib2026.ma |
| Vercel dashboard | https://vercel.com |
| Supabase dashboard | https://supabase.com/dashboard |
| Railway dashboard | https://railway.app |
| Sentry monitoring | https://sentry.io |
| Documentation Supabase | https://supabase.com/docs |
| Documentation Firebase | https://firebase.google.com/docs |

---

---

## Applications annexes

| Application | Technologie | Description |
|---|---|---|
| `sib_zone_scanner/` | Flutter + Supabase | Scanner QR mobile natif — contrôle d'accès zones |
| `sib-app/` | Capacitor (React → iOS/Android) | App mobile SIB 2026 |
| `luxury-next/` | Next.js | Projet landing page séparé |
| `server/ai-agent/` | Node.js | Agent IA backend pour chatbot |

---

*Développé pour SIB 2026 — Powered by React 18, Supabase, Vercel & Railway — v2.5.0*
