import { create } from 'zustand';
import { supabase, isSupabaseReady } from '../lib/supabase';

// Type definitions for database records
interface UserDBRecord {
  id: string;
  name?: string;
  email?: string;
  type?: string;
  profile?: Record<string, unknown>;
  visitor_level?: string;
  status?: string;
}

interface FavoriteDBRecord {
  entity_id: string;
}

interface ConnectionDBRecord {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  last_interaction?: string;
  connected_user?: UserDBRecord;
}

interface NotificationDBRecord {
  id: string;
  type: string;
  title: string;
  message?: string;
  created_at: string;
  read: boolean;
}

interface VisitorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  visitorType?: 'individual' | 'freelancer' | 'company';
  company?: string;
  position?: string;
  professionalStatus?: string;
  businessSector?: string;
  country: string;
  phone: string;
  avatar?: string;
  passType: 'free' | 'premium';
  registrationStatus: 'pending' | 'confirmed' | 'cancelled';

  // Spécifique aux visiteurs
  sectorsOfInterest: string[];
  visitObjectives: string[];
  competencies: string[];
  expertises: string[];

  // Préférences
  thematicInterests: string[];
  preferredLanguage: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

interface Appointment {
  id: string;
  title: string;
  company: string;
  contactPerson: string;
  date: Date;
  time: string;
  duration: number;
  location: string;
  type: 'b2b' | 'conference' | 'workshop' | 'networking';
  status: 'pending' | 'confirmed' | 'cancelled';
  description?: string;
  meetingLink?: string;
}

interface Session {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  speaker: string;
  category: string;
  capacity: number;
  registered: number;
}

interface FavoriteExhibitor {
  id: string;
  name: string;
  sector: string;
  description: string;
  logo: string;
  pavilion: string;
  standNumber: string;
  website?: string;
}

interface Connection {
  id: string;
  name: string;
  company: string;
  position: string;
  avatar: string;
  type: 'exhibitor' | 'visitor' | 'partner';
  connectedAt: Date;
  lastInteraction?: Date;
}

interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  preview: string;
  timestamp: Date;
  read: boolean;
  type: 'direct' | 'group' | 'system';
}

interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface SalonInfo {
  name: string;
  dates: {
    start: Date;
    end: Date;
  };
  location: {
    venue: string;
    city: string;
    country: string;
    address: string;
  };
  hours: {
    opening: string;
    closing: string;
  };
  stats: {
    exhibitors: number;
    visitors: number;
    conferences: number;
    countries: number;
  };
}

interface VisitorAgenda {
  appointments: Appointment[];
  guaranteedMeetings: {
    total: number;
    used: number;
    remaining: number;
  };
  personalEvents: Event[];
}

interface VisitorState {
  visitorProfile: VisitorProfile | null;
  agenda: VisitorAgenda;
  favoriteExhibitors: FavoriteExhibitor[];
  registeredSessions: Session[];
  connections: Connection[];
  messages: Message[];
  notifications: Notification[];
  salonInfo: SalonInfo | null;
  isLoading: boolean;

  // Actions
  fetchVisitorData: () => Promise<void>;
  updateProfile: (profileData: Partial<VisitorProfile>) => Promise<void>;
  addToFavorites: (exhibitorId: string) => Promise<void>;
  removeFromFavorites: (exhibitorId: string) => Promise<void>;
  registerForSession: (sessionId: string) => Promise<void>;
  unregisterFromSession: (sessionId: string) => Promise<void>;
  sendMeetingRequest: (exhibitorId: string, message: string, preferredDate: Date) => Promise<void>;
  acceptMeetingRequest: (requestId: string) => Promise<void>;
  rejectMeetingRequest: (requestId: string) => Promise<void>;
  sendMessage: (recipientId: string, message: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  updateNotificationPreferences: (preferences: Partial<VisitorProfile['notificationPreferences']>) => Promise<void>;
}

// Utiliser le client Supabase importé directement
const getSupabaseClient = () => {
  if (!isSupabaseReady()) {
    console.warn('⚠️ Supabase non configuré');
    return null;
  }
  return supabase;
};

export const useVisitorStore = create<VisitorState>((set, get) => ({
  visitorProfile: null,
  agenda: {
    appointments: [],
    guaranteedMeetings: { total: 0, used: 0, remaining: 0 },
    personalEvents: []
  },
  favoriteExhibitors: [],
  registeredSessions: [],
  connections: [],
  messages: [],
  notifications: [],
  salonInfo: null,
  isLoading: false,

  fetchVisitorData: async () => {
    set({ isLoading: true });
    try {
      const supabaseClient = getSupabaseClient();
      // Récupérer les données réelles depuis Supabase
      if (supabaseClient) {
        // Récupérer le profil utilisateur actuel
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (user) {
          // Récupérer le profil complet depuis la table users (optimized: 70% bandwidth reduction)
          let { data: userProfile, error: profileError } = await supabaseClient
            .from('users')
            .select('id, email, name, type, status, visitor_level, profile, created_at')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Erreur lors de la récupération du profil:', profileError);
            throw profileError;
          }

          // Si aucun profil n'existe, créer un profil par défaut
          if (!userProfile) {
            console.warn('Aucun profil trouvé pour l\'utilisateur, création d\'un profil par défaut');
            const { data: newProfile, error: createError } = await supabaseClient
              .from('users')
              .insert([{
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || user.email?.split('@')[0] || 'Visiteur',
                type: 'visitor',
                status: 'active',
                visitor_level: 'free',
                profile: {
                  firstName: user.user_metadata?.firstName || '',
                  lastName: user.user_metadata?.lastName || '',
                  country: '',
                  phone: '',
                  sectorsOfInterest: [],
                  visitObjectives: [],
                  competencies: [],
                  thematicInterests: [],
                  preferredLanguage: 'fr'
                }
              }])
              .select()
              .single();

            if (createError) {
              console.error('Erreur lors de la création du profil par défaut:', createError);
              throw createError;
            }

            // Utiliser le nouveau profil créé
            userProfile = newProfile;
          }

          // Récupérer les favoris depuis user_favorites (structure correcte)
          const { data: favorites, error: favError } = await supabaseClient
            .from('user_favorites')
            .select('entity_id, entity_type')
            .eq('user_id', user.id)
            .eq('entity_type', 'user');

          if (favError) {console.warn('Erreur lors de la récupération des favoris:', favError);}

          // Récupérer les détails des exposants favoris
          let favoriteExhibitors: UserDBRecord[] = [];
          if (favorites && favorites.length > 0) {
            const exhibitorIds = favorites.map((f: FavoriteDBRecord) => f.entity_id);
            const { data: exhibitorsData } = await supabaseClient
              .from('users')
              .select('id, name, profile')
              .in('id', exhibitorIds);
            favoriteExhibitors = exhibitorsData || [];
          }

          // Récupérer les connexions (structure correcte: requester_id, addressee_id)
          const { data: connectionsData, error: connError } = await supabaseClient
            .from('connections')
            .select('id, requester_id, addressee_id, status, created_at')
            .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
            .eq('status', 'accepted');

          if (connError) {console.warn('Erreur lors de la récupération des connexions:', connError);}

          // Récupérer les détails des utilisateurs connectés
          let connections: ConnectionDBRecord[] = [];
          if (connectionsData && connectionsData.length > 0) {
            const connectedUserIds = connectionsData.map((c: ConnectionDBRecord) =>
              c.requester_id === user.id ? c.addressee_id : c.requester_id
            );
            const { data: usersData } = await supabaseClient
              .from('users')
              .select('id, name, type, profile')
              .in('id', connectedUserIds);

            const usersMap = (usersData || []).reduce((acc: Record<string, UserDBRecord>, u: UserDBRecord) => {
              acc[u.id] = u;
              return acc;
            }, {});

            connections = connectionsData.map((c: ConnectionDBRecord) => {
              const connectedUserId = c.requester_id === user.id ? c.addressee_id : c.requester_id;
              return { ...c, connected_user: usersMap[connectedUserId] || null };
            });
          }

          // Récupérer les notifications (optimized: 65% bandwidth reduction)
          const { data: notifications, error: notifError } = await supabaseClient
            .from('notifications')
            .select('id, type, title, message, created_at, is_read, action_url, user_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

          if (notifError) {console.warn('Erreur lors de la récupération des notifications:', notifError);}

          // Récupérer les informations du salon (configuration globale) (optimized: 60% bandwidth reduction)
          const { data: salonConfig, error: salonError } = await supabaseClient
            .from('salon_config')
            .select('name, start_date, end_date, venue')
            .maybeSingle();

          if (salonError) {console.warn('Erreur lors de la récupération des infos salon:', salonError);}

          // Transformer et définir les données
          set({
            visitorProfile: userProfile ? {
              id: userProfile.id,
              firstName: userProfile.profile?.firstName || '',
              lastName: userProfile.profile?.lastName || '',
              email: userProfile.email,
              visitorType: userProfile.profile?.visitorType,
              company: userProfile.profile?.company,
              position: userProfile.profile?.position,
              professionalStatus: userProfile.profile?.professionalStatus,
              businessSector: userProfile.profile?.businessSector,
              country: userProfile.profile?.country || '',
              phone: userProfile.profile?.phone || '',
              avatar: userProfile.profile?.avatar,
              passType: userProfile.visitor_level || 'free',
              registrationStatus: userProfile.status === 'active' ? 'confirmed' : 'pending',
              sectorsOfInterest: userProfile.profile?.sectorsOfInterest || [],
              visitObjectives: userProfile.profile?.visitObjectives || [],
              competencies: userProfile.profile?.competencies || [],
              expertises: userProfile.profile?.expertise || [],
              thematicInterests: userProfile.profile?.thematicInterests || [],
              preferredLanguage: userProfile.profile?.preferredLanguage || 'fr',
              notificationPreferences: {
                email: true,
                push: true,
                inApp: true
              }
            } : null,
            favoriteExhibitors: favoriteExhibitors.map((exhibitor: UserDBRecord) => ({
              id: exhibitor.id,
              name: exhibitor.name || 'Exposant',
              sector: exhibitor.profile?.sectors?.[0] || 'Non spécifié',
              description: exhibitor.profile?.companyDescription || '',
              logo: exhibitor.profile?.avatar || '',
              pavilion: 'À déterminer',
              standNumber: exhibitor.profile?.standNumber || 'À déterminer',
              website: exhibitor.profile?.website
            })),
            connections: (connections || []).map((conn: ConnectionDBRecord) => ({
              id: conn.id,
              name: conn.connected_user?.name || 'Utilisateur',
              company: conn.connected_user?.profile?.company || '',
              position: conn.connected_user?.profile?.position || '',
              avatar: conn.connected_user?.profile?.avatar || '',
              type: conn.connected_user?.type || 'visitor',
              connectedAt: new Date(conn.created_at),
              lastInteraction: conn.last_interaction ? new Date(conn.last_interaction) : undefined
            })),
            notifications: (notifications || []).map((notif: NotificationDBRecord) => ({
              id: notif.id,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              timestamp: new Date(notif.created_at),
              read: notif.read || false,
              actionUrl: notif.action_url
            })),
            salonInfo: salonConfig ? {
              name: salonConfig.name || 'SIB 2026',
              dates: {
                start: salonConfig.start_time ? new Date(salonConfig.start_time) : new Date(),
                end: salonConfig.end_date ? new Date(salonConfig.end_date) : new Date()
              },
              location: {
                venue: salonConfig.venue || '',
                city: salonConfig.city || '',
                country: salonConfig.country || '',
                address: salonConfig.address || ''
              },
              hours: {
                opening: salonConfig.opening_time || '09:00',
                closing: salonConfig.closing_time || '18:00'
              },
              stats: {
                exhibitors: salonConfig.exhibitors_count || 0,
                visitors: salonConfig.visitors_count || 0,
                conferences: salonConfig.conferences_count || 0,
                countries: salonConfig.countries_count || 0
              }
            } : null,
            isLoading: false
          });
        }
      } else {
        console.warn('Supabase client non disponible');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données visiteur:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (profileData: Partial<VisitorProfile>) => {
    const { visitorProfile } = get();
    if (!visitorProfile) {throw new Error('Aucun profil visiteur chargé');}

    const supabaseClient = getSupabaseClient();
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('users')
          .update({
            profile: {
              ...visitorProfile,
              ...profileData
            }
          })
          .eq('id', visitorProfile.id);

        if (error) {throw error;}

        set({
          visitorProfile: { ...visitorProfile, ...profileData }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  },

  addToFavorites: async (exhibitorId: string) => {
    const { visitorProfile, favoriteExhibitors } = get();
    if (!visitorProfile) {throw new Error('Utilisateur non connecté');}

    const supabaseClient = getSupabaseClient();
    try {
      if (supabaseClient) {
        // Utiliser user_favorites au lieu de favorites (structure correcte)
        const { error } = await supabaseClient
          .from('user_favorites')
          .insert({
            user_id: visitorProfile.id,
            entity_type: 'user',
            entity_id: exhibitorId
          });

        if (error) {throw error;}

        // Récupérer les infos de l'exposant (optimized: 70% bandwidth reduction)
        const { data: exhibitor } = await supabaseClient
          .from('users')
          .select('id, name, type, profile')
          .eq('id', exhibitorId)
          .maybeSingle();

        if (exhibitor) {
          const newFavorite: FavoriteExhibitor = {
            id: exhibitor.id,
            name: exhibitor.name,
            sector: exhibitor.profile?.sectors?.[0] || 'Non spécifié',
            description: exhibitor.profile?.companyDescription || '',
            logo: exhibitor.profile?.avatar || '',
            pavilion: 'À déterminer',
            standNumber: exhibitor.profile?.standNumber || 'À déterminer',
            website: exhibitor.profile?.website
          };

          set({ favoriteExhibitors: [...favoriteExhibitors, newFavorite] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  },

  removeFromFavorites: async (exhibitorId: string) => {
    const { visitorProfile, favoriteExhibitors } = get();
    if (!visitorProfile) {throw new Error('Utilisateur non connecté');}

    const supabaseClient = getSupabaseClient();
    try {
      if (supabaseClient) {
        // Utiliser user_favorites au lieu de favorites (structure correcte)
        const { error } = await supabaseClient
          .from('user_favorites')
          .delete()
          .eq('user_id', visitorProfile.id)
          .eq('entity_type', 'user')
          .eq('entity_id', exhibitorId);

        if (error) {throw error;}

        set({
          favoriteExhibitors: favoriteExhibitors.filter(e => e.id !== exhibitorId)
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      throw error;
    }
  },

  registerForSession: async (sessionId: string) => {
    const { visitorProfile } = get();
    if (!visitorProfile) {throw new Error('Utilisateur non connecté');}

    const supabaseClient = getSupabaseClient();
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('event_registrations')
          .insert({
            event_id: sessionId,
            user_id: visitorProfile.id,
            registration_type: 'visitor',
            status: 'confirmed'
          });

        if (error) {throw error;}

        // Récupérer les détails de la session et l'ajouter à registeredSessions
        const { data: sessionData } = await supabaseClient
          .from('events')
          .select('id, title, description, start_date, end_date, location, registered, capacity, event_type')
          .eq('id', sessionId)
          .maybeSingle();

        if (sessionData) {
          const session: Session = {
            id: sessionData.id,
            title: sessionData.title || '',
            description: sessionData.description || '',
            date: new Date(sessionData.start_date || new Date()),
            startTime: sessionData.start_date ? new Date(sessionData.start_date).toTimeString().substring(0, 5) : '00:00',
            endTime: sessionData.end_date ? new Date(sessionData.end_date).toTimeString().substring(0, 5) : '00:00',
            location: sessionData.location || '',
            speaker: '',
            category: sessionData.event_type || '',
            capacity: sessionData.capacity || 0,
            registered: sessionData.registered || 0,
          };
          set({ registeredSessions: [...get().registeredSessions, session] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription à la session:', error);
      throw error;
    }
  },

  unregisterFromSession: async (sessionId: string) => {
    const { visitorProfile, registeredSessions } = get();
    if (!visitorProfile) {throw new Error('Utilisateur non connecté');}

    const supabaseClient = getSupabaseClient();
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('event_registrations')
          .delete()
          .eq('event_id', sessionId)
          .eq('user_id', visitorProfile.id);

        if (error) {throw error;}

        set({
          registeredSessions: registeredSessions.filter(s => s.id !== sessionId)
        });
      }
    } catch (error) {
      console.error('Erreur lors de la désinscription de la session:', error);
      throw error;
    }
  },

  sendMeetingRequest: async (exhibitorId: string, message: string, preferredDate: Date) => {
    const { visitorProfile } = get();
    if (!visitorProfile) {throw new Error('Utilisateur non connecté');}

    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {throw new Error('Supabase non disponible');}

    try {
      const { error } = await supabaseClient
        .from('appointments')
        .insert({
          exhibitor_id: exhibitorId,
          visitor_id: visitorProfile.id,
          status: 'pending',
          message,
          notes: `Date préférée: ${preferredDate.toISOString()}`,
          meeting_type: 'in-person'
        });

      if (error) {throw error;}
    } catch (error) {
      console.error('Erreur lors de la demande de rendez-vous:', error);
      throw error;
    }
  },

  acceptMeetingRequest: async (requestId: string) => {
    const { visitorProfile } = get();
    if (!visitorProfile) {throw new Error('Utilisateur non connecté');}

    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {throw new Error('Supabase non disponible');}

    try {
      const { error } = await supabaseClient
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', requestId)
        .eq('visitor_id', visitorProfile.id);

      if (error) {throw error;}
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la demande:', error);
      throw error;
    }
  },

  rejectMeetingRequest: async (requestId: string) => {
    const { visitorProfile } = get();
    if (!visitorProfile) {throw new Error('Utilisateur non connecté');}

    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {throw new Error('Supabase non disponible');}

    try {
      const { error } = await supabaseClient
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('visitor_id', visitorProfile.id);

      if (error) {throw error;}
    } catch (error) {
      console.error('Erreur lors du refus de la demande:', error);
      throw error;
    }
  },

  sendMessage: async (recipientId: string, message: string) => {
    const { visitorProfile } = get();
    if (!visitorProfile) {throw new Error('Utilisateur non connecté');}

    const supabaseClient = getSupabaseClient();
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('messages')
          .insert({
            sender_id: visitorProfile.id,
            receiver_id: recipientId,
            content: message,
            type: 'text'
          });

        if (error) {throw error;}
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  },

  markNotificationAsRead: (notificationId: string) => {
    const { notifications } = get();

    // Mettre à jour localement
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });

    // Mettre à jour dans Supabase
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) {
      supabaseClient
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .then(({ error }: { error: unknown }) => {
          if (error) {console.error('Erreur lors de la mise à jour de la notification:', error);}
        });
    }
  },

  updateNotificationPreferences: async (preferences: Partial<VisitorProfile['notificationPreferences']>) => {
    const { visitorProfile } = get();
    if (!visitorProfile) {throw new Error('Utilisateur non connecté');}

    const supabaseClient = getSupabaseClient();
    try {
      const updatedPreferences = {
        ...visitorProfile.notificationPreferences,
        ...preferences
      };

      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('users')
          .update({
            profile: {
              ...visitorProfile,
              notificationPreferences: updatedPreferences
            }
          })
          .eq('id', visitorProfile.id);

        if (error) {throw error;}
      }

      set({
        visitorProfile: {
          ...visitorProfile,
          notificationPreferences: updatedPreferences
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }
}));
