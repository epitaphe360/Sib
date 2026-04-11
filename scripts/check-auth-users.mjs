import 'dotenv/config';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const ACCOUNTS = [
  'visitor-free@test.siport.com',
  'visitor-vip@test.siport.com',
  'exhibitor-9m@test.siport.com',
  'exhibitor-18m@test.siport.com',
  'exhibitor-36m@test.siport.com',
  'partner-museum@test.siport.com',
  'partner-chamber@test.siport.com',
  'partner-sponsor@test.siport.com',
  'admin-test@test.siport.com'
];

(async () => {
  try {
    const url = `${SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/admin/users`;
    const res = await fetch(url, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      console.log(`HTTP ${res.status} ${res.statusText}`);
      return;
    }

    const data = await res.json();
    const users = data.users || [];
    
    console.log(`Found ${users.length} users in auth.users:`);
    for (const user of users) {
      console.log(`- ${user.email} | id=${user.id}`);
    }
  } catch (err) {
    console.error(`error -`, err.message || err);
  }
})();
