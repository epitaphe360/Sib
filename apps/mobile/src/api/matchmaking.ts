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
    .select('requester_id, addressee_id')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  const connected = new Set<string>();
  (connections ?? []).forEach((c) => {
    connected.add(c.requester_id);
    connected.add(c.addressee_id);
  });
  connected.add(userId);

  const { data: candidates, error } = await supabase.rpc('list_networking_candidates', {
    p_exclude: userId,
    p_limit: 80,
  });

  const rows = (error
    ? (
      await supabase
        .from('users')
        .select('id, name, email, type, visitor_level, profile')
        .neq('id', userId)
        .in('type', ['visitor', 'exhibitor', 'partner'])
        .limit(80)
    ).data
    : candidates) as Array<{
    id: string;
    name: string | null;
    email: string;
    type: string;
    visitor_level?: string | null;
    profile?: Record<string, unknown> | null;
  }> | null;

  if (error && !rows) return [];

  const scored = (rows ?? [])
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
        reason = `${reason} · VIP`;
      }

      const mutualCount = (connections ?? []).filter(
        (conn) =>
          (conn.requester_id === c.id || conn.addressee_id === c.id) &&
          connected.has(conn.requester_id === c.id ? conn.addressee_id : conn.requester_id),
      ).length;
      if (mutualCount > 0) {
        score += mutualCount * 8;
        reason = `${reason} · ${mutualCount} connexion(s) en commun`;
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
