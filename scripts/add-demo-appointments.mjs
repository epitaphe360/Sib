import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function addDemoAppointments() {
  console.log('🗓️  Ajout de rendez-vous de démonstration...\n');

  try {
    // 1. Récupérer les IDs des utilisateurs de test
    console.log('📋 Récupération des utilisateurs...');
    
    const { data: visitors } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('type', 'visitor')
      .in('email', ['visitor-free@test.siport.com', 'visitor-vip@test.siport.com']);
    
    // Récupérer d'abord les users exposants
    const { data: exhibitorUsers } = await supabase
      .from('users')
      .select('id')
      .eq('type', 'exhibitor')
      .in('email', [
        'exhibitor-9m@test.siport.com',
        'exhibitor-18m@test.siport.com',
        'exhibitor-36m@test.siport.com',
        'exhibitor-54m@test.siport.com'
      ]);
    
    const exhibitorUserIds = exhibitorUsers?.map(u => u.id) || [];
    
    // Puis récupérer les profils exhibitors (utiliser user_id)
    const { data: exhibitors } = await supabase
      .from('exhibitors')
      .select('id, company_name, user_id')
      .in('user_id', exhibitorUserIds);

    if (!visitors || visitors.length === 0) {
      console.log('❌ Aucun visiteur trouvé');
      return;
    }

    if (!exhibitors || exhibitors.length === 0) {
      console.log('❌ Aucun exposant trouvé');
      return;
    }

    console.log(`✅ ${visitors.length} visiteurs trouvés`);
    console.log(`✅ ${exhibitors.length} exposants trouvés\n`);

    // 2. Supprimer les anciens rendez-vous de démo
    console.log('🧹 Nettoyage des anciens rendez-vous de démo...');
    await supabase
      .from('appointments')
      .delete()
      .in('visitor_id', visitors.map(v => v.id));

    // 3. Créer des rendez-vous
    const now = new Date();
    const appointments = [];

    // Rendez-vous passés (la semaine dernière)
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    appointments.push({
      visitor_id: visitors[0].id,
      exhibitor_id: exhibitors[0].id,
      date: lastWeek.toISOString().split('T')[0],
      time: '10:00',
      duration: 30,
      status: 'confirmed',
      notes: 'Rendez-vous réalisé - Discussion sur SmartPort PMS',
      visitor_name: visitors[0].name || 'Visiteur',
      visitor_email: visitors[0].email,
      visitor_company: 'Tech Innovations SA',
      created_at: lastWeek.toISOString()
    });

    // Rendez-vous d'aujourd'hui
    appointments.push({
      visitor_id: visitors[0].id,
      exhibitor_id: exhibitors[1].id,
      date: now.toISOString().split('T')[0],
      time: '14:30',
      duration: 45,
      status: 'confirmed',
      notes: 'Présentation des solutions logistiques',
      visitor_name: visitors[0].name || 'Visiteur',
      visitor_email: visitors[0].email,
      visitor_company: 'Tech Innovations SA',
      created_at: now.toISOString()
    });

    // Rendez-vous demain
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    appointments.push({
      visitor_id: visitors[0].id,
      exhibitor_id: exhibitors[2].id,
      date: tomorrow.toISOString().split('T')[0],
      time: '11:00',
      duration: 60,
      status: 'confirmed',
      notes: 'Démo complète PortTech Industries - Solutions premium',
      visitor_name: visitors[0].name || 'Visiteur',
      visitor_email: visitors[0].email,
      visitor_company: 'Tech Innovations SA',
      created_at: now.toISOString()
    });

    // Rendez-vous dans 3 jours
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    
    appointments.push({
      visitor_id: visitors[0].id,
      exhibitor_id: exhibitors[3].id,
      date: in3Days.toISOString().split('T')[0],
      time: '09:30',
      duration: 45,
      status: 'pending',
      notes: 'En attente de confirmation - Global Shipping Alliance',
      visitor_name: visitors[0].name || 'Visiteur',
      visitor_email: visitors[0].email,
      visitor_company: 'Tech Innovations SA',
      created_at: now.toISOString()
    });

    // Si on a un visiteur VIP, ajouter plus de rendez-vous
    if (visitors.length > 1) {
      const vipVisitor = visitors[1];
      
      // Rendez-vous VIP dans 2 jours
      const in2Days = new Date(now);
      in2Days.setDate(in2Days.getDate() + 2);
      
      appointments.push({
        visitor_id: vipVisitor.id,
        exhibitor_id: exhibitors[0].id,
        date: in2Days.toISOString().split('T')[0],
        time: '15:00',
        duration: 30,
        status: 'confirmed',
        notes: 'Rendez-vous VIP - Consultation exclusive',
        visitor_name: vipVisitor.name || 'Visiteur VIP',
        visitor_email: vipVisitor.email,
        visitor_company: 'Maritime Consulting Group',
        created_at: now.toISOString()
      });

      // Rendez-vous VIP dans 5 jours
      const in5Days = new Date(now);
      in5Days.setDate(in5Days.getDate() + 5);
      
      appointments.push({
        visitor_id: vipVisitor.id,
        exhibitor_id: exhibitors[2].id,
        date: in5Days.toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        status: 'confirmed',
        notes: 'Session VIP - Présentation solutions avancées',
        visitor_name: vipVisitor.name || 'Visiteur VIP',
        visitor_email: vipVisitor.email,
        visitor_company: 'Maritime Consulting Group',
        created_at: now.toISOString()
      });
    }

    // 4. Insérer les rendez-vous
    console.log(`📝 Création de ${appointments.length} rendez-vous...\n`);
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (error) {
      console.error('❌ Erreur lors de la création des rendez-vous:', error.message);
      return;
    }

    console.log(`✅ ${data.length} rendez-vous créés avec succès!\n`);
    
    // 5. Afficher un résumé
    console.log('📊 RÉSUMÉ DES RENDEZ-VOUS:\n');
    
    const confirmed = data.filter(a => a.status === 'confirmed');
    const pending = data.filter(a => a.status === 'pending');
    const past = data.filter(a => new Date(a.date) < new Date(now.toISOString().split('T')[0]));
    const upcoming = data.filter(a => new Date(a.date) >= new Date(now.toISOString().split('T')[0]));
    
    console.log(`   ✅ Confirmés: ${confirmed.length}`);
    console.log(`   ⏳ En attente: ${pending.length}`);
    console.log(`   📅 Passés: ${past.length}`);
    console.log(`   🔜 À venir: ${upcoming.length}\n`);
    
    console.log('📋 DÉTAILS DES RENDEZ-VOUS:\n');
    data.forEach((apt, index) => {
      const exhibitor = exhibitors.find(e => e.id === apt.exhibitor_id);
      const visitor = visitors.find(v => v.id === apt.visitor_id);
      const statusEmoji = apt.status === 'confirmed' ? '✅' : '⏳';
      const dateObj = new Date(apt.date);
      const isToday = dateObj.toISOString().split('T')[0] === now.toISOString().split('T')[0];
      const dateLabel = isToday ? '(Aujourd\'hui)' : '';
      
      console.log(`${index + 1}. ${statusEmoji} ${apt.date} ${dateLabel} à ${apt.time}`);
      console.log(`   👤 ${visitor?.name || 'Visiteur'} (${visitor?.email})`);
      console.log(`   🏢 ${exhibitor?.company_name || 'Exposant'}`);
      console.log(`   ⏱️  ${apt.duration} minutes - ${apt.status}`);
      console.log(`   📝 ${apt.notes}\n`);
    });

    console.log('\n🎉 Rendez-vous de démonstration ajoutés avec succès!');
    console.log('\n💡 Les visiteurs peuvent maintenant voir leurs rendez-vous dans leur dashboard.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter le script
addDemoAppointments();
