import { create } from 'zustand';
import { Appointment, TimeSlot } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { supabase as supabaseClient, isSupabaseReady } from '../lib/supabase';
import { generateDemoTimeSlots } from '../config/demoTimeSlots';
import { emailTemplateService } from '../services/emailTemplateService';
import logger from '../utils/logger';
import useAuthStore from './authStore';
import { toast } from 'sonner';

// 🔒 Protection contre les race conditions: Promise singleton pour booking
let bookingPromise: Promise<void> | null = null;

// Helper pour vérifier si Supabase est configuré
const getSupabaseClient = () => {
  if (!isSupabaseReady()) {
    return null;
  }
  return supabaseClient;
};

/**
 * Envoie des notifications email et push pour un rendez-vous
 */
async function sendAppointmentNotifications(
  appointment: Appointment,
  type: 'confirmed' | 'cancelled' | 'reminder'
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase not configured, skipping notifications');
      return;
    }

    // Récupérer les informations du visiteur et de l'exposant depuis la table users
    const { data: visitorProfile } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', appointment.visitorId)
      .single();

    const { data: exhibitorProfile } = await supabase
      .from('users')
      .select('email, first_name, last_name, company_name')
      .eq('id', appointment.exhibitorId)
      .single();

    // Si exhibitorId est un exhibitors.id (pas users.id), résoudre via la table exhibitors
    let resolvedExhibitorProfile = exhibitorProfile;
    if (!exhibitorProfile?.email) {
      const { data: exhibitorRow } = await supabase
        .from('exhibitors')
        .select('user_id')
        .eq('id', appointment.exhibitorId)
        .maybeSingle();
      if (exhibitorRow?.user_id) {
        const { data: profileFromExhibitor } = await supabase
          .from('users')
          .select('email, first_name, last_name, company_name')
          .eq('id', exhibitorRow.user_id)
          .single();
        resolvedExhibitorProfile = profileFromExhibitor;
      }
    }

    if (!visitorProfile?.email || !resolvedExhibitorProfile?.email) {
      console.warn('Missing email addresses for notification');
      return;
    }

    // Formater la date et l'heure
    const appointmentDate = new Date(appointment.startTime);
    const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Préparer les données pour le template
    const emailData = {
      firstName: visitorProfile.first_name || 'Visiteur',
      exhibitorName: resolvedExhibitorProfile.company_name || `${resolvedExhibitorProfile.first_name} ${resolvedExhibitorProfile.last_name}`,
      date: formattedDate,
      time: formattedTime,
      location: appointment.location || 'À déterminer',
      type: appointment.type || 'in-person' as 'in-person' | 'virtual' | 'hybrid',
    };

    // Envoyer email au visiteur
    if (type === 'confirmed') {
      const visitorTemplate = emailTemplateService.generateAppointmentConfirmation(emailData);
      await emailTemplateService.sendEmail(visitorProfile.email, visitorTemplate);
    } else if (type === 'cancelled') {
      // Pour l'annulation, créer un template simple
      const cancelTemplate = {
        subject: 'Annulation de rendez-vous - SIB 2026',
        html: `
          <p>Bonjour ${emailData.firstName},</p>
          <p>Votre rendez-vous avec ${emailData.exhibitorName} prévu le ${emailData.date} à ${emailData.time} a été annulé.</p>
          <p>N'hésitez pas à prendre un nouveau rendez-vous si nécessaire.</p>
          <p>Cordialement,<br>L'équipe SIB 2026</p>
        `,
        text: `Bonjour ${emailData.firstName}, Votre rendez-vous avec ${emailData.exhibitorName} prévu le ${emailData.date} à ${emailData.time} a été annulé.`
      };
      await emailTemplateService.sendEmail(visitorProfile.email, cancelTemplate);
    }

    // Envoyer une notification push si disponible
    try {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: appointment.visitorId,
          title: type === 'confirmed' ? 'Rendez-vous confirmé' : 'Rendez-vous annulé',
          body: `${emailData.exhibitorName} - ${emailData.date} à ${emailData.time}`,
          data: {
            appointmentId: appointment.id,
            type,
          },
        },
      });
    } catch (pushError) {
      // Push notifications sont optionnelles, ne pas faire échouer si indisponibles
      console.warn('Push notification failed:', pushError);
    }
  } catch (error) {
    console.error('Failed to send appointment notifications:', error);
    // Ne pas faire échouer l'opération principale si les notifications échouent
  }
}

interface AppointmentState {
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  isLoading: boolean;
  isBooking: boolean; // Prevent concurrent booking requests

  // Actions
  fetchAppointments: () => Promise<void>;
  fetchTimeSlots: (exhibitorId: string) => Promise<void>;
  bookAppointment: (timeSlotId: string, message?: string) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => Promise<void>;
  createTimeSlot: (slot: Omit<TimeSlot, 'id'>) => Promise<void>;
  updateTimeSlot: (slotId: string, updates: Partial<TimeSlot>) => Promise<void>;
  deleteTimeSlot: (slotId: string) => Promise<void>;
  // Utilitaires de test/dev
  confirmAppointmentsForVisitor: (visitorId: string) => Promise<{ success: string[]; failed: { id: string; error: string }[] }>;
  clearMockAppointments: () => Promise<void>;
}

// Fonctions utilitaires pour la synchronisation avec les mini-sites
/**
 * Synchronise la disponibilité des créneaux avec le mini-site de l'exposant
 * Met à jour le widget de disponibilité en temps réel
 */
async function syncWithMiniSite(slot: TimeSlot, availableCount: number): Promise<void> {
  try {
    // 1. Récupérer le mini-site de l'exposant
    const miniSite = await SupabaseService.getMiniSite(slot.exhibitorId);
    if (!miniSite) {
      return;
    }

    // 2. Mettre à jour les métadonnées du mini-site avec les disponibilités
    const updatedData = {
      ...miniSite,
      availability_widget: {
        total_slots: availableCount,
        next_available_date: slot.date ? new Date(slot.date).toISOString() : new Date().toISOString(),
        last_updated: new Date().toISOString(),
        slot_types: {
          'in-person': availableCount > 0,
          'virtual': slot.type === 'virtual',
          'hybrid': slot.type === 'hybrid'
        }
      }
    };

    await SupabaseService.updateMiniSite(slot.exhibitorId, updatedData);


    // 3. Optionnel: Publier sur canal temps réel Supabase
    // Pour une implémentation complète, on pourrait utiliser Supabase Realtime
    // const channel = supabase.channel(`mini-site-${slot.userId}`);
    // await channel.send({
    //   type: 'broadcast',
    //   event: 'availability-updated',
    //   payload: { availableCount, slotId: slot.id }
    // });

  } catch (error) {
    console.error('❌ Erreur sync mini-site:', error);
    // Ne pas bloquer le flux principal si la sync échoue
  }
}

/**
 * Notifie les visiteurs intéressés par un exposant lorsqu'un nouveau créneau est ajouté
 * Envoie des notifications in-app et emails selon les préférences utilisateur
 */
async function notifyInterestedVisitors(slot: TimeSlot): Promise<void> {
  try {
    // Get the user_id from the exhibitor relation if available
    const exhibitorUserId = slot.exhibitor?.userId;
    if (!exhibitorUserId) {
      return;
    }

    // 1. Récupérer les visiteurs qui ont marqué cet exposant comme favori
    // ou qui ont interagi avec lui (visites de mini-site, messages, etc.)
    const interestedVisitors = await SupabaseService.getInterestedVisitors?.(exhibitorUserId) || [];

    if (interestedVisitors.length === 0) {
      return;
    }


    // 2. Filtrer selon les préférences de notification
    const notifiableVisitors = interestedVisitors.filter((v: any) =>
      v.notificationPreferences?.newTimeSlots !== false  // Actif par défaut
    );

    // 3. Créer les notifications in-app
    const notificationPromises = notifiableVisitors.map(async (visitor: any) => {
      try {
        // ⚡ FIX: Paralléliser notification in-app et email au lieu de séquentiel
        const promises: Promise<any>[] = [];

        // Créer notification in-app (signature correcte: userId, message, type)
        promises.push(
          SupabaseService.createNotification?.(
            visitor.id,
            `Un nouveau créneau est disponible le ${new Date(slot.date).toLocaleDateString('fr-FR')} à ${slot.startTime}`,
            'event'
          ) as Promise<any>
        );

        // 4. Envoyer email si préférence activée
        if (visitor.notificationPreferences?.emailNotifications) {
          promises.push(
            SupabaseService.sendNotificationEmail?.({
              to: visitor.email,
              template: 'new-timeslot-notification',
              data: {
                visitorName: visitor.name,
                slotDate: new Date(slot.date).toLocaleDateString('fr-FR'),
                slotTime: slot.startTime,
                slotType: slot.type === 'virtual' ? 'Virtuel' :
                          slot.type === 'hybrid' ? 'Hybride' : 'Présentiel',
                exhibitorName: slot.exhibitor?.companyName || 'l\'exposant',
                bookingUrl: `${window.location.origin}/appointments?exhibitor=${slot.exhibitorId}`
              }
            })
          );
        }

        // Attendre les deux en parallèle
        await Promise.all(promises);

        return { success: true, visitorId: visitor.id };
      } catch (error) {
        console.error(`❌ Erreur notification visiteur ${visitor.id}:`, error);
        return { success: false, visitorId: visitor.id, error };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;


  } catch (error) {
    console.error('❌ Erreur notification visiteurs:', error);
    // Ne pas bloquer le flux principal si les notifications échouent
  }
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  timeSlots: [],
  isLoading: false,
  isBooking: false,

  fetchAppointments: async () => {
    set({ isLoading: true });
    try {
      // Essayer de récupérer depuis Supabase via SupabaseService
      if (SupabaseService && typeof SupabaseService.getAppointments === 'function') {
        const appointments = await SupabaseService.getAppointments();
        set({ appointments: appointments || [], isLoading: false });
        return;
      }

      // Fallback: si SupabaseService n'est pas disponible, utiliser supabaseClient directement
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('appointments')
          .select(`
            *,
            exhibitor:users!appointments_exhibitor_id_fkey(id, name, profile),
            visitor:users!appointments_visitor_id_fkey(id, name, profile)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transformer les données pour correspondre à l'interface Appointment
        const transformedAppointments = (data || []).map((apt: any) => ({
          id: apt.id,
          exhibitorId: apt.exhibitor_id,
          exhibitorUserId: apt.exhibitor_id,
          visitorId: apt.visitor_id,
          timeSlotId: apt.time_slot_id,
          status: apt.status,
          message: apt.message,
          notes: apt.notes,
          rating: apt.rating,
          createdAt: new Date(apt.created_at),
          meetingType: apt.meeting_type || 'in-person',
          meetingLink: apt.meeting_link,
          exhibitor: apt.exhibitor ? {
            id: apt.exhibitor.id,
            name: apt.exhibitor.name,
            companyName: apt.exhibitor.profile?.company || apt.exhibitor.profile?.companyName,
            avatar: apt.exhibitor.profile?.avatar
          } : undefined,
          visitor: apt.visitor ? {
            id: apt.visitor.id,
            name: apt.visitor.name,
            avatar: apt.visitor.profile?.avatar
          } : undefined
        }));

        set({ appointments: transformedAppointments, isLoading: false });
        return;
      }

      // Si aucune méthode n'est disponible, retourner un tableau vide
      console.warn('Aucune méthode de récupération des rendez-vous disponible');
      set({ appointments: [], isLoading: false });
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      set({ isLoading: false, appointments: [] });
      throw error;
    }
  },

  // Fetch time slots for a specific exhibitor (userId)
  fetchTimeSlots: async (exhibitorId: string) => {
    // Validation: exhibitorId must be a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!exhibitorId || !uuidRegex.test(exhibitorId)) {
      console.warn('[APPOINTMENT] Invalid exhibitorId format:', exhibitorId);
      set({ timeSlots: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      // If SupabaseService is available and supabase is configured, use it
      if (SupabaseService && typeof SupabaseService.getTimeSlotsByUser === 'function') {
        const slots = await SupabaseService.getTimeSlotsByUser(exhibitorId);
        
        set({ timeSlots: slots || [], isLoading: false });
        return;
      }

      // Fallback: utiliser supabaseClient directement
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('time_slots')
          .select(`
            *,
            exhibitor:exhibitors!exhibitor_id(
              id,
              user_id,
              company_name
            )
          `)
          .eq('exhibitor_id', exhibitorId)
          .order('slot_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) throw error;

        // Transformer les données pour correspondre à l'interface TimeSlot
        const transformedSlots = (data || []).map((slot: any) => ({
          id: slot.id,
          exhibitorId: slot.exhibitor_id,
          date: slot.slot_date ? new Date(slot.slot_date) : new Date(),
          startTime: slot.start_time,
          endTime: slot.end_time,
          duration: slot.duration,
          type: slot.type || 'in-person',
          maxBookings: slot.max_bookings || 1,
          currentBookings: slot.current_bookings || 0,
          available: (slot.current_bookings || 0) < (slot.max_bookings || 1),
          location: slot.location,
          exhibitor: slot.exhibitor ? {
            id: slot.exhibitor.id,
            userId: slot.exhibitor.user_id,
            companyName: slot.exhibitor.company_name
          } : undefined
        }));

        set({ timeSlots: transformedSlots, isLoading: false });
        return;
      }

      // Si aucune méthode n'est disponible, charger les données de démonstration
      console.warn('Aucune méthode de récupération des créneaux disponible - Chargement des données de démo');
      const demoSlots = generateDemoTimeSlots();
      set({ timeSlots: demoSlots, isLoading: false });
    } catch (err) {
      console.error('Erreur lors de la récupération des créneaux:', err);
      // En cas d'erreur, charger les données de démonstration avec avertissement
      console.warn('⚠️ Fallback vers données de démo suite à une erreur réseau');
      const demoSlots = generateDemoTimeSlots();
      set({ timeSlots: demoSlots, isLoading: false });
    }
  },

  bookAppointment: async (timeSlotId, message) => {
    console.log('🔴🔴🔴 bookAppointment CALLED 🔴🔴🔴', { timeSlotId, message });
    
    // 🔒 PROTECTION ATOMIQUE contre les race conditions
    // Utilisation d'une Promise singleton pour garantir qu'un seul booking est en cours
    if (bookingPromise) {
      console.log('⚠️ Booking already in progress, blocking');
      logger.warn('Tentative de booking concurrent détectée et bloquée');
      throw new Error('Une réservation est déjà en cours. Veuillez patienter.');
    }

    console.log('✅ No concurrent booking, proceeding...');

    // Créer la Promise singleton
    bookingPromise = (async () => {
      console.log('📦 Inside bookingPromise IIFE');
      const { appointments, timeSlots } = get();
      console.log('📊 Current state:', { appointmentsCount: appointments.length, timeSlotsCount: timeSlots.length });
      set({ isBooking: true });

    try {
      console.log('🔑 Getting user from authStore...');
      // Récupérer l'utilisateur connecté directement du store
      const resolvedUser = useAuthStore.getState().user;
      console.log('👤 Resolved user:', resolvedUser?.id, resolvedUser?.email);

      // CRITICAL: User must be authenticated
      if (!resolvedUser?.id) {
        console.log('❌ User not authenticated!');
        logger.error('User not authenticated during appointment booking', { user: resolvedUser });
        throw new Error('Vous devez être connecté pour réserver un rendez-vous.');
      }

      const visitorId = resolvedUser.id;
      console.log('✅ User authenticated:', visitorId);
      logger.info('[appointmentStore] User authenticated for booking', { visitorId });

      // 🔐 SÉCURITÉ: Vérification de quota côté serveur (protection contre bypass côté client)
      // La vérification sera faite dans la fonction RPC book_appointment_atomic
      const supabase = supabaseClient;
      console.log('🔌 Supabase client ready:', !!supabase);

      // OPTIMISATION: On saute la vérification RPC préalable pour éviter les faux positifs dues aux caches ou logiques divergentes.
      // On laisse book_appointment_atomic faire l'autorité finale.
      /*
      const { data: quotaData, error: quotaError } = await supabase.rpc('check_b2b_quota_available', {
        p_user_id: visitorId
      });

      if (quotaError) {
        throw new Error('Erreur lors de la vérification du quota');
      }

      if (!quotaData?.available) {
        const quotaInfo = quotaData as any;
        if (quotaInfo.quota === 0) {
          throw new Error(
            'Accès restreint : votre Pass Gratuit ne permet pas de prendre de rendez-vous B2B. ' +
            'Passez au Pass Premium VIP pour débloquer les RDV B2B !'
          );
        } else if (quotaInfo.quota !== 999999) {
          throw new Error(
            `Quota atteint : vous avez déjà ${quotaInfo.used}/${quotaInfo.quota} RDV B2B confirmés.`
          );
        }
      }
      */

      // Prevent duplicate booking of the same time slot by the same visitor (UX seulement)
      console.log('🔍 Checking for duplicate bookings...');
      if (appointments.some(a => a.visitorId === visitorId && a.timeSlotId === timeSlotId)) {
        console.log('❌ Duplicate booking detected!');
        throw new Error('Vous avez déjà réservé ce créneau');
      }
      console.log('✅ No duplicate booking');

    // CRITICAL: Validate time slot ownership
    console.log('🔍 Looking for slot in timeSlots array:', timeSlotId);
    console.log('📋 Available slots:', timeSlots.map(s => ({ id: s.id, exhibitorId: s.exhibitorId })));
    const slot = timeSlots.find(s => s.id === timeSlotId);

    if (!slot) {
      console.log('❌ Slot NOT found in timeSlots!');
      throw new Error('Créneau non trouvé. Veuillez actualiser la page.');
    }
    console.log('✅ Slot found:', slot);

    const exhibitorIdForSlot = slot.exhibitorId;
    console.log('🏢 ExhibitorId for slot:', exhibitorIdForSlot);

    if (!exhibitorIdForSlot) {
      console.log('❌ Slot has no exhibitorId!');
      // Time slot exists but has no owner - data integrity violation
      throw new Error('Ce créneau n\'a pas de propriétaire valide. Veuillez contacter le support.');
    }
    console.log('✅ ExhibitorId is valid');

    // NOUVELLE RÈGLE: Vérifier qu'on n'a pas déjà un RDV avec cet exposant/partenaire
    console.log('🔍 Checking if user already has appointment with this exhibitor...');
    const hasExistingAppointment = appointments.some(
      a => a.visitorId === visitorId && a.exhibitorId === exhibitorIdForSlot && a.status !== 'cancelled'
    );
    if (hasExistingAppointment) {
      console.log('❌ User already has appointment with this exhibitor!');
      throw new Error('Vous avez déjà un rendez-vous avec cet exposant/partenaire');
    }
    console.log('✅ No existing appointment with this exhibitor');

    // VALIDATION TEMPORELLE: Vérifier que le créneau est valide
    const slotDate = slot.date ? new Date(slot.date) : null;
    const now = new Date();
    const salonStart = new Date('2026-11-25T00:00:00');
    const salonEnd = new Date('2026-11-29T23:59:59');

    if (!slotDate) {
      console.log('❌ Slot has no date!');
      throw new Error('Ce créneau n\'a pas de date valide');
    }

    if (slotDate < now) {
      console.log('❌ Slot is in the past!');
      throw new Error('Ce créneau est dans le passé. Veuillez choisir un créneau futur.');
    }

    if (slotDate < salonStart || slotDate > salonEnd) {
      console.log('❌ Slot is outside salon dates!');
      throw new Error('Ce créneau est en dehors des dates du salon (25-29 Novembre 2026)');
    }
    console.log('✅ Slot date is valid');

    // Additional validation: Verify slot is not already fully booked
    console.log('🔍 Checking availability:', { available: slot.available, currentBookings: slot.currentBookings, maxBookings: slot.maxBookings });
    if (!slot.available || (slot.currentBookings || 0) >= (slot.maxBookings || 1)) {
      console.log('❌ Slot is full!');
      throw new Error('Ce créneau est complet. Veuillez en choisir un autre.');
    }
    console.log('✅ Slot is available');

    // ATOMIC BOOKING: Use RPC function with row-level locking
    // This prevents ALL race conditions and overbooking
    // Note: supabase already imported at line 438
    console.log('🚀 Calling book_appointment_atomic RPC...', { timeSlotId, visitorId, exhibitorIdForSlot });
    logger.info('[appointmentStore] Calling book_appointment_atomic RPC', { timeSlotId, visitorId, exhibitorIdForSlot });

    // Signature from 20251224 migration: (p_time_slot_id, p_visitor_id, p_exhibitor_id, p_notes, p_meeting_type)
    const { data, error } = await supabase.rpc('book_appointment_atomic', {
      p_time_slot_id: timeSlotId,
      p_visitor_id: visitorId,
      p_exhibitor_id: exhibitorIdForSlot,
      p_notes: message || null,
      p_meeting_type: 'in-person'
    });

    console.log('📩 RPC Response:', { data, error });
    logger.info('[appointmentStore] RPC response', { data, error });

    if (error) {
      console.log('❌ RPC Error:', error);
      logger.error('[appointmentStore] RPC error', { error });
      throw new Error(error.message || 'Erreur lors de la réservation');
    }

    // The function returns a JSONB object
    const result = data;
    console.log('📊 RPC Result:', result);
    
    if (!result || !result.success) {
      console.log('❌ Booking failed:', result);
      logger.error('[appointmentStore] Booking failed', { result });
      throw new Error(result?.error || result?.error_message || 'Erreur lors de la réservation');
    }
    console.log('✅✅✅ BOOKING SUCCESS! ✅✅✅');

    logger.info('[appointmentStore] Booking successful', { appointmentId: result.appointment_id });

    // Success! Update local state with server data
    // STATUS: 'pending' - Le RDV est en attente de confirmation par l'exposant/partenaire
    const newAppointment: Appointment = {
      id: result.appointment_id,
      exhibitorId: exhibitorIdForSlot,
      visitorId,
      timeSlotId,
      status: 'pending', // En attente de confirmation par l'exposant/partenaire
      message,
      createdAt: new Date(),
      meetingType: 'in-person'
    };

    // Update time slot with server data (le RPC ne retourne pas ces données, on incrémente localement)
    const updatedSlots = timeSlots.map(s => s.id === timeSlotId ? {
      ...s,
      currentBookings: (s.currentBookings || 0) + 1,
      available: ((s.currentBookings || 0) + 1) < (s.maxBookings || 1)
    } : s);

    set({
      appointments: [newAppointment, ...appointments],
      timeSlots: updatedSlots
    });

    return newAppointment;
    } finally {
      // 🔒 CRITICAL: Reset isBooking ET bookingPromise pour permettre les prochains bookings
      set({ isBooking: false });
      bookingPromise = null;
    }
    })();

    // Retourner la Promise pour que l'appelant puisse attendre
    return bookingPromise;
  },

  cancelAppointment: async (appointmentId) => {
    const { appointments, timeSlots } = get();
    const appointment = appointments.find(a => a.id === appointmentId);

    if (!appointment) return;

    // Get authenticated user directly from store
    const resolvedUser = useAuthStore.getState().user;

    if (!resolvedUser?.id) {
      logger.error('User not authenticated during appointment cancellation', { user: resolvedUser });
      throw new Error('Vous devez être connecté pour annuler un rendez-vous.');
    }

    // ATOMIC CANCEL: Use RPC function with proper slot management
    const supabase = supabaseClient;

    const { data, error } = await supabase.rpc('cancel_appointment_atomic', {
      p_appointment_id: appointmentId,
      p_user_id: resolvedUser.id
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de l\'annulation');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Erreur lors de l\'annulation');
    }

    // Success! Update local state
    const updatedAppointments = appointments.map(a =>
      a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
    );

    // Envoyer notification d'annulation
    try {
      await sendAppointmentNotifications(appointment, 'cancelled');
    } catch (notifError) {
      console.warn('Failed to send cancellation notification:', notifError);
      // Ne pas faire échouer l'annulation si la notification échoue
    }

    // Refresh time slots to get updated counts
    if (appointment.timeSlotId) {
      const affectedSlot = timeSlots.find(s => s.id === appointment.timeSlotId);
      if (affectedSlot?.exhibitorId) {
        try {
          await get().fetchTimeSlots(affectedSlot.exhibitorId);
        } catch {
          // Ignore refresh errors, we already updated the appointment
        }
      }
    }

    set({ appointments: updatedAppointments });
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const { appointments, timeSlots } = get();

    // Pour un statut 'cancelled', utiliser le RPC atomique (comme cancelAppointment)
    if (status === 'cancelled') {
      const resolvedUser = useAuthStore.getState().user;
      if (!resolvedUser?.id) throw new Error('Vous devez être connecté.');
      const supabase = supabaseClient;
      const { data, error } = await supabase.rpc('cancel_appointment_atomic', {
        p_appointment_id: appointmentId,
        p_user_id: resolvedUser.id,
      });
      if (error) throw new Error(error.message || 'Erreur lors de l\'annulation');
      if (!data || !data.success) throw new Error(data?.error || 'Erreur lors de l\'annulation');
      const updatedAppointments = appointments.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a);
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment?.timeSlotId) {
        const affectedSlot = timeSlots.find(s => s.id === appointment.timeSlotId);
        if (affectedSlot?.exhibitorId) {
          try { await get().fetchTimeSlots(affectedSlot.exhibitorId); } catch { /* ignore */ }
        }
      }
      set({ appointments: updatedAppointments });
      return;
    }

    // Persist to Supabase for other statuses
    if (SupabaseService && typeof SupabaseService.updateAppointmentStatus === 'function') {
      try {
        await SupabaseService.updateAppointmentStatus(appointmentId, status as any);

        // Si le statut passe à 'confirmed', envoyer des notifications
        const appointment = appointments.find(a => a.id === appointmentId);
        if (status === 'confirmed' && appointment?.status === 'pending') {
          try {
            // Notification de confirmation
            toast.success('Rendez-vous confirmé !', {
              description: 'Les calendriers ont été mis à jour et les participants notifiés.'
            });

            // Envoyer notification email/push aux participants
            await sendAppointmentNotifications(appointment, 'confirmed');
          } catch (notifError) {
            console.warn('Erreur notification:', notifError);
          }
        }

        // Refresh slots from server for authoritative count
        if (appointment?.timeSlotId) {
          const affectedSlot = timeSlots.find(s => s.id === appointment.timeSlotId);
          if (affectedSlot?.exhibitorId) {
            try {
              await get().fetchTimeSlots(affectedSlot.exhibitorId);
              // Update appointments locally and return
              const updatedAppointments = appointments.map(a => a.id === appointmentId ? { ...a, status } : a);
              set({ appointments: updatedAppointments });
              return;
            } catch {
              // Fall through to local update if refresh fails
            }
          }
        }
      } catch (err) {
        console.warn('Failed to persist appointment status to Supabase', err);
        throw err; // Don't update local state if server update failed
      }
    }

    // Fallback local update
    const updatedAppointments = appointments.map(a => a.id === appointmentId ? { ...a, status } : a);

    // If the status change affects slot counts, recompute for the related slot
    const changed = updatedAppointments.find(a => a.id === appointmentId);
    if (changed) {
      const slotId = changed.timeSlotId;
      const currentCount = updatedAppointments.filter(a => a.timeSlotId === slotId && a.status !== 'cancelled').length;
      const updatedTimeSlots = timeSlots.map(slot =>
        slot.id === slotId ? { ...slot, currentBookings: currentCount, available: currentCount < (slot.maxBookings || 1) } : slot
      );
      set({ appointments: updatedAppointments, timeSlots: updatedTimeSlots });
      return;
    }

    set({ appointments: updatedAppointments });
  },

  createTimeSlot: async (slot) => {
    const { timeSlots } = get();

    // MEDIUM SEVERITY FIX: Add validations before creating time slot
    if (!slot.startTime || !slot.endTime) {
      throw new Error('Les heures de début et de fin sont obligatoires');
    }

    if (!slot.duration || slot.duration <= 0) {
      throw new Error('La durée doit être supérieure à 0 minutes');
    }

    if (!slot.maxBookings || slot.maxBookings <= 0) {
      throw new Error('Le nombre maximum de réservations doit être supérieur à 0');
    }

    const slotExhibitorId = (slot as any).exhibitorId;
    if (!slotExhibitorId || slotExhibitorId === 'unknown') {
      throw new Error('L\'identifiant de l\'exposant est requis pour créer un créneau');
    }

    // Validate start time is before end time
    if (slot.startTime >= slot.endTime) {
      throw new Error('L\'heure de début doit être avant l\'heure de fin');
    }

    // Validate date is not in the past (allow today)
    const slotDate = (slot as any).date;
    if (slotDate) {
      const dateObj = slotDate instanceof Date ? slotDate : new Date(slotDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateObj < today) {
        throw new Error('Impossible de créer un créneau dans le passé');
      }
    }

    // If SupabaseService is available, persist the slot; otherwise create local mock
    try {
      if (SupabaseService && typeof SupabaseService.createTimeSlot === 'function') {
        const created = await SupabaseService.createTimeSlot({
          exhibitorId: slotExhibitorId,
          date: slotDate instanceof Date ? slotDate.toISOString().split('T')[0] : String(slotDate),
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          type: slot.type,
          maxBookings: slot.maxBookings,
          location: slot.location
        });
        set({ timeSlots: [created, ...timeSlots] });
        void syncWithMiniSite(created, get().timeSlots.filter(s => s.available).length);
        void notifyInterestedVisitors(created);
        return;
      }

      const newSlot: TimeSlot = {
        ...slot,
        id: Date.now().toString(),
        exhibitorId: slotExhibitorId
      };
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ timeSlots: [newSlot, ...timeSlots] });
      void syncWithMiniSite(newSlot, get().timeSlots.filter(s => s.available).length);
      void notifyInterestedVisitors(newSlot);
      return;
    } catch (err) {
      console.warn('createTimeSlot error', err);
      // fallback to local
      const newSlot: TimeSlot = {
        ...slot,
        id: Date.now().toString(),
        exhibitorId: slotExhibitorId
      };
      set({ timeSlots: [newSlot, ...timeSlots] });
      void syncWithMiniSite(newSlot, get().timeSlots.filter(s => s.available).length);
      void notifyInterestedVisitors(newSlot);
      return;
    }
  },
  updateTimeSlot: async (slotId, updates) => {
    const { timeSlots } = get();
    // Persister en base de données
    try {
      await SupabaseService.updateTimeSlot(slotId, updates);
    } catch (err) {
      console.error('Erreur updateTimeSlot Supabase:', err);
      // On ne bloque pas - on met à jour localement quand même
    }
    const updatedTimeSlots = timeSlots.map(slot =>
      slot.id === slotId ? { ...slot, ...updates } : slot
    );
    set({ timeSlots: updatedTimeSlots });
  },

  deleteTimeSlot: async (slotId) => {
    // Persister en base de données
    try {
      await SupabaseService.deleteTimeSlot(slotId);
    } catch (err) {
      console.error('Erreur deleteTimeSlot Supabase:', err);
      // On ne bloque pas - on supprime localement quand même
    }
    const { timeSlots } = get();
    const updatedTimeSlots = timeSlots.filter(slot => slot.id !== slotId);
    set({ timeSlots: updatedTimeSlots });
  },
  // Confirmer tous les rendez-vous d'un visiteur (utile pour tests/dev)
  confirmAppointmentsForVisitor: async (visitorId) => {
    const { appointments } = get();
    const toConfirm = appointments.filter(x => x.visitorId === visitorId && x.status !== 'confirmed');
    const success: string[] = [];
    const failed: { id: string; error: string }[] = [];

    const client = getSupabaseClient();
    if (client) {
      for (const a of toConfirm) {
        try {
          const { error } = await client.from('appointments').update({ status: 'confirmed' }).eq('id', a.id);
          if (error) {
            failed.push({ id: a.id, error: error.message || String(error) });
            continue;
          }
          success.push(a.id);
        } catch (err: unknown) {
          failed.push({ id: a.id, error: err?.message || String(err) });
        }
      }

      // Reflect successful updates locally
      if (success.length > 0) {
        const updated = appointments.map(a => success.includes(a.id) ? { ...a, status: 'confirmed' as const } : a);
        set({ appointments: updated });
      }
    } else {
      // Local-only: mark all as confirmed and report as success
      const updated = appointments.map(a => a.visitorId === visitorId ? { ...a, status: 'confirmed' as const } : a);
      set({ appointments: updated });
      toConfirm.forEach(a => success.push(a.id));
    }

    return { success, failed };
  },
  // Nettoyer les rendez-vous mock (supprime ceux créés par le flow dev)
  clearMockAppointments: async () => {
    const { appointments } = get();
    const filtered = appointments.filter(a => !String(a.visitorId).startsWith('visitor-'));
    set({ appointments: filtered });
  }
}));
