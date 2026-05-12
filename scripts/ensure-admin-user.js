
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureAdmin() {
  const email = 'admin.sib@sib.com';
  
  // 1. Get Auth User ID
  let page = 1;
  let userId = null;
  while (!userId) {
      const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage: 50 });
      if (error || !users || users.length === 0) break;
      const found = users.find(u => u.email === email);
      if (found) {
          userId = found.id;
      }
      page++;
      if (page > 20) break;
  }

  if (!userId) {
    console.error('❌ Admin Auth user not found. Run force-create-auth-users.js first.');
    return;
  }

  // 2. Check public.users
  const { data: publicUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!publicUser) {
    console.log('Admin not in public.users. Creating...');
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        name: 'Admin SIB',
        type: 'admin',
        created_at: new Date()
      });
    if (insertError) console.error('❌ Insert failed:', insertError);
    else console.log('✅ Admin inserted into public.users');
  } else {
    console.log('✅ Admin exists in public.users.');
    if (publicUser.type !== 'admin') {
        console.log('Updating type to admin...');
        await supabase.from('users').update({ type: 'admin' }).eq('id', userId);
    }
  }
}

ensureAdmin();
