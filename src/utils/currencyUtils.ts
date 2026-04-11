/**
 * Utilitaires de conversion de devises avec cache TTL 24h.
 *
 * Fix P1-1 : Remplacement du taux EUR→MAD statique (11) par une valeur
 * mise en cache depuis une API externe avec fallback.
 */

const CACHE_KEY_PREFIX = 'sib_exchange_rate_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

interface CachedRate {
  rate: number;
  timestamp: number;
}

/**
 * Récupère le taux de change depuis le cache ou l'API.
 * API publique sans clé requise : Frankfurter (hébergée par Frankfurter.app / BCE).
 * En cas d'échec, le fallback est utilisé.
 */
export async function getExchangeRate(
  from: string,
  to: string,
  fallbackRate: number
): Promise<number> {
  const cacheKey = `${CACHE_KEY_PREFIX}${from}_${to}`;

  // 1. Vérifier le cache localStorage
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { rate, timestamp }: CachedRate = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return rate;
      }
    }
  } catch {
    // cache illisible — continuer
  }

  // 2. Appeler l'API Frankfurter (données BCE, sans clé API)
  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const json = await res.json();
      const rate: number = json.rates?.[to];
      if (rate && rate > 0) {
        // 3. Mettre en cache
        const entry: CachedRate = { rate, timestamp: Date.now() };
        localStorage.setItem(cacheKey, JSON.stringify(entry));
        return rate;
      }
    }
  } catch {
    // réseau indisponible — utiliser le fallback
  }

  // 4. Fallback au taux statique
  console.warn(
    `[currencyUtils] Impossible de récupérer le taux ${from}→${to}. Fallback: ${fallbackRate}`
  );
  return fallbackRate;
}

/**
 * Convertit un montant EUR en MAD avec taux dynamique (cache 24h).
 * Fallback : 1 EUR = 10.8 MAD (approximation BCE mi-2025).
 */
export async function convertEURtoMAD(amountEUR: number): Promise<number> {
  const rate = await getExchangeRate('EUR', 'MAD', 10.8);
  return Math.round(amountEUR * rate * 100) / 100;
}

/**
 * Version synchrone avec le taux mis en cache (peut retourner le fallback
 * si le cache est vide). Utile pour les composants qui ne peuvent pas être async.
 */
export function convertEURtoMADSync(amountEUR: number): number {
  const cacheKey = `${CACHE_KEY_PREFIX}EUR_MAD`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { rate, timestamp }: CachedRate = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return Math.round(amountEUR * rate * 100) / 100;
      }
    }
  } catch {
    // cache illisible
  }
  // Fallback BCE approximatif
  return Math.round(amountEUR * 10.8 * 100) / 100;
}
