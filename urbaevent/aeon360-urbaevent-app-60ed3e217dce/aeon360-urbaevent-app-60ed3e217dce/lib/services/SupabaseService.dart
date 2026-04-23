import 'dart:convert';
import 'dart:typed_data';
import 'dart:math';
import 'package:flutter/foundation.dart';
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
      try {
        await _client.from(SupabaseConfig.tableUsers).upsert({
          'id': res.user!.id,
          'email': email,
          'name': name,
          'type': 'visitor',
          'role': 'visitor',
          'status': 'active',
        });
      } catch (e) {
        debugPrint("Erreur upsert public.users ignorée (RLS ou trigger existant): $e");
      }
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

  /// Connexion Google via OAuth token
  Future<AuthResponse> signInWithGoogle(String idToken) async {
    return await _client.auth.signInWithIdToken(
      provider: OAuthProvider.google,
      idToken: idToken,
    );
  }

  /// Connexion Apple via identityToken natif
  Future<AuthResponse> signInWithApple(String idToken) async {
    return await _client.auth.signInWithIdToken(
      provider: OAuthProvider.apple,
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
    String? eventId,
    String type = 'visitor',
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    // Si pas d'eventId fourni, récupérer le premier événement disponible
    String resolvedEventId;
    if (eventId != null) {
      resolvedEventId = eventId;
    } else {
      final events = await _client
          .from('events')
          .select('id')
          .limit(1);
      if (events.isEmpty) throw Exception('Aucun événement disponible');
      resolvedEventId = events[0]['id'] as String;
    }

    // Upsert : crée si n'existe pas, sinon retourne l'existant
    final res = await _client
        .from(SupabaseConfig.tableRegistrations)
        .upsert(
          {
            'user_id': userId,
            'salon_id': salonId,
            'event_id': resolvedEventId,
            'registration_type': type,
            'status': 'confirmed',
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
    ).then((_) {}).catchError((e) {
      // L'email est non bloquant : on log sans faire crasher l'app
      debugPrint('send-scan-email error (non-bloquant): $e');
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

    try {
      await _client.from(SupabaseConfig.tablePushTokens).upsert({
        'user_id': userId,
        'endpoint': fcmToken, // Using endpoint to store the FCM token
        'device_type': platform,
      }, onConflict: 'user_id,endpoint');
    } catch (e) {
      debugPrint('savePushToken error: $e');
    }
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

  // ──────────────────────────────────────────────────────────────────
  // AUTH SOCIALE (remplace POST /socialLogin Strapi)
  // ──────────────────────────────────────────────────────────────────

  /// Connexion/inscription via provider social (Google/Apple/LinkedIn).
  /// Cherche un user existant par email, sinon crée le profil.
  /// Retourne le user_id et le JWT Supabase.
  Future<Map<String, dynamic>> socialSignIn({
    required String email,
    required String provider,
    String? name,
    String? socialId,
  }) async {
    // Tenter la connexion avec un mot de passe dérivé du socialId
    final derivedPassword = _deriveSocialPassword(socialId ?? email);
    try {
      final res = await _client.auth.signInWithPassword(
        email: email,
        password: derivedPassword,
      );
      if (res.user != null) {
        return {
          'user_id': res.user!.id,
          'jwt': res.session?.accessToken ?? '',
        };
      }
    } catch (_) {
      // L'utilisateur n'existe pas encore → inscription
    }

    // Inscription automatique
    final signUpRes = await _client.auth.signUp(
      email: email,
      password: derivedPassword,
      data: {
        'name': name ?? email.split('@').first,
        'provider': provider,
        'social_id': socialId,
      },
    );
    if (signUpRes.user != null) {
      await _client.from(SupabaseConfig.tableUsers).upsert({
        'id': signUpRes.user!.id,
        'email': email,
        'name': name ?? email.split('@').first,
        'type': 'visitor',
        'role': 'visitor',
        'status': 'active',
        'provider': provider,
        'social_id': socialId,
      });
      return {
        'user_id': signUpRes.user!.id,
        'jwt': signUpRes.session?.accessToken ?? '',
      };
    }
    throw Exception('Échec connexion sociale');
  }

  String _deriveSocialPassword(String seed) {
    // Mot de passe déterministe dérivé du socialId (non devinable sans le seed)
    final bytes = seed.codeUnits;
    int hash = 0x811c9dc5;
    for (final b in bytes) {
      hash ^= b;
      hash = (hash * 0x01000193) & 0xFFFFFFFF;
    }
    return 'Soc\$${hash.toRadixString(36)}!Pwd#${seed.length}';
  }

  // ──────────────────────────────────────────────────────────────────
  // APPLE DATA (remplace GET/POST /apples Strapi)
  // ──────────────────────────────────────────────────────────────────

  /// Récupère les données Apple stockées pour un identifiant utilisateur.
  Future<Map<String, dynamic>?> getAppleData(String userIdentifier) async {
    final res = await _client
        .from(SupabaseConfig.tableAppleSocialData)
        .select()
        .eq('social_id', userIdentifier)
        .maybeSingle();
    return res;
  }

  /// Stocke les données Apple (première connexion Apple).
  Future<void> saveAppleData({
    required String firstName,
    required String lastName,
    required String email,
    required String socialId,
  }) async {
    await _client.from(SupabaseConfig.tableAppleSocialData).upsert({
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'social_id': socialId,
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // EMAIL OTP (remplace POST /resendOTP et /verifyEmailOTP Strapi)
  // ──────────────────────────────────────────────────────────────────

  /// Renvoie un OTP de vérification email via Supabase.
  Future<void> resendEmailOTP(String email) async {
    await _client.auth.resend(type: OtpType.signup, email: email);
  }

  /// Vérifie un OTP email. Retourne true si succès.
  Future<bool> verifyEmailOTP(String email, String otp) async {
    try {
      final res = await _client.auth.verifyOTP(
        type: OtpType.signup,
        email: email,
        token: otp,
      );
      return res.user != null;
    } catch (_) {
      return false;
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // NOTIFICATIONS (remplace GET /notifications et PUT read-index)
  // ──────────────────────────────────────────────────────────────────

  /// Récupère la liste des notifications de l'utilisateur.
  Future<List<Map<String, dynamic>>> getNotifications() async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final res = await _client
        .from(SupabaseConfig.tableNotifications)
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }

  /// Met à jour l'index de dernière notification lue.
  Future<void> setNotificationReadIndex(int lastIndex) async {
    final userId = currentUser?.id;
    if (userId == null) return;

    await _client
        .from(SupabaseConfig.tableUsers)
        .update({'last_notification_index': lastIndex})
        .eq('id', userId);
  }

  // ──────────────────────────────────────────────────────────────────
  // CONFERENCES / PROGRAMME (remplace GET /conferences Strapi)
  // ──────────────────────────────────────────────────────────────────

  /// Liste des conférences d'un salon (remplace GET /conferences?filters[event]=:id)
  Future<List<Map<String, dynamic>>> getConferences(String salonId) async {
    final res = await _client
        .from(SupabaseConfig.tableSessions)
        .select()
        .eq('salon_id', salonId)
        .order('start_time', ascending: true);
    return List<Map<String, dynamic>>.from(res);
  }

  /// Inscrit l'utilisateur à une conférence.
  Future<Map<String, dynamic>?> registerForConference({
    required String salonId,
    required String conferenceId,
    String type = 'visitor',
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    final res = await _client
        .from(SupabaseConfig.tableRegistrations)
        .insert({
          'user_id': userId,
          'salon_id': salonId,
          'event_id': conferenceId,
          'registration_type': type,
          'status': 'confirmed',
        })
        .select()
        .maybeSingle();
    return res;
  }

  /// Récupère les IDs des conférences auxquelles l'utilisateur est inscrit.
  Future<List<String>> getUserConferenceIds(String salonId) async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final res = await _client
        .from(SupabaseConfig.tableRegistrations)
        .select('event_id')
        .eq('user_id', userId)
        .eq('salon_id', salonId);
    return (res as List)
        .map((r) => r['event_id'].toString())
        .toList();
  }

  /// Planning de l'utilisateur (conférences inscrites, triées par date).
  Future<List<Map<String, dynamic>>> getMySchedule(String salonId) async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final res = await _client
        .from(SupabaseConfig.tableRegistrations)
        .select('*, event:events(*)')
        .eq('user_id', userId)
        .eq('salon_id', salonId)
        .order('created_at', ascending: true);
    return List<Map<String, dynamic>>.from(res);
  }

  // ──────────────────────────────────────────────────────────────────
  // PORTAIL EXPOSANTS (remplace GET /registrations portal Strapi)
  // ──────────────────────────────────────────────────────────────────

  /// Liste des exposants confirmés d'un salon.
  Future<List<Map<String, dynamic>>> getPortalExhibitors(String salonId) async {
    final res = await _client
        .from(SupabaseConfig.tableExhibitors)
        .select('*, user:users(*)')
        .eq('salon_id', salonId)
        .eq('status', 'active')
        .order('company_name', ascending: true);
    return List<Map<String, dynamic>>.from(res);
  }

  /// Liste des secteurs d'activité.
  Future<List<Map<String, dynamic>>> getBusinessSectors() async {
    final res = await _client
        .from(SupabaseConfig.tableBusinessSectors)
        .select()
        .order('name', ascending: true);
    return List<Map<String, dynamic>>.from(res);
  }

  // ──────────────────────────────────────────────────────────────────
  // PROFIL UTILISATEUR — Suppression avatar
  // ──────────────────────────────────────────────────────────────────

  /// Supprime l'avatar de l'utilisateur (remplace DELETE /upload/files/:id Strapi).
  Future<void> deleteAvatar() async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    final path = '$userId/avatar.jpg';
    await _client.storage
        .from(SupabaseConfig.storageAvatarsBucket)
        .remove([path]);

    // Nettoyer la référence dans le profil
    await _client
        .from(SupabaseConfig.tableUsers)
        .update({'avatar_url': null})
        .eq('id', userId);
  }

  /// Change le mot de passe (remplace POST /auth/change-password Strapi).
  Future<void> changePassword(String newPassword) async {
    await _client.auth.updateUser(UserAttributes(password: newPassword));
  }

  /// Détails d'un contact (user) par ID.
  Future<Map<String, dynamic>?> getContactDetails(String userId) async {
    final res = await _client
        .from(SupabaseConfig.tableUsers)
        .select()
        .eq('id', userId)
        .maybeSingle();
    return res;
  }

  // ──────────────────────────────────────────────────────────────────
  // ASSOCIÉS / COLLABORATEURS
  // ──────────────────────────────────────────────────────────────────

  /// Crée un collaborateur (remplace POST /auth/local/register pour type collaborator).
  Future<Map<String, dynamic>?> addCollaborator({
    required String name,
    required String email,
    required String phone,
    required String jobPosition,
    required String salonId,
  }) async {
    final userId = currentUser?.id;
    if (userId == null) throw Exception('Non authentifié');

    final password = _generateRandomPassword();
    // Créer le compte auth
    final signUpRes = await _client.auth.admin.createUser(AdminUserAttributes(
      email: email,
      password: password,
      emailConfirm: true,
      userMetadata: {'name': name},
    ));
    if (signUpRes.user == null) throw Exception('Erreur création collaborateur');

    final collabId = signUpRes.user!.id;
    // Créer le profil
    await _client.from(SupabaseConfig.tableUsers).upsert({
      'id': collabId,
      'email': email,
      'name': name,
      'phone': phone,
      'job_position': jobPosition,
      'type': 'collaborator',
      'role': 'visitor',
      'status': 'active',
      'parent_user_id': userId,
    });

    // Inscrire au salon
    await registerForSalon(salonId: salonId, type: 'collaborator');

    return {'id': collabId, 'email': email, 'name': name, 'password': password};
  }

  String _generateRandomPassword() {
    final random = Random.secure();
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return List.generate(10, (_) => chars[random.nextInt(chars.length)]).join();
  }

  /// Met à jour un collaborateur.
  Future<void> updateCollaborator(String collabId, Map<String, dynamic> data) async {
    await _client
        .from(SupabaseConfig.tableUsers)
        .update(data)
        .eq('id', collabId);
  }

  /// Désactive un collaborateur (soft-delete).
  Future<void> deleteCollaborator(String collabId) async {
    await _client
        .from(SupabaseConfig.tableUsers)
        .update({'status': 'blocked'})
        .eq('id', collabId);
  }

  /// Liste des collaborateurs de l'utilisateur actuel pour un salon.
  Future<List<Map<String, dynamic>>> getAssociates(String salonId) async {
    final userId = currentUser?.id;
    if (userId == null) return [];

    final res = await _client
        .from(SupabaseConfig.tableUsers)
        .select('*, registrations:${SupabaseConfig.tableRegistrations}(id, salon_id)')
        .eq('parent_user_id', userId)
        .neq('status', 'blocked')
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(res);
  }

  /// Envoie un email d'invitation à un collaborateur via Edge Function.
  Future<void> sendCollaboratorInvite(String collabId) async {
    await _client.functions.invoke(
      'send-collaborator-invite',
      body: {
        'collaboratorId': collabId,
        'inviterId': currentUser?.id,
      },
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // AGENT — Rôle & portes (remplace GET /users/me agent, GET /gates)
  // ──────────────────────────────────────────────────────────────────

  /// Récupère le profil agent avec infos du salon contrôlé.
  Future<Map<String, dynamic>?> getAgentAuth() async {
    final userId = currentUser?.id;
    if (userId == null) return null;

    final res = await _client
        .from(SupabaseConfig.tableUsers)
        .select('*, event_control:salons(*)')
        .eq('id', userId)
        .maybeSingle();
    return res;
  }

  /// Liste des portes (gates) d'un salon.
  Future<List<Map<String, dynamic>>> getGates(String salonId) async {
    final res = await _client
        .from(SupabaseConfig.tableGates)
        .select()
        .eq('salon_id', salonId)
        .order('name', ascending: true);
    return List<Map<String, dynamic>>.from(res);
  }

  // ──────────────────────────────────────────────────────────────────
  // E-BADGE DOWNLOAD (remplace GET /registrations/downloadEbadge/:id)
  // ──────────────────────────────────────────────────────────────────

  /// Génère un PDF e-badge via Edge Function.
  /// Retourne les bytes du PDF, ou null en cas d'erreur.
  Future<Uint8List?> downloadEbadge(String registrationId) async {
    final response = await _client.functions.invoke(
      'generate-ebadge',
      body: {
        'registrationId': registrationId,
        'userId': currentUser?.id,
      },
    );
    if (response.status != 200) {
      throw Exception('Erreur téléchargement e-badge (status: ${response.status})');
    }
    final data = response.data;
    if (data is Uint8List) {
      return data;
    } else if (data is List<int>) {
      return Uint8List.fromList(data);
    } else if (data is String) {
      // Si la réponse est base64
      return Uint8List.fromList(base64Decode(data));
    }
    return null;
  }
}
