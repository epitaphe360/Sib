import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/badge_info.dart';
import '../models/scan_result.dart';

class ScannerService {
  static final _client = Supabase.instance.client;

  /// Extrait le badge_code depuis le QR brut (plain string, JSON ou JWT)
  static String _extractBadgeCode(String rawQr) {
    try {
      final parsed = jsonDecode(rawQr) as Map<String, dynamic>;
      return (parsed['badge_code'] ??
              parsed['code'] ??
              parsed['token'] ??
              parsed['qr_data'] ??
              rawQr)
          .toString();
    } catch (_) {
      return rawQr;
    }
  }

  /// Vérifie l'accès à une zone et enregistre le scan dans badge_scans
  static Future<ScanResult> checkZoneAccess({
    required String rawQr,
    required String zoneId,
    required String zoneName,
  }) async {
    final badgeCode = _extractBadgeCode(rawQr);
    final scannedBy = _client.auth.currentUser!.id;
    final now = DateTime.now();

    // ── 1. Récupérer le badge ──────────────────────────────────────────────
    final badgeData = await _client
        .from('user_badges')
        .select(
          'user_id, badge_code, full_name, company_name, avatar_url, '
          'access_level, status, valid_until, user_type, stand_number',
        )
        .eq('badge_code', badgeCode)
        .maybeSingle();

    if (badgeData == null) {
      await _logScan(
        badgeCode: badgeCode,
        zoneId: zoneId,
        scannedBy: scannedBy,
        result: 'denied',
        reason: 'Badge inconnu',
        visitor: null,
        now: now,
      );
      return ScanResult(
        authorized: false,
        denialReason: 'Badge inconnu ou non enregistré',
        zoneId: zoneId,
        zoneName: zoneName,
      );
    }

    final badge = BadgeInfo.fromJson(badgeData as Map<String, dynamic>);

    // ── 2. Vérifier la validité du badge ───────────────────────────────────
    if (badge.status == 'revoked') {
      await _logScan(
        badgeCode: badgeCode,
        zoneId: zoneId,
        scannedBy: scannedBy,
        result: 'denied',
        reason: 'Badge révoqué',
        visitor: badge,
        now: now,
      );
      return ScanResult(
        authorized: false,
        denialReason: 'Badge révoqué',
        person: badge,
        zoneId: zoneId,
        zoneName: zoneName,
      );
    }

    if (badge.isExpired) {
      await _logScan(
        badgeCode: badgeCode,
        zoneId: zoneId,
        scannedBy: scannedBy,
        result: 'denied',
        reason: 'Badge expiré',
        visitor: badge,
        now: now,
      );
      return ScanResult(
        authorized: false,
        denialReason: 'Badge expiré — renouvellement requis',
        person: badge,
        zoneId: zoneId,
        zoneName: zoneName,
      );
    }

    // ── 3. Règle d'accès par zone ──────────────────────────────────────────
    // Zone publique → accès libre pour tout le monde
    if (zoneId == 'public') {
      await _logScan(
        badgeCode: badgeCode,
        zoneId: zoneId,
        scannedBy: scannedBy,
        result: 'granted',
        reason: null,
        visitor: badge,
        now: now,
      );
      return ScanResult(
        authorized: true,
        person: badge,
        zoneId: zoneId,
        zoneName: zoneName,
      );
    }

    // Visiteur standard → refusé pour toutes les zones spécifiques
    if (badge.accessLevel == 'standard') {
      await _logScan(
        badgeCode: badgeCode,
        zoneId: zoneId,
        scannedBy: scannedBy,
        result: 'denied',
        reason: 'Niveau standard insuffisant',
        visitor: badge,
        now: now,
      );
      return ScanResult(
        authorized: false,
        denialReason:
            'Accès réservé aux visiteurs VIP, exposants et partenaires',
        person: badge,
        zoneId: zoneId,
        zoneName: zoneName,
      );
    }

    // ── 4. Accès accordé ───────────────────────────────────────────────────
    await _logScan(
      badgeCode: badgeCode,
      zoneId: zoneId,
      scannedBy: scannedBy,
      result: 'granted',
      reason: null,
      visitor: badge,
      now: now,
    );
    return ScanResult(
      authorized: true,
      person: badge,
      zoneId: zoneId,
      zoneName: zoneName,
    );
  }

  // ── Enregistrement dans badge_scans ────────────────────────────────────────
  static Future<void> _logScan({
    required String badgeCode,
    required String zoneId,
    required String scannedBy,
    required String result,
    required String? reason,
    required BadgeInfo? visitor,
    required DateTime now,
  }) async {
    try {
      await _client.from('badge_scans').insert({
        'id': 'zscan_${now.millisecondsSinceEpoch}_${badgeCode.hashCode.abs()}',
        'visitor_id': visitor?.userId,
        'scanned_by': scannedBy,
        'scanned_at': now.toUtc().toIso8601String(),
        'location': zoneId,
        'badge_type': _toBadgeType(visitor?.accessLevel),
        'scan_type': 'zone_entry',
        'zone_id': zoneId,
        'access_result': result,
        'denial_reason': reason,
        'visitor_name': visitor?.fullName,
        'visitor_company': visitor?.companyName,
      });
    } catch (_) {
      // Ne jamais bloquer l'UI si le log échoue
    }
  }

  static String _toBadgeType(String? accessLevel) {
    switch (accessLevel) {
      case 'vip':
        return 'vip';
      case 'exhibitor':
        return 'exhibitor';
      case 'partner':
        return 'partner';
      default:
        return 'visitor';
    }
  }
}
