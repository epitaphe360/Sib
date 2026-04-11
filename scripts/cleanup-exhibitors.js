import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Emails des comptes à garder
const keepEmails = [
  'exhibitor1@test.com',
  'exhibitor2@test.com',
  'sandrine.morel1@company.com',
  'thomas.lefebvre3@company.com'
];

async function cleanupExhibitors() {
  console.log('🧹 Nettoyage des exposants...\n');

  try {
    // 1. Récupérer les users à garder
    const { data: keepUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .in('email', keepEmails);

    if (usersError) throw usersError;

    console.log(`✅ Trouvé ${keepUsers.length} comptes à garder:`);
    keepUsers.forEach(u => console.log(`   - ${u.email} (${u.name})`));

    const keepUserIds = keepUsers.map(u => u.id);

    // 2. Récupérer les exhibitors à garder
    const { data: keepExhibitors, error: exhibitorsError } = await supabase
      .from('exhibitors')
      .select('id, user_id, company_name')
      .in('user_id', keepUserIds);

    if (exhibitorsError) throw exhibitorsError;

    console.log(`\n✅ Trouvé ${keepExhibitors.length} exhibitors à garder:`);
    keepExhibitors.forEach(e => console.log(`   - ${e.company_name}`));

    const keepExhibitorIds = keepExhibitors.map(e => e.id);

    // 3. Compter les données avant suppression
    const { count: totalExhibitors } = await supabase
      .from('exhibitors')
      .select('*', { count: 'exact', head: true });

    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 État actuel:`);
    console.log(`   - Total exhibitors: ${totalExhibitors}`);
    console.log(`   - Total produits: ${totalProducts}`);

    // 4. Supprimer les produits qui n'appartiennent pas aux exhibitors à garder
    console.log(`\n🗑️  Suppression des produits...`);
    const { data: deletedProducts, error: deleteProductsError } = await supabase
      .from('products')
      .delete()
      .not('exhibitor_id', 'in', `(${keepExhibitorIds.join(',')})`);

    if (deleteProductsError && deleteProductsError.code !== 'PGRST116') {
      console.error('Erreur suppression produits:', deleteProductsError);
    } else {
      console.log(`   ✅ Produits supprimés`);
    }

    // 5. Supprimer les exhibitors qui ne sont pas à garder
    console.log(`\n🗑️  Suppression des exhibitors...`);
    const { data: deletedExhibitors, error: deleteExhibitorsError } = await supabase
      .from('exhibitors')
      .delete()
      .not('id', 'in', `(${keepExhibitorIds.join(',')})`);

    if (deleteExhibitorsError && deleteExhibitorsError.code !== 'PGRST116') {
      console.error('Erreur suppression exhibitors:', deleteExhibitorsError);
    } else {
      console.log(`   ✅ Exhibitors supprimés`);
    }

    // 6. Compter les données après suppression
    const { count: finalExhibitors } = await supabase
      .from('exhibitors')
      .select('*', { count: 'exact', head: true });

    const { count: finalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 État final:`);
    console.log(`   - Exhibitors restants: ${finalExhibitors}`);
    console.log(`   - Produits restants: ${finalProducts}`);

    // 7. Vérifier les produits par exhibitor
    console.log(`\n🔍 Vérification des produits par compte:`);
    for (const exhibitor of keepExhibitors) {
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', exhibitor.id);

      const user = keepUsers.find(u => u.id === exhibitor.user_id);
      console.log(`   - ${user?.email}: ${productCount} produits`);
    }

    console.log(`\n✅ Nettoyage terminé!`);
    console.log(`   Exhibitors supprimés: ${totalExhibitors - finalExhibitors}`);
    console.log(`   Produits supprimés: ${totalProducts - finalProducts}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

cleanupExhibitors();
