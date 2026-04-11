
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function listUsers() {
  // Try 'users' table
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, name, type')
    .limit(5);

  if (error) {
    console.error('Error querying users:', error);
    return;
  }

  if (users && users.length > 0) {
      const user = users[0];
      console.log('Utilisateur trouvé:', user.email);
      
      // Check badge
      const { data: badge } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (badge) {
          console.log('BADGE_CODE:', badge.badge_code);
          console.log('FULL_JSON:', JSON.stringify({
              badge_code: badge.badge_code,
              userId: user.id,
              email: user.email,
              name: user.name
          }));
      } else {
          // Create badge
           const { data: newBadge } = await supabase
            .from('badges')
            .insert({
                user_id: user.id,
                badge_code: 'TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                status: 'active'
            })
            .select()
            .single();
            
            if (newBadge) {
                console.log('BADGE_CODE:', newBadge.badge_code);
                 console.log('FULL_JSON:', JSON.stringify({
                    badge_code: newBadge.badge_code,
                    userId: user.id,
                    email: user.email,
                    name: user.name
                }));
            }
      }
  } else {
      console.log('Aucun utilisateur trouvé dans la table users.');
  }
}

listUsers();
