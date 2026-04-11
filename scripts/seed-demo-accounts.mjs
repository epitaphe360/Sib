import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEMO_ACCOUNTS = [
  {
    email: 'admin.siports@siports.com',
    password: 'Admin123!',
    metadata: { first_name: 'Admin', last_name: 'SIPORT', role: 'admin', account_type: 'admin' },
    type: 'admin'
  },
  {
    email: 'exposant@siports.com',
    password: 'Expo123!',
    metadata: { first_name: 'Exposant', last_name: 'Demo', role: 'exhibitor', account_type: 'exhibitor' },
    type: 'exhibitor'
  },
  {
    email: 'visiteur@siports.com',
    password: 'Visit123!',
    metadata: { first_name: 'Visiteur', last_name: 'Demo', role: 'visitor', account_type: 'visitor' },
    type: 'visitor'
  },
  {
    email: 'partenaire@siports.com',
    password: 'Partner123!',
    metadata: { first_name: 'Partenaire', last_name: 'Demo', role: 'partner', account_type: 'partner' },
    type: 'partner'
  }
];

async function seedDemoAccounts() {
  console.log('🚀 Seeding demo accounts...');

  // Get all users to check existence
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
    perPage: 1000
  });
  
  if (listError) {
    console.error(`❌ Error listing users: ${listError.message}`);
    process.exit(1);
  }

  for (const account of DEMO_ACCOUNTS) {
    console.log(`\nChecking account: ${account.email}`);
    
    let user = users.find(u => u.email === account.email);

    if (!user) {
      console.log(`  ↳ Creating auth user...`);
      const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: account.metadata
      });

      if (createError) {
        if (createError.message.includes('already been registered')) {
          console.log('  ↳ User already exists (detected by error), fetching again...');
          // This shouldn't happen with perPage: 1000 but just in case
          continue; 
        }
        console.error(`  ❌ Error creating user: ${createError.message}`);
        continue;
      }
      user = newUser;
      console.log(`  ✅ Auth user created: ${user.id}`);
    } else {
      console.log(`  ✅ Auth user found: ${user.id}`);
      console.log(`  ↳ Updating password to: ${account.password}`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: account.password,
        user_metadata: account.metadata
      });
      if (updateError) {
        console.error(`  ❌ Error updating user: ${updateError.message}`);
      } else {
        console.log(`  ✅ User updated successfully`);
      }
    }

    // 2. Ensure user exists in public.users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      console.log(`  ↳ Creating profile in public.users...`);
      const { error: insertError } = await supabase
        .from('users')
        .upsert([{
          id: user.id,
          email: account.email,
          name: `${account.metadata.first_name} ${account.metadata.last_name}`,
          type: account.type,
          role: account.type,
          status: 'active'
        }]);

      if (insertError) {
        console.error(`  ❌ Error creating profile: ${insertError.message}`);
      } else {
        console.log(`  ✅ Profile created/updated`);
      }
    } else if (profileError) {
      console.error(`  ❌ Error checking profile: ${profileError.message}`);
    } else {
      console.log(`  ✅ Profile already exists`);
      // Update profile to ensure correct type/role
      await supabase.from('users').update({
        type: account.type,
        role: account.type,
        status: 'active'
      }).eq('id', user.id);
    }
  }

  console.log('\n✨ Seeding complete!');
}

seedDemoAccounts().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
