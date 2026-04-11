
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY introuvable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const email = process.argv[2];

if (!email) {
  console.error('❌ Email requis en argument');
  process.exit(1);
}

async function checkUser() {
  console.log(`🔍 Recherche de l'utilisateur: ${email}`);
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Erreur listUsers:', error);
    return;
  }

  const user = users.find(u => u.email === email);

  if (user) {
    console.log('✅ Utilisateur trouvé:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Confirmé le: ${user.email_confirmed_at}`);
    console.log(`   Dernière connexion: ${user.last_sign_in_at}`);
    console.log(`   Métadonnées:`, user.user_metadata);
  } else {
    console.log('❌ Utilisateur NON TROUVÉ');
  }
}

checkUser();
