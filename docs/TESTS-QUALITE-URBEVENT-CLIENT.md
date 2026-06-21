# Rapport de tests qualité — UrbaEvent Mobile v1.0.14

Document destiné au **client Urbacom** pour valider que l'application mobile a été développée et testée de manière rigoureuse, indépendamment de l'usage de l'IA en codage.

---

## Comment lancer tous les tests (1 commande)

```bash
cd apps/mobile
npm run test:quality
```

Mode sans connexion Supabase (bureau / CI) :

```bash
npm run test:quality:offline
```

---

## Matrice de tests automatisés

| # | Catégorie | Fichier / Script | Ce qui est vérifié | Résultat attendu |
|---|-----------|------------------|--------------------|------------------|
| 1 | **Compilation** | `npm run typecheck` | 0 erreur TypeScript sur toute l'app | PASS |
| 2 | **Permissions réseau** | `tests/unit/mobile/networkingPermissions.test.ts` | Gratuit: scan 20 connexions/j, pas de messages; VIP: accès complet | PASS |
| 3 | **Navigation rôles** | `tests/unit/mobile/roleConfig.test.ts` | Visiteur, exposant, partenaire, staff → bon écran d'accueil | PASS |
| 4 | **Catalogue salons** | `tests/unit/mobile/salonCatalog.test.ts` | 5 salons Urbacom, 1 seul actif (SIB) | PASS |
| 5 | **Traductions** | `tests/unit/mobile/i18nParity.test.ts` | FR/EN/AR identiques, UrbaEvent (pas SIB 2026 sur plateforme) | PASS |
| 6 | **Qualité code** | `tests/unit/mobile/staticQuality.test.ts` | Pas de debug, SalonGate, versions, logo, architecture hub | PASS |
| 7 | **URLs logos** | `tests/unit/mobile/badgeConfig.test.ts` | Résolution correcte des logos admin + brand:// local | PASS |
| 8 | **Assets** | `scripts/verify-brand-logos.mjs` | 7 fichiers logo locaux (master, badge, icon, splash…) | PASS |
| 9 | **Couverture 100 %** | `vitest.mobile.config.ts --coverage` | Logique métier mobile : 100 % lignes/branches/fonctions | PASS |
| 10 | **API live** | `scripts/run-salon-checklist.mjs` | Auth démo, JWT badge, scan QR, tables Supabase | PASS si prod active |

---

## Tests manuels recommandés (checklist terrain)

À cocher sur téléphone avant livraison :

- [ ] **M1** — Première ouverture : accueil UrbaEvent, pas d'onglets Badge/Explorer
- [ ] **M2** — Choisir SIB 2026 → hub → « Entrer » → onglets visibles
- [ ] **M3** — Relancer l'app → salon restauré
- [ ] **M4** — « Changer de salon » → retour hub
- [ ] **M5** — Sans salon : Badge/Map/Scan → écran « Choisissez un salon »
- [ ] **M6** — Connexion visiteur démo → scan badge → connexion envoyée
- [ ] **M7** — Visiteur gratuit : pas de messagerie, scan OK
- [ ] **M8** — Mode avion : grille salons visible (données locales)
- [ ] **M9** — Logo castor UrbaEvent visible (accueil, login, icône launcher)

---

## Comptes de test (environnement démo)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Visiteur | visiteur@sib.com | Visit123! |
| Exposant | exposant@sib.com | Expo123! |
| Admin | admin.sib@sib.com | Admin123! |

---

## Interprétation pour le client

| Symbole | Signification |
|---------|---------------|
| **PASS** | Test automatisé réussi — comportement garanti par le code |
| **FAIL** | Bug confirmé — doit être corrigé avant livraison |

> **Politique stricte** : la suite `test:quality` échoue sur tout FAIL. Aucun WARN toléré (logos bundlés localement, pas de dépendance HTTP).

---

## Fréquence recommandée

- **À chaque modification** : `npm run test:quality:offline` (2 min)
- **Avant chaque APK client** : `npm run test:quality` (complet avec API)
- **Avant publication Play Store** : tests manuels M1–M9 + build EAS preview

---

*Elite Tech Holding SARL — UrbaEvent Mobile — Juin 2026*
