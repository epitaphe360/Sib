import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_VIP_EMAIL = 'visitor-vip@test.siport.com';
const TEST_VIP_PASSWORD = 'Test@123456';

async function ensureVIPTestAccount() {
  console.log('🔍 Checking for VIP test account...');

  try {
    // Check if user exists in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', TEST_VIP_EMAIL)
      .single();

    if (existingUser) {
      console.log('✅ VIP test account already exists');
      console.log('📊 User details:', {
        id: existingUser.id,
        email: existingUser.email,
        type: existingUser.type,
        visitor_level: existingUser.visitor_level,
        status: existingUser.status
      });

      // Update to ensure correct settings if needed
      if (existingUser.visitor_level !== 'premium' || existingUser.status !== 'active') {
        console.log('🔧 Updating account settings...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            visitor_level: 'premium',
            status: 'active',
            type: 'visitor'
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('❌ Error updating user:', updateError);
        } else {
          console.log('✅ Account updated to active VIP premium');
        }
      }

      return;
    }

    // User doesn't exist, create it
    console.log('📝 Creating VIP test account...');

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_VIP_EMAIL,
      password: TEST_VIP_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name: 'VIP Test User',
        type: 'visitor',
        visitor_level: 'premium'
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create auth user');

    console.log('✅ Auth user created:', authData.user.id);

    // Create user profile
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: TEST_VIP_EMAIL,
        name: 'VIP Test User',
        type: 'visitor',
        visitor_level: 'premium',
        status: 'active',
        profile: {
          firstName: 'VIP',
          lastName: 'Test',
          phone: '+33123456789',
          country: 'FR',
          businessSector: 'Logistique',
          position: 'Test Manager',
          company: 'Test VIP Company'
        }
      }]);

    if (userError) throw userError;

    console.log('✅ VIP test account created successfully!');
    console.log('📧 Email:', TEST_VIP_EMAIL);
    console.log('🔑 Password:', TEST_VIP_PASSWORD);
    console.log('👑 Level: premium (VIP)');
    console.log('✓ Status: active');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

ensureVIPTestAccount();
