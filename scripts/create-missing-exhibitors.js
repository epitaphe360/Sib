import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMissingExhibitors() {
  console.log('\n🔧 === CRÉATION DES ENREGISTREMENTS EXHIBITORS MANQUANTS ===\n');
  
  const emails = ['exhibitor1@test.com', 'exhibitor2@test.com'];
  
  for (const email of emails) {
    console.log(`\n📧 ${email}`);
    
    // Récupérer l'utilisateur
    const { data: user } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', email)
      .single();
    
    if (!user) {
      console.log('   ❌ Utilisateur non trouvé');
      continue;
    }
    
    console.log(`   👤 ${user.name}`);
    
    // Vérifier si l'exhibitor existe déjà
    const { data: existing } = await supabase
      .from('exhibitors')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (existing) {
      console.log('   ✅ Exhibitor existe déjà');
      continue;
    }
    
    // Créer l'exhibitor
    const exhibitorData = {
      user_id: user.id,
      company_name: user.name,
      category: 'port-industry',
      sector: 'Maritime Services',
      description: `${user.name} - Solutions maritimes et portuaires innovantes`,
      logo_url: null,
      website: null,
      contact_info: {
        email: email,
        phone: '+33 1 23 45 67 89',
        name: user.name
      },
      verified: true,
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('exhibitors')
      .insert(exhibitorData);
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else {
      console.log('   ✅ Exhibitor créé');
    }
  }
}

createMissingExhibitors().catch(console.error);
