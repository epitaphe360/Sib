
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPartnersTable() {
  console.log('Checking partners table structure with guessed columns from createMissingTables.ts...');
  
  const columns = [
    'id', 'company_name', 'partner_type', 'sector', 'description', 
    'logo_url', 'website', 'verified', 'featured', 
    'partnership_level', 'benefits', 'created_at'
  ];

  const { data, error } = await supabase
    .from('partners')
    .select(columns.join(','))
    .limit(1);

  if (error) {
    console.error('Error selecting guessed columns:', error);
  } else {
    console.log('Success with guessed columns!');
    console.log('Data:', data);
  }
}

checkPartnersTable();
