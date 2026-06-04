/**
 * CJS variant — same WebSocket transport fix for Node < 22.
 */
const ws = require('ws');
const { createClient } = require('@supabase/supabase-js');

const defaultServerAuth = {
  autoRefreshToken: false,
  persistSession: false,
};

function createSupabaseServerClient(url, key, options = {}) {
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

module.exports = { createSupabaseServerClient };
