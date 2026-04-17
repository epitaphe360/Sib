import { User, NetworkingRecommendation, UserProfile } from '../types';
import { calculateProfessionalMatch } from './networkingScoring';

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

      const { score, reasons } = calculateProfessionalMatch(
        currentUserWithDefaults as User,
        matchWithDefaults as User
      );

      // REDUCED threshold - accept all matches with positive score
      // Users with rich profiles get higher scores but all users can be recommended
      const threshold = 15;

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
}

export default RecommendationService;
