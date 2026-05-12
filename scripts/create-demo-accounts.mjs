import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('\n🔧 CRÉATION DE COMPTES DE DÉMO FIABLES\n');

const demoAccounts = [
  {
    email: 'demo.visitor@sib.com',
    password: 'Demo2026!',
    type: 'visitor',
    name: 'Visiteur Démo',
    status: 'active',
    visitor_level: 'free'
  },
  {
    email: 'demo.exhibitor@sib.com',
    password: 'Demo2026!',
    type: 'exhibitor',
    name: 'Exposant Démo',
    status: 'active'
  },
  {
    email: 'demo.partner@sib.com',
    password: 'Demo2026!',
    type: 'partner',
    name: 'Partenaire Démo',
    status: 'pending_payment'
  }
];

for (const account of demoAccounts) {
  console.log(`\n📧 ${account.email} (${account.type})`);
  
  // Vérifier si le compte existe déjà
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const existing = users.find(u => u.email === account.email);
  
  let userId;
  
  if (existing) {
    console.log('  ⚠️  Compte existant - mise à jour du mot de passe...');
    userId = existing.id;
    
    // Mettre à jour le mot de passe
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: account.password,
      email_confirm: true
    });
  } else {
    console.log('  ➕ Création du nouveau compte...');
    
    // Créer le compte
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        name: account.name,
        type: account.type
      }
    });
    
    if (authError) {
      console.error(`  ❌ Erreur création Auth:`, authError.message);
      continue;
    }
    
    userId = authData.user.id;
    
    // Créer le profil utilisateur
    const userPayload = {
      id: userId,
      email: account.email,
      name: account.name,
      type: account.type,
      status: account.status
    };
    
    if (account.type === 'visitor') {
      userPayload.visitor_level = account.visitor_level;
    }
    
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert([userPayload]);
    
    if (profileError) {
      console.error(`  ❌ Erreur création profil:`, profileError.message);
      continue;
    }
  }
  
  console.log(`  ✅ Compte prêt: ${account.email} / ${account.password}`);
}

console.log('\n' + '='.repeat(70));
console.log('\n🎉 COMPTES DE DÉMO CRÉÉS AVEC SUCCÈS\n');
console.log('📋 INFORMATIONS DE CONNEXION:');
console.log('─'.repeat(70));

demoAccounts.forEach(account => {
  console.log(`\n  ${account.type.toUpperCase()}:`);
  console.log(`    Email: ${account.email}`);
  console.log(`    Mot de passe: ${account.password}`);
});

console.log('\n' + '='.repeat(70));
console.log('\n💡 Utilisez ces comptes pour tester l\'application\n');
