import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_PASSWORD = 'Test@123456';

const USERS = [
  {
    role: 'admin',
    email: 'admin-test@test.siport.com',
    password: TEST_PASSWORD,
    name: 'Admin Test',
    type: 'admin'
  },
  {
    role: 'visitor',
    email: 'visitor-free@test.siport.com',
    password: TEST_PASSWORD,
    name: 'Jean Dupont',
    type: 'visitor',
    visitor_level: 'free',
    profileTable: 'visitor_profiles',
    profileData: {
      first_name: 'Jean',
      last_name: 'Dupont',
      company: 'Tech Solutions Inc',
      position: 'Directeur Technique',
      phone: '+33612345678',
      country: 'France',
      visitor_type: 'company',
      pass_type: 'free'
    }
  },
  {
    role: 'exhibitor',
    email: 'exhibitor-9m@test.siport.com',
    password: TEST_PASSWORD,
    name: 'Thomas Dubois',
    type: 'exhibitor',
    profileTable: 'exhibitor_profiles',
    profileData: {
      company_name: 'StartUp Port Innovations',
      first_name: 'Thomas',
      last_name: 'Dubois',
      email: 'contact@startupportinno.com',
      phone: '+33678901234',
      description: 'Startup innovante en solutions IoT',
      country: 'France',
      sector: 'Technology',
      category: 'startup',
      stand_number: 'A1-001',
      stand_area: 9.0
    }
  },
  {
    role: 'partner',
    email: 'partner-museum@test.siport.com',
    password: TEST_PASSWORD,
    name: 'Pierre Leclerc',
    type: 'partner',
    partner_tier: 'museum',
    profileTable: 'partner_profiles',
    profileData: {
      company_name: 'Maritime Museum Foundation',
      contact_name: 'Pierre Leclerc',
      contact_email: 'contact@museumfoundation.org',
      contact_phone: '+33145678901',
      description: 'Fondation dédiée à la préservation',
      country: 'France',
      partnership_level: 'museum'
    }
  }
];

async function findUserByEmail(email) {
    let page = 1;
    let users = [];
    while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 100 });
        if (error || !data.users.length) break;
        users = users.concat(data.users);
        if (data.users.length < 100) break;
        page++;
    }
    return users.find(u => u.email === email);
}

async function createTestUsers() {
  console.log('🚀 Creating Test Users via Supabase Admin API...\n');

  for (const user of USERS) {
    console.log(`Working on ${user.role} (${user.email})...`);
    
    try {
      // 1. Check Auth User
      let authUser = await findUserByEmail(user.email);
      let authId;

      if (authUser) {
        console.log(`  ✅ Auth user exists (${authUser.id})`);
        authId = authUser.id;
        // Reset password just in case
        await supabaseAdmin.auth.admin.updateUserById(authId, { password: user.password });
        console.log(`  pswd updated.`);
      } else {
        const { data: newAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { name: user.name }
        });
        if (authError) throw authError;
        authUser = newAuth.user;
        authId = authUser.id;
        console.log(`  ✅ Auth user created (${authId})`);
      }

      // 2. Check/Create Public User
      let { data: existingProfile } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', authId)
        .single();

      // Fallback: check by email if not found by ID
      if (!existingProfile) {
          const { data: byEmail } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();
            
          if (byEmail) {
             console.log(`  ⚠️ Mismatch: User legacy entry found by email (${byEmail.id}) but not ID. Deleting public row.`);
             await supabaseAdmin.from('users').delete().eq('id', byEmail.id);
          }
      }

      if (existingProfile) {
        console.log(`  ✅ Public user exists`);
        // Update basic fields
        const updateData = { type: user.type, name: user.name };
        if (user.visitor_level) updateData.visitor_level = user.visitor_level;
        if (user.partner_tier) updateData.partner_tier = user.partner_tier;
        
        await supabaseAdmin.from('users').update(updateData).eq('id', authId);
      } else {
        const insertData = {
            id: authId,
            email: user.email,
            name: user.name,
            type: user.type,
            created_at: new Date().toISOString()
        };
        if (user.visitor_level) insertData.visitor_level = user.visitor_level;
        if (user.partner_tier) insertData.partner_tier = user.partner_tier;

        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert(insertData);
        
        if (insertError) throw insertError;
        console.log(`  ✅ Public user created`);
      }

      // 3. Create Specific Profile
      if (user.profileTable) {
        // Delete existing profile to avoid conflict/ensure fresh data
        await supabaseAdmin.from(user.profileTable).delete().eq('user_id', authId);
        
        const profileData = { ...user.profileData, user_id: authId };
        const { error: profileError } = await supabaseAdmin
            .from(user.profileTable)
            .insert(profileData);
        
        if (profileError) {
             console.error(`  ❌ Profile creation failed: ${profileError.message}`);
        } else {
             console.log(`  ✅ ${user.profileTable} entry created`);
        }
      }

    } catch (e) {
      console.error(`  ❌ Failed: ${e.message}`);
    }
    console.log('');
  }
}

createTestUsers();
