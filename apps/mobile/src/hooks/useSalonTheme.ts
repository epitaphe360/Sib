import { useSalon } from '../context/SalonContext';
import { getUrbaSalonTheme, type UrbaSalonTheme } from '../data/urbaCatalog';

export function useSalonTheme(): UrbaSalonTheme | null {
  const { activeSalon } = useSalon();
  if (!activeSalon) return null;
  return getUrbaSalonTheme(activeSalon);
}
