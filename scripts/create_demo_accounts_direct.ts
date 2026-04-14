import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sbyizudifmqakzxjlndr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQL(sql: string): Promise<any> {
  // Split by semicolon and execute each statement
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  
  for (const statement of statements) {
    console.log(`\n执行 SQL: ${statement.substring(0, 80)}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_string: statement
      }).catch(e => ({
        data: null,
        error: e
      }));

      if (error) {
        // Si rpc n'existe pas, essayer via l'API directe
        console.log(`⚠️  RPC exec_sql non disponible, tentative directe...`);
        
        // Essayer avec postgres directement via fetch
        const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({ query: statement })
        });

        if (!res.ok) {
          console.log(`❌ Erreur SQL: ${res.statusText}`);
        } else {
          console.log(`✅ SQL exécuté`);
        }
      } else {
        console.log(`✅ SQL exécuté`);
      }
    } catch (error) {
      console.log(`❌ Erreur: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

async function setupDemoAccounts() {
  console.log('🚀 Création des comptes de démo dans Supabase...\n');

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '20251225000003_recreate_demo_accounts.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    // Exécuter le SQL
    await executeSQL(sqlContent);

    console.log('\n✅ Comptes créés! Vérification...\n');

    // Vérifier les comptes créés
    const { data: users } = await supabase.auth.admin.listUsers();
    const demoUsers = users?.filter(u => 
      u.email?.includes('@test.sib2026.ma') || u.email?.includes('@sib.com')
    );

    if (demoUsers && demoUsers.length > 0) {
      console.log(`✅ ${demoUsers.length} comptes de démo trouvés:`);
      demoUsers.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    } else {
      console.log(`⚠️  Aucun compte de démo trouvé. Vérifiez les logs.`);
    }

  } catch (error) {
    console.log(`❌ Erreur: ${error instanceof Error ? error.message : String(error)}`);
  }
}

setupDemoAccounts().catch(console.error);
