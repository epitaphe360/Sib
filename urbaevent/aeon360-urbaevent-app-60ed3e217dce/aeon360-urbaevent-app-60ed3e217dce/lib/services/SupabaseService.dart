import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:com.urbaevent/utils/SupabaseConfig.dart';

/// Service centralisé Supabase — remplace tous les appels HTTP Strapi.
///
/// Utilisation :
///   final svc = SupabaseService.instance;
///   final user = await svc.signIn(email, password);
class SupabaseService {
  // ── Singleton ──────────────────────────────────────────────────────
  SupabaseService._();
  static final SupabaseService instance = SupabaseService._();

  SupabaseClient get _client => Supabase.instance.client;

  /// Expose le client Supabase pour les cas avancés
  SupabaseClient get supabaseClient => Supabase.instance.client;

  // ──────────────────────────────────────────────────────────────────
  // AUTH
  // ──────────────────────────────────────────────────────────────────

  /// Connexion email/mot de passe (remplace POST /auth/local)
  Future<AuthResponse> signIn(String email, String password) async {
    return await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  /// Inscription (remplace POST /auth/local/register)
  Future<AuthResponse> signUp({
    required String email,
    required String password,
    required String name,
    String lang = 'fr',
  }) async {
    final res = await _client.auth.signUp(
      email: email,
      password: password,
      data: {'name': name, 'lang': lang},
    );
    // Créer le profil dans la table users
    if (res.user != null) {
      await _client.from(SupabaseConfig.tableUsers).upsert({
        'id': res.user!.id,
        'email': email,
        'name': name,
        'type': 'visitor',
        'role': 'visitor',
        'status': 'active',
      });
    }
    return res;
  }

  /// Déconnexion
  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  /// Mot de passe oublié (remplace POST /auth/forgot-password)
  Future<void> resetPassword(String email) async {
    await _client.auth.resetPasswordForEmail(email);
  }

  /// Connexion Google via Firebase OAuth token
  Future<AuthResponse> signInWithGoogle(String idToken) async {
    return await _client.auth.signInWithIdToken(
      provider: OAuthProvider.google,
      idToken: idToken,
    );
  }

  /// Utilisateur actuellement connecté
  User? get currentUser => _client.auth.currentUser;

  /// Session courante
  Session? get currentSession => _client.auth.currentSession;

  // ──────────────────────────────────────────────────────────────────
  // PROFIL UTILISATEUR
  // ──────────────────────────────────────────────────────────────────

  /// Lire le profil complet d'un utilisateur (remplace GET /users/me)
  Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    final res = await _client
        .from(SupabaseConfig.tableUsers)
        .select()
        .eq('id', userId)
        .maybeSingle();
    return res;
  }

  /// Mettre à jour le profil (remplace PUT /users/:id)
  Future<void> updateUserProfile(
      String userId, Map<String, dynamic> data) async {
    await _client
        .from(SupabaseConfig.tableUsers)
        .update(data)
        .eq('id', userId);
  }

  // ──────────────────────────────────────────────────────────────────
  // SALONS (multi-tenant)
  // ──────────────────────────────────────────────────────────────────

  /// Liste tous les salons actifs (remplace GET /events)
  Future<List<Map<String, dynamic>>> getSalons() async {
    final res = await _client
        .from(SupabaseConfig.tableSalons)
        .select()
        .eq('is_active', true)
        .order('sort_order', ascending: true);
    return List<Map<String, dynamic>>.from(res);
  }

  /// Liste TOUS les salons (actifs + inactifs) pour la page d'accueil
  Future<List<Map<String, dynamic>>> getSalonsAll() async {
    final res = await _client
        .from(SupabaseConfig.tableSalons)
        .select()
        .order('sort_order', ascending: true);
    return List<Map<String, dynamic>>.from(res);
  }

  /// Détail d'un salon par slug
  Future<Map<String, dynamic>?> getSalonBySlug(String slug) async {
    final res = await _client
        .from(SupabaseConfig.tableSalons)
        .select()
        .eq('slug', slug)
        .maybeSingle();
    return res;
  }

  // ──────────────────────────────────────────────────────────────────
  // PROGRAMME / SESSIONS
  // ──────────────────────────────────────────────────────────────────

  /// Sessions d'un salon (remplace GET /conferences?filters[event]=:id)
  Future<List<Map<String, dynamic>>> getSessions(String salonId) async {
    final res = await _client
        .from(SupabaseConfig.tableSessions)
        .select('*, speakers(*)')
        .eq('salon_id', salonId)
        .order('start_time', ascending: true);
    return List<Map<String, dynamic>>.from(res);
  }

  // ──────────────────────────────────────────────────────────────────
  // INSCRIPTIONS
  // ──────────────────────────────────────────────────────────────────

  /// S'inscrire à un salon (remplace POST /registrations)
  Future<Map<String, dynamic>?> registerToSalon(String salonId) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    final res = await _client
        .from(SupabaseConfig.tableRegistrations)
        .upsert({
          'salon_id': salonId,
          'user_id': userId,
          'registration_type': 'standard',
          'status': 'confirmed',
        })
        .select()
        .maybeSingle();
    return res;
  }

  /// Inscriptions de l'utilisateur (remplace GET /registrations?filters[user]=:id)
  Future<List<Map<String, dynamic>>> getUserRegistrations() async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final res = await _client
        .from(SupabaseConfig.tableRegistrations)
        .select('*, salons(*)')
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }

  // ──────────────────────────────────────────────────────────────────
  // E-BADGES / INSCRIPTIONS
  // ──────────────────────────────────────────────────────────────────

  /// Récupère la liste des e-badges (inscriptions) de l'utilisateur connecté.
  /// Retourne les données avec les infos du salon associé.
  Future<List<Map<String, dynamic>>> getMyEbadges() async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final res = await _client
        .from(SupabaseConfig.tableRegistrations)
        .select('*, salon:salons(*)')
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    return List<Map<String, dynamic>>.from(res);
  }

  /// Crée ou récupère l'inscription de l'utilisateur pour un salon.
  /// Retourne l'inscription (avec ID).
  Future<Map<String, dynamic>> registerForSalon({
    required String salonId,
    String type = 'visitor',
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    // Upsert : crée si n'existe pas, sinon retourne l'existant
    final res = await _client
        .from(SupabaseConfig.tableRegistrations)
        .upsert(
          {
            'user_id': userId,
            'salon_id': salonId,
            'type': type,
            'status': 'confirmed',
            'confirmed': true,
          },
          onConflict: 'user_id,salon_id',
        )
        .select('*, salon:salons(*)')
        .single();

    return Map<String, dynamic>.from(res);
  }

  /// Génère (ou renouvelle) le token QR pour un badge existant.
  /// Appelle l'Edge Function generate-qr et met à jour qr_token en DB.
  Future<String> refreshQrToken({
    required String registrationId,
    required String salonId,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    // Génère un nouveau token via Edge Function
    final token = await generateQrToken(salonId: salonId);

    // Sauvegarde en DB pour référence
    await _client
        .from(SupabaseConfig.tableRegistrations)
        .update({
          'qr_token': token,
          'qr_expires_at':
              DateTime.now().add(const Duration(hours: 24)).toIso8601String(),
        })
        .eq('id', registrationId);

    return token;
  }

  // ──────────────────────────────────────────────────────────────────
  // CONTACTS / SCANS (badges)
  // ──────────────────────────────────────────────────────────────────

  /// Enregistrer un scan de badge (remplace POST scan endpoint Strapi)
  /// Déclenche aussi un envoi d'email au visiteur scanné via Edge Function.
  Future<void> saveScan({
    required String scannedUserId,
    String? salonId,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    await _client.from(SupabaseConfig.tableContacts).upsert({
      'user_id': userId,
      'connected_user_id': scannedUserId,
      'salon_id': salonId,
      'source': 'badge_scan',
    });

    // Envoyer un email au visiteur scanné (fire-and-forget, ne bloque pas l'UI)
    _client.functions.invoke(
      'send-scan-email',
      body: {
        'scannerId': userId,
        'scannedUserId': scannedUserId,
        if (salonId != null) 'salonId': salonId,
      },
    ).catchError((e) {
      // L'email est non bloquant : on log sans faire crasher l'app
      print('send-scan-email error (non-bloquant): $e');
    });
  }

  /// Liste des contacts scannés
  Future<List<Map<String, dynamic>>> getScannedContacts() async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final res = await _client
        .from(SupabaseConfig.tableContacts)
        .select('*, connected_user:users!connected_user_id(*)')
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }

  // ──────────────────────────────────────────────────────────────────
  // NOTIFICATIONS PUSH
  // ──────────────────────────────────────────────────────────────────

  /// Enregistrer le token FCM (remplace logique Strapi custom)
  Future<void> savePushToken(String fcmToken, String platform) async {
    final userId = currentUser?.id;
    if (userId == null) return;

    await _client.from(SupabaseConfig.tablePushTokens).upsert({
      'user_id': userId,
      'token': fcmToken,
      'platform': platform,
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // UPLOAD AVATAR
  // ──────────────────────────────────────────────────────────────────

  /// Uploader un avatar (remplace POST /upload multipart Strapi)
  Future<String> uploadAvatar(String filePath, Uint8List bytes) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    final path = '$userId/avatar.jpg';
    await _client.storage
        .from(SupabaseConfig.storageAvatarsBucket)
        .uploadBinary(path, bytes,
            fileOptions: const FileOptions(upsert: true));

    return _client.storage
        .from(SupabaseConfig.storageAvatarsBucket)
        .getPublicUrl(path);
  }

  // ──────────────────────────────────────────────────────────────────
  // QR BADGE ANTI-FALSIFICATION (Edge Function generate-qr)
  // ──────────────────────────────────────────────────────────────────

  /// Génère un token QR signé pour un badge.
  /// [salonId] : UUID du salon concerné.
  /// [ttl] : durée de validité en secondes (défaut 86400 = 24h).
  Future<String> generateQrToken({
    required String salonId,
    int ttl = 86400,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    final response = await _client.functions.invoke(
      'generate-qr',
      body: {
        'action': 'generate',
        'userId': userId,
        'salonId': salonId,
        'ttl': ttl,
      },
    );

    if (response.status != 200) {
      throw Exception('Erreur génération QR: ${response.data}');
    }

    return (response.data as Map<String, dynamic>)['token'] as String;
  }

  /// Vérifie un token QR scanné et retourne le profil de l'utilisateur.
  /// [gate] : identifiant optionnel de la porte d'entrée (anti-doublon).
  Future<Map<String, dynamic>?> verifyQrToken({
    required String token,
    String? gate,
  }) async {
    final response = await _client.functions.invoke(
      'generate-qr',
      body: {
        'action': 'verify',
        'token': token,
        'scannerUserId': currentUser?.id,
        if (gate != null) 'gate': gate,
      },
    );

    if (response.status != 200) return null;
    return response.data as Map<String, dynamic>?;
  }
}
