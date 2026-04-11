import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTemplates() {
  console.log('🔍 Vérification des templates dans Supabase...\n');
  
  const { data, error } = await supabase
    .from('site_templates')
    .select('id, name, category, popularity, premium')
    .order('popularity', { ascending: false });

  if (error) {
    console.log('❌ ERREUR:', error.message);
    console.log('\n⚠️  LA TABLE N\'EXISTE PAS ENCORE!');
    console.log('\n📌 ACTIONS REQUISES:');
    console.log('   1. Ouvrez https://supabase.com/dashboard');
    console.log('   2. Allez dans SQL Editor');
    console.log('   3. Exécutez le fichier SETUP_SITE_TEMPLATES.sql\n');
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  Aucun template trouvé dans la base de données\n');
    console.log('📌 Exécutez le fichier SETUP_SITE_TEMPLATES.sql dans Supabase SQL Editor\n');
    return;
  }

  console.log(`✅ ${data.length} TEMPLATES DISPONIBLES:\n`);
  
  data.forEach((t, i) => {
    const premium = t.premium ? '⭐ PREMIUM' : '';
    console.log(`   ${i + 1}. ${t.name.padEnd(25)} (${t.category.padEnd(10)}) - ${t.popularity} utilisations ${premium}`);
  });

  console.log('\n📊 RÉPARTITION PAR CATÉGORIE:');
  const categories = {};
  data.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + 1;
  });
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} template(s)`);
  });

  console.log('\n✅ TOUT EST PRÊT!');
  console.log('\n📌 POUR TESTER:');
  console.log('   1. Connectez-vous en tant qu\'exposant (technoport@siports.ma / Siports2024!)');
  console.log('   2. Allez sur: http://localhost:9323/exhibitor/minisite/create');
  console.log('   3. Cliquez sur "Partir d\'un template"');
  console.log('   4. Vous verrez les 10 templates disponibles!\n');
}

checkTemplates();
