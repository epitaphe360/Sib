import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function seedConversations() {
  console.log('🌱 Seeding test conversations...\n');

  try {
    // 1. Get first 5 users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(10);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length < 2) {
      console.error('❌ Not enough users. Need at least 2 users to create conversations');
      return;
    }

    console.log(`✅ Found ${users.length} users\n`);

    // 2. Create conversations between pairs of users
    for (let i = 0; i < users.length - 1; i += 2) {
      const user1 = users[i];
      const user2 = users[i + 1];

      console.log(`📝 Creating conversation between "${user1.name}" and "${user2.name}"`);

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          type: 'direct',
          participants: [user1.id, user2.id],
          created_by: user1.id,
          title: `Chat - ${user1.name} & ${user2.name}`,
          is_active: true
        })
        .select()
        .single();

      if (convError) {
        console.error('   ❌ Error creating conversation:', convError.message);
        continue;
      }

      console.log(`   ✅ Conversation created: ${conversation.id}`);

      // Add sample messages
      const messages = [
        {
          conversation_id: conversation.id,
          sender_id: user1.id,
          receiver_id: user2.id,
          content: `Bonjour ${user2.name}, enchanté de vous rencontrer à SIPORTS 2026!`,
          message_type: 'text',
          created_at: new Date(Date.now() - 120000).toISOString()
        },
        {
          conversation_id: conversation.id,
          sender_id: user2.id,
          receiver_id: user1.id,
          content: `Merci ${user1.name}! C'est super de pouvoir discuter ici.`,
          message_type: 'text',
          created_at: new Date(Date.now() - 60000).toISOString()
        },
        {
          conversation_id: conversation.id,
          sender_id: user1.id,
          receiver_id: user2.id,
          content: 'Vous êtes exposant ou visiteur?',
          message_type: 'text',
          created_at: new Date(Date.now() - 30000).toISOString()
        }
      ];

      const { error: msgError, data: msgs } = await supabase
        .from('messages')
        .insert(messages)
        .select();

      if (msgError) {
        console.error('   ❌ Error creating messages:', msgError.message);
      } else {
        console.log(`   ✅ Added ${msgs?.length || 0} messages\n`);
      }
    }

    // 3. Verify conversations were created
    const { data: allConvs, error: checkError } = await supabase
      .from('conversations')
      .select('*');

    if (!checkError) {
      console.log(`\n📊 Total conversations in database: ${allConvs?.length || 0}`);

      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      console.log(`📊 Total messages in database: ${msgCount}`);
    }

    console.log('\n✅ Seeding complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

seedConversations();
