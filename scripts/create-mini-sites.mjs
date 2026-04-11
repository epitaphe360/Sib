import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

// Templates de mini-sites par secteur
const miniSiteTemplates = {
  'TechMarine Solutions': {
    theme: 'modern',
    custom_colors: { primary: '#0ea5e9', secondary: '#06b6d4', accent: '#22d3ee' },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'TechMarine Solutions',
          subtitle: 'Innovation Maritime & Technologies Portuaires',
          description: 'Leader en solutions technologiques pour l\'industrie maritime'
        }
      },
      {
        type: 'about',
        content: {
          title: 'À propos de nous',
          description: 'TechMarine Solutions est spécialisée dans le développement de solutions technologiques innovantes pour l\'industrie maritime et portuaire.',
          features: ['Systèmes de gestion portuaire', 'Solutions IoT maritimes', 'Suivi temps réel', 'Intelligence artificielle']
        }
      },
      {
        type: 'services',
        content: {
          title: 'Nos Services',
          services: [
            { name: 'Port Management System', description: 'Gestion complète des opérations portuaires' },
            { name: 'IoT Maritime', description: 'Capteurs et monitoring en temps réel' },
            { name: 'Analytics Platform', description: 'Analyse de données et prédiction' }
          ]
        }
      },
      { type: 'contact', content: { title: 'Contactez-nous', email: 'contact@techmarine.com', phone: '+33 1 23 45 67 89' } }
    ]
  },
  'OceanLogistics Pro': {
    theme: 'corporate',
    custom_colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
    sections: [
      { type: 'hero', content: { title: 'OceanLogistics Pro', subtitle: 'Votre Partenaire Logistique Maritime', description: 'Excellence en logistique et transport maritime international' } },
      { type: 'about', content: { title: 'Notre Expertise', description: 'OceanLogistics Pro offre des services complets de logistique maritime avec plus de 20 ans d\'expérience.', features: ['Transport maritime', 'Stockage & Entreposage', 'Transit douanier', 'Supply chain management'] } },
      { type: 'services', content: { title: 'Nos Services', services: [ { name: 'Transport FCL/LCL', description: 'Conteneurs complets ou groupage' }, { name: 'Warehousing', description: 'Stockage sécurisé' }, { name: 'Customs Brokerage', description: 'Dédouanement' } ] } },
      { type: 'contact', content: { title: 'Contact', email: 'info@oceanlogistics.pro', phone: '+33 1 98 76 54 32' } }
    ]
  },
  'PortTech Industries': {
    theme: 'industrial',
    custom_colors: { primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
    sections: [
      { type: 'hero', content: { title: 'PortTech Industries', subtitle: 'Équipements Portuaires de Haute Performance', description: 'Fabricant d\'équipements pour l\'industrie portuaire' } },
      { type: 'about', content: { title: 'Qui sommes-nous', description: 'PortTech Industries conçoit et fabrique des équipements portuaires robustes et performants.', features: ['Grues portuaires', 'Portiques de manutention', 'Systèmes automatisés', 'Maintenance & SAV'] } },
      { type: 'services', content: { title: 'Produits & Services', services: [ { name: 'Grues STS', description: 'Portiques de quai ship-to-shore' }, { name: 'RTG/RMG', description: 'Grues sur pneus et sur rails' }, { name: 'Maintenance', description: 'Service après-vente mondial' } ] } },
      { type: 'contact', content: { title: 'Nous contacter', email: 'sales@porttech.industries', phone: '+33 4 56 78 90 12' } }
    ]
  },
  'Global Shipping Alliance': {
    theme: 'premium',
    custom_colors: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
    sections: [
      { type: 'hero', content: { title: 'Global Shipping Alliance', subtitle: 'Alliance Mondiale du Transport Maritime', description: 'Un réseau d\'excellence pour vos expéditions internationales' } },
      { type: 'about', content: { title: 'Notre Alliance', description: 'Global Shipping Alliance réunit les meilleurs acteurs du transport maritime pour offrir un service premium à l\'échelle mondiale.', features: ['Réseau mondial', '150+ pays', 'Service premium', 'Suivi digital'] } },
      { type: 'services', content: { title: 'Services Premium', services: [ { name: 'Express Shipping', description: 'Livraison prioritaire garantie' }, { name: 'Door-to-Door', description: 'Service complet porte à porte' }, { name: 'Track & Trace', description: 'Suivi en temps réel avancé' } ] } },
      { type: 'contact', content: { title: 'Contact', email: 'alliance@globalshipping.com', phone: '+33 1 11 22 33 44' } }
    ]
  }
};

async function createMiniSites() {
  console.log('🚀 Création des mini-sites pour les exposants...\n');
  
  const { data: exhibitors, error: exhError } = await supabase
    .from('exhibitors')
    .select('id, user_id, company_name')
    .neq('company_name', '');
  
  if (exhError) {
    console.error('❌ Erreur:', exhError);
    return;
  }
  
  console.log(`📋 Exposants: ${exhibitors.length}\n`);
  
  for (const exhibitor of exhibitors) {
    const { data: existingMiniSite } = await supabase
      .from('mini_sites')
      .select('id')
      .eq('exhibitor_id', exhibitor.id)
      .maybeSingle();
    
    if (existingMiniSite) {
      console.log(`⏭️  ${exhibitor.company_name} - existe déjà`);
      continue;
    }
    
    const template = miniSiteTemplates[exhibitor.company_name] || {
      theme: 'modern',
      custom_colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
      sections: [
        { type: 'hero', content: { title: exhibitor.company_name || 'Notre Entreprise', subtitle: 'Bienvenue', description: 'Découvrez nos services' } },
        { type: 'about', content: { title: 'À propos', description: 'Description de notre entreprise.', features: ['Service 1', 'Service 2', 'Service 3'] } },
        { type: 'contact', content: { title: 'Contact', email: 'contact@example.com', phone: '+33 1 00 00 00 00' } }
      ]
    };
    
    const { data: newMiniSite, error: createError } = await supabase
      .from('mini_sites')
      .insert({
        exhibitor_id: exhibitor.id,
        theme: template.theme,
        custom_colors: template.custom_colors,
        sections: template.sections,
        published: true,
        views: 0,
        total_views: 0,
        unique_visitors: 0
      })
      .select()
      .single();
    
    if (createError) {
      console.error(`❌ ${exhibitor.company_name}:`, createError.message);
    } else {
      console.log(`✅ ${exhibitor.company_name} - Mini-site créé (ID: ${newMiniSite.id})`);
    }
  }
  
  console.log('\n🎉 Terminé !');
  
  const { data: allMiniSites } = await supabase.from('mini_sites').select('id');
  console.log(`📊 Total mini-sites: ${allMiniSites?.length || 0}`);
}

createMiniSites();
