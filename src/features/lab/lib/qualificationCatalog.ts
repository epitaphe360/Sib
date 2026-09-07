/** Catalogues Document 27 — seed local + même structure que les tables Supabase. */

export const CLIENT_TYPES = [
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'administration', label: 'Administration / organisme public' },
  { value: 'association', label: 'Association' },
  { value: 'laboratoire_partenaire', label: 'Laboratoire partenaire' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'particulier', label: 'Particulier' },
  { value: 'autre', label: 'Autre' },
] as const;

export const CIVILITES = [
  { value: 'M', label: 'M.' },
  { value: 'Mme', label: 'Mme' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Pr', label: 'Pr' },
  { value: 'Autre', label: 'Autre' },
] as const;

export const FONCTION_EXAMPLES = [
  'Responsable Qualité',
  'Responsable Laboratoire',
  'Directeur',
  'Responsable Achats',
  'Production',
  'QHSE',
  'Autre',
] as const;

export const CANAL_PREFERENCES = [
  { value: 'email', label: 'Email' },
  { value: 'telephone', label: 'Téléphone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
  { value: 'portail', label: 'Portail client' },
] as const;

export const LANGUE_PREFERENCES = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'Arabe' },
  { value: 'en', label: 'Anglais' },
  { value: 'autre', label: 'Autre' },
] as const;

export const SAMPLE_TYPE_CODES = [
  { code: 'alimentaire', label: 'Produit alimentaire' },
  { code: 'eau', label: 'Eau' },
  { code: 'sol', label: 'Sol' },
  { code: 'boue', label: 'Boue' },
  { code: 'air', label: 'Air' },
  { code: 'cosmetique', label: 'Produit cosmétique' },
  { code: 'hygiene', label: 'Produit d’hygiène' },
  { code: 'aliment_animaux', label: 'Aliment pour animaux' },
  { code: 'matiere_premiere', label: 'Matière première' },
  { code: 'emballage', label: 'Emballage / matériau' },
  { code: 'surface', label: 'Surface / écouvillon' },
  { code: 'industriel', label: 'Produit industriel' },
  { code: 'environnement', label: 'Environnement' },
  { code: 'autre', label: 'Autre' },
] as const;

export const FOOD_FAMILIES = [
  'Produits laitiers',
  'Viandes',
  'Charcuterie',
  'Volaille',
  'Produits de la pêche',
  'Fruits',
  'Légumes',
  'Céréales',
  'Farines',
  'Huiles',
  'Épices',
  'Boissons',
  'Jus',
  'Conserves',
  'Biscuits',
  'Confiserie',
  'Miel',
  'Œufs',
  'Produits surgelés',
  'Aliments animaux',
  'Autre',
] as const;

const OTHER_FAMILIES: Record<string, string[]> = {
  eau: ['Eau potable', 'Eau minérale', 'Eau usée', 'Eau de process', 'Eau de baignade', 'Autre'],
  sol: ['Sol agricole', 'Sol industriel', 'Sédiment', 'Autre'],
  boue: ['Boue station', 'Boue industrielle', 'Autre'],
  air: ['Air ambiant', 'Émission', 'Autre'],
  cosmetique: ['Soin', 'Maquillage', 'Hygiène capillaire', 'Autre'],
  hygiene: ['Détergent', 'Désinfectant', 'Autre'],
  aliment_animaux: ['Aliment complet', 'Complément', 'Prémix', 'Autre'],
  matiere_premiere: ['Additif', 'Ingrédient', 'Autre'],
  emballage: ['Plastique', 'Verre', 'Métal', 'Papier / carton', 'Autre'],
  surface: ['Écouvillon', 'Surface de travail', 'Autre'],
  industriel: ['Chimique', 'Pétrolier', 'Autre'],
  environnement: ['Rejet', 'Ambient', 'Autre'],
  autre: ['Autre'],
};

export const SAMPLE_PRODUCTS: { type: string; family: string; name: string }[] = [
  { type: 'alimentaire', family: 'Produits laitiers', name: 'beurre' },
  { type: 'alimentaire', family: 'Produits laitiers', name: 'mozzarella' },
  { type: 'alimentaire', family: 'Produits laitiers', name: 'fromage fondu' },
  { type: 'alimentaire', family: 'Produits laitiers', name: 'lait' },
  { type: 'alimentaire', family: 'Produits de la pêche', name: 'saumon fumé' },
  { type: 'alimentaire', family: 'Conserves', name: 'thon en conserve' },
  { type: 'alimentaire', family: 'Farines', name: 'farine de blé' },
  { type: 'alimentaire', family: 'Huiles', name: 'huile d’olive' },
  { type: 'alimentaire', family: 'Épices', name: 'paprika' },
  { type: 'alimentaire', family: 'Jus', name: 'jus d’orange' },
  { type: 'alimentaire', family: 'Huiles', name: 'huile d’argan' },
  { type: 'alimentaire', family: 'Miel', name: 'miel' },
  { type: 'eau', family: 'Eau potable', name: 'eau de réseau' },
  { type: 'cosmetique', family: 'Soin', name: 'crème hydratante' },
];

export const ORIGINES = [
  { value: 'maroc', label: 'Maroc' },
  { value: 'import', label: 'Import' },
  { value: 'inconnue', label: 'Inconnue' },
] as const;

export const ETATS_PHYSIQUES = [
  'Liquide', 'Solide', 'Poudre', 'Pâte', 'Granulé', 'Surgelé', 'Réfrigéré', 'Autre',
] as const;

export const CONDITIONNEMENTS = [
  'Sachet', 'Pot', 'Bouteille', 'Bidon', 'Boîte', 'Carton', 'Vrac', 'Flacon', 'Autre',
] as const;

export const UNITES_QUANTITE = ['g', 'kg', 'ml', 'L', 'unité', 'autre'] as const;

export const OBJECTIFS_ANALYTIQUES = [
  { value: 'controle_qualite', label: 'Contrôle qualité' },
  { value: 'conformite', label: 'Conformité réglementaire' },
  { value: 'export', label: 'Export / certificat' },
  { value: 'rd', label: 'R&D / formulation' },
  { value: 'reclamation', label: 'Réclamation / litige' },
  { value: 'surveillance', label: 'Surveillance' },
  { value: 'autre', label: 'Autre' },
] as const;

export const TRI_ETATS = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
  { value: 'inconnu', label: 'Je ne sais pas' },
] as const;

export const PRELEVEMENT_PAR = [
  { value: 'client', label: 'Par le client' },
  { value: 'laboratoire', label: 'Par le laboratoire' },
  { value: 'tiers', label: 'Par un tiers' },
  { value: 'deja_preleve', label: 'Déjà prélevé' },
] as const;

export const MODES_ENVOI = [
  { value: 'depot', label: 'Dépôt au laboratoire' },
  { value: 'coursier', label: 'Coursier' },
  { value: 'froid', label: 'Transport chaîne du froid' },
  { value: 'autre', label: 'Autre' },
] as const;

export const URGENCES = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'tres_urgent', label: 'Très urgent' },
] as const;

export const DOCUMENT_TYPES = [
  { value: 'etiquette', label: 'Étiquette / packaging' },
  { value: 'specification', label: 'Spécification produit' },
  { value: 'rapport_precedent', label: 'Rapport d’analyse précédent' },
  { value: 'bdc', label: 'Bon de commande' },
  { value: 'autre', label: 'Autre' },
] as const;

/** Indicatifs fréquents — liste internationale utile, pas ISO-3166 complet. */
export const DIAL_CODES = [
  '+212', '+213', '+216', '+218', '+20', '+33', '+32', '+34', '+351', '+39',
  '+49', '+44', '+41', '+31', '+1', '+971', '+966', '+974', '+965',
  '+222', '+221', '+225', '+226', '+227', '+228', '+229', '+237', '+242',
] as const;

export const QUALIFICATION_STEPS = [
  { n: 1, id: 'client', title: 'Informations du demandeur', short: 'Client' },
  { n: 2, id: 'sample', title: 'Échantillon à analyser', short: 'Échantillon' },
  { n: 3, id: 'need', title: 'Besoin analytique', short: 'Analyses' },
  { n: 4, id: 'logistics', title: 'Logistique et délai', short: 'Logistique' },
  { n: 5, id: 'review', title: 'Documents et récapitulatif', short: 'Vérification' },
] as const;

export type SampleCategoryRow = { id?: string; code: string; label: string };
export type SampleSubcategoryRow = { id?: string; category_code: string; label: string };
export type SampleProductRow = { id?: string; category_code: string; subcategory_label: string; name: string };

export function familiesForType(type: string): string[] {
  if (type === 'alimentaire') return [...FOOD_FAMILIES];
  return OTHER_FAMILIES[type] ?? ['Autre'];
}

export function searchProducts(
  products: SampleProductRow[],
  query: string,
  type?: string,
  family?: string,
): SampleProductRow[] {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    if (type && p.category_code !== type) return false;
    if (family && p.subcategory_label !== family) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q);
  }).slice(0, 20);
}

export function seedCatalogRows(): {
  categories: SampleCategoryRow[];
  subcategories: SampleSubcategoryRow[];
  products: SampleProductRow[];
} {
  const categories = SAMPLE_TYPE_CODES.map((c) => ({ code: c.code, label: c.label }));
  const subcategories: SampleSubcategoryRow[] = SAMPLE_TYPE_CODES.flatMap((c) =>
    familiesForType(c.code).map((label) => ({ category_code: c.code, label })),
  );
  const products: SampleProductRow[] = SAMPLE_PRODUCTS.map((p) => ({
    category_code: p.type,
    subcategory_label: p.family,
    name: p.name,
  }));
  return { categories, subcategories, products };
}

export function datesAreConditional(type: string): boolean {
  return type === 'alimentaire' || type === 'cosmetique' || type === 'hygiene' || type === 'aliment_animaux';
}
