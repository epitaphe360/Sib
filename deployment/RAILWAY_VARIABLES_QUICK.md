# ⚡ CONFIGURATION RAPIDE VARIABLES RAILWAY

## 🚨 VARIABLES OBLIGATOIRES (Minimum pour que l'app fonctionne)

```bash
# SUPABASE - BASE DE DONNÉES (OBLIGATOIRE)
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre_clé_ici
```

**Où trouver ces valeurs ?**
1. https://supabase.com → Votre projet → Settings → API
2. Copier "Project URL" et "anon public key"

**Sans ces variables :** L'app affiche un warning et les features Supabase sont désactivées.

---

## ✅ VARIABLES RECOMMANDÉES (Pour toutes les fonctionnalités)

### Firebase (Si vous utilisez Firebase Auth/Storage)

```bash
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxx
```

**Où trouver ?**
1. https://console.firebase.google.com
2. Project Settings → General → Your apps → SDK setup

### Stripe (Si vous utilisez les paiements)

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXX
```

**Où trouver ?**
1. https://dashboard.stripe.com
2. Developers → API keys → Publishable key

### Secrets API (Générer avec openssl)

```bash
EXHIBITORS_SECRET=votre_secret_32_caracteres_ici
METRICS_SECRET=votre_secret_32_caracteres_ici
JWT_SECRET=votre_secret_64_caracteres_ici
```

**Comment générer ?**

Sur votre machine locale :
```bash
# Secret 32 caractères
openssl rand -hex 32

# Secret 64 caractères
openssl rand -hex 64
```

Copier-coller les résultats dans Railway.

### Configuration

```bash
VITE_APP_URL=https://siportv3-production.up.railway.app
NODE_ENV=production
```

---

## 📋 CHECKLIST CONFIGURATION

### Minimum (App fonctionne)
- [ ] `VITE_SUPABASE_URL` configuré
- [ ] `VITE_SUPABASE_ANON_KEY` configuré
- [ ] Redéploiement Railway terminé
- [ ] Rafraîchir la page : https://siportv3-production.up.railway.app
- [ ] ✅ Plus de warning Supabase

### Complet (Toutes fonctionnalités)
- [ ] Variables Supabase ✅
- [ ] Variables Firebase (si utilisé)
- [ ] Variable Stripe (si paiements)
- [ ] Secrets API générés
- [ ] `VITE_APP_URL` configuré
- [ ] `NODE_ENV=production` configuré

---

## 🚀 PROCÉDURE RAPIDE

### 1. Ouvrir Railway Dashboard
https://railway.app → Votre projet

### 2. Onglet "Variables"

### 3. Cliquer "New Variable" pour chaque variable

Format :
```
Key: VITE_SUPABASE_URL
Value: https://xxxxxxxx.supabase.co
```

### 4. Railway redéploie automatiquement

Attendez 1-2 minutes.

### 5. Tester l'application

Rafraîchir : https://siportv3-production.up.railway.app

✅ Plus de warning Supabase !

---

## 🐛 TROUBLESHOOTING

### Problème : "Still showing Supabase warning after adding variables"

**Solutions :**
1. Vérifier l'orthographe exacte des variables :
   - `VITE_SUPABASE_URL` (pas SUPABASE_URL)
   - `VITE_SUPABASE_ANON_KEY` (pas SUPABASE_ANON_KEY)

2. Vérifier que les valeurs sont correctes :
   - URL doit commencer par `https://`
   - Anon key doit commencer par `eyJ`

3. Forcer un redéploiement :
   - Railway Dashboard → Deployments → "Redeploy"

4. Vider le cache du navigateur :
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

### Problème : "Invalid Supabase credentials"

**Cause :** Mauvaise clé API ou projet Supabase inexistant.

**Solutions :**
1. Vérifier dans Supabase Dashboard que le projet existe
2. Régénérer les clés : Settings → API → Reset anon key
3. Mettre à jour dans Railway

### Problème : "Cannot connect to Supabase"

**Cause :** Réseau ou CORS.

**Solutions :**
1. Vérifier les URLs autorisées dans Supabase :
   - Supabase → Authentication → URL Configuration
   - Ajouter : `https://siportv3-production.up.railway.app`

2. Vérifier que Supabase est en ligne :
   - Supabase Dashboard → Project Status

---

## 📚 GUIDES COMPLETS

Pour une configuration détaillée :
- **Guide complet Supabase + Railway :** `/deployment/GUIDE_DEPLOIEMENT_COMPLET.md`
- **Checklist déploiement :** `/deployment/DEPLOIEMENT_CHECKLIST.md`
- **Template variables :** `/deployment/railway.env.template`

---

## ✅ RÉSULTAT ATTENDU

Après configuration des variables Supabase :

```
✅ Page s'affiche sans warning
✅ Login/Register fonctionnent
✅ Données chargent depuis Supabase
✅ Application complètement fonctionnelle
```

---

**Dernière mise à jour :** Novembre 2024
**Status :** Build Railway réussi ! 🎉
