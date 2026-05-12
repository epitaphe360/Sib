class BadgeInfo {
  final String userId;
  final String badgeCode;
  final String fullName;
  final String? companyName;
  final String? avatarUrl;
  final String accessLevel; // standard | vip | exhibitor | partner | admin
  final String status;      // active | expired | revoked | pending
  final DateTime? validUntil;
  final String userType;    // visitor | exhibitor | partner | admin
  final String? standNumber;

  const BadgeInfo({
    required this.userId,
    required this.badgeCode,
    required this.fullName,
    this.companyName,
    this.avatarUrl,
    required this.accessLevel,
    required this.status,
    this.validUntil,
    required this.userType,
    this.standNumber,
  });

  bool get isExpired =>
      validUntil != null && validUntil!.isBefore(DateTime.now());

  bool get isActive => status == 'active' && !isExpired;

  String get accessLevelLabel {
    switch (accessLevel) {
      case 'admin':
        return 'Admin';
      case 'partner':
        return 'Partenaire';
      case 'exhibitor':
        return 'Exposant';
      case 'vip':
        return 'Visiteur VIP';
      default:
        return 'Visiteur Standard';
    }
  }

  factory BadgeInfo.fromJson(Map<String, dynamic> json) => BadgeInfo(
        userId: json['user_id'] as String,
        badgeCode: json['badge_code'] as String,
        fullName: json['full_name'] as String,
        companyName: json['company_name'] as String?,
        avatarUrl: json['avatar_url'] as String?,
        accessLevel: json['access_level'] as String? ?? 'standard',
        status: json['status'] as String? ?? 'active',
        validUntil: json['valid_until'] != null
            ? DateTime.tryParse(json['valid_until'] as String)
            : null,
        userType: json['user_type'] as String? ?? 'visitor',
        standNumber: json['stand_number'] as String?,
      );
}
