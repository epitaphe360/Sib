import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:screen_brightness/screen_brightness.dart';

/// Affiche le badge QR en plein écran avec luminosité maximale
/// pour un scan rapide aux portes du salon.
class FullScreenBadge extends StatefulWidget {
  final String qrData;
  final String userName;
  final String badgeType;
  final String salonName;
  final Color salonColor;

  const FullScreenBadge({
    Key? key,
    required this.qrData,
    required this.userName,
    required this.badgeType,
    required this.salonName,
    required this.salonColor,
  }) : super(key: key);

  @override
  State<FullScreenBadge> createState() => _FullScreenBadgeState();
}

class _FullScreenBadgeState extends State<FullScreenBadge> {
  double? _previousBrightness;

  @override
  void initState() {
    super.initState();
    _setMaxBrightness();
    // Cacher la barre de statut
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  Future<void> _setMaxBrightness() async {
    try {
      _previousBrightness = await ScreenBrightness().application;
      await ScreenBrightness().setApplicationScreenBrightness(1.0);
    } catch (_) {}
  }

  Future<void> _restoreBrightness() async {
    try {
      if (_previousBrightness != null) {
        await ScreenBrightness().setApplicationScreenBrightness(_previousBrightness!);
      } else {
        await ScreenBrightness().resetApplicationScreenBrightness();
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _restoreBrightness();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final qrSize = screenWidth * 0.7;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Salon name
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: widget.salonColor,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    widget.salonName,
                    style: GoogleFonts.roboto(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                // User name
                Text(
                  widget.userName,
                  style: GoogleFonts.roboto(
                    color: const Color(0xFF0D2137),
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                // Badge type
                Text(
                  widget.badgeType,
                  style: GoogleFonts.roboto(
                    color: widget.salonColor,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 32),
                // QR Code large
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: widget.salonColor.withValues(alpha: 0.3), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: widget.salonColor.withValues(alpha: 0.15),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: QrImageView(
                    data: widget.qrData,
                    version: QrVersions.auto,
                    size: qrSize,
                    eyeStyle: const QrEyeStyle(color: Colors.black),
                    dataModuleStyle: const QrDataModuleStyle(color: Colors.black),
                    backgroundColor: Colors.white,
                    errorCorrectionLevel: QrErrorCorrectLevel.H,
                  ),
                ),
                const SizedBox(height: 32),
                // Hint
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.touch_app, color: Colors.grey[400], size: 18),
                    const SizedBox(width: 6),
                    Text(
                      'Toucher pour fermer',
                      style: GoogleFonts.roboto(
                        color: Colors.grey[400],
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
