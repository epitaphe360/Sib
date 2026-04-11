
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConversations() {
  console.log('Checking conversations...');
  
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*');

  if (error) {
    console.error('Error fetching conversations:', error);
    return;
  }

  console.log(`Found ${conversations.length} conversations.`);
  
  if (conversations.length > 0) {
    console.log('Sample conversation:', conversations[0]);
  } else {
    console.log('No conversations found. This explains why the list is empty.');
  }

  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .limit(5);

  if (msgError) {
    console.error('Error fetching messages:', msgError);
  } else {
    console.log(`Found ${messages.length} messages (limit 5).`);
  }
}

checkConversations();
