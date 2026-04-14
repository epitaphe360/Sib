# Plan de Développement Global — Urbacom
## Plateforme Web SIB + Application Mobile iOS/Android

**Date de rédaction** : Avril 2026  
**Responsable** : Urbacom  
**Version** : 1.0

---

## Résumé Exécutif

| Projet | Statut actuel | Objectif final |
|---|---|---|
| **Plateforme Web SIB** | ✅ En production (SIB 2026) | 🎯 Super Admin multi-salons Urbacom |
| **Site corporate urbacom.ma** | ⚠️ WordPress vieux | 🎯 Refaire en React, lié à Supabase |
| **App Mobile iOS/Android** | ⚠️ Code reçu (UrbaEvent/Strapi) | 🎯 Rebrancher sur Supabase + branding SIB |

**Stack technique unique** : React + TypeScript + Flutter + Supabase  
**Principe** : Une seule base de données Supabase pour tous les salons

---

---

# PARTIE 1 — PLATEFORME WEB SIB

## État actuel de la plateforme (ce qui existe déjà ✅)

### Modules Admin opérationnels
- ✅ Dashboard Admin avec KPIs globaux
- ✅ Gestion des utilisateurs (CRUD, rôles, blocage)
- ✅ Gestion des exposants (création, validation, mini-site AI)
- ✅ Gestion des partenaires (4 niveaux : Museum/Silver/Gold/Platinum)
- ✅ CMS contenu (9 pages vitrine entièrement éditables)
- ✅ Gestion actualités (articles FR/AR/ES)
- ✅ Templates email personnalisables
- ✅ Gestion médias (vidéos, podcasts, webinars, lives)
- ✅ Conférenciers et programme
- ✅ Scan QR + station impression badges
- ✅ Validation paiements (Stripe/PayPal)
- ✅ Marketing Dashboard avec éditeur WYSIWYG
- ✅ Modération

### Dashboards utilisateurs opérationnels
- ✅ Dashboard Visiteur (badges, RDV, quota networking)
- ✅ Dashboard Exposant (stats, mini-site AI scrapper, collaborateurs)
- ✅ Dashboard Partenaire (ROI analytics, médias soumis)
- ✅ Dashboard Marketing

### Fonctionnalités avancées opérationnelles
- ✅ Matching IA B2B (recommandations GPT-4o-mini)
- ✅ Speed Networking avec timer
- ✅ Mini-site exposant généré par IA (scrapping URL)
- ✅ Profil partenaire IA (extraction automatique)
- ✅ Système QR Code badges (signé et sécurisé)
- ✅ Notifications push Firebase
- ✅ Auth complète (email, Google, Apple, OTP)
- ✅ Multilingue FR/AR/EN
- ✅ reCAPTCHA v3

**Total : 104 pages, 159 composants, 47 services**

---

## PHASE 1 — Multi-salons & Super Admin
**Durée estimée** : 2-3 semaines  
**Priorité** : 🔴 CRITIQUE — À faire en premier

### Objectif
Transformer la plateforme SIB en plateforme Urbacom capable de gérer tous les salons depuis un seul admin.

### Tâches techniques

#### 1.1 Base de données Supabase
- [ ] Créer la table `events` (id, slug, name, organizer, edition, start_date, end_date, location, lat, lng, banner_url, logo_url, theme_color, enabled, config)
- [ ] Ajouter colonne `event_id` sur : `exhibitors`, `partners`, `registrations`, `conferences`, `page_contents`, `notifications`, `articles`
- [ ] Créer les RLS policies d'isolation par `event_id`
- [ ] Créer le rôle `super_admin` qui bypass tous les filtres
- [ ] Migration des données SIB 2026 existantes vers `event_id = sib-2026`
- [ ] Script SQL de création du premier salon (SIB 2026) en données de base

#### 1.2 Interface Admin — Sélecteur de salon
- [ ] Créer le composant `EventSelector` dans la navbar admin (dropdown)
- [ ] Stocker le salon actif dans le contexte global (`useCurrentEvent`)
- [ ] Toutes les pages admin filtrent automatiquement par `event_id` sélectionné
- [ ] Badge visuel dans l'admin indiquant le salon en cours

#### 1.3 Page Admin — Gestion des salons
- [ ] Page `/admin/salons` — liste de tous les salons Urbacom
- [ ] Page `/admin/salons/create` — créer un nouveau salon
- [ ] Champs : nom, slug, organisateur, numéro d'édition, dates, lieu, GPS, couleur thème, logo, banner
- [ ] Activation/désactivation d'un salon (visible dans l'app mobile)
- [ ] Dupliquer un salon existant (copier config d'un salon précédent)

#### 1.4 Rôle Super Admin
- [ ] Nouveau rôle `super_admin` dans Supabase Auth
- [ ] Accès à TOUS les salons sans filtre
- [ ] Page `/admin/super` — statistiques consolidées multi-salons
- [ ] Gestion des admins par salon (assigner admin à un événement)

#### 1.5 Isolation des données
- [ ] Vérifier que chaque page admin applique le filtre `event_id`
- [ ] Tester : admin SIB ne voit pas les données BTP EXPO
- [ ] Tester : super admin voit tout

---

## PHASE 2 — Site corporate urbacom.ma
**Durée estimée** : 2 semaines  
**Priorité** : 🟡 IMPORTANT

### Objectif
Remplacer le WordPress par un site React moderne, connecté à la même Supabase.

### Tâches techniques

#### 2.1 Structure du site
- [ ] Nouvelle app React dédiée : `urbacom-website`
- [ ] Même design system que la plateforme SIB (Tailwind, polices, couleurs)
- [ ] Déploiement sur `urbacom.ma`

#### 2.2 Pages à créer
- [ ] Page d'accueil : présentation Urbacom, chiffres clés, salons gérés
- [ ] Page "Nos Salons" : liste dynamique depuis table `events` Supabase (les salons activés)
- [ ] Page "À propos" : équipe, histoire depuis 1986, mission
- [ ] Page "Exposer" : pourquoi exposer dans un salon Urbacom, processus d'inscription
- [ ] Page "Visiter" : agenda de tous les salons à venir
- [ ] Page "Actualités" : articles depuis la même table Supabase que SIB
- [ ] Page "Contact" : formulaire avec reCAPTCHA, géolocalisé
- [ ] Section "Admin" : lien vers `admin.urbacom.ma` (Super Admin)

#### 2.3 Connexion Supabase
- [ ] Lire la table `events` pour afficher les salons à venir
- [ ] Lire les articles depuis la table `articles` (partagée avec SIB)
- [ ] Formulaire de contact → table `contacts` Supabase
- [ ] Auth partagée : connexion unique pour tous les sous-domaines

#### 2.4 SEO & Performance
- [ ] Meta tags dynamiques par page
- [ ] Sitemap.xml automatique
- [ ] Optimisation images (WebP, lazy loading)
- [ ] Score Lighthouse > 90

---

## PHASE 3 — Déploiement multi-sous-domaines
**Durée estimée** : 1 semaine  
**Priorité** : 🟡 IMPORTANT

### Objectif
Chaque salon a son propre sous-domaine, même code, configuration différente.

### Tâches techniques

#### 3.1 Configuration multi-tenant
- [ ] Variable d'environnement `VITE_EVENT_SLUG` dans chaque déploiement
- [ ] La plateforme SIB lit son salon actif depuis `VITE_EVENT_SLUG`
- [ ] Thème couleur chargé dynamiquement depuis la table `events`
- [ ] Logo et favicon dynamiques par salon

#### 3.2 Déploiements
- [ ] `sib.urbacom.ma` → déploiement SIB 2026 (existant, à renommer)
- [ ] `btp.urbacom.ma` → même codebase, `VITE_EVENT_SLUG=btp-expo-2026`
- [ ] `admin.urbacom.ma` → Super Admin (accès tous les salons)
- [ ] `urbacom.ma` → site corporate

#### 3.3 DNS & SSL
- [ ] Configurer les sous-domaines chez le registraire
- [ ] Certificats SSL Let's Encrypt pour tous les sous-domaines
- [ ] Redirections www → non-www

---

## PHASE 4 — Améliorations plateforme SIB
**Durée estimée** : En continu  
**Priorité** : 🟢 NICE-TO-HAVE

### Fonctionnalités
- [ ] PWA (Progressive Web App) — fonctionne hors connexion
- [ ] Badge QR téléchargeable en PDF depuis le dashboard visiteur
- [ ] Notification push personnalisées par segment (visiteurs / exposants / partenaires)
- [ ] Rapport ROI partenaire automatique (PDF exportable)
- [ ] Statistiques avancées : heatmap des visites, flux de visitors
- [ ] API publique pour les partenaires (accès aux stats de leur participation)
- [ ] Intégration calendrier (Google Calendar, Outlook)
- [ ] Chat en temps réel entre participants (Supabase Realtime)

---

---

# PARTIE 2 — APPLICATION MOBILE iOS & Android

## État actuel du code reçu (UrbaEvent Flutter)

| Composant | État | Note |
|---|---|---|
| App Flutter (82 fichiers) | ✅ Fonctionnel | Branché sur Strapi (à migrer) |
| Backend Strapi 4 | ⚠️ Node 14-16 obsolète | À remplacer par Supabase |
| Frontend Angular 10 | ⚠️ 2020, très vieux | À remplacer par vitrine React |
| Branding | ❌ UrbaEvent/BTP EXPO | À remplacer par SIB/Urbacom |
| Firebase config | ❌ Projet UrbaEvent | À reconfigurer |
| Clés secrètes within code | ❌ Faille sécurité | À déplacer dans Supabase Vault |

---

## PHASE A — Migration Flutter → Supabase
**Durée estimée** : 3-4 semaines  
**Priorité** : 🔴 CRITIQUE

### Objectif
Rebrancher l'app Flutter sur Supabase au lieu de Strapi. Même app, nouveau backend.

### Tâches techniques

#### A.1 Configuration Supabase dans Flutter
- [ ] Ajouter `supabase_flutter` package dans `pubspec.yaml`
- [ ] Créer `SupabaseService` class (remplace tous les `http.get(Urls.xxx)`)
- [ ] Configurer les variables d'environnement `SUPABASE_URL` et `SUPABASE_ANON_KEY`
- [ ] **Ne jamais mettre de clés dans le code source** — utiliser flutter_dotenv

#### A.2 Migration Authentification
| Ancien (Strapi) | Nouveau (Supabase) |
|---|---|
| `POST /auth/local` | `supabase.auth.signInWithPassword()` |
| `POST /auth/local/register` | `supabase.auth.signUp()` |
| `POST /auth/forgot-password` | `supabase.auth.resetPasswordForEmail()` |
| `GET /auth/social` (Google) | `supabase.auth.signInWithOAuth(google)` |
| `GET /auth/social` (Apple) | `supabase.auth.signInWithOAuth(apple)` |
| `PUT /users/verifyEmailOTP` | `supabase.auth.verifyOTP()` |

- [ ] Supprimer la dépendance Firebase Auth (remplacée par Supabase Auth)
- [ ] Garder Firebase FCM uniquement pour les notifications push
- [ ] Tester connexion email/mot de passe
- [ ] Tester Google Sign-In
- [ ] Tester Apple Sign-In (obligatoire App Store)

#### A.3 Migration données
| Ancien (Strapi REST) | Nouveau (Supabase) |
|---|---|
| `GET /events` | `supabase.from('events').select()` |
| `GET /registrations` | `supabase.from('registrations').select()` |
| `POST /registrations` | `supabase.from('registrations').insert()` |
| `GET /conferences` | `supabase.from('conferences').select()` |
| `POST /scans` (networking) | `supabase.from('scans_networking').insert()` |
| `POST /scans-controllers` | `supabase.from('scans_entry').insert()` |
| `GET /notifications` | `supabase.from('notifications').select()` |
| `GET /users/me` | `supabase.auth.currentUser` |
| `PUT /users/:id` | `supabase.from('profiles').update()` |
| `GET /gates` | `supabase.from('gates').select()` |
| `GET /conferences` (schedule) | `supabase.from('conferences').select()` |

- [ ] Migrer chaque écran Flutter un par un
- [ ] Tester chaque endpoint remplacé

#### A.4 Migration badge QR
| Ancien | Nouveau |
|---|---|
| `GET /registrations/getQRCode/:id` (PNG Strapi) | `supabase.functions.invoke('generate-qr')` |
| `GET /registrations/downloadEbadge/:id` (PDF Strapi) | `supabase.functions.invoke('generate-badge-pdf')` |
| `POST /registrations/sendEmailEBadge/:id` | `supabase.functions.invoke('send-badge-email')` |

- [ ] Créer Edge Function `generate-qr` : retourne PNG QR chiffré
- [ ] Créer Edge Function `generate-badge-pdf` : retourne PDF badge complet
- [ ] Créer Edge Function `send-badge-email` : envoie email via Brevo
- [ ] QR contient token chiffré AES-256 (clé dans Supabase Vault uniquement)

#### A.5 Notifications push
- [ ] Créer un nouveau projet Firebase pour Urbacom
- [ ] Générer nouveaux `google-services.json` (Android) et `GoogleService-Info.plist` (iOS)
- [ ] Mettre à jour `firebase_options.dart` dans Flutter
- [ ] Créer Edge Function `send-push` : envoie notification FCM depuis Supabase
- [ ] Tester notification sur Android réel
- [ ] Tester notification sur iPhone réel

---

## PHASE B — Branding SIB + Multi-événements
**Durée estimée** : 1-2 semaines  
**Priorité** : 🔴 CRITIQUE

### Objectif
L'app affiche le branding du salon concerné dynamiquement. Un seul binaire pour tous les salons.

### Tâches techniques

#### B.1 Suppression du branding UrbaEvent
- [ ] Remplacer `com.urbaevent` par `ma.urbacom.app` (package name)
- [ ] Renommer l'app : "Urbacom Events" (nom générique) ou "SIB 2026" (spécifique)
- [ ] Supprimer toutes les références `UrbaEvent`, `BTP-EXPO.jpg`, `btp-expo.ma`
- [ ] Supprimer le logo UrbaEvent (splash screen, icône app)
- [ ] Remplacer les couleurs hardcodées `ThemeColor` par des couleurs dynamiques

#### B.2 Thème dynamique par salon
- [ ] Au login, l'app charge le salon actif depuis Supabase (`events WHERE enabled = true`)
- [ ] `ThemeColor.colorAccent` chargé depuis `event.theme_color` en BDD
- [ ] Logo du salon chargé depuis `event.logo_url`
- [ ] Nom du salon dans la toolbar chargé depuis `event.name`
- [ ] Splash screen dynamique par salon (ou logo Urbacom générique)

#### B.3 Sélecteur de salon dans l'app
- [ ] Écran de sélection salon : liste de tous les `events WHERE enabled = true`
- [ ] L'utilisateur choisit le salon qui l'intéresse
- [ ] Possibilité de s'inscrire à plusieurs salons
- [ ] L'accueil affiche les salons auxquels l'utilisateur est inscrit en premier

---

## PHASE C — Nouvelles fonctionnalités avancées
**Durée estimée** : 4-6 semaines  
**Priorité** : 🟡 IMPORTANT

### Objectif
Intégrer dans l'app mobile les fonctionnalités avancées de la plateforme SIB web.

#### C.1 Mini-site exposant (WebView)
- [ ] Depuis la liste des exposants dans l'app → bouton "Voir le mini-site"
- [ ] Ouvre un `WebView` Flutter sur `sib.urbacom.ma/exposants/{slug}`
- [ ] Le visiteur peut voir le catalogue, les produits, les contacts de l'exposant
- [ ] Bouton "Prendre RDV" dans la WebView → ouvre le calendrier SIB

#### C.2 Matching B2B dans l'app
- [ ] Nouvel onglet "Match" dans la barre de navigation
- [ ] Affiche les recommandations IA (depuis Supabase, même logique que SIB web)
- [ ] Cards avec : nom, poste, société, score de compatibilité, secteur
- [ ] Action : "Demander RDV" → inscription dans la table `b2b_meetings`
- [ ] Action : "Ignorer" → ne plus montrer ce profil

#### C.3 Programme conférences enrichi
- [ ] Affichage du programme par jour (onglets jours)
- [ ] Filtres par thème, salle, langue
- [ ] Ajout d'une conférence à son planning personnel
- [ ] Rappel push 30 min avant la conférence
- [ ] Fiche conférencier avec photo et bio

#### C.4 Annuaire exposants enrichi
- [ ] Recherche par nom, produit, secteur
- [ ] Filtre par pavillon/hall
- [ ] Fiche exposant : logo, description, stan, produits, contacts
- [ ] Bouton "Scanner badge exposant" → ajouter en contact
- [ ] Favoris : liste des exposants sauvegardés

#### C.5 Carte interactive du salon
- [ ] Plan du salon zoomable (image haute résolution)
- [ ] Marqueurs des stands exposants
- [ ] Marqueurs des entrées (gates)
- [ ] Marqueurs des espaces thématiques (SIB Academy, SIB TV, etc.)
- [ ] "Trouver mon stand" pour les exposants

#### C.6 Espace VIP
- [ ] Section dédiée aux visiteurs VIP
- [ ] Accès au lounge VIP avec code QR spécial
- [ ] Agenda des rendez-vous VIP
- [ ] Accès aux séances de networking exclusives

---

## PHASE D — Qualité, Tests & Publication
**Durée estimée** : 2-3 semaines  
**Priorité** : 🔴 OBLIGATOIRE avant lancement

### D.1 Tests
- [ ] Tests sur appareils réels Android (min Android 8, Samsung, Xiaomi)
- [ ] Tests sur appareils réels iOS (min iOS 14, iPhone 12+)
- [ ] Test de charge : 1000 utilisateurs simultanés
- [ ] Test sécurité : un utilisateur ne peut pas accéder au badge d'un autre
- [ ] Test scan QR : lecture en < 1 seconde dans conditions normales
- [ ] Test hors connexion : badge accessible sans internet
- [ ] Test notification push : reçue sur les deux plateformes

### D.2 Publication Google Play Store
- [ ] Créer/utiliser compte Google Play Console Urbacom
- [ ] Screenshots Android (phone + tablet)
- [ ] Description en FR, AR, EN
- [ ] Politique de confidentialité (lien depuis le store)
- [ ] Soumission pour review (délai : 1-3 jours)
- [ ] Publication progressive (10% → 50% → 100%)

### D.3 Publication Apple App Store
- [ ] Créer/utiliser compte Apple Developer Urbacom ($99/an)
- [ ] Screenshots iPhone et iPad
- [ ] Description en FR, AR, EN
- [ ] Implémenter Apple Sign-In (obligatoire si Google Sign-In présent)
- [ ] Soumission via Xcode + App Store Connect
- [ ] Review Apple (délai : 1-7 jours)
- [ ] Publication

### D.4 Maintenance post-lancement
- [ ] Monitoring Firebase Crashlytics (crashes temps réel)
- [ ] Sentry pour les erreurs frontend web
- [ ] Alertes Supabase si base de données > 80% capacité
- [ ] Processus de mise à jour : déploiement web immédiat, app mobile via store

---

---

# RÉCAPITULATIF — Planning Global

## Calendrier recommandé

```
Avril 2026
├── Semaine 1-2 : PHASE 1 — Multi-salons + Super Admin (web)
├── Semaine 3   : PHASE A — Migration Flutter Auth + données de base
└── Semaine 4   : PHASE A — Migration badge QR + notifications

Mai 2026
├── Semaine 1   : PHASE B — Branding SIB + thème dynamique
├── Semaine 2   : PHASE 2 — Site corporate urbacom.ma
├── Semaine 3   : PHASE 3 — Déploiement multi-sous-domaines
└── Semaine 4   : Tests Phase 1+2+3+A+B

Juin 2026
├── Semaine 1-3 : PHASE C — Fonctionnalités avancées app mobile
└── Semaine 4   : PHASE D — Tests finaux + soumission stores

Juillet 2026
└── Publication App Store + Google Play
    + Lancement urbacom.ma

Novembre 2026
└── SIB 2026 — 25-29 Novembre, El Jadida
    (plateforme + app mobile opérationnelles)
```

---

## Budget de développement estimé

| Phase | Projet | Effort | Description |
|---|---|---|---|
| Phase 1 | Web | 15 jours | Multi-salons + Super Admin |
| Phase 2 | Web | 10 jours | Site urbacom.ma |
| Phase 3 | Web | 5 jours | Déploiement multi-domaines |
| Phase 4 | Web | En continu | Améliorations |
| Phase A | Mobile | 20 jours | Migration Flutter → Supabase |
| Phase B | Mobile | 10 jours | Branding + multi-événements |
| Phase C | Mobile | 25 jours | Fonctionnalités avancées |
| Phase D | Mobile | 15 jours | Tests + publication stores |
| **TOTAL** | | **~100 jours/homme** | |

---

## Critères de succès

### Pour la plateforme web
- [ ] Un salon peut être créé en moins de 10 minutes depuis l'admin
- [ ] Les données de deux salons différents sont 100% isolées
- [ ] Le Super Admin voit les statistiques de tous les salons en temps réel
- [ ] urbacom.ma est indexé Google et charge en < 2 secondes

### Pour l'application mobile
- [ ] L'app est disponible sur App Store ET Google Play
- [ ] Scan d'un badge QR en moins de 1 seconde
- [ ] Badge accessible hors connexion
- [ ] Zéro crash sur les scénarios principaux (inscription, badge, scan)
- [ ] Push notification reçue en moins de 30 secondes
- [ ] Branding 100% Urbacom/SIB (aucune référence UrbaEvent)

---

## Dépendances critiques

| Dépendance | Impact | Responsable |
|---|---|---|
| Compte Apple Developer ($99/an) | Bloque publication iOS | Urbacom |
| Compte Google Play Console ($25 unique) | Bloque publication Android | Urbacom |
| Domaine urbacom.ma + sous-domaines | Bloque déploiement | Urbacom |
| Décision nom de l'app mobile | Bloque Phase B | Urbacom + Client |
| Accès serveur production actuel | Migration données | Équipe tech |

---

*Document créé le 13 Avril 2026 — à mettre à jour à chaque phase complétée*
