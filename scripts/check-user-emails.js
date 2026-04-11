import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('\n📧 === VÉRIFICATION DES EMAILS UTILISATEURS ===\n');
  
  // Récupérer tous les utilisateurs avec leurs types
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, name, type')
    .order('type')
    .limit(50);

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  console.log(`✅ ${users.length} utilisateurs trouvés\n`);

  // Grouper par type
  const byType = users.reduce((acc, user) => {
    if (!acc[user.type]) acc[user.type] = [];
    acc[user.type].push(user);
    return acc;
  }, {});

  for (const [type, typeUsers] of Object.entries(byType)) {
    console.log(`\n🔸 ${type.toUpperCase()} (${typeUsers.length}):`);
    typeUsers.slice(0, 10).forEach(u => {
      console.log(`   ${u.email} - ${u.name}`);
    });
    if (typeUsers.length > 10) {
      console.log(`   ... et ${typeUsers.length - 10} autres`);
    }
  }

  // Vérifier si admin@siport.com existe
  console.log('\n\n🔍 === VÉRIFICATION DES COMPTES ADMIN ===\n');
  
  const adminEmails = [
    'admin@siport.com',
    'admin@test.com',
    'test@test.com',
    'visitor1@test.com',
    'exhibitor1@test.com',
    'partner1@test.com'
  ];

  for (const email of adminEmails) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, type')
      .eq('email', email)
      .single();

    if (data) {
      console.log(`✅ ${email} → ${data.type} (${data.name})`);
    } else {
      console.log(`❌ ${email} → NON TROUVÉ`);
    }
  }
}

checkUsers().catch(console.error);
