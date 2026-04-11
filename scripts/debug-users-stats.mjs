import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total users in table: ${users.length}`);
  
  const byType = users.reduce((acc, u) => {
    acc[u.type] = (acc[u.type] || 0) + 1;
    return acc;
  }, {});
  
  const byStatus = users.reduce((acc, u) => {
    acc[u.status || 'no-status'] = (acc[u.status || 'no-status'] || 0) + 1;
    return acc;
  }, {});

  console.log('By Type:', byType);
  console.log('By Status:', byStatus);
}

checkUsers();
