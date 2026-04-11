import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function addCompleteDemoData() {
  try {
    console.log('🗓️  Création des données de démonstration complètes...\n');

    // 1. Récupérer les utilisateurs
    console.log('📋 Récupération des visiteurs...');
    const { data: visitors } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('type', 'visitor')
      .in('email', ['visitor-free@test.siport.com', 'visitor-vip@test.siport.com']);

    console.log(`✅ ${visitors?.length || 0} visiteurs trouvés`);

    // 2. Récupérer les exposants
    console.log('📋 Récupération des exposants...');
    const { data: exhibitors } = await supabase
      .from('exhibitors')
      .select('id, company_name, user_id')
      .in('user_id', [
        'fa5c44fe-e280-47e6-a4a6-630285f3d93b',
        'd41e51aa-c4e8-43fa-a266-5c128adb881f',
        'c1283698-b03f-490f-8d7f-f43e28c44143',
        '0761473c-7b11-405e-8d01-cbed36308f7c'
      ]);

    console.log(`✅ ${exhibitors?.length || 0} exposants trouvés`);

    if (!visitors || visitors.length === 0) {
      console.log('❌ Aucun visiteur trouvé');
      return;
    }

    if (!exhibitors || exhibitors.length === 0) {
      console.log('❌ Aucun exposant trouvé');
      return;
    }

    // 3. Nettoyer les anciennes données de démo
    console.log('\n🧹 Nettoyage des anciennes données...');
    
    // Supprimer les appointments de démonstration
    await supabase
      .from('appointments')
      .delete()
      .in('visitor_id', visitors.map(v => v.id));
    
    // Supprimer les time_slots de démonstration
    await supabase
      .from('time_slots')
      .delete()
      .in('exhibitor_id', exhibitors.map(e => e.id));

    console.log('✅ Nettoyage terminé');

    // 4. Créer des créneaux horaires (time_slots) pour SIPORTS 2026
    console.log('\n📅 Création des créneaux horaires (1-3 avril 2026)...');
    
    const eventDates = ['2026-04-01', '2026-04-02', '2026-04-03'];
    const timeSlots = [];

    // Pour chaque exposant, créer plusieurs créneaux sur les 3 jours de l'événement
    exhibitors.forEach((exhibitor, index) => {
      // 1er avril - Créneau matin
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: eventDates[0],
        start_time: '10:00',
        end_time: '10:30',
        duration: 30,
        type: 'in-person',
        max_bookings: 1,
        current_bookings: index === 0 ? 1 : 0,
        available: index !== 0,
        location: `Stand ${exhibitor.company_name}`
      });

      // 1er avril - Créneau après-midi
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: eventDates[0],
        start_time: '14:00',
        end_time: '14:45',
        duration: 45,
        type: 'in-person',
        max_bookings: 1,
        current_bookings: index === 1 ? 1 : 0,
        available: index !== 1,
        location: `Stand ${exhibitor.company_name}`
      });

      // 2 avril - Créneau matin
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: eventDates[1],
        start_time: '11:00',
        end_time: '12:00',
        duration: 60,
        type: 'in-person',
        max_bookings: 1,
        current_bookings: index === 2 ? 1 : 0,
        available: index !== 2,
        location: `Stand ${exhibitor.company_name}`
      });

      // 2 avril - Créneau visio
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: eventDates[1],
        start_time: '09:30',
        end_time: '10:15',
        duration: 45,
        type: 'virtual',
        max_bookings: 2,
        current_bookings: index === 3 ? 1 : 0,
        available: index !== 3,
        location: 'Visioconférence'
      });

      // 3 avril - Créneaux VIP
      if (index < 2) {
        timeSlots.push({
          exhibitor_id: exhibitor.id,
          slot_date: eventDates[2],
          start_time: '15:00',
          end_time: '16:00',
          duration: 60,
          type: 'hybrid',
          max_bookings: 1,
          current_bookings: 1,
          available: false,
          location: `Stand ${exhibitor.company_name} + Visio`
        });
      }
    });

    const { data: createdSlots, error: slotsError } = await supabase
      .from('time_slots')
      .insert(timeSlots)
      .select();

    if (slotsError) {
      console.error('❌ Erreur lors de la création des créneaux:', slotsError);
      return;
    }

    console.log(`✅ ${createdSlots.length} créneaux créés`);

    // Débug: afficher un créneau exemple
    console.log('Exemple de créneau créé:', JSON.stringify(createdSlots[0], null, 2));

    // 5. Créer les rendez-vous pour SIPORTS 2026 (1-3 avril)
    console.log('\n📝 Création des rendez-vous...');
    
    const appointments = [];

    // Utiliser visiteur VIP pour tous les rendez-vous (visitor-free n'a pas le droit)
    const vipVisitor = visitors.find(v => v.email === 'visitor-vip@test.siport.com') || visitors[1] || visitors[0];
    
    // Rendez-vous 1er avril matin avec TechMarine (10h00)
    const slot1erAvrilMatin = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[0].id && 
      s.slot_date === eventDates[0] &&
      String(s.start_time).includes('10:00')
    );
    console.log('Slot 1er avril matin found:', slot1erAvrilMatin ? 'Oui' : 'Non');
    if (slot1erAvrilMatin) {
      appointments.push({
        time_slot_id: slot1erAvrilMatin.id,
        exhibitor_id: exhibitors[0].id,
        visitor_id: vipVisitor.id,
        status: 'confirmed',
        notes: 'Discussion sur SmartPort PMS - SIPORTS 2026',
        message: 'Je souhaite en savoir plus sur vos solutions de gestion portuaire',
        meeting_type: 'in-person'
      });
    }

    // Rendez-vous 1er avril après-midi avec OceanLogistics (14h00)
    const slot1erAvrilApresMidi = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[1].id && 
      s.slot_date === eventDates[0] &&
      String(s.start_time).includes('14:00')
    );
    console.log('Slot 1er avril après-midi found:', slot1erAvrilApresMidi ? 'Oui' : 'Non');
    if (slot1erAvrilApresMidi) {
      appointments.push({
        time_slot_id: slot1erAvrilApresMidi.id,
        exhibitor_id: exhibitors[1].id,
        visitor_id: vipVisitor.id,
        status: 'confirmed',
        notes: 'Présentation des solutions logistiques',
        message: 'Intéressé par vos solutions de tracking',
        meeting_type: 'in-person'
      });
    }

    // Rendez-vous 2 avril matin avec PortTech (11h00)
    const slot2Avril = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[2].id && 
      s.slot_date === eventDates[1] &&
      String(s.start_time).includes('11:00')
    );
    console.log('Slot 2 avril found:', slot2Avril ? 'Oui' : 'Non');
    if (slot2Avril) {
      appointments.push({
        time_slot_id: slot2Avril.id,
        exhibitor_id: exhibitors[2].id,
        visitor_id: vipVisitor.id,
        status: 'confirmed',
        notes: 'Démo complète PortTech Industries - Solutions premium',
        message: 'Rendez-vous pour une démonstration complète',
        meeting_type: 'in-person'
      });
    }

    // Rendez-vous 2 avril visio avec Global Shipping (09h30 - EN ATTENTE)
    const slot2AvrilVisio = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[3].id && 
      s.slot_date === eventDates[1] &&
      String(s.start_time).includes('09:30')
    );
    console.log('Slot 2 avril visio found:', slot2AvrilVisio ? 'Oui' : 'Non');
    if (slot2AvrilVisio) {
      appointments.push({
        time_slot_id: slot2AvrilVisio.id,
        exhibitor_id: exhibitors[3].id,
        visitor_id: vipVisitor.id,
        status: 'pending',
        notes: 'En attente de confirmation - Global Shipping Alliance',
        message: 'Souhait de discuter partenariat international',
        meeting_type: 'virtual'
      });
    }

    // Rendez-vous VIP 3 avril (sessions VIP avec exposants premium)
    const slotVip1 = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[0].id && 
      s.slot_date === eventDates[2] &&
      String(s.start_time).includes('15:00')
    );
    console.log('Slot VIP1 (3 avril) found:', slotVip1 ? 'Oui' : 'Non');
    if (slotVip1) {
      appointments.push({
        time_slot_id: slotVip1.id,
        exhibitor_id: exhibitors[0].id,
        visitor_id: vipVisitor.id,
        status: 'confirmed',
        notes: 'Session VIP - Présentation exclusive dirigeants - 3 avril',
        message: 'Rendez-vous VIP pour discussion stratégique',
        meeting_type: 'hybrid'
      });
    }

    const slotVip2 = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[1].id && 
      s.slot_date === eventDates[2] &&
      String(s.start_time).includes('15:00')
    );
    console.log('Slot VIP2 (3 avril) found:', slotVip2 ? 'Oui' : 'Non');
    if (slotVip2) {
      appointments.push({
        time_slot_id: slotVip2.id,
        exhibitor_id: exhibitors[1].id,
        visitor_id: vipVisitor.id,
        status: 'confirmed',
        notes: 'Session VIP - Partenariat stratégique',
        message: 'Discussion opportunités de collaboration',
        meeting_type: 'hybrid'
      });
    }

    const { data: createdAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (appointmentsError) {
      console.error('❌ Erreur lors de la création des rendez-vous:', appointmentsError);
      return;
    }

    console.log(`✅ ${createdAppointments.length} rendez-vous créés`);

    // 6. Résumé
    console.log('\n✨ Données de démonstration créées avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`   - Visiteurs: ${visitors.length}`);
    console.log(`   - Exposants: ${exhibitors.length}`);
    console.log(`   - Créneaux: ${createdSlots.length}`);
    console.log(`   - Rendez-vous: ${createdAppointments.length}`);
    console.log('\n🎯 Statuts des rendez-vous:');
    console.log(`   - Confirmés: ${createdAppointments.filter(a => a.status === 'confirmed').length}`);
    console.log(`   - En attente: ${createdAppointments.filter(a => a.status === 'pending').length}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addCompleteDemoData();
