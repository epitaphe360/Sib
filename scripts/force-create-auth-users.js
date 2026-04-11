
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testAccounts = [
  { email: 'visitor-free@test.siport.com', password: 'Test@123456', type: 'visitor' },
  { email: 'visitor-vip@test.siport.com', password: 'Test@123456', type: 'visitor' },
  { email: 'exhibitor-9m@test.siport.com', password: 'Test@123456', type: 'exhibitor' },
  { email: 'partner-museum@test.siport.com', password: 'Test@123456', type: 'partner' },
  { email: 'partner-gold@test.siport.com', password: 'Test@123456', type: 'partner' },
  { email: 'admin.siports@siports.com', password: 'Test@123456', type: 'admin' },
  { email: 'partner-silver@test.siport.com', password: 'Test@123456', type: 'partner' }
];

async function createOrUpdateUser(account) {
  console.log(`Processing ${account.email}...`);
  try {
    // Check if user exists by email, but we need to fetch ALL to differ between existing/missing efficiently or just try create
    // Simplest is try to create, if fails, update.
    
    // Attempt Create
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { type: account.type }
    });

    if (createError) {
      console.log(`   Create error: ${createError.message}`);
      // Assume user exists if error relates to uniqueness
      if (createError.message.toLowerCase().includes('already') || createError.message.toLowerCase().includes('registered')) {
        console.log(`   User exists. Updating password...`);
      } else {
        console.error(`   ❌ Create failed with unexpected error: ${createError.message}`);
        return;
      }
    } else {
      console.log(`   ✅ Created successfully.`);
      return;
    }
    
    // If we are here, we need to update. Find ID.
    // NOTE: supabase-js v2
    // Let's try to find user by iterating (inefficient but works for script)
    let page = 1;
    let userId = null;
    while (!userId) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage: 50 });
        if (error || !users || users.length === 0) break;
        
        const found = users.find(u => u.email === account.email);
        if (found) {
            userId = found.id;
        }
        page++;
        if (page > 20) break; // Safety break
    }

    if (userId) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: account.password,
            user_metadata: { type: account.type },
            email_confirm: true
        });
        if (updateError) console.error(`   ❌ Update failed: ${updateError.message}`);
        else console.log(`   ✅ Updated password successfully.`);
    } else {
        console.error(`   ❌ Could not find user to update (pagination issue?).`);
    }

  } catch (err) {
    console.error(`   ❌ Exception: ${err.message}`);
  }
}

async function main() {
  console.log('--- STARTING ACCOUNT SETUP ---');
  for (const acc of testAccounts) {
    await createOrUpdateUser(acc);
  }
  console.log('--- DONE ---');
}

main();
