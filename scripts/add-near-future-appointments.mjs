import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addNearFutureAppointments() {
  try {
    console.log('\n🗓️  Création de rendez-vous à dates proches pour demo...\n');

    // 1. Récupérer les utilisateurs
    const { data: visitors, error: visitorsError } = await supabase
      .from('users')
      .select('id, email, type')
      .eq('type', 'visitor')
      .in('email', ['visitor-vip@test.sib2026.ma', 'demo.visitor@sib.com']);

    if (visitorsError) throw visitorsError;
    console.log(`✅ ${visitors.length} visiteurs trouvés`);

    const vipVisitor = visitors.find(v => v.email === 'visitor-vip@test.sib2026.ma') || visitors[0];

    const { data: exhibitors, error: exhibitorsError } = await supabase
      .from('exhibitors')
      .select('id, user_id, company_name')
      .limit(4);

    if (exhibitorsError) throw exhibitorsError;
    console.log(`✅ ${exhibitors.length} exposants trouvés`);

    // 2. Nettoyage des anciens créneaux de démonstration proches
    await supabase
      .from('appointments')
      .delete()
      .in('visitor_id', visitors.map(v => v.id));
    
    await supabase
      .from('time_slots')
      .delete()
      .in('exhibitor_id', exhibitors.map(e => e.id));

    console.log('✅ Nettoyage terminé\n');

    // 3. Créer des créneaux pour les 7 prochains jours
    console.log('📅 Création des créneaux (7 prochains jours)...');
    
    const now = new Date();
    const timeSlots = [];

    exhibitors.forEach((exhibitor, exhibitorIndex) => {
      // Aujourd'hui
      const today = new Date(now);
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: today.toISOString().split('T')[0],
        start_time: '14:00',
        end_time: '15:00',
        duration: 60,
        type: 'in-person',
        max_bookings: 1,
        current_bookings: exhibitorIndex === 0 ? 1 : 0,
        available: exhibitorIndex !== 0,
        location: `Stand ${exhibitor.company_name}`
      });

      // Demain
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: tomorrow.toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '11:00',
        duration: 60,
        type: 'in-person',
        max_bookings: 1,
        current_bookings: exhibitorIndex === 1 ? 1 : 0,
        available: exhibitorIndex !== 1,
        location: `Stand ${exhibitor.company_name}`
      });

      // Dans 3 jours
      const in3Days = new Date(now);
      in3Days.setDate(in3Days.getDate() + 3);
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: in3Days.toISOString().split('T')[0],
        start_time: '15:00',
        end_time: '16:00',
        duration: 60,
        type: 'virtual',
        max_bookings: 1,
        current_bookings: exhibitorIndex === 2 ? 1 : 0,
        available: exhibitorIndex !== 2,
        location: 'Visioconférence'
      });

      // Dans 5 jours
      const in5Days = new Date(now);
      in5Days.setDate(in5Days.getDate() + 5);
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: in5Days.toISOString().split('T')[0],
        start_time: '11:00',
        end_time: '12:00',
        duration: 60,
        type: 'in-person',
        max_bookings: 1,
        current_bookings: 0,
        available: true,
        location: `Stand ${exhibitor.company_name}`
      });
    });

    const { data: createdSlots, error: slotsError } = await supabase
      .from('time_slots')
      .insert(timeSlots)
      .select();

    if (slotsError) throw slotsError;
    console.log(`✅ ${createdSlots.length} créneaux créés\n`);

    // 4. Créer les rendez-vous
    console.log('📝 Création des rendez-vous...');
    
    const appointments = [];

    // Aujourd'hui
    const slotToday = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[0].id && 
      s.start_time === '14:00:00'
    );
    if (slotToday) {
      appointments.push({
        time_slot_id: slotToday.id,
        exhibitor_id: exhibitors[0].id,
        visitor_id: vipVisitor.id,
        status: 'confirmed',
        notes: 'Rendez-vous aujourd\'hui - Test démo',
        message: 'Rendez-vous de démonstration',
        meeting_type: 'in-person'
      });
      console.log('  ✓ RDV aujourd\'hui');
    }

    // Demain
    const slotTomorrow = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[1].id && 
      s.start_time === '10:00:00'
    );
    if (slotTomorrow) {
      appointments.push({
        time_slot_id: slotTomorrow.id,
        exhibitor_id: exhibitors[1].id,
        visitor_id: vipVisitor.id,
        status: 'confirmed',
        notes: 'Rendez-vous demain',
        message: 'Présentation produits',
        meeting_type: 'in-person'
      });
      console.log('  ✓ RDV demain');
    }

    // Dans 3 jours
    const slotIn3Days = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[2].id && 
      s.start_time === '15:00:00'
    );
    if (slotIn3Days) {
      appointments.push({
        time_slot_id: slotIn3Days.id,
        exhibitor_id: exhibitors[2].id,
        visitor_id: vipVisitor.id,
        status: 'pending',
        notes: 'En attente de confirmation',
        message: 'Rdv visio dans 3 jours',
        meeting_type: 'virtual'
      });
      console.log('  ✓ RDV dans 3 jours (en attente)');
    }

    const { data: createdAppointments, error: apptError } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (apptError) throw apptError;
    console.log(`\n✅ ${createdAppointments.length} rendez-vous créés\n`);

    // 5. Résumé
    console.log('📊 Résumé:');
    console.log(`   - Créneaux: ${createdSlots.length}`);
    console.log(`   - Rendez-vous: ${createdAppointments.length}`);
    console.log(`   - Dates: Aujourd'hui → +7 jours`);
    
    const confirmed = createdAppointments.filter(a => a.status === 'confirmed').length;
    const pending = createdAppointments.filter(a => a.status === 'pending').length;
    console.log(`\n🎯 Statuts:`);
    console.log(`   - Confirmés: ${confirmed}`);
    console.log(`   - En attente: ${pending}`);
    console.log('\n✨ Données de démonstration créées - Les rendez-vous sont maintenant visibles!\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

addNearFutureAppointments();
