/**
 * Dictionnaire BTP sectoriel pour le matching avancé.
 * Chaque entrée mappe des mots-clés de recherche vers des tags normalisés.
 * Zéro dépendance externe — fonctionne 100% côté client.
 */

// ─── Synonymes → Tags normalisés ───────────────────────────────────────────────
export const BTP_SYNONYMS: Record<string, string[]> = {
  // Gros Oeuvre
  'béton': ['gros-oeuvre', 'materiaux', 'construction'],
  'beton': ['gros-oeuvre', 'materiaux', 'construction'],
  'ciment': ['gros-oeuvre', 'materiaux'],
  'coffrages': ['gros-oeuvre'],
  'maçonnerie': ['gros-oeuvre'],
  'maconnerie': ['gros-oeuvre'],
  'fondations': ['gros-oeuvre', 'structure'],
  'charpente': ['gros-oeuvre', 'structure'],
  'ferraillage': ['gros-oeuvre', 'structure'],
  'acier': ['structure', 'materiaux'],

  // Préfabrication
  'préfabriqué': ['prefabrication', 'industrialisation'],
  'prefabrique': ['prefabrication', 'industrialisation'],
  'préfabrication': ['prefabrication', 'industrialisation'],
  'prefabrication': ['prefabrication', 'industrialisation'],
  'modulaire': ['prefabrication', 'industrialisation'],
  'industrialisation': ['industrialisation', 'prefabrication'],

  // MEP / CVC
  'électricité': ['mep', 'electricite'],
  'electricite': ['mep', 'electricite'],
  'plomberie': ['mep', 'cvc'],
  'chauffage': ['mep', 'cvc'],
  'climatisation': ['mep', 'cvc'],
  'ventilation': ['mep', 'cvc'],
  'hvac': ['mep', 'cvc'],
  'cvc': ['mep', 'cvc'],
  'sanitaire': ['mep', 'cvc'],
  'tuyauterie': ['mep', 'cvc'],

  // Finitions & Revêtements
  'carrelage': ['finitions', 'revetements'],
  'peinture': ['finitions'],
  'enduits': ['finitions'],
  'isolation': ['finitions', 'energie'],
  'plâtrerie': ['finitions'],
  'platrerie': ['finitions'],
  'menuiserie': ['finitions', 'second-oeuvre'],
  'faux plafond': ['finitions', 'second-oeuvre'],
  'sol': ['finitions', 'revetements'],
  'façade': ['finitions', 'second-oeuvre'],
  'facade': ['finitions', 'second-oeuvre'],
  'bardage': ['finitions', 'second-oeuvre'],
  'vitrage': ['finitions', 'second-oeuvre'],

  // Énergie & Renouvelables
  'solaire': ['energie', 'renouvelables'],
  'photovoltaïque': ['energie', 'renouvelables'],
  'photovoltaique': ['energie', 'renouvelables'],
  'éolien': ['energie', 'renouvelables'],
  'eolien': ['energie', 'renouvelables'],
  'énergie renouvelable': ['energie', 'renouvelables'],
  'energie renouvelable': ['energie', 'renouvelables'],
  'efficacité énergétique': ['energie', 'smart-building'],
  'efficacite energetique': ['energie', 'smart-building'],
  'stockage énergie': ['energie', 'renouvelables'],

  // Smart Building & BIM
  'bim': ['bim', 'digital'],
  'maquette numérique': ['bim', 'digital'],
  'maquette numerique': ['bim', 'digital'],
  'smart building': ['smart-building', 'iot'],
  'iot': ['iot', 'smart-building'],
  'domotique': ['smart-building', 'iot'],
  'gtb': ['smart-building', 'iot'],
  'intelligence artificielle': ['ia', 'digital'],
  'ia': ['ia', 'digital'],
  'digitalisation': ['digital', 'bim'],
  'numérique': ['digital'],
  'numerique': ['digital'],

  // Architecture & Bureau d'Études
  'architecture': ['architecture', 'bureau-etudes'],
  'bureau d\'études': ['bureau-etudes'],
  'bureau d etudes': ['bureau-etudes'],
  'ingénierie': ['ingenierie', 'bureau-etudes'],
  'ingenierie': ['ingenierie', 'bureau-etudes'],
  'conception': ['architecture', 'bureau-etudes'],
  'design': ['architecture'],
  'structure': ['structure', 'ingenierie'],
  'calcul de structure': ['structure', 'ingenierie'],

  // VRD & Terrassement
  'vrd': ['vrd', 'terrassement'],
  'voirie': ['vrd'],
  'réseaux': ['vrd', 'infrastructure'],
  'reseaux': ['vrd', 'infrastructure'],
  'terrassement': ['terrassement', 'vrd'],
  'assainissement': ['vrd', 'infrastructure'],
  'infrastructure': ['infrastructure', 'vrd'],
  'route': ['vrd', 'infrastructure'],

  // Promotion Immobilière
  'immobilier': ['immobilier', 'promotion'],
  'promoteur': ['promotion', 'immobilier'],
  'promotion immobilière': ['promotion', 'immobilier'],
  'promotion immobiliere': ['promotion', 'immobilier'],
  'lotissement': ['promotion', 'immobilier'],
  'résidentiel': ['immobilier'],
  'residentiel': ['immobilier'],

  // Sécurité
  'sécurité': ['securite', 'securite-incendie'],
  'securite': ['securite', 'securite-incendie'],
  'incendie': ['securite-incendie'],
  'sprinkler': ['securite-incendie'],
  'détection incendie': ['securite-incendie'],
  'epi': ['securite'],
  'équipements de protection': ['securite'],

  // Matériaux
  'bois': ['materiaux', 'bois'],
  'brique': ['materiaux', 'gros-oeuvre'],
  'granit': ['materiaux'],
  'marbre': ['materiaux', 'finitions'],
  'composite': ['materiaux'],
  'matériaux': ['materiaux'],
  'materiaux': ['materiaux'],
  'matériaux bas carbone': ['materiaux', 'environnement'],
  'materiaux ecologiques': ['materiaux', 'environnement'],

  // Environnement & Développement Durable
  'carbone': ['environnement', 'decarbonation'],
  'décarbonation': ['decarbonation', 'environnement'],
  'decarbonation': ['decarbonation', 'environnement'],
  'écologie': ['environnement'],
  'ecologie': ['environnement'],
  'vert': ['environnement'],
  'durable': ['environnement'],
  'hqe': ['environnement', 'certification'],
  'leed': ['environnement', 'certification'],
  'bbca': ['environnement', 'certification'],
  'économie circulaire': ['environnement', 'decarbonation'],
  'economie circulaire': ['environnement', 'decarbonation'],

  // Formation & Certification
  'formation': ['formation'],
  'certification': ['formation', 'certification'],
  'btp safety': ['formation', 'securite'],
  'compétences': ['formation'],
  'competences': ['formation'],

  // Équipements de Chantier
  'grue': ['equipements-chantier'],
  'engin': ['equipements-chantier'],
  'scaffold': ['equipements-chantier'],
  'échafaudage': ['equipements-chantier'],
  'echafaudage': ['equipements-chantier'],
  'outillage': ['equipements-chantier'],
  'équipements': ['equipements-chantier'],
  'materiel de chantier': ['equipements-chantier'],

  // Géographies
  'afrique': ['geo-afrique'],
  'maroc': ['geo-maroc', 'geo-maghreb', 'geo-afrique'],
  'maghreb': ['geo-maghreb', 'geo-afrique'],
  'tunisie': ['geo-maghreb', 'geo-afrique'],
  'senegal': ['geo-afrique-subsaharienne', 'geo-afrique'],
  'sénégal': ['geo-afrique-subsaharienne', 'geo-afrique'],
  'côte d\'ivoire': ['geo-afrique-subsaharienne', 'geo-afrique'],
  'côte divoire': ['geo-afrique-subsaharienne', 'geo-afrique'],
  'europe': ['geo-europe'],
  'france': ['geo-europe', 'geo-france'],
  'espagne': ['geo-europe'],
  'export': ['geo-international', 'export'],
  'international': ['geo-international'],
  'moyen-orient': ['geo-moyen-orient'],
  'golf': ['geo-moyen-orient'],
  'émirats': ['geo-moyen-orient'],
  'emirats': ['geo-moyen-orient'],

  // Business & Collaboration
  'partenariat': ['partenariat', 'collaboration'],
  'fournisseur': ['fournisseur', 'achat'],
  'distributeur': ['distribution'],
  'sous-traitant': ['sous-traitance'],
  'investissement': ['investissement'],
  'joint-venture': ['joint-venture', 'collaboration'],
  'transfert de technologie': ['technologie', 'collaboration'],
  'r&d': ['rd', 'innovation'],
  'innovation': ['innovation'],
  'startup': ['startup', 'innovation'],
};

// ─── Secteurs normalisés → Labels affichés ────────────────────────────────────
export const SECTOR_LABELS: Record<string, string> = {
  'gros-oeuvre': 'Gros Oeuvre',
  'second-oeuvre': 'Second Oeuvre',
  'mep': 'MEP / CVC / Électricité',
  'cvc': 'CVC',
  'electricite': 'Électricité',
  'materiaux': 'Matériaux de Construction',
  'finitions': 'Finitions & Revêtements',
  'revetements': 'Revêtements',
  'architecture': 'Architecture',
  'bureau-etudes': 'Bureau d\'Études',
  'ingenierie': 'Ingénierie Structure',
  'promotion': 'Promotion Immobilière',
  'immobilier': 'Immobilier',
  'vrd': 'VRD & Terrassement',
  'terrassement': 'Terrassement',
  'infrastructure': 'Infrastructure',
  'energie': 'Énergie',
  'renouvelables': 'Énergies Renouvelables',
  'bim': 'BIM & Digital Construction',
  'digital': 'Digital',
  'smart-building': 'Smart Building',
  'iot': 'IoT Bâtiment',
  'ia': 'Intelligence Artificielle',
  'securite': 'Sécurité Chantier',
  'securite-incendie': 'Sécurité Incendie',
  'equipements-chantier': 'Équipements de Chantier',
  'bois': 'Bois & Construction Bois',
  'environnement': 'Environnement & Développement Durable',
  'decarbonation': 'Décarbonation',
  'prefabrication': 'Préfabrication',
  'industrialisation': 'Industrialisation',
  'formation': 'Formation & Certification',
  'certification': 'Certification',
  'innovation': 'Innovation & Startups',
  'startup': 'Startups BTP',
  'partenariat': 'Partenariat',
  'collaboration': 'Collaboration',
  'fournisseur': 'Fournisseur',
  'distribution': 'Distribution',
  'sous-traitance': 'Sous-traitance',
  'investissement': 'Investissement',
  'export': 'Export',
  'geo-maroc': 'Maroc',
  'geo-maghreb': 'Maghreb',
  'geo-afrique': 'Afrique',
  'geo-afrique-subsaharienne': 'Afrique Subsaharienne',
  'geo-europe': 'Europe',
  'geo-france': 'France',
  'geo-international': 'International',
  'geo-moyen-orient': 'Moyen-Orient',
};

// ─── Stopwords français à ignorer ─────────────────────────────────────────────
export const FR_STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'en',
  'au', 'aux', 'je', 'me', 'ma', 'mon', 'nous', 'vous', 'ils', 'elles',
  'pour', 'sur', 'sous', 'avec', 'sans', 'mais', 'donc', 'car', 'ni',
  'que', 'qui', 'quoi', 'dont', 'où', 'si', 'ce', 'se', 'sa', 'son',
  'leur', 'leurs', 'tout', 'tous', 'toute', 'être', 'avoir', 'faire',
  'plus', 'très', 'bien', 'aussi', 'là', 'ici', 'alors', 'après',
  'avant', 'dans', 'entre', 'vers', 'par', 'à', 'est', 'sont', 'cette',
  'cet', 'ces', 'il', 'elle', 'nous', 'cherche', 'chercher', 'recherche',
  'veux', 'souhaite', 'aimerais', 'besoin', 'trouver', 'rencontrer',
]);

/**
 * Normalise un texte : minuscules, suppression accents, trim.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents
    .replace(/['']/g, ' ')
    .trim();
}

/**
 * Extrait les tags BTP à partir d'une requête libre.
 * Ex: "je cherche béton préfabriqué Afrique" → ['gros-oeuvre', 'materiaux', 'prefabrication', 'geo-afrique']
 */
export function extractTagsFromQuery(query: string): string[] {
  const normalized = normalizeText(query);
  const tags = new Set<string>();

  // 1. Chercher les phrases multi-mots en premier (ordre longueur décroissante)
  const sortedKeys = Object.keys(BTP_SYNONYMS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    const normalizedKey = normalizeText(key);
    if (normalized.includes(normalizedKey)) {
      BTP_SYNONYMS[key].forEach(tag => tags.add(tag));
    }
  }

  // 2. Tokens individuels
  const tokens = normalized
    .split(/[\s,;.!?/-]+/)
    .filter(t => t.length > 2 && !FR_STOPWORDS.has(t));

  for (const token of tokens) {
    if (BTP_SYNONYMS[token]) {
      BTP_SYNONYMS[token].forEach(tag => tags.add(tag));
    }
  }

  return Array.from(tags);
}

/**
 * Calcule la pertinence d'un texte exposant par rapport aux tags extraits.
 * Retourne un score entre 0 et 100.
 */
export function scoreExhibitorForTags(
  exhibitorText: string,
  tags: string[],
  queryTokens: string[]
): number {
  if (tags.length === 0 && queryTokens.length === 0) {return 0;}

  const normalizedText = normalizeText(exhibitorText);
  let score = 0;
  const reasons: string[] = [];

  // Score par tag trouvé dans le texte exposant
  for (const tag of tags) {
    const tagLabel = normalizeText(SECTOR_LABELS[tag] || tag);
    if (normalizedText.includes(tagLabel) || normalizedText.includes(tag.replace('-', ' '))) {
      score += 15;
      reasons.push(tag);
    }
  }

  // Score par token direct trouvé dans le texte (exact match)
  for (const token of queryTokens) {
    if (token.length > 3 && normalizedText.includes(token)) {
      score += 10;
    }
  }

  return Math.min(100, score);
}
