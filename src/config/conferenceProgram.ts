/**
 * Programme détaillé des conférences SIB 2026
 * Salon International du Bâtiment - 1-3 Avril 2026
 * Mohammed VI Exhibition Center, Casablanca, Maroc
 */

export interface ConferenceSession {
  time: string;
  title: string;
  type: 'session' | 'panel' | 'ceremony' | 'lunch' | 'visit' | 'opening' | 'break';
  description?: string;
}

export interface DayProgram {
  date: string;
  dayNumber: number;
  sessions: ConferenceSession[];
}

export const CONFERENCE_PROGRAM: DayProgram[] = [
  {
    date: '1 avril 2026',
    dayNumber: 1,
    sessions: [
      {
        time: '10:00 - 12:30',
        title: 'Allocutions institutionnelles (Ministres, Élus, Fédérations professionnelles BTP)',
        type: 'opening'
      },
      {
        time: '10:00 - 12:30',
        title: 'Panel Ministériel : « Les grands chantiers du Maroc 2026-2030 : Enjeux, Financement et Opportunités pour le secteur BTP »',
        type: 'panel'
      },
      {
        time: '10:00 - 12:30',
        title: 'Ouverture officielle de l\'exposition SIB 2026',
        type: 'opening'
      },
      {
        time: '12:30 – 14:00',
        title: 'Déjeuner de réseautage',
        type: 'lunch'
      },
      {
        time: '14:00 – 15:30',
        title: 'Financement des projets BTP au Maroc : PPP, Fonds Climat et Investissements Publics',
        type: 'session',
        description: 'Mécanismes de financement innovants pour les grands projets d\'infrastructure'
      },
      {
        time: '15:30 – 17:00',
        title: 'Réglementation thermique et efficacité énergétique dans la construction : RTCM 2026',
        type: 'session',
        description: 'Mise en conformité, certifications et bonnes pratiques énergétiques'
      }
    ]
  },
  {
    date: '2 avril 2026',
    dayNumber: 2,
    sessions: [
      {
        time: '09:00 – 10:30',
        title: 'BTP durable et construction verte : matériaux biosourcés, recyclage et économie circulaire',
        type: 'session',
        description: 'Vers un secteur de la construction plus responsable et moins carboné'
      },
      {
        time: '10:30 – 11:00',
        title: 'Pause-café',
        type: 'break'
      },
      {
        time: '11:00 – 12:30',
        title: 'BIM & Digital Twin : la révolution numérique du bâtiment au Maroc',
        type: 'session',
        description: 'Adoption du BIM dans les marchés publics et privés, retours d\'expérience'
      },
      {
        time: '12:30 – 14:00',
        title: 'Déjeuner de réseautage',
        type: 'lunch'
      },
      {
        time: '14:00 – 15:30',
        title: 'Smart Building et Domotique : vers des bâtiments intelligents, connectés et sécurisés',
        type: 'session',
        description: 'Systèmes KNX, IoT bâtiment, gestion technique centralisée (GTC)'
      },
      {
        time: '15:30 – 17:00',
        title: 'Industrialisation et préfabrication : accélérer les délais de livraison dans la construction',
        type: 'session',
        description: 'Modules préfabriqués, construction hors-site, supply chain optimisée'
      }
    ]
  },
  {
    date: '3 avril 2026',
    dayNumber: 3,
    sessions: [
      {
        time: '09:00 – 10:30',
        title: 'Formation et compétences dans le BTP marocain : quelles stratégies pour répondre aux besoins du marché ?',
        type: 'session',
        description: 'Partenariats universités-entreprises, formation professionnelle, certifications'
      },
      {
        time: '10:30 – 12:00',
        title: 'Leadership Féminin dans le BTP : Ingénieures, Architectes et Cheffes de projet au Maroc',
        type: 'session',
        description: 'Témoignages, défis et perspectives pour les femmes dans le secteur de la construction'
      },
      {
        time: '12:00 – 12:30',
        title: 'Cérémonie de clôture et remise des prix SIB 2026',
        type: 'ceremony'
      },
      {
        time: '12:30 – 15:00',
        title: 'Déjeuner de clôture et networking',
        type: 'lunch'
      },
      {
        time: '15:00',
        title: 'Visite du chantier Mohammed VI Exhibition Center',
        type: 'visit',
        description: 'Découverte des innovations techniques du lieu d\'accueil SIB 2026'
      }
    ]
  }
];

/**
 * Récupère le programme d'une journée spécifique
 */
export const getDayProgram = (dayNumber: number): DayProgram | undefined => {
  return CONFERENCE_PROGRAM.find(day => day.dayNumber === dayNumber);
};

/**
 * Récupère toutes les sessions d'un type spécifique
 */
export const getSessionsByType = (type: ConferenceSession['type']): ConferenceSession[] => {
  return CONFERENCE_PROGRAM.flatMap(day =>
    day.sessions.filter(session => session.type === type)
  );
};

/**
 * Compte le nombre total de sessions
 */
export const getTotalSessions = (): number => {
  return CONFERENCE_PROGRAM.reduce((total, day) => total + day.sessions.length, 0);
};

/**
 * Formate une session pour l'affichage
 */
export const formatSession = (session: ConferenceSession): string => {
  return `${session.time} - ${session.title}`;
};

/**
 * Récupère le libellé français du type de session
 */
export const getSessionTypeLabel = (type: ConferenceSession['type']): string => {
  const labels: Record<ConferenceSession['type'], string> = {
    session: 'Session',
    panel: 'Panel Ministériel',
    ceremony: 'Cérémonie',
    lunch: 'Déjeuner de réseautage',
    visit: 'Visite',
    opening: 'Ouverture officielle',
    break: 'Pause'
  };
  return labels[type] || type;
};
