-- Migration pour améliorer la table products avec les nouveaux champs
-- Date: 2025-12-29
-- Description: Ajout de champs pour la modal produit améliorée

-- Créer la colonne 'image' si elle n'existe pas (pour compatibilité)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image text;

-- Ajouter les colonnes pour les nouvelles fonctionnalités
-- Note: la colonne 'images' existe déjà en text[], on ne la recrée pas
ALTER TABLE products
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS certified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_time text,
ADD COLUMN IF NOT EXISTS original_price text,
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb;

-- Migrer les données de 'image' vers 'images' si la colonne contient des données
-- La colonne images est de type text[], on utilise array_append
UPDATE products
SET images = ARRAY[image]::text[]
WHERE image IS NOT NULL 
  AND image != '' 
  AND (images IS NULL OR array_length(images, 1) IS NULL);

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN products.images IS 'Tableau d''URLs d''images du produit (text[] array - compatible avec le schema existant)';
COMMENT ON COLUMN products.video_url IS 'URL de la vidéo de démonstration (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN products.is_new IS 'Indique si le produit est nouveau';
COMMENT ON COLUMN products.in_stock IS 'Indique si le produit est en stock';
COMMENT ON COLUMN products.certified IS 'Indique si le produit a des certifications';
COMMENT ON COLUMN products.delivery_time IS 'Délai de livraison estimé';
COMMENT ON COLUMN products.original_price IS 'Prix original avant réduction';
COMMENT ON COLUMN products.documents IS 'Documents téléchargeables (fiches techniques, catalogues) - JSONB array of {name, type, size, url}';

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_certified ON products(certified) WHERE certified = true;

-- Exemples de données pour les documents (structure JSON)
-- {
--   "name": "Fiche technique",
--   "type": "pdf",
--   "size": "2.3 MB",
--   "url": "https://example.com/document.pdf"
-- }

-- Note: Cette migration gère automatiquement la transition
-- - Crée la colonne 'image' si elle n'existe pas
-- - Migre les données de 'image' vers 'images' si des données existent
-- - Les colonnes existantes sont conservées
-- - Les nouveaux champs sont des ajouts, pas des remplacements

-- Vérification de la structure finale
SELECT 
  id,
  name,
  images,
  video_url,
  is_new,
  in_stock,
  certified,
  delivery_time,
  documents
FROM products
LIMIT 5;
