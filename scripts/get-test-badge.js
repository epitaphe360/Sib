
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getBadge() {
  // Chercher le visiteur VIP
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', 'visitor-vip@test.siport.com')
    .single();

  if (userError || !users) {
    console.log('Visiteur VIP non trouvé, essai avec visitor-free...');
     const { data: usersFree, error: userErrorFree } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('email', 'visitor-free@test.siport.com')
    .single();
    
    if (userErrorFree || !usersFree) {
        console.error('❌ Aucun utilisateur de test trouvé.');
        return;
    }
    printBadge(usersFree);
    return;
  }
  
  printBadge(users);
}

async function printBadge(user) {
    // Chercher son badge
  const { data: badge, error: badgeError } = await supabase
  .from('badges')
  .select('*')
  .eq('user_id', user.id)
  .single();

    if (badgeError || !badge) {
        console.log(`⚠️ Pas de badge pour ${user.email}. Création d'un badge...`);
        // Créer un badge
        const { data: newBadge, error: createError } = await supabase
            .from('badges')
            .insert({
                user_id: user.id,
                badge_code: 'VIP-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                status: 'active',
                qr_code_url: 'https://example.com/qr',
                valid_until: '2026-12-31'
            })
            .select()
            .single();
        
        if (createError) {
            console.error('❌ Erreur création badge:', createError);
        } else {
            console.log('✅ Badge créé:', newBadge.badge_code);
            console.log('JSON pour QR:', JSON.stringify({
                badge_code: newBadge.badge_code,
                userId: user.id,
                email: user.email,
                name: user.full_name
            }));
        }
    } else {
        console.log('✅ Badge trouvé:', badge.badge_code);
        console.log('JSON pour QR:', JSON.stringify({
            badge_code: badge.badge_code,
            userId: user.id,
            email: user.email,
            name: user.full_name
        }));
    }
}

getBadge();
