import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Créneaux quotidiens pour partenaires (4 créneaux/jour - consultations virtuelles)
const dailySlots = [
  { start: '09:00', end: '10:00', type: 'virtual', location: 'Visio' },
  { start: '10:00', end: '11:00', type: 'virtual', location: 'Visio' },
  { start: '14:00', end: '15:00', type: 'virtual', location: 'Visio' },
  { start: '15:00', end: '16:00', type: 'virtual', location: 'Visio' }
];

async function addPartnerAvailability() {
  console.log('📅 Ajout de créneaux de disponibilité pour partenaires...\n');
  console.log('⚠️  Note: Utilise la table time_slots temporairement\n');

  // Récupérer tous les partenaires
  const { data: partners, error: partnersError } = await supabase
    .from('partners')
    .select('id, company_name, partner_type');

  if (partnersError) {
    console.log('❌ Erreur récupération partenaires:', partnersError.message);
    return;
  }

  console.log(`✅ ${partners?.length || 0} partenaires trouvés\n`);

  // Pour chaque partenaire, on va créer un "exhibitor" temporaire
  // qui servira de référence pour les créneaux
  console.log('📍 Création des créneaux pour partenaires...\n');
  
  const slots = [];
  const today = new Date();
  const partnerSlotMapping = {};

  for (const partner of partners || []) {
    // Récupérer le user_id du partenaire
    const { data: partnerDetails } = await supabase
      .from('partners')
      .select('user_id')
      .eq('id', partner.id)
      .single();

    if (!partnerDetails?.user_id) {
      console.log(`  ⚠️  Pas de user_id pour ${partner.company_name}, ignoré`);
      continue;
    }

    // Créer un exhibitor factice pour ce partenaire
    const { data: exhibitor, error: exhibitorError } = await supabase
      .from('exhibitors')
      .select('id')
      .eq('company_name', `PARTNER_REF_${partner.company_name}`)
      .maybeSingle();

    let exhibitorId;

    if (!exhibitor) {
      // Créer l'exhibitor de référence avec user_id
      const { data: newExhibitor, error: createError } = await supabase
        .from('exhibitors')
        .insert({
          user_id: partnerDetails.user_id,
          company_name: `PARTNER_REF_${partner.company_name}`,
          category: 'institutional',
          sector: partner.partner_type || 'consulting',
          description: `Référence pour partenaire: ${partner.company_name}`,
          verified: true
        })
        .select()
        .single();

      if (createError) {
        console.log(`  ❌ Erreur création référence pour ${partner.company_name}: ${createError.message}`);
        continue;
      }
      exhibitorId = newExhibitor.id;
      console.log(`  ✅ Référence créée pour ${partner.company_name}`);
    } else {
      exhibitorId = exhibitor.id;
      console.log(`  ✅ Référence existante pour ${partner.company_name}`);
    }

    partnerSlotMapping[partner.id] = exhibitorId;

    // Créer les créneaux
    for (let day = 0; day < 7; day++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + day);
      const dateStr = slotDate.toISOString().split('T')[0];
      
      for (const slot of dailySlots) {
        slots.push({
          exhibitor_id: exhibitorId,
          slot_date: dateStr,
          start_time: slot.start,
          end_time: slot.end,
          duration: 60,
          type: slot.type,
          max_bookings: 3,
          current_bookings: 0,
          available: true,
          location: slot.location
        });
      }
    }
  }

  console.log(`\n💾 Insertion de ${slots.length} créneaux en base de données...`);
  
  let insertedCount = 0;
  const batchSize = 500;
  
  for (let i = 0; i < slots.length; i += batchSize) {
    const batch = slots.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('time_slots')
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

  // Statistiques finales
  const { count: totalCount } = await supabase
    .from('time_slots')
    .select('*', { count: 'exact', head: true });

  console.log('\n📊 Statistiques:');
  console.log(`  Total créneaux en base: ${totalCount}`);
  console.log(`  Partenaires: ${partners?.length || 0} × 28 créneaux = ${(partners?.length || 0) * 28}`);
  console.log(`  (7 jours × 4 créneaux/jour)`);
  
  console.log('\n📝 Mapping partenaire → exhibitor_id:');
  for (const [partnerId, exhibitorId] of Object.entries(partnerSlotMapping)) {
    console.log(`  ${partnerId} → ${exhibitorId}`);
  }
}

addPartnerAvailability();
