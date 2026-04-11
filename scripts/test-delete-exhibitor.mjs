import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

// Test 1: Lister les exposants
const { data: exhibitors, error: listErr } = await supabase
  .from('exhibitors')
  .select('id, company_name')
  .limit(5);

console.log('=== EXPOSANTS ===');
console.log(exhibitors);

// Test 2: Tester la suppression avec service_role_key (bypass RLS)
// On prend le premier exposant pour tester
if (exhibitors && exhibitors.length > 0) {
  const testId = exhibitors[0].id;
  console.log(`\n=== TEST DELETE (${exhibitors[0].company_name}) ===`);
  
  const { data: deleted, error: delErr } = await supabase
    .from('exhibitors')
    .delete()
    .eq('id', testId)
    .select();
    
  console.log('Deleted data:', deleted);
  console.log('Delete error:', delErr);
  
  if (deleted && deleted.length > 0) {
    console.log('✅ Suppression OK avec service_role_key!');
    console.log('Le problème est donc le RLS côté client (anon key)');
  } else if (!delErr) {
    console.log('❌ 0 lignes supprimées malgré pas d\'erreur = RLS bloque');
    
    // Vérifier les foreign keys
    console.log('\n=== CHECK FOREIGN KEYS ===');
    
    // Check mini_sites
    const { data: ms } = await supabase.from('mini_sites').select('id').eq('exhibitor_id', testId);
    console.log('Mini-sites liés:', ms?.length || 0);
    
    // Check appointments
    const { data: appts } = await supabase.from('appointments').select('id').eq('exhibitor_id', testId);
    console.log('Rendez-vous liés:', appts?.length || 0);
    
    // Check products
    const { data: prods } = await supabase.from('products').select('id').eq('exhibitor_id', testId);
    console.log('Produits liés:', prods?.length || 0);
    
    // Check time_slots
    const { data: slots } = await supabase.from('time_slots').select('id').eq('exhibitor_id', testId);
    console.log('Time slots liés:', slots?.length || 0);
  } else {
    console.log('❌ Erreur:', delErr);
  }
}
