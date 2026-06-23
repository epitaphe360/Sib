/**
 * Zones cliquables sur le plan isométrique 3D (référence 1024×576).
 * Coordonnées normalisées 0–1 — ajustables si le plan change.
 */
export type FloorPlanHotspot = {
  id: string;
  hall: string;
  label: string;
  /** x, y, width, height en fraction de l'image */
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Halls A–E alignés sur les blocs visibles du plan 3D */
export const FLOOR_PLAN_HALL_HOTSPOTS: FloorPlanHotspot[] = [
  {
    id: 'hall-a',
    hall: 'A',
    label: 'Hall A',
    x: 0.03,
    y: 0.08,
    w: 0.22,
    h: 0.36,
  },
  {
    id: 'hall-b',
    hall: 'B',
    label: 'Hall B',
    x: 0.27,
    y: 0.08,
    w: 0.2,
    h: 0.36,
  },
  {
    id: 'hall-c',
    hall: 'C',
    label: 'Hall C',
    x: 0.49,
    y: 0.08,
    w: 0.2,
    h: 0.36,
  },
  {
    id: 'hall-d',
    hall: 'D',
    label: 'Hall D',
    x: 0.71,
    y: 0.08,
    w: 0.24,
    h: 0.36,
  },
  {
    id: 'hall-a-lower',
    hall: 'A',
    label: 'Hall A',
    x: 0.03,
    y: 0.46,
    w: 0.24,
    h: 0.42,
  },
  {
    id: 'hall-e',
    hall: 'E',
    label: 'Hall E',
    x: 0.3,
    y: 0.44,
    w: 0.64,
    h: 0.46,
  },
];

export function hotspotsForHall(hall: string): FloorPlanHotspot[] {
  return FLOOR_PLAN_HALL_HOTSPOTS.filter((z) => z.hall === hall);
}
