import 'badge_info.dart';

class ScanResult {
  final bool authorized;
  final String? denialReason;
  final BadgeInfo? person;
  final String zoneId;
  final String zoneName;

  const ScanResult({
    required this.authorized,
    this.denialReason,
    this.person,
    required this.zoneId,
    required this.zoneName,
  });
}
