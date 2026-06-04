import { useMemo } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { HOME_MENU_ITEMS } from '../../../config/homeNavMenu';
import type { ResolvedHomeMenuItem } from './types';

export function useHomeMenuItems(): ResolvedHomeMenuItem[] {
  const { t } = useTranslation();
  return useMemo(
    () =>
      HOME_MENU_ITEMS.map((item) => ({
        key: item.key,
        icon: item.icon,
        titleKey: item.titleKey,
        descKey: item.descKey,
        title: t(item.titleKey),
        description: t(item.descKey),
        href: item.href,
        imageSrc: item.imageSrc,
      })),
    [t]
  );
}
