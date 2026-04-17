import { User, UserProfile } from '../types';

const COMPLEMENTARY_OBJECTIVES: Record<string, string[]> = {
  'Trouver de nouveaux partenaires': ['Développer mon réseau', 'Présenter mes innovations'],
  'Développer mon réseau': ['Trouver de nouveaux partenaires', 'Rencontrer des investisseurs'],
  'Présenter mes innovations': ['Découvrir les innovations BTP', 'Identifier des fournisseurs'],
  'Identifier des fournisseurs': ['Présenter mes innovations', 'Explorer de nouveaux marchés'],
  'Explorer de nouveaux marchés': ['Trouver de nouveaux partenaires'],
  'Rencontrer des investisseurs': ['Présenter mes innovations'],
  'Découvrir les innovations BTP': ['Présenter mes innovations'],
};

const SCORE_WEIGHTS = {
  baseConnection: 18,
  crossTypePriority: 28,
  sameTypeBonus: 8,
  sharedInterests: 10,
  sharedSectors: 12,
  complementaryObjectives: 14,
  sharedCollaborationTypes: 10,
  sameCountry: 6,
  sameBusinessSector: 8,
  profileCompletenessBoost: 8,
  activityRecencyBoost: 6,
};

const safeArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
};

const intersection = (a: string[], b: string[]): string[] => {
  const set = new Set(a.map((v) => v.toLowerCase()));
  return b.filter((v) => set.has(v.toLowerCase()));
};

const normalizeProfile = (profile: Partial<UserProfile> | undefined): UserProfile => ({
  interests: safeArray(profile?.interests),
  sectors: safeArray(profile?.sectors),
  objectives: safeArray(profile?.objectives),
  collaborationTypes: safeArray(profile?.collaborationTypes),
  country: profile?.country || '',
  bio: profile?.bio || '',
  companySize: profile?.companySize || '',
  company: profile?.company || '',
  businessSector: profile?.businessSector || '',
  firstName: profile?.firstName || '',
  lastName: profile?.lastName || '',
  position: profile?.position || '',
  avatar: profile?.avatar || '',
  lastActive: profile?.lastActive || null,
  ...profile,
});

export interface ProfessionalMatchResult {
  score: number;
  reasons: string[];
}

export interface MatchingCriterion {
  label: string;
  completed: boolean;
}

export function getMatchingCriteriaChecklist(user: User): MatchingCriterion[] {
  const profile = normalizeProfile(user.profile);

  return [
    { label: 'Prénom', completed: Boolean(profile.firstName) },
    { label: 'Nom', completed: Boolean(profile.lastName) },
    { label: 'Entreprise', completed: Boolean(profile.company) },
    { label: 'Poste', completed: Boolean(profile.position) },
    { label: 'Bio (20+ caractères)', completed: typeof profile.bio === 'string' && profile.bio.trim().length > 20 },
    { label: 'Pays', completed: Boolean(profile.country) },
    { label: 'Avatar', completed: Boolean(profile.avatar) },
    { label: 'Secteurs', completed: profile.sectors.length > 0 },
    { label: 'Intérêts', completed: profile.interests.length > 0 },
    { label: 'Objectifs', completed: profile.objectives.length > 0 },
    { label: 'Types de collaboration', completed: profile.collaborationTypes.length > 0 },
  ];
}

export function calculateProfileCompleteness(user: User): number {
  const checklist = getMatchingCriteriaChecklist(user);
  const filled = checklist.filter((criterion) => criterion.completed).length;
  return Math.round((filled / checklist.length) * 100);
}

export function calculateNetworkingHealthScore(input: {
  profileCompleteness: number;
  connectionsCount: number;
  recommendationsCount?: number;
  averageRecommendationScore?: number;
}): number {
  const profilePart = Math.min(40, Math.round((input.profileCompleteness / 100) * 40));
  const connectionsPart = Math.min(35, input.connectionsCount * 3);
  const recommendationsPart = Math.min(15, (input.recommendationsCount || 0) * 1.5);
  const qualityPart = Math.min(10, Math.round((input.averageRecommendationScore || 0) / 10));

  return Math.min(100, profilePart + connectionsPart + recommendationsPart + qualityPart);
}

export function calculateEngagementScore(input: {
  connectionsCount: number;
  favoritesCount: number;
  pendingCount: number;
}): number {
  const base = input.connectionsCount * 6 + input.favoritesCount * 2 + input.pendingCount * 3;
  return Math.min(100, base);
}

export function calculateProfessionalMatch(currentUser: User, candidateUser: User): ProfessionalMatchResult {
  const p1 = normalizeProfile(currentUser.profile);
  const p2 = normalizeProfile(candidateUser.profile);
  const reasons: string[] = [];
  let score = SCORE_WEIGHTS.baseConnection;

  // Priorize cross-role networking while still allowing same-role opportunities.
  if (currentUser.type !== candidateUser.type) {
    score += SCORE_WEIGHTS.crossTypePriority;
    reasons.push('Type de profil complémentaire pour le networking');
  } else {
    score += SCORE_WEIGHTS.sameTypeBonus;
    reasons.push('Profil du même écosystème métier');
  }

  const sharedInterests = intersection(p1.interests, p2.interests);
  if (sharedInterests.length > 0) {
    score += Math.min(SCORE_WEIGHTS.sharedInterests, sharedInterests.length * 4);
    reasons.push(`Intérêts communs: ${sharedInterests.slice(0, 3).join(', ')}`);
  }

  const sharedSectors = intersection(p1.sectors, p2.sectors);
  if (sharedSectors.length > 0) {
    score += Math.min(SCORE_WEIGHTS.sharedSectors, sharedSectors.length * 5);
    reasons.push(`Secteurs communs: ${sharedSectors.slice(0, 2).join(', ')}`);
  }

  for (const objective of p1.objectives) {
    const complements = COMPLEMENTARY_OBJECTIVES[objective] || [];
    const matches = intersection(complements, p2.objectives);
    if (matches.length > 0) {
      score += Math.min(SCORE_WEIGHTS.complementaryObjectives, matches.length * 7);
      reasons.push(`Objectifs complémentaires: ${objective} ↔ ${matches[0]}`);
      break;
    }
  }

  const sharedCollab = intersection(p1.collaborationTypes, p2.collaborationTypes);
  if (sharedCollab.length > 0) {
    score += Math.min(SCORE_WEIGHTS.sharedCollaborationTypes, sharedCollab.length * 4);
    reasons.push(`Collaboration alignée: ${sharedCollab.slice(0, 2).join(', ')}`);
  }

  if (p1.country && p2.country && p1.country.toLowerCase() === p2.country.toLowerCase()) {
    score += SCORE_WEIGHTS.sameCountry;
    reasons.push(`Même zone géographique: ${p1.country}`);
  }

  if (
    p1.businessSector &&
    p2.businessSector &&
    p1.businessSector.toLowerCase() === p2.businessSector.toLowerCase()
  ) {
    score += SCORE_WEIGHTS.sameBusinessSector;
    reasons.push(`Même secteur prioritaire: ${p2.businessSector}`);
  }

  const completeness = calculateProfileCompleteness(candidateUser);
  if (completeness >= 75) {
    score += SCORE_WEIGHTS.profileCompletenessBoost;
    reasons.push('Profil complet et exploitable');
  }

  if (p2.lastActive) {
    const daysSinceLastActive = Math.floor((Date.now() - new Date(p2.lastActive).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastActive <= 7) {
      score += SCORE_WEIGHTS.activityRecencyBoost;
      reasons.push('Utilisateur actif récemment');
    }
  }

  if (reasons.length === 0) {
    reasons.push('Pertinence métier générale pour le salon');
  }

  return {
    score: Math.min(100, Math.round(score)),
    reasons: reasons.slice(0, 4),
  };
}
