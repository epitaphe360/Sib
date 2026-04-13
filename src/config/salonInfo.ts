/**
 * Configuration centralisée des informations du salon SIB
 * Ces informations peuvent être surchargées par les données de la table salon_config
 */

export interface SalonConfig {
  name: string;
  dates: {
    start: string;
    end: string;
  };
  location: {
    venue: string;
    city: string;
    country: string;
  };
  hours: {
    opening: string;
    closing: string;
  };
  expectedVisitors: number;
}

export const DEFAULT_SALON_CONFIG: SalonConfig = {
  name: 'SIB 2026',
  dates: {
    start: '25 Novembre 2026',
    end: '29 Novembre 2026'
  },
  location: {
    venue: 'Parc d\'Exposition Mohammed VI',
    city: 'El Jadida',
    country: 'Maroc'
  },
  hours: {
    opening: '9h00',
    closing: '19h00'
  },
  expectedVisitors: 200000
};

/**
 * Dates du salon en format Date pour les validations
 */
export const SALON_DATE_RANGE = {
  start: new Date(2026, 10, 25), // 25 novembre 2026 (mois 0-indexé)
  end: new Date(2026, 10, 29),   // 29 novembre 2026
  year: 2026,
  month: 10, // Novembre (0-indexé)
  startDay: 25,
  endDay: 29
};

/**
 * Vérifie si une date est dans la période du salon
 */
export const isDateInSalonRange = (date: Date): boolean => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const startDate = new Date(SALON_DATE_RANGE.start);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(SALON_DATE_RANGE.end);
  endDate.setHours(23, 59, 59, 999);

  return d >= startDate && d <= endDate;
};

/**
 * Retourne les dates valides du salon sous forme de chaîne ISO (YYYY-MM-DD)
 */
export const getSalonDateStrings = (): string[] => {
  return ['2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29'];
};

/**
 * Retourne la date minimum pour le sélecteur de date
 */
export const getMinSlotDate = (): string => '2026-11-25';

/**
 * Retourne la date maximum pour le sélecteur de date
 */
export const getMaxSlotDate = (): string => '2026-11-29';

/**
 * Formate les dates du salon pour l'affichage
 */
export const formatSalonDates = (config: SalonConfig): string => {
  return `${config.dates.start} - ${config.dates.end}`;
};

/**
 * Formate la localisation du salon pour l'affichage
 */
export const formatSalonLocation = (config: SalonConfig): string => {
  return `${config.location.city}, ${config.location.country}`;
};

/**
 * Formate les horaires du salon pour l'affichage
 */
export const formatSalonHours = (config: SalonConfig): string => {
  return `Tous les jours de ${config.hours.opening} à ${config.hours.closing}`;
};

