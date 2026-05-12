import { createClient } from '@supabase/supabase-js';

const s = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data: users } = await s.auth.admin.listUsers();

console.log('\n=== COMPTES AUTH (avec mot de passe) ===\n');
users.users.forEach(u => {
  if (!u.email.includes('1766') && !u.email.includes('bulk')) {
    console.log(u.email);
  }
});
console.log('\nTotal:', users.users.length);
