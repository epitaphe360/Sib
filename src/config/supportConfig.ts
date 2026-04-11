/**
 * Configuration du support client WhatsApp et des canaux de communication
 */

export const SUPPORT_CONFIG = {
  // WhatsApp - Principal canal de communication
  whatsapp: {
    number: '+33766504580', // Numéro WhatsApp de support
    message: 'Bonjour, je souhaiterais entrer en contact avec votre équipe commerciale',
  },
  
  // Email
  email: 'contact@sib.ma',
  
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
      whatsapp: '+33766504580',
      email: 'commercial@sib.ma',
    },
    support: {
      name: 'Support Technique',
      whatsapp: '+33766504580',
      email: 'support@sib.ma',
    },
    exhibitors: {
      name: 'Exposants',
      whatsapp: '+33766504580',
      email: 'exposants@sibs.com',
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
