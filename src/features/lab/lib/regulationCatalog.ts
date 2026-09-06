export interface RegulatoryText {
  id: string;
  parameter: string;
  matrix: string;
  textTitle: string;
  reference: string;
  kind: 'PHYSICO_CHIMIQUE' | 'MICROBIOLOGIQUE';
}

/**
 * Catalogue de textes marocains identifiés — jamais une obligation « pratique courante ».
 * Validation humaine obligatoire avant usage commercial (CDC §4).
 */
export const REGULATORY_CATALOG: RegulatoryText[] = [
  {
    id: 'pb-food',
    parameter: 'Plomb',
    matrix: 'denrées alimentaires',
    textTitle: 'Arrêté du ministre de l’agriculture n° 1643-16 relatif aux teneurs maximales en contaminants',
    reference: 'B.O. n° 6490 — 1643-16',
    kind: 'PHYSICO_CHIMIQUE',
  },
  {
    id: 'cd-food',
    parameter: 'Cadmium',
    matrix: 'denrées alimentaires',
    textTitle: 'Arrêté du ministre de l’agriculture n° 1643-16 relatif aux teneurs maximales en contaminants',
    reference: 'B.O. n° 6490 — 1643-16',
    kind: 'PHYSICO_CHIMIQUE',
  },
  {
    id: 'hg-fish',
    parameter: 'Mercure',
    matrix: 'produits de la pêche',
    textTitle: 'Arrêté du ministre de l’agriculture n° 1643-16 relatif aux teneurs maximales en contaminants',
    reference: 'B.O. n° 6490 — 1643-16',
    kind: 'PHYSICO_CHIMIQUE',
  },
  {
    id: 'af-nuts',
    parameter: 'Aflatoxines',
    matrix: 'fruits à coque / céréales',
    textTitle: 'Arrêté du ministre de l’agriculture n° 1643-16 relatif aux teneurs maximales en contaminants',
    reference: 'B.O. n° 6490 — 1643-16',
    kind: 'PHYSICO_CHIMIQUE',
  },
  {
    id: 'aa-fried',
    parameter: 'Acrylamide',
    matrix: 'produits frits à base de céréales / pomme de terre',
    textTitle: 'Arrêté n° 1643-16 (contaminants) — vérifier le tableau applicable à la matrice',
    reference: 'B.O. n° 6490 — 1643-16',
    kind: 'PHYSICO_CHIMIQUE',
  },
  {
    id: 'pest-veg',
    parameter: 'Résidus de pesticides',
    matrix: 'fruits et légumes',
    textTitle: 'Arrêté n° 156-14 fixant les limites maximales de résidus de pesticides',
    reference: 'B.O. — 156-14',
    kind: 'PHYSICO_CHIMIQUE',
  },
  {
    id: 'sal-food',
    parameter: 'Salmonella spp.',
    matrix: 'denrées d’origine animale',
    textTitle: 'Arrêté n° 2011-11 relatif aux critères microbiologiques des denrées alimentaires',
    reference: 'B.O. — 2011-11',
    kind: 'MICROBIOLOGIQUE',
  },
  {
    id: 'lm-ready',
    parameter: 'Listeria monocytogenes',
    matrix: 'aliments prêts à consommer',
    textTitle: 'Arrêté n° 2011-11 relatif aux critères microbiologiques des denrées alimentaires',
    reference: 'B.O. — 2011-11',
    kind: 'MICROBIOLOGIQUE',
  },
  {
    id: 'ecoli-veg',
    parameter: 'Escherichia coli',
    matrix: 'végétaux / eau',
    textTitle: 'Arrêté n° 2011-11 relatif aux critères microbiologiques des denrées alimentaires',
    reference: 'B.O. — 2011-11',
    kind: 'MICROBIOLOGIQUE',
  },
  {
    id: 'water-nm',
    parameter: 'Critères de potabilité (chimie + microbio)',
    matrix: 'eau destinée à la consommation humaine',
    textTitle: 'Norme marocaine NM 03.7.001 — qualité des eaux d’alimentation humaine',
    reference: 'NM 03.7.001',
    kind: 'PHYSICO_CHIMIQUE',
  },
];

export interface RegulatoryProposal {
  product: string;
  parameter: string;
  textTitle: string;
  reference: string;
  kind: RegulatoryText['kind'];
  legal: true;
}

export function proposeRegulatedAnalyses(product: string, catalog = REGULATORY_CATALOG): RegulatoryProposal[] {
  const p = product.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return catalog
    .filter((row) => {
      const matrix = row.matrix.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      if (p.includes('eau') || p.includes('water')) return matrix.includes('eau');
      if (/(huile|olive|poisson|peche|thon)/.test(p)) return /peche|denrees|contaminants/.test(matrix) || row.parameter === 'Mercure' || row.parameter === 'Plomb';
      if (/(frite|chips|biscuit|cereale|pain)/.test(p)) return row.parameter === 'Acrylamide' || row.parameter === 'Aflatoxines';
      if (/(amande|noix|pistache|arachide)/.test(p)) return row.parameter === 'Aflatoxines';
      if (/(legume|fruit|tomate|salade)/.test(p)) return /fruits|vegetaux/.test(matrix);
      if (/(lait|viande|oeuf|fromage|volaille)/.test(p)) return row.kind === 'MICROBIOLOGIQUE' || row.parameter === 'Plomb';
      return false;
    })
    .map((row) => ({
      product,
      parameter: row.parameter,
      textTitle: row.textTitle,
      reference: row.reference,
      kind: row.kind,
      legal: true as const,
    }));
}

export function parseProductList(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.split(/[;,\t]/)[0]?.trim() ?? '')
    .filter((line) => line && !/^(produit|product|nom|name)$/i.test(line));
}
