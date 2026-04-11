export interface QRCodeData {
  userId: string;
  userType: 'admin' | 'partner' | 'exhibitor' | 'visitor';
  accessLevel: 'basic' | 'premium' | 'vip' | 'partner' | 'exhibitor';
  eventId?: string;
  validUntil: Date;
  permissions: {
    networking: boolean;
    premiumWorkshops: boolean;
    vipEvents: boolean;
    partnerExclusives: boolean;
    galaDinner: boolean;
    executiveLounge: boolean;
  };
  signature: string; // For security verification
}

export interface EventAccess {
  eventId: string;
  eventName: string;
  eventType: 'public' | 'premium' | 'vip' | 'partner' | 'networking' | 'gala';
  requiredLevel: 'basic' | 'premium' | 'vip' | 'partner' | 'exhibitor';
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  maxCapacity: number;
  currentAttendees: number;
  requiresQR: boolean;
}

// Mock events data for the salon
const salonEvents: EventAccess[] = [
  {
    eventId: 'salon-opening',
    eventName: 'Cérémonie d\'ouverture SIB 2026',
    eventType: 'public',
    requiredLevel: 'basic',
    description: 'Ouverture officielle du salon avec les discours des autorités et présentation des innovations.',
    startTime: new Date('2026-02-05T09:00:00'),
    endTime: new Date('2026-02-05T10:30:00'),
    location: 'Amphithéâtre Principal',
    maxCapacity: 500,
    currentAttendees: 156,
    requiresQR: true,
  },
  {
    eventId: 'port-digitalization',
    eventName: 'Digitalisation des Ports : Enjeux et Opportunités',
    eventType: 'premium',
    requiredLevel: 'premium',
    description: 'Conférence exclusive sur les technologies émergentes et leur impact sur l\'efficacité portuaire.',
    startTime: new Date('2026-02-05T14:00:00'),
    endTime: new Date('2026-02-05T16:00:00'),
    location: 'Salle de conférence Premium',
    maxCapacity: 80,
    currentAttendees: 67,
    requiresQR: true,
  },
  {
    eventId: 'vip-networking-breakfast',
    eventName: 'Petit-déjeuner Networking VIP',
    eventType: 'vip',
    requiredLevel: 'vip',
    description: 'Petit-déjeuner exclusif avec les dirigeants du secteur portuaire et maritime.',
    startTime: new Date('2026-02-06T08:00:00'),
    endTime: new Date('2026-02-06T10:00:00'),
    location: 'Salon VIP - Terrasse Panoramique',
    maxCapacity: 50,
    currentAttendees: 38,
    requiresQR: true,
  },
  {
    eventId: 'partner-roundtable',
    eventName: 'Table Ronde Partenaires : Avenir des Ports Intelligents',
    eventType: 'partner',
    requiredLevel: 'partner',
    description: 'Discussion stratégique réservée aux partenaires sur les investissements et innovations.',
    startTime: new Date('2026-02-06T14:00:00'),
    endTime: new Date('2026-02-06T16:30:00'),
    location: 'Salle Executive',
    maxCapacity: 30,
    currentAttendees: 22,
    requiresQR: true,
  },
  {
    eventId: 'gala-dinner',
    eventName: 'Dîner de Gala SIB 2026',
    eventType: 'gala',
    requiredLevel: 'vip',
    description: 'Soirée de prestige avec remise des prix de l\'innovation portuaire.',
    startTime: new Date('2026-02-06T19:00:00'),
    endTime: new Date('2026-02-06T23:00:00'),
    location: 'Grand Ballroom - Hôtel Atlantic',
    maxCapacity: 200,
    currentAttendees: 178,
    requiresQR: true,
  },
  {
    eventId: 'exhibitor-forum',
    eventName: 'Forum Exposants : Showcase Technologique',
    eventType: 'premium',
    requiredLevel: 'exhibitor',
    description: 'Présentation des innovations technologiques par les exposants du salon.',
    startTime: new Date('2026-02-07T10:00:00'),
    endTime: new Date('2026-02-07T12:00:00'),
    location: 'Hall d\'exposition - Zone Innovation',
    maxCapacity: 150,
    currentAttendees: 89,
    requiresQR: true,
  },
];

/**
 * Génère les données pour un QR code basé sur l'utilisateur et l'événement
 */
export function generateQRCodeData(
  userId: string,
  userType: 'admin' | 'partner' | 'exhibitor' | 'visitor',
  userLevel: string,
  eventId?: string
): QRCodeData {
  const accessLevel = mapUserLevelToAccessLevel(userType, userLevel);
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days

  // Determine permissions based on user type and level
  const permissions = {
    networking: userType !== 'visitor' || (userLevel !== 'free'),
    premiumWorkshops: userType === 'admin' || userType === 'partner' || userType === 'exhibitor' ||
                     (userType === 'visitor' && userLevel === 'premium'),
    vipEvents: userType === 'admin' || userType === 'partner' ||
               (userType === 'visitor' && userLevel === 'premium') ||
               (userType === 'exhibitor' && userLevel === 'platinum'),
    partnerExclusives: userType === 'admin' || userType === 'partner',
    galaDinner: userType === 'admin' || userType === 'partner' ||
                (userType === 'visitor' && userLevel === 'premium') ||
                (userType === 'exhibitor' && userLevel === 'platinum'),
    executiveLounge: userType === 'admin' ||
                    (userType === 'partner' && userLevel === 'platinum') ||
                    (userType === 'exhibitor' && userLevel === 'platinum') ||
                    (userType === 'visitor' && userLevel === 'premium'),
  };

  // Generate a simple signature (in production, use proper cryptographic signing)
  const dataString = `${userId}-${userType}-${accessLevel}-${eventId || 'general'}-${validUntil.toISOString()}`;
  const signature = btoa(dataString).slice(0, 16); // Simple base64 signature

  return {
    userId,
    userType,
    accessLevel,
    eventId,
    validUntil,
    permissions,
    signature,
  };
}

/**
 * Mappe le niveau utilisateur vers le niveau d'accès QR
 */
function mapUserLevelToAccessLevel(
  userType: 'admin' | 'partner' | 'exhibitor' | 'visitor',
  userLevel: string
): 'basic' | 'premium' | 'vip' | 'partner' | 'exhibitor' {
  switch (userType) {
    case 'admin':
      return 'partner'; // Admin has highest access
    case 'partner':
      return 'partner';
    case 'exhibitor':
      return 'exhibitor';
    case 'visitor':
      // Map visitor levels: 'free' maps to 'basic' access, 'premium' stays 'premium'
      // Legacy: keep vip return type for backward compatibility with event access levels
      return userLevel === 'premium' ? 'vip' : 'basic';
    default:
      return 'basic';
  }
}

/**
 * Vérifie si un utilisateur peut accéder à un événement
 */
export function canAccessEvent(
  userType: 'admin' | 'partner' | 'exhibitor' | 'visitor',
  userLevel: string,
  eventId: string
): { canAccess: boolean; reason?: string; event?: EventAccess } {
  const event = salonEvents.find(e => e.eventId === eventId);
  
  if (!event) {
    return { canAccess: false, reason: 'Événement non trouvé.' };
  }

  // Check if event is full
  if (event.currentAttendees >= event.maxCapacity) {
    return { canAccess: false, reason: 'Événement complet.', event };
  }

  // Admin can access everything
  if (userType === 'admin') {
    return { canAccess: true, event };
  }

  // Check access based on event type and user level
  switch (event.eventType) {
    case 'public':
      return { canAccess: true, event };
      
    case 'premium':
      if (userType === 'partner' || userType === 'exhibitor') {
        return { canAccess: true, event };
      }
      if (userType === 'visitor' && userLevel === 'premium') {
        return { canAccess: true, event };
      }
      return { canAccess: false, reason: 'Accès premium requis.', event };

    case 'vip':
      if (userType === 'partner') {
        return { canAccess: true, event };
      }
      if (userType === 'exhibitor' && userLevel === 'platinum') {
        return { canAccess: true, event };
      }
      if (userType === 'visitor' && userLevel === 'premium') {
        return { canAccess: true, event };
      }
      return { canAccess: false, reason: 'Accès VIP requis.', event };
      
    case 'partner':
      if (userType === 'partner') {
        return { canAccess: true, event };
      }
      return { canAccess: false, reason: 'Réservé aux partenaires.', event };
      
    case 'gala':
      if (userType === 'partner') {
        return { canAccess: true, event };
      }
      if (userType === 'exhibitor' && userLevel === 'platinum') {
        return { canAccess: true, event };
      }
      if (userType === 'visitor' && userLevel === 'premium') {
        return { canAccess: true, event };
      }
      return { canAccess: false, reason: 'Invité VIP requis pour le gala.', event };
      
    default:
      return { canAccess: false, reason: 'Type d\'événement non reconnu.', event };
  }
}

/**
 * Obtient tous les événements accessibles pour un utilisateur
 */
export function getAccessibleEvents(
  userType: 'admin' | 'partner' | 'exhibitor' | 'visitor',
  userLevel: string
): EventAccess[] {
  return salonEvents.filter(event => {
    const access = canAccessEvent(userType, userLevel, event.eventId);
    return access.canAccess;
  });
}

/**
 * Obtient tous les événements du salon
 */
export function getAllEvents(): EventAccess[] {
  return salonEvents;
}

/**
 * Valide un QR code
 */
export function validateQRCode(qrData: QRCodeData): { valid: boolean; reason?: string } {
  // Check expiration
  if (new Date() > qrData.validUntil) {
    return { valid: false, reason: 'QR code expiré.' };
  }

  // Validate signature (simplified validation)
  const expectedDataString = `${qrData.userId}-${qrData.userType}-${qrData.accessLevel}-${qrData.eventId || 'general'}-${qrData.validUntil.toISOString()}`;
  const expectedSignature = btoa(expectedDataString).slice(0, 16);
  
  if (qrData.signature !== expectedSignature) {
    return { valid: false, reason: 'QR code non valide ou corrompu.' };
  }

  return { valid: true };
}

/**
 * Formate les données QR pour l'affichage dans le QR code
 */
export function formatQRCodeForDisplay(qrData: QRCodeData): string {
  return JSON.stringify({
    u: qrData.userId,
    t: qrData.userType,
    l: qrData.accessLevel,
    e: qrData.eventId,
    v: qrData.validUntil.toISOString(),
    p: qrData.permissions,
    s: qrData.signature,
  });
}

/**
 * Parse les données QR depuis le format affiché
 */
export function parseQRCodeFromDisplay(qrString: string): QRCodeData | null {
  try {
    const parsed = JSON.parse(qrString);
    return {
      userId: parsed.u,
      userType: parsed.t,
      accessLevel: parsed.l,
      eventId: parsed.e,
      validUntil: new Date(parsed.v),
      permissions: parsed.p,
      signature: parsed.s,
    };
  } catch {
    return null;
  }
}

/**
 * Obtient le niveau d'accès le plus élevé pour un utilisateur
 */
export function getHighestAccessLevel(
  userType: 'admin' | 'partner' | 'exhibitor' | 'visitor',
  userLevel: string
): { 
  level: string; 
  description: string; 
  capabilities: string[] 
} {
  switch (userType) {
    case 'admin':
      return {
        level: 'Administrateur',
        description: 'Accès illimité à tous les événements et fonctionnalités.',
        capabilities: [
          'Accès à tous les événements',
          'Gestion des participants',
          'Statistiques complètes',
          'Modération des contenus',
        ],
      };

    case 'partner': {
      const partnerLevel = userLevel === 'platinum' ? 'Partenaire Platinum' :
                          userLevel === 'gold' ? 'Partenaire Gold' :
                          userLevel === 'silver' ? 'Partenaire Silver' : 'Partenaire Bronze';
      return {
        level: partnerLevel,
        description: 'Accès privilégié aux événements partenaires et networking exclusif.',
        capabilities: [
          'Événements partenaires exclusifs',
          'Networking premium illimité',
          'Accès lounge exécutif',
          'Priorité sur les rendez-vous',
          ...(userLevel === 'platinum' || userLevel === 'gold' ? ['Dîner de gala'] : []),
        ],
      };
    }

    case 'exhibitor': {
      const exhibitorLevel = userLevel === 'platinum' ? 'Exposant Platinum' :
                             userLevel === 'premium' ? 'Exposant Premium' : 'Exposant Standard';
      return {
        level: exhibitorLevel,
        description: 'Accès exposant avec privilèges de présentation et networking.',
        capabilities: [
          'Stand d\'exposition',
          'Forum exposants',
          'Networking professionnel',
          'Gestion des rendez-vous',
          ...(userLevel === 'platinum' ? ['Événements VIP', 'Dîner de gala'] : []),
        ],
      };
    }

    case 'visitor': {
      const visitorLevel = userLevel === 'premium' ? 'Visiteur Premium' : 'Visiteur Gratuit';
      return {
        level: visitorLevel,
        description: 'Accès visiteur avec fonctionnalités selon le forfait.',
        capabilities: [
          'Accès aux expositions',
          ...(userLevel === 'premium' ? ['Networking illimité', 'Ateliers premium', 'Événements VIP', 'Lounge exécutif', 'Dîner de gala'] : []),
        ],
      };
    }

    default:
      return {
        level: 'Non défini',
        description: 'Niveau d\'accès non reconnu.',
        capabilities: [],
      };
  }
}