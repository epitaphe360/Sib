import { FLOOR_PLAN_HALL_HOTSPOTS } from '../data/floorPlanHotspots';
import type { Exhibitor } from '../types';

export type StandPin = {
  exhibitorId: string;
  companyName: string;
  standLabel: string;
  hall: string;
  /** Centre du pin — coordonnées normalisées 0–1 sur l'image */
  x: number;
  y: number;
};

export type StandPinOverride = { x: number; y: number };

const HALL_ALIASES: Record<string, string> = {
  '1': 'A',
  '2': 'B',
  '3': 'C',
  '4': 'D',
  '5': 'E',
};

/** Normalise « Hall 1 », « A », « hall-a » → lettre hall */
export function normalizeHall(raw?: string | null): string {
  if (!raw?.trim()) return '';
  let s = raw.trim().toUpperCase().replace(/^HALL\s*/i, '').replace(/\s+/g, '');
  if (HALL_ALIASES[s]) return HALL_ALIASES[s];
  if (/^[A-E]$/.test(s)) return s;
  const letter = s.match(/^([A-E])[-_]?\d*/)?.[1];
  if (letter) return letter;
  return s.charAt(0);
}

function standSortKey(stand?: string): number {
  if (!stand) return 9999;
  const digits = stand.replace(/\D/g, '');
  return digits ? Number.parseInt(digits, 10) : stand.charCodeAt(0);
}

function hallBounds(hall: string): { x: number; y: number; w: number; h: number } {
  const zones = FLOOR_PLAN_HALL_HOTSPOTS.filter((z) => z.hall === hall);
  if (!zones.length) return { x: 0.1, y: 0.15, w: 0.8, h: 0.7 };
  const x = Math.min(...zones.map((z) => z.x));
  const y = Math.min(...zones.map((z) => z.y));
  const x2 = Math.max(...zones.map((z) => z.x + z.w));
  const y2 = Math.max(...zones.map((z) => z.y + z.h));
  return { x, y, w: x2 - x, h: y2 - y };
}

function inferHallFromStand(stand?: string): string {
  if (!stand) return '';
  const m = stand.trim().toUpperCase().match(/^([A-E])[-_\s]?\d*/);
  return m?.[1] ?? '';
}

function placeExhibitorsInHall(items: Exhibitor[], hall: string): StandPin[] {
  const bounds = hallBounds(hall);
  const sorted = [...items].sort(
    (a, b) => standSortKey(a.standNumber) - standSortKey(b.standNumber),
  );
  const n = sorted.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  const rows = Math.ceil(n / cols);
  const padX = 0.1;
  const padY = 0.14;
  const innerW = bounds.w * (1 - padX * 2);
  const innerH = bounds.h * (1 - padY * 2);
  const cellW = innerW / cols;
  const cellH = innerH / rows;

  return sorted.map((ex, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = bounds.x + bounds.w * padX + col * cellW + cellW / 2;
    const y = bounds.y + bounds.h * padY + row * cellH + cellH / 2;
    return {
      exhibitorId: ex.id,
      companyName: ex.companyName,
      standLabel: ex.standNumber?.trim() || `${hall}${i + 1}`,
      hall,
      x,
      y,
    };
  });
}

/** Calcule les pins stand à partir des exposants + overrides admin optionnels */
export function computeStandPins(
  exhibitors: Exhibitor[],
  overrides: Record<string, StandPinOverride> = {},
): StandPin[] {
  const byHall = new Map<string, Exhibitor[]>();

  for (const ex of exhibitors) {
    const hall = normalizeHall(ex.hallNumber) || inferHallFromStand(ex.standNumber);
    if (!hall) continue;
    const list = byHall.get(hall) ?? [];
    list.push(ex);
    byHall.set(hall, list);
  }

  const pins: StandPin[] = [];
  for (const [hall, items] of byHall) {
    pins.push(...placeExhibitorsInHall(items, hall));
  }

  return pins.map((pin) => {
    const o =
      overrides[pin.exhibitorId] ??
      overrides[pin.standLabel] ??
      overrides[`${pin.hall}-${pin.standLabel}`];
    if (!o) return pin;
    return { ...pin, x: o.x, y: o.y };
  });
}

export function parseStandPinOverrides(
  raw: unknown,
): Record<string, StandPinOverride> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, StandPinOverride> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!val || typeof val !== 'object') continue;
    const x = Number((val as { x?: unknown }).x);
    const y = Number((val as { y?: unknown }).y);
    if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      out[key] = { x, y };
    }
  }
  return out;
}
