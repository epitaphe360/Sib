---
name: i18n-check
description: Vérifier les clés i18n manquantes dans les 3 langues (fr, en, ar) du projet SIB
---

Analyse les fichiers de traduction du système custom SIB :
- `src/store/translations.fr.ts`
- `src/store/translations.en.ts`
- `src/store/translations.ar.ts`

Étapes :
1. Extrais toutes les clés présentes dans chaque fichier
2. Identifie les clés présentes dans `fr` mais absentes dans `en` ou `ar`
3. Identifie les clés présentes dans `en` mais absentes dans `fr` ou `ar`
4. Liste les clés avec valeur vide (`''`) ou valeur stub (`'TODO'`, `'...'`)

Résultat attendu :
- Tableau récapitulatif par langue : total clés / manquantes / vides
- Liste des clés manquantes les plus critiques (celles utilisées dans des pages principales)

Ne modifie aucun fichier — audit seulement.
