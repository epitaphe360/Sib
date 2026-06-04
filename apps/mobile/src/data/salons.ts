import type { Salon } from '../types';

export const SALONS: Salon[] = [
  {
    id: 'sib',
    code: 'SIB',
    name: 'SIB 2026',
    description: 'Salon International du Bâtiment — El Jadida',
    dates: '25-29 Nov. 2026',
    active: true,
  },
  {
    id: 'sir',
    code: 'SIR',
    name: 'SIR',
    description: 'Salon Immobilier & Résidentiel',
    dates: 'UrbaEvent',
  },
  {
    id: 'sip',
    code: 'SIP',
    name: 'SIP',
    description: 'Salon Immobilier & Promotion',
    dates: 'UrbaEvent',
  },
  {
    id: 'btp',
    code: 'BTP',
    name: 'BTP',
    description: 'Bâtiment & Travaux Publics',
    dates: 'UrbaEvent',
  },
  {
    id: 'sie',
    code: 'SIE',
    name: 'SIE',
    description: 'Solutions vertes & développement durable',
    dates: 'UrbaEvent',
  },
];

export const SALON_INFO = {
  name: 'SIB 2026',
  dates: '25-29 Novembre 2026',
  startDayNote: 'Le 25 novembre est un mercredi',
  hours: '9h – 18h',
  venue: 'Parc d\'Exposition Mohammed VI',
  city: 'El Jadida, Maroc',
  stats: {
    exhibitors: '+300',
    visitors: '+6 000',
    countries: '+40',
  },
};
