export type UserType = 'admin' | 'partner' | 'exhibitor' | 'visitor';
export type VisitorPassType = 'free' | 'premium';
export type ExhibitorStatus = 'basic' | 'premium' | 'platinum';
export type PartnerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface NetworkingPermissions {
  canAccessNetworking: boolean;
  canSendMessages: boolean;
  canViewProfiles: boolean;
  canMakeConnections: boolean;
  canScheduleMeetings: boolean;
  canAccessPremiumFeatures: boolean;
  canAccessVIPLounge: boolean;
  canAccessPartnerEvents: boolean;
  maxConnectionsPerDay: number;
  maxMessagesPerDay: number;
  maxMeetingsPerDay: number;
  priorityLevel: number; // 1-10, higher = more priority
  canBypassQueue: boolean;
  canAccessAIRecommendations: boolean;
  canAccessAnalytics: boolean;
}

export interface EventAccessPermissions {
  canAccessPublicEvents: boolean;
  canAccessPremiumWorkshops: boolean;
  canAccessVIPEvents: boolean;
  canAccessPartnerExclusives: boolean;
  canAccessNetworkingBreakfast: boolean;
  canAccessGalaDinner: boolean;
  canAccessExecutiveLounge: boolean;
  maxEventsPerDay: number;
  hasQRAccess: boolean;
  qrAccessLevel: 'basic' | 'premium' | 'vip' | 'partner' | 'exhibitor';
}

/**
 * Calcule les permissions de réseautage basées sur le type d'utilisateur et le forfait
 */
export function getNetworkingPermissions(userType: UserType, userLevel?: string): NetworkingPermissions {
  const basePermissions: NetworkingPermissions = {
    canAccessNetworking: false,
    canSendMessages: false,
    canViewProfiles: false,
    canMakeConnections: false,
    canScheduleMeetings: false,
    canAccessPremiumFeatures: false,
    canAccessVIPLounge: false,
    canAccessPartnerEvents: false,
    maxConnectionsPerDay: 0,
    maxMessagesPerDay: 0,
    maxMeetingsPerDay: 0,
    priorityLevel: 0,
    canBypassQueue: false,
    canAccessAIRecommendations: false,
    canAccessAnalytics: false,
  };

  switch (userType) {
    case 'admin':
      return {
        ...basePermissions,
        canAccessNetworking: true,
        canSendMessages: true,
        canViewProfiles: true,
        canMakeConnections: true,
        canScheduleMeetings: true,
        canAccessPremiumFeatures: true,
        canAccessVIPLounge: true,
        canAccessPartnerEvents: true,
        maxConnectionsPerDay: -1, // Unlimited
        maxMessagesPerDay: -1,
        maxMeetingsPerDay: -1,
        priorityLevel: 10,
        canBypassQueue: true,
        canAccessAIRecommendations: true,
        canAccessAnalytics: true,
      };

    case 'partner': {
      const partnerTier = (userLevel as PartnerTier) || 'bronze';
      const partnerMultiplier = getPartnerMultiplier(partnerTier);
      return {
        ...basePermissions,
        canAccessNetworking: true,
        canSendMessages: true,
        canViewProfiles: true,
        canMakeConnections: true,
        canScheduleMeetings: true,
        canAccessPremiumFeatures: true,
        canAccessVIPLounge: partnerTier !== 'bronze',
        canAccessPartnerEvents: true,
        maxConnectionsPerDay: 50 * partnerMultiplier,
        maxMessagesPerDay: 100 * partnerMultiplier,
        maxMeetingsPerDay: 15 * partnerMultiplier,
        priorityLevel: 7 + partnerMultiplier,
        canBypassQueue: partnerTier === 'gold' || partnerTier === 'platinum',
        canAccessAIRecommendations: true,
        canAccessAnalytics: partnerTier !== 'bronze',
      };
    }

    case 'exhibitor': {
      const exhibitorStatus = (userLevel as ExhibitorStatus) || 'basic';
      const exhibitorMultiplier = getExhibitorMultiplier(exhibitorStatus);
      return {
        ...basePermissions,
        canAccessNetworking: true,
        canSendMessages: true,
        canViewProfiles: true,
        canMakeConnections: true,
        canScheduleMeetings: true,
        canAccessPremiumFeatures: exhibitorStatus !== 'basic',
        canAccessVIPLounge: exhibitorStatus === 'platinum',
        canAccessPartnerEvents: false,
        maxConnectionsPerDay: 20 * exhibitorMultiplier,
        maxMessagesPerDay: 50 * exhibitorMultiplier,
        maxMeetingsPerDay: 8 * exhibitorMultiplier,
        priorityLevel: 4 + exhibitorMultiplier,
        canBypassQueue: exhibitorStatus === 'platinum',
        canAccessAIRecommendations: true,
        canAccessAnalytics: exhibitorStatus !== 'basic',
      };
    }

    case 'visitor': {
      const visitorPass = (userLevel as VisitorPassType) || 'free';
      return getVisitorPermissions(visitorPass);
    }

    default:
      return basePermissions;
  }
}

/**
 * Permissions spécifiques aux visiteurs basées sur leur forfait
 */
function getVisitorPermissions(passType: VisitorPassType): NetworkingPermissions {
  const baseVisitorPermissions: NetworkingPermissions = {
    canAccessNetworking: false,
    canSendMessages: false,
    canViewProfiles: true, // Can always view public profiles
    canMakeConnections: false,
    canScheduleMeetings: false,
    canAccessPremiumFeatures: false,
    canAccessVIPLounge: false,
    canAccessPartnerEvents: false,
    maxConnectionsPerDay: 0,
    maxMessagesPerDay: 0,
    maxMeetingsPerDay: 0,
    priorityLevel: 1,
    canBypassQueue: false,
    canAccessAIRecommendations: false,
    canAccessAnalytics: false,
  };

  switch (passType) {
    case 'free':
      // Visiteur gratuit : AUCUN accès au réseautage
      return {
        ...baseVisitorPermissions,
        canAccessNetworking: false,
        canViewProfiles: true,
      };

    case 'premium':
      return {
        ...baseVisitorPermissions,
        canAccessNetworking: true,
        canSendMessages: true,
        canMakeConnections: true,
        canScheduleMeetings: true,
        canAccessPremiumFeatures: true,
        canAccessVIPLounge: true,
        canAccessPartnerEvents: true,
        maxConnectionsPerDay: 1000,
        maxMessagesPerDay: 1000,
        maxMeetingsPerDay: 1000,
        priorityLevel: 10,
        canBypassQueue: true,
        canAccessAIRecommendations: false,
        canAccessAnalytics: true,
      };

    default:
      return baseVisitorPermissions;
  }
}

/**
 * Calcule les permissions d'accès aux événements
 */
export function getEventAccessPermissions(userType: UserType, userLevel?: string): EventAccessPermissions {
  const baseEventPermissions: EventAccessPermissions = {
    canAccessPublicEvents: true,
    canAccessPremiumWorkshops: false,
    canAccessVIPEvents: false,
    canAccessPartnerExclusives: false,
    canAccessNetworkingBreakfast: false,
    canAccessGalaDinner: false,
    canAccessExecutiveLounge: false,
    maxEventsPerDay: 0,
    hasQRAccess: false,
    qrAccessLevel: 'basic',
  };

  switch (userType) {
    case 'admin':
      return {
        ...baseEventPermissions,
        canAccessPremiumWorkshops: true,
        canAccessVIPEvents: true,
        canAccessPartnerExclusives: true,
        canAccessNetworkingBreakfast: true,
        canAccessGalaDinner: true,
        canAccessExecutiveLounge: true,
        maxEventsPerDay: -1,
        hasQRAccess: true,
        qrAccessLevel: 'partner',
      };

    case 'partner': {
      const partnerTier = (userLevel as PartnerTier) || 'bronze';
      return {
        ...baseEventPermissions,
        canAccessPremiumWorkshops: true,
        canAccessVIPEvents: partnerTier !== 'bronze',
        canAccessPartnerExclusives: true,
        canAccessNetworkingBreakfast: true,
        canAccessGalaDinner: partnerTier === 'gold' || partnerTier === 'platinum',
        canAccessExecutiveLounge: partnerTier === 'platinum',
        maxEventsPerDay: partnerTier === 'platinum' ? -1 : 10,
        hasQRAccess: true,
        qrAccessLevel: 'partner',
      };
    }

    case 'exhibitor': {
      const exhibitorStatus = (userLevel as ExhibitorStatus) || 'basic';
      return {
        ...baseEventPermissions,
        canAccessPremiumWorkshops: exhibitorStatus !== 'basic',
        canAccessVIPEvents: exhibitorStatus === 'platinum',
        canAccessPartnerExclusives: false,
        canAccessNetworkingBreakfast: true,
        canAccessGalaDinner: exhibitorStatus === 'platinum',
        canAccessExecutiveLounge: exhibitorStatus === 'platinum',
        maxEventsPerDay: exhibitorStatus === 'platinum' ? -1 : 8,
        hasQRAccess: true,
        qrAccessLevel: 'exhibitor',
      };
    }

    case 'visitor': {
      const visitorPass = (userLevel as VisitorPassType) || 'free';
      return getVisitorEventPermissions(visitorPass);
    }

    default:
      return baseEventPermissions;
  }
}

/**
 * Permissions d'événements spécifiques aux visiteurs
 */
function getVisitorEventPermissions(passType: VisitorPassType): EventAccessPermissions {
  const baseVisitorEventPermissions: EventAccessPermissions = {
    canAccessPublicEvents: true,
    canAccessPremiumWorkshops: false,
    canAccessVIPEvents: false,
    canAccessPartnerExclusives: false,
    canAccessNetworkingBreakfast: false,
    canAccessGalaDinner: false,
    canAccessExecutiveLounge: false,
    maxEventsPerDay: 3,
    hasQRAccess: false,
    qrAccessLevel: 'basic',
  };

  switch (passType) {
    case 'free':
      return {
        ...baseVisitorEventPermissions,
        maxEventsPerDay: 2,
        hasQRAccess: true,
        qrAccessLevel: 'basic',
      };

    case 'premium':
      // Pass Premium VIP 700€ : Accès VIP complet à tous les événements
      return {
        ...baseVisitorEventPermissions,
        canAccessPremiumWorkshops: true,
        canAccessVIPEvents: true,
        canAccessPartnerExclusives: true,
        canAccessNetworkingBreakfast: true,
        canAccessGalaDinner: true,
        canAccessExecutiveLounge: false,
        maxEventsPerDay: -1, // Illimité
        hasQRAccess: true,
        qrAccessLevel: 'vip',
      };

    default:
      return baseVisitorEventPermissions;
  }
}

/**
 * Utilitaires pour calculer les multiplicateurs
 */
function getPartnerMultiplier(tier: PartnerTier): number {
  switch (tier) {
    case 'bronze': return 1;
    case 'silver': return 1.5;
    case 'gold': return 2;
    case 'platinum': return 3;
    default: return 1;
  }
}

function getExhibitorMultiplier(status: ExhibitorStatus): number {
  switch (status) {
    case 'basic': return 1;
    case 'premium': return 1.5;
    case 'platinum': return 2;
    default: return 1;
  }
}

/**
 * Vérifie si un utilisateur peut effectuer une action de réseautage
 */
export function canPerformNetworkingAction(
  userType: UserType,
  userLevel: string | undefined,
  action: keyof NetworkingPermissions
): boolean {
  const permissions = getNetworkingPermissions(userType, userLevel);
  return permissions[action] as boolean;
}

/**
 * Vérifie les limites quotidiennes pour un utilisateur
 */
export function checkDailyLimits(
  userType: UserType,
  userLevel: string | undefined,
  currentUsage: { connections: number; messages: number; meetings: number }
): {
  canMakeConnection: boolean;
  canSendMessage: boolean;
  canScheduleMeeting: boolean;
  remainingConnections: number;
  remainingMessages: number;
  remainingMeetings: number;
} {
  const permissions = getNetworkingPermissions(userType, userLevel);
  
  const remainingConnections = permissions.maxConnectionsPerDay === -1 
    ? -1 
    : Math.max(0, permissions.maxConnectionsPerDay - currentUsage.connections);
    
  const remainingMessages = permissions.maxMessagesPerDay === -1 
    ? -1 
    : Math.max(0, permissions.maxMessagesPerDay - currentUsage.messages);
    
  const remainingMeetings = permissions.maxMeetingsPerDay === -1 
    ? -1 
    : Math.max(0, permissions.maxMeetingsPerDay - currentUsage.meetings);

  return {
    canMakeConnection: remainingConnections !== 0,
    canSendMessage: remainingMessages !== 0,
    canScheduleMeeting: remainingMeetings !== 0,
    remainingConnections,
    remainingMessages,
    remainingMeetings,
  };
}

/**
 * Génère un message d'erreur personnalisé pour les limitations
 */
export function getPermissionErrorMessage(
  userType: UserType,
  userLevel: string | undefined,
  action: string
): string {
  const permissions = getNetworkingPermissions(userType, userLevel);
  
  if (userType === 'visitor' && userLevel === 'free') {
    return "🚫 Le réseautage n'est pas disponible avec le forfait gratuit. Veuillez mettre à niveau votre forfait pour accéder aux fonctionnalités de réseautage.";
  }
  
  if (!permissions.canAccessNetworking) {
    return "🚫 Vous n'avez pas accès aux fonctionnalités de réseautage.";
  }
  
  switch (action) {
    case 'message':
      return "📨 Vous avez atteint votre limite quotidienne de messages. Revenez demain ou mettez à niveau votre forfait.";
    case 'connection':
      return "🤝 Vous avez atteint votre limite quotidienne de nouvelles connexions. Revenez demain ou mettez à niveau votre forfait.";
    case 'meeting':
      return "📅 Vous avez atteint votre limite quotidienne de rendez-vous. Revenez demain ou mettez à niveau votre forfait.";
    default:
      return "🚫 Cette action n'est pas disponible avec votre forfait actuel.";
  }
}