import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const exhibitorAccounts = [
  { email: 'exhibitor-9m@test.siport.com', company: 'TechMarine Solutions', standSize: '9m²' },
  { email: 'exhibitor-18m@test.siport.com', company: 'OceanLogistics Pro', standSize: '18m²' },
  { email: 'exhibitor-36m@test.siport.com', company: 'PortTech Industries', standSize: '36m²' },
  { email: 'exhibitor-54m@test.siport.com', company: 'Global Shipping Alliance', standSize: '54m²' }
];

async function fixExhibitorAccounts() {
  console.log('🔧 Correction des comptes exhibitor...\n');

  for (const exhibitor of exhibitorAccounts) {
    console.log(`\n📝 Traitement de ${exhibitor.email}...`);

    try {
      // 1. Vérifier si le compte existe déjà dans users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, type')
        .eq('email', exhibitor.email)
        .single();

      if (existingUser) {
        console.log(`  ℹ️ Compte existe: ${existingUser.email} (type: ${existingUser.type})`);
        
        // Supprimer l'ancien compte users si ce n'est pas le bon type
        if (existingUser.type !== 'exhibitor') {
          console.log(`  🗑️ Suppression ancien compte (type incorrect: ${existingUser.type})`);
          
          // Supprimer l'exhibitor lié
          await supabase.from('exhibitors').delete().eq('user_id', existingUser.id);
          
          // Supprimer l'utilisateur
          await supabase.from('users').delete().eq('id', existingUser.id);
          
          // Supprimer du auth (admin API)
          await supabase.auth.admin.deleteUser(existingUser.id);
        }
      }

      // 2. Créer le compte auth
      console.log('  🔐 Création compte auth...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: exhibitor.email,
        password: 'Test@123456',
        email_confirm: true
      });

      if (authError) {
        console.error(`  ❌ Erreur auth: ${authError.message}`);
        continue;
      }

      console.log(`  ✅ Auth créé: ${authData.user.id}`);

      // 3. Créer l'utilisateur dans la table users
      console.log('  👤 Création utilisateur...');
      const { error: userError } = await supabase.from('users').insert([{
        id: authData.user.id,
        email: exhibitor.email,
        type: 'exhibitor',
        status: 'active'
      }]);

      if (userError) {
        console.error(`  ❌ Erreur user: ${userError.message}`);
        continue;
      }

      console.log('  ✅ Utilisateur créé');

      // 4. Créer le profil exhibitor
      console.log('  🏢 Création profil exhibitor...');
      const { error: exhibitorError } = await supabase.from('exhibitors').insert([{
        user_id: authData.user.id,
        company_name: exhibitor.company,
        description: `${exhibitor.company} - Stand de ${exhibitor.standSize}`,
        contact_info: { 
          standSize: exhibitor.standSize,
          email: exhibitor.email
        },
        verified: true
      }]);

      if (exhibitorError) {
        console.error(`  ❌ Erreur exhibitor: ${exhibitorError.message}`);
        continue;
      }

      console.log('  ✅ Profil exhibitor créé');

      // Test de connexion
      console.log('  🧪 Test de connexion...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: exhibitor.email,
        password: 'Test@123456'
      });

      if (signInError) {
        console.log(`  ⚠️ Test connexion échoué: ${signInError.message}`);
      } else {
        console.log('  ✅ Test connexion réussi !');
        await supabase.auth.signOut();
      }

    } catch (error) {
      console.error(`  ❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n✅ Correction terminée !');
}

fixExhibitorAccounts();
