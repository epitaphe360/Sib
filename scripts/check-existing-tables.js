import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables SUPABASE manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('\n🔍 VÉRIFICATION DES TABLES EXISTANTES\n');
  
  // Vérifier plusieurs variantes possibles du nom de la table profile/profils
  const profileCandidates = ['profiles','profils','profile','profile_users','users','utilisateurs','user_profiles'];
  console.log('🔎 Recherche de la table "profiles" (variantes) :');
  let profileTable = null;
  for (const name of profileCandidates) {
    try {
      const { data, error } = await supabase.from(name).select('id').limit(1);
      if (error) throw error;
      console.log(`   ✅ Table trouvée: ${name}`);
      profileTable = name;
      break;
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      if (msg.includes('does not exist') || msg.includes('relation') || msg.includes('PGRST116')) {
        console.log(`   ❌ ${name} — n'existe pas`);
      } else {
        console.log(`   ⚠️  ${name} — Erreur: ${msg}`);
      }
    }
  }

  // Vérifier si la colonne 'role' existe dans la table de profils trouvée
  if (profileTable) {
    let roleExists = false;
    try {
      const { data: roleCheck, error: roleErr } = await supabase.from(profileTable).select('role').limit(1);
      if (!roleErr) roleExists = true;
    } catch (e) {
      roleExists = false;
    }
    console.log(`\nℹ️ Table profils utilisée: ${profileTable} — colonne 'role' ${roleExists ? '✅ trouvée' : '❌ absente'}`);
  } else {
    console.log('\n⚠️ Aucune table de profils trouvée parmi les variantes listées.');
  }

  // Rechercher les tables d'admin possibles
  const adminCandidates = ['admin_users','admins','admin','administrators','site_admins'];
  console.log('\n🔎 Recherche de tables d\'admin (admin_users / admins / admin) :');
  let adminTable = null;
  for (const name of adminCandidates) {
    try {
      const { data, error } = await supabase.from(name).select('user_id').limit(1);
      if (error) throw error;
      console.log(`   ✅ Table admin trouvée: ${name}`);
      adminTable = name;
      break;
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      if (msg.includes('does not exist') || msg.includes('relation') || msg.includes('PGRST116')) {
        console.log(`   ❌ ${name} — n'existe pas`);
      } else {
        console.log(`   ⚠️  ${name} — Erreur: ${msg}`);
      }
    }
  }

  if (adminTable) {
    // vérifier colonnes utiles
    try {
      const { data: cols } = await supabase.from(adminTable).select('*').limit(1);
      const sampleCols = cols && cols[0] ? Object.keys(cols[0]) : [];
      console.log(`   ℹ️ Colonnes détectées dans ${adminTable}: ${sampleCols.join(', ') || '(aucune ligne pour détecter)'}`);
    } catch (e) {
      console.log(`   ⚠️ Impossible de lire colonnes de ${adminTable} : ${e.message || e}`);
    }
  } else {
    console.log('   ⚠️ Aucune table admin détectée parmi les candidats.');
  }
  
  const tables = [
    'mini_sites',
    'site_templates', 
    'site_images',
    'user_profiles',
    'networking_interactions',
    'match_scores',
    'speed_networking_sessions',
    'networking_rooms'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(0);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log(`   ❌ ${table} - N'EXISTE PAS`);
      } else {
        console.log(`   ⚠️  ${table} - Erreur: ${error.message}`);
      }
    } else {
      console.log(`   ✅ ${table} - EXISTE`);
    }
  }

  console.log('\n');
}

checkTables();
