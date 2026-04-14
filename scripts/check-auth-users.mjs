import 'dotenv/config';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const ACCOUNTS = [
  'visitor-free@test.sib2026.ma',
  'visitor-vip@test.sib2026.ma',
  'exhibitor-9m@test.sib2026.ma',
  'exhibitor-18m@test.sib2026.ma',
  'exhibitor-36m@test.sib2026.ma',
  'partner-museum@test.sib2026.ma',
  'partner-chamber@test.sib2026.ma',
  'partner-sponsor@test.sib2026.ma',
  'admin-test@test.sib2026.ma'
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
