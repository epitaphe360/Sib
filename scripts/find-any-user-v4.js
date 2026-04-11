
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function listUsers() {
  const { data: users } = await supabase
    .from('users')
    .select('id, email, name, type')
    .limit(1);

  if (users && users.length > 0) {
      const user = users[0];
      
      const { data: badge } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (badge) {
          console.log('BADGE_CODE:', badge.badge_code);
      } else {
           const { data: newBadge, error: createError } = await supabase
            .from('user_badges')
            .insert({
                user_id: user.id,
                badge_code: 'TEST-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                status: 'active'
            })
            .select()
            .single();
            
            if (createError) {
                console.error('Erreur création badge:', createError);
            } else {
                console.log('BADGE_CODE:', newBadge.badge_code);
            }
      }
  }
}

listUsers();
