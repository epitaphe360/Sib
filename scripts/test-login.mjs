import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - clé correcte depuis .env
const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testEmail = process.argv[2] || 'partner.e2e.1766706128475@test-sib.com';
const testPassword = process.argv[3] || 'TestPassword123!';

async function testLogin() {
  console.log('\n=== TEST DE CONNEXION ===\n');
  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔑 Password: ${testPassword}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.error('\n❌ ERREUR DE CONNEXION:', error.message);
      console.error('Code:', error.status);
      console.error('Détails:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log('\n✅ CONNEXION RÉUSSIE !');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Email confirmé:', data.user?.email_confirmed_at);
    console.log('Session:', data.session ? 'OUI' : 'NON');
    
  } catch (err) {
    console.error('\n❌ ERREUR:', err);
  }
}

testLogin();
