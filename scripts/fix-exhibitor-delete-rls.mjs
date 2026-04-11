import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Ajouter la politique RLS pour permettre aux admins de supprimer des exposants
const sql = `
-- Politique DELETE pour les admins sur exhibitors
DO $$
BEGIN
  -- Supprimer l'ancienne politique si elle existe
  DROP POLICY IF EXISTS "Admin can delete exhibitors" ON exhibitors;
  DROP POLICY IF EXISTS "admin_delete_exhibitors" ON exhibitors;
  
  -- Créer la politique permettant aux admins de supprimer
  CREATE POLICY "admin_delete_exhibitors" ON exhibitors
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.type = 'admin'
      )
    );
    
  RAISE NOTICE 'Policy admin_delete_exhibitors created successfully';
END $$;
`;

console.log('🔧 Application de la politique RLS pour suppression admin...');

const { data, error } = await supabase.rpc('exec_sql', { sql });

if (error) {
  console.log('RPC exec_sql non disponible, application directe via SQL Editor...');
  console.log('Erreur RPC:', error.message);
  
  // Essayer via la REST API directement
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ sql })
    });
    
    if (!resp.ok) {
      console.log('\n⚠️ Impossible d\'appliquer automatiquement.');
      console.log('Appliquez ce SQL manuellement dans Supabase SQL Editor:');
      console.log('─'.repeat(60));
      console.log(`
-- Politique DELETE pour les admins sur exhibitors
DROP POLICY IF EXISTS "Admin can delete exhibitors" ON exhibitors;
DROP POLICY IF EXISTS "admin_delete_exhibitors" ON exhibitors;

CREATE POLICY "admin_delete_exhibitors" ON exhibitors
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );
`);
      console.log('─'.repeat(60));
    } else {
      console.log('✅ Politique RLS appliquée avec succès!');
    }
  } catch (e) {
    console.log('\n⚠️ Appliquez ce SQL dans Supabase SQL Editor → https://supabase.com/dashboard');
    console.log(`
DROP POLICY IF EXISTS "admin_delete_exhibitors" ON exhibitors;

CREATE POLICY "admin_delete_exhibitors" ON exhibitors
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'admin'
    )
  );
`);
  }
} else {
  console.log('✅ Politique RLS appliquée avec succès!');
}
