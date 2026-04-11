import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Données de profils réalistes
const INTERESTS = [
  'Innovation portuaire',
  'Logistique maritime',
  'Technologies vertes',
  'Automatisation',
  'Transformation digitale',
  'Supply Chain',
  'Commerce international',
  'Développement durable',
  'Énergies renouvelables',
  'Smart ports',
  'IoT maritime',
  'Cybersécurité portuaire',
  'Maintenance prédictive',
  'Gestion de flotte',
  'Optimisation des opérations'
];

const SECTORS = [
  'Logistique',
  'Transport maritime',
  'Technologies portuaires',
  'Manutention',
  'Services portuaires',
  'Équipements industriels',
  'Conseil',
  'IT & Digital',
  'Environnement',
  'Sécurité'
];

const OBJECTIVES = [
  'Trouver de nouveaux partenaires',
  'Développer mon réseau',
  'Présenter mes innovations',
  'Identifier des fournisseurs',
  'Explorer de nouveaux marchés',
  'Rencontrer des investisseurs',
  'Découvrir les innovations portuaires'
];

const COLLABORATION_TYPES = [
  'Partenariat commercial',
  'Partenariat technologique',
  'Co-développement',
  'Distribution',
  'Intégration',
  'Consulting'
];

const COUNTRIES = ['FR', 'BE', 'ES', 'IT', 'DE', 'NL', 'UK', 'US', 'MA', 'TN'];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

// Générer un profil basé sur le type d'utilisateur
function generateProfile(user) {
  const profile = user.profile || {};
  
  // Sélection aléatoire mais cohérente
  const randomInterests = shuffleArray([...INTERESTS]).slice(0, 3 + Math.floor(Math.random() * 3));
  const randomSectors = shuffleArray([...SECTORS]).slice(0, 1 + Math.floor(Math.random() * 2));
  const randomObjectives = shuffleArray([...OBJECTIVES]).slice(0, 2 + Math.floor(Math.random() * 2));
  const randomCollabTypes = shuffleArray([...COLLABORATION_TYPES]).slice(0, 2 + Math.floor(Math.random() * 2));
  
  const updatedProfile = {
    ...profile,
    interests: profile.interests?.length > 0 ? profile.interests : randomInterests,
    sectors: profile.sectors?.length > 0 ? profile.sectors : randomSectors,
    objectives: profile.objectives?.length > 0 ? profile.objectives : randomObjectives,
    collaborationTypes: profile.collaborationTypes?.length > 0 ? profile.collaborationTypes : randomCollabTypes,
    country: profile.country || COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
    companySize: profile.companySize || COMPANY_SIZES[Math.floor(Math.random() * COMPANY_SIZES.length)],
  };

  // Générer une bio si elle n'existe pas
  if (!profile.bio || profile.bio.length < 20) {
    const userType = user.type === 'exhibitor' ? 'exposant' : user.type === 'partner' ? 'partenaire' : 'visiteur';
    const sector = randomSectors[0] || 'secteur portuaire';
    const interest = randomInterests[0] || 'innovation portuaire';
    
    updatedProfile.bio = `Professionnel ${userType} spécialisé dans ${sector}. Passionné par ${interest} et à la recherche de nouvelles opportunités de collaboration dans le secteur maritime.`;
  }

  return updatedProfile;
}

// Fonction pour mélanger un tableau
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

async function fillAllProfiles() {
  console.log('🔄 Récupération de tous les utilisateurs...\n');

  // Récupérer tous les utilisateurs
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
    return;
  }

  console.log(`📊 ${users.length} utilisateurs trouvés\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    const profile = user.profile || {};
    
    // Vérifier si le profil est déjà bien rempli
    const hasInterests = profile.interests?.length > 0;
    const hasSectors = profile.sectors?.length > 0;
    const hasObjectives = profile.objectives?.length > 0;
    const hasCollabTypes = profile.collaborationTypes?.length > 0;
    
    if (hasInterests && hasSectors && hasObjectives && hasCollabTypes) {
      console.log(`⏭️  ${user.name || user.email} - Profil déjà complet`);
      skipped++;
      continue;
    }

    // Générer le profil enrichi
    const enrichedProfile = generateProfile(user);

    // Mettre à jour l'utilisateur
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile: enrichedProfile })
      .eq('id', user.id);

    if (updateError) {
      console.error(`❌ Erreur pour ${user.name || user.email}:`, updateError.message);
      errors++;
    } else {
      console.log(`✅ ${user.name || user.email} (${user.type}) - Profil enrichi`);
      console.log(`   Interests: ${enrichedProfile.interests.length} | Sectors: ${enrichedProfile.sectors.length} | Objectives: ${enrichedProfile.objectives.length}`);
      updated++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 RÉSUMÉ DE LA MISE À JOUR:');
  console.log('='.repeat(60));
  console.log(`✅ Profils mis à jour: ${updated}`);
  console.log(`⏭️  Profils déjà complets: ${skipped}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log(`📊 Total utilisateurs: ${users.length}`);
  console.log('='.repeat(60));
}

// Exécuter le script
fillAllProfiles().catch(console.error);
