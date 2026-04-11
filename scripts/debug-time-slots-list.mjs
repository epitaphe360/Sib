import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTimeSlots() {
  console.log('🔍 DEBUG: Vérification des créneaux pour affichage en liste\n');

  try {
    // 1. Récupérer un exhibitor (par exemple, le premier)
    console.log('1️⃣ Récupération d\'un exhibitor...');
    const { data: exhibitors, error: exhError } = await supabase
      .from('exhibitors')
      .select('id, user_id, company_name')
      .limit(1);

    if (exhError || !exhibitors?.[0]) {
      console.error('❌ Erreur récup exhibitors:', exhError);
      return;
    }

    const exhibitor = exhibitors[0];
    console.log(`✅ Exhibitor trouvé: ${exhibitor.company_name} (ID: ${exhibitor.id})`);
    console.log(`   User ID: ${exhibitor.user_id}\n`);

    // 2. Récupérer TOUS les créneaux pour cet exhibitor
    console.log('2️⃣ Récupération de TOUS les créneaux pour cet exhibitor...');
    const { data: slots, error: slotsError } = await supabase
      .from('time_slots')
      .select('*')
      .eq('exhibitor_id', exhibitor.id)
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (slotsError) {
      console.error('❌ Erreur récup créneaux:', slotsError);
      return;
    }

    console.log(`✅ ${slots?.length || 0} créneaux trouvés\n`);

    // 3. Détail de chaque créneau
    if (slots && slots.length > 0) {
      console.log('📋 Détail des créneaux:');
      slots.forEach((slot, idx) => {
        console.log(`\n   ${idx + 1}. ${slot.slot_date} ${slot.start_time}-${slot.end_time}`);
        console.log(`      Type: ${slot.type}`);
        console.log(`      Lieu: ${slot.location || 'N/A'}`);
        console.log(`      Capacité: ${slot.current_bookings}/${slot.max_bookings}`);
      });

      // 4. Statistiques
      console.log('\n📊 Statistiques:');
      const byDate = {};
      slots.forEach(slot => {
        if (!byDate[slot.slot_date]) byDate[slot.slot_date] = [];
        byDate[slot.slot_date].push(slot);
      });

      Object.entries(byDate).forEach(([date, dateSlots]) => {
        console.log(`   ${date}: ${dateSlots.length} créneaux`);
      });

      // 5. Filtrage pour April 1-3
      console.log('\n🔎 Filtrage pour April 1-3, 2026:');
      const aprilSlots = slots.filter(slot => {
        return ['2026-04-01', '2026-04-02', '2026-04-03'].includes(slot.slot_date);
      });

      console.log(`   ✅ ${aprilSlots.length} créneaux trouvés pour April 1-3`);
      aprilSlots.forEach(slot => {
        console.log(`      • ${slot.slot_date} ${slot.start_time}-${slot.end_time}`);
      });
    } else {
      console.log('⚠️  Aucun créneau trouvé pour cet exhibitor');
    }

    // 6. Test du filtre weekDays utilisé dans le composant
    console.log('\n🧪 Test du filtre weekDays du composant:');
    const weekDays = [
      new Date('2026-04-01T00:00:00'),
      new Date('2026-04-02T00:00:00'),
      new Date('2026-04-03T00:00:00')
    ];

    const weekSlots = slots?.filter(slot => {
      const slotDate = new Date(slot.slot_date + 'T00:00:00');
      return weekDays.some(day =>
        day.toDateString() === slotDate.toDateString()
      );
    }) || [];

    console.log(`   Après filtrage weekDays: ${weekSlots.length} créneaux`);
    weekSlots.forEach(slot => {
      console.log(`      • ${slot.slot_date} ${slot.start_time}-${slot.end_time}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

debugTimeSlots().catch(console.error);
