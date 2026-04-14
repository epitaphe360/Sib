import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Comptes de test à réinitialiser
const testAccounts = [
  // Visiteurs
  { email: 'visitor1@test.com', password: 'Test@123456', type: 'visitor' },
  { email: 'visitor-free@test.sib2026.ma', password: 'Test@123456', type: 'visitor' },
  { email: 'visitor-vip@test.sib2026.ma', password: 'Test@123456', type: 'visitor' },
  
  // Exposants
  { email: 'exhibitor1@test.com', password: 'Test@123456', type: 'exhibitor' },
  { email: 'exhibitor2@test.com', password: 'Test@123456', type: 'exhibitor' },
  { email: 'exhibitor-9m@test.sib2026.ma', password: 'Test@123456', type: 'exhibitor' },
  { email: 'exhibitor-18m@test.sib2026.ma', password: 'Test@123456', type: 'exhibitor' },
  { email: 'exhibitor-36m@test.sib2026.ma', password: 'Test@123456', type: 'exhibitor' },
  { email: 'exhibitor-54m@test.sib2026.ma', password: 'Test@123456', type: 'exhibitor' },
  
  // Partenaires
  { email: 'partner-museum@test.sib2026.ma', password: 'Test@123456', type: 'partner' },
  { email: 'partner-silver@test.sib2026.ma', password: 'Test@123456', type: 'partner' },
  { email: 'partner-gold@test.sib2026.ma', password: 'Test@123456', type: 'partner' },
  { email: 'partner-platinium@test.sib2026.ma', password: 'Test@123456', type: 'partner' },
  
  // Admin
  { email: 'admin-test@test.sib2026.ma', password: 'Test@123456', type: 'admin' }
];

async function resetPassword(email, newPassword) {
  try {
    // Récupérer l'ID auth de l'utilisateur
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUser = authData.users.find(u => u.email === email);
    
    if (!authUser) {
      console.log(`   ⚠️  Pas de compte auth pour ${email}`);
      return { success: false, reason: 'no_auth_account' };
    }
    
    // Mettre à jour le mot de passe
    const { data, error } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password: newPassword }
    );
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      return { success: false, reason: error.message };
    }
    
    console.log(`   ✅ Mot de passe mis à jour`);
    return { success: true };
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

async function main() {
  console.log('\n🔐 === RÉINITIALISATION DES MOTS DE PASSE ===\n');
  console.log(`📝 ${testAccounts.length} comptes à traiter\n`);
  
  const results = {
    success: 0,
    failed: 0,
    noAuth: 0
  };
  
  for (const account of testAccounts) {
    console.log(`\n🔹 ${account.email} (${account.type})`);
    
    // Vérifier que l'utilisateur existe dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', account.email)
      .single();
    
    if (userError || !userData) {
      console.log(`   ⚠️  Utilisateur non trouvé dans table users`);
      results.failed++;
      continue;
    }
    
    console.log(`   👤 ${userData.name}`);
    
    // Réinitialiser le mot de passe
    const result = await resetPassword(account.email, account.password);
    
    if (result.success) {
      results.success++;
    } else if (result.reason === 'no_auth_account') {
      results.noAuth++;
    } else {
      results.failed++;
    }
  }
  
  console.log('\n\n📊 === RÉSULTATS ===\n');
  console.log(`✅ Réussis: ${results.success}`);
  console.log(`❌ Échecs: ${results.failed}`);
  console.log(`⚠️  Sans compte auth: ${results.noAuth}`);
  
  if (results.noAuth > 0) {
    console.log('\n💡 INFO: Les comptes sans auth nécessitent d\'être créés via signUp');
  }
}

main().catch(console.error);
