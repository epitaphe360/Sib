import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findExhibitorsWithData() {
  console.log('\n🔍 === RECHERCHE D\'EXPOSANTS AVEC DONNÉES COMPLÈTES ===\n');
  
  // Récupérer les 10 premiers exposants
  const { data: exhibitors } = await supabase
    .from('exhibitors')
    .select('id, company_name, user_id, featured, verified')
    .limit(10);
  
  if (!exhibitors) {
    console.log('❌ Aucun exposant trouvé');
    return;
  }
  
  console.log(`✅ ${exhibitors.length} exposants trouvés\n`);
  
  for (const exhibitor of exhibitors) {
    // Récupérer l'utilisateur
    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', exhibitor.user_id)
      .single();
    
    console.log(`\n🏢 ${exhibitor.company_name}`);
    console.log(`   Email: ${user?.email || 'N/A'}`);
    console.log(`   Featured: ${exhibitor.featured ? 'Oui' : 'Non'}`);
    
    // Vérifier mini sites
    const { count: miniSiteCount } = await supabase
      .from('mini_sites')
      .select('id', { count: 'exact', head: true })
      .eq('exhibitor_id', exhibitor.id);
    
    // Vérifier produits
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('exhibitor_id', exhibitor.id);
    
    console.log(`   🌐 Mini sites: ${miniSiteCount || 0}`);
    console.log(`   📦 Produits: ${productCount || 0}`);
    
    if (miniSiteCount > 0 || productCount > 0) {
      console.log('   ✅ A DES DONNÉES - BON CANDIDAT');
    }
  }
}

findExhibitorsWithData().catch(console.error);
