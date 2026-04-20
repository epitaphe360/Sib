import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

/// PaymentService — gère PayPal, CMI et Apple Pay pour le Pass VIP SIB 2026
class PaymentService {
  static PaymentService? _instance;
  static PaymentService get instance => _instance ??= PaymentService._();
  PaymentService._();

  // ── Configuration depuis .env ─────────────────────────────────────
  String get paypalClientId => dotenv.env['PAYPAL_CLIENT_ID'] ?? '';
  String get paypalSecret => dotenv.env['PAYPAL_SECRET'] ?? '';
  bool get isPaypalSandbox => dotenv.env['PAYPAL_SANDBOX'] == 'true';
  String get apiBaseUrl =>
      dotenv.env['API_BASE_URL'] ?? 'https://sib-production.up.railway.app';
  String get vipPrice => dotenv.env['VIP_PRICE'] ?? '700';
  String get vipCurrency => dotenv.env['VIP_CURRENCY'] ?? 'MAD';
  String get applePayMerchantId =>
      dotenv.env['APPLE_PAY_MERCHANT_ID'] ?? 'merchant.ma.sib2026';

  // ── PayPal : créer une commande via le backend ────────────────────
  /// Crée une commande PayPal côté serveur et retourne l'URL d'approbation
  Future<PaymentOrderResult> createPaypalOrder({
    required String userId,
    required String visitorName,
    required String email,
  }) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/api/payment/paypal/create-order'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userId': userId,
        'visitorName': visitorName,
        'email': email,
        'amount': vipPrice,
        'currency': 'EUR', // PayPal utilise EUR
        'description': 'Pass VIP SIB 2026',
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return PaymentOrderResult(
        orderId: data['orderId'] ?? '',
        approvalUrl: data['approvalUrl'] ?? '',
        success: true,
      );
    }
    throw Exception('Impossible de créer la commande PayPal : ${response.body}');
  }

  /// Capture le paiement PayPal après approbation de l'utilisateur
  Future<bool> capturePaypalOrder(String orderId) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/api/payment/paypal/capture/$orderId'),
      headers: {'Content-Type': 'application/json'},
    );
    return response.statusCode == 200;
  }

  // ── CMI : obtenir l'URL de paiement hébergée ─────────────────────
  /// Génère l'URL de paiement CMI via le backend Railway
  Future<PaymentOrderResult> createCmiOrder({
    required String userId,
    required String visitorName,
    required String email,
  }) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/api/payment/cmi/create-order'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userId': userId,
        'visitorName': visitorName,
        'email': email,
        'amount': vipPrice,
        'currency': vipCurrency,
        'description': 'Pass VIP SIB 2026',
        'callbackUrl': '$apiBaseUrl/api/payment/cmi/callback',
        'okUrl': '$apiBaseUrl/api/payment/cmi/success',
        'failUrl': '$apiBaseUrl/api/payment/cmi/fail',
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return PaymentOrderResult(
        orderId: data['orderId'] ?? '',
        approvalUrl: data['paymentUrl'] ?? '',
        success: true,
      );
    }
    throw Exception('Impossible de créer la commande CMI : ${response.body}');
  }

  /// Vérifier le statut d'un paiement CMI
  Future<bool> verifyCmiPayment(String orderId) async {
    final response = await http.get(
      Uri.parse('$apiBaseUrl/api/payment/cmi/status/$orderId'),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['status'] == 'paid';
    }
    return false;
  }

  // ── Activer le statut VIP dans Supabase ──────────────────────────
  /// Met à jour le profil utilisateur après paiement confirmé
  Future<void> activateVipPass({
    required String userId,
    required String paymentMethod,
    required String orderId,
  }) async {
    final response = await http.post(
      Uri.parse('$apiBaseUrl/api/payment/activate-vip'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userId': userId,
        'paymentMethod': paymentMethod,
        'orderId': orderId,
        'activatedAt': DateTime.now().toIso8601String(),
      }),
    );
    if (response.statusCode != 200) {
      throw Exception('Impossible d\'activer le Pass VIP : ${response.body}');
    }
  }
}

/// Résultat d'une création de commande
class PaymentOrderResult {
  final String orderId;
  final String approvalUrl;
  final bool success;

  PaymentOrderResult({
    required this.orderId,
    required this.approvalUrl,
    required this.success,
  });
}

/// Méthodes de paiement disponibles
enum PaymentMethod {
  paypal,
  cmi,
  applePay,
}

extension PaymentMethodLabel on PaymentMethod {
  String get label {
    switch (this) {
      case PaymentMethod.paypal:
        return 'PayPal';
      case PaymentMethod.cmi:
        return 'Carte bancaire (CMI)';
      case PaymentMethod.applePay:
        return 'Apple Pay';
    }
  }

  String get icon {
    switch (this) {
      case PaymentMethod.paypal:
        return 'assets/icon_paypal.png';
      case PaymentMethod.cmi:
        return 'assets/icon_cmi.png';
      case PaymentMethod.applePay:
        return 'assets/icon_apple_pay.png';
    }
  }
}
