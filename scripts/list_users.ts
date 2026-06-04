import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function listAllUsers() {
  console.log('📋 Listage de tous les utilisateurs Supabase...\n');

  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log(`Erreur: ${error.message}`);
      return;
    }

    console.log(`Total: ${users?.length || 0} utilisateurs\n`);
    console.log('Utilisateurs par type:\n');

    // Grouper par domaine
    const byDomain = {} as Record<string, typeof users>;
    users?.forEach(user => {
      const domain = user.email?.split('@')[1] || 'unknown';
      if (!byDomain[domain]) {byDomain[domain] = [];}
      byDomain[domain].push(user);
    });

    Object.entries(byDomain).forEach(([domain, usersList]) => {
      console.log(`📧 ${domain} (${usersList.length})`);
      usersList.forEach(user => {
        console.log(`   - ${user.email}`);
      });
      console.log();
    });

  } catch (error) {
    console.log(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
  }
}

listAllUsers().catch(console.error);
