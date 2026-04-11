import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env then .env.local (if present)
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
let serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim();
// Remove accidental surrounding quotes
if ((serviceKey.startsWith('"') && serviceKey.endsWith('"')) || (serviceKey.startsWith("'") && serviceKey.endsWith("'"))) {
  serviceKey = serviceKey.slice(1, -1).trim();
}

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const exhibitor = {
  email: process.env.EXHIBITOR_EMAIL || 'exhibitor.test@siports.com',
  name: process.env.EXHIBITOR_NAME || 'Test Exhibitor',
  type: 'exhibitor',
  profile: {
    firstName: 'Test',
    lastName: 'Exhibitor',
    company: 'Test Solutions Inc.',
    position: 'CEO',
    country: 'Morocco',
    bio: 'Created via script for testing',
    interests: ['Technology', 'Innovation'],
    objectives: ['Showcase products', 'Network']
  }
};

async function main() {
  try {
    // First create the user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        email: exhibitor.email,
        name: exhibitor.name,
        type: exhibitor.type,
        profile: exhibitor.profile
      }, { onConflict: 'email' })
      .select('*')
      .single();

    if (userError) throw userError;
    console.log('Created/updated user:', userData);

    // Then create the exhibitor record
    const { data: existingExhibitor } = await supabase
      .from('exhibitors')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    let exhibitorData;
    if (existingExhibitor) {
      console.log('Exhibitor already exists:', existingExhibitor);
      exhibitorData = existingExhibitor;
    } else {
      const { data: newExhibitor, error: exhibitorError } = await supabase
        .from('exhibitors')
        .insert({
          user_id: userData.id,
          company_name: 'Test Solutions Inc.',
          category: 'port-industry',
          sector: 'IT',
          description: 'A test company for demonstrating the platform',
          logo_url: null,
          website: 'https://test-solutions.com',
          verified: true,
          featured: false,
          contact_info: {
            email: exhibitor.email,
            phone: '+212 6 12 34 56 78',
            address: '123 Test Street, Casablanca'
          }
        })
        .select('*')
        .single();

      if (exhibitorError) throw exhibitorError;
      console.log('Created exhibitor:', newExhibitor);
      exhibitorData = newExhibitor;
    }

  } catch (e) {
    console.error('Failed to create exhibitor:', e);
    process.exit(1);
  }
}

main();
