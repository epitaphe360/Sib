import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const accounts = [
  { email: 'visitor-free@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'visitor-vip@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'exhibitor-9m@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'exhibitor-18m@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'exhibitor-36m@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'exhibitor-54m@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'demo.partner@sib.com', password: 'Demo2026!' },
  { email: 'partner-museum@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'partner-silver@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'partner-gold@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'partner-platinum@test.sib2026.ma', password: 'Demo2026!' },
  { email: 'marketing@sib.com', password: 'Demo2026!' },
  { email: 'admin@sib.com', password: 'Demo2026!' }
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