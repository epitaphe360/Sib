import 'dart:io';
import 'package:com.urbaevent/services/PaymentService.dart';
import 'package:com.urbaevent/utils/SupabaseConfig.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:com.urbaevent/utils/Utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// Page de paiement Pass VIP SIB 2026
/// Supporte : PayPal, CMI (carte bancaire marocaine), Apple Pay (iOS)
class VipPaymentPage extends StatefulWidget {
  final String userId;
  final String visitorName;
  final String email;

  const VipPaymentPage({
    Key? key,
    required this.userId,
    required this.visitorName,
    required this.email,
  }) : super(key: key);

  @override
  State<VipPaymentPage> createState() => _VipPaymentPageState();
}

class _VipPaymentPageState extends State<VipPaymentPage> {
  PaymentMethod? _selectedMethod;
  bool _isLoading = false;
  bool _isVip = false;
  final _svc = PaymentService.instance;

  @override
  void initState() {
    super.initState();
    _checkVipStatus();
  }

  Future<void> _checkVipStatus() async {
    try {
      final data = await Supabase.instance.client
          .from(SupabaseConfig.tableUsers)
          .select('pass_type')
          .eq('id', widget.userId)
          .single();
      if (mounted) {
        setState(() => _isVip = data['pass_type'] == 'vip');
      }
    } catch (_) {}
  }

  // ── Lancer le paiement selon la méthode choisie ───────────────────
  Future<void> _startPayment() async {
    if (_selectedMethod == null) {
      Utils.showToast('Veuillez sélectionner un mode de paiement');
      return;
    }
    setState(() => _isLoading = true);
    try {
      if (_selectedMethod == PaymentMethod.paypal) {
        await _startPaypalPayment();
      } else if (_selectedMethod == PaymentMethod.cmi) {
        await _startCmiPayment();
      } else if (_selectedMethod == PaymentMethod.applePay) {
        await _startApplePayPayment();
      }
    } catch (e) {
      Utils.showToast('Erreur : ${e.toString()}');
    }
    if (mounted) setState(() => _isLoading = false);
  }

  // ── PayPal ────────────────────────────────────────────────────────
  Future<void> _startPaypalPayment() async {
    final result = await _svc.createPaypalOrder(
      userId: widget.userId,
      visitorName: widget.visitorName,
      email: widget.email,
    );
    if (!mounted) return;

    final confirmed = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => _PaymentWebViewPage(
          title: 'Paiement PayPal',
          url: result.approvalUrl,
          successUrlPattern: 'payment/paypal/success',
          cancelUrlPattern: 'payment/paypal/cancel',
          orderId: result.orderId,
        ),
      ),
    );

    if (confirmed == true) {
      final captured = await _svc.capturePaypalOrder(result.orderId);
      if (captured) {
        await _onPaymentSuccess('paypal', result.orderId);
      } else {
        Utils.showToast('Le paiement n\'a pas pu être confirmé. Contactez le support.');
      }
    }
  }

  // ── CMI ───────────────────────────────────────────────────────────
  Future<void> _startCmiPayment() async {
    final result = await _svc.createCmiOrder(
      userId: widget.userId,
      visitorName: widget.visitorName,
      email: widget.email,
    );
    if (!mounted) return;

    final confirmed = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => _PaymentWebViewPage(
          title: 'Paiement par carte (CMI)',
          url: result.approvalUrl,
          successUrlPattern: 'payment/cmi/success',
          cancelUrlPattern: 'payment/cmi/fail',
          orderId: result.orderId,
        ),
      ),
    );

    if (confirmed == true) {
      final verified = await _svc.verifyCmiPayment(result.orderId);
      if (verified) {
        await _onPaymentSuccess('cmi', result.orderId);
      } else {
        Utils.showToast('Paiement en attente de confirmation. Vérifiez votre email.');
      }
    }
  }

  // ── Apple Pay ─────────────────────────────────────────────────────
  Future<void> _startApplePayPayment() async {
    // TODO: Configurer le Merchant ID dans Xcode → Signing & Capabilities → Apple Pay
    // TODO: Enregistrer merchant.ma.sib2026 dans Apple Developer → Identifiers → Merchant IDs
    Utils.showToast('Apple Pay — configuration en cours. Utilisez PayPal ou CMI.');
    // Implémentation native via le package `pay` :
    // final payClient = Pay({'apple_pay': ApplePayEnvironment(
    //   merchantId: dotenv.env['APPLE_PAY_MERCHANT_ID'] ?? '',
    //   displayName: 'SIB 2026',
    //   merchantCapabilities: [ApplePayMerchantCapability.supports3DS],
    //   networks: [ApplePayNetwork.visa, ApplePayNetwork.masterCard],
    // )});
  }

  // ── Succès paiement ───────────────────────────────────────────────
  Future<void> _onPaymentSuccess(String method, String orderId) async {
    try {
      await _svc.activateVipPass(
        userId: widget.userId,
        paymentMethod: method,
        orderId: orderId,
      );
      setState(() => _isVip = true);
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 28),
                SizedBox(width: 8),
                Text('Pass VIP activé !', style: GoogleFonts.roboto(fontWeight: FontWeight.bold)),
              ],
            ),
            content: Text(
              'Félicitations ${widget.visitorName} !\nVotre Pass VIP SIB 2026 est maintenant actif.\nUn email de confirmation vous a été envoyé.',
              style: GoogleFonts.roboto(fontSize: 14),
            ),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // fermer dialog
                  Navigator.pop(context); // retour page précédente
                },
                style: ElevatedButton.styleFrom(backgroundColor: ThemeColor.colorAccent),
                child: Text('Continuer', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      Utils.showToast('Paiement reçu mais activation manuelle requise. Contactez le support.');
    }
  }

  // ── UI ────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final price = dotenv.env['VIP_PRICE'] ?? '700';
    final currency = dotenv.env['VIP_CURRENCY'] ?? 'MAD';

    return Scaffold(
      backgroundColor: const Color(0xFFF9F9FF),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF9F9FF),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Pass VIP SIB 2026',
          style: GoogleFonts.roboto(
            color: Colors.black,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        centerTitle: true,
      ),
      body: _isVip ? _buildAlreadyVip() : _buildPaymentContent(price, currency),
    );
  }

  Widget _buildAlreadyVip() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.star_rounded, color: Colors.amber, size: 80),
            SizedBox(height: 16),
            Text(
              'Vous avez déjà un Pass VIP !',
              style: GoogleFonts.roboto(fontSize: 20, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8),
            Text(
              'Tous les accès premium sont déjà activés sur votre compte.',
              style: GoogleFonts.roboto(fontSize: 14, color: Colors.black54),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentContent(String price, String currency) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Carte récapitulatif VIP ─────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [ThemeColor.colorAccent, ThemeColor.colorAccent.withOpacity(0.7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.star_rounded, color: Colors.white, size: 28),
                    SizedBox(width: 8),
                    Text(
                      'Pass VIP SIB 2026',
                      style: GoogleFonts.roboto(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16),
                _vipFeature('Accès prioritaire à tous les halls'),
                _vipFeature('Salon VIP & networking exclusif'),
                _vipFeature('Conférences premium réservées'),
                _vipFeature('Badge VIP numérique officiel'),
                _vipFeature('Pack documentation et catalogues'),
                SizedBox(height: 16),
                Text(
                  '$price $currency',
                  style: GoogleFonts.roboto(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Paiement unique — accès à vie pour SIB 2026',
                  style: GoogleFonts.roboto(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
          SizedBox(height: 28),

          // ── Sélection méthode de paiement ──────────────────────────
          Text(
            'Choisissez votre mode de paiement',
            style: GoogleFonts.roboto(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 12),

          _paymentMethodTile(
            method: PaymentMethod.paypal,
            logoAsset: 'assets/icon_paypal.png',
            fallbackIcon: Icons.payment,
            label: 'PayPal',
            subtitle: 'Paiement sécurisé par PayPal',
            color: const Color(0xFF003087),
          ),
          SizedBox(height: 10),
          _paymentMethodTile(
            method: PaymentMethod.cmi,
            logoAsset: 'assets/icon_cmi.png',
            fallbackIcon: Icons.credit_card,
            label: 'Carte bancaire (CMI)',
            subtitle: 'Visa, Mastercard, CIH, Attijariwafa...',
            color: const Color(0xFF1A5276),
          ),
          if (Platform.isIOS) ...[
            SizedBox(height: 10),
            _paymentMethodTile(
              method: PaymentMethod.applePay,
              logoAsset: 'assets/icon_apple_pay.png',
              fallbackIcon: Icons.apple,
              label: 'Apple Pay',
              subtitle: 'Paiement rapide avec Touch/Face ID',
              color: Colors.black,
            ),
          ],

          SizedBox(height: 28),

          // ── Bouton payer ────────────────────────────────────────────
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: (_isLoading || _selectedMethod == null) ? null : _startPayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: ThemeColor.colorAccent,
                disabledBackgroundColor: Colors.grey.shade300,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                  : Text(
                      'Payer $price $currency',
                      style: GoogleFonts.roboto(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
          SizedBox(height: 16),

          // ── Mentions sécurité ───────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.lock, size: 14, color: Colors.black45),
              SizedBox(width: 4),
              Text(
                'Paiement 100% sécurisé — SSL/TLS chiffré',
                style: GoogleFonts.roboto(fontSize: 11, color: Colors.black45),
              ),
            ],
          ),
          SizedBox(height: 4),
          Center(
            child: Text(
              'En procédant au paiement, vous acceptez les CGV de SIB 2026.',
              style: GoogleFonts.roboto(fontSize: 10, color: Colors.black38),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _vipFeature(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(Icons.check_circle_outline, color: Colors.white, size: 16),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.roboto(color: Colors.white, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _paymentMethodTile({
    required PaymentMethod method,
    required String logoAsset,
    required IconData fallbackIcon,
    required String label,
    required String subtitle,
    required Color color,
  }) {
    final isSelected = _selectedMethod == method;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = method),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? ThemeColor.colorAccent : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: ThemeColor.colorAccent.withOpacity(0.15), blurRadius: 8, offset: Offset(0, 2))]
              : [],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
              child: Icon(fallbackIcon, color: color, size: 24),
            ),
            SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: GoogleFonts.roboto(fontWeight: FontWeight.bold, fontSize: 15)),
                  Text(subtitle, style: GoogleFonts.roboto(fontSize: 12, color: Colors.black45)),
                ],
              ),
            ),
            Radio<PaymentMethod>(
              value: method,
              groupValue: _selectedMethod,
              onChanged: (v) => setState(() => _selectedMethod = v),
              activeColor: ThemeColor.colorAccent,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── WebView générique pour les paiements hébergés (PayPal / CMI) ─────────────

class _PaymentWebViewPage extends StatefulWidget {
  final String title;
  final String url;
  final String successUrlPattern;
  final String cancelUrlPattern;
  final String orderId;

  const _PaymentWebViewPage({
    required this.title,
    required this.url,
    required this.successUrlPattern,
    required this.cancelUrlPattern,
    required this.orderId,
  });

  @override
  State<_PaymentWebViewPage> createState() => _PaymentWebViewPageState();
}

class _PaymentWebViewPageState extends State<_PaymentWebViewPage> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) => setState(() => _loading = true),
        onPageFinished: (_) => setState(() => _loading = false),
        onNavigationRequest: (request) {
          final url = request.url;
          // Succès du paiement
          if (url.contains(widget.successUrlPattern)) {
            Navigator.pop(context, true);
            return NavigationDecision.prevent;
          }
          // Annulation du paiement
          if (url.contains(widget.cancelUrlPattern)) {
            Navigator.pop(context, false);
            return NavigationDecision.prevent;
          }
          return NavigationDecision.navigate;
        },
      ))
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title, style: GoogleFonts.roboto(fontWeight: FontWeight.bold, fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context, false),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_loading)
            const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
