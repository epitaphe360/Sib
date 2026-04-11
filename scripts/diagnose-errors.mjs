import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

console.log('\n=== DIAGNOSTIC DES ERREURS ===\n');

// 1. Vérifier la colonne view_count dans mini_sites
console.log('📊 1. Vérification de la table mini_sites...\n');

try {
  const { data: miniSites, error: miniSitesError } = await supabaseAdmin
    .from('mini_sites')
    .select('*')
    .limit(1);

  if (miniSitesError) {
    console.error('❌ Erreur mini_sites:', miniSitesError.message);
    console.error('   Code:', miniSitesError.code);
    console.error('   Details:', miniSitesError.details);
  } else {
    console.log('✅ Table mini_sites accessible');
    if (miniSites && miniSites.length > 0) {
      console.log('   Colonnes disponibles:', Object.keys(miniSites[0]));
      console.log(`   Nombre d'enregistrements: ${miniSites.length}`);
    }
  }
} catch (err) {
  console.error('❌ Exception:', err.message);
}

// 2. Tester la requête problématique
console.log('\n📊 2. Test de la requête view_count...\n');

const exhibitorId = 'd41e51aa-c4e8-43fa-a266-5c128adb881f';

try {
  const { data: viewCountData, error: viewCountError } = await supabaseAdmin
    .from('mini_sites')
    .select('view_count')
    .eq('exhibitor_id', exhibitorId)
    .single();

  if (viewCountError) {
    console.error('❌ Erreur view_count:', viewCountError.message);
    console.error('   Code:', viewCountError.code);
    
    // Essayer sans single()
    const { data: allData, error: allError } = await supabaseAdmin
      .from('mini_sites')
      .select('*')
      .eq('exhibitor_id', exhibitorId);
    
    if (!allError && allData) {
      console.log('   Données trouvées:', allData);
      if (allData.length === 0) {
        console.log('   ⚠️ Aucun mini_site pour cet exhibitor_id');
      }
    }
  } else {
    console.log('✅ View count récupéré:', viewCountData);
  }
} catch (err) {
  console.error('❌ Exception:', err.message);
}

// 3. Vérifier les comptes disponibles
console.log('\n📊 3. Vérification des comptes de test...\n');

const testAccounts = [
  { email: 'demo.visitor@siports.com', type: 'visitor' },
  { email: 'demo.exhibitor@siports.com', type: 'exhibitor' },
  { email: 'demo.partner@siports.com', type: 'partner' },
  { email: 'partner-gold@test.siport.com', type: 'partner' }
];

for (const account of testAccounts) {
  try {
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    const user = users?.users.find(u => u.email === account.email);
    
    if (user) {
      console.log(`✅ ${account.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email confirmé: ${user.email_confirmed_at ? '✅' : '❌'}`);
      console.log(`   Créé: ${new Date(user.created_at).toLocaleDateString()}`);
      
      // Vérifier le profil dans users table
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('type, status')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        console.log(`   Type: ${profile.type}, Status: ${profile.status}`);
      }
    } else {
      console.log(`❌ ${account.email} - Compte non trouvé`);
    }
    console.log('');
  } catch (err) {
    console.error(`❌ ${account.email} - Erreur:`, err.message);
  }
}

// 4. Recommandations
console.log('\n📌 RECOMMANDATIONS:\n');

console.log('Pour l\'erreur 406 (mini_sites):');
console.log('   - Vérifier que la colonne "view_count" existe dans la table');
console.log('   - Alternative: utiliser "views" au lieu de "view_count"');
console.log('');

console.log('Pour l\'erreur 400 (Invalid login credentials):');
console.log('   - Utiliser les comptes démo avec mot de passe: Demo2026!');
console.log('   - Vérifier que l\'email est correct et confirmé');
console.log('   - Réinitialiser le mot de passe si nécessaire avec:');
console.log('     node scripts/reset-password.mjs <email> Demo2026!');
console.log('');
