# Préparation des Données pour le Moteur de Recommandation

**Auteur:** Manus AI  
**Date:** 4 octobre 2025

## Objectif

Ce document détaille les étapes nécessaires pour préparer les données en vue de l'entraînement et de l'inférence du moteur de recommandation. Cela inclut la configuration de la base de données Supabase et la génération des embeddings pour les exposants, les produits et les profils utilisateurs.

## 1. Configuration de la Base de Données Supabase

Pour stocker et interroger efficacement les vecteurs d'embeddings, l'extension `pgvector` doit être activée dans votre instance Supabase, et de nouvelles tables doivent être créées.

### 1.1 Activation de l'Extension `pgvector`

Pour activer l'extension `pgvector` dans votre base de données PostgreSQL (via Supabase), vous devez exécuter la commande SQL suivante. Cette opération est généralement effectuée via l'interface utilisateur de Supabase (SQL Editor) ou via un client de base de données.

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.2 Création de la Table `item_embeddings`

Cette table stockera les représentations vectorielles des exposants et des produits. La `DIMENSION` du vecteur dépendra du modèle d'embedding choisi. Pour des modèles comme `all-MiniLM-L6-v2` (Sentence Transformers), une dimension de 384 est courante. Pour des modèles plus grands, cela peut être 768 ou plus.

```sql
CREATE TABLE item_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL, -- ID de l'exposant ou du produit
  item_type VARCHAR(50) NOT NULL, -- 'exhibitor' ou 'product'
  embedding VECTOR(384) NOT NULL, -- Exemple avec une dimension de 384
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajout d'index pour optimiser les recherches de similarité
CREATE INDEX ON item_embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
-- Ou pour une recherche de similarité cosinus:
-- CREATE INDEX ON item_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 1.3 Création de la Table `user_profiles_embeddings`

Cette table stockera les représentations vectorielles des profils utilisateurs. La `DIMENSION` doit correspondre à celle utilisée pour `item_embeddings`.

```sql
CREATE TABLE user_profiles_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  embedding VECTOR(384) NOT NULL, -- Exemple avec une dimension de 384
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajout d'index pour optimiser les recherches de similarité
CREATE INDEX ON user_profiles_embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
-- Ou pour une recherche de similarité cosinus:
-- CREATE INDEX ON user_profiles_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## 2. Génération des Embeddings Initiaux

La génération des embeddings nécessite un modèle de traitement du langage naturel (NLP) capable de convertir du texte en vecteurs numériques. Un script Python est la méthode la plus flexible pour cette tâche.

### 2.1 Environnement Python Requis

Pour générer les embeddings, vous aurez besoin des bibliothèques Python suivantes :

*   `supabase-py` : Pour interagir avec votre base de données Supabase.
*   `sentence-transformers` : Pour générer des embeddings de phrases. Le modèle `all-MiniLM-L6-v2` est un bon point de départ car il est efficace et performant.

Vous pouvez les installer via pip :

```bash
pip install supabase-py sentence-transformers
```

### 2.2 Script Python pour la Génération des Embeddings

Le script suivant est un exemple de la manière dont vous pourriez générer et insérer les embeddings dans Supabase. Il doit être exécuté dans un environnement où les variables d'environnement `SUPABASE_URL` et `SUPABASE_KEY` sont configurées.

```python
import os
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer

# Configuration Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Charger le modèle Sentence Transformer
model = SentenceTransformer("all-MiniLM-L6-v2")

# Fonction pour générer l'embedding d'un texte
def generate_embedding(text: str):
    return model.encode(text).tolist()

# --- Génération des Embeddings pour les Exposants et Produits ---
async def generate_item_embeddings():
    print("Génération des embeddings pour les exposants et produits...")
    # Récupérer tous les exposants avec leurs produits
    response = supabase.from("exhibitors").select("*, products(*)").execute()
    exhibitors = response.data

    for exhibitor in exhibitors:
        # Concaténer les informations de l'exposant
        exhibitor_text = f"{exhibitor['company_name']} {exhibitor['category']} {exhibitor['sector']} {exhibitor['description']}"
        exhibitor_embedding = generate_embedding(exhibitor_text)

        # Insérer l'embedding de l'exposant
        await supabase.from("item_embeddings").insert({
            "item_id": exhibitor["id"],
            "item_type": "exhibitor",
            "embedding": exhibitor_embedding
        }).execute()

        for product in exhibitor.get("products", []):
            # Concaténer les informations du produit
            product_text = f"{product['name']} {product['category']} {product['description']} {product.get('specifications', '')}"
            product_embedding = generate_embedding(product_text)

            # Insérer l'embedding du produit
            await supabase.from("item_embeddings").insert({
                "item_id": product["id"],
                "item_type": "product",
                "embedding": product_embedding
            }).execute()
    print("Embeddings exposants et produits générés.")

# --- Génération des Embeddings pour les Profils Utilisateurs ---
async def generate_user_profile_embeddings():
    print("Génération des embeddings pour les profils utilisateurs...")
    # Récupérer tous les utilisateurs avec leurs profils
    response = supabase.from("users").select("id, profile").execute()
    users = response.data

    for user in users:
        profile = user.get("profile", {})
        # Concaténer les informations du profil utilisateur
        user_profile_text = f""
        if profile.get("interests"): user_profile_text += f" {" ".join(profile["interests"])}"
        if profile.get("objectives"): user_profile_text += f" {" ".join(profile["objectives"])}"
        if profile.get("businessSector"): user_profile_text += f" {profile["businessSector"]}"
        if profile.get("sectors"): user_profile_text += f" {" ".join(profile["sectors"])}"
        if profile.get("products"): user_profile_text += f" {" ".join(profile["products"])}"
        if profile.get("thematicInterests"): user_profile_text += f" {" ".join(profile["thematicInterests"])}"
        if profile.get("collaborationTypes"): user_profile_text += f" {" ".join(profile["collaborationTypes"])}"
        if profile.get("expertise"): user_profile_text += f" {" ".join(profile["expertise"])}"
        if profile.get("visitObjectives"): user_profile_text += f" {" ".join(profile["visitObjectives"])}"
        if profile.get("competencies"): user_profile_text += f" {" ".join(profile["competencies"])}"
        
        if user_profile_text.strip(): # S'assurer qu'il y a du texte à encoder
            user_embedding = generate_embedding(user_profile_text.strip())

            # Insérer l'embedding du profil utilisateur
            await supabase.from("user_profiles_embeddings").insert({
                "user_id": user["id"],
                "embedding": user_embedding
            }).execute()
    print("Embeddings profils utilisateurs générés.")

# Exécution des fonctions
import asyncio

async def main():
    await generate_item_embeddings()
    await generate_user_profile_embeddings()

if __name__ == "__main__":
    asyncio.run(main())
```

### 2.3 Exécution du Script

1.  **Configurez vos variables d'environnement :**
    ```bash
    export SUPABASE_URL="VOTRE_URL_SUPABASE"
    export SUPABASE_KEY="VOTRE_CLE_ANON_SUPABASE"
    ```
2.  **Exécutez le script Python :**
    ```bash
    python generate_embeddings.py
    ```

Ce script doit être exécuté une première fois pour initialiser les embeddings. Par la suite, il devra être exécuté régulièrement ou déclenché par des événements (par exemple, la création/modification d'un exposant, d'un produit ou d'un profil utilisateur) pour maintenir les embeddings à jour. Pour une mise à jour en temps réel, l'intégration de la génération d'embeddings dans les fonctions backend (Edge Functions ou Cloud Functions) lors de la création/modification des entités serait l'approche la plus robuste.

## Conclusion

La préparation des données est une étape fondamentale pour le moteur de recommandation. L'activation de `pgvector` et la création des tables d'embeddings, combinées à un processus de génération d'embeddings, jetteront les bases pour la phase d'implémentation du moteur de recommandation lui-même.
