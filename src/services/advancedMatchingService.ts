import { supabase } from '../lib/supabase';
import {
  extractTagsFromQuery,
  scoreExhibitorForTags,
  normalizeText,
  FR_STOPWORDS,
  SECTOR_LABELS,
} from '../lib/btpDictionary';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MatchingResult {
  id: string;
  companyName: string;
  sector: string;
  description: string;
  logo?: string;
  website?: string;
  standNumber?: string;
  score: number;         // 0-100
  matchReasons: string[]; // Raisons intelligibles pour l'utilisateur
  tags: string[];        // Tags BTP extraits
}

export interface MatchingResponse {
  query: string;
  extractedTags: string[];
  extractedTagLabels: string[];
  results: MatchingResult[];
  totalCandidates: number;
  durationMs: number;
}

// ─── Données exposant depuis Supabase ──────────────────────────────────────────

interface ExhibitorRow {
  id: string;
  company_name: string;
  sector?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  stand_number?: string;
  category?: string;
  contact_info?: { country?: string };
  is_published?: boolean;
}

// ─── Moteur de matching principal ──────────────────────────────────────────────

/**
 * Extrait les tokens significatifs d'une requête (sans stopwords).
 */
function extractQueryTokens(query: string): string[] {
  const normalized = normalizeText(query);
  return normalized
    .split(/[\s,;.!?/-]+/)
    .filter(t => t.length > 2 && !FR_STOPWORDS.has(t));
}

/**
 * Construit le texte d'un exposant pour le scoring (concatène tous les champs pertinents).
 */
function buildExhibitorText(e: ExhibitorRow): string {
  return [
    e.company_name || '',
    e.sector || '',
    e.description || '',
    e.category || '',
    e.contact_info?.country || '',
  ].join(' ');
}

/**
 * Génère des raisons lisibles pour l'affichage.
 */
function buildMatchReasons(
  exhibitor: ExhibitorRow,
  tags: string[],
  queryTokens: string[]
): string[] {
  const reasons: string[] = [];
  const normalizedText = normalizeText(buildExhibitorText(exhibitor));

  // Raisons sectorielles
  for (const tag of tags) {
    const label = SECTOR_LABELS[tag];
    if (!label) {continue;}
    const normalizedLabel = normalizeText(label);
    if (
      normalizedText.includes(normalizedLabel) ||
      normalizedText.includes(tag.replace('-', ' '))
    ) {
      reasons.push(`Spécialisé en ${label}`);
    }
  }

  // Raisons géographiques
  const geoTags = tags.filter(t => t.startsWith('geo-'));
  for (const geo of geoTags) {
    const label = SECTOR_LABELS[geo];
    if (label && reasons.findIndex(r => r.includes(label)) === -1) {
      const country = exhibitor.contact_info?.country || '';
      if (normalizeText(country).includes(normalizeText(label))) {
        reasons.push(`Présence en ${label}`);
      }
    }
  }

  // Raisons par token direct
  for (const token of queryTokens) {
    if (token.length > 4 && normalizedText.includes(token)) {
      const capitalized = token.charAt(0).toUpperCase() + token.slice(1);
      if (!reasons.some(r => r.toLowerCase().includes(token))) {
        reasons.push(`Activité liée à "${capitalized}"`);
      }
    }
  }

  // Raison par défaut si rien trouvé mais score > 0
  if (reasons.length === 0) {
    reasons.push('Professionnel du secteur BTP');
  }

  return [...new Set(reasons)].slice(0, 4); // max 4 raisons
}

/**
 * Scoring complet d'un exposant :
 * - Score sémantique (tags BTP) : 0-60 pts
 * - Score textuel direct (tokens) : 0-30 pts
 * - Bonus stand/publication : 0-10 pts
 */
function scoreExhibitor(
  exhibitor: ExhibitorRow,
  tags: string[],
  queryTokens: string[]
): number {
  const exhibitorText = buildExhibitorText(exhibitor);
  let score = scoreExhibitorForTags(exhibitorText, tags, queryTokens);

  // Bonus si exposant publié / vérifié
  if (exhibitor.is_published) {score += 5;}

  // Bonus si stand attribué (exposant confirmé)
  if (exhibitor.stand_number) {score += 5;}

  return Math.min(100, score);
}

// ─── Fonction principale exportée ─────────────────────────────────────────────

/**
 * Exécute un matching avancé sur tous les exposants.
 * @param query  - Texte libre de l'utilisateur
 * @param limit  - Nombre max de résultats (défaut: 20)
 */
export async function runAdvancedMatching(
  query: string,
  limit = 20
): Promise<MatchingResponse> {
  const startTime = Date.now();

  if (!query.trim()) {
    return {
      query,
      extractedTags: [],
      extractedTagLabels: [],
      results: [],
      totalCandidates: 0,
      durationMs: 0,
    };
  }

  // 1. Extraire les tags BTP et tokens de la requête
  const tags = extractTagsFromQuery(query);
  const queryTokens = extractQueryTokens(query);
  const extractedTagLabels = tags.map(t => SECTOR_LABELS[t] || t);

  // 2. Charger tous les exposants publiés depuis Supabase
  let exhibitors: ExhibitorRow[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('exhibitors')
        .select(
          'id, company_name, sector, description, logo_url, website, stand_number, category, contact_info, is_published'
        )
        .order('company_name', { ascending: true });

      if (!error && data) {
        exhibitors = data as ExhibitorRow[];
      }
    } catch (err) {
      console.error('❌ Erreur chargement exposants pour matching:', err);
    }
  }

  if (exhibitors.length === 0) {
    return {
      query,
      extractedTags: tags,
      extractedTagLabels,
      results: [],
      totalCandidates: 0,
      durationMs: Date.now() - startTime,
    };
  }

  // 3. Scorer chaque exposant
  const scored: Array<{ exhibitor: ExhibitorRow; score: number }> = [];

  for (const exhibitor of exhibitors) {
    const score = scoreExhibitor(exhibitor, tags, queryTokens);
    if (score > 5) {
      scored.push({ exhibitor, score });
    }
  }

  // 4. Trier par score décroissant
  scored.sort((a, b) => b.score - a.score);

  // 5. Prendre les top N résultats
  const topResults = scored.slice(0, limit);

  // 6. Construire les résultats finaux
  const results: MatchingResult[] = topResults.map(({ exhibitor, score }) => ({
    id: exhibitor.id,
    companyName: exhibitor.company_name,
    sector: exhibitor.sector || 'Secteur non renseigné',
    description: exhibitor.description || '',
    logo: exhibitor.logo_url || undefined,
    website: exhibitor.website || undefined,
    standNumber: exhibitor.stand_number || undefined,
    score,
    matchReasons: buildMatchReasons(exhibitor, tags, queryTokens),
    tags,
  }));

  return {
    query,
    extractedTags: tags,
    extractedTagLabels,
    results,
    totalCandidates: exhibitors.length,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Suggestions rapides de recherche pour l'autocomplete.
 */
export const QUICK_SEARCH_SUGGESTIONS = [
  'Fournisseur béton préfabriqué Maroc',
  'BIM et maquette numérique',
  'Matériaux bas carbone et décarbonation',
  'Équipements de chantier et sécurité',
  'Énergie solaire et renouvelables',
  'Smart Building et IoT',
  'VRD et infrastructure',
  'Bureau d\'études structure',
  'Partenariat export Afrique',
  'Finitions et revêtements intérieurs',
  'Promotion immobilière résidentielle',
  'Formation certification BTP',
  'Innovation et startups construction',
  'MEP climatisation ventilation',
  'Isolation thermique et acoustique',
];
