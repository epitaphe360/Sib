/**
 * Service de gestion des zones de contrôle d'accès
 * Persiste en localStorage avec fallback sur les zones par défaut.
 */

export interface ControlZone {
  id: string;
  name: string;
  icon: string;
  description: string;
  createdAt: string;
}

const STORAGE_KEY = 'sib_control_zones';

export const DEFAULT_ZONES: ControlZone[] = [
  { id: 'public',          name: 'Zone Publique',    icon: '🌐', description: 'Accès libre au grand public',                  createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'exhibition_hall', name: "Hall d'Exposition", icon: '🏛️', description: 'Espace principal des exposants',               createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'vip_lounge',      name: 'Salon VIP',         icon: '⭐', description: 'Espace réservé aux visiteurs VIP',             createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'networking_area', name: 'Zone Networking',   icon: '🤝', description: 'Espace de mise en relation B2B',               createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'backstage',       name: 'Backstage',         icon: '🎭', description: 'Zone technique et organisateurs',              createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'partner_area',    name: 'Zone Sponsors',     icon: '💼', description: 'Espace réservé aux sponsors et partenaires',   createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'exhibitor_area',  name: 'Zone Exposants',    icon: '🏢', description: 'Espace back-office des exposants',             createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'technical_area',  name: 'Zone Technique',    icon: '🔧', description: 'Infrastructure et support technique',          createdAt: '2026-01-01T00:00:00.000Z' },
];

export function getZones(): ControlZone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { return DEFAULT_ZONES; }
    const parsed = JSON.parse(raw) as ControlZone[];
    return parsed.length > 0 ? parsed : DEFAULT_ZONES;
  } catch {
    return DEFAULT_ZONES;
  }
}

export function saveZones(zones: ControlZone[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
}

export function addZone(zone: Omit<ControlZone, 'id' | 'createdAt'>): ControlZone {
  const zones = getZones();
  const newZone: ControlZone = {
    ...zone,
    id: `zone_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveZones([...zones, newZone]);
  return newZone;
}

export function updateZone(id: string, updates: Partial<Omit<ControlZone, 'id' | 'createdAt'>>): void {
  const zones = getZones();
  const updated = zones.map(z => z.id === id ? { ...z, ...updates } : z);
  saveZones(updated);
}

export function deleteZone(id: string): void {
  const zones = getZones();
  saveZones(zones.filter(z => z.id !== id));
}

export function resetZones(): void {
  saveZones(DEFAULT_ZONES);
}
