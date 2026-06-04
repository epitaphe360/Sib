import type { ImageKey } from './images';

export type HomeNewsItem = {
  id: string;
  title: string;
  body: string;
  imageKey: ImageKey;
};

/** Actualités statiques — à remplacer par CMS / Supabase plus tard */
export const HOME_NEWS: HomeNewsItem[] = [
  {
    id: '1',
    title: 'SIB 2026 à El Jadida',
    body: 'Parc d\'Exposition Mohammed VI — 25-29 novembre 2026',
    imageKey: 'morocco',
  },
  {
    id: '2',
    title: 'Programme de conférences',
    body: 'Innovation BTP, immobilier et urbanisme durable',
    imageKey: 'conference',
  },
  {
    id: '3',
    title: 'Rendez-vous d\'affaires',
    body: 'Networking B2B réservé aux pass Premium VIP',
    imageKey: 'b2b',
  },
];
