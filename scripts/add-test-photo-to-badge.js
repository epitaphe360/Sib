
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

// Photo de test (avatar professionnel générique)
const TEST_PHOTO_URL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face';

async function addPhotoToBadge() {
  // Trouver un utilisateur avec un badge
  const { data: badges, error } = await supabase
    .from('user_badges')
    .select('*')
    .limit(1);

  if (error || !badges || badges.length === 0) {
    console.error('Aucun badge trouvé:', error);
    return;
  }

  const badge = badges[0];
  console.log('Badge trouvé:', badge.badge_code);
  console.log('Utilisateur:', badge.full_name);

  // Mettre à jour avec une photo de test
  const { error: updateError } = await supabase
    .from('user_badges')
    .update({ avatar_url: TEST_PHOTO_URL })
    .eq('id', badge.id);

  if (updateError) {
    console.error('Erreur mise à jour:', updateError);
    return;
  }

  console.log('');
  console.log('✅ Photo ajoutée avec succès!');
  console.log('');
  console.log('='.repeat(50));
  console.log('QR CODE DE TEST:');
  console.log('='.repeat(50));
  console.log('');
  console.log('Badge Code:', badge.badge_code);
  console.log('Nom:', badge.full_name);
  console.log('Photo:', TEST_PHOTO_URL);
  console.log('');
  console.log('Scannez ce code avec l\'application:');
  console.log(badge.badge_code);
  console.log('');
}

addPhotoToBadge();
