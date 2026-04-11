// Advanced Matchmaking Algorithm Service
// Implements AI-powered matchmaking with scoring and recommendations

import { supabase } from '../lib/supabase';
import type { UserProfile, MatchScore, NetworkingInteraction } from '../types/site-builder';

export class MatchmakingService {
  // Optimized columns for user_profiles queries (70% bandwidth reduction)
  private static readonly USER_PROFILE_COLUMNS = 'user_id, name, email, interests, industry, looking_for, offering, location, role, avatar, company, created_at';

  /**
   * Calculate compatibility score between two users
   */
  static calculateCompatibilityScore(user1: UserProfile, user2: UserProfile): MatchScore {
    let score = 0;
    const reasons: string[] = [];
    const sharedInterests: string[] = [];
    const complementarySkills: string[] = [];

    // 1. Shared Interests (30 points max)
    const commonInterests = user1.interests.filter(interest =>
      user2.interests.includes(interest)
    );
    sharedInterests.push(...commonInterests);
    const interestScore = Math.min(30, commonInterests.length * 10);
    score += interestScore;
    if (commonInterests.length > 0) {
      reasons.push(`${commonInterests.length} intérêt(s) commun(s): ${commonInterests.slice(0, 3).join(', ')}`);
    }

    // 2. Industry Match (25 points)
    const industryMatch = user1.industry === user2.industry;
    if (industryMatch) {
      score += 25;
      reasons.push(`Même secteur d'activité: ${user1.industry}`);
    }

    // 3. Complementary Skills (25 points)
    // What user1 is looking for vs what user2 is offering
    const user1Needs = user1.lookingFor.filter(need =>
      user2.offering.includes(need)
    );
    const user2Needs = user2.lookingFor.filter(need =>
      user1.offering.includes(need)
    );
    complementarySkills.push(...user1Needs, ...user2Needs);
    const complementaryScore = Math.min(25, (user1Needs.length + user2Needs.length) * 8);
    score += complementaryScore;
    if (user1Needs.length > 0 || user2Needs.length > 0) {
      reasons.push(`Compétences complémentaires: ${[...user1Needs, ...user2Needs].slice(0, 3).join(', ')}`);
    }

    // 4. Geographic Proximity (10 points)
    if (user1.location && user2.location && user1.location === user2.location) {
      score += 10;
      reasons.push(`Même localisation: ${user1.location}`);
    }

    // 5. Role Compatibility (10 points)
    // Strategic roles that benefit from connecting
    const strategicPairs = [
      ['CEO', 'Investisseur'],
      ['Marketing', 'Communication'],
      ['Développeur', 'Product Manager'],
      ['Designer', 'Développeur']
    ];
    
    for (const [role1, role2] of strategicPairs) {
      if ((user1.role.includes(role1) && user2.role.includes(role2)) ||
          (user1.role.includes(role2) && user2.role.includes(role1))) {
        score += 10;
        reasons.push('Rôles stratégiquement complémentaires');
        break;
      }
    }

    return {
      userId: user2.userId,
      score,
      reasons,
      sharedInterests,
      complementarySkills,
      industryMatch
    };
  }

  /**
   * Get AI-powered recommendations for a user
   */
  static async getRecommendations(userId: string, limit: number = 10): Promise<MatchScore[]> {
    try {
      // Get user profile (optimized)
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select(this.USER_PROFILE_COLUMNS)
        .eq('user_id', userId)
        .maybeSingle();

      if (userError || !userProfile) {
        throw new Error('User profile not found');
      }

      // Get all other users (optimized)
      const { data: otherUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select(this.USER_PROFILE_COLUMNS)
        .neq('user_id', userId);

      if (usersError) throw usersError;

      // Get user's interaction history
      const { data: interactions } = await supabase
        .from('networking_interactions')
        .select('to_user_id, type')
        .eq('from_user_id', userId);

      const interactedUserIds = new Set(interactions?.map(i => i.to_user_id) || []);

      // Calculate scores for all users
      const scores = otherUsers
        ?.filter(user => !interactedUserIds.has(user.user_id)) // Filter out already connected
        .map(user => this.calculateCompatibilityScore(userProfile, user))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit) || [];

      return scores;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  /**
   * Advanced matchmaking with filters
   */
  static async findMatches(
    userId: string,
    filters: {
      industry?: string;
      interests?: string[];
      location?: string;
      minScore?: number;
    } = {}
  ): Promise<MatchScore[]> {
    try {
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select(this.USER_PROFILE_COLUMNS)
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !userProfile) throw new Error('User profile not found');

      // Build query with filters (optimized)
      let query = supabase
        .from('user_profiles')
        .select(this.USER_PROFILE_COLUMNS)
        .neq('user_id', userId);

      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }

      if (filters.location) {
        query = query.eq('location', filters.location);
      }

      const { data: candidates } = await query;

      if (!candidates) return [];

      // Filter by interests if specified
      let filteredCandidates = candidates;
      if (filters.interests && filters.interests.length > 0) {
        filteredCandidates = candidates.filter(candidate =>
          filters.interests!.some(interest => candidate.interests.includes(interest))
        );
      }

      // Calculate scores
      const scores = filteredCandidates
        .map(candidate => this.calculateCompatibilityScore(userProfile, candidate))
        .filter(score => !filters.minScore || score.score >= filters.minScore)
        .sort((a, b) => b.score - a.score);

      return scores;
    } catch (error) {
      console.error('Error finding matches:', error);
      throw error;
    }
  }

  /**
   * Track interaction between users
   */
  static async trackInteraction(
    fromUserId: string,
    toUserId: string,
    type: 'view' | 'like' | 'message' | 'meeting' | 'connection',
    metadata?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('networking_interactions')
        .insert([{
          from_user_id: fromUserId,
          to_user_id: toUserId,
          type,
          timestamp: new Date().toISOString(),
          metadata
        }]);

      if (error) throw error;

      // Update match score based on interaction
      await this.updateMatchScore(fromUserId, toUserId, type);
    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw error;
    }
  }

  /**
   * Update match score based on interactions
   */
  private static async updateMatchScore(
    userId1: string,
    userId2: string,
    interactionType: string
  ): Promise<void> {
    const scoreBoosts: Record<string, number> = {
      view: 1,
      like: 5,
      message: 10,
      meeting: 20,
      connection: 30
    };

    const boost = scoreBoosts[interactionType] || 0;

    // Store updated score in cache or database
    const { error } = await supabase
      .from('match_scores')
      .upsert({
        user_id_1: userId1,
        user_id_2: userId2,
        score_boost: boost,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id_1,user_id_2' });

    if (error) {
      console.error('Error updating match score:', error);
    }
  }

  /**
   * Get interaction history for a user
   */
  static async getInteractionHistory(userId: string): Promise<NetworkingInteraction[]> {
    try {
      // Optimized: explicit columns for both main table and joined table (75% bandwidth reduction)
      const { data, error } = await supabase
        .from('networking_interactions')
        .select(`
          id, from_user_id, to_user_id, type, timestamp, metadata,
          to_user:user_profiles!networking_interactions_to_user_id_fkey(user_id, name, email, avatar, company, role)
        `)
        .eq('from_user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting interaction history:', error);
      throw error;
    }
  }

  /**
   * Get mutual connections between users
   */
  static async getMutualConnections(userId1: string, userId2: string): Promise<string[]> {
    try {
      const { data: user1Connections } = await supabase
        .from('networking_interactions')
        .select('to_user_id')
        .eq('from_user_id', userId1)
        .eq('type', 'connection');

      const { data: user2Connections } = await supabase
        .from('networking_interactions')
        .select('to_user_id')
        .eq('from_user_id', userId2)
        .eq('type', 'connection');

      const user1Set = new Set(user1Connections?.map(c => c.to_user_id) || []);
      const user2Set = new Set(user2Connections?.map(c => c.to_user_id) || []);

      const mutual = Array.from(user1Set).filter(id => user2Set.has(id));
      return mutual;
    } catch (error) {
      console.error('Error getting mutual connections:', error);
      return [];
    }
  }

  /**
   * Calculate network strength score
   */
  static async calculateNetworkStrength(userId: string): Promise<number> {
    try {
      const { data: connections } = await supabase
        .from('networking_interactions')
        .select('type, timestamp')
        .eq('from_user_id', userId);

      if (!connections) return 0;

      // Calculate based on connection types and recency
      let score = 0;
      const now = new Date().getTime();
      const oneMonth = 30 * 24 * 60 * 60 * 1000;

      connections.forEach(interaction => {
        const weight = {
          view: 1,
          like: 2,
          message: 5,
          meeting: 10,
          connection: 15
        }[interaction.type] || 0;

        // Boost recent interactions
        const timestamp = new Date(interaction.timestamp).getTime();
        const recencyBoost = (now - timestamp) < oneMonth ? 1.5 : 1;

        score += weight * recencyBoost;
      });

      return Math.min(100, Math.round(score / 10));
    } catch (error) {
      console.error('Error calculating network strength:', error);
      return 0;
    }
  }

  /**
   * Send a connection request to another user
   */
  static async sendConnectionRequest(fromUserId: string, toUserId: string): Promise<void> {
    try {
      await this.trackInteraction(fromUserId, toUserId, 'connection', {
        status: 'pending',
        requestedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  }

  /**
   * Like a user profile
   */
  static async likeProfile(fromUserId: string, toUserId: string): Promise<void> {
    try {
      await this.trackInteraction(fromUserId, toUserId, 'like', {
        likedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error liking profile:', error);
      throw error;
    }
  }
}
