# 🚂 Guide de Déploiement Railway - SIB2026

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer SIB2026 sur Railway.app.

---

## ✅ Prérequis

- Compte Railway.app (gratuit pour commencer)
- Compte GitHub
- Projet Supabase configuré
- Projet Firebase configuré

---

## 🚀 Étapes de Déploiement

### 1. Créer un nouveau projet Railway

1. Connectez-vous sur [railway.app](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Choisissez le repository **sib-2026**
5. Railway détectera automatiquement `railway.json`

### 2. Configuration Automatique

Railway utilisera automatiquement :
- ✅ **Builder**: Nixpacks
- ✅ **Build Command**: `npm run build` (automatique)
- ✅ **Start Command**: `npm run preview`
- ✅ **Port**: Dynamique via `process.env.PORT`
- ✅ **Node Version**: 22 (requis par Vite v6)
- ✅ **Restart Policy**: ON_FAILURE (10 retries)

### 3. Configurer les Variables d'Environnement

Dans Railway Dashboard → Votre Projet → **Variables**, ajoutez **TOUTES** les variables suivantes :

---

## 🔐 Variables d'Environnement OBLIGATOIRES

### **Supabase Configuration**

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Où trouver ces valeurs ?**
1. Allez sur [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Settings → API
4. Copiez **Project URL** et **anon/public key**

---

### **Firebase Configuration**

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
```

**Où trouver ces valeurs ?**
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Sélectionnez votre projet
3. Project Settings → General
4. Descendez à "Your apps" → SDK setup and configuration
5. Copiez toutes les valeurs de config

---

### **API Secrets (GÉNÉREZ DES SECRETS FORTS)**

⚠️ **IMPORTANT**: Générez des secrets aléatoires forts !

```bash
# Générez ces secrets avec:
# openssl rand -hex 32
EXHIBITORS_SECRET=your_strong_random_secret_here_min_32_chars
METRICS_SECRET=your_strong_random_secret_here_min_32_chars

# Générez avec:
# openssl rand -hex 64
JWT_SECRET=your_jwt_secret_here_min_64_chars
```

**Comment générer des secrets ?**

Option 1 - Avec OpenSSL (Linux/Mac) :
```bash
openssl rand -hex 32  # Pour EXHIBITORS_SECRET et METRICS_SECRET
openssl rand -hex 64  # Pour JWT_SECRET
```

Option 2 - En ligne :
Utilisez [random.org/strings](https://www.random.org/strings/) ou [passwordsgenerator.net](https://passwordsgenerator.net/)

---

### **Server Configuration**

```bash
# Port pour le serveur exhibitors (optionnel sur Railway)
EXHIBITORS_PORT=4002

# URL du serveur exhibitors (remplacez par votre domaine Railway)
VITE_EXHIBITORS_SERVER_URL=https://your-app.railway.app

# CORS - Domaines autorisés (votre domaine Railway + customs domains)
ALLOWED_ORIGINS=https://your-app.railway.app,https://www.yourdomain.com
```

**Note**: Remplacez `your-app.railway.app` par l'URL générée par Railway après déploiement.

---


## 🔄 Workflow de Déploiement

### Déploiement Automatique

Railway redéploie automatiquement à chaque push sur votre branche principale :

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

Railway détecte le push et redéploie automatiquement ! 🚀

### Déploiement Manuel

Dans Railway Dashboard :
1. Sélectionnez votre projet
2. Cliquez sur **"Deploy"** → **"Redeploy"**

---

## 🔍 Vérification du Déploiement

### 1. Vérifier les Logs

```
Railway Dashboard → Votre Projet → Deployments → View Logs
```

Recherchez :
- ✅ `Build successful`
- ✅ `Starting preview server`
- ✅ `Server running on port XXXX`

### 2. Vérifier l'Application

Ouvrez l'URL fournie par Railway (ex: `your-app.railway.app`)

Vérifiez :
- ✅ Page d'accueil charge
- ✅ Connexion Supabase fonctionne (test login)
- ✅ Firebase Auth fonctionne (Google login)
- ✅ Pas d'erreurs dans la console navigateur

### 3. Test de Santé

Testez les fonctionnalités critiques :
- [ ] Inscription/Connexion
- [ ] Tableau de bord utilisateur
- [ ] Affichage des exposants
- [ ] Chat (si applicable)
- [ ] Paiements PayPal/CMI/virement testés

---

## 🐛 Dépannage

### Erreur: "Application failed to start"

**Cause**: Port non configuré correctement
**Solution**: Vérifiez que `vite.config.ts` utilise `process.env.PORT`

### Erreur: "Supabase connection failed"

**Cause**: Variables Supabase mal configurées
**Solution**:
1. Vérifiez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
2. Assurez-vous que l'URL commence par `https://`
3. Pas d'espaces avant/après les valeurs

### Erreur: "Firebase initialization failed"

**Cause**: Variables Firebase manquantes ou incorrectes
**Solution**:
1. Vérifiez toutes les 6 variables Firebase
2. Assurez-vous que le projet Firebase est actif
3. Vérifiez que l'authentication Google est activée

### Erreur: Build échoue

**Cause**: Dépendances manquantes ou erreurs TypeScript
**Solution**:
```bash
# Localement, testez le build :
npm run build

# Si ça échoue localement, corrigez d'abord
# Puis commitez et pushez
```

### Application lente ou timeouts

**Cause**: Plan Railway gratuit limité
**Solutions**:
1. Optimisez les images (compressez)
2. Utilisez lazy loading
3. Réduisez la taille du bundle
4. Considérez le plan Pro Railway

---

## 📊 Monitoring

### Métriques Railway

Railway Dashboard → Votre Projet → **Metrics**

Surveillez :
- **CPU Usage**: Devrait rester < 80%
- **Memory**: Devrait rester < 512MB (plan gratuit)
- **Network**: Trafic in/out

### Logs en Temps Réel

```bash
# Dans Railway Dashboard
Deployments → View Logs → Filter by severity
```

Filtres utiles :
- `error` - Erreurs uniquement
- `warn` - Warnings
- `info` - Informations générales

---

## 🔒 Sécurité

### ✅ Checklist Sécurité

- [ ] **JAMAIS** committer de secrets dans Git
- [ ] Utiliser des secrets forts (32+ caractères)
- [ ] Configurer CORS correctement (`ALLOWED_ORIGINS`)
- [ ] Utiliser HTTPS uniquement (Railway le fait automatiquement)
- [ ] Rotation régulière des secrets (tous les 3-6 mois)
- [ ] Activer 2FA sur Supabase, Firebase
- [ ] Monitorer les logs pour activité suspecte

### Rotation des Secrets

**Quand ?** Tous les 3-6 mois ou en cas de compromission

**Comment ?**
1. Générez de nouveaux secrets
2. Mettez à jour dans Railway Variables
3. Redéployez l'application
4. Testez que tout fonctionne
5. Révoquez les anciens secrets

---

## 💰 Coûts

### Plan Gratuit Railway (Hobby)
- ✅ 500 heures d'exécution/mois
- ✅ 512 MB RAM
- ✅ 1 GB Storage
- ✅ Domaines custom
- ⚠️ Limite de trafic

**Suffisant pour :** Tests, prototypes, petits projets

### Plan Pro Railway
- ✅ Exécution illimitée
- ✅ 8 GB RAM
- ✅ 100 GB Storage
- ✅ Support prioritaire
- 💵 ~$20/mois

**Recommandé pour :** Production avec trafic moyen/élevé

---

## 🌐 Domaine Personnalisé

### Ajouter un Domaine Custom

1. Railway Dashboard → Projet → **Settings**
2. Scroll à **Domains**
3. Cliquez **Add Domain**
4. Entrez votre domaine : `www.yourdomain.com`
5. Ajoutez le CNAME dans votre DNS :

```
CNAME: www
Value: your-app.railway.app
```

### Configuration DNS

Exemple avec Cloudflare :
```
Type: CNAME
Name: www
Target: your-app.railway.app
Proxy status: Proxied (orange cloud)
TTL: Auto
```

Attendez 5-30 minutes pour la propagation DNS.

---

## 📚 Ressources Utiles

- [Railway Documentation](https://docs.railway.app)
- [Nixpacks Documentation](https://nixpacks.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## 🆘 Support

### Problème avec Railway ?
- Railway Discord: [railway.app/discord](https://railway.app/discord)
- Railway Docs: [docs.railway.app](https://docs.railway.app)

### Problème avec SIB2026 ?
- GitHub Issues: Créez une issue sur le repository
- Documentation: Consultez `/docs`

---

## ✅ Checklist Complète de Déploiement

- [ ] Compte Railway créé
- [ ] Repository connecté
- [ ] Toutes les variables d'environnement ajoutées (12+)
- [ ] Secrets générés avec openssl
- [ ] Premier déploiement réussi
- [ ] Application accessible via URL Railway
- [ ] Test de connexion Supabase OK
- [ ] Test de connexion Firebase OK
- [ ] Tests fonctionnels complets OK
- [ ] Domaine custom configuré (optionnel)
- [ ] Monitoring activé
- [ ] Logs vérifiés
- [ ] Plan Railway choisi (Hobby ou Pro)

---

## 🎉 Félicitations !

Votre application SIB2026 est maintenant déployée sur Railway ! 🚀

**Prochaines étapes recommandées :**
1. Configurez le monitoring
2. Ajoutez un domaine custom
3. Mettez en place CI/CD
4. Configurez les backups Supabase
5. Optimisez les performances

---

**Dernière mise à jour**: Novembre 2024
**Version**: 1.0
**Auteur**: Équipe SIB2026
