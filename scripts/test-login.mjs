import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - clé correcte depuis .env
const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testEmail = process.argv[2] || 'partner.e2e.1766706128475@test-siports.com';
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
