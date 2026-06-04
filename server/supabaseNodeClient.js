/**
 * Supabase client for Node.js servers (Railway, Docker).
 * Node < 22 has no native WebSocket — @supabase/realtime-js requires `ws`.
 */
import ws from 'ws';
import { createClient } from '@supabase/supabase-js';

const defaultServerAuth = {
  autoRefreshToken: false,
  persistSession: false,
};

/**
 * @param {string} url
 * @param {string} key
 * @param {import('@supabase/supabase-js').SupabaseClientOptions} [options]
 */
export function createSupabaseServerClient(url, key, options = {}) {
  const { auth, realtime, ...rest } = options;
  return createClient(url, key, {
    ...rest,
    auth: { ...defaultServerAuth, ...auth },
    realtime: {
      transport: ws,
      ...realtime,
    },
  });
}

export default createSupabaseServerClient;
