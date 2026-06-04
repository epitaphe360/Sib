import { useCallback, useEffect, useState } from 'react';
import { fetchTodayUsage } from '../api/networking';
import { useAuth } from '../context/AuthContext';
import {
  checkDailyLimits,
  getNetworkingPermissions,
  normalizeVisitorPass,
  type NetworkingPermissions,
} from '../lib/networkingPermissions';

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

  const level = user.type === 'visitor' ? normalizeVisitorPass(user.visitorLevel) : user.visitorLevel;
  const permissions: NetworkingPermissions = getNetworkingPermissions(user.type, level ?? user.visitorLevel);
  const limits = checkDailyLimits(user.type, level ?? user.visitorLevel, usage);

  return {
    permissions,
    limits,
    visitorPass: user.type === 'visitor' ? normalizeVisitorPass(user.visitorLevel) : undefined,
    refresh: load,
  };
}
