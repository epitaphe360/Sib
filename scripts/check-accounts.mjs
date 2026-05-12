import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await s.from('users').select('email,status,is_active,role');
console.log('\n=== TOUS LES COMPTES ===\n');
data.forEach(u => {
  const active = u.is_active ? '✅' : '❌';
  console.log(`${active} ${u.email} | ${u.status} | ${u.role}`);
});
console.log('\nTotal:', data.length);
