import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixConstraint() {
  console.log('Attempting to fix payment_requests constraint...');
  
  // We can't run arbitrary SQL via the client unless we have an RPC
  // Let's check if we can use the REST API to find if there's an RPC
  
  const sql = `
    ALTER TABLE public.payment_requests 
    DROP CONSTRAINT IF EXISTS payment_requests_requested_level_check;
    
    ALTER TABLE public.payment_requests 
    ADD CONSTRAINT payment_requests_requested_level_check 
    CHECK (requested_level IN ('premium', 'silver', 'gold', 'platinium', 'museum'));
  `;

  console.log('Please run the following SQL in your Supabase SQL Editor:');
  console.log(sql);
  
  // Try to run it via RPC if it exists
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.log('RPC exec_sql not found or failed. This is expected if not set up.');
    } else {
      console.log('Successfully updated constraint via RPC!');
    }
  } catch (e) {
    console.log('RPC call failed.');
  }
}

fixConstraint();
