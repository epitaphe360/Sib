import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in environment variables');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllEvents() {
  console.log('📅 Récupération de tous les événements de la base de données...\n');

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('❌ Erreur lors de la récupération des événements:', error);
      return;
    }

    if (!events || events.length === 0) {
      console.log('⚠️  Aucun événement trouvé dans la base de données');
      return;
    }

    console.log(`✅ ${events.length} événements trouvés :\n`);

    // Group events by date
    const eventsByDate = events.reduce((acc, event) => {
      const date = new Date(event.event_date).toLocaleDateString('fr-FR');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});

    // Display events grouped by date
    Object.keys(eventsByDate).sort().forEach(date => {
      console.log(`📅 ${date}`);
      console.log('─'.repeat(50));

      eventsByDate[date].forEach((event, index) => {
        const time = `${event.start_time} - ${event.end_time}`;
        const capacity = `${event.registered}/${event.capacity}`;
        const virtual = event.virtual ? '🌐' : '🏢';
        const featured = event.featured ? '⭐' : '  ';

        console.log(`${featured} ${index + 1}. ${event.title}`);
        console.log(`      🕒 ${time} | ${virtual} | 👥 ${capacity} | 🏷️ ${event.category}`);

        if (event.location) {
          console.log(`      📍 ${event.location}`);
        }

        if (event.tags && event.tags.length > 0) {
          console.log(`      🏷️ ${event.tags.slice(0, 3).join(', ')}`);
        }

        console.log('');
      });
    });

    // Summary statistics
    console.log('\n📊 Statistiques :');
    console.log(`   Total d'événements: ${events.length}`);
    console.log(`   Événements virtuels: ${events.filter(e => e.virtual).length}`);
    console.log(`   Événements physiques: ${events.filter(e => !e.virtual).length}`);
    console.log(`   Événements à la une: ${events.filter(e => e.featured).length}`);

    const categories = [...new Set(events.map(e => e.category))];
    console.log(`   Catégories: ${categories.join(', ')}`);

    const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
    const totalRegistered = events.reduce((sum, e) => sum + e.registered, 0);
    console.log(`   Capacité totale: ${totalCapacity}`);
    console.log(`   Inscriptions totales: ${totalRegistered}`);

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Run the script
listAllEvents().then(() => {
  console.log('\n🎉 Consultation terminée !');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Échec du script:', error);
  process.exit(1);
});
