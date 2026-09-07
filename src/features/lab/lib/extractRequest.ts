import { LAB_COUNTRY_CODES } from '../theme/tokens';

export interface ExtractedRequest {
  company_name?: string;
  contact_name?: string;
  email?: string;
  country_code?: string;
  phone?: string;
  product_name?: string;
  analyses?: string;
  sample_count?: number;
  missing: string[];
  source: 'rules-v1';
}

const REQUIRED: (keyof Omit<ExtractedRequest, 'missing' | 'source'>)[] = [
  'company_name', 'contact_name', 'email', 'phone', 'product_name', 'analyses',
];

export function extractRequestFromEmail(raw: string): ExtractedRequest {
  const text = raw.replace(/\r/g, '').trim();
  const result: ExtractedRequest = { missing: [], source: 'rules-v1' };

  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (email) result.email = email[0].toLowerCase();

  const phoneBlock = text.match(/(?:\+|00)\s*(\d{1,3})[\s.-]*(\d{8,12})/)
    ?? text.match(/(?:tel|tél|phone|gsm)\s*[:.]?\s*(?:\+|00)?\s*(\d{1,3})?[\s.-]*(\d{8,12})/i)
    ?? text.match(/\b(0\d{8,10})\b/);
  if (phoneBlock) {
    const full = phoneBlock[0].replace(/[^\d+]/g, '');
    const digits = full.replace(/^(\+|00)/, '');
    if (full.startsWith('+') || full.startsWith('00')) {
      const cc = LAB_COUNTRY_CODES.find((c) => full.replace(/^00/, '+').startsWith(c));
      result.country_code = cc ?? '+212';
      result.phone = digits.slice((result.country_code ?? '+212').slice(1).length);
    } else if (digits.startsWith('0')) {
      result.country_code = '+212';
      result.phone = digits.replace(/^0/, '');
    } else {
      result.phone = digits.slice(-9);
      result.country_code = '+212';
    }
  }

  const labeled = (label: string) => {
    const m = text.match(new RegExp(`(?:${label})\\s*[:\\-]\\s*(.+)`, 'i'));
    return m?.[1]?.split('\n')[0]?.trim();
  };

  result.company_name = labeled('soci[ée]t[ée]|company|entreprise')
    ?? text.match(/(?:de la société|chez)\s+([A-Z][\w .&-]{2,40})/i)?.[1]?.trim();
  result.contact_name = labeled('contact|nom|name')
    ?? text.match(/(?:cordialement|bien à vous|regards),?\s*\n+\s*([A-ZÀ-Ÿ][\w À-ÿ'-]{2,40})/i)?.[1]?.trim();
  result.product_name = labeled('produit|product|échantillon|sample|matrice');
  result.analyses = labeled('analyses?|paramètres?|parameters?');

  const count = text.match(/(\d+)\s*(?:échantillons?|samples?)/i);
  if (count) result.sample_count = Number(count[1]);

  for (const key of REQUIRED) {
    if (!result[key]) result.missing.push(key);
  }
  return result;
}
