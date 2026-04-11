// Script pour ajouter des données de test pour les tables de networking
// Exécutez ce script avec: node scripts/seed-networking-data.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Chargement des variables d'environnement
dotenv.config({ path: '.env.local' });

// Vérification des variables d'environnement requises
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Erreur: Les variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies.');
  console.error('Créez un fichier .env.local avec ces variables ou définissez-les dans votre environnement.');
  process.exit(1);
}

// Création du client Supabase avec la clé de service
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Fonction principale qui ajoute les données de test
async function seedNetworkingData() {
  try {
    console.log('🌱 Début de l\'ajout des données de test pour le networking...');
    
    // Récupération de quelques utilisateurs existants pour créer des relations
    console.log('🔍 Récupération des utilisateurs...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, type')
      .limit(10);
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
      process.exit(1);
    }
    
    if (!users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé. Veuillez d\'abord ajouter des utilisateurs.');
      process.exit(1);
    }
    
    console.log(`✅ ${users.length} utilisateurs récupérés.`);
    
    // Création de connexions entre utilisateurs
    console.log('🔄 Création de connexions entre utilisateurs...');
    
    const connections = [];
    const statuses = ['pending', 'accepted', 'rejected'];
    
    // Créer des connexions entre les utilisateurs
    for (let i = 0; i < users.length - 1; i++) {
      for (let j = i + 1; j < users.length; j++) {
        // Ajouter seulement quelques connexions (pas entre tous les utilisateurs)
        if (Math.random() > 0.3) continue;
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Déterminer qui est le demandeur et qui est le destinataire
        const [requester, addressee] = Math.random() > 0.5 
          ? [users[i].id, users[j].id] 
          : [users[j].id, users[i].id];
        
        connections.push({
          requester_id: requester,
          addressee_id: addressee,
          status
        });
      }
    }
    
    if (connections.length > 0) {
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .upsert(connections, { onConflict: 'requester_id,addressee_id' });
      
      if (connectionsError) {
        console.error('❌ Erreur lors de la création des connexions:', connectionsError.message);
      } else {
        console.log(`✅ ${connections.length} connexions créées.`);
      }
    } else {
      console.log('⚠️ Aucune connexion n\'a été créée.');
    }
    
    // Ajout des favoris
    console.log('🔄 Ajout des favoris...');
    
    const favorites = [];
    
    // Chaque utilisateur ajoute quelques favoris
    for (const user of users) {
      // Sélectionner aléatoirement 1 à 3 utilisateurs comme favoris
      const numFavorites = Math.floor(Math.random() * 3) + 1;
      const otherUsers = users.filter(u => u.id !== user.id);
      
      for (let i = 0; i < Math.min(numFavorites, otherUsers.length); i++) {
        // Sélectionner un utilisateur aléatoire qui n'est pas déjà un favori
        const availableUsers = otherUsers.filter(u => 
          !favorites.some(f => f.user_id === user.id && f.favorite_user_id === u.id)
        );
        
        if (availableUsers.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        const favoriteUser = availableUsers[randomIndex];
        
        favorites.push({
          user_id: user.id,
          favorite_user_id: favoriteUser.id
        });
      }
    }
    
    if (favorites.length > 0) {
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('user_favorites')
        .upsert(favorites, { onConflict: 'user_id,favorite_user_id' });
      
      if (favoritesError) {
        console.error('❌ Erreur lors de l\'ajout des favoris:', favoritesError.message);
      } else {
        console.log(`✅ ${favorites.length} favoris ajoutés.`);
      }
    } else {
      console.log('⚠️ Aucun favori n\'a été ajouté.');
    }
    
    // Génération de recommandations
    console.log('🔄 Génération de recommandations...');
    
    const recommendations = [];
    const recommendationTypes = ['sector_match', 'interest_match', 'exhibitor_recommendation', 'event_attendee'];
    const categories = ['business', 'technology', 'networking', 'investment'];
    const reasonsList = [
      ['Même secteur d\'activité', 'Intérêts communs', 'Projets similaires'],
      ['A assisté aux mêmes événements', 'Profil complémentaire', 'Connexions communes'],
      ['Pourrait être intéressé par vos produits', 'Partenariat potentiel', 'Synergie d\'affaires'],
      ['Expertise recherchée', 'Opportunité de collaboration', 'Investisseur potentiel']
    ];
    
    // Créer des recommandations pour chaque utilisateur
    for (const user of users) {
      // Sélectionner aléatoirement 2 à 5 utilisateurs comme recommandations
      const numRecommendations = Math.floor(Math.random() * 4) + 2;
      const otherUsers = users.filter(u => u.id !== user.id);
      
      for (let i = 0; i < Math.min(numRecommendations, otherUsers.length); i++) {
        // Sélectionner un utilisateur aléatoire qui n'est pas déjà recommandé
        const availableUsers = otherUsers.filter(u => 
          !recommendations.some(r => r.user_id === user.id && r.recommended_user_id === u.id)
        );
        
        if (availableUsers.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableUsers.length);
        const recommendedUser = availableUsers[randomIndex];
        
        const typeIndex = Math.floor(Math.random() * recommendationTypes.length);
        const categoryIndex = Math.floor(Math.random() * categories.length);
        
        // Sélectionner 1 à 3 raisons aléatoires
        const reasonsIndex = Math.floor(Math.random() * reasonsList.length);
        const numReasons = Math.floor(Math.random() * 3) + 1;
        const selectedReasons = [];
        
        for (let j = 0; j < numReasons; j++) {
          const availableReasons = reasonsList[reasonsIndex].filter(r => !selectedReasons.includes(r));
          if (availableReasons.length === 0) break;
          
          const randomReasonIndex = Math.floor(Math.random() * availableReasons.length);
          selectedReasons.push(availableReasons[randomReasonIndex]);
        }
        
        recommendations.push({
          user_id: user.id,
          recommended_user_id: recommendedUser.id,
          recommendation_type: recommendationTypes[typeIndex],
          score: Math.floor(Math.random() * 100) / 10, // Score entre 0.0 et 9.9
          reasons: selectedReasons,
          category: categories[categoryIndex],
          viewed: Math.random() > 0.7, // 30% de chance d'avoir été vu
          contacted: Math.random() > 0.9, // 10% de chance d'avoir été contacté
          mutual_connections: Math.floor(Math.random() * 5) // 0 à 4 connexions mutuelles
        });
      }
    }
    
    if (recommendations.length > 0) {
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('networking_recommendations')
        .upsert(recommendations);
      
      if (recommendationsError) {
        console.error('❌ Erreur lors de la génération des recommandations:', recommendationsError.message);
      } else {
        console.log(`✅ ${recommendations.length} recommandations générées.`);
      }
    } else {
      console.log('⚠️ Aucune recommandation n\'a été générée.');
    }
    
    console.log('✨ Ajout des données de test pour le networking terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de test:', error.message);
    process.exit(1);
  }
}

// Exécution de la fonction
seedNetworkingData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erreur non gérée:', err);
    process.exit(1);
  });
