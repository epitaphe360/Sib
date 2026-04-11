import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function testGetConversations() {
  console.log('🔍 Testing getConversations function...\n');

  try {
    // Get a test user
    const { data: users } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(1)
      .single();

    if (!users) {
      console.error('❌ No users found');
      return;
    }

    const userId = users.id;
    console.log(`👤 Using user: "${users.name}" (ID: ${userId})\n`);

    // Execute the same query as getConversations()
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        participants,
        type,
        title,
        description,
        created_by,
        last_message_at,
        is_active,
        metadata,
        created_at,
        updated_at,
        messages:messages(
          id,
          content,
          message_type,
          created_at,
          read_at,
          receiver_id,
          sender:sender_id(id, name)
        )
      `)
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Found ${data?.length || 0} conversations:\n`);

    data?.forEach((conv, idx) => {
      console.log(`${idx + 1}. Conversation ID: ${conv.id}`);
      console.log(`   Participants: ${conv.participants?.join(', ')}`);
      console.log(`   Messages: ${conv.messages?.length || 0}`);
      console.log(`   Last message: ${conv.messages?.[0]?.content?.substring(0, 50) || 'N/A'}`);
      console.log();
    });

    console.log('✅ Query successful! Check if conversations are displayed in UI.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testGetConversations();
