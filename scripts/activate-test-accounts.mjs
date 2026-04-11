import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ADMIN_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. Set them before running this script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const ACCOUNTS = [
  { email: 'visitor-free@test.siport.com', type: 'visitor', visitor_level: 'free', status: 'active' },
  { email: 'visitor-vip@test.siport.com', type: 'visitor', visitor_level: 'vip', status: 'active' },
  { email: 'exhibitor-9m@test.siport.com', type: 'exhibitor', status: 'active' },
  { email: 'exhibitor-18m@test.siport.com', type: 'exhibitor', status: 'active' },
  { email: 'exhibitor-36m@test.siport.com', type: 'exhibitor', status: 'active' },
  { email: 'partner-museum@test.siport.com', type: 'partner', status: 'active' },
  { email: 'partner-chamber@test.siport.com', type: 'partner', status: 'active' },
  { email: 'partner-sponsor@test.siport.com', type: 'partner', status: 'active' },
  { email: 'admin-test@test.siport.com', type: 'admin', status: 'active' }
];

(async () => {
  console.log('🔧 Activation et configuration des comptes de test via Supabase...');
  for (const acc of ACCOUNTS) {
    try {
      // Update users table by email
      const { data, error } = await supabase
        .from('users')
        .upsert({ email: acc.email, type: acc.type, visitor_level: acc.visitor_level || null, status: acc.status || 'active' }, { onConflict: ['email'] });

      if (error) {
        console.error(`❌ Erreur upsert user ${acc.email}:`, error.message || error);
      } else {
        console.log(`✅ users table updated: ${acc.email}`);
      }

      // Also ensure auth.users metadata if available (update user_metadata)
      // Supabase auth API requires direct REST call with service role key
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_user_by_email`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: acc.email })
      }).catch(() => null);

      // If RPC not available, do a lookup in auth.users via admin endpoint
      // We'll try admin users endpoint
      const adminLookup = await fetch(`${SUPABASE_URL}/admin/v1/users?email=${encodeURIComponent(acc.email)}`, {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`
        }
      }).catch(() => null);

      if (adminLookup && adminLookup.ok) {
        const users = await adminLookup.json();
        if (Array.isArray(users) && users.length > 0) {
          const user = users[0];
          // Update user metadata if possible
          const updateRes = await fetch(`${SUPABASE_URL}/admin/v1/users/${user.id}`, {
            method: 'PUT',
            headers: {
              apikey: SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_metadata: { role: acc.type, visitor_level: acc.visitor_level || null }, app_metadata: { status: acc.status } })
          }).catch(() => null);

          if (updateRes && updateRes.ok) {
            console.log(`✅ auth user metadata updated for ${acc.email}`);
          } else {
            console.log(`ℹ️ Could not update auth metadata for ${acc.email} (maybe not supported in this Supabase version)`);
          }
        } else {
          console.log(`ℹ️ Aucun utilisateur auth trouvé pour ${acc.email} (peut-être créé via seed SQL).`);
        }
      } else {
        console.log(`ℹ️ Impossible d'interroger admin users pour ${acc.email}`);
      }

    } catch (err) {
      console.error(`❌ Exception pour ${acc.email}:`, err.message || err);
    }
  }

  console.log('🔧 Opération terminée.');
  process.exit(0);
})();
