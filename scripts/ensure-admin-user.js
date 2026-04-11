
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureAdmin() {
  const email = 'admin.siports@siports.com';
  
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
        name: 'Admin SIPORTS',
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
