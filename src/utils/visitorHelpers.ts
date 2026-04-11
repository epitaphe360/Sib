import { Appointment } from '../types';

/**
 * Utilitaires pour gérer l'affichage des informations des visiteurs
 */

/**
 * Récupère le nom d'affichage d'un visiteur depuis un rendez-vous
 * Priorise le nom complet, puis l'ID
 */
export const getVisitorDisplayName = (appointment: Appointment): string => {
  if (appointment.visitor?.name) {
    return appointment.visitor.name;
  }
  return `Visiteur #${appointment.visitorId}`;
};

/**
 * Récupère l'avatar d'un visiteur depuis un rendez-vous
 * Retourne une URL d'avatar par défaut si aucun avatar n'est disponible
 */
export const getVisitorAvatar = (appointment: Appointment): string => {
  return appointment.visitor?.avatar || '/default-avatar.png';
};

/**
 * Formate le nom complet d'un visiteur avec son entreprise si disponible
 * Format: "Nom du visiteur (Entreprise)" ou juste "Nom du visiteur"
 */
export const getVisitorFullName = (appointment: Appointment): string => {
  const name = appointment.visitor?.name;
  
  if (name) {
    return name;
  }
  
  return `Visiteur #${appointment.visitorId}`;
};
