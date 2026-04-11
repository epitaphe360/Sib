# Conception de l'Approche de Recommandation et des Technologies Associées

**Auteur:** Manus AI  
**Date:** 4 octobre 2025

## Objectif

Ce document détaille l'approche choisie pour le moteur de recommandation basé sur l'IA et les technologies qui seront utilisées pour suggérer des exposants, des produits ou des contacts pertinents aux utilisateurs de l'application SIPORT v3.

## 1. Approche de Recommandation Choisie : Hybride

Pour maximiser la pertinence des recommandations et adresser les défis courants des systèmes de recommandation (comme le problème du démarrage à froid pour les nouveaux utilisateurs ou les nouveaux éléments), une **approche hybride** sera adoptée. Cette approche combinera le filtrage basé sur le contenu et des éléments de filtrage collaboratif.

### 1.1 Filtrage Basé sur le Contenu (Content-Based Filtering)

Cette méthode se concentrera sur la correspondance entre les caractéristiques des éléments (exposants, produits) et les préférences explicites et implicites de l'utilisateur.

*   **Pour les Utilisateurs :** Utilisation des champs `interests`, `objectives`, `sectors`, `products`, `thematicInterests`, `collaborationTypes`, `expertise`, `visitObjectives`, `competencies` du `UserProfile`.
*   **Pour les Exposants/Produits :** Utilisation des champs `category`, `sector`, `description`, `products`, `certifications`, `markets` de l'entité `Exhibitor` et `name`, `description`, `category`, `specifications` de l'entité `Product`.

### 1.2 Éléments de Filtrage Collaboratif (Collaborative Filtering)

Bien qu'un filtrage collaboratif pur puisse être complexe à implémenter initialement, des signaux comportementaux implicites seront utilisés pour affiner les recommandations.

*   **Signaux Comportementaux :** `Activity` (vues de profil/produit, téléchargements), `Appointment` (rendez-vous pris), `ChatConversation` (interactions).

## 2. Technologies Associées

L'implémentation du moteur de recommandation nécessitera des outils pour le traitement du langage naturel (NLP), la gestion des vecteurs de caractéristiques et le calcul de similarité.

### 2.1 Traitement du Langage Naturel (NLP) et Vectorisation

*   **Objectif :** Convertir les descriptions textuelles et les listes de mots-clés en représentations numériques (vecteurs) qui peuvent être comparées.
*   **Technologie :** Utilisation de modèles de *Sentence Embeddings* ou de *Word Embeddings* (par exemple, via une bibliothèque Python comme `sentence-transformers` ou `spaCy` avec des modèles pré-entraînés). Pour une première implémentation, une approche plus simple comme TF-IDF (Term Frequency-Inverse Document Frequency) pourrait être envisagée si l'intégration de modèles d'apprentissage profond est trop lourde pour le backend actuel.
    *   **Choix initial :** Pour la simplicité et l'intégration avec un backend Supabase/Edge Functions, une approche basée sur **TF-IDF** ou des **embeddings pré-calculés** (si un service externe est utilisé) sera privilégiée. Si l'application peut supporter un microservice Python, `sentence-transformers` serait idéal.

### 2.2 Base de Données Vectorielle (Vector Database) ou Recherche de Similarité

*   **Objectif :** Stocker les vecteurs générés et effectuer des recherches efficaces pour trouver les éléments les plus similaires.
*   **Technologie :** Supabase offre des capacités de recherche vectorielle via l'extension `pgvector` pour PostgreSQL. Cela permet de stocker les embeddings directement dans la base de données et d'effectuer des requêtes de similarité cosinus.
    *   **Choix :** `pgvector` sera utilisé pour stocker les embeddings des exposants, produits et profils utilisateurs, et pour effectuer les recherches de similarité.

### 2.3 Logique de Recommandation (Backend)

*   **Objectif :** Implémenter les algorithmes de recommandation qui utilisent les vecteurs et les signaux comportementaux.
*   **Technologie :** Les fonctions Supabase Edge Functions (basées sur Deno) ou des fonctions serverless séparées (par exemple, AWS Lambda, Google Cloud Functions) pourraient héberger la logique de recommandation. Pour une intégration plus simple, la logique peut être initialement intégrée dans les services existants de Supabase (RPC functions).
    *   **Choix initial :** Implémentation de fonctions RPC (Remote Procedure Call) dans Supabase pour la logique de recommandation, permettant d'appeler ces fonctions directement depuis le frontend via `supabaseService`.

## 3. Modèle de Données pour les Recommandations

### 3.1 Nouvelle Table: `item_embeddings`

Cette table stockera les représentations vectorielles des exposants et des produits.

```sql
CREATE TABLE item_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL, -- ID de l'exposant ou du produit
  item_type VARCHAR(50) NOT NULL, -- 'exhibitor' ou 'product'
  embedding VECTOR(DIMENSION) NOT NULL, -- DIMENSION dépendra du modèle d'embedding choisi
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 Nouvelle Table: `user_profiles_embeddings`

Cette table stockera les représentations vectorielles des profils utilisateurs.

```sql
CREATE TABLE user_profiles_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  embedding VECTOR(DIMENSION) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Table `user_activity` (existante ou à enrichir)

Les données d'activité (`Activity` dans `src/types/index.ts`) seront utilisées pour les signaux comportementaux. Il pourrait être nécessaire d'enrichir cette table avec des informations plus détaillées sur les interactions.

## 4. Flux de Travail du Moteur de Recommandation

1.  **Collecte de Données :** Récupération des profils utilisateurs, des exposants, des produits et des activités.
2.  **Vectorisation :**
    *   Pour chaque exposant/produit : Combiner les champs textuels (`description`, `category`, `sector`, `products`, etc.) en un seul texte. Vectoriser ce texte pour obtenir un `item_embedding`.
    *   Pour chaque utilisateur : Combiner les champs `interests`, `objectives`, `sectors`, etc., du `UserProfile` en un seul texte. Vectoriser ce texte pour obtenir un `user_profile_embedding`.
    *   Ces embeddings seront stockés dans les tables `item_embeddings` et `user_profiles_embeddings`.
3.  **Génération de Recommandations :**
    *   **Pour un utilisateur donné :**
        *   Récupérer le `user_profile_embedding` de l'utilisateur.
        *   Effectuer une recherche de similarité (cosinus) entre le `user_profile_embedding` et tous les `item_embeddings` (exposants/produits).
        *   Pondérer ces résultats avec des signaux comportementaux (par exemple, augmenter le score des éléments similaires à ceux avec lesquels l'utilisateur a interagi positivement, ou diminuer le score des éléments déjà vus/interagis).
        *   Filtrer les éléments déjà vus ou non pertinents.
        *   Retourner les N éléments les plus pertinents.

## 5. Plan de Mise en Œuvre (Détaillé pour les prochaines phases)

### Phase 1: Préparation des Données
1.  Mettre en place l'extension `pgvector` dans Supabase.
2.  Créer les tables `item_embeddings` et `user_profiles_embeddings`.
3.  Développer un script (Python ou Edge Function) pour générer les embeddings initiaux des exposants, produits et profils utilisateurs.

### Phase 2: Implémentation du Moteur (Backend)
1.  Développer une fonction RPC Supabase (`get_recommendations_for_user`) qui prend un `user_id` et retourne une liste d'IDs d'exposants/produits recommandés.
2.  Cette fonction utilisera `pgvector` pour la recherche de similarité et appliquera la logique de pondération.

### Phase 3: Intégration Frontend
1.  Créer un nouveau composant `RecommendedItems` qui appellera la fonction RPC.
2.  Intégrer ce composant dans le tableau de bord utilisateur ou sur une page dédiée.

### Phase 4: Évaluation et Amélioration
1.  Mettre en place des métriques pour évaluer la pertinence des recommandations (taux de clics, taux de conversion).
2.  Affiner les modèles d'embedding et la logique de pondération en fonction des retours.

## Conclusion

Cette conception propose une approche hybride pour le moteur de recommandation, tirant parti des capacités de `pgvector` de Supabase pour une implémentation efficace. Les prochaines étapes se concentreront sur la préparation des données et le développement du backend de recommandation.
