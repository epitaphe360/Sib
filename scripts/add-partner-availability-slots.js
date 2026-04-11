import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Créneaux quotidiens pour partenaires (4 créneaux/jour - consultations)
const dailySlots = [
  { start: '09:00', end: '10:00', type: 'virtual', location: 'Visio' },
  { start: '10:00', end: '11:00', type: 'virtual', location: 'Visio' },
  { start: '14:00', end: '15:00', type: 'virtual', location: 'Visio' },
  { start: '15:00', end: '16:00', type: 'virtual', location: 'Visio' }
];

async function addPartnerAvailability() {
  console.log('📅 Ajout de créneaux de disponibilité pour partenaires...\n');

  // 1. Vérifier si la table existe
  const { error: tableError } = await supabase
    .from('partner_time_slots')
    .select('id')
    .limit(1);

  if (tableError) {
    console.log('❌ Table partner_time_slots n\'existe pas encore');
    console.log('Exécutez d\'abord la migration: supabase/migrations/20251225000001_create_partner_time_slots.sql\n');
    return;
  }

  // 2. Récupérer tous les partenaires
  const { data: partners, error: partnersError } = await supabase
    .from('partners')
    .select('id, company_name, partner_type');

  if (partnersError) {
    console.log('❌ Erreur récupération partenaires:', partnersError.message);
    return;
  }

  console.log(`✅ ${partners?.length || 0} partenaires trouvés\n`);

  // 3. Créer les créneaux pour chaque partenaire
  const slots = [];
  const today = new Date();
  
  console.log('📍 Création des créneaux pour partenaires...');
  
  for (const partner of partners || []) {
    for (let day = 0; day < 7; day++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + day);
      const dateStr = slotDate.toISOString().split('T')[0];
      
      for (const slot of dailySlots) {
        slots.push({
          partner_id: partner.id,
          slot_date: dateStr,
          start_time: slot.start,
          end_time: slot.end,
          duration: 60,
          type: slot.type,
          max_bookings: 3, // Plus de flexibilité pour consultations virtuelles
          current_bookings: 0,
          available: true,
          location: slot.location
        });
      }
    }
  }

  console.log(`  ✅ ${partners?.length || 0} partenaires traités\n`);

  // 4. Insertion en base de données
  console.log(`💾 Insertion de ${slots.length} créneaux en base de données...`);
  
  let insertedCount = 0;
  const batchSize = 500;
  
  for (let i = 0; i < slots.length; i += batchSize) {
    const batch = slots.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('partner_time_slots')
      .insert(batch)
      .select();
    
    if (error) {
      console.log(`❌ Erreur insertion batch ${Math.floor(i / batchSize) + 1}:`, error.message);
    } else {
      insertedCount += data?.length || 0;
      console.log(`  ✅ ${data?.length || 0}/${batch.length} créneaux insérés...`);
    }
  }

  console.log(`\n✅ Insertion terminée: ${insertedCount} créneaux créés`);

  // 5. Statistiques finales
  const { count: totalCount } = await supabase
    .from('partner_time_slots')
    .select('*', { count: 'exact', head: true });

  console.log('\n📊 Statistiques:');
  console.log(`  Total créneaux en base: ${totalCount}`);
  console.log(`  Partenaires: ${partners?.length || 0} × 28 créneaux = ${(partners?.length || 0) * 28}`);
  console.log(`  (7 jours × 4 créneaux/jour)`);
}

addPartnerAvailability();
