
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const email = 'visitor-vip@test.siport.com';
  console.log(`Checking user: ${email}`);

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (error) {
    console.error('Error fetching user:', error);
    return;
  }

  if (users && users.length > 0) {
    console.log('User found:', users[0]);
  } else {
    console.log('User not found in profiles table');
    // Check auth.users? We can't directly via client usually, but profiles should mirror it.
  }
}

checkUser();
