/**
 * Configuration du support client WhatsApp et des canaux de communication
 */

export const SUPPORT_CONFIG = {
  // WhatsApp - Principal canal de communication
  whatsapp: {
    number: '+212688500500', // Numéro WhatsApp de support
    message: 'Bonjour, je souhaiterais entrer en contact avec votre équipe commerciale',
  },
  
  // Email
  email: 'Sib2026@urbacom.net',
  
  // Téléphone
  phone: '+212688500500',
  
  // Horaires d'ouverture
  hours: {
    weekdays: '9h00 - 18h00', // Lundi à Vendredi
    weekend: 'Fermé',
    timezone: 'GMT+1 (Heure du Maroc)',
  },

  // Adresse
  address: {
    street: '63, Imm B, Rés LE YACHT, Bd de la Corniche 7ème étage N°185',
    city: 'Casablanca',
    country: 'Maroc',
    zip: '',
  },

  // Équipes
  teams: {
    commercial: {
      name: 'Équipe Commerciale',
      whatsapp: '+212688500500',
      email: 'Sib2026@urbacom.net',
    },
    support: {
      name: 'Support Technique',
      whatsapp: '+212688500500',
      email: 'Sib2026@urbacom.net',
    },
    exhibitors: {
      name: 'Exposants',
      whatsapp: '+212688500500',
      email: 'Sib2026@urbacom.net',
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
