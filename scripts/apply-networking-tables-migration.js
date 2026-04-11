// Script pour appliquer la migration des tables de networking
// Exécutez ce script avec: node scripts/apply-networking-tables-migration.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config({ path: '.env.local' });

// Vérification des variables d'environnement requises
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erreur: Les variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies.');
  console.error('Créez un fichier .env.local avec ces variables ou définissez-les dans votre environnement.');
  process.exit(1);
}

// Création du client Supabase avec la clé de service
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Fonction principale qui exécute la migration
async function applyMigration() {
  try {
    console.log('🔄 Début de la migration des tables de networking...');
    
    // Lecture du fichier SQL
    const sqlPath = path.join(process.cwd(), 'scripts', 'create-networking-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Division du contenu SQL en commandes individuelles
    const sqlCommands = sqlContent
      .replace(/--.*$/gm, '') // Supprime les commentaires
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`📋 Trouvé ${sqlCommands.length} commandes SQL à exécuter`);
    
    // Exécution de chaque commande SQL
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      try {
        console.log(`⚙️ Exécution de la commande ${i + 1}/${sqlCommands.length}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: command + ';' });
        
        if (error) {
          console.error(`❌ Erreur lors de l'exécution de la commande ${i + 1}:`, error.message);
          console.error('Commande SQL:', command);
        }
      } catch (cmdError) {
        console.error(`❌ Exception lors de l'exécution de la commande ${i + 1}:`, cmdError.message);
        console.error('Commande SQL:', command);
      }
    }
    
    // Vérification que les tables ont bien été créées
    console.log('🔍 Vérification des tables créées...');
    
    // Vérification de la table connections
    const { data: connectionsData, error: connectionsError } = await supabase
      .from('connections')
      .select('id')
      .limit(1);
    
    if (connectionsError && connectionsError.code === '42P01') {
      console.error('❌ La table connections n\'a pas été créée correctement.');
    } else {
      console.log('✅ Table connections créée avec succès!');
    }
    
    // Vérification de la table user_favorites
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('user_favorites')
      .select('user_id')
      .limit(1);
    
    if (favoritesError && favoritesError.code === '42P01') {
      console.error('❌ La table user_favorites n\'a pas été créée correctement.');
    } else {
      console.log('✅ Table user_favorites créée avec succès!');
    }
    
    // Vérification de la table networking_recommendations
    const { data: recommendationsData, error: recommendationsError } = await supabase
      .from('networking_recommendations')
      .select('id')
      .limit(1);
    
    if (recommendationsError && recommendationsError.code === '42P01') {
      console.error('❌ La table networking_recommendations n\'a pas été créée correctement.');
    } else {
      console.log('✅ Table networking_recommendations créée avec succès!');
    }
    
    console.log('✨ Migration des tables de networking terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Exécution de la migration
applyMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erreur non gérée:', err);
    process.exit(1);
  });
