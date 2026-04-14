import 'package:cached_network_image/cached_network_image.dart';
import 'package:com.urbaevent/services/SupabaseService.dart';
import 'package:com.urbaevent/ui/content_ui/home/HomePage.dart';
import 'package:com.urbaevent/utils/Const.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

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
      final data = await SupabaseService.instance.getSalonsAll();
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
    ActiveSalon.set(salon);
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => HomePage(Const.homeUI)),
      (route) => false,
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: ThemeColor.bgColor,
      statusBarColor: Colors.transparent,
    ));
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      body: loading
          ? Center(child: CircularProgressIndicator(color: ThemeColor.colorAccent))
          : error
              ? _buildError()
              : RefreshIndicator(
                  onRefresh: _loadSalons,
                  color: ThemeColor.colorAccent,
                  child: CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(child: _buildHero()),
                      SliverToBoxAdapter(child: _buildSociaux()),
                      SliverToBoxAdapter(child: _buildSalonsHeader()),
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 0.58,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final salon = salons[index];
                              final isActive = salon['is_active'] as bool? ?? false;
                              return _SalonCard(
                                salon: salon,
                                onTap: isActive ? () => _onSalonTap(salon) : null,
                              );
                            },
                            childCount: salons.length,
                          ),
                        ),
                      ),
                      SliverToBoxAdapter(child: _buildAccreditations()),
                      SliverToBoxAdapter(child: _buildCTA()),
                      SliverToBoxAdapter(child: _buildFooter()),
                    ],
                  ),
                ),
    );
  }

  // ─── HERO ───────────────────────────────────────────────────────────
  Widget _buildHero() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0D2137), Color(0xFF1B4F72), Color(0xFF4598D1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const SizedBox(height: 24),
            // Logo Urbacom
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Image.asset(
                'assets/urbacom_logo.jpeg',
                height: 56,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'URBACOM · Plateforme digitale officielle',
              style: GoogleFonts.roboto(
                color: Colors.white70,
                fontSize: 12,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 20),
            // Titre
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: RichText(
                textAlign: TextAlign.center,
                text: TextSpan(children: [
                  TextSpan(
                    text: 'Urba',
                    style: GoogleFonts.roboto(
                      fontSize: 44,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                  TextSpan(
                    text: 'Event',
                    style: GoogleFonts.roboto(
                      fontSize: 44,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF4598D1),
                    ),
                  ),
                ]),
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                'La plateforme digitale des 5 grands salons professionnels du Maroc',
                textAlign: TextAlign.center,
                style: GoogleFonts.roboto(
                  color: Colors.white.withOpacity(0.85),
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
            ),
            const SizedBox(height: 28),
            // Stats
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _StatItem('5', 'Salons'),
                  _StatItem('500+', 'Exposants'),
                  _StatItem('25K+', 'Visiteurs'),
                  _StatItem('40+', 'Pays'),
                ],
              ),
            ),
            const SizedBox(height: 28),
            // Vague blanche
            ClipPath(
              clipper: _WaveClipper(),
              child: Container(
                height: 40,
                color: const Color(0xFFF5F6FA),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── RÉSEAUX SOCIAUX ────────────────────────────────────────────────
  Widget _buildSociaux() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Suivez Urbacom',
            style: GoogleFonts.roboto(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0D2137),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Agence de communication & événementiel spécialisée dans l\'organisation de salons professionnels au Maroc.',
            style: GoogleFonts.roboto(
              fontSize: 13,
              color: const Color(0xFF647483),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _SocialBtn(
                icon: Icons.camera_alt_outlined,
                label: 'Instagram',
                color: const Color(0xFFE1306C),
                url: 'https://www.instagram.com/urbacom/',
                onTap: _launchUrl,
              ),
              _SocialBtn(
                icon: Icons.facebook,
                label: 'Facebook',
                color: const Color(0xFF1877F2),
                url: 'https://www.facebook.com/AgenceUrbacom',
                onTap: _launchUrl,
              ),
              _SocialBtn(
                icon: Icons.play_circle_outline,
                label: 'YouTube',
                color: const Color(0xFFFF0000),
                url: 'https://www.youtube.com/@urba-tv',
                onTap: _launchUrl,
              ),
              _SocialBtn(
                icon: Icons.work_outline,
                label: 'LinkedIn',
                color: const Color(0xFF0A66C2),
                url: 'https://www.linkedin.com/in/urbacom-agence-471661a3/',
                onTap: _launchUrl,
              ),
              _SocialBtn(
                icon: Icons.close,
                label: 'X',
                color: const Color(0xFF000000),
                url: 'https://x.com/AgenceUrbacom',
                onTap: _launchUrl,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── EN-TÊTE SALONS ─────────────────────────────────────────────────
  Widget _buildSalonsHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Choisissez votre Salon',
            style: GoogleFonts.roboto(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF0D2137),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Sélectionnez un salon pour accéder à son espace',
            style: GoogleFonts.roboto(fontSize: 13, color: const Color(0xFF647483)),
          ),
        ],
      ),
    );
  }

  // ─── NIVEAUX D'ACCRÉDITATION ─────────────────────────────────────────
  Widget _buildAccreditations() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8ECF0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Niveaux d\'accréditation',
            style: GoogleFonts.roboto(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0D2137),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _AccredItem('👤', 'Niv.1', 'Visiteur Standard')),
              const SizedBox(width: 10),
              Expanded(child: _AccredItem('⭐', 'Niv.2', 'VIP')),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _AccredItem('🏆', 'Niv.3', 'Exposant')),
              const SizedBox(width: 10),
              Expanded(child: _AccredItem('🛡️', 'Niv.4', 'Partenaire')),
            ],
          ),
        ],
      ),
    );
  }

  // ─── CTA ─────────────────────────────────────────────────────────────
  Widget _buildCTA() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF4598D1), Color(0xFF1B4F72)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Text(
            'Rejoignez l\'écosystème UrbaEvent',
            textAlign: TextAlign.center,
            style: GoogleFonts.roboto(
              color: Colors.white,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Créez votre compte gratuit et accédez à tous les salons',
            textAlign: TextAlign.center,
            style: GoogleFonts.roboto(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF4598D1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: Text(
                    'Créer un compte →',
                    style: GoogleFonts.roboto(fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white54),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: Text(
                    'Se connecter',
                    style: GoogleFonts.roboto(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── FOOTER ──────────────────────────────────────────────────────────
  Widget _buildFooter() {
    return Container(
      margin: const EdgeInsets.only(top: 20),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      color: const Color(0xFF0D2137),
      child: Column(
        children: [
          RichText(
            text: TextSpan(children: [
              TextSpan(
                text: 'Urba',
                style: GoogleFonts.roboto(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 18,
                ),
              ),
              TextSpan(
                text: 'Event',
                style: GoogleFonts.roboto(
                  color: const Color(0xFF4598D1),
                  fontWeight: FontWeight.w800,
                  fontSize: 18,
                ),
              ),
            ]),
          ),
          const SizedBox(height: 8),
          Text(
            'La plateforme digitale des salons Urbacom',
            style: GoogleFonts.roboto(color: Colors.white54, fontSize: 12),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _FooterLink('Salons'),
              _FooterDot(),
              _FooterLink('Mon compte'),
              _FooterDot(),
              _FooterLink('Contact'),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '© 2026 Urbacom · Tous droits réservés',
            style: GoogleFonts.roboto(color: Colors.white30, fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 48, color: ThemeColor.textSecondary),
          const SizedBox(height: 12),
          Text('Erreur de chargement', style: GoogleFonts.roboto(fontSize: 16, color: ThemeColor.textSecondary)),
          const SizedBox(height: 12),
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
}

// ─── WIDGETS AUXILIAIRES ────────────────────────────────────────────────────

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  const _StatItem(this.value, this.label);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: GoogleFonts.roboto(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
        const SizedBox(height: 2),
        Text(label, style: GoogleFonts.roboto(color: Colors.white70, fontSize: 11)),
      ],
    );
  }
}

class _SocialBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final String url;
  final Future<void> Function(String) onTap;
  const _SocialBtn({required this.icon, required this.label, required this.color, required this.url, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onTap(url),
      child: Column(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(height: 4),
          Text(label, style: GoogleFonts.roboto(fontSize: 10, color: const Color(0xFF647483))),
        ],
      ),
    );
  }
}

class _AccredItem extends StatelessWidget {
  final String emoji;
  final String level;
  final String title;
  const _AccredItem(this.emoji, this.level, this.title);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F6FA),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 18)),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(level, style: GoogleFonts.roboto(fontSize: 10, color: const Color(0xFF647483))),
                Text(title, style: GoogleFonts.roboto(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF0D2137))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FooterLink extends StatelessWidget {
  final String text;
  const _FooterLink(this.text);
  @override
  Widget build(BuildContext context) {
    return Text(text, style: GoogleFonts.roboto(color: Colors.white60, fontSize: 12));
  }
}

class _FooterDot extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 8),
      child: Text('·', style: TextStyle(color: Colors.white30, fontSize: 14)),
    );
  }
}

class _WaveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height * 0.5);
    path.quadraticBezierTo(size.width * 0.25, 0, size.width * 0.5, size.height * 0.5);
    path.quadraticBezierTo(size.width * 0.75, size.height, size.width, size.height * 0.5);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}

// ─── CARTE SALON ──────────────────────────────────────────────────────────
class _SalonCard extends StatelessWidget {
  final Map<String, dynamic> salon;
  final VoidCallback? onTap;

  const _SalonCard({required this.salon, this.onTap});

  Color _parseColor(String? hex, Color fallback) {
    if (hex == null || hex.isEmpty) return fallback;
    try {
      final clean = hex.replaceAll('#', '');
      if (clean.length == 6) return Color(int.parse('FF$clean', radix: 16));
    } catch (_) {}
    return fallback;
  }

  @override
  Widget build(BuildContext context) {
    final name = salon['name'] as String? ?? 'Salon';
    final code = salon['code'] as String? ?? '';
    final edition = salon['edition'] as String? ?? '';
    final location = salon['location'] as String? ?? '';
    final coverUrl = salon['cover_url'] as String?;
    final isActive = salon['is_active'] as bool? ?? false;
    final primaryHex = salon['primary_color'] as String?;
    final config = salon['config'] as Map<String, dynamic>? ?? {};
    final configHex = config['primary_color'] as String?;
    final color = _parseColor(primaryHex ?? configHex, ThemeColor.colorAccent);

    final dateDebut = salon['date_debut'] as String?;
    final dateFin = salon['date_fin'] as String?;
    String dateRange = '';
    if (dateDebut != null) {
      try {
        final d1 = DateTime.parse(dateDebut);
        final d2 = dateFin != null ? DateTime.tryParse(dateFin) : null;
        if (d2 != null) {
          dateRange = '${DateFormat('dd MMM').format(d1)} - ${DateFormat('dd MMM yy').format(d2)}';
        } else {
          dateRange = DateFormat('MMM yyyy').format(d1);
        }
      } catch (_) {}
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.07),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image / bannière couleur
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Stack(
                children: [
                  coverUrl != null && coverUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: coverUrl,
                          height: 90,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorWidget: (_, __, ___) => _colorBanner(color, code),
                        )
                      : _colorBanner(color, code),
                  if (!isActive)
                    Container(
                      height: 90,
                      width: double.infinity,
                      color: Colors.black.withOpacity(0.45),
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.9),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '🔒 Bientôt',
                            style: GoogleFonts.roboto(fontSize: 11, fontWeight: FontWeight.w700, color: const Color(0xFF333333)),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Infos
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Partie haute
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Badge code
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(code, style: GoogleFonts.roboto(fontSize: 10, fontWeight: FontWeight.w800, color: color)),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          name,
                          style: GoogleFonts.roboto(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF0D2137)),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (edition.isNotEmpty) ...[
                          const SizedBox(height: 3),
                          Text(edition, style: GoogleFonts.roboto(fontSize: 10, color: color, fontWeight: FontWeight.w500)),
                        ],
                      ],
                    ),
                    // Partie basse
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (dateRange.isNotEmpty)
                          Row(
                            children: [
                              Icon(Icons.calendar_today, size: 10, color: const Color(0xFF647483)),
                              const SizedBox(width: 3),
                              Expanded(
                                child: Text(dateRange, style: GoogleFonts.roboto(fontSize: 10, color: const Color(0xFF647483)), maxLines: 1, overflow: TextOverflow.ellipsis),
                              ),
                            ],
                          ),
                        if (location.isNotEmpty) ...[
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              Icon(Icons.location_on_outlined, size: 10, color: const Color(0xFF647483)),
                              const SizedBox(width: 3),
                              Expanded(
                                child: Text(location, style: GoogleFonts.roboto(fontSize: 10, color: const Color(0xFF647483)), maxLines: 1, overflow: TextOverflow.ellipsis),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 8),
                        // Bouton action
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: onTap,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isActive ? color : const Color(0xFFE8ECF0),
                              foregroundColor: isActive ? Colors.white : const Color(0xFF647483),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              padding: const EdgeInsets.symmetric(vertical: 7),
                              elevation: 0,
                            ),
                            child: Text(
                              isActive ? 'Accéder →' : 'Se connecter',
                              style: GoogleFonts.roboto(fontSize: 11, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _colorBanner(Color color, String code) {
    return Container(
      height: 90,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color, color.withOpacity(0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text(
          code.isNotEmpty ? code : 'S',
          style: GoogleFonts.roboto(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900),
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
  static String? get webUrl => _current?['web_url'] as String?;
}


