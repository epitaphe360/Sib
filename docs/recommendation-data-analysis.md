# Analyse des Sources de Données et des Modèles de Comportement Utilisateur pour le Moteur de Recommandation

**Auteur:** Manus AI  
**Date:** 4 octobre 2025

## Objectif

Ce document analyse les sources de données disponibles dans l'application SIPORT v3 et les modèles de comportement utilisateur potentiels qui peuvent être exploités pour développer un moteur de recommandation basé sur l'IA. L'objectif est d'identifier les informations pertinentes pour suggérer des exposants, des produits ou des contacts aux utilisateurs.

## 1. Sources de Données Disponibles

Les données de l'application sont structurées autour de plusieurs entités principales, définies dans `src/types/index.ts` et gérées via `src/services/supabaseService.ts`.

### 1.1 Données Utilisateur (`User` et `UserProfile`)

Le profil utilisateur est une source riche d'informations explicites sur les préférences et les intentions de l'utilisateur.

| Champ (`UserProfile`) | Type de Donnée | Pertinence pour la Recommandation | Exemples | 
| :-------------------- | :------------- | :-------------------------------- | :------- | 
| `interests`           | `string[]`     | Intérêts déclarés par l'utilisateur, très pertinent pour les recommandations de contenu et d'exposants. | `["innovation", "logistique", "développement durable"]` | 
| `objectives`          | `string[]`     | Objectifs de participation à l'événement, essentiel pour aligner les recommandations avec les besoins de l'utilisateur. | `["trouver des partenaires", "découvrir de nouvelles technologies"]` | 
| `businessSector`      | `string`       | Secteur d'activité professionnel, utile pour recommander des exposants ou des produits du même secteur. | `"transport maritime"`, `"énergie"` | 
| `sectors`             | `string[]`     | Secteurs d'intérêt, similaire à `businessSector` mais potentiellement plus large. | `["portuaire", "éolien offshore"]` | 
| `products`            | `string[]`     | Types de produits ou services recherchés, directement utilisable pour la recommandation de produits. | `["logiciels de gestion", "équipements de manutention"]` | 
| `thematicInterests`   | `string[]`     | Intérêts thématiques spécifiques, peut affiner les recommandations. | `["cybersécurité portuaire", "automatisation"]` | 
| `collaborationTypes`  | `string[]`     | Types de collaboration recherchés, utile pour la recommandation de partenaires ou de contacts. | `["partenariat technologique", "investissement"]` | 
| `expertise`           | `string[]`     | Domaines d'expertise, peut être utilisé pour recommander des experts ou des sessions. | `["blockchain", "IA"]` | 
| `visitObjectives`     | `string[]`     | Objectifs spécifiques de la visite, similaire à `objectives`. | `["rencontrer des fournisseurs", "veille technologique"]` | 
| `competencies`        | `string[]`     | Compétences, peut être utilisé pour le matching de profils. | `["gestion de projet", "analyse de données"]` | 

### 1.2 Données Exposant (`Exhibitor`)

Les informations sur les exposants sont cruciales pour les recommandations d'exposants et de produits.

| Champ (`Exhibitor`) | Type de Donnée | Pertinence pour la Recommandation | Exemples | 
| :------------------ | :------------- | :-------------------------------- | :------- | 
| `category`          | `ExhibitorCategory` | Catégorie de l'exposant (institutionnel, port-industry, etc.), utile pour le filtrage et la recommandation. | `"port-industry"` | 
| `sector`            | `string`       | Secteur d'activité de l'entreprise, pour le matching avec les intérêts utilisateur. | `"logistique portuaire"` | 
| `description`       | `string`       | Description textuelle de l'entreprise, peut être analysée pour extraire des mots-clés et des thèmes. | `"Fournisseur de solutions logicielles pour l'optimisation des opérations portuaires."` | 
| `products`          | `Product[]`    | Liste des produits/services offerts, directement utilisable pour la recommandation de produits. | `[{ name: "Logiciel de gestion de terminal", category: "logiciel" }]` | 
| `certifications`    | `string[]`     | Certifications obtenues, peut indiquer un niveau de qualité ou d'expertise. | `["ISO 9001", "Green Port"]` | 
| `markets`           | `string[]`     | Marchés cibles, utile pour le matching géographique ou sectoriel. | `["Europe", "Asie"]` | 

### 1.3 Données Produit (`Product`)

Les produits sont une entité clé pour les recommandations de produits spécifiques.

| Champ (`Product`) | Type de Donnée | Pertinence pour la Recommandation | Exemples | 
| :---------------- | :------------- | :-------------------------------- | :------- | 
| `name`            | `string`       | Nom du produit. | `"Système de navigation autonome"` | 
| `description`     | `string`       | Description détaillée du produit, pour l'analyse sémantique. | `"Solution innovante pour l'optimisation des routes maritimes."` | 
| `category`        | `string`       | Catégorie du produit, pour le filtrage et le matching. | `"logiciel", "matériel"` | 
| `specifications`  | `string`       | Spécifications techniques, peut être utilisé pour un matching plus précis. | `"compatible NMEA 2000"` | 

### 1.4 Données d'Activité (`Activity`)

Les activités des utilisateurs représentent des signaux implicites de leurs intérêts.

| Champ (`Activity`) | Type de Donnée | Pertinence pour la Recommandation | Exemples | 
| :----------------- | :------------- | :-------------------------------- | :------- | 
| `type`             | `string`       | Type d'action (vue de profil, message, rendez-vous, connexion, téléchargement). | `"profile_view"`, `"appointment"` | 
| `relatedEntityType`| `string`       | Entité concernée par l'activité (exposant, produit, événement). | `"exhibitor"`, `"product"` | 
| `relatedEntityId`  | `string`       | ID de l'entité concernée. | `"exhibitor_id_xyz"` | 
| `userId`           | `string`       | Utilisateur ayant effectué l'activité. | `"user_id_abc"` | 

### 1.5 Données de Rendez-vous (`Appointment`)

Les rendez-vous indiquent un intérêt fort et direct entre un visiteur et un exposant/partenaire.

| Champ (`Appointment`) | Type de Donnée | Pertinence pour la Recommandation | Exemples | 
| :-------------------- | :------------- | :-------------------------------- | :------- | 
| `exhibitorId`         | `string`       | Exposant concerné par le rendez-vous. | `"exh_id_123"` | 
| `visitorId`           | `string`       | Visiteur ayant pris le rendez-vous. | `"vis_id_456"` | 
| `status`              | `string`       | Statut du rendez-vous (confirmé, complété, etc.), peut indiquer la qualité de l'interaction. | `"confirmed"`, `"completed"` | 

## 2. Modèles de Comportement Utilisateur Potentiels

L'analyse des interactions des utilisateurs avec l'application peut révéler des préférences implicites.

### 2.1 Comportements Explicites

*   **Déclarations de profil :** `interests`, `objectives`, `sectors`, `products` dans `UserProfile` sont des indicateurs directs des préférences de l'utilisateur.
*   **Recherches :** Les termes de recherche utilisés par les utilisateurs (si loggés) peuvent indiquer des intérêts spécifiques.
*   **Favoris/Listes de souhaits :** Si une fonctionnalité de favoris est implémentée, les éléments ajoutés sont des signaux forts d'intérêt.

### 2.2 Comportements Implicites

*   **Vues de profil/produit :** Les `Activity` de type `profile_view` ou `product_view` pour un `relatedEntityType` donné indiquent un intérêt pour cet exposant ou produit.
*   **Interactions avec les mini-sites :** Le nombre de `views` sur un `MiniSite` (`MiniSite.views`) peut indiquer la popularité ou l'intérêt général pour un exposant.
*   **Prise de rendez-vous :** Un `Appointment` entre un `visitorId` et un `exhibitorId` est un signal très fort d'intérêt mutuel.
*   **Participation à des événements :** Les `EventRegistration` peuvent indiquer des intérêts thématiques.
*   **Conversations/Messages :** Les `ChatConversation` et `ChatMessage` entre utilisateurs peuvent révéler des connexions et des intérêts partagés.
*   **Téléchargements :** Le téléchargement de brochures ou de catalogues (`Activity` de type `download`) indique un intérêt pour le contenu d'un exposant ou d'un produit.

## 3. Stratégies de Recommandation Envisageables

Plusieurs approches peuvent être combinées pour construire un moteur de recommandation robuste :

### 3.1 Filtrage Basé sur le Contenu (Content-Based Filtering)

*   **Principe :** Recommander des éléments similaires à ceux qu'un utilisateur a aimés ou consultés dans le passé.
*   **Application :** Utiliser les `interests`, `objectives`, `sectors`, `products` du `UserProfile` de l'utilisateur pour trouver des `Exhibitor`s ou `Product`s dont les `category`, `sector`, `description`, `products` correspondent. L'analyse sémantique des descriptions (`Exhibitor.description`, `Product.description`) peut être utilisée pour extraire des mots-clés et créer des vecteurs de caractéristiques.

### 3.2 Filtrage Collaboratif (Collaborative Filtering)

*   **Principe :** Recommander des éléments qu'ont aimés des utilisateurs ayant des goûts similaires.
*   **Application :**
    *   **Utilisateur-à-utilisateur :** Identifier les visiteurs ayant des profils (`UserProfile`) ou des historiques d'activités (`Activity`, `Appointment`) similaires. Si l'utilisateur A a interagi avec l'exposant X et l'utilisateur B a un profil similaire à A, alors recommander l'exposant X à l'utilisateur B.
    *   **Élément-à-élément :** Identifier les exposants/produits qui sont souvent consultés ou appréciés ensemble. Si un utilisateur consulte l'exposant X, recommander l'exposant Y qui est souvent consulté après X par d'autres utilisateurs.

### 3.3 Recommandations Hybrides

*   **Principe :** Combiner les approches basées sur le contenu et collaboratives pour tirer parti des forces de chacune et atténuer leurs faiblesses (par exemple, le problème du 
