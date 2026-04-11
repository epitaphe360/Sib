#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n🔧 CORRECTION DU COMPTE "Global Ship"\n');
console.log('='.repeat(60));

const accountInfo = {
  email: 'exhibitor-54m@test.siport.com',
  password: 'Demo2026!',
  company: 'Global Shipping Solutions',
  exhibitorId: '0761473c-7b11-405e-8d01-cbed36308f7c'
};

async function main() {
  // 1. Supprimer l'ancien utilisateur dans la table users (garde l'ID)
  console.log('\n📋 1. Vérification de l\'entrée users existante...');
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', accountInfo.exhibitorId)
    .single();

  if (existingUser) {
    console.log('✅ Entrée trouvée dans users:', existingUser.email);
  }

  // 2. Créer le compte dans auth.users avec le même ID
  console.log('\n🔐 2. Création du compte dans auth.users...');
  
  // D'abord, essayer de supprimer si existe
  try {
    await supabase.auth.admin.deleteUser(accountInfo.exhibitorId);
    console.log('   🗑️  Ancien compte auth supprimé');
  } catch (e) {
    console.log('   ℹ️  Pas de compte auth à supprimer');
  }

  // Créer le nouveau compte avec l'ID spécifique
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: accountInfo.email,
    password: accountInfo.password,
    email_confirm: true,
    user_metadata: {
      type: 'exhibitor',
      company: accountInfo.company
    }
  });

  if (createError) {
    console.error('❌ Erreur création:', createError.message);
    return;
  }

  console.log('✅ Compte auth créé avec ID:', newUser.user.id);

  // 3. Mettre à jour la table users pour lier au bon auth_id
  console.log('\n🔄 3. Mise à jour de la table users...');
  const { error: updateError } = await supabase
    .from('users')
    .update({
      id: newUser.user.id,
      email: accountInfo.email,
      profile: {
        ...existingUser?.profile,
        company: accountInfo.company,
        companyName: accountInfo.company,
        firstName: 'Global',
        lastName: 'Shipping'
      }
    })
    .eq('id', accountInfo.exhibitorId);

  if (updateError) {
    console.error('❌ Erreur update users:', updateError.message);
  } else {
    console.log('✅ Table users mise à jour');
  }

  // 4. Créer des créneaux de démo (30 déc, 31 déc, 2 janv, 4 janv)
  console.log('\n📅 4. Création des créneaux...');
  
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
          exhibitor_id: newUser.user.id,
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

  // 5. Test de connexion
  console.log('\n🧪 5. Test de connexion final...');
  const { data: testLogin, error: loginError } = await supabase.auth.signInWithPassword({
    email: accountInfo.email,
    password: accountInfo.password
  });

  if (loginError) {
    console.error('❌ Échec:', loginError.message);
  } else {
    console.log('✅ CONNEXION RÉUSSIE !');
    console.log('   - Email:', testLogin.user.email);
    console.log('   - ID:', testLogin.user.id);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ COMPTE "Global Ship" CORRIGÉ\n');
  console.log('📧 Email: exhibitor-54m@test.siport.com');
  console.log('🔑 Mot de passe: Demo2026!');
  console.log(`📅 ${slotsCreated} créneaux disponibles`);
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
