import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('\n=== COMPTES DE TEST DISPONIBLES ===\n');

// Récupérer tous les utilisateurs
const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

if (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

// Grouper par type
const accountsByType = {
  visitor: [],
  exhibitor: [],
  partner: [],
  admin: []
};

for (const user of users) {
  // Récupérer le profil
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('type, status, name')
    .eq('id', user.id)
    .maybeSingle();

  if (profile) {
    const account = {
      email: user.email,
      type: profile.type,
      status: profile.status,
      name: profile.name,
      confirmed: user.email_confirmed_at ? '✅' : '❌',
      created: new Date(user.created_at).toLocaleDateString('fr-FR')
    };
    
    accountsByType[profile.type]?.push(account);
  }
}

// Afficher par type
console.log('🔹 VISITEURS (mot de passe par défaut: TestPassword123!)');
console.log('─'.repeat(80));
accountsByType.visitor.slice(0, 5).forEach(acc => {
  console.log(`  ${acc.confirmed} ${acc.email.padEnd(45)} | ${acc.status.padEnd(15)} | ${acc.name || 'N/A'}`);
});
if (accountsByType.visitor.length > 5) {
  console.log(`  ... et ${accountsByType.visitor.length - 5} autres visiteurs\n`);
}

console.log('\n🔹 EXPOSANTS (mot de passe par défaut: TestPassword123!)');
console.log('─'.repeat(80));
accountsByType.exhibitor.slice(0, 5).forEach(acc => {
  console.log(`  ${acc.confirmed} ${acc.email.padEnd(45)} | ${acc.status.padEnd(15)} | ${acc.name || 'N/A'}`);
});
if (accountsByType.exhibitor.length > 5) {
  console.log(`  ... et ${accountsByType.exhibitor.length - 5} autres exposants\n`);
}

console.log('\n🔹 PARTENAIRES (mot de passe par défaut: TestPassword123!)');
console.log('─'.repeat(80));
accountsByType.partner.slice(0, 5).forEach(acc => {
  console.log(`  ${acc.confirmed} ${acc.email.padEnd(45)} | ${acc.status.padEnd(15)} | ${acc.name || 'N/A'}`);
});
if (accountsByType.partner.length > 5) {
  console.log(`  ... et ${accountsByType.partner.length - 5} autres partenaires\n`);
}

console.log('\n🔹 ADMINISTRATEURS');
console.log('─'.repeat(80));
accountsByType.admin.forEach(acc => {
  console.log(`  ${acc.confirmed} ${acc.email.padEnd(45)} | ${acc.status.padEnd(15)} | ${acc.name || 'N/A'}`);
});

console.log('\n─'.repeat(80));
console.log(`\n📊 TOTAL: ${users.length} comptes`);
console.log(`   Visiteurs: ${accountsByType.visitor.length}`);
console.log(`   Exposants: ${accountsByType.exhibitor.length}`);
console.log(`   Partenaires: ${accountsByType.partner.length}`);
console.log(`   Admins: ${accountsByType.admin.length}`);

console.log('\n💡 COMPTES RECOMMANDÉS POUR LES TESTS:');
console.log('─'.repeat(80));

// Trouver des comptes actifs confirmés
const activeVisitor = accountsByType.visitor.find(a => a.status === 'active' && a.confirmed === '✅');
const activeExhibitor = accountsByType.exhibitor.find(a => a.status === 'active' && a.confirmed === '✅');
const activePartner = accountsByType.partner.find(a => a.confirmed === '✅');

if (activeVisitor) {
  console.log(`\n  Visiteur actif:`);
  console.log(`    Email: ${activeVisitor.email}`);
  console.log(`    Mot de passe: TestPassword123!`);
}

if (activeExhibitor) {
  console.log(`\n  Exposant actif:`);
  console.log(`    Email: ${activeExhibitor.email}`);
  console.log(`    Mot de passe: TestPassword123!`);
}

if (activePartner) {
  console.log(`\n  Partenaire:`);
  console.log(`    Email: ${activePartner.email}`);
  console.log(`    Mot de passe: TestPassword123!`);
}

console.log('\n');
