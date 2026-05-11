import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NavSubItemConfig {
  key: string;
  label: string;
  visible: boolean;
}

export interface NavItemConfig {
  key: string;
  label: string;
  visible: boolean;
  description: string;
  children?: NavSubItemConfig[];
}

interface NavVisibilityState {
  items: NavItemConfig[];
  setVisible: (key: string, visible: boolean) => void;
  isVisible: (key: string) => boolean;
}

const DEFAULT_ITEMS: NavItemConfig[] = [
  {
    key: 'salon', label: 'Le Salon', visible: true, description: 'Menu deroulant principal',
    children: [
      { key: 'salon.presentation', label: 'Presentation', visible: true },
      { key: 'salon.nouveautes',   label: 'Nouveautes',   visible: true },
      { key: 'salon.secteurs',     label: 'Secteurs',     visible: true },
      { key: 'salon.editions',     label: 'Editions',     visible: true },
      { key: 'salon.telechargements', label: 'Telechargements', visible: true },
    ],
  },
  {
    key: 'exposer', label: 'Exposer', visible: true, description: 'Menu deroulant exposants',
    children: [
      { key: 'exposer.pourquoi', label: 'Pourquoi exposer',    visible: true },
      { key: 'exposer.espaces',  label: 'Espaces SIB',         visible: true },
      { key: 'exposer.reserver', label: 'Reserver un stand',   visible: true },
      { key: 'exposer.annuaire', label: 'Annuaire exposants',  visible: true },
    ],
  },
  {
    key: 'visiter', label: 'Visiter', visible: true, description: 'Menu deroulant visiteurs',
    children: [
      { key: 'visiter.pourquoi', label: 'Pourquoi visiter', visible: true },
      { key: 'visiter.infos',    label: 'Infos pratiques',  visible: true },
      { key: 'visiter.badge',    label: 'Badge visiteur',   visible: true },
      { key: 'visiter.vip',      label: 'Acces VIP',        visible: true },
    ],
  },
  {
    key: 'sponsors', label: 'Sponsors', visible: true, description: 'Menu deroulant sponsors',
    children: [
      { key: 'sponsors.devenir',  label: 'Devenir sponsor',   visible: true },
      { key: 'sponsors.annuaire', label: 'Annuaire sponsors', visible: true },
    ],
  },
  {
    key: 'programme', label: 'Programme', visible: true, description: 'Menu deroulant programme',
    children: [
      { key: 'programme.programme',    label: 'Programme',    visible: true },
      { key: 'programme.intervenants', label: 'Intervenants', visible: true },
    ],
  },
  { key: 'networking', label: 'Reseautage', visible: true, description: 'Lien direct' },
  {
    key: 'medias', label: 'Medias', visible: true, description: 'Menu deroulant medias',
    children: [
      { key: 'medias.webinars',      label: 'Webinars',      visible: true },
      { key: 'medias.podcasts',      label: 'Podcasts',      visible: true },
      { key: 'medias.capsules',      label: 'Capsules',      visible: true },
      { key: 'medias.live_studio',   label: 'Live Studio',   visible: true },
      { key: 'medias.best_moments',  label: 'Best Moments',  visible: true },
      { key: 'medias.testimonials',  label: 'Temoignages',   visible: true },
      { key: 'medias.library',       label: 'Mediatheque',   visible: true },
    ],
  },
  { key: 'contact', label: 'Contact', visible: true, description: 'Lien direct' },
];

export const useNavVisibilityStore = create<NavVisibilityState>()(
  persist(
    (set, get) => ({
      items: DEFAULT_ITEMS,

      setVisible: (key, visible) =>
        set(state => ({
          items: state.items.map(item => {
            if (item.key === key) return { ...item, visible };
            if (item.children) {
              return {
                ...item,
                children: item.children.map(child =>
                  child.key === key ? { ...child, visible } : child
                ),
              };
            }
            return item;
          }),
        })),

      isVisible: (key) => {
        for (const item of get().items) {
          if (item.key === key) return item.visible;
          if (item.children) {
            const child = item.children.find(c => c.key === key);
            if (child) return child.visible;
          }
        }
        return true;
      },
    }),
    {
      name: 'sib-nav-visibility',
      version: 2,
      migrate: (_oldState: unknown, _oldVersion: number) => {
        // Version 2: reset to defaults pour forcer les children
        return { items: DEFAULT_ITEMS };
      },
    }
  )
);