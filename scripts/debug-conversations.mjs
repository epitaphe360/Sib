import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function checkConversations() {
  console.log('🔍 Checking conversations table...\n');

  // 1. Count total conversations
  const { count: totalConvs } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total conversations: ${totalConvs}\n`);

  if (totalConvs === 0) {
    console.log('⚠️ NO CONVERSATIONS FOUND IN DATABASE');
    console.log('This is why the Messages page is empty!\n');
  }

  // 2. Get first 5 conversations
  const { data: convs, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .limit(5);

  if (convError) {
    console.error('❌ Error fetching conversations:', convError);
    return;
  }

  if (convs?.length > 0) {
    console.log('📋 Sample conversations:');
    convs.forEach((conv, idx) => {
      console.log(`\n  ${idx + 1}. ${conv.id}`);
      console.log(`     Participants: ${JSON.stringify(conv.participants)}`);
      console.log(`     Created: ${conv.created_at}`);
    });
  }

  // 3. Check messages table
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  console.log(`\n\n💬 Total messages: ${totalMessages}`);

  if (totalMessages > 0) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .limit(3);

    console.log('\n📝 Sample messages:');
    msgs?.forEach((msg, idx) => {
      console.log(`  ${idx + 1}. ${msg.content?.substring(0, 50)}`);
    });
  }

  // 4. Check if we need to create test conversations
  console.log('\n\n✅ Done');
}

checkConversations().catch(console.error);
