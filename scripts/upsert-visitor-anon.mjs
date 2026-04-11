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

const visitor = {
  email: process.env.VISITOR_EMAIL || 'visitor.real@siports.com',
  name: process.env.VISITOR_NAME || 'Real Visitor',
  type: 'visitor',
  profile: {
    firstName: 'Real',
    lastName: 'Visitor',
    company: 'Visitor Co. (anon)',
    position: 'Attendee',
    country: 'Morocco',
    bio: 'Created via anon script',
    interests: ['Networking'],
    objectives: ['Meet exhibitors']
  }
};

try {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      email: visitor.email,
      name: visitor.name,
      type: visitor.type,
      profile: visitor.profile
    }, { onConflict: 'email' })
    .select('*')
    .single();

  if (error) {
    console.error('Anon upsert error:', error);
    process.exit(1);
  }
  console.log('Anon upsert OK:', data?.id || data);
} catch (e) {
  console.error('Anon upsert failed:', e);
  process.exit(1);
}
