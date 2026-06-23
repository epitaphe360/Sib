/**
 * DeepSeek AI Service — SIB 2026 B2B Networking
 *
 * Utilise l'API DeepSeek (compatible OpenAI) pour :
 * - Générer des recommandations B2B personnalisées
 * - Créer des amorces de conversation (icebreakers)
 * - Analyser la compatibilité entre profils
 * - Assister le réseautage via un chat IA
 *
 * NOTE SÉCURITÉ : La clé API est exposée côté client via VITE_.
 * Pour la production, migrer vers une Supabase Edge Function.
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

function getApiKey(): string {
  const key = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined;
  if (!key) {
    throw new Error('VITE_DEEPSEEK_API_KEY non définie. Ajoutez-la dans .env.local');
  }
  return key;
}

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekChoice {
  message: DeepSeekMessage;
  finish_reason: string;
}

interface DeepSeekResponse {
  choices: DeepSeekChoice[];
}

async function callDeepSeek(messages: DeepSeekMessage[], maxTokens = 800): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${err}`);
  }

  const data: DeepSeekResponse = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

// ─── Types publics ────────────────────────────────────────────────────────────

export interface B2BProfile {
  id: string;
  name: string;
  company?: string;
  sector?: string;
  description?: string;
  interests?: string[];
  objectives?: string[];
  type: 'exhibitor' | 'partner' | 'visitor';
}

export interface B2BMatch {
  profile: B2BProfile;
  score: number;          // 0-100
  reasons: string[];
  icebreaker: string;     // phrase d'accroche générée par IA
}

export interface NetworkingRecommendation {
  matches: B2BMatch[];
  strategy: string;       // conseil global de l'IA
  topSectors: string[];
}

// ─── Fonctions publiques ───────────────────────────────────────────────────────

/**
 * Génère des recommandations B2B personnalisées basées sur le profil de l'utilisateur
 */
export async function generateB2BRecommendations(
  userProfile: B2BProfile,
  candidates: B2BProfile[]
): Promise<NetworkingRecommendation> {
  if (candidates.length === 0) {
    return { matches: [], strategy: '', topSectors: [] };
  }

  const profileSummary = `
Profil utilisateur :
- Nom : ${userProfile.name}
- Entreprise : ${userProfile.company ?? 'Non précisé'}
- Secteur : ${userProfile.sector ?? 'Non précisé'}
- Description : ${userProfile.description ?? 'Non précisée'}
- Objectifs : ${(userProfile.objectives ?? []).join(', ') || 'Non précisés'}
- Intérêts : ${(userProfile.interests ?? []).join(', ') || 'Non précisés'}
  `.trim();

  const candidateSummary = candidates.slice(0, 20).map((c, i) =>
    `${i + 1}. [${c.id}] ${c.name} | ${c.company ?? ''} | Secteur: ${c.sector ?? ''} | ${c.description?.slice(0, 100) ?? ''}`
  ).join('\n');

  const systemPrompt = `Tu es un expert en réseautage B2B pour le Salon International du Bâtiment (SIB 2026) au Maroc.
Tu analyses des profils professionnels et génères des recommandations de mise en relation pertinentes.
Réponds UNIQUEMENT en JSON valide, sans markdown ni explication.`;

  const userPrompt = `${profileSummary}

Candidats disponibles (extraits) :
${candidateSummary}

Génère un objet JSON avec cette structure exacte :
{
  "matches": [
    {
      "id": "id_du_candidat",
      "score": 85,
      "reasons": ["raison 1", "raison 2"],
      "icebreaker": "Bonjour, j'ai vu que vous travaillez dans [secteur]..."
    }
  ],
  "strategy": "Conseil global de networking en 2-3 phrases",
  "topSectors": ["secteur1", "secteur2"]
}

Sélectionne les 8 meilleurs matches. Les scores doivent être entre 50 et 100.
Les icebreakers doivent être en français, professionnels et personnalisés.`;

  const raw = await callDeepSeek(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    1200
  );

  // Parser la réponse JSON
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { matches: [], strategy: 'Analyse IA temporairement indisponible.', topSectors: [] };
  }

  let parsed: { matches: Array<{ id: string; score: number; reasons: string[]; icebreaker: string }>; strategy: string; topSectors: string[] };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return { matches: [], strategy: 'Analyse IA temporairement indisponible.', topSectors: [] };
  }

  // Mapper les IDs vers les profils complets
  const profileMap = new Map(candidates.map(c => [c.id, c]));
  const matches: B2BMatch[] = (parsed.matches ?? [])
    .filter(m => profileMap.has(m.id))
    .map(m => ({
      profile: profileMap.get(m.id)!,
      score: Math.min(100, Math.max(0, m.score)),
      reasons: m.reasons ?? [],
      icebreaker: m.icebreaker ?? '',
    }))
    .sort((a, b) => b.score - a.score);

  return {
    matches,
    strategy: parsed.strategy ?? '',
    topSectors: parsed.topSectors ?? [],
  };
}

/**
 * Génère un icebreaker personnalisé pour une mise en relation spécifique
 */
export async function generateIcebreaker(
  sender: B2BProfile,
  recipient: B2BProfile
): Promise<string> {
  const prompt = `Génère une phrase d'accroche professionnelle et naturelle en français (2-3 phrases max) pour que ${sender.name} (${sender.company ?? 'entreprise'}, secteur ${sender.sector ?? 'BTP'}) prenne contact avec ${recipient.name} (${recipient.company ?? 'entreprise'}, secteur ${recipient.sector ?? 'BTP'}) lors du SIB 2026. La phrase doit mentionner un point commun ou une opportunité concrète.`;

  return callDeepSeek([{ role: 'user', content: prompt }], 150);
}

// ─── Chat Assistant B2B ────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const B2B_SYSTEM_PROMPT = `Tu es Alex, l'assistant IA de réseautage B2B du SIB 2026 (Salon International du Bâtiment, Maroc).
Tu aides les participants à maximiser leurs opportunités de networking pendant le salon.
Tu réponds en français, de manière concise, professionnelle et actionnable.
Tu connais le secteur du BTP, de l'immobilier et de la construction au Maroc et en Afrique.
Si on te demande qui tu es ou quel modèle tu es, réponds que tu es Alex, l'assistant IA du SIB 2026.`;

/**
 * Envoie un message au chatbot B2B et retourne la réponse
 */
export async function sendB2BChatMessage(
  history: ChatMessage[],
  newMessage: string
): Promise<string> {
  const messages: DeepSeekMessage[] = [
    { role: 'system', content: B2B_SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: newMessage },
  ];

  return callDeepSeek(messages, 500);
}
