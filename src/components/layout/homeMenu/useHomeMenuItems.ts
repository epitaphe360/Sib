import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import { HOME_MENU_ITEMS } from '../../../config/homeNavMenu';
import { getDefaultHomePageVariant, getHomeRouteForVariant } from '../../../config/homeVariants';
import { getPremiumHomeBase, isPremiumHomePath } from '../../home/sib2026/tokens';
import type { ResolvedHomeMenuItem } from './types';

export function useHomeMenuItems(): ResolvedHomeMenuItem[] {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const homeBase = isPremiumHomePath(pathname)
    ? getPremiumHomeBase(pathname)
    : getHomeRouteForVariant(getDefaultHomePageVariant());

  return useMemo(
    () =>
      HOME_MENU_ITEMS.map((item) => ({
        key: item.key,
        icon: item.icon,
        titleKey: item.titleKey,
        descKey: item.descKey,
        title: t(item.titleKey),
        description: t(item.descKey),
        href:
          item.key === 'visiter'
            ? `${homeBase}#visiter`
            : item.key === 'international' && isPremiumHomePath(pathname)
              ? `${homeBase}#international`
              : item.href,
        imageSrc: item.imageSrc,
      })),
    [t, homeBase, pathname]
  );
}
