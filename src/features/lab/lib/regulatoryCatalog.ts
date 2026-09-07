/**
 * Catalogue réglementaire marocain.
 * Une proposition n’existe que si un texte identifié s’applique.
 * Jamais une « bonne pratique » présentée comme obligation légale.
 */

export type RegulatoryKind = 'PHYSICO_CHIMIQUE' | 'MICROBIOLOGIQUE';

export interface RegulatoryText {
  id: string;
  title: string;
  reference: string;
  official: boolean;
}

export interface RegulatoryParameter {
  id: string;
  parameter: string;
  kind: RegulatoryKind;
  textId: string;
  matrices: string[];
  note: string;
}

export interface RegulatoryProposal {
  parameter: string;
  kind: RegulatoryKind;
  textTitle: string;
  reference: string;
  applicability: string;
  legal: true;
}

export const REGULATORY_TEXTS: RegulatoryText[] = [
  {
    id: 'loi-28-07',
    title: 'Loi n° 28-07 relative à la sécurité sanitaire des produits alimentaires',
    reference: 'Dahir n° 1-10-08 du 26 safar 1431 (11 février 2010) — BO n° 5822 du 18 mars 2010',
    official: true,
  },
  {
    id: 'arrete-1643-16',
    title: 'Arrêté n° 1643-16 relatif aux critères microbiologiques des denrées alimentaires',
    reference: 'Arrêté du ministre de l’agriculture et de la pêche maritime n° 1643-16 du 23 chaabane 1437 (30 mai 2016)',
    official: true,
  },
  {
    id: 'nm-03-7-001',
    title: 'NM 03.7.001 — Qualité des eaux destinées à la consommation humaine',
    reference: 'Norme marocaine NM 03.7.001 (eaux destinées à la consommation humaine)',
    official: true,
  },
];

export const REGULATORY_PARAMETERS: RegulatoryParameter[] = [
  {
    id: 'salmo-food',
    parameter: 'Salmonella spp.',
    kind: 'MICROBIOLOGIQUE',
    textId: 'arrete-1643-16',
    matrices: ['denree', 'alimentaire', 'viande', 'lait', 'fromage', 'oeuf', 'volaille', 'produit'],
    note: 'Critère de sécurité — présence / 25 g selon catégorie du produit.',
  },
  {
    id: 'listeria-food',
    parameter: 'Listeria monocytogenes',
    kind: 'MICROBIOLOGIQUE',
    textId: 'arrete-1643-16',
    matrices: ['denree', 'alimentaire', 'lait', 'fromage', 'charcuterie', 'pret-a-manger', 'produit'],
    note: 'Critère de sécurité pour denrées prêtes à être consommées.',
  },
  {
    id: 'ecoli-food',
    parameter: 'Escherichia coli',
    kind: 'MICROBIOLOGIQUE',
    textId: 'arrete-1643-16',
    matrices: ['denree', 'alimentaire', 'viande', 'lait', 'fromage', 'produit'],
    note: 'Critère d’hygiène des procédés selon catégorie.',
  },
  {
    id: 'staph-food',
    parameter: 'Staphylococcus aureus',
    kind: 'MICROBIOLOGIQUE',
    textId: 'arrete-1643-16',
    matrices: ['denree', 'alimentaire', 'lait', 'fromage', 'produit'],
    note: 'Critère d’hygiène — dénombrement selon catégorie.',
  },
  {
    id: 'entero-food',
    parameter: 'Entérobactéries',
    kind: 'MICROBIOLOGIQUE',
    textId: 'arrete-1643-16',
    matrices: ['denree', 'alimentaire', 'lait', 'produit'],
    note: 'Critère d’hygiène des procédés.',
  },
  {
    id: 'pb-water',
    parameter: 'Plomb',
    kind: 'PHYSICO_CHIMIQUE',
    textId: 'nm-03-7-001',
    matrices: ['eau', 'potable', 'boisson'],
    note: 'Paramètre chimique — eaux destinées à la consommation humaine.',
  },
  {
    id: 'cd-water',
    parameter: 'Cadmium',
    kind: 'PHYSICO_CHIMIQUE',
    textId: 'nm-03-7-001',
    matrices: ['eau', 'potable', 'boisson'],
    note: 'Paramètre chimique — eaux destinées à la consommation humaine.',
  },
  {
    id: 'hg-water',
    parameter: 'Mercure',
    kind: 'PHYSICO_CHIMIQUE',
    textId: 'nm-03-7-001',
    matrices: ['eau', 'potable', 'boisson'],
    note: 'Paramètre chimique — eaux destinées à la consommation humaine.',
  },
  {
    id: 'as-water',
    parameter: 'Arsenic',
    kind: 'PHYSICO_CHIMIQUE',
    textId: 'nm-03-7-001',
    matrices: ['eau', 'potable', 'boisson'],
    note: 'Paramètre chimique — eaux destinées à la consommation humaine.',
  },
  {
    id: 'no3-water',
    parameter: 'Nitrates',
    kind: 'PHYSICO_CHIMIQUE',
    textId: 'nm-03-7-001',
    matrices: ['eau', 'potable', 'boisson'],
    note: 'Paramètre chimique — eaux destinées à la consommation humaine.',
  },
  {
    id: 'ecoli-water',
    parameter: 'Escherichia coli',
    kind: 'MICROBIOLOGIQUE',
    textId: 'nm-03-7-001',
    matrices: ['eau', 'potable', 'boisson'],
    note: 'Paramètre microbiologique — eaux destinées à la consommation humaine.',
  },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function tokensOf(product: string, matrix?: string): string[] {
  return `${product} ${matrix ?? ''}`
    .split(/[^A-Za-zÀ-ÿ0-9]+/)
    .map(normalize)
    .filter((t) => t.length > 2);
}

export function proposeRegulatedAnalyses(product: string, matrix?: string): RegulatoryProposal[] {
  const tokens = tokensOf(product, matrix);
  if (!tokens.length) return [];
  const texts = new Map(REGULATORY_TEXTS.map((t) => [t.id, t]));
  const out: RegulatoryProposal[] = [];
  for (const param of REGULATORY_PARAMETERS) {
    const hit = param.matrices.some((m) => tokens.some((t) => t.includes(m) || m.includes(t)));
    if (!hit) continue;
    const text = texts.get(param.textId);
    if (!text) continue;
    out.push({
      parameter: param.parameter,
      kind: param.kind,
      textTitle: text.title,
      reference: text.reference,
      applicability: param.note,
      legal: true,
    });
  }
  return uniqueByParameter(out);
}

function uniqueByParameter(rows: RegulatoryProposal[]): RegulatoryProposal[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.parameter)) return false;
    seen.add(row.parameter);
    return true;
  });
}

export function parseProductListCsv(text: string): { product: string; matrix?: string }[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].toLowerCase();
  const hasHeader = /produit|product|nom|matrix|matrice/.test(header);
  const start = hasHeader ? 1 : 0;
  return lines.slice(start).flatMap((line) => {
    const cols = line.split(/[;,\t]/).map((c) => c.trim().replace(/^"|"$/g, ''));
    const product = cols[0];
    if (!product || product.length < 2) return [];
    return [{ product, matrix: cols[1] || undefined }];
  });
}

export function proposalsNeedHumanValidation(proposals: RegulatoryProposal[]): boolean {
  return proposals.length > 0;
}
