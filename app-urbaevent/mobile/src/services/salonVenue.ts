import { parseStandPinOverrides } from '../lib/floorPlanStandPins';
import { SALON_INFO } from '../data/salons';
import { supabase } from '../lib/supabase';

export interface VenueMapInfo {
  floorPlanUrl: string | null;
  venueName: string;
  city: string;
  halls: string[];
  standPinOverrides: Record<string, { x: number; y: number }>;
}

export async function fetchVenueMapInfo(salonId = ''): Promise<VenueMapInfo> {
  const fallback: VenueMapInfo = {
    floorPlanUrl: null,
    venueName: SALON_INFO.venue,
    city: SALON_INFO.city,
    halls: ['A', 'B', 'C', 'D'],
    standPinOverrides: {},
  };

  try {
    let salonQuery = supabase
      .from('salons')
      .select('floor_plan_url, location, name, config');

    if (salonId) {
      salonQuery = salonQuery.eq('id', salonId);
    } else {
      salonQuery = salonQuery.eq('is_active', true).order('is_default', { ascending: false }).limit(1);
    }

    const { data: salon } = await salonQuery.maybeSingle();

    let exhibitorsQuery = supabase
      .from('exhibitors')
      .select('hall_number')
      .eq('verified', true)
      .not('hall_number', 'is', null)
      .limit(200);

    if (salonId) {
      exhibitorsQuery = exhibitorsQuery.eq('salon_id', salonId);
    }

    const { data: exhibitors } = await exhibitorsQuery;

    const halls = [...new Set((exhibitors ?? []).map((e) => String(e.hall_number).trim()).filter(Boolean))].sort();

    if (salon) {
      const config = (salon.config as { halls?: string[]; floor_plan_stands?: unknown }) ?? {};
      const standPinOverrides = parseStandPinOverrides(config.floor_plan_stands);
      return {
        floorPlanUrl: (salon.floor_plan_url as string) ?? null,
        venueName: (salon.name as string) ?? fallback.venueName,
        city: (salon.location as string) ?? fallback.city,
        halls: halls.length ? halls : config.halls ?? fallback.halls,
        standPinOverrides,
      };
    }

    return { ...fallback, halls: halls.length ? halls : fallback.halls };
  } catch {
    return fallback;
  }
}
