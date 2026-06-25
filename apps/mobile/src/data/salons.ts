import type { Salon } from '../types';

export const SALONS: Salon[] = [
  {
    id: 'sib',
    code: 'SIB',
    name: 'SIB 2026',
    description: 'Salon International du Bâtiment — El Jadida',
    dates: '25 nov. – 29 nov. 26',
    location: 'El Jadida',
    active: true,
  },
  {
    id: 'sir',
    code: 'SIR',
    name: 'SIR',
    description: "Salon International de l'Immobilier Résidentiel",
    dates: 'Juin 2026',
    location: 'Casablanca',
  },
  {
    id: 'sip',
    code: 'SIP',
    name: 'SIP',
    description: 'Salon International de la Promotion',
    dates: 'Mars 2027',
    location: 'Rabat',
  },
  {
    id: 'btp',
    code: 'BTP',
    name: 'BTP',
    description: 'Salon International du BTP',
    dates: 'Septembre 2026',
    location: 'Tanger',
  },
  {
    id: 'sie',
    code: 'SIE',
    name: 'SIE',
    description: "Salon International de l'Environnement",
    dates: 'Octobre 2027',
    location: 'Marrakech',
  },
];

/** Salon par défaut quand SIB est ouvert (attribution auto des scans). */
export const DEFAULT_SALON_ID = 'sib';

export const SALON_INFO = {
  name: 'SIB 2026',
  opensAt: '2026-11-25T09:00:00+01:00',
  dates: '25-29 Novembre 2026',
  startDayNote: 'Le 25 novembre est un mercredi',
  hours: '9h00 – 19h00',
  venue: 'Parc d\'Exposition Mohammed VI',
  city: 'El Jadida, Maroc',
  stats: {
    exhibitors: '+600',
    visitors: '+200 000',
    countries: '+30',
  },
};
