import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdfx/pdfx.dart';
import 'package:http/http.dart' as http;
import '../SalonListPage.dart';

/// Affiche le plan général du salon en PDF zoomable et pannable.
class FloorPlanViewer extends StatefulWidget {
  final String salonName;
  final Color salonColor;

  const FloorPlanViewer({
    Key? key,
    required this.salonName,
    required this.salonColor,
  }) : super(key: key);

  @override
  State<FloorPlanViewer> createState() => _FloorPlanViewerState();
}

class _FloorPlanViewerState extends State<FloorPlanViewer> {
  PdfControllerPinch? _pdfController;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPdf();
  }

  Future<void> _loadPdf() async {
    try {
      final remoteUrl = ActiveSalon.floorPlanUrl;
      late PdfDocument doc;

      if (remoteUrl != null && remoteUrl.isNotEmpty) {
        // Télécharger depuis l'URL Supabase Storage (ou tout lien public)
        final response = await http.get(Uri.parse(remoteUrl));
        if (response.statusCode != 200) {
          throw Exception('HTTP ${response.statusCode} lors du téléchargement du plan');
        }
        final dir = await getTemporaryDirectory();
        final file = File('${dir.path}/plan_salon_remote.pdf');
        await file.writeAsBytes(response.bodyBytes);
        doc = await PdfDocument.openFile(file.path);
      } else {
        // Fallback : asset local embarqué dans l'APK
        final data = await rootBundle.load('assets/plan_sib_2026.pdf');
        final dir = await getTemporaryDirectory();
        final file = File('${dir.path}/plan_sib_2026.pdf');
        await file.writeAsBytes(data.buffer.asUint8List());
        doc = await PdfDocument.openFile(file.path);
      }

      setState(() {
        _pdfController = PdfControllerPinch(document: Future.value(doc));
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _pdfController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: AppBar(
        backgroundColor: widget.salonColor,
        foregroundColor: Colors.white,
        title: Text(
          'Plan - ${widget.salonName}',
          style: GoogleFonts.roboto(fontWeight: FontWeight.w700, fontSize: 17),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.red),
                        const SizedBox(height: 12),
                        Text('Impossible de charger le plan',
                            style: GoogleFonts.roboto(fontSize: 16, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Text(_error!, style: GoogleFonts.roboto(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ),
                )
              : Stack(
                  children: [
                    PdfViewPinch(
                      controller: _pdfController!,
                      padding: 8,
                      scrollDirection: Axis.vertical,
                    ),
                    // Hint bottom
                    Positioned(
                      bottom: 16,
                      left: 0,
                      right: 0,
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.pinch, color: Colors.white, size: 16),
                              const SizedBox(width: 6),
                              Text('Pincer pour zoomer',
                                  style: GoogleFonts.roboto(color: Colors.white, fontSize: 12)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}
