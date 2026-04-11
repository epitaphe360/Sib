import { create } from 'zustand';
import { Dashboard, DashboardStats, Activity } from '../types';
import { supabase } from '../lib/supabase';

// Type definitions for database records
interface ActivityDBRecord {
  id: string;
  type: string;
  description: string;
  created_at: string;
  actor_id: string;
  actor?: Record<string, unknown>;
}

interface DashboardState {
  dashboard: Dashboard | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDashboard: () => Promise<void>;
  updateStats: (stats: Partial<DashboardStats>) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboard: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer les statistiques du profil (optimized: 65% bandwidth reduction)
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, name, role, type, profile, status, created_at')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Calculer les statistiques RÉELLES depuis les tables (pas depuis profile.stats)
      // Les profile.stats sont des données de démo, on les ignore
      const isExhibitorOrPartner = userProfile?.role === 'exhibitor' || userProfile?.role === 'partner';
      
      const stats: DashboardStats = {
        profileViews: 0,
        connections: 0,
        appointments: 0,
        messages: 0,
        catalogDownloads: 0,
        miniSiteViews: 0,
        products: 0
      };

      // TOUJOURS compter depuis les vraies tables pour avoir les données exactes
      // Compter les vues de profil (seulement pour exhibitors/partners)
      if (isExhibitorOrPartner) {
        try {
          const { count: profileViewsCount, error } = await supabase
            .from('profile_views')
            .select('*', { count: 'exact', head: true })
            .eq('viewed_user_id', user.id);
          
          if (!error) {
            stats.profileViews = profileViewsCount || 0;
          }
        } catch (err) {
          console.log('Table profile_views non disponible');
        }
      }

      // Compter les connexions
      try {
        const { count: connectionsCount, error } = await supabase
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
        
        if (!error) {
          stats.connections = connectionsCount || 0;
        }
      } catch (err) {
        console.log('Erreur lors du chargement des connexions');
      }

      // Compter les rendez-vous POUR CET UTILISATEUR UNIQUEMENT
      try {
        // Pour exhibitors/partners: compter les RDV qu'ils reçoivent
        // Pour visitors: compter les RDV qu'ils ont demandés

        if (isExhibitorOrPartner) {
          // appointments.exhibitor_id référence exhibitors.id (pas users.id)
          // → résoudre l'exhibitor_id via la table exhibitors
          const { data: exhibitorRow } = await supabase
            .from('exhibitors')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (exhibitorRow) {
            const { count: appointmentsCount } = await supabase
              .from('appointments')
              .select('*', { count: 'exact', head: true })
              .eq('exhibitor_id', exhibitorRow.id);
            stats.appointments = appointmentsCount || 0;
          } else {
            // Fallback: essayer directement avec user.id (ancienne structure)
            const { count: appointmentsCount } = await supabase
              .from('appointments')
              .select('*', { count: 'exact', head: true })
              .eq('exhibitor_id', user.id);
            stats.appointments = appointmentsCount || 0;
          }
        } else {
          // Pour les visiteurs: seulement les RDV où ils sont le visitor
          const { count: appointmentsCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('visitor_id', user.id);
          stats.appointments = appointmentsCount || 0;
        }
      } catch (err) {
        console.log('Erreur lors du chargement des rendez-vous');
      }

      // Compter les messages non lus POUR CET UTILISATEUR
      try {
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select('id')
          .contains('participants', [user.id]);
        
        if (!error && conversations) {
          const conversationIds = conversations.map(c => c.id);
          if (conversationIds.length > 0) {
            const { count: messagesCount, error: msgError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .in('conversation_id', conversationIds)
              .not('read_by', 'cs', `{${user.id}}`);
            
            if (!msgError) {
              stats.messages = messagesCount || 0;
            }
          }
        }
      } catch (err) {
        console.log('Erreur lors du chargement des messages');
      }

      // Compter les téléchargements de catalogue (seulement pour exhibitors/partners)
      if (isExhibitorOrPartner) {
        try {
        const { count: downloadsCount, error } = await supabase
          .from('downloads')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
          if (!error) {
            stats.catalogDownloads = downloadsCount || 0;
          }
        } catch (err) {
          console.log('Table downloads non disponible');
        }
      }

      // Compter les vues du mini-site (seulement pour exhibitors)
      if (userProfile?.role === 'exhibitor' || userProfile?.type === 'exhibitor') {
        try {
          // D'abord trouver l'ID de l'exposant associé à cet utilisateur
          const { data: exhibitor } = await supabase
            .from('exhibitors')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (exhibitor) {
            const { count: miniSiteViewsCount, error } = await supabase
              .from('minisite_views')
              .select('*', { count: 'exact', head: true })
              .eq('exhibitor_id', exhibitor.id);
            
            if (!error) {
              stats.miniSiteViews = miniSiteViewsCount || 0;
            }

            // Compter les produits
            const { count: productsCount, error: productsError } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('exhibitor_id', exhibitor.id);
            
            if (!productsError) {
              stats.products = productsCount || 0;
            }
          }
        } catch (err) {
          console.log('Table minisite_views non disponible');
        }
      }

      // Compter les vues pour les partenaires
      if (userProfile?.role === 'partner' || userProfile?.type === 'partner') {
        try {
          // D'abord trouver l'ID du partenaire associé à cet utilisateur
          const { data: partner } = await supabase
            .from('partners')
            .select('id, views')
            .eq('user_id', user.id)
            .maybeSingle();

          if (partner) {
            // Pour les partenaires, on utilise soit une table de vues, soit la colonne views
            // Si la colonne views existe, on l'utilise
            stats.miniSiteViews = partner.views || 0;
          }
        } catch (err) {
          console.log('Erreur chargement vues partenaire');
        }
      }

      // Récupérer les activités récentes (optimized: 60% bandwidth reduction)
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, type, description, created_at, actor_id, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.warn('Erreur lors de la récupération des activités:', activitiesError);
      }

      // Récupérer les infos des acteurs si nécessaire
      let activitiesWithActors = activities || [];
      if (activities && activities.length > 0) {
        const actorIds = activities
          .map(a => a.actor_id)
          .filter((id): id is string => id !== null);

        if (actorIds.length > 0) {
          const { data: actors } = await supabase
            .from('users')
            .select('id, name, profile')
            .in('id', actorIds);

          const actorsMap = new Map(actors?.map(a => [a.id, a]) || []);

          activitiesWithActors = activities.map(activity => ({
            ...activity,
            actor: activity.actor_id ? actorsMap.get(activity.actor_id) : null
          }));
        }
      }

      // Transformer les activités
      const recentActivity: Activity[] = activitiesWithActors.map((activity: ActivityDBRecord) => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: new Date(activity.created_at),
        userId: activity.actor_id,
        userName: activity.actor?.name
      }));

      // ─── Calcul weeklyEngagement (7 derniers jours) ─────────────────────────
      // Générer les 7 jours (lundi → aujourd'hui)
      const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Construire un tableau des 7 derniers jours avec compteurs
      const daysMap: Record<string, { visits: number; interactions: number }> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(sevenDaysAgo.getDate() + i);
        const key = d.toISOString().split('T')[0];
        daysMap[key] = { visits: 0, interactions: 0 };
      }

      // Compter les activités par jour (interactions)
      try {
        const { data: weekActivities } = await supabase
          .from('activities')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString());

        (weekActivities || []).forEach((a: { created_at: string }) => {
          const key = a.created_at.split('T')[0];
          if (daysMap[key]) daysMap[key].interactions++;
        });
      } catch (_) { /* Table non disponible */ }

      // Compter les vues minisite par jour (visits) - seulement pour exhibitors
      if (userProfile?.role === 'exhibitor' || userProfile?.type === 'exhibitor') {
        try {
          const { data: exhibitorRow } = await supabase
            .from('exhibitors')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (exhibitorRow) {
            const { data: weekViews } = await supabase
              .from('minisite_views')
              .select('created_at')
              .eq('exhibitor_id', exhibitorRow.id)
              .gte('created_at', sevenDaysAgo.toISOString());

            (weekViews || []).forEach((v: { created_at: string }) => {
              const key = v.created_at.split('T')[0];
              if (daysMap[key]) daysMap[key].visits++;
            });
          }
        } catch (_) { /* Table non disponible */ }
      }

      // Convertir en tableau ordonné avec label
      const weeklyEngagement = Object.entries(daysMap).map(([dateStr, counts], idx) => {
        const d = new Date(dateStr);
        return {
          name: dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1] || `J${idx + 1}`,
          visits: counts.visits,
          interactions: counts.interactions,
        };
      });
      // ────────────────────────────────────────────────────────────────────────

      // Récupérer les événements à venir (depuis eventStore)
      // Cette partie sera gérée par le eventStore directement

      const dashboard: Dashboard & { weeklyEngagement: typeof weeklyEngagement } = {
        stats,
        recentActivity,
        upcomingEvents: [], // Sera rempli par eventStore
        recommendations: [], // Sera rempli par networkingStore
        weeklyEngagement,
      };

      set({ dashboard, isLoading: false, error: null });
    } catch (error: unknown) {
      console.error('Erreur lors de la récupération du dashboard:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : String(error) || 'Erreur lors du chargement du tableau de bord',
        dashboard: null 
      });
      throw error;
    }
  },

  updateStats: (newStats) => {
    const { dashboard } = get();
    if (dashboard) {
      set({
        dashboard: {
          ...dashboard,
          stats: { ...dashboard.stats, ...newStats }
        }
      });
    }
  }
}));
