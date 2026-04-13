/**
 * Configuration du support client WhatsApp et des canaux de communication
 */

export const SUPPORT_CONFIG = {
  // WhatsApp - Principal canal de communication
  whatsapp: {
    number: '+212668385228', // Numéro WhatsApp de support
    message: 'Bonjour, je souhaiterais entrer en contact avec votre équipe commerciale',
  },
  
  // Email
  email: 'contact@sibevent.com',
  
  // Téléphone
  phone: '+212668385228',
  
  // Horaires d'ouverture
  hours: {
    weekdays: '9h00 - 18h00', // Lundi à Vendredi
    weekend: 'Fermé',
    timezone: 'GMT+1 (Heure du Maroc)',
  },

  // Adresse
  address: {
    street: '19, rue Badr Assayab – 1er étage n°2',
    city: 'Casablanca',
    country: 'Maroc',
    zip: '',
  },

  // Équipes
  teams: {
    commercial: {
      name: 'Équipe Commerciale',
      whatsapp: '+212668385228',
      email: 'contact@sibevent.com',
    },
    support: {
      name: 'Support Technique',
      whatsapp: '+212668385228',
      email: 'contact@sibevent.com',
    },
    exhibitors: {
      name: 'Exposants',
      whatsapp: '+212668385228',
      email: 'contact@sibevent.com',
    },
  },
};

// Fonction utilitaire pour générer un lien WhatsApp
export const generateWhatsAppLink = (
  phoneNumber: string,
  message?: string
): string => {
  const cleanNumber = phoneNumber.replace(/\s/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
};

// Fonction utilitaire pour ouvrir WhatsApp
export const openWhatsApp = (phoneNumber: string, message?: string): void => {
  const link = generateWhatsAppLink(phoneNumber, message);
  window.open(link, '_blank');
};
