/// Configuration Supabase pour l'app UrbaEvent / SIB
/// Remplace les constantes Strapi de Urls.dart
class SupabaseConfig {
  // ──────────────────────────────────────────────────────────────────
  // Supabase project credentials
  // Valeurs à remplacer depuis le Dashboard Supabase > Settings > API
  // ──────────────────────────────────────────────────────────────────
  static const String supabaseUrl = 'https://sbyizudifmqakzxjlndr.supabase.co';
  static const String supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNieWl6dWRpZm1xYWt6eGpsbmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MTg3MDEsImV4cCI6MjA5MTQ5NDcwMX0.yyD0fROU_oSkfgkiRbWXwyoZm3YthCCQSj7pM7HHSVg';

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

  // Bucket Storage pour les avatars / médias
  static const String storageAvatarsBucket = 'avatars';
  static const String storageMediaBucket = 'media';

  // ──────────────────────────────────────────────────────────────────
  // Realtime channels
  // ──────────────────────────────────────────────────────────────────
  static const String realtimeRegistrations = 'registrations-channel';
  static const String realtimeNotifications = 'notifications-channel';
}
