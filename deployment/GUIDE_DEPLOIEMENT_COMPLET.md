# 🚀 GUIDE DE DÉPLOIEMENT COMPLET - SIB 2026

## 📋 Architecture de Déploiement

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEURS                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              RAILWAY (Frontend)                         │
│  - Application React/Vite                               │
│  - Port dynamique                                       │
│  - URL: https://votre-app.railway.app                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              SUPABASE (Backend)                         │
│  - Base de données PostgreSQL                           │
│  - Authentication                                       │
│  - Storage (fichiers)                                   │
│  - API REST auto-générée                                │
└─────────────────────────────────────────────────────────┘
```

---

# PARTIE 1 : DÉPLOIEMENT SUPABASE (Backend)

## ⚙️ Étape 1.1 : Créer un Projet Supabase

### 1. Aller sur Supabase

🌐 **URL :** https://supabase.com

### 2. Créer un Compte

- Cliquez sur **"Start your project"**
- Connectez-vous avec **GitHub** (recommandé) ou **Email**

### 3. Créer un Nouveau Projet

Cliquez sur **"New Project"** et remplissez :

```
Nom du projet : SIB-2026-prod
Organisation : [Votre organisation]
Database Password : [Générez un mot de passe fort]
Région : Europe West (Frankfurt) ou la plus proche de vos utilisateurs
Plan : Free (pour commencer) ou Pro (production)
```

⏱️ **Attendre 2-3 minutes** que le projet soit créé.

---

## 🗄️ Étape 1.2 : Importer le Schéma de Base de Données

### 1. Accéder au SQL Editor

Dans Supabase Dashboard :
- Menu de gauche → **SQL Editor**
- Cliquez sur **"New query"**

### 2. Exécuter les Migrations

Vous avez probablement des fichiers de migration dans votre projet. Exécutez-les dans l'ordre :

```bash
# Localement, vérifier les fichiers de migration
ls -la /home/user/SIB 2026/supabase/migrations/
```

**Dans Supabase SQL Editor**, copiez-collez le contenu de chaque migration :

```sql
-- Exemple de tables principales SIB
-- (Adaptez selon vos migrations réelles)

-- Table users (souvent déjà créée par Supabase Auth)
-- Table exhibitors
-- Table events
-- Table appointments
-- Table messages
-- Table mini_sites
-- etc.
```

### 3. Activer Row Level Security (RLS)

Pour chaque table, activez la sécurité :

```sql
-- Exemple pour la table exhibitors
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir tous les exposants
CREATE POLICY "Allow public read access"
ON exhibitors FOR SELECT
USING (true);

-- Politique : Seuls les admins peuvent modifier
CREATE POLICY "Allow admin write access"
ON exhibitors FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
```

### 4. Configurer Storage (Fichiers)

**Pour les logos d'exposants, photos, etc. :**

1. Menu de gauche → **Storage**
2. Créer les buckets :

```
exhibitor-logos    (Public)
event-images       (Public)
user-avatars       (Public)
documents          (Private)
```

3. Configurer les politiques d'accès :

```sql
-- Exemple : Permettre l'upload de logos aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exhibitor-logos');

-- Lecture publique des logos
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exhibitor-logos');
```

---

## 🔐 Étape 1.3 : Configurer l'Authentication

### 1. Activer les Providers

Menu de gauche → **Authentication** → **Providers**

Activez :
- ✅ **Email** (activé par défaut)
- ✅ **Google** (optionnel - pour login Google)
- ✅ **GitHub** (optionnel)

### 2. Configuration Email

**Authentication** → **Email Templates**

Personnalisez les templates :
- Confirmation Email
- Magic Link
- Reset Password
- Invite User

### 3. URL de Redirection

**Authentication** → **URL Configuration**

Ajoutez vos URLs autorisées :
```
http://localhost:5173          (développement)
https://votre-app.railway.app  (production)
https://votre-domaine.com      (si domaine personnalisé)
```

---

## 📊 Étape 1.4 : Récupérer les Clés API

### Aller dans Settings → API

Vous aurez besoin de :

```bash
# Project URL
https://xxxxxxxxxxxxxxxx.supabase.co

# anon/public key (clé publique - safe pour le frontend)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...

# service_role key (clé secrète - JAMAIS exposer au frontend)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
```

⚠️ **IMPORTANT :**
- `anon key` → Utilisée dans le frontend (Railway)
- `service_role key` → Utilisée UNIQUEMENT dans les scripts backend/admin

---

## ✅ Vérification Supabase

Testez votre configuration :

1. **Database** → **Table Editor** → Vérifier que les tables sont créées
2. **Authentication** → **Users** → Créer un utilisateur de test
3. **Storage** → Uploader un fichier de test
4. **SQL Editor** → Tester une requête simple :

```sql
SELECT * FROM exhibitors LIMIT 5;
```

---

# PARTIE 2 : DÉPLOIEMENT RAILWAY (Frontend)

## 🚂 Étape 2.1 : Créer un Projet Railway

### 1. Aller sur Railway

🌐 **URL :** https://railway.app

### 2. Créer un Compte

- Cliquez sur **"Login"**
- Connectez-vous avec **GitHub** (recommandé)

### 3. Créer un Nouveau Projet

1. Cliquez sur **"New Project"**
2. Sélectionnez **"Deploy from GitHub repo"**
3. Autorisez Railway à accéder à vos repos GitHub
4. Sélectionnez : **epitaphe360/SIB 2026**
5. Sélectionnez la branche : **main** (ou votre branche de production)

---

## ⚙️ Étape 2.2 : Configurer les Variables d'Environnement

### 1. Accéder aux Variables

Dans Railway Dashboard :
- Cliquez sur votre projet
- Onglet **"Variables"**
- Cliquez sur **"New Variable"**

### 2. Ajouter TOUTES les Variables

Copiez les clés Supabase obtenues à l'Étape 1.4 :

```bash
# ============================================
# SUPABASE (OBLIGATOIRE)
# ============================================
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# FIREBASE (Si vous utilisez Firebase)
# ============================================
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxx

# ============================================
# SECRETS API (Générez avec openssl)
# ============================================
EXHIBITORS_SECRET=générez_avec_openssl_rand_hex_32
METRICS_SECRET=générez_avec_openssl_rand_hex_32
JWT_SECRET=générez_avec_openssl_rand_hex_64

# ============================================
# CONFIGURATION
# ============================================
VITE_APP_URL=https://votre-app.railway.app
NODE_ENV=production
```

### 3. Générer les Secrets

**Sur votre machine locale :**

```bash
# Générer un secret de 32 caractères
openssl rand -hex 32

# Générer un secret de 64 caractères
openssl rand -hex 64
```

Copiez-collez les résultats dans Railway.

---

## 🔧 Étape 2.3 : Vérifier la Configuration

### 1. Fichiers Railway Déjà Configurés ✅

Votre projet contient déjà :

```
✅ railway.json       → Configuration Railway
✅ nixpacks.toml      → Build avec Node.js 20
✅ .nixpacksignore    → Exclusions de fichiers
✅ .dockerignore      → Optimisations Docker
✅ package.json       → engines: Node 20+
✅ vite.config.ts     → Port dynamique
```

### 2. Vérifier le Build Command

Railway détectera automatiquement :
- **Build Command :** `npm run build`
- **Start Command :** `npm run preview`
- **Port :** Dynamique (process.env.PORT)

---

## 🚀 Étape 2.4 : Déployer !

### 1. Déclencher le Déploiement

Railway va **automatiquement** :
1. Cloner votre repo GitHub
2. Installer Node.js 20
3. Exécuter `npm ci`
4. Exécuter `npm run build`
5. Démarrer `npm run preview`

### 2. Surveiller le Build

Dans Railway Dashboard :
- Onglet **"Deployments"**
- Cliquez sur le déploiement en cours
- Suivez les logs en temps réel

**Build attendu (environ 2-3 minutes) :**

```
✅ Installing Node.js 20.x
✅ npm ci (45s)
✅ npm run build (1m 30s)
   → Vite v6.1.7 building for production...
   → ✓ 2071 modules transformed.
   → ✓ built in 52.5s
✅ Starting preview server
✅ Deployment successful!
```

### 3. Obtenir l'URL de Production

Une fois le déploiement réussi :
- Onglet **"Settings"**
- Section **"Domains"**
- Votre URL : `https://SIB-production-xxxx.up.railway.app`

---

## 🌐 Étape 2.5 : Domaine Personnalisé (Optionnel)

### 1. Configurer le Domaine dans Railway

**Settings** → **Domains** → **Custom Domain**

Ajoutez votre domaine :
```
SIBevent.com
```

Railway vous donnera un enregistrement DNS :
```
Type: CNAME
Name: @
Value: SIB-production-xxxx.up.railway.app
```

### 2. Configurer chez votre Registrar

Allez chez votre registrar (Namecheap, GoDaddy, etc.) :
- DNS Settings
- Ajoutez l'enregistrement CNAME fourni par Railway

### 3. Mettre à Jour Supabase

Retournez dans **Supabase** → **Authentication** → **URL Configuration**

Ajoutez votre domaine personnalisé :
```
https://SIBevent.com
```

---

# PARTIE 3 : VÉRIFICATIONS POST-DÉPLOIEMENT

## ✅ Checklist de Vérification

### 1. Supabase Backend

```bash
☐ Tables créées et visibles dans Table Editor
☐ RLS (Row Level Security) activé sur toutes les tables
☐ Policies créées pour chaque table
☐ Storage buckets créés (exhibitor-logos, etc.)
☐ Authentication configurée
☐ Email templates personnalisés
☐ Utilisateur de test créé
```

### 2. Railway Frontend

```bash
☐ Build réussi sans erreurs
☐ Application accessible via l'URL Railway
☐ Variables d'environnement configurées (25+ variables)
☐ Connexion Supabase fonctionnelle
☐ Login/Register fonctionnent
☐ Images chargent depuis Supabase Storage
```

### 3. Fonctionnalités

Testez votre application :

```bash
☐ Page d'accueil s'affiche correctement
☐ Login avec email/password fonctionne
☐ Création de compte fonctionne
☐ Liste des exposants affiche les données
☐ Création d'événement (si admin)
☐ Upload de fichiers dans Supabase Storage
☐ Recherche fonctionne
☐ Filtres fonctionnent
☐ Responsive design (mobile, tablet, desktop)
```

---

# PARTIE 4 : MAINTENANCE & MONITORING

## 📊 Monitoring Supabase

### Dashboard Supabase

**Metrics à surveiller :**
- **Database** → **Database Size** (limite : 500MB en Free plan)
- **Database** → **Active Connections**
- **Storage** → **Storage Size** (limite : 1GB en Free plan)
- **Auth** → **Monthly Active Users** (limite : 50,000 en Free plan)

### Alertes

Configurez des alertes :
- **Settings** → **Alerts**
- Alertes email si usage > 80%

---

## 📊 Monitoring Railway

### Dashboard Railway

**Metrics à surveiller :**
- **Resources** → **Memory Usage** (limite : 512MB en Free plan)
- **Resources** → **CPU Usage**
- **Deployments** → **Build Success Rate**
- **Metrics** → **Response Time**

### Logs

Accédez aux logs en temps réel :
- Onglet **"Deployments"**
- Cliquez sur le déploiement actif
- **View Logs**

---

## 🔄 Workflow de Déploiement Continu

### Déploiement Automatique

Railway redéploiera automatiquement à chaque push sur la branche `main` :

```bash
# Workflow de développement
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# Railway détecte le push → Build automatique → Déploiement
```

### Rollback en Cas d'Erreur

Si un déploiement échoue :

**Railway Dashboard** → **Deployments** → **Redeploy previous**

---

# PARTIE 5 : SCALING & UPGRADE

## 📈 Quand Upgrader ?

### Supabase Free → Pro

Upgrader quand :
- ✅ > 500MB de données
- ✅ > 1GB de fichiers en Storage
- ✅ > 50,000 utilisateurs actifs/mois
- ✅ Besoin de backups quotidiens
- ✅ Besoin de support prioritaire

**Prix :** $25/mois
**URL :** https://supabase.com/pricing

### Railway Free → Hobby/Pro

Upgrader quand :
- ✅ > 512MB RAM nécessaire
- ✅ > 500 heures d'exécution/mois
- ✅ Besoin de domaine personnalisé
- ✅ Plusieurs environnements (staging, prod)

**Prix :** $5-20/mois
**URL :** https://railway.app/pricing

---

# PARTIE 6 : TROUBLESHOOTING

## 🐛 Problèmes Courants

### 1. "Supabase connection failed"

**Causes possibles :**
- Variables `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` incorrectes
- Région Supabase différente de l'URL configurée

**Solution :**
```bash
# Vérifier les variables dans Railway
# Settings → Variables → Vérifier VITE_SUPABASE_*
```

### 2. "Build failed: exit code 139"

**Cause :** Node.js version incompatible

**Solution :**
```bash
# Vérifier nixpacks.toml
# Doit contenir: nixPkgs = ["nodejs_20"]
```

### 3. "502 Bad Gateway"

**Cause :** Application crash au démarrage

**Solution :**
```bash
# Railway Dashboard → Deployments → View Logs
# Vérifier les erreurs dans les logs
```

### 4. Images ne chargent pas

**Cause :** Storage policies incorrectes

**Solution :**
```sql
-- Supabase → Storage → Policies
-- Vérifier que les buckets ont des policies de lecture publique
```

---

# RÉSUMÉ : ORDRE DE DÉPLOIEMENT

## 🎯 Ordre Recommandé

```
1️⃣ SUPABASE (Backend d'abord)
   ├─ Créer le projet
   ├─ Importer le schéma DB
   ├─ Configurer Storage
   ├─ Configurer Auth
   └─ Récupérer les clés API

2️⃣ RAILWAY (Frontend ensuite)
   ├─ Créer le projet
   ├─ Connecter GitHub
   ├─ Configurer les variables d'environnement (avec clés Supabase)
   ├─ Vérifier la configuration
   └─ Déployer !

3️⃣ VÉRIFICATIONS
   ├─ Tester la connexion Supabase
   ├─ Tester l'authentification
   ├─ Tester les fonctionnalités principales
   └─ Configurer le monitoring
```

---

# 📞 SUPPORT

## Documentation Officielle

- **Supabase :** https://supabase.com/docs
- **Railway :** https://docs.railway.app
- **Vite :** https://vitejs.dev

## Ressources SIB

- **Guide Supabase Local :** `/home/user/SIB 2026/supabase/README.md`
- **Guide Railway :** `/home/user/SIB 2026/deployment/RAILWAY_SETUP.md`
- **Variables Template :** `/home/user/SIB 2026/deployment/railway.env.template`

---

# 🎉 FÉLICITATIONS !

Votre application SIB 2026 est maintenant déployée en production !

```
✅ Backend : Supabase (Database + Auth + Storage)
✅ Frontend : Railway (Application React/Vite)
✅ Déploiement continu configuré
✅ Monitoring en place
```

**Prochaines étapes :**
1. ✅ Ajouter des données de test
2. ✅ Inviter les premiers utilisateurs
3. ✅ Surveiller les métriques
4. ✅ Itérer et améliorer !

**Bon déploiement ! 🚀**
