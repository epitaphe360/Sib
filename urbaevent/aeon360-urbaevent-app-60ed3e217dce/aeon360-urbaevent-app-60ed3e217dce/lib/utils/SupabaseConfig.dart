import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Configuration Supabase pour l'app SIB 2026
/// Les clés sont chargées depuis assets/.env (non commité dans git)
class SupabaseConfig {
  // ──────────────────────────────────────────────────────────────────
  // Supabase project credentials — lues depuis .env
  // ──────────────────────────────────────────────────────────────────
  static String get supabaseUrl =>
      dotenv.env['SUPABASE_URL'] ?? 'https://sbyizudifmqakzxjlndr.supabase.co';
  static String get supabaseAnonKey =>
      dotenv.env['SUPABASE_ANON_KEY'] ?? '';

  // ──────────────────────────────────────────────────────────────────
  // Noms des tables Supabase (équivalent endpoints Strapi)
  // ──────────────────────────────────────────────────────────────────

  // Auth → utiliser supabase.auth directement (pas de nom de table)

  // Salons (liste des événements multi-tenant)
  static const String tableSalons = 'salons';

  // Utilisateurs
  static const String tableUsers = 'users';

  // Exposants
  static const String tableExhibitors = 'exhibitors';

  // Partenaires
  static const String tablePartners = 'partners';

  // Intervenants
  static const String tableSpeakers = 'speakers';

  // Sessions / conférences du programme
  static const String tableSessions = 'programme_sessions';

  // Inscriptions
  static const String tableRegistrations = 'event_registrations';

  // Contacts scannés (utilisé par les agents / badges)
  static const String tableContacts = 'connections';

  // Notifications push
  static const String tablePushTokens = 'push_subscriptions';

  // Notifications in-app
  static const String tableNotifications = 'notifications';

  // Secteurs d'activité
  static const String tableBusinessSectors = 'business_sectors';

  // Portes (contrôle d'accès agents)
  static const String tableGates = 'gates';

  // Données Apple Sign-in
  static const String tableAppleSocialData = 'apple_social_data';

  // Bucket Storage pour les avatars / médias
  static const String storageAvatarsBucket = 'avatars';
  static const String storageMediaBucket = 'media';

  // ──────────────────────────────────────────────────────────────────
  // Realtime channels
  // ──────────────────────────────────────────────────────────────────
  static const String realtimeRegistrations = 'registrations-channel';
  static const String realtimeNotifications = 'notifications-channel';
}
