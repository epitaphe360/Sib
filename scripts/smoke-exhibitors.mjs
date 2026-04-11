import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(2);
}

const supabase = createClient(url, anon);

async function run() {
  try {
    console.log('Fetching up to 5 exhibitors...');
    const { data, error, status } = await supabase
      .from('exhibitors')
      .select('id,company_name,category,sector,verified')
      .limit(5);

    if (error) {
      console.error('Supabase error:', status, error.message || error);

      // If anon fails with 401, try service role (server key) to see if it's a revoked anon key
      if (status === 401) {
        const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceKey) {
          console.log('Anon key failed with 401 — retrying with SERVICE_ROLE key (not printed)...');
          const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
          const { data: adminData, error: adminError, status: adminStatus } = await admin
            .from('exhibitors')
            .select('id')
            .limit(1);

          if (adminError) {
            console.error('Service role test error:', adminStatus, adminError.message || adminError);
            process.exit(5);
          }

          console.log('Service role test success — service role can access the DB.');
          process.exit(0);
        }
      }

      process.exit(3);
    }

    console.log('Success. Received', (data || []).length, 'rows');
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Unexpected error:', e);
    process.exit(4);
  }
}

run();
