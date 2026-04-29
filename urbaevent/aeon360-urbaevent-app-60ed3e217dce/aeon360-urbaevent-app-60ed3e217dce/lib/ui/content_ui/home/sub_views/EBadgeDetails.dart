import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/ui/content_ui/home/sub_views/FullScreenBadge.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';

class EBadgeDetails extends StatefulWidget {
  final Map<String, dynamic> registration;
  final String userName;
  final String? userCompany;

  const EBadgeDetails({
    Key? key,
    required this.registration,
    required this.userName,
    this.userCompany,
  }) : super(key: key);

  @override
  State<EBadgeDetails> createState() => _EBadgeDetailsState();
}

class _EBadgeDetailsState extends State<EBadgeDetails> {
  bool _loadingQr = false;
  String? _qrToken;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadQrToken();
  }

  Future<void> _loadQrToken() async {
    setState(() { _loadingQr = true; _error = null; });
    try {
      final reg = widget.registration;
      final salonId = reg['salon_id'] as String? ?? '';
      final uid = SupabaseService.instance.currentUser?.id ?? '';
      // Format: userId|salonId — le | ne peut jamais apparaître dans un UUID
      setState(() { _qrToken = '$uid|$salonId'; _loadingQr = false; });
    } catch (e) {
      final uid = SupabaseService.instance.currentUser?.id ?? '';
      setState(() { _qrToken = uid; _loadingQr = false; });
      debugPrint('QR Token error: $e');
    }
  }

  String _getTypeLabel(String type) {
    switch (type.toLowerCase()) {
      case 'visitor': return 'VISITEUR';
      case 'exhibitor': return 'EXPOSANT';
      case 'vip': return 'VIP';
      case 'agent': return 'AGENT';
      default: return type.toUpperCase();
    }
  }

  @override
  Widget build(BuildContext context) {
    final reg = widget.registration;
    final salon = reg['salon'] as Map<String, dynamic>?;
    final salonName = salon?['name'] as String? ?? 'SIB 2026';
    final location = salon?['location'] as String? ?? '';
    final dateDebut = salon?['date_debut'] != null ? DateTime.tryParse(salon!['date_debut']) : null;
    final dateFin = salon?['date_fin'] != null ? DateTime.tryParse(salon!['date_fin']) : null;
    final type = reg['type'] as String? ?? 'visitor';
    final confirmed = reg['confirmed'] as bool?;
    final primaryColor = salon?['primary_color'] as String? ?? '#4598D1';

    Color salonColor;
    try {
      salonColor = Color(int.parse(primaryColor.replaceFirst('#', '0xFF')));
    } catch (_) {
      salonColor = const Color(0xFF4598D1);
    }

    return Expanded(
      flex: 1,
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
          child: Stack(
            children: [
              Positioned.fill(child: Image.asset('assets/bg_badge_details.png', fit: BoxFit.fill)),
              Column(
                children: [
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Container(
                        width: 6, height: 60,
                        decoration: BoxDecoration(color: salonColor, borderRadius: BorderRadius.circular(3)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(salonName, style: GoogleFonts.roboto(color: salonColor, fontSize: 17, fontWeight: FontWeight.w700)),
                        if (dateDebut != null && dateFin != null) ...[
                          const SizedBox(height: 4),
                          Row(children: [
                            Image.asset('assets/ic_event.png', width: 13, height: 13),
                            const SizedBox(width: 6),
                            Text('${DateFormat('dd MMM yyyy').format(dateDebut)} - ${DateFormat('dd MMM yyyy').format(dateFin)}',
                              style: GoogleFonts.roboto(color: const Color(0xFF64748B), fontSize: 13)),
                          ]),
                        ],
                        if (location.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Row(children: [
                            Image.asset('assets/map_pin.png', width: 13, height: 13),
                            const SizedBox(width: 6),
                            Text(location, style: GoogleFonts.roboto(color: const Color(0xFF64748B), fontSize: 13)),
                          ]),
                        ],
                      ])),
                    ]),
                  ),
                  Image.asset('assets/line.png', width: MediaQuery.of(context).size.width - 100, fit: BoxFit.cover),
                  const SizedBox(height: 16),
                  Text(widget.userName, style: GoogleFonts.roboto(color: Colors.black, fontSize: 20, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  Text(_getTypeLabel(type), style: GoogleFonts.roboto(color: salonColor, fontSize: 16, fontWeight: FontWeight.w700)),
                  if (widget.userCompany != null && widget.userCompany!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(widget.userCompany!, style: GoogleFonts.roboto(color: salonColor, fontSize: 13, fontWeight: FontWeight.w500)),
                  ],
                  const SizedBox(height: 24),
                  if (_loadingQr)
                    const SizedBox(height: 160, child: Center(child: CircularProgressIndicator()))
                  else if (_error != null)
                    SizedBox(height: 100, child: Center(child: Text('Erreur QR: $_error', style: const TextStyle(color: Colors.red), textAlign: TextAlign.center)))
                  else if (confirmed == false)
                    SizedBox(height: 100, child: Center(child: Text('Inscription refusée', style: GoogleFonts.roboto(color: ThemeColor.textGrey, fontSize: 16, fontWeight: FontWeight.w700))))
                  else if (confirmed == null)
                    SizedBox(height: 100, child: Center(child: Text('En attente de validation', style: GoogleFonts.roboto(color: ThemeColor.textGrey, fontSize: 16, fontWeight: FontWeight.w700))))
                  else if (_qrToken != null)
                    Container(
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 8, offset: const Offset(0, 2))]),
                      padding: const EdgeInsets.all(12),
                      child: QrImageView(
                        data: _qrToken!, version: QrVersions.auto, size: 180,
                        eyeStyle: const QrEyeStyle(color: Colors.black),
                        dataModuleStyle: const QrDataModuleStyle(color: Colors.black),
                        backgroundColor: Colors.white,
                        errorCorrectionLevel: QrErrorCorrectLevel.M),
                    ),
                  const SizedBox(height: 16),
                  if (confirmed == true && _qrToken != null)
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(
                          builder: (_) => FullScreenBadge(
                            qrData: _qrToken!,
                            userName: widget.userName,
                            badgeType: _getTypeLabel(type),
                            salonName: salonName,
                            salonColor: salonColor,
                          ),
                        ));
                      },
                      icon: const Icon(Icons.fullscreen, size: 22),
                      label: const Text('Badge plein écran'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: salonColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                      ),
                    ),
                  const SizedBox(height: 12),
                  Image.asset('assets/line.png', width: MediaQuery.of(context).size.width - 100, fit: BoxFit.cover),
                  const SizedBox(height: 20),
                  if (confirmed == true)
                    TextButton.icon(
                      onPressed: _loadingQr ? null : _loadQrToken,
                      icon: const Icon(Icons.refresh, size: 18),
                      label: const Text('Rafraichir le QR'),
                      style: TextButton.styleFrom(foregroundColor: salonColor),
                    ),
                  const SizedBox(height: 20),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
