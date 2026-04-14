# ✅ CHECKLIST DE DÉPLOIEMENT SIB 2026

## 📋 PARTIE 1 : SUPABASE (Backend)

### Création du Projet
- [ ] Compte Supabase créé sur https://supabase.com
- [ ] Nouveau projet créé
- [ ] Nom du projet : `SIB-2026-prod`
- [ ] Région sélectionnée : Europe West (ou proche de vos utilisateurs)
- [ ] Mot de passe database sauvegardé de manière sécurisée

### Base de Données
- [ ] SQL Editor ouvert
- [ ] Migrations exécutées (schéma de base de données)
- [ ] Tables créées et visibles dans Table Editor
- [ ] Row Level Security (RLS) activé sur toutes les tables
- [ ] Policies de sécurité créées pour chaque table
- [ ] Test : `SELECT * FROM exhibitors LIMIT 5;` fonctionne

### Storage (Fichiers)
- [ ] Bucket `exhibitor-logos` créé (Public)
- [ ] Bucket `event-images` créé (Public)
- [ ] Bucket `user-avatars` créé (Public)
- [ ] Bucket `documents` créé (Private)
- [ ] Policies de storage configurées (upload/read)
- [ ] Test : Upload d'un fichier réussi

### Authentication
- [ ] Email provider activé
- [ ] Google provider configuré (optionnel)
- [ ] Email templates personnalisés
- [ ] URLs de redirection configurées :
  - [ ] `http://localhost:5173`
  - [ ] `https://votre-app.railway.app`
- [ ] Utilisateur de test créé

### Clés API
- [ ] Project URL copié : `https://xxxxx.supabase.co`
- [ ] anon/public key copié (pour Railway)
- [ ] service_role key sauvegardé de manière sécurisée
- [ ] ⚠️ service_role key JAMAIS dans le frontend

---

## 🚂 PARTIE 2 : RAILWAY (Frontend)

### Création du Projet
- [ ] Compte Railway créé sur https://railway.app
- [ ] GitHub autorisé
- [ ] Nouveau projet créé : "Deploy from GitHub repo"
- [ ] Repository sélectionné : `epitaphe360/SIB 2026`
- [ ] Branche sélectionnée : `main` (ou votre branche de prod)

### Variables d'Environnement

#### Supabase (OBLIGATOIRE)
- [ ] `VITE_SUPABASE_URL` configuré
- [ ] `VITE_SUPABASE_ANON_KEY` configuré

#### Firebase (si utilisé)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

#### Secrets API
- [ ] `EXHIBITORS_SECRET` généré avec `openssl rand -hex 32`
- [ ] `METRICS_SECRET` généré avec `openssl rand -hex 32`
- [ ] `JWT_SECRET` généré avec `openssl rand -hex 64`

#### Configuration
- [ ] `VITE_APP_URL` = URL de votre app Railway
- [ ] `NODE_ENV` = `production`

### Vérification Configuration
- [ ] `railway.json` présent dans le repo ✅
- [ ] `nixpacks.toml` présent avec Node.js 20 ✅
- [ ] `.nixpacksignore` présent ✅
- [ ] `package.json` engines: `"node": ">=20.19.0"` ✅
- [ ] `vite.config.ts` port dynamique ✅

### Déploiement
- [ ] Build automatique déclenché
- [ ] Logs surveillés en temps réel
- [ ] Build réussi sans erreurs
- [ ] Déploiement terminé (statut: ✅ Success)
- [ ] URL de production obtenue : `https://xxxxx.up.railway.app`

---

## 🧪 PARTIE 3 : TESTS POST-DÉPLOIEMENT

### Tests Backend (Supabase)
- [ ] Accès à la base de données depuis l'app Railway
- [ ] Création d'utilisateur fonctionne
- [ ] Login fonctionne
- [ ] Upload de fichier fonctionne
- [ ] Download de fichier fonctionne
- [ ] Requêtes API REST fonctionnent

### Tests Frontend (Railway)
- [ ] Page d'accueil s'affiche
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Login/Register fonctionnent
- [ ] Liste des exposants charge les données
- [ ] Images s'affichent depuis Supabase Storage
- [ ] Recherche fonctionne
- [ ] Filtres fonctionnent
- [ ] Navigation entre les pages fonctionne

### Tests Responsive
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

### Tests Fonctionnels
- [ ] Création d'événement (si admin)
- [ ] Prise de rendez-vous
- [ ] Chat/messagerie
- [ ] Networking/recommandations
- [ ] Profil utilisateur modifiable
- [ ] Déconnexion fonctionne

---

## 🌐 PARTIE 4 : DOMAINE PERSONNALISÉ (Optionnel)

### Railway
- [ ] Domaine ajouté dans Settings → Domains
- [ ] Enregistrement CNAME reçu de Railway

### Registrar (Namecheap, GoDaddy, etc.)
- [ ] DNS Settings ouvert
- [ ] Enregistrement CNAME ajouté
- [ ] Propagation DNS vérifiée (24-48h max)
- [ ] HTTPS activé automatiquement par Railway

### Supabase
- [ ] Domaine personnalisé ajouté dans Authentication → URL Configuration
- [ ] Redirections testées

---

## 📊 PARTIE 5 : MONITORING

### Supabase Metrics
- [ ] Database Size < 80% de la limite
- [ ] Storage Size < 80% de la limite
- [ ] Active Connections OK
- [ ] Monthly Active Users < limite

### Railway Metrics
- [ ] Memory Usage < 80%
- [ ] CPU Usage < 80%
- [ ] Build Success Rate = 100%
- [ ] Response Time < 2s

### Alertes
- [ ] Alertes email configurées sur Supabase
- [ ] Notifications GitHub configurées sur Railway

---

## 🔒 PARTIE 6 : SÉCURITÉ

### Secrets
- [ ] Tous les secrets générés avec `openssl`
- [ ] Aucun secret dans le code source
- [ ] Aucun secret dans les commits Git
- [ ] `.env` dans `.gitignore`

### Supabase
- [ ] RLS activé sur TOUTES les tables
- [ ] Policies testées (utilisateur ne peut pas accéder aux données d'un autre)
- [ ] service_role key JAMAIS exposée au frontend
- [ ] CORS configuré correctement

### Railway
- [ ] Variables d'environnement jamais loggées
- [ ] HTTPS activé (automatique)
- [ ] Domaine sécurisé

---

## 📝 PARTIE 7 : DOCUMENTATION

### Interne
- [ ] URLs de production documentées
- [ ] Credentials sauvegardés dans un gestionnaire de mots de passe (1Password, Bitwarden)
- [ ] Guide de déploiement partagé avec l'équipe
- [ ] Accès Supabase partagé avec l'équipe
- [ ] Accès Railway partagé avec l'équipe

### Utilisateurs
- [ ] Guide utilisateur créé
- [ ] FAQ créée
- [ ] Support configuré (email, chat)

---

## 🎯 RÉSUMÉ

### ✅ Backend (Supabase)
```
✅ Projet créé
✅ Database configurée
✅ Storage configuré
✅ Auth configurée
✅ Clés API obtenues
```

### ✅ Frontend (Railway)
```
✅ Projet créé
✅ Variables configurées
✅ Build réussi
✅ Déploiement réussi
✅ App accessible
```

### ✅ Tests
```
✅ Backend testé
✅ Frontend testé
✅ Responsive testé
✅ Fonctionnalités testées
```

### ✅ Production
```
✅ Monitoring configuré
✅ Sécurité vérifiée
✅ Documentation créée
✅ PRÊT POUR LA PRODUCTION ! 🚀
```

---

## 🆘 EN CAS DE PROBLÈME

### Problème : Build failed sur Railway
**Solution :**
1. Vérifier les logs : Deployments → View Logs
2. Vérifier Node.js version = 20 dans `nixpacks.toml`
3. Vérifier variables d'environnement

### Problème : Supabase connection failed
**Solution :**
1. Vérifier `VITE_SUPABASE_URL` dans Railway
2. Vérifier `VITE_SUPABASE_ANON_KEY` dans Railway
3. Tester la connexion en local d'abord

### Problème : Images ne chargent pas
**Solution :**
1. Vérifier Storage policies dans Supabase
2. Vérifier que le bucket est Public
3. Vérifier l'URL des images dans le code

### Problème : 502 Bad Gateway
**Solution :**
1. Railway → Logs → Vérifier les erreurs
2. Vérifier que l'app écoute sur `process.env.PORT`
3. Redéployer si nécessaire

---

## 📞 SUPPORT

- **Supabase Docs :** https://supabase.com/docs
- **Railway Docs :** https://docs.railway.app
- **Guide complet :** `/deployment/GUIDE_DEPLOIEMENT_COMPLET.md`
- **Variables template :** `/deployment/railway.env.template`

---

**Dernière mise à jour :** Novembre 2024
**Version :** 1.0
**Projet :** SIB 2026
