/**
 * Traducteur automatique pour articles
 * Utilise MyMemory API gratuite avec gestion de cache et division des textes longs
 */

export interface TranslatedArticle {
  title: string;
  excerpt: string;
  content: string;
}

// Cache localStorage pour éviter les requêtes répétées
const CACHE_KEY_PREFIX = 'article_translation_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 jours

interface CachedTranslation {
  text: string;
  timestamp: number;
}

/**
 * Récupère une traduction depuis le cache
 */
function getCachedTranslation(text: string, targetLang: string): string | null {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${targetLang}_${text.substring(0, 100)}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed: CachedTranslation = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
        console.log('[Translation] Using cached translation');
        return parsed.text;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn('[Translation] Cache read error:', error);
  }

  return null;
}

/**
 * Sauvegarde une traduction dans le cache
 */
function setCachedTranslation(text: string, targetLang: string, translated: string): void {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${targetLang}_${text.substring(0, 100)}`;
    const cached: CachedTranslation = {
      text: translated,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cached));
  } catch (error) {
    console.warn('[Translation] Cache write error:', error);
  }
}

/**
 * Détecte la langue du texte
 */
export function detectLanguage(text: string): string {
  if (!text) {return 'fr';}

  const frenchWords = ['le', 'la', 'de', 'et', 'est', 'des', 'pour', 'que', 'les', 'une', 'dans', 'sur'];
  const englishWords = ['the', 'and', 'is', 'of', 'to', 'in', 'for', 'that', 'with', 'on', 'as', 'by'];

  const words = text.toLowerCase().split(/\s+/).slice(0, 30);
  const frenchCount = words.filter(w => frenchWords.includes(w)).length;
  const englishCount = words.filter(w => englishWords.includes(w)).length;

  return frenchCount > englishCount ? 'fr' : 'en';
}

/**
 * Divise un long texte en morceaux de 400 caractères maximum
 */
function splitText(text: string, maxLength: number = 400): string[] {
  if (!text || text.length <= maxLength) {return [text];}

  const chunks: string[] = [];
  const sentences = text.split(/([.!?]\s+)/);
  let currentChunk = '';

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Traduit un texte avec MyMemory API (max 500 caractères)
 */
async function translateWithMyMemory(text: string, targetLanguage: string = 'en'): Promise<string> {
  if (!text || text.trim() === '') {return '';}

  // Vérifier le cache
  const cached = getCachedTranslation(text, targetLanguage);
  if (cached) {return cached;}

  try {
    // MyMemory API gratuite - max 500 caractères
    const truncatedText = text.substring(0, 450); // Laisser une marge
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncatedText)}&langpair=fr|${targetLanguage}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.warn('[Translation] API returned error:', response.status);
      return text;
    }

    const data = await response.json();

    if (data?.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      setCachedTranslation(text, targetLanguage, translated);
      return translated;
    }

    return text;
  } catch (error) {
    console.error('[Translation] API error:', error);
    return text;
  }
}

/**
 * Traduit un long texte en le divisant en morceaux
 */
async function translateLongText(text: string, targetLanguage: string = 'en'): Promise<string> {
  if (!text) {return '';}

  // Vérifier le cache complet
  const cached = getCachedTranslation(text, targetLanguage);
  if (cached) {return cached;}

  try {
    const chunks = splitText(text, 400);
    console.log(`[Translation] Splitting text into ${chunks.length} chunks`);

    const translatedChunks: string[] = [];

    // Traduire chaque morceau avec un délai pour éviter le rate limiting
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      if (chunk.trim() === '') {
        translatedChunks.push(chunk);
        continue;
      }

      const translated = await translateWithMyMemory(chunk, targetLanguage);
      translatedChunks.push(translated);

      // Délai entre les requêtes pour éviter le rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    const fullTranslation = translatedChunks.join(' ');
    setCachedTranslation(text, targetLanguage, fullTranslation);

    return fullTranslation;
  } catch (error) {
    console.error('[Translation] Long text translation failed:', error);
    return text;
  }
}

/**
 * Traduit un article entier
 */
export async function translateArticle(
  article: any,
  targetLanguage: string = 'en'
): Promise<TranslatedArticle> {
  if (!article) {
    return { title: '', excerpt: '', content: '' };
  }

  console.log('[Translation] Starting article translation to', targetLanguage);

  // Si l'article est déjà dans la langue cible, pas besoin de traduire
  const currentLang = detectLanguage(article.title || article.excerpt || '');
  if (currentLang === targetLanguage) {
    console.log('[Translation] Article already in target language');
    return {
      title: article.title || '',
      excerpt: article.excerpt || '',
      content: article.content || ''
    };
  }

  try {
    // Traduction parallèle du titre et de l'extrait (courts)
    const [translatedTitle, translatedExcerpt] = await Promise.all([
      translateWithMyMemory(article.title || '', targetLanguage),
      translateWithMyMemory(article.excerpt || '', targetLanguage)
    ]);

    // Traduction séquentielle du contenu (long) avec division
    const translatedContent = await translateLongText(article.content || '', targetLanguage);

    console.log('[Translation] Article translation completed');

    return {
      title: translatedTitle,
      excerpt: translatedExcerpt,
      content: translatedContent
    };
  } catch (error) {
    console.error('[Translation] Article translation failed:', error);
    // Retourner l'original en cas d'erreur
    return {
      title: article.title || '',
      excerpt: article.excerpt || '',
      content: article.content || ''
    };
  }
}

/**
 * Nettoie le cache de traduction
 */
export function clearTranslationCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('[Translation] Cache cleared');
  } catch (error) {
    console.warn('[Translation] Cache clear error:', error);
  }
}

