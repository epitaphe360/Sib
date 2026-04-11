import { create } from 'zustand';
import { Exhibitor, TimeSlot } from '../types';
import { SupabaseService } from '../services/supabaseService';

interface ExhibitorState {
  exhibitors: Exhibitor[];
  filteredExhibitors: Exhibitor[];
  totalExhibitors: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  selectedExhibitor: Exhibitor | null;
  filters: {
    category: string;
    sector: string;
    country: string;
    search: string;
  };
  isLoading: boolean;
  isUpdating: string | null; // ID of the exhibitor being updated
  error: string | null;
  fetchExhibitors: (reset?: boolean) => Promise<void>;
  loadMoreExhibitors: () => Promise<void>;
  setFilters: (filters: Partial<ExhibitorState['filters']>) => void;
  selectExhibitor: (id: string) => void;
  updateAvailability: (exhibitorId: string, slots: TimeSlot[]) => void;
  updateExhibitorStatus: (exhibitorId: string, newStatus: 'approved' | 'rejected') => Promise<void>;
}

// Removed large inline mock dataset. The application now relies on Supabase for real data.

export const useExhibitorStore = create<ExhibitorState>((set, get) => ({
  exhibitors: [],
  filteredExhibitors: [],
  totalExhibitors: 0,
  currentPage: 0,
  pageSize: 24,
  hasMore: true,
  selectedExhibitor: null,
  filters: {
    category: '',
    sector: '',
    country: '',
    search: ''
  },
  isLoading: false,
  isUpdating: null,
  error: null,

  fetchExhibitors: async (reset = true) => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const nextPage = reset ? 0 : state.currentPage;
      const offset = nextPage * state.pageSize;

      const { items, total } = await SupabaseService.getExhibitorsPaginated({
        limit: state.pageSize,
        offset,
      });

      const exhibitors = reset
        ? items
        : [...state.exhibitors, ...items.filter(item => !state.exhibitors.some(existing => existing.id === item.id))];

      const filters = reset ? state.filters : get().filters;
      const filteredExhibitors = exhibitors.filter(exhibitor => {
        const sector = exhibitor.sector || '';
        const companyName = exhibitor.companyName || '';
        const description = exhibitor.description || '';
        const search = filters.search.toLowerCase();

        const matchesCategory = !filters.category || exhibitor.category === filters.category;
        const matchesSector = !filters.sector || sector === filters.sector;
        const matchesSearch = !filters.search ||
          companyName.toLowerCase().includes(search) ||
          description.toLowerCase().includes(search);

        return exhibitor.verified && exhibitor.miniSite?.published === true && matchesCategory && matchesSector && matchesSearch;
      });

      set({ 
        exhibitors,
        filteredExhibitors,
        totalExhibitors: total,
        currentPage: reset ? 1 : nextPage + 1,
        hasMore: exhibitors.length < total,
        isLoading: false 
      });
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des exposants:', error);
      
      // Message d'erreur simple et clair
      const errorMessage = error instanceof Error ? error.message : String(error) || 'Erreur de connexion à la base de données';
      
      set({ 
        exhibitors: [],
        filteredExhibitors: [],
        totalExhibitors: 0,
        currentPage: 0,
        hasMore: false,
        isLoading: false,
        error: null  // Don't show error to user when Supabase is not configured
      });
    }
  },

  loadMoreExhibitors: async () => {
    const { isLoading, hasMore } = get();
    if (isLoading || !hasMore) return;
    await get().fetchExhibitors(false);
  },

	  updateExhibitorStatus: async (exhibitorId, newStatus) => {
	    set({ isUpdating: exhibitorId, error: null });
	    try {
	      const isVerified = newStatus === 'approved';
	      const userStatus = isVerified ? 'active' : 'rejected';
	
	      // Récupérer les données de l'exposant pour l'email
	      const exhibitorToUpdate = get().exhibitors.find(ex => ex.id === exhibitorId);
	      if (!exhibitorToUpdate) throw new Error('Exposant non trouvé dans le store');
	
	      // 1. Mettre à jour le statut 'verified' de l'exposant
	      await SupabaseService.updateExhibitor(exhibitorId, {
	        verified: isVerified,
	      });
	
	      // 2. Mettre à jour le statut de l'utilisateur (dans la table 'users')
	      await SupabaseService.updateUserStatus(exhibitorId, userStatus);
	
	      // 3. Envoyer l'email de validation/rejet (ne pas bloquer si échec)
	      try {
	        await SupabaseService.sendValidationEmail({
	          email: exhibitorToUpdate.contactInfo?.email || 'contact@sibs.com',
	          firstName: 'Admin',
	          lastName: 'Admin',
	          companyName: exhibitorToUpdate.companyName,
	          status: newStatus,
	        });
	        console.log('✅ Email de validation envoyé');
	      } catch (emailError) {
	        console.warn('⚠️ Email de validation non envoyé:', emailError);
	        // Ne pas bloquer la mise à jour si l'email échoue
	      }
	
	      set(state => {
        const updateExhibitor = (ex: Exhibitor) => 
          ex.id === exhibitorId 
            ? { ...ex, verified: newStatus === 'approved' } 
            : ex;
        
        return {
          exhibitors: state.exhibitors.map(updateExhibitor),
          filteredExhibitors: state.filteredExhibitors.map(updateExhibitor),
          isUpdating: null
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      set({ isUpdating: null, error: errorMessage });
      // Optionnel: Revert state on error
    }
  },

  setFilters: (newFilters) => {
    const { exhibitors } = get();
    const filters = { ...get().filters, ...newFilters };
    
    console.log('🔍 Filtre appliqué:', filters, `sur ${exhibitors.length} exposants`);
    
    const filtered = exhibitors.filter(exhibitor => {
      const sector = exhibitor.sector || '';
      const companyName = exhibitor.companyName || '';
      const description = exhibitor.description || '';
      const search = filters.search.toLowerCase();

      const matchesCategory = !filters.category || exhibitor.category === filters.category;
      // Comparaison exacte pour le secteur (au lieu de .includes())
      const matchesSector = !filters.sector || sector === filters.sector;
      const matchesSearch = !filters.search || 
        companyName.toLowerCase().includes(search) ||
        description.toLowerCase().includes(search);
      
      // Seuls les exposants vérifiés ET publiés sont visibles publiquement
      return exhibitor.verified && exhibitor.miniSite?.published === true && matchesCategory && matchesSector && matchesSearch;
    });

    console.log(`📊 ${filtered.length} exposants après filtrage`);
    set({ filters, filteredExhibitors: filtered });
  },

  selectExhibitor: (id) => {
    const { exhibitors } = get();
    const exhibitor = exhibitors.find(e => e.id === id) || null;
    set({ selectedExhibitor: exhibitor });
  },

  updateAvailability: (exhibitorId, slots) => {
    const { exhibitors } = get();
    const updatedExhibitors = exhibitors.map(exhibitor =>
      exhibitor.id === exhibitorId
        ? { ...exhibitor, availability: slots }
        : exhibitor
    );
    set({ exhibitors: updatedExhibitors });
  }
}));