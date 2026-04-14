import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

/// Écran d'accueil — liste de tous les salons actifs.
/// L'utilisateur sélectionne un salon puis entre dans le Dashboard (HomePage).
class SalonListPage extends StatefulWidget {
  @override
  State<SalonListPage> createState() => _SalonListPageState();
}

class _SalonListPageState extends State<SalonListPage> {
  List<Map<String, dynamic>> salons = [];
  bool loading = true;
  bool error = false;

  @override
  void initState() {
    super.initState();
    _loadSalons();
  }

  Future<void> _loadSalons() async {
    try {
      final data = await SupabaseService.instance.getSalons();
      setState(() {
        salons = data;
        loading = false;
      });
    } catch (e) {
      debugPrint('Error loading salons: $e');
      setState(() {
        loading = false;
        error = true;
      });
    }
  }

  void _onSalonTap(Map<String, dynamic> salon) {
    // Stocker le salon sélectionné globalement
    ActiveSalon.set(salon);
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => HomePage(Const.homeUI)),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: ThemeColor.bgColor,
      statusBarColor: Colors.transparent,
    ));
    return Scaffold(
      backgroundColor: ThemeColor.bgColor,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 16, bottom: 24, left: 20, right: 20),
              decoration: BoxDecoration(
                color: ThemeColor.colorAccent,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Urbacom',
                    style: GoogleFonts.roboto(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Sélectionnez un salon',
                    style: GoogleFonts.roboto(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 16,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 16),
            // List
            Expanded(
              child: loading
                  ? Center(child: CircularProgressIndicator(color: ThemeColor.colorAccent))
                  : error
                      ? _buildError()
                      : salons.isEmpty
                          ? _buildEmpty()
                          : RefreshIndicator(
                              onRefresh: _loadSalons,
                              color: ThemeColor.colorAccent,
                              child: ListView.builder(
                                padding: EdgeInsets.symmetric(horizontal: 16),
                                itemCount: salons.length,
                                itemBuilder: (context, index) {
                                  return _SalonCard(
                                    salon: salons[index],
                                    onTap: () => _onSalonTap(salons[index]),
                                  );
                                },
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 48, color: ThemeColor.textSecondary),
          SizedBox(height: 12),
          Text('Erreur de chargement', style: GoogleFonts.roboto(fontSize: 16, color: ThemeColor.textSecondary)),
          SizedBox(height: 12),
          TextButton(
            onPressed: () {
              setState(() { loading = true; error = false; });
              _loadSalons();
            },
            child: Text('Réessayer', style: GoogleFonts.roboto(color: ThemeColor.colorAccent, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Text('Aucun salon disponible', style: GoogleFonts.roboto(fontSize: 16, color: ThemeColor.textSecondary)),
    );
  }
}

class _SalonCard extends StatelessWidget {
  final Map<String, dynamic> salon;
  final VoidCallback onTap;

  const _SalonCard({required this.salon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final name = salon['name'] as String? ?? 'Salon';
    final location = salon['location'] as String? ?? '';
    final coverUrl = salon['cover_url'] as String?;
    final isActive = salon['is_active'] as bool? ?? false;
    final dateDebut = salon['date_debut'] as String?;
    final dateFin = salon['date_fin'] as String?;

    String dateRange = '';
    if (dateDebut != null && dateFin != null) {
      try {
        final d1 = DateTime.parse(dateDebut);
        final d2 = DateTime.parse(dateFin);
        dateRange = '${DateFormat('dd MMM').format(d1)} - ${DateFormat('dd MMM yyyy').format(d2)}';
      } catch (_) {}
    }

    return GestureDetector(
      onTap: isActive ? onTap : null,
      child: Container(
        margin: EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 12,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover image
            ClipRRect(
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              child: Stack(
                children: [
                  coverUrl != null && coverUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: coverUrl,
                          height: 160,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(
                            height: 160,
                            color: ThemeColor.colorAccent.withOpacity(0.1),
                            child: Center(child: CircularProgressIndicator(color: ThemeColor.colorAccent, strokeWidth: 2)),
                          ),
                          errorWidget: (_, __, ___) => _placeholderImage(name),
                        )
                      : _placeholderImage(name),
                  if (!isActive)
                    Container(
                      height: 160,
                      width: double.infinity,
                      color: Colors.black.withOpacity(0.5),
                      child: Center(
                        child: Text(
                          'Bientôt',
                          style: GoogleFonts.roboto(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Info
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: GoogleFonts.roboto(
                      color: ThemeColor.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (dateRange.isNotEmpty) ...[
                    SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(Icons.calendar_today, size: 14, color: ThemeColor.colorAccent),
                        SizedBox(width: 6),
                        Text(
                          dateRange,
                          style: GoogleFonts.roboto(color: ThemeColor.textSecondary, fontSize: 14),
                        ),
                      ],
                    ),
                  ],
                  if (location.isNotEmpty) ...[
                    SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.location_on_outlined, size: 14, color: ThemeColor.colorAccent),
                        SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            location,
                            style: GoogleFonts.roboto(color: ThemeColor.textSecondary, fontSize: 14),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeholderImage(String name) {
    return Container(
      height: 160,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [ThemeColor.colorAccent, ThemeColor.colorAccent.withOpacity(0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : 'S',
          style: GoogleFonts.roboto(color: Colors.white, fontSize: 60, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}

/// Singleton pour stocker le salon actuellement sélectionné.
class ActiveSalon {
  static Map<String, dynamic>? _current;

  static void set(Map<String, dynamic> salon) {
    _current = salon;
  }

  static Map<String, dynamic>? get current => _current;

  static String? get id => _current?['id'] as String?;
  static String get name => _current?['name'] as String? ?? 'Salon';
  static String? get coverUrl => _current?['cover_url'] as String?;
  static String? get logoUrl => _current?['logo_url'] as String?;
  static String? get location => _current?['location'] as String?;
  static String? get slug => _current?['slug'] as String?;
  static String? get description => _current?['description'] as String?;
  static DateTime? get dateDebut {
    final d = _current?['date_debut'] as String?;
    return d != null ? DateTime.tryParse(d) : null;
  }
  static DateTime? get dateFin {
    final d = _current?['date_fin'] as String?;
    return d != null ? DateTime.tryParse(d) : null;
  }
}
