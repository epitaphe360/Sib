import { supabase } from '../lib/supabase';

const SETTINGS_KEY = 'admin_pavilions_v1';

export interface AdminPavilion {
  id: string;
  name: string;
  subtitle?: string;
  shortDescription?: string;
  theme: string;
  description: string;
  objectives?: string[];
  features?: string[];
  targetAudience?: string[];
  exhibitors?: number;
  visitors?: number;
  conferences?: number;
  created_at: string;
  updated_at?: string;
  demoPrograms?: unknown[];
  totalPrograms?: number;
  totalCapacity?: number;
  totalRegistered?: number;
}

export const DEFAULT_PAVILIONS: AdminPavilion[] = [
  {
    id: '1',
    name: 'Digitalisation Bâtiment',
    subtitle: 'Automatisation et Numérisation',
    shortDescription: "Technologies numériques transformant l'écosystème bâtiment",
    theme: 'digitalization',
    description: 'Découvrez les dernières innovations en matière de transformation numérique pour les bâtiments.',
    objectives: ['Améliorer l\'efficacité opérationnelle', 'Réduire les temps d\'attente', 'Optimiser la gestion des ressources'],
    features: ['Solutions IoT BTP', 'Systèmes de gestion automatisée', 'Intégration des systèmes d\'information'],
    targetAudience: ['Autorités du Bâtiment', 'Opérateurs de Terminaux', 'Développeurs de Solutions'],
    exhibitors: 8,
    visitors: 450,
    conferences: 3,
    created_at: new Date().toISOString(),
    demoPrograms: [],
    totalPrograms: 3,
    totalCapacity: 155,
    totalRegistered: 115,
  },
  {
    id: '2',
    name: 'Développement Durable Bâtiment',
    subtitle: 'Solutions Écologiques et Durables',
    shortDescription: 'Innovations vertes pour une industrie du bâtiment responsable',
    theme: 'sustainability',
    description: 'Solutions écologiques et durables pour l\'industrie du bâtiment.',
    objectives: ['Réduire l\'empreinte carbone', 'Promouvoir les énergies renouvelables', 'Optimiser la gestion des déchets'],
    features: ['Énergies renouvelables', 'Systèmes de recyclage', 'Monitoring environnemental'],
    targetAudience: ['Gestionnaires de Bâtiments', 'Experts Environnementaux', 'Régulateurs'],
    exhibitors: 6,
    visitors: 320,
    conferences: 2,
    created_at: new Date().toISOString(),
    demoPrograms: [],
    totalPrograms: 2,
    totalCapacity: 120,
    totalRegistered: 88,
  },
  {
    id: '3',
    name: 'Sécurité Chantier',
    subtitle: 'Surveillance et Contrôle Avancés',
    shortDescription: 'Technologies de sécurité avancées pour les infrastructures BTP',
    theme: 'security',
    description: 'Technologies de sécurité avancées pour les bâtiments et terminaux.',
    objectives: ['Renforcer la sécurité des infrastructures', 'Prévenir les incidents', 'Améliorer la surveillance'],
    features: ['Vidéosurveillance intelligente', 'Contrôle d\'accès biométrique', 'Systèmes d\'alerte précoce'],
    targetAudience: ['Responsables Sécurité', 'Autorités du Bâtiment', 'Forces de l\'Ordre'],
    exhibitors: 5,
    visitors: 280,
    conferences: 2,
    created_at: new Date().toISOString(),
    demoPrograms: [],
    totalPrograms: 2,
    totalCapacity: 100,
    totalRegistered: 72,
  },
  {
    id: '4',
    name: 'Innovation & R&D',
    subtitle: 'Technologies Émergentes',
    shortDescription: 'Les technologies de demain pour les bâtiments d\'aujourd\'hui',
    theme: 'innovation',
    description: 'Les technologies de demain pour les bâtiments d\'aujourd\'hui.',
    objectives: ['Promouvoir la R&D bâtiment', 'Encourager les startups', 'Accélérer l\'innovation'],
    features: ['Intelligence Artificielle', 'Blockchain bâtiment', 'Robotique et automatisation'],
    targetAudience: ['Chercheurs', 'Startups Tech', 'Investisseurs'],
    exhibitors: 10,
    visitors: 520,
    conferences: 4,
    created_at: new Date().toISOString(),
    demoPrograms: [],
    totalPrograms: 4,
    totalCapacity: 200,
    totalRegistered: 160,
  },
];

async function loadStoredPavilions(): Promise<AdminPavilion[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', SETTINGS_KEY)
    .maybeSingle();
  if (error || !data?.value) return null;
  const parsed = data.value as AdminPavilion[] | { pavilions?: AdminPavilion[] };
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.pavilions)) return parsed.pavilions;
  return null;
}

async function persistPavilions(pavilions: AdminPavilion[]): Promise<void> {
  if (!supabase) throw new Error('Supabase non configuré');
  const { error } = await supabase.from('app_settings').upsert(
    { key: SETTINGS_KEY, value: pavilions, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  );
  if (error) throw error;
}

export async function fetchAdminPavilions(): Promise<AdminPavilion[]> {
  const stored = await loadStoredPavilions();
  return stored && stored.length > 0 ? stored : DEFAULT_PAVILIONS;
}

export async function saveAdminPavilions(pavilions: AdminPavilion[]): Promise<void> {
  await persistPavilions(pavilions);
}

export async function addAdminPavilion(input: {
  name: string;
  theme: string;
  description: string;
  objectives: string[];
  features: string[];
  targetAudience: string[];
  demoPrograms: unknown[];
}): Promise<AdminPavilion> {
  const pavilions = await fetchAdminPavilions();
  const newPavilion: AdminPavilion = {
    id: `pavilion_${Date.now()}`,
    name: input.name,
    theme: input.theme,
    description: input.description,
    objectives: input.objectives,
    features: input.features,
    targetAudience: input.targetAudience,
    demoPrograms: input.demoPrograms,
    exhibitors: 0,
    visitors: 0,
    conferences: input.demoPrograms.length,
    created_at: new Date().toISOString(),
    totalPrograms: input.demoPrograms.length,
    totalCapacity: input.demoPrograms.reduce((sum, p: any) => sum + (p.capacity ?? 0), 0),
    totalRegistered: 0,
  };
  await persistPavilions([...pavilions, newPavilion]);
  return newPavilion;
}
