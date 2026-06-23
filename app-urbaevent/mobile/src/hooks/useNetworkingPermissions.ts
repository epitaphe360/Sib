import { useCallback, useEffect, useState } from 'react';
import { fetchTodayUsage } from '../api/networking';
import { useAuth } from '../context/AuthContext';
import { partnerTierForNetworking } from '../lib/partnerTier';
import {
  checkDailyLimits,
  getNetworkingPermissions,
  normalizeVisitorPass,
  type NetworkingPermissions,
} from '../lib/networkingPermissions';
import type { AppUser } from '../types';

function effectiveLevel(user: AppUser): string | undefined {
  if (user.type === 'visitor') {
    if (user.status === 'pending_payment') return 'free';
    return normalizeVisitorPass(user.visitorLevel);
  }
  if (user.type === 'partner') {
    return partnerTierForNetworking(user.partnerTier);
  }
  return user.visitorLevel;
}

export function useNetworkingPermissions() {
  const { user } = useAuth();
  const [usage, setUsage] = useState({ connections: 0, messages: 0, meetings: 0 });

  const load = useCallback(async () => {
    if (!user) return;
    setUsage(await fetchTodayUsage(user.id));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (!user) {
    return {
      permissions: getNetworkingPermissions('visitor', 'free'),
      limits: checkDailyLimits('visitor', 'free', usage),
      visitorPass: 'free' as const,
      refresh: load,
    };
  }

  const level = effectiveLevel(user);
  const permissions: NetworkingPermissions = getNetworkingPermissions(user.type, level);
  const limits = checkDailyLimits(user.type, level, usage);

  return {
    permissions,
    limits,
    visitorPass: user.type === 'visitor' ? normalizeVisitorPass(
      user.status === 'pending_payment' ? 'free' : user.visitorLevel
    ) : undefined,
    refresh: load,
  };
}
