# 🔐 Configuration de l'Authentification Google pour SIB

## 📋 Prérequis

1. **Compte Google Cloud Platform** avec facturation activée
2. **Projet Firebase** configuré
3. **Domaine vérifié** pour l'application

## 🚀 Étapes de Configuration

### **1. Créer un Projet Firebase**

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet : `SIB-2026`
4. Activez Google Analytics (optionnel)
5. Créez le projet

### **2. Configurer l'Authentification**

1. Dans Firebase Console → **Authentication**
2. Cliquez sur **"Commencer"**
3. Onglet **"Sign-in method"**
4. Activez **"Google"**
5. Configurez le nom public du projet
6. Ajoutez votre email de support

### **3. Ajouter votre Application Web**

1. Dans Firebase Console → **Paramètres du projet** (⚙️)
2. Onglet **"Général"**
3. Cliquez sur **"Ajouter une application"** → **Web**
4. Nom de l'app : `SIB 2026 Platform`
5. Cochez **"Configurer Firebase Hosting"** (optionnel)
6. **Copiez la configuration** qui s'affiche

### **4. Configuration des Variables d'Environnement**

Créez un fichier `.env` à la racine du projet :

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=SIB-2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=SIB-2026
VITE_FIREBASE_STORAGE_BUCKET=SIB-2026.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

### **5. Configurer les Domaines Autorisés**

1. Firebase Console → **Authentication** → **Settings**
2. Onglet **"Authorized domains"**
3. Ajoutez vos domaines :
   - `localhost` (pour le développement)
   - `votre-domaine.com` (pour la production)
   - `SIB.com` (domaine principal)

### **6. Configuration Google Cloud Console**

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet Firebase
3. **APIs & Services** → **Credentials**
4. Configurez l'**OAuth consent screen** :
   - Type d'utilisateur : **Externe**
   - Nom de l'application : `SIB 2026`
   - Email de support : `contact@SIBevent.com`
   - Logo : Uploadez le logo SIB
   - Domaines autorisés : `SIBevent.com`

### **7. Test de la Configuration**

```typescript
// Test dans la console du navigateur
import GoogleAuthService from './src/services/googleAuth';

// Tester la connexion
GoogleAuthService.signInWithGoogle()
  .then(user => console.log('✅ Connexion réussie:', user))
  .catch(error => console.error('❌ Erreur:', error));
```

## 🔧 Utilisation dans l'Application

### **Composant Simple**
```tsx
import { GoogleAuthButton } from './components/auth/GoogleAuthButton';

<GoogleAuthButton 
  onSuccess={() => console.log('Connexion réussie!')}
  onError={(error) => console.error('Erreur:', error)}
/>
```

### **Hook Personnalisé**
```tsx
import { useGoogleAuth } from './hooks/useGoogleAuth';

const { signInWithGoogle, signOut, currentUser, isLoading } = useGoogleAuth();
```

### **Service Direct**
```tsx
import GoogleAuthService from './services/googleAuth';

// Connexion
const user = await GoogleAuthService.signInWithGoogle();

// Déconnexion
await GoogleAuthService.signOut();

// Vérifier l'état
const isAuth = GoogleAuthService.isAuthenticated();
```

## 🛡️ Sécurité et Bonnes Pratiques

### **Variables d'Environnement**
- ✅ **JAMAIS** commiter les clés dans Git
- ✅ Utiliser des variables d'environnement différentes pour dev/prod
- ✅ Restreindre les domaines autorisés

### **Gestion des Erreurs**
```typescript
try {
  await GoogleAuthService.signInWithGoogle();
} catch (error) {
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      // Utilisateur a fermé la popup
      break;
    case 'auth/popup-blocked':
      // Popup bloquée par le navigateur
      break;
    case 'auth/network-request-failed':
      // Problème réseau
      break;
    default:
      // Autre erreur
  }
}
```

### **Validation Côté Serveur**
```typescript
// Vérifier le token côté serveur
const token = await GoogleAuthService.getAuthToken();
const response = await fetch('/api/verify-token', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🚀 Déploiement

### **Développement Local**
```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Firebase

# Démarrer le serveur de développement
npm run dev
```

### **Production**
```bash
# Build pour la production
npm run build

# Variables d'environnement de production
# Configurez les mêmes variables dans votre plateforme de déploiement
```

## 📞 Support

- **Documentation Firebase :** https://firebase.google.com/docs/auth
- **Support SIB :** contact@SIBevent.com
- **Issues GitHub :** Créez une issue sur le repository

## ✅ Checklist de Vérification

- [ ] Projet Firebase créé
- [ ] Authentification Google activée
- [ ] Configuration copiée dans `.env`
- [ ] Domaines autorisés configurés
- [ ] OAuth consent screen configuré
- [ ] Test de connexion réussi
- [ ] Gestion d'erreurs implémentée
- [ ] Variables de production configurées

Une fois cette configuration terminée, l'authentification Google sera pleinement fonctionnelle ! 🎯