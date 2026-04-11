#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAllStats() {
  console.log('\n📊 VÉRIFICATION COMPLÈTE DES STATISTIQUES\n');
  console.log('═'.repeat(70));

  try {
    // Connections
    const { count: connectionsCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true });

    // Appointments
    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    // Messages
    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    // Downloads
    const { count: downloadsCount } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true });

    // Users by type
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: exhibitors } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'exhibitor');

    const { count: partners } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'partner');

    const { count: visitors } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'visitor');

    console.log('\n✅ MÉTRIQUES PRINCIPALES (AdminDashboard)');
    console.log('─'.repeat(70));
    console.log(`   Connexions:    ${connectionsCount || 0}`);
    console.log(`   Rendez-vous:   ${appointmentsCount || 0}`);
    console.log(`   Messages:      ${messagesCount || 0}`);
    console.log(`   Téléchargements: ${downloadsCount || 0}`);

    console.log('\n👥 UTILISATEURS');
    console.log('─'.repeat(70));
    console.log(`   Total:         ${totalUsers || 0}`);
    console.log(`   Exposants:     ${exhibitors || 0}`);
    console.log(`   Partenaires:   ${partners || 0}`);
    console.log(`   Visiteurs:     ${visitors || 0}`);

    // Appointments par statut
    const { data: appointments } = await supabase
      .from('appointments')
      .select('status');

    if (appointments) {
      const confirmed = appointments.filter(a => a.status === 'confirmed').length;
      const pending = appointments.filter(a => a.status === 'pending').length;
      const completed = appointments.filter(a => a.status === 'completed').length;

      console.log('\n📅 RENDEZ-VOUS PAR STATUT');
      console.log('─'.repeat(70));
      console.log(`   Confirmés:     ${confirmed}`);
      console.log(`   En attente:    ${pending}`);
      console.log(`   Terminés:      ${completed}`);
    }

    // Vérifier si les tables analytics existent
    console.log('\n📋 TABLES ANALYTICS (À CRÉER)');
    console.log('─'.repeat(70));

    const checkTable = async (tableName) => {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .limit(1);
        return error ? '❌ N\'existe pas' : '✅ Existe';
      } catch {
        return '❌ N\'existe pas';
      }
    };

    const analyticsDaily = await checkTable('analytics_daily');
    const mediaMentions = await checkTable('media_mentions');
    const weeklyAnalytics = await checkTable('weekly_analytics');

    console.log(`   analytics_daily:    ${analyticsDaily} (pour AdminDashboard.trafficData)`);
    console.log(`   media_mentions:     ${mediaMentions} (pour PartnerMediaPage)`);
    console.log(`   weekly_analytics:   ${weeklyAnalytics} (pour AvailabilitySettingsPage)`);

    console.log('\n' + '═'.repeat(70));
    console.log('✅ Vérification terminée\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

verifyAllStats();
