import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ═══════════════════════════════════════════════════ */
/*  Programme Scientifique SIB – Store             */
/* ═══════════════════════════════════════════════════ */

export type SessionType = 'officiel' | 'panel' | 'table-ronde' | 'ted-talk' | 'atelier' | 'pause' | 'concours' | 'cloture';

export interface Session {
  id: string;
  time: string;
  title: string;
  type: SessionType;
  speakers: string[];
  description: string;
}

export interface DayProgram {
  id: string;
  date: string;
  dayLabel: string;
  theme: string;
  sessions: Session[];
}

export interface ProgrammeInfo {
  eventTitle: string;
  eventTheme: string;
  eventDates: string;
  eventLocation: string;
  eventDescription: string;
  axes: { title: string; description: string }[];
}

interface ProgrammeState {
  info: ProgrammeInfo;
  days: DayProgram[];
  // Actions
  updateInfo: (info: Partial<ProgrammeInfo>) => void;
  updateAxe: (index: number, axe: { title: string; description: string }) => void;
  addAxe: (axe: { title: string; description: string }) => void;
  removeAxe: (index: number) => void;
  addDay: (day: Omit<DayProgram, 'id'>) => void;
  updateDay: (dayId: string, updates: Partial<Omit<DayProgram, 'id' | 'sessions'>>) => void;
  removeDay: (dayId: string) => void;
  reorderDays: (days: DayProgram[]) => void;
  addSession: (dayId: string, session: Omit<Session, 'id'>) => void;
  updateSession: (dayId: string, sessionId: string, updates: Partial<Omit<Session, 'id'>>) => void;
  removeSession: (dayId: string, sessionId: string) => void;
  moveSession: (dayId: string, sessionId: string, direction: 'up' | 'down') => void;
  resetToDefault: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

/* ─── Default Data ─── */
const DEFAULT_INFO: ProgrammeInfo = {
  eventTitle: 'SIB — 1ère Édition',
  eventTheme: '« Les ports au cœur des transformations économiques et de l\'intégration régionale »',
  eventDates: '1er au 3 avril 2026',
  eventLocation: 'Parc des Expositions Mohammed VI — Casablanca, Maroc',
  eventDescription: 'Espace de réflexion stratégique et de dialogue de haut niveau réunissant décideurs institutionnels et acteurs majeurs de l\'écosystème portuaire.',
  axes: [
    { title: 'Intégration & Coopération', description: 'Initiative Atlantique du Maroc' },
    { title: 'Performance & Transformation', description: 'Connectivité et digitalisation' },
    { title: 'Durabilité & Résilience', description: 'Transition verte et climat' },
    { title: 'Économie Bleue', description: 'Industrie navale, pêche, plaisance' },
    { title: 'Sécurité & Sûreté', description: 'Risques maritimes et portuaires' },
    { title: 'Innovation & Formation', description: 'Compétences et recherche appliquée' },
  ],
};

const DEFAULT_DAYS: DayProgram[] = [
  {
    id: 'day1',
    date: 'Mercredi 1er avril 2026',
    dayLabel: 'Jour 1',
    theme: 'Ouverture & Intégration Portuaire',
    sessions: [
      { id: 's1-1', time: '09h00', title: 'Accueil des participants', type: 'officiel', speakers: [], description: '' },
      { id: 's1-2', time: '10h00', title: 'Allocutions des officiels', type: 'officiel', speakers: [], description: 'Discours d\'ouverture par les hauts responsables institutionnels et les organisateurs de SIB.' },
      { id: 's1-3', time: '10h40', title: 'Panel Ministériel de Haut Niveau', type: 'panel', speakers: [], description: 'Dialogue stratégique entre ministres et décideurs politiques sur l\'avenir des ports africains.' },
      { id: 's1-4', time: '12h00', title: 'Ouverture officielle du salon & Visite des stands', type: 'officiel', speakers: [], description: '' },
      { id: 's1-5', time: '13h00', title: 'Pause déjeuner', type: 'pause', speakers: [], description: '' },
      { id: 's1-6', time: '14h30', title: 'Panel 1 : Facteurs de l\'intégration du port dans l\'espace atlantique africain', type: 'panel', speakers: ['Mme Sanae ELAMRANI (Ministère des Affaires étrangères)', 'Mme Nisrine IOUZZI', 'Dr Mourad Fdil ou Maître Lahlou'], description: 'Analyse des dynamiques d\'intégration portuaire dans le cadre de l\'Initiative Atlantique du Maroc et de la coopération régionale africaine.' },
      { id: 's1-7', time: '16h00', title: 'Panel 2 : Financement et attractivité des projets portuaires', type: 'panel', speakers: ['M. El Mostafa ALMOUZANI', 'Mme Delphine Garcia (experte financement)', 'BAD (Banque Africaine de Développement)', 'Abdou Souleye Diop (Forvis Mazars)'], description: 'Stratégies de financement innovantes et leviers d\'attractivité pour les grands projets d\'infrastructure portuaire en Afrique.' },
      { id: 's1-8', time: '18h00', title: 'Fin de la 1ère journée', type: 'officiel', speakers: [], description: '' },
    ]
  },
  {
    id: 'day2',
    date: 'Jeudi 2 avril 2026',
    dayLabel: 'Jour 2',
    theme: 'Compétitivité, Connectivité & Économie Bleue',
    sessions: [
      { id: 's2-1', time: '09h30', title: 'Ouverture de la journée', type: 'officiel', speakers: [], description: '' },
      { id: 's2-2', time: '10h00', title: 'Panel 3 : Les nouveaux leviers de compétitivité dans le secteur portuaire', type: 'panel', speakers: ['MCE ou MTEDD', 'M. Ilyas CHOUBAILI', 'M. Youssef IMGHI', 'ANP ou SAPT', 'Christophe Gaigneux', 'Cluster maritime'], description: 'Transition verte, croisière et nouveaux modèles de compétitivité pour les ports africains et méditerranéens.' },
      { id: 's2-3', time: '11h30', title: 'Table Ronde 1 : Enjeux de la connectivité et des performances', type: 'table-ronde', speakers: ['M. Jean-Marie Koffi (AGPAOC)', 'IAPH', 'MEE', 'M. Francisco Esteban Lefler (PIANC)', 'Cluster maritime'], description: 'Rôle des hubs africains dans les chaînes logistiques mondiales et leviers de performance portuaire.' },
      { id: 's2-4', time: '13h00', title: 'Pause déjeuner', type: 'pause', speakers: [], description: '' },
      { id: 's2-5', time: '14h30', title: 'Ted Talk 1 : Évolution technologique & IA dans le management portuaire', type: 'ted-talk', speakers: ['MTNRA ou ISEM'], description: 'Comment l\'intelligence artificielle transforme la gestion et l\'exploitation des ports.' },
      { id: 's2-6', time: '15h00', title: 'Ted Talk 2 : Marketing portuaire et attractivité', type: 'ted-talk', speakers: ['TANGER MED ou ANP'], description: 'Stratégies de branding et de positionnement pour les ports du 21ème siècle.' },
      { id: 's2-7', time: '15h30', title: 'Ted Talk 3 : Ports et gouvernance économique', type: 'ted-talk', speakers: ['M. Geraint Evans (CEO UK Major Ports Group)'], description: 'Vision internationale de la gouvernance portuaire et de son impact économique.' },
      { id: 's2-8', time: '16h00', title: 'Table Ronde 2 : Promotion de l\'économie bleue', type: 'table-ronde', speakers: ['MTL', 'MEE', 'MEMDD', 'Prof. BENAZZOUZ (ISEM)', 'Dr TARIQ ESSAID'], description: 'Développement du littoral, industrie navale, pêche et plaisance comme moteurs de croissance durable.' },
      { id: 's2-9', time: '18h00', title: 'Fin de la journée', type: 'officiel', speakers: [], description: '' },
    ]
  },
  {
    id: 'day3',
    date: 'Vendredi 3 avril 2026',
    dayLabel: 'Jour 3',
    theme: 'Ateliers, Innovation & Clôture',
    sessions: [
      { id: 's3-1', time: '09h30', title: 'Ouverture de la journée', type: 'officiel', speakers: [], description: '' },
      { id: 's3-2', time: '10h00', title: 'Atelier 1 : Leadership féminin maritime', type: 'atelier', speakers: ['Magalie Thaddées', 'RFPMP-AOC'], description: 'Promotion de l\'égalité des genres et de l\'autonomisation des femmes dans le secteur maritime et portuaire africain.' },
      { id: 's3-3', time: '10h45', title: 'Atelier 2 : Évolution de la formation et management des compétences', type: 'atelier', speakers: ['Dr Anass KETTANI'], description: 'Adapter les programmes de formation aux nouveaux métiers portuaires et maritimes.' },
      { id: 's3-4', time: '11h30', title: 'Atelier 3 : Cybersécurité portuaire', type: 'atelier', speakers: ['PORTNET ou TMPCS', 'M. Omar Benaicha'], description: 'Protection des infrastructures portuaires critiques face aux menaces cyber.' },
      { id: 's3-5', time: '12h15', title: 'Atelier 4 : Smartport — Enjeux et perspectives', type: 'atelier', speakers: ['Port du Havre', 'Geraint Evans'], description: 'Transformation numérique des ports : IoT, jumeaux numériques et ports intelligents.' },
      { id: 's3-6', time: '13h00', title: 'Pause déjeuner', type: 'pause', speakers: [], description: '' },
      { id: 's3-7', time: '14h30', title: 'Concours d\'innovation portuaire', type: 'concours', speakers: [], description: 'Présentation et évaluation des projets innovants soumis par les startups et chercheurs.' },
      { id: 's3-8', time: '16h00', title: 'Résultats du concours & Remise des prix', type: 'concours', speakers: [], description: 'Annonce des lauréats et cérémonie de remise des prix de l\'innovation.' },
      { id: 's3-9', time: '17h00', title: 'Allocutions de clôture', type: 'cloture', speakers: [], description: '' },
      { id: 's3-10', time: '18h00', title: 'Clôture officielle du salon', type: 'cloture', speakers: [], description: '' },
    ]
  }
];

export const useProgrammeStore = create<ProgrammeState>()(
  persist(
    (set) => ({
      info: DEFAULT_INFO,
      days: DEFAULT_DAYS,

      updateInfo: (updates) => set((state) => ({
        info: { ...state.info, ...updates }
      })),

      updateAxe: (index, axe) => set((state) => {
        const axes = [...state.info.axes];
        axes[index] = axe;
        return { info: { ...state.info, axes } };
      }),

      addAxe: (axe) => set((state) => ({
        info: { ...state.info, axes: [...state.info.axes, axe] }
      })),

      removeAxe: (index) => set((state) => ({
        info: { ...state.info, axes: state.info.axes.filter((_, i) => i !== index) }
      })),

      addDay: (day) => set((state) => ({
        days: [...state.days, { ...day, id: generateId() }]
      })),

      updateDay: (dayId, updates) => set((state) => ({
        days: state.days.map(d => d.id === dayId ? { ...d, ...updates } : d)
      })),

      removeDay: (dayId) => set((state) => ({
        days: state.days.filter(d => d.id !== dayId)
      })),

      reorderDays: (days) => set({ days }),

      addSession: (dayId, session) => set((state) => ({
        days: state.days.map(d =>
          d.id === dayId
            ? { ...d, sessions: [...d.sessions, { ...session, id: generateId() }] }
            : d
        )
      })),

      updateSession: (dayId, sessionId, updates) => set((state) => ({
        days: state.days.map(d =>
          d.id === dayId
            ? { ...d, sessions: d.sessions.map(s => s.id === sessionId ? { ...s, ...updates } : s) }
            : d
        )
      })),

      removeSession: (dayId, sessionId) => set((state) => ({
        days: state.days.map(d =>
          d.id === dayId
            ? { ...d, sessions: d.sessions.filter(s => s.id !== sessionId) }
            : d
        )
      })),

      moveSession: (dayId, sessionId, direction) => set((state) => ({
        days: state.days.map(d => {
          if (d.id !== dayId) return d;
          const idx = d.sessions.findIndex(s => s.id === sessionId);
          if (idx < 0) return d;
          const newIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (newIdx < 0 || newIdx >= d.sessions.length) return d;
          const sessions = [...d.sessions];
          [sessions[idx], sessions[newIdx]] = [sessions[newIdx], sessions[idx]];
          return { ...d, sessions };
        })
      })),

      resetToDefault: () => set({ info: DEFAULT_INFO, days: DEFAULT_DAYS }),
    }),
    {
      name: 'SIB-programme',
    }
  )
);
