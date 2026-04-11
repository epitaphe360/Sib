import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEngagementData() {
  console.log('Vérification des données d\'engagement...\n');

  try {
    // Appointments
    const { count: appointmentsCount, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true });

    if (appointmentsError && appointmentsError.code !== 'PGRST116') {
      console.log('❌ Erreur appointments:', appointmentsError.message);
    } else {
      console.log(`✅ Rendez-vous programmés: ${appointmentsCount || 0}`);
    }

    // Messages
    const { count: messagesCount, error: messagesError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true });

    if (messagesError && messagesError.code !== 'PGRST116') {
      console.log('❌ Erreur messages:', messagesError.message);
    } else {
      console.log(`✅ Messages échangés: ${messagesCount || 0}`);
    }

    // Connections
    const { count: connectionsCount, error: connectionsError } = await supabase
      .from('connections')
      .select('id', { count: 'exact', head: true });

    if (connectionsError && connectionsError.code !== 'PGRST116') {
      console.log('❌ Erreur connections:', connectionsError.message);
    } else {
      console.log(`✅ Connexions établies: ${connectionsCount || 0}`);
    }

    // Profile views
    const { count: viewsCount, error: viewsError } = await supabase
      .from('profile_views')
      .select('id', { count: 'exact', head: true });

    if (viewsError && viewsError.code !== 'PGRST116') {
      console.log('⚠️ Table profile_views n\'existe pas (normal)');
    } else {
      console.log(`✅ Vues de profils: ${viewsCount || 0}`);
    }

    console.log('\n📊 Résumé:');
    console.log(JSON.stringify({
      appointments: appointmentsCount || 0,
      messages: messagesCount || 0,
      connections: connectionsCount || 0,
      profile_views: viewsCount || 0
    }, null, 2));

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkEngagementData();
