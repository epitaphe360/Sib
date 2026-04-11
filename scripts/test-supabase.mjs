import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('Testing anon key to:', url, ' length:', anon.length);
const supabase = createClient(url, anon);

try {
  const { data, error, count } = await supabase.from('users').select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Anon select error:', error);
  } else {
    console.log('Anon select OK, count header:', count);
  }
} catch (e) {
  console.error('Anon request failed:', e);
}
