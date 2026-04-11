import { StrategicBriefFormData, ContactFormData } from '../../types/forms';
import { apiClient } from './client';

/**
 * Service API pour la gestion des formulaires
 * 
 * Centralise tous les appels API liés aux formulaires
 */

export const formService = {
  /**
   * Soumettre un brief stratégique
   */
  submitStrategicBrief: async (data: StrategicBriefFormData) => {
    return apiClient.post('/forms/strategic-brief', data);
  },

  /**
   * Soumettre un formulaire de contact
   */
  submitContact: async (data: ContactFormData) => {
    return apiClient.post('/forms/contact', data);
  },

  /**
   * Soumettre un score QHSE
   */
  submitQHSEScore: async (data: any) => {
    return apiClient.post('/forms/qhse-score', data);
  },

  /**
   * Soumettre un calcul Fabrique
   */
  submitFabriqueCalculation: async (data: any) => {
    return apiClient.post('/forms/fabrique-calculation', data);
  },

  /**
   * S'abonner à la newsletter
   */
  subscribeNewsletter: async (email: string) => {
    return apiClient.post('/forms/newsletter-subscribe', { email });
  },

  /**
   * Télécharger un lead magnet
   */
  downloadLeadMagnet: async (magnetId: string, email: string) => {
    return apiClient.post('/forms/lead-magnet-download', {
      magnetId,
      email,
    });
  },
};

