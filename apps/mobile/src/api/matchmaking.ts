import { supabase } from '../lib/supabase';

export interface MatchSuggestion {
  id: string;
  name: string;
  email: string;
  type: string;
  visitorLevel?: string;
  score: number;
  reason: string;
}

export async function fetchMatchSuggestions(userId: string, limit = 12): Promise<MatchSuggestion[]> {
  const { data: me, error: meErr } = await supabase
    .from('users')
    .select('id, type, visitor_level, profile')
    .eq('id', userId)
    .single();

  if (meErr || !me) return [];

  const profile = (me.profile ?? {}) as Record<string, unknown>;
  const mySector = String(profile.businessSector ?? profile.sector ?? '');

  const { data: connections } = await supabase
    .from('connections')
    .select('from_user_id, to_user_id')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

  const connected = new Set<string>();
  (connections ?? []).forEach((c) => {
    connected.add(c.from_user_id);
    connected.add(c.to_user_id);
  });
  connected.add(userId);

  const { data: candidates, error } = await supabase
    .from('users')
    .select('id, name, email, type, visitor_level, profile')
    .neq('id', userId)
    .in('type', ['visitor', 'exhibitor', 'partner'])
    .limit(80);

  if (error) return [];

  const scored = (candidates ?? [])
    .filter((c) => !connected.has(c.id))
    .map((c) => {
      const p = (c.profile ?? {}) as Record<string, unknown>;
      const sector = String(p.businessSector ?? p.sector ?? '');
      let score = 10;
      let reason = 'Participant actif au salon';

      if (mySector && sector && sector.toLowerCase() === mySector.toLowerCase()) {
        score += 50;
        reason = `Même secteur : ${sector}`;
      } else if (sector) {
        score += 20;
        reason = `Secteur : ${sector}`;
      }

      if (c.type === 'exhibitor') {
        score += 15;
        reason = `Exposant — ${reason}`;
      }
      if (c.visitor_level === 'premium' || c.visitor_level === 'vip') {
        score += 10;
      }

      return {
        id: c.id,
        name: c.name ?? c.email,
        email: c.email,
        type: c.type,
        visitorLevel: c.visitor_level ?? undefined,
        score,
        reason,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
