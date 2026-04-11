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

async function finalCleanup() {
  console.log('🧹 Nettoyage final des exposants...\n');

  try {
    // 1. Récupérer les users à garder
    const { data: keepUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .in('email', keepEmails);

    if (usersError) throw usersError;

    console.log(`✅ ${keepUsers.length} comptes à conserver:`);
    keepUsers.forEach(u => console.log(`   - ${u.email}`));

    const keepUserIds = keepUsers.map(u => u.id);

    // 2. Pour chaque user, garder seulement le dernier exhibitor (celui avec des produits)
    const exhibitorsToKeep = [];
    
    for (const user of keepUsers) {
      // Récupérer tous les exhibitors de ce user
      const { data: userExhibitors, error: exhibError } = await supabase
        .from('exhibitors')
        .select('id, user_id, company_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (exhibError) throw exhibError;

      console.log(`\n🔍 ${user.email}: ${userExhibitors.length} exhibitors trouvés`);

      // Vérifier quel exhibitor a des produits
      let exhibitorWithProducts = null;
      for (const exhibitor of userExhibitors) {
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('exhibitor_id', exhibitor.id);

        console.log(`   - Exhibitor ${exhibitor.id}: ${productCount} produits`);
        
        if (productCount && productCount > 0) {
          exhibitorWithProducts = exhibitor;
          break;
        }
      }

      // Si aucun n'a de produits, prendre le plus récent
      const exhibitorToKeep = exhibitorWithProducts || userExhibitors[0];
      exhibitorsToKeep.push(exhibitorToKeep);
      console.log(`   ✅ Garder: ${exhibitorToKeep.id} (${exhibitorToKeep.company_name})`);
    }

    const keepExhibitorIds = exhibitorsToKeep.map(e => e.id);

    console.log(`\n📊 État actuel:`);
    const { count: totalExhibitors } = await supabase
      .from('exhibitors')
      .select('*', { count: 'exact', head: true });
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    console.log(`   - Total exhibitors: ${totalExhibitors}`);
    console.log(`   - Total produits: ${totalProducts}`);

    // 3. Supprimer tous les produits qui n'appartiennent pas aux exhibitors à garder
    console.log(`\n🗑️  Suppression des produits non liés...`);
    const { error: deleteProductsError } = await supabase
      .from('products')
      .delete()
      .not('exhibitor_id', 'in', `(${keepExhibitorIds.join(',')})`);

    if (deleteProductsError && deleteProductsError.code !== 'PGRST116') {
      console.error('Erreur:', deleteProductsError);
    } else {
      console.log(`   ✅ Produits nettoyés`);
    }

    // 4. Supprimer tous les exhibitors sauf ceux à garder
    console.log(`\n🗑️  Suppression des exhibitors en double...`);
    const { error: deleteExhibitorsError } = await supabase
      .from('exhibitors')
      .delete()
      .not('id', 'in', `(${keepExhibitorIds.join(',')})`);

    if (deleteExhibitorsError && deleteExhibitorsError.code !== 'PGRST116') {
      console.error('Erreur:', deleteExhibitorsError);
    } else {
      console.log(`   ✅ Exhibitors nettoyés`);
    }

    // 5. État final
    console.log(`\n📊 État final:`);
    const { count: finalExhibitors } = await supabase
      .from('exhibitors')
      .select('*', { count: 'exact', head: true });
    const { count: finalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    console.log(`   - Exhibitors: ${finalExhibitors}`);
    console.log(`   - Produits: ${finalProducts}`);

    // 6. Vérification finale
    console.log(`\n✅ Vérification finale:`);
    for (const exhibitor of exhibitorsToKeep) {
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', exhibitor.id);

      const user = keepUsers.find(u => u.id === exhibitor.user_id);
      console.log(`   - ${user?.email}: ${productCount} produits ✅`);
    }

    console.log(`\n🎉 Nettoyage terminé!`);
    console.log(`   ${totalExhibitors - finalExhibitors} exhibitors supprimés`);
    console.log(`   ${totalProducts - finalProducts} produits supprimés`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

finalCleanup();
