import { createClient } from '@supabase/supabase-js';
import { UserProfile, ContactInfo } from '../types';

// Types pour TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          type: 'exhibitor' | 'partner' | 'visitor' | 'admin' | 'security';
          visitor_level?: 'free' | 'basic' | 'premium' | 'vip'; // Ajouté
          profile: UserProfile;
          status?: 'active' | 'pending' | 'suspended' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          type: 'exhibitor' | 'partner' | 'visitor' | 'admin' | 'security';
          visitor_level?: 'free' | 'basic' | 'premium' | 'vip'; // Ajouté
          profile: UserProfile;
          status?: 'active' | 'pending' | 'suspended' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          type?: 'exhibitor' | 'partner' | 'visitor' | 'admin';
          visitor_level?: 'free' | 'basic' | 'premium' | 'vip'; // Ajouté
          profile?: UserProfile;
          status?: 'active' | 'pending' | 'suspended' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      exhibitors: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          category: string;
          sector: string;
          description: string;
          logo_url: string | null;
          website: string | null;
          verified: boolean;
          featured: boolean;
          contact_info: ContactInfo;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          category: string;
          sector: string;
          description: string;
          logo_url?: string | null;
          website?: string | null;
          verified?: boolean;
          featured?: boolean;
          contact_info?: ContactInfo;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          category?: string;
          sector?: string;
          description?: string;
          logo_url?: string | null;
          website?: string | null;
          verified?: boolean;
          featured?: boolean;
          contact_info?: ContactInfo;
          created_at?: string;
          updated_at?: string;
        };
      };
      partners: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          partner_type: string;
          sector: string;
          description: string;
          logo_url: string | null;
          website: string | null;
          verified: boolean;
          featured: boolean;
          contact_info: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          partner_type?: string;
          sector: string;
          description: string;
          logo_url?: string | null;
          website?: string | null;
          verified?: boolean;
          featured?: boolean;
          contact_info?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          partner_type?: string;
          sector?: string;
          description?: string;
          logo_url?: string | null;
          website?: string | null;
          verified?: boolean;
          featured?: boolean;
          contact_info?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      mini_sites: {
        Row: {
          id: string;
          exhibitor_id: string;
          theme: string;
          custom_colors: Record<string, unknown>;
          sections: Record<string, unknown>[];
          published: boolean;
          view_count: number;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          exhibitor_id: string;
          theme: string;
          custom_colors?: Record<string, unknown>;
          sections?: Record<string, unknown>[];
          published?: boolean;
          view_count?: number;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          exhibitor_id?: string;
          theme?: string;
          custom_colors?: Record<string, unknown>;
          sections?: Record<string, unknown>[];
          published?: boolean;
          view_count?: number;
          updated_at?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          exhibitor_id: string;
          name: string;
          description: string;
          category: string;
          images: string[];
          specifications: string | null;
          price: number | null;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exhibitor_id: string;
          name: string;
          description: string;
          category: string;
          images?: string[];
          specifications?: string | null;
          price?: number | null;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exhibitor_id?: string;
          name?: string;
          description?: string;
          category?: string;
          images?: string[];
          specifications?: string | null;
          price?: number | null;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          exhibitor_id: string;
          visitor_id: string;
          time_slot_id: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          message: string | null;
          notes: string | null;
          rating: number | null;
          created_at: string;
          meeting_type: 'in-person' | 'virtual' | 'hybrid';
          meeting_link: string | null;
        };
        Insert: {
          id?: string;
          exhibitor_id: string;
          visitor_id: string;
          time_slot_id: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          message?: string | null;
          notes?: string | null;
          rating?: number | null;
          created_at?: string;
          meeting_type?: 'in-person' | 'virtual' | 'hybrid';
          meeting_link?: string | null;
        };
        Update: {
          id?: string;
          exhibitor_id?: string;
          visitor_id?: string;
          time_slot_id?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          message?: string | null;
          notes?: string | null;
          rating?: number | null;
          created_at?: string;
          meeting_type?: 'in-person' | 'virtual' | 'hybrid';
          meeting_link?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          participants: string[];
          type: string;
          title: string | null;
          created_by: string;
          is_active: boolean;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participants: string[];
          type?: string;
          title?: string | null;
          created_by: string;
          is_active?: boolean;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participants?: string[];
          type?: string;
          title?: string | null;
          created_by?: string;
          is_active?: boolean;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: string;
          read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type?: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          message_type?: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      message_attachments: {
        Row: {
          id: string;
          message_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          mime_type: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          mime_type?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          mime_type?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          registration_type: string;
          status: string;
          registration_date: string;
          attended_at: string | null;
          notes: string | null;
          special_requirements: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          registration_type?: string;
          status?: string;
          registration_date?: string;
          attended_at?: string | null;
          notes?: string | null;
          special_requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          registration_type?: string;
          status?: string;
          registration_date?: string;
          attended_at?: string | null;
          notes?: string | null;
          special_requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      networking_recommendations: {
        Row: {
          id: string;
          user_id: string;
          recommended_user_id: string;
          recommendation_type: string;
          score: number;
          reasons: string[];
          category: string;
          viewed: boolean;
          contacted: boolean;
          mutual_connections: number;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recommended_user_id: string;
          recommendation_type: string;
          score: number;
          reasons: string[];
          category: string;
          viewed?: boolean;
          contacted?: boolean;
          mutual_connections?: number;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recommended_user_id?: string;
          recommendation_type?: string;
          score?: number;
          reasons?: string[];
          category?: string;
          viewed?: boolean;
          contacted?: boolean;
          mutual_connections?: number;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          event_data: Record<string, unknown>;
          session_id: string;
          user_agent: string;
          referrer: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          event_data?: Record<string, unknown>;
          session_id: string;
          user_agent: string;
          referrer: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_data?: Record<string, unknown>;
          session_id?: string;
          user_agent?: string;
          referrer?: string;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          description: string;
          related_user_id: string | null;
          related_entity_type: string | null;
          related_entity_id: string | null;
          metadata: Record<string, unknown>;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          description: string;
          related_user_id?: string | null;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          metadata?: Record<string, unknown>;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          description?: string;
          related_user_id?: string | null;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          metadata?: Record<string, unknown>;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      time_slots: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          duration: number;
          type: 'in-person' | 'virtual' | 'hybrid';
          max_bookings: number;
          current_bookings: number;
          available: boolean;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          duration: number;
          type: 'in-person' | 'virtual' | 'hybrid';
          max_bookings: number;
          current_bookings?: number;
          available?: boolean;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          type?: 'in-person' | 'virtual' | 'hybrid';
          max_bookings?: number;
          current_bookings?: number;
          available?: boolean;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      news_articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string | null;
          author: string;
          published: boolean;
          published_at: string | null;
          featured_image: string | null;
          tags: string[];
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt?: string | null;
          author: string;
          published?: boolean;
          published_at?: string | null;
          featured_image?: string | null;
          tags?: string[];
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          author?: string;
          published?: boolean;
          published_at?: string | null;
          featured_image?: string | null;
          tags?: string[];
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: 'webinar' | 'roundtable' | 'networking' | 'workshop' | 'conference';
          event_date: string;
          start_time: string;
          end_time: string;
          capacity: number;
          registered: number;
          category: string;
          virtual: boolean;
          featured: boolean;
          location: string | null;
          meeting_link: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: 'webinar' | 'roundtable' | 'networking' | 'workshop' | 'conference';
          event_date: string;
          start_time: string;
          end_time: string;
          capacity?: number;
          registered?: number;
          category: string;
          virtual?: boolean;
          featured?: boolean;
          location?: string | null;
          meeting_link?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: 'webinar' | 'roundtable' | 'networking' | 'workshop' | 'conference';
          event_date?: string;
          start_time?: string;
          end_time?: string;
          capacity?: number;
          registered?: number;
          category?: string;
          virtual?: boolean;
          featured?: boolean;
          location?: string | null;
          meeting_link?: string | null;
          tags?: string[];
          created_at?: string;
        };
      };
    };
  };
};


// ============================================
// LAZY SUPABASE CLIENT INITIALIZATION
// Railway injects env vars at RUNTIME via window.__ENV__ (server.js).
// Module-level evaluation happens too early, so we resolve env vars
// lazily when the client is first needed.
// ============================================

/**
 * Resolve a VITE_ env var from multiple sources (lazy, called at use-time).
 * Priority: 1) window.__ENV__ (Railway runtime) → 2) import.meta.env (Vite build-time)
 */
const getRuntimeEnv = (key: string): string => {
  // 1. Runtime injection from server.js (most reliable on Railway)
  if (typeof window !== 'undefined') {
    const w = window as any;
    if (w.__ENV__ && typeof w.__ENV__[key] === 'string' && w.__ENV__[key].length > 5) {
      return w.__ENV__[key];
    }
  }
  // 2. Vite build-time env (works locally with .env file)
  try {
    const envObj = import.meta.env;
    const val = envObj?.[key];
    if (val && typeof val === 'string' && val.length > 10 && !val.includes('placeholder') && !val.includes('your_')) {
      return val;
    }
  } catch {
    // import.meta.env may not exist in some contexts
  }
  return '';
};

// SÉCURITÉ : La service role key ne doit JAMAIS être exposée côté client

// Client Supabase simplifié et sécurisé — création 100% lazy
let supabaseClientInstance: ReturnType<typeof createClient<Database>> | null = null;
let _initAttempted = false;

/**
 * Validate that a URL/key pair looks like real Supabase credentials.
 */
function isValidConfig(url: string, key: string): boolean {
  return !!(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('placeholder') &&
    !url.includes('votre-project-id') &&
    !url.includes('your-project-id') &&
    !url.includes('your-project.supabase') &&
    key.length > 30 &&
    !key.includes('placeholder') &&
    !key.includes('your_supabase') &&
    !key.includes('your-supabase') &&
    !key.startsWith('demo_')
  );
}

/**
 * Get or create the Supabase client.
 * Env vars are resolved lazily so window.__ENV__ (Railway runtime injection) is always available.
 */
function getSupabaseClient(): ReturnType<typeof createClient<Database>> | null {
  if (supabaseClientInstance) return supabaseClientInstance;

  // Resolve env vars NOW (not at module load time)
  const url = getRuntimeEnv('VITE_SUPABASE_URL');
  const key = getRuntimeEnv('VITE_SUPABASE_ANON_KEY');

  if (!isValidConfig(url, key)) {
    // Only warn once, and only in dev
    if (!_initAttempted) {
      _initAttempted = true;
      if (import.meta.env.DEV) {
        console.warn('⚠️ Supabase non configuré — vérifiez votre .env');
      }
    }
    return null;
  }

  _initAttempted = true;
  supabaseClientInstance = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'Accept': 'application/json'
        // Note: NE PAS mettre 'Content-Type' ici car cela empêche
        // l'upload de fichiers (Storage) qui a besoin de son propre Content-Type
      }
    }
  });

  return supabaseClientInstance;
}

// SÉCURITÉ : Aucun client admin côté client !
// Les opérations admin doivent être effectuées via les serveurs Express dans server/

// Export du client Supabase — résolu de manière lazy.
// On utilise `let` car sur Railway, window.__ENV__ peut ne pas être disponible
// au moment exact du chargement du module ; un retry asynchrone met 
// à jour la variable (ES module live binding).
export let supabase: ReturnType<typeof createClient<Database>> | null = getSupabaseClient();

// Si le client n'a pas pu être créé au chargement du module, retenter dès
// que le navigateur a fini de parser le HTML (inline <script> garanti exécuté).
if (!supabase && typeof window !== 'undefined') {
  const retryInit = () => {
    if (!supabaseClientInstance) {
      const client = getSupabaseClient();
      if (client) {
        supabase = client;
      }
    }
  };
  // Micro-tâche → s'exécute avant le prochain repaint
  queueMicrotask(retryInit);
  // Aussi au DOMContentLoaded comme filet de sécurité
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', retryInit, { once: true });
  } else {
    // DOM déjà prêt → retry immédiat
    retryInit();
  }
}

// Export de la fonction de vérification (toujours re-évaluée de façon lazy)
export const isSupabaseReady = () => getSupabaseClient() !== null;