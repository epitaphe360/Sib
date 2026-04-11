import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAdmin() {
  console.log('🔍 Débogage de l\'utilisateur admin@siports.com...');
  
  // 1. Vérifier dans public.users
  const { data: publicUser, error: publicError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@siports.com')
    .single();
    
  if (publicError) {
    console.log('ℹ️ Non trouvé dans public.users:', publicError.message);
  } else {
    console.log('✅ Trouvé dans public.users:', publicUser);
  }
  
  // 2. Lister TOUS les utilisateurs auth pour être sûr
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
    perPage: 1000
  });
  
  if (authError) {
    console.error('❌ Erreur listUsers:', authError.message);
  } else {
    const found = authUsers.users.find(u => u.email === 'admin@siports.com');
    if (found) {
      console.log('✅ Trouvé dans auth.users:', { id: found.id, email: found.email });
    } else {
      console.log('❌ Non trouvé dans auth.users (même avec perPage: 1000)');
    }
  }
}

debugAdmin();
