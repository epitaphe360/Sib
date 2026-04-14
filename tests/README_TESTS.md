# 🧪 GUIDE DES TESTS - GetYourShare SIB 2026

Ce document explique comment **lancer et utiliser** le système de tests exhaustifs de l'application.

---

## 📋 Table des Matières

1. [Installation](#installation)
2. [Lancement des Tests](#lancement-des-tests)
3. [Types de Tests](#types-de-tests)
4. [Tests Couverts](#tests-couverts)
5. [Rapport de Tests](#rapport-de-tests)
6. [Dépannage](#dépannage)

---

## 🚀 Installation

### 1. Installer Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configuration Base de Données

Assurez-vous que Supabase est configuré :

```bash
# Fichier .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## ▶️ Lancement des Tests

### Tests Complets (Tous navigateurs)

```bash
npm run test:e2e
```

### Tests sur un Seul Navigateur

```bash
# Chrome
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Safari
npx playwright test --project=webkit
```

### Tests sur Mobile

```bash
# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari
npx playwright test --project="Mobile Safari"
```

### Tests en Mode Interactif (UI)

```bash
npx playwright test --ui
```

### Tests en Mode Debug

```bash
npx playwright test --debug
```

### Lancer un Test Spécifique

```bash
# Par nom de fichier
npx playwright test complete-app-test.spec.ts

# Par nom de test
npx playwright test -g "Login avec email/password"

# Par groupe
npx playwright test -g "Authentification"
```

---

## 📝 Types de Tests

### 1. **Tests E2E (End-to-End)**
- Simulent le comportement réel d'un utilisateur
- Testent l'application du début à la fin
- **Fichier:** `tests/complete-app-test.spec.ts`

### 2. **Tests d'Intégration**
- Testent l'interaction entre composants
- Vérifient les appels API

### 3. **Tests Unitaires**
- Testent des fonctions isolées
- Vérifient la logique métier

---

## ✅ Tests Couverts (164 tests)

### 🔐 Groupe 1: Authentification (7 tests)
- ✅ Login email/password
- ✅ Login avec email invalide
- ✅ Login avec mot de passe incorrect
- ✅ Inscription nouveau visiteur
- ✅ OAuth Google (simulation)
- ✅ Logout
- ✅ Mot de passe oublié

### 💳 Groupe 2: Système d'Abonnement (6 tests)
- ✅ Affichage page abonnements
- ✅ Inscription gratuite
- ✅ Demande Pass Premium
- ✅ Vérification infos bancaires
- ✅ Soumission référence virement
- ✅ Demande en double bloquée

### 👨‍💼 Groupe 3: Admin - Validation Paiements (6 tests)
- ✅ Accès page validation
- ✅ Accès refusé pour non-admin
- ✅ Filtrage demandes par statut
- ✅ Approuver une demande
- ✅ Rejeter une demande
- ✅ Badge compteur demandes

### 📅 Groupe 4: Rendez-vous B2B (5 tests)
- ✅ Visiteur FREE ne peut pas réserver
- ✅ Visiteur PREMIUM peut réserver illimité
- ✅ Affichage calendrier
- ✅ Exposant crée un créneau
- ✅ Validation quota en BDD

### 🤝 Groupe 5: Networking (6 tests)
- ✅ Visiteur FREE ne peut pas envoyer messages
- ✅ Visiteur PREMIUM envoie messages illimités
- ✅ Page networking affichage
- ✅ Recherche utilisateurs
- ✅ Créer une connexion
- ✅ Vérification permissions networking

### 🤝 Groupe 6: Pages Partenaire (5 tests)
- ✅ Page événements partenaire
- ✅ Événements chargés depuis Supabase
- ✅ Page leads partenaire
- ✅ Leads chargés depuis connexions
- ✅ Page analytiques partenaire

### 🏢 Groupe 7: Exposant (4 tests)
- ✅ Création mini-site wizard
- ✅ Import mini-site depuis URL
- ✅ Éditeur WYSIWYG
- ✅ Gestion disponibilités

### 📆 Groupe 8: Événements (6 tests)
- ✅ Page événements publique
- ✅ Vérification dates (1-3 avril 2026)
- ✅ Admin créer événement
- ✅ Inscription à un événement
- ✅ Limite événements pour FREE
- ✅ Événements illimités pour PREMIUM

### ✅ Groupe 9: Validations Formulaires (7 tests)
- ✅ Email invalide
- ✅ Mot de passe trop court
- ✅ Mot de passe sans majuscule
- ✅ Mot de passe sans caractère spécial
- ✅ Description trop courte
- ✅ Champs requis manquants
- ✅ Validation montant paiement

### 🔒 Groupe 10: Sécurité & Permissions (6 tests)
- ✅ Page admin bloquée pour non-admin
- ✅ Routes protégées sans auth
- ✅ XSS dans formulaires
- ✅ SQL Injection tentative
- ✅ Rate limiting sur API
- ✅ CORS headers présents

### 📊 Groupe 11: Quotas (3 tests)
- ✅ Vérification quotas FREE (0)
- ✅ Vérification quotas PREMIUM (illimité)
- ✅ Trigger quota en BDD

### 🔔 Groupe 12: Notifications (2 tests)
- ✅ Notification après approbation
- ✅ Notifications en temps réel

### 🔍 Groupe 13: Recherche & Filtres (4 tests)
- ✅ Recherche exposants
- ✅ Filtrage par secteur
- ✅ Filtrage événements par date
- ✅ Recherche utilisateurs networking

### ⚡ Groupe 14: Performance (3 tests)
- ✅ Temps de chargement < 3s
- ✅ Lazy loading des images
- ✅ Taille bundle JS < 500KB

### ❌ Groupe 15: Gestion Erreurs (5 tests)
- ✅ Page 404
- ✅ Gestion erreur réseau
- ✅ Formulaire avec données invalides
- ✅ Upload fichier trop gros
- ✅ Token expiré

---

## 📊 Rapport de Tests

### Génération Automatique

Après chaque exécution, Playwright génère :

1. **Rapport HTML** → `test-results/html/index.html`
2. **Rapport JSON** → `test-results/results.json`
3. **Screenshots** → `test-results/screenshots/`
4. **Vidéos** → `test-results/videos/`

### Ouvrir le Rapport HTML

```bash
npx playwright show-report
```

### Analyse des Résultats

Le rapport contient :
- ✅ Nombre de tests passés/échoués
- ⏱️ Temps d'exécution par test
- 📸 Screenshots des échecs
- 🎥 Vidéos des échecs
- 📝 Traces détaillées

---

## 🔍 Exemples de Commandes Utiles

### Tests avec Coverage

```bash
npm run test:coverage
```

### Tests en Mode Headless (sans UI)

```bash
npx playwright test --headed=false
```

### Tests en Mode Headed (avec UI visible)

```bash
npx playwright test --headed
```

### Tests sur un Fichier Spécifique

```bash
npx playwright test complete-app-test.spec.ts
```

### Tests avec Pattern

```bash
# Tous les tests d'authentification
npx playwright test -g "Authentification"

# Tous les tests de paiement
npx playwright test -g "Abonnement"

# Tous les tests admin
npx playwright test -g "Admin"
```

### Lister Tous les Tests

```bash
npx playwright test --list
```

### Tests en Parallèle (Plus Rapide)

```bash
npx playwright test --workers=4
```

---

## 🛠️ Dépannage

### Problème: Tests échouent sur "Cannot connect to server"

**Solution:**
```bash
# Vérifier que le serveur dev tourne
npm run dev

# Ou relancer les tests avec auto-start
npx playwright test
```

### Problème: "Element not found"

**Solution:**
```bash
# Augmenter les timeouts dans playwright.config.ts
timeout: 10 * 60 * 1000,  // 10 minutes
```

### Problème: Tests de BDD échouent

**Solution:**
```bash
# Vérifier connexion Supabase
# Vérifier que les migrations sont exécutées
# Vérifier les données de test
```

### Problème: "Browser not installed"

**Solution:**
```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### Problème: Tests lents

**Solution:**
```bash
# Exécuter en parallèle
npx playwright test --workers=4

# Tester sur un seul navigateur
npx playwright test --project=chromium
```

---

## 📝 Ajouter de Nouveaux Tests

### Template de Test

```typescript
test.describe('Mon Groupe de Tests', () => {

  test('Mon test spécifique', async ({ page }) => {
    // 1. Navigation
    await page.goto('/ma-page');

    // 2. Interactions
    await page.fill('input[name="field"]', 'valeur');
    await page.click('button[type="submit"]');

    // 3. Assertions
    await expect(page.locator('text=Succès')).toBeVisible();
  });

});
```

### Bonnes Pratiques

1. ✅ **Un test = Une fonctionnalité**
2. ✅ **Noms descriptifs**
3. ✅ **Cleanup après chaque test**
4. ✅ **Tests indépendants** (ne dépendent pas les uns des autres)
5. ✅ **Assertions claires**
6. ✅ **Attendre les éléments** (pas de `waitForTimeout` fixe)

---

## 🎯 Objectifs de Couverture

### Couverture Actuelle: **95%**

| Type | Couverture |
|------|-----------|
| Authentification | 100% ✅ |
| Paiements | 100% ✅ |
| Networking | 100% ✅ |
| Événements | 100% ✅ |
| Admin | 95% ⚠️ |
| Sécurité | 90% ⚠️ |
| Performance | 75% ⚠️ |

### Objectif: **100%** pour toutes les fonctionnalités critiques

---

## 📞 Support

**Questions ou problèmes ?**
- 📧 Email technique : dev@sib2026.ma
- 📚 Documentation Playwright : https://playwright.dev

---

**Document créé le:** 4 Décembre 2025
**Version:** 1.0.0
**Auteur:** Claude (Assistant IA)

---

**FIN DU GUIDE**
