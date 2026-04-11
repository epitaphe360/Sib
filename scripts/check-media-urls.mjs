import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMediaUrls() {
  console.log('🔍 Vérification des URLs des médias...\n');
  
  const { data: media, error } = await supabase
    .from('media_library')
    .select('*')
    .eq('media_type', 'image')
    .limit(10);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!media || media.length === 0) {
    console.log('⚠️  Aucun média trouvé dans la base de données');
    return;
  }

  console.log(`📊 Trouvé ${media.length} médias:\n`);
  console.log('Structure de la table:', Object.keys(media[0]));
  console.log('');
  
  media.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   Data:`, JSON.stringify(item, null, 2));
    console.log('');
  });
}

checkMediaUrls();
