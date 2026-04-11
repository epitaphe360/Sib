import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

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
  console.log('Checking public.users table...');
  for (const email of ACCOUNTS) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.log(`${email}: NOT FOUND in public.users (${error.message})`);
    } else {
      console.log(`${email}: FOUND in public.users - id=${data.id} | type=${data.type} | status=${data.status}`);
    }
  }
})();
