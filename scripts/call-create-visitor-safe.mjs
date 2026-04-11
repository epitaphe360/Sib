import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const url = process.env.VITE_SUPABASE_URL?.trim();
const anon = process.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, anon);

const email = process.env.VISITOR_EMAIL || 'visitor.real@siports.com';
const name = process.env.VISITOR_NAME || 'Real Visitor';

try {
  const { data, error } = await supabase.rpc('create_visitor_safe', {
    p_email: email,
    p_name: name,
    p_type: 'visitor',
    p_profile: {
      firstName: 'Real',
      lastName: 'Visitor',
      company: 'Visitor Co. (RPC)',
      position: 'Attendee',
      country: 'Morocco',
      bio: 'Created via RPC with SECURITY DEFINER'
    }
  });
  if (error) {
    console.error('RPC error:', error);
    process.exit(1);
  }
  console.log('RPC OK:', data?.id || data);
} catch (e) {
  console.error('RPC failed:', e);
  process.exit(1);
}
