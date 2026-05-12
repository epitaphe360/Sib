import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectMiniSites() {
  console.log('🔍 Inspection de la table mini_sites...\n');

  try {
    // Essayer de lire la table
    const { data, error, count } = await supabase
      .from('mini_sites')
      .select('*', { count: 'exact' })
      .limit(1);

    console.log('Total mini_sites:', count);

    if (error) {
      console.log('❌ Erreur lors de la lecture:', error);
    } else if (data && data.length > 0) {
      console.log('✅ Table existe avec données:');
      console.log('Colonnes:', Object.keys(data[0]));
      console.log('Premier enregistrement:', data[0]);
    } else {
      console.log('✅ Table existe mais vide');
      console.log('Impossible de déterminer les colonnes');
      
      // Vérifier les migrations pour voir la structure
      console.log('\n📋 Vérification des fichiers de migration...');
    }

    // Alternative: essayer d'obtenir les informations depuis information_schema
    console.log('\n🔍 Tentative de récupération du schéma via SQL...');
    
    // Essayer une requête RPC si elle existe
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_table_columns', { table_name: 'mini_sites' })
      .single();

    if (rpcError) {
      console.log('RPC non disponible:', rpcError.message);
    } else {
      console.log('Colonnes depuis RPC:', rpcData);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

inspectMiniSites();
