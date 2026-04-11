/**
 * Programme détaillé des conférences SIB 2026
 * 1-3 Avril 2026
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
        title: 'Allocutions institutionnelles (Ministres,...)',
        type: 'opening'
      },
      {
        time: '10:00 - 12:30',
        title: 'Panel Ministériel : « La coopération régionale et le développement des infrastructures portuaires en Afrique »',
        type: 'panel'
      },
      {
        time: '10:00 - 12:30',
        title: 'Ouverture officielle de l\'exposition',
        type: 'opening'
      },
      {
        time: '10:00 - 12:30',
        title: 'Ouverture officielle du musée',
        type: 'opening'
      },
      {
        time: '12:30 – 14:00',
        title: 'Déjeuner de réseautage',
        type: 'lunch'
      },
      {
        time: '14:00 – 15:30',
        title: 'Transformation Financière des Ports Africains : PPP, Climat et Blended Finance',
        type: 'session'
      }
    ]
  },
  {
    date: '2 avril 2026',
    dayNumber: 2,
    sessions: [
      {
        time: '09:00 – 10:30',
        title: 'Vers des ports africains durables et résilients face aux changements climatiques',
        type: 'session'
      },
      {
        time: '10:30 – 11:00',
        title: 'Pause-café',
        type: 'break'
      },
      {
        time: '11:00 – 12:30',
        title: 'Transition climatique et réglementaire : une nouvelle ère pour l\'industrie navale',
        type: 'session'
      },
      {
        time: '12:30 – 14:00',
        title: 'Déjeuner de réseautage',
        type: 'lunch'
      },
      {
        time: '14:00 – 15:30',
        title: 'Ports du futur : entre digitalisation, cybersécurité et compétitivité',
        type: 'session'
      }
    ]
  },
  {
    date: '3 avril 2026',
    dayNumber: 3,
    sessions: [
      {
        time: '09:00 – 10:30',
        title: 'Quelle stratégie pour renforcer l\'inclusion et la formation dans le maritime africain ?',
        type: 'session'
      },
      {
        time: '10:30 – 12:00',
        title: 'Leadership Féminin au cœur de la transformation maritime en partenariat avec (RFPMP-AOC)',
        type: 'session'
      },
      {
        time: '12:00 – 12:30',
        title: 'Cérémonie de clôture',
        type: 'ceremony'
      },
      {
        time: '12:30 – 15:00',
        title: 'Déjeuner de réseautage',
        type: 'lunch'
      },
      {
        time: '15:00',
        title: 'Visite au port de Jorf Lasfar',
        type: 'visit'
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
