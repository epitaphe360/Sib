import { supabase } from '../lib/supabase';
import { isSupabaseReady } from '../lib/supabase';
import { User, Exhibitor, Partner, Product, Appointment, Event, ChatMessage, ChatConversation, MiniSiteSection, MessageAttachment, ExhibitorCategory, ContactInfo, TimeSlot, UserProfile } from '../types';

// Production: All data from Supabase only
function getDemoExhibitors(): Exhibitor[] {
  return [];
}

// Interfaces pour les données de base de données
interface UserDB {
  id: string;
  email: string;
  name: string;
  type: 'exhibitor' | 'partner' | 'visitor' | 'admin' | 'security';
  profile: UserProfile;
  visitor_level?: 'free' | 'premium' | 'vip';
  status?: 'active' | 'pending' | 'suspended' | 'rejected';
  created_at: string;
  updated_at: string;
  exhibitor?: ExhibitorDB;
  partner_projects?: PartnerProject[];
}

interface PartnerDB {
  id: string;
  company_name: string;
  partner_type: string;
  sector?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  verified: boolean;
  featured: boolean;
  partnership_level?: string;
  benefits?: string[];
  contact_info?: { country?: string };
  created_at: string;
}

interface PartnerUI {
  id: string;
  name: string;
  partner_tier: string;
  category: string;
  sector?: string;
  description: string;
  logo?: string;
  website?: string;
  country: string;
  verified: boolean;
  featured: boolean;
  contributions: string[];
  views?: number;
  projects?: PartnerProject[];
  enrichedData?: Record<string, unknown>;
}

interface PartnersPageResult {
  items: PartnerUI[];
  total: number;
}

interface ProductDB {
  id: string;
  exhibitor_id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  specifications?: string;
  price?: number;
  featured: boolean;
}

interface MiniSiteData {
  theme: string;
  custom_colors?: Record<string, string>;
  sections?: MiniSiteSection[];
  published?: boolean;
}

interface RegistrationRequest {
  id: string;
  user_id: string;
  request_type: 'exhibitor' | 'partner';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface PartnerProject {
  id: string;
  partner_id?: string;
  user_id?: string;
  name: string;
  description: string;
  timeline?: Array<{ date: string; milestone: string }>;
  sectors?: string[];
  status?: string;
}

interface ExhibitorDB {
  id: string;
  user_id: string;
  company_name: string;
  category: string;
  sector: string;
  description: string;
  logo_url?: string;
  website?: string;
  verified: boolean;
  featured: boolean;
  stand_number?: string;
  stand_area?: number;
  contact_info: ContactInfo;
  products?: ProductDB[];
  mini_site?: MiniSiteData;
  user?: { profile: { standNumber?: string } }; // Ajout du champ user pour le standNumber
}

interface ExhibitorsPageResult {
  items: Exhibitor[];
  total: number;
}

interface MiniSiteDB {
  id: string;
  exhibitor_id: string;
  theme: string;
  custom_colors: Record<string, string>;
  sections: MiniSiteSection[];
  published: boolean;
  views: number;
  last_updated: string;
}

interface EventsPageResult {
  items: Event[];
  total: number;
}

interface AnalyticsData {
  miniSiteViews: number;
  appointments: number;
  products: number;
  profileViews: number;
  connections: number;
  messages: number;
}

interface Recommendation {
  id: string;
  item_type: string;
  similarity_score: number;
}

interface ErrorInfo {
  message: string;
  details: string | null;
}

interface MiniSiteFieldData {
  id?: string;
  theme?: string;
  custom_colors?: Record<string, string>;
  sections?: MiniSiteSection[];
  published?: boolean;
  views?: number;
  last_updated?: string;
}

interface EventDB {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  type?: string;
  capacity?: number;
  created_at: string;
}

interface ChatConversationDB {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at?: string;
  created_at: string;
  messages?: ChatMessageDB[];
}

interface ChatMessageDB {
  id: string;
  conversation_id?: string;
  sender_id?: string;
  sender?: { id: string; name?: string };
  receiver_id?: string;
  text?: string;
  content?: string;
  message_type?: string;
  created_at: string;
  read?: boolean;
  read_at?: string | null;
}

interface UserSignupData {
  type: 'visitor' | 'partner' | 'exhibitor' | 'admin' | 'security';
  name?: string;
  email?: string;
  profile?: UserProfile;
  [key: string]: unknown;
}

interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registrationType: string;
  status: string;
  registrationDate: Date;
  attendedAt?: Date;
  notes?: string;
  specialRequirements?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NetworkingRecommendationDB {
  id: string;
  userId: string;
  recommendedUserId: string;
  recommendationType: string;
  score: number;
  reasons: string[];
  category: string;
  viewed: boolean;
  contacted: boolean;
  mutualConnections: number;
  expiresAt: Date;
  createdAt: Date;
  recommendedUser?: User;
}

interface ActivityDB {
  id: string;
  userId: string;
  activityType: string;
  description: string;
  relatedUserId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata: Record<string, unknown>;
  isPublic: boolean;
  createdAt: Date;
  user?: User;
  relatedUser?: User;
}

interface SearchFilters {
  category?: string;
  sector?: string;
}

export class SupabaseService {
  // ==================== CONNECTION CHECK ====================
  static checkSupabaseConnection(): boolean {
    return isSupabaseReady();
  }

  // ==================== USER MANAGEMENT ====================
  static async getUserByEmail(email: string): Promise<User | null> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré');
      return null;
    }

    const safeSupabase = supabase!;
    try {
      // On récupère d'abord l'utilisateur - utiliser maybeSingle() au lieu de single()
      // pour éviter l'erreur "Cannot coerce" quand 0 ou plusieurs résultats
      // Optimized: Select only necessary columns instead of *
      const { data: usersData, error: userError } = await safeSupabase
        .from('users')
        .select('id, email, name, type, profile, visitor_level, status, created_at, updated_at')
        .eq('email', email)
        .range(0, 0);

      if (userError) {
        console.error('❌ Erreur DB lors de la récupération utilisateur:', userError.message);
        throw new Error(`Utilisateur non trouvé: ${userError.message}`);
      }

      const userData = usersData && usersData.length > 0 ? usersData[0] : null;

      if (!userData) {
        throw new Error('Aucun profil utilisateur trouvé pour cet email');
      }

      // Si c'est un exposant, récupérer les données d'exhibitor
      let exhibitorData: ExhibitorDB | null = null;
      if (userData.type === 'exhibitor') {
        try {
          const { data: exhibitorResult, error: exhibitorError } = await safeSupabase
            .from('exhibitors')
            .select('id, user_id, company_name, category, sector, description, logo_url, website, verified, featured, stand_number, contact_info, created_at, updated_at')
            .eq('user_id', userData.id)
            .maybeSingle();
          
          if (!exhibitorError && exhibitorResult) {
            exhibitorData = exhibitorResult;
          } else if (exhibitorError) {
            console.warn('⚠️ Erreur lors de la récupération des données exposant:', exhibitorError.message);
          }
        } catch (e) {
          console.warn('⚠️ Exception lors de la récupération des données exposant:', e);
        }
      }

      // Si c'est un partenaire, on tente de récupérer ses projets séparément
      // pour éviter les erreurs de jointure si la relation n'est pas détectée par PostgREST
      let projects: PartnerProject[] = [];
      if (userData.type === 'partner') {
        try {
          // On essaie de récupérer par user_id (nouvelle structure)
          // Optimized: Select only necessary columns
          const { data: projectsData, error: projectsError } = await safeSupabase
            .from('partner_projects')
            .select('id, user_id, partner_id, name, description, sectors, status, created_at')
            .eq('user_id', userData.id);
          
          if (!projectsError && projectsData) {
            projects = projectsData;
          } else {
            // Fallback: essayer de trouver via la table partners si user_id n'existe pas encore
            const { data: partnerData } = await safeSupabase
              .from('partners')
              .select('id')
              .eq('user_id', userData.id)
              .single();
            
            if (partnerData) {
              // Optimized: Select only necessary columns
              const { data: fallbackProjects } = await safeSupabase
                .from('partner_projects')
                .select('id, user_id, partner_id, name, description, sectors, status, created_at')
                .eq('partner_id', partnerData.id);
              
              if (fallbackProjects) {
                projects = fallbackProjects;
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ Erreur lors de la récupération des projets partenaire:', e);
        }
      }

      const combinedData = {
        ...userData,
        exhibitor: exhibitorData,
        partner_projects: projects
      };

      return this.transformUserDBToUser(combinedData);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;
    try {
      // Soft-delete: marquer l'utilisateur comme supprimé
      const { error } = await safeSupabase
        .from('users')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw new Error(`Erreur suppression utilisateur ${userId}: ${error.message}`);
    } catch (error) {
      console.error(`Erreur deleteUser ${userId}:`, error);
      throw error;
    }
  }

  static async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // ✅ Étape 1: Vérifier que l'utilisateur existe et que nous avons les droits d'accès
      console.log('🔍 Vérification de l\'utilisateur avant mise à jour:', userId);
      const { data: existingUser, error: checkError } = await safeSupabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (checkError) {
        console.error(`❌ Erreur vérification utilisateur ${userId}:`, checkError);
        throw new Error(`Utilisateur ${userId} non trouvé ou pas d'accès (RLS): ${checkError.message}`);
      }

      if (!existingUser) {
        throw new Error(`Utilisateur ${userId} n'existe pas en base de données`);
      }

      // ✅ Étape 2: Construire les données à mettre à jour
      const updateData: Record<string, any> = {};
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.type !== undefined) updateData.type = userData.type;
      if (userData.status !== undefined) updateData.status = userData.status;
      if (userData.profile !== undefined) updateData.profile = userData.profile;

      updateData.updated_at = new Date().toISOString();

      // ✅ Étape 3: Effectuer la mise à jour avec gestion appropriée des résultats
      console.log('📝 Mise à jour utilisateur:', userId, Object.keys(updateData));
      const { data, error } = await safeSupabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('*');

      if (error) {
        console.error(`❌ Erreur lors de la mise à jour ${userId}:`, error);
        throw new Error(`Erreur mise à jour: ${error.message}`);
      }

      // ✅ Vérifier que nous avons au moins un résultat
      if (!data || data.length === 0) {
        console.error(`❌ PGRST116: Aucune ligne retournée après la mise à jour de ${userId}`);
        throw new Error(`Pas de données retournées après mise à jour de ${userId}. Vérifiez les permissions RLS.`);
      }

      const updatedData = Array.isArray(data) ? data[0] : data;
      console.log('✅ Utilisateur mis à jour avec succès:', userId);
      return this.transformUserDBToUser(updatedData);
    } catch (error) {
      console.error(`❌ Erreur mise à jour utilisateur ${userId}:`, error);
      throw error;
    }
  }

  static async createSimpleRegistrationRequest(userId: string, requestType: 'exhibitor' | 'partner'): Promise<RegistrationRequest | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('registration_requests')
        .insert([{
          user_id: userId,
          request_type: requestType,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`❌ Erreur création demande d'inscription:`, error);
      throw error;
    }
  }

  // ==================== EXHIBITORS ====================
  static async getExhibitorsPaginated(options?: {
    limit?: number;
    offset?: number;
  }): Promise<ExhibitorsPageResult> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré - aucun exposant disponible');
      return { items: [], total: 0 };
    }

    const safeSupabase = supabase!;
    const limit = options?.limit ?? 24;
    const offset = options?.offset ?? 0;

    try {
      const { data: exhibitorsData, error: exhibitorsError, count } = await safeSupabase
        .from('exhibitors')
        .select(
          `
          id,
          user_id,
          company_name,
          category,
          sector,
          description,
          logo_url,
          website,
          verified,
          featured,
          stand_number,
          contact_info,
          mini_site:mini_sites!mini_sites_exhibitor_id_fkey(published)
        `,
          { count: 'exact' }
        )
        .order('company_name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (exhibitorsError) {
        console.error('❌ Erreur chargement exposants (paginé):', exhibitorsError.message);
        return { items: [], total: 0 };
      }

      const items = (exhibitorsData || []).map((e: object) => {
        return this.transformExhibitorDBToExhibitor(e as ExhibitorDB);
      });

      return {
        items,
        total: count ?? 0,
      };
    } catch (error) {
      console.error('❌ Erreur critique getExhibitorsPaginated:', error);
      return { items: [], total: 0 };
    }
  }

  static async getExhibitors(): Promise<Exhibitor[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré - aucun exposant disponible');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      const { data: exhibitorsData, error: exhibitorsError } = await safeSupabase
        .from('exhibitors')
        .select(`
          id,
          user_id,
          company_name,
          category,
          sector,
          description,
          logo_url,
          website,
          verified,
          featured,
          stand_number,
          contact_info
        `)
        .order('company_name', { ascending: true });

      if (exhibitorsError) {
        console.error('❌ Erreur chargement exposants:', exhibitorsError.message);
        return [];
      }

      if (!exhibitorsData || exhibitorsData.length === 0) {
        console.log('ℹ️ Aucun exposant dans la table exhibitors');
        return [];
      }

      console.log(`✅ ${exhibitorsData.length} exposants chargés depuis 'exhibitors'`);
      return exhibitorsData.map((e: object) => {
        return this.transformExhibitorDBToExhibitor(e as ExhibitorDB);
      });

    } catch (error) {
       console.error('❌ Erreur critique getExhibitors:', error);
       return [];
    }
  }

  /**
   * Récupérer un exposant par son ID (même non publié)
   * Utilisé pour les pages de détail où le propriétaire doit voir son profil
   */
  static async getExhibitorById(id: string): Promise<Exhibitor | null> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré');
      return null;
    }

    const safeSupabase = supabase!;
    try {
      // Tenter de récupérer depuis la table exhibitors
      const { data: exhibitorData, error: exhibitorError } = await safeSupabase
        .from('exhibitors')
        .select(`
          id,
          user_id,
          company_name,
          category,
          sector,
          description,
          logo_url,
          website,
          verified,
          featured,
          stand_number,
          contact_info,
          is_published,
          mini_site:mini_sites!mini_sites_exhibitor_id_fkey(id, theme, custom_colors, sections, published, views, last_updated),
          products:products!exhibitor_id(id, exhibitor_id, name, description, category, images, specifications, price, featured)
        `)
        .eq('id', id)
        .single();

      if (!exhibitorError && exhibitorData) {
        return this.transformExhibitorDBToExhibitor(exhibitorData);
      }

      // Sinon, essayer exhibitor_profiles
      const { data: profileData, error: profileError } = await safeSupabase
        .from('exhibitor_profiles')
        .select(`
          id,
          user_id,
          company_name,
          category,
          sector,
          description,
          logo_url,
          website,
          email,
          phone,
          country,
          is_published
        `)
        .eq('id', id)
        .single();

      if (!profileError && profileData) {
        return {
          id: profileData.id,
          userId: profileData.user_id,
          companyName: profileData.company_name || 'Exposant',
          category: (profileData.category || 'bâtiment-industry') as ExhibitorCategory,
          sector: profileData.sector || '',
          description: profileData.description || '',
          logo: profileData.logo_url,
          website: profileData.website,
          verified: false,
          featured: false,
          isPublished: profileData.is_published ?? false,
          contactInfo: {
            email: profileData.email || '',
            phone: profileData.phone || '',
            address: '',
            city: '',
            country: profileData.country || ''
          },
          products: [],
          miniSite: null,
          availability: [],
          certifications: [],
          markets: []
        };
      }

      console.warn(`Exposant ${id} non trouvé`);
      return null;

    } catch (error) {
      console.error('Erreur lors de la récupération de l\'exposant:', error);
      return null;
    }
  }

  // ==================== PARTNERS ====================

  /** Normalise les valeurs DB (gold/silver/government/…) vers les tiers SIB valides */
  private static normalizePartnerTier(
    partnerType?: string | null,
    partnershipLevel?: unknown
  ): 'organizer' | 'co_organizer' | 'official_sponsor' | 'delegated_organizer' | 'partner' | 'press_partner' {
    type SIBTier = 'organizer' | 'co_organizer' | 'official_sponsor' | 'delegated_organizer' | 'partner' | 'press_partner';
    const map: Record<string, SIBTier> = {
      'gold': 'official_sponsor',
      'silver': 'co_organizer',
      'bronze': 'partner',
      'platinum': 'organizer',
      'government': 'organizer',
      'governmental': 'organizer',
      'institutional': 'official_sponsor',
      'press': 'press_partner',
      'media': 'press_partner',
      'sponsor': 'official_sponsor',
      'organizer': 'organizer',
      'co_organizer': 'co_organizer',
      'official_sponsor': 'official_sponsor',
      'delegated_organizer': 'delegated_organizer',
      'partner': 'partner',
      'press_partner': 'press_partner',
    };
    let rawLevel: string | null = null;
    if (typeof partnershipLevel === 'string') rawLevel = partnershipLevel;
    else if (typeof partnershipLevel === 'object' && partnershipLevel !== null)
      rawLevel = (partnershipLevel as any).level || (partnershipLevel as any).name || null;
    if (rawLevel && map[rawLevel]) return map[rawLevel];
    if (partnerType && map[partnerType]) return map[partnerType];
    return 'partner';
  }
  static async getPartnersPaginated(options?: {
    limit?: number;
    offset?: number;
  }): Promise<PartnersPageResult> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré - aucun partenaire disponible');
      return { items: [], total: 0 };
    }

    const safeSupabase = supabase!;
    const limit = options?.limit ?? 24;
    const offset = options?.offset ?? 0;

    try {
      // Sélectionner uniquement les colonnes garanties dans la table partners
      const { data, error, count } = await safeSupabase
        .from('partners')
        .select(
          `id, company_name, partner_type, sector, description, logo_url, website, verified, featured, partnership_level, contact_info, created_at, is_published`,
          { count: 'exact' }
        )
        // Afficher les partenaires publiés (true) OU dont is_published n'est pas renseigné (null)
        .or('is_published.eq.true,is_published.is.null')
        .order('featured', { ascending: false })
        .order('partner_type')
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const items = (data || []).map((partner: PartnerDB) => ({
        id: partner.id,
        name: typeof partner.company_name === 'string' ? partner.company_name : 'Partenaire',
        partner_tier: SupabaseService.normalizePartnerTier(
          typeof partner.partner_type === 'string' ? partner.partner_type : null,
          partner.partnership_level
        ),
        category: (typeof partner.partner_type === 'object') ? 'Partenaire' : (partner.partner_type || 'partner'),
        sector: typeof partner.sector === 'string' ? partner.sector : 'Autre',
        description: typeof partner.description === 'string' ? partner.description : '',
        logo: partner.logo_url,
        website: partner.website,
        country: (partner.contact_info as any)?.country || (partner.contact_info as any)?.pays || '',
        verified: partner.verified ?? false,
        featured: partner.featured ?? false,
        views: 0,
        contributions: [],
        establishedYear: 2024,
        employees: '1-10',
        createdAt: new Date(partner.created_at),
        updatedAt: new Date(partner.created_at)
      }));

      return { items, total: count ?? 0 };
    } catch (error) {
      try {
        const errorInfo = error as ErrorInfo & { hint?: string };
        console.error('Erreur lors de la récupération paginée des partenaires:', {
          message: errorInfo?.message || String(error),
          details: errorInfo?.details || errorInfo?.hint || null,
          raw: JSON.stringify(error)
        });
      } catch (e) {
        console.error('Erreur lors de la récupération paginée des partenaires (raw):', error);
      }
      return { items: [], total: 0 };
    }
  }

  static async getPartners(): Promise<PartnerUI[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré - aucun partenaire disponible');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      // FIX: Sélectionner uniquement les colonnes garanties dans la table partners
      const { data, error } = await safeSupabase
        .from('partners')
        .select(
          `id, company_name, partner_type, sector, description, logo_url, website, verified, featured, partnership_level, contact_info, created_at, is_published`
        )
        .or('is_published.eq.true,is_published.is.null')
        .order('featured', { ascending: false })
        .order('partner_type');

      if (error) throw error;

      return (data || []).map((partner: PartnerDB) => ({
        id: partner.id,
        name: typeof partner.company_name === 'string' ? partner.company_name : 'Partenaire',
        partner_tier: SupabaseService.normalizePartnerTier(
          typeof partner.partner_type === 'string' ? partner.partner_type : null,
          partner.partnership_level
        ),
        category: (typeof partner.partner_type === 'object') ? 'Partenaire' : (partner.partner_type || 'partner'),
        sector: typeof partner.sector === 'string' ? partner.sector : 'Autre',
        description: typeof partner.description === 'string' ? partner.description : '',
        logo: partner.logo_url,
        website: partner.website,
        country: (partner.contact_info as any)?.country || (partner.contact_info as any)?.pays || '',
        verified: partner.verified ?? false,
        featured: partner.featured ?? false,
        views: 0,
        contributions: [],
        establishedYear: 2024,
        employees: '1-10',
        createdAt: new Date(partner.created_at),
        updatedAt: new Date(partner.created_at)
      }));
    } catch (error) {
      // Log détaillé pour faciliter le debug (message, details, hint si disponibles)
      try {
        const errorInfo = error as ErrorInfo & { hint?: string };
        console.error('Erreur lors de la récupération des partenaires:', {
          message: errorInfo?.message || String(error),
          details: errorInfo?.details || errorInfo?.hint || null,
          raw: JSON.stringify(error)
        });
      } catch (e) {
        console.error('Erreur lors de la récupération des partenaires (raw):', error);
      }
      return [];
    }
  }

  static async getPartnerById(id: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // Récupérer les données du partenaire (colonnes core garanties + enrichies si disponibles)
      const coreSelect = `id, company_name, partner_type, sector, description, logo_url, website, verified, featured, partnership_level, contact_info, created_at, is_published, contributions, projects:partner_projects(*)`;
      const enrichedSelect = `${coreSelect}, mission, vision, values, certifications, awards, social_media, key_figures, testimonials, news, expertise, clients, video_url, gallery`;

      let data: Record<string, any> | null = null;
      let error: any = null;

      // Tenter d'abord la requête enrichie, retomber sur le core en cas d'erreur de colonne manquante
      const enrichedResult = await safeSupabase.from('partners').select(enrichedSelect).eq('id', id).single();
      if (enrichedResult.error && (enrichedResult.error.code === 'PGRST204' || String(enrichedResult.error.message).includes('column'))) {
        const coreResult = await safeSupabase.from('partners').select(coreSelect).eq('id', id).single();
        data = coreResult.data as Record<string, any> | null;
        error = coreResult.error;
      } else {
        data = enrichedResult.data as Record<string, any> | null;
        error = enrichedResult.error;
      }

      if (error) throw error;
      if (!data) return null;

      // Transformer les projets de la DB vers le format UI
      const dbProjects = (data.projects || []).map((p: Record<string, unknown>) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        startDate: p.start_date ? new Date(p.start_date as string) : new Date(),
        endDate: p.end_date ? new Date(p.end_date as string) : undefined,
        budget: p.budget,
        impact: p.impact,
        image: p.image_url,
        technologies: (p.technologies as string[]) || [],
        team: (p.team as unknown[]) || [],
        kpis: (p.kpis as Record<string, unknown>) || { progress: 0, satisfaction: 0, roi: 0 },
        timeline: ((p.timeline as unknown[]) || []).map((t: unknown) => {
          const timelineItem = t as Record<string, unknown>;
          return {
            ...timelineItem,
            date: timelineItem.date ? new Date(timelineItem.date as string) : new Date()
          };
        }),
        partners: (p.project_partners as unknown[]) || [],
        documents: (p.documents as unknown[]) || [],
        gallery: (p.gallery as unknown[]) || []
      }));

      // Utiliser les données de la base de données, avec fallback sur les données générées
      const fallbackData = this.getEnrichedPartnerData(data.id, data.company_name, data.sector);
      
      // Vérifier si les données enrichies existent dans la base
      const hasDbEnrichedData = data.mission || data.vision || (data.values_list && data.values_list.length > 0);

      return {
        id: data.id,
        name: typeof data.company_name === 'string' ? data.company_name : 'Partenaire',
        type: typeof data.partner_type === 'string' ? data.partner_type : 'gold',
        sponsorshipLevel: (typeof data.partnership_level === 'object' && data.partnership_level !== null)
          ? ((data.partnership_level as any).level || (data.partnership_level as any).name || 'silver')
          : (typeof data.partnership_level === 'string' ? data.partnership_level : (typeof data.partner_type === 'string' ? data.partner_type : 'silver')),
        category: (typeof data.partner_type === 'object') ? 'Partenaire' : data.partner_type,
        sector: typeof data.sector === 'string' ? data.sector : 'Bâtiment',
        description: typeof data.description === 'string' ? data.description : '',
        longDescription: typeof data.description === 'string' ? data.description : fallbackData.longDescription,
        logo: data.logo_url,
        website: data.website,
        country: (data.contact_info as any)?.country || (data.contact_info as any)?.pays || 'Maroc',
        verified: data.verified ?? true,
        featured: data.featured ?? false,
        is_published: data.is_published ?? false, // Statut de publication
        views: 0,
        contributions: Array.isArray(data.contributions)
          ? data.contributions
          : [],
        establishedYear: data.established_year || data.contact_info?.establishedYear || 2010,
        employees: data.employees || data.contact_info?.employees || '500-1000',
        projects: dbProjects.length > 0 ? dbProjects : this.getMockProjects(data.id, data.company_name),
        // Données enrichies depuis la base de données (avec fallback)
        mission: data.mission || fallbackData.mission,
        vision: data.vision || fallbackData.vision,
        values: data.values || fallbackData.values,
        certifications: data.certifications || fallbackData.certifications,
        // FIX: Normaliser awards (peut être string[] ou {name, year, issuer}[])
        awards: Array.isArray(data.awards)
          ? data.awards.map((a: any) =>
              typeof a === 'string'
                ? { name: a, year: 2024, issuer: 'SIB' }
                : a
            )
          : (fallbackData.awards as any[]),
        socialMedia: data.social_media || fallbackData.socialMedia,
        // FIX: Normaliser key_figures (peut être objet plat {key:value} ou tableau [{label,value}])
        keyFigures: Array.isArray(data.key_figures)
          ? data.key_figures
          : (data.key_figures && typeof data.key_figures === 'object')
            ? Object.entries(data.key_figures).map(([label, value]) => ({
                label,
                value: String(value),
                icon: 'BarChart3'
              }))
            : (fallbackData.keyFigures as any[]),
        testimonials: data.testimonials || fallbackData.testimonials,
        // FIX: Normaliser news (dates peuvent être des strings)
        news: Array.isArray(data.news)
          ? data.news.map((n: any) => ({
              ...n,
              date: n.date ? new Date(n.date) : new Date(),
              excerpt: n.excerpt || n.description || ''
            }))
          : (fallbackData.news as any[]),
        expertise: data.expertise || fallbackData.expertise,
        clients: data.clients || fallbackData.clients,
        videoUrl: data.video_url || fallbackData.videoUrl,
        gallery: data.gallery || fallbackData.gallery,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du partenaire:', error);
      return null;
    }
  }

  /**
   * Retourne des valeurs vides en fallback — les vraies données sont dans Supabase.
   * Aucune donnée générique/fictive n'est générée ici.
   */
  private static getEnrichedPartnerData(_partnerId: string, _partnerName: string, _sector?: string): Record<string, unknown> {
    return {
      longDescription: null,
      mission: null,
      vision: null,
      values: [],
      certifications: [],
      awards: [],
      socialMedia: null,
      keyFigures: [],
      testimonials: [],
      news: [],
      expertise: [],
      clients: [],
      videoUrl: null,
      gallery: []
    };
  }

  /**
   * Pas de projets fictifs — retourne un tableau vide si aucun projet réel n'existe en base.
   */
  private static getMockProjects(_partnerId: string, _partnerName: string): PartnerProject[] {
    return [];
  }

  // ==================== RECOMMENDATIONS ====================
  static async getRecommendationsForUser(userId: string, limit: number = 10): Promise<{ itemId: string; itemType: string; similarityScore: number }[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn("⚠️ Supabase non configuré - impossible de récupérer les recommandations");
      return [];
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .rpc("get_recommendations_for_user", { p_user_id: userId, p_limit: limit });

      if (error) throw error;

      return (data || []).map((rec: Recommendation) => ({
        itemId: rec.item_id,
        itemType: rec.item_type,
        similarityScore: rec.similarity_score,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des recommandations:", error);
      return [];
    }
  }

  // ==================== TRANSFORMATION METHODS ====================
  private static transformUserDBToUser(userDB: UserDB | null): User | null {
    if (!userDB) return null;
    
    // Check both column and profile for visitor_level
    // Cast profile as any to access visitor_level if it's not in UserProfile type explicitly
    const profileLevel = (userDB.profile as any)?.visitor_level;
    const effectiveLevel = userDB.visitor_level || profileLevel;

    // Enrichir le profil avec les données d'exhibitor si disponibles
    let enrichedProfile = { ...userDB.profile } as any || {};
    
    // Si c'est un exhibitor et qu'on a les données d'exhibitor, enrichir le profil
    if (userDB.type === 'exhibitor' && userDB.exhibitor) {
      enrichedProfile.standArea = userDB.exhibitor.stand_area || enrichedProfile.standArea || 9;
      enrichedProfile.companyName = userDB.exhibitor.company_name || enrichedProfile.companyName;
      enrichedProfile.website = userDB.exhibitor.website || enrichedProfile.website;
      enrichedProfile.standNumber = userDB.exhibitor.stand_number || enrichedProfile.standNumber;
      enrichedProfile.companyDescription = userDB.exhibitor.description || enrichedProfile.companyDescription;
      enrichedProfile.sectors = (userDB.exhibitor.sector ? [userDB.exhibitor.sector] : enrichedProfile.sectors) || [];
    }

    return {
      id: userDB.id,
      email: userDB.email,
      name: userDB.name,
      type: userDB.type,
      visitor_level: effectiveLevel,
      profile: enrichedProfile,
      status: userDB.status || 'active',
      projects: userDB.partner_projects || [],
      createdAt: new Date(userDB.created_at),
      updatedAt: new Date(userDB.updated_at)
    };
  }

  private static transformAuthUserToUser(authUser: any, emailFallback?: string): User {
    const meta = authUser?.user_metadata || {};
    const firstName = meta.firstName || meta.first_name || '';
    const lastName = meta.lastName || meta.last_name || '';

    return {
      id: authUser?.id,
      email: authUser?.email || emailFallback || '',
      name: meta.name || [firstName, lastName].filter(Boolean).join(' ') || (authUser?.email?.split('@')[0] || 'Utilisateur'),
      type: meta.type || 'visitor',
      visitor_level: meta.visitor_level,
      profile: {
        firstName,
        lastName,
        company: meta.company || '',
        position: meta.position || '',
        country: meta.country || '',
        bio: meta.bio || '',
        standArea: Number(meta.standArea || 9),
        interests: Array.isArray(meta.interests) ? meta.interests : [],
        objectives: Array.isArray(meta.objectives) ? meta.objectives : [],
        sectors: Array.isArray(meta.sectors) ? meta.sectors : [],
        products: Array.isArray(meta.products) ? meta.products : [],
        videos: Array.isArray(meta.videos) ? meta.videos : [],
        images: Array.isArray(meta.images) ? meta.images : [],
        participationObjectives: Array.isArray(meta.participationObjectives) ? meta.participationObjectives : [],
        thematicInterests: Array.isArray(meta.thematicInterests) ? meta.thematicInterests : [],
        collaborationTypes: Array.isArray(meta.collaborationTypes) ? meta.collaborationTypes : [],
        expertise: Array.isArray(meta.expertise) ? meta.expertise : [],
        visitObjectives: Array.isArray(meta.visitObjectives) ? meta.visitObjectives : []
      },
      status: meta.status || 'active',
      projects: [],
      createdAt: authUser?.created_at ? new Date(authUser.created_at) : new Date(),
      updatedAt: authUser?.updated_at ? new Date(authUser.updated_at) : new Date()
    };
  }

  private static transformExhibitorDBToExhibitor(exhibitorDB: ExhibitorDB): Exhibitor {
    const products = (exhibitorDB.products || []).map((p: ProductDB) => ({
      id: p.id,
      exhibitorId: p.exhibitor_id,
      name: p.name,
      description: p.description,
      category: p.category,
      images: p.images || [],
      specifications: p.specifications,
      price: p.price,
      featured: p.featured || false
    }));

    // mini_site est retourné comme un array par Supabase, prenons le premier élément
    const miniSiteArray = exhibitorDB.mini_site as unknown;
    const miniSiteData = Array.isArray(miniSiteArray) && miniSiteArray.length > 0 ? (miniSiteArray[0] as MiniSiteFieldData) : (miniSiteArray as MiniSiteFieldData);

    const miniSite = miniSiteData ? {
      id: miniSiteData.id || '',
      exhibitorId: exhibitorDB.id,
      theme: miniSiteData.theme || 'default',
      customColors: miniSiteData.custom_colors || { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
      sections: miniSiteData.sections || [],
      published: miniSiteData.published || false,
      views: miniSiteData.views || 0,
      lastUpdated: new Date(miniSiteData.last_updated || Date.now())
    } : null;

    return {
      id: exhibitorDB.id,
      userId: exhibitorDB.user_id,
      companyName: exhibitorDB.company_name,
      category: exhibitorDB.category as ExhibitorCategory,
      sector: exhibitorDB.sector,
      description: exhibitorDB.description,
      logo: exhibitorDB.logo_url,
      website: exhibitorDB.website,
      verified: exhibitorDB.verified,
      featured: exhibitorDB.featured,
      isPublished: exhibitorDB.is_published ?? false,
      standNumber: exhibitorDB.stand_number,
      standArea: exhibitorDB.stand_area,
      contactInfo: exhibitorDB.contact_info,
      products,
      miniSite,
      availability: [],
      certifications: [],
      markets: []
    };
  }

  private static transformEventDBToEvent(eventDB: EventDB): Event {
    // Valider les dates avant de les convertir
    const startTime = eventDB.event_date || eventDB.start_time || eventDB.start_date; // Fallback pour compatibilité
    const endTime = eventDB.end_time || eventDB.end_date;
    
    if (!startTime) {
      console.warn('Event sans start_time:', eventDB.id);
      // Utiliser une date par défaut
      const defaultDate = new Date();
      return {
        id: eventDB.id,
        title: eventDB.title || 'Sans titre',
        description: eventDB.description || '',
        type: eventDB.type || eventDB.event_type || 'conference',
        startDate: defaultDate,
        endDate: defaultDate,
        capacity: eventDB.capacity,
        registered: eventDB.registered || 0,
        location: eventDB.location,
        pavilionId: eventDB.pavilion_id,
        organizerId: eventDB.organizer_id,
        featured: eventDB.featured || eventDB.is_featured || false,
        imageUrl: eventDB.image_url,
        registrationUrl: eventDB.registration_url,
        tags: eventDB.tags || [],
        date: defaultDate,
        startTime: defaultDate.toISOString(),
        endTime: defaultDate.toISOString()
      };
    }
    
    const startDate = new Date(startTime);
    let endDate: Date;

    // Gérer le cas où endTime est juste une heure (ex: "13:00:00")
    if (endTime && typeof endTime === 'string' && endTime.includes(':') && !endTime.includes('-') && !endTime.includes('T')) {
      const [hours, minutes] = endTime.split(':').map(Number);
      endDate = new Date(startDate);
      endDate.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0);
    } else {
      endDate = new Date(endTime || startTime);
    }
    
    // Vérifier que les dates sont valides
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('Event avec dates invalides:', eventDB.id, startTime, endTime);
      const defaultDate = new Date();
      return {
        id: eventDB.id,
        title: eventDB.title || 'Sans titre',
        description: eventDB.description || '',
        type: eventDB.type || eventDB.event_type || 'conference',
        startDate: defaultDate,
        endDate: defaultDate,
        capacity: eventDB.capacity,
        registered: eventDB.registered || 0,
        location: eventDB.location,
        pavilionId: eventDB.pavilion_id,
        organizerId: eventDB.organizer_id,
        featured: eventDB.featured || eventDB.is_featured || false,
        imageUrl: eventDB.image_url,
        registrationUrl: eventDB.registration_url,
        tags: eventDB.tags || [],
        speakers: eventDB.speakers || [],
        date: defaultDate,
        startTime: '00:00',
        endTime: '00:00'
      };
    }

    return {
      id: eventDB.id,
      title: eventDB.title,
      description: eventDB.description,
      type: eventDB.type || eventDB.event_type,
      startDate,
      endDate,
      capacity: eventDB.capacity,
      registered: eventDB.registered || 0,
      location: eventDB.location,
      pavilionId: eventDB.pavilion_id,
      organizerId: eventDB.organizer_id,
      featured: eventDB.featured || eventDB.is_featured || false,
      imageUrl: eventDB.image_url,
      registrationUrl: eventDB.registration_url,
      tags: eventDB.tags || [],
      speakers: eventDB.speakers || [],
      // Legacy/computed fields for backward compatibility
      date: startDate,
      startTime: startDate.toISOString().substring(11, 16),
      endTime: endDate.toISOString().substring(11, 16),
    };
  }

  // ==================== AUTHENTICATION ====================
  static async signUp(email: string, password: string, userData: UserSignupData): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      console.log('📝 Tentative de création utilisateur:', { email, type: userData.type });
      
      const signUpOptions: any = {
        data: {
          name: userData.name,
          type: userData.type
        }
      };
      
      const { data: authData, error: authError } = await safeSupabase.auth.signUp({
        email,
        password,
        options: signUpOptions
      });

      console.log('📝 Réponse signUp:', { 
        user: authData?.user?.id, 
        email: authData?.user?.email,
        confirmed: authData?.user?.email_confirmed_at,
        session: !!authData?.session,
        error: authError 
      });

      if (authError) {
        console.error('❌ Erreur Auth (Détails):', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });

        // Cas spécial : auth user existe déjà (inscription partielle précédente)
        // → essayer de récupérer en créant le profil qui manque dans users
        const isAlreadyRegistered =
          authError.message?.toLowerCase().includes('already registered') ||
          authError.message?.toLowerCase().includes('already been registered') ||
          authError.message?.toLowerCase().includes('user already');

        if (isAlreadyRegistered) {
          console.warn('⚠️ Auth user déjà existant — vérification du profil users...');
          // Se connecter pour récupérer l'ID de l'auth user
          const { data: signInData, error: signInErr } = await safeSupabase.auth.signInWithPassword({ email, password });
          if (!signInErr && signInData?.user) {
            // Vérifier si un profil users existe déjà
            const { data: existingProfile } = await safeSupabase
              .from('users')
              .select('*')
              .eq('email', email)
              .maybeSingle();

            if (existingProfile) {
              // Profil complet → compte déjà créé
              throw new Error('Un compte existe déjà avec cet email. Veuillez vous connecter.');
            } else {
              // Profil manquant → le créer maintenant et continuer
              console.log('✅ Profil manquant détecté — création du profil...');
              const recoveryPayload: UserDB = {
                id: signInData.user.id,
                email,
                name: userData.name,
                type: userData.type,
                status: (userData.type === 'visitor' ? 'active' : (userData.status || 'pending')) as any,
                profile: userData.profile || {},
                ...(userData.type === 'visitor' ? { visitor_level: 'free' } : {})
              };
              const { data: recoveryProfile, error: recoveryErr } = await safeSupabase
                .from('users')
                .insert([recoveryPayload])
                .select()
                .single();
              if (!recoveryErr && recoveryProfile) {
                console.log('✅ Profil récupéré avec succès');
                return this.transformUserDBToUser(recoveryProfile);
              }
            }
          }
        }

        throw authError;
      }
      if (!authData.user) {
        console.error('❌ Aucun utilisateur retourné par Auth');
        return null;
      }
      
      // ⚠️ Vérifier si l'email n'est pas confirmé
      if (!authData.user.email_confirmed_at) {
        console.warn('⚠️ Email non confirmé! Session:', authData.session ? 'OUI' : 'NON');
      }


      // 2. Créer le profil utilisateur
      const userPayload: UserDB = {
        id: authData.user.id,
        email,
        name: userData.name,
        type: userData.type,
        status: (userData.status || 'pending') as any, // ✅ Inclure le status (pending_payment pour partners/exhibitors)
        profile: userData.profile
      };

      // ✅ Définir le niveau visiteur par défaut à 'free' pour les visiteurs
      if (userData.type === 'visitor') {
        userPayload.visitor_level = 'free';
        // Les visiteurs gratuits sont actifs immédiatement
        if (!userData.status) {
          userPayload.status = 'active';
        }
      }

      const { data: userProfile, error: userError } = await safeSupabase
        .from('users')
        .insert([userPayload])
        .select()
        .single();

      if (userError) {
        console.error('❌ Erreur création profil:', userError);
        throw userError;
      }


      // 3. Si c'est un exposant ou partenaire, créer l'entrée correspondante
      if (userData.type === 'exhibitor') {
        await this.createExhibitorProfile(authData.user.id, userData);
      } else if (userData.type === 'partner') {
        await this.createPartnerProfile(authData.user.id, userData);
      }

      return this.transformUserDBToUser(userProfile);
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string, options?: { rememberMe?: boolean }): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;

    try {
      // AUTHENTIFICATION SUPABASE STANDARD
      const { data, error: authError } = await safeSupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Erreur auth signIn:', authError);
        
        // Améliorer le message d'erreur selon le type
        if (authError.message?.includes('Invalid login credentials')) {
          // Vérifier si l'utilisateur existe dans la DB
          const { data: existingUser } = await safeSupabase
            .from('users')
            .select('email, status, type, visitor_level')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();
          
          if (existingUser) {
            // L'utilisateur existe mais ne peut pas se connecter
            // Probablement un problème de confirmation d'email ou mot de passe incorrect
            throw new Error(
              'Identifiants incorrects. Vérifiez votre email et mot de passe. ' +
              'Si vous venez de créer votre compte, vérifiez vos emails (y compris spam) pour confirmer votre adresse email.'
            );
          } else {
            // L'utilisateur n'existe pas
            throw new Error('Aucun compte trouvé avec cet email. Veuillez d\'abord créer un compte.');
          }
        }
        
        throw authError;
      }

      if (!data.user) return null;

      // ✅ Note: Supabase persiste automatiquement les sessions dans localStorage par défaut
      // L'option rememberMe est enregistrée pour référence future (ex: logout automatique)
      // Session handling via Supabase auth persistence (sufficient for most use cases)
      if (options?.rememberMe === false) {
        // Future: Could implement sessionStorage for temporary sessions if needed
      }

      // Récupérer le profil utilisateur
      let user: User | null = null;
      let usersPolicyRecursion = false;

      try {
        user = await this.getUserByEmail(email);
      } catch (profileError) {
        const message = profileError instanceof Error ? profileError.message : String(profileError || '');
        usersPolicyRecursion = message.includes('infinite recursion detected in policy for relation "users"');

        if (usersPolicyRecursion) {
          console.warn('⚠️ Policy RLS récursive détectée sur users, fallback sur auth.user');
          user = this.transformAuthUserToUser(data.user, email);
        } else {
          throw profileError;
        }
      }

      if (!user) {
        if (usersPolicyRecursion) {
          user = this.transformAuthUserToUser(data.user, email);
          return user;
        }

        // Profil absent dans users (inscription partielle) → le créer automatiquement
        console.warn('⚠️ Profil absent dans users, création automatique...');
        const authUser = data.user;
        const userPayload = {
          id: authUser.id,
          email: authUser.email || email,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Utilisateur',
          type: (authUser.user_metadata?.type || 'visitor') as string,
          status: 'active',
          visitor_level: 'free',
          profile: { bio: '', location: '', website: '', phone: '' }
        };
        const { data: created } = await safeSupabase.from('users').insert([userPayload]).select().single();
        if (created) {
          user = this.transformUserDBToUser(created);
          console.log('✅ Profil recréé automatiquement');
        } else {
          throw new Error('Profil utilisateur introuvable. Veuillez contacter le support.');
        }
      }

      return user;
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      throw error; // Re-throw l'erreur au lieu de retourner null
    }
  }

  // ==================== REAL IMPLEMENTATIONS ====================
  static async createMiniSite(exhibitorId: string, miniSiteData: MiniSiteData): Promise<MiniSiteDB | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // CRITICAL FIX: Convertir les données du wizard en sections de mini-site
      const sections = miniSiteData.sections || [];

      // Si pas de sections mais des données brutes, les convertir
      if (sections.length === 0) {
        // Section Hero avec le nom de l'entreprise
        if (miniSiteData.company || miniSiteData.logo) {
          sections.push({
            id: 'hero',
            type: 'hero',
            title: 'Accueil',
            visible: true,
            order: 0,
            content: {
              title: miniSiteData.company || 'Mon Entreprise',
              subtitle: miniSiteData.description?.substring(0, 150) || '',
              backgroundImage: miniSiteData.logo || '',
              ctaText: 'Nous contacter',
              ctaLink: '#contact'
            }
          });
        }

        // Section À propos avec la description
        if (miniSiteData.description) {
          sections.push({
            id: 'about',
            type: 'about',
            title: 'À propos',
            visible: true,
            order: 1,
            content: {
              title: 'Notre expertise',
              description: miniSiteData.description,
              features: []
            }
          });
        }

        // Section Produits
        if (miniSiteData.products && miniSiteData.products.length > 0) {
          const productsList = Array.isArray(miniSiteData.products)
            ? miniSiteData.products.map((p: unknown, idx: number) => {
                const product = p as Record<string, unknown>;
                return {
                  id: String(idx + 1),
                  name: typeof p === 'string' ? p : (product.name as string) || 'Produit',
                  description: typeof p === 'object' ? (product.description as string) || '' : '',
                  image: typeof p === 'object' ? (product.image as string) || '' : '',
                  features: [],
                  price: ''
                };
              })
            : [];

          sections.push({
            id: 'products',
            type: 'products',
            title: 'Produits & Services',
            visible: true,
            order: 2,
            content: {
              title: 'Nos solutions',
              products: productsList
            }
          });
        }

        // Section Contact
        if (miniSiteData.contact || miniSiteData.socials) {
          sections.push({
            id: 'contact',
            type: 'about' as any, // Type 'contact' not in union, using 'about' as fallback
            title: 'Contact',
            visible: true,
            order: 3,
            content: {
              title: 'Contactez-nous',
              email: miniSiteData.contact?.email || '',
              phone: miniSiteData.contact?.phone || '',
              address: miniSiteData.contact?.address || '',
              website: miniSiteData.contact?.website || '',
              socials: miniSiteData.socials || []
            }
          });
        }
      }

      const { data, error } = await safeSupabase
        .from('mini_sites')
        .insert([{
          exhibitor_id: exhibitorId,
          title: miniSiteData.company || 'Mon Mini-Site',
          description: miniSiteData.description || '',
          logo_url: miniSiteData.logo || '',
          theme: typeof miniSiteData.theme === 'object' ? miniSiteData.theme : { primaryColor: '#1e40af' },
          sections: sections,
          contact_info: miniSiteData.contact || {},
          social_links: { links: miniSiteData.socials || [] },
          published: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Marquer que le mini-site a été créé dans le profil utilisateur
      try {
        await safeSupabase
          .from('users')
          .update({ minisite_created: true })
          .eq('id', exhibitorId);
      } catch (updateErr) {
        console.warn('Impossible de marquer minisite_created:', updateErr);
      }

      return data;
    } catch (error) {
      console.error('Erreur création mini-site:', error);
      throw error; // Propager l'erreur pour meilleur debugging
    }
  }

  static async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      const updateData: Record<string, unknown> = {};

      if (eventData.title !== undefined) updateData.title = eventData.title;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.type !== undefined) updateData.event_type = eventData.type;
      if (eventData.startDate !== undefined) updateData.start_date = eventData.startDate.toISOString();
      if (eventData.endDate !== undefined) updateData.end_date = eventData.endDate.toISOString();
      if (eventData.location !== undefined) updateData.location = eventData.location;
      if (eventData.pavilionId !== undefined) updateData.pavilion_id = eventData.pavilionId;
      if (eventData.organizerId !== undefined) updateData.organizer_id = eventData.organizerId;
      if (eventData.capacity !== undefined) updateData.capacity = eventData.capacity;
      if (eventData.featured !== undefined) updateData.is_featured = eventData.featured;
      if (eventData.imageUrl !== undefined) updateData.image_url = eventData.imageUrl;
      if (eventData.registrationUrl !== undefined) updateData.registration_url = eventData.registrationUrl;
      if (eventData.tags !== undefined) updateData.tags = eventData.tags;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await safeSupabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      return this.transformEventDBToEvent(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Erreur inconnue lors de la mise à jour de l'événement ${eventId}`;
      console.error(`Erreur lors de la mise à jour de l'événement ${eventId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
	    } catch (error) {
	      const errorMessage = error instanceof Error ? error.message : `Erreur inconnue lors de la suppression de l'événement ${eventId}`;
	      console.error(`Erreur lors de la suppression de l'événement ${eventId}:`, errorMessage);
	      throw new Error(errorMessage);
	    }
  }

  static async createEvent(eventData: Omit<Event, 'id' | 'registered'>): Promise<Event> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    // Validation des dates
    if (!eventData.startDate || !eventData.endDate) {
      throw new Error('Les dates de début et de fin sont obligatoires');
    }

    if (!(eventData.startDate instanceof Date) || isNaN(eventData.startDate.getTime())) {
      throw new Error('La date de début est invalide');
    }

    if (!(eventData.endDate instanceof Date) || isNaN(eventData.endDate.getTime())) {
      throw new Error('La date de fin est invalide');
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('events')
        .insert([{
          title: eventData.title,
          description: eventData.description,
          type: eventData.type,
          event_date: eventData.startDate.toISOString(),
          start_time: eventData.startDate.toISOString(),
          end_time: eventData.endDate.toISOString(),
          location: eventData.location,
          capacity: eventData.capacity,
          registered: 0,
          featured: eventData.featured,
          tags: eventData.tags || [],
        }])
        .select()
        .single();

      if (error) throw error;

      return this.transformEventDBToEvent(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la création de l\'événement';
      console.error('Erreur lors de la création de l\'événement:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  static async getEvents(): Promise<Event[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((event: EventDB) => this.transformEventDBToEvent(event));
    } catch (error) {
      // Ignorer les erreurs réseau silencieusement
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.error('Erreur récupération événements:', error);
      }
      return [];
    }
  }

  static async getEventsPaginated(options?: {
    limit?: number;
    offset?: number;
  }): Promise<EventsPageResult> {
    if (!this.checkSupabaseConnection()) return { items: [], total: 0 };

    const safeSupabase = supabase!;
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    try {
      const { data, error, count } = await safeSupabase
        .from('events')
        .select('*', { count: 'exact' })
        .order('event_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        items: (data || []).map((event: EventDB) => this.transformEventDBToEvent(event)),
        total: count ?? 0,
      };
    } catch (error) {
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.error('Erreur récupération événements paginés:', error);
      }
      return { items: [], total: 0 };
    }
  }

  static async registerForEvent(eventId: string, userId: string): Promise<boolean> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      // Vérifier si déjà inscrit
      const { data: existing } = await safeSupabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        throw new Error('Vous êtes déjà inscrit à cet événement');
      }

      // Vérifier la capacité de l'événement
      const { data: event, error: eventError } = await safeSupabase
        .from('events')
        .select('capacity, registered')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (event.capacity && event.registered >= event.capacity) {
        throw new Error('Événement complet');
      }

      // Créer l'inscription
      const { error: insertError } = await safeSupabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_id: userId,
          status: 'confirmed'
        }]);

      if (insertError) throw insertError;

      // Incrémenter le compteur
      const { error: updateError } = await safeSupabase
        .from('events')
        .update({ registered: (event.registered || 0) + 1 })
        .eq('id', eventId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Erreur inscription événement:', error);
      throw error;
    }
  }

  static async getUserEventRegistrations(userId: string): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      // Ignorer les erreurs réseau silencieusement
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.error('Erreur récupération inscriptions événements:', error);
      }
      return [];
    }
  }

  static async unregisterFromEvent(eventId: string, userId: string): Promise<boolean> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      // Vérifier si inscrit
      const { data: existing } = await safeSupabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existing) {
        throw new Error('Vous n\'êtes pas inscrit à cet événement');
      }

      // Supprimer l'inscription
      const { error: deleteError } = await safeSupabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Décrémenter le compteur
      const { data: event } = await safeSupabase
        .from('events')
        .select('registered')
        .eq('id', eventId)
        .single();

      if (event && event.registered > 0) {
        await safeSupabase
          .from('events')
          .update({ registered: event.registered - 1 })
          .eq('id', eventId);
      }

      return true;
    } catch (error) {
      console.error('Erreur désinscription événement:', error);
      throw error;
    }
  }

  static async isUserRegisteredForEvent(eventId: string, userId: string): Promise<boolean> {
    if (!this.checkSupabaseConnection()) return false;

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      return !!data && !error;
    } catch (error) {
      return false;
    }
  }

  static async getConversations(userId: string): Promise<ChatConversation[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('conversations')
        .select(`
          id,
          participants,
          type,
          title,
          description,
          created_by,
          last_message_at,
          is_active,
          metadata,
          created_at,
          updated_at,
          messages:messages(
            id,
            content,
            message_type,
            created_at,
            read_at,
            sender_id,
            receiver_id,
            sender:sender_id(id, name)
          )
        `)
        .contains('participants', [userId])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((conv: ChatConversationDB) => {
        const lastMessage = conv.messages?.[0];

        // ✅ Compter les messages non lus pour cet utilisateur
        const unreadCount = (conv.messages || []).filter((msg: ChatMessageDB) =>
          msg.sender_id !== userId && !msg.read_at
        ).length;

        // FIX N+1: Transform and include all messages in the conversation
        const messages = (conv.messages || []).map((msg: ChatMessageDB) => ({
          id: msg.id,
          senderId: msg.sender?.id || msg.sender_id || '',
          receiverId: msg.receiver_id || '',
          content: msg.content || msg.text || '',
          type: (msg.message_type || 'text') as 'text' | 'file' | 'system',
          timestamp: new Date(msg.created_at),
          read: msg.read_at !== null
        }));

        return {
          id: conv.id,
          participants: conv.participants,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            senderId: lastMessage.sender?.id || lastMessage.sender_id || '',
            receiverId: conv.participants.find((id: string) => id !== lastMessage.sender?.id) || '',
            content: lastMessage.content || lastMessage.text || '',
            type: (lastMessage.message_type || 'text') as 'text' | 'file' | 'system',
            timestamp: new Date(lastMessage.created_at),
            read: lastMessage.read_at !== null
          } : undefined,
          unreadCount, // ✅ Maintenant implémenté !
          messages, // FIX N+1: Return messages to avoid separate queries
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at)
        };
      });
    } catch (error) {
      console.error('Erreur récupération conversations:', error);
      return [];
    }
  }

  static async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map((msg: Record<string, unknown>) => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        type: msg.message_type,
        timestamp: new Date(msg.created_at),
        read: msg.read_at !== null
      }));
    } catch (error) {
      console.error('Erreur récupération messages:', error);
      return [];
    }
  }

  static async createConversation(userId1: string, userId2: string): Promise<ChatConversation | null> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    try {
      // Check if conversation already exists
      const { data: existing, error: existingError } = await safeSupabase
        .from('conversations')
        .select('*')
        .contains('participants', [userId1, userId2])
        .limit(1)
        .single();

      // If conversation exists, return it
      if (!existingError && existing) {
        return {
          id: existing.id,
          participants: existing.participants,
          unreadCount: 0,
          createdAt: new Date(existing.created_at),
          updatedAt: new Date(existing.updated_at)
        };
      }

      // Create new conversation
      const { data, error } = await safeSupabase
        .from('conversations')
        .insert({
          type: 'direct',
          participants: [userId1, userId2],
          created_by: userId1,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        participants: data.participants,
        unreadCount: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Erreur création conversation:', error);
      return null;
    }
  }

  static async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string, type: 'text' | 'image' = 'text'): Promise<ChatMessage | null> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          message_type: type
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        content: data.content,
        type: data.message_type,
        timestamp: new Date(data.created_at),
        read: false
      };
    } catch (error) {
      console.error('Erreur envoi message:', error);
      return null;
    }
  }

  /**
   * Marque tous les messages non lus d'une conversation comme lus pour un utilisateur
   * @param conversationId - ID de la conversation
   * @param userId - ID de l'utilisateur qui lit les messages
   */
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;

    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .is('read_at', null);

      if (error) throw error;

    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      throw error;
    }
  }

  static async getMiniSite(exhibitorId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // Essayer d'abord avec l'ID fourni directement (pourrait être user_id ou exhibitor_id)
      let { data, error } = await safeSupabase
        .from('mini_sites')
        .select('*')
        .eq('exhibitor_id', exhibitorId)
        .maybeSingle();

      // Si pas trouvé, l'ID pourrait être:
      // 1. L'exhibitor.id - donc chercher le user_id associé pour trouver le mini-site
      // 2. Le user_id - donc chercher l'exhibitor.id pour trouver le mini-site
      if (!data) {
        console.log('[MiniSite] Pas trouvé par exhibitor_id direct, recherche via exhibitors table...');

        // Stratégie 1: L'ID fourni est exhibitors.id, chercher son user_id
        const { data: exhibitorById } = await safeSupabase
          .from('exhibitors')
          .select('id, user_id')
          .eq('id', exhibitorId)
          .maybeSingle();

        if (exhibitorById?.user_id) {
          // Chercher le mini-site avec le user_id de l'exposant
          const result = await safeSupabase
            .from('mini_sites')
            .select('*')
            .eq('exhibitor_id', exhibitorById.user_id)
            .maybeSingle();

          data = result.data;
          error = result.error;
        }

        // Stratégie 2: L'ID fourni est le user_id, chercher l'exhibitor.id correspondant
        if (!data) {
          const { data: exhibitorByUserId } = await safeSupabase
            .from('exhibitors')
            .select('id, user_id')
            .eq('user_id', exhibitorId)
            .maybeSingle();

          if (exhibitorByUserId?.id) {
            // Chercher le mini-site avec l'exhibitor.id
            const result = await safeSupabase
              .from('mini_sites')
              .select('*')
              .eq('exhibitor_id', exhibitorByUserId.id)
              .maybeSingle();

            data = result.data;
            error = result.error;
          }
        }
      }

      if (error || !data) {
        if (error) {
          console.warn('[MiniSite] Erreur:', error.message);
        }
        
        // FALLBACK: Si l'exposant existe mais n'a pas de mini-site dans la table 'mini_sites',
        // on retourne une structure par défaut pour éviter l'erreur 404/406.
        // On vérifie d'abord si l'ID correspond à un exposant valide.
        const { data: exhibitorCheck } = await safeSupabase
          .from('exhibitors')
          .select('id, user_id, company_name')
          .or(`id.eq.${exhibitorId},user_id.eq.${exhibitorId}`)
          .maybeSingle();
          
        if (exhibitorCheck) {
             console.log('[MiniSite] Exposant trouvé sans mini-site (Custom). Génération structure par défaut.');
             return {
                id: `default-${exhibitorCheck.id}`,
                exhibitor_id: exhibitorCheck.user_id, // L'ID attendu par le frontend pour les produits, etc.
                published: true, // On force à true pour que la page s'affiche
                views: 0,
                last_updated: new Date().toISOString(),
                theme: {
                    primaryColor: '#1e40af',
                    secondaryColor: '#3b82f6',
                    accentColor: '#60a5fa',
                    fontFamily: 'Inter'
                },
                sections: [] // Pas de sections custom, le frontend utilisera les infos de base
             };
        }

        return null;
      }

      // Transformer la structure pour le frontend
      // Unifier theme et custom_colors en un seul objet theme
      if (data && data.custom_colors && typeof data.custom_colors === 'object') {
        data.theme = {
          primaryColor: data.custom_colors.primary || data.custom_colors.primaryColor || '#1e40af',
          secondaryColor: data.custom_colors.secondary || data.custom_colors.secondaryColor || '#3b82f6',
          accentColor: data.custom_colors.accent || data.custom_colors.accentColor || '#60a5fa',
          fontFamily: data.custom_colors.fontFamily || 'Inter'
        };
      } else if (!data.theme || typeof data.theme === 'string') {
        // Si theme n'existe pas ou est une string, créer un theme par défaut
        data.theme = {
          primaryColor: '#1e40af',
          secondaryColor: '#3b82f6',
          accentColor: '#60a5fa',
          fontFamily: 'Inter'
        };
      }

      // Transformer les noms de colonnes DB → Frontend
      // La table utilise: published, view_count, updated_at
      // Le frontend attend: published, views, last_updated
      data.published = data.published ?? false;
      data.views = data.view_count ?? 0;
      data.last_updated = data.updated_at || data.created_at;

      return data;
    } catch (error) {
      console.error('Erreur récupération mini-site:', error);
      return null;
    }
  }

  static async getExhibitorProducts(exhibitorId: string): Promise<Product[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      // Essayer d'abord avec exhibitor_id direct
      const { data: productsData, error: productsError } = await safeSupabase
        .from('products')
        .select('*')
        .eq('exhibitor_id', exhibitorId);

      if (productsError) throw productsError;
      
      // Si on trouve des produits, les retourner
      if (productsData && productsData.length > 0) {
        return productsData.map((p: ProductDB) => ({
          id: p.id,
          exhibitorId: p.exhibitor_id,
          name: p.name,
          description: p.description,
          category: p.category,
          images: p.images || [],
          specifications: p.specifications,
          price: p.price,
          featured: p.featured || false
        }));
      }

      // Sinon, chercher l'exhibitor_id à partir du user_id
      const { data: exhibitorData, error: exhibitorError } = await safeSupabase
        .from('exhibitors')
        .select('id')
        .eq('user_id', exhibitorId)
        .maybeSingle();

      if (exhibitorError || !exhibitorData) {
        return [];
      }

      // Récupérer les produits avec l'exhibitor_id trouvé
      const { data: productsByExhibitor, error: productsByExhibitorError } = await safeSupabase
        .from('products')
        .select('*')
        .eq('exhibitor_id', exhibitorData.id);

      if (productsByExhibitorError) throw productsByExhibitorError;
      if (productsByExhibitorError) throw productsByExhibitorError;
      
      return (productsByExhibitor || []).map((p: ProductDB) => ({
        id: p.id,
        exhibitorId: p.exhibitor_id,
        name: p.name,
        description: p.description,
        category: p.category,
        images: p.images || [],
        specifications: p.specifications,
        price: p.price,
        featured: p.featured || false
      }));
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      return [];
    }
  }

  static async getMiniSiteViewCount(exhibitorId: string): Promise<number> {
    if (!this.checkSupabaseConnection()) return 0;
    const safeSupabase = supabase!;
    try {
      const { count } = await safeSupabase
        .from('minisite_views')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', exhibitorId);
      return count || 0;
    } catch {
      return 0;
    }
  }

  static async incrementMiniSiteViews(exhibitorId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;

    const safeSupabase = supabase!;
    try {
      // Record in minisite_views table for historical tracking
      const { data: userData } = await safeSupabase.auth.getUser();
      await safeSupabase.from('minisite_views').insert({
        exhibitor_id: exhibitorId,
        viewer_id: userData?.user?.id || null,
        viewed_at: new Date().toISOString()
      }).select(); // Select to ensure it waited

      // ⚡ FIX N+1: Utiliser RPC pour incrémentation atomique (3 queries → 1 RPC)
      await safeSupabase.rpc('increment_minisite_views', {
        p_exhibitor_id: exhibitorId
      });
    } catch (error: any) {
      console.warn('Erreur incrementMiniSiteViews:', error.message);
    }
  }

  static async incrementPartnerViews(partnerId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;

    const safeSupabase = supabase!;
    try {
      // Atomically increment partner views if column exists
      // If not, we'll try to insert into a view tracking table later
      const { data, error } = await safeSupabase.rpc('increment_partner_views', {
        p_partner_id: partnerId
      });

      if (error) throw error;
    } catch (error) {
       console.warn('Erreur incrementPartnerViews:', error);
       // Fallback manual increment if RPC missing
       try {
         const { data: partner } = await safeSupabase
           .from('partners')
           .select('views')
           .eq('id', partnerId)
           .single();
         
         if (partner) {
           await safeSupabase
             .from('partners')
             .update({ views: (partner.views || 0) + 1 })
             .eq('id', partnerId);
         }
       } catch (err) {
         console.error('Fallback incrementPartnerViews failed:', err);
       }
    }
  }

  static async getPublishedMiniSites(): Promise<{ data: any[] | null; error: any }> {
    if (!this.checkSupabaseConnection()) return { data: null, error: 'Supabase non connecté' };

    const safeSupabase = supabase!;
    try {
      // Récupérer tous les mini-sites publiés avec les infos des exposants
      const { data: minisites, error: minisitesError } = await safeSupabase
        .from('mini_sites')
        .select('id, exhibitor_id, theme, view_count, published, updated_at, logo_url')
        .eq('published', true);

      if (minisitesError) throw minisitesError;

      if (!minisites || minisites.length === 0) {
        return { data: [], error: null };
      }

      // Récupérer les infos des exposants pour chaque mini-site
      const exhibitorIds = minisites.map(ms => ms.exhibitor_id);
      const { data: exhibitors, error: exhibitorsError } = await safeSupabase
        .from('exhibitors')
        .select('id, user_id, company_name, logo_url, description, category, sector')
        .or(exhibitorIds.map(id => `user_id.eq.${id},id.eq.${id}`).join(','));

      if (exhibitorsError) {
        console.warn('Erreur récupération exposants:', exhibitorsError);
      }

      // Combiner les données
      const result = minisites.map(ms => {
        const exhibitor = exhibitors?.find(
          e => e.user_id === ms.exhibitor_id || e.id === ms.exhibitor_id
        );

        return {
          id: ms.id,
          exhibitor_id: ms.exhibitor_id,
          company_name: exhibitor?.company_name || 'Exposant',
          description: exhibitor?.description,
          category: exhibitor?.category || 'Non spécifié',
          sector: exhibitor?.sector || 'Non spécifié',
          theme: ms.theme || 'modern',
          views: ms.view_count || 0,
          logo_url: ms.logo_url || exhibitor?.logo_url,
          last_updated: ms.updated_at
        };
      });

      return { data: result, error: null };
    } catch (error) {
      console.error('Erreur récupération mini-sites publiés:', error);
      return { data: null, error };
    }
  }

  static async getExhibitorForMiniSite(exhibitorId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // 1. Chercher d'abord dans la table exhibitors par ID
      const { data: exhibitorData, error: exhibitorError } = await safeSupabase
        .from('exhibitors')
        .select('id, company_name, logo_url, description, website, contact_info')
        .eq('id', exhibitorId)
        .maybeSingle();

      if (exhibitorData) {
        console.log('[MiniSite] Exposant trouvé dans exhibitors:', exhibitorData.company_name);
        return exhibitorData;
      }

      // 2. Fallback: chercher dans exhibitor_profiles par user_id (structure legacy)
      console.log('[MiniSite] Pas trouvé dans exhibitors, recherche dans exhibitor_profiles...');
      const { data: profileData, error: profileError } = await safeSupabase
        .from('exhibitor_profiles')
        .select('user_id, company_name, logo_url, description, website, phone, email')
        .eq('user_id', exhibitorId)
        .maybeSingle();

      if (profileData) {
        console.log('[MiniSite] Exposant trouvé dans exhibitor_profiles:', profileData.company_name);
        // Mapper les champs pour correspondre à la structure attendue
        return {
          id: profileData.user_id,
          company_name: profileData.company_name,
          logo_url: profileData.logo_url,
          description: profileData.description,
          website: profileData.website,
          contact_info: {
            phone: profileData.phone,
            email: profileData.email
          }
        };
      }

      // 3. Fallback: chercher dans users si c'est un exposant
      console.log('[MiniSite] Pas trouvé dans exhibitor_profiles, recherche dans users...');
      const { data: userData } = await safeSupabase
        .from('users')
        .select('id, name, email')
        .eq('id', exhibitorId)
        .eq('type', 'exhibitor')
        .maybeSingle();

      if (userData) {
        console.log('[MiniSite] Exposant basique trouvé dans users:', userData.name);
        return {
          id: userData.id,
          company_name: userData.name || 'Exposant',
          logo_url: null,
          description: null,
          website: null,
          contact_info: { email: userData.email }
        };
      }

      // 4. DERNIER FALLBACK: Vérifier via exhibitors.user_id au lieu de exhibitors.id
      console.log('[MiniSite] Pas trouvé via ID, recherche via user_id dans exhibitors...');
      const { data: exhibitorByUserId } = await safeSupabase
        .from('exhibitors')
        .select('id, user_id, company_name, logo_url, description, website, contact_info')
        .eq('user_id', exhibitorId)
        .maybeSingle();

      if (exhibitorByUserId) {
        console.log('[MiniSite] ✅ Exposant trouvé via user_id:', exhibitorByUserId.company_name);
        return exhibitorByUserId;
      }

      console.warn('[MiniSite] ❌ AUCUN exposant trouvé pour ID:', exhibitorId);
      return null;
    } catch (error) {
      console.error('Erreur récupération exposant pour mini-site:', error);
      return null;
    }
  }

  static async getExhibitorByUserId(userId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('exhibitors')
        .select('id, company_name, logo_url, description, website, contact_info, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erreur récupération exposant par user_id:', error);
      return null;
    }
  }

	  static async updateExhibitor(exhibitorId: string, data: Partial<Exhibitor>): Promise<void> {
	    if (!this.checkSupabaseConnection()) return;
	
	    const safeSupabase = supabase!;
	    try {
	      const updateData: Record<string, any> = {};
	      if (data.companyName !== undefined) updateData.company_name = data.companyName;
	      if (data.category !== undefined) updateData.category = data.category;
	      if (data.sector !== undefined) updateData.sector = data.sector;
	      if (data.description !== undefined) updateData.description = data.description;
	      if (data.verified !== undefined) updateData.verified = data.verified;
	      if (data.featured !== undefined) updateData.featured = data.featured;
	      if (data.website !== undefined) updateData.website = data.website;
	      if (data.logo !== undefined) updateData.logo_url = data.logo;
	      if (data.contactInfo !== undefined) updateData.contact_info = data.contactInfo;
	      if (data.standNumber !== undefined) updateData.stand_number = data.standNumber;
	      // Note: stand_area et is_published ne sont pas des colonnes existantes dans la table exhibitors
	      // if (data.standArea !== undefined) updateData.stand_area = data.standArea;
	      // if (data.isPublished !== undefined) updateData.is_published = data.isPublished;

	      // Ne pas envoyer une mise à jour vide
	      if (Object.keys(updateData).length === 0) {
	        return;
	      }

	      const { data: updatedData, error } = await safeSupabase
	        .from('exhibitors')
	        .update(updateData)
	        .eq('id', exhibitorId)
	        .select('id');
	        
	      if (error) throw error;
	      
	      // Vérifier si l'update a réellement modifié des lignes
	      if (!updatedData || updatedData.length === 0) {
	        throw new Error('Mise à jour échouée - vérifiez les permissions');
	      }
	    } catch (error) {
	      console.error('Erreur mise à jour exposant:', error);
	      throw error;
	    }
	  }
	
	  static async updateUserStatus(userId: string, status: User['status']): Promise<void> {
	    if (!this.checkSupabaseConnection()) return;

	    const safeSupabase = supabase!;
	    try {
	      // @ts-ignore - Supabase type inference issue with user status update
	      const { error } = await safeSupabase
	        .from('users')
	        .update({ status })
	        .eq('id', userId);

	      if (error) throw error;
	    } catch (error) {
	      console.error(`❌ Erreur mise à jour statut utilisateur ${userId}:`, error);
	      throw error;
	    }
	  }

	  static async validateExhibitorAtomic(
	    exhibitorId: string,
	    newStatus: 'approved' | 'rejected'
	  ): Promise<{
	    userId: string;
	    userEmail: string;
	    userName: string;
	    companyName: string;
	    success: boolean;
	  } | null> {
	    if (!this.checkSupabaseConnection()) return null;

	    const safeSupabase = supabase!;
	    try {
	      const { data, error } = await safeSupabase
	        .rpc('validate_exhibitor_atomic', {
	          p_exhibitor_id: exhibitorId,
	          p_new_status: newStatus
	        });

	      if (error) throw error;

	      const result = data?.[0];

	      if (!result?.success) {
	        throw new Error('Échec de la validation de l\'exposant');
	      }

	      return {
	        userId: result.user_id,
	        userEmail: result.user_email,
	        userName: result.user_name,
	        companyName: result.company_name,
	        success: result.success
	      };
	    } catch (error) {
	      console.error(`❌ Erreur validation exposant ${exhibitorId}:`, error);
	      throw error;
	    }
	  }

	  static async validatePartnerAtomic(
	    partnerId: string,
	    newStatus: 'approved' | 'rejected'
	  ): Promise<{
	    userId: string;
	    userEmail: string;
	    userName: string;
	    partnerName: string;
	    success: boolean;
	  } | null> {
	    if (!this.checkSupabaseConnection()) return null;

	    const safeSupabase = supabase!;
	    try {
	      const { data, error } = await safeSupabase
	        .rpc('validate_partner_atomic', {
	          p_partner_id: partnerId,
	          p_new_status: newStatus
	        });

	      if (error) throw error;

	      const result = data?.[0];

	      if (!result?.success) {
	        throw new Error('Échec de la validation du partenaire');
	      }

	      return {
	        userId: result.user_id,
	        userEmail: result.user_email,
	        userName: result.user_name,
	        partnerName: result.partner_name,
	        success: result.success
	      };
	    } catch (error) {
	      console.error(`❌ Erreur validation partenaire ${partnerId}:`, error);
	      throw error;
	    }
	  }

	  static async createExhibitorProfile(userId: string, userData: Record<string, unknown>): Promise<void> {
    if (!this.checkSupabaseConnection()) return;

    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
        .from('exhibitors')
        .insert([{
          id: userId, // Utilise l'ID utilisateur comme ID exposant
          user_id: userId,
          company_name: userData.profile.company,
          category: userData.profile.category || 'institutional',
          sector: userData.profile.sector || 'logistics',
          description: userData.profile.description || '',
          contact_info: {
            email: userData.email,
            phone: userData.profile.phone || ''
          }
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erreur création profil exposant:', error);
      throw error;
    }
  }

  static async createPartnerProfile(userId: string, userData: Record<string, unknown>): Promise<void> {
    if (!this.checkSupabaseConnection()) return;

    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
        .from('partners')
        .insert([{
          id: userId, // Utilise l'ID utilisateur comme ID partenaire
          user_id: userId,
          company_name: userData.profile.company,
          partner_type: userData.profile.partnerType || 'institutional',
          sector: userData.profile.sector || 'services',
          description: userData.profile.description || '',
          website: userData.profile.website || ''
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erreur création profil partenaire:', error);
	      throw error;
	    }
	  }
	
	  static async sendValidationEmail(userData: {
	    email: string;
	    firstName: string;
	    lastName: string;
	    companyName: string;
	    status: 'approved' | 'rejected';
	  }): Promise<void> {
	    if (!this.checkSupabaseConnection()) return;
	
	    const safeSupabase = supabase!;
	
	    try {
	      const { data, error } = await safeSupabase.functions.invoke('send-validation-email', {
	        body: userData
	      });
	
	      if (error) throw error;
	    } catch (error) {
	      console.error(`❌ Erreur lors de l\`envoi de l\`email de validation:`, error);
	      throw error;
	    }
	  }
	
	  static async sendRegistrationEmail(userData: Record<string, unknown>): Promise<void> {
    if (!this.checkSupabaseConnection()) return;

    const safeSupabase = supabase!;

    try {
      const { data, error } = await safeSupabase.functions.invoke('send-registration-email', {
        body: userData
      });

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  // ===== CONTACT FUNCTIONS =====

  /**
   * Créer un message de contact
   */
  static async sendContactEmail(contactData: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    subject: string;
    message: string;
  }): Promise<void> {
    try {
      console.log('📧 Sending contact email via Backend API...');
      // Use relative URL so it works in both dev and production
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('❌ Failed to send contact email:', err);
        // We log but don't crash, as the message is saved in DB
      } else {
        console.log('✅ Contact email sent successfully');
      }
    } catch (error) {
      console.error('❌ Email send failed:', error);
    }
  }

  static async createContactMessage(messageData: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    subject: string;
    message: string;
  }): Promise<{ id: string }> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Connexion Supabase non disponible');
    }

    const safeSupabase = supabase!;

    try {
      const { data, error } = await safeSupabase
        .from('contact_messages')
        .insert([
          {
            first_name: messageData.firstName,
            last_name: messageData.lastName,
            email: messageData.email,
            company: messageData.company || null,
            subject: messageData.subject,
            message: messageData.message,
            status: 'new'
          }
        ])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erreur création message contact:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la création du message:', error);
      throw error;
    }
  }

  // ===== NETWORKING FUNCTIONS =====

  /**
   * Recherche avancée d'utilisateurs avec filtres
   */
  static async searchUsers(filters: {
    searchTerm?: string;
    sector?: string;
    userType?: string;
    location?: string;
    limit?: number;
  }): Promise<User[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      // Optimized: Select only necessary columns instead of *
      let query = safeSupabase.from('users').select('id, email, name, type, profile, status, created_at');

      // Par défaut, afficher uniquement les exposants et partenaires (B2B)
      // Pas les visiteurs ni les admins
      const hasSearchTerm = filters.searchTerm && filters.searchTerm.trim();
      const hasSector = filters.sector && filters.sector.trim();
      const hasLocation = filters.location && filters.location.trim();
      
      // Exclure visiteurs et admins si aucun type spécifié
      if (!filters.userType && !hasSector) {
        // Par défaut, seuls les exposants et partenaires (entreprises B2B)
        query = query.in('type', ['exhibitor', 'partner']);
      }

      // Filtre par terme de recherche (nom, entreprise, poste)
      if (hasSearchTerm) {
        const term = `%${filters.searchTerm!.trim().toLowerCase()}%`;
        // Utiliser un filtre OR plus simple et lisible
        query = query.or(
          `profile->>firstName.ilike.${term},` +
          `profile->>lastName.ilike.${term},` +
          `profile->>company.ilike.${term},` +
          `profile->>companyName.ilike.${term},` +
          `profile->>position.ilike.${term},` +
          `name.ilike.${term},` +
          `email.ilike.${term}`
        );
      }

      // Filtre par secteur
      if (hasSector) {
        query = query.eq('profile->>sector', filters.sector);
      }

      // Filtre par type d'utilisateur
      if (filters.userType) {
        query = query.eq('type', filters.userType);
      }

      // Filtre par localisation (pays)
      if (hasLocation) {
        query = query.eq('profile->>country', filters.location);
      }

      // Exclure les utilisateurs sans profil valide
      query = query.not('profile', 'is', null);

      // Limite (par défaut 50 si pas de filtre, 100 avec filtres)
      const defaultLimit = filters.limit || 100;
      query = query.limit(defaultLimit);

      const { data, error } = await query;

      if (error) throw error;

      // Filtrer les résultats côté client pour s'assurer d'avoir des données valides
      const transformedUsers = (data || []).map(this.transformUserDBToUser);
      
      const users = transformedUsers.filter(u => u && (u.profile?.firstName || u.profile?.company || u.profile?.companyName || u.name));

      return users;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return [];
    }
  }

  /**
   * Récupère les recommandations de networking pour un utilisateur
   */
  static async getRecommendations(userId: string, limit: number = 10): Promise<User[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('recommendations')
        .select('recommended_user:recommended_user_id(*)')
        .eq('user_id', userId)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((rec: Record<string, unknown>) => this.transformUserDBToUser(rec.recommended_user));
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      return [];
    }
  }

  /**
   * Envoie une demande de connexion
   */
	  static async createNotification(userId: string, message: string, type: 'connection' | 'event' | 'message' | 'system'): Promise<void> {
	    if (!this.checkSupabaseConnection()) return;

	    const safeSupabase = supabase!;
	    try {
	      // Utiliser la nouvelle structure de notifications avec title et category
	      await safeSupabase.from('notifications').insert([{
	        user_id: userId,
	        title: type === 'connection' ? 'Nouvelle connexion' :
	               type === 'event' ? 'Événement' :
	               type === 'message' ? 'Nouveau message' : 'Notification',
	        message: message,
	        type: type === 'connection' ? 'info' : 
	              type === 'event' ? 'info' : 
	              type === 'message' ? 'info' : 'info',
	        category: type,
	        is_read: false
	      }]);
	    } catch (error) {
	      console.error('❌ Erreur création notification:', error);
	    }
	  }
	
	  static async sendConnectionRequest(fromUserId: string, toUserId: string): Promise<boolean> {
	    if (!this.checkSupabaseConnection()) return false;
	
	    const safeSupabase = supabase!;
	    try {
	      const { error } = await safeSupabase.from('connections').insert([{
	        requester_id: fromUserId,
	        addressee_id: toUserId,
	        status: 'pending'
	      }]);
	
	      if (error) throw error;
	
	      // Envoyer une notification au destinataire
	      this.createNotification(toUserId, 'Vous avez reçu une demande de connexion.', 'connection');
	
	      return true;
	    } catch (error) {
	      console.error('Erreur lors de l\'envoi de la demande de connexion:', error);
	      return false;
	    }
	  }
	
	  /**
	   * Accepte une demande de connexion
	   */
	  static async acceptConnectionRequest(connectionId: string): Promise<boolean> {
	    if (!this.checkSupabaseConnection()) return false;
	
	    const safeSupabase = supabase!;
	    try {
	      const { data, error } = await safeSupabase
	        .from('connections')
	        .update({ status: 'accepted' })
	        .eq('id', connectionId)
	        .select('requester_id, addressee_id')
	        .single();
	
	      if (error) throw error;
	
	      // Envoyer une notification à l'expéditeur
	      const requesterId = data.requester_id;
	      this.createNotification(requesterId, 'Votre demande de connexion a été acceptée !', 'connection');
	
	      return true;
	    } catch (error) {
	      console.error('Erreur lors de l\'acceptation de la demande:', error);
	      return false;
	    }
	  }

	  /**
	   * Refuse une demande de connexion
	   */
	  static async rejectConnectionRequest(connectionId: string): Promise<boolean> {
	    if (!this.checkSupabaseConnection()) return false;
	
	    const safeSupabase = supabase!;
	    try {
	      const { error } = await safeSupabase
	        .from('connections')
	        .delete()
	        .eq('id', connectionId);
	
	      if (error) throw error;
	
	      return true;
	    } catch (error) {
	      console.error('Erreur lors du refus de la demande:', error);
	      return false;
	    }
	  }

  /**
   * Récupère les connexions d'un utilisateur
   */
  static async getConnections(userId: string): Promise<User[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      // On récupère les IDs des utilisateurs connectés
      const { data: connections, error } = await safeSupabase
        .from('connections')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (error) throw error;

      const connectedUserIds = (connections || []).map((conn: Record<string, unknown>) => 
        conn.requester_id === userId ? conn.addressee_id : conn.requester_id
      );

      if (connectedUserIds.length === 0) return [];

      // On récupère les profils de ces utilisateurs
      const { data: users, error: usersError } = await safeSupabase
        .from('users')
        .select('*')
        .in('id', connectedUserIds);

      if (usersError) throw usersError;

      return (users || []).map(this.transformUserDBToUser);
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
      return [];
    }
  }

  // ==================== TIME SLOTS ====================
  static async getTimeSlotsByExhibitor(exhibitorIdOrUserId: string): Promise<TimeSlot[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    // Validate UUID format (must be 36 chars with hyphens)
    if (!exhibitorIdOrUserId || !exhibitorIdOrUserId.includes('-') || exhibitorIdOrUserId.length !== 36) {
      console.warn('[TIME_SLOTS] Invalid ID format:', exhibitorIdOrUserId);
      return [];
    }

    if (!exhibitorIdOrUserId) {
      console.warn('[TIME_SLOTS] ID is empty');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      // D'abord, essayer de récupérer directement avec exhibitor_id
      let { data, error } = await safeSupabase
        .from('time_slots')
        .select('*')
        .eq('exhibitor_id', exhibitorIdOrUserId)
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      // Si pas de résultats, vérifier si c'est un user_id et essayer de résoudre l'exhibitor_id
      if (!error && (!data || data.length === 0)) {
        // IMPORTANT: Use maybeSingle() here to avoid 406 Not Acceptable errors (PGRST116)
        // when valid UUID is passed but no exhibitor matches.
        const { data: exhibitor } = await safeSupabase
          .from('exhibitors')
          .select('id')
          .eq('user_id', exhibitorIdOrUserId)
          .maybeSingle();

        if (exhibitor) {
          const result = await safeSupabase
            .from('time_slots')
            .select('*')
            .eq('exhibitor_id', exhibitor.id)
            .order('slot_date', { ascending: true })
            .order('start_time', { ascending: true });
          
          data = result.data;
          error = result.error;
        }
      }

      if (error) {
        console.error('[TIME_SLOTS] Error fetching slots:', error.message);
        throw error;
      }

      // Helper pour parser une date sans décalage UTC
      const parseLocalDate = (dateStr: string | Date): string => {
        if (!dateStr) return '';
        // Garder juste la partie YYYY-MM-DD pour éviter le décalage UTC
        return String(dateStr).split('T')[0];
      };

      // Helper pour parser une date string en Date locale
      const parseLocalDateToDate = (dateStr: string | Date): Date => {
        if (dateStr instanceof Date) return dateStr;
        const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day);
      };

      // Transform DB rows to TimeSlot interface (snake_case → camelCase)
      interface TimeSlotRow {
        id: string;
        exhibitor_id?: string;
        user_id?: string;
        slot_date?: string;
        date?: string;
        start_time?: string;
        startTime?: string;
        end_time?: string;
        endTime?: string;
        duration?: number;
        type?: string;
        max_bookings?: number;
        maxBookings?: number;
        current_bookings?: number;
        currentBookings?: number;
        available?: boolean;
        location?: string;
      }

      const transformed = (data || []).map((row: TimeSlotRow) => ({
        id: row.id,
        exhibitorId: row.exhibitor_id || row.user_id, // Important: bookAppointment expects exhibitorId
        userId: row.exhibitor_id || row.user_id, // Keep for backward compat
        date: parseLocalDateToDate(row.slot_date || row.date),
        startTime: row.start_time || row.startTime,
        endTime: row.end_time || row.endTime,
        duration: row.duration || 0,
        type: row.type || 'in-person',
        maxBookings: row.max_bookings || row.maxBookings || 1,
        currentBookings: row.current_bookings || row.currentBookings || 0,
        available: row.available !== undefined ? row.available : true,
        location: row.location || undefined
      }));

      return transformed;
    } catch (error) {
      const errorInfo = error as Record<string, unknown>;
      console.error('[TIME_SLOTS] Error fetching time slots:', {
        exhibitorId,
        message: (errorInfo.message as string) || String(error),
        details: ((errorInfo.details as string) || (errorInfo.hint as string)) || null,
        status: (errorInfo.status as string) || 'unknown'
      });
      return [];
    }
  }

  // Compat: some components call getTimeSlotsByUser
  static async getTimeSlotsByUser(userId: string): Promise<TimeSlot[]> {
    return this.getTimeSlotsByExhibitor(userId);
  }


  static async createTimeSlotsBulk(slotsData: Omit<TimeSlot, 'id' | 'currentBookings' | 'available'>[]): Promise<TimeSlot[]> {
     if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');
    const safeSupabase = supabase!;

    if (slotsData.length === 0) return [];

    try {
        console.log(`[BULK_CREATE] Processing ${slotsData.length} slots...`);

        // Résoudre l'exhibitor_id (on suppose que tous les slots sont pour le même user)
        let resolvedExhibitorId: string | null = null;
        let userId = (slotsData[0] as any).userId;

        if (userId) {
             const { data: exhibitor } = await safeSupabase
                .from('exhibitors')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();
            
            if (exhibitor) {
                resolvedExhibitorId = exhibitor.id;
            } else {
                 console.warn('[BULK_CREATE] Exhibitor not found for user, creating one...');
                  // Fallback creation logic similar to createTimeSlot
                 const { data: user } = await safeSupabase.from('users').select('name').eq('id', userId).single();
                  const { data: newExhibitor } = await safeSupabase
                    .from('exhibitors')
                    .insert({ user_id: userId, company_name: user?.name || 'Exposant', category: 'institutional', sector: 'General', description: 'Auto-created' })
                    .select('id')
                    .single();
                  if (newExhibitor) resolvedExhibitorId = newExhibitor.id;
            }
        }

        if (!resolvedExhibitorId) throw new Error('Failed to resolve exhibitor ID');

        // Préparer les données DB
        const dbSlots = slotsData.map(slot => ({
            exhibitor_id: resolvedExhibitorId,
            slot_date: (slot as any).date,
            start_time: slot.startTime,
            end_time: slot.endTime,
            duration: slot.duration,
            type: slot.type,
            max_bookings: slot.maxBookings,
            available: true,
            location: slot.location
        }));

        // Batch insert
        const { data, error } = await safeSupabase
            .from('time_slots')
            .insert(dbSlots)
            .select();

        if (error) throw error;
        
        console.log(`[BULK_CREATE] Successfully created ${data?.length} slots`);
        
        return data.map((dbSlot: any) => ({
            id: dbSlot.id,
            exhibitorId: dbSlot.exhibitor_id,
            date: dbSlot.slot_date,
            startTime: dbSlot.start_time,
            endTime: dbSlot.end_time,
            duration: dbSlot.duration,
            type: dbSlot.type,
            maxBookings: dbSlot.max_bookings,
            currentBookings: dbSlot.current_bookings,
            available: dbSlot.available,
            location: dbSlot.location
        }));

    } catch (error) {
        console.error('❌ Erreur createTimeSlotsBulk:', error);
        throw error;
    }
  }

  static async createTimeSlot(slotData: Omit<TimeSlot, 'id' | 'currentBookings' | 'available'>): Promise<TimeSlot> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');
    const safeSupabase = supabase!;
    try {
      // Validation: la date ne doit pas être dans le passé
      const slotDate = (slotData as unknown as Record<string, unknown>).date || (slotData as unknown as Record<string, unknown>).slot_date;
      if (slotDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [year, month, day] = String(slotDate).split('T')[0].split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        if (parsedDate < today) {
          throw new Error('Impossible de créer un créneau pour une date passée');
        }
      }

      // Résoudre l'exhibitor_id depuis le userId si nécessaire
      let exhibitorId = (slotData as unknown as Record<string, unknown>).exhibitorId || null;
      
      if (!exhibitorId) {
        const userId = (slotData as unknown as Record<string, unknown>).userId;
        if (userId) {
          // Récupérer l'exhibitor_id correspondant au user_id
          const { data: exhibitor, error: exhError } = await safeSupabase
            .from('exhibitors')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (exhError || !exhibitor) {
            console.warn('⚠️ [CREATE_SLOT] Exhibitor introuvable pour userId:', userId, 'création automatique...');
            
            // Créer automatiquement l'exhibitor si il n'existe pas
            const { data: user } = await safeSupabase
              .from('users')
              .select('id, email, name, profile')
              .eq('id', userId)
              .single();
            
            if (!user) {
              throw new Error(`Utilisateur ${userId} introuvable`);
            }
            
            const companyName = user.profile?.company || user.profile?.companyName || user.name || 'Exposant';
            const userName = user.profile?.firstName && user.profile?.lastName 
              ? `${user.profile.firstName} ${user.profile.lastName}` 
              : user.name || 'Contact';
            
            const { data: newExhibitor, error: createError } = await safeSupabase
              .from('exhibitors')
              .insert({
                user_id: userId,
                company_name: companyName,
                sector: user.profile?.sector || 'Bâtiment Services',
                description: 'Profil créé automatiquement',
                contact_info: { email: user.email, name: userName },
                category: 'bâtiment-industry',
                verified: false,
                featured: false
              })
              .select('id')
              .single();
            
            if (createError || !newExhibitor) {
              console.error('❌ [CREATE_SLOT] Erreur création auto exhibitor:', createError);
              throw new Error(`Impossible de créer le profil exposant pour ${userId}`);
            }
            
            exhibitorId = newExhibitor.id;
            console.log('✅ [CREATE_SLOT] Exhibitor créé automatiquement:', { userId, exhibitorId });
          } else {
            exhibitorId = exhibitor.id;
            console.log('✅ [CREATE_SLOT] Exhibitor résolu:', { userId, exhibitorId });
          }
        }
      }

      if (!exhibitorId) {
        throw new Error('exhibitor_id ou userId requis pour créer un créneau');
      }

      // Map frontend slotData to DB column names to handle schema differences
      const slotDataRecord = slotData as unknown as Record<string, unknown>;
      const insertPayload: Record<string, unknown> = {
        exhibitor_id: exhibitorId,
        slot_date: slotDataRecord.date || slotDataRecord.slot_date || null,
        start_time: slotDataRecord.startTime || slotDataRecord.start_time || null,
        end_time: slotDataRecord.endTime || slotDataRecord.end_time || null,
        duration: slotDataRecord.duration || null,
        type: slotDataRecord.type || 'in-person',
        max_bookings: (slotDataRecord.maxBookings as number) ?? (slotDataRecord.max_bookings as number) ?? 1,
        current_bookings: (slotDataRecord.currentBookings as number) ?? (slotDataRecord.current_bookings as number) ?? 0,
        available: ((slotDataRecord.currentBookings as number) ?? 0) < ((slotDataRecord.maxBookings as number) ?? 1),
        location: slotDataRecord.location || null
      };

      // LOG DÉTAILLÉ POUR DEBUG
      console.log('🔍 [CREATE_SLOT] Payload à insérer:', JSON.stringify(insertPayload, null, 2));

      // Check for existing slot to avoid 409 Conflict
      const { data: existingSlot } = await safeSupabase
        .from('time_slots')
        .select('*')
        .eq('exhibitor_id', insertPayload.exhibitor_id)
        .eq('slot_date', insertPayload.slot_date)
        .eq('start_time', insertPayload.start_time)
        .maybeSingle();

      let data, error;

      if (existingSlot) {
        console.log('⚠️ [CREATE_SLOT] Le créneau existe déjà, retour du créneau existant.');
        data = existingSlot;
        error = null;
      } else {
        const result = await safeSupabase
          .from('time_slots')
          .insert([insertPayload])
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        const errorInfo = error as unknown as Record<string, unknown>;
        console.error('❌ [CREATE_SLOT] Erreur Supabase:', {
          code: errorInfo.code,
          message: errorInfo.message,
          details: errorInfo.details,
          hint: errorInfo.hint,
          payload: insertPayload
        });
        throw error;
      }

      console.log('✅ [CREATE_SLOT] Créneau créé avec succès:', data);

      // Helper pour parser une date sans décalage UTC
      const parseLocalDateString = (dateStr: string | Date): Date => {
        if (dateStr instanceof Date) return dateStr;
        // Format YYYY-MM-DD -> créer une date à minuit heure locale
        const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day);
      };

      // Transform returned DB row into TimeSlot interface expected by frontend
      const created = data as unknown as Record<string, unknown>;
      const transformed: TimeSlot = {
        id: created.id,
        userId: created.exhibitor_id || created.user_id,
        date: created.slot_date ? parseLocalDateString(created.slot_date) : (created.date ? parseLocalDateString(created.date) : new Date()),
        startTime: created.start_time || created.startTime,
        endTime: created.end_time || created.endTime,
        duration: created.duration || 0,
        type: created.type || 'in-person',
        maxBookings: created.max_bookings || created.maxBookings || 1,
        currentBookings: created.current_bookings || created.currentBookings || 0,
        available: created.available ?? ((created.current_bookings || 0) < (created.max_bookings || 1)),
        location: created.location
      };

      console.log('✅ [CREATE_SLOT] Transformation réussie:', transformed);
      return transformed;
    } catch (error) {
      try {
        console.error('Erreur lors de la création du créneau horaire:', {
          message: (error as any)?.message || String(error),
          details: (error as any)?.details || (error as any)?.hint || null,
          raw: JSON.stringify(error)
        });
      } catch (e) {
        console.error('Erreur lors de la création du créneau horaire (raw):', error);
      }
      throw error;
    }
  }

  static async updateTimeSlot(slotId: string, updateData: Partial<TimeSlot>): Promise<TimeSlot> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');
    const safeSupabase = supabase!;
    
    const updates: Record<string, any> = {};
    if (updateData.date) {
        const d = new Date(updateData.date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        updates.slot_date = `${year}-${month}-${day}`;
    }
    if (updateData.startTime) updates.start_time = updateData.startTime;
    if (updateData.endTime) updates.end_time = updateData.endTime;
    if (updateData.maxBookings !== undefined) updates.max_bookings = updateData.maxBookings;
    if (updateData.type) updates.type = updateData.type;
    if (updateData.location !== undefined) updates.location = updateData.location;
    
    const { data, error } = await safeSupabase
      .from('time_slots')
      .update(updates)
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    
    const parseLocalDateString = (dateStr: string | Date): Date => {
        if (dateStr instanceof Date) return dateStr;
        const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    return {
       id: data.id,
       userId: data.exhibitor_id,
       date: parseLocalDateString(data.slot_date),
       startTime: data.start_time,
       endTime: data.end_time,
       duration: data.duration,
       type: data.type,
       maxBookings: data.max_bookings,
       currentBookings: data.current_bookings,
       available: data.current_bookings < data.max_bookings,
       location: data.location
    } as TimeSlot;
  }

  static async deleteTimeSlot(slotId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
        .from('time_slots')
        .delete()
        .eq('id', slotId);
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du créneau horaire:', error);
    }
  }




  // ==================== APPOINTMENTS ====================
  static async getAppointments(): Promise<Appointment[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;
    try {
      // 1. Fetch appointments raw
      const { data: appointmentsRaw, error } = await safeSupabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
         console.warn("Error fetching appointments raw:", error.message);
         throw error;
      }
      
      if (!appointmentsRaw || appointmentsRaw.length === 0) return [];

      const visitorIds = [...new Set(appointmentsRaw.map(a => a.visitor_id))];
      const exhibitorIds = [...new Set(appointmentsRaw.map(a => a.exhibitor_id))];

      // 2. Fetch related data in parallel
      // Also query exhibitors table to resolve exhibitor_id → user_id
      // (appointments.exhibitor_id can be either users.id or exhibitors.id depending on the booking path)
      const [visitorsResponse, profilesResponse, exhibitorsResponse] = await Promise.all([
         safeSupabase.from('users').select('id, name, email').in('id', visitorIds),
         safeSupabase.from('exhibitor_profiles').select('id, user_id, company_name, logo_url').in('user_id', exhibitorIds),
         safeSupabase.from('exhibitors').select('id, user_id, company_name, logo_url').in('id', exhibitorIds)
      ]);

      const visitorsMap = new Map(visitorsResponse.data?.map(v => [v.id, v]) || []);
      const profilesMap = new Map(profilesResponse.data?.map(p => [p.user_id, p]) || []);
      // Map: exhibitors.id → user_id  (for resolving exhibitor_id that is exhibitors.id)
      const exhibitorsByIdMap = new Map(exhibitorsResponse.data?.map(e => [e.id, e]) || []);

      // 3. Merge data
      return appointmentsRaw.map(apt => {
          const visitor = visitorsMap.get(apt.visitor_id);
          const profile = profilesMap.get(apt.exhibitor_id);
          // Resolve the real user_id: if exhibitor_id is an exhibitors.id, look it up
          const exhibitorRow = exhibitorsByIdMap.get(apt.exhibitor_id);
          const resolvedExhibitorUserId = exhibitorRow ? exhibitorRow.user_id : apt.exhibitor_id;

          return {
            ...apt,
            visitor: visitor ? { 
                id: visitor.id, 
                name: visitor.name, 
                email: visitor.email 
            } : undefined,
            exhibitor: (profile || exhibitorRow) ? {
                id: resolvedExhibitorUserId,
                companyName: (profile || exhibitorRow)?.company_name || 'Exposant',
                logo: (profile || exhibitorRow)?.logo_url,
            } : {
                id: apt.exhibitor_id,
                companyName: 'Exposant',
            },
            exhibitorUserId: resolvedExhibitorUserId
          };
      });

    } catch (error) {
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
      }
      return [];
    }
  }

  static async updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
        .from('appointments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;
    } catch (error) {
      console.error(`❌ Erreur mise à jour statut rendez-vous ${appointmentId}:`, error);
      throw error;
    }
  }

  static async createAppointment(appointmentData: {
    exhibitorId?: string;
    visitorId: string;
    timeSlotId: string;
    message?: string;
    meetingType?: string;
  }): Promise<any> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // Vérifier le niveau du visiteur - les visiteurs "free" ne peuvent pas prendre de rendez-vous
      const { data: visitorData, error: visitorError } = await safeSupabase
        .from('users')
        .select('visitor_level')
        .eq('id', appointmentData.visitorId)
        .single();

      if (visitorError) throw visitorError;

      if (visitorData?.visitor_level === 'free') {
        throw new Error('Les visiteurs de niveau Free n\'ont pas accès aux rendez-vous. Veuillez passer au niveau Premium ou VIP pour réserver des rendez-vous.');
      }

      // Utiliser la fonction atomique pour éviter les race conditions
      const { data, error } = await safeSupabase
        .rpc('book_appointment_atomic', {
          p_time_slot_id: appointmentData.timeSlotId,
          p_visitor_id: appointmentData.visitorId,
          p_exhibitor_id: appointmentData.exhibitorId,
          p_message: appointmentData.message || null,
          p_meeting_type: appointmentData.meetingType || 'in-person'
        });

      if (error) throw error;

      // La fonction RPC retourne un tableau avec un seul élément
      const result = data?.[0];

      if (!result?.success) {
        throw new Error(result?.error_message || 'Erreur lors de la création du rendez-vous');
      }

      // Récupérer le rendez-vous créé
      const { data: appointment, error: fetchError } = await safeSupabase
        .from('appointments')
        .select(`
          *,
          exhibitor:exhibitors!exhibitor_id(id, company_name, logo_url),
          visitor:users!visitor_id(id, name, email)
        `)
        .eq('id', result.appointment_id)
        .single();

      if (fetchError) throw fetchError;

      return appointment;
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      throw error;
    }
  }

  // ==================== MAPPING HELPERS ====================
  private static mapUserFromDB(data: UserDB): User {
    return this.transformUserDBToUser(data);
  }

  private static mapExhibitorFromDB(data: ExhibitorDB): Exhibitor {
    return this.transformExhibitorDBToExhibitor(data);
  }

  private static mapProductFromDB(data: ProductDB): Product {
    return {
      id: data.id,
      exhibitorId: data.exhibitor_id,
      name: data.name,
      description: data.description,
      category: data.category,
      images: data.images || [],
      specifications: data.specifications,
      price: data.price,
      featured: data.featured || false
    };
  }

  // ==================== USERS ====================

  /**
   * Get users with optional filtering and pagination
   * OPTIMIZATION: Prevents over-fetching by adding filters and limits
   */
  static async getUsers(options?: {
    sector?: string;
    type?: User['type'];
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<User[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      // OPTIMIZATION: Select only needed fields instead of '*'
      let query = safeSupabase
        .from('users')
        .select('id, email, name, type, profile, status, created_at, visitor_level, partner_tier')
        .order('created_at', { ascending: false });

      // Apply filters
      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.sector) {
        // Filter by sector if user profile contains it
        query = query.contains('profile->sectors', [options.sector]);
      }

      // Apply pagination
      const limit = options?.limit || 50; // Default 50 items
      const offset = options?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        console.warn('Erreur lors de la récupération des utilisateurs:', error.message);
        return [];
      }

      return (data || []).map(this.transformUserDBToUser);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('users')
      .insert([{
        email: userData.email,
        name: userData.name,
        type: userData.type || 'visitor',
        status: userData.status || 'pending',
        profile: userData.profile || {}
      }])
      .select()
      .single();
    if (error) throw error;
    return this.mapUserFromDB(data);
  }

  // ==================== EXHIBITORS ====================

  static async createExhibitor(exhibitorData: Partial<Exhibitor>): Promise<Exhibitor> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('exhibitors')
      .insert([{
        user_id: exhibitorData.userId,
        company_name: exhibitorData.companyName,
        category: exhibitorData.category,
        sector: exhibitorData.sector,
        description: exhibitorData.description,
        logo_url: exhibitorData.logo,
        website: exhibitorData.website,
        contact_info: exhibitorData.contactInfo || {},
        verified: exhibitorData.verified || false,
        featured: exhibitorData.featured || false,
        stand_number: exhibitorData.standNumber,
        stand_area: exhibitorData.standArea
      }])
      .select(`*, user:users!exhibitors_user_id_fkey(*), products:products!fk_products_exhibitor(*), mini_site:mini_sites!mini_sites_exhibitor_id_fkey(*)`)
      .single();

    if (error) throw error;
    return this.mapExhibitorFromDB(data);
  }

  // ==================== PARTNERS ====================

  static async createPartner(partnerData: Partial<Partner>): Promise<Partner> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    
    // Prepare data matching the actual database schema
    const dbData = {
      company_name: partnerData.organizationName || partnerData.name, // Reverted to company_name
      // name: partnerData.organizationName || partnerData.name,
      partner_type: partnerData.partnerType || partnerData.type || 'silver', // Changed to partner_type
      // type: partnerData.partnerType || partnerData.type || 'silver',
      // category: partnerData.sector || 'General', // Commented out to debug schema cache error
      sector: partnerData.sector,
      description: partnerData.description || '',
      website: partnerData.website,
      logo_url: partnerData.logo,
      // country: partnerData.country || 'Maroc', // Commented out to debug schema cache error
      verified: partnerData.verified || false,
      featured: partnerData.featured || false,
      partnership_level: partnerData.sponsorshipLevel || 'Silver', // Changed to partnership_level
      // sponsorship_level: partnerData.sponsorshipLevel || 'Silver',
      // contributions: partnerData.contributions || [], // Commented out to debug schema cache error
      // Note: user_id, contract_value, contact_info are not in the current schema
      // and are omitted to prevent insert errors
    };

    const { data, error } = await (safeSupabase as any)
      .from('partners')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Supabase createPartner error:', error);
      throw new Error(error.message || JSON.stringify(error));
    }

    // Mapper les données de la DB au format Partner
    return {
      id: data.id,
      userId: data.user_id,
      organizationName: data.company_name,
      name: data.company_name,
      partnerType: data.partner_type,
      type: data.partner_type,
      sector: data.sector,
      description: data.description,
      website: data.website,
      sponsorshipLevel: data.partnership_level,
      contributions: data.benefits || [],
      logo: data.logo_url,
      verified: data.verified || false,
      featured: data.featured || false,
      // Contact info is lost in DB but we return what we can
      contactName: partnerData.contactName,
      contactEmail: partnerData.contactEmail,
      contactPhone: partnerData.contactPhone,
      contactPosition: partnerData.contactPosition
    } as Partner;
  }

  static async updatePartner(partnerId: string, partnerData: Partial<Partner>): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }

    const safeSupabase = supabase!;

    // Champs non-sensibles (pas de trigger)
    const dbData: any = {};
    if (partnerData.organizationName) dbData.company_name = partnerData.organizationName;
    if (partnerData.sector) dbData.sector = partnerData.sector;
    if (partnerData.description) dbData.description = partnerData.description;
    if (partnerData.website) dbData.website = partnerData.website;
    if (partnerData.logo) dbData.logo_url = partnerData.logo;
    if (partnerData.verified !== undefined) dbData.verified = partnerData.verified;
    if (partnerData.featured !== undefined) dbData.featured = partnerData.featured;
    if (partnerData.isPublished !== undefined) dbData.is_published = partnerData.isPublished;
    if (partnerData.country) dbData.country = partnerData.country;

    const { error } = await (safeSupabase as any)
      .from('partners')
      .update(dbData)
      .eq('id', partnerId);

    if (error) {
      console.error('Supabase updatePartner error:', error);
      throw new Error(error.message || JSON.stringify(error));
    }

    // Champs protégés par trigger (partner_type, sponsorship_level, partner_tier)
    // → mise à jour séparée via RPC admin si disponible, sinon update direct
    const tierData: any = {};
    if (partnerData.partnerType) {
      tierData.partner_type = partnerData.partnerType;
      tierData.partner_tier = partnerData.partnerType;
    }
    if (partnerData.sponsorshipLevel) tierData.sponsorship_level = partnerData.sponsorshipLevel;

    if (Object.keys(tierData).length > 0) {
      // Tenter via RPC admin (contourne le trigger) — si la fonction n'existe pas, ignorer silencieusement
      const { error: rpcError } = await (safeSupabase as any).rpc('admin_update_partner_tier', {
        p_partner_id: partnerId,
        p_partner_type: tierData.partner_type ?? null,
        p_partner_tier: tierData.partner_tier ?? null,
        p_sponsorship_level: tierData.sponsorship_level ?? null,
      });

      if (rpcError && !rpcError.message?.includes('Could not find the function')) {
        console.warn('Tier update skipped (trigger protection):', rpcError.message);
      }
    }
  }

  static async deletePartner(partnerId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }

    const safeSupabase = supabase!;
    const { error } = await (safeSupabase as any)
      .from('partners')
      .delete()
      .eq('id', partnerId);

    if (error) {
      console.error('Supabase deletePartner error:', error);
      throw new Error(error.message || JSON.stringify(error));
    }
  }

  static async deleteExhibitor(exhibitorId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }

    const safeSupabase = supabase!;

    // Récupérer le token de session de l'utilisateur connecté
    const { data: { session } } = await safeSupabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Session expirée - reconnectez-vous');
    }

    // Utiliser l'API serveur admin qui bypass RLS
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/admin/exhibitors/${exhibitorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Échec de la suppression');
      }

      console.log('Exposant supprimé via API admin:', result.deleted);
    } catch (fetchError: any) {
      // Fallback: essayer directement via Supabase (si RLS le permet)
      console.warn('API admin non disponible, tentative directe...', fetchError.message);
      
      const { data, error } = await (safeSupabase as any)
        .from('exhibitors')
        .delete()
        .eq('id', exhibitorId)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || data.length === 0) {
        throw new Error('Suppression impossible - permissions insuffisantes. Contactez un administrateur.');
      }
    }
  }

  // ==================== PRODUCTS ====================

  static async createProduct(productData: Partial<Product> & { exhibitorId?: string }): Promise<Product> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('products')
      .insert([{
        exhibitor_id: productData.exhibitorId,
        name: productData.name,
        description: productData.description,
        category: productData.category,
        images: productData.images || [],
        specifications: productData.specifications,
        price: productData.price,
        featured: productData.featured || false
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapProductFromDB(data);
  }

  // ==================== MINI SITES ====================

  static async updateMiniSite(exhibitorId: string, siteData: Partial<MiniSiteDB>): Promise<MiniSiteDB> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('mini_sites')
      .upsert({
        exhibitor_id: exhibitorId,
        theme: siteData.theme,
        custom_colors: siteData.custom_colors,
        sections: siteData.sections,
        published: siteData.published,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== REGISTRATION REQUESTS ====================

  static async getRegistrationRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;
    try {
      let query = (safeSupabase as any).from('registration_requests').select('*');
      if (status) {
        query = query.eq('status', status);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching registration requests:', error);
      return [];
    }
  }

  static async updateRegistrationRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;
    try {
      // Step 1: Get the user_id from the registration request
      const { data: request, error: fetchError } = await (safeSupabase as any)
        .from('registration_requests')
        .select('user_id, user_type')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Step 2: Update the registration request
      const updateData: any = {
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString()
      };
      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }
      const { error } = await (safeSupabase as any)
        .from('registration_requests')
        .update(updateData)
        .eq('id', requestId);
      if (error) throw error;

      // Step 3: CRITICAL FIX - Also update the user's status
      if (request?.user_id) {
        const newUserStatus = status === 'approved' ? 'active' : 'rejected';
        const { error: userError } = await (safeSupabase as any)
          .from('users')
          .update({ status: newUserStatus })
          .eq('id', request.user_id);

        if (userError) {
          console.error('Error updating user status:', userError);
          // Don't throw - the registration request was updated successfully
        }

        // Step 4: If partner, also update partners table verified status
        if (request.user_type === 'partner' && status === 'approved') {
          await (safeSupabase as any)
            .from('partners')
            .update({ verified: true })
            .eq('id', request.user_id);
        }

        // Step 5: If exhibitor, also update exhibitors table verified status
        if (request.user_type === 'exhibitor' && status === 'approved') {
          await (safeSupabase as any)
            .from('exhibitors')
            .update({ verified: true })
            .eq('user_id', request.user_id);
        }
      }
    } catch (error) {
      console.error('Error updating registration request status:', error);
      throw error;
    }
  }

  static async createRegistrationRequest(requestData: {
    userType: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    position?: string;
    phone: string;
    profileData?: any;
  }, ): Promise<any> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('registration_requests')
        .insert([{
          user_type: requestData.userType,
          email: requestData.email,
          first_name: requestData.firstName,
          last_name: requestData.lastName,
          company_name: requestData.companyName,
          position: requestData.position,
          phone: requestData.phone,
          status: 'pending',
          profile_data: requestData.profileData || {},
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating registration request:', error);
      throw error;
    }
  }

  // ==================== NETWORKING EXTENSIONS ====================

  /**
   * Create a new connection between users
   */
  static async createConnection(addresseeId: string, message?: string): Promise<any> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await safeSupabase
        .from('connections')
        .insert([{
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending',
          message: message || null
        }])
        .select()
        .single();

      if (error) {
        // Handle duplicate connection (409 conflict)
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          throw new Error('Vous avez déjà une demande de connexion en cours avec cet utilisateur.');
        }
        throw error;
      }

      // Create notification for addressee
      // Note: createNotification prend (userId, message, type) - 3 params seulement
      await this.createNotification(
        addresseeId,
        `${user.email} souhaite se connecter avec vous`,
        'connection'
      );

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la connexion:', error);
      throw error;
    }
  }

  /**
   * Get all connections for a user (accepted connections only)
   */
  static async getUserConnections(userId?: string): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      // Avoid complex nested selects which can fail if relationships are not configured.
      // Instead fetch connections, then fetch related users and merge locally.
      const { data, error } = await safeSupabase
        .from('connections')
        .select('id, requester_id, addressee_id, status, created_at')
        .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = data || [];

      const userIds = Array.from(new Set(rows.flatMap((r: any) => [r.requester_id, r.addressee_id]).filter(Boolean)));
      if (userIds.length === 0) return [];

      const { data: usersData, error: usersError } = await safeSupabase
        .from('users')
        .select('id, name, email, type, profile')
        .in('id', userIds);

      if (usersError) throw usersError;

      const usersMap: Record<string, any> = (usersData || []).reduce((acc: any, u: any) => {
        acc[u.id] = this.transformUserDBToUser(u);
        return acc;
      }, {});

      return rows.map((r: any) => ({
        ...r,
        requester: usersMap[r.requester_id] || null,
        addressee: usersMap[r.addressee_id] || null
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
      return [];
    }
  }

  /**
   * Add entity to user favorites
   */
  static async addFavorite(entityType: string, entityId: string): Promise<any> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await safeSupabase
        .from('user_favorites')
        .insert([{
          user_id: user.id,
          entity_type: entityType,
          entity_id: entityId
        }])
        .select()
        .single();

      if (error) {
        // If already exists, ignore (unique constraint violation)
        if (error.code === '23505') {
          return { message: 'Already in favorites' };
        }
        throw error;
      }

      // Create activity log
      await this.createActivityLog(
        user.id,
        user.id,
        'favorite_add',
        `Ajouté ${entityType} aux favoris`,
        entityType,
        entityId
      );

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  }

  /**
   * Remove entity from user favorites
   */
  static async removeFavorite(entityType: string, entityId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await safeSupabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;

      // Create activity log
      await this.createActivityLog(
        user.id,
        user.id,
        'favorite_remove',
        `Retiré ${entityType} des favoris`,
        entityType,
        entityId
      );
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      throw error;
    }
  }

  /**
   * Get user's favorites
   */
  static async getUserFavorites(userId?: string): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      const { data, error } = await safeSupabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      // Log structured error for debugging
      this.logSupabaseError('getUserFavorites', error);

      // If the server returned 404 (table missing), return empty gracefully
      try {
        const status = (error && (error.status || error.code)) || null;
        if (status === 404 || status === '404') {
          console.warn('Table user_favorites non trouvée — retour d\'un tableau vide.');
          return [];
        }
      } catch (e) {
        // ignore
      }

      return [];
    }
  }

  /**
   * Get pending connection requests for user (both sent and received)
   */
  static async getPendingConnections(userId?: string): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      // Fetch both pending connections sent by user AND received by user
      const { data, error } = await safeSupabase
        .from('connections')
        .select('id, requester_id, addressee_id, status, created_at, message')
        .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = data || [];
      
      // Get all user IDs involved (both requesters and addressees)
      const userIds = Array.from(new Set(rows.flatMap((r: any) => [r.requester_id, r.addressee_id]).filter(Boolean)));
      if (userIds.length === 0) return rows;

      const { data: usersData, error: usersError } = await safeSupabase
        .from('users')
        .select('id, name, email, type, profile')
        .in('id', userIds);

      if (usersError) throw usersError;

      const usersMap: Record<string, any> = (usersData || []).reduce((acc: any, u: any) => {
        acc[u.id] = this.transformUserDBToUser(u);
        return acc;
      }, {});

      return rows.map((r: any) => ({
        ...r,
        requester: usersMap[r.requester_id] || null,
        addressee: usersMap[r.addressee_id] || null
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes en attente:', error);
      return [];
    }
  }

  /**
   * Get daily quotas for user (connections, appointments, etc.)
   */
  static async getDailyQuotas(userId?: string): Promise<any> {
    if (!this.checkSupabaseConnection()) return null;
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return null;

      // Get user to check their level/tier
      const { data: userData, error: userError } = await safeSupabase
        .from('users')
        .select('type, visitor_level, partner_tier')
        .eq('id', targetUserId)
        .single();

      if (userError) throw userError;

      // Get today's start time
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get quota usage for today
      const { data: quotaData, error: quotaError } = await safeSupabase
        .from('quota_usage')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('created_at', today.toISOString());

      if (quotaError) throw quotaError;

      // Calculate limits based on user level
      let limits = {
        connections_per_day: 10,
        appointments: 5,
        favorites: 20
      };

      if (userData.type === 'visitor') {
        switch (userData.visitor_level) {
          case 'free':
            limits = { connections_per_day: 10, appointments: 5, favorites: 20 };
            break;
          case 'premium':
            limits = { connections_per_day: 30, appointments: 15, favorites: 50 };
            break;
          case 'vip':
            limits = { connections_per_day: 9999, appointments: 9999, favorites: 9999 };
            break;
        }
      }

      // FIXED: Essayer d'abord avec la nouvelle table daily_quotas
      const { data: dailyQuota, error: dailyError } = await safeSupabase
        .from('daily_quotas')
        .select('connections_used, messages_used, meetings_used')
        .eq('user_id', targetUserId)
        .eq('quota_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (dailyQuota && !dailyError) {
        // FIXED: Retourner le format attendu par networkingStore
        return {
          connections: dailyQuota.connections_used || 0,
          messages: dailyQuota.messages_used || 0,
          meetings: dailyQuota.meetings_used || 0,
          // Données étendues pour d'autres usages
          limits,
          usage: {
            connections_today: dailyQuota.connections_used || 0,
            messages_today: dailyQuota.messages_used || 0,
            meetings_today: dailyQuota.meetings_used || 0
          },
          remaining: {
            connections: Math.max(0, limits.connections_per_day - (dailyQuota.connections_used || 0)),
            messages: Math.max(0, 50 - (dailyQuota.messages_used || 0)),
            meetings: Math.max(0, limits.appointments - (dailyQuota.meetings_used || 0))
          }
        };
      }

      // Fallback: Utiliser quota_usage si daily_quotas n'existe pas
      const usage = {
        connections_today: quotaData?.filter(q => q.quota_type === 'connections').length || 0,
        appointments_total: quotaData?.filter(q => q.quota_type === 'appointments').length || 0,
        favorites_total: quotaData?.filter(q => q.quota_type === 'favorites').length || 0
      };

      // FIXED: Format compatible avec networkingStore
      return {
        connections: usage.connections_today,
        messages: 0, // pas de tracking messages dans quota_usage
        meetings: usage.appointments_total,
        limits,
        usage,
        remaining: {
          connections: Math.max(0, limits.connections_per_day - usage.connections_today),
          appointments: Math.max(0, limits.appointments - usage.appointments_total),
          favorites: Math.max(0, limits.favorites - usage.favorites_total)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des quotas:', error);
      // FIXED: Retourner des valeurs par défaut au lieu de null
      return { connections: 0, messages: 0, meetings: 0 };
    }
  }

  /**
   * Helper: Create activity log entry
   */
  private static async createActivityLog(
    userId: string,
    actorId: string,
    type: string,
    description: string,
    entityType?: string,
    entityId?: string,
    metadata?: any
  ): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;

    try {
      await safeSupabase
        .from('activities')
        .insert([{
          user_id: userId,
          activity_type: type,
          description,
          related_user_id: actorId || null,
          related_entity_type: entityType || null,
          related_entity_id: entityId || null,
          metadata: metadata || {},
          is_public: true
        }]);
    } catch (error) {
      console.error('Erreur lors de la création du log d\'activité:', error);
      // Don't throw - activity logging is not critical
    }
  }

  // Helper: structured logging for Supabase errors
  static logSupabaseError(context: string, error: any) {
    try {
      const structured = {
        context,
        message: error?.message || String(error),
        code: error?.code || error?.status || null,
        details: error?.details || error?.hint || null,
        status: error?.status || null,
        raw: error
      };
      // Log to console (could be extended to remote logging)
      console.warn('Supabase Error:', structured);
    } catch (e) {
      console.warn('Supabase Error Logger failed', e);
    }
  }

}

