import { supabase } from '../lib/supabase';

export interface SpeedSession {
  id: string;
  title: string;
  status: string;
  startTime: string | null;
  endTime: string | null;
  maxParticipants: number;
  currentParticipants: number;
}

export async function fetchSpeedSessions(): Promise<SpeedSession[]> {
  const { data, error } = await supabase
    .from('speed_networking_sessions')
    .select('id, name, status, start_time, duration, max_participants, participants')
    .in('status', ['scheduled', 'active'])
    .order('start_time', { ascending: true })
    .limit(20);

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }

  return (data ?? []).map((row) => {
    const startTime = (row.start_time as string) ?? null;
    const durationMin = Number(row.duration ?? 5);
    const endTime = startTime
      ? new Date(new Date(startTime).getTime() + durationMin * 60_000).toISOString()
      : null;
    const participants = Array.isArray(row.participants) ? row.participants : [];
    return {
      id: row.id as string,
      title: (row.name as string) ?? 'Session',
      status: (row.status as string) ?? 'scheduled',
      startTime,
      endTime,
      maxParticipants: Number(row.max_participants ?? 0),
      currentParticipants: participants.length,
    };
  });
}

export async function joinSpeedSession(sessionId: string, _userId: string): Promise<void> {
  const { error } = await supabase.rpc('join_speed_networking_session', {
    p_session_id: sessionId,
  });

  if (error) throw error;
}
