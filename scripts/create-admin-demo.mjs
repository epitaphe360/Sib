import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY requis!');
  console.log('\n💡 Usage:');
  console.log('   $env:SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key"');
  console.log('   node scripts/create-admin-demo.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const email = 'admin@sib.com';
const password = 'Admin2026!';

async function createAdminAccount() {
  console.log('\n🔧 Création du compte administrateur...\n');
  
  try {
    // Vérifier si le compte existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      console.log('⚠️  Un compte avec cet email existe déjà!');
      console.log('   ID:', existingUser.id);
      console.log('   Type:', existingUser.type);
      
      if (existingUser.type !== 'admin') {
        console.log('\n🔄 Mise à jour du type vers "admin"...');
        const { error } = await supabase
          .from('users')
          .update({ type: 'admin' })
          .eq('id', existingUser.id);
        
        if (error) throw error;
        console.log('✅ Compte mis à jour en admin!');
      } else {
        console.log('✅ Le compte est déjà admin!');
      }
      
      console.log('\n📧 Email:', email);
      console.log('🔑 Mot de passe:', password);
      return;
    }
    
    // Créer l'utilisateur dans Auth
    console.log('1️⃣ Création de l\'utilisateur Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName: 'Admin',
        lastName: 'SIB'
      }
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Utilisateur Auth existe déjà, création du profil...');
        // Récupérer l'ID de l'utilisateur existant
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingAuthUser = users.users.find(u => u.email === email);
        
        if (existingAuthUser) {
          // Créer le profil
          const { error: profileError } = await supabase.from('users').upsert({
            id: existingAuthUser.id,
            email,
            type: 'admin',
            profile: {
              firstName: 'Admin',
              lastName: 'SIB'
            }
          });
          
          if (profileError) throw profileError;
          
          console.log('✅ Profil admin créé pour utilisateur existant!');
          console.log('\n📧 Email:', email);
          console.log('🔑 Mot de passe:', password);
          return;
        }
      }
      throw authError;
    }
    
    console.log('   ✅ Utilisateur Auth créé:', authUser.user.id);
    
    // Créer le profil dans la table users
    console.log('2️⃣ Création du profil admin...');
    const { error: profileError } = await supabase.from('users').insert({
      id: authUser.user.id,
      email,
      type: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'SIB'
      }
    });
    
    if (profileError) throw profileError;
    
    console.log('   ✅ Profil admin créé!');
    
    console.log('\n✨ COMPTE ADMIN CRÉÉ AVEC SUCCÈS!\n');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│  📧 Email: admin@sib.com           │');
    console.log('│  🔑 Mot de passe: Admin2026!           │');
    console.log('│  👤 Type: admin                         │');
    console.log('└─────────────────────────────────────────┘');
    console.log('\n🚀 Prochaines étapes:');
    console.log('   1. Démarrer le serveur: npm run dev');
    console.log('   2. Se connecter avec ces identifiants');
    console.log('   3. Aller dans Admin Dashboard');
    console.log('   4. Cliquer sur "Gérer Contenus Médias" 🎥');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.details) {
      console.error('   Détails:', error.details);
    }
    process.exit(1);
  }
}

createAdminAccount();
