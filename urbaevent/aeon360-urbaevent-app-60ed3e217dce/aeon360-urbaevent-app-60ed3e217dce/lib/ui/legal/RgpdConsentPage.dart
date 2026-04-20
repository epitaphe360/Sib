import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

/// Page de consentement RGPD — affichée au premier lancement de l'app
/// Conforme aux exigences Apple App Store et Google Play Store
class RgpdConsentPage extends StatefulWidget {
  /// Callback appelé quand l'utilisateur accepte
  final VoidCallback onAccepted;

  const RgpdConsentPage({Key? key, required this.onAccepted}) : super(key: key);

  static const String _prefKey = 'rgpd_accepted_v1';

  /// Vérifie si l'utilisateur a déjà accepté (depuis SharedPreferences)
  static Future<bool> hasAccepted() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_prefKey) ?? false;
  }

  /// Marque le consentement comme accepté
  static Future<void> markAccepted() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefKey, true);
  }

  @override
  State<RgpdConsentPage> createState() => _RgpdConsentPageState();
}

class _RgpdConsentPageState extends State<RgpdConsentPage> {
  bool _acceptedTerms = false;
  bool _acceptedPrivacy = false;
  bool _acceptedData = false;
  bool _acceptedMarketing = false; // Optionnel

  bool get _canProceed => _acceptedTerms && _acceptedPrivacy && _acceptedData;

  Future<void> _accept() async {
    await RgpdConsentPage.markAccepted();
    widget.onAccepted();
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF9F9FF),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── En-tête ───────────────────────────────────────────────
              Center(
                child: Image.asset('assets/logo.png', height: 60),
              ),
              const SizedBox(height: 20),
              Text(
                'Vos données & votre vie privée',
                style: GoogleFonts.roboto(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'SIB 2026 s\'engage à protéger vos données personnelles conformément au RGPD et à la loi 09-08 marocaine sur la protection des données.',
                style: GoogleFonts.roboto(fontSize: 13, color: Colors.black54, height: 1.5),
              ),
              const SizedBox(height: 20),

              // ── Liste des consentements ───────────────────────────────
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      _consentTile(
                        title: 'Conditions Générales d\'Utilisation',
                        subtitle: 'J\'accepte les CGU de SIB 2026',
                        value: _acceptedTerms,
                        required: true,
                        onChanged: (v) => setState(() => _acceptedTerms = v ?? false),
                        linkLabel: 'Lire les CGU',
                        linkUrl: 'https://www.sib2026.ma/cgu',
                      ),
                      const SizedBox(height: 12),
                      _consentTile(
                        title: 'Politique de Confidentialité',
                        subtitle: 'J\'accepte la politique de confidentialité',
                        value: _acceptedPrivacy,
                        required: true,
                        onChanged: (v) => setState(() => _acceptedPrivacy = v ?? false),
                        linkLabel: 'Lire la politique',
                        linkUrl: 'https://www.sib2026.ma/privacy',
                      ),
                      const SizedBox(height: 12),
                      _consentTile(
                        title: 'Traitement des données personnelles',
                        subtitle: 'J\'accepte que mes données soient utilisées pour la gestion de mon inscription et la personnalisation de mon expérience au salon.',
                        value: _acceptedData,
                        required: true,
                        onChanged: (v) => setState(() => _acceptedData = v ?? false),
                        linkLabel: 'En savoir plus',
                        linkUrl: 'https://www.sib2026.ma/rgpd',
                      ),
                      const SizedBox(height: 12),
                      _consentTile(
                        title: 'Communications marketing (optionnel)',
                        subtitle: 'J\'accepte de recevoir des informations sur les prochaines éditions du SIB et les événements URBACOM.',
                        value: _acceptedMarketing,
                        required: false,
                        onChanged: (v) => setState(() => _acceptedMarketing = v ?? false),
                      ),
                      const SizedBox(height: 16),
                      // ── Info droits ──────────────────────────────────
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.blue.shade100),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              Icon(Icons.info_outline, color: Colors.blue.shade700, size: 16),
                              SizedBox(width: 6),
                              Text('Vos droits', style: GoogleFonts.roboto(
                                fontWeight: FontWeight.bold,
                                color: Colors.blue.shade700,
                                fontSize: 13,
                              )),
                            ]),
                            SizedBox(height: 6),
                            Text(
                              'Vous pouvez à tout moment demander l\'accès, la rectification ou la suppression de vos données en contactant : privacy@sib2026.ma',
                              style: GoogleFonts.roboto(fontSize: 12, color: Colors.blue.shade800, height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // ── Bouton Accepter ───────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _canProceed ? _accept : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ThemeColor.colorAccent,
                    disabledBackgroundColor: Colors.grey.shade300,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    'Accepter et continuer',
                    style: GoogleFonts.roboto(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'Les champs marqués * sont obligatoires pour utiliser l\'application.',
                  style: GoogleFonts.roboto(fontSize: 10, color: Colors.black38),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _consentTile({
    required String title,
    required String subtitle,
    required bool value,
    required bool required,
    required ValueChanged<bool?> onChanged,
    String? linkLabel,
    String? linkUrl,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: value ? ThemeColor.colorAccent.withOpacity(0.4) : Colors.grey.shade200,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Checkbox(
                value: value,
                onChanged: onChanged,
                activeColor: ThemeColor.colorAccent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: title,
                          style: GoogleFonts.roboto(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                            fontSize: 14,
                          ),
                        ),
                        if (required)
                          TextSpan(
                            text: ' *',
                            style: GoogleFonts.roboto(color: Colors.red, fontWeight: FontWeight.bold),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(left: 14, right: 14, bottom: 4),
            child: Text(
              subtitle,
              style: GoogleFonts.roboto(fontSize: 12, color: Colors.black54, height: 1.4),
            ),
          ),
          if (linkLabel != null && linkUrl != null)
            Padding(
              padding: const EdgeInsets.only(left: 14, top: 4),
              child: GestureDetector(
                onTap: () => _openUrl(linkUrl),
                child: Text(
                  linkLabel,
                  style: GoogleFonts.roboto(
                    fontSize: 12,
                    color: ThemeColor.colorAccent,
                    decoration: TextDecoration.underline,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
