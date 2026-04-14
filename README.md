# 🏗️ SIB 2026 — Plateforme Digitale du Salon International du Bâtiment

Écosystème digital complet pour le **SIB 2026** — 20ème édition du Salon International du Bâtiment.  
**Date** : 25-29 Novembre 2026 | **Lieu** : Parc d'Exposition Mohammed VI, El Jadida, Maroc

---

## 📦 Structure du Projet

```
Sib/
├── src/               ← Application web React (déployée sur Vercel)
├── server/            ← API Express (déployée sur Railway)
├── supabase/          ← Migrations, Edge Functions, policies RLS
├── migrations/        ← Scripts SQL de migration
├── urbaevent/         ← Application mobile Flutter (APK Android / iOS)
├── public/            ← Assets statiques (favicon, manifest, images)
└── docs/              ← Documentation technique
```

---

## 🛠️ Stack Technique

### Web (sib2026.vercel.app)
| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Vite 6 |
| Styles | TailwindCSS + shadcn/ui |
| État global | Zustand |
| Routing | React Router v6 |
| Internationalisation | Français / Anglais / Arabe |
| Animations | Framer Motion |

### Backend
| Couche | Technologie |
|--------|-------------|
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Firebase OAuth (Google) |
| Stockage fichiers | Supabase Storage |
| API serveur | Express.js (Node.js) sur Railway |
| Sécurité | RLS Supabase + reCAPTCHA v3 |
| Paiements | Stripe + PayPal + Virement bancaire |
| Notifications | Firebase Cloud Messaging (FCM) |

### Mobile (Flutter)
| Couche | Technologie |
|--------|-------------|
| Framework | Flutter (Dart) |
| Backend mobile | Supabase Flutter SDK v2.5.9 |
| Auth mobile | Firebase Auth |
| Navigation | MaterialPageRoute classique |
| i18n | flutter_intl (FR / EN) |

---

## 🚀 Installation — Application Web

### Prérequis
```
Node.js >= 18.x
npm >= 9.x
```

### 1. Cloner et installer
```bash
git clone https://github.com/epitaphe360/Sib.git
cd Sib
npm install
```

### 2. Variables d'environnement
Créer `.env.local` à la racine :
```env
VITE_SUPABASE_URL=https://sbyizudifmqakzxjlndr.supabase.co
VITE_SUPABASE_ANON_KEY=<votre_anon_key>
VITE_FIREBASE_API_KEY=<votre_firebase_key>
VITE_FIREBASE_AUTH_DOMAIN=<projet>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<projet>
VITE_FIREBASE_STORAGE_BUCKET=<projet>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<id>
VITE_FIREBASE_APP_ID=<app_id>
VITE_SHOW_DEMO_LOGINS=true
```

### 3. Lancer en développement
```bash
npm run dev
# → http://localhost:9324/
```

### 4. Build de production
```bash
npm run build
# → dist/ (servi par Vercel)
```

---

## 📱 Installation — Application Mobile Flutter

### Prérequis
```
Flutter SDK >= 3.x  (https://flutter.dev/docs/get-started/install)
Android Studio + SDK Android (pour APK)
Xcode 15+ (pour iOS — macOS requis)
```

### Dossier de l'app
```
urbaevent/aeon360-urbaevent-app-60ed3e217dce/aeon360-urbaevent-app-60ed3e217dce/
```

### 1. Récupérer les dépendances
```bash
cd urbaevent/aeon360-urbaevent-app-60ed3e217dce/aeon360-urbaevent-app-60ed3e217dce
flutter pub get
```

### 2. Configuration Supabase (mobile)
Dans `lib/SupabaseConfig.dart` :
```dart
static const String supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
static const String supabaseAnonKey = '<votre_anon_key>';
```

### 3. Build APK Android (release)
```bash
flutter build apk --release
# APK généré : build/app/outputs/flutter-apk/app-release.apk  (~75 MB)
```

### 4. Build iOS (nécessite macOS + Xcode)
```bash
flutter build ios --release
# Puis ouvrir ios/Runner.xcworkspace dans Xcode pour archiver
```

### 5. Lancer en mode debug
```bash
flutter run
```

### APK précompilé
Le dernier APK release est disponible dans :
```
Application apk ios/SIB-release.apk
```

---

## 🗄️ Base de Données (Supabase)

**Projet Supabase** : `sbyizudifmqakzxjlndr`  
**URL** : `https://sbyizudifmqakzxjlndr.supabase.co`

### Tables principales
| Table | Description |
|-------|-------------|
| `users` | Comptes utilisateurs (visiteurs, exposants, partenaires, admins) |
| `exhibitors` | Exposants avec profil et mini-site |
| `partners` | Partenaires avec niveaux (organizer, co_organizer, official_sponsor…) |
| `events` | Événements / programme du salon |
| `appointments` | Rendez-vous B2B entre participants |
| `messages` | Messagerie interne |
| `news` / `articles` | Actualités et articles de blog |
| `pavilions` | Pavillons thématiques du salon |
| `salons` | Multi-salons (SIB, SIR, SIP, BTP, SIE) |
| `media_content` | Contenus médias (vidéos, podcasts, webinars) |
| `badges` | Badges digitaux des participants |
| `notifications` | Notifications push |

### Appliquer les migrations
```bash
# Via Supabase CLI
npx supabase db push

# Ou directement dans le SQL Editor de l'interface Supabase
# → migrations/*.sql
```

### Migration multi-salons
Pour ajouter les 4 salons partenaires (SIR, SIP, BTP, SIE) :
```bash
# Exécuter dans le SQL Editor Supabase :
migrations/add_other_salons.sql
```

### Sécurité RLS
Toutes les tables utilisent **Row Level Security (RLS)**.  
Voir `INSTRUCTIONS_MIGRATIONS_RLS.txt` pour les politiques détaillées.

---

## 🌐 Déploiement

### Web — Vercel
- **URL production** : https://sib2026.vercel.app
- **Branche** : `main` → déploiement automatique
- **Config** : `vercel.json`
- **Build** : `npm run build` → `dist/`

### API — Railway
- **URL** : https://sib-production.up.railway.app
- **Branche** : `main`
- **Config** : `nixpacks.toml` + `railway.json`
- **Démarrage** : `node server.js`

```bash
# Variables Railway à configurer :
NODE_ENV=production
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
EMAIL_HOST=...
EMAIL_USER=...
EMAIL_PASS=...
```

---

## 🏠 Pages de l'Application Web

### Pages Publiques
| Route | Page |
|-------|------|
| `/` | Accueil avec compteur à rebours |
| `/presentation` | Présentation du salon |
| `/nouveautes` | Nouveautés 2026 |
| `/secteurs` | Secteurs du bâtiment |
| `/editions` | Historique des éditions |
| `/telechargements` | Documents à télécharger |
| `/events` | Programme & événements |
| `/news` | Actualités |
| `/contacts` | Contact |
| `/support` | FAQ & Support |
| `/map` | Plan du salon |
| `/catalog` | Catalogue produits |
| `/speakers` | Intervenants |
| `/pavilions` | Pavillons thématiques |

### Espace Visiteur
| Route | Page |
|-------|------|
| `/pourquoi-visiter` | Pourquoi visiter |
| `/infos-pratiques` | Informations pratiques |
| `/register/visitor` | Inscription visiteur gratuit |
| `/visitor/register/vip` | Inscription visiteur VIP |
| `/visitor/dashboard` | Tableau de bord visiteur |
| `/appointments` | Mes rendez-vous |
| `/networking` | Réseautage B2B |
| `/matching/advanced` | Matching IA avancé |
| `/badge/digital` | Mon badge digital |
| `/visitor/visa-letter` | Lettre de visa |

### Espace Exposant
| Route | Page |
|-------|------|
| `/pourquoi-exposer` | Pourquoi exposer |
| `/espaces` | Espaces du salon |
| `/register/exhibitor` | Inscription exposant |
| `/exhibitor/subscription` | Abonnement exposant |
| `/exhibitor/dashboard` | Tableau de bord exposant |
| `/exhibitor/profile` | Profil exposant |
| `/minisite/editor` | Éditeur mini-site |
| `/minisites` | Annuaire mini-sites |
| `/exhibitors` | Liste exposants |

### Espace Partenaire
| Route | Page |
|-------|------|
| `/partners` | Annuaire partenaires |
| `/register/partner` | Inscription partenaire |
| `/partner/subscription` | Abonnement partenaire |
| `/partner/dashboard` | Tableau de bord partenaire |
| `/partner/media/upload` | Upload médias partenaire |
| `/partner/media/analytics` | Analytics médias |

### Espace Admin
| Route | Page |
|-------|------|
| `/admin/dashboard` | Tableau de bord admin |
| `/admin/users` | Gestion utilisateurs |
| `/admin/exhibitors` | Gestion exposants |
| `/admin/partners-manage` | Gestion partenaires |
| `/admin/events` | Gestion événements |
| `/admin/news` | Gestion actualités |
| `/admin/validation` | Validation comptes |
| `/admin/payment-validation` | Validation paiements |
| `/admin/moderation` | Modération contenu |
| `/admin/media/manage` | Gestion médias |
| `/admin/press-accreditations` | Accréditations presse |
| `/admin/speakers` | Gestion intervenants |
| `/security/scanner` | Scanner QR (sécurité) |
| `/badge/print-station` | Impression badges |

### Médias
| Route | Page |
|-------|------|
| `/media` | Bibliothèque médias |
| `/media/webinars` | Webinaires |
| `/media/podcasts` | Podcasts SIB Talks |
| `/media/inside-sib` | Capsules Inside SIB |
| `/media/live-studio` | Meet The Leaders |
| `/media/best-moments` | Meilleurs moments |
| `/media/testimonials` | Témoignages vidéo |

### Multi-Salons (UrbaEvent)
| Route | Page |
|-------|------|
| `/salons` | Sélection des salons UrbaEvent |
| `/salon/sir` | Salon International de l'Immobilier |
| `/salon/sip` | Salon International de la Promotion |
| `/salon/btp` | Salon International du BTP |
| `/salon/sie` | Salon International de l'Environnement |

---

## 📱 Écrans de l'Application Mobile Flutter

| Écran | Fichier | Description |
|-------|---------|-------------|
| Connexion | `SignIn.dart` | Login email/mot de passe |
| Inscription | `SignUp.dart` + `SignUpStep2.dart` | Inscription en 2 étapes |
| Accueil | `HomePage.dart` | Dashboard visiteur |
| Accueil agent | `AgentHomepage.dart` | Dashboard agent/staff |
| Liste salons | `SalonListPage.dart` | Sélection du salon actif |
| Événements | `MyEvents.dart` / `EventDetails.dart` | Programme + détails |
| Conférences | `ConferenceList.dart` / `Conference.dart` | Liste conférences |
| Mon planning | `MySchedule.dart` | Planning personnel |
| Contacts | `MyContact.dart` / `Associate.dart` | Réseau de contacts |
| Scanner QR | `MyScan.dart` / `MyScans.dart` | Scan badge / vérification |
| Badge digital | `EBadge.dart` / `EBadgeDetails.dart` | Badge numérique |
| Notifications | `NotificationList.dart` | Centre de notifications |
| Profil | `Profile.dart` / `ProfileInformation.dart` | Profil utilisateur |
| Plan du salon | `Plan.dart` | Carte interactive |
| Portails | `PortalList.dart` / `Portal.dart` | Accès zone / portail |
| Préférences | `Preference.dart` | Paramètres |

---

## 🔌 Branchement Base de Données

### Supabase (Web + Mobile)
```typescript
// Web (src/lib/supabase.ts)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

```dart
// Mobile (lib/SupabaseConfig.dart)
await Supabase.initialize(
  url: SupabaseConfig.supabaseUrl,
  anonKey: SupabaseConfig.supabaseAnonKey,
);
```

### Firebase (Auth + Push)
```typescript
// Web (src/lib/firebase.ts)
initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  ...
})
```

```dart
// Mobile (lib/main.dart)
await Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform,
);
```

---

## 👥 Rôles Utilisateurs

| Rôle | Accès |
|------|-------|
| `visitor` (free) | Pages publiques + networking limité |
| `visitor` (VIP) | Toutes les fonctionnalités visiteur |
| `exhibitor` | Dashboard exposant + mini-site + matchmaking |
| `partner` | Dashboard partenaire + analytics + médias |
| `admin` | Accès total + gestion plateforme |
| `marketing` | Dashboard marketing + CMS |

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E Playwright
npm run test:e2e

# Tests E2E en mode UI
npx playwright test --ui
```

---

## 📚 Documentation Complémentaire

- [Guide Déploiement Complet](deployment/GUIDE_DEPLOIEMENT_COMPLET.md)
- [Setup Railway](deployment/RAILWAY_SETUP.md)
- [Migrations RLS](INSTRUCTIONS_MIGRATIONS_RLS.txt)
- [Intégration Médias](docs/MEDIA_FEATURES_INTEGRATION.md)
- [Guide Stockage](docs/STORAGE_GUIDE.md)
- [Auth Google Setup](docs/GOOGLE_AUTH_SETUP.md)
- [Cahier des Charges](docs/CAHIER_CHARGES_APP_SIB.md)

---

## 📊 Statistiques

- ✅ **130+ pages/écrans** (web + mobile)
- ✅ **5 salons** dans l'écosystème UrbaEvent
- ✅ **5 rôles** utilisateurs avec RLS
- ✅ **Bilingue** FR / EN (+ AR partiel)
- ✅ **PWA** avec Service Worker
- ✅ **APK Android** release disponible (~75 MB)
- ✅ **Push notifications** FCM (web + mobile)

---

## 🎯 Fonctionnalités Clés

### 🎬 Média & Contenu
- ✅ Webinaires en replay
- ✅ Podcasts SIB Talks
- ✅ Capsules vidéo Inside
- ✅ Interviews Live Studio
- ✅ Best Moments du salon
- ✅ Témoignages partenaires
- ✅ Bibliothèque média centralisée

### 🤝 Networking
- ✅ Profils professionnels
- ✅ Messagerie instantanée
- ✅ Salles de visioconférence
- ✅ Recommandations IA

### 📅 Événements
- ✅ Calendrier interactif
- ✅ Inscriptions en ligne
- ✅ Badges virtuels
- ✅ Check-in QR code

### 💼 Business
- ✅ Abonnements partenaires
- ✅ Packages sponsoring
- ✅ Analytics et reporting
- ✅ ROI tracking

---

## 📖 Documentation Complète

| Document | Description |
|----------|-------------|
| [README_MEDIA_ENRICHMENT.md](README_MEDIA_ENRICHMENT.md) | Index du contenu média |
| [QUICKSTART_MEDIA.md](QUICKSTART_MEDIA.md) | Démarrage rapide (3 étapes) |
| [GUIDE_MEDIA_CONTENT.md](GUIDE_MEDIA_CONTENT.md) | Guide complet d'utilisation |
| [MEDIA_CONTENT_ENRICHMENT.md](MEDIA_CONTENT_ENRICHMENT.md) | Détails techniques |
| [MEDIA_INTEGRATION_COMPLETE.md](MEDIA_INTEGRATION_COMPLETE.md) | État de l'intégration |

---

## 🧪 Tests

```bash
# Tests E2E complets
npm run test:e2e

# Tests E2E média uniquement
npm run test:e2e -- media

# Tests avec UI
npm run test:e2e:ui
```

---

## 🚀 Déploiement

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

### Avec Docker
```bash
docker-compose up
```

---

## 📝 Scripts Utiles

```bash
# Appliquer le contenu média
.\apply-media-content.ps1

# Reset base de données
npx supabase db reset

# Générer les types TypeScript
npm run types:generate

# Linter & Formatter
npm run lint
npm run format
```

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation
- Ouvrir une issue GitHub
- Contacter l'équipe SIB

---

## 🎉 Remerciements

- Équipe SIB
- Contributeurs open-source
- Communauté du bâtiment et de la construction

---

**Développé avec ❤️ pour le secteur maritime africain** 🌍⚓

---

*Dernière mise à jour : 22 décembre 2025*
