/** Aide à la décision uniquement — jamais une validation technique. */

const FR_EN: Record<string, string> = {
  'bonjour': 'hello',
  'devis': 'quote',
  'échantillon': 'sample',
  'echantillon': 'sample',
  'facture': 'invoice',
  'délai': 'deadline',
  'delai': 'deadline',
  'merci': 'thank you',
  'veuillez': 'please',
  'joindre': 'attach',
  'analyse': 'analysis',
  'rapport': 'report',
};

export function heuristicTranslateToEnglish(input: string): string {
  return input.replace(/[A-Za-zÀ-ÿ']+/g, (word) => {
    const hit = FR_EN[word.toLowerCase()];
    if (!hit) return word;
    return word[0] === word[0].toUpperCase() ? hit[0].toUpperCase() + hit.slice(1) : hit;
  });
}

export function heuristicExtractAmount(input: string): number | null {
  const m = input.replace(',', '.').match(/(\d+(?:\.\d+)?)\s*(?:eur|€|mad|dh|usd|\$)?/i);
  return m ? Number(m[1]) : null;
}

export function heuristicExtractQuoteRef(input: string): string | null {
  const m = input.match(/DEV[- ]?\d{4}[- ]?\d{3,}/i);
  return m ? m[0].replace(/\s+/g, '-').toUpperCase() : null;
}

export function heuristicDetectAnomalies(input: string): string[] {
  const issues: string[] = [];
  if (!/\d/.test(input)) issues.push('valeur numérique absente');
  if (/\b(n\/?d|n\/a|null|na)\b/i.test(input)) issues.push('valeur manquante');
  if (/[<>-]\s*[<>-]/.test(input)) issues.push('intervalle incomplet');
  return issues;
}

export function heuristicClassifyEmail(input: string): string {
  const text = input.toLowerCase();
  if (/(purchase order|bon de commande|\bbdc\b|\bpo\b|bc[- ]?\d)/.test(text)) return 'PURCHASE_ORDER';
  if (/(quote|devis|rfq)/.test(text)) return 'QUOTE_REPLY';
  if (/(report|rapport|certificate)/.test(text)) return 'REPORT';
  return 'OTHER';
}
