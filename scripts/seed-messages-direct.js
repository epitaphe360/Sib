
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedMessages() {
  console.log('Seeding conversations and messages...');

  // 1. Get some users
  const { data: users } = await supabase.from('users').select('id, name, role').limit(5);
  
  if (!users || users.length < 2) {
    console.error('Not enough users to create conversations');
    return;
  }

  const user1 = users[0];
  const user2 = users[1];

  console.log(`Creating conversation between ${user1.name} and ${user2.name}`);

  // 2. Create Conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      type: 'direct',
      participants: [user1.id, user2.id],
      created_by: user1.id,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (convError) {
    console.error('Error creating conversation:', convError);
    // Try to fetch existing if unique constraint failed (though we didn't set one explicitly in the insert)
  } else {
    console.log('Conversation created:', conversation.id);

    // 3. Create Messages
    const messages = [
      {
        conversation_id: conversation.id,
        sender_id: user1.id,
        content: 'Bonjour, comment allez-vous ?',
        created_at: new Date(Date.now() - 100000).toISOString()
      },
      {
        conversation_id: conversation.id,
        sender_id: user2.id,
        content: 'Très bien merci, et vous ?',
        created_at: new Date(Date.now() - 50000).toISOString()
      }
    ];

    const { error: msgError } = await supabase
      .from('messages')
      .insert(messages);

    if (msgError) {
      console.error('Error creating messages:', msgError);
    } else {
      console.log('Messages created successfully');
    }
  }
}

seedMessages();
