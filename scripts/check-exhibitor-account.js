import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAccount() {
  console.log('🔍 Vérification du compte exhibitor-9m@test.siport.com...\n');

  try {
    // Chercher l'utilisateur par email
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'exhibitor-9m@test.siport.com');

    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ Compte NON TROUVÉ dans la table users');
      console.log('\n📋 Recherche de tous les comptes exhibitor...');
      
      const { data: allExhibitors } = await supabase
        .from('users')
        .select('email, type')
        .like('email', '%exhibitor%')
        .order('email');
      
      console.log('\n✅ Comptes exhibitor trouvés:');
      allExhibitors?.forEach(u => console.log(`  - ${u.email} (type: ${u.type})`));
      return;
    }

    const user = users[0];
    console.log('✅ Compte TROUVÉ dans users:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Type: ${user.type}`);
    console.log(`  Status: ${user.status}`);
    console.log(`  Created: ${user.created_at}`);

    // Vérifier si l'utilisateur existe dans auth.users
    console.log('\n🔐 Vérification dans Supabase Auth...');
    
    // Tentative de connexion avec le mot de passe
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'exhibitor-9m@test.siport.com',
      password: 'Test@123456'
    });

    if (signInError) {
      console.log('❌ Connexion ÉCHOUÉE:', signInError.message);
      console.log('\n⚠️ Le compte existe dans la table users mais pas dans auth.users');
      console.log('   OU le mot de passe est incorrect');
      console.log('\n💡 Solution: Recréer le compte avec:');
      console.log('   - Email: exhibitor-9m@test.siport.com');
      console.log('   - Password: Test@123456');
    } else {
      console.log('✅ Connexion RÉUSSIE !');
      console.log('   Le compte fonctionne correctement');
      await supabase.auth.signOut();
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkAccount();
