#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointmentStats() {
  try {
    console.log('\n📊 VÉRIFICATION DES STATISTIQUES DE RENDEZ-VOUS\n');
    console.log('═'.repeat(60));

    // Récupérer tous les rendez-vous
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id, status, appointment_date, exhibitor_id, visitor_id');

    if (error) {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    }

    if (!appointments || appointments.length === 0) {
      console.log('\n⚠️  Aucun rendez-vous trouvé dans la base de données\n');
      process.exit(0);
    }

    // Calculer les statistiques
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;

    // Calculer les pourcentages
    const confirmedPercent = total > 0 ? ((confirmed / total) * 100).toFixed(1) : '0.0';
    const pendingPercent = total > 0 ? ((pending / total) * 100).toFixed(1) : '0.0';
    const completedPercent = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
    const cancelledPercent = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0';

    // Afficher les résultats
    console.log('\n📈 STATISTIQUES GLOBALES:');
    console.log('─'.repeat(60));
    console.log(`   Total de rendez-vous: ${total}`);
    console.log('');
    console.log(`   ✅ Confirmés:   ${confirmed.toString().padStart(3)} rendez-vous (${confirmedPercent}%)`);
    console.log(`   ⏳ En attente:  ${pending.toString().padStart(3)} rendez-vous (${pendingPercent}%)`);
    console.log(`   ✔️  Terminés:    ${completed.toString().padStart(3)} rendez-vous (${completedPercent}%)`);
    console.log(`   ❌ Annulés:     ${cancelled.toString().padStart(3)} rendez-vous (${cancelledPercent}%)`);

    // Statistiques par date
    console.log('\n\n📅 RÉPARTITION PAR DATE:');
    console.log('─'.repeat(60));

    const dateGroups = {};
    appointments.forEach(apt => {
      const date = apt.appointment_date ? apt.appointment_date.split('T')[0] : 'Sans date';
      if (!dateGroups[date]) {
        dateGroups[date] = { confirmed: 0, pending: 0, completed: 0, cancelled: 0 };
      }
      dateGroups[date][apt.status] = (dateGroups[date][apt.status] || 0) + 1;
    });

    const sortedDates = Object.keys(dateGroups).sort();
    sortedDates.forEach(date => {
      const stats = dateGroups[date];
      const dayTotal = stats.confirmed + stats.pending + stats.completed + stats.cancelled;
      console.log(`\n   ${date}  (${dayTotal} rendez-vous)`);
      if (stats.confirmed > 0) console.log(`      ✅ Confirmés: ${stats.confirmed}`);
      if (stats.pending > 0) console.log(`      ⏳ En attente: ${stats.pending}`);
      if (stats.completed > 0) console.log(`      ✔️  Terminés: ${stats.completed}`);
      if (stats.cancelled > 0) console.log(`      ❌ Annulés: ${stats.cancelled}`);
    });

    // Compter les utilisateurs uniques
    const uniqueExhibitors = new Set(appointments.map(a => a.exhibitor_id)).size;
    const uniqueVisitors = new Set(appointments.map(a => a.visitor_id)).size;

    console.log('\n\n👥 PARTICIPANTS:');
    console.log('─'.repeat(60));
    console.log(`   Exposants uniques: ${uniqueExhibitors}`);
    console.log(`   Visiteurs uniques: ${uniqueVisitors}`);

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Vérification terminée\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkAppointmentStats();
