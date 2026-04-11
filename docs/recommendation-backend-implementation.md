# Implémentation du Moteur de Recommandation (Backend)

**Auteur:** Manus AI  
**Date:** 4 octobre 2025

## Objectif

Ce document décrit l'implémentation du moteur de recommandation côté backend, en se basant sur l'approche hybride et les technologies définies précédemment. L'objectif est de créer une fonction Supabase RPC capable de générer des recommandations pertinentes pour un utilisateur donné.

## 1. Fonction Supabase RPC : `get_recommendations_for_user`

Nous allons créer une fonction PostgreSQL dans Supabase qui sera exposée comme une fonction RPC (Remote Procedure Call). Cette fonction prendra l'ID d'un utilisateur et retournera une liste d'IDs d'exposants ou de produits recommandés.

### 1.1 Code SQL de la Fonction RPC

Pour que cette fonction puisse être exécutée, l'extension `pgvector` doit être activée et les tables `item_embeddings` et `user_profiles_embeddings` doivent exister et être peuplées.

```sql
CREATE OR REPLACE FUNCTION get_recommendations_for_user(p_user_id UUID, p_limit INT DEFAULT 10) 
RETURNS TABLE(item_id UUID, item_type VARCHAR, similarity_score FLOAT) 
LANGUAGE plpgsql
AS $$
DECLARE
    user_embedding VECTOR(384); -- Assurez-vous que la dimension correspond à celle de vos embeddings
BEGIN
    -- 1. Récupérer l'embedding du profil utilisateur
    SELECT embedding INTO user_embedding
    FROM user_profiles_embeddings
    WHERE user_id = p_user_id;

    -- Si l'utilisateur n'a pas d'embedding de profil, retourner une table vide ou des recommandations par défaut
    IF user_embedding IS NULL THEN
        RAISE NOTICE 'User embedding not found for user_id: %', p_user_id;
        RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR, NULL::FLOAT WHERE FALSE;
    END IF;

    -- 2. Effectuer une recherche de similarité cosinus avec tous les embeddings d'éléments
    --    et retourner les N éléments les plus similaires.
    --    Nous utilisons l'opérateur <#> pour la distance euclidienne négative, qui est équivalente à la similarité cosinus
    --    lorsque les vecteurs sont normalisés (ce qui est le cas avec Sentence Transformers).
    RETURN QUERY
    SELECT
        ie.item_id,
        ie.item_type,
        (1 - (ie.embedding <#> user_embedding)) AS similarity_score -- Convertir la distance en similarité (0 à 1)
    FROM
        item_embeddings ie
    ORDER BY
        similarity_score DESC
    LIMIT p_limit;

END;
$$;
```

**Explication de la fonction :**
*   `p_user_id`: L'ID de l'utilisateur pour lequel les recommandations sont générées.
*   `p_limit`: Le nombre maximum de recommandations à retourner (par défaut 10).
*   La fonction récupère d'abord l'embedding du profil de l'utilisateur à partir de la table `user_profiles_embeddings`.
*   Elle calcule ensuite la similarité cosinus entre l'embedding de l'utilisateur et tous les embeddings d'éléments (`item_embeddings`) en utilisant l'opérateur `<#>` de `pgvector` (distance euclidienne négative, qui est une bonne approximation de la similarité cosinus pour les vecteurs normalisés).
*   Les résultats sont triés par score de similarité décroissant et limités au nombre spécifié par `p_limit`.

### 1.2 Améliorations Futures Possibles pour la Logique de Recommandation

La fonction RPC ci-dessus fournit une base solide pour le filtrage basé sur le contenu. Pour une approche hybride plus avancée, les améliorations suivantes pourraient être intégrées :

*   **Pondération par Signaux Comportementaux :** Intégrer les données d'activité (`Activity` table) pour ajuster les scores de similarité. Par exemple, augmenter le score des exposants avec lesquels l'utilisateur a déjà interagi positivement (vues de profil, rendez-vous pris) ou diminuer le score des exposants déjà vus ou ignorés.
*   **Filtrage des Éléments Déjà Vus :** Modifier la requête pour exclure les `item_id`s avec lesquels l'utilisateur a déjà eu une interaction significative (par exemple, a déjà pris un rendez-vous, a visité plusieurs fois le profil).
*   **Recommandations par Défaut :** Si `user_embedding` est `NULL` (nouvel utilisateur), la fonction pourrait retourner des exposants ou produits populaires/en vedette (`featured: true` dans `Exhibitor`).
*   **Personnalisation des Types d'Éléments :** Permettre à la fonction de recommander spécifiquement des exposants, des produits ou les deux, en fonction du contexte de l'appel.

## 2. Intégration Côté Application (Frontend)

Une fois la fonction RPC déployée dans Supabase, elle pourra être appelée depuis le frontend via le `SupabaseService`.

### 2.1 Ajout au `SupabaseService`

```typescript
// src/services/supabaseService.ts

// ... autres imports et fonctions ...

export class SupabaseService {
  // ... autres méthodes ...

  static async getRecommendationsForUser(userId: string, limit: number = 10): Promise<{ itemId: string; itemType: string; similarityScore: number }[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn("⚠️ Supabase non configuré - impossible de récupérer les recommandations");
      return [];
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .rpc("get_recommendations_for_user", { p_user_id: userId, p_limit: limit });

      if (error) throw error;

      return (data || []).map((rec: any) => ({
        itemId: rec.item_id,
        itemType: rec.item_type,
        similarityScore: rec.similarity_score,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des recommandations:", error);
      return [];
    }
  }

  // ... autres méthodes ...
}
```

### 2.2 Utilisation dans un Composant React

Un composant React pourrait utiliser cette nouvelle méthode pour afficher les recommandations :

```typescript
// src/components/recommendations/UserRecommendations.tsx

import React, { useEffect, useState } from 'react';
import { SupabaseService } from '../../services/supabaseService';
import { useAuth } from '../../hooks/useAuth'; // Supposons un hook d'authentification

interface Recommendation {
  itemId: string;
  itemType: string;
  similarityScore: number;
}

const UserRecommendations: React.FC = () => {
  const { user } = useAuth(); // Récupérer l'utilisateur connecté
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) {
        setError("Veuillez vous connecter pour voir les recommandations.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await SupabaseService.getRecommendationsForUser(user.id);
        setRecommendations(data);
      } catch (err) {
        console.error("Erreur lors du chargement des recommandations:", err);
        setError("Impossible de charger les recommandations pour le moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (loading) return <p>Chargement des recommandations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (recommendations.length === 0) return <p>Aucune recommandation disponible pour le moment.</p>;

  return (
    <div className="recommendations-list">
      <h2 className="text-xl font-bold mb-4">Recommandations pour vous</h2>
      <ul>
        {recommendations.map((rec) => (
          <li key={rec.itemId} className="mb-2 p-3 border rounded-md">
            <p>Type: {rec.itemType}</p>
            <p>ID: {rec.itemId}</p>
            <p>Score de similarité: {rec.similarityScore.toFixed(2)}</p>
            {/* Ici, vous pouvez ajouter un lien vers la page de détail de l'élément */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserRecommendations;
```

## Conclusion

Cette implémentation backend fournit la logique de base pour le moteur de recommandation en utilisant une fonction RPC Supabase et la recherche de similarité vectorielle. Les prochaines étapes consisteront à intégrer ce service dans l'interface utilisateur et à affiner la logique de recommandation avec des signaux comportementaux et des filtres supplémentaires.
