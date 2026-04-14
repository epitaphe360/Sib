#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n🔍 VÉRIFICATION DU COMPTE "Global Ship"\n');
console.log('='.repeat(60));

const emailToCheck = 'exhibitor-54m@test.sib2026.ma';

async function main() {
  // 1. Vérifier si l'utilisateur existe dans auth.users
  console.log('\n📧 1. Recherche dans auth.users...');
  const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Erreur auth:', authError.message);
  } else {
    const user = authUser.users.find(u => u.email === emailToCheck);
    if (user) {
      console.log('✅ Trouvé dans auth.users:');
      console.log('   - ID:', user.id);
      console.log('   - Email:', user.email);
      console.log('   - Email confirmé:', user.email_confirmed_at ? 'OUI' : 'NON');
      console.log('   - Créé le:', user.created_at);
    } else {
      console.log('❌ NON TROUVÉ dans auth.users');
    }
  }

  // 2. Vérifier si l'utilisateur existe dans la table users
  console.log('\n👤 2. Recherche dans table users...');
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('email', emailToCheck)
    .single();

  if (dbError) {
    console.error('❌ Erreur DB:', dbError.message);
  } else if (dbUser) {
    console.log('✅ Trouvé dans users:');
    console.log('   - ID:', dbUser.id);
    console.log('   - Email:', dbUser.email);
    console.log('   - Type:', dbUser.type);
    console.log('   - Nom:', dbUser.profile?.company || dbUser.profile?.companyName || 'N/A');
  } else {
    console.log('❌ NON TROUVÉ dans table users');
  }

  // 3. Vérifier les créneaux
  console.log('\n📅 3. Recherche des créneaux...');
  if (dbUser) {
    const { data: timeSlots, error: slotsError } = await supabase
      .from('time_slots')
      .select('*')
      .eq('exhibitor_id', dbUser.id);

    if (slotsError) {
      console.error('❌ Erreur slots:', slotsError.message);
    } else {
      console.log(`✅ ${timeSlots?.length || 0} créneaux trouvés`);
      if (timeSlots && timeSlots.length > 0) {
        timeSlots.slice(0, 3).forEach(slot => {
          console.log(`   - ${slot.date} ${slot.start_time}-${slot.end_time} [${slot.status}]`);
        });
      }
    }
  }

  // 4. Tester la connexion
  console.log('\n🔐 4. Test de connexion...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: emailToCheck,
    password: 'Demo2026!'
  });

  if (signInError) {
    console.error('❌ Échec de connexion:', signInError.message);
    console.log('\n🛠️  SOLUTION:');
    console.log('   Recréer le compte avec le script add-near-future-appointments.mjs');
  } else {
    console.log('✅ Connexion réussie !');
    console.log('   - User ID:', signInData.user.id);
  }

  console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
