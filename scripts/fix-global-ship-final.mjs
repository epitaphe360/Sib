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

console.log('\n🔧 CORRECTION FINALE "Global Ship"\n');
console.log('='.repeat(60));

const OLD_ID = '0761473c-7b11-405e-8d01-cbed36308f7c';
const NEW_ID = 'a3f5681e-e752-434b-bebf-937e477b2409'; // L'ID auth créé

async function main() {
  // 1. Mettre à jour toutes les références de OLD_ID vers NEW_ID
  console.log('\n🔄 1. Mise à jour des foreign keys...');
  
  // Mettre à jour user_badges
  const { data: badges, error: badgesError } = await supabase
    .from('user_badges')
    .update({ user_id: NEW_ID })
    .eq('user_id', OLD_ID);
  
  if (badgesError) {
    console.log('⚠️  user_badges:', badgesError.message);
  } else {
    console.log('✅ user_badges mis à jour');
  }

  // Mettre à jour appointments
  const { data: appts, error: apptsError } = await supabase
    .from('appointments')
    .update({ exhibitor_id: NEW_ID })
    .eq('exhibitor_id', OLD_ID);
  
  if (!apptsError) {
    console.log('✅ appointments (exhibitor_id) mis à jour');
  }

  // Mettre à jour time_slots
  const { data: slots, error: slotsError } = await supabase
    .from('time_slots')
    .update({ exhibitor_id: NEW_ID })
    .eq('exhibitor_id', OLD_ID);
  
  if (!slotsError) {
    console.log('✅ time_slots mis à jour');
  }

  // 2. Supprimer l'ancien enregistrement users
  console.log('\n🗑️  2. Suppression de l\'ancien enregistrement...');
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', OLD_ID);

  if (deleteError) {
    console.log('⚠️  Suppression:', deleteError.message);
  } else {
    console.log('✅ Ancien enregistrement supprimé');
  }

  // 3. Créer le nouvel enregistrement users avec NEW_ID
  console.log('\n➕ 3. Création du nouvel enregistrement users...');
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: NEW_ID,
      email: 'exhibitor-54m@test.siport.com',
      type: 'exhibitor',
      profile: {
        company: 'Global Shipping Solutions',
        companyName: 'Global Shipping Solutions',
        firstName: 'Global',
        lastName: 'Shipping',
        position: 'Sales Director',
        phone: '+33 1 40 00 54 00',
        country: 'France',
        interests: ['Logistique maritime', 'Technologies vertes', 'Transport international'],
        sectors: ['Transport maritime', 'Logistique']
      },
      created_at: new Date().toISOString()
    });

  if (insertError) {
    console.error('❌ Erreur insertion:', insertError.message);
  } else {
    console.log('✅ Nouvel enregistrement créé');
  }

  // 4. Créer les créneaux
  console.log('\n📅 4. Création des créneaux de démo...');
  
  const dates = [
    '2025-12-30',
    '2025-12-31', 
    '2026-01-02',
    '2026-01-04'
  ];

  let slotsCreated = 0;
  
  for (const date of dates) {
    const slots = [
      { start: '09:00:00', end: '10:00:00' },
      { start: '10:30:00', end: '11:30:00' },
      { start: '14:00:00', end: '15:00:00' },
      { start: '15:30:00', end: '16:30:00' }
    ];

    for (const slot of slots) {
      const { error: slotError } = await supabase
        .from('time_slots')
        .insert({
          exhibitor_id: NEW_ID,
          date: date,
          start_time: slot.start,
          end_time: slot.end,
          status: 'available',
          is_demo: true
        });

      if (!slotError) {
        slotsCreated++;
      }
    }
  }

  console.log(`✅ ${slotsCreated} créneaux créés`);

  // 5. Vérification finale
  console.log('\n🧪 5. Vérification finale...');
  
  const { data: finalUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', NEW_ID)
    .single();

  if (finalUser) {
    console.log('✅ Utilisateur trouvé dans users');
    console.log('   - Email:', finalUser.email);
    console.log('   - Type:', finalUser.type);
    console.log('   - Société:', finalUser.profile?.company);
  }

  const { data: testLogin, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'exhibitor-54m@test.siport.com',
    password: 'Demo2026!'
  });

  if (loginError) {
    console.error('❌ Connexion échouée:', loginError.message);
  } else {
    console.log('✅ CONNEXION RÉUSSIE !');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ CORRECTION TERMINÉE\n');
  console.log('📧 Email: exhibitor-54m@test.siport.com');
  console.log('🔑 Mot de passe: Demo2026!');
  console.log(`📅 ${slotsCreated} créneaux disponibles`);
  console.log('🏢 Société: Global Shipping Solutions');
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
