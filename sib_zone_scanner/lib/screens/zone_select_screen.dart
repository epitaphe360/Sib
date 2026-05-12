import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/control_zone.dart';
import '../services/zone_service.dart';
import 'scanner_screen.dart';

class ZoneSelectScreen extends StatefulWidget {
  const ZoneSelectScreen({super.key});

  @override
  State<ZoneSelectScreen> createState() => _ZoneSelectScreenState();
}

class _ZoneSelectScreenState extends State<ZoneSelectScreen> {
  List<ControlZone> _zones = [];
  bool _loading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadZones();
  }

  Future<void> _loadZones() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    try {
      final zones = await ZoneService.getZones();
      if (mounted) setState(() => _zones = zones);
    } catch (e) {
      if (mounted) setState(() => _errorMessage = 'Impossible de charger les zones');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _signOut() async {
    await Supabase.instance.client.auth.signOut();
    // L'AuthGate redirige automatiquement vers LoginScreen
  }

  void _openScanner(ControlZone zone) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ScannerScreen(zone: zone),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final email = Supabase.instance.client.auth.currentUser?.email ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sélectionner une zone'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadZones,
            tooltip: 'Actualiser',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _signOut,
            tooltip: 'Déconnexion',
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Bandeau agent connecté
          Container(
            color: const Color(0xFF1E3A5F),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                const Icon(Icons.person_outline, color: Color(0xFF93C5FD), size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Agent : $email',
                    style: const TextStyle(
                      color: Color(0xFF93C5FD),
                      fontSize: 13,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          // Contenu principal
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.error_outline,
                                color: Color(0xFFEF4444), size: 48),
                            const SizedBox(height: 12),
                            Text(
                              _errorMessage!,
                              style: const TextStyle(color: Colors.white70),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _loadZones,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Réessayer'),
                            ),
                          ],
                        ),
                      )
                    : _zones.isEmpty
                        ? const Center(
                            child: Text(
                              'Aucune zone disponible.\nContactez l\'administrateur.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.white54, height: 1.5),
                            ),
                          )
                        : GridView.builder(
                            padding: const EdgeInsets.all(16),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 1.1,
                            ),
                            itemCount: _zones.length,
                            itemBuilder: (context, i) =>
                                _ZoneCard(zone: _zones[i], onTap: _openScanner),
                          ),
          ),
        ],
      ),
      backgroundColor: const Color(0xFF0F172A),
    );
  }
}

class _ZoneCard extends StatelessWidget {
  final ControlZone zone;
  final void Function(ControlZone) onTap;

  const _ZoneCard({required this.zone, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onTap(zone),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF334155)),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(zone.icon, style: const TextStyle(fontSize: 36)),
            const SizedBox(height: 10),
            Text(
              zone.name,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (zone.description.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                zone.description,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
