import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

const exhibitorEmails = [
  'exhibitor-9m@test.sib2026.ma',
  'exhibitor-18m@test.sib2026.ma',
  'exhibitor-36m@test.sib2026.ma',
  'exhibitor-54m@test.sib2026.ma'
];

async function checkMiniSites() {
  console.log('🔍 Vérification des mini sites pour les exposants...\n');

  try {
    for (const email of exhibitorEmails) {
      // Récupérer le user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.log(`❌ ${email}: User non trouvé`);
        continue;
      }

      console.log(`\n📧 ${email}`);
      console.log(`   User: ${user.name}`);

      // Récupérer l'exhibitor
      const { data: exhibitor, error: exhibitorError } = await supabase
        .from('exhibitors')
        .select('id, company_name, description')
        .eq('user_id', user.id)
        .single();

      if (exhibitorError || !exhibitor) {
        console.log(`   ❌ Pas d'enregistrement exhibitor`);
        continue;
      }

      console.log(`   Exhibitor: ${exhibitor.company_name}`);

      // Compter les produits
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', exhibitor.id);

      console.log(`   📦 Produits: ${productCount || 0}`);

      // Compter les mini sites
      const { count: miniSiteCount } = await supabase
        .from('mini_sites')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', exhibitor.id);

      console.log(`   🌐 Mini sites: ${miniSiteCount || 0}`);

      // Si pas de mini sites, lister ce qui manque
      if (!miniSiteCount || miniSiteCount === 0) {
        console.log(`   ⚠️  Aucun mini site créé`);
      } else {
        // Lister les mini sites
        const { data: miniSites } = await supabase
          .from('mini_sites')
          .select('id, title, content, created_at')
          .eq('exhibitor_id', exhibitor.id);

        console.log(`   ✅ Mini sites disponibles:`);
        miniSites?.forEach(site => {
          console.log(`      - ${site.title}`);
        });
      }
    }

    // Statistiques globales
    console.log('\n\n📊 Statistiques globales:');
    
    const { count: totalMiniSites } = await supabase
      .from('mini_sites')
      .select('*', { count: 'exact', head: true });

    console.log(`   Total mini sites: ${totalMiniSites || 0}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkMiniSites();
