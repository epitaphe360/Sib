/**
 * Données de démonstration pour les créneaux horaires du salon SIB 2026
 * Ces créneaux sont pré-configurés pour les 3 jours du salon (1-3 avril 2026)
 */

import { TimeSlot } from '../types';

/**
 * Génère un ID unique pour les créneaux de démonstration
 */
const generateSlotId = (prefix: string, index: number): string => {
  return `demo-slot-${prefix}-${index}-${Date.now()}`;
};

/**
 * Créneaux de démonstration pour les partenaires
 * Ces créneaux couvrent les 3 jours du salon avec différents types de rendez-vous
 */
export const DEMO_TIME_SLOTS: Omit<TimeSlot, 'id'>[] = [
  // === JOUR 1: 1er Avril 2026 ===
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 1), // 1er avril 2026
    startTime: '09:00',
    endTime: '09:30',
    duration: 30,
    type: 'in-person',
    maxBookings: 2,
    currentBookings: 0,
    available: true,
    location: 'Stand A-12'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 1),
    startTime: '09:30',
    endTime: '10:00',
    duration: 30,
    type: 'in-person',
    maxBookings: 2,
    currentBookings: 0,
    available: true,
    location: 'Stand A-12'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 1),
    startTime: '10:00',
    endTime: '10:30',
    duration: 30,
    type: 'virtual',
    maxBookings: 5,
    currentBookings: 1,
    available: true,
    location: 'Visioconférence Zoom'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 1),
    startTime: '11:00',
    endTime: '12:00',
    duration: 60,
    type: 'hybrid',
    maxBookings: 10,
    currentBookings: 3,
    available: true,
    location: 'Salle de conférence B + Streaming'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 1),
    startTime: '14:00',
    endTime: '14:30',
    duration: 30,
    type: 'in-person',
    maxBookings: 1,
    currentBookings: 0,
    available: true,
    location: 'Stand A-12'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 1),
    startTime: '15:00',
    endTime: '16:00',
    duration: 60,
    type: 'virtual',
    maxBookings: 15,
    currentBookings: 5,
    available: true,
    location: 'Webinaire - Innovations Portuaires'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 1),
    startTime: '16:30',
    endTime: '17:00',
    duration: 30,
    type: 'in-person',
    maxBookings: 2,
    currentBookings: 2,
    available: false,
    location: 'Stand A-12'
  },

  // === JOUR 2: 2 Avril 2026 ===
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 2), // 2 avril 2026
    startTime: '09:00',
    endTime: '09:45',
    duration: 45,
    type: 'in-person',
    maxBookings: 3,
    currentBookings: 1,
    available: true,
    location: 'Stand A-12'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 2),
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    type: 'hybrid',
    maxBookings: 8,
    currentBookings: 2,
    available: true,
    location: 'Espace Networking + Visio'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 2),
    startTime: '11:30',
    endTime: '12:00',
    duration: 30,
    type: 'virtual',
    maxBookings: 20,
    currentBookings: 8,
    available: true,
    location: 'Démo produit en ligne'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 2),
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    type: 'in-person',
    maxBookings: 5,
    currentBookings: 0,
    available: true,
    location: 'Salle de réunion VIP'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 2),
    startTime: '15:30',
    endTime: '16:00',
    duration: 30,
    type: 'in-person',
    maxBookings: 2,
    currentBookings: 1,
    available: true,
    location: 'Stand A-12'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 2),
    startTime: '16:30',
    endTime: '17:30',
    duration: 60,
    type: 'hybrid',
    maxBookings: 12,
    currentBookings: 4,
    available: true,
    location: 'Table ronde - Digitalisation des Ports'
  },

  // === JOUR 3: 3 Avril 2026 ===
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 3), // 3 avril 2026
    startTime: '09:00',
    endTime: '09:30',
    duration: 30,
    type: 'in-person',
    maxBookings: 2,
    currentBookings: 0,
    available: true,
    location: 'Stand A-12'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 3),
    startTime: '09:30',
    endTime: '10:30',
    duration: 60,
    type: 'virtual',
    maxBookings: 25,
    currentBookings: 10,
    available: true,
    location: 'Conférence finale - Bilan SIB'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 3),
    startTime: '11:00',
    endTime: '11:30',
    duration: 30,
    type: 'in-person',
    maxBookings: 3,
    currentBookings: 1,
    available: true,
    location: 'Stand A-12'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 3),
    startTime: '11:30',
    endTime: '12:00',
    duration: 30,
    type: 'in-person',
    maxBookings: 2,
    currentBookings: 0,
    available: true,
    location: 'Stand A-12'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 3),
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    type: 'hybrid',
    maxBookings: 15,
    currentBookings: 6,
    available: true,
    location: 'Session de clôture + Streaming'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 3),
    startTime: '15:30',
    endTime: '16:00',
    duration: 30,
    type: 'in-person',
    maxBookings: 4,
    currentBookings: 2,
    available: true,
    location: 'Networking de clôture'
  },
  {
    exhibitorId: 'demo-partner-1',
    date: new Date(2026, 3, 3),
    startTime: '16:00',
    endTime: '17:00',
    duration: 60,
    type: 'in-person',
    maxBookings: 10,
    currentBookings: 3,
    available: true,
    location: 'Cocktail de clôture - Espace VIP'
  }
];

/**
 * Génère les créneaux avec des IDs uniques
 */
export const generateDemoTimeSlots = (): TimeSlot[] => {
  return DEMO_TIME_SLOTS.map((slot, index) => ({
    ...slot,
    id: generateSlotId('partner', index)
  }));
};

/**
 * Statistiques des créneaux de démonstration
 */
export const getDemoSlotsStats = () => {
  const slots = DEMO_TIME_SLOTS;
  const totalSlots = slots.length;
  const availableSlots = slots.filter(s => s.available).length;
  const totalCapacity = slots.reduce((sum, s) => sum + s.maxBookings, 0);
  const currentBookings = slots.reduce((sum, s) => sum + s.currentBookings, 0);

  return {
    totalSlots,
    availableSlots,
    fullSlots: totalSlots - availableSlots,
    totalCapacity,
    currentBookings,
    availableSpots: totalCapacity - currentBookings,
    occupancyRate: Math.round((currentBookings / totalCapacity) * 100)
  };
};
