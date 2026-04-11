import { supabase, isSupabaseReady } from '../lib/supabase';

export interface PavilionProgram {
  id: string;
  pavilion_id: string;
  title: string;
  time: string;
  speaker: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Pavilion {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  order_index: number;
  featured: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  programs?: PavilionProgram[];
}

// Static pavilions data - used when database table doesn't exist
const STATIC_PAVILIONS: Pavilion[] = [
  {
    id: '1',
    name: 'Pavillon Digitalisation',
    slug: 'digitalization',
    description: 'Découvrez les dernières innovations en matière de transformation numérique pour les sports.',
    color: '#3B82F6',
    icon: 'Monitor',
    order_index: 1,
    featured: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    programs: [],
  },
  {
    id: '2',
    name: 'Pavillon Développement Durable',
    slug: 'sustainability',
    description: 'Solutions écologiques et durables pour l\'industrie sportive.',
    color: '#22C55E',
    icon: 'Leaf',
    order_index: 2,
    featured: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    programs: [],
  },
  {
    id: '3',
    name: 'Pavillon Sécurité',
    slug: 'security',
    description: 'Technologies de sécurité avancées pour les événements sportifs.',
    color: '#EF4444',
    icon: 'Shield',
    order_index: 3,
    featured: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    programs: [],
  },
  {
    id: '4',
    name: 'Pavillon Innovation',
    slug: 'innovation',
    description: 'Les technologies de demain pour le sport d\'aujourd\'hui.',
    color: '#A855F7',
    icon: 'Lightbulb',
    order_index: 4,
    featured: true,
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    programs: [],
  },
];

export class PavillionsService {
  static async getAllPavilions(): Promise<Pavilion[]> {
    // Return static data if Supabase is not configured
    if (!isSupabaseReady() || !supabase) {
      console.warn('Supabase not configured. Returning static pavilions data.');
      return STATIC_PAVILIONS;
    }

    try {
      const { data, error } = await supabase
        .from('pavilions')
        .select(`
          *,
          programs:pavilion_programs(*)
        `)
        .order('order_index', { ascending: true });

      if (error) {
        // If table doesn't exist, return static data
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Pavilions table does not exist. Returning static data.');
          return STATIC_PAVILIONS;
        }
        console.error('Error fetching pavilions:', error);
        throw error;
      }

      return data || STATIC_PAVILIONS;
    } catch (err) {
      console.error('Error in getAllPavilions:', err);
      return STATIC_PAVILIONS;
    }
  }

  static async getPavilionBySlug(slug: string): Promise<Pavilion | null> {
    // Return static data if Supabase is not configured
    if (!isSupabaseReady() || !supabase) {
      console.warn('Supabase not configured. Returning static pavilion data.');
      return STATIC_PAVILIONS.find(p => p.slug === slug) || null;
    }

    try {
      const { data, error } = await supabase
        .from('pavilions')
        .select(`
          *,
          programs:pavilion_programs(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        // If table doesn't exist, return static data
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Pavilions table does not exist. Returning static data.');
          return STATIC_PAVILIONS.find(p => p.slug === slug) || null;
        }
        console.error('Error fetching pavilion:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in getPavilionBySlug:', err);
      return STATIC_PAVILIONS.find(p => p.slug === slug) || null;
    }
  }

  static async getFeaturedPavilions(): Promise<Pavilion[]> {
    // Return static data if Supabase is not configured
    if (!isSupabaseReady() || !supabase) {
      console.warn('Supabase not configured. Returning static featured pavilions.');
      return STATIC_PAVILIONS.filter(p => p.featured);
    }

    try {
      const { data, error } = await supabase
        .from('pavilions')
        .select(`
          *,
          programs:pavilion_programs(*)
        `)
        .eq('featured', true)
        .order('order_index', { ascending: true });

      if (error) {
        // If table doesn't exist, return static data
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Pavilions table does not exist. Returning static data.');
          return STATIC_PAVILIONS.filter(p => p.featured);
        }
        console.error('Error fetching featured pavilions:', error);
        throw error;
      }

      return data || STATIC_PAVILIONS.filter(p => p.featured);
    } catch (err) {
      console.error('Error in getFeaturedPavilions:', err);
      return STATIC_PAVILIONS.filter(p => p.featured);
    }
  }
}