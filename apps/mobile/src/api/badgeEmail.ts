import { supabase } from '../lib/supabase';

export async function requestBadgeByEmail(userId: string): Promise<void> {
  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .select('id, email, name, visitor_level')
    .eq('id', userId)
    .single();

  if (userErr || !userRow) throw userErr ?? new Error('Utilisateur introuvable');

  const level = userRow.visitor_level === 'vip' || userRow.visitor_level === 'premium' ? 'vip' : 'free';

  const { error } = await supabase.functions.invoke('generate-visitor-badge', {
    body: {
      userId: userRow.id,
      email: userRow.email,
      name: userRow.name ?? userRow.email,
      level,
    },
  });

  if (error) throw error;
}
