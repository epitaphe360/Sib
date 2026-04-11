import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAvailabilitySlots() {
  console.log('📅 Ajout de créneaux de disponibilité pour exposants...\n');

  try {
    // 1. Récupérer tous les exhibitors
    const { data: exhibitors, error: exhibitorsError } = await supabase
      .from('exhibitors')
      .select('id, company_name, user_id');

    if (exhibitorsError) {
      console.error('❌ Erreur récupération exhibitors:', exhibitorsError.message);
      return;
    }

    console.log(`✅ ${exhibitors?.length || 0} exposants trouvés\n`);

    // 3. Préparer les créneaux pour les 7 prochains jours
    const today = new Date();
    const slots = [];

    // Configuration des créneaux par jour
    const dailySlots = [
      { start: '09:00', end: '10:00', type: 'in-person', location: 'Stand' },
      { start: '10:00', end: '11:00', type: 'in-person', location: 'Stand' },
      { start: '11:00', end: '12:00', type: 'virtual', location: 'Visio' },
      { start: '14:00', end: '15:00', type: 'in-person', location: 'Stand' },
      { start: '15:00', end: '16:00', type: 'virtual', location: 'Visio' },
      { start: '16:00', end: '17:00', type: 'in-person', location: 'Stand' }
    ];

    // Pour chaque exhibitor
    if (exhibitors && exhibitors.length > 0) {
      console.log('📍 Création des créneaux pour exposants...');
      let exhibitorCount = 0;

      for (const exhibitor of exhibitors) {
        // Créer des créneaux pour les 7 prochains jours
        for (let day = 0; day < 7; day++) {
          const slotDate = new Date(today);
          slotDate.setDate(today.getDate() + day);
          const dateStr = slotDate.toISOString().split('T')[0];

          // Créer 6 créneaux par jour (3 in-person, 3 virtual en alternance)
          for (const slot of dailySlots) {
            slots.push({
              exhibitor_id: exhibitor.id,
              slot_date: dateStr,
              start_time: slot.start,
              end_time: slot.end,
              duration: 60,
              type: slot.type,
              max_bookings: slot.type === 'virtual' ? 5 : 1,
              current_bookings: 0,
              available: true,
              location: slot.location
            });
          }
        }

        exhibitorCount++;
        if (exhibitorCount % 10 === 0) {
          console.log(`  ⏳ ${exhibitorCount}/${exhibitors.length} exposants traités...`);
        }
      }

      console.log(`  ✅ ${exhibitorCount} exposants traités`);
    }

    // 4. Insérer tous les créneaux en batch
    console.log(`\n💾 Insertion de ${slots.length} créneaux en base de données...`);
    
    if (slots.length > 0) {
      // Insérer par lots de 500 pour éviter les timeouts
      const batchSize = 500;
      let inserted = 0;

      for (let i = 0; i < slots.length; i += batchSize) {
        const batch = slots.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('time_slots')
          .insert(batch);

        if (insertError) {
          console.error(`❌ Erreur insertion batch ${i / batchSize + 1}:`, insertError.message);
        } else {
          inserted += batch.length;
          console.log(`  ✅ ${inserted}/${slots.length} créneaux insérés...`);
        }
      }

      console.log(`\n✅ Insertion terminée: ${inserted} créneaux créés`);
    }

    // 5. Statistiques finales
    const { count: totalSlots } = await supabase
      .from('time_slots')
      .select('*', { count: 'exact', head: true });

    console.log('\n📊 Statistiques:');
    console.log(`  Total créneaux en base: ${totalSlots}`);
    console.log(`  Exposants: ${exhibitors?.length || 0} × 42 créneaux`);
    console.log(`  Période: 7 jours (${today.toLocaleDateString()} → ${new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()})`);

    console.log('\n✅ Création des créneaux terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addAvailabilitySlots();
