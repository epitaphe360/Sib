import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

const testEmails = {
  exhibitors: [
    'exhibitor1@test.com',
    'exhibitor2@test.com',
    'sandrine.morel1@company.com',
    'thomas.lefebvre3@company.com'
  ],
  partners: [
    'stéphanie.robert3@partner.com',
    'valérie.durand4@partner.com',
    'pierre.michel7@partner.com',
    'isabelle.bernard5@partner.com'
  ],
  visitors: [
    'christophe.lefebvre1@visitor.com',
    'sophie.morel2@visitor.com'
  ]
};

async function checkExhibitorData(email) {
  console.log(`\n🔍 Vérification: ${email}`);
  
  // Récupérer l'utilisateur
  const { data: user } = await supabase
    .from('users')
    .select('id, name, type')
    .eq('email', email)
    .single();
  
  if (!user) {
    console.log('   ❌ Utilisateur non trouvé');
    return;
  }
  
  console.log(`   👤 ${user.name}`);
  
  // Récupérer l'exposant
  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id, company_name, category, sector, featured, verified')
    .eq('user_id', user.id)
    .single();
  
  if (!exhibitor) {
    console.log('   ❌ Pas d\'enregistrement exhibitor');
    return;
  }
  
  console.log(`   ✅ Exhibitor: ${exhibitor.company_name}`);
  console.log(`      Catégorie: ${exhibitor.category}, Secteur: ${exhibitor.sector}`);
  console.log(`      Featured: ${exhibitor.featured ? 'Oui' : 'Non'}, Vérifié: ${exhibitor.verified ? 'Oui' : 'Non'}`);
  
  // Vérifier mini site
  const { data: miniSite, count: miniSiteCount } = await supabase
    .from('mini_sites')
    .select('id, title, is_published', { count: 'exact' })
    .eq('exhibitor_id', exhibitor.id);
  
  console.log(`   🌐 Mini sites: ${miniSiteCount || 0}`);
  if (miniSite && miniSite.length > 0) {
    miniSite.forEach(ms => {
      console.log(`      - ${ms.title} (${ms.is_published ? 'Publié' : 'Brouillon'})`);
    });
  } else {
    console.log('      ⚠️  Aucun mini site');
  }
  
  // Vérifier produits
  const { data: products, count: productCount } = await supabase
    .from('products')
    .select('id, name, category', { count: 'exact' })
    .eq('exhibitor_id', exhibitor.id);
  
  console.log(`   📦 Produits: ${productCount || 0}`);
  if (products && products.length > 0) {
    products.slice(0, 3).forEach(p => {
      console.log(`      - ${p.name} (${p.category})`);
    });
    if (products.length > 3) console.log(`      ... et ${products.length - 3} autres`);
  } else {
    console.log('      ⚠️  Aucun produit');
  }
}

async function checkPartnerData(email) {
  console.log(`\n🔍 Vérification: ${email}`);
  
  const { data: user } = await supabase
    .from('users')
    .select('id, name, type')
    .eq('email', email)
    .single();
  
  if (!user) {
    console.log('   ❌ Utilisateur non trouvé');
    return;
  }
  
  console.log(`   👤 ${user.name}`);
  
  const { data: partner } = await supabase
    .from('partners')
    .select('id, company_name, partnership_level, partner_type, featured, verified')
    .eq('user_id', user.id)
    .single();
  
  if (!partner) {
    console.log('   ❌ Pas d\'enregistrement partner');
    return;
  }
  
  console.log(`   ✅ Partner: ${partner.company_name}`);
  console.log(`      Niveau: ${partner.partnership_level}, Type: ${partner.partner_type}`);
  console.log(`      Featured: ${partner.featured ? 'Oui' : 'Non'}, Vérifié: ${partner.verified ? 'Oui' : 'Non'}`);
  
  // Vérifier projets
  const { data: projects, count: projectCount } = await supabase
    .from('partner_projects')
    .select('id, title, status', { count: 'exact' })
    .eq('user_id', user.id);
  
  console.log(`   🚀 Projets: ${projectCount || 0}`);
  if (projects && projects.length > 0) {
    projects.forEach(p => {
      console.log(`      - ${p.title} (${p.status})`);
    });
  } else {
    console.log('      ⚠️  Aucun projet');
  }
}

async function checkVisitorData(email) {
  console.log(`\n🔍 Vérification: ${email}`);
  
  const { data: user } = await supabase
    .from('users')
    .select('id, name, type, profile')
    .eq('email', email)
    .single();
  
  if (!user) {
    console.log('   ❌ Utilisateur non trouvé');
    return;
  }
  
  console.log(`   👤 ${user.name}`);
  console.log(`   📋 Profile:`, user.profile || 'Vide');
}

async function main() {
  console.log('\n📊 === VÉRIFICATION DES DONNÉES DE TEST ===\n');
  
  console.log('\n🏢 === EXPOSANTS ===');
  for (const email of testEmails.exhibitors) {
    await checkExhibitorData(email);
  }
  
  console.log('\n\n🤝 === PARTENAIRES ===');
  for (const email of testEmails.partners) {
    await checkPartnerData(email);
  }
  
  console.log('\n\n👥 === VISITEURS ===');
  for (const email of testEmails.visitors) {
    await checkVisitorData(email);
  }
}

main().catch(console.error);
