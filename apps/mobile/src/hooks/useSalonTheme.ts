import { useMemo } from 'react';
import { useSalon } from '../context/SalonContext';
import { getUrbaSalonTheme, type UrbaSalonTheme } from '../data/urbaCatalog';
import { useAppContent } from './useAppContent';

export function useSalonTheme(): UrbaSalonTheme | null {
  const { activeSalon } = useSalon();
  const { content } = useAppContent();
  return useMemo(() => {
    if (!activeSalon) return null;
    return getUrbaSalonTheme(activeSalon, content.salonStats);
  }, [activeSalon, content.salonStats]);
}
