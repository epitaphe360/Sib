import 'package:flutter/material.dart';
import 'package:com.urbaevent/services/SupabaseService.dart';
import 'ThemeColor.dart';

/// Branding dynamique chargé depuis la table `salons` (salon par défaut).
/// Appelé une fois au démarrage dans main().
class SalonBranding {
  static String salonName = 'UrbaEvent';
  static String? logoUrl;
  static String? coverUrl;
  static String? location;

  /// Charge le salon par défaut et applique son branding.
  static Future<void> load() async {
    try {
      final salons = await SupabaseService.instance.getSalons();
      if (salons == null || salons.isEmpty) return;

      // Chercher le salon par défaut, sinon prendre le premier actif
      final defaultSalon = salons.firstWhere(
        (s) => s['is_default'] == true,
        orElse: () => salons.first,
      );

      salonName = defaultSalon['name'] as String? ?? 'UrbaEvent';
      logoUrl   = defaultSalon['logo_url'] as String?;
      coverUrl  = defaultSalon['cover_url'] as String?;
      location  = defaultSalon['location'] as String?;

      // Couleur primaire depuis config JSON
      final config = defaultSalon['config'] as Map<String, dynamic>? ?? {};
      final primaryHex = config['primary_color'] as String?;
      if (primaryHex != null && primaryHex.isNotEmpty) {
        final color = _hexToColor(primaryHex);
        if (color != null) {
          ThemeColor.colorAccent = color;
        }
      }
    } catch (_) {
      // Silencieux — le branding par défaut reste inchangé
    }
  }

  /// Parse une chaîne hex (#RRGGBB ou #AARRGGBB) en Color Flutter.
  static Color? _hexToColor(String hex) {
    try {
      final clean = hex.replaceAll('#', '');
      if (clean.length == 6) {
        return Color(int.parse('FF$clean', radix: 16));
      } else if (clean.length == 8) {
        return Color(int.parse(clean, radix: 16));
      }
    } catch (_) {}
    return null;
  }
}
