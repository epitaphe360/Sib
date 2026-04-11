import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const accounts = [
  { email: 'visitor-free@test.siport.com', password: 'Demo2026!' },
  { email: 'visitor-vip@test.siport.com', password: 'Demo2026!' },
  { email: 'exhibitor-9m@test.siport.com', password: 'Demo2026!' },
  { email: 'exhibitor-18m@test.siport.com', password: 'Demo2026!' },
  { email: 'exhibitor-36m@test.siport.com', password: 'Demo2026!' },
  { email: 'exhibitor-54m@test.siport.com', password: 'Demo2026!' },
  { email: 'demo.partner@siports.com', password: 'Demo2026!' },
  { email: 'partner-museum@test.siport.com', password: 'Demo2026!' },
  { email: 'partner-silver@test.siport.com', password: 'Demo2026!' },
  { email: 'partner-gold@test.siport.com', password: 'Demo2026!' },
  { email: 'partner-platinum@test.siport.com', password: 'Demo2026!' },
  { email: 'marketing@siports.com', password: 'Demo2026!' },
  { email: 'admin@siports.com', password: 'Demo2026!' }
];

async function main() {
  console.log('🔄 Chargement des utilisateurs...');
  const { data: { users }, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  
  if (error) {
    console.error('❌ Erreur listUsers:', error);
    process.exit(1);
  }

  const userMap = new Map(users.map(u => [u.email.toLowerCase(), u.id]));
  console.log(`📋 ${users.length} utilisateurs trouvés.`);

  for (const account of accounts) {
    const email = account.email.toLowerCase();
    const userId = userMap.get(email);

    if (userId) {
      console.log(`🔄 Mise à jour password pour: ${email}`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: account.password,
        email_confirm: true,
        user_metadata: { email_verified: true }
      });
      if (updateError) console.error(`  ❌ Failed: ${updateError.message}`);
      else console.log(`  ✅ OK`);
    } else {
      console.log(`✨ Création compte pour: ${email}`);
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: account.password,
        email_confirm: true,
        user_metadata: { email_verified: true }
      });
       if (createError) console.error(`  ❌ Failed: ${createError.message}`);
       else console.log(`  ✅ Created ID: ${data.user.id}`);
    }
  }
}

main();