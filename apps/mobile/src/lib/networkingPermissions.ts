/**
 * Permissions réseautage — port de src/lib/networkingPermissions.ts
 */
import { partnerTierForNetworking } from './partnerTier';
export type UserType = 'admin' | 'partner' | 'exhibitor' | 'visitor' | 'security' | 'service_client';
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
  priorityLevel: number;
  canBypassQueue: boolean;
  canAccessAIRecommendations: boolean;
  canAccessAnalytics: boolean;
}

export function normalizeVisitorPass(level?: string | null): VisitorPassType {
  if (level === 'premium' || level === 'vip') return 'premium';
  return 'free';
}

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
    case 'security':
    case 'service_client':
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
        maxConnectionsPerDay: -1,
        maxMessagesPerDay: -1,
        maxMeetingsPerDay: -1,
        priorityLevel: 10,
        canBypassQueue: true,
        canAccessAIRecommendations: true,
        canAccessAnalytics: true,
      };

    case 'partner': {
      const partnerTier = partnerTierForNetworking(userLevel);
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

    case 'visitor':
      return getVisitorPermissions(normalizeVisitorPass(userLevel));

    default:
      return basePermissions;
  }
}

function getVisitorPermissions(passType: VisitorPassType): NetworkingPermissions {
  const baseVisitorPermissions: NetworkingPermissions = {
    canAccessNetworking: false,
    canSendMessages: false,
    canViewProfiles: true,
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

  if (passType === 'premium') {
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
      canAccessAnalytics: true,
    };
  }

  // Pass gratuit : scan-to-connect uniquement (0 RDV — aligné get_user_b2b_quota serveur)
  return {
    ...baseVisitorPermissions,
    canAccessNetworking: true,
    canViewProfiles: true,
    canMakeConnections: true,
    canScheduleMeetings: false,
    maxConnectionsPerDay: 20,
    maxMeetingsPerDay: 0,
  };
}

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

export function checkDailyLimits(
  userType: UserType,
  userLevel: string | undefined,
  currentUsage: { connections: number; messages: number; meetings: number }
) {
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

const PERMISSION_ERROR_FR: Record<string, string> = {
  'networking.permission.meetingLimitFree':
    'Limite quotidienne de rendez-vous atteinte. Revenez demain ou passez au Pass Premium VIP.',
  'networking.permission.freeBlocked':
    "Le réseautage complet (messages, recherche) est réservé au Pass Premium VIP. Vous pouvez scanner des badges pour créer des connexions.",
  'networking.permission.noAccess':
    "Vous n'avez pas accès aux fonctionnalités de réseautage.",
  'networking.permission.messageLimit': 'Limite quotidienne de messages atteinte.',
  'networking.permission.connectionLimit': 'Limite quotidienne de connexions atteinte.',
  'networking.permission.meetingLimit': 'Limite quotidienne de rendez-vous atteinte.',
  'networking.permission.actionUnavailable':
    "Cette action n'est pas disponible avec votre forfait.",
};

function permissionMsg(key: string, t?: (key: string) => string): string {
  return t?.(key) ?? PERMISSION_ERROR_FR[key] ?? key;
}

export function getPermissionErrorMessage(
  userType: UserType,
  userLevel: string | undefined,
  action: string,
  t?: (key: string) => string
): string {
  const pass = normalizeVisitorPass(userLevel);

  if (userType === 'visitor' && pass === 'free') {
    if (action === 'meeting') {
      return permissionMsg('networking.permission.meetingLimitFree', t);
    }
    return permissionMsg('networking.permission.freeBlocked', t);
  }

  const permissions = getNetworkingPermissions(userType, userLevel);
  if (!permissions.canAccessNetworking) {
    return permissionMsg('networking.permission.noAccess', t);
  }

  switch (action) {
    case 'message':
      return permissionMsg('networking.permission.messageLimit', t);
    case 'connection':
      return permissionMsg('networking.permission.connectionLimit', t);
    case 'meeting':
      return permissionMsg('networking.permission.meetingLimit', t);
    default:
      return permissionMsg('networking.permission.actionUnavailable', t);
  }
}
