import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbyizudifmqakzxjlndr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

// Données de partenaires fictifs pour compléter les profils vides
const partnerTemplates = [
  {
    company_name: 'Mediterranean Shipping Alliance',
    partner_type: 'logistics',
    sector: 'Transport Maritime',
    description: 'Alliance de compagnies maritimes méditerranéennes offrant des services de transport de conteneurs et de vrac.',
    logo_url: 'https://placehold.co/200x200/0ea5e9/ffffff?text=MSA',
    website: 'https://med-shipping.com',
    partnership_level: 'platinum'
  },
  {
    company_name: 'Port Authority International',
    partner_type: 'institutional',
    sector: 'Administration Portuaire',
    description: 'Organisation internationale regroupant les autorités portuaires pour promouvoir les meilleures pratiques.',
    logo_url: 'https://placehold.co/200x200/7c3aed/ffffff?text=PAI',
    website: 'https://port-authority-intl.org',
    partnership_level: 'institutional'
  },
  {
    company_name: 'Global Trade Finance Corp',
    partner_type: 'financial',
    sector: 'Finance & Commerce',
    description: 'Institution financière spécialisée dans le financement du commerce international et des opérations portuaires.',
    logo_url: 'https://placehold.co/200x200/059669/ffffff?text=GTF',
    website: 'https://gtf-corp.com',
    partnership_level: 'gold'
  },
  {
    company_name: 'Maritime Tech Innovations',
    partner_type: 'technology',
    sector: 'Technologies Maritimes',
    description: 'Entreprise innovante développant des solutions IoT et d\'intelligence artificielle pour l\'industrie maritime.',
    logo_url: 'https://placehold.co/200x200/dc2626/ffffff?text=MTI',
    website: 'https://maritime-tech.io',
    partnership_level: 'silver'
  },
  {
    company_name: 'African Ports Network',
    partner_type: 'institutional',
    sector: 'Réseau Portuaire',
    description: 'Réseau panafricain des ports promouvant la coopération et le développement des infrastructures portuaires du continent.',
    logo_url: 'https://placehold.co/200x200/f59e0b/ffffff?text=APN',
    website: 'https://african-ports.org',
    partnership_level: 'institutional'
  },
  {
    company_name: 'EcoMarine Solutions',
    partner_type: 'environmental',
    sector: 'Environnement & Durabilité',
    description: 'Société de conseil spécialisée dans les solutions écologiques pour les ports et l\'industrie maritime.',
    logo_url: 'https://placehold.co/200x200/10b981/ffffff?text=EMS',
    website: 'https://ecomarine.green',
    partnership_level: 'bronze'
  },
  {
    company_name: 'Casablanca Port Services',
    partner_type: 'services',
    sector: 'Services Portuaires',
    description: 'Prestataire de services portuaires complets : manutention, entreposage, transit et logistique intégrée.',
    logo_url: 'https://placehold.co/200x200/1e40af/ffffff?text=CPS',
    website: 'https://casaport-services.ma',
    partnership_level: 'gold'
  },
  {
    company_name: 'Maritime Insurance Group',
    partner_type: 'financial',
    sector: 'Assurance Maritime',
    description: 'Groupe d\'assurance spécialisé dans la couverture des risques maritimes, cargaisons et responsabilités.',
    logo_url: 'https://placehold.co/200x200/6366f1/ffffff?text=MIG',
    website: 'https://maritime-insurance.com',
    partnership_level: 'silver'
  },
  {
    company_name: 'Blue Ocean Research',
    partner_type: 'research',
    sector: 'Recherche & Développement',
    description: 'Centre de recherche dédié à l\'innovation maritime, océanographie et développement durable des océans.',
    logo_url: 'https://placehold.co/200x200/0284c7/ffffff?text=BOR',
    website: 'https://blue-ocean-research.org',
    partnership_level: 'institutional'
  },
  {
    company_name: 'Cargo Connect International',
    partner_type: 'logistics',
    sector: 'Logistique Internationale',
    description: 'Réseau mondial de commissionnaires de transport offrant des solutions de fret multimodal.',
    logo_url: 'https://placehold.co/200x200/ea580c/ffffff?text=CCI',
    website: 'https://cargo-connect.intl',
    partnership_level: 'gold'
  },
  {
    company_name: 'Port Security Systems',
    partner_type: 'technology',
    sector: 'Sécurité Portuaire',
    description: 'Expert en solutions de sécurité pour les infrastructures portuaires : surveillance, contrôle d\'accès et cybersécurité.',
    logo_url: 'https://placehold.co/200x200/991b1b/ffffff?text=PSS',
    website: 'https://port-security.systems',
    partnership_level: 'silver'
  },
  {
    company_name: 'Maritime Training Academy',
    partner_type: 'education',
    sector: 'Formation Maritime',
    description: 'Académie de formation professionnelle pour les métiers maritimes et portuaires, certifiée OMI.',
    logo_url: 'https://placehold.co/200x200/7c2d12/ffffff?text=MTA',
    website: 'https://maritime-academy.edu',
    partnership_level: 'bronze'
  },
  {
    company_name: 'Offshore Energy Partners',
    partner_type: 'energy',
    sector: 'Énergie Offshore',
    description: 'Développeur de projets d\'énergie renouvelable offshore : éolien, marémoteur et solaire flottant.',
    logo_url: 'https://placehold.co/200x200/15803d/ffffff?text=OEP',
    website: 'https://offshore-energy.partners',
    partnership_level: 'platinum'
  },
  {
    company_name: 'Digital Port Solutions',
    partner_type: 'technology',
    sector: 'Digitalisation Portuaire',
    description: 'Éditeur de logiciels pour la gestion portuaire : PCS, TOS et solutions de traçabilité blockchain.',
    logo_url: 'https://placehold.co/200x200/4f46e5/ffffff?text=DPS',
    website: 'https://digital-port.solutions',
    partnership_level: 'gold'
  },
  {
    company_name: 'Mediterranean Cruise Line',
    partner_type: 'tourism',
    sector: 'Tourisme Maritime',
    description: 'Compagnie de croisières méditerranéennes proposant des escales dans les plus beaux ports de la région.',
    logo_url: 'https://placehold.co/200x200/be185d/ffffff?text=MCL',
    website: 'https://med-cruise.line',
    partnership_level: 'silver'
  }
];

async function updatePartners() {
  console.log('=== MISE À JOUR DES PARTENAIRES ===\n');
  
  // Récupérer les partenaires sans nom
  const { data: partners, error } = await supabase
    .from('partners')
    .select('*');
  
  if (error) {
    console.log('Erreur:', error);
    return;
  }
  
  const emptyPartners = partners.filter(p => !p.company_name || p.company_name === '');
  console.log(`Partenaires à mettre à jour: ${emptyPartners.length}\n`);
  
  for (let i = 0; i < emptyPartners.length && i < partnerTemplates.length; i++) {
    const partner = emptyPartners[i];
    const template = partnerTemplates[i];
    
    const { error: updateError } = await supabase
      .from('partners')
      .update({
        company_name: template.company_name,
        partner_type: template.partner_type,
        sector: template.sector,
        description: template.description,
        logo_url: template.logo_url,
        website: template.website,
        partnership_level: template.partnership_level,
        verified: true,
        featured: true
      })
      .eq('id', partner.id);
    
    if (updateError) {
      console.log(`❌ Erreur pour ${template.company_name}:`, updateError.message);
    } else {
      console.log(`✅ ${template.company_name} mis à jour (ID: ${partner.id})`);
    }
  }
  
  console.log('\n🎉 Mise à jour terminée !');
  
  // Afficher le résultat final
  const { data: finalPartners } = await supabase
    .from('partners')
    .select('id, company_name, partnership_level')
    .order('company_name');
  
  console.log('\n=== PARTENAIRES FINAUX ===');
  finalPartners?.forEach(p => {
    console.log(`- ${p.company_name || 'N/A'} (${p.partnership_level || 'N/A'})`);
  });
}

updatePartners();
