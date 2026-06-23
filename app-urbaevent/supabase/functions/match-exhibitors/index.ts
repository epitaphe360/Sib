/**
 * Edge Function : match-exhibitors
 * AI B2B Matching pour SIB 2026
 *
 * Flux :
 *  1. Reçoit { query: string, limit?: number }
 *  2. Vectorise la query via OpenAI text-embedding-3-small
 *  3. Recherche les exposants similaires via pgvector (fonction match_exhibitors)
 *  4. Retourne les résultats triés par similarité cosinus
 *
 * Variables d'environnement requises (Supabase Dashboard → Settings → Secrets) :
 *   OPENAI_API_KEY      — clé OpenAI
 *   SUPABASE_URL        — injecté automatiquement par Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — injecté automatiquement par Supabase
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RequestBody {
  query: string;
  limit?: number;
  threshold?: number;
}

interface ExhibitorRow {
  id: string;
  company_name: string;
  sector: string;
  description: string;
  logo_url?: string;
  website?: string;
  stand_number?: string;
  similarity: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Appelle l'API OpenAI pour vectoriser un texte.
 * Retourne un tableau de 1536 floats (modèle text-embedding-3-small).
 */
async function embedText(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // limite tokens OpenAI
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embedding error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}

// ─── Handler principal ────────────────────────────────────────────────────────

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // ── Validation du body ───────────────────────────────────────────────────
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Corps JSON invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, limit = 20, threshold = 0.3 } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Paramètre "query" requis (min 2 caractères)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limiter les abus — max 50 résultats par appel
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const safeThreshold = Math.min(Math.max(0, threshold), 1);

    // ── Client Supabase (service role pour accès complet) ────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // ── Récupérer la clé OpenAI : env var d'abord, puis app_settings ────────
    let openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      const { data: settingRow } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'OPENAI_API_KEY')
        .maybeSingle();
      openaiKey = settingRow?.value || '';
    }
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY non configurée (ni en secret ni dans app_settings)' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const start = Date.now();

    // ── 1. Vectoriser la requête ─────────────────────────────────────────────
    console.log(`[match-exhibitors] Vectorisation de : "${query.slice(0, 80)}..."`);
    const embedding = await embedText(query.trim(), openaiKey);

    // ── 2. Recherche vectorielle pgvector ────────────────────────────────────
    const { data: results, error } = await supabase.rpc('match_exhibitors', {
      query_embedding: embedding,
      match_threshold: safeThreshold,
      match_count: safeLimit,
    });

    if (error) {
      console.error('[match-exhibitors] Erreur RPC:', error);
      return new Response(
        JSON.stringify({ error: `Erreur recherche vectorielle: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rows = (results || []) as ExhibitorRow[];
    const durationMs = Date.now() - start;

    console.log(`[match-exhibitors] ${rows.length} résultats en ${durationMs}ms`);

    // ── 3. Réponse ────────────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        query,
        results: rows,
        totalCandidates: rows.length,
        durationMs,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    console.error('[match-exhibitors] Erreur non gérée:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
