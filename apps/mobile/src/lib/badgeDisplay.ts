export function badgeLevelLabel(level?: string): string {
  switch (level) {
    case 'visitor_premium':
    case 'vip':
    case 'premium':
      return 'VIP';
    case 'visitor_free':
    case 'free':
      return 'Gratuit';
    case 'exhibitor':
      return 'Exposant';
    case 'partner':
      return 'Partenaire';
    case 'admin':
      return 'Administrateur';
    case 'security':
      return 'Contrôleur';
    case 'standard':
      return 'STANDARD';
    default:
      return level?.toUpperCase() ?? 'STANDARD';
  }
}

export function badgeAccessColor(level?: string): string {
  switch (level) {
    case 'admin':
      return '#F44336';
    case 'security':
      return '#FF9800';
    case 'exhibitor':
      return '#4CAF50';
    case 'visitor_premium':
    case 'vip':
    case 'premium':
    case 'partner_gold':
      return '#FFD700';
    case 'partner_museum':
      return '#3F51B5';
    case 'partner_silver':
      return '#9E9E9E';
    case 'partner':
      return '#0D5C3E';
    default:
      return '#3ECF8E';
  }
}
