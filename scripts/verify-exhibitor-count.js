import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
  console.log('🔍 Vérification des comptes...\n');

  try {
    // Compter les exhibitors
    const { count: exhibitorCount, error: exhibitorError } = await supabase
      .from('exhibitors')
      .select('*', { count: 'exact', head: true });

    if (exhibitorError) throw exhibitorError;

    console.log(`📊 Total exhibitors: ${exhibitorCount}`);

    // Compter les produits
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productError) throw productError;

    console.log(`📦 Total produits: ${productCount}`);

    // Compter les users de type exhibitor
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'exhibitor');

    if (userError) throw userError;

    console.log(`👤 Total users exhibitor: ${userCount}`);

    // Lister les 10 premiers exhibitors
    const { data: exhibitors, error: listError } = await supabase
      .from('exhibitors')
      .select('id, user_id, company_name, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (listError) throw listError;

    console.log(`\n📋 10 derniers exhibitors créés:`);
    exhibitors.forEach(e => {
      console.log(`   - ${e.company_name} (${e.id.substring(0, 8)}...)`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkCounts();
