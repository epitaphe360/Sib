import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const TEST_ACCOUNTS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'visitor-free@test.siport.com',
    password: 'Test@1234567',
    type: 'visitor',
    visitor_level: 'free',
    name: 'Visiteur Free'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'visitor-vip@test.siport.com',
    password: 'Test@1234567',
    type: 'visitor',
    visitor_level: 'vip',
    name: 'Visiteur VIP'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    email: 'exhibitor-9m@test.siport.com',
    password: 'Test@1234567',
    type: 'exhibitor',
    name: 'Exposant 9m'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    email: 'exhibitor-18m@test.siport.com',
    password: 'Test@1234567',
    type: 'exhibitor',
    name: 'Exposant 18m'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000009',
    email: 'exhibitor-36m@test.siport.com',
    password: 'Test@1234567',
    type: 'exhibitor',
    name: 'Exposant 36m'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000010',
    email: 'exhibitor-54m@test.siport.com',
    password: 'Test@1234567',
    type: 'exhibitor',
    name: 'Exposant 54m'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'partner-museum@test.siport.com',
    password: 'Test@1234567',
    type: 'partner',
    partner_tier: 'museum',
    name: 'Partenaire Museum'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    email: 'partner-chamber@test.siport.com',
    password: 'Test@1234567',
    type: 'partner',
    partner_tier: 'silver',
    name: 'Partenaire Chambre'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    email: 'partner-sponsor@test.siport.com',
    password: 'Test@1234567',
    type: 'partner',
    partner_tier: 'gold',
    name: 'Partenaire Sponsor'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    email: 'partner-platinum@test.siport.com',
    password: 'Test@1234567',
    type: 'partner',
    partner_tier: 'platinum',
    name: 'Partenaire Platinum'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000099',
    email: 'admin-test@test.siport.com',
    password: 'Test@1234567',
    type: 'admin',
    name: 'Admin Test'
  }
];

(async () => {
  console.log('🚀 Starting sync of test accounts...');

  for (const account of TEST_ACCOUNTS) {
    console.log(`Processing ${account.email}...`);

    // 1. Delete from auth.users if exists (to avoid conflicts)
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError.message);
      break;
    }

    const existingAuthUser = authUsers.users.find(u => u.email === account.email);
    if (existingAuthUser) {
      console.log(`  - Deleting existing auth user ${existingAuthUser.id}...`);
      await supabase.auth.admin.deleteUser(existingAuthUser.id);
    }

    // 2. Create in auth.users with specific ID
    console.log(`  - Creating auth user with ID ${account.id}...`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      id: account.id,
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        name: account.name,
        type: account.type
      }
    });

    if (createError) {
      console.error(`  ❌ Error creating auth user: ${createError.message}`);
      continue;
    }

    // 3. Ensure public.users record exists and matches
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', account.email)
      .single();

    if (publicUser) {
      if (publicUser.id !== account.id) {
        console.log(`  - Updating public.users ID from ${publicUser.id} to ${account.id}...`);
        // We can't easily update the ID if it's a primary key and has FKs.
        // Let's try to delete and recreate.
        await supabase.from('users').delete().eq('email', account.email);
        const { error: insertError } = await supabase.from('users').insert([{
          ...publicUser,
          id: account.id,
          updated_at: new Date().toISOString()
        }]);
        if (insertError) console.error(`  ❌ Error recreating public user: ${insertError.message}`);
      } else {
        console.log(`  - public.users record already matches.`);
      }
    } else {
      console.log(`  - Creating public.users record...`);
      const { error: insertError } = await supabase.from('users').insert([{
        id: account.id,
        email: account.email,
        name: account.name,
        type: account.type,
        status: 'active',
        visitor_level: account.visitor_level || null,
        partner_tier: account.partner_tier || null,
        profile: { firstName: account.name.split(' ')[0], lastName: account.name.split(' ')[1] || '' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
      if (insertError) console.error(`  ❌ Error creating public user: ${insertError.message}`);
    }
  }

  console.log('✅ Sync complete!');
})();
