import { supabase } from '../lib/supabase';
import { participantNamesMatch } from '../lib/participantNameMatch';

export async function lookupParticipant(query: string): Promise<{
  found: boolean;
  userId?: string;
  name?: string;
  email?: string;
  badge?: { badgeCode?: string };
  error?: string;
}> {
  const q = query.trim().toLowerCase();
  if (!q) return { found: false, error: 'Recherche vide' };

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, type, visitor_level')
    .or(`email.ilike.${q},name.ilike.%${q}%`)
    .limit(1)
    .maybeSingle();

  if (error) return { found: false, error: error.message };
  if (!data) return { found: false };

  const { data: badgeRow } = await supabase
    .from('user_badges')
    .select('badge_code, status, full_name')
    .eq('user_id', data.id)
    .eq('status', 'active')
    .maybeSingle();

  return {
    found: true,
    userId: data.id,
    name: data.name,
    email: data.email,
    badge: { badgeCode: badgeRow?.badge_code },
  };
}

/** Inscription sur place — sans mot de passe visiteur (connexion app via lien magique). */
export async function onSiteRegistration(params: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  sector?: string;
  operatorId: string;
}): Promise<{ userId: string; badgeCode: string; magicLinkSent: boolean }> {
  const name = `${params.firstName} ${params.lastName}`.trim();
  const email = params.email.toLowerCase().trim();

  const tempChars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const tempBytes = crypto.getRandomValues(new Uint8Array(8));
  const tempPassword = Array.from(tempBytes, (b) => tempChars[b % tempChars.length]).join('') + 'SIB!';

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: tempPassword,
    options: { data: { name, type: 'visitor', visitor_level: 'free' } },
  });

  if (authError) {
    const msg = authError.message?.toLowerCase() ?? '';
    if (msg.includes('already registered') || msg.includes('user already registered') || msg.includes('already exists')) {
      const { data: badges } = await supabase
        .from('user_badges')
        .select('user_id, badge_code, full_name')
        .eq('email', email);

      const nameMatch = (badges ?? []).find((b) =>
        participantNamesMatch(String(b.full_name ?? ''), {
          firstName: params.firstName,
          lastName: params.lastName,
        }),
      );

      if (nameMatch?.user_id) {
        return {
          userId: nameMatch.user_id,
          badgeCode: nameMatch.badge_code ?? `SIB-${String(nameMatch.user_id).slice(0, 8).toUpperCase()}`,
          magicLinkSent: false,
        };
      }

      const existing = await lookupParticipant(email);
      if (existing.found && existing.userId) {
        return {
          userId: existing.userId,
          badgeCode: existing.badge?.badgeCode ?? `SIB-${existing.userId.slice(0, 8).toUpperCase()}`,
          magicLinkSent: false,
        };
      }
      throw new Error(`Email déjà utilisé : ${email}`);
    }
    if (msg.includes('email rate limit') || msg.includes('over_email_send_rate')) {
      throw new Error('Trop d\'inscriptions — attendez 1 minute et réessayez');
    }
    throw authError;
  }
  if (!authData.user) throw new Error('Inscription impossible');

  const userId = authData.user.id;

  await supabase.from('users').insert([{
    id: userId,
    email,
    name,
    type: 'visitor',
    visitor_level: 'free',
    status: 'active',
    profile: {
      firstName: params.firstName,
      lastName: params.lastName,
      phone: params.phone ?? '',
      country: params.country ?? '',
      businessSector: params.sector ?? '',
      onSiteRegistration: true,
      registeredBy: params.operatorId,
      registeredAt: new Date().toISOString(),
      hasPassword: false,
      authMethod: 'magic_link',
    },
  }]);

  const { data: badgeData, error: badgeError } = await supabase.functions.invoke('generate-visitor-badge', {
    body: { userId, email, name, level: 'free', includePhoto: false },
  });
  if (badgeError || badgeData?.error || !badgeData?.badgeCode) {
    throw new Error(badgeError?.message ?? badgeData?.error ?? 'Impossible de générer le badge sur place');
  }

  let magicLinkSent = false;
  try {
    const { data: mlData, error: mlError } = await supabase.functions.invoke('send-magic-link', {
      body: {
        email,
        redirectTo: 'urbaevent://auth-callback',
        shouldCreateUser: false,
      },
    });
    magicLinkSent = !mlError && !mlData?.error && mlData?.ok !== false;
  } catch {
    magicLinkSent = false;
  }

  return { userId, badgeCode: badgeData.badgeCode as string, magicLinkSent };
}
