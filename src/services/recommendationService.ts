import { User, NetworkingRecommendation, UserProfile } from '../types';

// --- Helper Functions ---

/**
 * Calculates the intersection of two string arrays.
 */
const getIntersection = (arr1: string[], arr2: string[]): string[] => {
  if (!arr1 || !arr2) return [];
  const set1 = new Set(arr1.map(item => item.toLowerCase()));
  return arr2.filter(item => set1.has(item.toLowerCase()));
};

/**
 * Defines complementary objectives between users.
 * e.g., a user looking for suppliers is a good match for a user presenting products.
 */
const complementaryObjectives: Record<string, string[]> = {
  'Trouver de nouveaux partenaires': ['Développer mon réseau', 'Présenter mes innovations'],
  'Développer mon réseau': ['Trouver de nouveaux partenaires', 'Rencontrer des investisseurs'],
  'Présenter mes innovations': ['Découvrir les innovations BTP', 'Identifier des fournisseurs'],
  'Identifier des fournisseurs': ['Présenter mes innovations', 'Explorer de nouveaux marchés'],
  'Explorer de nouveaux marchés': ['Trouver de nouveaux partenaires'],
  'Rencontrer des investisseurs': ['Présenter mes innovations'],
  'Découvrir les innovations BTP': ['Présenter mes innovations'],
};

// --- Scoring Weights ---
// These weights determine the importance of each matching criterion.
const weights = {
  sharedInterests: 15,
  sharedSectors: 20,
  complementaryObjectives: 25,
  sameCountry: 10,
  keywordInBio: 5,
  sameCompanySize: 5,
  sharedCollaborationTypes: 20,
  // New priority weights for user types - INCREASED for better matching even with empty profiles
  partnerPriority: 45, // Partners get priority over exhibitors
  exhibitorPriority: 35, // Exhibitors get priority over visitors
  visitorBonus: 25, // Bonus for matching with visitors
  availabilityBonus: 15, // Bonus for users with available time slots
  baseConnectionScore: 20, // Base score for any potential connection
};

/**
 * This service simulates an AI engine to generate networking recommendations.
 * It calculates a match score between users based on various profile attributes.
 */
class RecommendationService {
  /**
   * Ensures profile has default values for matching
   */
  private static ensureProfileDefaults(profile: Partial<UserProfile> | undefined): UserProfile {
    return {
      interests: profile?.interests || [],
      sectors: profile?.sectors || [],
      objectives: profile?.objectives || [],
      collaborationTypes: profile?.collaborationTypes || [],
      country: profile?.country || '',
      bio: profile?.bio || '',
      companySize: profile?.companySize || '',
      company: profile?.company || '',
      lastActive: profile?.lastActive || null,
      ...profile
    };
  }

  /**
   * Generates a list of networking recommendations for a given user.
   * @param currentUser - The user for whom to generate recommendations.
   * @param allUsers - A list of all potential users to recommend.
   * @returns A promise that resolves to a sorted list of recommendations.
   */
  public static async generateRecommendations(
    currentUser: User,
    allUsers: User[]
  ): Promise<NetworkingRecommendation[]> {
    const recommendations: NetworkingRecommendation[] = [];

    // Ensure current user profile has defaults
    const currentUserWithDefaults = {
      ...currentUser,
      profile: this.ensureProfileDefaults(currentUser.profile)
    };

    // Filter out the current user, users of the same company, and visitors (B2B only = exhibitors & partners)
    const potentialMatches = allUsers.filter(
      (p) => p.id !== currentUser.id && 
             p.profile?.company !== currentUser.profile?.company &&
             p.type !== 'visitor' && // Exclure les visiteurs (B2B = entreprises uniquement)
             p.type !== 'admin' && // Exclure les admins
             p.type !== 'security' && // Exclure la sécurité
             p.type !== currentUser.type // Prioritize different user types for networking
    );

    // If no matches with different types, include same types (but still exclude visitors/admins/security)
    const matchPool = potentialMatches.length > 0 ? potentialMatches : allUsers.filter(
      (p) => p.id !== currentUser.id &&
             p.type !== 'visitor' &&
             p.type !== 'admin' &&
             p.type !== 'security'
    );

    for (const potentialMatch of matchPool) {
      // Ensure potential match profile has defaults
      const matchWithDefaults = {
        ...potentialMatch,
        profile: this.ensureProfileDefaults(potentialMatch.profile)
      };

      const { score, reasons } = this.calculateMatchScore(currentUserWithDefaults as User, matchWithDefaults as User);

      // REDUCED threshold - accept all matches with positive score
      // Users with rich profiles get higher scores but all users can be recommended
      const threshold = 10; // Very low threshold to ensure recommendations even with empty profiles
      
      if (score > threshold) {
        recommendations.push({
          id: `${currentUser.id}-${potentialMatch.id}`,
          userId: currentUser.id,
          recommendedUserId: potentialMatch.id,
          score: Math.min(100, Math.round(score)), // Cap score at 100
          reasons: reasons.length > 0 ? reasons : ['Professionnel du secteur du bâtiment'], // Default reason if empty
          category: 'Professional Match',
          viewed: false,
          contacted: false,
          mutualConnections: 0, // Calculé côté serveur au besoin
          recommendedUser: potentialMatch,
        });
      }
    }

    // Sort recommendations by score in descending order
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculates a compatibility score between two users.
   * @param user1 - The current user.
   * @param user2 - The potential user to match with.
   * @returns An object containing the final score and the reasons for the match.
   */
  private static calculateMatchScore(user1: User, user2: User): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const p1: UserProfile = user1.profile || {} as UserProfile;
    const p2: UserProfile = user2.profile || {} as UserProfile;

    // Ensure arrays exist to avoid null errors
    const p1Interests = p1.interests || [];
    const p2Interests = p2.interests || [];
    const p1Sectors = p1.sectors || [];
    const p2Sectors = p2.sectors || [];
    const p1Objectives = p1.objectives || [];
    const p2Objectives = p2.objectives || [];
    const p1CollabTypes = p1.collaborationTypes || [];
    const p2CollabTypes = p2.collaborationTypes || [];

    // ALWAYS add a base connection score for any user
    score += weights.baseConnectionScore;

    // 1. User Type Priority System - ENHANCED
    // Partners get highest priority, then exhibitors, then visitors
    if (user1.type === 'visitor' && user2.type === 'exhibitor') {
      score += weights.exhibitorPriority;
      reasons.push('🏢 Exposant recommandé pour networking');
    } else if (user1.type === 'visitor' && user2.type === 'partner') {
      score += weights.partnerPriority;
      reasons.push('🤝 Partenaire officiel du salon');
    } else if (user1.type === 'exhibitor' && user2.type === 'partner') {
      score += weights.partnerPriority;
      reasons.push('⭐ Partenaire stratégique');
    } else if (user1.type === 'exhibitor' && user2.type === 'visitor') {
      score += weights.visitorBonus;
      reasons.push('👤 Visiteur intéressé par vos services');
    } else if (user1.type === 'partner' && user2.type === 'visitor') {
      score += weights.visitorBonus;
      reasons.push('👥 Visiteur potentiel');
    } else if (user1.type === 'partner' && user2.type === 'exhibitor') {
      score += weights.exhibitorPriority;
      reasons.push('🏭 Exposant dans votre secteur');
    }

    // Same type connections get a smaller bonus
    if (user1.type === user2.type) {
      score += weights.baseConnectionScore * 0.5;
      reasons.push(`👔 Professionnel ${user2.type === 'exhibitor' ? 'exposant' : user2.type === 'partner' ? 'partenaire' : 'visiteur'}`);
    }

    // Add company-based bonus if available
    if (p1.company && p2.company) {
      score += 10;
      reasons.push(`💼 ${p2.company}`);
    }

    // Add sector-based bonus if businessSector matches
    if (p1.businessSector && p2.businessSector) {
      if (p1.businessSector.toLowerCase() === p2.businessSector.toLowerCase()) {
        score += 15;
        reasons.push(`🎯 Même secteur: ${p2.businessSector}`);
      }
    }

    // 2. Shared Interests
    const sharedInterests = getIntersection(p1Interests, p2Interests);
    if (sharedInterests.length > 0) {
      score += sharedInterests.length * weights.sharedInterests;
      reasons.push(`Partage l'intérêt pour : ${sharedInterests.join(', ')}`);
    }

    // 3. Shared Business Sectors
    const sharedSectors = getIntersection(p1Sectors, p2Sectors);
    if (sharedSectors.length > 0) {
      score += sharedSectors.length * weights.sharedSectors;
      reasons.push(`Opère dans le même secteur : ${sharedSectors.join(', ')}`);
    }

    // 4. Complementary Objectives
    p1Objectives.forEach((obj1: string) => {
      const complements = complementaryObjectives[obj1] || [];
      const matchingObjectives = getIntersection(complements, p2Objectives);
      if (matchingObjectives.length > 0) {
        score += matchingObjectives.length * weights.complementaryObjectives;
        reasons.push(`Objectifs complémentaires (e.g., "${obj1}" et "${matchingObjectives[0]}")`);
      }
    });

    // 5. Same Country
    if (p1.country && p2.country && p1.country.toLowerCase() === p2.country.toLowerCase()) {
      score += weights.sameCountry;
      reasons.push(`Basé(e) dans le même pays : ${p1.country}`);
    }

    // 6. Shared Collaboration Types
    const sharedCollaboration = getIntersection(p1CollabTypes, p2CollabTypes);
    if (sharedCollaboration.length > 0) {
        score += sharedCollaboration.length * weights.sharedCollaborationTypes;
        reasons.push(`Recherche des collaborations similaires : ${sharedCollaboration.join(', ')}`);
    }

    // 7. Keyword match in bio
    if (p1.bio && p2.bio) {
        const p1Keywords = new Set(p1.bio.toLowerCase().split(' '));
        const p2Keywords = p2.bio.toLowerCase().split(' ');
        const commonKeywords = p2Keywords.filter(kw => p1Keywords.has(kw) && kw.length > 3);
        if (commonKeywords.length > 0) {
            score += weights.keywordInBio;
            reasons.push(`Mentionne des mots-clés communs dans sa biographie.`);
        }
    }

    // 8. Same company size
    if (p1.companySize && p2.companySize && p1.companySize === p2.companySize) {
        score += weights.sameCompanySize;
        reasons.push(`Travaille dans une entreprise de taille similaire.`);
    }

    // 9. Availability bonus - Check real availability from time slots
    // Note: This would require fetching time slots from the database
    // For now, we'll use a heuristic based on user type
    if (user2.type === 'exhibitor' || user2.type === 'partner') {
      score += weights.availabilityBonus;
      reasons.push('Disponible pour des rencontres B2B');
    }

    // 10. Recent activity bonus
    // Users who have been active recently are more likely to respond
    if (user2.profile.lastActive) {
      const lastActiveDate = new Date(user2.profile.lastActive);
      const daysSinceActive = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActive < 7) {
        score += 10;
        reasons.push('Actif récemment sur la plateforme');
      }
    }

    // 11. Profile completeness bonus
    // Users with complete profiles are more serious about networking
    const profileCompleteness = this.calculateProfileCompleteness(user2);
    if (profileCompleteness > 0.8) {
      score += 10;
      reasons.push('Profil complet et détaillé');
    }

    return { score, reasons };
  }

  /**
   * Calculates the completeness of a user profile (0-1 scale)
   */
  private static calculateProfileCompleteness(user: User): number {
    const profile = user.profile;
    let completeness = 0;
    let totalFields = 0;

    // Check essential fields
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.company,
      profile.position,
      profile.bio,
      profile.country,
      profile.avatar,
      profile.interests?.length > 0,
      profile.sectors?.length > 0,
      profile.objectives?.length > 0,
    ];

    fields.forEach(field => {
      totalFields++;
      if (field) completeness++;
    });

    return completeness / totalFields;
  }
}

export default RecommendationService;
