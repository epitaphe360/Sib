import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllUsers() {
  console.log('🔍 Vérification complète des utilisateurs...\n');

  try {
    // Compter tous les types d'utilisateurs
    const roles = ['admin', 'exhibitor', 'partner', 'visitor'];
    
    for (const role of roles) {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', role);

      if (error) throw error;
      console.log(`👤 ${role.padEnd(10)}: ${count} users`);
    }

    // Total
    const { count: totalCount, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;
    console.log(`\n📊 TOTAL: ${totalCount} users`);

    // Lister tous les users exhibitor
    const { data: exhibitorUsers, error: exhibError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('role', 'exhibitor')
      .order('created_at', { ascending: false });

    if (exhibError) throw exhibError;

    console.log(`\n📋 Tous les users exhibitor (${exhibitorUsers.length}):`);
    exhibitorUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.name})`);
    });

    // Vérifier lesquels ont un exhibitor
    console.log(`\n🔗 Vérification des liens exhibitor:`);
    for (const user of exhibitorUsers.slice(0, 20)) {
      const { count } = await supabase
        .from('exhibitors')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      console.log(`   - ${user.email}: ${count} exhibitor(s)`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkAllUsers();
