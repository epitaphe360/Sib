import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const testsToRun = [
    { email: 'admin@sib2026.ma', password: 'Admin123!' },
    { email: 'admin.sib@sib.com', password: 'Admin123!' },
    { email: 'visitor1@test.com', password: 'Test@123456' },
    { email: 'exhibitor1@test.com', password: 'Test@123456' }
  ];
  
  for (const test of testsToRun) {
    console.log('\n🔐 === TEST DE CONNEXION ===\n');
    console.log(`📧 Email: ${test.email}`);
    console.log(`🔑 Password: ${test.password}\n`);
    await testSingleLogin(test.email, test.password);
    console.log('\n' + '='.repeat(60));
  }
}

async function testSingleLogin(testEmail, testPassword) {
  
  // Étape 1: Vérifier que l'utilisateur existe dans la table users
  console.log('1️⃣ Vérification dans la table users...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', testEmail)
    .limit(1);
  
  if (userError) {
    console.error('❌ Erreur DB:', userError.message);
    return;
  }
  
  if (!userData || userData.length === 0) {
    console.error('❌ Utilisateur non trouvé dans la table users');
    return;
  }
  
  console.log('✅ Utilisateur trouvé:');
  console.log('   ID:', userData[0].id);
  console.log('   Name:', userData[0].name);
  console.log('   Type:', userData[0].type);
  console.log('   Profile:', userData[0].profile);
  
  // Étape 2: Vérifier dans auth.users
  console.log('\n2️⃣ Vérification dans auth.users...');
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erreur auth.admin:', authError.message);
    } else {
      const authUser = authData.users.find(u => u.email === testEmail);
      if (authUser) {
        console.log('✅ Compte auth trouvé:');
        console.log('   Auth ID:', authUser.id);
        console.log('   Email verified:', authUser.email_confirmed_at ? 'Oui' : 'Non');
      } else {
        console.log('❌ Pas de compte auth pour cet email');
        console.log('⚠️ PROBLÈME: L\'utilisateur existe dans la table users mais pas dans auth.users');
      }
    }
  } catch (e) {
    console.error('❌ Erreur lors de la vérification auth:', e.message);
  }
  
  // Étape 3: Tester la connexion
  console.log('\n3️⃣ Test de connexion signInWithPassword...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (signInError) {
    console.error('❌ Erreur de connexion:', signInError.message);
    console.log('\n💡 DIAGNOSTIC:');
    if (signInError.message.includes('Invalid login credentials')) {
      console.log('   → Le compte auth n\'existe pas OU le mot de passe est incorrect');
      console.log('   → Solution: Créer le compte auth avec le même email');
    }
  } else {
    console.log('✅ Connexion réussie!');
    console.log('   Session:', signInData.session ? 'OK' : 'Manquante');
    console.log('   User ID:', signInData.user?.id);
  }
}

testLogin().catch(console.error);
