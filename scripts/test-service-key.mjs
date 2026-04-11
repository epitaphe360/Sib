import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
let serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim();
if ((serviceKey.startsWith('"') && serviceKey.endsWith('"')) || (serviceKey.startsWith("'") && serviceKey.endsWith("'"))) {
  serviceKey = serviceKey.slice(1, -1).trim();
}

if (!url || !serviceKey) {
  console.error('Missing url or service key');
  process.exit(1);
}

const endpoint = `${url}/rest/v1/users?select=id&limit=1`;
console.log('GET', endpoint);

try {
  const res = await fetch(endpoint, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'X-Client-Info': 'svc-test/1.0'
    }
  });
  console.log('Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Body:', text.slice(0, 200));
  const rate = res.headers.get('x-ratelimit-remaining');
  if (rate) console.log('Rate remaining:', rate);
} catch (e) {
  console.error('Fetch error:', e);
}
