import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simuler exactement la même requête que getExhibitors() dans supabaseService.ts
const { data, error } = await supabase
  .from('exhibitors')
  .select(`
    id,
    user_id,
    company_name,
    category,
    sector,
    description,
    logo_url,
    website,
    verified,
    featured,
    stand_number,
    contact_info,
    mini_site:mini_sites!mini_sites_exhibitor_id_fkey(id, theme, custom_colors, sections, published, views, last_updated),
    products!products_exhibitor_id_fkey(id, exhibitor_id, name, description, category, images, specifications, price, featured)
  `)
  .order('company_name', { ascending: true });

if (error) {
  console.log('❌ ERREUR REQUÊTE:', error.message);
  console.log('   Code:', error.code);
  console.log('   Détails:', error.details);
  console.log('\n→ La requête JOIN échoue ! Le code tombe sur un fallback sans logo_url.\n');
} else {
  console.log(`✅ Requête OK - ${data.length} exposants`);
  console.log('\n=== Logo_url dans les données ===');
  data.forEach(e => {
    console.log(`${e.logo_url ? '🖼️' : '⬜'} ${e.company_name} | logo: ${e.logo_url || 'NULL'}`);
  });
}
