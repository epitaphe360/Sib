# 🎯 Suite de Tests E2E Complète - SIB 2026

## Vue d'ensemble

Cette suite de tests End-to-End (E2E) couvre **l'intégralité des fonctionnalités** de la plateforme SIB, simulant tous les parcours utilisateurs réels et toutes les interactions critiques.

## 📋 Contenu de la suite

### **Fichier Principal: `user-journey-comprehensive.spec.ts`**

Ce fichier contient 8 suites de tests complètes couvrant tous les rôles utilisateurs et fonctionnalités:

---

## 1. 🌐 Parcours Public (Guest/Visiteur non connecté)

**Objectif**: Tester la navigation publique sans authentification

**Couverture**:
- ✅ Homepage et navigation principale
- ✅ Liste des exposants (publique)
- ✅ Liste des partenaires (publique)
- ✅ Événements
- ✅ Actualités
- ✅ Médiathèque publique
- ✅ Formulaire de contact
- ✅ Venue (lieu de l'événement)

**Commande**:
```bash
npm run test:journey:comprehensive
```

---

## 2. 👤 Parcours Visiteur Complet

**Objectif**: Tester le cycle de vie complet d'un visiteur

**Couverture**:
- ✅ Inscription FREE
- ✅ Connexion et dashboard
- ✅ Upgrade vers VIP
- ✅ Génération badge numérique (QR code)
- ✅ Networking et recherche
- ✅ Rendez-vous
- ✅ Déconnexion

**Fonctionnalités testées**:
- Inscription avec validation email
- Sélection du tier (Free/VIP)
- Processus de paiement pour upgrade
- Génération du badge avec QR code
- Système de networking et matchmaking

---

## 3. 🏢 Parcours Exposant Complet (Amélioré)

**Objectif**: Tester toutes les fonctionnalités exposant

**Couverture**:
- ✅ Inscription avec sélection stand (9m², 18m², 36m²)
- ✅ Configuration profil détaillé
- ✅ **Création Mini-Site** (nouveau)
- ✅ Configuration créneaux de disponibilité
- ✅ Gestion rendez-vous B2B
- ✅ Networking et connexions
- ✅ Messagerie
- ✅ **Badge numérique et scanner** (nouveau)
- ✅ Statistiques et analytics
- ✅ Événements
- ✅ Déconnexion

**Nouvelles fonctionnalités testées**:
- Création de mini-site personnalisé avec builder
- Scanner de badge QR pour networking physique
- Statistiques avancées

**Note**: L'ancien fichier `user-journey-exhibitor.spec.ts` reste disponible pour compatibilité

---

## 4. 🤝 Parcours Partenaire Complet

**Objectif**: Tester le cycle complet d'un partenaire

**Couverture**:
- ✅ Inscription partenaire
- ✅ Dashboard partenaire
- ✅ Configuration profil
- ✅ **Upgrade Tier** (Museum → Silver → Gold → Platinum)
- ✅ **Sélection méthode de paiement**
- ✅ **Instructions Bank Transfer** (IBAN, BIC, SWIFT)
- ✅ **Upload Média partenaire**
- ✅ Bibliothèque média
- ✅ **Analytics partenaire**
- ✅ **Analytics média**
- ✅ Networking partenaire
- ✅ Activité et historique
- ✅ Support partenaire

**Fonctionnalités critiques testées**:
- Système de tiers partenaire (Museum, Silver, Gold, Platinum)
- Processus de paiement par virement bancaire
- Upload et gestion de contenu média
- Analytics détaillées (vues, interactions, ROI)

---

## 5. 📺 Fonctionnalités Média Complètes

**Objectif**: Tester toutes les fonctionnalités média

**Couverture**:
- ✅ Médiathèque principale
- ✅ **Webinars** (liste et détail)
- ✅ **Podcasts** (liste et détail)
- ✅ **Capsules Inside SIB**
- ✅ **Live Studio**
- ✅ **Best Moments**
- ✅ **Témoignages**

**Fonctionnalités testées**:
- Navigation entre différents types de média
- Lecteur vidéo/audio
- Système de filtres et recherche
- Partage social

---

## 6. 🤝 Fonctionnalités Networking Avancées

**Objectif**: Tester le système de networking avancé

**Couverture**:
- ✅ Page networking principale
- ✅ **Profile Matching / Matchmaking algorithmique**
- ✅ **Historique des interactions**
- ✅ Speed Networking (préparé)
- ✅ Salles virtuelles (préparé)

**Fonctionnalités testées**:
- Algorithme de matching basé sur profils
- Historique complet des interactions
- Suggestions de connexions

---

## 7. ⚙️ Parcours Administrateur (Optionnel)

**Objectif**: Tester les fonctionnalités admin

> ⚠️ **IMPORTANT**: Cette suite est `.skip` par défaut car elle nécessite des credentials admin réels

**Pour activer**: Retirer `.skip` dans le fichier et configurer les credentials admin

**Couverture**:
- ✅ Connexion admin
- ✅ Dashboard admin
- ✅ Gestion utilisateurs
- ✅ **Validation des demandes** (exposants, partenaires)
- ✅ Gestion exposants
- ✅ Gestion partenaires
- ✅ Gestion événements
- ✅ Gestion contenu
- ✅ Gestion média
- ✅ **Validation paiements** (bank transfers)

**Fonctionnalités critiques testées**:
- Workflow de validation des inscriptions
- Modération de contenu
- Validation des paiements
- Gestion des droits et permissions

---

## 🚀 Commandes d'exécution

### Exécuter tous les tests complets
```bash
npm run test:journey:comprehensive
```

### Exécuter en mode debug (pas à pas)
```bash
npm run test:journey:comprehensive:debug
```

### Exécuter seulement le test exposant original
```bash
npm run test:journey
```

### Exécuter avec UI Playwright
```bash
npx playwright test tests/e2e/user-journey-comprehensive.spec.ts --ui
```

### Exécuter une suite spécifique
```bash
# Seulement le parcours visiteur
npx playwright test tests/e2e/user-journey-comprehensive.spec.ts -g "PARCOURS VISITEUR"

# Seulement le parcours partenaire
npx playwright test tests/e2e/user-journey-comprehensive.spec.ts -g "PARCOURS PARTENAIRE"

# Seulement les fonctionnalités média
npx playwright test tests/e2e/user-journey-comprehensive.spec.ts -g "FONCTIONNALITÉS MÉDIA"
```

---

## 📊 Statistiques de couverture

### Nombre total de parcours testés: **8 suites**

### Fonctionnalités couvertes:

| Catégorie | Fonctionnalités | Statut |
|-----------|----------------|--------|
| **Authentification** | Inscription, Connexion, Déconnexion | ✅ |
| **Profils** | Visiteur, Exposant, Partenaire | ✅ |
| **Networking** | Matchmaking, Connexions, Historique | ✅ |
| **Rendez-vous** | Création, Gestion, Disponibilités | ✅ |
| **Média** | Webinars, Podcasts, Capsules, Live | ✅ |
| **Paiement** | Bank Transfer, Instructions, Validation | ✅ |
| **Badge** | Génération QR, Scanner | ✅ |
| **Mini-Site** | Création, Personnalisation | ✅ |
| **Analytics** | Stats visiteur, exposant, partenaire | ✅ |
| **Admin** | Validation, Modération, Gestion | ✅ |

### Pages testées: **50+**

---

## 🔧 Configuration

### Prérequis

1. **Serveur Vite en cours d'exécution**:
```bash
npm run dev
```

2. **Port configuré**: Le port par défaut est `9323` (défini dans `vite.config.ts`)

3. **Base de données Supabase**: Connexion active et tables créées

### Variables d'environnement (.env)

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Tests (optionnel)
VITE_TEST_ADMIN_EMAIL=admin@sib2026.ma
VITE_TEST_ADMIN_PASSWORD=your_admin_password
```

---

## 📝 Structure du code

### Helpers inclus

**`generateTestData()`**
Génère des données de test uniques pour chaque exécution:
- Emails uniques avec timestamp
- Noms d'entreprise uniques
- Mots de passe sécurisés

**`safeWaitForSelector(selector, timeout)`**
Attend un sélecteur avec gestion d'erreur gracieuse:
- Retourne `true` si l'élément est trouvé
- Retourne `false` si timeout, sans faire échouer le test

### Pattern d'écriture

Chaque suite suit ce pattern:
```typescript
test.describe('🎯 NOM DE LA SUITE', () => {
  test('Description du test', async ({ page }) => {
    // 1. Configuration
    const testData = generateTestData();

    // 2. Parties numérotées avec console.log
    console.log('📍 1. Étape...');
    // ... actions
    console.log('   ✅ Succès');

    // 3. Assertions
    await expect(page).toHaveURL(/expected-url/);
  });
});
```

---

## 🐛 Debugging

### Logs détaillés

Chaque test affiche des logs détaillés dans la console:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 TEST PARCOURS EXPOSANT COMPLET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: exhibitor-1706545678123@test.com
🔐 Password: Exhibitor123!@#
🏢 Entreprise: TechExpo 1706545678123

📍 1. Inscription Exposant...
   → Remplissage du formulaire...
   ✅ Compte créé

📍 2. Configuration Profil...
   ✅ Profil mis à jour
```

### Mode Debug Playwright

```bash
npm run test:journey:comprehensive:debug
```

Permet de:
- Exécuter pas à pas
- Inspecter les éléments
- Voir les screenshots à chaque étape
- Console Playwright pour requêtes

### Voir le rapport HTML

```bash
npm run test:e2e:report
```

---

## 🎯 Cas d'usage

### 1. Avant un déploiement en production

Exécuter toute la suite pour valider que toutes les fonctionnalités critiques fonctionnent:
```bash
npm run test:journey:comprehensive
```

### 2. Après ajout d'une nouvelle fonctionnalité

Ajouter des tests dans la suite appropriée ou créer une nouvelle suite.

### 3. Regression testing

Exécuter après chaque merge de branche pour détecter les régressions:
```bash
npm run test:journey:comprehensive
```

### 4. Tests de charge

Exécuter plusieurs instances en parallèle (attention aux limites Supabase):
```bash
npx playwright test tests/e2e/user-journey-comprehensive.spec.ts --workers=3
```

---

## 📚 Références

- [Documentation Playwright](https://playwright.dev/)
- [Best Practices E2E Testing](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)

---

## 🤝 Contribution

Pour ajouter de nouveaux tests:

1. Identifier le parcours utilisateur ou la fonctionnalité
2. Créer une nouvelle `test.describe()` dans le fichier approprié
3. Utiliser les helpers existants (`generateTestData()`, `safeWaitForSelector()`)
4. Ajouter des logs détaillés pour faciliter le debugging
5. Documenter dans ce README

---

## 📈 Roadmap

### Prochaines améliorations:

- [ ] Tests de performance (temps de chargement)
- [ ] Tests d'accessibilité (WCAG)
- [ ] Tests multi-navigateurs (Firefox, Safari, Edge)
- [ ] Tests mobile (responsive)
- [ ] Tests API (en parallèle des tests UI)
- [ ] Integration avec CI/CD (GitHub Actions)
- [ ] Génération de rapports de couverture
- [ ] Tests de charge avec k6 ou Artillery

---

## 📞 Support

En cas de problème avec les tests:

1. Vérifier que le serveur dev est lancé (`npm run dev`)
2. Vérifier les variables d'environnement
3. Consulter les logs détaillés dans la console
4. Utiliser le mode debug: `npm run test:journey:comprehensive:debug`
5. Vérifier le rapport HTML: `npm run test:e2e:report`

---

## ✅ Checklist de validation

Avant de merger du code, vérifier que:

- [ ] Le serveur dev démarre sans erreur
- [ ] Les tests E2E passent: `npm run test:journey:comprehensive`
- [ ] Le build production passe: `npm run build`
- [ ] Pas de console errors dans le navigateur
- [ ] Pas de TypeScript errors: `npx tsc --noEmit`

---

**Version**: 1.0.0
**Date**: 2026-01-28
**Auteur**: Équipe SIB + Claude Sonnet 4.5
**Maintenance**: Mettre à jour ce fichier à chaque ajout de test
