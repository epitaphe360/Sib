import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function addExhibitorPartnerAppointments() {
  try {
    console.log('🗓️  Création des rendez-vous Exposants-Partenaires (1-3 avril 2026)...\n');

    // 1. Récupérer les utilisateurs exposants
    console.log('📋 Récupération des exposants...');
    const { data: exhibitorUsers } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('type', 'exhibitor')
      .in('email', [
        'exhibitor-9m@test.siport.com',
        'exhibitor-18m@test.siport.com',
        'exhibitor-36m@test.siport.com',
        'exhibitor-54m@test.siport.com'
      ]);

    // 2. Récupérer les utilisateurs partenaires
    console.log('📋 Récupération des partenaires...');
    const { data: partnerUsers } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('type', 'partner')
      .in('email', [
        'partner-museum@test.siport.com',
        'partner-silver@test.siport.com',
        'partner-gold@test.siport.com',
        'partner-platinium@test.siport.com'
      ]);

    // 3. Récupérer les profils exhibitors
    const { data: exhibitors } = await supabase
      .from('exhibitors')
      .select('id, company_name, user_id')
      .in('user_id', exhibitorUsers?.map(u => u.id) || []);

    console.log(`✅ ${exhibitorUsers?.length || 0} exposants trouvés`);
    console.log(`✅ ${partnerUsers?.length || 0} partenaires trouvés`);
    console.log(`✅ ${exhibitors?.length || 0} profils exposants trouvés`);

    if (!exhibitorUsers || exhibitorUsers.length === 0) {
      console.log('❌ Aucun exposant trouvé');
      return;
    }

    if (!partnerUsers || partnerUsers.length === 0) {
      console.log('❌ Aucun partenaire trouvé');
      return;
    }

    if (!exhibitors || exhibitors.length === 0) {
      console.log('❌ Aucun profil exposant trouvé');
      return;
    }

    // 4. Nettoyer les anciens rendez-vous exposants-partenaires
    console.log('\n🧹 Nettoyage des anciens rendez-vous...');
    await supabase
      .from('appointments')
      .delete()
      .in('visitor_id', partnerUsers.map(p => p.id));

    // Nettoyer les créneaux d'avril 2026
    await supabase
      .from('time_slots')
      .delete()
      .in('exhibitor_id', exhibitors.map(e => e.id))
      .gte('slot_date', '2026-04-01')
      .lte('slot_date', '2026-04-03');

    console.log('✅ Nettoyage terminé');

    // 5. Créer des créneaux horaires pour le 1-3 avril 2026
    console.log('\n📅 Création des créneaux horaires (1-3 avril 2026)...');
    
    const timeSlots = [];
    const eventDates = ['2026-04-01', '2026-04-02', '2026-04-03'];

    exhibitors.forEach((exhibitor) => {
      eventDates.forEach((date, dayIndex) => {
        // Matin - 9h00-10h00
        timeSlots.push({
          exhibitor_id: exhibitor.id,
          slot_date: date,
          start_time: '09:00',
          end_time: '10:00',
          duration: 60,
          type: 'in-person',
          max_bookings: 1,
          current_bookings: 0,
          available: true,
          location: `Stand ${exhibitor.company_name}`
        });

        // Milieu de matinée - 11h00-12h00
        timeSlots.push({
          exhibitor_id: exhibitor.id,
          slot_date: date,
          start_time: '11:00',
          end_time: '12:00',
          duration: 60,
          type: 'in-person',
          max_bookings: 1,
          current_bookings: 0,
          available: true,
          location: `Stand ${exhibitor.company_name}`
        });

        // Après-midi - 14h00-15h00
        timeSlots.push({
          exhibitor_id: exhibitor.id,
          slot_date: date,
          start_time: '14:00',
          end_time: '15:00',
          duration: 60,
          type: 'in-person',
          max_bookings: 1,
          current_bookings: 0,
          available: true,
          location: `Stand ${exhibitor.company_name}`
        });

        // Fin d'après-midi - 16h00-17h00
        timeSlots.push({
          exhibitor_id: exhibitor.id,
          slot_date: date,
          start_time: '16:00',
          end_time: '17:00',
          duration: 60,
          type: 'in-person',
          max_bookings: 1,
          current_bookings: 0,
          available: true,
          location: `Stand ${exhibitor.company_name}`
        });
      });
    });

    const { data: createdSlots, error: slotsError } = await supabase
      .from('time_slots')
      .insert(timeSlots)
      .select();

    if (slotsError) {
      console.error('❌ Erreur lors de la création des créneaux:', slotsError);
      return;
    }

    console.log(`✅ ${createdSlots.length} créneaux créés pour les 3 jours`);

    // 6. Créer les rendez-vous
    console.log('\n📝 Création des rendez-vous...');
    
    const appointments = [];

    // 1er avril 2026 - Partenaire Museum avec Exposant 9m² (confirmé)
    const slot1Apr9h = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[0].id && 
      s.slot_date === '2026-04-01' && 
      String(s.start_time).includes('09:00')
    );
    if (slot1Apr9h) {
      appointments.push({
        time_slot_id: slot1Apr9h.id,
        exhibitor_id: exhibitors[0].id,
        visitor_id: partnerUsers.find(p => p.email.includes('museum')).id,
        status: 'confirmed',
        notes: 'Partenariat culturel - Exposition maritime',
        message: 'Discussion sur exposition conjointe au musée',
        meeting_type: 'in-person'
      });
      // Marquer le créneau comme réservé
      await supabase.from('time_slots')
        .update({ current_bookings: 1, available: false })
        .eq('id', slot1Apr9h.id);
    }

    // 1er avril 2026 - Partenaire Silver avec Exposant 18m² (confirmé)
    const slot1Apr11h = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[1].id && 
      s.slot_date === '2026-04-01' && 
      String(s.start_time).includes('11:00')
    );
    if (slot1Apr11h) {
      appointments.push({
        time_slot_id: slot1Apr11h.id,
        exhibitor_id: exhibitors[1].id,
        visitor_id: partnerUsers.find(p => p.email.includes('silver')).id,
        status: 'confirmed',
        notes: 'Solutions logistiques intégrées',
        message: 'Partenariat technologique et services',
        meeting_type: 'in-person'
      });
      await supabase.from('time_slots')
        .update({ current_bookings: 1, available: false })
        .eq('id', slot1Apr11h.id);
    }

    // 2 avril 2026 - Partenaire Gold avec Exposant 36m² (confirmé)
    const slot2Apr9h = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[2].id && 
      s.slot_date === '2026-04-02' && 
      String(s.start_time).includes('09:00')
    );
    if (slot2Apr9h) {
      appointments.push({
        time_slot_id: slot2Apr9h.id,
        exhibitor_id: exhibitors[2].id,
        visitor_id: partnerUsers.find(p => p.email.includes('gold')).id,
        status: 'confirmed',
        notes: 'Partenariat stratégique premium',
        message: 'Opportunités de co-développement',
        meeting_type: 'in-person'
      });
      await supabase.from('time_slots')
        .update({ current_bookings: 1, available: false })
        .eq('id', slot2Apr9h.id);
    }

    // 2 avril 2026 - Partenaire Platinium avec Exposant 54m² (en attente)
    const slot2Apr14h = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[3].id && 
      s.slot_date === '2026-04-02' && 
      String(s.start_time).includes('14:00')
    );
    if (slot2Apr14h) {
      appointments.push({
        time_slot_id: slot2Apr14h.id,
        exhibitor_id: exhibitors[3].id,
        visitor_id: partnerUsers.find(p => p.email.includes('platinium')).id,
        status: 'pending',
        notes: 'Demande de rendez-vous - Partenariat exclusif',
        message: 'Proposition alliance stratégique mondiale',
        meeting_type: 'in-person'
      });
      await supabase.from('time_slots')
        .update({ current_bookings: 1, available: false })
        .eq('id', slot2Apr14h.id);
    }

    // 3 avril 2026 - Partenaire Museum avec Exposant 36m² (confirmé)
    const slot3Apr11h = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[2].id && 
      s.slot_date === '2026-04-03' && 
      String(s.start_time).includes('11:00')
    );
    if (slot3Apr11h) {
      appointments.push({
        time_slot_id: slot3Apr11h.id,
        exhibitor_id: exhibitors[2].id,
        visitor_id: partnerUsers.find(p => p.email.includes('museum')).id,
        status: 'confirmed',
        notes: 'Présentation technologies patrimoniales',
        message: 'Solutions de préservation et archivage',
        meeting_type: 'in-person'
      });
      await supabase.from('time_slots')
        .update({ current_bookings: 1, available: false })
        .eq('id', slot3Apr11h.id);
    }

    // 3 avril 2026 - Partenaire Gold avec Exposant 54m² (en attente)
    const slot3Apr16h = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[3].id && 
      s.slot_date === '2026-04-03' && 
      String(s.start_time).includes('16:00')
    );
    if (slot3Apr16h) {
      appointments.push({
        time_slot_id: slot3Apr16h.id,
        exhibitor_id: exhibitors[3].id,
        visitor_id: partnerUsers.find(p => p.email.includes('gold')).id,
        status: 'pending',
        notes: 'Demande - Expansion services maritimes',
        message: 'Discussion extension réseau international',
        meeting_type: 'in-person'
      });
      await supabase.from('time_slots')
        .update({ current_bookings: 1, available: false })
        .eq('id', slot3Apr16h.id);
    }

    // Insérer les rendez-vous un par un pour éviter les problèmes de quota
    const createdAppointments = [];
    for (const apt of appointments) {
      const { data, error } = await supabase
        .from('appointments')
        .insert(apt)
        .select()
        .single();
      
      if (!error && data) {
        createdAppointments.push(data);
        console.log(`  ✓ Rendez-vous créé: ${data.status}`);
      } else if (error) {
        console.log(`  ⚠ Erreur ignorée: ${error.message}`);
        // Continuer malgré l'erreur
      }
    }

    console.log(`✅ ${createdAppointments.length} rendez-vous créés`);

    // 7. Résumé
    console.log('\n✨ Rendez-vous Exposants-Partenaires créés avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`   - Exposants: ${exhibitors.length}`);
    console.log(`   - Partenaires: ${partnerUsers.length}`);
    console.log(`   - Créneaux disponibles: ${createdSlots.length} (1-3 avril 2026)`);
    console.log(`   - Rendez-vous créés: ${createdAppointments.length}`);
    console.log('\n🎯 Statuts des rendez-vous:');
    console.log(`   - Confirmés: ${createdAppointments.filter(a => a.status === 'confirmed').length}`);
    console.log(`   - En attente: ${createdAppointments.filter(a => a.status === 'pending').length}`);
    console.log('\n📅 Dates de l\'événement:');
    console.log('   - 1er avril 2026 (Jour 1)');
    console.log('   - 2 avril 2026 (Jour 2)');
    console.log('   - 3 avril 2026 (Jour 3)');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addExhibitorPartnerAppointments();
