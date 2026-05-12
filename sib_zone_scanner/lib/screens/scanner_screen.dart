import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../models/control_zone.dart';
import '../services/scanner_service.dart';
import 'result_screen.dart';

class ScannerScreen extends StatefulWidget {
  final ControlZone zone;
  const ScannerScreen({super.key, required this.zone});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
    returnImage: false,
  );

  bool _processing = false;
  int _totalScans = 0;
  int _granted = 0;
  int _denied = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_processing) return;
    final rawValue = capture.barcodes.firstOrNull?.rawValue;
    if (rawValue == null || rawValue.isEmpty) return;

    setState(() => _processing = true);
    HapticFeedback.mediumImpact();

    try {
      final result = await ScannerService.checkZoneAccess(
        rawQr: rawValue,
        zoneId: widget.zone.id,
        zoneName: widget.zone.name,
      );

      setState(() {
        _totalScans++;
        if (result.authorized) {
          _granted++;
        } else {
          _denied++;
        }
      });

      if (!mounted) return;
      await _controller.stop();
      await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ResultScreen(result: result),
        ),
      );
      if (mounted) await _controller.start();
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Text(widget.zone.icon, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 8),
            Text(widget.zone.name),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => _controller.toggleTorch(),
            tooltip: 'Lampe torche',
          ),
        ],
      ),
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Caméra scanner
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),
          // Overlay avec coins de visée
          const _ScanOverlay(),
          // Indicateur traitement en cours
          if (_processing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Colors.white),
                    SizedBox(height: 16),
                    Text(
                      'Vérification en cours…',
                      style: TextStyle(color: Colors.white, fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),
          // Barre de statistiques en bas
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _StatsBar(
              total: _totalScans,
              granted: _granted,
              denied: _denied,
            ),
          ),
        ],
      ),
    );
  }
}

/// Overlay avec coins de cadrage (style scanner professionnel)
class _ScanOverlay extends StatelessWidget {
  const _ScanOverlay();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 260,
        height: 260,
        child: Stack(
          children: [
            // Haut-gauche
            Positioned(
              top: 0, left: 0,
              child: _Corner(
                borders: const {BoxSide.top, BoxSide.left},
              ),
            ),
            // Haut-droit
            Positioned(
              top: 0, right: 0,
              child: _Corner(
                borders: const {BoxSide.top, BoxSide.right},
              ),
            ),
            // Bas-gauche
            Positioned(
              bottom: 0, left: 0,
              child: _Corner(
                borders: const {BoxSide.bottom, BoxSide.left},
              ),
            ),
            // Bas-droit
            Positioned(
              bottom: 0, right: 0,
              child: _Corner(
                borders: const {BoxSide.bottom, BoxSide.right},
              ),
            ),
          ],
        ),
      ),
    );
  }
}

enum BoxSide { top, bottom, left, right }

class _Corner extends StatelessWidget {
  final Set<BoxSide> borders;
  const _Corner({required this.borders});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        border: Border(
          top: borders.contains(BoxSide.top)
              ? const BorderSide(color: Color(0xFF60A5FA), width: 3)
              : BorderSide.none,
          bottom: borders.contains(BoxSide.bottom)
              ? const BorderSide(color: Color(0xFF60A5FA), width: 3)
              : BorderSide.none,
          left: borders.contains(BoxSide.left)
              ? const BorderSide(color: Color(0xFF60A5FA), width: 3)
              : BorderSide.none,
          right: borders.contains(BoxSide.right)
              ? const BorderSide(color: Color(0xFF60A5FA), width: 3)
              : BorderSide.none,
        ),
      ),
    );
  }
}

/// Barre de statistiques en bas de l'écran
class _StatsBar extends StatelessWidget {
  final int total;
  final int granted;
  final int denied;

  const _StatsBar({
    required this.total,
    required this.granted,
    required this.denied,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xE6000000),
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatItem(label: 'Total', value: total, color: Colors.white),
          _StatItem(label: 'Accordés', value: granted, color: const Color(0xFF4ADE80)),
          _StatItem(label: 'Refusés', value: denied, color: const Color(0xFFF87171)),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final int value;
  final Color color;

  const _StatItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          '$value',
          style: TextStyle(
            color: color,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white54, fontSize: 11),
        ),
      ],
    );
  }
}
