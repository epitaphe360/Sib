
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMinisites() {
  console.log('🔍 Vérification des Mini-Sites...\n');

  // 1. Get all exhibitors
  const { data: exhibitors, error: exhibitorsError } = await supabase
    .from('exhibitors')
    .select('id, user_id, company_name');

  if (exhibitorsError) {
    console.error('❌ Erreur fetching exhibitors:', exhibitorsError);
    return;
  }

  console.log(`📊 Total Exposants: ${exhibitors.length}`);

  // 2. Get all mini-sites
  const { data: miniSites, error: miniSitesError } = await supabase
    .from('mini_sites')
    .select('*');

  if (miniSitesError) {
    console.error('❌ Erreur fetching mini_sites:', miniSitesError);
    return;
  }

  console.log(`📊 Total Mini-Sites (custom): ${miniSites.length}`);

  // 3. Analyze coverage
  let withSite = 0;
  let withoutSite = 0;
  let publishedStrue = 0;
  let publishedFalse = 0;

  console.log('\n📝 Détail par exposant (Top 10 sans site):');
  
  for (const exhibitor of exhibitors) {
    // Check by exhibitor_id first (normal relation)
    let site = miniSites.find(s => s.exhibitor_id === exhibitor.id);
    
    // Check by user_id (if mismatched)
    if (!site) {
        site = miniSites.find(s => s.exhibitor_id === exhibitor.user_id);
    }

    if (site) {
      withSite++;
      if (site.published) publishedStrue++;
      else publishedFalse++;
    } else {
      withoutSite++;
      if (withoutSite <= 10) {
        console.log(`   - [SANS SITE] ${exhibitor.company_name} (ID: ${exhibitor.id})`);
      }
    }
  }

  console.log(`\n📈 Résumé:`);
  console.log(`   - Exposants avec Custom Mini-Site: ${withSite}`);
  console.log(`   - Exposants SANS Custom Mini-Site: ${withoutSite}`);
  console.log(`   - Mini-Sites Publiés: ${publishedStrue}`);
  console.log(`   - Mini-Sites Non-Publiés: ${publishedFalse}`);

  console.log('\n💡 Note: Le code a été mis à jour pour générer un site par défaut pour les "SANS SITE".');
}

verifyMinisites().catch(console.error);
