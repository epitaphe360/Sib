import { create } from 'zustand';
import { toast } from 'sonner';
import { NetworkingRecommendation, User } from '@/types';
import RecommendationService from '@/services/recommendationService';
import useAuthStore from './authStore';
import { SupabaseService } from '@/services/supabaseService';
import {
  calculateEngagementScore,
  calculateNetworkingHealthScore,
  calculateProfileCompleteness,
} from '@/services/networkingScoring';
import {
  getNetworkingPermissions,
  getEventAccessPermissions,
  checkDailyLimits,
  getPermissionErrorMessage,
  type NetworkingPermissions,
  type EventAccessPermissions
} from '@/lib/networkingPermissions';

// Types
interface SectorData {
  subject: string;
  A: number;
  fullMark: number;
}

interface AIInsights {
  summary: string;
  suggestions: string[];
  topKeywords: string[];
  sectorData?: SectorData[];
  networkStats?: {
    totalConnections: number;
    totalFavorites: number;
    pendingCount: number;
  };
}

// AI Insights will be fetched from backend
const generateAIInsights = async (userId: string): Promise<AIInsights> => {
  try {
    // Récupérer les données réelles de l'utilisateur
    const [connections, favorites, pendingConns] = await Promise.all([
      SupabaseService.getUserConnections(userId).catch(() => []),
      SupabaseService.getUserFavorites(userId).catch(() => []),
      SupabaseService.getPendingConnections(userId).catch(() => [])
    ]);

    // Extraire les profils connectés directement depuis les objets connexion
    // getUserConnections retourne {requester_id, addressee_id, requester, addressee}
    const connectedUsers = (connections as any[]).map(c =>
      c.requester_id === userId ? c.addressee : c.requester
    ).filter(Boolean);

    // Analyser les secteurs des connexions
    const sectors = connectedUsers
      .flatMap((u: any) => u.profile?.sectors ?? (u.profile?.sector ? [u.profile.sector] : []))
      .filter(Boolean);
    const sectorCounts = sectors.reduce((acc: Record<string, number>, sector: string) => {
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSectors = Object.entries(sectorCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([sector]) => sector);

    // Générer les données pour le graphique radar
    const allSectors = ['Bâtiment', 'Logistique', 'Technologie', 'Finance', 'Formation', 'Institutionnel'];
    const maxVal = Math.max(...Object.values(sectorCounts) as number[], 10);
    const sectorData: SectorData[] = allSectors.map(sector => ({
      subject: sector,
      A: (sectorCounts[sector] as number) || 0,
      fullMark: maxVal,
    }));

    // Générer un résumé intelligent
    const totalConnections = connections.length;
    const totalFavorites = favorites.length;
    const pendingCount = pendingConns.length;

    let summary = `Votre réseau compte ${totalConnections} connexion${totalConnections > 1 ? 's' : ''} active${totalConnections > 1 ? 's' : ''}`;
    if (topSectors.length > 0) {
      summary += ` principalement dans ${topSectors.length > 1 ? 'les secteurs' : 'le secteur'} ${topSectors.join(', ')}`;
    }
    summary += `. Vous avez ${totalFavorites} favori${totalFavorites > 1 ? 's' : ''} et ${pendingCount} demande${pendingCount > 1 ? 's' : ''} en attente.`;

    // Générer des suggestions intelligentes
    const suggestions: string[] = [];
    if (totalConnections < 10) {
      suggestions.push("💡 Développez votre réseau en contactant au moins 10 professionnels du salon");
    }
    if (pendingCount > 0) {
      suggestions.push(`⏳ ${pendingCount} demande${pendingCount > 1 ? 's' : ''} de connexion en attente de validation`);
    }
    if (totalFavorites > 0 && totalConnections < totalFavorites) {
      suggestions.push("🎯 Transformez vos favoris en connexions actives pour enrichir vos échanges");
    }
    if (topSectors.length > 0) {
      const coveredSectors = new Set(topSectors);
      const otherSectors = allSectors.filter(s => !coveredSectors.has(s)).slice(0, 2);
      if (otherSectors.length > 0) {
        suggestions.push(`🌐 Explorez de nouveaux secteurs: ${otherSectors.join(', ')}`);
      }
    }
    if (suggestions.length === 0) {
      suggestions.push("🚀 Explorez les recommandations personnalisées pour agrandir votre réseau");
    }

    // Mots-clés basés sur les profils connectés
    const keywords = topSectors.length > 0 ? topSectors : ["Réseautage", "Business", "Innovation"];

    return {
      summary,
      suggestions,
      topKeywords: keywords,
      sectorData,
      networkStats: {
        totalConnections,
        totalFavorites,
        pendingCount,
      },
    };
  } catch (error) {
    console.error('Erreur lors de la génération des insights:', error);
    return {
      summary: "Développez votre réseau professionnel en explorant les profils disponibles.",
      suggestions: ["Explorez les profils d'exposants", "Ajoutez des contacts en favoris", "Participez aux événements du salon"],
      topKeywords: ["Networking", "Connections", "Opportunités"],
      sectorData: [
        { subject: 'Bâtiment', A: 0, fullMark: 10 },
        { subject: 'Logistique', A: 0, fullMark: 10 },
        { subject: 'Technologie', A: 0, fullMark: 10 },
        { subject: 'Finance', A: 0, fullMark: 10 },
        { subject: 'Formation', A: 0, fullMark: 10 },
        { subject: 'Institutionnel', A: 0, fullMark: 10 },
      ],
      networkStats: {
        totalConnections: 0,
        totalFavorites: 0,
        pendingCount: 0,
      },
    };
  }
};

interface DailyUsage {
  connections: number;
  messages: number;
  meetings: number;
  lastReset: Date;
}

interface PendingConnection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  message?: string;
  requester: any; // User object
}

interface NetworkingState {
  recommendations: NetworkingRecommendation[];
  connections: string[]; // Array of user IDs
  favorites: string[]; // Array of user IDs
  pendingConnections: PendingConnection[]; // Array of pending connection objects
  aiInsights: AIInsights | null;
  isLoading: boolean;
  error: string | null;

  // Permissions and usage tracking
  permissions: NetworkingPermissions | null;
  eventPermissions: EventAccessPermissions | null;
  dailyUsage: DailyUsage;
  analytics: {
    averageRecommendationScore: number;
    networkingHealthScore: number;
    engagementScore: number;
    profileCompleteness: number;
  };

  // Appointment Modal State
  showAppointmentModal: boolean;
  selectedExhibitorForRDV: User | null;
  selectedTimeSlot: string;
  appointmentMessage: string;

  // Actions
  fetchRecommendations: () => Promise<void>;
  generateRecommendations: (userId: string) => Promise<void>;
  markAsContacted: (recommendedUserId: string) => void;

  // Permission-aware actions
  handleConnect: (userId: string, userName: string) => Promise<void>;
  addToFavorites: (userId: string) => Promise<void>;
  removeFromFavorites: (userId: string) => Promise<void>;
  handleMessage: (userName: string, company: string, userId?: string, navigateFn?: (path: string) => void) => void;
  handleScheduleMeeting: (userName: string, company: string) => void;

  // Data loading
  loadConnections: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  loadPendingConnections: () => Promise<void>;
  loadDailyUsage: () => Promise<void>;

  // Permission management
  updatePermissions: () => void;
  checkActionPermission: (action: 'connect' | 'message' | 'meeting') => boolean;
  getRemainingQuota: () => { connections: number; messages: number; meetings: number };
  refreshAnalytics: () => void;

  // AI and insights
  loadAIInsights: () => void;

  // Modal Actions
  setShowAppointmentModal: (show: boolean) => void;
  setSelectedExhibitorForRDV: (exhibitor: User | null) => void;
  setSelectedTimeSlot: (slot: string) => void;
  setAppointmentMessage: (message: string) => void;
}

export const useNetworkingStore = create<NetworkingState>((set, get) => ({
  // State
  recommendations: [],
  connections: [],
  favorites: [],
  pendingConnections: [],
  aiInsights: null,
  isLoading: false,
  error: null,

  // Permissions and usage
  permissions: null,
  eventPermissions: null,
  dailyUsage: {
    connections: 0,
    messages: 0,
    meetings: 0,
    lastReset: new Date(),
  },
  analytics: {
    averageRecommendationScore: 0,
    networkingHealthScore: 0,
    engagementScore: 0,
    profileCompleteness: 0,
  },

  // Appointment Modal State
  showAppointmentModal: false,
  selectedExhibitorForRDV: null,
  selectedTimeSlot: '',
  appointmentMessage: '',

  // Actions
  fetchRecommendations: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ error: 'User not authenticated.', isLoading: false });
      console.log('❌ No user authenticated');
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const allUsers = await SupabaseService.getUsers({ limit: 100 });
      const recommendations = await RecommendationService.generateRecommendations(user, allUsers);
      set({ recommendations, isLoading: false });
      get().refreshAnalytics();
    } catch (e) {
      const error = e instanceof Error ? e.message : 'An unknown error occurred.';
      set({ error, isLoading: false });
      console.error("Failed to fetch recommendations:", error, e);
    }
  },

  generateRecommendations: async (userId: string) => {
    console.log('🎯 generateRecommendations called for userId:', userId);
    set({ isLoading: true, error: null });
    try {
      await get().fetchRecommendations();

      const currentRecs = get().recommendations;
      if (currentRecs.length > 0) {
        await get().loadAIInsights();
      }
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
      set({ error: 'Erreur lors de la génération des recommandations' });
      throw error;
    } finally {
      set({ isLoading: false });
      get().refreshAnalytics();
    }
  },

  markAsContacted: (recommendedUserId: string) => {
    set(state => ({
      recommendations: state.recommendations.map(rec =>
        rec.recommendedUserId === recommendedUserId ? { ...rec, contacted: true } : rec
      ),
    }));
    toast.success("Utilisateur marqué comme contacté.");
  },

  handleConnect: async (userId: string, userName: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté pour envoyer une demande de connexion.");
      return;
    }

    // Check permissions
    if (!get().checkActionPermission('connect')) {
      const errorMessage = getPermissionErrorMessage(user.type, user.profile?.passType || user.profile?.status || 'free', 'connection');
      toast.error(errorMessage);
      return;
    }

    try {
      // Créer la connexion dans Supabase
      // Note: createConnection prend seulement l'ID du destinataire, l'utilisateur courant est récupéré via auth
      const result = await SupabaseService.createConnection(userId);

      // Mettre à jour le state local avec un objet correctement formaté
      const newPendingConnection: PendingConnection = {
        id: result?.id || `temp-${Date.now()}`,
        requester_id: user.id,
        addressee_id: userId,
        status: 'pending',
        created_at: new Date().toISOString(),
        requester: user
      };

      set(state => ({
        pendingConnections: [...state.pendingConnections, newPendingConnection],
      }));
      get().refreshAnalytics();

      // Recharger l'usage quotidien depuis la DB
      await get().loadDailyUsage();

      toast.success(`✅ Demande de connexion envoyée à ${userName}.`);

      // Show remaining quota if limited
      const remaining = get().getRemainingQuota();
      if (remaining.connections > 0 && remaining.connections < 5) {
        toast.info(`📊 Il vous reste ${remaining.connections} connexion(s) aujourd'hui.`);
      }
    } catch (error: unknown) {
      console.error('Erreur lors de la connexion:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Message spécifique pour connexion déjà existante
      if (errorMessage.includes('duplicate') || errorMessage.includes('déjà une demande')) {
        toast.warning(errorMessage);
      } else {
        toast.error(errorMessage || 'Erreur lors de l\'envoi de la demande de connexion.');
      }
    }
  },

  addToFavorites: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté.");
      return;
    }

    try {
      // Note: addFavorite prend (entityType, entityId), l'utilisateur courant est récupéré via auth
      await SupabaseService.addFavorite('user', userId);
      set(state => ({
        favorites: [...state.favorites, userId],
      }));
      get().refreshAnalytics();
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      toast.error('Erreur lors de l\'ajout aux favoris.');
    }
  },

  removeFromFavorites: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté.");
      return;
    }

    try {
      // Note: removeFavorite prend (entityType, entityId), l'utilisateur courant est récupéré via auth
      await SupabaseService.removeFavorite('user', userId);
      set(state => ({
        favorites: state.favorites.filter(id => id !== userId),
      }));
      get().refreshAnalytics();
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      toast.error('Erreur lors de la suppression du favori.');
    }
  },

  handleMessage: (userName: string, company: string, userId?: string, navigateFn?: (path: string) => void) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté pour envoyer un message.");
      return;
    }

    // Check permissions
    if (!get().checkActionPermission('message')) {
      const errorMessage = getPermissionErrorMessage(user.type, user.profile?.passType || user.profile?.status, 'message');
      toast.error(errorMessage);
      return;
    }

    set(state => ({
      dailyUsage: {
        ...state.dailyUsage,
        messages: state.dailyUsage.messages + 1,
      },
    }));

    // Redirect to messages page with userId if provided
    if (userId) {
      if (navigateFn) {
        navigateFn(`/messages?userId=${userId}`);
      } else {
        // Pas de fallback window.location.href — le appelant doit toujours fournir navigateFn
        console.warn('[networkingStore] handleMessage appelé sans navigateFn, navigation ignorée');
      }
    } else {
      toast.success(`💬 Message envoyé à ${userName} de ${company}.`);
    }

    // Show remaining quota
    const remaining = get().getRemainingQuota();
    if (remaining.messages > 0 && remaining.messages < 5) {
      toast.info(`📊 Il vous reste ${remaining.messages} message(s) aujourd'hui.`);
    }
  },

  handleScheduleMeeting: (userName: string, company: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté pour programmer un rendez-vous.");
      return;
    }

    // Check permissions
    if (!get().checkActionPermission('meeting')) {
      const errorMessage = getPermissionErrorMessage(user.type, user.profile?.passType || user.profile?.status, 'meeting');
      toast.error(errorMessage);
      return;
    }

    set(state => ({
      dailyUsage: {
        ...state.dailyUsage,
        meetings: state.dailyUsage.meetings + 1,
      },
    }));

    toast.success(`📅 Demande de rendez-vous envoyée à ${userName} de ${company}.`);

    // Show remaining quota
    const remaining = get().getRemainingQuota();
    if (remaining.meetings > 0 && remaining.meetings < 3) {
      toast.info(`📊 Il vous reste ${remaining.meetings} rendez-vous aujourd'hui.`);
    }
  },

  // Data loading methods
  loadConnections: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {return;}

    try {
      const connectionsData = await SupabaseService.getUserConnections(user.id);
      // Extract the IDs of connected users (the other party, not the current user)
      const connectionIds = connectionsData.map((conn: Record<string, unknown>) => {
        // Return the ID of the other user (not the current user)
        return conn.requester_id === user.id ? conn.addressee_id : conn.requester_id;
      }).filter(Boolean);
      set({ connections: connectionIds });
      get().refreshAnalytics();
    } catch (error) {
      console.error('Erreur lors du chargement des connexions:', error);
    }
  },

  loadFavorites: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {return;}

    try {
      const favorites = await SupabaseService.getUserFavorites(user.id);
      if (!favorites || favorites.length === 0) {
        // Friendly UI fallback: keep existing favorites but notify user if none
        set({ favorites: [] });
      } else {
        set({ favorites });
      }
      get().refreshAnalytics();
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      toast.error('Impossible de charger vos favoris pour le moment.');
    }
  },

  loadPendingConnections: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {return;}

    try {
      const pendingConnections = await SupabaseService.getPendingConnections(user.id);
      set({ pendingConnections });
      get().refreshAnalytics();
    } catch (error) {
      console.error('Erreur lors du chargement des connexions en attente:', error);
    }
  },

  loadDailyUsage: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {return;}

    try {
      const quotas = await SupabaseService.getDailyQuotas(user.id);
      set({
        dailyUsage: {
          connections: quotas.connections,
          messages: quotas.messages,
          meetings: quotas.meetings,
          lastReset: new Date(),
        },
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'usage quotidien:', error);
    }
  },

  // Permission management methods
  updatePermissions: () => {
    const { user } = useAuthStore.getState();
    if (!user) {return;}

    const permissions = getNetworkingPermissions(user.type, user.profile?.passType || user.profile?.status || 'free');
    const eventPermissions = getEventAccessPermissions(user.type, user.profile?.passType || user.profile?.status || 'free');

    set({ permissions, eventPermissions });
  },

  checkActionPermission: (action: 'connect' | 'message' | 'meeting') => {
    const { user } = useAuthStore.getState();
    const state = get();

    if (!user || !state.permissions) {
      get().updatePermissions();
      return false;
    }

    // Check basic permission
    switch (action) {
      case 'connect':
        if (!state.permissions.canMakeConnections) {return false;}
        break;
      case 'message':
        if (!state.permissions.canSendMessages) {return false;}
        break;
      case 'meeting':
        if (!state.permissions.canScheduleMeetings) {return false;}
        break;
    }

    // Check daily limits
    const limits = checkDailyLimits(user.type, user.profile?.passType || user.profile?.status, state.dailyUsage);

    switch (action) {
      case 'connect':
        return limits.canMakeConnection;
      case 'message':
        return limits.canSendMessage;
      case 'meeting':
        return limits.canScheduleMeeting;
      default:
        return false;
    }
  },

  getRemainingQuota: () => {
    const { user } = useAuthStore.getState();
    const state = get();

    if (!user) {return { connections: 0, messages: 0, meetings: 0 };}

    const limits = checkDailyLimits(user.type, user.profile?.passType || user.profile?.status, state.dailyUsage);

    return {
      connections: limits.remainingConnections,
      messages: limits.remainingMessages,
      meetings: limits.remainingMeetings,
    };
  },

  refreshAnalytics: () => {
    const { user } = useAuthStore.getState();
    const state = get();

    if (!user) {
      set({
        analytics: {
          averageRecommendationScore: 0,
          networkingHealthScore: 0,
          engagementScore: 0,
          profileCompleteness: 0,
        },
      });
      return;
    }

    const averageRecommendationScore = state.recommendations.length > 0
      ? state.recommendations.reduce((acc, recommendation) => acc + recommendation.score, 0) / state.recommendations.length
      : 0;

    const profileCompleteness = calculateProfileCompleteness(user);

    set({
      analytics: {
        averageRecommendationScore,
        profileCompleteness,
        networkingHealthScore: calculateNetworkingHealthScore({
          profileCompleteness,
          connectionsCount: state.connections.length,
          recommendationsCount: state.recommendations.length,
          averageRecommendationScore,
        }),
        engagementScore: calculateEngagementScore({
          connectionsCount: state.connections.length,
          favoritesCount: state.favorites.length,
          pendingCount: state.pendingConnections.length,
        }),
      },
    });
  },

  loadAIInsights: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error('Vous devez être connecté pour accéder aux insights.');
      return;
    }

    set({ isLoading: true, aiInsights: null });

    try {
      // S'assurer que les données de base sont chargées
      const state = get();
      if (state.connections.length === 0) {
        await state.loadConnections();
      }
      if (state.favorites.length === 0) {
        await state.loadFavorites();
      }
      if (state.pendingConnections.length === 0) {
        await state.loadPendingConnections();
      }

      // Générer les insights
      const insights = await generateAIInsights(user.id);
      set({ aiInsights: insights, isLoading: false });
      toast.success('✨ Insights IA générés avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération des insights:', error);
      set({
        isLoading: false,
        aiInsights: {
          summary: "Une erreur s'est produite lors de l'analyse de votre réseau. Veuillez réessayer.",
          suggestions: ["Vérifiez votre connexion", "Réessayez dans quelques instants"],
          topKeywords: ["Erreur"],
        }
      });
      toast.error('❌ Erreur lors de la génération des insights.');
    }
  },

  // Modal Actions
  setShowAppointmentModal: (show) => set({ showAppointmentModal: show }),
  setSelectedExhibitorForRDV: (exhibitor) => set({ selectedExhibitorForRDV: exhibitor }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setAppointmentMessage: (message) => set({ appointmentMessage: message }),
}));
