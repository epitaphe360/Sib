/**
 * Script de mise à jour de Tanger Med UNIQUEMENT
 * Met à jour les données de l'exposant Tanger Med existant
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Données mises à jour de Tanger Med
const tangerMedData = {
  minisite: {
    theme: 'elegant',
    custom_colors: {
      primaryColor: '#0d4c92',
      secondaryColor: '#59c1bd',
      accentColor: '#a0e4cb',
      fontFamily: 'Inter'
    },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'Tanger Med - Premier Port d\'Afrique',
          subtitle: 'Connecter le Maroc au monde avec excellence et innovation',
          ctaText: 'Explorer nos capacités',
          ctaLink: '#capacites',
          backgroundImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1920&q=80'
        }
      },
      {
        type: 'about',
        content: {
          title: 'Premier Port d\'Afrique et Méditerranée',
          description: 'Le Groupe Tanger Med, par sa Tanger Med Special Agency, opère le complexe portuaire le plus important du continent. Stratégiquement positionné sur le Détroit de Gibraltar à 14 km de l\'Europe, Tanger Med connecte plus de 180 ports internationaux. Le groupe gère également 3 000 ha de zones d\'activités économiques avec plus de 1 400 entreprises installées.',
          features: [
            '11 ports opérés',
            '25 terminaux à conteneurs et vracs',
            '187 millions de tonnes traitées',
            '11,44 millions de conteneurs EVP manutentionnés',
            '3 000 ha de zones d\'activités',
            '1 400 entreprises installées'
          ],
          stats: [
            { number: '#1', label: 'Port Africain' },
            { number: '187M', label: 'Tonnes traitées' },
            { number: '11.44M', label: 'Conteneurs EVP' },
            { number: '1.4K', label: 'Entreprises ZA' }
          ]
        }
      },
      {
        type: 'products',
        content: {
          title: 'Services & Filiales du Groupe',
          items: [
            {
              name: 'Tanger Med Port Authority',
              description: 'Opération et gestion des terminaux à conteneurs et vracs',
              image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600'
            },
            {
              name: 'Tanger Med Zones',
              description: '3 000 ha de zones d\'activités industrielles et logistiques',
              image: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=600'
            },
            {
              name: 'Marsa Maroc',
              description: 'Gestion de 25 terminaux à conteneurs et vracs dans le Maroc',
              image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600'
            },
            {
              name: 'Tanger Med Engineering',
              description: 'Ingénierie spécialisée et maîtrise d\'œuvre',
              image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600'
            },
            {
              name: 'Tanger Med Utilities',
              description: 'Services aux entreprises et gestion des utilités industrielles',
              image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600'
            },
            {
              name: 'Tanger Med Passagers',
              description: 'Terminal passagers et services maritimes de voyageurs',
              image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600'
            }
          ]
        }
      },
      {
        type: 'contact',
        content: {
          title: 'Nous Contacter',
          email: 'contact@tangermed.ma',
          phone: '+212 539 349 250',
          address: 'Route de Rabat, 90000 Tanger, Maroc',
          fax: '+212 539 943 427',
          website: 'https://www.tangermed.ma'
        }
      }
    ]
  }
};

async function updateTangerMed() {
  try {
    console.log('🔍 Recherche de l\'exposant Tanger Med...');

    // Chercher l'exposant Tanger Med
    const { data: exhibitors, error: searchError } = await supabase
      .from('exhibitors')
      .select('id, company_name, user_id')
      .ilike('company_name', '%tanger%med%')
      .limit(1);

    if (searchError) {
      console.error('❌ Erreur de recherche:', searchError);
      return;
    }

    if (!exhibitors || exhibitors.length === 0) {
      console.log('⚠️ Aucun exposant Tanger Med trouvé dans la base');
      console.log('Recherche avec un pattern plus large...');
      
      const { data: allExhibitors, error: allError } = await supabase
        .from('exhibitors')
        .select('id, company_name, user_id');
      
      if (allError) {
        console.error('❌ Erreur:', allError);
        return;
      }
      
      console.log('\n📋 Exposants disponibles:');
      allExhibitors?.forEach(ex => console.log(`  - ${ex.company_name} (ID: ${ex.id})`));
      console.log('\n💡 Créez d\'abord l\'exposant Tanger Med ou modifiez le script avec le bon nom.');
      return;
    }

    const tangerMed = exhibitors[0];
    console.log(`✅ Trouvé: ${tangerMed.company_name} (ID: ${tangerMed.id})`);

    // Vérifier si un mini-site existe
    console.log('🔍 Recherche du mini-site...');
    const { data: existingMinisite, error: msSearchError } = await supabase
      .from('mini_sites')
      .select('id')
      .eq('exhibitor_id', tangerMed.id)
      .single();

    if (msSearchError && msSearchError.code !== 'PGRST116') {
      console.error('❌ Erreur recherche mini-site:', msSearchError);
      return;
    }

    if (existingMinisite) {
      // Mise à jour du mini-site existant
      console.log('📝 Mise à jour du mini-site existant...');
      const { error: updateError } = await supabase
        .from('mini_sites')
        .update(tangerMedData.minisite)
        .eq('id', existingMinisite.id);

      if (updateError) {
        console.error('❌ Erreur de mise à jour:', updateError);
        return;
      }
      console.log('✅ Mini-site mis à jour avec succès!');
    } else {
      // Création d'un nouveau mini-site
      console.log('➕ Création d\'un nouveau mini-site...');
      const { error: createError } = await supabase
        .from('mini_sites')
        .insert({
          exhibitor_id: tangerMed.id,
          user_id: tangerMed.user_id,
          ...tangerMedData.minisite
        });

      if (createError) {
        console.error('❌ Erreur de création:', createError);
        return;
      }
      console.log('✅ Mini-site créé avec succès!');
    }

    console.log('\n📊 Résumé:');
    console.log(`  - Exposant: ${tangerMed.company_name}`);
    console.log(`  - Sections: ${tangerMedData.minisite.sections.length}`);
    console.log(`  - Thème: ${tangerMedData.minisite.theme}`);
    console.log(`  ✅ Section "Domaines d'Expertise" supprimée`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

updateTangerMed();
