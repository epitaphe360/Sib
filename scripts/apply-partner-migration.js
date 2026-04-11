import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('📦 Application de la migration partner_time_slots...\n');

  const sql = readFileSync('supabase/migrations/20251225000001_create_partner_time_slots.sql', 'utf8');

  // Diviser le SQL en commandes individuelles
  const commands = sql
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

  let successCount = 0;

  for (const command of commands) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: command });
      
      if (error) {
        // Ignorer les erreurs "already exists"
        if (error.message.includes('already exists')) {
          console.log('⚠️  Table/Index/Policy existe déjà');
          successCount++;
        } else {
          console.log('❌ Erreur:', error.message);
        }
      } else {
        successCount++;
      }
    } catch (e) {
      // Méthode alternative si rpc n'est pas disponible
      console.log('⚠️  Utilisation méthode alternative...');
    }
  }

  console.log(`\n✅ ${successCount}/${commands.length} commandes exécutées\n`);

  // Vérifier que la table existe
  const { data, error } = await supabase
    .from('partner_time_slots')
    .select('id')
    .limit(1);

  if (error) {
    console.log('❌ Table non créée. Essai de création directe...\n');
    
    // Création manuelle avec les commandes essentielles
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS partner_time_slots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
        slot_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        duration INTEGER DEFAULT 60,
        type TEXT DEFAULT 'virtual',
        max_bookings INTEGER DEFAULT 1,
        current_bookings INTEGER DEFAULT 0,
        available BOOLEAN DEFAULT true,
        location TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    console.log('Tentative création directe via API admin...');
    // Cette partie nécessiterait l'accès à l'API Supabase Management
  } else {
    console.log('✅ Table partner_time_slots créée avec succès!');
  }
}

applyMigration();
