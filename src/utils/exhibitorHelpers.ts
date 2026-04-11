import { Appointment } from '../types';

/**
 * Utilitaires pour gérer l'affichage des informations des exposants
 */

/**
 * Récupère le nom d'affichage d'un exposant depuis un rendez-vous
 * Priorise le nom de l'entreprise, puis le nom de la personne, puis l'ID
 */
export const getExhibitorDisplayName = (appointment: Appointment): string => {
  if (appointment.exhibitor?.companyName) {
    return appointment.exhibitor.companyName;
  }
  if (appointment.exhibitor?.name) {
    return appointment.exhibitor.name;
  }
  return `Exposant #${appointment.exhibitorId}`;
};

/**
 * Récupère l'avatar d'un exposant depuis un rendez-vous
 * Retourne une URL d'avatar par défaut si aucun avatar n'est disponible
 */
export const getExhibitorAvatar = (appointment: Appointment): string => {
  return appointment.exhibitor?.avatar || '/default-avatar.png';
};

/**
 * Formate le nom complet d'un exposant avec son entreprise
 * Format: "Nom de la personne (Nom de l'entreprise)"
 */
export const getExhibitorFullName = (appointment: Appointment): string => {
  const name = appointment.exhibitor?.name;
  const company = appointment.exhibitor?.companyName;

  if (name && company) {
    return `${name} (${company})`;
  }
  if (company) {
    return company;
  }
  if (name) {
    return name;
  }
  return `Exposant #${appointment.exhibitorId}`;
};
