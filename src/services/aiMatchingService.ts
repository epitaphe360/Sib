/**
 * Service de matching B2B par embeddings vectoriels — SIB 2026
 *
 * Stratégie :
 *  - Utilise l'Edge Function Supabase "match-exhibitors" (appel serveur sécurisé)
 *  - Fallback sur le matching BTP local (advancedMatchingService) si Edge Function indisponible
 *  - Scores combinés : sémantique (cosinus) + secteur + tags BTP
 *
 * L'Edge Function utilise pgvector + text-embedding-3-small d'OpenAI.
 * Si les clés ne sont pas configurées, le fallback est transparent.
 */
import { supabase } from '../lib/supabase';
import { runAdvancedMatching, type MatchingResponse } from './advancedMatchingService';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AIMatchResult {
  id: string;
  companyName: string;
  sector: string;
  description: string;
  logo?: string;
  website?: string;
  standNumber?: string;
  score: number;         // 0–100, score final combiné
  semanticScore?: number; // score cosinus pgvector (0–1)
  matchReasons: string[];
  tags: string[];
  source: 'ai' | 'local'; // origine du score
}

export interface AIMatchingResponse {
  query: string;
  results: AIMatchResult[];
  totalCandidates: number;
  durationMs: number;
  usedAI: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function mergeWithLocalScores(
  aiResults: AIMatchResult[],
  localResponse: MatchingResponse
): AIMatchResult[] {
  const localMap = new Map(localResponse.results.map(r => [r.id, r]));

  return aiResults.map(ai => {
    const local = localMap.get(ai.id);
    if (!local) return ai;

    // Score combiné : 70% sémantique + 30% BTP tags
    const combined = Math.round(ai.score * 0.7 + local.score * 0.3);
    return {
      ...ai,
      score: combined,
      matchReasons: Array.from(new Set([...ai.matchReasons, ...local.matchReasons])),
      tags: Array.from(new Set([...ai.tags, ...local.tags])),
    };
  });
}

// ─── Fonction principale ────────────────────────────────────────────────────────

/**
 * Recherche B2B intelligente :
 * 1. Appel à l'Edge Function Supabase "match-exhibitors"
 * 2. Fallback transparent sur le moteur BTP local si erreur / non configuré
 */
export async function runAIMatching(query: string): Promise<AIMatchingResponse> {
  const start = Date.now();

  // ── Tentative Edge Function ──────────────────────────────────────────────
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('match-exhibitors', {
        body: { query, limit: 20 },
      });

      if (!error && data?.results?.length > 0) {
        const aiResults: AIMatchResult[] = (data.results as Array<{
          id: string;
          company_name: string;
          sector: string;
          description: string;
          logo_url?: string;
          website?: string;
          stand_number?: string;
          similarity: number;
        }>).map(r => ({
          id: r.id,
          companyName: r.company_name,
          sector: r.sector || '',
          description: r.description || '',
          logo: r.logo_url,
          website: r.website,
          standNumber: r.stand_number,
          score: Math.round(r.similarity * 100),
          semanticScore: r.similarity,
          matchReasons: [`Similarité sémantique : ${Math.round(r.similarity * 100)}%`],
          tags: [],
          source: 'ai' as const,
        }));

        // Enrichir avec les scores BTP locaux
        const localResponse = await runAdvancedMatching(query);
        const merged = mergeWithLocalScores(aiResults, localResponse);
        merged.sort((a, b) => b.score - a.score);

        return {
          query,
          results: merged,
          totalCandidates: data.totalCandidates || merged.length,
          durationMs: Date.now() - start,
          usedAI: true,
        };
      }
    } catch {
      // Edge function non déployée ou clés manquantes → fallback silencieux
    }
  }

  // ── Fallback : moteur BTP local ──────────────────────────────────────────
  const local = await runAdvancedMatching(query);
  return {
    query,
    results: local.results.map(r => ({ ...r, source: 'local' as const })),
    totalCandidates: local.totalCandidates,
    durationMs: Date.now() - start,
    usedAI: false,
  };
}

// ─── Edge Function SQL (déploiement Supabase) ───────────────────────────────
/**
 * SQL à exécuter dans Supabase pour activer pgvector :
 *
 * -- 1. Activer l'extension
 * CREATE EXTENSION IF NOT EXISTS vector;
 *
 * -- 2. Ajouter la colonne d'embedding aux exposants
 * ALTER TABLE exhibitors ADD COLUMN IF NOT EXISTS embedding vector(1536);
 *
 * -- 3. Index IVFFLAT pour la recherche rapide
 * CREATE INDEX IF NOT EXISTS exhibitors_embedding_idx
 *   ON exhibitors USING ivfflat (embedding vector_cosine_ops)
 *   WITH (lists = 100);
 *
 * -- 4. Fonction de recherche vectorielle
 * CREATE OR REPLACE FUNCTION match_exhibitors(
 *   query_embedding vector(1536),
 *   match_threshold float DEFAULT 0.3,
 *   match_count int DEFAULT 20
 * )
 * RETURNS TABLE (
 *   id uuid, company_name text, sector text,
 *   description text, logo_url text, website text,
 *   stand_number text, similarity float
 * )
 * LANGUAGE plpgsql AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT e.id, e.company_name, e.sector, e.description,
 *          e.logo_url, e.website, e.stand_number,
 *          1 - (e.embedding <=> query_embedding) AS similarity
 *   FROM exhibitors e
 *   WHERE e.embedding IS NOT NULL
 *     AND 1 - (e.embedding <=> query_embedding) > match_threshold
 *   ORDER BY similarity DESC
 *   LIMIT match_count;
 * END;
 * $$;
 */
export const AI_MATCHING_SQL_SETUP = `/* Voir commentaires dans aiMatchingService.ts */`;
