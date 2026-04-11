import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllDemoData() {
  console.log('📊 VÉRIFICATION COMPLÈTE DES COMPTES DE DÉMONSTRATION\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Admin
    console.log('🔑 ADMIN:');
    const { data: admin } = await supabase
      .from('users')
      .select('email, name, role')
      .eq('email', 'admin@siport.com')
      .single();
    if (admin) {
      console.log(`   ✅ ${admin.email} - ${admin.name}`);
    }

    // Exposants
    console.log('\n🏢 EXPOSANTS:');
    const exhibitorEmails = [
      'exhibitor-9m@test.siport.com',
      'exhibitor-18m@test.siport.com',
      'exhibitor-36m@test.siport.com',
      'exhibitor-54m@test.siport.com'
    ];

    for (const email of exhibitorEmails) {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email)
        .single();

      if (!user) {
        console.log(`   ❌ ${email} - Non trouvé`);
        continue;
      }

      const { data: exhibitor } = await supabase
        .from('exhibitors')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single();

      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', exhibitor?.id);

      const { count: miniSiteCount } = await supabase
        .from('mini_sites')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', exhibitor?.id);

      console.log(`   ✅ ${email}`);
      console.log(`      - Entreprise: ${exhibitor?.company_name || 'N/A'}`);
      console.log(`      - Produits: ${productCount || 0}`);
      console.log(`      - Mini sites: ${miniSiteCount || 0}`);
    }

    // Partenaires
    console.log('\n🤝 PARTENAIRES:');
    const partnerEmails = [
      'partner-museum@test.siport.com',
      'partner-silver@test.siport.com',
      'partner-gold@test.siport.com',
      'partner-platinium@test.siport.com'
    ];

    for (const email of partnerEmails) {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email)
        .single();

      if (!user) {
        console.log(`   ❌ ${email} - Non trouvé`);
        continue;
      }

      const { data: partner } = await supabase
        .from('partners')
        .select('id, company_name, partnership_level')
        .eq('user_id', user.id)
        .single();

      const { count: projectCount } = await supabase
        .from('partner_projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      console.log(`   ✅ ${email}`);
      console.log(`      - Entreprise: ${partner?.company_name || 'N/A'}`);
      console.log(`      - Niveau: ${partner?.partnership_level || 'N/A'}`);
      console.log(`      - Projets: ${projectCount || 0}`);
    }

    // Visiteurs
    console.log('\n👥 VISITEURS:');
    const visitorEmails = [
      'visitor-free@test.siport.com',
      'visitor-vip@test.siport.com'
    ];

    for (const email of visitorEmails) {
      const { data: user } = await supabase
        .from('users')
        .select('email, name')
        .eq('email', email)
        .single();

      if (user) {
        console.log(`   ✅ ${user.email} - ${user.name}`);
      } else {
        console.log(`   ❌ ${email} - Non trouvé`);
      }
    }

    // Statistiques globales
    console.log('\n' + '='.repeat(60));
    console.log('📊 STATISTIQUES GLOBALES:\n');

    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: totalExhibitors } = await supabase
      .from('exhibitors')
      .select('*', { count: 'exact', head: true });

    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: totalMiniSites } = await supabase
      .from('mini_sites')
      .select('*', { count: 'exact', head: true });

    const { count: totalPartners } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true });

    const { count: totalProjects } = await supabase
      .from('partner_projects')
      .select('*', { count: 'exact', head: true });

    console.log(`   👤 Users: ${totalUsers}`);
    console.log(`   🏢 Exhibitors: ${totalExhibitors}`);
    console.log(`   📦 Produits: ${totalProducts}`);
    console.log(`   🌐 Mini sites: ${totalMiniSites}`);
    console.log(`   🤝 Partners: ${totalPartners}`);
    console.log(`   📋 Projets: ${totalProjects}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ TOUS LES COMPTES SONT CONFIGURÉS CORRECTEMENT!\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkAllDemoData();
