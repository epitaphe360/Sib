const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+212|0)\s*([5-7](?:[\s.-]?\d){8})/;

export interface EmailRequestDraft {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  product_name: string;
  analyses: string;
  notes: string;
  missing: string[];
  origin: 'EMAIL';
}

function lineAfter(label: RegExp, text: string): string {
  const m = text.match(label);
  return m?.[1]?.trim() ?? '';
}

export function extractRequestDraftFromEmail(subject: string, body: string): EmailRequestDraft {
  const text = `${subject}\n${body}`;
  const email = text.match(EMAIL_RE)?.[0] ?? '';
  const phoneRaw = text.match(PHONE_RE)?.[1] ?? '';
  const phone = phoneRaw.replace(/\D/g, '');
  const company_name = lineAfter(/(?:soci[eé]t[eé]|company|entreprise)\s*[:\-]\s*(.+)/i, text)
    || lineAfter(/^de\s*[:\-]\s*(.+)$/im, text);
  const contact_name = lineAfter(/(?:contact|nom)\s*[:\-]\s*(.+)/i, text);
  const product_name = lineAfter(/(?:produit|[eé]chantillon|sample|product)\s*[:\-]\s*(.+)/i, text);
  const analyses = lineAfter(/(?:analyses?|param[eè]tres?)\s*[:\-]\s*(.+)/i, text);
  const missing: string[] = [];
  if (company_name.length < 2) missing.push('société');
  if (contact_name.length < 2) missing.push('contact');
  if (!email) missing.push('email');
  if (phone.length < 8) missing.push('téléphone');
  if (product_name.length < 2) missing.push('produit');
  if (analyses.length < 2) missing.push('analyses');
  return {
    company_name,
    contact_name,
    email,
    phone,
    product_name,
    analyses,
    notes: `Source e-mail — champs manquants: ${missing.join(', ') || 'aucun'}. Sujet: ${subject}`,
    missing,
    origin: 'EMAIL',
  };
}
