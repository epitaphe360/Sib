-- ============================================================================
-- AI B2B Matching — Setup pgvector pour SIB 2026
-- À exécuter une seule fois dans Supabase → SQL Editor
-- ============================================================================

-- 1. Activer l'extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Ajouter la colonne d'embedding à la table exhibitors
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

-- 3. Index IVFFLAT pour la recherche vectorielle rapide
--    (lists=100 est optimal pour <100k lignes, augmenter à sqrt(N) sinon)
CREATE INDEX IF NOT EXISTS exhibitors_embedding_idx
  ON exhibitors USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Fonction RPC de recherche par similarité cosinus
CREATE OR REPLACE FUNCTION match_exhibitors(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  company_name text,
  sector text,
  description text,
  logo_url text,
  website text,
  stand_number text,
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.company_name,
    e.sector,
    e.description,
    e.logo_url,
    e.website,
    e.stand_number,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM exhibitors e
  WHERE e.embedding IS NOT NULL
    AND e.is_published = true
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- 5. Permissions : autoriser l'appel depuis le client (anon + authenticated)
GRANT EXECUTE ON FUNCTION match_exhibitors(vector, float, int) TO anon, authenticated, service_role;

-- ============================================================================
-- Vérification
-- ============================================================================
-- SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'exhibitors' AND column_name LIKE 'embedding%';
